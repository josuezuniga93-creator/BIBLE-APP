"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FontSize = "sm" | "md" | "lg" | "xl";

// ─── Char targets per font size ───────────────────────────────────────────────
// Larger font → fewer chars fit visually → smaller target.

const PAGE_TARGETS: Record<FontSize, { target: number; min: number; max: number }> = {
  sm: { target: 1600, min: 1500, max: 1700 },
  md: { target: 1600, min: 1500, max: 1700 },
  lg: { target: 1600, min: 1500, max: 1700 },
  xl: { target: 1600, min: 1500, max: 1700 },
};

// ─── Raw-text normalizer ──────────────────────────────────────────────────────

/**
 * Project Gutenberg plain-text files (and JSON books derived from them) use
 * hard line-wraps at ~70 characters, with `\n\n` (a blank line) between every
 * wrapped line AND between real paragraphs.  This means one sentence spread
 * over three lines is stored as three `\n\n`-separated segments — and the
 * renderer shows them as three tiny paragraphs with gaps between them.
 *
 * `normalizeBookContent` re-assembles those soft-wrapped lines back into full
 * prose paragraphs by deciding, for each `\n\n` boundary, whether it is a
 * real paragraph break or just a hard line-wrap:
 *
 *   SOFT WRAP (join with space) when any of:
 *     • The previous segment ends with a continuation marker (`,` `-` `--`)
 *     • The next segment starts with a lowercase letter or opening quote/paren
 *       that continues the previous clause
 *
 *   REAL PARAGRAPH BREAK (keep as `\n\n`) when:
 *     • A markdown heading is involved (`##`, `>`)
 *     • The previous segment ends with sentence-final punctuation (`. ! ? ;`)
 *       AND the next segment begins with a capital letter / digit / opening
 *       bracket — indicating a new independent thought
 *
 *   AMBIGUOUS → treated as soft wrap (safer: avoids fake gaps)
 *
 * Safe to run on properly-formatted markdown too: real paragraph breaks
 * satisfy the "sentence end + capital start" rule and are preserved as-is.
 */
export function normalizeBookContent(content: string): string {
  if (!content) return "";

  const segments = content.split("\n\n");
  const paragraphs: string[] = [];
  let current = "";

  for (const raw of segments) {
    const seg = raw.trim();

    // Discard empty segments; if we already have content it acts as a
    // paragraph boundary (three or more newlines in the original).
    if (!seg) {
      if (current) {
        paragraphs.push(current);
        current = "";
      }
      continue;
    }

    if (!current) {
      current = seg;
      continue;
    }

    // ── Detect boundary type ───────────────────────────────────────────────

    // Always break before/after markdown block elements
    const currentIsMarkdownBlock = /^#{1,6}\s|^>/.test(current);
    const nextIsMarkdownBlock    = /^#{1,6}\s|^>/.test(seg);
    if (currentIsMarkdownBlock || nextIsMarkdownBlock) {
      paragraphs.push(current);
      current = seg;
      continue;
    }

    // Continuation markers at end of current segment → soft wrap
    const endsWithContinuation = /[-,]$/.test(current);
    // Next segment starting with lowercase (or certain punctuation that
    // continues a sentence) → soft wrap
    const nextContinues = /^[a-z(]/.test(seg);

    if (endsWithContinuation || nextContinues) {
      current += " " + seg;
      continue;
    }

    // Sentence-final punctuation + capital/digit start → real paragraph break
    const currentEndsSentence = /[.!?;]["']?$/.test(current);
    const nextStartsNew       = /^[A-Z0-9\["']/.test(seg);

    if (currentEndsSentence && nextStartsNew) {
      paragraphs.push(current);
      current = seg;
    } else {
      // Ambiguous — treat as soft wrap to avoid fake gaps
      current += " " + seg;
    }
  }

  if (current) paragraphs.push(current);

  return paragraphs.join("\n\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip markdown markup to get approximate visible character count. */
function visibleLength(s: string): number {
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .length;
}

/**
 * Returns true for paragraphs that act as headings:
 * - Markdown ## headings
 * - Short ALL-CAPS lines (common in older public-domain books)
 */
function isHeading(para: string): boolean {
  if (/^#{1,6}\s/.test(para)) return true;
  const t = para.trim();
  return t.length > 0 && t.length < 90 && /^[A-Z][A-Z0-9\s\.\-—,:'"!?]+$/.test(t);
}

// ─── Core pagination logic ────────────────────────────────────────────────────

/**
 * Split `content` into page strings, each holding ~`target` visible characters.
 *
 * Pass `rawText: true` for Gutenberg / hard-wrapped plain-text books so that
 * `normalizeBookContent` is applied first to collapse soft-wrapped lines into
 * real prose paragraphs before the page boundaries are computed.
 *
 * Rules (applied after normalization):
 *  - Each page targets ~`target` visible chars (acceptable range: min–max).
 *  - Never split mid-paragraph.
 *  - A heading must carry at least the next paragraph on the same page
 *    (no orphan headings at the bottom of a page).
 *  - Break BEFORE an upcoming heading so it lands at the top of the next page.
 */
export function paginateContent(
  content: string,
  fontSize: FontSize = "md",
  rawText = false,
): string[] {
  if (!content?.trim()) return [""];

  // Normalize hard-wrapped plain text before paginating
  const normalized = rawText ? normalizeBookContent(content) : content;

  const { min, max } = PAGE_TARGETS[fontSize];
  const paras = normalized
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paras.length === 0) return [""];

  const pages: string[] = [];
  let bucket: string[] = [];
  let bucketLen = 0;

  const flush = () => {
    if (bucket.length > 0) {
      pages.push(bucket.join("\n\n"));
      bucket = [];
      bucketLen = 0;
    }
  };

  // ── Pre-split oversized paragraphs at sentence boundaries ──────────────────
  // If a single paragraph is longer than max, we can't fit it on any page as-is.
  // Split it into sentence-boundary chunks so the paginator can work normally.
  const splitParagraphs: string[] = [];
  for (const para of paras) {
    if (visibleLength(para) <= max) {
      splitParagraphs.push(para);
      continue;
    }
    // Split at sentence boundaries: ". ", "! ", "? " followed by capital or quote
    const sentenceRe = /(?<=[.!?]["']?)\s+(?=[A-Z"'])/g;
    const sentences = para.split(sentenceRe).filter(Boolean);
    let chunk = "";
    for (const sent of sentences) {
      const candidate = chunk ? chunk + " " + sent : sent;
      if (visibleLength(candidate) > max && chunk) {
        splitParagraphs.push(chunk);
        chunk = sent;
      } else {
        chunk = candidate;
      }
    }
    if (chunk) splitParagraphs.push(chunk);
  }
  const finalParas = splitParagraphs;

  for (let i = 0; i < finalParas.length; i++) {
    const para = finalParas[i];
    const pLen = visibleLength(para);
    const thisIsHeading = isHeading(para);
    const nextIsHeading = i + 1 < finalParas.length && isHeading(finalParas[i + 1]);

    // ── First para on a new page — always start ────────────────────────────
    if (bucket.length === 0) {
      bucket.push(para);
      bucketLen += pLen;
      continue;
    }

    // ── Heading that would be orphaned at bottom ───────────────────────────
    if (thisIsHeading && bucketLen >= min) {
      const nextLen = i + 1 < finalParas.length ? visibleLength(finalParas[i + 1]) : 0;
      if (bucketLen + pLen + nextLen > max) {
        flush();
        bucket.push(para);
        bucketLen += pLen;
        continue;
      }
    }

    // ── Break BEFORE an upcoming heading ───────────────────────────────────
    if (nextIsHeading && bucketLen >= min) {
      bucket.push(para);
      bucketLen += pLen;
      flush();
      continue;
    }

    // ── Normal overflow ────────────────────────────────────────────────────
    if (bucketLen + pLen > max && bucketLen >= min) {
      flush();
      bucket.push(para);
      bucketLen += pLen;
    } else {
      bucket.push(para);
      bucketLen += pLen;
    }
  }

  flush();

  return pages.length > 0 ? pages : [normalized || content];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePaginationOptions {
  content: string;
  fontSize: FontSize;
  /**
   * localStorage key for persisting the current page number.
   * Change this whenever the "document unit" changes (new chapter, new section).
   */
  storageKey: string;
  /**
   * Set to `true` for Gutenberg / hard-wrapped plain-text book content so that
   * soft line-wraps are collapsed into real paragraphs before paginating.
   * Default: `false` (safe for markdown / manually-authored content).
   */
  rawText?: boolean;
}

export interface UsePaginationResult {
  pages: string[];
  currentPage: number;
  totalPages: number;
  goToPage: (n: number) => void;
  /** Advance to the next page. Returns true if moved; false if already on the last page. */
  goNextPage: () => boolean;
  /** Go back one page. Returns true if moved; false if already on the first page. */
  goPrevPage: () => boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination({
  content,
  fontSize,
  storageKey,
  rawText = false,
}: UsePaginationOptions): UsePaginationResult {
  const pages = useMemo(
    () => paginateContent(content, fontSize, rawText),
    [content, fontSize, rawText],
  );
  const totalPages = pages.length;

  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load persisted page when storageKey changes (new chapter / section opened)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    const saved = raw ? parseInt(raw, 10) : 1;
    setCurrentPage(Math.max(1, Math.min(isNaN(saved) ? 1 : saved, pages.length)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Clamp when totalPages shrinks (e.g. font size increased)
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  // Persist whenever page or key changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, String(currentPage));
  }, [storageKey, currentPage]);

  const goToPage = useCallback(
    (n: number) => setCurrentPage(Math.max(1, Math.min(n, totalPages))),
    [totalPages],
  );

  const goNextPage = useCallback((): boolean => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      return true;
    }
    return false;
  }, [currentPage, totalPages]);

  const goPrevPage = useCallback((): boolean => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      return true;
    }
    return false;
  }, [currentPage]);

  return {
    pages,
    currentPage,
    totalPages,
    goToPage,
    goNextPage,
    goPrevPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}
