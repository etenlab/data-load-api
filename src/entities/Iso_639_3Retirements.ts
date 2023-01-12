import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('iso_639_3_retirements_pkey', ['id'], { unique: true })
@Entity('iso_639_3_retirements', { schema: 'public' })
export class Iso_639_3Retirements {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'iso_639_3', length: 3 })
  iso_639_3!: string;

  @Column('character varying', { name: 'ref_name', length: 150 })
  refName!: string;

  @Column('enum', {
    name: 'ret_reason',
    nullable: true,
    enum: ['C', 'D', 'N', 'S', 'M'],
  })
  retReason!: 'C' | 'D' | 'N' | 'S' | 'M' | null;

  @Column('character varying', { name: 'change_to', nullable: true, length: 3 })
  changeTo!: string | null;

  @Column('character varying', {
    name: 'ret_remedy',
    nullable: true,
    length: 300,
  })
  retRemedy!: string | null;

  @Column('timestamp without time zone', { name: 'effective' })
  effective!: Date;
}
