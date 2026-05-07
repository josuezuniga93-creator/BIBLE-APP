"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimVerdict =
  | "ALIGNED"
  | "SECONDARY_DIFFERENCE"
  | "CAUTION"
  | "CONTRADICTS_FUNDAMENTAL";

type OverallVerdict =
  | "SOUND"
  | "MIXED"
  | "SERIOUS_CONCERNS"
  | "FALSE_TEACHING";

interface Claim {
  quote: string;
  scriptureCheck: string;
  historicCheck: string;
  theologianNote: string;
  verdict: ClaimVerdict;
  verdictExplanation: string;
}

interface Analysis {
  summary: string;
  claims: Claim[];
  redFlags: string[];
  recommendations: string[];
  overallVerdict: OverallVerdict;
  overallExplanation: string;
}

// ─── Verdict styling maps ────────────────────────────────────────────────────

const CLAIM_STYLES: Record<
  ClaimVerdict,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {
  ALIGNED: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
    badge: "bg-emerald-500 text-white",
    dot: "bg-emerald-400",
  },
  SECONDARY_DIFFERENCE: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    text: "text-blue-300",
    badge: "bg-blue-500 text-white",
    dot: "bg-blue-400",
  },
  CAUTION: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    text: "text-amber-300",
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-400",
  },
  CONTRADICTS_FUNDAMENTAL: {
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    text: "text-red-300",
    badge: "bg-red-600 text-white",
    dot: "bg-red-500",
  },
};

const OVERALL_STYLES: Record<
  OverallVerdict,
  { bg: string; border: string; text: string; label: string; icon: string }
> = {
  SOUND: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-400",
    text: "text-emerald-300",
    label: "Sound Teaching",
    icon: "✓",
  },
  MIXED: {
    bg: "bg-amber-500/15",
    border: "border-amber-400",
    text: "text-amber-300",
    label: "Mixed",
    icon: "⚡",
  },
  SERIOUS_CONCERNS: {
    bg: "bg-orange-500/15",
    border: "border-orange-400",
    text: "text-orange-300",
    label: "Serious Concerns",
    icon: "⚠",
  },
  FALSE_TEACHING: {
    bg: "bg-red-500/15",
    border: "border-red-400",
    text: "text-red-300",
    label: "False Teaching",
    icon: "✗",
  },
};

const CLAIM_LABELS: Record<ClaimVerdict, string> = {
  ALIGNED: "Aligned",
  SECONDARY_DIFFERENCE: "Secondary",
  CAUTION: "Caution",
  CONTRADICTS_FUNDAMENTAL: "Contradicts Scripture",
};

const MIN_CHARS = 200;

// ─── Example sermon for quick testing ────────────────────────────────────────

const EXAMPLE_TEXT = `Today I want to talk about the goodness of God and how He wants every single one of you to prosper, to be wealthy, and to be in perfect health.

The Bible says in 3 John 1:2 "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers." This is God's unconditional will for every believer. If you are sick or struggling financially, the problem is your lack of faith. God cannot lie — He promised prosperity to all who believe.

Jesus died not just for our sins, but to redeem us from poverty and sickness. Isaiah 53:5 says "by His stripes we are healed" — this means physical healing is included in the atonement, and if you remain sick, it is because you are not claiming your covenant rights.

Some of you are struggling because you have not given enough to this ministry. When you give to God, He opens the windows of heaven. Plant a seed of faith — a significant financial gift — and God is obligated to return it to you multiplied. This is a spiritual law as real as gravity.

Remember: you are a king's kid. Poverty is a curse. Jesus became poor so we could become rich. The anointing on this ministry can break every financial curse over your life. But you must act in faith today.`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const charCount = text.trim().length;
  const isReady = charCount >= MIN_CHARS && !loading;

  // ── Analyze ──────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!isReady) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail: string = errData.detail || `Request failed (${response.status})`;
        if (response.status === 503) {
          throw new Error(
            "API key not configured — add your Anthropic API key to backend/.env then restart the backend."
          );
        }
        throw new Error(detail);
      }

      const data: Analysis = await response.json();
      setAnalysis(data);

      // Smooth-scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        setError(
          "Cannot reach the backend server. Make sure it is running on port 8000."
        );
      } else {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Load example ─────────────────────────────────────────────────────────
  const handleExample = () => {
    setText(EXAMPLE_TEXT);
    setError(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f0f]" />

        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl -translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Theological Discernment Tool
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-none title-gradient">
            Rebuttal<br className="md:hidden" />
            <span className="md:ml-4">Your Church</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/55 max-w-2xl mx-auto leading-relaxed font-light">
            Analyze sermons against{" "}
            <span className="text-white/75 font-medium">historic biblical Christianity</span>.
            Test every teaching against Scripture, the creeds, and the confessions.
          </p>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
            {[
              { label: "Essentials tested", value: "8" },
              { label: "Historic confessions", value: "6+" },
              { label: "Verdict categories", value: "4" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-violet-400">{value}</div>
                <div className="text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* ── Input Form ───────────────────────────────────────────────────── */}
        {!analysis && (
          <div className="space-y-4 fade-in">
            {/* Textarea card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Sermon Text
                </label>
                <button
                  onClick={handleExample}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Load example →
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the sermon transcript, teaching notes, or any Christian content here…"
                rows={14}
                className="w-full bg-transparent px-5 py-4 text-white/85 placeholder-white/20 text-base leading-relaxed resize-none focus:outline-none font-mono"
              />
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
                <span
                  className={`text-xs font-mono transition-colors ${
                    charCount >= MIN_CHARS
                      ? "text-emerald-400"
                      : "text-white/30"
                  }`}
                >
                  {charCount >= MIN_CHARS
                    ? `${charCount.toLocaleString()} chars ✓`
                    : `${charCount} / ${MIN_CHARS} chars minimum`}
                </span>
                {charCount > 0 && charCount < MIN_CHARS && (
                  <span className="text-xs text-white/25">
                    {MIN_CHARS - charCount} more to go
                  </span>
                )}
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-300 text-sm font-semibold mb-1">Error</p>
                <p className="text-red-200/70 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleAnalyze}
              disabled={!isReady}
              className="btn-primary w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200
                bg-gradient-to-r from-violet-700 to-violet-600
                hover:from-violet-600 hover:to-violet-500
                disabled:from-white/[0.06] disabled:to-white/[0.03]
                disabled:text-white/20 disabled:cursor-not-allowed
                text-white shadow-lg shadow-violet-500/10
                hover:shadow-violet-500/30 disabled:shadow-none
                active:scale-[0.99]"
            >
              {loading ? "Analyzing…" : "Analyze Sermon"}
            </button>
          </div>
        )}

        {/* ── Loading State ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 space-y-8 fade-in">
            {/* Dual-ring spinner */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-500 spinner-outer" />
              <div className="absolute inset-2 rounded-full border-2 border-amber-400/20 border-t-amber-400/70 spinner-inner" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-white/80">Analyzing sermon…</p>
              <p className="text-sm text-white/35">
                Comparing against Scripture, creeds, and confessions
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-500/40 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {analysis && !loading && (
          <div ref={resultsRef} className="space-y-8 fade-in">

            {/* ── Overall Verdict Card ─────────────────────────────────── */}
            {(() => {
              const s = OVERALL_STYLES[analysis.overallVerdict] ?? OVERALL_STYLES.MIXED;
              return (
                <div
                  className={`rounded-2xl border-2 ${s.bg} ${s.border} p-8 shadow-2xl card-animate`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-1">
                        Overall Verdict
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`text-4xl md:text-5xl font-black ${s.text}`}>
                          {s.label}
                        </span>
                        <span
                          className={`text-2xl font-black ${s.text} opacity-60`}
                        >
                          {s.icon}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full border ${s.border} ${s.bg} text-xs font-black uppercase tracking-widest ${s.text} self-start`}
                    >
                      {analysis.overallVerdict.replace(/_/g, " ")}
                    </div>
                  </div>

                  {analysis.summary && (
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-1.5">
                        Summary
                      </p>
                      <p className="text-white/65 leading-relaxed text-sm">{analysis.summary}</p>
                    </div>
                  )}

                  <p className="text-white/80 leading-relaxed text-base">
                    {analysis.overallExplanation}
                  </p>
                </div>
              );
            })()}

            {/* ── Claims ───────────────────────────────────────────────── */}
            {analysis.claims?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/35 px-1">
                  Individual Claims — {analysis.claims.length} examined
                </h2>

                {analysis.claims.map((claim, i) => {
                  const cs = CLAIM_STYLES[claim.verdict] ?? CLAIM_STYLES.CAUTION;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border ${cs.bg} ${cs.border} overflow-hidden card-animate`}
                    >
                      {/* Claim header */}
                      <div className="flex items-start justify-between gap-4 p-5 pb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cs.dot}`}
                          />
                          <blockquote className="text-white/85 text-base leading-relaxed font-medium">
                            "{claim.quote}"
                          </blockquote>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${cs.badge}`}
                        >
                          {CLAIM_LABELS[claim.verdict]}
                        </span>
                      </div>

                      {/* Verdict explanation */}
                      <div className="px-5 pb-4">
                        <p className={`text-sm leading-relaxed font-medium ${cs.text}`}>
                          {claim.verdictExplanation}
                        </p>
                      </div>

                      {/* Detail grid */}
                      <div className="grid sm:grid-cols-3 gap-px bg-white/5 border-t border-white/10">
                        {[
                          {
                            label: "Scripture",
                            content: claim.scriptureCheck,
                            icon: "📖",
                          },
                          {
                            label: "Historic Faith",
                            content: claim.historicCheck,
                            icon: "⛪",
                          },
                          {
                            label: "Theologian Note",
                            content: claim.theologianNote,
                            icon: "✍",
                          },
                        ].map(({ label, content, icon }) => (
                          <div
                            key={label}
                            className="bg-black/30 px-4 py-3 space-y-1.5"
                          >
                            <p className="text-xs font-bold uppercase tracking-wider text-white/30">
                              {icon} {label}
                            </p>
                            <p className="text-white/60 text-sm leading-relaxed">
                              {content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Red Flags ────────────────────────────────────────────── */}
            {analysis.redFlags?.length > 0 && (
              <div className="rounded-xl border border-orange-500/25 bg-orange-500/8 p-6 card-animate">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400/80 mb-4">
                  ⚠ Red Flags
                </h3>
                <ul className="space-y-2.5">
                  {analysis.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/65 leading-relaxed">
                      <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Recommendations ──────────────────────────────────────── */}
            {analysis.recommendations?.length > 0 && (
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/8 p-6 card-animate">
                <h3 className="text-xs font-black uppercase tracking-widest text-violet-400/80 mb-4">
                  → Recommended Resources
                </h3>
                <ul className="space-y-2.5">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/65 leading-relaxed">
                      <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Reset Button ──────────────────────────────────────────── */}
            <div className="flex justify-center pt-6 pb-4">
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 py-3 px-8 rounded-xl font-semibold border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all duration-200"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Analyze Another Sermon
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] mt-16 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-3">
          <p className="text-white/35 text-sm leading-relaxed max-w-xl mx-auto">
            AI-assisted analysis is a tool, not a substitute for prayerful study,
            your local church, or godly counsel.
          </p>
          <p className="text-white/20 text-xs">
            Framework: reformed-evangelical — Scripture-first, ecumenical creeds,
            Reformation confessions.{" "}
            <span className="text-white/15">
              Built with Next.js + FastAPI + Claude.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
