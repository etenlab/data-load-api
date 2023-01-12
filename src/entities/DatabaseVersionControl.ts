import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('database_version_control_pkey', ['id'], { unique: true })
@Entity('database_version_control', { schema: 'public' })
export class DatabaseVersionControl {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('bigint', { name: 'version' })
  version!: string;

  @Column('timestamp without time zone', {
    name: 'completed',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  completed!: Date | null;
}
