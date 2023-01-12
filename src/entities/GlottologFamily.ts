import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('glottolog_family_pkey', ['id'], { unique: true })
@Entity('glottolog_family', { schema: 'public' })
export class GlottologFamily {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'name', nullable: true, length: 200 })
  name!: string | null;

  @Column('character varying', { name: 'level', nullable: true, length: 200 })
  level!: string | null;

  @Column('character varying', {
    name: 'macro_area',
    nullable: true,
    length: 550,
  })
  macroArea!: string | null;

  @Column('integer', { name: 'sub_families', nullable: true })
  subFamilies!: number | null;

  @Column('integer', { name: 'child_languages', nullable: true })
  childLanguages!: number | null;

  @Column('integer', { name: 'top_level_family', nullable: true })
  topLevelFamily!: number | null;
}
