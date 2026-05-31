"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BookCatalogEntry } from "../lib/types";
import { STATIC_BOOK_CATALOG } from "../lib/bookCatalog";
import { getBookCoverImage } from "../lib/bookCoverImages";
import { useTheme } from "../lib/useTheme";
import { BookmarkModal } from "../components/BookmarkModal";
import { isAnySaved } from "../lib/collections";
import { GeneratedBookCover, GeneratedCategoryMark, GeneratedMetaIcon } from "../components/GeneratedArtwork";
import { useLanguage } from "../lib/useLanguage";
import { t } from "../lib/i18n";

// ─── Book cover palette ────────────────────────────────────────────────────────

function BookCover({ book, size = "full" }: { book: BookCatalogEntry; size?: "full" | "small" }) {
  const imageSrc = getBookCoverImage(book.slug);
  const [imageFailed, setImageFailed] = useState(false);

  if (imageSrc && !imageFailed) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${book.title} cover`}
          fill
          sizes={size === "small" ? "56px" : "112px"}
          className="object-cover"
          onError={() => setImageFailed(true)}
          priority={false}
        />
      </div>
    );
  }

  return (
    <GeneratedBookCover
      slug={book.slug}
      title={book.title}
      author={book.author}
      year={book.year}
      size={size}
    />
  );
}

// ─── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All", "Puritan", "Patristic", "Reformed", "Devotional", "Theology", "Classic", "Allegory",
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProgressEntry = { book: BookCatalogEntry; chapter: number; total: number; lastRead: number };
type LibTab = "books" | "reading" | "completed";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light-elegant";
  const isPink = theme === "light-pink";
  const isGoldNavy = theme === "gold-navy";
  const pick = (pink: string, light: string, dark: string) => isPink ? pink : isLight ? light : dark;

  const th = {
    pageBg:            pick("#fff0f5", "#f5f1eb", "#0e0e18"),
    textPrimary:       pick("#4a0020", "#1c1409", "rgba(255,255,255,0.92)"),
    textSecondary:     pick("rgba(74,0,32,0.62)", "#6b5226", "rgba(255,255,255,0.38)"),
    textMuted:         pick("rgba(74,0,32,0.52)", "#9b8560", "rgba(255,255,255,0.4)"),
    textFaint:         pick("rgba(74,0,32,0.38)", "#b09878", "rgba(255,255,255,0.25)"),
    textVeryFaint:     pick("rgba(74,0,32,0.28)", "#c4b090", "rgba(255,255,255,0.22)"),
    accent:            pick("#db2777", "#9b7228", "#a78bfa"),
    accentLight:       pick("#be185d", "#c4973a", "#c4b5fd"),
    primary:           pick("#db2777", "#9b7228", "#7c3aed"),
    heroBg:            pick(
      "linear-gradient(135deg,#f8dce9 0%,#fff8fb 55%,#f7cedf 100%)",
      "linear-gradient(135deg,rgba(196,151,58,0.28) 0%,rgba(237,228,205,0.96) 55%,rgba(215,196,148,0.22) 100%)",
      "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)"
    ),
    heroAccentText:    pick("#be185d", "#9b7228", "#c084fc"),
    heroSubtext:       pick("rgba(74,0,32,0.62)", "rgba(107,82,38,0.85)", "rgba(255,255,255,0.4)"),
    heroGlow:          pick("none", "none", "radial-gradient(circle,#c084fc 0%,transparent 70%)"),
    cardBg:            pick("#fff8fb", "rgba(155,114,40,0.06)", "rgba(255,255,255,0.03)"),
    cardBorder:        pick("rgba(219,39,119,0.16)", "rgba(155,114,40,0.20)", "rgba(255,255,255,0.07)"),
    searchBg:          pick("rgba(252,231,243,0.7)", "rgba(155,114,40,0.08)", "rgba(255,255,255,0.06)"),
    searchBorder:      pick("rgba(219,39,119,0.20)", "rgba(155,114,40,0.22)", "rgba(255,255,255,0.08)"),
    catActiveBg:       pick("#f7d1e3", "rgba(155,114,40,0.15)", "rgba(124,58,237,0.25)"),
    catActiveBorder:   pick("rgba(219,39,119,0.38)", "rgba(155,114,40,0.5)", "rgba(167,139,250,0.5)"),
    catInactiveBg:     pick("rgba(252,231,243,0.72)", "rgba(155,114,40,0.04)", "rgba(255,255,255,0.04)"),
    catInactiveBorder: pick("rgba(219,39,119,0.14)", "rgba(155,114,40,0.14)", "rgba(255,255,255,0.08)"),
    progressTrack:     pick("rgba(219,39,119,0.14)", "rgba(155,114,40,0.15)", "rgba(255,255,255,0.08)"),
    progressBar:       pick("linear-gradient(90deg,#ec4899,#be185d)", "linear-gradient(90deg,#c4973a,#9b7228)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    tabStripBorder:    pick("rgba(219,39,119,0.16)", "rgba(155,114,40,0.18)", "rgba(255,255,255,0.07)"),
    tabActiveBorder:   pick("#db2777", "#9b7228", "#7c3aed"),
    tabInactiveColor:  pick("rgba(74,0,32,0.45)", "#9b8560", "rgba(255,255,255,0.3)"),
    startReading:      pick("#be185d", "#9b7228", "rgba(167,139,250,0.65)"),
    comingSoonLabel:   pick("rgba(190,24,93,0.72)", "rgba(155,114,40,0.7)", "rgba(167,139,250,0.5)"),
    footerCardBg:      pick("#fce7f3", "rgba(155,114,40,0.06)", "rgba(255,255,255,0.03)"),
    footerCardBorder:  pick("rgba(219,39,119,0.16)", "rgba(155,114,40,0.18)", "rgba(255,255,255,0.06)"),
    footerText:        pick("#4a0020", "#4a3010", "rgba(255,255,255,0.6)"),
    footerSubtext:     pick("rgba(74,0,32,0.56)", "#9b8560", "rgba(255,255,255,0.25)"),
    iconMuted:         pick("rgba(74,0,32,0.50)", "#9b8560", "rgba(255,255,255,0.4)"),
    star:              pick("#db2777", "#c4973a", "#c9a961"),
  };

  // Gold Navy overrides — replace purple/violet with antique gold
  if (isGoldNavy) {
    th.accent            = "#c9a961";
    th.accentLight       = "#d4b878";
    th.primary           = "#c9a961";
    th.heroBg            = "linear-gradient(135deg,rgba(201,169,97,0.22) 0%,#1a1d27 55%,#0e1018 100%)";
    th.heroAccentText    = "#c9a961";
    th.heroGlow          = "none";
    th.catActiveBg       = "rgba(201,169,97,0.20)";
    th.catActiveBorder   = "rgba(201,169,97,0.45)";
    th.progressBar       = "linear-gradient(90deg,#c9a961,#d4b878)";
    th.tabActiveBorder   = "#c9a961";
    th.startReading      = "#c9a961";
    th.comingSoonLabel   = "rgba(201,169,97,0.55)";
    th.star              = "#c9a961";
  }

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<LibTab>("books");
  const [inProgress, setInProgress] = useState<ProgressEntry[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [bookmarkTarget, setBookmarkTarget] = useState<BookCatalogEntry | null>(null);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestText, setSuggestText] = useState("");
  const [suggestSent, setSuggestSent] = useState(false);

  // Refresh saved state whenever modal closes
  function refreshSaved() {
    const s = new Set(available.map((b) => b.slug).filter((slug) => isAnySaved(`book::${slug}`)));
    setSavedBooks(s);
  }

  const available = STATIC_BOOK_CATALOG.filter((b) => !b.coming_soon);
  const comingSoon = STATIC_BOOK_CATALOG.filter((b) => b.coming_soon);

  useEffect(() => { refreshSaved(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load progress from localStorage
  useEffect(() => {
    const entries: ProgressEntry[] = [];
    const done = new Set<string>();
    for (const book of available) {
      const raw = localStorage.getItem(`axiom-progress-${book.slug}`);
      if (!raw) continue;
      try {
        const { chapter, total, lastRead } = JSON.parse(raw);
        if (chapter && total) {
          entries.push({ book, chapter, total, lastRead: lastRead ?? 0 });
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
    <>
    <div className="min-h-screen" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <h1 className="text-lg font-bold" style={{ color: th.textPrimary }}>
          {t(lang, "lib_page_title")} <span style={{ color: th.accent }}>{t(lang, "lib_page_accent")}</span>
        </h1>
      </div>

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <div
        className="mx-4 mb-6 rounded-2xl overflow-hidden relative"
        style={{ background: th.heroBg, minHeight: "120px" }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 select-none pointer-events-none">
          <GeneratedCategoryMark id="library" size={76} />
        </div>
        {!isLight && !isPink && (
          <div
            className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-15 pointer-events-none"
            style={{ background: th.heroGlow }}
          />
        )}
        <div className="relative px-5 py-5">
          <h2 className="text-xl font-black leading-tight mb-1">
            <span style={{ color: th.heroAccentText }}>{t(lang, "lib_hero_line1")}</span>
            <br />
            <span style={{ color: th.textPrimary }}>{t(lang, "lib_hero_line2")}</span>
          </h2>
          <p className="text-xs mb-4" style={{ color: th.heroSubtext }}>
            {t(lang, "lib_hero_sub")}
          </p>
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>{t(lang, "lib_categories")}</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>{t(lang, "lib_view_all")}</button>
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
                <GeneratedCategoryMark id={cat} active={active} size={30} />
                <span className="text-[10px] font-bold whitespace-nowrap">
                  {lang === "es"
                    ? ({ All:"Todos", Puritan:"Puritano", Patristic:"Patrístico", Reformed:"Reformado", Devotional:"Devocional", Theology:"Teología", Classic:"Clásico", Allegory:"Alegoría" } as Record<string,string>)[cat] ?? cat
                    : cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Continue Reading ─────────────────────────────────────────────────── */}
      {inProgress.filter(e => !completedSlugs.has(e.book.slug)).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-sm font-bold" style={{ color: th.textPrimary }}>{t(lang, "lib_continue_reading")}</p>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
            {[...inProgress.filter(e => !completedSlugs.has(e.book.slug))].sort((a, b) => b.lastRead - a.lastRead).map(({ book, chapter, total }) => (
              <div key={book.slug} className="flex-shrink-0 w-28">
                <div className="relative w-28 h-40 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40">
                  <BookCover book={book} />
                  <Link href={`/library/${book.slug}`} className="absolute inset-0 z-10 active:scale-95 transition-transform" />
                </div>
                <Link href={`/library/${book.slug}`} className="block">
                  <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{book.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>{book.author}</p>
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((chapter / total) * 100)}%`, backgroundColor: th.accent }} />
                  </div>
                  <p className="text-[9px] mt-0.5" style={{ color: th.textSecondary }}>{t(lang, "lib_ch_of")} {chapter} {t(lang, "lib_of")} {total}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Popular Books ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>{t(lang, "lib_popular_books")}</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>{t(lang, "lib_view_all")}</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
          {filteredBooks.slice(0, 8).map((book) => {
            const saved = savedBooks.has(book.slug);
            return (
              <div key={book.slug} className="flex-shrink-0 w-28">
                <div className="relative w-28 h-40 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40">
                  <BookCover book={book} />
                  <Link href={`/library/${book.slug}`} className="absolute inset-0 z-10 active:scale-95 transition-transform" />
                  {/* Floating bookmark */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookmarkTarget(book); }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors z-20"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)", color: saved ? "#c4973a" : "rgba(255,255,255,0.6)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}>
                      <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <Link href={`/library/${book.slug}`}>
                  <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>
                    {book.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>{book.author}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span style={{ color: th.star, fontSize: "10px" }}>★</span>
                    <span style={{ color: th.textSecondary, fontSize: "10px" }}>4.8</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Coming Soon ──────────────────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Coming Soon</p>
            <button className="text-xs font-semibold" style={{ color: th.accent }}>{t(lang, "lib_view_all")}</button>
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
            <div className="mb-3 flex justify-center">
              <GeneratedMetaIcon type={activeTab === "completed" ? "community" : "book"} size={44} />
            </div>
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
                      {t(lang, "lib_start_reading")}
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
                    style={{ color: savedBooks.has(book.slug) ? "#c4973a" : th.textVeryFaint }}
                    onClick={(e) => { e.preventDefault(); setBookmarkTarget(book); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={savedBooks.has(book.slug) ? "currentColor" : "none"}>
                      <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
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
            Public domain, doctrinally sound. Send us a message if you have any recommendations.
          </p>
          <button
            onClick={() => { setShowSuggest(true); setSuggestSent(false); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: th.primary }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Send us a message
          </button>
        </div>
      </div>

    </div>

    {/* Bookmark modal */}
    {bookmarkTarget && (
      <BookmarkModal
        item={{
          id: `book::${bookmarkTarget.slug}`,
          type: "book",
          title: bookmarkTarget.title,
          subtitle: bookmarkTarget.author,
          preview: bookmarkTarget.description?.slice(0, 120) ?? undefined,
        }}
        label={bookmarkTarget.title}
        onClose={() => { setBookmarkTarget(null); refreshSaved(); }}
      />
    )}

    {/* Suggest a book modal */}
    {showSuggest && (
      <div
        className="fixed inset-0 z-[300] flex items-end justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowSuggest(false); }}
      >
        <div
          className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
          style={{ backgroundColor: th.pageBg, border: `1px solid ${th.footerCardBorder}` }}
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: th.textVeryFaint }} />

          {suggestSent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(52,211,153,0.15)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-base font-bold mb-1" style={{ color: th.textPrimary }}>Message sent!</p>
              <p className="text-sm" style={{ color: th.textSecondary }}>Thank you for the recommendation. We&rsquo;ll review it.</p>
              <button
                onClick={() => setShowSuggest(false)}
                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: th.primary, color: "white" }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-1" style={{ color: th.textPrimary }}>Recommend a book</h3>
              <p className="text-xs mb-5" style={{ color: th.textSecondary }}>
                Public domain, doctrinally sound — tell us what&rsquo;s missing from the library.
              </p>

              {/* Name field */}
              <label className="block text-xs font-bold mb-1.5" style={{ color: th.textMuted }}>Your name (optional)</label>
              <input
                type="text"
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                placeholder="e.g. John Calvin"
                className="w-full rounded-xl px-4 py-3 text-sm mb-4 outline-none"
                style={{
                  backgroundColor: th.searchBg,
                  border: `1px solid ${th.searchBorder}`,
                  color: th.textPrimary,
                }}
              />

              {/* Message field */}
              <label className="block text-xs font-bold mb-1.5" style={{ color: th.textMuted }}>Book recommendation</label>
              <textarea
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                placeholder="Title, author, and why it belongs in the library…"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm mb-5 outline-none resize-none"
                style={{
                  backgroundColor: th.searchBg,
                  border: `1px solid ${th.searchBorder}`,
                  color: th.textPrimary,
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuggest(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!suggestText.trim()) return;
                    const subject = encodeURIComponent("Book Recommendation – Rebuttal Your Church App");
                    const body = encodeURIComponent(
                      `From: ${suggestName.trim() || "Anonymous"}\n\n${suggestText.trim()}`
                    );
                    window.location.href = `mailto:josuezuniga93@gmail.com?subject=${subject}&body=${body}`;
                    setSuggestSent(true);
                  }}
                  disabled={!suggestText.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-opacity"
                  style={{
                    backgroundColor: th.primary,
                    color: "white",
                    opacity: suggestText.trim() ? 1 : 0.45,
                  }}
                >
                  Send message
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
