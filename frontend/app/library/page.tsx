"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { BookCatalogEntry } from "../lib/types";
import { STATIC_BOOK_CATALOG } from "../lib/bookCatalog";
import { useTheme } from "../lib/useTheme";

// ─── Book cover palette ────────────────────────────────────────────────────────

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

function BookCover({ book, size = "full" }: { book: BookCatalogEntry; size?: "full" | "small" }) {
  const style = COVER_STYLES[book.slug] ?? DEFAULT_COVER;
  const isSmall = size === "small";
  return (
    <div
      className="w-full h-full flex flex-col justify-between"
      style={{
        background: `linear-gradient(160deg, ${style.from}, ${style.via} 50%, ${style.to})`,
        padding: isSmall ? "6px" : "16px",
      }}
    >
      <div className="flex justify-between items-start">
        <div className="w-px self-stretch opacity-25" style={{ background: style.accent }} />
        <span style={{ color: style.accent, opacity: 0.4, fontSize: isSmall ? "8px" : "18px" }}>
          {style.ornament}
        </span>
      </div>
      <div className="text-center" style={{ padding: isSmall ? "0 2px" : "0 4px" }}>
        {!isSmall && (
          <p
            className="font-black uppercase leading-tight"
            style={{ color: style.accent, opacity: 0.7, fontSize: "9px", letterSpacing: "0.15em", marginBottom: "6px" }}
          >
            {book.author}
          </p>
        )}
        <p
          className="text-white font-bold leading-snug"
          style={{ fontSize: isSmall ? "8px" : "13px", WebkitLineClamp: isSmall ? 3 : 4, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {book.title}
        </p>
      </div>
      <div className="h-px w-8 mx-auto opacity-20" style={{ background: style.accent }} />
    </div>
  );
}

// ─── Categories ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  "All":        "📚",
  "Puritan":    "✝️",
  "Patristic":  "🏛",
  "Reformed":   "⛪",
  "Devotional": "🕯️",
  "Theology":   "📖",
  "Classic":    "🏺",
  "Allegory":   "🌿",
};

const CATEGORIES = [
  "All", "Puritan", "Patristic", "Reformed", "Devotional", "Theology", "Classic", "Allegory",
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProgressEntry = { book: BookCatalogEntry; chapter: number; total: number };
type LibTab = "books" | "reading" | "completed";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { theme } = useTheme();
  const isLight = theme === "light-elegant";

  const th = {
    pageBg:            isLight ? "#f5f1eb"                              : "#0e0e18",
    textPrimary:       isLight ? "#1c1409"                              : "rgba(255,255,255,0.92)",
    textSecondary:     isLight ? "#6b5226"                              : "rgba(255,255,255,0.38)",
    textMuted:         isLight ? "#9b8560"                              : "rgba(255,255,255,0.4)",
    textFaint:         isLight ? "#b09878"                              : "rgba(255,255,255,0.25)",
    textVeryFaint:     isLight ? "#c4b090"                              : "rgba(255,255,255,0.22)",
    accent:            isLight ? "#9b7228"                              : "#a78bfa",
    accentLight:       isLight ? "#c4973a"                              : "#c4b5fd",
    primary:           isLight ? "#9b7228"                              : "#7c3aed",
    heroBg:            isLight ? "linear-gradient(135deg,rgba(196,151,58,0.28) 0%,rgba(237,228,205,0.96) 55%,rgba(215,196,148,0.22) 100%)"
                               : "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)",
    heroAccentText:    isLight ? "#9b7228"                              : "#c084fc",
    heroSubtext:       isLight ? "rgba(107,82,38,0.85)"                 : "rgba(255,255,255,0.4)",
    heroGlow:          isLight ? "none"                                 : "radial-gradient(circle,#c084fc 0%,transparent 70%)",
    cardBg:            isLight ? "rgba(155,114,40,0.06)"                : "rgba(255,255,255,0.03)",
    cardBorder:        isLight ? "rgba(155,114,40,0.20)"                : "rgba(255,255,255,0.07)",
    searchBg:          isLight ? "rgba(155,114,40,0.08)"                : "rgba(255,255,255,0.06)",
    searchBorder:      isLight ? "rgba(155,114,40,0.22)"                : "rgba(255,255,255,0.08)",
    catActiveBg:       isLight ? "rgba(155,114,40,0.15)"                : "rgba(124,58,237,0.25)",
    catActiveBorder:   isLight ? "rgba(155,114,40,0.5)"                 : "rgba(167,139,250,0.5)",
    catInactiveBg:     isLight ? "rgba(155,114,40,0.04)"                : "rgba(255,255,255,0.04)",
    catInactiveBorder: isLight ? "rgba(155,114,40,0.14)"                : "rgba(255,255,255,0.08)",
    progressTrack:     isLight ? "rgba(155,114,40,0.15)"                : "rgba(255,255,255,0.08)",
    progressBar:       isLight ? "linear-gradient(90deg,#c4973a,#9b7228)": "linear-gradient(90deg,#ec4899,#a855f7)",
    tabStripBorder:    isLight ? "rgba(155,114,40,0.18)"                : "rgba(255,255,255,0.07)",
    tabActiveBorder:   isLight ? "#9b7228"                              : "#7c3aed",
    tabInactiveColor:  isLight ? "#9b8560"                              : "rgba(255,255,255,0.3)",
    startReading:      isLight ? "#9b7228"                              : "rgba(167,139,250,0.65)",
    comingSoonLabel:   isLight ? "rgba(155,114,40,0.7)"                 : "rgba(167,139,250,0.5)",
    footerCardBg:      isLight ? "rgba(155,114,40,0.06)"                : "rgba(255,255,255,0.03)",
    footerCardBorder:  isLight ? "rgba(155,114,40,0.18)"                : "rgba(255,255,255,0.06)",
    footerText:        isLight ? "#4a3010"                              : "rgba(255,255,255,0.6)",
    footerSubtext:     isLight ? "#9b8560"                              : "rgba(255,255,255,0.25)",
    iconMuted:         isLight ? "#9b8560"                              : "rgba(255,255,255,0.4)",
    star:              isLight ? "#c4973a"                              : "#fbbf24",
  };

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<LibTab>("books");
  const [inProgress, setInProgress] = useState<ProgressEntry[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  const available = STATIC_BOOK_CATALOG.filter((b) => !b.coming_soon);
  const comingSoon = STATIC_BOOK_CATALOG.filter((b) => b.coming_soon);

  // Load progress from localStorage
  useEffect(() => {
    const entries: ProgressEntry[] = [];
    const done = new Set<string>();
    for (const book of available) {
      const raw = localStorage.getItem(`axiom-progress-${book.slug}`);
      if (!raw) continue;
      try {
        const { chapter, total } = JSON.parse(raw);
        if (chapter && total) {
          entries.push({ book, chapter, total });
          if (chapter >= total) done.add(book.slug);
        }
      } catch {}
    }
    setInProgress(entries);
    setCompletedSlugs(done);
  }, []);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return available.filter((b) => activeCategory === "All" || b.tags.includes(activeCategory));
  }, [available, activeCategory]);

  const tabBooks = useMemo(() => {
    if (activeTab === "reading") return inProgress.filter((e) => !completedSlugs.has(e.book.slug)).map((e) => e.book);
    if (activeTab === "completed") return inProgress.filter((e) => completedSlugs.has(e.book.slug)).map((e) => e.book);
    return filteredBooks;
  }, [activeTab, filteredBooks, inProgress, completedSlugs]);

  function getProgress(slug: string) {
    return inProgress.find((e) => e.book.slug === slug);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <h1 className="text-lg font-bold" style={{ color: th.textPrimary }}>
          Free Books <span style={{ color: th.accent }}>Library</span>
        </h1>
      </div>

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <div
        className="mx-4 mb-6 rounded-2xl overflow-hidden relative"
        style={{ background: th.heroBg, minHeight: "120px" }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none pointer-events-none">
          📚
        </div>
        {!isLight && (
          <div
            className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-15 pointer-events-none"
            style={{ background: th.heroGlow }}
          />
        )}
        <div className="relative px-5 py-5">
          <h2 className="text-xl font-black leading-tight mb-1">
            <span style={{ color: th.heroAccentText }}>Read More.</span>
            <br />
            <span className="text-white">Grow More.</span>
          </h2>
          <p className="text-xs mb-4" style={{ color: th.heroSubtext }}>
            Thousands of free books at your fingertips.
          </p>
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Categories</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
        </div>
        <div className="flex gap-2.5 px-4 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveTab("books"); }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{
                  border: active ? `1px solid ${th.catActiveBorder}` : `1px solid ${th.catInactiveBorder}`,
                  backgroundColor: active ? th.catActiveBg : th.catInactiveBg,
                  color: active ? th.accentLight : th.textMuted,
                }}
              >
                <span className="text-lg leading-none">{CATEGORY_ICONS[cat] ?? "📖"}</span>
                <span className="text-[10px] font-bold whitespace-nowrap">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Popular Books ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Popular Books</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
          {filteredBooks.slice(0, 8).map((book) => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              className="flex-shrink-0 w-28 active:scale-95 transition-transform"
            >
              <div className="w-28 h-40 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40">
                <BookCover book={book} />
              </div>
              <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>
                {book.title}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>{book.author}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span style={{ color: th.star, fontSize: "10px" }}>★</span>
                <span style={{ color: th.textSecondary, fontSize: "10px" }}>4.8</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Coming Soon ──────────────────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Coming Soon</p>
            <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
            {comingSoon.map((book) => (
              <div key={book.slug} className="flex-shrink-0 w-28 opacity-50">
                <div className="w-28 h-40 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40">
                  <BookCover book={book} />
                </div>
                <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textMuted }}>
                  {book.title}
                </p>
                <p className="text-[10px] mt-0.5 font-bold uppercase tracking-wide" style={{ color: th.comingSoonLabel }}>
                  In preparation
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My Library ───────────────────────────────────────────────────────── */}
      <div id="my-library" className="px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold" style={{ color: th.textPrimary }}>My Library</p>
          <div className="flex items-center gap-3">
            <button className="transition-colors" style={{ color: th.iconMuted }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="transition-colors" style={{ color: th.iconMuted }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex mb-5" style={{ borderBottom: `1px solid ${th.tabStripBorder}` }}>
          {(["books", "reading", "completed"] as const).map((tab) => {
            const labels: Record<LibTab, string> = { books: "All Books", reading: "Reading", completed: "Completed" };
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-xs font-bold transition-all"
                style={{
                  borderBottom: active ? `2px solid ${th.tabActiveBorder}` : "2px solid transparent",
                  color: active ? th.accentLight : th.tabInactiveColor,
                  marginBottom: "-1px",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Empty states */}
        {tabBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{activeTab === "completed" ? "🎉" : activeTab === "reading" ? "📖" : "📚"}</p>
            <p className="text-sm font-bold mb-1" style={{ color: th.textMuted }}>
              {activeTab === "completed" ? "No books completed yet" : activeTab === "reading" ? "No books in progress" : "No books found"}
            </p>
            <p className="text-xs" style={{ color: th.textFaint }}>
              {activeTab === "books" ? "Try selecting a different category" : "Start reading a book to see it here"}
            </p>
          </div>
        )}

        {/* Book list rows */}
        <div className="space-y-3">
          {tabBooks.map((book) => {
            const prog = getProgress(book.slug);
            const pct = prog ? Math.round((prog.chapter / prog.total) * 100) : 0;
            const isDone = completedSlugs.has(book.slug);
            return (
              <Link
                key={book.slug}
                href={`/library/${book.slug}`}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.99]"
                style={{
                  backgroundColor: th.cardBg,
                  border: `1px solid ${th.cardBorder}`,
                }}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-14 h-[72px] rounded-xl overflow-hidden shadow-lg shadow-black/40">
                  <BookCover book={book} size="small" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: th.textPrimary }}>
                    {book.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: th.textSecondary }}>{book.author}</p>

                  {isDone ? (
                    <p className="text-xs font-bold mt-1.5" style={{ color: "#34d399" }}>Completed</p>
                  ) : prog ? (
                    <>
                      <div className="mt-2.5 flex items-center gap-2">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: th.progressTrack }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: th.progressBar }}
                          />
                        </div>
                        <span style={{ color: th.textSecondary, fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>
                          {pct}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: th.startReading, fontSize: "11px", marginTop: "5px", fontWeight: "600" }}>
                      Start reading →
                    </p>
                  )}
                </div>

                {/* Right side: checkmark for completed, or ⋮ */}
                {isDone ? (
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ border: "2px solid #34d399" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <button
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                    style={{ color: th.textVeryFaint }}
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="12" cy="19" r="1.8" />
                    </svg>
                  </button>
                )}
              </Link>
            );
          })}
        </div>

        {/* Suggest a book */}
        <div
          className="mt-10 p-6 rounded-2xl text-center"
          style={{ backgroundColor: th.footerCardBg, border: `1px solid ${th.footerCardBorder}` }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: th.footerText }}>Missing a classic?</p>
          <p className="text-xs mb-4" style={{ color: th.footerSubtext }}>
            Public domain, doctrinally sound. Community votes on what comes next.
          </p>
          <Link
            href="/give"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: th.primary }}
          >
            🤝 Join Community to Vote
          </Link>
        </div>
      </div>

    </div>
  );
}
