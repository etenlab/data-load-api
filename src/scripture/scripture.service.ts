import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from '../entities/Nodes';
import { NodeType, NodeTypeName } from '../entities/NodeTypes';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Marker, parseUSFMMarkers, stringifyContent } from './usfmParser';
import { NodePropertyKey } from '../entities/NodePropertyKeys';
import { NodePropertyValue } from '../entities/NodePropertyValues';
import { GraphNode, GraphRelation, GraphService } from '../graph/graph.service';
import { StrongsService, STRONGS_KEY_NAME } from '../strongs/strongs.service';
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

@Injectable()
export class ScriptureService {
  constructor(
    private readonly httpService: HttpService,
    private readonly graphService: GraphService,
    private readonly strongsService: StrongsService,
  ) {}

  async loadUSFMIntoDB(usfmDoc: string) {
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
  }

  async loadUSFMIntoDBByUrl(url: string) {
    const response = await this.httpService.axiosRef.get(url);

    await this.loadUSFMIntoDB(response.data);
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
          id: bookId,
        },
      });

      nodes.push(bookNode);

      for (let i = 0; i < book.chapters.length; i++) {
        const chapter = book.chapters[i];

        const chapterNode = this.graphService.makeNode({
          type: NodeTypeName.CHAPTER,
          properties: {
            number: chapter.marker.stringifiedContent.trim(),
          },
        });

        nodes.push(chapterNode);

        const relationship = this.graphService.makeRelation({
          type: RelationshipTypes.BOOK_TO_CHAPTER,
          fromNode: bookNode.node,
          toNode: chapterNode.node,
          props: {
            order_book: `${i + 1}`,
            chapter_number: chapter.marker.stringifiedContent.trim(),
          },
        });

        relations.push(relationship);

        const chapterSections: Map<Section, GraphNode> = new Map();

        for (let j = 0; j < chapter.sections.length; j++) {
          const section = chapter.sections[j];

          const sectionNode = this.graphService.makeNode({
            type: NodeTypeName.SECTION,
            properties: {
              title: section.marker.stringifiedContent.trim(),
            },
          });

          chapterSections.set(section, sectionNode);

          nodes.push(sectionNode);

          const relationship = this.graphService.makeRelation({
            type: RelationshipTypes.CHAPTER_TO_SECTION,
            fromNode: chapterNode.node,
            toNode: sectionNode.node,
            props: {
              order_chapter: `${j + 1}`,
            },
          });

          relations.push(relationship);
        }

        for (let k = 0; k < chapter.paragraphs.length; k++) {
          const paragraph = chapter.paragraphs[k];

          const paragraphNode = this.graphService.makeNode({
            type: NodeTypeName.PARAGRAPH,
          });

          nodes.push(paragraphNode);

          const relationship = this.graphService.makeRelation({
            type: RelationshipTypes.CHAPTER_TO_PARAGRAPH,
            fromNode: chapterNode.node,
            toNode: paragraphNode.node,
            props: {
              order_chapter: `${k + 1}`,
            },
          });

          relations.push(relationship);

          for (let l = 0; l < chapter.sections.length; l++) {
            const section = chapter.sections[l];

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
              fromNode: sectionNode.node,
              toNode: paragraphNode.node,
              props: {
                order_section: `${l + 1}`,
              },
            });

            relations.push(relationship);
          }

          for (let m = 0; m < paragraph.verses.length; m++) {
            const verse = paragraph.verses[m];

            const verseNode = this.graphService.makeNode({
              type: NodeTypeName.VERSE,
              properties: {
                text: verse.marker.stringifiedContent.trim(),
              },
            });

            nodes.push(verseNode);

            const verseNumber = verse.marker.stringifiedContent
              .split(' ')[0]
              ?.trim();

            const props = {
              order_paragraph: `${m + 1}`,
            } as any;

            if (verseNumber) {
              props['verse_number'] = verseNumber;
            }

            const relationship = this.graphService.makeRelation({
              type: RelationshipTypes.PARAGRAPH_TO_VERSE,
              fromNode: paragraphNode.node,
              toNode: verseNode.node,
              props,
            });

            relations.push(relationship);

            const sentences = SplitVerseIntoSentences(verse.marker.content);

            for (let n = 0; n < sentences.length; n++) {
              const sentenseMarkers = sentences[n];

              const sentenceNode = this.graphService.makeNode({
                type: NodeTypeName.SENTENCE,
                properties: {
                  text: stringifyContent(sentenseMarkers).trim(),
                },
              });

              nodes.push(sentenceNode);

              const relationship = this.graphService.makeRelation({
                type: RelationshipTypes.VERSE_TO_SENTENCE,
                fromNode: verseNode.node,
                toNode: sentenceNode.node,
                props: {
                  order_verse: `${n + 1}`,
                },
              });

              relations.push(relationship);

              let charIndex = 1;
              let sentenceWordIndex = 1;
              for (let m = 0; n < sentenseMarkers.length; m++) {
                const marker = sentenseMarkers[m];

                if (typeof marker === 'string') {
                  charIndex += marker.length;

                  continue;
                }

                if (typeof marker !== 'string' && !isWordToken(marker.token)) {
                  console.error(`Unknown marker inside sentence: ${marker}`);
                  charIndex += marker.stringifiedContent.length;

                  continue;
                }

                const wordNode = this.graphService.makeNode({
                  type: NodeTypeName.WORD,
                  properties: {
                    text: marker.stringifiedContent.trim(),
                  },
                });

                nodes.push(wordNode);

                const relationship = this.graphService.makeRelation({
                  type: RelationshipTypes.SENTENCE_TO_WORD,
                  fromNode: sentenceNode.node,
                  toNode: wordNode.node,
                  props: {
                    order_sentence: `${sentenceWordIndex}`,
                    char_index: `${charIndex}`,
                  },
                });

                charIndex += marker.stringifiedContent.length;
                sentenceWordIndex++;

                relations.push(relationship);

                const strongsNode = this.strongsService.getStrongsNode(
                  marker.attributes?.[STRONGS_KEY_NAME],
                );

                if (strongsNode) {
                  const relationship = this.graphService.makeRelation({
                    type: RelationshipTypes.WORD_TO_STRONGS_ENTRY,
                    fromNode: wordNode.node,
                    toNode: strongsNode,
                    props: {
                      text: marker.stringifiedContent.trim(),
                    },
                  });

                  relations.push(relationship);
                }
              }
            }
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

          const wordNode = this.graphService.makeNode({
            type: NodeTypeName.WORD,
            properties: {
              text: wordMarker.stringifiedContent.trim(),
            },
          });

          const strongsKey = this.strongsService.getStrongValueFromWord(
            wordMarker.attributes,
          );

          const strongsNode = this.strongsService.getStrongsNode(strongsKey);
          const word: Word = {
            marker: wordMarker,
            strongs: strongsNode ? [strongsNode] : [],
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

    // Split on punctuation: !, ?, .
    const innerSentences = marker.split(/([!.?])/);

    const firstSentence = innerSentences[0].trim();

    if (firstSentence) {
      sentences[sentences.length - 1].push(firstSentence);
    }

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
