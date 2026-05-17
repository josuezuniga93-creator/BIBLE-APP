"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTodayVerse } from "./lib/dailyVerses";
import {
  loadStreak,
  recordLogin,
  getNewBadges,
  BADGES,
  type StreakData,
  type BadgeId,
} from "./lib/streakData";

// ─── Verse card gradients (rotate by day) ────────────────────────────────────

const GRADIENTS = [
  { from: "#2d1b69", via: "#5b21b6", to: "#d97706" },
  { from: "#0c1445", via: "#1d4ed8", to: "#ea580c" },
  { from: "#1a0533", via: "#7c3aed", to: "#db2777" },
  { from: "#052e16", via: "#065f46", to: "#4338ca" },
  { from: "#3b0764", via: "#9333ea", to: "#c2410c" },
  { from: "#0f172a", via: "#0369a1", to: "#7c3aed" },
  { from: "#1c1917", via: "#92400e", to: "#7f1d1d" },
] as const;

// Featured guided scripture video
const GUIDED_VIDEO = {
  id: "e50Rgh7rGw8",
  title: "Shocking Youth Message",
  speaker: "Paul Washer",
  tag: "Gospel",
};

// ─── Greeting ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

// ─── Share helper ─────────────────────────────────────────────────────────────

async function shareApp() {
  const data = {
    title: "TULIP Bible App",
    text: "Study Scripture with Strong's Concordance, Matthew Henry Commentary, and daily verse. Free & Reformed.",
    url: "https://tulip-bible-app.vercel.app",
  };
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(data);
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(data.url);
      alert("Link copied!");
    }
  } catch {
    // cancelled or unavailable
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const verse = getTodayVerse();
  const grad  = GRADIENTS[new Date().getDate() % GRADIENTS.length];

  const [streakData,   setStreakData]   = useState<StreakData | null>(null);
  const [newBadgeIds,  setNewBadgeIds]  = useState<BadgeId[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [greeting,     setGreeting]     = useState("Good Morning");
  const [videoOpen,    setVideoOpen]    = useState(false);

  useEffect(() => { setGreeting(getGreeting()); }, []);

  useEffect(() => {
    const prev = loadStreak();
    const next = recordLogin();
    const earned = getNewBadges(prev, next);
    setStreakData(next);
    if (earned.length > 0) {
      setNewBadgeIds(earned);
      setToastVisible(true);
      const timer = setTimeout(() => setToastVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const allBadgeIds = (Object.keys(BADGES) as BadgeId[]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── Video modal ───────────────────────────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${GUIDED_VIDEO.id}?autoplay=1&rel=0`}
                title={GUIDED_VIDEO.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-violet-400 font-bold mb-0.5">{GUIDED_VIDEO.speaker}</p>
                <h2 className="text-sm font-bold text-white/90">{GUIDED_VIDEO.title}</h2>
              </div>
              <button
                onClick={() => setVideoOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-4">

        {/* ── Header row: greeting + share ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-white/25 uppercase mb-1">
              TULIP Bible App
            </p>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {greeting} 👋
            </h1>
          </div>
          <button
            onClick={shareApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white/50 text-xs font-semibold hover:bg-white/[0.09] hover:text-white/75 transition-all active:scale-95"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Share
          </button>
        </div>

        {/* ── Verse of the Day ──────────────────────────────────────────────── */}
        <section
          className="relative rounded-3xl overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(160deg, ${grad.from} 0%, ${grad.via} 45%, ${grad.to} 100%)`,
            minHeight: "260px",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.07) 0%, transparent 60%), " +
                "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, transparent 40%, rgba(0,0,0,0.50) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col p-5" style={{ minHeight: "260px" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">
              Verse of the Day
            </p>
            <p className="text-[10px] font-semibold text-white/35 mb-auto">{verse.theme}</p>
            <div className="py-5">
              <p className="text-base font-light text-white leading-relaxed italic drop-shadow-sm">
                &ldquo;{verse.text}&rdquo;
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-white/80 mb-3">{verse.reference}</p>
              <div className="flex gap-2">
                <Link
                  href={`/lexicon?book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}`}
                  className="flex-1 text-center py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-semibold active:bg-white/30 transition-all"
                >
                  📖 Read Chapter
                </Link>
                <a
                  href={verse.matthewHenryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 rounded-xl bg-black/25 backdrop-blur-sm text-white/80 text-xs font-semibold active:bg-black/40 transition-all"
                >
                  📜 Commentary
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Streak ────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
          {toastVisible && newBadgeIds.length > 0 && (
            <div className="mb-2.5 flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] text-amber-300 text-xs font-semibold animate-pulse">
              <span>{BADGES[newBadgeIds[0]].emoji}</span>
              <span>New badge: {newBadgeIds.map((id) => BADGES[id].label).join(", ")}!</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div className="flex-1 min-w-0">
              {streakData && streakData.streak > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white">{streakData.streak}</span>
                  <span className="text-xs font-semibold text-white/45">day streak</span>
                  {streakData.longestStreak > 1 && (
                    <span className="text-[10px] text-white/20 ml-1">· best {streakData.longestStreak}</span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-semibold text-white/40">Start your streak today!</span>
              )}
              <p className="text-[10px] text-white/20 mt-0.5">
                {streakData
                  ? `${streakData.totalLogins} total visit${streakData.totalLogins !== 1 ? "s" : ""}`
                  : "Open daily to build your streak"}
              </p>
            </div>
          </div>
        </section>

        {/* ── Guided Scripture ──────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-2 px-1">
            Guided Scripture
          </p>
          <button
            onClick={() => setVideoOpen(true)}
            className="w-full rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:border-violet-500/30 transition-all active:scale-[0.99] text-left"
          >
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <img
                src={`https://img.youtube.com/vi/${GUIDED_VIDEO.id}/hqdefault.jpg`}
                alt={GUIDED_VIDEO.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <span className="text-white text-lg ml-1">▶</span>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600/80 text-white">
                  {GUIDED_VIDEO.tag}
                </span>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] text-violet-400 font-bold mb-0.5">{GUIDED_VIDEO.speaker}</p>
              <p className="text-sm font-bold text-white/85">{GUIDED_VIDEO.title}</p>
              <p className="text-[10px] text-white/35 mt-0.5">Tap to play · fullscreen available</p>
            </div>
          </button>
          <Link
            href="/videos"
            className="block mt-2 text-center text-xs text-white/25 hover:text-white/45 transition-colors py-1"
          >
            Browse all teachings →
          </Link>
        </section>

        {/* ── Badges showcase ───────────────────────────────────────────────── */}
        <section className="pt-2">
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">
            Badges
          </p>
          <div className="grid grid-cols-4 gap-2">
            {allBadgeIds.map((id) => {
              const earned = streakData?.badges.includes(id) ?? false;
              const badge  = BADGES[id];
              return (
                <div
                  key={id}
                  title={badge.desc}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                    earned
                      ? "border-violet-500/35 bg-violet-500/10"
                      : "border-white/[0.06] bg-white/[0.02] opacity-40"
                  }`}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className={`text-[9px] font-bold text-center leading-tight ${
                    earned ? "text-violet-300/90" : "text-white/30"
                  }`}>
                    {badge.label}
                  </span>
                  <span className={`text-[8px] font-mono ${earned ? "text-violet-400/50" : "text-white/20"}`}>
                    {earned ? "✓ earned" : `${badge.threshold}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
