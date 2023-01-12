import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('iso_639_5_pkey', ['id'], { unique: true })
@Entity('iso_639_5', { schema: 'public' })
export class Iso_639_5 {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'identifier', length: 3 })
  identifier!: string;

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
    name: 'iso_639_2',
    nullable: true,
    length: 128,
  })
  iso_639_2!: string | null;

  @Column('character varying', {
    name: 'hierarchy',
    nullable: true,
    length: 128,
  })
  hierarchy!: string | null;

  @Column('character varying', { name: 'notes', nullable: true, length: 128 })
  notes!: string | null;
}
