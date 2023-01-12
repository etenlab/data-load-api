import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('iso_639_3_macrolanguages_pkey', ['id'], { unique: true })
@Entity('iso_639_3_macrolanguages', { schema: 'public' })
export class Iso_639_3Macrolanguages {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'm_id', length: 3 })
  mId!: string;

  @Column('character varying', { name: 'i_id', length: 3 })
  iId!: string;

  @Column('enum', { name: 'i_status', enum: ['A', 'R'] })
  iStatus!: 'A' | 'R';
}
