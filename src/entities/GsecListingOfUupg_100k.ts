import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('gsec_listing_of_uupg_100k_pkey', ['id'], { unique: true })
@Entity('gsec_listing_of_uupg_100k', { schema: 'public' })
export class GsecListingOfUupg_100k {
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

  @Column('character varying', {
    name: 'continent',
    nullable: true,
    length: 200,
  })
  continent!: string | null;

  @Column('character varying', {
    name: 'sub_continent',
    nullable: true,
    length: 200,
  })
  subContinent!: string | null;

  @Column('character varying', { name: 'country', nullable: true, length: 200 })
  country!: string | null;

  @Column('character varying', {
    name: 'country_of_origin',
    nullable: true,
    length: 200,
  })
  countryOfOrigin!: string | null;

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

  @Column('character varying', { name: 'rol', nullable: true, length: 3 })
  rol!: string | null;

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

  @Column('boolean', { name: 'nomadic', nullable: true })
  nomadic!: boolean | null;

  @Column('integer', { name: 'nomadic_type', nullable: true })
  nomadicType!: number | null;

  @Column('character varying', {
    name: 'nomadic_description',
    nullable: true,
    length: 200,
  })
  nomadicDescription!: string | null;

  @Column('bigint', { name: 'population', nullable: true })
  population!: string | null;

  @Column('boolean', { name: 'dispersed', nullable: true })
  dispersed!: boolean | null;

  @Column('boolean', { name: 'published_scripture', nullable: true })
  publishedScripture!: boolean | null;

  @Column('boolean', { name: 'jesus_film', nullable: true })
  jesusFilm!: boolean | null;

  @Column('boolean', { name: 'radio_broadcast', nullable: true })
  radioBroadcast!: boolean | null;

  @Column('boolean', { name: 'gospel_recording', nullable: true })
  gospelRecording!: boolean | null;

  @Column('boolean', { name: 'audio_scripture', nullable: true })
  audioScripture!: boolean | null;

  @Column('boolean', { name: 'gospel_films', nullable: true })
  gospelFilms!: boolean | null;

  @Column('boolean', { name: 'the_hope', nullable: true })
  theHope!: boolean | null;

  @Column('integer', { name: 'resources', nullable: true })
  resources!: number | null;

  @Column('character varying', {
    name: 'physical_exertion',
    nullable: true,
    length: 25,
  })
  physicalExertion!: string | null;

  @Column('character varying', {
    name: 'freedom_index',
    nullable: true,
    length: 25,
  })
  freedomIndex!: string | null;

  @Column('text', { name: 'government_restrictions_index', nullable: true })
  governmentRestrictionsIndex!: string | null;

  @Column('character varying', {
    name: 'social_hostilities_index',
    nullable: true,
    length: 25,
  })
  socialHostilitiesIndex!: string | null;

  @Column('character varying', {
    name: 'threat_level',
    nullable: true,
    length: 250,
  })
  threatLevel!: string | null;

  @Column('character varying', { name: 'rop1', nullable: true, length: 5 })
  rop1!: string | null;

  @Column('character varying', { name: 'rop2', nullable: true, length: 10 })
  rop2!: string | null;

  @Column('integer', { name: 'rop3', nullable: true })
  rop3!: number | null;

  @Column('character varying', {
    name: 'people_name',
    nullable: true,
    length: 200,
  })
  peopleName!: string | null;

  @Column('character varying', { name: 'genc', nullable: true, length: 3 })
  genc!: string | null;

  @Column('character varying', { name: 'fips', nullable: true, length: 2 })
  fips!: string | null;

  @Column('character varying', {
    name: 'fips_of_origin',
    nullable: true,
    length: 2,
  })
  fipsOfOrigin!: string | null;

  @Column('character varying', { name: 'latitude', nullable: true, length: 50 })
  latitude!: string | null;

  @Column('character varying', {
    name: 'longitude',
    nullable: true,
    length: 50,
  })
  longitude!: string | null;

  @Column('boolean', { name: 'addition', nullable: true })
  addition!: boolean | null;

  @Column('timestamp without time zone', {
    name: 'addition_date',
    nullable: true,
  })
  additionDate!: Date | null;

  @Column('text', { name: 'addition_reasons', nullable: true })
  additionReasons!: string | null;

  @Column('character varying', {
    name: 'imb_affinity_group',
    nullable: true,
    length: 200,
  })
  imbAffinityGroup!: string | null;

  @Column('character varying', {
    name: 'not_engaged_anywhere',
    nullable: true,
    length: 50,
  })
  notEngagedAnywhere!: string | null;

  @Column('integer', { name: 'spi', nullable: true })
  spi!: number | null;

  @Column('character varying', {
    name: 'strategic_priority_index',
    nullable: true,
    length: 200,
  })
  strategicPriorityIndex!: string | null;
}
