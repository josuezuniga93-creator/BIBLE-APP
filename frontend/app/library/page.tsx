"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookCatalogEntry } from "../lib/types";
import { STATIC_BOOK_CATALOG } from "../lib/bookCatalog";
import { useLanguage } from "../lib/useLanguage";

const TAG_COLORS: Record<string, string> = {
  Allegory:        "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Puritan:         "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Foundational:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Autobiography:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Grace:           "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Patristic:       "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Church Father": "bg-orange-500/10 text-orange-300 border-orange-500/20",
  "Spiritual Memoir": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Devotional:      "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Medieval:        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Classic:         "bg-slate-500/10 text-slate-300 border-slate-500/20",
  Reformed:        "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Theology:        "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Calvin:          "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  Sanctification:  "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Victorian:       "bg-stone-500/10 text-stone-300 border-stone-500/20",
  Practical:       "bg-lime-500/10 text-lime-400 border-lime-500/20",
  Spurgeon:        "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Daily:           "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Sermons:         "bg-red-500/10 text-red-400 border-red-500/20",
  "Great Awakening": "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  Edwards:         "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const DEFAULT_TAG_CLASS = "bg-white/5 text-white/40 border-white/10";

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

function BookCover({
  book,
  grayscale = false,
}: {
  book: BookCatalogEntry;
  grayscale?: boolean;
}) {
  const style = COVER_STYLES[book.slug] ?? DEFAULT_COVER;

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-4 transition-transform duration-200 group-hover:scale-[1.02] ${grayscale ? "opacity-40" : ""}`}
      style={{ background: `linear-gradient(160deg, ${style.from}, ${style.via} 50%, ${style.to})` }}
    >
      {/* Top ornament */}
      <div className="flex justify-between items-start">
        <div className="w-px self-stretch opacity-30" style={{ background: style.accent }} />
        <span className="text-lg opacity-40" style={{ color: style.accent }}>{style.ornament}</span>
      </div>

      {/* Center: title + author */}
      <div className="text-center px-1">
        <p
          className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 leading-tight"
          style={{ color: style.accent, opacity: 0.75 }}
        >
          {book.author}
        </p>
        <p className="text-white font-bold text-sm leading-snug line-clamp-4">
          {book.title}
        </p>
        <p className="text-white/25 text-[10px] mt-2 font-medium">{book.year}</p>
      </div>

      {/* Bottom rule */}
      <div className="h-px w-12 mx-auto opacity-25" style={{ background: style.accent }} />
    </div>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        TAG_COLORS[tag] ?? DEFAULT_TAG_CLASS
      }`}
    >
      {tag}
    </span>
  );
}

type ProgressEntry = { book: BookCatalogEntry; chapter: number; total: number };

export default function LibraryPage() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<BookCatalogEntry[]>(STATIC_BOOK_CATALOG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<ProgressEntry[]>([]);
  const [continueOpen, setContinueOpen] = useState(false);

  // Read progress from localStorage once books are loaded
  useEffect(() => {
    if (books.length === 0) return;
    const entries: ProgressEntry[] = [];
    for (const book of books) {
      const raw = localStorage.getItem(`axiom-progress-${book.slug}`);
      if (!raw) continue;
      try {
        const { chapter, total } = JSON.parse(raw);
        if (chapter && total) entries.push({ book, chapter, total });
      } catch {}
    }
    setInProgress(entries);
  }, [books]);

  const available = books.filter((b) => !b.coming_soon);
  const comingSoon = books.filter((b) => b.coming_soon);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-violet-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            📚 {t("lib_badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-amber-200 to-violet-200 bg-clip-text text-transparent">
            {t("lib_heading")}
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            {t("lib_sub")}
          </p>
          <p className="mt-2 text-white/25 text-xs italic">
            "All freely, freely given." — Calvin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-violet-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400 text-sm">
            Could not load books: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── In Progress ─────────────────────────────────────────────── */}
            {inProgress.length > 0 && (
              <>
                <div className="mb-8">
                  <button
                    onClick={() => setContinueOpen(true)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-500/35 hover:bg-amber-500/[0.07] active:scale-[0.99] transition-all text-left"
                  >
                    <span className="text-xl">📖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white/85">Continue Reading</p>
                      <p className="text-xs text-amber-400/60 mt-0.5">{inProgress.length} book{inProgress.length !== 1 ? "s" : ""} in progress</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Continue Reading sheet */}
                {continueOpen && (
                  <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setContinueOpen(false)}>
                    <div className="rounded-t-3xl border-t border-white/10 bg-[#181818] px-4 pt-3 pb-8" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                      <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 px-1">In Progress</p>
                      <div className="space-y-3">
                        {inProgress.map(({ book, chapter, total }) => {
                          const pct = Math.round((chapter / total) * 100);
                          return (
                            <Link key={book.slug} href={`/library/${book.slug}`} onClick={() => setContinueOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] p-3.5 hover:border-amber-500/30 active:scale-[0.99] transition-all">
                              <div className="w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#111]">
                                <BookCover book={book} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-amber-400/60 font-bold truncate">{book.author}</p>
                                <p className="text-sm font-bold text-white/90 leading-snug truncate">{book.title}</p>
                                <div className="mt-1.5 h-1 rounded-full bg-white/[0.07] overflow-hidden">
                                  <div className="h-full rounded-full bg-amber-400/50 transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <p className="text-[10px] text-amber-400/40 mt-1">Ch. {chapter} of {total} · {pct}%</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Available books */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
              {available.map((book) => (
                <Link
                  key={book.slug}
                  href={`/library/${book.slug}`}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-200 flex flex-col"
                >
                  {/* Cover image */}
                  <div className="relative h-52 overflow-hidden bg-[#111]">
                    <BookCover book={book} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Subtle left-edge spine shadow */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div>
                      <p className="text-xs text-amber-400/80 font-bold mb-0.5">{book.author}</p>
                      <h3 className="text-sm font-bold text-white/90 leading-snug group-hover:text-white transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-white/30 mt-0.5">{book.year}</p>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3 flex-1">
                      {book.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {book.tags.map((t) => (
                        <TagPill key={t} tag={t} />
                      ))}
                    </div>
                    <div className="pt-2 mt-auto">
                      <span className="text-xs font-bold text-amber-400/70 group-hover:text-amber-400 transition-colors">
                        {t("lib_read")} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Coming soon */}
            {comingSoon.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 border-t border-white/[0.06]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/20">
                    {t("lib_coming_soon")}
                  </p>
                  <div className="flex-1 border-t border-white/[0.06]" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-50">
                  {comingSoon.map((book) => (
                    <div
                      key={book.slug}
                      className="rounded-2xl border border-white/[0.05] bg-white/[0.02] overflow-hidden flex flex-col cursor-not-allowed"
                    >
                      <div className="relative h-52 overflow-hidden bg-[#111]">
                        <BookCover book={book} grayscale />
                      </div>
                      <div className="p-4 flex flex-col gap-1">
                        <p className="text-xs text-white/30 font-bold">{book.author}</p>
                        <h3 className="text-sm font-bold text-white/50 leading-snug">{book.title}</h3>
                        <p className="text-[11px] text-white/20">{book.year}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.tags.map((t) => (
                            <TagPill key={t} tag={t} />
                          ))}
                        </div>
                        <p className="text-[10px] text-white/20 mt-2 font-bold uppercase tracking-widest">
                          In preparation
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Suggest a book */}
            <div className="mt-14 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center">
              <p className="text-lg font-bold text-white/70 mb-2">Missing a classic?</p>
              <p className="text-white/35 text-sm max-w-md mx-auto mb-5">
                We prioritize books that are in the public domain and doctrinally sound. Community members vote on what comes next.
              </p>
              <Link
                href="/give"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600/80 text-white text-sm font-bold hover:bg-amber-500 transition-colors"
              >
                🤝 Join Community to Vote
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
