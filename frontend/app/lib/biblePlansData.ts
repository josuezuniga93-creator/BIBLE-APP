// ─── Bible Reading Plans ──────────────────────────────────────────────────────
// Dynamic plan generation. Plans are computed from the canonical chapter list
// in bibleBooks.ts so this file stays small and maintainable.

import { buildChapterList, BIBLE_BOOKS } from "./bibleBooks";

export interface PlanDay {
  day: number; // 1-based
  date?: string; // ISO date string when plan is anchored to a start date
  readings: Array<{
    bookNum: number;
    bookName: string;
    chapter: number;
    label: string; // e.g. "Genesis 1"
  }>;
}

export interface BiblePlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  chaptersPerDay: number | "varies";
  testament: "OT" | "NT" | "FULL";
  icon: string;
  // The ordered list of {bookNum, chapter, bookName} to read in sequence
  chapters: Array<{ bookNum: number; chapter: number; bookName: string }>;
}

// ─── Plan Definitions ─────────────────────────────────────────────────────────

function buildCanonicalOrder() {
  return buildChapterList(); // Genesis 1 → Revelation 22
}

function buildChronologicalOrder() {
  // Approximate chronological reading order (well-accepted evangelical sequence)
  const CHRON_ORDER: number[] = [
    1, 2, 3, 4, 5, // Pentateuch
    6, 7, 8,       // Joshua, Judges, Ruth
    18,            // Job (patriarchal era)
    9, 10,         // 1–2 Samuel
    19,            // Psalms of David (woven in)
    11,            // 1 Kings 1–11 / Proverbs / Song of Solomon
    20, 22,        // Proverbs, Song of Solomon
    12,            // 1 Kings 12 → 2 Kings
    13, 14,        // 1–2 Chronicles
    28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, // Minor prophets (OT)
    23, 24, 25, 26, 27, // Major prophets
    15, 16, 17,    // Ezra, Nehemiah, Esther
    21,            // Ecclesiastes
    // NT
    40, 41, 42, 43, 44, // Gospels + Acts
    45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // Pauline
    58, 59, 60, 61, 62, 63, 64, 65, 66, // General + Revelation
  ];

  const list: Array<{ bookNum: number; chapter: number; bookName: string }> = [];
  for (const bookNum of CHRON_ORDER) {
    const book = BIBLE_BOOKS.find((b) => b.num === bookNum);
    if (!book) continue;
    for (let ch = 1; ch <= book.chapters; ch++) {
      list.push({ bookNum, chapter: ch, bookName: book.name });
    }
  }
  return list;
}

function buildNTFirstOrder() {
  const list: Array<{ bookNum: number; chapter: number; bookName: string }> = [];
  // NT first, then OT
  for (const book of BIBLE_BOOKS.filter((b) => b.testament === "NT")) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      list.push({ bookNum: book.num, chapter: ch, bookName: book.name });
    }
  }
  for (const book of BIBLE_BOOKS.filter((b) => b.testament === "OT")) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      list.push({ bookNum: book.num, chapter: ch, bookName: book.name });
    }
  }
  return list;
}

function buildNTOnly() {
  const list: Array<{ bookNum: number; chapter: number; bookName: string }> = [];
  for (const book of BIBLE_BOOKS.filter((b) => b.testament === "NT")) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      list.push({ bookNum: book.num, chapter: ch, bookName: book.name });
    }
  }
  return list;
}

function buildPsalmsProverbs() {
  const list: Array<{ bookNum: number; chapter: number; bookName: string }> = [];
  for (const bookNum of [19, 20]) {
    const book = BIBLE_BOOKS.find((b) => b.num === bookNum)!;
    for (let ch = 1; ch <= book.chapters; ch++) {
      list.push({ bookNum, chapter: ch, bookName: book.name });
    }
  }
  return list;
}

// ─── Exported Plans ──────────────────────────────────────────────────────────

export const BIBLE_PLANS: BiblePlan[] = [
  {
    id: "year-canonical",
    name: "Bible in a Year",
    description:
      "Read through all 1,189 chapters of the Bible in canonical order — Genesis to Revelation — in exactly one year at ~3.25 chapters per day.",
    totalDays: 365,
    chaptersPerDay: "varies",
    testament: "FULL",
    icon: "📅",
    chapters: buildCanonicalOrder(),
  },
  {
    id: "chronological",
    name: "Chronological Bible",
    description:
      "Read the Bible in approximate historical order, following the storyline of Scripture from creation through Revelation.",
    totalDays: 365,
    chaptersPerDay: "varies",
    testament: "FULL",
    icon: "⏳",
    chapters: buildChronologicalOrder(),
  },
  {
    id: "nt-first",
    name: "New Testament First",
    description:
      "Begin with the New Testament — all 260 chapters — then work through the entire Old Testament. Ideal for new believers.",
    totalDays: 365,
    chaptersPerDay: "varies",
    testament: "FULL",
    icon: "✝️",
    chapters: buildNTFirstOrder(),
  },
  {
    id: "nt-90",
    name: "New Testament in 90 Days",
    description:
      "Read through all 27 books of the New Testament in 90 days at about 3 chapters per day.",
    totalDays: 90,
    chaptersPerDay: 3,
    testament: "NT",
    icon: "⚡",
    chapters: buildNTOnly(),
  },
  {
    id: "psalms-proverbs",
    name: "Psalms & Proverbs",
    description:
      "A focused 6-month journey through Israel's worship hymnbook and wisdom literature — 181 chapters of poetry, praise, and practical wisdom.",
    totalDays: 181,
    chaptersPerDay: 1,
    testament: "OT",
    icon: "🎵",
    chapters: buildPsalmsProverbs(),
  },
];

// ─── Plan Helpers ─────────────────────────────────────────────────────────────

/**
 * Given a plan and a start date, compute the daily schedule.
 * Returns a map keyed by ISO date string → PlanDay.
 */
export function generateSchedule(
  plan: BiblePlan,
  startDate: Date
): Map<string, PlanDay> {
  const schedule = new Map<string, PlanDay>();
  const chapters = plan.chapters;

  // Distribute chapters as evenly as possible across the plan's total days
  const totalChapters = chapters.length;
  const totalDays = plan.totalDays;

  let chapterIndex = 0;
  for (let day = 0; day < totalDays && chapterIndex < totalChapters; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);
    const isoDate = date.toISOString().split("T")[0];

    // How many chapters for this day? Use ceiling for early days when distributing
    const remaining = totalChapters - chapterIndex;
    const daysLeft = totalDays - day;
    const chaptersToday = Math.ceil(remaining / daysLeft);

    const readings: PlanDay["readings"] = [];
    for (let i = 0; i < chaptersToday && chapterIndex < totalChapters; i++) {
      const c = chapters[chapterIndex++];
      readings.push({
        bookNum: c.bookNum,
        bookName: c.bookName,
        chapter: c.chapter,
        label: `${c.bookName} ${c.chapter}`,
      });
    }

    schedule.set(isoDate, { day: day + 1, date: isoDate, readings });
  }

  return schedule;
}

/**
 * Given a plan and start date, return the PlanDay for today (or null if
 * today is outside the plan window or before the start date).
 */
export function getTodaysPlanDay(
  plan: BiblePlan,
  startDate: Date
): PlanDay | null {
  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + plan.totalDays - 1);

  if (today < start || today > end) return null;

  const schedule = generateSchedule(plan, startDate);
  return schedule.get(isoToday) ?? null;
}

/**
 * Calculate progress: how many chapters are covered through a given date.
 */
export function getPlanProgress(
  plan: BiblePlan,
  startDate: Date,
  throughDate: Date = new Date()
): { daysElapsed: number; totalDays: number; percentComplete: number } {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const through = new Date(throughDate);
  through.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(
    0,
    Math.min(
      plan.totalDays,
      Math.floor((through.getTime() - start.getTime()) / msPerDay) + 1
    )
  );

  return {
    daysElapsed,
    totalDays: plan.totalDays,
    percentComplete: Math.round((daysElapsed / plan.totalDays) * 100),
  };
}

/** localStorage key for a plan's start date */
export function planStartKey(planId: string) {
  return `ryc-plan-start-${planId}`;
}

/** Retrieve a plan's saved start date from localStorage (or null) */
export function getSavedStartDate(planId: string): Date | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(planStartKey(planId));
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/** Persist a plan's start date to localStorage */
export function saveStartDate(planId: string, date: Date): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(planStartKey(planId), date.toISOString().split("T")[0]);
}

/** Clear a plan's saved start date */
export function clearStartDate(planId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(planStartKey(planId));
}
