"use client";

import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";
import { AppReader } from "../components/AppReader";
import type { ReaderHighlightAdapter } from "../components/BracketHighlightReader";
import {
  deleteStudyToolHighlight,
  getStudyToolHighlights,
  saveStudyToolHighlight,
  type UnifiedHenryHighlight,
  type UnifiedReaderHighlight,
} from "../lib/unifiedHighlights";
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

function findPageForSavedHighlight(text: string, highlightText: string, limit: number) {
  const pages = paginateText(formatCommentaryText(text), limit);
  const target = normalizeText(highlightText).toLowerCase();
  if (!target) return 0;

  const targetStart = target.slice(0, Math.min(80, target.length));
  const exactPage = pages.findIndex((page) => normalizeText(page).toLowerCase().includes(target));
  if (exactPage >= 0) return exactPage;

  const partialPage = pages.findIndex((page) => normalizeText(page).toLowerCase().includes(targetStart));
  return partialPage >= 0 ? partialPage : 0;
}

function loadHenryHighlights(): HenryHighlight[] {
  if (typeof window === "undefined") return [];
  return getStudyToolHighlights().map((highlight) => ({
    id: highlight.id,
    text: highlight.text,
    color: (highlight.color ?? "gold") as HenryHighlightColor,
    createdAt: highlight.createdAt ?? Date.now(),
    reference: highlight.reference,
    sectionTitle: highlight.sectionTitle,
    book: highlight.book,
    bookName: highlight.bookName,
    chapter: highlight.chapter,
    verse: highlight.verse,
    source: highlight.source,
  }));
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
  const { theme } = useTheme();
  const isLight = theme === "white-noir";
  const [tab, setTab] = useState<ToolTab>("commentaries");
  const [query, setQuery] = useState("");
  const [reader, setReader] = useState<CommentarySearchResult | null>(null);
  const [readerPage, setReaderPage] = useState(0);
  const [readerTargetHighlightId, setReaderTargetHighlightId] = useState<string | null>(null);
  const [selection, setSelection] = useState<BracketSelection | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [confirmPocketRemoveId, setConfirmPocketRemoveId] = useState<string | null>(null);
  const [showReaderControls, setShowReaderControls] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(15);
  const isLargeFont = readerFontSize > 15;
  const controlsTimerRef = useRef<number>(0);
  const [highlights, setHighlights] = useState<HenryHighlight[]>([]);
  const [showHighlightPocket, setShowHighlightPocket] = useState(false);
  const [deepLinkedHighlightId, setDeepLinkedHighlightId] = useState<string | null>(null);
  const [highlightSearchQuery, setHighlightSearchQuery] = useState("");
  const [commentaryResult, setCommentaryResult] = useState<CommentarySearchResult | null>(null);
  const [bookResult, setBookResult] = useState<BookSearchResult | null>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [manifest, setManifest] = useState<MatthewHenryManifest | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const activeHandle = useRef<"start" | "end" | null>(null);
  const didStartSelectionPress = useRef(false);
  const openedDeepLinkHighlightRef = useRef<string | null>(null);
  const readerScrollRef = useRef<HTMLDivElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLDivElement | null>(null);
  const [pageCharLimit, setPageCharLimit] = useState(COMMENTARY_PAGE_LIMIT);
  const [selectionGeometry, setSelectionGeometry] = useState<SelectionGeometry>({ rects: [] });
  const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);
  const [continueReading, setContinueReading] = useState<ContinueReadingItem[]>([]);
  const dictionaryEntries = useMemo(() => searchDictionary(query), [query]);
  const hasReferenceQuery = query.trim().length > 0;
  const readerPages = useMemo(() => {
    return paginateText(formatCommentaryText(reader?.text ?? ""), pageCharLimit);
  }, [reader, pageCharLimit]);
  const currentReaderPage = Math.min(readerPage, Math.max(0, readerPages.length - 1));
  const currentReference = reader
    ? `${reader.bookName} ${reader.chapter}${reader.requestedVerse ? `:${reader.requestedVerse}` : ""}`
    : "";
  const studyReaderTitle = reader?.title ?? (reader ? `${reader.bookName} ${reader.chapter}` : "");
  const studyReaderContext = reader
    ? `study-tools-${reader.source}-${reader.book}-${reader.chapter}-${reader.requestedVerse ?? "chapter"}-${studyReaderTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`
    : "study-tools";
  const studyHighlightAdapter = useMemo<ReaderHighlightAdapter | undefined>(() => {
    if (!reader) return undefined;

    const isCurrentReaderHighlight = (highlight: UnifiedHenryHighlight) =>
      highlight.book === reader.book &&
      highlight.chapter === reader.chapter &&
      highlight.source === reader.source;

    return {
      createId: () => `mh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      load: () =>
        getStudyToolHighlights()
          .filter(isCurrentReaderHighlight)
          .map((highlight): UnifiedReaderHighlight => ({
            id: highlight.id,
            text: highlight.text,
            color: highlight.color,
            createdAt: highlight.createdAt,
            context: studyReaderContext,
            title: highlight.sectionTitle,
            reference: highlight.reference,
          })),
      save: (_context, highlight) => {
        saveStudyToolHighlight({
          id: highlight.id,
          text: highlight.text,
          color: highlight.color,
          createdAt: highlight.createdAt,
          reference: currentReference,
          sectionTitle: studyReaderTitle,
          book: reader.book,
          bookName: reader.bookName,
          chapter: reader.chapter,
          verse: reader.requestedVerse,
          source: reader.source,
        });
        setHighlights(loadHenryHighlights());
      },
      delete: (_context, id) => {
        deleteStudyToolHighlight(id);
        setHighlights(loadHenryHighlights());
      },
      openAll: openUnifiedHighlights,
    };
  }, [currentReference, reader, studyReaderContext, studyReaderTitle]);
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
  const recentHighlights = useMemo(
    () => {
      const needle = normalizeText(highlightSearchQuery).toLowerCase();
      const sorted = [...highlights].sort((a, b) => b.createdAt - a.createdAt);
      if (!needle) return sorted;

      return sorted.filter((highlight) => normalizeText([
        highlight.bookName,
        `chapter ${highlight.chapter}`,
        `capitulo ${highlight.chapter}`,
        highlight.reference,
        highlight.sectionTitle,
        highlight.text,
      ].join(" ")).toLowerCase().includes(needle));
    },
    [highlights, highlightSearchQuery]
  );
  const highlightsByBookChapter = useMemo(() => {
    const books = new Map<number, {
      bookName: string;
      chapters: Map<number, HenryHighlight[]>;
    }>();

    recentHighlights.forEach((highlight) => {
      const bookGroup = books.get(highlight.book) ?? {
        bookName: highlight.bookName,
        chapters: new Map<number, HenryHighlight[]>(),
      };
      const chapterHighlights = bookGroup.chapters.get(highlight.chapter) ?? [];
      chapterHighlights.push(highlight);
      bookGroup.chapters.set(highlight.chapter, chapterHighlights);
      books.set(highlight.book, bookGroup);
    });

    return Array.from(books.entries())
      .sort(([bookA], [bookB]) => bookA - bookB)
      .map(([book, group]) => ({
        book,
        bookName: group.bookName,
        chapters: Array.from(group.chapters.entries())
          .sort(([chapterA], [chapterB]) => chapterA - chapterB)
          .map(([chapter, items]) => ({ chapter, items })),
      }));
  }, [recentHighlights]);

  useEffect(() => {
    setHighlights(loadHenryHighlights());
    setContinueReading(loadContinueReading());
    loadMatthewHenryManifest().then(setManifest);
    try {
      setDeepLinkedHighlightId(new URLSearchParams(window.location.search).get("highlight"));
    } catch {
      setDeepLinkedHighlightId(null);
    }
  }, []);

  useEffect(() => {
    if (!deepLinkedHighlightId || openedDeepLinkHighlightRef.current === deepLinkedHighlightId) return;
    const highlight = highlights.find((item) => item.id === deepLinkedHighlightId);
    if (!highlight) return;
    openedDeepLinkHighlightRef.current = deepLinkedHighlightId;
    openHighlightInReader(highlight);
  }, [deepLinkedHighlightId, highlights]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function openReader(result: CommentarySearchResult, page = 0, targetHighlightId: string | null = null) {
    setReader(result);
    setReaderPage(page);
    setReaderTargetHighlightId(targetHighlightId);
    setSelection(null);
    upsertContinueReading(result, page);
  }

  async function openBookChapter(book: BookSearchResult, chapter: number) {
    setCommentaryLoading(true);
    const result = await findCompleteCommentaryByReference(`${book.bookName} ${chapter}`);
    setCommentaryLoading(false);
    if (result) openReader(result);
  }

  const recalcPageLimit = useCallback(() => {
    if (readerFontSize > 16) {
      // Large font: each page becomes a long scrollable section
      setPageCharLimit(2500);
      return;
    }
    const article = articleRef.current;
    if (!article) return;
    let height = article.clientHeight;
    // px-7 padding is on the parent scroll container, not the article —
    // article.clientWidth already excludes it, so don't subtract again.
    const width = article.clientWidth;
    // Fallback: if layout hasn't settled yet, estimate from window height
    if (height < 60) {
      height = window.innerHeight - 65 - 118 - 10;
    }
    if (height < 60 || width < 50) return;
    const lineHeightPx = readerFontSize * 1.58;
    // Proportional serif fonts are narrower than 0.52×; 0.42 fills screen correctly
    const charWidthPx = readerFontSize * 0.42;
    const charsPerLine = Math.floor(width / charWidthPx);
    const linesPerPage = Math.floor(height / lineHeightPx);
    const limit = Math.floor(charsPerLine * linesPerPage * 0.92);
    setPageCharLimit(Math.max(500, limit));
  }, [readerFontSize]);

  useEffect(() => {
    if (!reader) return;
    let rafId: number;
    let timerId: number;
    // RAF ensures browser has painted and layout is measurable before first pass;
    // second timeout catches edge cases where layout settles later (e.g. safe-area)
    rafId = requestAnimationFrame(() => {
      recalcPageLimit();
      timerId = window.setTimeout(recalcPageLimit, 350);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [reader, recalcPageLimit]);

  useEffect(() => {
    window.addEventListener("resize", recalcPageLimit);
    return () => window.removeEventListener("resize", recalcPageLimit);
  }, [recalcPageLimit]);

  // ResizeObserver: catches safe-area / orientation changes missed by window resize
  useEffect(() => {
    const article = articleRef.current;
    if (!article || !reader) return;
    const observer = new ResizeObserver(() => recalcPageLimit());
    observer.observe(article);
    return () => observer.disconnect();
  }, [reader, recalcPageLimit]);

  const persistHighlights = useCallback((next: HenryHighlight[]) => {
    const sorted = [...next].sort((a, b) => b.createdAt - a.createdAt);
    setHighlights(sorted);
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
    saveStudyToolHighlight(newItem as UnifiedHenryHighlight);
    setSelection(null);
  }

  function removeHighlight(id: string) {
    persistHighlights(highlights.filter((highlight) => highlight.id !== id));
    deleteStudyToolHighlight(id);
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

  function openUnifiedHighlights() {
    if (typeof window !== "undefined") window.location.href = "/highlights";
  }

  async function openHighlightInReader(highlight: HenryHighlight) {
    setShowHighlightPocket(false);
    setCommentaryLoading(true);
    const ref = `${highlight.bookName} ${highlight.chapter}${highlight.verse ? `:${highlight.verse}` : ""}`;
    const result = await findCompleteCommentaryByReference(ref);
    setCommentaryLoading(false);
    if (result) {
      openReader(result, findPageForSavedHighlight(result.text, highlight.text, pageCharLimit), highlight.id);
    } else {
      // fallback: open with the saved text
      openReader({
        book: highlight.book,
        bookName: highlight.bookName,
        chapter: highlight.chapter,
        requestedVerse: highlight.verse,
        matchedVerse: highlight.verse ?? 1,
        source: highlight.source as CommentarySearchResult["source"],
        title: highlight.sectionTitle,
        text: highlight.text,
      }, 0, highlight.id);
    }
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
      startHandle: first ? { left: first.left + 3, top: first.top + first.height - 1 } : undefined,
      endHandle: last ? { left: last.left + last.width - 3, top: last.top + last.height - 1 } : undefined,
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
    <div className="min-h-screen" style={{ background: isLight ? "#ffffff" : "#0b101d", color: isLight ? "#0a0a0a" : "#ffffff" }}>
      {reader && (
        <AppReader
          title={`${reader.bookName} ${reader.chapter}${reader.requestedVerse ? `:${reader.requestedVerse}` : ""} · ${studyReaderTitle}`}
          sectionLabel={reader.requestedVerse
            ? `${lang === "es" ? "Seccion de Matthew Henry" : "Matthew Henry section"}: ${reader.verses?.length ? `v.${reader.verses[0]}-${reader.verses[reader.verses.length - 1]}` : `v.${reader.matchedVerse}`}`
            : undefined}
          sectionTitle={studyReaderTitle}
          showSectionTitle={false}
          text={readerPages[currentReaderPage] ?? ""}
          context={studyReaderContext}
          reference={currentReference}
          fontSizeClass={readerFontSize > 16 ? "text-[20px]" : "text-[17px]"}
          currentPage={currentReaderPage + 1}
          totalPages={Math.max(1, readerPages.length)}
          progressPercent={readingPercent(currentReaderPage, readerPages.length)}
          previousDisabled={currentReaderPage === 0}
          nextDisabled={currentReaderPage >= readerPages.length - 1}
          onPrevious={() => {
            setReaderTargetHighlightId(null);
            setReaderPage((page) => Math.max(0, page - 1));
          }}
          onNext={() => {
            setReaderTargetHighlightId(null);
            setReaderPage((page) => Math.min(readerPages.length - 1, page + 1));
          }}
          onClose={() => {
            setReader(null);
            setReaderTargetHighlightId(null);
          }}
          targetHighlightId={readerTargetHighlightId ?? undefined}
          highlightAdapter={studyHighlightAdapter}
        />
      )}


      {showHighlightPocket && (
        <div className="fixed inset-0 z-[250]" style={{ background: isLight ? "#ffffff" : "#070b14", color: isLight ? "#0a0a0a" : "#ffffff" }}>
          <div className="max-w-lg mx-auto h-full overflow-hidden flex flex-col">
            <div className="px-5 pb-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.14)", paddingTop: "max(env(safe-area-inset-top), 18px)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                  {lang === "es" ? "Matthew Henry en tu bolsillo" : "Matthew Henry in your pocket"}
                </p>
                <h2 className="text-[30px] leading-none font-black mt-1">{lang === "es" ? "Mis Resaltados" : "My Highlights"}</h2>
              </div>
              <button
                onClick={() => { setShowHighlightPocket(false); setConfirmPocketRemoveId(null); }}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)" }}
              >
                ✕
              </button>
            </div>
            <div className="px-5 pt-4 flex-shrink-0">
              <label
                className="flex items-center gap-3 rounded-[22px] px-4 py-3"
                style={{ background: isLight ? "rgba(0,0,0,0.045)" : "rgba(255,255,255,0.055)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={highlightSearchQuery}
                  onChange={(event) => setHighlightSearchQuery(event.target.value)}
                  placeholder={lang === "es" ? "Buscar libro, capitulo o texto..." : "Search book, chapter, or text..."}
                  className={`min-w-0 flex-1 bg-transparent outline-none text-sm font-bold ${isLight ? "placeholder:text-black/35" : "placeholder:text-white/35"}`}
                  style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}
                />
                {highlightSearchQuery && (
                  <button
                    onClick={() => setHighlightSearchQuery("")}
                    className="text-sm font-black"
                    style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}
                    aria-label={lang === "es" ? "Limpiar busqueda" : "Clear search"}
                  >
                    ✕
                  </button>
                )}
              </label>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-7 pb-10">
              {highlights.length === 0 ? (
                <div className="rounded-[30px] p-7 text-center" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.045)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-black" style={{ color: isLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.70)" }}>{lang === "es" ? "Aun no hay resaltados" : "No highlights yet"}</p>
                  <p className="text-sm mt-2" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.38)" }}>
                    {lang === "es" ? "Selecciona texto en el lector para guardar una explicacion." : "Select text in the reader to save an explanation."}
                  </p>
                </div>
              ) : recentHighlights.length === 0 ? (
                <div className="rounded-[30px] p-7 text-center" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.045)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-black" style={{ color: isLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.70)" }}>{lang === "es" ? "Sin resultados" : "No results"}</p>
                  <p className="text-sm mt-2" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.38)" }}>
                    {lang === "es" ? "Prueba buscar otro libro, capitulo o frase." : "Try another book, chapter, or phrase."}
                  </p>
                </div>
              ) : (
                <>
                  <section>
                    <div className="flex items-end justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                          {lang === "es" ? "Reciente" : "Recent"}
                        </p>
                        <h3 className="text-xl font-black">{lang === "es" ? "Mis resaltados recientes" : "My Most Recent Highlights"}</h3>
                      </div>
                      <p className="text-xs font-bold" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>{recentHighlights.length}</p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 snap-x">
                      {recentHighlights.slice(0, 8).map((highlight) => (
                        <article
                          key={`recent-${highlight.id}`}
                          className="min-w-[82%] snap-start rounded-[26px] p-4"
                          style={isLight
                            ? { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)" }
                            : { background: "linear-gradient(135deg, rgba(201,169,97,0.10), rgba(255,255,255,0.045))", border: "1px solid rgba(201,169,97,0.16)" }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>
                                {highlight.reference}
                              </p>
                              <h4 className="text-sm font-black mt-1" style={{ color: isLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)" }}>{highlight.sectionTitle}</h4>
                            </div>
                            <button
                              onClick={() => setConfirmPocketRemoveId(highlight.id)}
                              className="text-sm font-black"
                              style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }}
                              aria-label={lang === "es" ? "Eliminar resaltado" : "Delete highlight"}
                            >
                              ✕
                            </button>
                          </div>
                          <p className="mt-3 text-sm leading-6 line-clamp-5" style={{ color: isLight ? "rgba(0,0,0,0.64)" : "rgba(255,255,255,0.64)" }}>
                            "{highlight.text}"
                          </p>
                          <button
                            onClick={() => openHighlightInReader(highlight)}
                            className="mt-4 text-xs font-black px-3 py-2 rounded-full"
                            style={isLight ? { background: "rgba(0,0,0,0.07)", color: "#0a0a0a" } : { background: "rgba(201,169,97,0.12)", color: "#d7bd78" }}
                          >
                            {lang === "es" ? "Abrir resaltado" : "Open highlight"}
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                        {lang === "es" ? "Organizado" : "Organized"}
                      </p>
                      <h3 className="text-xl font-black">{lang === "es" ? "Por libro y capitulo" : "By Book & Chapter"}</h3>
                    </div>
                    <div className="space-y-4">
                      {highlightsByBookChapter.map((bookGroup) => (
                        <section key={bookGroup.book} className="rounded-[28px] p-4" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.035)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)" }}>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-lg font-black">{bookGroup.bookName}</h4>
                            <span className="text-[10px] uppercase tracking-[0.16em] font-black px-3 py-1 rounded-full" style={isLight ? { color: "#0a0a0a", background: "rgba(0,0,0,0.07)" } : { color: "#c9a961", background: "rgba(201,169,97,0.10)" }}>
                              {bookGroup.chapters.reduce((sum, chapter) => sum + chapter.items.length, 0)}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {bookGroup.chapters.map((chapterGroup) => (
                              <div key={`${bookGroup.book}-${chapterGroup.chapter}`} className="rounded-[22px] p-3" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.035)" }}>
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <p className="text-sm font-black">
                                    {lang === "es" ? "Capitulo" : "Chapter"} {chapterGroup.chapter}
                                  </p>
                                  <p className="text-xs font-bold" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
                                    {chapterGroup.items.length} {chapterGroup.items.length === 1 ? (lang === "es" ? "resaltado" : "highlight") : (lang === "es" ? "resaltados" : "highlights")}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {chapterGroup.items.map((highlight) => (
                                    <article key={highlight.id} className="rounded-[18px] p-3" style={{ background: isLight ? "rgba(0,0,0,0.035)" : "rgba(6,10,18,0.70)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)" }}>
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-[10px] uppercase tracking-[0.16em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>
                                            {highlight.reference}
                                          </p>
                                          <h5 className="text-sm font-black mt-1" style={{ color: isLight ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.82)" }}>{highlight.sectionTitle}</h5>
                                        </div>
                                        <button
                                          onClick={() => setConfirmPocketRemoveId(highlight.id)}
                                          className="text-sm font-black"
                                          style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }}
                                          aria-label={lang === "es" ? "Eliminar resaltado" : "Delete highlight"}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <p className="mt-2 text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.62)" }}>
                                        "{highlight.text}"
                                      </p>
                                      <button
                                        onClick={() => openHighlightInReader(highlight)}
                                        className="mt-3 text-xs font-black px-3 py-2 rounded-full"
                                        style={isLight ? { background: "rgba(0,0,0,0.07)", color: "#0a0a0a" } : { background: "rgba(201,169,97,0.12)", color: "#d7bd78" }}
                                      >
                                        {lang === "es" ? "Abrir resaltado" : "Open highlight"}
                                      </button>
                                    </article>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
          {confirmPocketRemoveId && (
            <div className="absolute inset-0 z-10 flex items-center justify-center px-8 backdrop-blur-sm" style={{ background: isLight ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.55)" }}>
              <div className="w-full max-w-sm rounded-[28px] p-5 text-center" style={{ background: isLight ? "#ffffff" : "#111827", border: isLight ? "1px solid rgba(0,0,0,0.14)" : "1px solid rgba(201,169,97,0.22)", color: isLight ? "#0a0a0a" : "#ffffff" }}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                  {lang === "es" ? "Confirmar" : "Confirm"}
                </p>
                <h3 className="text-xl font-black mt-2">
                  {lang === "es" ? "Eliminar resaltado?" : "Delete this highlight?"}
                </h3>
                <p className="text-sm leading-6 mt-2" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }}>
                  {lang === "es"
                    ? "Esto quitara este resaltado de tu bolsillo."
                    : "This will remove this highlight from your pocket."}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={() => setConfirmPocketRemoveId(null)}
                    className="h-11 rounded-2xl text-sm font-black active:scale-95"
                    style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.72)" }}
                  >
                    {lang === "es" ? "Cancelar" : "Cancel"}
                  </button>
                  <button
                    onClick={() => {
                      removeHighlight(confirmPocketRemoveId);
                      setConfirmPocketRemoveId(null);
                    }}
                    className="h-11 rounded-2xl text-sm font-black active:scale-95"
                    style={{ background: "rgba(239,68,68,0.18)", color: "#fca5a5" }}
                  >
                    {lang === "es" ? "Eliminar" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!reader && (
      <main className="max-w-lg mx-auto px-5 pt-5 pb-32">
        <h1 className="sr-only">{lang === "es" ? "Herramientas de estudio" : "Study Tools"}</h1>

        <label className="block rounded-[24px] px-4 py-4 mb-5" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.16)" }}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
            {tab === "commentaries"
              ? lang === "es" ? "Buscar un versiculo" : "Search a verse"
              : lang === "es" ? "Buscar una palabra" : "Search a word"}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
              <path d="M21 21l-4.5-4.5M10.8 18a7.2 7.2 0 100-14.4 7.2 7.2 0 000 14.4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "commentaries"
                ? lang === "es" ? "Ej. Romanos 1:1, Juan 3:16" : "Ex. Romans 1:1, John 3:16"
                : lang === "es" ? "Ej. pacto, justificacion, Sion" : "Ex. covenant, justification, Zion"}
              className={`w-full bg-transparent outline-none text-base font-bold ${isLight ? "placeholder:text-black/28" : "placeholder:text-white/28"}`}
              style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}
            />
          </div>
        </label>

        <div className="study-tools-tabs flex rounded-full p-1 mb-5" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { key: "commentaries" as const, label: lang === "es" ? "Comentarios" : "Commentaries" },
            { key: "dictionary" as const, label: lang === "es" ? "Diccionario" : "Dictionary" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="flex-1 h-11 rounded-full text-sm font-black transition-all"
              style={{
                background: tab === item.key ? (isLight ? "#e5e7eb" : "#c9a961") : "transparent",
                color: tab === item.key ? (isLight ? "#0a0a0a" : "#10131d") : (isLight ? "rgba(0,0,0,0.52)" : "rgba(255,255,255,0.52)"),
                boxShadow: tab === item.key && isLight ? "inset 0 0 0 1px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "commentaries" ? (
          <section className="space-y-4">
            {hasReferenceQuery && commentaryLoading && (
              <div className="rounded-[24px] p-5 border flex items-center gap-3" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)", borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
                <div className={`w-5 h-5 rounded-full border-2 animate-spin ${isLight ? "border-black/15 border-t-[#0a0a0a]" : "border-white/15 border-t-[#c9a961]"}`} />
                <p className="text-sm font-bold" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }}>
                  {lang === "es" ? "Buscando en Matthew Henry..." : "Searching Matthew Henry..."}
                </p>
              </div>
            )}

            {hasReferenceQuery && !commentaryLoading && (
              bookResult ? (
                <article className="rounded-[28px] p-5 border" style={isLight
                  ? { background: "linear-gradient(145deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))", borderColor: "rgba(0,0,0,0.12)" }
                  : { background: "linear-gradient(145deg, rgba(201,169,97,0.13), rgba(255,255,255,0.045))", borderColor: "rgba(201,169,97,0.26)" }}>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                    {bookResult.source}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {bookResult.bookName}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.48)" }}>
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
                        style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)", color: isLight ? "rgba(0,0,0,0.84)" : "rgba(255,255,255,0.84)" }}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                </article>
              ) : commentaryResult ? (
                <article className="rounded-[28px] p-5 border" style={isLight
                  ? { background: "linear-gradient(145deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))", borderColor: "rgba(0,0,0,0.12)" }
                  : { background: "linear-gradient(145deg, rgba(201,169,97,0.13), rgba(255,255,255,0.045))", borderColor: "rgba(201,169,97,0.26)" }}>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                    {commentaryResult.source}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {commentaryResult.title ?? `${commentaryResult.bookName} ${commentaryResult.chapter}${commentaryResult.requestedVerse ? `:${commentaryResult.requestedVerse}` : ""}`}
                  </h2>
                  {commentaryResult.requestedVerse && (
                    <p className="mt-1 text-xs" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>
                      {lang === "es" ? "Seccion de Henry" : "Henry section"}: {commentaryResult.verses?.length ? `v.${commentaryResult.verses[0]}-${commentaryResult.verses[commentaryResult.verses.length - 1]}` : `v.${commentaryResult.matchedVerse}`}
                    </p>
                  )}
                  <p className="mt-4 text-[15px] leading-7" style={{ color: isLight ? "rgba(0,0,0,0.74)" : "rgba(255,255,255,0.74)" }}>
                    {commentaryResult.text.length > 480 ? `${commentaryResult.text.slice(0, 480)}...` : commentaryResult.text}
                  </p>
                  <button
                    onClick={() => openReader(commentaryResult)}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black"
                    style={{ background: isLight ? "#e5e7eb" : "#c9a961", color: isLight ? "#0a0a0a" : "#10131d", border: isLight ? "1px solid rgba(0,0,0,0.12)" : "none" }}
                  >
                    {lang === "es" ? "Leer Comentario" : "Read Commentary"}
                    <span>→</span>
                  </button>
                </article>
              ) : (
                <div className="rounded-[24px] p-5 border text-center" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)", borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
                  <p className="text-sm font-bold" style={{ color: isLight ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.72)" }}>
                    {lang === "es" ? "No encontre esa referencia." : "I could not find that reference."}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)" }}>
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
                    <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                      {lang === "es" ? "Reciente" : "Recent"}
                    </p>
                    <h2 className="text-2xl font-black mt-1">
                      {lang === "es" ? "Continuar leyendo" : "Continue Reading"}
                    </h2>
                  </div>
                  {continueReading.length > 0 && (
                    <p className="text-xs font-bold" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
                      {continueReading.length} {lang === "es" ? "guardados" : "saved"}
                    </p>
                  )}
                </div>

                {continueReading.length === 0 ? (
                  <div className="rounded-[28px] p-5 border" style={isLight
                    ? { background: "linear-gradient(145deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))", borderColor: "rgba(0,0,0,0.10)" }
                    : { background: "linear-gradient(145deg, rgba(201,169,97,0.10), rgba(255,255,255,0.04))", borderColor: "rgba(201,169,97,0.18)" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: isLight ? "#e5e7eb" : "#c9a961", color: isLight ? "#0a0a0a" : "#10131d", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "none" }}>
                      <BookIcon />
                    </div>
                    <h3 className="text-xl font-black">
                      {lang === "es" ? "Busca una referencia para empezar" : "Search a reference to begin"}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.48)" }}>
                      {lang === "es"
                        ? "Cuando abras un comentario de Matthew Henry, aparecera aqui para que puedas continuar leyendo."
                        : "When you open a Matthew Henry commentary, it will appear here so you can keep reading."}
                    </p>
                  </div>
                ) : continueReading.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border overflow-hidden"
                    style={{ background: isLight ? "rgba(0,0,0,0.035)" : "rgba(255,255,255,0.045)", borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}
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
                          <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                            {item.source}
                          </p>
                          <h3 className="text-lg font-black mt-1 truncate">
                            {item.title ?? `${item.bookName} ${item.chapter}${item.requestedVerse ? `:${item.requestedVerse}` : ""}`}
                          </h3>
                          <p className="text-xs mt-1" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)" }}>
                            {lang === "es" ? "Pagina" : "Page"} {(item.readerPage ?? 0) + 1}
                            {item.pageCount ? ` ${lang === "es" ? "de" : "of"} ${item.pageCount}` : ""} · {readingPercent(item.readerPage ?? 0, item.pageCount)}%
                          </p>
                          <p className="text-xs mt-1" style={{ color: isLight ? "rgba(0,0,0,0.34)" : "rgba(255,255,255,0.34)" }}>
                            {item.bookName} {item.chapter}
                            {item.requestedVerse ? `:${item.requestedVerse}` : ""}
                          </p>
                          {item.pageCount && (
                            <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${readingPercent(item.readerPage ?? 0, item.pageCount)}%`, background: isLight ? "#0a0a0a" : "#c9a961" }}
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
                            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95"
                            style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", color: isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.38)" }}
                            aria-label={lang === "es" ? "Quitar de continuar leyendo" : "Remove from continue reading"}
                          >
                            ✕
                          </button>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.14)", color: isLight ? "#0a0a0a" : "#c9a961" }}>
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
                onClick={openUnifiedHighlights}
                className="w-full rounded-[24px] px-5 py-4 text-left active:scale-[0.99]"
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(201,169,97,0.10)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.18)" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                      {lang === "es" ? "En tu bolsillo" : "In your pocket"}
                    </p>
                    <h2 className="text-lg font-black mt-1">{lang === "es" ? "Mis resaltados de Henry" : "My Henry Highlights"}</h2>
                    <p className="text-xs mt-1" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)" }}>
                      {highlights.length} {lang === "es" ? "explicaciones guardadas" : "saved explanations"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: isLight ? "#e5e7eb" : "#c9a961", color: isLight ? "#0a0a0a" : "#10131d", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "none" }}>
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
                <article key={entry.id} className="rounded-[24px] p-4 border" style={{ background: isLight ? "rgba(0,0,0,0.035)" : "rgba(255,255,255,0.045)", borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                        {categoryLabel(entry, lang)}
                      </p>
                      <h3 className="text-xl font-black mt-1">{lang === "es" ? entry.termEs : entry.term}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.14)", color: isLight ? "#0a0a0a" : "#c9a961" }}>
                      <DictionaryIcon />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.58)" : "rgba(255,255,255,0.58)" }}>
                    {lang === "es" ? entry.definitionEs : entry.definition}
                  </p>
                  {entry.originalLanguages && entry.originalLanguages.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {entry.originalLanguages.map((note) => (
                        <div
                          key={`${entry.id}-${note.strongs}`}
                          className="rounded-2xl px-3 py-3"
                          style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(201,169,97,0.10)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.14)" }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                              {note.language} · {note.strongs}
                            </p>
                            <p className="text-sm font-black" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{note.lemma}</p>
                          </div>
                          <p className="mt-1 text-xs" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.50)" }}>
                            {note.transliteration} — {note.meaning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {entry.references.map((ref) => (
                      <span key={ref} className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.12)", color: isLight ? "#0a0a0a" : "#d7bd78" }}>
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
      )}
    </div>
  );
}
