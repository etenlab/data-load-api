import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('sil_country_codes_pkey', ['id'], { unique: true })
@Entity('sil_country_codes', { schema: 'public' })
export class SilCountryCodes {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'code', length: 2 })
  code!: string;

  @Column('character varying', { name: 'name', length: 200 })
  name!: string;

  @Column('character varying', { name: 'area', length: 200 })
  area!: string;
}
