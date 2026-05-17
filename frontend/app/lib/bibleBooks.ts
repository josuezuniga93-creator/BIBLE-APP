// ─── Bible Books Data ─────────────────────────────────────────────────────────
// Shared by the Bible Tracker and Bible Reading Plans features.

export interface BibleBook {
  num: number;
  name: string;
  abbr: string;
  chapters: number;
  testament: "OT" | "NT";
  group: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ── Pentateuch ────────────────────────────────────────────────────────────
  { num:  1, name: "Genesis",          abbr: "Gen", chapters:  50, testament: "OT", group: "Pentateuch" },
  { num:  2, name: "Exodus",           abbr: "Exo", chapters:  40, testament: "OT", group: "Pentateuch" },
  { num:  3, name: "Leviticus",        abbr: "Lev", chapters:  27, testament: "OT", group: "Pentateuch" },
  { num:  4, name: "Numbers",          abbr: "Num", chapters:  36, testament: "OT", group: "Pentateuch" },
  { num:  5, name: "Deuteronomy",      abbr: "Deu", chapters:  34, testament: "OT", group: "Pentateuch" },
  // ── Historical ────────────────────────────────────────────────────────────
  { num:  6, name: "Joshua",           abbr: "Jos", chapters:  24, testament: "OT", group: "Historical" },
  { num:  7, name: "Judges",           abbr: "Jdg", chapters:  21, testament: "OT", group: "Historical" },
  { num:  8, name: "Ruth",             abbr: "Rut", chapters:   4, testament: "OT", group: "Historical" },
  { num:  9, name: "1 Samuel",         abbr: "1Sa", chapters:  31, testament: "OT", group: "Historical" },
  { num: 10, name: "2 Samuel",         abbr: "2Sa", chapters:  24, testament: "OT", group: "Historical" },
  { num: 11, name: "1 Kings",          abbr: "1Ki", chapters:  22, testament: "OT", group: "Historical" },
  { num: 12, name: "2 Kings",          abbr: "2Ki", chapters:  25, testament: "OT", group: "Historical" },
  { num: 13, name: "1 Chronicles",     abbr: "1Ch", chapters:  29, testament: "OT", group: "Historical" },
  { num: 14, name: "2 Chronicles",     abbr: "2Ch", chapters:  36, testament: "OT", group: "Historical" },
  { num: 15, name: "Ezra",             abbr: "Ezr", chapters:  10, testament: "OT", group: "Historical" },
  { num: 16, name: "Nehemiah",         abbr: "Neh", chapters:  13, testament: "OT", group: "Historical" },
  { num: 17, name: "Esther",           abbr: "Est", chapters:  10, testament: "OT", group: "Historical" },
  // ── Poetic ───────────────────────────────────────────────────────────────
  { num: 18, name: "Job",              abbr: "Job", chapters:  42, testament: "OT", group: "Poetic" },
  { num: 19, name: "Psalms",           abbr: "Psa", chapters: 150, testament: "OT", group: "Poetic" },
  { num: 20, name: "Proverbs",         abbr: "Pro", chapters:  31, testament: "OT", group: "Poetic" },
  { num: 21, name: "Ecclesiastes",     abbr: "Ecc", chapters:  12, testament: "OT", group: "Poetic" },
  { num: 22, name: "Song of Solomon",  abbr: "Sng", chapters:   8, testament: "OT", group: "Poetic" },
  // ── Major Prophets ───────────────────────────────────────────────────────
  { num: 23, name: "Isaiah",           abbr: "Isa", chapters:  66, testament: "OT", group: "Major Prophets" },
  { num: 24, name: "Jeremiah",         abbr: "Jer", chapters:  52, testament: "OT", group: "Major Prophets" },
  { num: 25, name: "Lamentations",     abbr: "Lam", chapters:   5, testament: "OT", group: "Major Prophets" },
  { num: 26, name: "Ezekiel",          abbr: "Eze", chapters:  48, testament: "OT", group: "Major Prophets" },
  { num: 27, name: "Daniel",           abbr: "Dan", chapters:  12, testament: "OT", group: "Major Prophets" },
  // ── Minor Prophets ───────────────────────────────────────────────────────
  { num: 28, name: "Hosea",            abbr: "Hos", chapters:  14, testament: "OT", group: "Minor Prophets" },
  { num: 29, name: "Joel",             abbr: "Joe", chapters:   3, testament: "OT", group: "Minor Prophets" },
  { num: 30, name: "Amos",             abbr: "Amo", chapters:   9, testament: "OT", group: "Minor Prophets" },
  { num: 31, name: "Obadiah",          abbr: "Oba", chapters:   1, testament: "OT", group: "Minor Prophets" },
  { num: 32, name: "Jonah",            abbr: "Jon", chapters:   4, testament: "OT", group: "Minor Prophets" },
  { num: 33, name: "Micah",            abbr: "Mic", chapters:   7, testament: "OT", group: "Minor Prophets" },
  { num: 34, name: "Nahum",            abbr: "Nah", chapters:   3, testament: "OT", group: "Minor Prophets" },
  { num: 35, name: "Habakkuk",         abbr: "Hab", chapters:   3, testament: "OT", group: "Minor Prophets" },
  { num: 36, name: "Zephaniah",        abbr: "Zep", chapters:   3, testament: "OT", group: "Minor Prophets" },
  { num: 37, name: "Haggai",           abbr: "Hag", chapters:   2, testament: "OT", group: "Minor Prophets" },
  { num: 38, name: "Zechariah",        abbr: "Zec", chapters:  14, testament: "OT", group: "Minor Prophets" },
  { num: 39, name: "Malachi",          abbr: "Mal", chapters:   4, testament: "OT", group: "Minor Prophets" },
  // ── Gospels ───────────────────────────────────────────────────────────────
  { num: 40, name: "Matthew",          abbr: "Mat", chapters:  28, testament: "NT", group: "Gospels" },
  { num: 41, name: "Mark",             abbr: "Mar", chapters:  16, testament: "NT", group: "Gospels" },
  { num: 42, name: "Luke",             abbr: "Luk", chapters:  24, testament: "NT", group: "Gospels" },
  { num: 43, name: "John",             abbr: "Joh", chapters:  21, testament: "NT", group: "Gospels" },
  // ── History ───────────────────────────────────────────────────────────────
  { num: 44, name: "Acts",             abbr: "Act", chapters:  28, testament: "NT", group: "History" },
  // ── Pauline Epistles ──────────────────────────────────────────────────────
  { num: 45, name: "Romans",           abbr: "Rom", chapters:  16, testament: "NT", group: "Pauline Epistles" },
  { num: 46, name: "1 Corinthians",    abbr: "1Co", chapters:  16, testament: "NT", group: "Pauline Epistles" },
  { num: 47, name: "2 Corinthians",    abbr: "2Co", chapters:  13, testament: "NT", group: "Pauline Epistles" },
  { num: 48, name: "Galatians",        abbr: "Gal", chapters:   6, testament: "NT", group: "Pauline Epistles" },
  { num: 49, name: "Ephesians",        abbr: "Eph", chapters:   6, testament: "NT", group: "Pauline Epistles" },
  { num: 50, name: "Philippians",      abbr: "Php", chapters:   4, testament: "NT", group: "Pauline Epistles" },
  { num: 51, name: "Colossians",       abbr: "Col", chapters:   4, testament: "NT", group: "Pauline Epistles" },
  { num: 52, name: "1 Thessalonians",  abbr: "1Th", chapters:   5, testament: "NT", group: "Pauline Epistles" },
  { num: 53, name: "2 Thessalonians",  abbr: "2Th", chapters:   3, testament: "NT", group: "Pauline Epistles" },
  { num: 54, name: "1 Timothy",        abbr: "1Ti", chapters:   6, testament: "NT", group: "Pauline Epistles" },
  { num: 55, name: "2 Timothy",        abbr: "2Ti", chapters:   4, testament: "NT", group: "Pauline Epistles" },
  { num: 56, name: "Titus",            abbr: "Tit", chapters:   3, testament: "NT", group: "Pauline Epistles" },
  { num: 57, name: "Philemon",         abbr: "Phm", chapters:   1, testament: "NT", group: "Pauline Epistles" },
  // ── General Epistles ─────────────────────────────────────────────────────
  { num: 58, name: "Hebrews",          abbr: "Heb", chapters:  13, testament: "NT", group: "General Epistles" },
  { num: 59, name: "James",            abbr: "Jas", chapters:   5, testament: "NT", group: "General Epistles" },
  { num: 60, name: "1 Peter",          abbr: "1Pe", chapters:   5, testament: "NT", group: "General Epistles" },
  { num: 61, name: "2 Peter",          abbr: "2Pe", chapters:   3, testament: "NT", group: "General Epistles" },
  { num: 62, name: "1 John",           abbr: "1Jo", chapters:   5, testament: "NT", group: "General Epistles" },
  { num: 63, name: "2 John",           abbr: "2Jo", chapters:   1, testament: "NT", group: "General Epistles" },
  { num: 64, name: "3 John",           abbr: "3Jo", chapters:   1, testament: "NT", group: "General Epistles" },
  { num: 65, name: "Jude",             abbr: "Jud", chapters:   1, testament: "NT", group: "General Epistles" },
  // ── Prophecy ─────────────────────────────────────────────────────────────
  { num: 66, name: "Revelation",       abbr: "Rev", chapters:  22, testament: "NT", group: "Prophecy" },
];

// ─── Totals ───────────────────────────────────────────────────────────────────

export const OT_BOOKS  = BIBLE_BOOKS.filter((b) => b.testament === "OT");
export const NT_BOOKS  = BIBLE_BOOKS.filter((b) => b.testament === "NT");

export const OT_CHAPTERS = OT_BOOKS.reduce((s, b) => s + b.chapters, 0);   // 929
export const NT_CHAPTERS = NT_BOOKS.reduce((s, b) => s + b.chapters, 0);   // 260
export const TOTAL_CHAPTERS = OT_CHAPTERS + NT_CHAPTERS;                    // 1189

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getBookByNum(num: number): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.num === num);
}

export function getBookGroups(testament: "OT" | "NT" | "ALL"): string[] {
  const books = testament === "ALL" ? BIBLE_BOOKS : BIBLE_BOOKS.filter((b) => b.testament === testament);
  return [...new Set(books.map((b) => b.group))];
}

export function getBooksInGroup(group: string): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.group === group);
}

// Build a flat ordered list of all { bookNum, chapter } pairs (for plan generation)
export function buildChapterList(): Array<{ bookNum: number; chapter: number; bookName: string }> {
  const list: Array<{ bookNum: number; chapter: number; bookName: string }> = [];
  for (const book of BIBLE_BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      list.push({ bookNum: book.num, chapter: ch, bookName: book.name });
    }
  }
  return list;
}
