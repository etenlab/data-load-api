import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('gsec_listing_of_uupg_100k_removals_pkey', ['id'], { unique: true })
@Entity('gsec_listing_of_uupg_100k_removals', { schema: 'public' })
export class GsecListingOfUupg_100kRemovals {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('bigint', { name: 'peid', nullable: true })
  peid!: string | null;

  @Column('character varying', {
    name: 'affinity_bloc',
    nullable: true,
    length: 200,
  })
  affinityBloc!: string | null;

  @Column('character varying', {
    name: 'people_cluster',
    nullable: true,
    length: 200,
  })
  peopleCluster!: string | null;

  @Column('character varying', { name: 'country', nullable: true, length: 200 })
  country!: string | null;

  @Column('character varying', {
    name: 'people_group',
    nullable: true,
    length: 200,
  })
  peopleGroup!: string | null;

  @Column('integer', {
    name: 'global_status_of_evangelical_christianity',
    nullable: true,
  })
  globalStatusOfEvangelicalChristianity!: number | null;

  @Column('character varying', {
    name: 'language',
    nullable: true,
    length: 200,
  })
  language!: string | null;

  @Column('character varying', {
    name: 'religion',
    nullable: true,
    length: 200,
  })
  religion!: string | null;

  @Column('bigint', { name: 'population', nullable: true })
  population!: string | null;

  @Column('timestamp without time zone', {
    name: 'addition_date',
    nullable: true,
  })
  additionDate!: Date | null;

  @Column('text', { name: 'addition_reasons', nullable: true })
  additionReasons!: string | null;
}
