// app/api/youtube-transcript/route.ts
// Server-side YouTube transcript fetch for Church Analysis.
// The youtube-transcript package currently succeeds for the Cove Church sample
// URLs, so keep it first and use other services only as backup.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Minimal types for youtubei.js (defensive wrappers) ──────────────────────

interface YTTranscriptSegment {
  snippet?: { text?: string | { toString(): string } };
  start_ms?: number | string;
}

interface YTTranscriptResponse {
  transcript?: {
    content?: {
      body?: {
        initial_segments?: YTTranscriptSegment[];
      };
    };
  };
}

interface YTVideoInfo {
  getTranscript(): Promise<YTTranscriptResponse>;
}

interface YTInnertube {
  getInfo(videoId: string): Promise<YTVideoInfo>;
}

interface InnertubeConstructor {
  create(opts?: Record<string, unknown>): Promise<YTInnertube>;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

interface CaptionItem {
  offsetMs: number;
  text: string;
}

type FetchMethod = "local-transcript-bridge" | "youtube-transcript.io" | "youtube-transcript" | "youtubei.js" | "supadata";

interface TranscriptIoSegment {
  text?: string;
  start?: number;
  startMs?: number;
  offset?: number;
  duration?: number;
}

interface TranscriptIoResult {
  id?: string;
  videoId?: string;
  title?: string;
  transcript?: string | TranscriptIoSegment[];
  text?: string;
  segments?: TranscriptIoSegment[];
}

interface LocalBridgeResult {
  videoId?: string;
  title?: string | null;
  transcript?: string;
  method?: string;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  // The {11} quantifier captures exactly the 11-char video ID and stops,
  // so ?si=... and other query params on youtu.be short URLs are ignored correctly.
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatTimestamp(ms: number): string {
  const tot = Math.floor(ms / 1000);
  const h = Math.floor(tot / 3600);
  const m = Math.floor((tot % 3600) / 60);
  const s = tot % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function formatTranscript(items: CaptionItem[]): string {
  return items.map(i => `[${formatTimestamp(i.offsetMs)}] ${i.text}`).join("\n");
}

function normalizeTranscriptIoResponse(data: unknown, videoId: string): { items: CaptionItem[]; title?: string } | null {
  const root = Array.isArray(data) ? data : [data];
  const matching = root.find((item) => {
    if (!item || typeof item !== "object") return false;
    const typed = item as TranscriptIoResult;
    return typed.id === videoId || typed.videoId === videoId || "transcript" in typed || "text" in typed || "segments" in typed;
  }) as TranscriptIoResult | undefined;

  if (!matching) return null;

  if (typeof matching.transcript === "string" || typeof matching.text === "string") {
    const text = (typeof matching.transcript === "string" ? matching.transcript : matching.text ?? "").trim();
    if (!text) return null;
    return {
      title: matching.title,
      items: text.split(/\n+/).map((line, index) => ({ offsetMs: index * 4000, text: line.trim() })).filter((item) => item.text),
    };
  }

  const segments = Array.isArray(matching.transcript)
    ? matching.transcript
    : Array.isArray(matching.segments)
      ? matching.segments
      : [];

  const items = segments
    .map((seg) => ({
      offsetMs: typeof seg.startMs === "number"
        ? seg.startMs
        : typeof seg.offset === "number"
          ? seg.offset
          : typeof seg.start === "number"
            ? Math.round(seg.start * 1000)
            : 0,
      text: (seg.text ?? "").trim(),
    }))
    .filter((item) => item.text.length > 0);

  return items.length ? { items, title: matching.title } : null;
}

// ─── Video title via oEmbed (no API key) ─────────────────────────────────────

async function fetchVideoTitle(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { cache: "force-cache" }
    );
    if (!res.ok) return null;
    const data = await res.json() as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}

async function fetchViaTranscriptIo(videoId: string): Promise<{ items: CaptionItem[]; title?: string } | null> {
  const token = process.env.YOUTUBE_TRANSCRIPT_IO_TOKEN ?? process.env.YOUTUBE_TRANSCRIPT_API_TOKEN;
  if (!token) return null;

  try {
    const auth = token.startsWith("Basic ") ? token : `Basic ${token}`;
    const res = await fetch("https://www.youtube-transcript.io/api/transcripts", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: [videoId] }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json() as unknown;
    return normalizeTranscriptIoResponse(data, videoId);
  } catch {
    return null;
  }
}

async function fetchViaLocalBridge(rawUrl: string): Promise<{ transcript: string; title?: string | null } | null> {
  const bridgeUrl =
    process.env.LOCAL_TRANSCRIPT_BRIDGE_URL ??
    process.env.TRANSCRIPT_BRIDGE_URL ??
    "https://recently-bufing-casual-quotations.trycloudflare.com";
  const bridgeToken =
    process.env.LOCAL_TRANSCRIPT_BRIDGE_TOKEN ??
    process.env.TRANSCRIPT_BRIDGE_TOKEN ??
    "tulip-local-bridge";

  if (!bridgeUrl || !bridgeToken) return null;

  try {
    const res = await fetch(`${bridgeUrl.replace(/\/+$/, "")}/transcript`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridgeToken}`,
        "X-Transcript-Bridge-Token": bridgeToken,
      },
      body: JSON.stringify({ url: rawUrl }),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json() as LocalBridgeResult;
    const transcript = data.transcript?.trim();
    if (!transcript || transcript.length < 100) return null;
    return { transcript, title: data.title };
  } catch {
    return null;
  }
}

// ─── Primary: youtubei.js (InnerTube API — bypasses cloud IP blocks) ──────────

async function fetchViaInnertube(videoId: string): Promise<CaptionItem[] | null> {
  let Innertube: InnertubeConstructor;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("youtubei.js") as { Innertube: InnertubeConstructor } | { default: { Innertube: InnertubeConstructor } };
    Innertube = ("Innertube" in mod ? mod.Innertube : (mod as { default: { Innertube: InnertubeConstructor } }).default.Innertube);
  } catch {
    return null; // package not installed — fall through to legacy method
  }

  try {
    const youtube = await Innertube.create({ retrieve_player: false });
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    const segments = transcriptData?.transcript?.content?.body?.initial_segments;
    if (!segments?.length) return null;

    const items: CaptionItem[] = segments
      .map(seg => {
        const rawText = seg.snippet?.text;
        const text = (rawText == null ? "" : typeof rawText === "string" ? rawText : rawText.toString()).trim();
        const offsetMs = typeof seg.start_ms === "string"
          ? parseInt(seg.start_ms, 10)
          : (seg.start_ms ?? 0);
        return { offsetMs, text };
      })
      .filter(i => i.text.length > 0 && !isNaN(i.offsetMs));

    return items.length ? items : null;
  } catch {
    return null;
  }
}

// ─── Fallback: youtube-transcript package ────────────────────────────────────

async function fetchViaPackage(videoId: string): Promise<CaptionItem[] | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("youtube-transcript");
    const YT = mod.YoutubeTranscript ?? mod.default ?? mod;
    const raw = await YT.fetchTranscript(videoId) as Array<{ text: string; offset: number }>;
    if (!raw?.length) return null;
    return raw.map(r => ({ offsetMs: r.offset, text: r.text }));
  } catch {
    return null;
  }
}

// ─── Fallback 2: Supadata API (dedicated transcript extraction service) ───────

interface SupadataSegment {
  text?: string;
  offset?: number;
}

async function fetchViaSupadata(videoId: string): Promise<CaptionItem[] | null> {
  try {
    const res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=false`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json() as unknown;

    // Supadata may return a direct array or a wrapped { content: [] } object
    let segments: SupadataSegment[];
    if (Array.isArray(data)) {
      segments = data as SupadataSegment[];
    } else {
      const wrapped = data as { content?: SupadataSegment[] };
      segments = Array.isArray(wrapped.content) ? wrapped.content : [];
    }

    if (!segments.length) return null;

    const items: CaptionItem[] = segments
      .map(seg => ({
        offsetMs: typeof seg.offset === "number" ? seg.offset : 0,
        text: (seg.text ?? "").trim(),
      }))
      .filter(i => i.text.length > 0);

    return items.length ? items : null;
  } catch {
    return null;
  }
}

// ─── Error message ────────────────────────────────────────────────────────────

const FETCH_FAILED_MSG =
  "Auto-fetch could not read captions for this video. Paste the transcript manually below to keep going.";

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawUrl = (body.url ?? "").trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const videoId = extractVideoId(rawUrl);
  if (!videoId) {
    return NextResponse.json(
      { error: "Could not find a YouTube video ID in this URL. Make sure it is a valid youtube.com or youtu.be link." },
      { status: 400 }
    );
  }

  const titlePromise = fetchVideoTitle(videoId);

  const localBridge = await fetchViaLocalBridge(rawUrl);
  if (localBridge?.transcript) {
    const title = localBridge.title ?? await titlePromise;
    return NextResponse.json({
      videoId,
      transcript: localBridge.transcript,
      title,
      method: "local-transcript-bridge" satisfies FetchMethod,
    });
  }

  let method: FetchMethod | null = null;
  let titleFromProvider: string | undefined;
  const transcriptIo = await fetchViaTranscriptIo(videoId);
  let items: CaptionItem[] | null = transcriptIo?.items ?? null;
  if (items) {
    method = "youtube-transcript.io";
    titleFromProvider = transcriptIo?.title;
  }

  if (!items) {
    items = await fetchViaPackage(videoId);
    if (items) method = "youtube-transcript";
  }

  if (!items) {
    items = await fetchViaInnertube(videoId);
    if (items) method = "youtubei.js";
  }

  if (!items) {
    items = await fetchViaSupadata(videoId);
    if (items) method = "supadata";
  }

  const title = titleFromProvider ?? await titlePromise;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: FETCH_FAILED_MSG }, { status: 422 });
  }

  return NextResponse.json({ videoId, transcript: formatTranscript(items), title, method });
}
