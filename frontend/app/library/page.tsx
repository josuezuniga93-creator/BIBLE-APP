"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BookCatalogEntry } from "../lib/types";
import { STATIC_BOOK_CATALOG } from "../lib/bookCatalog";
import { getBookCoverImage } from "../lib/bookCoverImages";
import { useTheme } from "../lib/useTheme";
import { GeneratedBookCover } from "../components/GeneratedArtwork";
import { useLanguage } from "../lib/useLanguage";
import { bookTitle } from "../lib/spanishContent";
import { UiIcon } from "../components/UiIcon";
import { isFavorite, setFavorite } from "../lib/favorites";

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
type LibTab = "books" | "reading" | "completed" | "favorites";

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
  const [activeTab, setActiveTab] = useState<LibTab>("books");
  const [inProgress, setInProgress] = useState<ProgressEntry[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [favoriteBooks, setFavoriteBooks] = useState<Set<string>>(new Set());
  const [showAllOldBooks, setShowAllOldBooks] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  function refreshFavorites() {
    setFavoriteBooks(new Set(available.filter((b) => isFavorite("book", b.slug)).map((b) => b.slug)));
  }

  function toggleBookFavorite(slug: string) {
    const next = !favoriteBooks.has(slug);
    setFavorite("book", slug, next);
    setFavoriteBooks((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(slug); else updated.delete(slug);
      return updated;
    });
  }

  const available = STATIC_BOOK_CATALOG.filter((b) => !b.coming_soon);
  const featuredBooks = available.slice(0, 3);
  const recentlyAdded = [...available].slice(-3).reverse();

  useEffect(() => { refreshFavorites(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      const matchesSearch =
        !q ||
        bookTitle(b, lang).toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [available, librarySearch, lang]);

  const tabBooks = useMemo(() => {
    if (activeTab === "reading") return inProgress.filter((e) => !completedSlugs.has(e.book.slug)).map((e) => e.book);
    if (activeTab === "completed") return inProgress.filter((e) => completedSlugs.has(e.book.slug)).map((e) => e.book);
    if (activeTab === "favorites") return filteredBooks.filter((book) => favoriteBooks.has(book.slug));
    return filteredBooks;
  }, [activeTab, filteredBooks, inProgress, completedSlugs, favoriteBooks]);

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
        <button type="button" className="premium-library-icon-button" aria-label={lang === "es" ? "Favoritos" : "Favorites"} onClick={() => setActiveTab("favorites")}>
          <UiIcon name="heart" size={21} />
        </button>
      </div>

      <section className="premium-library-hero">
        <p className="premium-library-eyebrow">{lang === "es" ? "Biblioteca" : "Library"}</p>
        <h1 className="premium-library-title">{lang === "es" ? "Libros Gratis" : "Free Books"}</h1>
        <p className="premium-library-subtitle">
          {lang === "es"
            ? "Obras cristianas clásicas organizadas para lectura enfocada, progreso y favoritos."
            : "Classic Christian works arranged for focused reading, progress, and favorites."}
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
          ["favorites", lang === "es" ? "Favoritos" : "Favorites"],
        ] as [LibTab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="premium-library-tab"
            data-active={activeTab === key}
            onClick={() => setActiveTab(key)}
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
          <h2>
            {activeTab === "reading"
              ? (lang === "es" ? "Continuar leyendo" : "Continue reading")
              : activeTab === "favorites"
              ? (lang === "es" ? "Tus favoritos" : "Your favorites")
              : lang === "es" ? "Todos los libros" : "All books"}
          </h2>
          <button type="button" className="premium-library-link-button" onClick={() => setShowAllOldBooks((v) => !v)}>
            {showAllOldBooks ? (lang === "es" ? "Menos" : "Less") : (lang === "es" ? "Ver todo" : "See all")}
          </button>
        </div>
        {tabBooks.length === 0 ? (
          <div className="premium-library-card block text-center">
            <p className="premium-library-item-title text-[15px]">
              {activeTab === "favorites"
                ? (lang === "es" ? "Sin favoritos todavía" : "No favorites yet")
                : (lang === "es" ? "Nada para mostrar" : "Nothing to show yet")}
            </p>
            <p className="premium-library-meta mt-1">
              {activeTab === "favorites"
                ? (lang === "es" ? "Toca el corazón en un libro para guardarlo aquí." : "Tap the heart on a book to keep it here.")
                : (lang === "es" ? "Prueba otra búsqueda." : "Try another search.")}
            </p>
          </div>
        ) : (
          <div className="premium-library-grid">
            {(showAllOldBooks ? tabBooks : tabBooks.slice(0, 6)).map((book) => {
              const favorite = favoriteBooks.has(book.slug);
              return (
                <div key={book.slug} className="premium-library-item">
                  <div className="relative">
                    <Link href={`/library/${book.slug}`} className="block active:scale-95 transition-transform">
                      <div className="premium-library-item-cover">
                        <BookCover book={book} />
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="premium-library-favorite-button"
                      data-active={favorite}
                      aria-label={favorite ? (lang === "es" ? "Quitar favorito" : "Remove favorite") : (lang === "es" ? "Marcar favorito" : "Favorite book")}
                      onClick={() => toggleBookFavorite(book.slug)}
                    >
                      <UiIcon name="heart" size={14} />
                    </button>
                  </div>
                  <Link href={`/library/${book.slug}`} className="block">
                    <p className="premium-library-item-title line-clamp-2">{bookTitle(book, lang)}</p>
                    <span className="premium-library-item-meta truncate">{book.author}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>

    </>
  );
}
