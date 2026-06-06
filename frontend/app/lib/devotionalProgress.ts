// ─── Devotional Completion Progress ──────────────────────────────────────────
// localStorage key: "tulip_devotional_v1"
// Tracks which family-worship devotionals have been completed.

export type DevotionalBadgeId = string;

export interface DevotionalProgress {
  completed: string[];                          // "YYYY-MM-DD" date strings
  badges: DevotionalBadgeId[];
  badgeEarnedDates: Record<string, string>;
}

export const DEVOTIONAL_BADGES: Record<
  DevotionalBadgeId,
  { label: string; labelEs: string; emoji: string; desc: string; descEs: string; threshold: number }
> = {};

const STORAGE_KEY = "tulip_devotional_v1";

function defaultProgress(): DevotionalProgress {
  return {
    completed: [],
    badges: [],
    badgeEarnedDates: {} as Record<string, string>,
  };
}

export function loadDevotionalProgress(): DevotionalProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as DevotionalProgress;
    if (!Array.isArray(parsed.completed)) parsed.completed = [];
    if (!Array.isArray(parsed.badges)) parsed.badges = [];
    if (!parsed.badgeEarnedDates) parsed.badgeEarnedDates = {} as Record<string, string>;
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export function isDevotionalComplete(dateStr: string): boolean {
  return loadDevotionalProgress().completed.includes(dateStr);
}

export function markDevotionalComplete(dateStr: string): {
  progress: DevotionalProgress;
  newBadges: DevotionalBadgeId[];
} {
  const prev = loadDevotionalProgress();
  if (prev.completed.includes(dateStr)) return { progress: prev, newBadges: [] };

  const completed = [...prev.completed, dateStr];
  const next: DevotionalProgress = {
    completed,
    badges: [],
    badgeEarnedDates: {},
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* quota exceeded — silent fail */ }

  return { progress: next, newBadges: [] };
}
