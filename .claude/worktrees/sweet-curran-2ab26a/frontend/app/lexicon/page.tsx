"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  BookMeta,
  WordToken,
  ChapterData,
  StrongsEntry,
  CommentaryEntry,
} from "../lib/types";
import {
  fetchBooks,
  fetchChapter,
  fetchCommentary,
  fetchStrongs,
  searchStrongs,
} from "../lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPunctuation(w: string) {
  return /^[.,;:!?()\[\]"'—–-]+$/.test(w);
}

// ─── Word chip ────────────────────────────────────────────────────────────────

function WordChip({
  token,
  onSelect,
  active,
  testament,
}: {
  token: WordToken;
  onSelect: (t: WordToken) => void;
  active: boolean;
  testament: string;
}) {
  if (isPunctuation(token.w)) {
    return <span className="text-white/30 select-none">{token.w}</span>;
  }

  const isHebrew = testament === "OT";
  const hasNum = !!token.s;

  return (
    <button
      onClick={() => onSelect(token)}
      className={`inline-flex flex-col items-center gap-0.5 px-0.5 rounded transition-all duration-100 group cursor-pointer ${
        active
          ? isHebrew
            ? "bg-amber-500/20 ring-1 ring-amber-500/50"
            : "bg-sky-500/20 ring-1 ring-sky-500/50"
          : "hover:bg-white/[0.06]"
      }`}
    >
      <span
        className={`text-sm leading-snug font-medium ${
          active
            ? isHebrew
              ? "text-amber-200"
              : "text-sky-200"
            : "text-white/80 group-hover:text-white"
        }`}
      >
        {token.w}
      </span>
      {hasNum && (
        <span
          className={`text-[9px] font-mono leading-none tracking-tight ${
            active
              ? isHebrew
                ? "text-amber-400"
                : "text-sky-400"
              : "text-white/25 group-hover:text-white/45"
          }`}
        >
          {token.s}
        </span>
      )}
      {!hasNum && (
        <span className="text-[9px] leading-none text-transparent select-none">·</span>
      )}
    </button>
  );
}

// ─── Strong's panel ───────────────────────────────────────────────────────────

function StrongsPanel({
  entry,
  onClose,
}: {
  entry: StrongsEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  const isHebrew = entry.lang === "Hebrew";
  const bgCls = isHebrew
    ? "bg-amber-500/10 border-amber-500/30"
    : "bg-sky-500/10 border-sky-500/30";
  const textCls = isHebrew ? "text-amber-300" : "text-sky-300";
  const badgeCls = isHebrew
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-sky-500/20 text-sky-300 border-sky-500/30";

  return (
    <div className={`rounded-2xl border ${bgCls} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeCls}`}
            >
              {entry.strongs}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}
            >
              {entry.lang}
              {entry.lang === "Hebrew" ? " / Aramaic" : ""}
            </span>
          </div>
          <p
            className={`text-3xl font-bold leading-none mb-1 ${textCls} ${isHebrew ? "font-serif" : ""}`}
            dir={isHebrew ? "rtl" : "ltr"}
          >
            {entry.lemma}
          </p>
          {entry.xlit && <p className="text-white/50 text-sm italic">{entry.xlit}</p>}
          {entry.pron && <p className="text-white/35 text-xs mt-0.5">/{entry.pron}/</p>}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-colors"
        >
          ✕
        </button>
      </div>

      {/* KJV definition */}
      {entry.definition && (
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">
            KJV Translation Words
          </p>
          <p className={`text-sm leading-relaxed font-medium ${textCls}`}>{entry.definition}</p>
        </div>
      )}

      {/* Full Strong's definition */}
      {entry.fullDefinition && (
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">
            Strong&apos;s Definition
          </p>
          <p className="text-white/60 text-sm leading-relaxed">{entry.fullDefinition}</p>
        </div>
      )}

      {/* Derivation */}
      {entry.derivation && (
        <div className="px-5 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">
            Derivation
          </p>
          <p className="text-white/40 text-xs leading-relaxed italic">{entry.derivation}</p>
        </div>
      )}

      {/* See also */}
      {entry.see && entry.see.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
            See Also
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entry.see.map((s) => (
              <span
                key={s}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeCls} cursor-default`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Commentary panel ─────────────────────────────────────────────────────────

function CommentaryPanel({
  entries,
  bookName,
  chapter,
}: {
  entries: CommentaryEntry[];
  bookName: string;
  chapter: number;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggle = (v: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-violet-500/20 flex items-center gap-2">
        <span className="text-lg">📖</span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-400/70">
            Matthew Henry Commentary
          </p>
          <p className="text-[10px] text-violet-300/40 mt-0.5">
            {bookName} Chapter {chapter} · c. 1706, public domain
          </p>
        </div>
      </div>

      <div className="divide-y divide-violet-500/10">
        {entries.map(({ verse, text }) => {
          const isOpen = expanded.has(verse);
          const label = verse === 0 ? "Chapter Overview" : `Verse ${verse}`;
          const preview = text.length > 220 ? text.slice(0, 220) + "…" : text;

          return (
            <div key={verse} className="px-5 py-3">
              <button
                className="w-full flex items-center justify-between gap-2 text-left"
                onClick={() => toggle(verse)}
              >
                <span className="text-xs font-bold text-violet-300/70">{label}</span>
                <svg
                  className={`w-3 h-3 text-violet-400/40 flex-shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className="text-white/55 text-xs leading-relaxed mt-2">
                {isOpen ? text : preview}
              </p>
              {!isOpen && text.length > 220 && (
                <button
                  onClick={() => toggle(verse)}
                  className="text-[10px] text-violet-400/60 hover:text-violet-300 mt-1 font-semibold transition-colors"
                >
                  Read more ↓
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LexiconPage() {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [hasStrongs, setHasStrongs] = useState(false);
  const [hasMhc, setHasMhc] = useState(false);

  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [commentary, setCommentary] = useState<CommentaryEntry[]>([]);
  const [loadingChapter, setLoadingChapter] = useState(false);

  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  const [strongsEntry, setStrongsEntry] = useState<StrongsEntry | null>(null);
  const [loadingStrongs, setLoadingStrongs] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLang, setSearchLang] = useState<"" | "H" | "G">("");
  const [searchResults, setSearchResults] = useState<StrongsEntry[]>([]);
  const [searching, setSearching] = useState(false);

  const [activeTab, setActiveTab] = useState<"reader" | "search">("reader");
  const [showCommentary, setShowCommentary] = useState(true);
  const [testamentFilter, setTestamentFilter] = useState<"ALL" | "OT" | "NT">("ALL");

  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Load book list on mount
  useEffect(() => {
    fetchBooks()
      .then(({ books: bks, hasStrongs: hs, hasMhc: hm }) => {
        setBooks(bks);
        setHasStrongs(hs);
        setHasMhc(hm);
        const john = bks.find((b) => b.name === "John");
        if (john) {
          setSelectedBook(john);
          setSelectedChapter(3);
        } else if (bks.length) {
          setSelectedBook(bks[0]);
          setSelectedChapter(1);
        }
      })
      .catch(() => {});
  }, []);

  // Load chapter when selection changes
  useEffect(() => {
    if (!selectedBook) return;
    setLoadingChapter(true);
    setChapterData(null);
    setCommentary([]);
    setActiveToken(null);
    setStrongsEntry(null);

    const chFetch = fetchChapter(selectedBook.num, selectedChapter);
    const mhcFetch = hasMhc
      ? fetchCommentary(selectedBook.num, selectedChapter).catch(() => [] as CommentaryEntry[])
      : Promise.resolve([] as CommentaryEntry[]);

    Promise.allSettled([chFetch, mhcFetch]).then(([chRes, mhcRes]) => {
      if (chRes.status === "fulfilled") setChapterData(chRes.value);
      if (mhcRes.status === "fulfilled") setCommentary(mhcRes.value as CommentaryEntry[]);
      setLoadingChapter(false);
    });
  }, [selectedBook, selectedChapter, hasMhc]);

  // Look up Strong's when a word is clicked
  const handleWordSelect = useCallback(async (token: WordToken) => {
    setActiveToken(token);
    if (!token.s) {
      setStrongsEntry(null);
      return;
    }
    setLoadingStrongs(true);
    try {
      const entry = await fetchStrongs(token.s);
      setStrongsEntry(entry);
    } catch {
      setStrongsEntry(null);
    } finally {
      setLoadingStrongs(false);
    }
  }, []);

  // Strong's search
  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const results = await searchStrongs({ q, lang: searchLang || undefined, limit: 30 });
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, searchLang]);

  const visibleBooks = books.filter((b) =>
    testamentFilter === "ALL" ? true : b.testament === testamentFilter
  );

  const chapterNums = selectedBook
    ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)
    : [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.07] bg-[#0f0f0f] sticky top-0 z-30 print:hidden">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap items-center gap-2 py-2 md:h-14 md:py-0 md:gap-4">
          <a
            href="/"
            className="text-xs font-black tracking-widest text-white/30 hover:text-white/60 transition-colors"
          >
            ← RYC
          </a>

          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Testament toggle */}
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 gap-0.5">
              {(["ALL", "OT", "NT"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTestamentFilter(tf)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    testamentFilter === tf
                      ? "bg-violet-600 text-white"
                      : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Book selector */}
            <select
              value={selectedBook?.num ?? ""}
              onChange={(e) => {
                const b = books.find((bk) => bk.num === Number(e.target.value));
                if (b) {
                  setSelectedBook(b);
                  setSelectedChapter(1);
                }
              }}
              className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-violet-500/50 min-w-[9rem]"
            >
              {visibleBooks.map((b) => (
                <option key={b.num} value={b.num} className="bg-[#1a1a1a]">
                  {b.name}
                </option>
              ))}
            </select>

            {/* Chapter selector */}
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-violet-500/50 w-24"
            >
              {chapterNums.map((n) => (
                <option key={n} value={n} className="bg-[#1a1a1a]">
                  Ch. {n}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 gap-0.5">
            <button
              onClick={() => setActiveTab("reader")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === "reader"
                  ? "bg-violet-600 text-white"
                  : "text-white/30 hover:text-white/55"
              }`}
            >
              📖 Reader
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === "search"
                  ? "bg-violet-600 text-white"
                  : "text-white/30 hover:text-white/55"
              }`}
            >
              🔍 Search
            </button>
          </div>

          {/* Commentary toggle */}
          {hasMhc && activeTab === "reader" && (
            <button
              onClick={() => setShowCommentary((s) => !s)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                showCommentary
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                  : "border-white/10 text-white/30 hover:text-white/55"
              }`}
            >
              MHC
            </button>
          )}
        </div>
      </header>

      {/* ── Data notice ───────────────────────────────────────────────────────── */}
      {!hasStrongs && (
        <div className="max-w-screen-xl mx-auto px-4 pt-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 flex items-start gap-3">
            <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
            <div>
              <p className="text-amber-300 text-sm font-bold">Strong&apos;s data not loaded</p>
              <p className="text-amber-200/55 text-xs mt-0.5 leading-relaxed">
                Run{" "}
                <span className="font-mono bg-black/30 px-1 rounded">
                  download-lexicon.command
                </span>{" "}
                (double-click in Finder) to download the Hebrew &amp; Greek dictionaries, then
                restart the backend. Word-by-word lookup will be active immediately after.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Search tab ───────────────────────────────────────────────────────── */}
      {activeTab === "search" && (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white/80 mb-1">
              Strong&apos;s Concordance Search
            </h1>
            <p className="text-sm text-white/35">
              Search by English keyword, Strong&apos;s number (H430 / G2316), transliteration, or
              original-language word
            </p>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 gap-0.5 flex-shrink-0">
              {([["", "H+G"], ["H", "Hebrew"], ["G", "Greek"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSearchLang(val)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    searchLang === val
                      ? "bg-violet-600 text-white"
                      : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. love · H430 · G2316 · agapao · elohim"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.05] disabled:text-white/20 text-white text-sm font-bold transition-colors"
            >
              {searching ? "…" : "Search"}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {searchResults.map((entry) => {
              const isH = entry.lang === "Hebrew";
              const border = isH
                ? "border-amber-500/25 bg-amber-500/[0.05]"
                : "border-sky-500/25 bg-sky-500/[0.05]";
              const textColor = isH ? "text-amber-300" : "text-sky-300";
              const badge = isH
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-sky-500/20 text-sky-300 border-sky-500/30";
              return (
                <div key={entry.strongs} className={`rounded-xl border ${border} p-4`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full border ${badge} flex-shrink-0`}
                    >
                      {entry.strongs}
                    </span>
                    <span
                      className={`text-2xl font-bold leading-none ${textColor}`}
                      dir={isH ? "rtl" : "ltr"}
                    >
                      {entry.lemma}
                    </span>
                    {entry.xlit && (
                      <span className="text-white/40 text-sm italic self-end">{entry.xlit}</span>
                    )}
                    {entry.pron && (
                      <span className="text-white/25 text-xs self-end">/{entry.pron}/</span>
                    )}
                  </div>
                  {entry.definition && (
                    <p className={`text-sm font-medium mb-1 ${textColor}`}>{entry.definition}</p>
                  )}
                  {entry.fullDefinition && (
                    <p className="text-white/45 text-xs leading-relaxed">{entry.fullDefinition}</p>
                  )}
                </div>
              );
            })}
            {!searching && searchQuery && searchResults.length === 0 && (
              <p className="text-white/25 text-sm text-center py-8">No results found.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Reader tab ───────────────────────────────────────────────────────── */}
      {activeTab === "reader" && (
        <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Chapter heading */}
          {selectedBook && (
            <div className="mb-6">
              <h1 className="text-3xl font-black text-white/85">
                {selectedBook.name}{" "}
                <span className="text-violet-400">{selectedChapter}</span>
              </h1>
              <p className="text-xs text-white/25 mt-1 font-mono">
                {selectedBook.testament === "OT"
                  ? "Hebrew / Aramaic Old Testament"
                  : "Greek New Testament"}{" "}
                · King James Version
              </p>
              {chapterData && !chapterData.hasStrongs && hasStrongs && (
                <p className="text-xs text-amber-400/60 mt-1">
                  ℹ Per-word tagging not available for this chapter — click any word to search
                  Strong&apos;s by keyword.
                </p>
              )}
            </div>
          )}

          <div
            className={`grid gap-6 ${
              strongsEntry || loadingStrongs || (showCommentary && commentary.length > 0)
                ? "lg:grid-cols-[1fr_380px]"
                : "grid-cols-1 max-w-3xl"
            }`}
          >
            {/* ── Left: Verses ─────────────────────────────────────────────── */}
            <div className="space-y-5">
              {loadingChapter && (
                <div className="flex items-center gap-3 py-20 justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                  <span className="text-white/30 text-sm">Loading…</span>
                </div>
              )}

              {chapterData?.verses.map((verse) => (
                <div
                  key={verse.verse}
                  ref={(el) => {
                    verseRefs.current[verse.verse] = el;
                  }}
                  className="group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-black text-violet-400/50 w-6 text-right flex-shrink-0 mt-1.5 select-none">
                      {verse.verse}
                    </span>
                    <div className="flex-1 flex flex-wrap gap-x-1.5 gap-y-2 items-end">
                      {verse.words.map((token, wi) => (
                        <WordChip
                          key={wi}
                          token={token}
                          onSelect={handleWordSelect}
                          active={
                            activeToken?.s === token.s &&
                            activeToken?.w === token.w &&
                            !!token.s
                          }
                          testament={chapterData.testament}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Chapter navigation */}
              {chapterData && (
                <div className="flex items-center justify-between pt-6 border-t border-white/[0.07]">
                  <button
                    onClick={() => {
                      if (selectedChapter > 1) {
                        setSelectedChapter((c) => c - 1);
                      } else if (selectedBook && selectedBook.num > 1) {
                        const prev = books.find((b) => b.num === selectedBook.num - 1);
                        if (prev) {
                          setSelectedBook(prev);
                          setSelectedChapter(prev.chapters);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-white/20 font-mono">
                    {selectedBook?.name} {selectedChapter}
                  </span>
                  <button
                    onClick={() => {
                      if (selectedBook && selectedChapter < selectedBook.chapters) {
                        setSelectedChapter((c) => c + 1);
                      } else if (selectedBook && selectedBook.num < 66) {
                        const next = books.find((b) => b.num === selectedBook.num + 1);
                        if (next) {
                          setSelectedBook(next);
                          setSelectedChapter(1);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Strong's + Commentary ─────────────────────────────── */}
            {(strongsEntry || loadingStrongs || (showCommentary && commentary.length > 0)) && (
              <div className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
                {/* Strong's entry panel */}
                {loadingStrongs && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex items-center justify-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <span className="text-white/30 text-sm">Looking up…</span>
                  </div>
                )}

                {!loadingStrongs && strongsEntry && (
                  <StrongsPanel
                    entry={strongsEntry}
                    onClose={() => {
                      setStrongsEntry(null);
                      setActiveToken(null);
                    }}
                  />
                )}

                {/* Matthew Henry Commentary */}
                {showCommentary && commentary.length > 0 && (
                  <CommentaryPanel
                    entries={commentary}
                    bookName={selectedBook?.name ?? ""}
                    chapter={selectedChapter}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
