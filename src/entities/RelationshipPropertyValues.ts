import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RelationshipPropertyKey } from './RelationshipPropertyKeys';

@Index('relationship_property_values_pkey', ['id'], {
  unique: true,
})
@Entity('relationship_property_values', { schema: 'public' })
export class RelationshipPropertyValue {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'relationship_property_value_id',
  })
  id!: string;

  @Column('jsonb', { name: 'property_value', nullable: true })
  value!: { [key: string]: any } | null;

  @ManyToOne(
    () => RelationshipPropertyKey,
    (relationshipPropertyKeys) => relationshipPropertyKeys.values,
  )
  @JoinColumn([
    {
      name: 'relationship_property_key_id',
      referencedColumnName: 'id',
    },
  ])
  relationshipPropertyKey!: RelationshipPropertyKey;
}
