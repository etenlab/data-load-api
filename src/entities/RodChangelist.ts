import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('rod_changelist_pkey', ['id'], { unique: true })
@Entity('rod_changelist', { schema: 'public' })
export class RodChangelist {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', {
    name: 'dialect_code',
    nullable: true,
    length: 10,
  })
  dialectCode!: string | null;

  @Column('timestamp without time zone', { name: 'date', nullable: true })
  date!: Date | null;

  @Column('character varying', {
    name: 'change_type',
    nullable: true,
    length: 3,
  })
  changeType!: string | null;

  @Column('character varying', {
    name: 'prev_language_code',
    nullable: true,
    length: 3,
  })
  prevLanguageCode!: string | null;

  @Column('character varying', {
    name: 'new_language_code',
    nullable: true,
    length: 3,
  })
  newLanguageCode!: string | null;

  @Column('text', { name: 'explanation', nullable: true })
  explanation!: string | null;
}
