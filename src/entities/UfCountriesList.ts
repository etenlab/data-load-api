import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('uf_countries_list_pkey', ['id'], { unique: true })
@Entity('uf_countries_list', { schema: 'public' })
export class UfCountriesList {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'code', nullable: true, length: 2 })
  code!: string | null;

  @Column('character varying', {
    name: 'alpha_3_code',
    nullable: true,
    length: 3,
  })
  alpha_3Code!: string | null;

  @Column('character varying', { name: 'name', nullable: true, length: 200 })
  name!: string | null;

  @Column('character varying', { name: 'region', nullable: true, length: 200 })
  region!: string | null;

  @Column('character varying', {
    name: 'wa_region',
    nullable: true,
    length: 200,
  })
  waRegion!: string | null;

  @Column('integer', { name: 'population', nullable: true })
  population!: number | null;
}
