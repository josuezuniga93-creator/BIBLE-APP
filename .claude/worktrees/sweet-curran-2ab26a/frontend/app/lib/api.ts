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
 * Streaming version — connects to /api/analyze/stream (SSE).
 * Returns a cleanup/abort function.
 */
export function analyzeSermonStream(
  body: AnalyzeTextParams | AnalyzeYoutubeParams,
  onHeartbeat: () => void,
  onDone: (analysis: Analysis) => void,
  onError: (msg: string) => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}/api/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        onError(
          (errData as { detail?: string }).detail ?? `Request failed (${res.status})`
        );
        return;
      }

      if (!res.body) {
        onError("No response stream available.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const event = JSON.parse(jsonStr) as {
              type: string;
              detail?: string;
              [key: string]: unknown;
            };
            if (event.type === "heartbeat") {
              onHeartbeat();
            } else if (event.type === "done") {
              const { type: _t, ...analysis } = event;
              onDone(analysis as unknown as Analysis);
            } else if (event.type === "error") {
              onError(event.detail ?? "Unknown error");
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
          onError("Cannot reach the backend server. Make sure it is running on port 8000.");
        } else {
          onError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
      }
    }
  })();

  return () => controller.abort();
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
