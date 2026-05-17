import type {
  Analysis,
  BookMeta,
  BookCatalogEntry,
  BookDetail,
  BookChapter,
  ChapterData,
  StrongsEntry,
  CommentaryEntry,
} from "./types";

// ─── Base config ──────────────────────────────────────────────────────────────

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://tulip-bible-backend-production.up.railway.app";

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
  return apiFetch<Analysis>("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Streaming SSE sermon analysis.
 * Sends heartbeats while Claude works, then fires onDone with the full result.
 */
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

    // SSE frames are delimited by double newlines
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      try {
        const event = JSON.parse(raw) as { type: string; detail?: string } & Partial<Analysis>;
        if (event.type === "heartbeat") {
          onHeartbeat();
        } else if (event.type === "done") {
          const { type: _t, ...result } = event;
          onDone(result as Analysis);
        } else if (event.type === "error") {
          onError(event.detail ?? "Analysis failed");
        }
      } catch {
        // ignore malformed frames
      }
    }
  }
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

export function fetchChapter(book: number, chapter: number, translation?: string): Promise<ChapterData> {
  const t = translation ? `&translation=${encodeURIComponent(translation)}` : "";
  return apiFetch<ChapterData>(
    `/api/lexicon/chapter?book=${book}&chapter=${chapter}${t}`
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

// ─── Books / Library ──────────────────────────────────────────────────────────
// Book routes are served by Next.js API routes (no Python backend required).

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
