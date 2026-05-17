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
  { from: "#2d1b69", via: "#5b21b6", to: "#d97706" }, // violet → amber
  { from: "#0c1445", via: "#1d4ed8", to: "#ea580c" }, // indigo → orange
  { from: "#1a0533", via: "#7c3aed", to: "#db2777" }, // purple → pink
  { from: "#052e16", via: "#065f46", to: "#4338ca" }, // emerald → indigo
  { from: "#3b0764", via: "#9333ea", to: "#c2410c" }, // purple → red-orange
  { from: "#0f172a", via: "#0369a1", to: "#7c3aed" }, // navy → violet
  { from: "#1c1917", via: "#92400e", to: "#7f1d1d" }, // dark → deep red
] as const;

// ─── Greeting ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const verse = getTodayVerse();
  const grad  = GRADIENTS[new Date().getDate() % GRADIENTS.length];

  const [streakData,   setStreakData]   = useState<StreakData | null>(null);
  const [newBadgeIds,  setNewBadgeIds]  = useState<BadgeId[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [greeting,     setGreeting]     = useState("Good Morning");

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-5">

        {/* ── App title ─────────────────────────────────────────────────── */}
        <div className="px-1 pt-1">
          <p className="text-[10px] font-black tracking-[0.2em] text-white/25 uppercase mb-4">
            TULIP Bible App
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {greeting}, Josue
          </h1>
        </div>

        {/* ── B. Verse of the Day — full-bleed immersive card ──────────── */}
        <section
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(160deg, ${grad.from} 0%, ${grad.via} 45%, ${grad.to} 100%)`,
            minHeight: "400px",
          }}
        >
          {/* Texture overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.07) 0%, transparent 60%), " +
                "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />

          <div className="relative z-10 flex flex-col p-6" style={{ minHeight: "400px" }}>
            {/* Label */}
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
              Verse of the Day
            </p>
            <p className="text-xs font-semibold text-white/40 mb-auto">{verse.theme}</p>

            {/* Verse text */}
            <div className="py-8">
              <p className="text-[1.35rem] font-light text-white leading-relaxed italic drop-shadow-sm">
                &ldquo;{verse.text}&rdquo;
              </p>
            </div>

            {/* Reference + actions */}
            <div>
              <p className="text-sm font-bold text-white/80 mb-4">{verse.reference}</p>
              <div className="flex gap-2.5">
                <Link
                  href={`/lexicon?book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}`}
                  className="flex-1 text-center py-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold active:bg-white/30 transition-all"
                >
                  📖 Read Chapter
                </Link>
                <a
                  href={verse.matthewHenryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 rounded-2xl bg-black/25 backdrop-blur-sm text-white/80 text-sm font-semibold active:bg-black/40 transition-all"
                >
                  📜 Commentary
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── C. Streak ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
          {toastVisible && newBadgeIds.length > 0 && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] text-amber-300 text-xs font-semibold animate-pulse">
              <span>{BADGES[newBadgeIds[0]].emoji}</span>
              <span>New badge: {newBadgeIds.map((id) => BADGES[id].label).join(", ")}!</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div className="flex-1 min-w-0">
              {streakData && streakData.streak > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{streakData.streak}</span>
                  <span className="text-sm font-semibold text-white/45">day streak</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-white/40">Start your streak today!</span>
              )}
              {streakData && streakData.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {streakData.badges.slice(0, 4).map((id) => (
                    <span key={id} title={BADGES[id].desc}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-300 text-[10px] font-semibold">
                      {BADGES[id].emoji} {BADGES[id].label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}
