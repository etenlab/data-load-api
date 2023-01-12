import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('sil_language_index_pkey', ['id'], { unique: true })
@Entity('sil_language_index', { schema: 'public' })
export class SilLanguageIndex {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'language_code', length: 3 })
  languageCode!: string;

  @Column('character varying', { name: 'country_code', length: 2 })
  countryCode!: string;

  @Column('character varying', { name: 'name_type', length: 2 })
  nameType!: string;

  @Column('character varying', { name: 'name', length: 200 })
  name!: string;
}
