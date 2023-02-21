import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Node } from './Nodes';
import { NodePropertyValue } from './NodePropertyValues';

@Index('node_property_keys_pkey', ['id'], { unique: true })
@Entity('node_property_keys', { schema: 'admin' })
export class NodePropertyKey {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'node_property_key_id' })
  id!: string;

  @Column('character varying', {
    name: 'property_key',
    nullable: true,
    length: 64,
  })
  key!: string | null;

  @ManyToOne(() => Node, (nodes) => nodes.propertyKeys)
  @JoinColumn([{ name: 'node_id', referencedColumnName: 'id' }])
  node!: Node;

  @OneToMany(
    () => NodePropertyValue,
    (nodePropertyValues) => nodePropertyValues.nodePropertyKey,
  )
  values!: NodePropertyValue[];
}
