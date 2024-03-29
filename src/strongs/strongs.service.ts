import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NodePropertyKey } from '../entities/NodePropertyKeys';
import { NodePropertyValue } from '../entities/NodePropertyValues';
import { Node } from '../entities/Nodes';
import { NodeType, NodeTypeName } from '../entities/NodeTypes';
import { strongsHebrewDictionary } from './strongsDict';
import { GraphNode, GraphService } from '../graph/graph.service';
import { Relationship } from '../entities/Relationships';

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
  private _strongsNodes?: Map<string, GraphNode>;

  constructor(
    @InjectRepository(Node)
    private readonly nodeRepo: Repository<Node>,
    @InjectRepository(NodeType)
    private readonly nodeTypesRepo: Repository<NodeType>,
    @InjectRepository(NodePropertyKey)
    private readonly nodePropertyKeysRepo: Repository<NodePropertyKey>,
    @InjectRepository(NodePropertyValue)
    private readonly nodePropertyValuesRepo: Repository<NodePropertyValue>,
    @InjectRepository(Relationship)
    private readonly relationshipRepo: Repository<Relationship>,
    @InjectEntityManager()
    private readonly em: EntityManager,
    private readonly httpService: HttpService,
    private readonly graphService: GraphService,
  ) {}

  async areStrongsLoaded(): Promise<boolean> {
    const strongsEnty = await this.nodeRepo.findOne({
      where: {
        typeName: NodeTypeName.STRONGS_ENTRY,
      },
      relations: ['propertyKeys', 'propertyKeys.values'],
    });

    return !!strongsEnty;
  }

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
    const nodes = await this.nodeRepo.find({
      where: { typeName: nodeType.name },
    });

    await this.graphService.destroyNodes(nodes.map((n) => n.id));

    const createdNodes = [] as Node[];
    const createdKeys = [] as NodePropertyKey[];
    const createdValues = [] as NodePropertyValue[];

    // iterate over strongs dictionary
    for (const [strongsKey, strongsEntry] of Object.entries(
      strongsHebrewDictionary,
    )) {
      // node for strongs entry
      const node = new Node();
      node.typeName = nodeType.name;
      node.propertyKeys = Object.entries(strongsEntry).map(([key, value]) => {
        const nodePropertyKey = new NodePropertyKey();
        nodePropertyKey.key = key;
        nodePropertyKey.node = node;

        const nodePropertyValue = new NodePropertyValue();
        nodePropertyValue.nodePropertyKey = nodePropertyKey;
        nodePropertyValue.value = { value };

        nodePropertyKey.values = [nodePropertyValue];

        return nodePropertyKey;
      });

      const strongsPropertyKey = new NodePropertyKey();
      strongsPropertyKey.key = STRONGS_KEY_NAME;
      strongsPropertyKey.node = node;

      const strongsPropertyValue = new NodePropertyValue();
      strongsPropertyValue.nodePropertyKey = strongsPropertyKey;
      strongsPropertyValue.value = { value: strongsKey };
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

    await this.em.query('REFRESH MATERIALIZED VIEW strongs_dictionary');
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

  async syncStrongsNodesFromDB() {
    const nodes = await this.nodeRepo.find({
      where: {
        typeName: NodeTypeName.STRONGS_ENTRY,
      },
      relations: ['propertyKeys', 'propertyKeys.values'],
    });

    this._strongsNodes = new Map();

    for (const node of nodes) {
      const propKey = node.propertyKeys.find((k) => k.key === STRONGS_KEY_NAME);

      if (!propKey) continue;

      const strongsKey = propKey.values[0].value?.['value'];

      const graphNode: GraphNode = {
        initialized: true,
        node,
        nodeType: node.typeName,
        keys: node.propertyKeys,
        values: node.propertyKeys.map((k) => k.values).flat(),
      };

      if (strongsKey) {
        this._strongsNodes.set(strongsKey, graphNode);
      }
    }
  }

  async getStrongsNodeFromCache(strongsKey: string) {
    if (!this._strongsNodes) {
      await this.syncStrongsNodesFromDB();
    }

    return this._strongsNodes?.get(strongsKey);
  }

  getStrongsNode(strongsKey: string) {
    return this._strongsNodes?.get(strongsKey);
  }

  getStrongValueFromWord(word: { [key: string]: string }): string {
    return word[STRONGS_KEY_NAME];
  }
}
