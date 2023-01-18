import { Column, Entity, Index } from 'typeorm';

@Index('node_types_pkey', ['name'], { unique: true })
@Entity('node_types', { schema: 'public' })
export class NodeType {
  @Column('character varying', { primary: true, name: 'type_name', length: 32 })
  name!: NodeTypeName;

  // @OneToMany(() => Node, (nodes) => nodes.type)
  // nodes!: Node[];
}

export enum NodeTypeName {
  WORD = 'word',
  ADDITION = 'addition',
  WORD_SEQUENCE = 'word-sequence',
  SENTENCE = 'sentence',
  VERSE = 'verse',
  PARAGRAPH = 'paragraph',
  SECTION = 'section',
  CHAPTER = 'chapter',
  BOOK = 'book',
  BIBLE = 'bible',
  DEFINITION = 'definition',
  ARTICLE = 'article',
  LEXICAL_ENTRY = 'lexical-entry',
  STRONGS_ENTRY = 'strongs-entry',
}
