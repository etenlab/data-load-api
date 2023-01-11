import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NodePropertyKey } from './NodePropertyKeys';
import { NodeType } from './NodeTypes';
import { Relationship } from './Relationships';

@Index('nodes_pkey', ['id'], { unique: true })
@Entity('nodes', { schema: 'public' })
export class Node {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'node_id' })
  id: string;

  @OneToMany(() => NodePropertyKey, (nodePropertyKeys) => nodePropertyKeys.node)
  propertyKeys: NodePropertyKey[];

  @ManyToOne(() => NodeType, (nodeTypes) => nodeTypes.nodes)
  @JoinColumn([{ name: 'node_type', referencedColumnName: 'name' }])
  type: NodeType;

  @OneToMany(() => Relationship, (relationships) => relationships.fromNode)
  relationships: Relationship[];

  @OneToMany(() => Relationship, (relationships) => relationships.toNode)
  relationships2: Relationship[];
}
