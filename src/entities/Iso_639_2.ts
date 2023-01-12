import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('iso_639_2_pkey', ['id'], { unique: true })
@Entity('iso_639_2', { schema: 'public' })
export class Iso_639_2 {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'iso_639_2', nullable: true, length: 3 })
  iso_639_2!: string | null;

  @Column('enum', { name: 'entry_type', nullable: true, enum: ['B', 'T'] })
  entryType!: 'B' | 'T' | null;

  @Column('character varying', { name: 'iso_639_1', nullable: true, length: 2 })
  iso_639_1!: string | null;

  @Column('character varying', {
    name: 'english_name',
    nullable: true,
    length: 128,
  })
  englishName!: string | null;

  @Column('character varying', {
    name: 'french_name',
    nullable: true,
    length: 128,
  })
  frenchName!: string | null;

  @Column('character varying', {
    name: 'german_name',
    nullable: true,
    length: 128,
  })
  germanName!: string | null;
}
