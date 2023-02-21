import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NodePropertyKey } from './NodePropertyKeys';

@Index('node_property_values_pkey', ['id'], { unique: true })
@Entity('node_property_values', { schema: 'admin' })
export class NodePropertyValue {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'node_property_value_id' })
  id!: string;

  @Column('jsonb', { name: 'property_value', nullable: true })
  value!: { value: any } | null;

  @ManyToOne(
    () => NodePropertyKey,
    (nodePropertyKeys) => nodePropertyKeys.values,
  )
  @JoinColumn([{ name: 'node_property_key_id', referencedColumnName: 'id' }])
  nodePropertyKey!: NodePropertyKey;
}
