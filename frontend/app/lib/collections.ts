// ─── Collections library (localStorage-backed) ────────────────────────────────

export interface SavedItem {
  id: string;           // unique reference, e.g. "learn::westminster-cf::chapter-1"
  type: "learn" | "book" | "verse" | "video";
  title: string;        // primary display title
  subtitle?: string;    // document / book name
  preview?: string;     // first ~120 chars of content for card display
  savedAt: number;      // timestamp
}

export interface Collection {
  id: string;
  name: string;
  emoji: string;
  color: string;        // hex, e.g. "#7c3aed"
  items: SavedItem[];
  createdAt: number;
}

const KEY = "ryc-collections";

// ─── Read / write ─────────────────────────────────────────────────────────────

export function loadCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Collection[];
  } catch {
    return [];
  }
}

function persist(cols: Collection[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cols));
  } catch {}
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function createCollection(name: string, emoji: string, color: string): Collection {
  const col: Collection = {
    id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    emoji,
    color,
    items: [],
    createdAt: Date.now(),
  };
  const cols = loadCollections();
  cols.push(col);
  persist(cols);
  return col;
}

export function deleteCollection(colId: string) {
  const cols = loadCollections().filter((c) => c.id !== colId);
  persist(cols);
}

export function renameCollection(colId: string, name: string, emoji: string, color: string) {
  const cols = loadCollections().map((c) =>
    c.id === colId ? { ...c, name, emoji, color } : c
  );
  persist(cols);
}

/** Toggle an item in/out of a collection. Returns the new "is saved" state. */
export function toggleItem(colId: string, item: Omit<SavedItem, "savedAt">): boolean {
  const cols = loadCollections();
  const col = cols.find((c) => c.id === colId);
  if (!col) return false;

  const existingIdx = col.items.findIndex((i) => i.id === item.id);
  let isSaved: boolean;
  if (existingIdx >= 0) {
    col.items.splice(existingIdx, 1);
    isSaved = false;
  } else {
    col.items.push({ ...item, savedAt: Date.now() });
    isSaved = true;
  }
  persist(cols);
  return isSaved;
}

/** Returns IDs of collections that already contain this item. */
export function collectionsContaining(itemId: string): string[] {
  return loadCollections()
    .filter((c) => c.items.some((i) => i.id === itemId))
    .map((c) => c.id);
}

/** Returns true if the item is saved in at least one collection. */
export function isAnySaved(itemId: string): boolean {
  return loadCollections().some((c) => c.items.some((i) => i.id === itemId));
}

// ─── Preset color palette (for the color picker) ──────────────────────────────

export const COLLECTION_COLORS = [
  "#7c3aed", // violet
  "#2563eb", // blue
  "#059669", // emerald
  "#d97706", // amber
  "#dc2626", // red
  "#db2777", // pink
  "#0891b2", // cyan
  "#65a30d", // lime
  "#9333ea", // purple
  "#ea580c", // orange
];

export const COLLECTION_EMOJIS = [
  "📖", "✝️", "🙏", "⛪", "✨", "🌿", "📝", "❤️", "🔥", "⭐",
  "🏛", "📜", "🕊️", "🌟", "🎯", "📌", "💡", "🌙", "☀️", "🗺️",
];
