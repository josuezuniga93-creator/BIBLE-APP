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

// ─── Shared helpers ───────────────────────────────────────────────────────────

function tokenize(text: string): WordToken[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, s: null }));
}

// ─── bible.helloao.org — primary source for all translations ─────────────────
//     Free, AWS-hosted, 1000+ translations, no API key required.
//     URL: https://bible.helloao.org/api/{translationId}/{bookCode}/{chapter}.json

// Map our internal translation keys to helloao.org translation IDs
const HELLOAO_TRANSLATION_ID: Record<string, string> = {
  kjv:    "KJV",
  geneva: "GNVA",
  // The following go through the bolls.life proxy (values unused but key must be present)
  nkjv:  "NKJV",
  esv:   "ESV",
  nasb:  "NASB",
  niv:   "NIV2011",
  lsb:   "LSB",
  rv1960: "RV1960",
  ntv:   "NTV",
  nvi:   "NVI",
  lbla:  "LBLA",
};

// Map bibleBooks.ts abbr codes → USFM codes expected by helloao.org
// Most are just .toUpperCase(); a handful differ.
const ABBR_USFM_EXCEPTIONS: Record<string, string> = {
  Eze: "EZK",
  Joe: "JOL",
  Nah: "NAM",
  Mar: "MRK",
  Joh: "JHN",
  // 1/2/3 John: standard abbr gives 1JO/2JO/3JO but USFM is 1JN/2JN/3JN
  "1Jo": "1JN",
  "2Jo": "2JN",
  "3Jo": "3JN",
};

function toUSFM(abbr: string): string {
  return ABBR_USFM_EXCEPTIONS[abbr] ?? abbr.toUpperCase();
}

// Flatten a helloao verse content array into a plain string
type AnyContent = string | { text?: string; type?: string; content?: AnyContent[] };
function extractText(content: AnyContent[]): string {
  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if (item.text) return item.text;
      if (item.content) return extractText(item.content);
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface HelloAOItem {
  type: string;
  number?: number;
  content?: AnyContent[];
}

interface HelloAOChapter {
  book: { shortName?: string; name?: string };
  chapter: {
    number: number;
    content: HelloAOItem[];
  };
}

// Recursively collect all verse items regardless of nesting depth.
// Some translations (e.g. RVR1960) wrap verses inside paragraph/section containers.
function collectVerses(items: HelloAOItem[]): HelloAOItem[] {
  const result: HelloAOItem[] = [];
  for (const item of items) {
    if (item.type === "verse" && typeof item.number === "number") {
      result.push(item);
    } else if (item.content) {
      result.push(...collectVerses(item.content as HelloAOItem[]));
    }
  }
  return result;
}

async function fetchChapterHelloAO(
  bookNum: number,
  chapter: number,
  appTranslation: string
): Promise<ChapterData> {
  const meta = STATIC_BOOKS.find((b) => b.num === bookNum);
  if (!meta) throw new Error(`Unknown book ${bookNum}`);

  const translId = HELLOAO_TRANSLATION_ID[appTranslation];
  if (!translId) throw new Error(`No helloao mapping for translation "${appTranslation}"`);

  const bookCode = toUSFM(meta.abbr);
  const url = `https://bible.helloao.org/api/${translId}/${bookCode}/${chapter}.json`;

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

  if (!res.ok) throw new Error(`helloao error ${res.status}`);

  const data = (await res.json()) as HelloAOChapter;

  // Recursively collect verse items (some translations nest them in paragraphs/sections)
  const verseItems = collectVerses(data.chapter.content);
  const verses: Verse[] = verseItems.map((item) => {
    const text = extractText((item.content ?? []) as AnyContent[]);
    return {
      verse: item.number as number,
      text,
      words: tokenize(text),
      hasStrongs: false,
    };
  });

  const bookName = data.book?.name ?? data.book?.shortName ?? meta.name;

  return {
    book: bookNum,
    bookName,
    chapter,
    testament: meta.testament,
    translation: appTranslation,
    verses,
    hasStrongs: false,
  };
}

// ─── getbible.net — Spanish fallback ─────────────────────────────────────────
//     Free, supports rv1960 / rv1909. Used when helloao.org is unreachable.
//     URL: https://getbible.net/v2/{translation}/{bookNum}/{chapter}.json

const GETBIBLE_TRANSLATION_ID: Record<string, string> = {
  rv1960: "rv1960",
  rv1909: "rv1909",
};

interface GetBibleVerse {
  book: number;
  chapter: number;
  verse: number;
  name: string;
  text: string;
}

interface GetBibleChapter {
  book: number;
  chapter: number;
  name: string;
  translation: string;
  verses: Record<string, GetBibleVerse>;
}

async function fetchChapterGetBible(
  bookNum: number,
  chapter: number,
  appTranslation: string
): Promise<ChapterData> {
  const meta = STATIC_BOOKS.find((b) => b.num === bookNum);
  if (!meta) throw new Error(`Unknown book ${bookNum}`);

  const translId = GETBIBLE_TRANSLATION_ID[appTranslation];
  if (!translId) throw new Error(`No getbible mapping for translation "${appTranslation}"`);

  const url = `https://getbible.net/v2/${translId}/${bookNum}/${chapter}.json`;

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

  if (!res.ok) throw new Error(`getbible.net error ${res.status}`);

  const data = (await res.json()) as GetBibleChapter;
  const verses: Verse[] = Object.values(data.verses)
    .sort((a, b) => a.verse - b.verse)
    .map(({ verse, text }) => {
      const clean = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      return { verse, text: clean, words: tokenize(clean), hasStrongs: false };
    });

  return {
    book: bookNum,
    bookName: data.name ?? meta.name,
    chapter,
    testament: meta.testament,
    translation: appTranslation,
    verses,
    hasStrongs: false,
  };
}

// ─── Legacy fallback via bible-api.com (public domain, no key) ───────────────
//     Used only if helloao.org is unreachable.

function toBibleApiSlug(bookName: string): string {
  return bookName.toLowerCase().replace(/\s+/g, "+");
}

interface BibleApiVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

const BIBLE_API_SUPPORTED = new Set(["kjv", "kjv1611", "geneva", "bbe", "web", "darby", "ylt", "webster"]);

async function fetchChapterFallback(
  bookNum: number,
  chapter: number,
  translation = "kjv"
): Promise<ChapterData> {
  const meta = STATIC_BOOKS.find((b) => b.num === bookNum);
  if (!meta) throw new Error(`Unknown book ${bookNum}`);

  const trans = BIBLE_API_SUPPORTED.has(translation) ? translation : "kjv";
  const slug = toBibleApiSlug(meta.name);
  const url = `https://bible-api.com/${slug}+${chapter}?translation=${trans}`;

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
    return { verse, text: clean, words: tokenize(clean), hasStrongs: false };
  });

  return {
    book: bookNum,
    bookName: meta.name,
    chapter,
    testament: meta.testament,
    translation: trans,
    verses,
    hasStrongs: false,
  };
}

// ─── Chapter cache (localStorage) ────────────────────────────────────────────

// v2 — busts any stale KJV-fallback data cached under Spanish translation keys
const CHAPTER_CACHE_KEY = (book: number, ch: number, t: string) =>
  `ryc-ch-v2-${book}-${ch}-${t}`;

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

// ─── Local proxy for non-English translations ─────────────────────────────────
//     Calls the Next.js API route /api/bible/chapter which fetches from
//     helloao.org server-side, bypassing browser CORS restrictions.
async function fetchChapterProxy(
  bookNum: number,
  chapter: number,
  trans: string
): Promise<ChapterData> {
  const params = new URLSearchParams({
    book:        String(bookNum),
    chapter:     String(chapter),
    translation: trans,
  });
  const res = await fetch(`/api/bible/chapter?${params.toString()}`, { cache: "no-store" });
  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok || !contentType.includes("application/json")) {
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      const jsonErr = (() => { try { return (JSON.parse(body) as { error?: string }).error; } catch { return null; } })();
      throw new Error(jsonErr ?? `Proxy ${res.status}: ${body.slice(0, 120)}`);
    }
    // 200 but HTML — serverless function likely crashed before responding
    throw new Error(`Proxy returned non-JSON (${contentType}): ${body.slice(0, 80)}`);
  }

  return res.json() as Promise<ChapterData>;
}

/**
 * Chapter loading strategy:
 *
 *  English default: ESV (also KJV / Geneva / NKJV / NASB / NIV / LSB)
 *    KJV / Geneva: Race Railway vs helloao.org (direct) → fallback bible-api.com
 *    ESV / NKJV / NASB / NIV / LSB: Server-side proxy → bolls.life
 *
 *  Spanish default: LBLA (also RV1960 / NVI / NTV)
 *    All Spanish translations: Server-side proxy → bolls.life (no CORS issues).
 *    Never falls back to an English translation.
 *
 *  All results cached in localStorage for instant subsequent loads.
 */
export async function fetchChapter(
  bookNum: number,
  chapter: number,
  translation?: string
): Promise<ChapterData> {
  const trans = translation ?? "kjv";

  // ── 1. Instant cache hit ───────────────────────────────────────────────────
  const cached = readChapterCache(bookNum, chapter, trans);
  if (cached) return cached;

  // ── 2. Fetch ───────────────────────────────────────────────────────────────
  let result: ChapterData;
  const isEnglish = trans === "kjv" || trans === "geneva";

  if (isEnglish) {
    // English: race Railway vs helloao.org, fallback bible-api.com
    const t = `&translation=${encodeURIComponent(trans)}`;
    const railwayPromise = railwayFetch<ChapterData>(
      `/api/lexicon/chapter?book=${bookNum}&chapter=${chapter}${t}`
    );
    const helloAOPromise = fetchChapterHelloAO(bookNum, chapter, trans);
    try {
      result = await Promise.any([railwayPromise, helloAOPromise]);
    } catch {
      result = await fetchChapterFallback(bookNum, chapter, trans);
    }
  } else if (trans in HELLOAO_TRANSLATION_ID) {
    // Spanish / non-English — go straight to the server-side proxy.
    // Direct browser calls to these APIs don't work reliably:
    //   - getbible.net returns 200 HTML (anti-bot) → JSON parse error
    //   - helloao.org blocks CORS requests from this domain
    // The proxy calls helloao.org server-side where CORS/IP checks don't apply.
    result = await fetchChapterProxy(bookNum, chapter, trans);
  } else {
    throw new Error(`Unsupported translation: ${trans}`);
  }

  // ── 3. Cache for next visit ────────────────────────────────────────────────
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
