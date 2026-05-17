// ─── Gutenberg fetcher + chapter splitter ─────────────────────────────────────
// Fetches plain-text books from Project Gutenberg, strips the PG header/footer,
// and splits the body into readable sections. Results are cached for the
// lifetime of the Next.js server process so each book is only downloaded once.

const textCache = new Map<number, string>();

const CHUNK_WORDS = 2500; // approximate words per "chapter" when no headings found

// Gutenberg URLs to try in order
function gutenbergUrls(pgId: number): string[] {
  return [
    `https://www.gutenberg.org/cache/epub/${pgId}/pg${pgId}.txt`,
    `https://www.gutenberg.org/files/${pgId}/${pgId}-0.txt`,
    `https://www.gutenberg.org/files/${pgId}/${pgId}.txt`,
  ];
}

export async function fetchGutenbergText(pgId: number): Promise<string> {
  if (textCache.has(pgId)) return textCache.get(pgId)!;

  let lastError: Error | null = null;
  for (const url of gutenbergUrls(pgId)) {
    try {
      const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24 h
      if (!res.ok) continue;
      const raw = await res.text();
      const clean = stripGutenbergWrapper(raw);
      textCache.set(pgId, clean);
      return clean;
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw lastError ?? new Error(`Could not fetch PG ${pgId}`);
}

function stripGutenbergWrapper(text: string): string {
  // Strip everything before "*** START OF …" and after "*** END OF …"
  const startRe = /\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG[^\n]*/i;
  const endRe = /\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG[^\n]*/i;

  const startMatch = startRe.exec(text);
  const endMatch = endRe.exec(text);

  let body = text;
  if (startMatch) body = body.slice(startMatch.index + startMatch[0].length);
  if (endMatch) {
    const relEnd = endRe.exec(body);
    if (relEnd) body = body.slice(0, relEnd.index);
  }
  return body.trim();
}

// ── Chapter splitter ───────────────────────────────────────────────────────────

export interface ParsedChapter {
  title: string;
  content: string;
}

const CHAPTER_HEADING = /^[ \t]*(?:CHAPTER|Chapter|BOOK|Book|PART|Part|SECTION|Section)\s+(?:[IVXLCDM]+|\d+)[.\s:—]?[^\n]*$/m;

export function splitIntoChapters(text: string): ParsedChapter[] {
  // Find all heading positions
  const headingRe = new RegExp(CHAPTER_HEADING.source, "gm");
  const matches: { index: number; heading: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(text)) !== null) {
    matches.push({ index: m.index, heading: m[0].trim() });
  }

  if (matches.length >= 3) {
    // We have real chapter headings — use them
    const chapters: ParsedChapter[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i].heading.length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const content = text.slice(start, end).trim();
      if (content.length > 50) {
        chapters.push({ title: matches[i].heading, content });
      }
    }
    if (chapters.length >= 3) return chapters;
  }

  // Fall back to word-count chunking
  return chunkByWords(text, CHUNK_WORDS);
}

function chunkByWords(text: string, wordsPerChunk: number): ParsedChapter[] {
  const words = text.split(/\s+/);
  const chunks: ParsedChapter[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const slice = words.slice(i, i + wordsPerChunk).join(" ");
    chunks.push({
      title: `Section ${chunks.length + 1}`,
      content: slice,
    });
  }
  return chunks;
}

// ── Cached chapter list ────────────────────────────────────────────────────────

const chapterCache = new Map<number, ParsedChapter[]>();

export async function getChapters(pgId: number): Promise<ParsedChapter[]> {
  if (chapterCache.has(pgId)) return chapterCache.get(pgId)!;
  const text = await fetchGutenbergText(pgId);
  const chapters = splitIntoChapters(text);
  chapterCache.set(pgId, chapters);
  return chapters;
}
