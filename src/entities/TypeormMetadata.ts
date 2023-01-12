import { Column, Entity } from 'typeorm';

@Entity('typeorm_metadata', { schema: 'public' })
export class TypeormMetadata {
  @Column('character varying', { name: 'type', length: 255 })
  type!: string;

  @Column('character varying', {
    name: 'database',
    nullable: true,
    length: 255,
    default: () => 'NULL::character varying',
  })
  database!: string | null;

  @Column('character varying', {
    name: 'schema',
    nullable: true,
    length: 255,
    default: () => 'NULL::character varying',
  })
  schema!: string | null;

  @Column('character varying', {
    name: 'table',
    nullable: true,
    length: 255,
    default: () => 'NULL::character varying',
  })
  table!: string | null;

  @Column('character varying', {
    name: 'name',
    nullable: true,
    length: 255,
    default: () => 'NULL::character varying',
  })
  name!: string | null;

  @Column('text', { name: 'value', nullable: true })
  value!: string | null;
}
