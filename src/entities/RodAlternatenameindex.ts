import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('rod_alternatenameindex_pkey', ['id'], { unique: true })
@Entity('rod_alternatenameindex', { schema: 'public' })
export class RodAlternatenameindex {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', {
    name: 'dialect_code',
    nullable: true,
    length: 10,
  })
  dialectCode!: string | null;

  @Column('character varying', {
    name: 'variant_name',
    nullable: true,
    length: 500,
  })
  variantName!: string | null;
}
