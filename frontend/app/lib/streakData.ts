// ─── Streak System ────────────────────────────────────────────────────────────
// localStorage key: "tulip_streak_v1"

export type BadgeId = string;

export interface StreakData {
  lastLogin: string;                          // "YYYY-MM-DD"
  streak: number;                             // current consecutive days
  longestStreak: number;
  totalLogins: number;
  badges: BadgeId[];
  badgeEarnedDates: Record<BadgeId, string>;
}

export const BADGES: Record<
  BadgeId,
  { label: string; emoji: string; desc: string; threshold: number }
> = {};

const STORAGE_KEY = "tulip_streak_v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultStreak(): StreakData {
  return {
    lastLogin: "",
    streak: 0,
    longestStreak: 0,
    totalLogins: 0,
    badges: [],
    badgeEarnedDates: {} as Record<BadgeId, string>,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Load streak from localStorage. Returns a default object if not found or invalid. */
export function loadStreak(): StreakData {
  if (typeof window === "undefined") return defaultStreak();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStreak();
    const parsed = JSON.parse(raw) as StreakData;
    // Ensure badges arrays exist (migration safety)
    if (!Array.isArray(parsed.badges)) parsed.badges = [];
    if (!parsed.badgeEarnedDates) parsed.badgeEarnedDates = {} as Record<BadgeId, string>;
    return parsed;
  } catch {
    return defaultStreak();
  }
}

/**
 * Record today's login. Should be called once on page mount (inside useEffect).
 * - If lastLogin is today → no-op (return unchanged)
 * - If lastLogin is yesterday → increment streak
 * - Otherwise → reset streak to 1
 * Checks for newly earned badges and saves the result.
 */
export function recordLogin(): StreakData {
  const today = new Date();
  const todayStr = toDateString(today);

  const prev = loadStreak();

  // Already logged in today — do nothing
  if (prev.lastLogin === todayStr) {
    return prev;
  }

  // Was yesterday?
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  const newStreak = prev.lastLogin === yesterdayStr ? prev.streak + 1 : 1;

  const next: StreakData = {
    lastLogin: todayStr,
    streak: newStreak,
    longestStreak: Math.max(prev.longestStreak, newStreak),
    totalLogins: prev.totalLogins + 1,
    badges: [],
    badgeEarnedDates: {} as Record<BadgeId, string>,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable — silent fail
  }

  return next;
}

/**
 * Returns the badge IDs that were earned in this specific login
 * (i.e. present in `next` but not in `prev`).
 */
export function getNewBadges(prev: StreakData, next: StreakData): BadgeId[] {
  return [];
}
