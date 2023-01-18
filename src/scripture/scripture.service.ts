import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Node } from '../entities/Nodes';
import { NodeTypeName } from '../entities/NodeTypes';
import { Marker, parseUSFMMarkers, stringifyContent } from './usfmParser';
import { GraphNode, GraphRelation, GraphService } from '../graph/graph.service';
import { StrongsService } from '../strongs/strongs.service';
import { RelationshipTypes } from '../entities/RelationshipTypes';

/** Nodes and relations: (relation_property) NODE_TYPE:node_property
 *
 * BOOK
 *  (order_book, chapter_number) CHAPTER:number
 *    [(order_chapter) SECTION:title]
 *      (order_chapter, [order_section]) PARAGRAPH
 *        (order_paragraph) VERSE:text
 *          (order_verse) SENTENCE:text
 *            (char_index, order_sentence) WORD:text
 *              [STRONGS]
 */

type Word = {
  marker: Marker;
  strongs: Node[];
};

type Verse = {
  marker: Marker;
  words: Word[];
};

type Paragraph = {
  marker: Marker;
  verses: Verse[];
};

type Section = {
  marker: Marker;
  paragraphs: Paragraph[];
};

type Chapter = {
  marker: Marker;
  sections: Section[];
  paragraphs: Paragraph[];
};

type Book = {
  marker: Marker;
  chapters: Chapter[];
};

// type BookOutput = {
//   id: string;
//   chapters: ChapterOutput[];
// };

// type ChapterOutput = {
//   number: string;
//   sections: SectionOutput[];
//   paragraphs: ParagraphOutput[];
// };

// type SectionOutput = {
//   title: string;
//   paragraphs: ParagraphOutput[];
// };

// type ParagraphOutput = {
//   verses: VerseOutput[];
// };

// type VerseOutput = {
//   number: string;
//   words: SentenceOutput[];
// };

// type SentenceOutput = {
//   text: string;
//   words: WordOutput[];
// };

// type WordOutput = {
//   text: string;
//   strongs: Node[];
//   addition: string;
// };

const BOOK_ID_PROP_NAME = 'id';
const CHAPTER_NUMBER_PROP_NAME = 'number';
const SECTION_TITLE_PROP_NAME = 'title';
const VERSE_TEXT_PROP_NAME = 'text';
const SENTENCE_TEXT_PROP_NAME = 'text';
const WORD_TEXT_PROP_NAME = 'text';
const ADDITION_TEXT_PROP_NAME = 'text';

const BOOK_TO_CHAPTER_ORDER_PROP_NAME = 'order_book';
const BOOK_TO_CHAPTER_NUMBER_PROP_NAME = 'chapter_number';
const CHAPTER_TO_SECTION_ORDER_PROP_NAME = 'order_chapter';
const CHAPTER_TO_PARAGRAPH_ORDER_PROP_NAME = 'order_chapter';
const SECTION_TO_PARAGRAPH_ORDER_PROP_NAME = 'order_section';
const VERSE_TO_PARAGRAPH_NUMBER_PROP_NAME = 'verse_number';
const VERSE_TO_PARAGRAPH_ORDER_PROP_NAME = 'order_paragraph';
const VERSE_TO_SENTENCE_ORDER_PROP_NAME = 'order_verse';
const SENTENCE_TO_WORD_ORDER_PROP_NAME = 'order_sentence';
const SENTENCE_TO_WORD_CHAR_INDEX_PROP_NAME = 'char_index';

@Injectable()
export class ScriptureService {
  constructor(
    private readonly httpService: HttpService,
    private readonly graphService: GraphService,
    private readonly strongsService: StrongsService,
  ) {}

  async loadUSFMBooksIntoDB(usfmDoc: string): Promise<string[]> {
    if (!(await this.strongsService.areStrongsLoaded())) {
      await this.strongsService.loadStrongsIntoDB();
    }

    await this.strongsService.syncStrongsNodesFromDB();

    const markers = parseUSFMMarkers(usfmDoc).filter(
      (m) => typeof m !== 'string',
    ) as Marker[];

    const books: Book[] = this.parseBooksFromMarkers(markers);

    const { nodes, relations } = this.buildGraphFromBooks(books);

    await this.graphService.saveNodes(nodes);
    await this.graphService.saveRelations(relations);

    const newBookIds = nodes
      .filter((n) => n.nodeType === NodeTypeName.BOOK)
      .map((n) => n.node.id);

    return newBookIds;
  }

  async loadUSFMIntoDBByUrl(url: string) {
    const response = await this.httpService.axiosRef.get(url);

    return await this.loadUSFMBooksIntoDB(response.data);
  }

  private buildGraphFromBooks(books: Book[]): {
    nodes: GraphNode[];
    relations: GraphRelation[];
  } {
    const nodes: GraphNode[] = [];
    const relations: GraphRelation[] = [];

    // Build graph
    for (const book of books) {
      const bookId = book.marker.stringifiedContent.trim();

      if (!bookId) {
        throw new Error('No book id found after the book marker');
      }

      const bookNode = this.graphService.makeNode({
        type: NodeTypeName.BOOK,
        properties: {
          [BOOK_ID_PROP_NAME]: bookId,
        },
      });

      nodes.push(bookNode);

      for (let i = 0; i < book.chapters.length; i++) {
        const chapter = book.chapters[i];

        const chapterNode = this.graphService.makeNode({
          type: NodeTypeName.CHAPTER,
          properties: {
            [CHAPTER_NUMBER_PROP_NAME]:
              chapter.marker.stringifiedContent.trim(),
          },
        });

        nodes.push(chapterNode);

        const relationship = this.graphService.makeRelation({
          type: RelationshipTypes.BOOK_TO_CHAPTER,
          fromNode: bookNode,
          toNode: chapterNode,
          props: {
            [BOOK_TO_CHAPTER_ORDER_PROP_NAME]: `${i + 1}`,
            [BOOK_TO_CHAPTER_NUMBER_PROP_NAME]:
              chapter.marker.stringifiedContent.trim(),
          },
        });

        relations.push(relationship);

        const chapterSections: Map<Section, GraphNode> = new Map();

        for (let j = 0; j < chapter.sections.length; j++) {
          const section = chapter.sections[j];

          const sectionNode = this.graphService.makeNode({
            type: NodeTypeName.SECTION,
            properties: {
              [SECTION_TITLE_PROP_NAME]:
                section.marker.stringifiedContent.trim(),
            },
          });

          chapterSections.set(section, sectionNode);

          nodes.push(sectionNode);

          const relationship = this.graphService.makeRelation({
            type: RelationshipTypes.CHAPTER_TO_SECTION,
            fromNode: chapterNode,
            toNode: sectionNode,
            props: {
              [CHAPTER_TO_SECTION_ORDER_PROP_NAME]: `${j + 1}`,
            },
          });

          relations.push(relationship);
        }

        for (let p = 0; p < chapter.paragraphs.length; p++) {
          const paragraph = chapter.paragraphs[p];

          const paragraphNode = this.graphService.makeNode({
            type: NodeTypeName.PARAGRAPH,
          });

          nodes.push(paragraphNode);

          const relationship = this.graphService.makeRelation({
            type: RelationshipTypes.CHAPTER_TO_PARAGRAPH,
            fromNode: chapterNode,
            toNode: paragraphNode,
            props: {
              [CHAPTER_TO_PARAGRAPH_ORDER_PROP_NAME]: `${p + 1}`,
            },
          });

          relations.push(relationship);

          for (let s = 0; s < chapter.sections.length; s++) {
            const section = chapter.sections[s];

            if (!section.paragraphs.includes(paragraph)) {
              continue;
            }

            const sectionNode = chapterSections.get(section);

            if (!sectionNode) {
              throw new Error(
                'Section node not found but is supposed to exist',
              );
            }

            const relationship = this.graphService.makeRelation({
              type: RelationshipTypes.SECTION_TO_PARAGRAPH,
              fromNode: sectionNode,
              toNode: paragraphNode,
              props: {
                [SECTION_TO_PARAGRAPH_ORDER_PROP_NAME]: `${s + 1}`,
              },
            });

            relations.push(relationship);
          }

          for (let v = 0; v < paragraph.verses.length; v++) {
            const verse = paragraph.verses[v];

            const verseNode = this.graphService.makeNode({
              type: NodeTypeName.VERSE,
              properties: {
                [VERSE_TEXT_PROP_NAME]: verse.marker.stringifiedContent.trim(),
              },
            });

            nodes.push(verseNode);

            let lastWordNode: GraphNode | undefined;

            const verseNumber = verse.marker.stringifiedContent
              .split(' ')[0]
              ?.trim();

            const props = {
              [VERSE_TO_PARAGRAPH_ORDER_PROP_NAME]: `${v + 1}`,
            } as any;

            if (verseNumber) {
              props[VERSE_TO_PARAGRAPH_NUMBER_PROP_NAME] = verseNumber;
            }

            const relationship = this.graphService.makeRelation({
              type: RelationshipTypes.PARAGRAPH_TO_VERSE,
              fromNode: paragraphNode,
              toNode: verseNode,
              props,
            });

            relations.push(relationship);

            const sentences = SplitVerseIntoSentences(verse.marker.content);

            for (let s = 0; s < sentences.length; s++) {
              const sentenseMarkers = sentences[s];

              const sentenceNode = this.graphService.makeNode({
                type: NodeTypeName.SENTENCE,
                properties: {
                  [SENTENCE_TEXT_PROP_NAME]:
                    stringifyContent(sentenseMarkers).trim(),
                },
              });

              nodes.push(sentenceNode);

              const relationship = this.graphService.makeRelation({
                type: RelationshipTypes.VERSE_TO_SENTENCE,
                fromNode: verseNode,
                toNode: sentenceNode,
                props: {
                  [VERSE_TO_SENTENCE_ORDER_PROP_NAME]: `${s + 1}`,
                },
              });

              relations.push(relationship);

              let charIndex = 1;
              let sentenceWordIndex = 1;
              for (let m = 0; m < sentenseMarkers.length; m++) {
                const marker = sentenseMarkers[m];

                if (typeof marker === 'string') {
                  charIndex += marker.length;

                  continue;
                }

                if (isWordToken(marker.token)) {
                  const wordNode = this.graphService.makeNode({
                    type: NodeTypeName.WORD,
                    properties: {
                      [WORD_TEXT_PROP_NAME]: marker.stringifiedContent.trim(),
                    },
                  });

                  nodes.push(wordNode);

                  lastWordNode = wordNode;

                  const relationship = this.graphService.makeRelation({
                    type: RelationshipTypes.SENTENCE_TO_WORD,
                    fromNode: sentenceNode,
                    toNode: wordNode,
                    props: {
                      [SENTENCE_TO_WORD_ORDER_PROP_NAME]: `${sentenceWordIndex}`,
                      [SENTENCE_TO_WORD_CHAR_INDEX_PROP_NAME]: `${charIndex}`,
                    },
                  });

                  charIndex += marker.stringifiedContent.length;
                  sentenceWordIndex++;

                  relations.push(relationship);

                  const strongsNode = this.strongsService.getStrongsNode(
                    marker.attributes?.['strong'],
                  );

                  if (strongsNode) {
                    const relationship = this.graphService.makeRelation({
                      type: RelationshipTypes.WORD_TO_STRONGS_ENTRY,
                      fromNode: wordNode,
                      toNode: strongsNode,
                    });

                    relations.push(relationship);
                  }
                } else if (isAdditionToken(marker.token)) {
                  if (!lastWordNode) {
                    continue;
                  }

                  const additionNode = this.graphService.makeNode({
                    type: NodeTypeName.ADDITION,
                    properties: {
                      [ADDITION_TEXT_PROP_NAME]:
                        marker.stringifiedContent.trim(),
                    },
                  });

                  nodes.push(additionNode);

                  const relationship = this.graphService.makeRelation({
                    type: RelationshipTypes.WORD_TO_ADDITION,
                    fromNode: lastWordNode,
                    toNode: additionNode,
                  });

                  charIndex += marker.stringifiedContent.length;

                  relations.push(relationship);
                } else {
                  console.error(
                    `Unknown marker inside sentence: ${marker.token}`,
                  );
                  charIndex += marker.stringifiedContent.length;

                  continue;
                }
              }
            }

            lastWordNode = undefined;
          }
        }
      }
    }

    return {
      nodes,
      relations,
    };
  }

  private parseBooksFromMarkers(markers: Marker[]) {
    const books: Book[] = [];

    // TODO: determine ARTICLE, WORD SEQUENCE

    // Build hierarchy of nodes
    let currentBook: Book | undefined;
    let currentChapter: Chapter | undefined;
    let currentSection: Section | undefined;
    let currentParagraph: Paragraph | undefined;

    for (const marker of markers) {
      if (isVerseToken(marker.token)) {
        if (!currentParagraph) {
          console.warn('Verse marker found before paragraph marker');

          continue;
        }

        const verse: Verse = {
          marker,
          words: [],
        };

        for (const wordMarker of marker.content) {
          if (typeof wordMarker === 'string') {
            continue;
          }

          if (!isWordToken(wordMarker.token)) {
            continue;
          }

          const strongsKey = this.strongsService.getStrongValueFromWord(
            wordMarker.attributes,
          );

          const strongsNode = this.strongsService.getStrongsNode(strongsKey);
          const word: Word = {
            marker: wordMarker,
            strongs: strongsNode ? [strongsNode.node] : [],
          };

          verse.words.push(word);

          continue;
        }

        currentParagraph.verses.push(verse);

        continue;
      }

      if (isParagraphToken(marker.token)) {
        if (!currentChapter) {
          console.warn('Paragraph marker found before chapter marker');

          continue;
        }

        const paragraph: Paragraph = {
          marker,
          verses: [],
        };

        currentParagraph = paragraph;

        currentChapter.paragraphs.push(paragraph);
        currentSection?.paragraphs.push(paragraph);

        continue;
      }

      if (isSectionToken(marker.token)) {
        if (!currentChapter) {
          console.warn('Section marker found before chapter marker');

          continue;
        }

        const section: Section = {
          marker,
          paragraphs: [],
        };

        currentSection = section;

        currentChapter.sections.push(section);

        continue;
      }

      if (isChapterToken(marker.token)) {
        if (!currentBook) {
          console.warn('Chapter marker found before book marker');

          continue;
        }

        const chapter: Chapter = {
          marker,
          sections: [],
          paragraphs: [],
        };

        currentChapter = chapter;
        currentSection = undefined;
        currentParagraph = undefined;

        currentBook.chapters.push(chapter);

        continue;
      }

      if (isBookToken(marker.token)) {
        const book: Book = {
          marker,
          chapters: [],
        };

        currentBook = book;

        currentChapter = undefined;
        currentSection = undefined;
        currentParagraph = undefined;

        books.push(book);

        continue;
      }
    }

    return books;
  }
}

function isWordToken(token: string) {
  return token === 'w';
}

function isAdditionToken(token: string) {
  return token === 'add';
}

function isVerseToken(token: string) {
  return token === 'v';
}

function isParagraphToken(token: string) {
  return token === 'p';
}

function isSectionToken(token: string) {
  return /^s\d+/.test(token);
}

function isChapterToken(token: string) {
  return token === 'c';
}

function isBookToken(token: string) {
  return token === 'id';
}

function SplitVerseIntoSentences(
  verseMarkers: (Marker | string)[],
): (Marker | string)[][] {
  const sentences: (Marker | string)[][] = [[]];

  for (const marker of verseMarkers) {
    if (typeof marker !== 'string') {
      sentences[sentences.length - 1].push(marker);

      continue;
    }

    if (!marker.trim()) {
      continue;
    }

    // Divide on sentences ending with punctuation: . ! ? or end of line
    const innerSentencesIterator = marker.matchAll(
      /([^\.\!\?\n]+[\.\!\?\n]?)/g,
    );

    const innerSentences = Array.from(innerSentencesIterator).map((m) => m[0]);

    sentences[sentences.length - 1].push(innerSentences[0]);

    for (const nextSentences of innerSentences.slice(1)) {
      const s = nextSentences.trim();

      if (s) {
        sentences.push([s]);
      }
    }
  }

  return sentences;
}
