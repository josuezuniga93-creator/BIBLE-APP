import type { ChapterData } from "./types";

const CACHE_NAME = "tulip-chapters-v1";
const MAX_CHAPTERS = 80;

function cachePath(book: number, chapter: number, translation: string) {
  return `/__reading-cache/${translation}/${book}/${chapter}`;
}

export function isValidChapter(data: unknown, book: number, chapter: number, translation: string): data is ChapterData {
  if (!data || typeof data !== "object") return false;
  const value = data as ChapterData;
  return value.book === book && value.chapter === chapter && value.translation === translation &&
    Array.isArray(value.verses) && value.verses.length > 0 && value.verses.every((verse) =>
      Number.isInteger(verse.verse) && verse.verse > 0 && typeof verse.text === "string" && verse.text.trim().length > 0
    );
}

export async function readChapterCache(book: number, chapter: number, translation: string): Promise<ChapterData | null> {
  if (typeof window === "undefined") return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(cachePath(book, chapter, translation));
    if (response) {
      const data: unknown = await response.json();
      if (isValidChapter(data, book, chapter, translation)) return data;
    }
  } catch { /* Storage can be unavailable in private browsing. */ }
  try {
    const legacyKey = `ryc-ch-v2-${book}-${chapter}-${translation}`;
    const raw = localStorage.getItem(legacyKey);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!isValidChapter(data, book, chapter, translation)) return null;
    if (await writeChapterCache(data)) localStorage.removeItem(legacyKey);
    return data;
  } catch { return null; }
}

export async function writeChapterCache(data: ChapterData): Promise<boolean> {
  if (typeof window === "undefined" || !data.translation) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const key = cachePath(data.book, data.chapter, data.translation);
    await cache.delete(key);
    await cache.put(key, new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } }));
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_CHAPTERS)).map((key) => cache.delete(key)));
    return true;
  } catch { return false; }
}
