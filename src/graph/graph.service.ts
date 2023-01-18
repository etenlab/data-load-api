import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  fromNode: GraphNode;
  // fromNode: Node;
  toNode: GraphNode;
  // toNode: Node;

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

export type NodeSimplified = {
  id: string;
  type: NodeTypeName;
  props: {
    [key: string]: string;
  };

  incoming?: {
    node: NodeSimplified;
    props: {
      [key: string]: string;
    };
  }[];

  outgoing?: {
    node: NodeSimplified;
    props: {
      [key: string]: string;
    };
  }[];
};

/**
 * GraphService is responsible for building graph nodes and relationships and saving them into DB.
 * Notes:
 * - the directions of relationships is DOWNSTREAM (from common to specific), e.g. SENTENCE-TO-WORD, BOOK-TO-CHAPTER
 */
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
    @InjectRepository(RelationshipPropertyValue)
    private readonly relationshipPropertyValuesRepo: Repository<RelationshipPropertyValue>,
  ) {}

  getNode(type: NodeTypeName, id: string): Promise<Node | null> {
    return this.nodeRepo.findOne({
      where: {
        id,
        type: {
          name: type,
        },
      },
    });
  }

  makeNode(params: GraphNodeInput): GraphNode {
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

    await this.nodeRepo.save(
      nodes.map((n) => n.node),
      { chunk: 1000 },
    );
    await this.nodePropertyKeysRepo.save(keys, { chunk: 1000 });
    await this.nodePropertyValuesRepo.save(values, { chunk: 1000 });

    for (const node of nodes) {
      node.initialized = true;
    }
  }

  makeRelation(params: GraphRelationInput): GraphRelation {
    const relationship = new Relationship();
    relationship.fromNode = params.fromNode.node;
    relationship.toNode = params.toNode.node;

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

      const relType = uniqueTypesByName.get(r.relationshipType);

      if (!relType) {
        throw new Error(
          'Relationship type does not exist' + r.relationshipType,
        );
      }

      r.relationship.type = relType;
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

    await this.relationshipRepo.save(
      relations.map((r) => r.relationship),
      { chunk: 1000 },
    );
    await this.relationshipPropertyKeyRepo.save(keys, { chunk: 1000 });
    await this.relationshipPropertyValuesRepo.save(values, { chunk: 1000 });

    for (const relation of relations) {
      relation.initialized = true;
    }
  }

  async fetchRelationshipsByBatches(fromNodeIds: string[], batchSize: number) {
    if (batchSize < 1) throw new Error('Batch size should be >=1');

    const rels = [] as Relationship[];
    const uniqueRelIds = new Set<string>();

    for (let i = 0; i < fromNodeIds.length; i += batchSize) {
      const batch = fromNodeIds.slice(i, i + batchSize);

      const batchRels = await this.relationshipRepo.find({
        where: {
          fromNode: {
            id: In(batch),
          },
        },
        relations: [
          'type',
          'fromNode',
          'toNode',
          'relationshipPropertyKeys',
          'relationshipPropertyKeys.values',
        ],
      });

      for (const rel of batchRels) {
        if (uniqueRelIds.has(rel.id)) {
          continue;
        }

        uniqueRelIds.add(rel.id);
        rels.push(rel);
      }
    }

    return rels;
  }

  async fetchNodesByBatches(nodeIds: string[], batchSize: number) {
    if (batchSize < 1) throw new Error('Batch size should be >=1');

    const nodes = [] as Node[];
    const uniqueNodeIds = new Set<string>();

    for (let i = 0; i < nodeIds.length; i += batchSize) {
      const batch = nodeIds.slice(i, i + batchSize);

      const batchNodes = await this.nodeRepo.find({
        where: {
          id: In(batch),
        },
        relations: ['type', 'propertyKeys', 'propertyKeys.values'],
      });

      for (const node of batchNodes) {
        if (uniqueNodeIds.has(node.id)) {
          continue;
        }

        uniqueNodeIds.add(node.id);
        nodes.push(node);
      }
    }

    return nodes;
  }

  // Resolve graph for all available depth via relationships
  async resolveGraphFromNodeDownstream(
    nodeId: typeof Node.prototype.id,
    maxDepth: number,
  ): Promise<Node> {
    const node = await this.nodeRepo.findOne({
      where: { id: nodeId },
      relations: ['type', 'propertyKeys', 'propertyKeys.values'],
    });

    if (!node) {
      throw new Error(`Node does not exist: ${nodeId}`);
    }

    const allNodes: Map<string, Node> = new Map();
    const allRelationships: Map<string, Relationship> = new Map();

    let nodesFrom = [node];

    allNodes.set(node.id, node);

    let depth = 0;

    while (depth <= maxDepth) {
      if (!nodesFrom.length) {
        break;
      }

      const uniqueNodes = [...new Set(nodesFrom.map((n) => n.id))];

      const relationships = await this.fetchRelationshipsByBatches(
        uniqueNodes,
        100,
      );

      matchNodesWithOutgoingRelationships(nodesFrom, relationships);

      const nextNodeIds = [...new Set(relationships.map((r) => r.toNode.id))];
      const nodesTo = await this.fetchNodesByBatches(nextNodeIds, 100);

      matchNodesWithIncomingRelationships(nodesTo, relationships);

      // Prevent recursion
      nodesFrom = nodesTo.filter((n) => !allNodes.has(n.id));

      nodesFrom.forEach((n) => allNodes.set(n.id, n));
      relationships.forEach((r) => allRelationships.set(r.id, r));

      depth++;
    }

    return node;
  }

  simplifyNodeGraph(
    node: Node,
    incoming = true,
    outgoing = true,
    noRepeatIds: Set<string> = new Set(),
  ): NodeSimplified {
    noRepeatIds.add(node.id);

    const selfNode: NodeSimplified = {
      id: node.id,
      type: node.type.name,
      props: buildNodeProps(node),
      incoming: incoming ? [] : undefined,
      outgoing: outgoing ? [] : undefined,
    };

    for (const outgRelationship of (outgoing && node.outgoingRelationships) ||
      []) {
      if (noRepeatIds.has(outgRelationship.toNode.id)) continue;

      const relationshipProps = buildRelationshipProps(outgRelationship);

      const rel = {
        node: this.simplifyNodeGraph(
          outgRelationship.toNode,
          incoming,
          outgoing,
          noRepeatIds,
        ),
        props: relationshipProps,
      };

      selfNode.outgoing!.push(rel);

      if (!incoming) continue;

      rel.node.incoming!.push({
        node: selfNode,
        props: relationshipProps,
      });
    }

    for (const incRelationship of (incoming && node.incomingRelationships) ||
      []) {
      if (noRepeatIds.has(incRelationship.toNode.id)) continue;

      const relationshipProps = buildRelationshipProps(incRelationship);

      const rel = {
        node: this.simplifyNodeGraph(
          incRelationship.fromNode,
          incoming,
          outgoing,
          noRepeatIds,
        ),
        props: relationshipProps,
      };

      selfNode.incoming!.push(rel);

      if (!outgoing) continue;

      rel.node.outgoing!.push({
        node: selfNode,
        props: relationshipProps,
      });
    }

    return selfNode;
  }

  async resolveNode(id: string) {
    const node = await this.nodeRepo.findOne({
      where: {
        id,
      },
    });

    if (!node) {
      return undefined;
    }

    const resolved = await this.resolveGraphFromNodeDownstream(node.id, 10000);

    const downstream = this.simplifyNodeGraph(resolved, false, true);
    const upstream = this.simplifyNodeGraph(resolved, true, false);
    const graph = this.simplifyNodeGraph(resolved, true, true);

    return graph;
  }

  async destroyNodes(ids: string[]) {
    const nodes = await this.nodeRepo.find({
      where: {
        id: In(ids),
      },
    });

    const keys = await this.nodePropertyKeysRepo.find({
      where: {
        node: {
          id: In(ids),
        },
      },
      relations: ['node'],
    });

    const values = await this.nodePropertyValuesRepo.find({
      where: {
        nodePropertyKey: {
          id: In(keys.map((k) => k.id)),
        },
      },
      relations: ['nodePropertyKey'],
    });

    const relationships = await this.relationshipRepo.find({
      where: [
        {
          fromNode: {
            id: In(ids),
          },
        },
        {
          toNode: {
            id: In(ids),
          },
        },
      ],
      relations: ['fromNode', 'toNode'],
    });

    const relationshipKeys = await this.relationshipPropertyKeyRepo.find({
      where: {
        relationship: {
          id: In(relationships.map((r) => r.id)),
        },
      },
      relations: ['relationship'],
    });

    const relationshipValues = await this.relationshipPropertyValuesRepo.find({
      where: {
        relationshipPropertyKey: {
          id: In(relationshipKeys.map((k) => k.id)),
        },
      },
      relations: ['relationshipPropertyKey'],
    });

    await this.relationshipPropertyValuesRepo.delete({
      id: In(relationshipValues.map((v) => v.id)),
    });

    await this.relationshipPropertyKeyRepo.delete({
      id: In(relationshipKeys.map((k) => k.id)),
    });

    await this.relationshipRepo.delete({
      id: In(relationships.map((r) => r.id)),
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
  }
}

function buildRelationshipProps(rel: Relationship) {
  return rel.relationshipPropertyKeys?.reduce((acc, key) => {
    const value = key.values.map((v) => v.value)[0]?.value;

    if (!key.key) return acc;
    if (!value) return acc;

    acc[key.key] = value;

    return acc;
  }, {} as Record<string, any>);
}

function buildNodeProps(node: Node) {
  const props = {} as { [key: string]: any };

  for (const propertyKey of node.propertyKeys || []) {
    const value = propertyKey.values.map((v) => v.value)[0]?.value;

    if (!propertyKey.key) continue;
    if (!value) continue;

    props[propertyKey.key] = value;
  }

  return props;
}

function matchNodesWithOutgoingRelationships(
  nodes: Node[],
  relationships: Relationship[],
) {
  // nodeId -> relationships
  const nodesToRelations = new Map<string, Relationship[]>();

  for (const relationship of relationships) {
    const fromNodeId = relationship.fromNode.id;

    if (!nodesToRelations.has(fromNodeId)) {
      nodesToRelations.set(fromNodeId, []);
    }

    nodesToRelations.get(fromNodeId)!.push(relationship);
  }

  for (const node of nodes) {
    const relationships = nodesToRelations.get(node.id) || [];

    for (const relationship of relationships) {
      relationship.fromNode = node;

      if (!node.outgoingRelationships) {
        node.outgoingRelationships = [];
      }

      node.outgoingRelationships.push(relationship);
    }
  }

  // // relationId -> nodes
  // const relationsFromNodes = new Map<string, Node[]>();

  // for (const outgRel of relationships || []) {
  //   if (!relationsFromNodes.has(outgRel.id)) {
  //     relationsFromNodes.set(outgRel.id, []);
  //   }

  //   relationsFromNodes.get(outgRel.id)?.push(outgRel.fromNode);
  // }

  // for (const relationship of relationships) {
  //   const relFromNodes = relationsFromNodes.get(relationship.id);

  //   for (const node of relFromNodes || []) {
  //     if (node.id !== relationship.fromNode.id) {
  //       continue;
  //     }

  //     if (!node.outgoingRelationships) {
  //       node.outgoingRelationships = [];
  //     }

  //     node.outgoingRelationships.push(relationship);

  //     relationship.fromNode = node;
  //   }
  // }
}

function matchNodesWithIncomingRelationships(
  nodes: Node[],
  relationships: Relationship[],
) {
  // nodeId -> relationships
  const nodesToRelations = new Map<string, Relationship[]>();

  for (const relationship of relationships) {
    const toNodeId = relationship.toNode.id;

    if (!nodesToRelations.has(toNodeId)) {
      nodesToRelations.set(toNodeId, []);
    }

    nodesToRelations.get(toNodeId)!.push(relationship);
  }

  for (const node of nodes) {
    const relationships = nodesToRelations.get(node.id) || [];

    for (const relationship of relationships) {
      relationship.toNode = node;

      if (!node.incomingRelationships) {
        node.incomingRelationships = [];
      }

      node.incomingRelationships.push(relationship);
    }
  }
}
