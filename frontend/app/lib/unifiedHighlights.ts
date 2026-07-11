"use client";

import { BIBLE_BOOKS } from "./bibleBooks";
import { STATIC_BOOK_CATALOG } from "./bookCatalog";
import { syncKey } from "./cloudSync";
import { LEARN_DOCUMENTS } from "./learnData";

export type UnifiedHighlightSource =
  | "scripture"
  | "study-tools"
  | "free-books"
  | "historical-documents";

export type UnifiedHighlight = {
  id: string;
  storageKey: string;
  source: UnifiedHighlightSource;
  sourceLabel: string;
  title: string;
  subtitle?: string;
  reference: string;
  text: string;
  color?: string;
  createdAt: number;
  openHref: string;
  groupKey: string;
  groupLabel: string;
  meta?: Record<string, string | number | boolean | undefined>;
};

type StorageRow = {
  storage_key: string;
  value: string;
  updated_at?: string;
};

export type UnifiedReaderHighlight = {
  id: string;
  text: string;
  color?: string;
  createdAt?: number;
  context?: string;
  title?: string;
  reference?: string;
};

export type UnifiedHenryHighlight = {
  id: string;
  text: string;
  color?: string;
  createdAt?: number;
  reference: string;
  sectionTitle: string;
  book: number;
  bookName: string;
  chapter: number;
  verse?: number;
  source: string;
};

const HENRY_HIGHLIGHTS_KEY = "tulip-matthew-henry-highlights";
export const UNIFIED_HIGHLIGHTS_KEY = "tulip-unified-highlights-v1";

const BOOK_BY_NUM = new Map(BIBLE_BOOKS.map((book) => [book.num, book]));
const BOOK_TITLE_BY_SLUG = new Map(STATIC_BOOK_CATALOG.map((book) => [book.slug, book.title]));

const COLOR_DOT: Record<string, string> = {
  yellow: "#facc15",
  gold: "#c9a961",
  blue: "#60a5fa",
  green: "#4ade80",
  pink: "#f472b6",
  purple: "#a78bfa",
  red: "#f87171",
  orange: "#fb923c",
  rose: "#f472b6",
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function dedupeHighlights(highlights: UnifiedHighlight[]) {
  const seen = new Set<string>();
  const result: UnifiedHighlight[] = [];

  for (const highlight of highlights) {
    const fingerprint = [
      highlight.id,
      highlight.source,
      highlight.openHref,
      highlight.reference,
      normalizeForDedupe(highlight.text).slice(0, 180),
    ].join("|");
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    result.push(highlight);
  }

  return result;
}

function normalizeForDedupe(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function writeUnifiedMirror(highlights: UnifiedHighlight[]) {
  if (typeof window === "undefined") return;
  const value = JSON.stringify(highlights);
  localStorage.setItem(UNIFIED_HIGHLIGHTS_KEY, value);
  syncKey(UNIFIED_HIGHLIGHTS_KEY, value).catch(() => {});
}

function readUnifiedMirror(rows: Map<string, StorageRow>): UnifiedHighlight[] {
  const row = rows.get(UNIFIED_HIGHLIGHTS_KEY);
  return parseJson<UnifiedHighlight[]>(row?.value, []).filter((highlight) =>
    Boolean(highlight?.id && highlight?.source && highlight?.text && highlight?.openHref)
  );
}

export function mirrorUnifiedHighlight(highlight: UnifiedHighlight) {
  if (typeof window === "undefined") return;
  const current = parseJson<UnifiedHighlight[]>(localStorage.getItem(UNIFIED_HIGHLIGHTS_KEY), []);
  writeUnifiedMirror([highlight, ...current.filter((item) => item.id !== highlight.id)]);
}

export function removeMirroredUnifiedHighlight(id: string) {
  if (typeof window === "undefined") return;
  const current = parseJson<UnifiedHighlight[]>(localStorage.getItem(UNIFIED_HIGHLIGHTS_KEY), []);
  const next = current.filter((highlight) => highlight.id !== id);
  writeUnifiedMirror(next);
}

function normalizeColorName(value?: string) {
  return value ?? "gold";
}

function colorValue(value?: string) {
  return COLOR_DOT[normalizeColorName(value)] ?? COLOR_DOT.gold;
}

export function mirrorStudyToolHighlight(highlight: UnifiedHenryHighlight) {
  mirrorUnifiedHighlight({
    id: `study-tools-${highlight.id}`,
    storageKey: HENRY_HIGHLIGHTS_KEY,
    source: "study-tools",
    sourceLabel: "Study Tools",
    title: highlight.sectionTitle,
    subtitle: highlight.reference,
    reference: highlight.reference,
    text: highlight.text,
    color: colorValue(highlight.color),
    createdAt: highlight.createdAt ?? Date.now(),
    openHref: `/study-tools?highlight=${encodeURIComponent(highlight.id)}`,
    groupKey: `study-${highlight.book}-${highlight.chapter}`,
    groupLabel: `${highlight.bookName} ${highlight.chapter}`,
    meta: {
      rawId: highlight.id,
      colorName: normalizeColorName(highlight.color),
      book: highlight.book,
      bookName: highlight.bookName,
      chapter: highlight.chapter,
      verse: highlight.verse,
      source: highlight.source,
      sectionTitle: highlight.sectionTitle,
    },
  });
}

export function removeMirroredStudyToolHighlight(id: string) {
  removeMirroredUnifiedHighlight(`study-tools-${id}`);
}

export function mirrorReaderHighlight(context: string, highlight: UnifiedReaderHighlight) {
  if (context.startsWith("book-")) {
    const match = context.match(/^book-(.+)-(\d+)$/);
    if (!match) return;
    const slug = match[1];
    const chapter = Number(match[2]);
    const bookTitle = BOOK_TITLE_BY_SLUG.get(slug) ?? slug.replace(/-/g, " ");
    mirrorUnifiedHighlight({
      id: `free-books-${highlight.id}`,
      storageKey: storageKeyForReaderContext(context),
      source: "free-books",
      sourceLabel: "Free Books",
      title: bookTitle,
      subtitle: highlight.title,
      reference: highlight.reference ?? `${bookTitle} ${chapter}`,
      text: highlight.text,
      color: colorValue(highlight.color),
      createdAt: highlight.createdAt ?? Date.now(),
      openHref: `/library/${encodeURIComponent(slug)}?chapter=${chapter}&hlid=${encodeURIComponent(highlight.id)}`,
      groupKey: `book-${slug}`,
      groupLabel: bookTitle,
      meta: {
        rawId: highlight.id,
        colorName: normalizeColorName(highlight.color),
        context,
        slug,
        chapter,
        title: highlight.title,
      },
    });
    return;
  }

  if (context.startsWith("learn-")) {
    const doc = LEARN_DOCUMENTS.find((candidate) => context.startsWith(`learn-${candidate.id}-`));
    if (!doc) return;
    const sectionId = context.slice(`learn-${doc.id}-`.length);
    const section = doc.sections.find((candidate) => candidate.id === sectionId);
    mirrorUnifiedHighlight({
      id: `historical-documents-${highlight.id}`,
      storageKey: storageKeyForReaderContext(context),
      source: "historical-documents",
      sourceLabel: "Historical Docs",
      title: doc.title,
      subtitle: section?.title ?? highlight.title,
      reference: highlight.reference ?? doc.title,
      text: highlight.text,
      color: colorValue(highlight.color),
      createdAt: highlight.createdAt ?? Date.now(),
      openHref: `/learn?doc=${encodeURIComponent(doc.id)}&section=${encodeURIComponent(sectionId)}&hlid=${encodeURIComponent(highlight.id)}`,
      groupKey: `learn-${doc.id}`,
      groupLabel: doc.title,
      meta: {
        rawId: highlight.id,
        colorName: normalizeColorName(highlight.color),
        context,
        docId: doc.id,
        sectionId,
        title: section?.title ?? highlight.title,
      },
    });
  }
}

export function removeMirroredReaderHighlight(context: string, id: string) {
  if (context.startsWith("book-")) {
    removeMirroredUnifiedHighlight(`free-books-${id}`);
  } else if (context.startsWith("learn-")) {
    removeMirroredUnifiedHighlight(`historical-documents-${id}`);
  }
}

export function mirrorScriptureHighlight(input: {
  bookName: string;
  bookNum: number;
  chapter: number;
  verseNum: number;
  verseText: string;
  color: string;
}) {
  const title = `${input.bookName} ${input.chapter}:${input.verseNum}`;
  mirrorUnifiedHighlight({
    id: `scripture-${input.bookNum}-${input.chapter}-${input.verseNum}`,
    storageKey: `ryc-vcolor-${input.bookNum}-${input.chapter}`,
    source: "scripture",
    sourceLabel: "Scripture",
    title,
    subtitle: "Bible highlight",
    reference: title,
    text: input.verseText,
    color: colorValue(input.color),
    createdAt: Date.now(),
    openHref: `/lexicon?book=${encodeURIComponent(input.bookName)}&chapter=${input.chapter}&select=${input.verseNum}`,
    groupKey: `scripture-${input.bookNum}-${input.chapter}`,
    groupLabel: `${input.bookName} ${input.chapter}`,
    meta: {
      colorName: normalizeColorName(input.color),
      bookNum: input.bookNum,
      bookName: input.bookName,
      chapter: input.chapter,
      verseNum: input.verseNum,
    },
  });
}

export function removeMirroredScriptureHighlight(bookNum: number, chapter: number, verseNum: number) {
  removeMirroredUnifiedHighlight(`scripture-${bookNum}-${chapter}-${verseNum}`);
}

function rawIdFromUnified(highlight: UnifiedHighlight, prefix: string) {
  const raw = highlight.meta?.rawId;
  if (typeof raw === "string" && raw) return raw;
  return highlight.id.replace(new RegExp(`^${prefix}-`), "");
}

function readerContextFromUnified(highlight: UnifiedHighlight) {
  const context = highlight.meta?.context;
  if (typeof context === "string" && context) return context;
  if (highlight.source === "free-books") {
    const slug = highlight.meta?.slug;
    const chapter = highlight.meta?.chapter;
    if (typeof slug === "string" && typeof chapter === "number") return `book-${slug}-${chapter}`;
    const match = highlight.openHref.match(/\/library\/([^?]+)\?chapter=(\d+)/);
    if (match) return `book-${decodeURIComponent(match[1])}-${Number(match[2])}`;
  }
  if (highlight.source === "historical-documents") {
    const docId = highlight.meta?.docId;
    const sectionId = highlight.meta?.sectionId;
    if (typeof docId === "string" && typeof sectionId === "string") return `learn-${docId}-${sectionId}`;
    const params = highlight.openHref.split("?")[1];
    if (params) {
      const search = new URLSearchParams(params);
      const doc = search.get("doc");
      const section = search.get("section");
      if (doc && section) return `learn-${doc}-${section}`;
    }
  }
  return "";
}

function toReaderHighlight(highlight: UnifiedHighlight): UnifiedReaderHighlight {
  const prefix = highlight.source === "free-books" ? "free-books" : "historical-documents";
  return {
    id: rawIdFromUnified(highlight, prefix),
    text: highlight.text,
    color: typeof highlight.meta?.colorName === "string" ? highlight.meta.colorName : "gold",
    createdAt: highlight.createdAt,
    context: readerContextFromUnified(highlight),
    title: typeof highlight.meta?.title === "string" ? highlight.meta.title : highlight.subtitle,
    reference: highlight.reference,
  };
}

function toHenryHighlight(highlight: UnifiedHighlight): UnifiedHenryHighlight {
  const bookFromGroup = Number(highlight.groupKey.match(/^study-(\d+)-/)?.[1]);
  const chapterFromGroup = Number(highlight.groupKey.match(/^study-\d+-(\d+)/)?.[1]);
  const labelMatch = highlight.groupLabel.match(/^(.*)\s+(\d+)$/);
  return {
    id: rawIdFromUnified(highlight, "study-tools"),
    text: highlight.text,
    color: typeof highlight.meta?.colorName === "string" ? highlight.meta.colorName : "gold",
    createdAt: highlight.createdAt,
    reference: highlight.reference,
    sectionTitle: typeof highlight.meta?.sectionTitle === "string" ? highlight.meta.sectionTitle : highlight.title,
    book: typeof highlight.meta?.book === "number" ? highlight.meta.book : (Number.isFinite(bookFromGroup) ? bookFromGroup : 0),
    bookName: typeof highlight.meta?.bookName === "string" ? highlight.meta.bookName : (labelMatch?.[1] ?? highlight.groupLabel),
    chapter: typeof highlight.meta?.chapter === "number" ? highlight.meta.chapter : (Number.isFinite(chapterFromGroup) ? chapterFromGroup : Number(labelMatch?.[2] ?? 1)),
    verse: typeof highlight.meta?.verse === "number" ? highlight.meta.verse : undefined,
    source: typeof highlight.meta?.source === "string" ? highlight.meta.source : "complete",
  };
}

export function getReaderHighlights(context: string): UnifiedReaderHighlight[] {
  if (typeof window === "undefined") return [];
  return collectUnifiedHighlights()
    .filter((highlight) =>
      (highlight.source === "free-books" || highlight.source === "historical-documents") &&
      readerContextFromUnified(highlight) === context
    )
    .map(toReaderHighlight)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function saveReaderHighlight(context: string, highlight: UnifiedReaderHighlight) {
  mirrorReaderHighlight(context, highlight);
}

export function deleteReaderHighlight(context: string, id: string) {
  removeMirroredReaderHighlight(context, id);
  const legacyKey = storageKeyForReaderContext(context);
  const legacy = parseJson<UnifiedReaderHighlight[]>(localStorage.getItem(legacyKey), []);
  const next = legacy.filter((highlight) => highlight.id !== id);
  if (next.length === 0) {
    localStorage.removeItem(legacyKey);
    syncKey(legacyKey, null).catch(() => {});
  } else {
    const value = JSON.stringify(next);
    localStorage.setItem(legacyKey, value);
    syncKey(legacyKey, value).catch(() => {});
  }
}

export function getStudyToolHighlights(): UnifiedHenryHighlight[] {
  if (typeof window === "undefined") return [];
  return collectUnifiedHighlights()
    .filter((highlight) => highlight.source === "study-tools")
    .map(toHenryHighlight)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function saveStudyToolHighlight(highlight: UnifiedHenryHighlight) {
  mirrorStudyToolHighlight(highlight);
}

export function deleteStudyToolHighlight(id: string) {
  removeMirroredStudyToolHighlight(id);
  const legacy = parseJson<UnifiedHenryHighlight[]>(localStorage.getItem(HENRY_HIGHLIGHTS_KEY), []);
  const value = JSON.stringify(legacy.filter((highlight) => highlight.id !== id));
  localStorage.setItem(HENRY_HIGHLIGHTS_KEY, value);
  syncKey(HENRY_HIGHLIGHTS_KEY, value).catch(() => {});
}

export function getScriptureVerseColors(bookNum: number, chapter: number): Record<number, string> {
  if (typeof window === "undefined") return {};
  const result: Record<number, string> = {};
  collectUnifiedHighlights()
    .filter((highlight) => highlight.source === "scripture")
    .forEach((highlight) => {
      const meta = highlight.meta ?? {};
      const legacyMatch = highlight.id.match(/^scripture-(\d+)-(\d+)-(\d+)$/);
      const itemBook = typeof meta.bookNum === "number" ? meta.bookNum : Number(legacyMatch?.[1]);
      const itemChapter = typeof meta.chapter === "number" ? meta.chapter : Number(legacyMatch?.[2]);
      const itemVerse = typeof meta.verseNum === "number" ? meta.verseNum : Number(legacyMatch?.[3]);
      if (itemBook === bookNum && itemChapter === chapter && Number.isFinite(itemVerse)) {
        result[itemVerse] = typeof meta.colorName === "string" ? meta.colorName : "gold";
      }
    });
  return result;
}

export function deleteUnifiedHighlight(highlight: UnifiedHighlight) {
  if (typeof window === "undefined") return;
  removeMirroredUnifiedHighlight(highlight.id);

  if (highlight.source === "scripture") {
    const match = highlight.id.match(/^scripture-(\d+)-(\d+)-(\d+)$/);
    if (!match) return;
    const bookNum = Number(match[1]);
    const chapter = Number(match[2]);
    const verse = Number(match[3]);
    const book = BOOK_BY_NUM.get(bookNum);
    if (!book) return;

    const colorKey = `ryc-vcolor-${bookNum}-${chapter}`;
    const colors = parseJson<Record<string, string>>(localStorage.getItem(colorKey), {});
    delete colors[String(verse)];
    if (Object.keys(colors).length === 0) {
      localStorage.removeItem(colorKey);
      syncKey(colorKey, null).catch(() => {});
    } else {
      const value = JSON.stringify(colors);
      localStorage.setItem(colorKey, value);
      syncKey(colorKey, value).catch(() => {});
    }

    const mirrorKey = bibleMirrorKey(book.name, chapter);
    const mirror = parseJson<Array<{ id: string }>>(localStorage.getItem(mirrorKey), []);
    const nextMirror = mirror.filter((item) => item.id !== `bible-${bookNum}-${chapter}-${verse}`);
    if (nextMirror.length === 0) {
      localStorage.removeItem(mirrorKey);
      syncKey(mirrorKey, null).catch(() => {});
    } else {
      const value = JSON.stringify(nextMirror);
      localStorage.setItem(mirrorKey, value);
      syncKey(mirrorKey, value).catch(() => {});
    }
    return;
  }

  if (highlight.source === "study-tools") {
    const id = highlight.id.replace(/^study-tools-/, "");
    const highlights = parseJson<UnifiedHenryHighlight[]>(localStorage.getItem(HENRY_HIGHLIGHTS_KEY), []);
    const next = highlights.filter((item) => item.id !== id);
    const value = JSON.stringify(next);
    localStorage.setItem(HENRY_HIGHLIGHTS_KEY, value);
    syncKey(HENRY_HIGHLIGHTS_KEY, value).catch(() => {});
    return;
  }

  if (highlight.source === "free-books" || highlight.source === "historical-documents") {
    const id = highlight.id.replace(/^(free-books|historical-documents)-/, "");
    const highlights = parseJson<UnifiedReaderHighlight[]>(localStorage.getItem(highlight.storageKey), []);
    const next = highlights.filter((item) => item.id !== id);
    if (next.length === 0) {
      localStorage.removeItem(highlight.storageKey);
      syncKey(highlight.storageKey, null).catch(() => {});
    } else {
      const value = JSON.stringify(next);
      localStorage.setItem(highlight.storageKey, value);
      syncKey(highlight.storageKey, value).catch(() => {});
    }
  }
}

function storageKeyForReaderContext(context: string) {
  return `tulip-reader-highlights:${context}`;
}

function rowTime(row?: StorageRow): number {
  if (!row?.updated_at) return Date.now();
  const parsed = new Date(row.updated_at).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function bibleMirrorKey(bookName: string, chapter: number) {
  return `axiom-hl-bible-${bookName.toLowerCase().replace(/\s+/g, "-")}-${chapter}`;
}

function readStorageRows(): StorageRow[] {
  if (typeof window === "undefined") return [];
  const rows: StorageRow[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const storage_key = localStorage.key(i);
      if (!storage_key) continue;
      const value = localStorage.getItem(storage_key);
      if (value === null) continue;
      rows.push({ storage_key, value, updated_at: new Date().toISOString() });
    }
  } catch {
    return [];
  }
  return rows;
}

function mergeRows(rows?: StorageRow[]) {
  const map = new Map<string, StorageRow>();
  for (const row of rows ?? []) map.set(row.storage_key, row);
  for (const row of readStorageRows()) map.set(row.storage_key, row);
  return map;
}

function parseScriptureHighlights(rows: Map<string, StorageRow>): UnifiedHighlight[] {
  const result: UnifiedHighlight[] = [];

  for (const row of rows.values()) {
    if (!row.storage_key.startsWith("ryc-vcolor-")) continue;
    const parts = row.storage_key.split("-");
    const bookNum = Number(parts[2]);
    const chapter = Number(parts[3]);
    const book = BOOK_BY_NUM.get(bookNum);
    if (!book || !Number.isFinite(chapter)) continue;

    const colors = parseJson<Record<string, string>>(row.value, {});
    const mirror = parseJson<Array<{ id: string; text: string; color?: string; createdAt?: number }>>(
      rows.get(bibleMirrorKey(book.name, chapter))?.value,
      []
    );
    const mirrorById = new Map(mirror.map((item) => [item.id, item]));

    for (const [verseKey, color] of Object.entries(colors)) {
      const verse = Number(verseKey);
      if (!Number.isFinite(verse)) continue;
      const mirrorItem = mirrorById.get(`bible-${bookNum}-${chapter}-${verse}`);
      const title = `${book.name} ${chapter}:${verse}`;
      result.push({
        id: `scripture-${bookNum}-${chapter}-${verse}`,
        storageKey: row.storage_key,
        source: "scripture",
        sourceLabel: "Scripture",
        title,
        subtitle: "Bible highlight",
        reference: title,
        text: mirrorItem?.text ?? `Verse ${verse}`,
        color: COLOR_DOT[color] ?? COLOR_DOT.gold,
        createdAt: mirrorItem?.createdAt ?? rowTime(row),
        openHref: `/lexicon?book=${encodeURIComponent(book.name)}&chapter=${chapter}&select=${verse}`,
        groupKey: `scripture-${bookNum}-${chapter}`,
        groupLabel: `${book.name} ${chapter}`,
      });
    }
  }

  return result;
}

function parseStudyToolHighlights(rows: Map<string, StorageRow>): UnifiedHighlight[] {
  const row = rows.get(HENRY_HIGHLIGHTS_KEY);
  const highlights = parseJson<UnifiedHenryHighlight[]>(row?.value, []);

  return highlights.map((highlight) => ({
    id: `study-tools-${highlight.id}`,
    storageKey: HENRY_HIGHLIGHTS_KEY,
    source: "study-tools" as const,
    sourceLabel: "Study Tools",
    title: highlight.sectionTitle,
    subtitle: highlight.reference,
    reference: highlight.reference,
    text: highlight.text,
    color: COLOR_DOT[highlight.color ?? "gold"] ?? COLOR_DOT.gold,
    createdAt: highlight.createdAt ?? rowTime(row),
    openHref: `/study-tools?highlight=${encodeURIComponent(highlight.id)}`,
    groupKey: `study-${highlight.book}-${highlight.chapter}`,
    groupLabel: `${highlight.bookName} ${highlight.chapter}`,
  }));
}

function parseBookHighlights(rows: Map<string, StorageRow>): UnifiedHighlight[] {
  const result: UnifiedHighlight[] = [];

  for (const row of rows.values()) {
    if (!row.storage_key.startsWith("tulip-reader-highlights:book-")) continue;
    const context = row.storage_key.slice("tulip-reader-highlights:".length);
    const match = context.match(/^book-(.+)-(\d+)$/);
    if (!match) continue;
    const slug = match[1];
    const chapter = Number(match[2]);
    const bookTitle = BOOK_TITLE_BY_SLUG.get(slug) ?? slug.replace(/-/g, " ");
    const highlights = parseJson<UnifiedReaderHighlight[]>(row.value, []);

    for (const highlight of highlights) {
      result.push({
        id: `free-books-${highlight.id}`,
        storageKey: row.storage_key,
        source: "free-books",
        sourceLabel: "Free Books",
        title: bookTitle,
        subtitle: highlight.title,
        reference: highlight.reference ?? `${bookTitle} ${chapter}`,
        text: highlight.text,
        color: COLOR_DOT[highlight.color ?? "gold"] ?? COLOR_DOT.gold,
        createdAt: highlight.createdAt ?? rowTime(row),
        openHref: `/library/${encodeURIComponent(slug)}?chapter=${chapter}&hlid=${encodeURIComponent(highlight.id)}`,
        groupKey: `book-${slug}`,
        groupLabel: bookTitle,
      });
    }
  }

  return result;
}

function parseHistoricalHighlights(rows: Map<string, StorageRow>): UnifiedHighlight[] {
  const result: UnifiedHighlight[] = [];

  for (const row of rows.values()) {
    if (!row.storage_key.startsWith("tulip-reader-highlights:learn-")) continue;
    const context = row.storage_key.slice("tulip-reader-highlights:".length);
    const doc = LEARN_DOCUMENTS.find((candidate) => context.startsWith(`learn-${candidate.id}-`));
    if (!doc) continue;
    const sectionId = context.slice(`learn-${doc.id}-`.length);
    const section = doc.sections.find((candidate) => candidate.id === sectionId);
    const highlights = parseJson<UnifiedReaderHighlight[]>(row.value, []);

    for (const highlight of highlights) {
      result.push({
        id: `historical-documents-${highlight.id}`,
        storageKey: row.storage_key,
        source: "historical-documents",
        sourceLabel: "Historical Docs",
        title: doc.title,
        subtitle: section?.title ?? highlight.title,
        reference: highlight.reference ?? doc.title,
        text: highlight.text,
        color: COLOR_DOT[highlight.color ?? "gold"] ?? COLOR_DOT.gold,
        createdAt: highlight.createdAt ?? rowTime(row),
        openHref: `/learn?doc=${encodeURIComponent(doc.id)}&section=${encodeURIComponent(sectionId)}&hlid=${encodeURIComponent(highlight.id)}`,
        groupKey: `learn-${doc.id}`,
        groupLabel: doc.title,
      });
    }
  }

  return result;
}

export function collectUnifiedHighlights(rows?: StorageRow[]): UnifiedHighlight[] {
  const merged = mergeRows(rows);
  const combined = dedupeHighlights([
    ...readUnifiedMirror(merged),
    ...parseScriptureHighlights(merged),
    ...parseStudyToolHighlights(merged),
    ...parseBookHighlights(merged),
    ...parseHistoricalHighlights(merged),
  ]).sort((a, b) => b.createdAt - a.createdAt);

  if (typeof window !== "undefined" && !rows) {
    const current = parseJson<UnifiedHighlight[]>(localStorage.getItem(UNIFIED_HIGHLIGHTS_KEY), []);
    const currentIds = current.map((highlight) => highlight.id).sort().join("|");
    const combinedIds = combined.map((highlight) => highlight.id).sort().join("|");
    if (currentIds !== combinedIds) {
      writeUnifiedMirror(combined);
    }
  }

  return combined;
}
