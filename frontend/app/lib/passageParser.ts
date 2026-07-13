import { BIBLE_BOOKS, type BibleBook } from "./bibleBooks";
import { BIBLE_BOOK_ES } from "./spanishContent";

export type ParsedPassage = {
  bookNum: number;
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  displayRef: string;
  normalized: string;
  hasExplicitChapter: boolean;
};

export type PassageParseCase = {
  input: string;
  fallbackBookNum: number;
  expected: Pick<ParsedPassage, "bookNum" | "chapter" | "verseStart" | "verseEnd" | "displayRef">;
};

function normalizeBookLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getFallbackBook(fallbackBookNum: number): BibleBook {
  return BIBLE_BOOKS.find((b) => b.num === fallbackBookNum) ?? BIBLE_BOOKS[39];
}

function parseVersePart(value: string | undefined) {
  if (!value) return {};
  const [startRaw, endRaw] = value.replace(/\s+/g, "").split("-");
  const verseStart = Number(startRaw);
  const verseEnd = Number(endRaw);
  return {
    verseStart: Number.isFinite(verseStart) && verseStart > 0 ? verseStart : undefined,
    verseEnd: Number.isFinite(verseEnd) && verseEnd > 0 ? verseEnd : undefined,
  };
}

function getBookAliases(book: BibleBook): string[] {
  const common: Record<number, string[]> = {
    19: ["Psalm", "Psalms", "Ps", "Psa", "Salmo", "Salmos"],
    20: ["Prov", "Pr", "Proverb", "Proverbs", "Proverbio", "Proverbios"],
    22: ["Song", "Song of Songs", "Canticles", "Sng", "Cantares", "Cantar"],
    40: ["Matt", "Mt", "Mateo"],
    41: ["Mk", "Marcos"],
    42: ["Lk", "Lucas"],
    43: ["Jn", "Juan"],
    44: ["Acts", "Hechos"],
    45: ["Rom", "Romanos"],
    66: ["Rev", "Apocalipsis"],
  };

  const spanish = BIBLE_BOOK_ES[book.num];
  return [book.name, book.abbr, spanish, ...(common[book.num] ?? [])].filter(Boolean);
}

function buildBookCandidates() {
  return BIBLE_BOOKS
    .flatMap((book) =>
      getBookAliases(book).map((label) => ({
        book,
        label,
        key: normalizeBookLabel(label),
      }))
    )
    .sort((a, b) => b.key.length - a.key.length);
}

export function formatParsedPassage(parsed: {
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}) {
  const verse =
    parsed.verseStart !== undefined
      ? `:${parsed.verseStart}${parsed.verseEnd && parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ""}`
      : "";
  return `${parsed.bookName} ${parsed.chapter}${verse}`;
}

export function parsePassageInput(input: string, fallbackBookNum: number): ParsedPassage | null {
  const raw = input.trim().replace(/[–—]/g, "-").replace(/\s+/g, " ");
  if (!raw) return null;

  const fallbackBook = getFallbackBook(fallbackBookNum);
  const normalizedRaw = normalizeBookLabel(raw);
  const candidates = buildBookCandidates();

  let book = fallbackBook;
  let rest = raw;

  const matched = candidates.find(({ key }) => normalizedRaw === key || normalizedRaw.startsWith(`${key} `));
  if (matched) {
    book = matched.book;
    const originalPrefix = raw.match(new RegExp(`^\\s*${matched.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"))?.[0];
    rest = raw.slice(originalPrefix?.length ?? matched.label.length).trim();
  }

  const match = rest.match(/^(\d+)(?:(?::|\.)\s*(\d+(?:\s*-\s*\d+)?))?/);
  if (!match) {
    if (!matched) return null;
    const displayRef = book.name;
    return { bookNum: book.num, bookName: book.name, chapter: 1, displayRef, normalized: displayRef, hasExplicitChapter: false };
  }

  const chapter = clamp(Number(match[1]) || 1, 1, book.chapters);
  const { verseStart, verseEnd } = parseVersePart(match[2]);
  const displayRef = formatParsedPassage({ bookName: book.name, chapter, verseStart, verseEnd });

  return {
    bookNum: book.num,
    bookName: book.name,
    chapter,
    verseStart,
    verseEnd,
    displayRef,
    normalized: displayRef,
    hasExplicitChapter: true,
  };
}

export function parsePassageOrCurrent(input: string, current: Pick<ParsedPassage, "bookNum" | "bookName" | "chapter" | "verseStart" | "verseEnd">): ParsedPassage {
  const parsed = parsePassageInput(input, current.bookNum);
  if (parsed) return parsed;
  const displayRef = formatParsedPassage(current);
  return { ...current, displayRef, normalized: displayRef, hasExplicitChapter: true };
}

export const PASSAGE_PARSER_TEST_CASES: PassageParseCase[] = [
  { input: "1", fallbackBookNum: 20, expected: { bookNum: 20, chapter: 1, displayRef: "Proverbs 1" } },
  { input: "1:5", fallbackBookNum: 20, expected: { bookNum: 20, chapter: 1, verseStart: 5, displayRef: "Proverbs 1:5" } },
  { input: "Proverbs 4", fallbackBookNum: 40, expected: { bookNum: 20, chapter: 4, displayRef: "Proverbs 4" } },
  { input: "Prov 4:5", fallbackBookNum: 40, expected: { bookNum: 20, chapter: 4, verseStart: 5, displayRef: "Proverbs 4:5" } },
  { input: "1 John 2:1", fallbackBookNum: 40, expected: { bookNum: 62, chapter: 2, verseStart: 1, displayRef: "1 John 2:1" } },
  { input: "Proverbios 4", fallbackBookNum: 40, expected: { bookNum: 20, chapter: 4, displayRef: "Proverbs 4" } },
];

export function validatePassageParserExamples() {
  return PASSAGE_PARSER_TEST_CASES.map((item) => {
    const actual = parsePassageInput(item.input, item.fallbackBookNum);
    const pass = !!actual && Object.entries(item.expected).every(([key, value]) => actual[key as keyof ParsedPassage] === value);
    return { ...item, actual, pass };
  });
}
