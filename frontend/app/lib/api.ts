import type {
  Analysis,
  BookMeta,
  ChapterData,
  StrongsEntry,
  CommentaryEntry,
} from "./types";

// ─── Base config ──────────────────────────────────────────────────────────────

const BASE = "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      (errData as { detail?: string }).detail ?? `Request failed (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

// ─── Sermon analysis ──────────────────────────────────────────────────────────

export interface AnalyzeTextParams {
  text: string;
  language: string;
  max_claims: number;
}

export interface AnalyzeYoutubeParams {
  youtube_url: string;
  language: string;
  max_claims: number;
}

export function analyzeSermon(
  body: AnalyzeTextParams | AnalyzeYoutubeParams
): Promise<Analysis> {
  return apiFetch<Analysis>("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Lexicon / Bible ──────────────────────────────────────────────────────────

export interface BooksResponse {
  books: BookMeta[];
  hasStrongs: boolean;
  hasMhc: boolean;
}

export function fetchBooks(): Promise<BooksResponse> {
  return apiFetch<BooksResponse>("/api/lexicon/books");
}

export function fetchChapter(book: number, chapter: number): Promise<ChapterData> {
  return apiFetch<ChapterData>(
    `/api/lexicon/chapter?book=${book}&chapter=${chapter}`
  );
}

export function fetchCommentary(
  book: number,
  chapter: number
): Promise<CommentaryEntry[]> {
  return apiFetch<{ entries: CommentaryEntry[] }>(
    `/api/commentary/chapter?book=${book}&chapter=${chapter}`
  ).then((r) => r.entries);
}

export function fetchStrongs(id: string): Promise<StrongsEntry> {
  return apiFetch<StrongsEntry>(
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
  return apiFetch<{ results: StrongsEntry[] }>(
    `/api/lexicon/search?${params.toString()}`
  ).then((r) => r.results);
}
