"use client";

import { LEARN_DOCUMENTS } from "./learnData";
import { loadDevotionalProgress } from "./devotionalProgress";
import { loadNotes } from "./notesData";
import { loadStreak } from "./streakData";

export type BadgeCategory =
  | "daily-devotions"
  | "bible-reading"
  | "notes-study"
  | "church-history"
  | "video-teaching"
  | "prayer"
  | "special";

export type BadgeMetric =
  | "devotionalsCompleted"
  | "devotionalStreak"
  | "chaptersRead"
  | "notesCreated"
  | "historicalDocsRead"
  | "videosWatched"
  | "prayersSaved"
  | "prayerDays"
  | "scriptureShares"
  | "appUseDays"
  | "combinedCompletion";

export type BadgeDefinition = {
  id: string;
  name: string;
  reason: string;
  nameEs: string;
  reasonEs: string;
  category: BadgeCategory;
  metric: BadgeMetric;
  threshold: number;
  image: string;
  rank: number;
};

export type EarnedBadge = {
  id: string;
  earnedAt: string;
};

export type BadgeStats = Record<BadgeMetric, number>;
export type BadgeLang = "en" | "es";

const EARNED_KEY = "tulip_badges_earned_v1";
const VIDEO_SEEN_KEY = "tulip_badge_video_seen_v1";

export const BADGE_CATEGORIES: Array<{ id: BadgeCategory; title: string; titleEs: string }> = [
  { id: "daily-devotions", title: "Daily Devotions", titleEs: "Devociones Diarias" },
  { id: "bible-reading", title: "Bible Reading", titleEs: "Lectura Bíblica" },
  { id: "notes-study", title: "Notes & Study", titleEs: "Notas y Estudio" },
  { id: "church-history", title: "Church History", titleEs: "Historia de la Iglesia" },
  { id: "video-teaching", title: "Video & Teaching", titleEs: "Video y Enseñanza" },
  { id: "prayer", title: "Prayer", titleEs: "Oración" },
  { id: "special", title: "Special Achievements", titleEs: "Logros Especiales" },
];

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "first-light", name: "First Light", reason: "Complete your first devotional", nameEs: "Primera Luz", reasonEs: "Completa tu primera devoción", category: "daily-devotions", metric: "devotionalsCompleted", threshold: 1, image: "/badges/first-light.png", rank: 10 },
  { id: "kindled-flame", name: "Kindled Flame", reason: "Complete a 3-day streak", nameEs: "Llama Encendida", reasonEs: "Completa una racha de 3 días", category: "daily-devotions", metric: "devotionalStreak", threshold: 3, image: "/badges/kindled-flame.png", rank: 20 },
  { id: "faithful-watch", name: "Faithful Watch", reason: "Complete a 7-day streak", nameEs: "Vigilia Fiel", reasonEs: "Completa una racha de 7 días", category: "daily-devotions", metric: "devotionalStreak", threshold: 7, image: "/badges/faithful-watch.png", rank: 30 },
  { id: "steadfast-pilgrim", name: "Steadfast Pilgrim", reason: "Complete a 30-day streak", nameEs: "Peregrino Firme", reasonEs: "Completa una racha de 30 días", category: "daily-devotions", metric: "devotionalStreak", threshold: 30, image: "/badges/steadfast-pilgrim.png", rank: 45 },
  { id: "persevering-saint", name: "Persevering Saint", reason: "Complete a 100-day streak", nameEs: "Santo Perseverante", reasonEs: "Completa una racha de 100 días", category: "daily-devotions", metric: "devotionalStreak", threshold: 100, image: "/badges/persevering-saint.png", rank: 65 },
  { id: "finishers-crown", name: "Finisher's Crown", reason: "Complete a 365-day streak", nameEs: "Corona del Finalizador", reasonEs: "Completa una racha de 365 días", category: "daily-devotions", metric: "devotionalStreak", threshold: 365, image: "/badges/finishers-crown.png", rank: 100 },

  { id: "opened-the-word", name: "Opened the Word", reason: "Read your first chapter", nameEs: "Abrió la Palabra", reasonEs: "Lee tu primer capítulo", category: "bible-reading", metric: "chaptersRead", threshold: 1, image: "/badges/opened-the-word.png", rank: 12 },
  { id: "berean", name: "Berean", reason: "Read 25 chapters", nameEs: "Bereano", reasonEs: "Lee 25 capítulos", category: "bible-reading", metric: "chaptersRead", threshold: 25, image: "/badges/berean.png", rank: 32 },
  { id: "searcher-of-truth", name: "Searcher of Truth", reason: "Read 100 chapters", nameEs: "Buscador de la Verdad", reasonEs: "Lee 100 capítulos", category: "bible-reading", metric: "chaptersRead", threshold: 100, image: "/badges/searcher-of-truth.png", rank: 52 },
  { id: "workman-approved", name: "Workman Approved", reason: "Read 500 chapters", nameEs: "Obrero Aprobado", reasonEs: "Lee 500 capítulos", category: "bible-reading", metric: "chaptersRead", threshold: 500, image: "/badges/workman-approved.png", rank: 78 },
  { id: "treasuring-scripture", name: "Treasuring Scripture", reason: "Complete the Bible", nameEs: "Atesorando la Escritura", reasonEs: "Completa la Biblia", category: "bible-reading", metric: "chaptersRead", threshold: 1189, image: "/badges/treasuring-scripture.png", rank: 105 },

  { id: "first-notes", name: "First Notes", reason: "Create your first note", nameEs: "Primeras Notas", reasonEs: "Crea tu primera nota", category: "notes-study", metric: "notesCreated", threshold: 1, image: "/badges/first-notes.png", rank: 11 },
  { id: "student-of-the-word", name: "Student of the Word", reason: "Create 25 notes", nameEs: "Estudiante de la Palabra", reasonEs: "Crea 25 notas", category: "notes-study", metric: "notesCreated", threshold: 25, image: "/badges/student-of-the-word.png", rank: 42 },
  { id: "faithful-scribe", name: "Faithful Scribe", reason: "Create 100 notes", nameEs: "Escriba Fiel", reasonEs: "Crea 100 notas", category: "notes-study", metric: "notesCreated", threshold: 100, image: "/badges/faithful-scribe.png", rank: 68 },
  { id: "treasured-record", name: "Treasured Record", reason: "Create 500 notes", nameEs: "Registro Atesorado", reasonEs: "Crea 500 notas", category: "notes-study", metric: "notesCreated", threshold: 500, image: "/badges/treasured-record.png", rank: 95 },

  { id: "church-historian", name: "Church Historian", reason: "Read your first historical document", nameEs: "Historiador de la Iglesia", reasonEs: "Lee tu primer documento histórico", category: "church-history", metric: "historicalDocsRead", threshold: 1, image: "/badges/church-historian.png", rank: 13 },
  { id: "puritan-apprentice", name: "Puritan Apprentice", reason: "Read 10 documents", nameEs: "Aprendiz Puritano", reasonEs: "Lee 10 documentos", category: "church-history", metric: "historicalDocsRead", threshold: 10, image: "/badges/puritan-apprentice.png", rank: 38 },
  { id: "reformation-student", name: "Reformation Student", reason: "Read 50 documents", nameEs: "Estudiante de la Reforma", reasonEs: "Lee 50 documentos", category: "church-history", metric: "historicalDocsRead", threshold: 50, image: "/badges/reformation-student.png", rank: 66 },
  { id: "keeper-of-the-heritage", name: "Keeper of the Heritage", reason: "Read 100 documents", nameEs: "Guardián de la Herencia", reasonEs: "Lee 100 documentos", category: "church-history", metric: "historicalDocsRead", threshold: 100, image: "/badges/keeper-of-the-heritage.png", rank: 92 },

  { id: "first-watch", name: "First Watch", reason: "Watch your first video", nameEs: "Primera Vista", reasonEs: "Mira tu primer video", category: "video-teaching", metric: "videosWatched", threshold: 1, image: "/badges/first-watch.png", rank: 14 },
  { id: "faithful-listener", name: "Faithful Listener", reason: "Watch 10 videos", nameEs: "Oyente Fiel", reasonEs: "Mira 10 videos", category: "video-teaching", metric: "videosWatched", threshold: 10, image: "/badges/faithful-listener.png", rank: 36 },
  { id: "encouraged-brother", name: "Encouraged Brother", reason: "Watch 50 videos", nameEs: "Hermano Animado", reasonEs: "Mira 50 videos", category: "video-teaching", metric: "videosWatched", threshold: 50, image: "/badges/encouraged-brother.png", rank: 62 },
  { id: "church-voice-supporter", name: "Church Voice Supporter", reason: "Watch 100 videos", nameEs: "Apoyo a Voces de la Iglesia", reasonEs: "Mira 100 videos", category: "video-teaching", metric: "videosWatched", threshold: 100, image: "/badges/church-voice-supporter.png", rank: 86 },

  { id: "first-prayer", name: "First Prayer", reason: "Save your first prayer", nameEs: "Primera Oración", reasonEs: "Guarda tu primera oración", category: "prayer", metric: "prayersSaved", threshold: 1, image: "/badges/first-prayer.png", rank: 15 },
  { id: "morning-watch", name: "Morning Watch", reason: "Pray 7 days", nameEs: "Vigilia Matutina", reasonEs: "Ora 7 días", category: "prayer", metric: "prayerDays", threshold: 7, image: "/badges/morning-watch.png", rank: 34 },
  { id: "secret-place", name: "Secret Place", reason: "Pray 30 days", nameEs: "Lugar Secreto", reasonEs: "Ora 30 días", category: "prayer", metric: "prayerDays", threshold: 30, image: "/badges/secret-place.png", rank: 58 },
  { id: "prayer-warrior", name: "Prayer Warrior", reason: "Pray 100 days", nameEs: "Guerrero de Oración", reasonEs: "Ora 100 días", category: "prayer", metric: "prayerDays", threshold: 100, image: "/badges/prayer-warrior.png", rank: 84 },

  { id: "tulip-reader", name: "Tulip Reader", reason: "Read content 30 days in a row", nameEs: "Lector Tulip", reasonEs: "Lee contenido durante 30 días seguidos", category: "special", metric: "appUseDays", threshold: 30, image: "/badges/tulip-reader.png", rank: 50 },
  { id: "courageous-witness", name: "Courageous Witness", reason: "Share Scripture 10 times", nameEs: "Testigo Valiente", reasonEs: "Comparte la Escritura 10 veces", category: "special", metric: "scriptureShares", threshold: 10, image: "/badges/courageous-witness.png", rank: 56 },
  { id: "anchored-soul", name: "Anchored Soul", reason: "Use the app 180 days", nameEs: "Alma Anclada", reasonEs: "Usa la app durante 180 días", category: "special", metric: "appUseDays", threshold: 180, image: "/badges/anchored-soul.png", rank: 88 },
  { id: "pilgrims-progress", name: "Pilgrim's Progress", reason: "Complete Bible + Historical Documents + Devotions", nameEs: "Progreso del Peregrino", reasonEs: "Completa Biblia + Documentos Históricos + Devociones", category: "special", metric: "combinedCompletion", threshold: 1, image: "/badges/pilgrims-progress.png", rank: 120 },
];

function parseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function countTruthyMap(raw: string | null): number {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.values(parsed).filter(Boolean).length;
  } catch {
    return 0;
  }
}

function maxConsecutiveDates(dateStrings: string[]): number {
  const dates = [...new Set(dateStrings)]
    .map((date) => new Date(`${date}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  let best = 0;
  let current = 0;
  let previous = 0;
  for (const date of dates) {
    const day = Math.floor(date.getTime() / 86400000);
    current = previous && day === previous + 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return best;
}

function countHistoricalDocsRead(): number {
  if (typeof window === "undefined") return 0;
  return LEARN_DOCUMENTS.filter((doc) => parseArray(localStorage.getItem(`axiom_learn_${doc.id}`)).length > 0).length;
}

function countVideosWatched(): number {
  if (typeof window === "undefined") return 0;
  const history = parseArray(localStorage.getItem("tba_watch_history")) as Array<{ videoId?: string; id?: string }>;
  const seen = new Set(parseArray(localStorage.getItem(VIDEO_SEEN_KEY)).filter((id): id is string => typeof id === "string"));
  for (const item of history) {
    const id = item.videoId ?? item.id;
    if (id) seen.add(id);
  }
  try {
    localStorage.setItem(VIDEO_SEEN_KEY, JSON.stringify([...seen]));
  } catch {}
  return seen.size;
}

export function collectBadgeStats(): BadgeStats {
  const devotional = loadDevotionalProgress();
  const streak = loadStreak();
  const chaptersRead = typeof window === "undefined" ? 0 : countTruthyMap(localStorage.getItem("tulip_bible_tracker_v1"));
  const notesCreated = loadNotes().length;
  const historicalDocsRead = countHistoricalDocsRead();
  const videosWatched = countVideosWatched();
  const prayersSaved = typeof window === "undefined" ? 0 : parseArray(localStorage.getItem("axiom-fw-prayers")).length;
  const scriptureShares = typeof window === "undefined" ? 0 : Number(localStorage.getItem("tulip_scripture_shares_v1") ?? "0") || 0;
  const devotionalStreak = Math.max(maxConsecutiveDates(devotional.completed), streak.longestStreak);
  const appUseDays = Math.max(streak.totalLogins, streak.longestStreak, devotionalStreak);
  const combinedCompletion = chaptersRead >= 1189 && historicalDocsRead >= 100 && devotionalStreak >= 365 ? 1 : 0;

  return {
    devotionalsCompleted: devotional.completed.length,
    devotionalStreak,
    chaptersRead,
    notesCreated,
    historicalDocsRead,
    videosWatched,
    prayersSaved,
    prayerDays: prayersSaved,
    scriptureShares,
    appUseDays,
    combinedCompletion,
  };
}

export function loadEarnedBadges(): EarnedBadge[] {
  if (typeof window === "undefined") return [];
  const parsed = parseArray(localStorage.getItem(EARNED_KEY));
  return parsed.filter((item): item is EarnedBadge => {
    return !!item && typeof item === "object" && typeof (item as EarnedBadge).id === "string";
  });
}

export function saveEarnedBadges(earned: EarnedBadge[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EARNED_KEY, JSON.stringify(earned));
    window.dispatchEvent(new Event("tulip-badges-change"));
  } catch {}
}

export function getBadgeById(id: string) {
  return BADGE_DEFINITIONS.find((badge) => badge.id === id) ?? null;
}

export function getEarnedBadgeDefinitions() {
  const earned = loadEarnedBadges();
  return earned
    .map((item) => {
      const badge = getBadgeById(item.id);
      return badge ? { ...badge, earnedAt: item.earnedAt } : null;
    })
    .filter((item): item is BadgeDefinition & { earnedAt: string } => !!item);
}

export function getBestEarnedBadges(limit = 3) {
  return getEarnedBadgeDefinitions()
    .sort((a, b) => b.rank - a.rank || new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, limit);
}

export function evaluateBadgeUnlocks(): BadgeDefinition[] {
  if (typeof window === "undefined") return [];
  const stats = collectBadgeStats();
  const earned = loadEarnedBadges();
  const earnedIds = new Set(earned.map((item) => item.id));
  const newlyEarned = BADGE_DEFINITIONS.filter((badge) => !earnedIds.has(badge.id) && stats[badge.metric] >= badge.threshold);
  if (newlyEarned.length === 0) return [];

  const now = new Date().toISOString();
  saveEarnedBadges([...earned, ...newlyEarned.map((badge) => ({ id: badge.id, earnedAt: now }))]);
  return newlyEarned.sort((a, b) => b.rank - a.rank);
}

export function getBadgeProgress(badge: BadgeDefinition, stats: BadgeStats) {
  const value = stats[badge.metric] ?? 0;
  return Math.min(1, value / badge.threshold);
}

export function recordScriptureShareForBadges() {
  if (typeof window === "undefined") return;
  const next = (Number(localStorage.getItem("tulip_scripture_shares_v1") ?? "0") || 0) + 1;
  try {
    localStorage.setItem("tulip_scripture_shares_v1", String(next));
    window.dispatchEvent(new Event("tulip-badges-change"));
  } catch {}
}

export function badgeText(badge: BadgeDefinition, lang: BadgeLang) {
  return {
    name: lang === "es" ? badge.nameEs : badge.name,
    reason: lang === "es" ? badge.reasonEs : badge.reason,
  };
}

export function categoryTitle(category: { title: string; titleEs?: string }, lang: BadgeLang) {
  return lang === "es" ? category.titleEs ?? category.title : category.title;
}
