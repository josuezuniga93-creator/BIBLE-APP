"use client";

import { useEffect, useState, useCallback, use, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePagination } from "../../hooks/usePagination";
import Link from "next/link";
import Image from "next/image";
import { fetchBookDetail, fetchBookChapter } from "../../lib/api";
import type { BookDetail, BookChapter } from "../../lib/types";
import { getBookCoverImage } from "../../lib/bookCoverImages";
import { useLanguage } from "../../lib/useLanguage";
import { translateToSpanish } from "../../lib/googleTranslate";
import { useTheme, type Theme } from "../../lib/useTheme";
import { BookmarkModal } from "../../components/BookmarkModal";
import { isAnySaved } from "../../lib/collections";
import { GeneratedBookCover, GeneratedMetaIcon } from "../../components/GeneratedArtwork";
import { bookSectionTitle, bookTitle } from "../../lib/spanishContent";
import { AppReader } from "../../components/AppReader";
import { getReaderHighlights } from "../../lib/unifiedHighlights";
import { UiIcon } from "../../components/UiIcon";

function DetailBookCover({ slug, title, author }: { slug: string; title: string; author: string }) {
  const imageSrc = getBookCoverImage(slug);
  const [imageFailed, setImageFailed] = useState(false);

  if (imageSrc && !imageFailed) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${title} cover`}
          fill
          sizes="112px"
          className="object-cover"
          onError={() => setImageFailed(true)}
          priority
        />
      </div>
    );
  }

  return (
    <GeneratedBookCover slug={slug} title={title} author={author} size="detail" />
  );
}

// ─── Font sizes ───────────────────────────────────────────────────────────────
type FontSize = "sm" | "md" | "lg" | "xl";
const FONT_SIZES: Record<FontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};
const FONT_SIZE_LABELS: Record<FontSize, string> = { sm: "Small", md: "Medium", lg: "Large", xl: "X-Large" };

// ─── Storage helpers ──────────────────────────────────────────────────────────
const BOOKMARK_KEY = (slug: string) => `axiom-bookmark-${slug}`;
const PROGRESS_KEY = (slug: string) => `axiom-progress-${slug}`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const { theme } = useTheme();
  // Read from data-theme on the <html> element directly — the <head> inline script
  // sets this before React hydrates, so the first client render gets the right theme
  // without waiting for useEffect.  Falls back to hook state on SSR.
  const activeTheme: Theme =
    (typeof window !== "undefined"
      ? (document.documentElement.getAttribute("data-theme") as Theme)
      : null) ?? theme;
  const isLight    = activeTheme === "white-noir";
  const isGoldNavy = activeTheme === "gold-navy";

  const th = {
    pageBg:                  isLight ? "#f5f1eb"                                : isGoldNavy ? "#0e1018"                          : "#0e0e18",
    topBarBg:                isLight ? "rgba(245,241,235,0.95)"                 : isGoldNavy ? "rgba(14,16,24,0.97)"               : "rgba(14,14,24,0.95)",
    bottomBarBg:             isLight ? "rgba(245,241,235,0.97)"                 : isGoldNavy ? "rgba(14,16,24,0.97)"               : "rgba(14,14,24,0.97)",
    textPrimary:             isLight ? "#1c1409"                                : "rgba(255,255,255,0.95)",
    textContent:             isLight ? "#2c1f0a"                                : "rgba(255,255,255,0.82)",
    textMuted:               isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    textVeryMuted:           isLight ? "#c4b090"                                : "rgba(255,255,255,0.2)",
    textFaint:               isLight ? "#b09878"                                : "rgba(255,255,255,0.3)",
    headingColor:            isLight ? "#9b8560"                                : "rgba(255,255,255,0.5)",
    accent:                  isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#a78bfa",
    accentLight:             isLight ? "#c4973a"                                : isGoldNavy ? "#d4b87a"                           : "#c4b5fd",
    border:                  isLight ? "rgba(155,114,40,0.15)"                  : isGoldNavy ? "rgba(255,255,255,0.06)"            : "rgba(255,255,255,0.07)",
    borderLight:             isLight ? "rgba(155,114,40,0.08)"                  : "rgba(255,255,255,0.05)",
    borderMed:               isLight ? "rgba(155,114,40,0.18)"                  : "rgba(255,255,255,0.08)",
    drawerBg:                isLight ? "#f0ebe0"                                : isGoldNavy ? "#1a1d27"                           : "#141424",
    readNowGradient:         isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": isGoldNavy ? "linear-gradient(135deg,#d4b87a,#c9a961)" : "linear-gradient(135deg,#ec4899,#a855f7)",
    nextBtnGradient:         isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": isGoldNavy ? "linear-gradient(135deg,#d4b87a,#c9a961)" : "linear-gradient(135deg,#ec4899,#a855f7)",
    prevBtnBg:               isLight ? "rgba(155,114,40,0.08)"                  : "rgba(255,255,255,0.07)",
    prevBtnBorder:           isLight ? "rgba(155,114,40,0.18)"                  : "rgba(255,255,255,0.08)",
    tagBg:                   isLight ? "rgba(155,114,40,0.12)"                  : isGoldNavy ? "rgba(201,169,97,0.15)"             : "rgba(124,58,237,0.2)",
    tagBorder:               isLight ? "rgba(155,114,40,0.3)"                   : isGoldNavy ? "rgba(201,169,97,0.32)"             : "rgba(124,58,237,0.35)",
    tagColor:                isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#c4b5fd",
    tocActiveBg:             isLight ? "rgba(155,114,40,0.15)"                  : isGoldNavy ? "rgba(201,169,97,0.15)"             : "rgba(124,58,237,0.2)",
    tocActiveText:           isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#c4b5fd",
    tocInactiveText:         isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    settingsBtnActiveBg:     isLight ? "rgba(155,114,40,0.2)"                   : isGoldNavy ? "rgba(201,169,97,0.22)"             : "rgba(124,58,237,0.3)",
    settingsBtnActiveBorder: isLight ? "rgba(155,114,40,0.5)"                   : isGoldNavy ? "rgba(201,169,97,0.50)"             : "rgba(124,58,237,0.5)",
    settingsBtnActiveText:   isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#c4b5fd",
    settingsBtnInactiveBg:   isLight ? "rgba(155,114,40,0.05)"                  : "rgba(255,255,255,0.05)",
    settingsBtnInactiveBorder:isLight ? "rgba(155,114,40,0.12)"                 : "rgba(255,255,255,0.08)",
    settingsBtnInactiveText: isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    presentBtnBg:            isLight ? "rgba(155,114,40,0.1)"                   : isGoldNavy ? "rgba(201,169,97,0.12)"             : "rgba(124,58,237,0.15)",
    presentBtnBorder:        isLight ? "rgba(155,114,40,0.28)"                  : isGoldNavy ? "rgba(201,169,97,0.30)"             : "rgba(124,58,237,0.3)",
    presentBtnText:          isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#c4b5fd",
    iconActive:              isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#a78bfa",
    iconInactive:            isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    addLibBorder:            isLight ? "rgba(155,114,40,0.2)"                   : "rgba(255,255,255,0.12)",
    addLibText:              isLight ? "#6b5226"                                : "rgba(255,255,255,0.7)",
    sliderProgress:          isLight ? "#9b7228"                                : isGoldNavy ? "#c9a961"                           : "#a855f7",
    sliderTrack:             isLight ? "rgba(155,114,40,0.15)"                  : "rgba(255,255,255,0.1)",
    progressTrack:           isLight ? "rgba(155,114,40,0.15)"                  : isGoldNavy ? "rgba(201,169,97,0.14)"             : "rgba(255,255,255,0.1)",
    progressBar:             isLight ? "linear-gradient(90deg,#c4973a,#9b7228)": isGoldNavy ? "linear-gradient(90deg,#c9a961,#d4b878)" : "linear-gradient(90deg,#ec4899,#a855f7)",
    sliderCss:               isLight
      ? `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c4973a,#9b7228);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c4973a,#9b7228);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`
      : isGoldNavy
      ? `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#d4b87a,#c9a961);box-shadow:0 0 8px rgba(201,169,97,0.5);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#d4b87a,#c9a961);box-shadow:0 0 8px rgba(201,169,97,0.5);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`
      : `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 0 8px rgba(168,85,247,0.6);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 0 8px rgba(168,85,247,0.6);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`,
    footerText:              isLight ? "rgba(155,114,40,0.4)"                   : "rgba(255,255,255,0.15)",
  };

  // White Noir overrides — premium black-and-white
  if (isLight) {
    th.pageBg                   = "#ffffff";
    th.topBarBg                 = "rgba(255,255,255,0.96)";
    th.bottomBarBg              = "rgba(255,255,255,0.96)";
    th.textPrimary              = "#0a0a0a";
    th.textContent              = "#0a0a0a";
    th.textMuted                = "rgba(10,10,10,0.38)";
    th.textVeryMuted            = "rgba(10,10,10,0.25)";
    th.textFaint                = "rgba(10,10,10,0.25)";
    th.headingColor             = "rgba(10,10,10,0.38)";
    th.accent                   = "#0a0a0a";
    th.accentLight              = "#333333";
    th.border                   = "rgba(0,0,0,0.07)";
    th.borderLight              = "rgba(0,0,0,0.05)";
    th.borderMed                = "rgba(0,0,0,0.09)";
    th.drawerBg                 = "#f5f5f5";
    th.readNowGradient          = "#f3f4f6";
    th.nextBtnGradient          = "linear-gradient(135deg,#333,#0a0a0a)";
    th.prevBtnBg                = "rgba(0,0,0,0.05)";
    th.prevBtnBorder            = "rgba(0,0,0,0.10)";
    th.tagBg                    = "rgba(0,0,0,0.05)";
    th.tagBorder                = "rgba(0,0,0,0.12)";
    th.tagColor                 = "#0a0a0a";
    th.tocActiveBg              = "rgba(0,0,0,0.10)";
    th.tocActiveText            = "#0a0a0a";
    th.tocInactiveText          = "rgba(10,10,10,0.38)";
    th.settingsBtnActiveBg      = "rgba(0,0,0,0.10)";
    th.settingsBtnActiveBorder  = "rgba(0,0,0,0.25)";
    th.settingsBtnActiveText    = "#0a0a0a";
    th.settingsBtnInactiveBg    = "rgba(0,0,0,0.04)";
    th.settingsBtnInactiveBorder= "rgba(0,0,0,0.09)";
    th.settingsBtnInactiveText  = "rgba(10,10,10,0.38)";
    th.presentBtnBg             = "rgba(0,0,0,0.05)";
    th.presentBtnBorder         = "rgba(0,0,0,0.12)";
    th.presentBtnText           = "#0a0a0a";
    th.iconActive               = "#0a0a0a";
    th.iconInactive             = "rgba(10,10,10,0.38)";
    th.sliderProgress           = "#0a0a0a";
    th.sliderTrack              = "rgba(0,0,0,0.08)";
    th.progressTrack            = "rgba(0,0,0,0.08)";
    th.progressBar              = "linear-gradient(90deg,#333,#0a0a0a)";
    th.sliderCss                = `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#333,#0a0a0a);cursor:pointer;border:2px solid rgba(0,0,0,0.15)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#333,#0a0a0a);cursor:pointer;border:2px solid rgba(0,0,0,0.15)}`;
    th.footerText               = "rgba(10,10,10,0.25)";
    th.addLibBorder             = "rgba(0,0,0,0.10)";
    th.addLibText               = "#0a0a0a";
  }

  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const urlChapter = searchParams ? parseInt(searchParams.get("chapter") ?? "0", 10) || null : null;
  const urlHlid = searchParams ? (searchParams.get("hlid") ?? null) : null;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [chapter, setChapter] = useState<BookChapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  // ── Spanish auto-translation ─────────────────────────────────────────────
  const [translatedChapter, setTranslatedChapter] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0);

  // Reader settings
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // ── In-chapter pagination ─────────────────────────────────────────────────
  const chapterContent = chapter?.content ?? "";
  const paginatedChapterContent = lang === "es" && translatedChapter ? translatedChapter : chapterContent;
  const pageStorageKey = `axiom-page-${slug}-${currentChapter}`;
  const {
    pages,
    currentPage,
    totalPages,
    goNextPage,
    goPrevPage,
    goToPage,
    isFirstPage,
    isLastPage,
  } = usePagination({
    content: paginatedChapterContent,
    fontSize,
    storageKey: pageStorageKey,
    rawText: true,   // Gutenberg / hard-wrapped plain text — normalize soft wraps
  });

  const pagePercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const bookPercent = book?.chapter_count
    ? Math.max(0, Math.min(100, Math.round((((currentChapter - 1) + (totalPages ? currentPage / totalPages : 1)) / book.chapter_count) * 100)))
    : 0;

  // Scroll to top when page turns
  useEffect(() => {
    if (!showDetail) {
      contentRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [currentPage, showDetail]);

  // Jump to the page containing the target highlight
  useEffect(() => {
    if (!urlHlid || !pages.length || showDetail) return;
    const target = getReaderHighlights(`book-${slug}-${currentChapter}`).find((highlight) => highlight.id === urlHlid);
    if (!target) return;
    const snippet = target.text.slice(0, 30);
    const pageIdx = pages.findIndex((p) => p.includes(snippet));
    if (pageIdx >= 0 && pageIdx + 1 !== currentPage) {
      goToPage(pageIdx + 1);
    }
  }, [urlHlid, pages, currentChapter, slug, showDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load book metadata
  useEffect(() => {
    fetchBookDetail(slug)
      .then((b) => {
        setBook(b);
        const saved = localStorage.getItem(BOOKMARK_KEY(slug));
        const start = urlChapter ?? (saved ? parseInt(saved, 10) : 1);
        setCurrentChapter(start);
        if (start > 1) setShowDetail(false);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-translate chapter when Spanish mode is on
  useEffect(() => {
    if (lang !== "es" || !chapter?.content) {
      setTranslatedChapter(null);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    setTranslateProgress(0);
    translateToSpanish(
      chapter.content,
      `book-${slug}-ch${currentChapter}`,
      (pct) => { if (!cancelled) setTranslateProgress(pct); }
    )
      .then((text) => { if (!cancelled) setTranslatedChapter(text); })
      .catch(() => { if (!cancelled) setTranslatedChapter(null); })
      .finally(() => { if (!cancelled) setTranslating(false); });
    return () => { cancelled = true; };
  }, [lang, chapter?.content, slug, currentChapter]);

  // Load chapter
  useEffect(() => {
    if (!book) return;
    setTranslatedChapter(null);
    setChapterLoading(true);
    fetchBookChapter(slug, currentChapter)
      .then(setChapter)
      .catch((e: Error) => setError(e.message))
      .finally(() => setChapterLoading(false));
    if (showDetail) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug, book, currentChapter]);

  // Sync bookmark state from collections
  useEffect(() => {
    setBookmarked(isAnySaved(`book::${slug}`));
  }, [slug]);

  // Auto-save progress
  useEffect(() => {
    if (!book) return;
    localStorage.setItem(PROGRESS_KEY(slug), JSON.stringify({
      chapter: currentChapter,
      total: book.chapter_count,
      page: currentPage,
      pages: totalPages,
      percent: bookPercent,
      lastRead: Date.now(),
    }));
  }, [slug, book, currentChapter, currentPage, totalPages, bookPercent]);

  function refreshBookmarked() {
    setBookmarked(isAnySaved(`book::${slug}`));
  }

  const toggleBookmark = useCallback(() => {
    setShowBookmarkModal(true);
  }, []);

  const goPrev = () => { if (chapter?.has_prev) setCurrentChapter((n) => n - 1); };
  const goNext = () => { if (chapter?.has_next) setCurrentChapter((n) => n + 1); };

  // Keyboard nav — pages first, then chapters
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (!goNextPage()) goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (!goPrevPage()) goPrev();
      }
      if (e.key === "f" || e.key === "F") setPresentationMode((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!presentationMode) return;
    document.documentElement.setAttribute("data-app-reader-open", "true");
    return () => {
      document.documentElement.removeAttribute("data-app-reader-open");
    };
  }, [presentationMode]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: th.pageBg }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: th.borderMed, borderTopColor: th.accent }} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={{ backgroundColor: th.pageBg }}>
        <p className="text-red-400 text-sm">{error ?? (lang === "es" ? "Libro no encontrado" : "Book not found")}</p>
        <Link href="/library" className="text-sm hover:underline" style={{ color: th.accent }}>{lang === "es" ? "← Volver a la Biblioteca" : "← Back to Library"}</Link>
      </div>
    );
  }

  // ── Presentation Mode ───────────────────────────────────────────────────────
  if (presentationMode) {
    return (
      <AppReader
        title={chapter ? bookSectionTitle(slug, chapter.chapter_title, lang) : bookTitle(book, lang)}
        eyebrow={`${bookTitle(book, lang)} · ${lang === "es" ? "Capítulo" : "Chapter"} ${currentChapter}`}
        sectionLabel={`${lang === "es" ? "Capítulo" : "Chapter"} ${currentChapter}`}
        sectionTitle={chapter ? bookSectionTitle(slug, chapter.chapter_title, lang) : (lang === "es" ? "Cargando..." : "Loading...")}
        showSectionTitle={false}
        context={`book-${slug}-${currentChapter}`}
        text={pages[currentPage - 1] ?? ""}
        reference={`${bookTitle(book, lang)} ${currentChapter}${totalPages > 1 ? ` · ${lang === "es" ? "Página" : "Page"} ${currentPage}` : ""}`}
        fontSizeClass="text-xl md:text-2xl"
        currentPage={currentPage}
        totalPages={totalPages}
        pagePercent={pagePercent}
        progressPercent={bookPercent}
        targetHighlightId={urlHlid ?? undefined}
        isLoading={chapterLoading}
        loadingLabel={lang === "es" ? "Cargando capítulo" : "Loading chapter"}
        previousDisabled={isFirstPage && !chapter?.has_prev}
        nextDisabled={isLastPage && !chapter?.has_next}
        onPrevious={() => { if (!goPrevPage()) goPrev(); }}
        onNext={() => { if (!goNextPage()) goNext(); }}
        onClose={() => setPresentationMode(false)}
      />
    );
  }

  // ── Full-screen reading overlay ─────────────────────────────────────────────
  if (!showDetail) {
    return (
      <AppReader
        title={bookTitle(book, lang)}
        eyebrow={lang === "es" ? "Libro gratis" : "Free Book"}
        sectionLabel={`${lang === "es" ? "Capítulo" : "Chapter"} ${currentChapter}`}
        sectionTitle={chapter ? bookSectionTitle(slug, chapter.chapter_title, lang) : (lang === "es" ? "Cargando..." : "Loading...")}
        showSectionTitle={isFirstPage}
        context={`book-${slug}-${currentChapter}`}
        text={pages[currentPage - 1] ?? ""}
        reference={`${bookTitle(book, lang)} ${currentChapter}${totalPages > 1 ? ` · ${lang === "es" ? "Página" : "Page"} ${currentPage}` : ""}`}
        fontSizeClass={FONT_SIZES[fontSize]}
        currentPage={currentPage}
        totalPages={totalPages}
        pagePercent={pagePercent}
        progressPercent={bookPercent}
        targetHighlightId={urlHlid ?? undefined}
        isLoading={chapterLoading}
        loadingLabel={lang === "es" ? "Cargando capítulo" : "Loading chapter"}
        translationStatus={lang === "es" && (translating || translatedChapter) ? (
          <div
            className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs"
            style={{
              backgroundColor: isLight ? "rgba(0,0,0,0.04)" : "rgba(201,169,97,0.08)",
              border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.18)",
              color: th.textMuted,
            }}
          >
            {translating ? (
              <>
                <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
                <span>Traduciendo al español... {translateProgress}%</span>
              </>
            ) : (
              <span>Traducido al español automáticamente</span>
            )}
          </div>
        ) : null}
        footer={(
          <p className="text-center text-[10px] mt-8" style={{ color: th.footerText }}>
            {lang === "es" ? "Texto de dominio público. Gratis para leer, compartir y distribuir." : "Public domain text. Free to read, share, and distribute."}
          </p>
        )}
        previousDisabled={isFirstPage && !chapter?.has_prev}
        nextDisabled={isLastPage && !chapter?.has_next}
        onPrevious={() => { if (!goPrevPage()) goPrev(); }}
        onNext={() => { if (!goNextPage()) goNext(); }}
        onClose={() => setShowDetail(true)}
      />
    );
  }

  // ── Detail page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen ryc-reader-bg" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-12"
        style={{ backgroundColor: th.topBarBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${th.border}` }}
      >
        <Link href="/library" className="flex items-center gap-1 min-w-[40px]" style={{ color: th.textMuted }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        <p className="text-sm font-bold truncate px-2 max-w-[55vw]" style={{ color: th.textPrimary }}>
          {bookTitle(book, lang)}
        </p>

        <div className="flex items-center gap-1 min-w-[80px] justify-end">
          {/* TOC */}
          <button
            onClick={() => setShowToc((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: showToc ? th.iconActive : th.iconInactive }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: bookmarked ? "#c9a961" : th.iconInactive }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"}>
              <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* More */}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: th.iconInactive }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Book detail section ───────────────────────────────────────────── */}
      {showDetail && (
        <div style={{ backgroundColor: th.pageBg }}>
          {/* Cover + meta */}
          <div className="flex gap-4 px-4 pt-6 pb-5">
            <div className="w-28 h-40 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
              <DetailBookCover slug={slug} title={book.title} author={book.author} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-base font-black leading-tight mb-1" style={{ color: th.textPrimary }}>
                {bookTitle(book, lang)}
              </h1>
              <p className="text-sm font-semibold mb-2" style={{ color: th.accent }}>{book.author}</p>
              <div className="flex items-center gap-1 mb-3">
                <UiIcon name="star" size={13} style={{ color: "#c9a961" }} />
                <span className="text-xs font-bold" style={{ color: th.textMuted }}>4.8</span>
                <span className="text-xs" style={{ color: th.textVeryMuted }}>(Reformed Classic)</span>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {book.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: th.tagBg, border: `1px solid ${th.tagBorder}`, color: th.tagColor }}>
                    {tag}
                  </span>
                ))}
              </div>
              {/* Free badge */}
              <div className="flex items-center gap-1.5">
                <UiIcon name="check" size={12} style={{ color: "#34d399" }} strokeWidth={3} />
                <span style={{ color: "#34d399", fontSize: "11px", fontWeight: "bold" }}>{lang === "es" ? "Gratis" : "Free"}</span>
                <span style={{ color: "rgba(52,211,153,0.6)", fontSize: "11px" }}>{lang === "es" ? "100% gratis para leer" : "100% free to read"}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 flex flex-col gap-2.5 mb-5">
            <button
              onClick={() => setShowDetail(false)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
              style={{ background: th.readNowGradient, color: isLight ? "#0a0a0a" : "#ffffff" }}
            >
              {lang === "es" ? "Leer Ahora" : "Read Now"}
            </button>
            <button
              onClick={toggleBookmark}
              className="w-full py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              style={{ border: `1px solid ${th.addLibBorder}`, color: th.addLibText, backgroundColor: "transparent" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} style={{ color: bookmarked ? (isLight ? "#0a0a0a" : "#c9a961") : th.addLibText }}>
                <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              {bookmarked ? (lang === "es" ? "Guardado en colección" : "Saved to Collection") : (lang === "es" ? "Guardar en Colección" : "Save to Collection")}
            </button>
          </div>

          {/* About */}
          <div className="px-4 mb-5">
            <p className="text-sm font-bold mb-2" style={{ color: th.textPrimary }}>{lang === "es" ? "Acerca del libro" : "About the book"}</p>
            <p className="text-xs leading-relaxed" style={{ color: th.textMuted }}>
              {descExpanded ? book.description : (book.description?.slice(0, 160) ?? "")}
              {!descExpanded && (book.description?.length ?? 0) > 160 && (
                <button onClick={() => setDescExpanded(true)} className="font-bold ml-1" style={{ color: th.accent }}>{lang === "es" ? "Más" : "More"}</button>
              )}
            </p>
          </div>

          {/* Metadata chips */}
          <div className="flex gap-4 px-4 mb-6">
            {[
              { icon: "sections", label: `${book.chapter_count} ${lang === "es" ? "Capítulos" : "Chapters"}` },
              { icon: "language", label: lang === "es" ? "Español automático" : "English" },
              { icon: "year", label: book.year ? String(book.year) : "" },
            ].filter(m => m.label).map((m) => (
              <div key={m.label} className="flex items-center gap-1.5">
                <GeneratedMetaIcon type={m.icon as "sections" | "language" | "year"} size={15} />
                <span className="text-xs" style={{ color: th.textMuted }}>{m.label}</span>
              </div>
            ))}
          </div>

          <div className="mx-4 mb-4" style={{ height: "1px", backgroundColor: th.border }} />

          {/* Continue to reader */}
          <div className="px-4 pb-6">
            <button
              onClick={() => setShowDetail(false)}
              className="text-xs font-bold" style={{ color: th.accent }}
            >
              {lang === "es" ? "Ir a la lectura ↓" : "Skip to reading ↓"}
            </button>
          </div>
        </div>
      )}

      {/* ── TOC Drawer ─────────────────────────────────────────────────────── */}
      {showToc && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setShowToc(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-xs ml-0 mr-auto h-full flex flex-col overflow-y-auto shadow-2xl"
            style={{ backgroundColor: th.drawerBg, borderRight: `1px solid ${th.borderMed}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${th.borderMed}` }}>
              <p className="text-sm font-bold" style={{ color: th.textMuted }}>{lang === "es" ? "Índice" : "Table of Contents"}</p>
              <button onClick={() => setShowToc(false)} className="transition-colors" style={{ color: th.textVeryMuted }} aria-label={lang === "es" ? "Cerrar" : "Close"}>
                <UiIcon name="close" size={19} />
              </button>
            </div>
            <div className="p-3 space-y-0.5">
              {book.chapters.map((ch) => (
                <button
                  key={ch.number}
                  onClick={() => { setCurrentChapter(ch.number); setShowToc(false); setShowDetail(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors min-h-[40px]"
                  style={{
                    backgroundColor: ch.number === currentChapter ? th.tocActiveBg : "transparent",
                    color: ch.number === currentChapter ? th.tocActiveText : th.tocInactiveText,
                    fontWeight: ch.number === currentChapter ? "bold" : "normal",
                  }}
                >
                  {ch.number}. {bookSectionTitle(slug, ch.title, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings panel ─────────────────────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 px-4" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative rounded-2xl px-5 pt-5 pb-6 w-full max-w-sm"
            style={{ backgroundColor: th.drawerBg, border: `1px solid ${th.borderMed}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-4 px-1" style={{ color: th.textMuted }}>{lang === "es" ? "Ajustes de Lectura" : "Display Settings"}</p>
            <div className="mb-5">
              <p className="text-xs font-bold mb-3" style={{ color: th.textMuted }}>{lang === "es" ? "Tamaño del Texto" : "Text Size"}</p>
              <div className="flex gap-2">
                {(["sm", "md", "lg", "xl"] as FontSize[]).map((fs) => (
                  <button
                    key={fs}
                    onClick={() => setFontSize(fs)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      backgroundColor: fontSize === fs ? th.settingsBtnActiveBg : th.settingsBtnInactiveBg,
                      border: `1px solid ${fontSize === fs ? th.settingsBtnActiveBorder : th.settingsBtnInactiveBorder}`,
                      color: fontSize === fs ? th.settingsBtnActiveText : th.settingsBtnInactiveText,
                    }}
                  >
                    {lang === "es" ? ({ sm: "Pequeño", md: "Mediano", lg: "Grande", xl: "Muy Grande" } as Record<FontSize, string>)[fs] : FONT_SIZE_LABELS[fs]}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setShowSettings(false); setPresentationMode(true); }}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: th.presentBtnBg, border: `1px solid ${th.presentBtnBorder}`, color: th.presentBtnText }}
            >
              {lang === "es" ? "Modo Presentación / Domingo" : "Presentation / Sunday Mode"}
            </button>
          </div>
        </div>
      )}

      {showBookmarkModal && book && (
        <BookmarkModal
          item={{ id: `book::${slug}`, type: "book", title: bookTitle(book, lang), subtitle: book.author ?? undefined, preview: book.year ? String(book.year) : undefined }}
          label={bookTitle(book, lang)}
          onClose={() => { setShowBookmarkModal(false); refreshBookmarked(); }}
        />
      )}
    </div>
  );
}
