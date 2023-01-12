import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('glottolog_language_pkey', ['id'], { unique: true })
@Entity('glottolog_language', { schema: 'public' })
export class GlottologLanguage {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', {
    name: 'glottocode',
    nullable: true,
    length: 20,
  })
  glottocode!: string | null;

  @Column('character varying', { name: 'name', nullable: true, length: 200 })
  name!: string | null;

  @Column('character varying', {
    name: 'top_level_family',
    nullable: true,
    length: 200,
  })
  topLevelFamily!: string | null;

  @Column('character varying', { name: 'iso_639_3', nullable: true, length: 3 })
  iso_639_3!: string | null;

  @Column('character varying', {
    name: 'macro_area',
    nullable: true,
    length: 200,
  })
  macroArea!: string | null;

  @Column('integer', { name: 'child_dialects', nullable: true })
  childDialects!: number | null;

  @Column('character varying', { name: 'latitude', nullable: true, length: 50 })
  latitude!: string | null;

  @Column('character varying', {
    name: 'longitude',
    nullable: true,
    length: 50,
  })
  longitude!: string | null;
}
