import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('uf_languages_with_one_story_bible_stories_pkey', ['id'], {
  unique: true,
})
@Entity('uf_languages_with_one_story_bible_stories', { schema: 'public' })
export class UfLanguagesWithOneStoryBibleStories {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column('character varying', {
    name: 'language',
    nullable: true,
    length: 200,
  })
  language!: string | null;

  @Column('character varying', { name: 'media', nullable: true, length: 25 })
  media!: string | null;

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: () => 'false',
  })
  published!: boolean | null;

  @Column('character varying', { name: 'info', nullable: true, length: 500 })
  info!: string | null;
}
