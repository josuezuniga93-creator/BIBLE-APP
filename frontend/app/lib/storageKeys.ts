const EXACT_KEYS = new Set([
  "ryc-bookmarks", "tulip_bookmarks", "tulip_bookmark_categories", "ryc-collections",
  "ryc-last-position", "ryc-translation", "ryc-history", "ryc-mem-verse-state-v2",
  "tulip-church-analyses", "axiom-fw-prayers", "axiom-fw-date",
  "tulip-matthew-henry-highlights", "tulip-unified-highlights-v1",
  "tulip-study-tools-continue-reading", "tulip_notes_v1", "tulip_devotional_v1",
  "tulip_bible_plans_v1", "tulip_plans_completion_v1", "tulip_streak_v1",
  "tulip_badges_earned_v1", "tulip_scripture_shares_v1", "tulip_bible_tracker_v1",
  "tulip_user_name", "ryc-lang", "tulip_onboarded", "ryc-android-mode",
]);
const PREFIXES = [
  "ryc-vcolor-", "ryc-chapter-note-", "axiom-hl-", "tulip-reader-highlights:",
  "axiom-progress-", "axiom-bookmark-", "axiom_learn_", "axiom-page-",
  "tulip-favorite-book-", "tulip-favorite-learn-", "ryc-plan-start-",
];

export function isSyncableStorageKey(key: string): boolean {
  return EXACT_KEYS.has(key) || PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function isBackupStorageKey(key: string): boolean {
  return isSyncableStorageKey(key) || ["ryc-theme", "ryc-font-size", "axiom-fw-reminder", "tulip_sync_conflicts_v1"].includes(key);
}
