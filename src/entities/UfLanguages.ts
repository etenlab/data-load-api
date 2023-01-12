import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('uf_languages_pkey', ['id'], { unique: true })
@Entity('uf_languages', { schema: 'public' })
export class UfLanguages {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'code', length: 50 })
  code!: string;

  @Column('character varying', { name: 'iso_639_3', nullable: true, length: 3 })
  iso_639_3!: string | null;

  @Column('character varying', { name: 'name', length: 200 })
  name!: string;

  @Column('text', { name: 'alternate_name', nullable: true })
  alternateName!: string | null;

  @Column('character varying', {
    name: 'anglicized_name',
    nullable: true,
    length: 200,
  })
  anglicizedName!: string | null;

  @Column('character varying', { name: 'country', nullable: true, length: 200 })
  country!: string | null;

  @Column('character varying', {
    name: 'gateway_language',
    nullable: true,
    length: 200,
  })
  gatewayLanguage!: string | null;

  @Column('character varying', { name: 'gw', nullable: true, length: 200 })
  gw!: string | null;
}
