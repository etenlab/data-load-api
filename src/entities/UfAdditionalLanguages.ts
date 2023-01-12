import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('uf_additional_languages_pkey', ['id'], { unique: true })
@Entity('uf_additional_languages', { schema: 'public' })
export class UfAdditionalLanguages {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', {
    name: 'ietf_tag',
    nullable: true,
    length: 200,
  })
  ietfTag!: string | null;

  @Column('character varying', {
    name: 'two_letter',
    nullable: true,
    length: 2,
  })
  twoLetter!: string | null;

  @Column('character varying', {
    name: 'three_letter',
    nullable: true,
    length: 3,
  })
  threeLetter!: string | null;

  @Column('character varying', {
    name: 'common_name',
    nullable: true,
    length: 200,
  })
  commonName!: string | null;

  @Column('character varying', {
    name: 'native_name',
    nullable: true,
    length: 200,
  })
  nativeName!: string | null;

  @Column('character varying', { name: 'direction', nullable: true, length: 3 })
  direction!: string | null;

  @Column('character varying', { name: 'comment', nullable: true, length: 500 })
  comment!: string | null;
}
