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
  graphNode: GraphNode;
  strongs: Node[];
};

type Verse = {
  marker: Marker;
  graphNode: GraphNode;
  words: Word[];
};

type Paragraph = {
  marker: Marker;
  graphNode: GraphNode;
  verses: Verse[];
};

type Section = {
  marker: Marker;
  graphNode: GraphNode;
  paragraphs: Paragraph[];
};

type Chapter = {
  marker: Marker;
  graphNode: GraphNode;
  sections: Section[];
  paragraphs: Paragraph[];
};

type Book = {
  marker: Marker;
  graphNode: GraphNode;
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
    const nodes: GraphNode[] = [];
    const relations: GraphRelation[] = [];

    const markers = parseUSFMMarkers(usfmDoc).filter(
      (m) => typeof m !== 'string',
    ) as Marker[];

    await this.strongsService.loadStrongsIntoDB();
    await this.strongsService.fetchStrongsNodes();

    const books: Book[] = [];

    // TODO: determine ARTICLE, WORD SEQUENCE
    // Build hierarchy of nodes
    let currentBook: Book;
    let currentChapter: Chapter;
    let currentSection: Section;
    let currentParagraph: Paragraph;

    for (const marker of markers) {
      if (isVerseToken(marker.token)) {
        if (!currentParagraph) {
          console.warn('Verse marker found before paragraph marker');

          continue;
        }

        const verseNode = this.graphService.makeNode({
          type: NodeTypeName.VERSE,
          properties: {
            text: marker.stringifiedContent,
          },
        });

        const verse: Verse = {
          marker,
          graphNode: verseNode,
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
              text: wordMarker.stringifiedContent,
            },
          });

          const strongsKey = this.strongsService.getStrongValueFromWord(
            wordMarker.attributes,
          );

          const strongsNode = this.strongsService.getStrongsNode(strongsKey);
          const word: Word = {
            graphNode: wordNode,
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

        const paragraphNode = this.graphService.makeNode({
          type: NodeTypeName.PARAGRAPH,
        });

        const paragraph: Paragraph = {
          marker,
          graphNode: paragraphNode,
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

        const sectionNode = this.graphService.makeNode({
          type: NodeTypeName.SECTION,
          properties: {
            title: marker.stringifiedContent,
          },
        });

        const section: Section = {
          marker,
          graphNode: sectionNode,
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

        const chapterNode = this.graphService.makeNode({
          type: NodeTypeName.CHAPTER,
          properties: {
            number: marker.stringifiedContent,
          },
        });

        const chapter: Chapter = {
          marker,
          graphNode: chapterNode,
          sections: [],
          paragraphs: [],
        };

        currentChapter = chapter;

        currentBook.chapters.push(chapter);

        continue;
      }

      if (isBookToken(marker.token)) {
        const bookId = markers.find((m) =>
          isBookToken(m.token),
        )?.stringifiedContent;

        if (!bookId) {
          throw new Error('No book id found in the document');
        }

        const bookNode = this.graphService.makeNode({
          type: NodeTypeName.BOOK,
          properties: {
            id: bookId,
          },
        });

        const book: Book = {
          marker,
          graphNode: bookNode,
          chapters: [],
        };

        currentBook = book;

        books.push(book);

        continue;
      }
    }

    // Build graph
    for (const book of books) {
      nodes.push(book.graphNode);

      for (let i = 0; i < book.chapters.length; i++) {
        const chapter = book.chapters[i];

        nodes.push(chapter.graphNode);

        const relationship = this.graphService.makeRelation({
          type: RelationshipTypes.BOOK_TO_CHAPTER,
          fromNode: book.graphNode.node,
          toNode: chapter.graphNode.node,
          props: {
            order_book: `${i + 1}`,
            chapter_number: chapter.marker.stringifiedContent.trim(),
          },
        });

        relations.push(relationship);

        for (let j = 0; j < chapter.sections.length; j++) {
          const section = chapter.sections[j];

          nodes.push(section.graphNode);

          const relationship = this.graphService.makeRelation({
            type: RelationshipTypes.CHAPTER_TO_SECTION,
            fromNode: chapter.graphNode.node,
            toNode: section.graphNode.node,
            props: {
              order_chapter: `${j + 1}`,
            },
          });

          relations.push(relationship);
        }

        for (let k = 0; k < chapter.paragraphs.length; k++) {
          const paragraph = chapter.paragraphs[k];

          nodes.push(paragraph.graphNode);

          const relationship = this.graphService.makeRelation({
            type: RelationshipTypes.CHAPTER_TO_PARAGRAPH,
            fromNode: chapter.graphNode.node,
            toNode: paragraph.graphNode.node,
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

            const relationship = this.graphService.makeRelation({
              type: RelationshipTypes.SECTION_TO_PARAGRAPH,
              fromNode: section.graphNode.node,
              toNode: paragraph.graphNode.node,
              props: {
                order_section: `${l + 1}`,
              },
            });

            relations.push(relationship);
          }

          for (let m = 0; m < paragraph.verses.length; m++) {
            const verse = paragraph.verses[m];

            nodes.push(verse.graphNode);

            const verseNumber = verse.marker.stringifiedContent
              .split(' ')[0]
              ?.trim();

            const props = {
              order_paragraph: `${m + 1}`,
            };

            if (verseNumber) {
              props['verse_number'] = verseNumber;
            }

            const relationship = this.graphService.makeRelation({
              type: RelationshipTypes.PARAGRAPH_TO_VERSE,
              fromNode: paragraph.graphNode.node,
              toNode: verse.graphNode.node,
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
                fromNode: verse.graphNode.node,
                toNode: sentenceNode.node,
                props: {
                  order_verse: `${n + 1}`,
                },
              });

              relations.push(relationship);

              let charIndex = 1;
              let strongsWordIndex = 1;
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
                    order_sentence: `${strongsWordIndex}`,
                    char_index: `${m}`,
                  },
                });

                charIndex += marker.stringifiedContent.length;
                strongsWordIndex++;

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
  }

  async loadUSFMIntoDBByUrl(url: string) {
    const response = await this.httpService.axiosRef.get(url);

    this.loadUSFMIntoDB(response.data);
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
  return token === 's';
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
