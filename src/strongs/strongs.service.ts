import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NodePropertyKey } from '../entities/NodePropertyKeys';
import { NodePropertyValue } from '../entities/NodePropertyValues';
import { Node } from '../entities/Nodes';
import { NodeType, NodeTypeName } from '../entities/NodeTypes';
import { parseUSFMMarkers } from '../scripture/usfmParser';
import { strongsHebrewDictionary } from './strongsDict';
import { RWMutex, runWithMutexW, runWithMutexR } from 'rw-mutex-ts';

export const STRONGS_KEY_NAME = 'strongs_id';

export type StrongsDef = {
  lemma: string;
  xlit: string;
  pron: string;
  derivation?: string;
  strongs_def: string;
  kjv_def?: string;
};

@Injectable()
export class StrongsService {
  private _strongsDictionary?: Map<string, StrongsDef>;
  private _strongsNodes?: Map<string, Node>;

  constructor(
    @InjectRepository(Node)
    private readonly nodeRepo: Repository<Node>,
    @InjectRepository(NodeType)
    private readonly nodeTypesRepo: Repository<NodeType>,
    @InjectRepository(NodePropertyKey)
    private readonly nodePropertyKeysRepo: Repository<NodePropertyKey>,
    @InjectRepository(NodePropertyValue)
    private readonly nodePropertyValuesRepo: Repository<NodePropertyValue>,
    private readonly httpService: HttpService,
  ) {}

  async loadStrongsIntoDB() {
    // create node type for strongs entry
    let nodeType = await this.nodeTypesRepo.findOne({
      where: { name: NodeTypeName.STRONGS_ENTRY },
    });
    if (!nodeType) {
      nodeType = new NodeType();
      nodeType.name = NodeTypeName.STRONGS_ENTRY;
      await this.nodeTypesRepo.save(nodeType);
    }

    // clear all existing string entries
    const nodes = await this.nodeRepo.find({ where: { type: nodeType } });

    const keys = await this.nodePropertyKeysRepo.find({
      where: { node: { type: nodeType } },
    });

    const values = await this.nodePropertyValuesRepo.find({
      where: {
        nodePropertyKey: {
          id: In(keys.map((k) => k.id)),
        },
      },
      relations: ['nodePropertyKey'],
    });

    await this.nodePropertyValuesRepo.delete({
      id: In(values.map((v) => v.id)),
    });

    await this.nodePropertyKeysRepo.delete({
      id: In(keys.map((k) => k.id)),
    });

    await this.nodeRepo.delete({
      id: In(nodes.map((n) => n.id)),
    });

    const createdNodes = [] as Node[];
    const createdKeys = [] as NodePropertyKey[];
    const createdValues = [] as NodePropertyValue[];

    // iterate over strongs dictionary
    for (const [strongsKey, strongsEntry] of Object.entries(
      strongsHebrewDictionary,
    )) {
      // node for strongs entry
      const node = new Node();
      node.type = nodeType;
      node.propertyKeys = Object.entries(strongsEntry).map(([key, value]) => {
        const nodePropertyKey = new NodePropertyKey();
        nodePropertyKey.key = key;
        nodePropertyKey.node = node;

        const nodePropertyValue = new NodePropertyValue();
        nodePropertyValue.nodePropertyKey = nodePropertyKey;
        nodePropertyValue.value = [value];

        nodePropertyKey.values = [nodePropertyValue];

        return nodePropertyKey;
      });

      const strongsPropertyKey = new NodePropertyKey();
      strongsPropertyKey.key = STRONGS_KEY_NAME;
      strongsPropertyKey.node = node;

      const strongsPropertyValue = new NodePropertyValue();
      strongsPropertyValue.nodePropertyKey = strongsPropertyKey;
      strongsPropertyValue.value = [strongsKey];
      strongsPropertyKey.values = [strongsPropertyValue];

      node.propertyKeys.push(strongsPropertyKey);

      createdNodes.push(node);
      createdKeys.push(...node.propertyKeys);
      createdValues.push(...node.propertyKeys.map((p) => p.values).flat());
    }

    await this.nodeRepo.save(createdNodes, {
      chunk: 1000,
    });
    await this.nodePropertyKeysRepo.save(createdKeys, {
      chunk: 1000,
    });
    await this.nodePropertyValuesRepo.save(createdValues, {
      chunk: 1000,
    });
  }

  get strongsDictionary() {
    // Index dictionary for faster lookup
    if (!this._strongsDictionary) {
      this._strongsDictionary = new Map();

      for (const [key, value] of Object.entries(strongsHebrewDictionary)) {
        this._strongsDictionary.set(key, value);
      }
    }

    return this._strongsDictionary;
  }

  async fetchStrongsNodes() {
    const nodes = await this.nodeRepo.find({
      where: {
        type: {
          name: NodeTypeName.STRONGS_ENTRY,
        },
      },
      relations: [
        'nodeTypes',
        'nodeTypes.name',
        'propertyKeys',
        'propertyKeys.values',
      ],
    });

    this._strongsNodes = new Map();

    for (const node of nodes) {
      const strongsKey = node.propertyKeys.find(
        (k) => k.key === STRONGS_KEY_NAME,
      )?.values[0].value['value'];

      if (strongsKey) {
        this._strongsNodes.set(strongsKey, node);
      }
    }
  }

  async getStrongsNodeFromCache(strongsKey: string) {
    if (!this._strongsNodes) {
      await this.fetchStrongsNodes();
    }

    return this._strongsNodes.get(strongsKey);
  }

  getStrongsNode(strongsKey: string) {
    return this._strongsNodes.get(strongsKey);
  }

  getStrongValueFromWord(word: Object): string {
    return word[STRONGS_KEY_NAME];
  }
}
