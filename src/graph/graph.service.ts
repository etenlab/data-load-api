import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NodePropertyKey } from '../entities/NodePropertyKeys';
import { NodePropertyValue } from '../entities/NodePropertyValues';
import { Node } from '../entities/Nodes';
import { NodeType, NodeTypeName } from '../entities/NodeTypes';
import { RelationshipPropertyKey } from '../entities/RelationshipPropertyKeys';
import { RelationshipPropertyValue } from '../entities/RelationshipPropertyValues';
import { Relationship } from '../entities/Relationships';
import {
  RelationshipType,
  RelationshipTypes,
} from '../entities/RelationshipTypes';

export type GraphNodeInput = {
  type: NodeTypeName;

  properties?: {
    [key: string]: string;
  };
};

export type GraphNode = {
  nodeType: NodeTypeName;
  initialized: boolean;
  node: Node;
  keys: NodePropertyKey[];
  values: NodePropertyValue[];
};

export type GraphRelationInput = {
  type: RelationshipTypes;

  fromNode: Node;
  toNode: Node;

  props?: {
    [key: string]: string;
  };
};

export type GraphRelation = {
  relationshipType: RelationshipTypes;
  initialized: boolean;
  relationship: Relationship;
  keys: RelationshipPropertyKey[];
  values: RelationshipPropertyValue[];
};

@Injectable()
export class GraphService {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepo: Repository<Node>,
    @InjectRepository(NodeType)
    private readonly nodeTypeRepo: Repository<NodeType>,
    @InjectRepository(NodePropertyKey)
    private readonly nodePropertyKeysRepo: Repository<NodePropertyKey>,
    @InjectRepository(NodePropertyValue)
    private readonly nodePropertyValuesRepo: Repository<NodePropertyValue>,

    @InjectRepository(Relationship)
    private readonly relationshipRepo: Repository<Relationship>,
    @InjectRepository(RelationshipType)
    private readonly relationshipTypeRepo: Repository<RelationshipType>,
    @InjectRepository(RelationshipPropertyKey)
    private readonly relationshipPropertyKeyRepo: Repository<RelationshipPropertyKey>,
    @InjectRepository(NodePropertyValue)
    private readonly relationshipPropertyValuesRepo: Repository<NodePropertyValue>,
  ) {}

  makeNode(params: GraphNodeInput): GraphNode {
    // console.log(`makeNode: ${params.type}`);
    // console.log(`makeNode: ${JSON.stringify(params.properties)}`);

    const node = new Node();

    const keys = [] as NodePropertyKey[];
    const values = [] as NodePropertyValue[];

    for (const [key, value] of Object.entries(params.properties ?? {})) {
      const nodePropertyKey = new NodePropertyKey();
      nodePropertyKey.key = key;
      nodePropertyKey.node = node;

      const nodePropertyValue = new NodePropertyValue();
      nodePropertyValue.value = { value };
      nodePropertyValue.nodePropertyKey = nodePropertyKey;

      keys.push(nodePropertyKey);
      values.push(nodePropertyValue);
    }

    const graphNode = {
      nodeType: params.type,
      initialized: false,
      node,
      keys,
      values,
    } as GraphNode;

    return graphNode;
  }

  async saveNodes(nodes: GraphNode[]) {
    const uniqueTypesByName = new Map<string, NodeType>();

    const allTypes = await this.nodeTypeRepo.find();

    for (const t of allTypes) {
      uniqueTypesByName.set(t.name, t);
    }

    for (const node of nodes) {
      if (!uniqueTypesByName.has(node.nodeType)) {
        throw new Error(`Node type does not exist: ${node.nodeType}`);
      }

      node.node.type = uniqueTypesByName.get(node.nodeType)!;
    }

    const keys = [] as NodePropertyKey[];
    const values = [] as NodePropertyValue[];

    for (const { keys: nodeKeys, values: nodeValues } of nodes) {
      keys.push(...nodeKeys);
      values.push(...nodeValues);
    }

    await this.nodeRepo.save(nodes.map((n) => n.node));
    await this.nodePropertyKeysRepo.save(keys);
    await this.nodePropertyValuesRepo.save(values);

    for (const node of nodes) {
      node.initialized = true;
    }
  }

  makeRelation(params: GraphRelationInput): GraphRelation {
    console.log(
      `makeRelation: ${params.type} | ${params.fromNode.type} -> ${params.toNode.type}`,
    );
    console.log(`makeRelation: ${JSON.stringify(params.props)}`);

    const relationship = new Relationship();

    const keys = [] as RelationshipPropertyKey[];
    const values = [] as RelationshipPropertyValue[];

    for (const [key, value] of Object.entries(params.props ?? {})) {
      const relationshipPropertyKey = new RelationshipPropertyKey();
      relationshipPropertyKey.key = key;
      relationshipPropertyKey.relationship = relationship;

      const relationshipPropertyValue = new RelationshipPropertyValue();
      relationshipPropertyValue.value = { value };
      relationshipPropertyValue.relationshipPropertyKey =
        relationshipPropertyKey;

      keys.push(relationshipPropertyKey);
      values.push(relationshipPropertyValue);
    }

    const graphRelation = {
      relationshipType: params.type,
      initialized: false,
      relationship,
      keys,
      values,
    } as GraphRelation;

    return graphRelation;
  }

  async saveRelations(relations: GraphRelation[]) {
    const uniqueTypesByName = new Map<string, RelationshipType>();

    const allTypes = await this.relationshipTypeRepo.find();

    for (const t of allTypes) {
      uniqueTypesByName.set(t.name, t);
    }

    for (const r of relations) {
      if (!uniqueTypesByName.has(r.relationshipType)) {
        throw new Error(
          `Relationship type does not exist: ${r.relationshipType}`,
        );
      }

      r.relationship.type = uniqueTypesByName.get(r.relationshipType)!;
    }

    const keys = [] as RelationshipPropertyKey[];
    const values = [] as RelationshipPropertyValue[];

    for (const {
      keys: relationshipKeys,
      values: relationshipValues,
    } of relations) {
      keys.push(...relationshipKeys);
      values.push(...relationshipValues);
    }

    await this.relationshipRepo.save(relations.map((r) => r.relationship));
    await this.relationshipPropertyKeyRepo.save(keys);
    await this.relationshipPropertyValuesRepo.save(values);

    for (const relation of relations) {
      relation.initialized = true;
    }
  }
}
