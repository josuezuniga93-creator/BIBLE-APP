"use client";

import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import {
  DICTIONARY_ENTRIES,
  findCompleteCommentaryByReference,
  loadMatthewHenryManifest,
  parseBibleBook,
  searchDictionary,
  type CommentarySearchResult,
  type DictionaryEntry,
  type MatthewHenryManifest,
  type MatthewHenryManifestBook,
} from "../lib/studyToolsData";

type ToolTab = "commentaries" | "dictionary";
const COMMENTARY_PAGE_LIMIT = 1100;
const HENRY_HIGHLIGHTS_KEY = "tulip-matthew-henry-highlights";
const STUDY_CONTINUE_KEY = "tulip-study-tools-continue-reading";

type HenryHighlightColor = "gold" | "blue" | "rose" | "green";

type HenryHighlight = {
  id: string;
  text: string;
  color: HenryHighlightColor;
  createdAt: number;
  reference: string;
  sectionTitle: string;
  book: number;
  bookName: string;
  chapter: number;
  verse?: number;
  source: string;
};

type BracketSelection = {
  start: number;
  end: number;
};

type CommentaryToken =
  | { type: "word"; text: string; index: number; highlight?: HenryHighlight }
  | { type: "space"; text: string; highlight?: HenryHighlight }
  | { type: "break"; text: string };

type HighlightRect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
};

type SelectionGeometry = {
  rects: HighlightRect[];
  startHandle?: { left: number; top: number };
  endHandle?: { left: number; top: number };
};

type ContinueReadingItem = CommentarySearchResult & {
  id: string;
  updatedAt: number;
  readerPage?: number;
  pageCount?: number;
};

type BookSearchResult = MatthewHenryManifestBook & {
  source: string;
};

const HIGHLIGHT_COLORS: Record<HenryHighlightColor, { label: string; bg: string; text: string; dot: string }> = {
  gold:  { label: "Gold",  bg: "rgba(201,169,97,0.68)", text: "#0d0a00", dot: "#c9a961" },
  blue:  { label: "Blue",  bg: "rgba(82,156,255,0.62)",  text: "#ffffff", dot: "#60a5fa" },
  rose:  { label: "Rose",  bg: "rgba(244,114,182,0.62)", text: "#ffffff", dot: "#f472b6" },
  green: { label: "Green", bg: "rgba(74,222,128,0.58)",  text: "#0a1a0a", dot: "#4ade80" },
};
const ACTIVE_SELECTION_BG = "rgba(54, 97, 208, 0.58)";

function paginateText(text: string, limit = COMMENTARY_PAGE_LIMIT): string[] {
  const clean = text.trim();
  if (!clean) return [""];
  const pages: string[] = [];
  let remaining = clean;

  while (remaining.length > limit) {
    const slice = remaining.slice(0, limit);
    const paragraphBreak = slice.lastIndexOf("\n\n");
    const sentenceBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
    const wordBreak = slice.lastIndexOf(" ");
    const cut = paragraphBreak > limit * 0.45
      ? paragraphBreak + 2
      : sentenceBreak > limit * 0.55
        ? sentenceBreak + 2
        : Math.max(wordBreak, limit);

    pages.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) pages.push(remaining);
  return pages;
}

function loadHenryHighlights(): HenryHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HENRY_HIGHLIGHTS_KEY) ?? "[]") as HenryHighlight[];
  } catch {
    return [];
  }
}

function saveHenryHighlights(highlights: HenryHighlight[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HENRY_HIGHLIGHTS_KEY, JSON.stringify(highlights));
}

function loadContinueReading(): ContinueReadingItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STUDY_CONTINUE_KEY) ?? "[]") as ContinueReadingItem[];
  } catch {
    return [];
  }
}

function saveContinueReading(items: ContinueReadingItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDY_CONTINUE_KEY, JSON.stringify(items.slice(0, 12)));
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatCommentaryText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(?=[^\n])/g, "$1 ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function splitPageIntoParts(page: string, highlights: HenryHighlight[]) {
  const normalizedHighlights = highlights
    .map((highlight) => ({ ...highlight, normalized: normalizeText(highlight.text) }))
    .filter((highlight) => highlight.normalized.length > 0)
    .sort((a, b) => b.normalized.length - a.normalized.length);

  const parts: { text: string; highlight?: HenryHighlight }[] = [];
  let cursor = 0;

  while (cursor < page.length) {
    const remaining = page.slice(cursor);
    const match = normalizedHighlights
      .map((highlight) => {
        const idx = normalizeText(remaining).indexOf(highlight.normalized);
        return idx >= 0 ? { highlight, idx } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a!.idx - b!.idx))[0];

    if (!match) {
      parts.push({ text: page.slice(cursor) });
      break;
    }

    const compactBefore = normalizeText(remaining).slice(0, match.idx);
    const approxStart = compactBefore.length === 0 ? 0 : remaining.indexOf(compactBefore) + compactBefore.length;
    const rawStart = Math.max(0, approxStart);
    const rawText = remaining.slice(rawStart);
    const words = match.highlight.normalized.split(" ");
    let rawEnd = rawStart;
    let searchFrom = 0;
    for (const word of words) {
      const found = rawText.toLowerCase().indexOf(word.toLowerCase(), searchFrom);
      if (found === -1) break;
      rawEnd = rawStart + found + word.length;
      searchFrom = found + word.length;
    }

    if (rawStart > 0) parts.push({ text: remaining.slice(0, rawStart) });
    parts.push({ text: remaining.slice(rawStart, rawEnd), highlight: match.highlight });
    cursor += Math.max(rawEnd, 1);
  }

  return parts;
}

function tokenizeCommentaryParts(parts: { text: string; highlight?: HenryHighlight }[]): CommentaryToken[] {
  let wordIndex = 0;
  const tokens: CommentaryToken[] = [];

  parts.forEach((part) => {
    part.text.split(/(\s+)/).forEach((chunk) => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        tokens.push(chunk.includes("\n")
          ? { type: "break", text: "\n\n" }
          : { type: "space", text: " ", highlight: part.highlight }
        );
        return;
      }
      tokens.push({ type: "word", text: chunk, index: wordIndex, highlight: part.highlight });
      wordIndex += 1;
    });
  });

  return tokens;
}

function selectedRange(selection: BracketSelection | null) {
  if (!selection) return null;
  return {
    start: Math.min(selection.start, selection.end),
    end: Math.max(selection.start, selection.end),
  };
}

function readingPercent(page: number, pageCount?: number) {
  if (!pageCount || pageCount <= 0) return 0;
  return Math.min(100, Math.max(1, Math.round(((page + 1) / pageCount) * 100)));
}

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 4.5h6.5A3.5 3.5 0 0115 8v12a3.5 3.5 0 00-3.5-3.5H5V4.5z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M19 4.5h-4A3.5 3.5 0 0011.5 8v12a3.5 3.5 0 013.5-3.5h4V4.5z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function DictionaryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function categoryLabel(entry: DictionaryEntry, lang: "en" | "es") {
  if (lang === "en") return entry.category;
  const map: Record<DictionaryEntry["category"], string> = {
    Person: "Persona",
    Place: "Lugar",
    Doctrine: "Doctrina",
    Object: "Objeto",
    Book: "Libro",
  };
  return map[entry.category];
}

export default function StudyToolsPage() {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<ToolTab>("commentaries");
  const [query, setQuery] = useState("");
  const [reader, setReader] = useState<CommentarySearchResult | null>(null);
  const [readerPage, setReaderPage] = useState(0);
  const [selection, setSelection] = useState<BracketSelection | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<HenryHighlight[]>([]);
  const [showHighlightPocket, setShowHighlightPocket] = useState(false);
  const [commentaryResult, setCommentaryResult] = useState<CommentarySearchResult | null>(null);
  const [bookResult, setBookResult] = useState<BookSearchResult | null>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [manifest, setManifest] = useState<MatthewHenryManifest | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const activeHandle = useRef<"start" | "end" | null>(null);
  const didStartSelectionPress = useRef(false);
  const readerScrollRef = useRef<HTMLDivElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const [selectionGeometry, setSelectionGeometry] = useState<SelectionGeometry>({ rects: [] });
  const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);
  const [continueReading, setContinueReading] = useState<ContinueReadingItem[]>([]);
  const dictionaryEntries = useMemo(() => searchDictionary(query), [query]);
  const hasReferenceQuery = query.trim().length > 0;
  const readerPages = useMemo(() => paginateText(formatCommentaryText(reader?.text ?? "")), [reader]);
  const currentReaderPage = Math.min(readerPage, Math.max(0, readerPages.length - 1));
  const currentReference = reader
    ? `${reader.bookName} ${reader.chapter}${reader.requestedVerse ? `:${reader.requestedVerse}` : ""}`
    : "";
  const currentHighlights = useMemo(() => {
    if (!reader) return [];
    return highlights.filter((highlight) =>
      highlight.book === reader.book &&
      highlight.chapter === reader.chapter &&
      highlight.sectionTitle === (reader.title ?? `${reader.bookName} ${reader.chapter}`)
    );
  }, [highlights, reader]);
  const currentPageParts = useMemo(
    () => splitPageIntoParts(readerPages[currentReaderPage] ?? "", currentHighlights),
    [readerPages, currentReaderPage, currentHighlights]
  );
  const commentaryTokens = useMemo(() => tokenizeCommentaryParts(currentPageParts), [currentPageParts]);
  const selectedText = useMemo(() => {
    const range = selectedRange(selection);
    if (!range) return "";
    return normalizeText(commentaryTokens
      .filter((token) => token.type === "word" && token.index >= range.start && token.index <= range.end)
      .map((token) => token.text)
      .join(" "));
  }, [commentaryTokens, selection]);

  useEffect(() => {
    setHighlights(loadHenryHighlights());
    setContinueReading(loadContinueReading());
    loadMatthewHenryManifest().then(setManifest);
  }, []);

  const persistContinueReading = useCallback((items: ContinueReadingItem[]) => {
    const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12);
    setContinueReading(sorted);
    saveContinueReading(sorted);
  }, []);

  function upsertContinueReading(result: CommentarySearchResult, page = 0) {
    const id = `${result.source}-${result.book}-${result.chapter}-${result.requestedVerse ?? "chapter"}-${result.title ?? ""}`;
    const pageCount = paginateText(formatCommentaryText(result.text)).length;
    const item: ContinueReadingItem = {
      ...result,
      id,
      updatedAt: Date.now(),
      readerPage: page,
      pageCount,
    };
    persistContinueReading([item, ...continueReading.filter((existing) => existing.id !== id)]);
  }

  function removeContinueReading(id: string) {
    persistContinueReading(continueReading.filter((item) => item.id !== id));
  }

  function openReader(result: CommentarySearchResult, page = 0) {
    setReader(result);
    setReaderPage(page);
    setSelection(null);
    upsertContinueReading(result, page);
  }

  async function openBookChapter(book: BookSearchResult, chapter: number) {
    setCommentaryLoading(true);
    const result = await findCompleteCommentaryByReference(`${book.bookName} ${chapter}`);
    setCommentaryLoading(false);
    if (result) openReader(result);
  }

  const persistHighlights = useCallback((next: HenryHighlight[]) => {
    const sorted = [...next].sort((a, b) => b.createdAt - a.createdAt);
    setHighlights(sorted);
    saveHenryHighlights(sorted);
  }, []);

  function addHighlightForSelection(color: HenryHighlightColor) {
    const text = normalizeText(selectedText);
    if (!reader || text.length < 4) return;
    const newItem: HenryHighlight = {
      id: `mh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      color,
      createdAt: Date.now(),
      reference: currentReference,
      sectionTitle: reader.title ?? `${reader.bookName} ${reader.chapter}`,
      book: reader.book,
      bookName: reader.bookName,
      chapter: reader.chapter,
      verse: reader.requestedVerse,
      source: reader.source,
    };
    persistHighlights([newItem, ...highlights]);
    setSelection(null);
  }

  function removeHighlight(id: string) {
    persistHighlights(highlights.filter((highlight) => highlight.id !== id));
  }

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function startWordPress(index: number, highlight?: HenryHighlight) {
    clearLongPressTimer();
    didStartSelectionPress.current = false;
    if (highlight) return;
    longPressTimer.current = window.setTimeout(() => {
      didStartSelectionPress.current = true;
      setSelection({ start: index, end: index });
      if ("vibrate" in navigator) navigator.vibrate?.(12);
      longPressTimer.current = null;
    }, 360);
  }

  function finishWordPress() {
    clearLongPressTimer();
    activeHandle.current = null;
  }

  function getWordIndexFromPoint(clientX: number, clientY: number) {
    const directTarget = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const directWord = directTarget?.closest<HTMLElement>("[data-commentary-word]");
    const directIndex = Number(directWord?.dataset.index);
    if (Number.isFinite(directIndex)) return directIndex;

    const words = Array.from(textLayerRef.current?.querySelectorAll<HTMLElement>("[data-commentary-word]") ?? []);
    let closestIndex: number | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const word of words) {
      const rect = word.getBoundingClientRect();
      const clampedX = Math.max(rect.left, Math.min(clientX, rect.right));
      const clampedY = Math.max(rect.top, Math.min(clientY, rect.bottom));
      const distance = Math.hypot(clientX - clampedX, clientY - clampedY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = Number(word.dataset.index);
      }
    }

    return closestIndex;
  }

  function beginHandleDrag(handle: "start" | "end", event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    activeHandle.current = handle;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function updateHandleDrag(event: PointerEvent) {
    if (!activeHandle.current || !selection) return;
    const scrollEl = readerScrollRef.current;
    if (scrollEl) {
      const rect = scrollEl.getBoundingClientRect();
      if (event.clientY < rect.top + 92) {
        scrollEl.scrollBy({ top: -22, behavior: "auto" });
      } else if (event.clientY > rect.bottom - 132) {
        scrollEl.scrollBy({ top: 22, behavior: "auto" });
      }
    }
    const index = getWordIndexFromPoint(event.clientX, event.clientY);
    if (index === null || !Number.isFinite(index)) return;
    setSelection((current) => {
      if (!current || !activeHandle.current) return current;
      return activeHandle.current === "start"
        ? { ...current, start: index }
        : { ...current, end: index };
    });
  }

  async function copySelection() {
    const text = normalizeText(selectedText);
    if (!text) return;
    try {
      await navigator.clipboard?.writeText(text);
    } catch {}
  }

  function clearSelection() {
    setSelection(null);
    activeHandle.current = null;
    clearLongPressTimer();
  }

  function openHighlightInReader(highlight: HenryHighlight) {
    openReader({
      book: highlight.book,
      bookName: highlight.bookName,
      chapter: highlight.chapter,
      requestedVerse: highlight.verse,
      matchedVerse: highlight.verse ?? 1,
      source: highlight.source as CommentarySearchResult["source"],
      title: highlight.sectionTitle,
      text: highlight.text,
    });
    setShowHighlightPocket(false);
  }

  function getRectsForWordRange(start: number, end: number, color: string, idPrefix: string): HighlightRect[] {
    const layer = textLayerRef.current;
    if (!layer) return [];
    const layerRect = layer.getBoundingClientRect();
    const words = Array.from(layer.querySelectorAll<HTMLElement>("[data-commentary-word]"))
      .map((word) => ({ index: Number(word.dataset.index), rect: word.getBoundingClientRect() }))
      .filter((item) => Number.isFinite(item.index) && item.index >= start && item.index <= end && item.rect.width > 1);

    const lines: Array<{ top: number; bottom: number; left: number; right: number }> = [];
    words.forEach(({ rect }) => {
      const existing = lines.find((line) => Math.abs(line.top - rect.top) < 10);
      if (existing) {
        existing.top = Math.min(existing.top, rect.top);
        existing.bottom = Math.max(existing.bottom, rect.bottom);
        existing.left = Math.min(existing.left, rect.left);
        existing.right = Math.max(existing.right, rect.right);
      } else {
        lines.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
      }
    });

    return lines
      .sort((a, b) => a.top - b.top)
      .map((line, idx) => {
        const lineHeight = line.bottom - line.top;
        return {
          id: `${idPrefix}-${idx}`,
          left: line.left - layerRect.left - 4,
          top: line.top - layerRect.top - 2,
          width: line.right - line.left + 8,
          height: lineHeight + 4,
          color,
        };
      });
  }

  function refreshHighlightGeometry() {
    const range = selectedRange(selection);
    const selectionRects = range
      ? getRectsForWordRange(range.start, range.end, ACTIVE_SELECTION_BG, "selection")
      : [];

    const first = selectionRects[0];
    const last = selectionRects[selectionRects.length - 1];
    setSelectionGeometry({
      rects: selectionRects,
      startHandle: first ? { left: first.left - 15, top: first.top - 3 } : undefined,
      endHandle: last ? { left: last.left + last.width - 3, top: last.top + last.height - 13 } : undefined,
    });

    const grouped = new Map<string, { highlight: HenryHighlight; indexes: number[] }>();
    commentaryTokens.forEach((token) => {
      if (token.type !== "word" || !token.highlight) return;
      const existing = grouped.get(token.highlight.id) ?? { highlight: token.highlight, indexes: [] };
      existing.indexes.push(token.index);
      grouped.set(token.highlight.id, existing);
    });

    const nextHighlightRects = Array.from(grouped.values()).flatMap(({ highlight, indexes }) =>
      getRectsForWordRange(
        Math.min(...indexes),
        Math.max(...indexes),
        HIGHLIGHT_COLORS[highlight.color].bg,
        `highlight-${highlight.id}`
      )
    );
    setHighlightRects(nextHighlightRects);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(refreshHighlightGeometry);
    return () => window.cancelAnimationFrame(frame);
  }, [selection, commentaryTokens, currentReaderPage, currentHighlights]);

  useEffect(() => {
    if (!reader) return;
    const id = `${reader.source}-${reader.book}-${reader.chapter}-${reader.requestedVerse ?? "chapter"}-${reader.title ?? ""}`;
    const existing = continueReading.find((item) => item.id === id);
    if (!existing || existing.readerPage === currentReaderPage) return;
    persistContinueReading(continueReading.map((item) =>
      item.id === id ? { ...item, readerPage: currentReaderPage, pageCount: readerPages.length, updatedAt: Date.now() } : item
    ));
  }, [reader, currentReaderPage, readerPages.length, continueReading, persistContinueReading]);

  useEffect(() => {
    if (!reader) return;
    document.documentElement.setAttribute("data-app-reader-open", "true");
    return () => {
      document.documentElement.removeAttribute("data-app-reader-open");
    };
  }, [reader]);

  useEffect(() => {
    if (tab !== "commentaries" || !query.trim()) {
      setCommentaryResult(null);
      setBookResult(null);
      setCommentaryLoading(false);
      return;
    }

    const bookOnly = parseBibleBook(query);
    if (bookOnly && manifest) {
      const book = manifest.books.find((item) => item.book === bookOnly.book);
      setCommentaryResult(null);
      setBookResult(book ? { ...book, source: manifest.source } : null);
      setCommentaryLoading(false);
      return;
    }

    let cancelled = false;
    setCommentaryLoading(true);
    setBookResult(null);
    const timer = window.setTimeout(() => {
      findCompleteCommentaryByReference(query).then((result) => {
        if (cancelled) return;
        setCommentaryResult(result);
        setCommentaryLoading(false);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, tab, manifest]);

  return (
    <div className="min-h-screen bg-[#0b101d] text-white">
      {reader && (
        <div className="fixed inset-0 z-50 bg-[#0b101d] text-white">
          <div
            className="fixed left-0 right-0 z-[70] px-5"
            style={{
              bottom: 0,
              paddingTop: 14,
              paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
              background: "rgba(12,14,22,0.98)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              transform: ((selection && selectedText) || pendingRemoveId) ? "translateY(0)" : "translateY(110%)",
              transition: "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)",
              pointerEvents: ((selection && selectedText) || pendingRemoveId) ? "auto" : "none",
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="max-w-lg mx-auto flex items-center gap-3">
              {pendingRemoveId ? (
                <>
                  <p className="flex-1 text-sm font-black text-white/70">
                    {lang === "es" ? "Eliminar resaltado?" : "Remove this highlight?"}
                  </p>
                  <button
                    onClick={() => { removeHighlight(pendingRemoveId); setPendingRemoveId(null); }}
                    className="h-10 px-4 rounded-2xl text-sm font-black active:scale-95 flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.18)", color: "rgba(248,113,113,1)" }}
                  >
                    {lang === "es" ? "Eliminar" : "Remove"}
                  </button>
                  <button
                    onClick={() => setPendingRemoveId(null)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/40 text-xl font-black active:scale-95 flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    {"x"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-1 justify-center">
                    {(Object.keys(HIGHLIGHT_COLORS) as HenryHighlightColor[]).map((color) => (
                      <button
                        key={color}
                        onClick={() => addHighlightForSelection(color)}
                        className="w-10 h-10 rounded-full active:scale-90 transition-transform flex-shrink-0"
                        style={{ background: HIGHLIGHT_COLORS[color].dot, boxShadow: `0 3px 10px ${HIGHLIGHT_COLORS[color].dot}55` }}
                        aria-label={HIGHLIGHT_COLORS[color].label}
                      />
                    ))}
                  </div>
                  <div className="w-px h-7 flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }} />
                  <button
                    onClick={copySelection}
                    className="h-10 px-4 rounded-2xl text-sm font-black text-white/70 active:scale-95 flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    {lang === "es" ? "Copiar" : "Copy"}
                  </button>
                  <button
                    onClick={clearSelection}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/40 text-xl font-black active:scale-95 flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    {"x"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="h-full max-w-lg mx-auto flex flex-col">
            <div
              className="flex items-center justify-between gap-3 px-5 pb-2 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(201,169,97,0.10)", paddingTop: "max(env(safe-area-inset-top), 10px)" }}
            >
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.22em] font-black truncate" style={{ color: "#c9a961" }}>
                  {reader.source}
                </p>
                <h2 className="text-lg font-black mt-0.5 truncate">
                  {reader.bookName} {reader.chapter}{reader.requestedVerse ? `:${reader.requestedVerse}` : ""} · {reader.title ?? (lang === "es" ? "Comentario" : "Commentary")}
                </h2>
              </div>
              <button
                onClick={() => setReader(null)}
                className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white/60 active:scale-95"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                aria-label={lang === "es" ? "Volver" : "Back"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div
              ref={readerScrollRef}
              onScroll={refreshHighlightGeometry}
              className="overflow-hidden flex-1 px-7 pt-2 pb-[118px] flex flex-col"
            >
              <div className="mb-2">
                {reader.requestedVerse && (
                  <p className="text-[11px] text-white/38">
                    {lang === "es" ? "Matthew Henry explica esta seccion" : "Matthew Henry section"}: {reader.verses?.length ? `v.${reader.verses[0]}-${reader.verses[reader.verses.length - 1]}` : `v.${reader.matchedVerse}`}
                  </p>
                )}
                {currentHighlights.length > 0 && (
                  <button
                    onClick={() => setShowHighlightPocket(true)}
                    className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black"
                    style={{ background: "rgba(201,169,97,0.14)", color: "#d7bd78", border: "1px solid rgba(201,169,97,0.18)" }}
                  >
                    {currentHighlights.length} {lang === "es" ? "resaltados guardados" : "saved highlights"}
                  </button>
                )}
              </div>

              <article
                className="flex-1 min-h-0 overflow-hidden"
              >
                <div
                  ref={textLayerRef}
                  className="relative h-full overflow-hidden pt-1 text-[16px] leading-[1.52] text-white/82 font-serif select-none whitespace-pre-line"
                  style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none", touchAction: "none" }}
                  onClick={(event) => {
                    if (!selection || didStartSelectionPress.current) {
                      didStartSelectionPress.current = false;
                      return;
                    }
                    const target = event.target as HTMLElement;
                    if (target.closest("[data-selection-handle]")) return;
                    if (target.closest("[data-highlighted-word]")) return;
                    clearSelection();
                  }}
                  onPointerMove={updateHandleDrag}
                  onPointerUp={finishWordPress}
                  onPointerCancel={finishWordPress}
                  onPointerLeave={() => {
                    clearLongPressTimer();
                    activeHandle.current = null;
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 z-0">
                    {[...highlightRects, ...selectionGeometry.rects].map((rect) => (
                      <span
                        key={rect.id}
                        className="absolute rounded-[5px]"
                        style={{
                          left: rect.left,
                          top: rect.top,
                          width: rect.width,
                          height: rect.height,
                          background: rect.color,
                        }}
                      />
                    ))}
                  </div>
                  {selectionGeometry.startHandle && (
                    <button
                      type="button"
                      aria-label={lang === "es" ? "Mover inicio de seleccion" : "Move selection start"}
                      data-selection-handle
                      onPointerDown={(event) => beginHandleDrag("start", event)}
                      className="absolute z-20 active:scale-95"
                      style={{
                        left: selectionGeometry.startHandle.left,
                        top: selectionGeometry.startHandle.top,
                        width: 24,
                        height: 42,
                        touchAction: "none",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 8,
                          top: 0,
                          width: 10,
                          height: 31,
                          borderRadius: 999,
                          background: "linear-gradient(180deg, #ffffff, #f4f4f4)",
                          boxShadow: "0 5px 14px rgba(0,0,0,0.46)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: 5,
                          top: 23,
                          width: 13,
                          height: 13,
                          borderRadius: "4px 10px 10px 10px",
                          background: "#ffffff",
                          transform: "rotate(45deg)",
                          boxShadow: "0 5px 14px rgba(0,0,0,0.34)",
                        }}
                      />
                    </button>
                  )}
                  {selectionGeometry.endHandle && (
                    <button
                      type="button"
                      aria-label={lang === "es" ? "Mover final de seleccion" : "Move selection end"}
                      data-selection-handle
                      onPointerDown={(event) => beginHandleDrag("end", event)}
                      className="absolute z-20 active:scale-95"
                      style={{
                        left: selectionGeometry.endHandle.left,
                        top: selectionGeometry.endHandle.top,
                        width: 24,
                        height: 42,
                        touchAction: "none",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 6,
                          top: 11,
                          width: 10,
                          height: 31,
                          borderRadius: 999,
                          background: "linear-gradient(180deg, #ffffff, #f4f4f4)",
                          boxShadow: "0 5px 14px rgba(0,0,0,0.46)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: 5,
                          top: 2,
                          width: 13,
                          height: 13,
                          borderRadius: "10px 10px 4px 10px",
                          background: "#ffffff",
                          transform: "rotate(45deg)",
                          boxShadow: "0 5px 14px rgba(0,0,0,0.34)",
                        }}
                      />
                    </button>
                  )}
                  {commentaryTokens.map((token, idx) => {
                    if (token.type === "break") return <span key={`break-${idx}`}>{"\n\n"}</span>;
                    const range = selectedRange(selection);
                    if (token.type === "space") {
                      return <span key={`space-${idx}`} className="relative z-10"> </span>;
                    }

                    return (
                      <span
                        key={`word-${token.index}`}
                        data-commentary-word
                        data-index={token.index}
                        data-highlighted-word={token.highlight ? "true" : undefined}
                        className="relative z-10"
                        onPointerDown={(e) => {
                          if (token.highlight) e.preventDefault();
                          startWordPress(token.index, token.highlight);
                        }}
                        onPointerUp={(e) => {
                          finishWordPress();
                          if (token.highlight && !didStartSelectionPress.current) {
                            e.stopPropagation();
                            setPendingRemoveId(token.highlight.id);
                          }
                        }}
                        onPointerCancel={finishWordPress}
                      >
                        {token.text}
                      </span>
                    );
                  })}
                </div>
              </article>

              {readerPages.length > 1 && (
                <div
                  className="fixed left-0 right-0 z-[55] px-5 space-y-2"
                  style={{ bottom: "max(env(safe-area-inset-bottom), 14px)" }}
                >
                  <div className="max-w-lg mx-auto">
                  <div className="flex items-center justify-between px-1 text-xs font-bold text-white/62">
                    <span>
                      {lang === "es" ? "Pagina" : "Page"} {currentReaderPage + 1} {lang === "es" ? "de" : "of"} {readerPages.length}
                    </span>
                    <span>{readingPercent(currentReaderPage, readerPages.length)}%</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden mb-2"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${readingPercent(currentReaderPage, readerPages.length)}%`,
                        background: "#c9a961",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-3">
                  <button
                    onClick={() => { setReaderPage((page) => Math.max(0, page - 1)); clearSelection(); }}
                    disabled={currentReaderPage === 0}
                    className="h-11 rounded-2xl text-sm font-black disabled:opacity-30 active:scale-95"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    ← {lang === "es" ? "Anterior" : "Prev"}
                  </button>
                  <button
                    onClick={() => { setReaderPage((page) => Math.min(readerPages.length - 1, page + 1)); clearSelection(); }}
                    disabled={currentReaderPage >= readerPages.length - 1}
                    className="h-11 rounded-2xl text-sm font-black disabled:opacity-30 active:scale-95"
                    style={{ background: "#c9a961", color: "#10131d" }}
                  >
                    {lang === "es" ? "Siguiente" : "Next"} →
                  </button>
                  </div>
                  </div>
                </div>
              )}

              <div className="hidden">
                <p className="text-xs leading-relaxed text-white/48">
                  {lang === "es"
                    ? "Texto de dominio publico de Matthew Henry. El lector permanece dentro de Herramientas de Estudio."
                    : "Public-domain Matthew Henry text. This reader stays inside Study Tools."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHighlightPocket && (
        <div className="fixed inset-0 z-[65] bg-black/65 backdrop-blur-md px-5 py-6 text-white">
          <div className="max-w-lg mx-auto h-full rounded-[32px] overflow-hidden flex flex-col" style={{ background: "#0b101d", border: "1px solid rgba(201,169,97,0.20)" }}>
            <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(201,169,97,0.14)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                  Matthew Henry
                </p>
                <h2 className="text-2xl font-black">{lang === "es" ? "Mis Resaltados" : "My Highlights"}</h2>
              </div>
              <button
                onClick={() => setShowHighlightPocket(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {highlights.length === 0 ? (
                <div className="rounded-[24px] p-6 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="font-black text-white/70">{lang === "es" ? "Aun no hay resaltados" : "No highlights yet"}</p>
                  <p className="text-sm text-white/38 mt-2">
                    {lang === "es" ? "Selecciona texto en el lector para guardar una explicacion." : "Select text in the reader to save an explanation."}
                  </p>
                </div>
              ) : highlights.map((highlight) => (
                <article key={highlight.id} className="rounded-[24px] p-4" style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>
                        {highlight.reference}
                      </p>
                      <h3 className="text-sm font-black mt-1 text-white/80">{highlight.sectionTitle}</h3>
                    </div>
                    <button onClick={() => removeHighlight(highlight.id)} className="text-white/30 text-sm font-black">✕</button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/64">
                    "{highlight.text}"
                  </p>
                  <button
                    onClick={() => openHighlightInReader(highlight)}
                    className="mt-4 text-xs font-black px-3 py-2 rounded-full"
                    style={{ background: "rgba(201,169,97,0.12)", color: "#d7bd78" }}
                  >
                    {lang === "es" ? "Abrir resaltado" : "Open highlight"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-5 pt-7 pb-32">
        <header className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.26em]" style={{ color: "#c9a961" }}>
            {lang === "es" ? "Herramientas de estudio" : "Study Tools"}
          </p>
        </header>

        <section
          className="relative overflow-hidden rounded-[28px] p-6 mb-5 border"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,97,0.20), rgba(22,30,46,0.96) 48%, rgba(10,15,27,0.98))",
            borderColor: "rgba(201,169,97,0.20)",
            boxShadow: "0 22px 60px rgba(0,0,0,0.25)",
          }}
        >
          <div
            className="absolute -right-8 -top-8 w-36 h-36 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,169,97,0.20), transparent 68%)" }}
          />
          <div className="relative z-10 max-w-[78%]">
            <p className="text-[10px] uppercase tracking-[0.24em] font-black" style={{ color: "#d7bd78" }}>
              {lang === "es" ? "Comentario y diccionario" : "Commentary & Dictionary"}
            </p>
            <h1 className="mt-3 text-[31px] leading-[0.98] font-black tracking-tight">
              {lang === "es" ? "Estudia el texto con claridad." : "Study the text with clarity."}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/62">
              {lang === "es"
                ? "Busca un versiculo para leer Matthew Henry, o cambia al diccionario para explorar palabras biblicas."
                : "Search a verse for Matthew Henry, or switch to the dictionary to explore Bible words."}
            </p>
          </div>
          <div
            className="absolute right-5 bottom-5 w-16 h-16 rounded-[22px] flex items-center justify-center"
            style={{ background: "rgba(201,169,97,0.16)", color: "#d7bd78", border: "1px solid rgba(201,169,97,0.20)" }}
          >
            <BookIcon />
          </div>
        </section>

        <label className="block rounded-[24px] px-4 py-4 mb-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,169,97,0.16)" }}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: "#c9a961" }}>
            {tab === "commentaries"
              ? lang === "es" ? "Buscar un versiculo" : "Search a verse"
              : lang === "es" ? "Buscar una palabra" : "Search a word"}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/35 flex-shrink-0">
              <path d="M21 21l-4.5-4.5M10.8 18a7.2 7.2 0 100-14.4 7.2 7.2 0 000 14.4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "commentaries"
                ? lang === "es" ? "Ej. Romanos 1:1, Juan 3:16" : "Ex. Romans 1:1, John 3:16"
                : lang === "es" ? "Ej. pacto, justificacion, Sion" : "Ex. covenant, justification, Zion"}
              className="w-full bg-transparent outline-none text-base font-bold text-white placeholder:text-white/28"
            />
          </div>
        </label>

        <div className="flex rounded-full p-1 mb-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { key: "commentaries" as const, label: lang === "es" ? "Comentarios" : "Commentaries" },
            { key: "dictionary" as const, label: lang === "es" ? "Diccionario" : "Dictionary" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="flex-1 h-11 rounded-full text-sm font-black transition-all"
              style={{
                background: tab === item.key ? "#c9a961" : "transparent",
                color: tab === item.key ? "#10131d" : "rgba(255,255,255,0.52)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "commentaries" ? (
          <section className="space-y-4">
            {hasReferenceQuery && commentaryLoading && (
              <div className="rounded-[24px] p-5 border flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-[#c9a961] animate-spin" />
                <p className="text-sm font-bold text-white/55">
                  {lang === "es" ? "Buscando en Matthew Henry..." : "Searching Matthew Henry..."}
                </p>
              </div>
            )}

            {hasReferenceQuery && !commentaryLoading && (
              bookResult ? (
                <article className="rounded-[28px] p-5 border" style={{ background: "linear-gradient(145deg, rgba(201,169,97,0.13), rgba(255,255,255,0.045))", borderColor: "rgba(201,169,97,0.26)" }}>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                    {bookResult.source}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {bookResult.bookName}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/48">
                    {lang === "es"
                      ? `Comentario completo disponible por ${bookResult.chapters} capitulos. Escoge un capitulo para leer.`
                      : `Full commentary available across ${bookResult.chapters} chapters. Choose a chapter to read.`}
                  </p>
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {Array.from({ length: bookResult.chapters }, (_, idx) => idx + 1).map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => openBookChapter(bookResult, chapter)}
                        className="h-12 rounded-2xl text-sm font-black active:scale-95"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.84)" }}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                </article>
              ) : commentaryResult ? (
                <article className="rounded-[28px] p-5 border" style={{ background: "linear-gradient(145deg, rgba(201,169,97,0.13), rgba(255,255,255,0.045))", borderColor: "rgba(201,169,97,0.26)" }}>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                    {commentaryResult.source}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {commentaryResult.title ?? `${commentaryResult.bookName} ${commentaryResult.chapter}${commentaryResult.requestedVerse ? `:${commentaryResult.requestedVerse}` : ""}`}
                  </h2>
                  {commentaryResult.requestedVerse && (
                    <p className="mt-1 text-xs text-white/40">
                      {lang === "es" ? "Seccion de Henry" : "Henry section"}: {commentaryResult.verses?.length ? `v.${commentaryResult.verses[0]}-${commentaryResult.verses[commentaryResult.verses.length - 1]}` : `v.${commentaryResult.matchedVerse}`}
                    </p>
                  )}
                  <p className="mt-4 text-[15px] leading-7 text-white/74">
                    {commentaryResult.text.length > 480 ? `${commentaryResult.text.slice(0, 480)}...` : commentaryResult.text}
                  </p>
                  <button
                    onClick={() => openReader(commentaryResult)}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black"
                    style={{ background: "#c9a961", color: "#10131d" }}
                  >
                    {lang === "es" ? "Leer Comentario" : "Read Commentary"}
                    <span>→</span>
                  </button>
                </article>
              ) : (
                <div className="rounded-[24px] p-5 border text-center" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-sm font-bold text-white/72">
                    {lang === "es" ? "No encontre esa referencia." : "I could not find that reference."}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/42">
                    {lang === "es"
                      ? "Prueba un libro como Proverbios, o una referencia como Romanos 1:5, Juan 3:16, Salmo 23:1 o Genesis 1:1."
                      : "Try a book like Proverbs, or a reference like Romans 1:5, John 3:16, Psalm 23:1, or Genesis 1:1."}
                  </p>
                </div>
              )
            )}

            {!hasReferenceQuery && (
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-4 px-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                      {lang === "es" ? "Reciente" : "Recent"}
                    </p>
                    <h2 className="text-2xl font-black mt-1">
                      {lang === "es" ? "Continuar leyendo" : "Continue Reading"}
                    </h2>
                  </div>
                  {continueReading.length > 0 && (
                    <p className="text-xs font-bold text-white/35">
                      {continueReading.length} {lang === "es" ? "guardados" : "saved"}
                    </p>
                  )}
                </div>

                {continueReading.length === 0 ? (
                  <div className="rounded-[28px] p-5 border" style={{ background: "linear-gradient(145deg, rgba(201,169,97,0.10), rgba(255,255,255,0.04))", borderColor: "rgba(201,169,97,0.18)" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#c9a961", color: "#10131d" }}>
                      <BookIcon />
                    </div>
                    <h3 className="text-xl font-black">
                      {lang === "es" ? "Busca una referencia para empezar" : "Search a reference to begin"}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/48">
                      {lang === "es"
                        ? "Cuando abras un comentario de Matthew Henry, aparecera aqui para que puedas continuar leyendo."
                        : "When you open a Matthew Henry commentary, it will appear here so you can keep reading."}
                    </p>
                  </div>
                ) : continueReading.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openReader(item, item.readerPage ?? 0)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") openReader(item, item.readerPage ?? 0);
                      }}
                      className="block w-full text-left p-4 active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: "#c9a961" }}>
                            {item.source}
                          </p>
                          <h3 className="text-lg font-black mt-1 truncate">
                            {item.title ?? `${item.bookName} ${item.chapter}${item.requestedVerse ? `:${item.requestedVerse}` : ""}`}
                          </h3>
                          <p className="text-xs text-white/42 mt-1">
                            {lang === "es" ? "Pagina" : "Page"} {(item.readerPage ?? 0) + 1}
                            {item.pageCount ? ` ${lang === "es" ? "de" : "of"} ${item.pageCount}` : ""} · {readingPercent(item.readerPage ?? 0, item.pageCount)}%
                          </p>
                          <p className="text-xs text-white/34 mt-1">
                            {item.bookName} {item.chapter}
                            {item.requestedVerse ? `:${item.requestedVerse}` : ""}
                          </p>
                          {item.pageCount && (
                            <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${readingPercent(item.readerPage ?? 0, item.pageCount)}%`, background: "#c9a961" }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeContinueReading(item.id);
                            }}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white/38 active:scale-95"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                            aria-label={lang === "es" ? "Quitar de continuar leyendo" : "Remove from continue reading"}
                          >
                            ✕
                          </button>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,97,0.14)", color: "#c9a961" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasReferenceQuery && (
              <button
                onClick={() => setShowHighlightPocket(true)}
                className="w-full rounded-[24px] px-5 py-4 text-left active:scale-[0.99]"
                style={{ background: "rgba(201,169,97,0.10)", border: "1px solid rgba(201,169,97,0.18)" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                      {lang === "es" ? "En tu bolsillo" : "In your pocket"}
                    </p>
                    <h2 className="text-lg font-black mt-1">{lang === "es" ? "Mis resaltados de Henry" : "My Henry Highlights"}</h2>
                    <p className="text-xs text-white/42 mt-1">
                      {highlights.length} {lang === "es" ? "explicaciones guardadas" : "saved explanations"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#c9a961", color: "#10131d" }}>
                    <BookIcon />
                  </div>
                </div>
              </button>
            )}
          </section>
        ) : (
          <section>
            <div className="space-y-3">
              {(query ? dictionaryEntries : DICTIONARY_ENTRIES).map((entry) => (
                <article key={entry.id} className="rounded-[24px] p-4 border" style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: "#c9a961" }}>
                        {categoryLabel(entry, lang)}
                      </p>
                      <h3 className="text-xl font-black mt-1">{lang === "es" ? entry.termEs : entry.term}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,97,0.14)", color: "#c9a961" }}>
                      <DictionaryIcon />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    {lang === "es" ? entry.definitionEs : entry.definition}
                  </p>
                  {entry.originalLanguages && entry.originalLanguages.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {entry.originalLanguages.map((note) => (
                        <div
                          key={`${entry.id}-${note.strongs}`}
                          className="rounded-2xl px-3 py-3"
                          style={{ background: "rgba(201,169,97,0.10)", border: "1px solid rgba(201,169,97,0.14)" }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: "#c9a961" }}>
                              {note.language} · {note.strongs}
                            </p>
                            <p className="text-sm font-black text-white">{note.lemma}</p>
                          </div>
                          <p className="mt-1 text-xs text-white/50">
                            {note.transliteration} — {note.meaning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {entry.references.map((ref) => (
                      <span key={ref} className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(201,169,97,0.12)", color: "#d7bd78" }}>
                        {ref}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
