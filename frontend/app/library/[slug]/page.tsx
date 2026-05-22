"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import Link from "next/link";
import { fetchBookDetail, fetchBookChapter } from "../../lib/api";
import type { BookDetail, BookChapter } from "../../lib/types";
import { useHighlights } from "../../lib/useHighlights";
import { applyHighlightsToHtml, type Highlight } from "../../lib/highlights";
import { HighlightToolbar } from "../../components/HighlightToolbar";
import { RemoveHighlightBubble } from "../../components/RemoveHighlightBubble";
import { useTheme } from "../../lib/useTheme";

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
  const paragraphs = content.split(/\n\n+/);
  return (
    <div
      className={`space-y-6 ${fontSize}`}
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: textColor, lineHeight: presentationMode ? "2" : "1.9" }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.hlId) {
          const rect = target.getBoundingClientRect();
          onHighlightClick(target.dataset.hlId, rect.left + rect.width / 2, rect.top);
        }
      }}
    >
      {paragraphs.map((para, i) => {
        const trimmed = para.trim().replace(/\n/g, " ").replace(/\s{2,}/g, " ");
        if (!trimmed) return null;
        const isHeading = trimmed.length < 60 && /^[A-Z][A-Z\s\d\.\-—]*$/.test(trimmed);
        const html = applyHighlightsToHtml(renderInline(trimmed), highlights);
        return (
          <p
            key={i}
            className={isHeading ? "font-bold text-center tracking-[0.2em] mt-10 mb-2 text-sm" : ""}
            style={isHeading ? { color: headingColor } : {}}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

// ─── Photo cover overrides (slug → public/covers/ image) ─────────────────────
const COVER_IMAGES: Record<string, string> = {
  "pilgrims-progress": "/covers/pilgrims-progress.png",
  "grace-abounding":   "/covers/grace-abounding.png",
};

// ─── Book cover for detail header ─────────────────────────────────────────────
const COVER_STYLES: Record<string, { from: string; via: string; to: string; accent: string; ornament: string }> = {
  "pilgrims-progress":      { from: "#1a0a2e", via: "#2d1b5e", to: "#0f0a1a", accent: "#a78bfa", ornament: "✦" },
  "grace-abounding":        { from: "#1a0d0d", via: "#3b1414", to: "#0f0a0a", accent: "#f87171", ornament: "†" },
  "confessions-augustine":  { from: "#0d1a0d", via: "#1a3a1a", to: "#0a0f0a", accent: "#6ee7b7", ornament: "α" },
  "imitation-of-christ":    { from: "#1a1400", via: "#3b3000", to: "#0f0d00", accent: "#fcd34d", ornament: "☩" },
  "institutes-of-religion": { from: "#0d1a24", via: "#1a3050", to: "#0a0f17", accent: "#7dd3fc", ornament: "✦" },
  "holiness-ryle":          { from: "#1a0d17", via: "#3b1a30", to: "#0f0a0d", accent: "#f0abfc", ornament: "✶" },
  "morning-evening-spurgeon":{ from: "#1a1000", via: "#3b2800", to: "#0f0900", accent: "#fb923c", ornament: "☀" },
  "sinners-in-hands-edwards":{ from: "#1a0800", via: "#3b1400", to: "#0f0600", accent: "#fb923c", ornament: "⚡" },
};
const DEFAULT_COVER = { from: "#0d0d1a", via: "#1a1a3b", to: "#0a0a0f", accent: "#a78bfa", ornament: "✦" };

function DetailBookCover({ slug, title, author }: { slug: string; title: string; author: string }) {
  const imageSrc = COVER_IMAGES[slug];
  if (imageSrc) {
    return (
      <div className="w-full h-full" style={{ position: "relative", overflow: "hidden" }}>
        <img src={imageSrc} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const style = COVER_STYLES[slug] ?? DEFAULT_COVER;
  return (
    <div
      className="w-full h-full flex flex-col justify-between p-4"
      style={{ background: `linear-gradient(160deg, ${style.from}, ${style.via} 50%, ${style.to})` }}
    >
      <div className="flex justify-between items-start">
        <div className="w-px self-stretch opacity-30" style={{ background: style.accent }} />
        <span className="text-xl opacity-40" style={{ color: style.accent }}>{style.ornament}</span>
      </div>
      <div className="text-center px-1">
        <p className="font-black uppercase leading-tight mb-3" style={{ color: style.accent, opacity: 0.75, fontSize: "10px", letterSpacing: "0.18em" }}>
          {author}
        </p>
        <p className="text-white font-bold text-sm leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {title}
        </p>
      </div>
      <div className="h-px w-12 mx-auto opacity-25" style={{ background: style.accent }} />
    </div>
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
  const isLight = theme === "light-elegant";

  const th = {
    pageBg:                  isLight ? "#f5f1eb"                                : "#0e0e18",
    topBarBg:                isLight ? "rgba(245,241,235,0.95)"                 : "rgba(14,14,24,0.95)",
    bottomBarBg:             isLight ? "rgba(245,241,235,0.97)"                 : "rgba(14,14,24,0.97)",
    textPrimary:             isLight ? "#1c1409"                                : "rgba(255,255,255,0.95)",
    textContent:             isLight ? "#2c1f0a"                                : "rgba(255,255,255,0.82)",
    textMuted:               isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    textVeryMuted:           isLight ? "#c4b090"                                : "rgba(255,255,255,0.2)",
    textFaint:               isLight ? "#b09878"                                : "rgba(255,255,255,0.3)",
    headingColor:            isLight ? "#9b8560"                                : "rgba(255,255,255,0.5)",
    accent:                  isLight ? "#9b7228"                                : "#a78bfa",
    accentLight:             isLight ? "#c4973a"                                : "#c4b5fd",
    border:                  isLight ? "rgba(155,114,40,0.15)"                  : "rgba(255,255,255,0.07)",
    borderLight:             isLight ? "rgba(155,114,40,0.08)"                  : "rgba(255,255,255,0.05)",
    borderMed:               isLight ? "rgba(155,114,40,0.18)"                  : "rgba(255,255,255,0.08)",
    drawerBg:                isLight ? "#f0ebe0"                                : "#141424",
    readNowGradient:         isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": "linear-gradient(135deg,#ec4899,#a855f7)",
    nextBtnGradient:         isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": "linear-gradient(135deg,#ec4899,#a855f7)",
    prevBtnBg:               isLight ? "rgba(155,114,40,0.08)"                  : "rgba(255,255,255,0.07)",
    prevBtnBorder:           isLight ? "rgba(155,114,40,0.18)"                  : "rgba(255,255,255,0.08)",
    tagBg:                   isLight ? "rgba(155,114,40,0.12)"                  : "rgba(124,58,237,0.2)",
    tagBorder:               isLight ? "rgba(155,114,40,0.3)"                   : "rgba(124,58,237,0.35)",
    tagColor:                isLight ? "#9b7228"                                : "#c4b5fd",
    tocActiveBg:             isLight ? "rgba(155,114,40,0.15)"                  : "rgba(124,58,237,0.2)",
    tocActiveText:           isLight ? "#9b7228"                                : "#c4b5fd",
    tocInactiveText:         isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    settingsBtnActiveBg:     isLight ? "rgba(155,114,40,0.2)"                   : "rgba(124,58,237,0.3)",
    settingsBtnActiveBorder: isLight ? "rgba(155,114,40,0.5)"                   : "rgba(124,58,237,0.5)",
    settingsBtnActiveText:   isLight ? "#9b7228"                                : "#c4b5fd",
    settingsBtnInactiveBg:   isLight ? "rgba(155,114,40,0.05)"                  : "rgba(255,255,255,0.05)",
    settingsBtnInactiveBorder:isLight ? "rgba(155,114,40,0.12)"                 : "rgba(255,255,255,0.08)",
    settingsBtnInactiveText: isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    presentBtnBg:            isLight ? "rgba(155,114,40,0.1)"                   : "rgba(124,58,237,0.15)",
    presentBtnBorder:        isLight ? "rgba(155,114,40,0.28)"                  : "rgba(124,58,237,0.3)",
    presentBtnText:          isLight ? "#9b7228"                                : "#c4b5fd",
    iconActive:              isLight ? "#9b7228"                                : "#a78bfa",
    iconInactive:            isLight ? "#9b8560"                                : "rgba(255,255,255,0.4)",
    addLibBorder:            isLight ? "rgba(155,114,40,0.2)"                   : "rgba(255,255,255,0.12)",
    addLibText:              isLight ? "#6b5226"                                : "rgba(255,255,255,0.7)",
    sliderProgress:          isLight ? "#9b7228"                                : "#a855f7",
    sliderTrack:             isLight ? "rgba(155,114,40,0.15)"                  : "rgba(255,255,255,0.1)",
    sliderCss:               isLight
      ? `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c4973a,#9b7228);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c4973a,#9b7228);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`
      : `.reader-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.reader-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 0 8px rgba(168,85,247,0.6);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}.reader-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 0 8px rgba(168,85,247,0.6);cursor:pointer;border:2px solid rgba(255,255,255,0.3)}`,
    footerText:              isLight ? "rgba(155,114,40,0.4)"                   : "rgba(255,255,255,0.15)",
  };

  const [book, setBook] = useState<BookDetail | null>(null);
  const [chapter, setChapter] = useState<BookChapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  // Reader settings
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  // Highlights
  const hlContext = `book-${slug}-${currentChapter}`;
  const { highlights, selection, addHighlight, removeHighlight, dismissSelection } = useHighlights(hlContext);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; x: number; y: number } | null>(null);

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

  // Load chapter
  useEffect(() => {
    if (!book) return;
    setChapterLoading(true);
    fetchBookChapter(slug, currentChapter)
      .then(setChapter)
      .catch((e: Error) => setError(e.message))
      .finally(() => setChapterLoading(false));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug, book, currentChapter]);

  // Sync bookmark state
  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARK_KEY(slug));
    setBookmarked(saved ? parseInt(saved, 10) === currentChapter : false);
  }, [slug, currentChapter]);

  // Auto-save progress
  useEffect(() => {
    if (!book) return;
    localStorage.setItem(PROGRESS_KEY(slug), JSON.stringify({ chapter: currentChapter, total: book.chapter_count }));
  }, [slug, book, currentChapter]);

  const toggleBookmark = useCallback(() => {
    if (bookmarked) {
      localStorage.removeItem(BOOKMARK_KEY(slug));
      setBookmarked(false);
    } else {
      localStorage.setItem(BOOKMARK_KEY(slug), String(currentChapter));
      setBookmarked(true);
    }
  }, [slug, currentChapter, bookmarked]);

  const goPrev = () => { if (chapter?.has_prev) setCurrentChapter((n) => n - 1); };
  const goNext = () => { if (chapter?.has_next) setCurrentChapter((n) => n + 1); };

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
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

  // ── Normal Reader ───────────────────────────────────────────────────────────
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
            style={{ color: bookmarked ? "#fbbf24" : th.iconInactive }}
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

      {/* ── Book detail section (shown on first open) ─────────────────────── */}
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
                <span style={{ color: "#fbbf24" }}>★</span>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} style={{ color: bookmarked ? "#fbbf24" : th.addLibText }}>
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
              { icon: "📄", label: `${book.chapter_count} Chapters` },
              { icon: "🌐", label: "English" },
              { icon: "📅", label: book.year ? String(book.year) : "" },
            ].filter(m => m.label).map((m) => (
              <div key={m.label} className="flex items-center gap-1.5">
                <span className="text-sm">{m.icon}</span>
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
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative rounded-t-3xl px-5 pt-3 pb-8"
            style={{ backgroundColor: th.drawerBg, border: `1px solid ${th.borderMed}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: th.borderMed }} />
            <p className="text-xs font-black uppercase tracking-widest mb-4 px-1" style={{ color: th.textMuted }}>Display Settings</p>

            {/* Font size */}
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

            {/* Presentation mode */}
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

      {/* ── Reading content ─────────────────────────────────────────────────── */}
      {!showDetail && (
        <main className="max-w-2xl mx-auto px-5 pt-8 pb-40">

          {/* Chapter label */}
          <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: th.accent }}>
            Chapter {currentChapter}
          </p>

          {/* Chapter title */}
          <h2
            className="text-2xl font-black mb-8 leading-tight"
            style={{ color: th.textPrimary }}
            dangerouslySetInnerHTML={{ __html: chapter ? renderInline(chapter.chapter_title) : "Loading…" }}
          />

          {/* Content */}
          {chapterLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: th.borderMed, borderTopColor: th.accent }} />
            </div>
          ) : (
            renderChapterContent(chapter?.content, FONT_SIZES[fontSize], highlights, (id, x, y) => setPendingRemove({ id, x, y }), false, th.textContent, th.headingColor)
          )}

          {/* Chapter nav buttons */}
          <div className="flex items-center justify-between gap-4 mt-14 pt-8" style={{ borderTop: `1px solid ${th.borderLight}` }}>
            <button
              disabled={!chapter?.has_prev}
              onClick={goPrev}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]"
              style={{
                backgroundColor: chapter?.has_prev ? th.prevBtnBg : "transparent",
                color: chapter?.has_prev ? th.addLibText : th.textVeryMuted,
                border: `1px solid ${th.prevBtnBorder}`,
                cursor: chapter?.has_prev ? "pointer" : "not-allowed",
              }}
            >
              ← Previous
            </button>
            <button
              disabled={!chapter?.has_next}
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]"
              style={{
                background: chapter?.has_next ? th.nextBtnGradient : "transparent",
                color: chapter?.has_next ? "white" : th.textVeryMuted,
                cursor: chapter?.has_next ? "pointer" : "not-allowed",
              }}
            >
              Next →
            </button>
          </div>

          <p className="text-center text-[10px] mt-8" style={{ color: th.footerText }}>
            Public domain text via Project Gutenberg • Free to read, share, and distribute
          </p>
        </main>
      )}

      {/* ── Fixed bottom bar (progress + toolbar) ───────────────────────────── */}
      {!showDetail && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30"
          style={{
            backgroundColor: th.bottomBarBg,
            backdropFilter: "blur(16px)",
            borderTop: `1px solid ${th.border}`,
            paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
          }}
        >
          {/* Progress slider */}
          <div className="px-5 pt-3 pb-2">
            <style>{th.sliderCss}</style>
            <input
              type="range"
              min={1}
              max={book.chapter_count}
              value={currentChapter}
              onChange={(e) => { setCurrentChapter(Number(e.target.value)); setShowDetail(false); }}
              className="reader-slider w-full"
              style={{
                background: `linear-gradient(to right, ${th.sliderProgress} ${progressPct}%, ${th.sliderTrack} ${progressPct}%)`,
              }}
            />
            <p className="text-center mt-2 text-[11px]" style={{ color: th.textVeryMuted }}>
              {currentChapter} / {book.chapter_count}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-around px-4 pb-1 pt-1" style={{ borderTop: `1px solid ${th.borderLight}` }}>
            {/* Display */}
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: showSettings ? th.iconActive : th.iconInactive }}
            >
              <span className="text-xs font-bold" style={{ fontFamily: "serif", lineHeight: 1 }}>Aa</span>
              <span className="text-[9px] font-bold">Display</span>
            </button>

            {/* TOC */}
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

            {/* Text Size */}
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

            {/* More */}
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
