export interface Bookmark {
  id: string;
  ref: string;       // e.g. "Romans 3:23"
  text: string;      // full verse text
  category: string;  // e.g. "Preservation of the Saints"
  date: string;      // ISO date
}

const LS_KEY = "tulip_bookmarks";
const CAT_KEY = "tulip_bookmark_categories";

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}

export function getCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const cats = JSON.parse(localStorage.getItem(CAT_KEY) || "[]") as string[];
    return cats.length ? cats : ["General"];
  } catch { return ["General"]; }
}

export function saveBookmark(bm: Omit<Bookmark, "id">): void {
  const all = getBookmarks();
  all.unshift({ ...bm, id: `bm-${Date.now()}` });
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function addCategory(name: string): void {
  const cats = getCategories();
  if (!cats.includes(name)) {
    cats.push(name);
    localStorage.setItem(CAT_KEY, JSON.stringify(cats));
  }
}

export function removeBookmark(id: string): void {
  const all = getBookmarks().filter(b => b.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}
