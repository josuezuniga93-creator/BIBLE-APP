import type {
  Analysis,
  BookMeta,
  WordToken,
  Verse,
  BookCatalogEntry,
  BookDetail,
  BookChapter,
  ChapterData,
  StrongsEntry,
  CommentaryEntry,
} from "./types";
import { BIBLE_BOOKS } from "./bibleBooks";

// ─── Base config ──────────────────────────────────────────────────────────────

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://tulip-bible-backend-production.up.railway.app";

// Short timeout for Railway — if it doesn't respond in 8s, fall back immediately
const RAILWAY_TIMEOUT = 8_000;

async function railwayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RAILWAY_TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        (errData as { detail?: string }).detail ?? `Request failed (${res.status})`
      );
    }
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ─── Sermon analysis ──────────────────────────────────────────────────────────

export interface AnalyzeTextParams {
  text: string;
  language: string;
  max_claims: number;
  translation?: string;
}

export interface AnalyzeYoutubeParams {
  youtube_url: string;
  language: string;
  max_claims: number;
  translation?: string;
}

export function analyzeSermon(
  body: AnalyzeTextParams | AnalyzeYoutubeParams
): Promise<Analysis> {
  return railwayFetch<Analysis>("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function analyzeSermonStream(
  body: AnalyzeTextParams | AnalyzeYoutubeParams,
  onHeartbeat: () => void,
  onDone: (result: Analysis) => void,
  onError: (msg: string) => void,
): Promise<void> {
  const resp = await fetch(`${BASE}/api/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(
      (errData as { detail?: string }).detail ?? `Request failed (${resp.status})`
    );
  }

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      try {
        const event = JSON.parse(raw) as { type: string; detail?: string } & Partial<Analysis>;
        if (event.type === "heartbeat") onHeartbeat();
        else if (event.type === "done") { const { type: _t, ...result } = event; onDone(result as Analysis); }
        else if (event.type === "error") onError(event.detail ?? "Analysis failed");
      } catch { /* ignore malformed */ }
    }
  }
}

// ─── Lexicon / Bible ──────────────────────────────────────────────────────────

export interface BooksResponse {
  books: BookMeta[];
  hasStrongs: boolean;
  hasMhc: boolean;
}

// Static books — always available, no backend needed
const STATIC_BOOKS: BookMeta[] = BIBLE_BOOKS.map(
  ({ num, name, abbr, chapters, testament }) => ({ num, name, abbr, chapters, testament })
);

/**
 * Books are bundled statically — no network call needed.
 * All 66 books, chapter counts, and testament info are in bibleBooks.ts.
 * Railway is only needed for hasStrongs/hasMhc, which are disabled for now.
 */
export async function fetchBooks(): Promise<BooksResponse> {
  return { books: STATIC_BOOKS, hasStrongs: false, hasMhc: false };
}

// ─── Chapter fallback via bible-api.com (public domain, no key) ───────────────

function tokenize(text: string): WordToken[] {
  // Split on whitespace, keep punctuation attached to words
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, s: null }));
}

// Map book names to bible-api.com URL-friendly slugs
function toBibleApiSlug(bookName: string): string {
  return bookName.toLowerCase().replace(/\s+/g, "+");
}

interface BibleApiVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

async function fetchChapterFallback(
  bookNum: number,
  chapter: number
): Promise<ChapterData> {
  const meta = STATIC_BOOKS.find((b) => b.num === bookNum);
  if (!meta) throw new Error(`Unknown book ${bookNum}`);

  const slug = toBibleApiSlug(meta.name);
  const url = `https://bible-api.com/${slug}+${chapter}?translation=kjv`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }

  if (!res.ok) throw new Error(`bible-api.com error ${res.status}`);

  const data = (await res.json()) as { verses: BibleApiVerse[] };

  const verses: Verse[] = data.verses.map(({ verse, text }) => {
    const clean = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    return {
      verse,
      text: clean,
      words: tokenize(clean),
      hasStrongs: false,
    };
  });

  return {
    book: bookNum,
    bookName: meta.name,
    chapter,
    testament: meta.testament,
    translation: "kjv",
    verses,
    hasStrongs: false,
  };
}

// ─── Chapter cache (localStorage) ────────────────────────────────────────────

const CHAPTER_CACHE_KEY = (book: number, ch: number, t: string) =>
  `ryc-ch-${book}-${ch}-${t}`;

function readChapterCache(book: number, ch: number, t: string): ChapterData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAPTER_CACHE_KEY(book, ch, t));
    return raw ? (JSON.parse(raw) as ChapterData) : null;
  } catch { return null; }
}

function writeChapterCache(data: ChapterData): void {
  if (typeof window === "undefined") return;
  const key = CHAPTER_CACHE_KEY(data.book, data.chapter, data.translation ?? "kjv");
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

/**
 * Chapter loading strategy:
 *  1. Return cached version instantly if available (localStorage).
 *  2. For KJV: race Railway vs bible-api.com — whichever responds first wins.
 *  3. For other translations: try Railway, fall back to KJV.
 *  4. Write result to cache so next visit is instant.
 */
export async function fetchChapter(
  bookNum: number,
  chapter: number,
  translation?: string
): Promise<ChapterData> {
  const trans = translation ?? "kjv";

  // ── 1. Instant cache hit ────────────────────────────────────────────────────
  const cached = readChapterCache(bookNum, chapter, trans);
  if (cached) return cached;

  // ── 2/3. Fetch ──────────────────────────────────────────────────────────────
  let result: ChapterData;

  const t = translation ? `&translation=${encodeURIComponent(translation)}` : "";
  const railwayPromise = railwayFetch<ChapterData>(
    `/api/lexicon/chapter?book=${bookNum}&chapter=${chapter}${t}`
  );

  if (trans === "kjv") {
    // Race Railway vs public fallback — use whichever is faster
    result = await Promise.any([railwayPromise, fetchChapterFallback(bookNum, chapter)]);
  } else {
    try { result = await railwayPromise; }
    catch { result = await fetchChapterFallback(bookNum, chapter); }
  }

  // ── 4. Cache for next visit ─────────────────────────────────────────────────
  writeChapterCache(result);
  return result;
}

export function fetchCommentary(
  book: number,
  chapter: number
): Promise<CommentaryEntry[]> {
  return railwayFetch<{ entries: CommentaryEntry[] }>(
    `/api/commentary/chapter?book=${book}&chapter=${chapter}`
  ).then((r) => r.entries);
}

export function fetchStrongs(id: string): Promise<StrongsEntry> {
  return railwayFetch<StrongsEntry>(
    `/api/lexicon/strongs/${encodeURIComponent(id)}`
  );
}

export interface StrongsSearchOptions {
  q: string;
  lang?: string;
  limit?: number;
}

export function searchStrongs(opts: StrongsSearchOptions): Promise<StrongsEntry[]> {
  const params = new URLSearchParams({ q: opts.q });
  if (opts.lang) params.set("lang", opts.lang);
  if (opts.limit != null) params.set("limit", String(opts.limit));
  return railwayFetch<{ results: StrongsEntry[] }>(
    `/api/lexicon/search?${params.toString()}`
  ).then((r) => r.results);
}

// ─── Books / Library ──────────────────────────────────────────────────────────

async function bookFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      (errData as { detail?: string }).detail ?? `Request failed (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export function fetchBookCatalog(): Promise<BookCatalogEntry[]> {
  return bookFetch<BookCatalogEntry[]>("/api/books");
}

export function fetchBookDetail(slug: string): Promise<BookDetail> {
  return bookFetch<BookDetail>(`/api/books/${encodeURIComponent(slug)}`);
}

export function fetchBookChapter(slug: string, chapter: number): Promise<BookChapter> {
  return bookFetch<BookChapter>(`/api/books/${encodeURIComponent(slug)}/chapter/${chapter}`);
}
