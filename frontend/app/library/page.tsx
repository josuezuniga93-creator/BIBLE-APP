"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
import { bookTitle } from "../lib/spanishContent";
import { collectUnifiedHighlights, deleteUnifiedHighlight, type UnifiedHighlight } from "../lib/unifiedHighlights";
import { STATIC_BOOK_CATALOG as _CATALOG_FOR_SLUGS } from "../lib/bookCatalog";
import { UiIcon } from "../components/UiIcon";

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

type ProgressEntry = {
  book: BookCatalogEntry;
  chapter: number;
  total: number;
  page?: number;
  pages?: number;
  percent?: number;
  lastRead: number;
};
type LibTab = "books" | "reading" | "completed" | "highlights";

// ─── Book highlights aggregation ──────────────────────────────────────────────
interface BookHighlight extends UnifiedHighlight {
  slug: string;
  bookTitle: string;
  chapter: number;
  rawId: string;
}

function loadAllBookHighlights(): BookHighlight[] {
  if (typeof window === "undefined") return [];
  return collectUnifiedHighlights()
    .filter((highlight) => highlight.source === "free-books")
    .map((highlight) => {
      const hrefMatch = highlight.openHref.match(/\/library\/([^?]+)\?chapter=(\d+)/);
      const slug = typeof highlight.meta?.slug === "string"
        ? highlight.meta.slug
        : hrefMatch ? decodeURIComponent(hrefMatch[1]) : "";
      const chapter = typeof highlight.meta?.chapter === "number"
        ? highlight.meta.chapter
        : hrefMatch ? parseInt(hrefMatch[2], 10) : 1;
      const rawId = typeof highlight.meta?.rawId === "string"
        ? highlight.meta.rawId
        : highlight.id.replace(/^free-books-/, "");
      const entry = _CATALOG_FOR_SLUGS.find((b) => b.slug === slug);
      return { ...highlight, slug, bookTitle: entry?.title ?? highlight.title, chapter, rawId };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

function entryPercent(entry: ProgressEntry): number {
  if (typeof entry.percent === "number") return Math.max(0, Math.min(100, entry.percent));
  if (!entry.total) return 0;
  return Math.round((entry.chapter / entry.total) * 100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "white-noir";
  const isPink = false;
  const isGoldNavy = theme === "gold-navy";
  const pick = (pink: string, light: string, dark: string) => isPink ? pink : isLight ? light : dark;

  const th = {
    pageBg:            pick("#fff8fb", "#fbfaf7", "#0e0e18"),
    textPrimary:       pick("#4a0020", "#1c1409", "rgba(255,255,255,0.92)"),
    textSecondary:     pick("rgba(74,0,32,0.62)", "#6b5226", "rgba(255,255,255,0.38)"),
    textMuted:         pick("rgba(74,0,32,0.52)", "#9b8560", "rgba(255,255,255,0.4)"),
    textFaint:         pick("rgba(74,0,32,0.38)", "#b09878", "rgba(255,255,255,0.25)"),
    textVeryFaint:     pick("rgba(74,0,32,0.28)", "#c4b090", "rgba(255,255,255,0.22)"),
    accent:            pick("#db2777", "#9b7228", "#a78bfa"),
    accentLight:       pick("#be185d", "#c4973a", "#c4b5fd"),
    primary:           pick("#db2777", "#9b7228", "#7c3aed"),
    heroBg:            pick(
      "linear-gradient(135deg,#ffffff 0%,#fff7fb 52%,#f7dce9 100%)",
      "linear-gradient(135deg,#ffffff 0%,#faf7ef 52%,#eee4d1 100%)",
      "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)"
    ),
    heroAccentText:    pick("#be185d", "#9b7228", "#c084fc"),
    heroSubtext:       pick("rgba(74,0,32,0.62)", "rgba(107,82,38,0.85)", "rgba(255,255,255,0.4)"),
    heroGlow:          pick("none", "none", "radial-gradient(circle,#c084fc 0%,transparent 70%)"),
    cardBg:            pick("#ffffff", "#ffffff", "rgba(255,255,255,0.03)"),
    cardBorder:        pick("rgba(219,39,119,0.10)", "rgba(28,20,9,0.08)", "rgba(255,255,255,0.07)"),
    searchBg:          pick("rgba(252,231,243,0.7)", "rgba(155,114,40,0.08)", "rgba(255,255,255,0.06)"),
    searchBorder:      pick("rgba(219,39,119,0.20)", "rgba(155,114,40,0.22)", "rgba(255,255,255,0.08)"),
    catActiveBg:       pick("#f7d1e3", "rgba(155,114,40,0.15)", "rgba(124,58,237,0.25)"),
    catActiveBorder:   pick("rgba(219,39,119,0.38)", "rgba(155,114,40,0.5)", "rgba(167,139,250,0.5)"),
    catInactiveBg:     pick("#ffffff", "#ffffff", "rgba(255,255,255,0.04)"),
    catInactiveBorder: pick("rgba(219,39,119,0.09)", "rgba(28,20,9,0.08)", "rgba(255,255,255,0.08)"),
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
  if (isGoldNavy && !isLight) {
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

  // White Noir overrides — premium black-and-white
  if (isLight) {
    th.pageBg            = "#ffffff";
    th.textPrimary       = "#0a0a0a";
    th.textSecondary     = "rgba(10,10,10,0.55)";
    th.textMuted         = "rgba(10,10,10,0.38)";
    th.textFaint         = "rgba(10,10,10,0.25)";
    th.textVeryFaint     = "rgba(10,10,10,0.22)";
    th.accent            = "#0a0a0a";
    th.accentLight       = "#333333";
    th.primary           = "#0a0a0a";
    th.heroBg            = "linear-gradient(135deg,#ffffff 0%,#f7f7f7 52%,#eeeeee 100%)";
    th.heroAccentText    = "#0a0a0a";
    th.heroSubtext       = "rgba(10,10,10,0.55)";
    th.heroGlow          = "none";
    th.cardBg            = "#ffffff";
    th.cardBorder        = "rgba(0,0,0,0.07)";
    th.searchBg          = "rgba(0,0,0,0.04)";
    th.searchBorder      = "rgba(0,0,0,0.09)";
    th.catActiveBg       = "rgba(0,0,0,0.10)";
    th.catActiveBorder   = "rgba(0,0,0,0.25)";
    th.catInactiveBg     = "#ffffff";
    th.catInactiveBorder = "rgba(0,0,0,0.07)";
    th.progressTrack     = "rgba(0,0,0,0.08)";
    th.progressBar       = "linear-gradient(90deg,#333,#0a0a0a)";
    th.tabStripBorder    = "rgba(0,0,0,0.07)";
    th.tabActiveBorder   = "#0a0a0a";
    th.tabInactiveColor  = "rgba(10,10,10,0.38)";
    th.startReading      = "#0a0a0a";
    th.comingSoonLabel   = "rgba(10,10,10,0.50)";
    th.footerCardBg      = "rgba(0,0,0,0.03)";
    th.footerCardBorder  = "rgba(0,0,0,0.06)";
    th.footerText        = "#0a0a0a";
    th.footerSubtext     = "rgba(10,10,10,0.38)";
    th.iconMuted         = "rgba(10,10,10,0.38)";
    th.star              = "#0a0a0a";
  }

  const [carouselSlide, setCarouselSlide] = useState(0);
  const [carouselTouchX, setCarouselTouchX] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const carouselSwipedRef = useRef(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<LibTab>("books");
  const [inProgress, setInProgress] = useState<ProgressEntry[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [bookmarkTarget, setBookmarkTarget] = useState<BookCatalogEntry | null>(null);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [bookHighlights, setBookHighlights] = useState<BookHighlight[]>([]);
  const [showHighlightPocket, setShowHighlightPocket] = useState(false);
  const [hlSearch, setHlSearch] = useState("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [collapsedBooks, setCollapsedBooks] = useState<Set<string>>(new Set());
  const [showAllOldBooks, setShowAllOldBooks] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  // Refresh saved state whenever modal closes
  function refreshSaved() {
    const s = new Set(available.map((b) => b.slug).filter((slug) => isAnySaved(`book::${slug}`)));
    setSavedBooks(s);
  }

  const available = STATIC_BOOK_CATALOG.filter((b) => !b.coming_soon);
  const featuredBooks = available.slice(0, 3);
  const recentlyAdded = [...available].slice(-3).reverse();

  useEffect(() => { refreshSaved(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load book highlights when pocket opens
  useEffect(() => {
    if (showHighlightPocket) setBookHighlights(loadAllBookHighlights());
  }, [showHighlightPocket]);

  // Load progress from localStorage
  useEffect(() => {
    const entries: ProgressEntry[] = [];
    const done = new Set<string>();
    for (const book of available) {
      const raw = localStorage.getItem(`axiom-progress-${book.slug}`);
      if (!raw) continue;
      try {
        const { chapter, total, page, pages, percent, lastRead } = JSON.parse(raw);
        if (chapter && total) {
          entries.push({ book, chapter, total, page, pages, percent, lastRead: lastRead ?? 0 });
          if (chapter >= total) done.add(book.slug);
        }
      } catch {}
    }
    setInProgress(entries);
    setCompletedSlugs(done);
  }, []);

  // Category book counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: available.length };
    for (const cat of CATEGORIES.filter((c) => c !== "All")) {
      counts[cat] = available.filter((b) => b.tags.includes(cat)).length;
    }
    return counts;
  }, [available]);

  // Carousel auto-advance every 4 seconds — pauses permanently once user touches
  useEffect(() => {
    if (featuredBooks.length <= 1 || carouselPaused) return;
    const id = setInterval(() => setCarouselSlide(prev => (prev + 1) % featuredBooks.length), 4000);
    return () => clearInterval(id);
  }, [featuredBooks.length, carouselPaused]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    return available.filter((b) => {
      const matchesCategory = activeCategory === "All" || b.tags.includes(activeCategory);
      const matchesSearch =
        !q ||
        bookTitle(b, lang).toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [available, activeCategory, librarySearch, lang]);

  const tabBooks = useMemo(() => {
    if (activeTab === "reading") return inProgress.filter((e) => !completedSlugs.has(e.book.slug)).map((e) => e.book);
    if (activeTab === "completed") return inProgress.filter((e) => completedSlugs.has(e.book.slug)).map((e) => e.book);
    return filteredBooks;
  }, [activeTab, filteredBooks, inProgress, completedSlugs]);

  const filteredHls = useMemo(() => {
    if (!hlSearch.trim()) return bookHighlights;
    const q = hlSearch.toLowerCase();
    return bookHighlights.filter(hl =>
      hl.bookTitle.toLowerCase().includes(q) || String(hl.chapter).includes(q) || hl.text.toLowerCase().includes(q)
    );
  }, [bookHighlights, hlSearch]);

  const hlByBook = useMemo(() => {
    const map: Record<string, { bookTitle: string; slug: string; chapters: Record<number, BookHighlight[]> }> = {};
    for (const hl of filteredHls) {
      if (!map[hl.slug]) map[hl.slug] = { bookTitle: hl.bookTitle, slug: hl.slug, chapters: {} };
      if (!map[hl.slug].chapters[hl.chapter]) map[hl.slug].chapters[hl.chapter] = [];
      map[hl.slug].chapters[hl.chapter].push(hl);
    }
    return map;
  }, [filteredHls]);

  function getProgress(slug: string) {
    return inProgress.find((e) => e.book.slug === slug);
  }

  return (
    <>
    <div className="premium-library-page">
      <div className="premium-library-topbar">
        <button type="button" className="premium-library-icon-button" aria-label={lang === "es" ? "Atrás" : "Back"} onClick={() => history.back()}>
          <span className="text-[30px] leading-none font-black">‹</span>
        </button>
        <button type="button" className="premium-library-icon-button" aria-label={lang === "es" ? "Resaltados" : "Highlights"} onClick={() => setShowHighlightPocket(true)}>
          <UiIcon name="book" size={23} />
        </button>
      </div>

      <section className="premium-library-hero">
        <p className="premium-library-eyebrow">{lang === "es" ? "Biblioteca" : "Library"}</p>
        <h1 className="premium-library-title">{lang === "es" ? "Libros Gratis" : "Free Books"}</h1>
        <p className="premium-library-subtitle">
          {lang === "es"
            ? "Obras cristianas clásicas organizadas para lectura enfocada, progreso y resaltados."
            : "Classic Christian works arranged for focused reading, progress, and highlights."}
        </p>
      </section>

      <label className="premium-library-search">
        <UiIcon name="search" size={18} />
        <input
          value={librarySearch}
          onChange={(e) => setLibrarySearch(e.target.value)}
          placeholder={lang === "es" ? "Buscar títulos, autores, temas" : "Search titles, authors, topics"}
        />
      </label>

      <div className="premium-library-tabs" role="tablist" aria-label={lang === "es" ? "Secciones de libros" : "Book sections"}>
        {([
          ["books", lang === "es" ? "Libros" : "Books"],
          ["reading", lang === "es" ? "Leyendo" : "Reading"],
          ["completed", lang === "es" ? "Listos" : "Done"],
          ["highlights", lang === "es" ? "Marcas" : "Marks"],
        ] as [LibTab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="premium-library-tab"
            data-active={activeTab === key}
            onClick={() => key === "highlights" ? setShowHighlightPocket(true) : setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {featuredBooks[carouselSlide] && (() => {
        const book = featuredBooks[carouselSlide];
        const progress = getProgress(book.slug);
        const pct = progress ? entryPercent(progress) : 0;
        return (
          <Link
            href={`/library/${book.slug}`}
            className="premium-library-feature active:scale-[0.99] transition-transform"
            onTouchStart={(e) => {
              setCarouselTouchX(e.touches[0].clientX);
              setCarouselPaused(true);
              carouselSwipedRef.current = false;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - carouselTouchX;
              if (Math.abs(dx) > 40) {
                e.preventDefault();
                carouselSwipedRef.current = true;
                setCarouselSlide((prev) => dx < 0 ? (prev + 1) % featuredBooks.length : (prev - 1 + featuredBooks.length) % featuredBooks.length);
              }
            }}
            onClick={(e) => {
              if (carouselSwipedRef.current) {
                e.preventDefault();
                carouselSwipedRef.current = false;
              }
            }}
          >
            <div className="premium-library-cover">
              <BookCover book={book} />
            </div>
            <div className="premium-library-feature-copy">
              <span className="premium-library-pill">{progress ? (lang === "es" ? "Continuar" : "Continue") : (lang === "es" ? "Destacado" : "Featured")}</span>
              <h2 className="premium-library-feature-title">
                {progress
                  ? (lang === "es" ? "Continúa donde dejaste tu lectura." : "Begin where your reading left off.")
                  : bookTitle(book, lang)}
              </h2>
              <p className="premium-library-meta">{book.author} · {book.tags[0] ?? "Classic"} · {book.year}</p>
              <div className="premium-library-progress">
                <span style={{ width: `${pct || 68}%` }} />
              </div>
              <p className="premium-library-meta mt-2">
                {progress
                  ? `${pct}% ${lang === "es" ? "completo" : "complete"}`
                  : lang === "es" ? "Lectura clásica seleccionada" : "Selected classic reading"}
              </p>
            </div>
          </Link>
        );
      })()}

      <section className="premium-library-section">
        <div className="premium-library-section-head">
          <h2>{activeTab === "reading" ? (lang === "es" ? "Continuar leyendo" : "Continue reading") : lang === "es" ? "Explorar estantes" : "Browse by shelf"}</h2>
          <button type="button" className="premium-library-link-button" onClick={() => setShowAllOldBooks((v) => !v)}>
            {showAllOldBooks ? (lang === "es" ? "Menos" : "Less") : (lang === "es" ? "Ver todo" : "See all")}
          </button>
        </div>
        {activeTab === "books" && (
          <div className="premium-library-chip-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className="premium-library-chip"
                data-active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "All" ? (lang === "es" ? "Todos" : "All") : cat}
              </button>
            ))}
          </div>
        )}
        <div className="premium-library-grid">
          {(showAllOldBooks ? tabBooks : tabBooks.slice(0, 6)).map((book) => (
            <Link key={book.slug} href={`/library/${book.slug}`} className="premium-library-item active:scale-95 transition-transform">
              <div className="premium-library-item-cover">
                <BookCover book={book} />
              </div>
              <p className="premium-library-item-title line-clamp-2">{bookTitle(book, lang)}</p>
              <span className="premium-library-item-meta truncate">{book.author}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="premium-library-section">
        <div className="premium-library-section-head">
          <h2>{lang === "es" ? "Resaltados recientes" : "Recent highlights"}</h2>
          <button type="button" className="premium-library-link-button" onClick={() => setShowHighlightPocket(true)}>
            {lang === "es" ? "Abrir" : "Open"}
          </button>
        </div>
        <button type="button" className="premium-library-card w-full text-left active:scale-[0.99] transition-transform" onClick={() => setShowHighlightPocket(true)}>
          <div className="premium-library-item-cover !w-[54px] !h-[76px] !mb-0 !flex-shrink-0">
            {available[0] && <BookCover book={available[0]} size="small" />}
          </div>
          <div className="min-w-0">
            <p className="premium-library-item-title text-[15px]">{lang === "es" ? "Pasajes guardados" : "Saved passages"}</p>
            <p className="premium-library-meta mt-1 line-clamp-2">
              {lang === "es" ? "Abre tus resaltados y vuelve al texto exacto." : "Open your highlights and return to the exact text."}
            </p>
          </div>
        </button>
      </section>
    </div>

    {/* ── My Highlights Pocket ────────────────────────────────────────────────── */}
    {showHighlightPocket && (
      <div className="fixed inset-0 z-[65]" style={{ background: isLight ? "#ffffff" : "#070b14", color: isLight ? "#0a0a0a" : "white" }}>
        <div className="max-w-lg mx-auto h-full overflow-hidden flex flex-col">

          {/* Header */}
          <div
            className="px-5 pb-4 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.14)", paddingTop: "max(env(safe-area-inset-top), 18px)" }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                {lang === "es" ? "Libros Gratuitos" : "Free Books"}
              </p>
              <h2 className="text-[30px] leading-none font-black mt-1">
                {lang === "es" ? "Mis Resaltados" : "My Highlights"}
              </h2>
            </div>
            <button
              onClick={() => { setShowHighlightPocket(false); setConfirmRemoveId(null); setHlSearch(""); }}
              className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", color: isLight ? "rgba(0,0,0,0.4)" : undefined }}
            >
              <UiIcon name="close" size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pt-4 pb-3 flex-shrink-0">
            <label
              className="flex items-center gap-3 rounded-[22px] px-4 py-3"
              style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.055)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="1.8" />
                <path d="M16.5 16.5L21 21" stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={hlSearch}
                onChange={(e) => setHlSearch(e.target.value)}
                placeholder={lang === "es" ? "Buscar libro, capítulo o texto..." : "Search book, chapter, or text..."}
                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-bold"
                style={{ color: isLight ? "#0a0a0a" : "white" }}
              />
              {hlSearch && (
                <button onClick={() => setHlSearch("")} className="text-sm flex-shrink-0 leading-none" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                  <UiIcon name="close" size={16} />
                </button>
              )}
            </label>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-5 pb-10">
            {bookHighlights.length === 0 ? (
              <div
                className="rounded-[30px] p-7 text-center mt-4"
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="font-black text-lg mb-2">
                  {lang === "es" ? "Sin resaltados aún" : "No highlights yet"}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                  {lang === "es"
                    ? "Selecciona texto mientras lees un libro para guardar un resaltado."
                    : "Select text while reading a book to save a highlight."}
                </p>
              </div>
            ) : filteredHls.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-bold" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                  {lang === "es" ? "Sin resultados" : `No results for "${hlSearch}"`}
                </p>
              </div>
            ) : (
              <div className="space-y-7 pt-2">

                {/* Recent */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black mb-3" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                    {lang === "es" ? "Recientes" : "Recent"}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x" style={{ scrollbarWidth: "none" }}>
                    {filteredHls.slice(0, 5).map((hl) => {
                      const DOT: Record<string, string> = { purple: "#a855f7", yellow: "#eab308", red: "#ef4444", blue: "#3b82f6", lime: "#84cc16", pink: "#ec4899", gold: "#c9a961", rose: "#f472b6", green: "#4ade80" };
                      const colorKey = typeof hl.meta?.colorName === "string" ? hl.meta.colorName : "gold";
                      const dot = DOT[colorKey] ?? hl.color ?? "#c9a961";
                      return (
                        <div
                          key={hl.id}
                          className="w-[80vw] snap-start rounded-[26px] p-4 flex flex-col gap-2 flex-shrink-0 overflow-hidden"
                          style={{ background: isLight ? "rgba(0,0,0,0.03)" : `linear-gradient(135deg,${dot}18 0%,rgba(255,255,255,0.04) 100%)`, border: isLight ? "1px solid rgba(0,0,0,0.08)" : `1px solid ${dot}30` }}
                        >
                          <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: isLight ? "rgba(0,0,0,0.45)" : dot }}>
                            {hl.bookTitle} · Ch. {hl.chapter}
                          </p>
                          <p
                            className="text-[13px] leading-snug line-clamp-2"
                            style={{ color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)", fontFamily: "Georgia, serif" }}
                          >
                            &ldquo;{hl.text.slice(0, 65)}{hl.text.length > 65 ? '…' : ''}&rdquo;
                          </p>
                          <Link
                            href={`/library/${hl.slug}?chapter=${hl.chapter}&hlid=${hl.rawId}`}
                            onClick={() => setShowHighlightPocket(false)}
                            className="self-start text-[10px] font-black px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                            style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.15)", color: isLight ? "#0a0a0a" : "#c9a961", border: isLight ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(201,169,97,0.28)" }}
                          >
                            {lang === "es" ? "Abrir resaltado →" : "Open highlight →"}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By Book & Chapter */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black mb-3" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                    {lang === "es" ? "Por Libro" : "By Book"}
                  </p>
                  <div className="space-y-3">
                    {Object.keys(hlByBook).map((slug) => {
                      const { bookTitle: bTitle, chapters } = hlByBook[slug];
                      const chapNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);
                      const totalHls = Object.values(chapters).reduce((n, arr) => n + arr.length, 0);
                      return (
                        <div
                          key={slug}
                          className="rounded-[28px] p-4"
                          style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.035)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.07)" }}
                        >
                          <button
                            className="w-full flex items-center justify-between active:opacity-70 transition-opacity"
                            style={{ marginBottom: collapsedBooks.has(slug) ? 0 : "12px" }}
                            onClick={() => setCollapsedBooks(prev => {
                              const next = new Set(prev);
                              if (next.has(slug)) next.delete(slug); else next.add(slug);
                              return next;
                            })}
                          >
                            <p className="font-black text-sm text-left">{bTitle}</p>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                                style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.15)", color: isLight ? "#0a0a0a" : "#c9a961" }}
                              >
                                {totalHls}
                              </span>
                              <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: collapsedBooks.has(slug) ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                              >
                                <path d="M6 9l6 6 6-6"/>
                              </svg>
                            </div>
                          </button>
                          {!collapsedBooks.has(slug) && <div className="space-y-2">
                            {chapNums.map((chNum) => (
                              <div
                                key={chNum}
                                className="rounded-[22px] p-3"
                                style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.06)" }}
                              >
                                <p
                                  className="text-[9px] font-black uppercase tracking-widest mb-2"
                                  style={{ color: isLight ? "rgba(0,0,0,0.38)" : "rgba(201,169,97,0.65)" }}
                                >
                                  {lang === "es" ? `Capítulo ${chNum}` : `Chapter ${chNum}`}
                                </p>
                                <div className="space-y-2">
                                  {chapters[chNum].map((hl) => {
                                    const DOT: Record<string, string> = { purple: "#a855f7", yellow: "#eab308", red: "#ef4444", blue: "#3b82f6", lime: "#84cc16", pink: "#ec4899", gold: "#c9a961", rose: "#f472b6", green: "#4ade80" };
                                    const colorKey = typeof hl.meta?.colorName === "string" ? hl.meta.colorName : "gold";
                                    const dot = DOT[colorKey] ?? hl.color ?? "#c9a961";
                                    return (
                                      <div
                                        key={hl.id}
                                        className="rounded-[18px] p-3"
                                        style={{ background: isLight ? "rgba(0,0,0,0.03)" : `${dot}0a`, border: isLight ? "1px solid rgba(0,0,0,0.07)" : `1px solid ${dot}22` }}
                                      >
                                        <div className="flex items-start gap-2 mb-2">
                                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: dot }} />
                                          <p
                                            className="text-[13px] leading-snug flex-1"
                                            style={{ color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)", fontFamily: "Georgia, serif" }}
                                          >
                                            &ldquo;{hl.text}&rdquo;
                                          </p>
                                          <button
                                            onClick={() => setConfirmRemoveId(hl.id)}
                                            className="text-xs flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
                                            style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)" }}
                                          >
                                            ×
                                          </button>
                                        </div>
                                        <Link
                                          href={`/library/${hl.slug}?chapter=${hl.chapter}&hlid=${hl.rawId}`}
                                          onClick={() => setShowHighlightPocket(false)}
                                          className="text-[10px] font-black px-3 py-1 rounded-full inline-block active:scale-95 transition-transform"
                                          style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.12)", color: isLight ? "#0a0a0a" : "#c9a961", border: isLight ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(201,169,97,0.22)" }}
                                        >
                                          {lang === "es" ? "Abrir resaltado →" : "Open highlight →"}
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Confirm remove */}
        {confirmRemoveId && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-8 bg-black/55 backdrop-blur-sm">
            <div
              className="w-full max-w-[300px] rounded-[28px] p-5 text-center"
              style={{ background: isLight ? "#f5f5f5" : "#1a1d27", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.18)", color: isLight ? "#0a0a0a" : "white" }}
            >
              <p className="font-black text-base mb-1">
                {lang === "es" ? "¿Eliminar resaltado?" : "Remove highlight?"}
              </p>
              <p className="text-sm mb-5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
                {lang === "es" ? "Esta acción no se puede deshacer." : "This cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRemoveId(null)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)" }}
                >
                  {lang === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    const target = bookHighlights.find(h => h.id === confirmRemoveId);
                    if (target) {
                      deleteUnifiedHighlight(target);
                      setBookHighlights(prev => prev.filter(h => h.id !== confirmRemoveId));
                    }
                    setConfirmRemoveId(null);
                  }}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                  style={{ background: "rgba(239,68,68,0.18)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.28)" }}
                >
                  {lang === "es" ? "Eliminar" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Bookmark modal */}
    {bookmarkTarget && (
      <BookmarkModal
        item={{
          id: `book::${bookmarkTarget.slug}`,
          type: "book",
          title: bookTitle(bookmarkTarget, lang),
          subtitle: bookmarkTarget.author,
          preview: bookmarkTarget.description?.slice(0, 120) ?? undefined,
        }}
        label={bookTitle(bookmarkTarget, lang)}
        onClose={() => { setBookmarkTarget(null); refreshSaved(); }}
      />
    )}

    </>
  );
}
