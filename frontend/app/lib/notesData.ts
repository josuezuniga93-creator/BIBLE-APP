// ─── Sermon Notes Data Layer ──────────────────────────────────────────────────
// localStorage key: "tulip_notes_v1"
// Accent color for the Notes section: emerald green

import { syncKey } from "./cloudSync";
import { BIBLE_BOOKS } from "./bibleBooks";
import { formatParsedPassage, parsePassageInput } from "./passageParser";

export interface SermonNote {
  id: string;
  noteType?: "sermon" | "general"; // "sermon" = tied to a Bible book; "general" = freeform
  bookNum: number;       // matches BIBLE_BOOKS[].num
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  displayRef?: string;
  title: string;         // sermon title
  date: string;          // ISO date "YYYY-MM-DD"
  pastor?: string;
  church?: string;
  passage: string;       // e.g. "John 1:1-18"
  mainPoints: string[];  // bullet points
  notes: string;         // freeform notes text (markdown-friendly)
  tags: string[];
  scriptureRefs: string[]; // e.g. ["John 3:16", "Romans 8:28"]
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}

export const NOTES_STORAGE_KEY = "tulip_notes_v1";

export const PRESET_TAGS = [
  "Expository Preaching",
  "Sunday Service",
  "Prayer Meeting",
  "Bible Study",
  "Conference",
  "Personal Devotion",
  "Evening Service",
  "Topical",
] as const;

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export function loadNotes(): SermonNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SermonNote[]) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: SermonNote[]): void {
  if (typeof window === "undefined") return;
  try {
    const value = JSON.stringify(notes);
    localStorage.setItem(NOTES_STORAGE_KEY, value);
    syncKey(NOTES_STORAGE_KEY, value).catch(() => {});
  } catch {
    // Storage quota exceeded — fail silently
  }
}

// ─── Note Factory ─────────────────────────────────────────────────────────────

export function makeNote(partial: Partial<SermonNote> = {}): SermonNote {
  const now = new Date().toISOString();
  const note: SermonNote = {
    id: crypto.randomUUID(),
    noteType: "sermon",
    bookNum: 40,
    bookName: "Matthew",
    chapter: 1,
    verseStart: undefined,
    verseEnd: undefined,
    displayRef: "Matthew 1",
    title: "",
    date: now.slice(0, 10),
    pastor: "",
    church: "",
    passage: "",
    mainPoints: [""],
    notes: "",
    tags: [],
    scriptureRefs: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };

  if (note.noteType !== "general" && partial.displayRef === undefined && partial.passage === undefined) {
    const displayRef = formatParsedPassage(note);
    note.displayRef = displayRef;
    note.passage = displayRef;
  }

  return note;
}

export function getNoteDisplayRef(note: Pick<SermonNote, "bookName" | "chapter" | "verseStart" | "verseEnd" | "displayRef" | "passage">): string {
  return note.displayRef || note.passage || formatParsedPassage(note);
}

export function normalizeNotePassage(note: SermonNote): SermonNote {
  if (note.noteType === "general") return note;

  const input = note.passage?.trim() || note.displayRef?.trim() || "";
  const parsed = input ? parsePassageInput(input, note.bookNum) : null;

  if (!parsed) {
    const displayRef = formatParsedPassage(note);
    return { ...note, displayRef, passage: note.passage || displayRef };
  }

  if (!parsed.hasExplicitChapter) {
    const parsedBook = BIBLE_BOOKS.find((book) => book.num === parsed.bookNum);
    const chapter = Math.max(1, Math.min(parsedBook?.chapters ?? note.chapter ?? 1, note.chapter || 1));
    const displayRef = formatParsedPassage({
      bookName: parsed.bookName,
      chapter,
      verseStart: note.verseStart,
      verseEnd: note.verseEnd,
    });
    return {
      ...note,
      bookNum: parsed.bookNum,
      bookName: parsed.bookName,
      chapter,
      displayRef,
      passage: displayRef,
    };
  }

  return {
    ...note,
    bookNum: parsed.bookNum,
    bookName: parsed.bookName,
    chapter: parsed.chapter,
    verseStart: parsed.verseStart,
    verseEnd: parsed.verseEnd,
    displayRef: parsed.displayRef,
    passage: parsed.displayRef,
  };
}

// ─── Scripture Reference Auto-Detection ──────────────────────────────────────

/**
 * Scans text for scripture references like "John 3:16", "Romans 8:28-30",
 * "Ps 23", "1 Cor 13:4-7" and returns a deduplicated array of matches.
 */
export function detectScriptureRefs(text: string): string[] {
  const BOOKS =
    "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|" +
    "(?:[12]\\s+)?Samuel|(?:[12]\\s+)?Kings|(?:[12]\\s+)?Chronicles|" +
    "Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs?|Ecclesiastes|" +
    "Song(?:\\s+of\\s+Solomon)?|Isaiah|Jeremiah|Lamentations?|Ezekiel|" +
    "Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|" +
    "Zephaniah|Haggai|Zechariah|Malachi|" +
    "Matthew|Mark|Luke|John|Acts|Romans?|" +
    "(?:[12]\\s+)?Corinthians?|Galatians?|Ephesians?|Philippians?|" +
    "Colossians?|(?:[12]\\s+)?Thessalonians?|(?:[12]\\s+)?Timothy|" +
    "Titus|Philemon|Hebrews?|James|(?:[12]\\s+)?Peter|" +
    "(?:[123]\\s+)?John|Jude|Revelation|" +
    // Abbreviations
    "Gen|Exod?|Lev|Num|Deut?|Josh?|Judg?|[12]\\s*Sam?|[12]\\s*Kgs?|" +
    "[12]\\s*Chr?|Ezr|Neh|Est|Psa?|Prov?|Eccl?|Isa|Jer|Lam|Ezek?|Dan|" +
    "Hos|Joel?|Amos?|Oba?|Jona?|Mic|Nah|Hab|Zeph?|Hag|Zech?|Mal|" +
    "Matt?|Mk|Lk|Jn|Act|Rom|[12]\\s*Cor?|Gal|Eph|Phil?|Col|" +
    "[12]\\s*Thes?s?|[12]\\s*Tim?|Tit|Phlm?|Heb|Jas|[12]\\s*Pet?|" +
    "[123]\\s*Jn|Jude?|Rev";

  const pattern = new RegExp(
    `\\b(?:${BOOKS})\\s+\\d+(?::\\d+(?:\\s*[-–]\\s*\\d+)?)?`,
    "gi"
  );

  const found = text.match(pattern) ?? [];
  return [...new Set(found.map((s) => s.trim()))];
}
