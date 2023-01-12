import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('uf_networks_pkey', ['id'], { unique: true })
@Entity('uf_networks', { schema: 'public' })
export class UfNetworks {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', { name: 'network', nullable: true, length: 200 })
  network!: string | null;

  @Column('text', { name: 'countries', nullable: true })
  countries!: string | null;

  @Column('text', { name: 'languages', nullable: true })
  languages!: string | null;
}
