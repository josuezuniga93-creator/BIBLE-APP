export type FavoriteKind = "book" | "learn";

const FAVORITE_PREFIX = "tulip-favorite";

export function favoriteKey(kind: FavoriteKind, id: string): string {
  return `${FAVORITE_PREFIX}-${kind}-${id}`;
}

export function isFavorite(kind: FavoriteKind, id: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(favoriteKey(kind, id)) === "true";
}

export function setFavorite(kind: FavoriteKind, id: string, favorite: boolean): void {
  if (typeof window === "undefined") return;
  if (favorite) localStorage.setItem(favoriteKey(kind, id), "true");
  else localStorage.removeItem(favoriteKey(kind, id));
}

export function toggleFavorite(kind: FavoriteKind, id: string): boolean {
  const next = !isFavorite(kind, id);
  setFavorite(kind, id, next);
  return next;
}
