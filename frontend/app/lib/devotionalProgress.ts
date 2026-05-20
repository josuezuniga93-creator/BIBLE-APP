// ─── Devotional Completion Progress ──────────────────────────────────────────
// localStorage key: "tulip_devotional_v1"
// Tracks which family-worship devotionals have been completed and awards badges.

export type DevotionalBadgeId =
  | "first_devotional"
  | "week_devotional"
  | "fortnight_devotional"
  | "monthly_devotional"
  | "three_months_devotional"
  | "year_devotional";

export interface DevotionalProgress {
  completed: string[];                          // "YYYY-MM-DD" date strings
  badges: DevotionalBadgeId[];
  badgeEarnedDates: Record<string, string>;
}

export const DEVOTIONAL_BADGES: Record<
  DevotionalBadgeId,
  { label: string; emoji: string; desc: string; threshold: number }
> = {
  first_devotional: {
    label: "First Devotion",
    emoji: "🙏",
    desc: "Completed your first family devotional.",
    threshold: 1,
  },
  week_devotional: {
    label: "Faithful Week",
    emoji: "📖",
    desc: "Completed 7 family devotionals.",
    threshold: 7,
  },
  fortnight_devotional: {
    label: "Two Weeks",
    emoji: "✝️",
    desc: "Completed 14 family devotionals.",
    threshold: 14,
  },
  monthly_devotional: {
    label: "Month of Worship",
    emoji: "🕊️",
    desc: "Completed 30 family devotionals.",
    threshold: 30,
  },
  three_months_devotional: {
    label: "90 Days",
    emoji: "🌿",
    desc: "Completed 90 family devotionals.",
    threshold: 90,
  },
  year_devotional: {
    label: "Year of Devotion",
    emoji: "👑",
    desc: "Completed 365 family devotionals.",
    threshold: 365,
  },
};

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
  const count = completed.length;
  const todayStr = new Date().toISOString().slice(0, 10);

  const badges = [...prev.badges];
  const badgeEarnedDates = { ...prev.badgeEarnedDates };
  const newBadges: DevotionalBadgeId[] = [];

  for (const [id, badge] of Object.entries(DEVOTIONAL_BADGES) as [
    DevotionalBadgeId,
    (typeof DEVOTIONAL_BADGES)[DevotionalBadgeId]
  ][]) {
    if (!badges.includes(id) && count >= badge.threshold) {
      badges.push(id);
      badgeEarnedDates[id] = todayStr;
      newBadges.push(id);
    }
  }

  const next: DevotionalProgress = { completed, badges, badgeEarnedDates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* quota exceeded — silent fail */ }

  return { progress: next, newBadges };
}
