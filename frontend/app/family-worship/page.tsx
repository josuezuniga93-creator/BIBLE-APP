"use client";

import { useState, useMemo, useEffect } from "react";
import {
  getDevotionalForDate,
  DailyDevotional,
} from "../lib/devotionalData";
import { getHymnLyrics } from "../lib/hymnLyrics";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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

// ─── Content Sections ─────────────────────────────────────────────────────────

/** Scripture + Ryle exposition merged into one card */
function ScriptureAndDevotionalCard({ entry }: { entry: DailyDevotional }) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-1">
          📖 Scripture &amp; Devotional
        </p>
        <p className="text-xs text-white/25">
          {entry.scripture.reference} · {entry.scripture.translation}
        </p>
      </div>

      {/* Scripture blockquote */}
      <blockquote className="border-l-4 border-violet-500/40 pl-4">
        <p className="text-white/85 leading-8 text-[16px] italic">
          &ldquo;{entry.scripture.text}&rdquo;
        </p>
        <p className="text-violet-300 font-bold text-sm mt-3">
          — {entry.scripture.reference}
        </p>
      </blockquote>

      <p className="text-xs text-white/20 leading-5">
        Read the passage aloud. Younger children may listen; older may take turns reading.
      </p>

      {/* Divider */}
      <div className="border-t border-violet-500/10" />

      {/* Ryle's exposition */}
      <div className="space-y-4">
        {entry.devotional.split("\n\n").map((para, i) => (
          <p key={i} className="text-white/75 leading-8 text-[16px]">
            {para}
          </p>
        ))}
      </div>

      {/* Attribution */}
      <p className="text-white/25 text-xs italic border-t border-violet-500/10 pt-4">
        — Adapted from J.C. Ryle, <em>Expository Thoughts on the Gospels</em> (1856–1869)
      </p>
    </div>
  );
}

function PrayerCard({ entry }: { entry: DailyDevotional }) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-6">
      <p className="text-xs text-rose-400 font-bold mb-4 uppercase tracking-widest">
        🙏 Family Prayer
      </p>
      <div className="bg-rose-500/[0.06] border border-rose-500/15 rounded-xl p-5">
        <p className="text-white/75 text-[15px] leading-8 italic">
          {entry.prayer}
        </p>
      </div>
      <p className="text-white/20 text-xs mt-4 leading-5">
        Close in prayer together as a family. Let the passage shape what you bring before God.
      </p>
    </div>
  );
}

function HymnCard({ entry }: { entry: DailyDevotional }) {
  const lyrics = getHymnLyrics(entry.hymn.title);

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-6">
      <p className="text-xs text-sky-400 font-bold mb-3 uppercase tracking-widest">
        🎵 Hymn
      </p>
      <p className="text-white font-bold text-base mb-0.5">
        &ldquo;{entry.hymn.title}&rdquo;
      </p>
      <p className="text-white/30 text-xs mb-5">
        {entry.hymn.author} · {entry.hymn.year} · Public Domain
      </p>

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
          {entry.hymn.firstLine ? `"${entry.hymn.firstLine}…"` : "Sing or read from your hymnal."}
        </p>
      )}

      <p className="mt-5 text-xs text-white/20">
        Sing or read aloud together. All hymns are public domain.
      </p>
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

  // Restore the last-viewed date from localStorage so it survives the hard
  // page reload that Google Translate triggers on language switch.
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
    } catch {
      // localStorage unavailable — stay on today
    }
  }, []);

  /** Navigate to a date and persist the choice. */
  function goToDate(d: Date) {
    setSelectedDate(d);
    try {
      localStorage.setItem("axiom-fw-date", d.toISOString());
    } catch { /* ignore */ }
  }

  /** Navigate back to today and clear the stored date. */
  function goToToday() {
    setSelectedDate(today);
    try {
      localStorage.removeItem("axiom-fw-date");
    } catch { /* ignore */ }
  }

  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  const dailyEntry = getDevotionalForDate(selectedDate);
  const dayOfYear = getDayOfYear(selectedDate);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
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
          One devotional per day — scripture, meditation, prayer, and hymn for the whole family.
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

            {/* 1. Scripture + Devotional (merged) */}
            <ScriptureAndDevotionalCard entry={dailyEntry} />

            {/* 3. Family Prayer */}
            <PrayerCard entry={dailyEntry} />

            {/* 4. Hymn */}
            <HymnCard entry={dailyEntry} />
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
