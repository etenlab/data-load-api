import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Relationship } from './Relationships';

@Index('relationship_types_pkey', ['name'], { unique: true })
@Entity('relationship_types', { schema: 'public' })
export class RelationshipType {
  @Column('character varying', { primary: true, name: 'type_name', length: 32 })
  name!: RelationshipTypes;

  @OneToMany(() => Relationship, (relationships) => relationships.type)
  relationships!: Relationship[];
}

export enum RelationshipTypes {
  WORD_SEQUENCE_TO_WORD = 'word-sequence-to-word',
  VERSE_TO_WORD_SEQUENCE = 'verse-to-word-sequence',
  SENTENCE_TO_WORD_SEQUENCE = 'sentence-to-word-sequence',
  CHAPTER_TO_VERSE = 'chapter-to-verse',
  BOOK_TO_CHAPTER = 'book-to-chapter',
  BIBLE_TO_BOOK = 'bible-to-book',

  WORD_TO_ARTICLE = 'word-to-article',

  WORD_TO_STRONGS_ENTRY = 'word-to-strongs-entry',
  WORD_TO_ADDITION = 'word-to-addition',
  SECTION_TO_PARAGRAPH = 'section-to-paragraph',
  SECTION_TO_SECTION = 'section-to-section',
  CHAPTER_TO_SECTION = 'chapter-to-section',
  ARTICLE_TO_SECTION = 'article-to-section',
  ARTICLE_TO_PARAGRAPH = 'article-to-paragraph',
  CHAPTER_TO_PARAGRAPH = 'chapter-to-paragraph',
  ARTICLE_TO_SENTENCE = 'article-to-sentence',
  PARAGRAPH_TO_SENTENCE = 'paragraph-to-sentence',
  PARAGRAPH_TO_VERSE = 'paragraph-to-verse',
  VERSE_TO_SENTENCE = 'verse-to-sentence',
  SENTENCE_TO_WORD = 'sentence-to-word',
}
