"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  getDevotionalForDate,
  DailyDevotional,
} from "../lib/devotionalData";
import { getHymnLyrics } from "../lib/hymnLyrics";
import {
  loadDevotionalProgress,
  markDevotionalComplete,
  isDevotionalComplete,
  DEVOTIONAL_BADGES,
  DevotionalBadgeId,
} from "../lib/devotionalProgress";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Hymn YouTube links ───────────────────────────────────────────────────────

function hymnYouTubeUrl(title: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " hymn lyrics")}`;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#a855f7", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];

function ConfettiOverlay() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.8,
        size: Math.random() * 10 + 6,
        shape: i % 3 === 0 ? "circle" : "rect",
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {/* Celebration emoji burst */}
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div className="animate-pop-in text-7xl">🎉</div>
      </div>
    </div>
  );
}

// ─── Scripture + Ryle Card ────────────────────────────────────────────────────

function ScriptureAndDevotionalCard({ entry }: { entry: DailyDevotional }) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden">
      {/* Passage reference banner */}
      <div className="px-6 pt-6 pb-4 border-b border-violet-500/10">
        <p className="text-[10px] text-violet-400 font-black uppercase tracking-widest mb-2">
          📖 Expository Thoughts on the Gospels · J.C. Ryle
        </p>
        <p className="text-2xl font-black text-white leading-tight">
          {entry.scripture.reference}
        </p>
        <p className="text-xs text-white/30 mt-1">{entry.scripture.translation}</p>
      </div>

      {/* Scripture blockquote */}
      <div className="px-6 py-5 border-b border-violet-500/10 bg-violet-500/[0.03]">
        <blockquote className="border-l-4 border-violet-500/50 pl-4">
          <p className="text-white/90 leading-8 text-[16px] italic">
            &ldquo;{entry.scripture.text}&rdquo;
          </p>
          <p className="text-violet-300 font-bold text-sm mt-3">
            — {entry.scripture.reference}
          </p>
        </blockquote>
        <p className="text-xs text-white/20 mt-4 leading-5">
          Read the passage aloud. Younger children may listen; older children may take turns reading.
        </p>
      </div>

      {/* Ryle's exposition */}
      <div className="px-6 py-6 space-y-4">
        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">
          Meditation
        </p>
        {entry.devotional.split("\n\n").map((para, i) => (
          <p key={i} className="text-white/80 leading-8 text-[16px]">
            {para}
          </p>
        ))}
      </div>

      {/* Attribution */}
      <div className="px-6 pb-6">
        <p className="text-white/20 text-xs italic border-t border-violet-500/10 pt-4">
          — Adapted from J.C. Ryle,{" "}
          <em>Expository Thoughts on the Gospels</em> (1856–1869)
        </p>
      </div>
    </div>
  );
}

// ─── Hymn Card ────────────────────────────────────────────────────────────────

function HymnCard({ entry }: { entry: DailyDevotional }) {
  const lyrics = getHymnLyrics(entry.hymn.title);
  const [audioOpen, setAudioOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-sky-500/10">
        <p className="text-[10px] text-sky-400 font-black mb-2 uppercase tracking-widest">
          🎵 Hymn
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-snug">
              &ldquo;{entry.hymn.title}&rdquo;
            </p>
            <p className="text-white/30 text-xs mt-1">
              {entry.hymn.author} · {entry.hymn.year}
            </p>
          </div>
          {/* Listen button */}
          <button
            onClick={() => {
              setAudioOpen(!audioOpen);
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-bold hover:bg-sky-500/25 active:scale-95 transition-all"
          >
            {audioOpen ? "▼ Close" : "▶ Listen"}
          </button>
        </div>
      </div>

      {/* YouTube embed panel */}
      {audioOpen && (
        <div className="px-6 py-4 border-b border-sky-500/10 bg-sky-500/[0.04]">
          <p className="text-xs text-white/40 mb-3 leading-5">
            Tap below to find this hymn on YouTube and sing along together as a family.
          </p>
          <a
            href={hymnYouTubeUrl(entry.hymn.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#FF0000]/15 border border-[#FF0000]/20 hover:bg-[#FF0000]/25 active:scale-95 transition-all"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <div>
              <p className="text-white/80 font-bold text-sm">{entry.hymn.title}</p>
              <p className="text-white/35 text-xs">Open in YouTube →</p>
            </div>
          </a>
        </div>
      )}

      {/* Lyrics */}
      <div className="px-6 py-5">
        {lyrics ? (
          <div className="space-y-5">
            {lyrics.verses.map((verse, i) => (
              <div key={i}>
                <p className="text-[11px] text-sky-400/50 font-bold uppercase tracking-widest mb-2">
                  Verse {i + 1}
                </p>
                <p className="text-white/70 text-[15px] leading-8 italic whitespace-pre-line">
                  {verse}
                </p>
              </div>
            ))}
            {lyrics.chorus && (
              <div className="border-t border-sky-500/15 pt-4">
                <p className="text-[11px] text-sky-400/50 font-bold uppercase tracking-widest mb-2">
                  Chorus
                </p>
                <p className="text-white/70 text-[15px] leading-8 italic whitespace-pre-line">
                  {lyrics.chorus}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/40 text-[15px] leading-7 italic">
            {entry.hymn.firstLine
              ? `"${entry.hymn.firstLine}…"`
              : "See The Baptist Hymnal for full text."}
          </p>
        )}
        <p className="mt-5 text-xs text-white/20">
          Sing or read aloud together as a family.
        </p>
      </div>
    </div>
  );
}

// ─── Completion Card ──────────────────────────────────────────────────────────

function CompletionCard({
  dateStr,
  onComplete,
}: {
  dateStr: string;
  onComplete: (newBadges: DevotionalBadgeId[]) => void;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(isDevotionalComplete(dateStr));
  }, [dateStr]);

  function handleComplete() {
    const { newBadges } = markDevotionalComplete(dateStr);
    setDone(true);
    onComplete(newBadges);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-6 py-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">
          ✅
        </div>
        <div>
          <p className="text-emerald-300 font-bold text-sm">Devotional Completed!</p>
          <p className="text-white/30 text-xs mt-0.5">Well done, faithful family. Come back tomorrow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.05] px-6 py-6 text-center space-y-4">
      <div className="text-3xl">🙏</div>
      <div>
        <p className="text-white font-bold text-base">Did you complete today&apos;s devotional?</p>
        <p className="text-white/35 text-sm mt-1">
          Scripture, meditation, and hymn as a family.
        </p>
      </div>
      <button
        onClick={handleComplete}
        className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-violet-500/20"
      >
        Yes, we completed it! 🎉
      </button>
    </div>
  );
}

// ─── Badge Toast ──────────────────────────────────────────────────────────────

function BadgeToast({ badges }: { badges: DevotionalBadgeId[] }) {
  if (badges.length === 0) return null;
  const badge = DEVOTIONAL_BADGES[badges[0]];
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-pop-in">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#1a1a2e] border border-violet-500/40 shadow-2xl shadow-violet-500/20">
        <span className="text-3xl">{badge.emoji}</span>
        <div>
          <p className="text-violet-300 font-black text-sm">New Badge Earned!</p>
          <p className="text-white/60 text-xs mt-0.5">{badge.label} — {badge.desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyWorshipPage() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadges, setNewBadges] = useState<DevotionalBadgeId[]>([]);

  // Restore last-viewed date from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("axiom-fw-date");
      if (stored) {
        const d = new Date(stored);
        if (!isNaN(d.getTime())) {
          d.setHours(0, 0, 0, 0);
          setSelectedDate(d);
        }
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  function goToDate(d: Date) {
    setSelectedDate(d);
    try { localStorage.setItem("axiom-fw-date", d.toISOString()); } catch { /**/ }
  }

  function goToToday() {
    setSelectedDate(today);
    try { localStorage.removeItem("axiom-fw-date"); } catch { /**/ }
  }

  const handleComplete = useCallback((earned: DevotionalBadgeId[]) => {
    setShowConfetti(true);
    if (earned.length > 0) setNewBadges(earned);
    setTimeout(() => setShowConfetti(false), 2500);
    setTimeout(() => setNewBadges([]), 4000);
  }, []);

  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth()    === today.getMonth() &&
    selectedDate.getDate()     === today.getDate();

  const dailyEntry = getDevotionalForDate(selectedDate);
  const dayOfYear  = getDayOfYear(selectedDate);
  const dateStr    = toDateStr(selectedDate);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiOverlay />}

      {/* Badge toast */}
      {newBadges.length > 0 && <BadgeToast badges={newBadges} />}

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-6">
        <div className="mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
            Family Worship
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
          Family Worship
        </h1>
        <p className="text-white/40 text-sm leading-relaxed">
          One devotional per day — scripture, meditation, and hymn for the whole family.
        </p>
      </div>

      {/* Date navigator */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="bg-white/[0.02] border border-violet-500/20 rounded-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToDate(addDays(selectedDate, -1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-violet-500/20 text-violet-400 hover:text-violet-200 hover:bg-violet-500/10 transition-all"
              aria-label="Previous day"
            >
              ←
            </button>
            <div className="flex-1 text-center">
              <p className="text-white font-bold text-base">{formatDateDisplay(selectedDate)}</p>
              <p className="text-violet-400/50 text-xs mt-0.5">Day {dayOfYear}</p>
            </div>
            <button
              onClick={() => goToDate(addDays(selectedDate, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-violet-500/20 text-violet-400 hover:text-violet-200 hover:bg-violet-500/10 transition-all"
              aria-label="Next day"
            >
              →
            </button>
          </div>
          {!isToday && (
            <div className="text-center mt-3">
              <button
                onClick={goToToday}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full"
              >
                Back to Today
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-4">
        {dailyEntry ? (
          <>
            {/* Theme badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
                {dailyEntry.theme}
              </span>
              {isToday && (
                <span className="text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full">
                  Today
                </span>
              )}
            </div>

            {/* 1. Scripture + Ryle Devotional */}
            <ScriptureAndDevotionalCard entry={dailyEntry} />

            {/* 2. Hymn */}
            <HymnCard entry={dailyEntry} />

            {/* 3. Completion prompt */}
            <CompletionCard dateStr={dateStr} onComplete={handleComplete} />
          </>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-white/60 font-semibold mb-1">No devotional for this date yet</p>
            <p className="text-white/30 text-sm leading-6">
              The devotional calendar is being built out for the full year.
              Try today&apos;s entry or browse nearby dates.
            </p>
            <button
              onClick={goToToday}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-colors"
            >
              Go to Today
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 text-center">
          <p className="text-white/20 text-xs leading-5">
            &ldquo;Train up a child in the way he should go; even when he is old he will not depart from it.&rdquo;
            <br />— Proverbs 22:6
          </p>
        </div>
      </div>
    </div>
  );
}
