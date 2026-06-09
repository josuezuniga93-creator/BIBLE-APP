"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../lib/useTheme";
import type { ChurchAnalysis, SermonRecord } from "../page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SermonField {
  url: string;
  title?: string;       // auto-fetched from YouTube oEmbed
  transcript?: string;
  status: "idle" | "fetching" | "done" | "error";
  error?: string;
  manualOpen?: boolean; // is the "paste manually" textarea expanded?
  manualText?: string;  // draft text before the user confirms it
}

interface TimedtextEvent {
  tStartMs?: number;
  segs?: Array<{ utf8?: string }>;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function saveAnalysis(analysis: ChurchAnalysis) {
  try {
    const raw = localStorage.getItem("tulip-church-analyses");
    const list: ChurchAnalysis[] = raw ? JSON.parse(raw) : [];
    list.push(analysis);
    localStorage.setItem("tulip-church-analyses", JSON.stringify(list));
  } catch { /**/ }
}

// ─── Client-side YouTube helpers (run in browser — no Vercel IP blocks) ───────

function extractVideoId(url: string): string | null {
  // {11} captures exactly the video ID; ?si= and other params are ignored
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

async function fetchTitleClientSide(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json() as { title?: string };
    return data.title ?? null;
  } catch { return null; }
}

async function fetchTranscriptClientSide(videoId: string): Promise<string> {
  // Runs in the user's browser — YouTube does not block browser-origin requests
  const candidates = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&fmt=json3`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json() as { events?: TimedtextEvent[] };
      if (!data?.events?.length) continue;

      const lines = data.events
        .filter(e => e.segs?.length)
        .map(e => {
          const ms = e.tStartMs ?? 0;
          const secs = Math.floor(ms / 1000);
          const m = Math.floor(secs / 60);
          const s = secs % 60;
          const timestamp = `[${m}:${String(s).padStart(2, "0")}]`;
          const text = e.segs!.map(seg => seg.utf8 ?? "").join("").trim();
          return text ? `${timestamp} ${text}` : null;
        })
        .filter((l): l is string => l !== null)
        .join("\n");

      if (lines.length > 100) return lines;
    } catch { continue; }
  }

  throw new Error(
    "Could not fetch captions for this video. " +
    "Try a longer video from this channel (longer videos are more likely to have auto-generated captions), " +
    "or look for videos with the CC badge on YouTube."
  );
}

async function fetchTranscriptFromApp(url: string): Promise<{ transcript: string; title?: string; method?: string }> {
  const res = await fetch("/api/youtube-transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json() as { transcript?: string; title?: string; method?: string; error?: string };

  if (!res.ok || !data.transcript) {
    throw new Error(data.error ?? "Could not fetch captions automatically.");
  }

  return { transcript: data.transcript, title: data.title, method: data.method };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewAnalysisPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light-elegant" || theme === "light-pink";

  const [churchName, setChurchName] = useState("");
  const [denomination, setDenomination] = useState("");
  const [sermons, setSermons] = useState<SermonField[]>([
    { url: "", status: "idle" },
    { url: "", status: "idle" },
    { url: "", status: "idle" },
    { url: "", status: "idle" },
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [phase, setPhase] = useState<"form" | "fetching" | "analyzing">("form");

  // ── Theme ────────────────────────────────────────────────────────────────────
  const bg = isLight ? "#f5f0e8" : "#0f0f0f";
  const fg = isLight ? "#1c1409" : "#ffffff";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";
  const inputBg = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
  const borderColor = isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)";
  const mutedFg = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.38)";

  // ── Sermon field helpers ──────────────────────────────────────────────────────
  function updateSermon(idx: number, patch: Partial<SermonField>) {
    setSermons(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function addSermon() {
    setSermons(prev => [...prev, { url: "", status: "idle" }]);
  }

  function removeSermon(idx: number) {
    if (sermons.length <= 4) return;
    setSermons(prev => prev.filter((_, i) => i !== idx));
  }

  // Confirm a manually pasted transcript and mark the sermon as done
  function confirmManual(idx: number) {
    const text = (sermons[idx].manualText ?? "").trim();
    if (!text) return;
    updateSermon(idx, {
      transcript: text,
      status: "done",
      error: undefined,
      manualOpen: false,
    });
  }

  // ── Fetch title + transcript for one sermon (client-side) ─────────────────────
  async function fetchSermon(
    idx: number,
    url: string
  ): Promise<{ transcript: string; title?: string } | null> {
    const videoId = extractVideoId(url);
    if (!videoId) {
      updateSermon(idx, { status: "error", error: "Invalid YouTube URL — could not extract video ID." });
      return null;
    }

    updateSermon(idx, { status: "fetching", error: undefined, title: undefined, manualOpen: false });

    try {
      const { transcript, title } = await fetchTranscriptFromApp(url);
      updateSermon(idx, { status: "done", transcript, title: title ?? undefined });
      return { transcript, title: title ?? undefined };
    } catch (serverError) {
      try {
        // Fallback for environments where YouTube blocks cloud/server requests.
        const [transcript, title] = await Promise.all([
          fetchTranscriptClientSide(videoId),
          fetchTitleClientSide(videoId),
        ]);
        updateSermon(idx, { status: "done", transcript, title: title ?? undefined });
        return { transcript, title: title ?? undefined };
      } catch (browserError) {
        const serverMsg = serverError instanceof Error ? serverError.message : "Auto-fetch could not read this transcript.";
        const browserMsg = browserError instanceof Error ? browserError.message : "";
        updateSermon(idx, {
          status: "error",
          error: browserMsg
            ? `${serverMsg} Browser backup also failed.`
            : serverMsg,
          manualOpen: true,
        });
        return null;
      }
    }
  }

  // ── Validate ─────────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!churchName.trim()) return "Church/pastor name is required.";
    const filled = sermons.filter(s => s.url.trim());
    if (filled.length < 4) return "Please enter at least 4 YouTube sermon URLs.";
    return null;
  }

  // ── Main analyze flow ─────────────────────────────────────────────────────────
  async function handleAnalyze() {
    const err = validate();
    if (err) { setGlobalError(err); return; }
    setGlobalError("");
    setAnalyzing(true);
    setPhase("fetching");

    // Fetch all transcripts in parallel from the browser.
    // Short-circuit for sermons that already have a transcript (manual paste or previous fetch).
    const results = await Promise.all(
      sermons.map((s, idx) => {
        if (!s.url.trim()) return Promise.resolve(null);
        if (s.transcript) return Promise.resolve({ transcript: s.transcript, title: s.title });
        return fetchSermon(idx, s.url.trim());
      })
    );

    const successful = results.filter(Boolean).length;
    if (successful < 4) {
      setGlobalError(
        `Only ${successful} transcript(s) fetched successfully. At least 4 are required. If auto-fetch is blocked, paste the transcript manually in the opened boxes and tap "Use this transcript".`
      );
      setAnalyzing(false);
      setPhase("form");
      return;
    }

    // Build sermons payload from results (titles and transcripts come from fetch results)
    const sermonsPayload: SermonRecord[] = sermons
      .flatMap((s, idx) => {
        const result = results[idx];
        if (!result?.transcript) return [];
        const record: SermonRecord = { url: s.url.trim(), title: result.title, transcript: result.transcript };
        return [record];
      });

    setPhase("analyzing");

    try {
      const res = await fetch("/api/analyze-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName: churchName.trim(),
          denomination: denomination.trim() || undefined,
          sermons: sermonsPayload,
        }),
      });
      const data = await res.json() as { analysis?: string; verdict?: string; error?: string };

      if (!res.ok || data.error) {
        setGlobalError(data.error ?? "Analysis failed. Please try again.");
        setAnalyzing(false);
        setPhase("form");
        return;
      }

      const record: ChurchAnalysis = {
        id: generateId(),
        churchName: churchName.trim(),
        denomination: denomination.trim() || undefined,
        sermons: sermonsPayload,
        result: data.analysis ?? "",
        verdict: data.verdict ?? "Theologically Concerning",
        analyzedAt: new Date().toISOString(),
      };
      saveAnalysis(record);
      router.push(`/church-analysis/${record.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setGlobalError(msg);
      setAnalyzing(false);
      setPhase("form");
    }
  }

  // ── Loading overlay ──────────────────────────────────────────────────────────
  if (analyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: bg }}>
        <div
          className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-6"
          style={{ borderColor: "rgba(201,169,97,0.3)", borderTopColor: "#c9a961" }}
        />
        <p className="font-bold text-lg mb-2" style={{ color: fg }}>
          {phase === "fetching" ? "Fetching Transcripts…" : "Analyzing Sermons…"}
        </p>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: mutedFg }}>
          {phase === "fetching"
            ? "Trying the app transcript service, then browser fallback"
            : "Running Historic Christianity analysis via Claude — this takes 20–40 seconds"}
        </p>
        <div className="mt-8 space-y-2 w-full max-w-xs">
          {sermons
            .filter(s => s.url.trim())
            .map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl text-left" style={{ background: cardBg }}>
                <span className="text-base flex-shrink-0">
                  {s.status === "fetching" ? "⏳" : s.status === "done" ? "✅" : s.status === "error" ? "❌" : "⬜"}
                </span>
                <span className="text-xs truncate flex-1" style={{ color: mutedFg }}>
                  {s.title || `Sermon ${i + 1}`}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: bg, color: fg }}>
      <main className="max-w-lg mx-auto px-4 pt-5 pb-12">

        {/* ── Back + Header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 active:opacity-60 transition-opacity"
            style={{ background: cardBg }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] uppercase" style={{ color: "rgba(201,169,97,0.75)" }}>New Analysis</p>
            <h1 className="text-xl font-bold leading-tight" style={{ color: fg }}>Church Analysis</h1>
          </div>
        </div>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {globalError && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            {globalError}
          </div>
        )}

        {/* ── Church info ───────────────────────────────────────────────── */}
        <section className="mb-6">
          <p className="text-[10px] font-black tracking-widest uppercase px-1 mb-3" style={{ color: mutedFg }}>
            Church / Pastor
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Church or pastor name *"
              value={churchName}
              onChange={e => setChurchName(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
              style={{ background: inputBg, color: fg, border: `1px solid ${borderColor}` }}
            />
            <input
              type="text"
              placeholder="Denomination or tradition (optional)"
              value={denomination}
              onChange={e => setDenomination(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
              style={{ background: inputBg, color: fg, border: `1px solid ${borderColor}` }}
            />
          </div>
        </section>

        {/* ── Sermon URLs ───────────────────────────────────────────────── */}
        <section className="mb-4">
          <div className="flex items-center justify-between px-1 mb-3">
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: mutedFg }}>
              YouTube Sermon URLs (min. 4)
            </p>
            <p className="text-[10px]" style={{ color: mutedFg }}>{sermons.length} added</p>
          </div>

          <div className="space-y-3">
            {sermons.map((sermon, idx) => (
              <div
                key={idx}
                className="rounded-2xl border overflow-hidden"
                style={{
                  borderColor:
                    sermon.status === "error" && !sermon.transcript
                      ? "rgba(234,179,8,0.40)"
                      : sermon.status === "done"
                      ? "rgba(34,197,94,0.25)"
                      : borderColor,
                  background: cardBg,
                }}
              >
                <div className="px-4 pt-3.5 pb-3">
                  {/* ── Label row ──────────────────────────────────────────── */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: mutedFg }}>
                      Sermon {idx + 1}
                    </span>
                    {idx < 4 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase" style={{ background: "rgba(201,169,97,0.15)", color: "#c9a961" }}>
                        Required
                      </span>
                    )}
                    {sermon.status === "done" && (
                      <span className="text-[10px] text-green-400 font-semibold">
                        {sermon.transcript && !sermon.title ? "✓ Manual" : "✓ Fetched"}
                      </span>
                    )}
                    {sermon.status === "fetching" && (
                      <span className="text-[10px] font-semibold" style={{ color: "#c9a961" }}>Fetching…</span>
                    )}
                    {sermons.length > 4 && (
                      <button
                        onClick={() => removeSermon(idx)}
                        className="ml-auto text-[10px] font-semibold"
                        style={{ color: "rgba(239,68,68,0.6)" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* ── URL input ────────────────────────────────────────── */}
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or youtu.be/..."
                    value={sermon.url}
                    onChange={e => updateSermon(idx, { url: e.target.value, status: "idle", error: undefined, title: undefined, transcript: undefined, manualOpen: false })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: inputBg, color: fg, border: `1px solid ${borderColor}` }}
                  />

                  {/* ── Auto-fetched title ───────────────────────────────── */}
                  {sermon.title && sermon.status === "done" && (
                    <p className="text-[11px] mt-2 truncate font-medium" style={{ color: "#c9a961" }}>
                      📺 {sermon.title}
                    </p>
                  )}

                  {/* ── Error: yellow warning + manual paste option ─────── */}
                  {sermon.status === "error" && !sermon.transcript && (
                    <div className="mt-2">
                      <p className="text-[11px] leading-snug mb-1.5" style={{ color: "#fbbf24" }}>
                        ⚠️ Auto-fetch could not read this transcript. Paste it below to keep going.
                      </p>
                      {sermon.error && (
                        <p className="text-[10px] leading-snug mb-2" style={{ color: "rgba(251,191,36,0.72)" }}>
                          {sermon.error}
                        </p>
                      )}
                      <button
                        onClick={() => updateSermon(idx, { manualOpen: !sermon.manualOpen })}
                        className="text-[11px] font-semibold underline underline-offset-2 active:opacity-60"
                        style={{ color: "#c9a961" }}
                      >
                        {sermon.manualOpen ? "Hide manual paste ↑" : "Paste transcript manually →"}
                      </button>
                    </div>
                  )}

                  {/* ── Manual paste textarea ────────────────────────────── */}
                  {sermon.manualOpen && !sermon.transcript && (
                    <div className="mt-3">
                      <p className="text-[10px] mb-1.5 leading-relaxed" style={{ color: mutedFg }}>
                        On YouTube: open the video → tap <strong style={{ color: fg }}>⋯</strong> → <strong style={{ color: fg }}>Show transcript</strong> → copy all text and paste below.
                      </p>
                      <textarea
                        rows={6}
                        placeholder="Paste transcript text here…"
                        value={sermon.manualText ?? ""}
                        onChange={e => updateSermon(idx, { manualText: e.target.value })}
                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                        style={{ background: inputBg, color: fg, border: `1px solid ${borderColor}` }}
                      />
                      <button
                        onClick={() => confirmManual(idx)}
                        disabled={!(sermon.manualText ?? "").trim()}
                        className="mt-2 w-full py-2 rounded-lg text-sm font-bold active:scale-[0.98] transition-transform"
                        style={{
                          background: (sermon.manualText ?? "").trim() ? "rgba(201,169,97,0.20)" : "rgba(255,255,255,0.05)",
                          color: (sermon.manualText ?? "").trim() ? "#c9a961" : mutedFg,
                          border: `1px solid ${(sermon.manualText ?? "").trim() ? "rgba(201,169,97,0.35)" : borderColor}`,
                        }}
                      >
                        Use this transcript ✓
                      </button>
                    </div>
                  )}

                  {/* ── Manually confirmed — show tick ───────────────────── */}
                  {sermon.status === "done" && sermon.transcript && !sermon.title && (
                    <p className="text-[11px] mt-2" style={{ color: "rgba(34,197,94,0.8)" }}>
                      ✓ Transcript ready ({sermon.transcript.split(" ").length.toLocaleString()} words)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addSermon}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold active:scale-[0.98] transition-transform"
            style={{ borderColor: "rgba(201,169,97,0.35)", color: "#c9a961", background: "rgba(201,169,97,0.06)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Another Sermon
          </button>
        </section>

        {/* ── Info box ──────────────────────────────────────────────────── */}
        <div className="px-4 py-3 rounded-xl mb-6 text-xs leading-relaxed space-y-1.5" style={{ background: "rgba(201,169,97,0.08)", color: "rgba(201,169,97,0.80)" }}>
          <p><strong>How it works:</strong> Paste YouTube URLs — the app fetches the transcripts automatically, then Claude analyzes them. Takes 20–40 seconds.</p>
          <p><strong>Tip:</strong> If automatic fetch is blocked, open YouTube, tap <strong>⋯ → Show transcript</strong>, copy the text, and paste it manually.</p>
        </div>

        {/* ── Analyze button ────────────────────────────────────────────── */}
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-transform"
          style={{
            background: "linear-gradient(135deg, #d9b970, #c9a961)",
            color: "#0e1018",
            boxShadow: "0 4px 20px rgba(201,169,97,0.30)",
            opacity: analyzing ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 14.5v-9l7 4.5-7 4.5z"/>
          </svg>
          Analyze Sermons
        </button>

        <p className="text-[10px] text-center mt-3 leading-relaxed" style={{ color: mutedFg }}>
          Analysis uses Claude AI. Results reflect the historic Christian faith as expressed in the ecumenical creeds and confessions.
        </p>
      </main>
    </div>
  );
}
