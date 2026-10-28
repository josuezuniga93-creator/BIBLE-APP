export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Damerau-Levenshtein also recognizes adjacent transpositions ("Jhon").
export function spellingDistance(left: string, right: string): number {
  const a = normalizeSearch(left), b = normalizeSearch(right);
  const rows = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
  }
  return rows[a.length][b.length];
}

export function searchScore(query: string, label: string): number {
  const q = normalizeSearch(query), value = normalizeSearch(label);
  if (!q || value === q) return 0;
  if (value.startsWith(q)) return 0.25;
  if (value.includes(q)) return 0.5;
  const distance = spellingDistance(q, value);
  if (/^\d/.test(q) && q.match(/^\d+/)?.[0] !== value.match(/^\d+/)?.[0]) return Infinity;
  return q.length >= 3 && distance <= Math.max(1, Math.floor(q.length / 4)) ? distance + Math.abs(q.length - value.length) / 10 : Infinity;
}
