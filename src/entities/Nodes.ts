import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NodePropertyKey } from './NodePropertyKeys';
import { NodeTypeName } from './NodeTypes';
import { Relationship } from './Relationships';

@Index('nodes_pkey', ['id'], { unique: true })
@Entity('nodes', { schema: 'admin' })
export class Node {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'node_id' })
  id!: string;

  @OneToMany(() => NodePropertyKey, (nodePropertyKeys) => nodePropertyKeys.node)
  propertyKeys!: NodePropertyKey[];

  // @ManyToOne(() => NodeType, (nodeTypes) => nodeTypes.nodes)
  // @JoinColumn([{ name: 'node_type', referencedColumnName: 'name' }])
  // type!: NodeType;

  @Column('character varying', { name: 'node_type', length: 32 })
  typeName!: NodeTypeName;

  @OneToMany(() => Relationship, (relationships) => relationships.fromNode)
  outgoingRelationships!: Relationship[];

  @OneToMany(() => Relationship, (relationships) => relationships.toNode)
  incomingRelationships!: Relationship[];
}
