// ─── Devotional Completion Progress ──────────────────────────────────────────
// localStorage key: "tulip_devotional_v1"
// Tracks which family-worship devotionals have been completed.

export type DevotionalBadgeId = string;
export type DevotionalSectionId = "scripture" | "meditation" | "hymn" | "prayer";

export const DEVOTIONAL_SECTION_IDS: DevotionalSectionId[] = [
  "scripture",
  "meditation",
  "hymn",
  "prayer",
];

export interface DevotionalProgress {
  completed: string[];                          // "YYYY-MM-DD" date strings
  badges: DevotionalBadgeId[];
  badgeEarnedDates: Record<string, string>;
  sections: Record<string, DevotionalSectionId[]>;
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
    sections: {},
  };
}

function normalizeSections(value: unknown): Record<string, DevotionalSectionId[]> {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(source).map(([dateStr, sectionIds]) => [
      dateStr,
      Array.isArray(sectionIds)
        ? sectionIds.filter((id): id is DevotionalSectionId =>
            DEVOTIONAL_SECTION_IDS.includes(id as DevotionalSectionId)
          )
        : [],
    ])
  );
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
    parsed.sections = normalizeSections(parsed.sections);
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
  const sections = {
    ...prev.sections,
    [dateStr]: DEVOTIONAL_SECTION_IDS,
  };
  if (prev.completed.includes(dateStr)) {
    const progress = { ...prev, sections };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch { /* quota exceeded — silent fail */ }
    return { progress, newBadges: [] };
  }

  const completed = [...prev.completed, dateStr];
  const next: DevotionalProgress = {
    completed,
    badges: prev.badges,
    badgeEarnedDates: prev.badgeEarnedDates,
    sections,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* quota exceeded — silent fail */ }

  return { progress: next, newBadges: [] };
}

export function getDevotionalSectionProgress(dateStr: string): {
  completedSections: DevotionalSectionId[];
  total: number;
  percent: number;
  isComplete: boolean;
} {
  const progress = loadDevotionalProgress();
  const completedSections = progress.completed.includes(dateStr)
    ? DEVOTIONAL_SECTION_IDS
    : progress.sections[dateStr] ?? [];
  const uniqueCompleted = DEVOTIONAL_SECTION_IDS.filter((id) => completedSections.includes(id));
  const total = DEVOTIONAL_SECTION_IDS.length;
  return {
    completedSections: uniqueCompleted,
    total,
    percent: Math.round((uniqueCompleted.length / total) * 100),
    isComplete: uniqueCompleted.length === total,
  };
}

export function markDevotionalSection(dateStr: string, sectionId: DevotionalSectionId): DevotionalProgress {
  const prev = loadDevotionalProgress();
  const existing = prev.completed.includes(dateStr)
    ? DEVOTIONAL_SECTION_IDS
    : prev.sections[dateStr] ?? [];
  const nextSectionsForDate = DEVOTIONAL_SECTION_IDS.filter((id) =>
    id === sectionId || existing.includes(id)
  );
  const isComplete = nextSectionsForDate.length === DEVOTIONAL_SECTION_IDS.length;
  const completed = isComplete && !prev.completed.includes(dateStr)
    ? [...prev.completed, dateStr]
    : prev.completed;
  const next: DevotionalProgress = {
    completed,
    badges: prev.badges,
    badgeEarnedDates: prev.badgeEarnedDates,
    sections: {
      ...prev.sections,
      [dateStr]: nextSectionsForDate,
    },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* quota exceeded — silent fail */ }
  return next;
}
