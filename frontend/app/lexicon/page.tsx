"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RemoveHighlightBubble } from "../components/RemoveHighlightBubble";
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

// ─── Constants ────────────────────────────────────────────────────────────────

type BibleTranslation = "kjv" | "geneva" | "rv60";
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";
const FONT_SIZES: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm:   "text-sm",
  base: "text-base",
  lg:   "text-lg",
  xl:   "text-xl",
  "2xl":"text-2xl",
};

const HIGHLIGHT_KEY    = (book: number, ch: number) => `ryc-highlight-${book}-${ch}`;
const VERSE_COLOR_KEY  = (book: number, ch: number) => `ryc-vcolor-${book}-${ch}`;
const CHAPTER_NOTE_KEY = (book: number, ch: number) => `ryc-chapter-note-${book}-${ch}`;

const HIGHLIGHT_COLORS = {
  yellow: { bg: "bg-yellow-400/30",  text: "text-yellow-100", dot: "#ca8a04",  label: "Yellow"  },
  green:  { bg: "bg-green-500/25",   text: "text-green-100",  dot: "#16a34a",  label: "Green"   },
  blue:   { bg: "bg-blue-500/25",    text: "text-blue-100",   dot: "#2563eb",  label: "Blue"    },
  pink:   { bg: "bg-pink-500/25",    text: "text-pink-100",   dot: "#db2777",  label: "Pink"    },
  purple: { bg: "bg-purple-500/25",  text: "text-purple-100", dot: "#7c3aed",  label: "Purple"  },
} as const;
type HighlightColor = keyof typeof HIGHLIGHT_COLORS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPunctuation(w: string) {
  return /^[.,;:!?()\[\]"'—–\-]+$/.test(w);
}

// ─── Inline word (for prose reading) ─────────────────────────────────────────

function InlineWord({
  token,
  onSelect,
  active,
  highlighted,
  onHighlight,
  testament,
}: {
  token: WordToken;
  onSelect: (t: WordToken) => void;
  active: boolean;
  highlighted: boolean;
  onHighlight: (w: string) => void;
  testament: string;
}) {
  if (isPunctuation(token.w)) {
    return <span className="text-white/50">{token.w}</span>;
  }

  const isHebrew = testament === "OT";

  return (
    <span className="group/word relative inline">
      <button
        onClick={() => onSelect(token)}
        onContextMenu={(e) => { e.preventDefault(); onHighlight(token.w); }}
        className={`inline rounded-sm px-[1px] transition-colors duration-75 ${
          highlighted
            ? "bg-amber-400/30 text-amber-100"
            : active
            ? isHebrew
              ? "bg-amber-500/25 text-amber-100 underline decoration-amber-500/60 underline-offset-2"
              : "bg-sky-500/25 text-sky-100 underline decoration-sky-500/60 underline-offset-2"
            : "text-white/85 hover:text-white hover:bg-white/[0.07]"
        }`}
      >
        {token.w}
      </button>
      {/* Strong's number tooltip on hover */}
      {token.s && (
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/0 group-hover/word:text-white/50 pointer-events-none transition-colors whitespace-nowrap z-10">
          {token.s}
        </span>
      )}
    </span>
  );
}

// ─── Strong's panel content (shared between popup and sidebar) ───────────────

function StrongsPanelContent({
  entry,
  onClose,
  badgeCls,
  textCls,
  isHebrew,
}: {
  entry: StrongsEntry;
  onClose: () => void;
  badgeCls: string;
  textCls: string;
  isHebrew: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeCls}`}>
              {entry.strongs}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}>
              {entry.lang}{entry.lang === "Hebrew" ? " / Aramaic" : ""}
            </span>
          </div>
          <p className={`text-3xl font-bold leading-none mb-1 ${textCls} ${isHebrew ? "font-serif" : ""}`} dir={isHebrew ? "rtl" : "ltr"}>
            {entry.lemma}
          </p>
          {entry.xlit && <p className="text-white/50 text-sm italic">{entry.xlit}</p>}
          {entry.pron && <p className="text-white/35 text-xs mt-0.5">/{entry.pron}/</p>}
        </div>
        <button onClick={onClose} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-colors">
          ✕
        </button>
      </div>

      {entry.definition && (
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">KJV Translation Words</p>
          <p className={`text-sm leading-relaxed font-medium ${textCls}`}>{entry.definition}</p>
        </div>
      )}

      {entry.fullDefinition && (
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Strong&apos;s Definition</p>
          <p className="text-white/60 text-sm leading-relaxed">{entry.fullDefinition}</p>
        </div>
      )}

      {entry.derivation && (
        <div className="px-5 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">Derivation</p>
          <p className="text-white/40 text-xs leading-relaxed italic">{entry.derivation}</p>
        </div>
      )}

      {entry.see && entry.see.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">See Also</p>
          <div className="flex flex-wrap gap-1.5">
            {entry.see.map((s) => (
              <span key={s} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeCls} cursor-default`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Strong's bottom-sheet (mobile popup) ────────────────────────────────────

function StrongsSheet({
  entry,
  loading,
  onClose,
}: {
  entry: StrongsEntry | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!entry && !loading) return null;

  const isHebrew = entry?.lang === "Hebrew";
  const bgCls    = isHebrew ? "bg-amber-500/10 border-amber-500/30" : "bg-sky-500/10 border-sky-500/30";
  const textCls  = isHebrew ? "text-amber-300" : "text-sky-300";
  const badgeCls = isHebrew
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-sky-500/20 text-sky-300 border-sky-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 lg:hidden print:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Centered modal */}
      <div className={`relative bg-[#1a1a1a] rounded-3xl border border-white/[0.08] max-h-[75vh] w-full max-w-sm flex flex-col overflow-hidden shadow-2xl ${bgCls}`}>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <span className="text-white/40 text-sm">Looking up…</span>
          </div>
        ) : entry ? (
          <div className="overflow-y-auto">
            <StrongsPanelContent
              entry={entry}
              onClose={onClose}
              badgeCls={badgeCls}
              textCls={textCls}
              isHebrew={!!isHebrew}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Strong's panel (desktop sidebar) ────────────────────────────────────────

function StrongsPanel({
  entry,
  onClose,
}: {
  entry: StrongsEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  const isHebrew = entry.lang === "Hebrew";
  const bgCls    = isHebrew ? "bg-amber-500/10 border-amber-500/30" : "bg-sky-500/10 border-sky-500/30";
  const textCls  = isHebrew ? "text-amber-300" : "text-sky-300";
  const badgeCls = isHebrew
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-sky-500/20 text-sky-300 border-sky-500/30";

  return (
    <div className={`rounded-2xl border ${bgCls} overflow-hidden flex flex-col`}>
      <StrongsPanelContent
        entry={entry}
        onClose={onClose}
        badgeCls={badgeCls}
        textCls={textCls}
        isHebrew={isHebrew}
      />
    </div>
  );
}

// ─── Commentary panel ─────────────────────────────────────────────────────────

function CommentaryPanel({ entries, bookName, chapter }: { entries: CommentaryEntry[]; bookName: string; chapter: number }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const toggle = (v: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-violet-500/20 flex items-center gap-2">
        <span className="text-lg">📖</span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-400/70">Matthew Henry Commentary</p>
          <p className="text-[10px] text-violet-300/40 mt-0.5">{bookName} Chapter {chapter} · c. 1706, public domain</p>
        </div>
      </div>
      <div className="divide-y divide-violet-500/10">
        {entries.map(({ verse, text }) => {
          const isOpen = expanded.has(verse);
          const label = verse === 0 ? "Chapter Overview" : `Verse ${verse}`;
          const preview = text.length > 220 ? text.slice(0, 220) + "…" : text;
          return (
            <div key={verse} className="px-5 py-3">
              <button className="w-full flex items-center justify-between gap-2 text-left" onClick={() => toggle(verse)}>
                <span className="text-xs font-bold text-violet-300/70">{label}</span>
                <svg className={`w-3 h-3 text-violet-400/40 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className="text-white/55 text-xs leading-relaxed mt-2">{isOpen ? text : preview}</p>
              {!isOpen && text.length > 220 && (
                <button onClick={() => toggle(verse)} className="text-[10px] text-violet-400/60 hover:text-violet-300 mt-1 font-semibold transition-colors">Read more ↓</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Color Picker Popover ─────────────────────────────────────────────────────

function ColorPicker({
  verseNum,
  current,
  onSelect,
  onClear,
  onClose,
}: {
  verseNum: number;
  current: HighlightColor | undefined;
  onSelect: (color: HighlightColor) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-white/[0.12] rounded-2xl shadow-2xl p-4 flex flex-col gap-3 min-w-[220px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Highlight v.{verseNum}</p>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors text-sm">✕</button>
        </div>
        <div className="flex gap-2 justify-center">
          {(Object.entries(HIGHLIGHT_COLORS) as [HighlightColor, typeof HIGHLIGHT_COLORS[HighlightColor]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { onSelect(key); onClose(); }}
              title={val.label}
              className={`w-9 h-9 rounded-full transition-transform hover:scale-110 border-2 ${current === key ? "border-white/60 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: val.dot }}
            />
          ))}
        </div>
        {current && (
          <button
            onClick={() => { onClear(); onClose(); }}
            className="text-[10px] text-white/25 hover:text-white/50 font-bold text-center transition-colors"
          >
            Remove highlight
          </button>
        )}
      </div>
    </>
  );
}

// ─── Waking-up hint (shows after 8s of loading) ──────────────────────────────

function WakingUpHint() {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=hint, 2=hint+button
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 8000);
    const t2 = setTimeout(() => setPhase(2), 20000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2 mt-1">
      <p className="text-white/20 text-xs text-center max-w-xs leading-relaxed">
        Server is waking up from sleep — this can take up to 30 seconds.
      </p>
      {phase >= 2 && (
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-1.5 rounded-lg bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-600/50 transition-colors"
        >
          Reload Page
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LexiconPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f]" />}>
      <LexiconInner />
    </Suspense>
  );
}

function LexiconInner() {
  const searchParams = useSearchParams();
  const [books, setBooks]       = useState<BookMeta[]>([]);
  const [hasStrongs, setHasStrongs] = useState(false);
  const [hasMhc, setHasMhc]     = useState(false);
  const [booksError, setBooksError] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);

  const [selectedBook, setSelectedBook]       = useState<BookMeta | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterData, setChapterData]         = useState<ChapterData | null>(null);
  const [commentary, setCommentary]           = useState<CommentaryEntry[]>([]);
  const [loadingChapter, setLoadingChapter]   = useState(false);

  const [activeToken, setActiveToken]         = useState<WordToken | null>(null);
  const [strongsEntry, setStrongsEntry]       = useState<StrongsEntry | null>(null);
  const [loadingStrongs, setLoadingStrongs]   = useState(false);

  const [searchQuery, setSearchQuery]   = useState("");
  const [searchLang, setSearchLang]     = useState<"" | "H" | "G">("");
  const [searchResults, setSearchResults] = useState<StrongsEntry[]>([]);
  const [searching, setSearching]       = useState(false);

  const [activeTab, setActiveTab]             = useState<"reader" | "search">("reader");
  const [showCommentary, setShowCommentary]   = useState(true);
  const [testamentFilter, setTestamentFilter] = useState<"ALL" | "OT" | "NT">("ALL");

  const [translation, setTranslation]         = useState<BibleTranslation>("kjv");
  const [fontSize, setFontSize]               = useState<FontSize>("lg");
  const [presentationMode, setPresentationMode] = useState(false);

  // Translation picker sheet
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);

  // Navigation search (type "Romans 3")
  const [showNavSearch, setShowNavSearch]   = useState(false);
  const [navQuery,      setNavQuery]        = useState("");

  // Word-level highlights (existing)
  const [highlights, setHighlights] = useState<Set<string>>(new Set());
  const [highlightMode, setHighlightMode] = useState(false);

  // Pending word-highlight removal — requires user confirmation
  const [pendingRemoveWord, setPendingRemoveWord] = useState<{ word: string; x: number; y: number } | null>(null);

  // Track last mouse position so the confirmation bubble can be placed correctly
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    const track = (e: MouseEvent) => { lastPointerPos.current = { x: e.clientX, y: e.clientY }; };
    document.addEventListener("mousemove", track);
    document.addEventListener("click", track);
    document.addEventListener("contextmenu", track);
    return () => {
      document.removeEventListener("mousemove", track);
      document.removeEventListener("click", track);
      document.removeEventListener("contextmenu", track);
    };
  }, []);

  // Verse color highlights (new — multi-color)
  const [verseColors, setVerseColors] = useState<Record<number, HighlightColor>>({});
  const [colorPickerVerse, setColorPickerVerse] = useState<number | null>(null);

  // Chapter notes
  const [chapterNote, setChapterNote] = useState("");
  const [showNotes, setShowNotes]     = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [pickerView, setPickerView]         = useState<"books" | "chapters">("books");
  const [pickerBook, setPickerBook]         = useState<BookMeta | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ── Word highlights load/save ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedBook) return;
    const saved = localStorage.getItem(HIGHLIGHT_KEY(selectedBook.num, selectedChapter));
    try { setHighlights(saved ? new Set(JSON.parse(saved)) : new Set()); }
    catch { setHighlights(new Set()); }
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    if (!selectedBook) return;
    if (highlights.size === 0) localStorage.removeItem(HIGHLIGHT_KEY(selectedBook.num, selectedChapter));
    else localStorage.setItem(HIGHLIGHT_KEY(selectedBook.num, selectedChapter), JSON.stringify([...highlights]));
  }, [highlights, selectedBook, selectedChapter]);

  const toggleHighlight = useCallback((word: string) => {
    if (highlights.has(word)) {
      // Word is already highlighted — ask for confirmation before removing
      const { x, y } = lastPointerPos.current;
      setPendingRemoveWord({ word, x, y });
    } else {
      setHighlights((prev) => {
        const next = new Set(prev);
        next.add(word);
        return next;
      });
    }
  }, [highlights]);

  // ── Verse color highlights load/save ─────────────────────────────────────
  useEffect(() => {
    if (!selectedBook) return;
    const saved = localStorage.getItem(VERSE_COLOR_KEY(selectedBook.num, selectedChapter));
    try { setVerseColors(saved ? JSON.parse(saved) : {}); }
    catch { setVerseColors({}); }
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    if (!selectedBook) return;
    if (Object.keys(verseColors).length === 0) localStorage.removeItem(VERSE_COLOR_KEY(selectedBook.num, selectedChapter));
    else localStorage.setItem(VERSE_COLOR_KEY(selectedBook.num, selectedChapter), JSON.stringify(verseColors));
  }, [verseColors, selectedBook, selectedChapter]);

  const setVerseColor = useCallback((verseNum: number, color: HighlightColor) => {
    setVerseColors((prev) => ({ ...prev, [verseNum]: color }));
  }, []);

  const clearVerseColor = useCallback((verseNum: number) => {
    setVerseColors((prev) => {
      const next = { ...prev };
      delete next[verseNum];
      return next;
    });
  }, []);

  // ── Chapter notes load/save ───────────────────────────────────────────────
  const selectedBookRef    = useRef(selectedBook);
  const selectedChapterRef = useRef(selectedChapter);
  useEffect(() => { selectedBookRef.current = selectedBook; }, [selectedBook]);
  useEffect(() => { selectedChapterRef.current = selectedChapter; }, [selectedChapter]);

  useEffect(() => {
    if (!selectedBook) return;
    const saved = localStorage.getItem(CHAPTER_NOTE_KEY(selectedBook.num, selectedChapter));
    setChapterNote(saved ?? "");
  }, [selectedBook, selectedChapter]);

  const handleNoteChange = useCallback((text: string) => {
    setChapterNote(text);
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      const book = selectedBookRef.current;
      const ch   = selectedChapterRef.current;
      if (!book) return;
      if (text.trim()) localStorage.setItem(CHAPTER_NOTE_KEY(book.num, ch), text);
      else localStorage.removeItem(CHAPTER_NOTE_KEY(book.num, ch));
    }, 600);
  }, []);

  // ── Open concordance tab if URL says ?tab=search ─────────────────────────
  useEffect(() => {
    if (searchParams.get("tab") === "search") setActiveTab("search");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation search handler (parse "Romans 3") ─────────────────────────
  const handleNavSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed || !books.length) return;
    // Match: BookName Chapter[:Verse] — e.g. "Romans 3", "1 Cor 13", "John 3:16"
    const match = trimmed.match(/^(.+?)\s+(\d+)(?::\d+)?$/);
    if (!match) return;
    const [, rawBook, chStr] = match;
    const bookQuery = rawBook.toLowerCase().trim();
    const ch = parseInt(chStr, 10);
    const found = books.find(
      (b) =>
        b.name.toLowerCase() === bookQuery ||
        b.name.toLowerCase().startsWith(bookQuery) ||
        b.name.toLowerCase().replace(/\s+/g, "").startsWith(bookQuery.replace(/\s+/g, ""))
    );
    if (found) {
      setSelectedBook(found);
      setSelectedChapter(Math.max(1, Math.min(ch, found.chapters)));
      setActiveTab("reader");
      setShowNavSearch(false);
      setNavQuery("");
    }
  }, [books]);

  // ── Books + chapter loading ───────────────────────────────────────────────
  useEffect(() => {
    const bookParam    = searchParams.get("book");
    const chapterParam = searchParams.get("chapter");

    setBooksLoading(true);
    setBooksError(false);
    fetchBooks()
      .then(({ books: bks, hasStrongs: hs, hasMhc: hm }) => {
        setBooks(bks);
        setHasStrongs(hs);
        setHasMhc(hm);
        setBooksLoading(false);

        // If URL params specify a book, navigate there; otherwise default to John 3.
        if (bookParam) {
          const target = bks.find(
            (b) => b.name.toLowerCase() === bookParam.toLowerCase()
          );
          if (target) {
            setSelectedBook(target);
            setSelectedChapter(chapterParam ? Math.max(1, Number(chapterParam)) : 1);
            return;
          }
        }

        const john = bks.find((b) => b.name === "John");
        if (john) { setSelectedBook(john); setSelectedChapter(3); }
        else if (bks.length) { setSelectedBook(bks[0]); setSelectedChapter(1); }
      })
      .catch(() => { setBooksError(true); setBooksLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedBook) return;
    setLoadingChapter(true);
    setChapterData(null);
    setCommentary([]);
    setActiveToken(null);
    setStrongsEntry(null);
    setColorPickerVerse(null);

    const chFetch  = fetchChapter(selectedBook.num, selectedChapter, translation);
    const mhcFetch = hasMhc
      ? fetchCommentary(selectedBook.num, selectedChapter).catch(() => [] as CommentaryEntry[])
      : Promise.resolve([] as CommentaryEntry[]);

    Promise.allSettled([chFetch, mhcFetch]).then(([chRes, mhcRes]) => {
      if (chRes.status  === "fulfilled") setChapterData(chRes.value);
      if (mhcRes.status === "fulfilled") setCommentary(mhcRes.value as CommentaryEntry[]);
      setLoadingChapter(false);
    });
  }, [selectedBook, selectedChapter, hasMhc, translation]);

  const handleWordSelect = useCallback(async (token: WordToken) => {
    setActiveToken(token);
    setLoadingStrongs(true);
    try {
      if (token.s) {
        setStrongsEntry(await fetchStrongs(token.s));
      } else if (hasStrongs) {
        const results = await searchStrongs({ q: token.w, limit: 5 });
        setStrongsEntry(results[0] ?? null);
      } else {
        setStrongsEntry(null);
      }
    } catch { setStrongsEntry(null); }
    finally  { setLoadingStrongs(false); }
  }, [hasStrongs]);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try { setSearchResults(await searchStrongs({ q, lang: searchLang || undefined, limit: 30 })); }
    catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, [searchQuery, searchLang]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "f" || e.key === "F") setPresentationMode((v) => !v);
      if (e.key === "h" || e.key === "H") setHighlightMode((v) => !v);
      if (e.key === "ArrowRight") {
        if (selectedBook && selectedChapter < selectedBook.chapters) setSelectedChapter((c) => c + 1);
      }
      if (e.key === "ArrowLeft") {
        if (selectedChapter > 1) setSelectedChapter((c) => c - 1);
      }
      if (e.key === "Escape") setColorPickerVerse(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedBook, selectedChapter]);

  const visibleBooks = books.filter((b) =>
    testamentFilter === "ALL" ? true : b.testament === testamentFilter
  );
  const chapterNums = selectedBook
    ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)
    : [];

  const goNext = () => {
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      setSelectedChapter((c) => c + 1);
    } else if (selectedBook && selectedBook.num < 66) {
      const next = books.find((b) => b.num === selectedBook.num + 1);
      if (next) { setSelectedBook(next); setSelectedChapter(1); }
    }
  };

  const goPrev = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
    } else if (selectedBook && selectedBook.num > 1) {
      const prev = books.find((b) => b.num === selectedBook.num - 1);
      if (prev) { setSelectedBook(prev); setSelectedChapter(prev.chapters); }
    }
  };

  const highlightedVerseCount = Object.keys(verseColors).length;

  // ── Presentation mode ─────────────────────────────────────────────────────
  if (presentationMode) {
    const translLabel = translation === "geneva" ? "Geneva 1599" : translation === "rv60" ? "Reina Valera 1960" : "King James Version";
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col" onClick={() => setPresentationMode(false)}>
        <div className="absolute top-4 right-4 text-white/20 text-xs pointer-events-none">
          Press F or click anywhere to exit · ← → to navigate
        </div>
        <div className="px-8 pt-10 pb-4 flex-shrink-0 border-b border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-violet-400/50 font-bold uppercase tracking-widest mb-1">{translLabel}</p>
              <h2 className="text-3xl font-black text-white/90">
                {selectedBook?.name}{" "}
                <span className="text-violet-400">{selectedChapter}</span>
              </h2>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={goPrev} className="px-4 py-2 rounded-lg bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/80 text-sm font-bold transition-colors min-h-[44px]">← Prev</button>
              <button onClick={goNext} className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 text-sm font-bold transition-colors min-h-[44px]">Next →</button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-8" onClick={(e) => e.stopPropagation()}>
          {loadingChapter ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
            </div>
          ) : (
            <div className="max-w-4xl space-y-6">
              {chapterData?.verses.map((verse) => (
                <div key={verse.verse} className="flex gap-5 items-start">
                  <span className="text-lg font-black text-violet-400/40 w-10 text-right flex-shrink-0 pt-1">
                    {verse.verse}
                  </span>
                  <p className="text-2xl md:text-3xl leading-relaxed text-white/85 font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                    {verse.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Normal view ───────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#0f0f0f] text-white"
      onClick={() => setColorPickerVerse(null)}
    >
      {/* ── Books error banner ── */}
      {booksError && (
        <div className="max-w-screen-xl mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] px-5 py-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-300/90 mb-1">Couldn't connect to the Bible server</p>
              <p className="text-xs text-red-400/60 leading-relaxed mb-3">The backend may be sleeping or unreachable. This sometimes happens after a period of inactivity — try again in a moment.</p>
              <button
                onClick={() => {
                  setBooksError(false);
                  setBooksLoading(true);
                  fetchBooks()
                    .then(({ books: bks, hasStrongs: hs, hasMhc: hm }) => {
                      setBooks(bks); setHasStrongs(hs); setHasMhc(hm); setBooksLoading(false);
                      const john = bks.find((b) => b.name === "John");
                      if (john) { setSelectedBook(john); setSelectedChapter(3); }
                      else if (bks.length) { setSelectedBook(bks[0]); setSelectedChapter(1); }
                    })
                    .catch(() => { setBooksError(true); setBooksLoading(false); });
                }}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-colors active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Books loading skeleton ── */}
      {booksLoading && !booksError && (
        <div className="flex flex-col items-center justify-center pt-24 gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <span className="text-white/30 text-sm">Loading Scripture…</span>
          <WakingUpHint />
        </div>
      )}
      {/* ── Translation picker bottom sheet ── */}
      {showTranslationPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowTranslationPicker(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-6 mb-4">
              Bible Translation
            </p>

            {/* English */}
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-6 mb-1">English</p>
            {([
              { key: "kjv",    name: "King James Version",   abbr: "KJV"  },
              { key: "geneva", name: "Geneva Bible 1599",    abbr: "GNV"  },
            ] as const).map(({ key, name, abbr }) => (
              <button
                key={key}
                onClick={() => { setTranslation(key); setShowTranslationPicker(false); }}
                className={`w-full flex items-center justify-between px-6 py-3.5 transition-colors ${
                  translation === key ? "bg-violet-500/10" : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-semibold ${translation === key ? "text-violet-300" : "text-white/75"}`}>{name}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{abbr}</p>
                </div>
                {translation === key && (
                  <span className="text-violet-400 text-sm">✓</span>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-white/[0.06] my-2" />

            {/* Spanish */}
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-6 mb-1">Español</p>
            <button
              onClick={() => { setTranslation("rv60"); setShowTranslationPicker(false); }}
              className={`w-full flex items-center justify-between px-6 py-3.5 transition-colors ${
                translation === "rv60" ? "bg-violet-500/10" : "hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-left">
                <p className={`text-sm font-semibold ${translation === "rv60" ? "text-violet-300" : "text-white/75"}`}>Reina Valera 1960</p>
                <p className="text-[10px] text-white/30 mt-0.5">RV60</p>
              </div>
              {translation === "rv60" && (
                <span className="text-violet-400 text-sm">✓</span>
              )}
            </button>

            <div style={{ height: "max(env(safe-area-inset-bottom), 8px)" }} />
          </div>
        </div>
      )}

      {/* ── Minimal sticky header ── */}
      <header className="border-b border-white/[0.06] bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 md:top-14 z-30 print:hidden">
        <div className="max-w-screen-xl mx-auto px-4 h-11 flex items-center gap-1">

          {/* Font size */}
          <button
            onClick={() => { const i = FONT_SIZES.indexOf(fontSize); setFontSize(FONT_SIZES[Math.max(i - 1, 0)]); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors font-bold text-[11px]">
            A-
          </button>
          <button
            onClick={() => { const i = FONT_SIZES.indexOf(fontSize); setFontSize(FONT_SIZES[Math.min(i + 1, FONT_SIZES.length - 1)]); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors font-bold text-sm">
            A+
          </button>

          <div className="flex-1" />

          {/* Highlight toggle */}
          <button
            onClick={() => setHighlightMode((v) => !v)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              highlightMode ? "bg-amber-500/20 text-amber-400" : "text-white/25 hover:text-white/55 hover:bg-white/[0.07]"
            }`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Notes — go to notes page */}
          <a
            href="/notes"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-white/25 hover:text-white/55 hover:bg-white/[0.07]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </a>

          {/* Translation pill — opens picker */}
          <button
            onClick={() => setShowTranslationPicker(true)}
            className="ml-1 px-2.5 py-1 rounded-full border border-white/[0.12] bg-white/[0.04] text-[11px] font-bold text-white/50 hover:border-white/25 hover:text-white/70 transition-colors">
            {translation === "kjv" ? "KJV" : translation === "geneva" ? "GNV" : "RV60"}
          </button>
        </div>

      </header>


      {/* ── Strong's Search tab ── */}
      {activeTab === "search" && (
        <div className="max-w-3xl mx-auto px-4 py-8 pb-40 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white/80 mb-1">Strong&apos;s Concordance</h1>
            <p className="text-sm text-white/35">Search by English keyword, Strong&apos;s number (H430 / G2316), transliteration, or original word</p>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-0.5 gap-0.5 flex-shrink-0">
              {([["", "H+G"], ["H", "Hebrew"], ["G", "Greek"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setSearchLang(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${searchLang === val ? "bg-violet-600 text-white" : "text-white/30 hover:text-white/55"}`}>
                  {label}
                </button>
              ))}
            </div>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. love · H430 · G2316 · agapao"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors" />
            <button onClick={handleSearch} disabled={searching || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.05] disabled:text-white/20 text-white text-sm font-bold transition-colors">
              {searching ? "…" : "Search"}
            </button>
          </div>
          <div className="space-y-3">
            {searchResults.map((entry) => {
              const isH = entry.lang === "Hebrew";
              const border = isH ? "border-amber-500/25 bg-amber-500/[0.05]" : "border-sky-500/25 bg-sky-500/[0.05]";
              const textColor = isH ? "text-amber-300" : "text-sky-300";
              const badge = isH ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-sky-500/20 text-sky-300 border-sky-500/30";
              return (
                <div key={entry.strongs} className={`rounded-xl border ${border} p-4`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${badge} flex-shrink-0`}>{entry.strongs}</span>
                    <span className={`text-2xl font-bold leading-none ${textColor}`} dir={isH ? "rtl" : "ltr"}>{entry.lemma}</span>
                    {entry.xlit && <span className="text-white/40 text-sm italic self-end">{entry.xlit}</span>}
                    {entry.pron && <span className="text-white/25 text-xs self-end">/{entry.pron}/</span>}
                  </div>
                  {entry.definition && <p className={`text-sm font-medium mb-1 ${textColor}`}>{entry.definition}</p>}
                  {entry.fullDefinition && <p className="text-white/45 text-xs leading-relaxed">{entry.fullDefinition}</p>}
                </div>
              );
            })}
            {!searching && searchQuery && searchResults.length === 0 && (
              <p className="text-white/25 text-sm text-center py-8">No results found.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Reader tab ── */}
      {activeTab === "reader" && (
        <div className="max-w-screen-xl mx-auto px-4 py-8 pb-48">

          {/* Chapter hero */}
          {selectedBook && (
            <div className="text-center mb-10">
              <p className="pn-book-name text-sm text-white/25 font-semibold tracking-widest uppercase mb-2">{selectedBook.name}</p>
              <p className="pn-chapter-num text-8xl font-black text-white leading-none mb-3">{selectedChapter}</p>
              <p className="pn-chapter-subtitle text-[11px] text-white/20 tracking-wide">
                {translation === "rv60" ? "Reina Valera 1960" : `${selectedBook.testament === "OT" ? "Hebrew · Aramaic" : "Greek NT"} · ${translation === "geneva" ? "Geneva 1599" : "King James"}`}
              </p>
              {highlightedVerseCount > 0 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {(Object.entries(verseColors) as [string, HighlightColor][]).map(([vn, color]) => (
                    <span key={vn}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: HIGHLIGHT_COLORS[color].dot + "40", color: HIGHLIGHT_COLORS[color].dot }}>
                      v.{vn}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={`grid gap-6 ${strongsEntry || loadingStrongs || (showCommentary && commentary.length > 0) ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1 max-w-2xl mx-auto"}`}>

            {/* ── Verses ── */}
            <div>
              {loadingChapter && (
                <div className="flex items-center gap-3 py-20 justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                  <span className="text-white/30 text-sm">Loading…</span>
                </div>
              )}

              {chapterData && (
                <div
                  className={`leading-loose font-serif ${FONT_SIZE_CLASSES[fontSize]}`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  translate="no"
                >
                  {chapterData.verses.map((verse) => {
                    const color = verseColors[verse.verse];
                    const colorCfg = color ? HIGHLIGHT_COLORS[color] : null;
                    return (
                      <span
                        key={verse.verse}
                        ref={(el) => { if (el) verseRefs.current[verse.verse] = el as unknown as HTMLDivElement; }}
                        className={`relative inline rounded-sm transition-colors ${colorCfg ? colorCfg.bg : ""}`}
                      >
                        <span className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setColorPickerVerse((v) => v === verse.verse ? null : verse.verse);
                            }}
                            className={`text-[11px] font-black align-super mr-[3px] ml-[3px] transition-colors select-none ${
                              colorCfg ? "text-white/60 hover:text-violet-300" : "text-violet-400/50 hover:text-violet-300"
                            }`}
                            title={verseColors[verse.verse] ? "Change or remove highlight" : "Highlight verse"}>
                            {verse.verse}
                          </button>
                          {colorPickerVerse === verse.verse && (
                            <ColorPicker
                              verseNum={verse.verse}
                              current={color}
                              onSelect={(c) => setVerseColor(verse.verse, c)}
                              onClear={() => clearVerseColor(verse.verse)}
                              onClose={() => setColorPickerVerse(null)}
                            />
                          )}
                        </span>
                        <span
                          className="cursor-pointer select-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColorPickerVerse((v) => v === verse.verse ? null : verse.verse);
                          }}
                          title="Tap to highlight this verse"
                        >
                          {verse.text}
                        </span>
                        {" "}
                      </span>
                    );
                  })}
                </div>
              )}

            </div>

            {/* ── Commentary (desktop sidebar only) ── */}
            {(showCommentary && commentary.length > 0) && (
              <div className="hidden lg:block space-y-4 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
                {showCommentary && commentary.length > 0 && (
                  <CommentaryPanel entries={commentary} bookName={selectedBook?.name ?? ""} chapter={selectedChapter} />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Notes bottom sheet ── */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end print:hidden" onClick={() => setShowNotes(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#181818] rounded-t-3xl border-t border-emerald-500/25 flex flex-col overflow-hidden" style={{ maxHeight: "65vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="px-5 py-3 border-b border-emerald-500/15 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400/70">My Notes</p>
                <p className="text-[10px] text-emerald-300/40">{selectedBook?.name} {selectedChapter} · saved locally</p>
              </div>
              <div className="flex items-center gap-3">
                {chapterNote.trim() && (
                  <button
                    onClick={() => { setChapterNote(""); if (selectedBook) localStorage.removeItem(CHAPTER_NOTE_KEY(selectedBook.num, selectedChapter)); }}
                    className="text-[10px] text-white/20 hover:text-red-400/60 font-bold transition-colors">
                    Clear
                  </button>
                )}
                <button onClick={() => setShowNotes(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors text-sm">✕</button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <textarea
                autoFocus
                value={chapterNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={`Notes for ${selectedBook?.name ?? ""} ${selectedChapter}…`}
                rows={8}
                className="w-full bg-transparent text-white/75 text-sm leading-relaxed placeholder-white/15 focus:outline-none resize-none"
              />
            </div>
            <div style={{ height: "max(env(safe-area-inset-bottom), 12px)" }} />
          </div>
        </div>
      )}


      {/* ── Floating search button (above reader bar, left) ── */}
      {activeTab === "reader" && (
        <div className="fixed bottom-[136px] left-4 z-40 print:hidden">
          {showNavSearch ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNavSearch(navQuery); }}
              className="flex items-center gap-1.5 bg-[#1c1c1e]/95 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-2xl px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/40 flex-shrink-0">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <input autoFocus type="text" value={navQuery} onChange={(e) => setNavQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setShowNavSearch(false); setNavQuery(""); } }}
                placeholder="John 3, Rom 8…"
                className="bg-transparent text-xs text-white/80 placeholder:text-white/30 focus:outline-none w-32" />
              <button type="submit" className="text-[10px] px-2 py-1 rounded-lg bg-violet-600 text-white font-bold">Go</button>
              <button type="button" onClick={() => { setShowNavSearch(false); setNavQuery(""); }} className="text-white/30 hover:text-white/60 text-sm">✕</button>
            </form>
          ) : (
            <button
              onClick={() => setShowNavSearch(true)}
              className="w-11 h-11 rounded-2xl bg-[#1c1c1e]/95 backdrop-blur-md border border-white/[0.08] shadow-2xl flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Floating reader bar ── */}
      {activeTab === "reader" && (
        <div className="fixed bottom-[64px] left-0 right-0 z-40 px-4 print:hidden">
          <div className="le-chapter-nav bg-[#1c1c1e]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/[0.08] flex items-center h-14 px-2 gap-1">

            {/* Prev chapter */}
            <button
              onClick={goPrev}
              className="le-nav-arrow w-11 h-11 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Book + chapter — opens picker */}
            <button
              onClick={() => { setPickerView("books"); setPickerBook(selectedBook); setShowBookPicker(true); }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-xl hover:bg-white/[0.05] transition-colors">
              <span className="le-testament-label text-[10px] font-semibold text-white/25 tracking-widest uppercase leading-none">
                {selectedBook?.testament === "OT" ? "Old Testament" : "New Testament"}
              </span>
              <span className="text-white font-bold text-sm leading-none mt-1">
                {selectedBook?.name} · {selectedChapter}
              </span>
            </button>

            {/* Commentary toggle */}
            {hasMhc && (
              <button
                onClick={() => setShowCommentary((s) => !s)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  showCommentary ? "bg-violet-500/20 text-violet-400" : "text-white/25 hover:text-white/55 hover:bg-white/[0.07]"
                }`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                  <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            {/* Next chapter */}
            <button
              onClick={goNext}
              className="le-nav-arrow w-11 h-11 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Book / Chapter picker sheet ── */}
      {showBookPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end print:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookPicker(false)} />
          <div className="relative bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] max-h-[78vh] flex flex-col">

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Books view */}
            {pickerView === "books" && (
              <>
                <div className="px-4 py-2 flex gap-2 flex-shrink-0">
                  {(["ALL", "OT", "NT"] as const).map((tf) => (
                    <button key={tf} onClick={() => setTestamentFilter(tf)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        testamentFilter === tf ? "bg-violet-600 text-white" : "bg-white/[0.06] text-white/40 hover:text-white/60"
                      }`}>
                      {tf === "ALL" ? "All Books" : tf === "OT" ? "Old Testament" : "New Testament"}
                    </button>
                  ))}
                </div>
                <div className="overflow-y-auto flex-1 pb-10 px-4">
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {visibleBooks.map((b) => (
                      <button key={b.num}
                        onClick={() => { setPickerBook(b); setPickerView("chapters"); }}
                        className={`px-4 py-3 rounded-xl text-left transition-colors ${
                          selectedBook?.num === b.num
                            ? "bg-violet-600/20 border border-violet-500/30 text-white"
                            : "bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.08] hover:text-white/80"
                        }`}>
                        <p className="text-sm font-semibold truncate">{b.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{b.chapters} ch.</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Chapters view */}
            {pickerView === "chapters" && pickerBook && (
              <>
                <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0 border-b border-white/[0.06]">
                  <button
                    onClick={() => setPickerView("books")}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div>
                    <p className="text-white font-bold">{pickerBook.name}</p>
                    <p className="text-white/30 text-xs">{pickerBook.chapters} chapters</p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 pb-10 p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: pickerBook.chapters }, (_, i) => i + 1).map((ch) => (
                      <button key={ch}
                        onClick={() => {
                          setSelectedBook(pickerBook);
                          setSelectedChapter(ch);
                          setShowBookPicker(false);
                          setPickerView("books");
                        }}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          selectedBook?.num === pickerBook.num && selectedChapter === ch
                            ? "bg-violet-600 text-white"
                            : "bg-white/[0.05] text-white/50 hover:bg-white/[0.10] hover:text-white"
                        }`}>
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Remove highlight confirmation */}
      {pendingRemoveWord && (
        <RemoveHighlightBubble
          x={pendingRemoveWord.x}
          y={pendingRemoveWord.y}
          onConfirm={() => {
            setHighlights((prev) => {
              const next = new Set(prev);
              next.delete(pendingRemoveWord.word);
              return next;
            });
            setPendingRemoveWord(null);
          }}
          onDismiss={() => setPendingRemoveWord(null)}
        />
      )}
    </div>
  );
}
