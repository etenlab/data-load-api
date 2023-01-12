import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('iso_639_3_pkey', ['id'], { unique: true })
@Entity('iso_639_3', { schema: 'public' })
export class Iso_639_3 {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'iso_639_3', length: 3 })
  iso_639_3!: string;

  @Column('character varying', { name: 'part_2b', nullable: true, length: 3 })
  part_2b!: string | null;

  @Column('character varying', { name: 'part_2t', nullable: true, length: 3 })
  part_2t!: string | null;

  @Column('character varying', { name: 'part_1', nullable: true, length: 2 })
  part_1!: string | null;

  @Column('enum', { name: 'scope', enum: ['I', 'M', 'S'] })
  scope!: 'I' | 'M' | 'S';

  @Column('enum', { name: 'entry_type', enum: ['A', 'C', 'E', 'H', 'L', 'S'] })
  entryType!: 'A' | 'C' | 'E' | 'H' | 'L' | 'S';

  @Column('character varying', { name: 'ref_name', length: 150 })
  refName!: string;

  @Column('character varying', { name: 'comment', nullable: true, length: 150 })
  comment!: string | null;
}
