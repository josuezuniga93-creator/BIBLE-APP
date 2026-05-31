"use client";

import { useEffect, useState, useCallback, use, useRef, useMemo } from "react";
import { usePagination } from "../../hooks/usePagination";
import Link from "next/link";
import Image from "next/image";
import { fetchBookDetail, fetchBookChapter } from "../../lib/api";
import type { BookDetail, BookChapter } from "../../lib/types";
import { getBookCoverImage } from "../../lib/bookCoverImages";
import { useHighlights } from "../../lib/useHighlights";
import { useLanguage } from "../../lib/useLanguage";
import { translateToSpanish } from "../../lib/googleTranslate";
import { applyHighlightsToHtml, type Highlight } from "../../lib/highlights";
import { HighlightToolbar } from "../../components/HighlightToolbar";
import { RemoveHighlightBubble } from "../../components/RemoveHighlightBubble";
import { useTheme } from "../../lib/useTheme";
import { BookmarkModal } from "../../components/BookmarkModal";
import { isAnySaved } from "../../lib/collections";
import { GeneratedBookCover, GeneratedMetaIcon } from "../../components/GeneratedArtwork";

// ─── Inline markdown → HTML ───────────────────────────────────────────────────
function renderInline(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

function renderChapterContent(
  content: string | undefined,
  fontSize: string,
  highlights: Highlight[],
  onHighlightClick: (id: string, x: number, y: number) => void,
  presentationMode = false,
  textColor = "rgba(255,255,255,0.82)",
  headingColor = "rgba(255,255,255,0.5)"
): React.ReactNode {
  if (!content) return null;
  // Content arriving here has already been through normalizeBookContent (via
  // usePagination rawText:true), so each \n\n boundary is a real paragraph
  // break and there are no soft-wrapped single-\n line breaks inside paragraphs.
  const paragraphs = content.split(/\n\n+/);
  return (
    <div
      className={`${fontSize}`}
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: textColor,
        lineHeight: presentationMode ? "2" : "1.9",
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.hlId) {
          const rect = target.getBoundingClientRect();
          onHighlightClick(target.dataset.hlId, rect.left + rect.width / 2, rect.top);
        }
      }}
    >
      {paragraphs.map((para, i) => {
        // Trim and collapse any residual whitespace within the line
        const trimmed = para.trim().replace(/[ \t]+/g, " ");
        if (!trimmed) return null;
        const isChapterHeading =
          trimmed.length < 80 && /^[A-Z][A-Z0-9\s\.\-—,:'"!?]+$/.test(trimmed);
        const html = applyHighlightsToHtml(renderInline(trimmed), highlights);
        return (
          <p
            key={i}
            className={isChapterHeading ? "font-bold text-center tracking-[0.2em] text-sm" : ""}
            style={{
              ...(isChapterHeading ? { color: headingColor } : {}),
              // Give real inter-paragraph spacing; headings get more breathing room
              marginBottom: isChapterHeading ? "1.5em" : "1.25em",
              marginTop: isChapterHeading ? "2em" : 0,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

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
  const isLight    = theme === "light-elegant";
  const isGoldNavy = theme === "gold-navy";

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
    sliderCss:               isLight
      ? `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c4973a,#9b7228);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c4973a,#9b7228);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`
      : isGoldNavy
      ? `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#d4b87a,#c9a961);box-shadow:0 0 8px rgba(201,169,97,0.5);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#d4b87a,#c9a961);box-shadow:0 0 8px rgba(201,169,97,0.5);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`
      : `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 0 8px rgba(168,85,247,0.6);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 0 8px rgba(168,85,247,0.6);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`,
    footerText:              isLight ? "rgba(155,114,40,0.4)"                   : "rgba(255,255,255,0.15)",
  };

  const { lang } = useLanguage();

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

  // Highlights
  const hlContext = `book-${slug}-${currentChapter}`;
  const { highlights, selection, addHighlight, removeHighlight, dismissSelection } = useHighlights(hlContext);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── In-chapter pagination ─────────────────────────────────────────────────
  const chapterContent = chapter?.content ?? "";
  const pageStorageKey = `axiom-page-${slug}-${currentChapter}`;
  const {
    pages,
    currentPage,
    totalPages,
    goNextPage,
    goPrevPage,
    isFirstPage,
    isLastPage,
  } = usePagination({
    content: chapterContent,
    fontSize,
    storageKey: pageStorageKey,
    rawText: true,   // Gutenberg / hard-wrapped plain text — normalize soft wraps
  });

  // Scroll to top when page turns
  useEffect(() => {
    if (!showDetail) {
      contentRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [currentPage, showDetail]);

  // Load book metadata
  useEffect(() => {
    fetchBookDetail(slug)
      .then((b) => {
        setBook(b);
        const saved = localStorage.getItem(BOOKMARK_KEY(slug));
        const start = saved ? parseInt(saved, 10) : 1;
        setCurrentChapter(start);
        if (start > 1) setShowDetail(false);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

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
    localStorage.setItem(PROGRESS_KEY(slug), JSON.stringify({ chapter: currentChapter, total: book.chapter_count, lastRead: Date.now() }));
  }, [slug, book, currentChapter]);

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
        <p className="text-red-400 text-sm">{error ?? "Book not found"}</p>
        <Link href="/library" className="text-sm hover:underline" style={{ color: th.accent }}>← Back to Library</Link>
      </div>
    );
  }

  const progressPct = book.chapter_count > 0 ? Math.round((currentChapter / book.chapter_count) * 100) : 0;

  // ── Presentation Mode ───────────────────────────────────────────────────────
  if (presentationMode) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: th.pageBg }}
        onClick={() => setPresentationMode(false)}
      >
        <div className="absolute top-4 right-4 text-xs pointer-events-none" style={{ color: th.textVeryMuted }}>Press F or tap to exit</div>
        <div className="px-8 pt-10 pb-4 flex-shrink-0 max-w-2xl mx-auto w-full" style={{ borderBottom: `1px solid ${th.borderLight}` }}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: th.accentLight }}>
            {book.title} · Ch. {currentChapter}
          </p>
          <p className="text-xl md:text-2xl font-bold leading-snug" style={{ color: th.textPrimary }}
            dangerouslySetInnerHTML={{ __html: chapter ? renderInline(chapter.chapter_title) : "" }} />
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {chapterLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: th.borderMed, borderTopColor: th.accent }} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full">
              {renderChapterContent(chapter?.content, "text-xl md:text-2xl", highlights, (id, x, y) => setPendingRemove({ id, x, y }), true, th.textContent, th.headingColor)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-8 py-5" style={{ borderTop: `1px solid ${th.borderLight}` }} onClick={(e) => e.stopPropagation()}>
          <button disabled={!chapter?.has_prev} onClick={goPrev}
            className="px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
            style={{ backgroundColor: chapter?.has_prev ? th.prevBtnBg : "transparent", color: chapter?.has_prev ? th.addLibText : th.textVeryMuted, cursor: chapter?.has_prev ? "pointer" : "not-allowed" }}>
            ← Previous
          </button>
          <span style={{ color: th.textVeryMuted, fontSize: "14px" }}>{currentChapter} / {book.chapter_count}</span>
          <button disabled={!chapter?.has_next} onClick={goNext}
            className="px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
            style={{ background: chapter?.has_next ? th.nextBtnGradient : "transparent", color: chapter?.has_next ? "white" : th.textVeryMuted, cursor: chapter?.has_next ? "pointer" : "not-allowed" }}>
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ── Full-screen reading overlay ─────────────────────────────────────────────
  if (!showDetail) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

        {/* Top bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 h-12"
          style={{ backgroundColor: th.pageBg, borderBottom: `1px solid ${th.border}` }}
        >
          <button
            onClick={() => setShowDetail(true)}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: th.accent }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <span className="text-xs font-medium truncate max-w-[60%] text-center" style={{ color: th.textMuted }}>
            {book.title}
          </span>
          <div className="w-12" />
        </div>

        {/* Progress bar + toolbar — flex-shrink-0 */}
        <div
          className="flex-shrink-0"
          style={{ backgroundColor: th.bottomBarBg, borderBottom: `1px solid ${th.border}` }}
        >
          <div className="px-5 pt-3 pb-2">
            <style>{th.sliderCss}</style>
            <input
              type="range"
              min={1}
              max={book.chapter_count}
              value={currentChapter}
              onChange={(e) => setCurrentChapter(Number(e.target.value))}
              className="reader-slider w-full"
              style={{
                background: `linear-gradient(to right, ${th.sliderProgress} ${progressPct}%, ${th.sliderTrack} ${progressPct}%)`,
              }}
            />
            <p className="text-center mt-2 text-[11px]" style={{ color: th.textVeryMuted }}>
              {currentChapter} / {book.chapter_count}
            </p>
          </div>
          <div className="flex items-center justify-around px-4 pb-1 pt-1" style={{ borderTop: `1px solid ${th.borderLight}` }}>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: showSettings ? th.iconActive : th.iconInactive }}
            >
              <span className="text-xs font-bold" style={{ fontFamily: "serif", lineHeight: 1 }}>Aa</span>
              <span className="text-[9px] font-bold">Display</span>
            </button>
            <button
              onClick={() => setShowToc((v) => !v)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: showToc ? th.iconActive : th.iconInactive }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-[9px] font-bold">Contents</span>
            </button>
            <button
              onClick={() => {
                const order: FontSize[] = ["sm", "md", "lg", "xl"];
                setFontSize((prev) => order[(order.indexOf(prev) + 1) % order.length]);
              }}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: th.iconInactive }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 20L10 4l6 16M6 15h8M16 20l2-4 2 4M17.5 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[9px] font-bold">Text Size</span>
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: th.iconInactive }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
              </svg>
              <span className="text-[9px] font-bold">More</span>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto" }}>
          <main className="px-5 pt-8 pb-8 max-w-2xl mx-auto">
            <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: th.accent }}>
              Chapter {currentChapter}
              {totalPages > 1 && (
                <span style={{ color: th.textVeryMuted, fontWeight: "normal", letterSpacing: "0.05em" }}>
                  {" "}· p. {currentPage}/{totalPages}
                </span>
              )}
            </p>
            {/* Show title only on first page */}
            {isFirstPage && (
              <h2
                className="text-2xl font-black mb-8 leading-tight"
                style={{ color: th.textPrimary }}
                dangerouslySetInnerHTML={{ __html: chapter ? renderInline(chapter.chapter_title) : "Loading…" }}
              />
            )}
            {/* Spanish translation status bar */}
            {lang === "es" && (translating || translatedChapter) && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs"
                style={{ backgroundColor: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.18)", color: th.textMuted }}>
                {translating ? (
                  <>
                    <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
                    <span>Traduciendo al español… {translateProgress}%</span>
                  </>
                ) : (
                  <>
                    <span>🌐</span>
                    <span>Traducido al español automáticamente</span>
                  </>
                )}
              </div>
            )}
            {chapterLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 rounded-full border-2 animate-spin"
                  style={{ borderColor: th.borderMed, borderTopColor: th.accent }} />
              </div>
            ) : (
              <div
                key={`${currentChapter}-${currentPage}`}
                style={{ animation: "axiomPageIn 0.18s ease-out" }}
              >
                <style>{`@keyframes axiomPageIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                {renderChapterContent(
                  // In Spanish mode show full translated chapter (scrollable); else use pagination
                  lang === "es" && translatedChapter
                    ? translatedChapter
                    : pages[currentPage - 1] ?? "",
                  FONT_SIZES[fontSize], highlights, (id, x, y) => setPendingRemove({ id, x, y }), false, th.textContent, th.headingColor)}
              </div>
            )}
            <p className="text-center text-[10px] mt-8" style={{ color: th.footerText }}>
              Public domain text • Free to read, share, and distribute
            </p>
          </main>
        </div>

        {/* Bottom bar — page-then-chapter nav */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: th.pageBg, borderTop: `1px solid ${th.border}` }}
        >
          {/* ← Prev: prev page first, then prev chapter */}
          <button
            disabled={isFirstPage && !chapter?.has_prev}
            onClick={() => { if (!goPrevPage()) goPrev(); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]"
            style={{
              backgroundColor: (!isFirstPage || chapter?.has_prev) ? th.prevBtnBg : "transparent",
              color: (!isFirstPage || chapter?.has_prev) ? th.addLibText : th.textVeryMuted,
              border: `1px solid ${th.prevBtnBorder}`,
              cursor: (!isFirstPage || chapter?.has_prev) ? "pointer" : "not-allowed",
            }}
          >
            ← Prev
          </button>

          {/* Center page indicator */}
          {totalPages > 1 && (
            <span className="text-xs font-bold" style={{ color: th.textVeryMuted }}>
              {currentPage} / {totalPages}
            </span>
          )}

          {/* Next →: next page first, then next chapter */}
          <button
            disabled={isLastPage && !chapter?.has_next}
            onClick={() => { if (!goNextPage()) goNext(); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]"
            style={{
              background: (!isLastPage || chapter?.has_next) ? th.nextBtnGradient : "transparent",
              color: (!isLastPage || chapter?.has_next) ? "white" : th.textVeryMuted,
              cursor: (!isLastPage || chapter?.has_next) ? "pointer" : "not-allowed",
            }}
          >
            Next →
          </button>
        </div>

        {/* TOC Drawer */}
        {showToc && (
          <div className="fixed inset-0 z-40 flex" onClick={() => setShowToc(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="relative w-full max-w-xs ml-0 mr-auto h-full flex flex-col overflow-y-auto shadow-2xl"
              style={{ backgroundColor: th.drawerBg, borderRight: `1px solid ${th.borderMed}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${th.borderMed}` }}>
                <p className="text-sm font-bold" style={{ color: th.textMuted }}>Table of Contents</p>
                <button onClick={() => setShowToc(false)} className="transition-colors text-lg" style={{ color: th.textVeryMuted }}>✕</button>
              </div>
              <div className="p-3 space-y-0.5">
                {book.chapters.map((ch) => (
                  <button
                    key={ch.number}
                    onClick={() => { setCurrentChapter(ch.number); setShowToc(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors min-h-[40px]"
                    style={{
                      backgroundColor: ch.number === currentChapter ? th.tocActiveBg : "transparent",
                      color: ch.number === currentChapter ? th.tocActiveText : th.tocInactiveText,
                      fontWeight: ch.number === currentChapter ? "bold" : "normal",
                    }}
                  >
                    {ch.number}. {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 px-4" onClick={() => setShowSettings(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="relative rounded-2xl px-5 pt-5 pb-6 w-full max-w-sm"
              style={{ backgroundColor: th.drawerBg, border: `1px solid ${th.borderMed}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-4 px-1" style={{ color: th.textMuted }}>Display Settings</p>
              <div className="mb-5">
                <p className="text-xs font-bold mb-3" style={{ color: th.textMuted }}>Text Size</p>
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
                      {FONT_SIZE_LABELS[fs]}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setShowSettings(false); setPresentationMode(true); }}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: th.presentBtnBg, border: `1px solid ${th.presentBtnBorder}`, color: th.presentBtnText }}
              >
                ⛶ Presentation / Sunday Mode
              </button>
            </div>
          </div>
        )}

        {/* Highlight toolbar */}
        {selection && (
          <HighlightToolbar
            x={selection.x}
            y={selection.y}
            onHighlight={addHighlight}
            onDismiss={dismissSelection}
          />
        )}

        {/* Remove-highlight bubble */}
        {pendingRemove && (
          <RemoveHighlightBubble
            x={pendingRemove.x}
            y={pendingRemove.y}
            onConfirm={() => { removeHighlight(pendingRemove.id); setPendingRemove(null); }}
            onDismiss={() => setPendingRemove(null)}
          />
        )}
      </div>
    );
  }

  // ── Detail page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

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
          {book.title}
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
                {book.title}
              </h1>
              <p className="text-sm font-semibold mb-2" style={{ color: th.accent }}>{book.author}</p>
              <div className="flex items-center gap-1 mb-3">
                <span style={{ color: "#c9a961" }}>★</span>
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
                <span style={{ color: "#34d399", fontSize: "12px" }}>✓</span>
                <span style={{ color: "#34d399", fontSize: "11px", fontWeight: "bold" }}>Free</span>
                <span style={{ color: "rgba(52,211,153,0.6)", fontSize: "11px" }}>100% free to read</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 flex flex-col gap-2.5 mb-5">
            <button
              onClick={() => setShowDetail(false)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
              style={{ background: th.readNowGradient }}
            >
              Read Now
            </button>
            <button
              onClick={toggleBookmark}
              className="w-full py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              style={{ border: `1px solid ${th.addLibBorder}`, color: th.addLibText, backgroundColor: "transparent" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} style={{ color: bookmarked ? "#c9a961" : th.addLibText }}>
                <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              {bookmarked ? "Bookmarked" : "Add to Library"}
            </button>
          </div>

          {/* About */}
          <div className="px-4 mb-5">
            <p className="text-sm font-bold mb-2" style={{ color: th.textPrimary }}>About the book</p>
            <p className="text-xs leading-relaxed" style={{ color: th.textMuted }}>
              {descExpanded ? book.description : (book.description?.slice(0, 160) ?? "")}
              {!descExpanded && (book.description?.length ?? 0) > 160 && (
                <button onClick={() => setDescExpanded(true)} className="font-bold ml-1" style={{ color: th.accent }}>More</button>
              )}
            </p>
          </div>

          {/* Metadata chips */}
          <div className="flex gap-4 px-4 mb-6">
            {[
              { icon: "sections", label: `${book.chapter_count} Chapters` },
              { icon: "language", label: "English" },
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
              Skip to reading ↓
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
              <p className="text-sm font-bold" style={{ color: th.textMuted }}>Table of Contents</p>
              <button onClick={() => setShowToc(false)} className="transition-colors text-lg" style={{ color: th.textVeryMuted }}>✕</button>
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
                  {ch.number}. {ch.title}
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
            <p className="text-xs font-black uppercase tracking-widest mb-4 px-1" style={{ color: th.textMuted }}>Display Settings</p>
            <div className="mb-5">
              <p className="text-xs font-bold mb-3" style={{ color: th.textMuted }}>Text Size</p>
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
                    {FONT_SIZE_LABELS[fs]}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setShowSettings(false); setPresentationMode(true); }}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: th.presentBtnBg, border: `1px solid ${th.presentBtnBorder}`, color: th.presentBtnText }}
            >
              ⛶ Presentation / Sunday Mode
            </button>
          </div>
        </div>
      )}

      {/* Highlight toolbar */}
      {selection && (
        <HighlightToolbar
          x={selection.x}
          y={selection.y}
          onHighlight={addHighlight}
          onDismiss={dismissSelection}
        />
      )}

      {/* Remove-highlight bubble */}
      {pendingRemove && (
        <RemoveHighlightBubble
          x={pendingRemove.x}
          y={pendingRemove.y}
          onConfirm={() => { removeHighlight(pendingRemove.id); setPendingRemove(null); }}
          onDismiss={() => setPendingRemove(null)}
        />
      )}

      {showBookmarkModal && book && (
        <BookmarkModal
          item={{ id: `book::${slug}`, type: "book", title: book.title, subtitle: book.author ?? undefined, preview: book.year ? String(book.year) : undefined }}
          label={book.title}
          onClose={() => { setShowBookmarkModal(false); refreshBookmarked(); }}
        />
      )}
    </div>
  );
}
