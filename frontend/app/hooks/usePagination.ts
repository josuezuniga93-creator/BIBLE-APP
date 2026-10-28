"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import { paginateContent, type FontSize } from "../lib/pagination";
export { paginateContent, normalizeBookContent } from "../lib/pagination";
export type { FontSize } from "../lib/pagination";

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

  const [position, setPosition] = useState({ key: "", page: 1 });
  const currentPage = position.key === storageKey ? Math.min(position.page, totalPages) : 1;
  const setCurrentPage = useCallback((value: number | ((page: number) => number)) => {
    setPosition(previous => ({ key: storageKey, page: typeof value === "function" ? value(previous.key === storageKey ? previous.page : 1) : value }));
  }, [storageKey]);

  // Load persisted page when storageKey changes (new chapter / section opened)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    const saved = raw ? parseInt(raw, 10) : 1;
    if (!content.trim()) return;
    setPosition(previous => previous.key === storageKey ? previous : { key: storageKey, page: Math.max(1, isNaN(saved) ? 1 : saved) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, content]);

  // Clamp when totalPages shrinks (e.g. font size increased)
  useEffect(() => {
    if (content.trim() && position.key === storageKey) setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages, content, position.key, storageKey, setCurrentPage]);

  // Persist whenever page or key changes
  useEffect(() => {
    if (typeof window === "undefined" || position.key !== storageKey || !content.trim()) return;
    localStorage.setItem(storageKey, String(currentPage));
  }, [storageKey, currentPage, position.key, content]);

  const goToPage = useCallback(
    (n: number) => setCurrentPage(Math.max(1, Math.min(n, totalPages))),
    [totalPages, setCurrentPage],
  );

  const goNextPage = useCallback((): boolean => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      return true;
    }
    return false;
  }, [currentPage, totalPages, setCurrentPage]);

  const goPrevPage = useCallback((): boolean => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      return true;
    }
    return false;
  }, [currentPage, setCurrentPage]);

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
