"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import Link from "next/link";
import { fetchBookDetail, fetchBookChapter } from "../../lib/api";
import type { BookDetail, BookChapter } from "../../lib/types";
import { useHighlights } from "../../lib/useHighlights";
import { applyHighlightsToHtml, type Highlight } from "../../lib/highlights";
import { HighlightToolbar } from "../../components/HighlightToolbar";
import { RemoveHighlightBubble } from "../../components/RemoveHighlightBubble";

// ─── Inline markdown → HTML (handles _italic_ and **bold**) ──────────────────
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
  themeText: string,
  highlights: Highlight[],
  onHighlightClick: (id: string, x: number, y: number) => void,
  presentationMode = false
): React.ReactNode {
  if (!content) return null;
  const paragraphs = content.split(/\n\n+/);
  return (
    <div
      className={`space-y-6 font-serif ${fontSize} ${themeText}`}
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      onClick={(e) => {
        // Click on a highlight mark → open remove confirmation
        const target = e.target as HTMLElement;
        if (target.dataset.hlId) {
          const rect = target.getBoundingClientRect();
          onHighlightClick(
            target.dataset.hlId,
            rect.left + rect.width / 2,
            rect.top
          );
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
            className={`${presentationMode ? "leading-loose" : "leading-[1.85]"} ${
              isHeading ? "font-bold text-center tracking-[0.2em] mt-10 mb-2 text-sm" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

type FontSize = "sm" | "md" | "lg" | "xl";
type Theme = "dark" | "sepia" | "light";

const FONT_SIZES: Record<FontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const THEMES: Record<Theme, {
  bg: string; text: string; panel: string; border: string;
  heading: string; subtext: string; muted: string; accent: string; divider: string;
}> = {
  dark: {
    bg: "bg-[#0f0f0f]", text: "text-white/80", panel: "bg-[#141414] border-white/[0.07]", border: "border-white/10",
    heading: "text-white/90", subtext: "text-white/50", muted: "text-white/30", accent: "text-amber-400/80", divider: "border-white/[0.06]",
  },
  sepia: {
    bg: "bg-[#1a1408]", text: "text-amber-100/80", panel: "bg-[#1e1a0e] border-amber-900/30", border: "border-amber-900/20",
    heading: "text-amber-100/90", subtext: "text-amber-200/50", muted: "text-amber-200/30", accent: "text-amber-400/80", divider: "border-amber-900/20",
  },
  light: {
    bg: "bg-[#f5f0e8]", text: "text-stone-800", panel: "bg-white border-stone-200", border: "border-stone-200",
    heading: "text-stone-900", subtext: "text-stone-500", muted: "text-stone-400", accent: "text-amber-700", divider: "border-stone-200",
  },
};

const BOOKMARK_KEY = (slug: string) => `axiom-bookmark-${slug}`;
const PROGRESS_KEY = (slug: string) => `axiom-progress-${slug}`;

export default function BookReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [book, setBook] = useState<BookDetail | null>(null);
  const [chapter, setChapter] = useState<BookChapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reader settings
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [theme, setTheme] = useState<Theme>("dark");
  const [presentationMode, setPresentationMode] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const th = THEMES[theme];

  // Highlights — keyed per book + chapter
  const hlContext = `book-${slug}-${currentChapter}`;
  const { highlights, selection, addHighlight, removeHighlight, dismissSelection } = useHighlights(hlContext);

  // Pending highlight removal: set when user clicks a mark; requires confirm.
  const [pendingRemove, setPendingRemove] = useState<{ id: string; x: number; y: number } | null>(null);

  // Load book metadata
  useEffect(() => {
    fetchBookDetail(slug)
      .then((b) => {
        setBook(b);
        // Restore bookmark
        const saved = localStorage.getItem(BOOKMARK_KEY(slug));
        const start = saved ? parseInt(saved, 10) : 1;
        setCurrentChapter(start);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Load chapter whenever currentChapter changes
  useEffect(() => {
    if (!book) return;
    setChapterLoading(true);
    fetchBookChapter(slug, currentChapter)
      .then(setChapter)
      .catch((e: Error) => setError(e.message))
      .finally(() => setChapterLoading(false));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug, book, currentChapter]);

  // Check if current chapter is bookmarked
  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARK_KEY(slug));
    setBookmarked(saved ? parseInt(saved, 10) === currentChapter : false);
  }, [slug, currentChapter]);

  // Auto-save reading progress whenever chapter changes
  useEffect(() => {
    if (!book) return;
    localStorage.setItem(
      PROGRESS_KEY(slug),
      JSON.stringify({ chapter: currentChapter, total: book.chapter_count })
    );
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

  const goPrev = () => {
    if (chapter?.has_prev) setCurrentChapter((n) => n - 1);
  };
  const goNext = () => {
    if (chapter?.has_next) setCurrentChapter((n) => n + 1);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400 text-sm">{error ?? "Book not found"}</p>
        <Link href="/library" className="text-amber-400 text-sm hover:underline">
          ← Back to Library
        </Link>
      </div>
    );
  }

  // ── Presentation / Sunday Mode ───────────────────────────────────────────────
  if (presentationMode) {
    return (
      <div
        className={`fixed inset-0 z-50 ${th.bg} flex flex-col`}
        onClick={() => setPresentationMode(false)}
      >
        {/* Exit hint */}
        <div className="absolute top-4 right-4 text-white/20 text-xs pointer-events-none">
          Press F or click anywhere to exit
        </div>

        {/* Chapter title */}
        <div className="px-8 pt-10 pb-4 flex-shrink-0 max-w-2xl mx-auto w-full border-b border-white/[0.06]">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-amber-400/50`}>
            {book.title} · Ch. {currentChapter}
          </p>
          <p
            className={`text-xl md:text-2xl font-bold ${th.text} leading-snug`}
            dangerouslySetInnerHTML={{
              __html: chapter ? renderInline(chapter.chapter_title) : "",
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {chapterLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-amber-400 animate-spin" />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full">
              {renderChapterContent(chapter?.content, "text-xl md:text-2xl", th.text, highlights, (id, x, y) => setPendingRemove({ id, x, y }), true)}
            </div>
          )}
        </div>

        {/* Nav bar */}
        <div
          className="flex items-center justify-between px-8 py-5 border-t border-white/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            disabled={!chapter?.has_prev}
            onClick={goPrev}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${
              chapter?.has_prev
                ? "bg-white/10 text-white/70 hover:bg-white/20"
                : "opacity-20 cursor-not-allowed text-white/30"
            }`}
          >
            ← Previous
          </button>
          <span className="text-white/25 text-sm">
            {currentChapter} / {book.chapter_count}
          </span>
          <button
            disabled={!chapter?.has_next}
            onClick={goNext}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${
              chapter?.has_next
                ? "bg-amber-600 text-white hover:bg-amber-500"
                : "opacity-20 cursor-not-allowed text-white/30"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ── Normal reader ─────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${th.bg} ${th.text} transition-colors`}>
      {/* Top bar */}
      <div className={`sticky top-14 z-30 border-b ${th.border} ${th.panel} backdrop-blur-md`}>
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/library"
              className={`text-xs ${th.muted} hover:${th.subtext} transition-colors flex-shrink-0`}
            >
              ← Library
            </Link>
            <span className={`${th.muted} text-xs flex-shrink-0 opacity-40`}>|</span>
            <p className={`text-xs font-bold ${th.subtext} truncate`}>{book.title}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* TOC toggle */}
            <button
              onClick={() => setShowToc((v) => !v)}
              title="Table of contents"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                showToc ? "bg-amber-600/20 text-amber-400" : `${th.muted} hover:${th.subtext}`
              }`}
            >
              ☰
            </button>

            {/* Font size */}
            <button
              onClick={() => {
                const order: FontSize[] = ["sm", "md", "lg", "xl"];
                const next = order[(order.indexOf(fontSize) + 1) % order.length];
                setFontSize(next);
              }}
              title="Font size"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${th.muted} hover:${th.subtext} transition-colors font-bold`}
            >
              A
            </button>

            {/* Theme */}
            <button
              onClick={() => {
                const order: Theme[] = ["dark", "sepia", "light"];
                const next = order[(order.indexOf(theme) + 1) % order.length];
                setTheme(next);
              }}
              title="Theme"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${th.muted} hover:${th.subtext} transition-colors`}
            >
              {theme === "dark" ? "🌙" : theme === "sepia" ? "🕯️" : "☀️"}
            </button>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              title="Bookmark this chapter"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                bookmarked ? "text-amber-400 bg-amber-600/10" : `${th.muted} hover:${th.subtext}`
              }`}
            >
              {bookmarked ? "🔖" : "☆"}
            </button>

            {/* Presentation mode */}
            <button
              onClick={() => setPresentationMode(true)}
              title="Presentation / Sunday Mode (F)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${th.muted} hover:text-violet-400 hover:bg-violet-600/10 transition-colors`}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>

      {/* TOC drawer */}
      {showToc && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setShowToc(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className={`relative w-full max-w-xs ml-0 mr-auto h-full ${th.panel} border-r flex flex-col shadow-2xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-bold text-white/70">Table of Contents</p>
              <button
                onClick={() => setShowToc(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-3 space-y-0.5">
              {book.chapters.map((ch) => (
                <button
                  key={ch.number}
                  onClick={() => {
                    setCurrentChapter(ch.number);
                    setShowToc(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors min-h-[40px] ${
                    ch.number === currentChapter
                      ? "bg-amber-600/20 text-amber-300 font-bold"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                  }`}
                >
                  {ch.number}. {ch.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Book header (first chapter or start) */}
        {currentChapter === 1 && (
          <div className="mb-12 text-center">
            {/* Decorative rule */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex-1 h-px ${th.divider}`} />
              <span className="text-amber-500/50 text-lg">✦</span>
              <div className={`flex-1 h-px ${th.divider}`} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${th.accent} mb-3`}>{book.author} · {book.year}</p>
            <h1 className={`text-3xl md:text-4xl font-black ${th.heading} mb-4 leading-tight`}>{book.title}</h1>
            <div className="flex flex-wrap gap-1.5 justify-center mb-5">
              {book.tags.map((t) => (
                <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${th.panel} ${th.subtext} border ${th.border}`}>
                  {t}
                </span>
              ))}
            </div>
            <p className={`text-sm ${th.subtext} leading-relaxed max-w-md mx-auto italic`}>{book.description}</p>
            <div className="flex items-center gap-3 mt-8">
              <div className={`flex-1 h-px ${th.divider}`} />
              <span className="text-amber-500/30 text-xs">✦</span>
              <div className={`flex-1 h-px ${th.divider}`} />
            </div>
          </div>
        )}

        {/* Chapter title */}
        <div className="mb-6">
          <p className={`text-xs ${th.accent} font-bold uppercase tracking-widest mb-1`}>
            Chapter {currentChapter} of {book.chapter_count}
          </p>
          <h2
            className={`text-xl md:text-2xl font-bold ${th.heading}`}
            dangerouslySetInnerHTML={{
              __html: chapter ? renderInline(chapter.chapter_title) : "Loading…",
            }}
          />
        </div>

        {/* Chapter content */}
        {chapterLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-amber-400 animate-spin" />
          </div>
        ) : (
          <>{renderChapterContent(chapter?.content, FONT_SIZES[fontSize], th.text, highlights, (id, x, y) => setPendingRemove({ id, x, y }))}</>
        )}

        {/* Chapter nav */}
        <div className={`flex items-center justify-between gap-4 mt-14 pt-8 border-t ${th.divider}`}>
          <button
            disabled={!chapter?.has_prev}
            onClick={goPrev}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px] ${
              chapter?.has_prev
                ? `${th.panel} ${th.subtext} hover:opacity-80`
                : `opacity-20 cursor-not-allowed ${th.muted}`
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={() => setPresentationMode(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-violet-400/70 hover:text-violet-400 hover:bg-violet-600/10 transition-colors"
            title="Open in Presentation Mode"
          >
            ⛶ Presentation
          </button>

          <button
            disabled={!chapter?.has_next}
            onClick={goNext}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px] ${
              chapter?.has_next
                ? "bg-amber-600/80 text-white hover:bg-amber-500"
                : "opacity-20 cursor-not-allowed text-white/30"
            }`}
          >
            Next →
          </button>
        </div>

        <p className={`text-center text-[10px] ${th.muted} mt-8 opacity-50`}>
          Public domain text via Project Gutenberg • Free to read, share, and distribute
        </p>
      </main>

      {/* Highlight toolbar — appears on text selection */}
      {selection && (
        <HighlightToolbar
          x={selection.x}
          y={selection.y}
          onHighlight={addHighlight}
          onDismiss={dismissSelection}
        />
      )}

      {/* Remove-highlight confirmation bubble */}
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

