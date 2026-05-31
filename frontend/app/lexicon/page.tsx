"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "../lib/useTheme";
import { useLanguage } from "../lib/useLanguage";
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

type BibleTranslation = "kjv" | "geneva" | "nkjv" | "esv" | "nasb" | "niv" | "lsb" | "rv1960" | "ntv" | "nvi" | "lbla";
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";
const FONT_SIZES: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm:   "text-sm",
  base: "text-base",
  lg:   "text-lg",
  xl:   "text-xl",
  "2xl":"text-2xl",
};

type ScriptureFont = "georgia" | "palatino" | "modern" | "typewriter" | "baskerville";
const SCRIPTURE_FONTS: { key: ScriptureFont; label: string; family: string; desc: string }[] = [
  { key: "georgia",     label: "Georgia",     family: "'Georgia', 'Times New Roman', serif",                          desc: "Classic & warm" },
  { key: "baskerville", label: "Baskerville", family: "Baskerville, 'Baskerville Old Face', 'Book Antiqua', serif",  desc: "Sharp & elegant" },
  { key: "palatino",    label: "Palatino",    family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",         desc: "Calligraphic" },
  { key: "modern",      label: "Modern",      family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",    desc: "Clean sans-serif" },
  { key: "typewriter",  label: "Typewriter",  family: "'Courier New', Courier, 'Lucida Console', monospace",          desc: "Vintage & faithful" },
];
const SCRIPTURE_FONT_KEY = "ryc-scripture-font";

const VERSE_COLOR_KEY  = (book: number, ch: number) => `ryc-vcolor-${book}-${ch}`;
const CHAPTER_NOTE_KEY = (book: number, ch: number) => `ryc-chapter-note-${book}-${ch}`;
const LAST_POSITION_KEY = "ryc-last-position";

// ─── Bible highlight sync (Collections) ──────────────────────────────────────
// Mirrors verse highlights into the shared axiom-hl-* format so Collections
// can display them with full verse text, reference, and a link back to Scripture.
const BIBLE_HL_KEY = (bookName: string, chapter: number) =>
  `axiom-hl-bible-${bookName.toLowerCase().replace(/\s+/g, "-")}-${chapter}`;

function saveBibleHighlight(
  bookName: string, bookNum: number, chapter: number,
  verseNum: number, verseText: string, color: HighlightColor,
) {
  const key = BIBLE_HL_KEY(bookName, chapter);
  let arr: { id: string; text: string; color: string; createdAt: number }[] = [];
  try { arr = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { /* */ }
  const id = `bible-${bookNum}-${chapter}-${verseNum}`;
  const filtered = arr.filter((h) => h.id !== id);
  filtered.push({ id, text: verseText, color, createdAt: Date.now() });
  localStorage.setItem(key, JSON.stringify(filtered));
}

function removeBibleHighlight(bookName: string, bookNum: number, chapter: number, verseNum: number) {
  const key = BIBLE_HL_KEY(bookName, chapter);
  let arr: { id: string }[] = [];
  try { arr = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { /* */ }
  const id = `bible-${bookNum}-${chapter}-${verseNum}`;
  const filtered = arr.filter((h) => h.id !== id);
  if (filtered.length === 0) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(filtered));
}

// Spanish book names (book.num 1–66 → localized name)
const ES_BOOK_NAMES: Record<number, string> = {
  1:"Génesis",2:"Éxodo",3:"Levítico",4:"Números",5:"Deuteronomio",
  6:"Josué",7:"Jueces",8:"Rut",9:"1 Samuel",10:"2 Samuel",
  11:"1 Reyes",12:"2 Reyes",13:"1 Crónicas",14:"2 Crónicas",15:"Esdras",
  16:"Nehemías",17:"Ester",18:"Job",19:"Salmos",20:"Proverbios",
  21:"Eclesiastés",22:"Cantares",23:"Isaías",24:"Jeremías",25:"Lamentaciones",
  26:"Ezequiel",27:"Daniel",28:"Oseas",29:"Joel",30:"Amós",
  31:"Abdías",32:"Jonás",33:"Miqueas",34:"Nahúm",35:"Habacuc",
  36:"Sofonías",37:"Hageo",38:"Zacarías",39:"Malaquías",40:"Mateo",
  41:"Marcos",42:"Lucas",43:"Juan",44:"Hechos",45:"Romanos",
  46:"1 Corintios",47:"2 Corintios",48:"Gálatas",49:"Efesios",50:"Filipenses",
  51:"Colosenses",52:"1 Tesalonicenses",53:"2 Tesalonicenses",54:"1 Timoteo",55:"2 Timoteo",
  56:"Tito",57:"Filemón",58:"Hebreos",59:"Santiago",60:"1 Pedro",
  61:"2 Pedro",62:"1 Juan",63:"2 Juan",64:"3 Juan",65:"Judas",
  66:"Apocalipsis",
};
const SPANISH_TRANSLATIONS: BibleTranslation[] = ["rv1960","nvi","ntv","lbla"];
const TRANSLATION_OPTIONS = [
  { key: "esv",    group: "en", name: "English Standard Version",       abbr: "ESV",  note: "Recommended", detail: "Clear modern English" },
  { key: "kjv",    group: "en", name: "King James Version",             abbr: "KJV",  note: "1611",        detail: "Classic traditional text" },
  { key: "nkjv",   group: "en", name: "New King James Version",         abbr: "NKJV", note: "",            detail: "Traditional style, modernized" },
  { key: "nasb",   group: "en", name: "New American Standard Bible",    abbr: "NASB", note: "",            detail: "Formal English translation" },
  { key: "niv",    group: "en", name: "New International Version",      abbr: "NIV",  note: "",            detail: "Readable contemporary English" },
  { key: "lsb",    group: "en", name: "Legacy Standard Bible",          abbr: "LSB",  note: "",            detail: "Formal and precise" },
  { key: "geneva", group: "en", name: "Geneva Bible 1599",              abbr: "GNV",  note: "Historic",    detail: "Reformation-era English" },
  { key: "lbla",   group: "es", name: "La Biblia de las Américas",      abbr: "LBLA", note: "Recommended", detail: "Formal Spanish translation" },
  { key: "rv1960", group: "es", name: "Reina-Valera 1960",              abbr: "RV60", note: "Clásica",     detail: "Traditional Spanish text" },
  { key: "nvi",    group: "es", name: "Nueva Versión Internacional",    abbr: "NVI",  note: "",            detail: "Readable contemporary Spanish" },
  { key: "ntv",    group: "es", name: "Nueva Traducción Viviente",      abbr: "NTV",  note: "",            detail: "Natural modern Spanish" },
] as const satisfies ReadonlyArray<{
  key: BibleTranslation;
  group: "en" | "es";
  name: string;
  abbr: string;
  note: string;
  detail: string;
}>;
const TRANSLATION_GROUPS = [
  {
    id: "en",
    label: "English",
    eyebrow: "EN",
    caption: "English editions",
    options: TRANSLATION_OPTIONS.filter((option) => option.group === "en"),
  },
  {
    id: "es",
    label: "Spanish",
    eyebrow: "ES",
    caption: "Spanish editions",
    options: TRANSLATION_OPTIONS.filter((option) => option.group === "es"),
  },
] as const;
function getTranslationMeta(t: BibleTranslation) {
  return TRANSLATION_OPTIONS.find((option) => option.key === t) ?? TRANSLATION_OPTIONS[0];
}
function getBookDisplayName(book: BookMeta | null, t: BibleTranslation): string {
  if (!book) return "";
  if (SPANISH_TRANSLATIONS.includes(t)) return ES_BOOK_NAMES[book.num] ?? book.name;
  return book.name;
}

function saveLastPosition(bookName: string, chapter: number) {
  try { localStorage.setItem(LAST_POSITION_KEY, JSON.stringify({ bookName, chapter })); } catch {}
}
function loadLastPosition(): { bookName: string; chapter: number } | null {
  try {
    const raw = localStorage.getItem(LAST_POSITION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const HIGHLIGHT_COLORS = {
  purple: { dot: "#7546e3", label: "Purple",     bgRgb: "117,70,227",  textColor: "#fff" },
  yellow: { dot: "#f2f06d", label: "Yellow",     bgRgb: "242,240,109", textColor: "#000" },
  red:    { dot: "#e34646", label: "Red",        bgRgb: "227,70,70",   textColor: "#fff" },
  blue:   { dot: "#46d3e3", label: "Blue",       bgRgb: "70,211,227",  textColor: "#000" },
  lime:   { dot: "#a9f558", label: "Lime Green", bgRgb: "169,245,88",  textColor: "#000" },
  pink:   { dot: "#f558f2", label: "Pink",       bgRgb: "245,88,242",  textColor: "#000" },
} as const;
type HighlightColor = keyof typeof HIGHLIGHT_COLORS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPunctuation(w: string) {
  return /^[.,;:!?()\[\]"'—–\-]+$/.test(w);
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

// ─── Verse Highlight Popover ──────────────────────────────────────────────────
// Appears near the tap point. Three modes:
//   "pick"           — verse not highlighted yet → show color swatches
//   "edit"           — verse already highlighted → show swatches + Remove button
//   "confirm-remove" — user pressed Remove → show confirmation prompt

type VHMode = "pick" | "edit" | "confirm-remove";

interface VersePopoverState {
  verseNum: number;
  x: number; // viewport x of tap
  y: number; // viewport y of tap
  mode: VHMode;
}

function VerseHighlightPopover({
  state,
  current,
  onSelect,
  onRequestConfirm,
  onRemove,
  onClose,
}: {
  state: VersePopoverState;
  current: HighlightColor | undefined;
  onSelect: (color: HighlightColor) => void;
  onRequestConfirm: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, [onClose]);

  const W = 232;
  const estimatedH = state.mode === "confirm-remove" ? 104 : 88;
  const vx = Math.max(W / 2 + 8, Math.min(state.x, window.innerWidth - W / 2 - 8));
  const rawTop = state.y - estimatedH - 14;
  const top = rawTop < 8 ? state.y + 14 : rawTop;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div
        ref={ref}
        className="fixed z-50 bg-[#1a1a1a] border border-white/[0.12] rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
        style={{ width: W, left: vx - W / 2, top }}
        onClick={(e) => e.stopPropagation()}
      >
        {state.mode !== "confirm-remove" ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                {state.mode === "pick" ? `Highlight v.​${state.verseNum}` : `v.​${state.verseNum} · change color`}
              </p>
              <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors text-sm leading-none">✕</button>
            </div>
            <div className="flex gap-2 justify-center">
              {(Object.entries(HIGHLIGHT_COLORS) as [HighlightColor, typeof HIGHLIGHT_COLORS[HighlightColor]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { onSelect(key); onClose(); }}
                  title={val.label}
                  className={`w-9 h-9 rounded-full transition-transform hover:scale-110 active:scale-95 border-2 ${current === key ? "border-white/60 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: val.dot }}
                />
              ))}
            </div>
            {state.mode === "edit" && (
              <button
                onClick={onRequestConfirm}
                className="text-[11px] text-white/25 hover:text-red-400/70 font-bold text-center transition-colors pt-0.5"
              >
                Remove highlight
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-white/60 text-center leading-snug px-1">
              Remove highlight from verse {state.verseNum}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onRemove(); onClose(); }}
                className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
              >
                Remove
              </button>
            </div>
          </>
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
  const { theme } = useTheme();
  const isLight = theme === "light-elegant";
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const [books, setBooks]       = useState<BookMeta[]>([]);
  const [hasStrongs, setHasStrongs] = useState(false);
  const [hasMhc, setHasMhc]     = useState(false);
  const [booksError, setBooksError] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);

  const [selectedBook, setSelectedBook]       = useState<BookMeta | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterData, setChapterData]         = useState<ChapterData | null>(null);
  const [chapterError, setChapterError]       = useState<string | null>(null);
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

  const [translation, setTranslation]         = useState<BibleTranslation>(() => {
    try {
      const saved = localStorage.getItem("ryc-translation");
      const valid: BibleTranslation[] = TRANSLATION_OPTIONS.map((option) => option.key);
      if (saved && valid.includes(saved as BibleTranslation)) return saved as BibleTranslation;
      // No explicit translation chosen — pick the appropriate default for the current language.
      // English → ESV, Spanish → LBLA
      const storedLang = localStorage.getItem("ryc-lang");
      return storedLang === "es" ? "lbla" : "esv";
    } catch {}
    return "esv";
  });
  // Auto-switch translation when the UI language changes (without a full page reload).
  // Crossing the language boundary: en → Spanish defaults to LBLA; es → English defaults to ESV.
  // Within-group selections are preserved (e.g. user picked RV60 stays on RV60 while in Spanish).
  useEffect(() => {
    const isSpanishTrans = SPANISH_TRANSLATIONS.includes(translation);
    if (lang === "es" && !isSpanishTrans) {
      setTranslation("lbla");
    } else if (lang === "en" && isSpanishTrans) {
      setTranslation("esv");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const [fontSize, setFontSize]               = useState<FontSize>("lg");
  const [scriptureFont, setScriptureFont]     = useState<ScriptureFont>(() => {
    try { const s = localStorage.getItem(SCRIPTURE_FONT_KEY) as ScriptureFont; return SCRIPTURE_FONTS.some(f => f.key === s) ? s : "georgia"; } catch { return "georgia"; }
  });
  const [showFontPicker, setShowFontPicker]   = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  function selectFont(f: ScriptureFont) {
    setScriptureFont(f);
    try { localStorage.setItem(SCRIPTURE_FONT_KEY, f); } catch {}
    setShowFontPicker(false);
  }
  const activeFontFamily = SCRIPTURE_FONTS.find(f => f.key === scriptureFont)?.family ?? "'Georgia', serif";

  // Translation picker sheet
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<"en" | "es">("en");

  // Navigation search (type "Romans 3")
  const [showNavSearch, setShowNavSearch]   = useState(false);
  const [navQuery,      setNavQuery]        = useState("");

  // Verse highlight popover (tap-to-highlight whole verse)
  const [versePopover, setVersePopover] = useState<VersePopoverState | null>(null);

  // Verse color highlights (tap-to-highlight whole verse)
  const [verseColors, setVerseColors] = useState<Record<number, HighlightColor>>({});

  // Chapter notes
  const [chapterNote, setChapterNote] = useState("");
  const [showNotes, setShowNotes]     = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [pickerView, setPickerView]         = useState<"books" | "chapters">("books");
  const [pickerBook, setPickerBook]         = useState<BookMeta | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
    // Mirror to axiom-hl-* format for Collections sync
    const book = selectedBook;
    const verse = chapterData?.verses.find((v) => v.verse === verseNum);
    if (book && verse) {
      saveBibleHighlight(book.name, book.num, selectedChapter, verseNum, verse.text, color);
    }
  }, [selectedBook, selectedChapter, chapterData]);

  const clearVerseColor = useCallback((verseNum: number) => {
    setVerseColors((prev) => {
      const next = { ...prev };
      delete next[verseNum];
      return next;
    });
    // Remove from axiom-hl-* format for Collections sync
    const book = selectedBook;
    if (book) removeBibleHighlight(book.name, book.num, selectedChapter, verseNum);
  }, [selectedBook, selectedChapter]);

  // ── Tap-to-highlight handler ──────────────────────────────────────────────
  const handleVerseClick = useCallback((verseNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isHighlighted = verseNum in verseColors;
    setVersePopover({
      verseNum,
      x: e.clientX,
      y: e.clientY,
      mode: isHighlighted ? "edit" : "pick",
    });
  }, [verseColors]);

  // ── Chapter notes load/save ───────────────────────────────────────────────
  const selectedBookRef    = useRef(selectedBook);
  const selectedChapterRef = useRef(selectedChapter);
  const fetchIdRef         = useRef(0);
  useEffect(() => { selectedBookRef.current = selectedBook; }, [selectedBook]);
  useEffect(() => { selectedChapterRef.current = selectedChapter; }, [selectedChapter]);

  // Save last reading position whenever book or chapter changes
  useEffect(() => {
    if (selectedBook) saveLastPosition(selectedBook.name, selectedChapter);
  }, [selectedBook, selectedChapter]);

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
    // Match: BookName Chapter[:Verse] — e.g. "Romans 3", "Hechos 1", "Juan 3:16"
    const match = trimmed.match(/^(.+?)\s+(\d+)(?::\d+)?$/);
    if (!match) return;
    const [, rawBook, chStr] = match;
    const bookQuery = rawBook.toLowerCase().trim();
    const ch = parseInt(chStr, 10);

    // Spanish → English name aliases
    const ES_TO_EN: Record<string, string> = {
      genesis: "genesis", exodo: "exodus", éxodo: "exodus", levitico: "leviticus",
      levítico: "leviticus", numeros: "numbers", números: "numbers",
      deuteronomio: "deuteronomy", josue: "joshua", josué: "joshua",
      jueces: "judges", rut: "ruth", samuel: "samuel", reyes: "kings",
      cronicas: "chronicles", crónicas: "chronicles", esdras: "ezra",
      nehemias: "nehemiah", nehemías: "nehemiah", ester: "esther", job: "job",
      salmos: "psalms", salmo: "psalms", proverbios: "proverbs",
      eclesiastes: "ecclesiastes", eclesiastés: "ecclesiastes",
      cantares: "song of solomon", cantar: "song of solomon",
      isaias: "isaiah", isaías: "isaiah", jeremias: "jeremiah", jeremías: "jeremiah",
      lamentaciones: "lamentations", ezequiel: "ezekiel", daniel: "daniel",
      oseas: "hosea", joel: "joel", amos: "amos", amós: "amos",
      abdias: "obadiah", abdías: "obadiah", jonas: "jonah", jonás: "jonah",
      miqueas: "micah", nahum: "nahum", habacuc: "habakkuk", sofonias: "zephaniah",
      sofonías: "zephaniah", hageo: "haggai", zacarias: "zechariah",
      zacarías: "zechariah", malaquias: "malachi", malaquías: "malachi",
      mateo: "matthew", marcos: "mark", lucas: "luke", juan: "john",
      hechos: "acts", romanos: "romans", corintios: "corinthians",
      galatas: "galatians", gálatas: "galatians", efesios: "ephesians",
      filipenses: "philippians", colosenses: "colossians", tesalonicenses: "thessalonians",
      timoteo: "timothy", tito: "titus", filemon: "philemon", filemón: "philemon",
      hebreos: "hebrews", santiago: "james", pedro: "peter",
      judas: "jude", apocalipsis: "revelation",
    };

    // Normalize: strip leading number (e.g. "1 corintios" → prefix "1 " + "corintios")
    const numPrefixMatch = bookQuery.match(/^(\d)\s*(.+)$/);
    let resolvedQuery = bookQuery;
    if (numPrefixMatch) {
      const [, num, rest] = numPrefixMatch;
      const enBase = ES_TO_EN[rest] ?? rest;
      resolvedQuery = `${num} ${enBase}`;
    } else {
      resolvedQuery = ES_TO_EN[bookQuery] ?? bookQuery;
    }

    const found = books.find(
      (b) => {
        const bLow = b.name.toLowerCase();
        const bNoSpace = bLow.replace(/\s+/g, "");
        const qNoSpace = resolvedQuery.replace(/\s+/g, "");
        return bLow === resolvedQuery || bLow.startsWith(resolvedQuery) || bNoSpace.startsWith(qNoSpace);
      }
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

        // Restore last reading position from localStorage, fall back to John 3
        const saved = loadLastPosition();
        const restored = saved ? bks.find((b) => b.name === saved.bookName) : null;
        if (restored) {
          setSelectedBook(restored);
          setSelectedChapter(Math.max(1, Math.min(saved!.chapter, restored.chapters)));
        } else {
          const john = bks.find((b) => b.name === "John");
          if (john) { setSelectedBook(john); setSelectedChapter(3); }
          else if (bks.length) { setSelectedBook(bks[0]); setSelectedChapter(1); }
        }
      })
      .catch(() => { setBooksError(true); setBooksLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedBook) return;
    const fetchId = ++fetchIdRef.current;
    setLoadingChapter(true);
    setChapterData(null);
    setChapterError(null);
    setCommentary([]);
    setActiveToken(null);
    setStrongsEntry(null);
    setVersePopover(null);

    const chFetch  = fetchChapter(selectedBook.num, selectedChapter, translation);
    const mhcFetch = hasMhc
      ? fetchCommentary(selectedBook.num, selectedChapter).catch(() => [] as CommentaryEntry[])
      : Promise.resolve([] as CommentaryEntry[]);

    Promise.allSettled([chFetch, mhcFetch]).then(([chRes, mhcRes]) => {
      if (fetchId !== fetchIdRef.current) return; // stale fetch — discard
      if (chRes.status === "fulfilled") {
        setChapterData(chRes.value);
        setChapterError(null);
      } else {
        const msg = chRes.reason instanceof Error ? chRes.reason.message : String(chRes.reason);
        setChapterError(`Could not load chapter. ${msg}`);
      }
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
      if (e.key === "ArrowRight") {
        if (selectedBook && selectedChapter < selectedBook.chapters) setSelectedChapter((c) => c + 1);
      }
      if (e.key === "ArrowLeft") {
        if (selectedChapter > 1) setSelectedChapter((c) => c - 1);
      }
      if (e.key === "Escape") setVersePopover(null);
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
  const currentTranslation = getTranslationMeta(translation);
  const openTranslationPicker = () => {
    setPickerCategory(currentTranslation.group);
    setShowTranslationPicker(true);
  };
  const selectTranslation = (next: BibleTranslation) => {
    setTranslation(next);
    try { localStorage.setItem("ryc-translation", next); } catch {}
    setShowTranslationPicker(false);
  };

  // ── Presentation mode ─────────────────────────────────────────────────────
  if (presentationMode) {
    const translLabel = currentTranslation.name;
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
                  <p className="text-2xl md:text-3xl leading-relaxed text-white/85" style={{ fontFamily: activeFontFamily }}>
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
      onClick={() => setVersePopover(null)}
    >
      {/* ── Books error banner ── */}
      {booksError && (
        <div className="max-w-screen-xl mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] px-5 py-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-300/90 mb-1">Couldn&apos;t connect to the Bible server</p>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 print:hidden" onClick={() => setShowTranslationPicker(false)}>
          <div className="translation-picker-scrim absolute inset-0" />
          <div
            className="translation-picker-panel relative w-full max-w-sm overflow-hidden rounded-[28px]"
            style={{ maxHeight: "min(82vh, 680px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="translation-picker-header px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="translation-picker-kicker">Bible Translation</p>
                  <h2 className="translation-picker-title mt-1">Choose an edition</h2>
                  <p className="translation-picker-subtitle mt-1">Text-only selector, grouped by language.</p>
                </div>
                <button
                  onClick={() => setShowTranslationPicker(false)}
                  className="translation-picker-close"
                  aria-label="Close translation picker"
                >
                  Close
                </button>
              </div>

              <div className="translation-picker-current mt-4">
                <span className="translation-picker-current-abbr">{currentTranslation.abbr}</span>
                <div className="min-w-0 flex-1">
                  <p className="translation-picker-current-label">Current selection</p>
                  <p className="translation-picker-current-name truncate">{currentTranslation.name}</p>
                </div>
              </div>
            </div>

            <div className="translation-picker-scroll overflow-y-auto px-3 pb-3">
              {/* ── Language selector — pill toggle ── */}
              <div
                className="flex p-1 mb-4 rounded-2xl"
                style={{ background: "var(--tp-bg-soft)", border: "1px solid var(--tp-line)" }}
              >
                {TRANSLATION_GROUPS.map((group) => {
                  const active = pickerCategory === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setPickerCategory(group.id)}
                      className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-xl transition-all"
                      style={{
                        background: active ? "var(--tp-accent-bg)" : "transparent",
                        border: active ? "1px solid color-mix(in srgb, var(--tp-accent) 35%, transparent)" : "1px solid transparent",
                        color: active ? "var(--tp-accent-strong)" : "var(--tp-muted)",
                      }}
                    >
                      <span style={{ fontWeight: 900, fontSize: "15px", letterSpacing: "-0.01em" }}>
                        {group.label}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 700, opacity: active ? 0.7 : 0.45 }}>
                        {group.options.length} {group.id === "en" ? "versions" : "translations"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Translations for selected language ── */}
              <div className="space-y-1.5">
                {TRANSLATION_GROUPS.find((g) => g.id === pickerCategory)?.options.map((option) => {
                  const active = translation === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => selectTranslation(option.key)}
                      className={`translation-picker-option ${active ? "is-selected" : ""}`}
                    >
                      <span className="translation-picker-option-abbr">{option.abbr}</span>
                      <span className="min-w-0 flex-1">
                        <span className="translation-picker-option-name">{option.name}</span>
                        <span className="translation-picker-option-detail">
                          {option.note ? `${option.note} · ${option.detail}` : option.detail}
                        </span>
                      </span>
                      {active && <span className="translation-picker-selected">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: "max(env(safe-area-inset-bottom), 8px)" }} className="translation-picker-safe-area" />
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

          {/* Font family picker */}
          <button
            onClick={() => setShowFontPicker((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-white/30 hover:text-white/60 hover:bg-white/[0.07] font-bold text-[13px]"
            title="Change scripture font">
            Ff
          </button>

          {/* Translation pill — opens picker */}
          <button
            onClick={openTranslationPicker}
            className="ml-1 px-2.5 py-1 rounded-full border border-white/[0.12] bg-white/[0.04] text-[11px] font-bold text-white/50 hover:border-white/25 hover:text-white/70 transition-colors">
            {currentTranslation.abbr}
          </button>
        </div>

      </header>

      {/* ── Font picker sheet ── */}
      {showFontPicker && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 print:hidden" onClick={() => setShowFontPicker(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/[0.08] px-5 pb-6 pt-5 w-full max-w-sm overflow-y-auto" style={{ maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Scripture Font</p>
            <div className="space-y-2">
              {SCRIPTURE_FONTS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => selectFont(f.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    scriptureFont === f.key
                      ? "border-violet-500/40 bg-violet-500/10"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: scriptureFont === f.key ? "#c4b5fd" : "rgba(255,255,255,0.7)", fontFamily: f.family }}>
                      {f.label} — In the beginning was the Word
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">{f.desc}</p>
                  </div>
                  {scriptureFont === f.key && <span className="text-violet-400 text-xs flex-shrink-0 ml-2">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


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
              <p className="pn-book-name text-sm text-white/25 font-semibold tracking-widest uppercase mb-2">{getBookDisplayName(selectedBook, translation)}</p>
              <p className="pn-chapter-num text-8xl font-black text-white leading-none mb-3">{selectedChapter}</p>
              <p className="pn-chapter-subtitle text-[11px] text-white/20 tracking-wide">
                {translation === "rv1960" ? "Reina-Valera 1960" : translation === "nvi" ? "Nueva Versión Internacional" : translation === "ntv" ? "Nueva Traducción Viviente" : translation === "lbla" ? "La Biblia de las Américas" : translation === "nkjv" ? "New King James Version" : translation === "esv" ? "English Standard Version" : translation === "nasb" ? "New American Standard" : translation === "niv" ? "New International Version" : translation === "lsb" ? "Legacy Standard Bible" : `${selectedBook.testament === "OT" ? "Hebrew · Aramaic" : "Greek NT"} · ${translation === "geneva" ? "Geneva 1599" : "King James"}`}
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

              {chapterError && !loadingChapter && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
                  <span className="text-3xl">⚠️</span>
                  <p className="text-white/50 text-sm">{chapterError}</p>
                  <button
                    onClick={() => { setChapterError(null); setLoadingChapter(true); fetchChapter(selectedBook!.num, selectedChapter, translation).then((d) => { setChapterData(d); setChapterError(null); }).catch((e) => setChapterError(e.message ?? "Failed to load")).finally(() => setLoadingChapter(false)); }}
                    className="text-xs font-bold px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {chapterData && (
                <div
                  className={`leading-loose ${FONT_SIZE_CLASSES[fontSize]}`}
                  style={{ fontFamily: activeFontFamily }}
                  translate="no"
                >
                  {chapterData.verses.map((verse) => {
                    const color = verseColors[verse.verse];
                    const colorCfg = color ? HIGHLIGHT_COLORS[color] : null;
                    return (
                      <span
                        key={verse.verse}
                        ref={(el) => { if (el) verseRefs.current[verse.verse] = el as unknown as HTMLDivElement; }}
                        className="relative inline cursor-pointer"
                        style={colorCfg ? {
                          backgroundColor: `rgba(${colorCfg.bgRgb},0.78)`,
                          color: colorCfg.textColor,
                          borderRadius: "4px",
                          padding: "2px 4px",
                          boxDecorationBreak: "clone",
                          WebkitBoxDecorationBreak: "clone",
                        } : undefined}
                        onClick={(e) => handleVerseClick(verse.verse, e)}
                        title={color ? "Tap to change or remove highlight" : "Tap to highlight this verse"}
                      >
                        <span
                          className="text-[11px] font-black align-super mr-[3px] ml-[3px] select-none"
                          style={colorCfg ? {
                            backgroundColor: `rgba(0,0,0,0.25)`,
                            borderRadius: "3px",
                            padding: "0 3px",
                            color: "rgba(255,255,255,0.9)",
                          } : { color: "rgba(167,139,250,0.5)" }}
                        >
                          {verse.verse}
                        </span>
                        {verse.text}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 print:hidden" onClick={() => setShowNotes(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#181818] rounded-2xl border border-emerald-500/25 flex flex-col overflow-hidden w-full max-w-sm" style={{ maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
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
        <div className="fixed left-4 z-40 print:hidden"
          style={{ bottom: "calc(48px + max(env(safe-area-inset-bottom), 8px) + 80px)" }}>
          {showNavSearch ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNavSearch(navQuery); }}
              className="flex items-center gap-1.5 bg-[#1c1c1e]/95 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-2xl px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/40 flex-shrink-0">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <input autoFocus type="text" value={navQuery} onChange={(e) => setNavQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setShowNavSearch(false); setNavQuery(""); } }}
                placeholder="John 3 · Hechos 1 · Rom 8…"
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
        <div className="fixed left-0 right-0 z-40 px-4 print:hidden"
          style={{ bottom: "calc(48px + max(env(safe-area-inset-bottom), 8px) + 8px)" }}>
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
                {(translation === "rv1960" || translation === "lbla" || translation === "nvi" || translation === "ntv")
                  ? (selectedBook?.testament === "OT" ? "Antiguo Testamento" : "Nuevo Testamento")
                  : (selectedBook?.testament === "OT" ? "Old Testament" : "New Testament")}
              </span>
              <span className="text-white font-bold text-sm leading-none mt-1">
                {getBookDisplayName(selectedBook, translation)} · {selectedChapter}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 print:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookPicker(false)} />
          <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/[0.08] w-full max-w-sm flex flex-col" style={{ maxHeight: "82vh" }}>

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

      {/* Verse highlight popover */}
      {versePopover && (
        <VerseHighlightPopover
          state={versePopover}
          current={verseColors[versePopover.verseNum]}
          onSelect={(c) => setVerseColor(versePopover.verseNum, c)}
          onRequestConfirm={() =>
            setVersePopover((p) => p ? { ...p, mode: "confirm-remove" } : null)
          }
          onRemove={() => clearVerseColor(versePopover.verseNum)}
          onClose={() => setVersePopover(null)}
        />
      )}
    </div>
  );
}
