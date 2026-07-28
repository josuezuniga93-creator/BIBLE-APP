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
} from "../lib/types";
import {
  fetchBooks,
  fetchChapter,
  fetchStrongs,
  searchStrongs,
} from "../lib/api";

import { exportVerseAsQuoteImage, BG_OPTIONS } from "../lib/verseQuoteExport";
import CreateImageEditor from "../components/CreateImageEditor";
import { recordScriptureShareForBadges } from "../lib/badges";
import BookmarkPopup from "../components/BookmarkPopup";
import {
  getScriptureVerseColors,
  mirrorScriptureHighlight,
  removeMirroredScriptureHighlight,
} from "../lib/unifiedHighlights";
import { UiIcon } from "../components/UiIcon";

// ─── Constants ────────────────────────────────────────────────────────────────

type BibleTranslation = "kjv" | "geneva" | "nkjv" | "esv" | "csb" | "nasb" | "niv" | "lsb" | "rv1960" | "ntv" | "nvi" | "lbla";
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
const FONT_SIZES: FontSize[] = ["sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm:   "text-base",
  base: "text-lg",
  lg:   "text-xl",
  xl:   "text-2xl",
  "2xl":"text-[30px]",
  "3xl":"text-[34px]",
  "4xl":"text-[38px]",
  "5xl":"text-[42px]",
  "6xl":"text-[46px]",
};
const FONT_SIZE_LEADING_CLASSES: Record<FontSize, string> = {
  sm:   "leading-[1.82]",
  base: "leading-[1.8]",
  lg:   "leading-[1.76]",
  xl:   "leading-[1.68]",
  "2xl":"leading-[1.6]",
  "3xl":"leading-[1.54]",
  "4xl":"leading-[1.48]",
  "5xl":"leading-[1.42]",
  "6xl":"leading-[1.36]",
};
const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: "90%",
  base: "100%",
  lg: "115%",
  xl: "130%",
  "2xl": "145%",
  "3xl": "160%",
  "4xl": "175%",
  "5xl": "195%",
  "6xl": "215%",
};

type ScriptureFont =
  | "georgia"
  | "playfair"
  | "cormorant"
  | "baskerville"
  | "garamond"
  | "charter"
  | "palatino"
  | "slab"
  | "access"
  | "modern"
  | "typewriter";

type ScriptureFontCategory = "classic" | "literary" | "clear" | "special";
const SCRIPTURE_FONTS: {
  key: ScriptureFont;
  label: string;
  family: string;
  desc: string;
  category: ScriptureFontCategory;
  mood: string;
}[] = [
  { key: "georgia",     label: "Georgia",     family: "'Georgia', 'Times New Roman', serif",                                      desc: "Classic & warm",           category: "classic",  mood: "Traditional" },
  { key: "charter",     label: "Charter",     family: "Charter, 'Bitstream Charter', 'Iowan Old Style', Georgia, serif",           desc: "Calm long-form reading",    category: "classic",  mood: "Readable" },
  { key: "palatino",    label: "Palatino",    family: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",             desc: "Wide & graceful",           category: "classic",  mood: "Open" },
  { key: "playfair",    label: "Playfair",    family: "var(--font-playfair), 'Playfair Display', Georgia, serif",                  desc: "Elegant display serif",     category: "literary", mood: "Formal" },
  { key: "cormorant",   label: "Cormorant",   family: "var(--font-verse-display), 'Cormorant Garamond', Georgia, serif",           desc: "Devotional & poetic",       category: "literary", mood: "Graceful" },
  { key: "garamond",    label: "Garamond",    family: "Garamond, 'EB Garamond', 'Cormorant Garamond', Georgia, serif",             desc: "Old-world literary",        category: "literary", mood: "Classic" },
  { key: "baskerville", label: "Baskerville", family: "Baskerville, 'Libre Baskerville', 'Baskerville Old Face', Georgia, serif",   desc: "Sharp & elegant",           category: "literary", mood: "Crisp" },
  { key: "slab",        label: "Slab Reader", family: "'Roboto Slab', Rockwell, 'Courier New', Georgia, serif",                    desc: "Strong printed page",       category: "clear",    mood: "Bold" },
  { key: "access",      label: "Clear Read",  family: "'Atkinson Hyperlegible', 'Arial', 'Helvetica Neue', sans-serif",            desc: "Large-print friendly",      category: "clear",    mood: "Accessible" },
  { key: "modern",      label: "Modern Sans", family: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", desc: "Clean sans-serif",        category: "clear",    mood: "Modern" },
  { key: "typewriter",  label: "Typewriter",  family: "'Courier Prime', 'Courier New', Courier, 'Lucida Console', monospace",      desc: "Manuscript study feel",     category: "special",  mood: "Study" },
];
const SCRIPTURE_FONT_GROUPS: { key: ScriptureFontCategory; en: string; es: string }[] = [
  { key: "classic", en: "Classic Reading", es: "Lectura clasica" },
  { key: "literary", en: "Literary & Elegant", es: "Literaria y elegante" },
  { key: "clear", en: "Clear & Large Print", es: "Clara y letra grande" },
  { key: "special", en: "Study Style", es: "Estilo de estudio" },
];
const SCRIPTURE_FONT_ES_COPY: Record<ScriptureFont, string> = {
  georgia: "Clasica y calida",
  charter: "Comoda para lectura larga",
  palatino: "Amplia y elegante",
  playfair: "Serif formal y refinada",
  cormorant: "Devocional y poetica",
  garamond: "Literaria clasica",
  baskerville: "Nitida y elegante",
  slab: "Pagina impresa fuerte",
  access: "Amigable para letra grande",
  modern: "Limpia y moderna",
  typewriter: "Estilo manuscrito de estudio",
};
const SCRIPTURE_FONT_KEY = "ryc-scripture-font";
const FONT_SIZE_KEY = "ryc-scripture-fontsize";

const CHAPTER_NOTE_KEY = (book: number, ch: number) => `ryc-chapter-note-${book}-${ch}`;
const LAST_POSITION_KEY = "ryc-last-position";

function saveBibleHighlight(
  bookName: string, bookNum: number, chapter: number,
  verseNum: number, verseText: string, color: HighlightColor,
) {
  mirrorScriptureHighlight({ bookName, bookNum, chapter, verseNum, verseText, color });
}

function removeBibleHighlight(_bookName: string, bookNum: number, chapter: number, verseNum: number) {
  removeMirroredScriptureHighlight(bookNum, chapter, verseNum);
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
  { key: "csb",    group: "en", name: "Christian Standard Bible",        abbr: "CSB",  note: "",            detail: "Readable formal equivalence" },
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
function getTranslationGroupLabel(groupId: "en" | "es", lang: "en" | "es") {
  if (lang === "es") return groupId === "en" ? "Inglés" : "Español";
  return groupId === "en" ? "English" : "Spanish";
}
function getTranslationGroupCount(groupId: "en" | "es", count: number, lang: "en" | "es") {
  if (lang === "es") {
    const noun = groupId === "en" ? "versiones" : "traducciones";
    return `${count} ${noun}`;
  }
  const noun = groupId === "en" ? "versions" : "translations";
  return `${count} ${noun}`;
}
function getBookDisplayName(book: BookMeta | null, t: BibleTranslation): string {
  if (!book) return "";
  if (SPANISH_TRANSLATIONS.includes(t)) return ES_BOOK_NAMES[book.num] ?? book.name;
  return book.name;
}

const BOOK_SEARCH_ALIASES: Record<number, string[]> = {
  19: ["Psalm", "Ps", "Psa"],
  22: ["Song of Songs", "Canticles", "Cantares", "Song"],
  43: ["Jn"],
  46: ["First Corinthians", "1 Cor", "I Corinthians"],
  47: ["Second Corinthians", "2 Cor", "II Corinthians"],
  52: ["First Thessalonians", "1 Thess", "I Thessalonians"],
  53: ["Second Thessalonians", "2 Thess", "II Thessalonians"],
  54: ["First Timothy", "1 Tim", "I Timothy"],
  55: ["Second Timothy", "2 Tim", "II Timothy"],
  60: ["First Peter", "1 Pet", "I Peter"],
  61: ["Second Peter", "2 Pet", "II Peter"],
  62: ["First John", "1 Jn", "I John"],
  63: ["Second John", "2 Jn", "II John"],
  64: ["Third John", "3 Jn", "III John"],
  66: ["Revelations", "Apocalypse"],
};

function normalizeBookQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bfirst\b/g, "1")
    .replace(/\bsecond\b/g, "2")
    .replace(/\bthird\b/g, "3")
    .replace(/\bi\b/g, "1")
    .replace(/\bii\b/g, "2")
    .replace(/\biii\b/g, "3")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function boundedEditDistance(a: string, b: string, maxDistance = 3) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowBest = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      rowBest = Math.min(rowBest, current[j]);
    }
    if (rowBest > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }
  return previous[b.length];
}

function getBookSearchTerms(book: BookMeta, translation: BibleTranslation) {
  const spanishName = ES_BOOK_NAMES[book.num];
  const terms = new Set<string>([
    book.name,
    book.abbr,
    spanishName,
    ...(BOOK_SEARCH_ALIASES[book.num] ?? []),
  ].filter(Boolean) as string[]);

  const leadingNumber = book.name.match(/^([123])\s(.+)$/);
  if (leadingNumber) {
    const [, number, rest] = leadingNumber;
    const words: Record<string, string> = { "1": "First", "2": "Second", "3": "Third" };
    const romans: Record<string, string> = { "1": "I", "2": "II", "3": "III" };
    terms.add(`${words[number]} ${rest}`);
    terms.add(`${romans[number]} ${rest}`);
  }

  if (SPANISH_TRANSLATIONS.includes(translation) && spanishName) terms.add(spanishName);
  return [...terms].map(normalizeBookQuery).filter(Boolean);
}

function getBookSearchScore(book: BookMeta, rawQuery: string, translation: BibleTranslation) {
  const query = normalizeBookQuery(rawQuery);
  if (!query) return book.num;

  let best = Number.POSITIVE_INFINITY;
  for (const term of getBookSearchTerms(book, translation)) {
    if (term === query) best = Math.min(best, 0);
    else if (term.startsWith(query)) best = Math.min(best, 2 + term.length - query.length);
    else if (term.includes(query)) best = Math.min(best, 10 + term.indexOf(query));

    if (query.length >= 3) {
      const fullDistance = boundedEditDistance(query, term, 3);
      const prefixDistance = boundedEditDistance(query, term.slice(0, Math.min(term.length, query.length)), 3);
      const typoDistance = Math.min(fullDistance, prefixDistance);
      const allowed = query.length <= 4 ? 2 : 3;
      if (typoDistance <= allowed) {
        best = Math.min(best, 24 + typoDistance * 6 + Math.abs(term.length - query.length));
      }
    }
  }

  return best;
}

type ScriptureSearchTarget = {
  book: BookMeta;
  chapter: number;
  verseStart: number | null;
  verseEnd: number | null;
  score: number;
};

type FocusedVerseRange = {
  bookNum: number;
  chapter: number;
  start: number;
  end: number;
};

function verseNumsFromRange(start: number, end: number) {
  const safeStart = Math.max(1, Math.min(start, end));
  const safeEnd = Math.max(safeStart, Math.max(start, end));
  return Array.from({ length: safeEnd - safeStart + 1 }, (_, i) => safeStart + i);
}

function splitScriptureSearchQuery(rawQuery: string) {
  const trimmed = rawQuery.trim();
  const spacedMatch = trimmed.match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–—]\s*(\d+))?)?$/);
  const compactVerseMatch = !spacedMatch && trimmed.includes(":")
    ? trimmed.match(/^(.+?)(\d+):(\d+)(?:\s*[-–—]\s*(\d+))?$/)
    : null;
  const match = spacedMatch ?? compactVerseMatch;

  if (!match) {
    return { bookQuery: trimmed, chapter: 1, verseStart: null, verseEnd: null };
  }

  const verseStart = match[3] ? parseInt(match[3], 10) : null;
  const rawVerseEnd = match[4] ? parseInt(match[4], 10) : null;
  const verseEnd = verseStart && rawVerseEnd
    ? Math.max(verseStart, rawVerseEnd)
    : verseStart;

  return {
    bookQuery: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verseStart: verseStart && rawVerseEnd ? Math.min(verseStart, rawVerseEnd) : verseStart,
    verseEnd,
  };
}

function getScriptureSearchSuggestions(
  rawQuery: string,
  books: BookMeta[],
  translation: BibleTranslation,
  limit = 5,
): ScriptureSearchTarget[] {
  const parts = splitScriptureSearchQuery(rawQuery);
  if (!parts.bookQuery) return [];

  return books
    .map((book) => ({
      book,
      chapter: Math.max(1, Math.min(Number.isFinite(parts.chapter) ? parts.chapter : 1, book.chapters)),
      verseStart: parts.verseStart && parts.verseStart > 0 ? parts.verseStart : null,
      verseEnd: parts.verseEnd && parts.verseEnd > 0 ? parts.verseEnd : null,
      score: getBookSearchScore(book, parts.bookQuery, translation),
    }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.book.num - b.book.num)
    .slice(0, limit);
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
  gold:   { dot: "#c9a961", label: "Gold",       bgRgb: "201,169,97",  textColor: "#000" },
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
        <button onClick={onClose} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-colors" aria-label="Close">
          <UiIcon name="close" size={14} />
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

// ─── Verse Selection Tray ─────────────────────────────────────────────────────
// Slides down from the top when one or more verses are selected.

function formatVerseRange(verses: number[]): string {
  const sorted = [...new Set(verses)].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    if (current === prev + 1) {
      prev = current;
      continue;
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = current;
    prev = current;
  }
  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges.join(", ");
}

function VerseSelectionTray({
  visible,
  selectedVerseNums,
  selectedText,
  selectedReference,
  bookName,
  chapter,
  verseColors,
  onSelect,
  onRemove,
  onClearSelection,
  onBookmark,
}: {
  visible: boolean;
  selectedVerseNums: number[];
  selectedText: string;
  selectedReference: string;
  bookName: string;
  chapter: number;
  verseColors: Record<number, HighlightColor>;
  onSelect: (color: HighlightColor) => void;
  onRemove: () => void;
  onClearSelection: () => void;
  onBookmark: (data: { ref: string; text: string }) => void;
}) {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const activeTheme = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) ?? theme;
  const isLight = activeTheme === "white-noir";
  const [copied, setCopied] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  // Determine current color (meaningful when exactly one verse is selected and highlighted)
  const currentColor: HighlightColor | undefined =
    selectedVerseNums.length === 1 ? verseColors[selectedVerseNums[0]] : undefined;

  // Whether any selected verse is already highlighted (show Remove button)
  const anyHighlighted =
    selectedVerseNums.length > 0 &&
    selectedVerseNums.some((v) => v in verseColors);

  const refLabel = selectedReference || `${bookName} ${chapter}:${formatVerseRange(selectedVerseNums)}`;

  const handleShare = async () => {
    if (!selectedText) return;
    const text = `${selectedText}\n\n— ${refLabel}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        recordScriptureShareForBadges();
        return;
      } catch { /* fall through to copy */ }
    }
    // Fallback: copy
    try {
      await navigator.clipboard?.writeText(text);
      recordScriptureShareForBadges();
    } catch {}
  };

  const handleBookmark = () => {
    if (!selectedText || !refLabel) return;
    onBookmark({ ref: refLabel, text: selectedText });
  };

  return (
    <>
      {/* Top-down sheet */}
      <div
        className={`${visible ? "motion-top-sheet-enter" : ""} fixed left-0 right-0 top-0 print:hidden`}
        style={{
          zIndex: 60,
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform var(--motion-slow) var(--ease-premium)",
          background: "var(--bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(201,169,97,0.15)",
          paddingTop: "env(safe-area-inset-top, 12px)",
          paddingBottom: 12,
        }}
      >
        {/* Reference — Row 0 */}
        <p
          className="text-center text-[13px] font-bold truncate pt-3 pb-2 px-4"
          style={{ color: "rgba(201,169,97,1)" }}
        >
          {refLabel}
        </p>

        {/* Row 1 — Highlights: swatches spread across full width */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: "100%",
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          {(Object.entries(HIGHLIGHT_COLORS) as [HighlightColor, typeof HIGHLIGHT_COLORS[HighlightColor]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { onSelect(key); onClearSelection(); }}
              title={val.label}
              className="motion-pressable"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                flexShrink: 0,
                background: val.dot,
                outline: currentColor === key ? "3px solid rgba(201,169,97,1)" : "none",
                outlineOffset: currentColor === key ? 2 : 0,
                boxShadow: currentColor === key ? "none" : (isLight ? "0 0 0 1.5px rgba(0,0,0,0.15)" : "0 0 0 1.5px rgba(255,255,255,0.15)"),
              }}
            />
          ))}
        </div>

        {/* Remove Highlight row — only when any selected verse has a highlight */}
        {anyHighlighted && (
          <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
            <button
              onClick={() => { onRemove(); onClearSelection(); }}
              className="motion-pressable flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold"
              style={{
                width: "100%",
                background: "rgba(239,68,68,0.15)",
                color: "rgba(239,68,68,0.8)",
                border: "none",
              }}
            >
              {/* Trash icon 13×13 */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              <span>{lang === "es" ? "Quitar color" : "Remove Highlight"}</span>
            </button>
          </div>
        )}

        {/* Row 2 — Actions: horizontally scrollable pill buttons */}
        <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          <div
            className="flex flex-row items-center gap-3"
            style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 4, paddingBottom: 4 }}
          >
            {/* Copy */}
            <button
              onClick={async () => {
                if (!selectedText) return;
                const text = `${selectedText}\n\n${refLabel}`;
                try {
                  await navigator.clipboard?.writeText(text);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1400);
                } catch {}
              }}
              className="motion-pressable flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
              style={{
                background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
                border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.09)",
                color: isLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.72)",
              }}
            >
              {/* Clipboard icon 14×14 */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="4" rx="1"/>
                <path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-3"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
              <span>{copied ? (lang === "es" ? "Copiado" : "Copied") : (lang === "es" ? "Copiar" : "Copy")}</span>
            </button>

            {/* Create Image — opens full-screen editor */}
            <button
              onClick={() => { if (!selectedText) return; setShowImageEditor(true); }}
              className="motion-pressable flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
              style={{
                background: isLight ? "#e5e7eb" : "rgba(201,169,97,1)",
                border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.4)",
                color: "#08090f",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/>
              </svg>
              <span>{lang === "es" ? "Crear Imagen" : "Create Image"}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="motion-pressable flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
              style={{
                background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
                border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.09)",
                color: isLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.72)",
              }}
            >
              {/* Share icon 14×14 */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span>{lang === "es" ? "Compartir" : "Share"}</span>
            </button>

            {/* Bookmark / Save */}
            <button
              onClick={handleBookmark}
              className="motion-pressable flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
              style={{
                background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
                border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.09)",
                color: isLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.72)",
              }}
            >
              {/* Bookmark icon 14×14 */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
              <span>{lang === "es" ? "Guardar" : "Save"}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Full-screen Create Image editor */}
      {showImageEditor && (
        <CreateImageEditor
          verseText={selectedText}
          reference={refLabel}
          lang={lang}
          onClose={() => setShowImageEditor(false)}
        />
      )}
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
  const activeTheme = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) ?? theme;
  const isLight = activeTheme === "white-noir";
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const [books, setBooks]       = useState<BookMeta[]>([]);
  const [hasStrongs, setHasStrongs] = useState(false);
  const [booksError, setBooksError] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);

  const [selectedBook, setSelectedBook]       = useState<BookMeta | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterData, setChapterData]         = useState<ChapterData | null>(null);
  const [chapterError, setChapterError]       = useState<string | null>(null);
  const [loadingChapter, setLoadingChapter]   = useState(false);

  const [activeToken, setActiveToken]         = useState<WordToken | null>(null);
  const [strongsEntry, setStrongsEntry]       = useState<StrongsEntry | null>(null);
  const [loadingStrongs, setLoadingStrongs]   = useState(false);

  const [searchQuery, setSearchQuery]   = useState("");
  const [searchLang, setSearchLang]     = useState<"" | "H" | "G">("");
  const [searchResults, setSearchResults] = useState<StrongsEntry[]>([]);
  const [searching, setSearching]       = useState(false);

  const [activeTab, setActiveTab]             = useState<"reader" | "search">("reader");
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

  const [fontSize, setFontSize]               = useState<FontSize>(() => {
    try { const s = localStorage.getItem(FONT_SIZE_KEY) as FontSize; return FONT_SIZES.includes(s) ? s : "base"; } catch { return "base"; }
  });
  const [scriptureFont, setScriptureFont]     = useState<ScriptureFont>(() => {
    try { const s = localStorage.getItem(SCRIPTURE_FONT_KEY) as ScriptureFont; return SCRIPTURE_FONTS.some(f => f.key === s) ? s : "georgia"; } catch { return "georgia"; }
  });
  const [showFontPicker, setShowFontPicker]   = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  function selectFont(f: ScriptureFont) {
    setScriptureFont(f);
    try { localStorage.setItem(SCRIPTURE_FONT_KEY, f); } catch {}
  }
  function setReaderFontSize(next: FontSize) {
    setFontSize(next);
    try { localStorage.setItem(FONT_SIZE_KEY, next); } catch {}
  }
  const activeFontFamily = SCRIPTURE_FONTS.find(f => f.key === scriptureFont)?.family ?? "'Georgia', serif";

  // Translation picker sheet
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<"en" | "es">("en");

  // Navigation search (type "Romans 3")
  const [showNavSearch, setShowNavSearch]   = useState(false);
  const [navQuery,      setNavQuery]        = useState("");
  const scriptureToolbarRef = useRef<HTMLElement | null>(null);
  const [scriptureToolbarHeight, setScriptureToolbarHeight] = useState(64);
  const [pendingVerseJump, setPendingVerseJump] = useState<number[]>([]);
  const [focusedVerseRange, setFocusedVerseRange] = useState<FocusedVerseRange | null>(null);

  // Verse selection tray (tap-to-highlight whole verse)
  const [selectedVerseNums, setSelectedVerseNums] = useState<number[]>([]);

  // Bookmark popup
  const [bookmarkPopup, setBookmarkPopup] = useState<{ ref: string; text: string } | null>(null);

  // Verse color highlights (tap-to-highlight whole verse)
  const [verseColors, setVerseColors] = useState<Record<number, HighlightColor>>({});

  // Chapter notes
  const [chapterNote, setChapterNote] = useState("");
  const [showNotes, setShowNotes]     = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [pickerView, setPickerView]         = useState<"books" | "chapters">("books");
  const [pickerBook, setPickerBook]         = useState<BookMeta | null>(null);
  const [pickerBookSearch, setPickerBookSearch] = useState("");
  const [pickerLastPosition, setPickerLastPosition] = useState<{ bookName: string; chapter: number } | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ── Verse color highlights load/save ─────────────────────────────────────
  useEffect(() => {
    if (!selectedBook) return;
    setVerseColors(getScriptureVerseColors(selectedBook.num, selectedChapter) as Record<number, HighlightColor>);
    setSelectedVerseNums([]);
    // tray auto-hides when selectedVerseNums goes to []
  }, [selectedBook, selectedChapter]);

  const setVerseColor = useCallback((verseNum: number, color: HighlightColor) => {
    setVerseColors((prev) => ({ ...prev, [verseNum]: color }));
    // Save through the unified highlights system so Profile, Collections, and Highlights stay in sync.
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
    // Remove through the unified highlights system so every highlight surface updates together.
    const book = selectedBook;
    if (book) removeBibleHighlight(book.name, book.num, selectedChapter, verseNum);
  }, [selectedBook, selectedChapter]);

  const selectedVerses = selectedVerseNums
    .flatMap((verseNum) => {
      const verse = chapterData?.verses.find((candidate) => candidate.verse === verseNum);
      return verse ? [verse] : [];
    })
    .sort((a, b) => a.verse - b.verse);

  const selectedReference = selectedBook && selectedVerses.length > 0
    ? `${getBookDisplayName(selectedBook, translation)} ${selectedChapter}:${formatVerseRange(selectedVerses.map((verse) => verse.verse))}`
    : "";

  const selectedVerseText = selectedVerses
    .map((verse) => `${verse.verse}. ${verse.text}`)
    .join(" ");

  // ── Tap-to-highlight handler ──────────────────────────────────────────────
  const handleVerseClick = useCallback((verseNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSelected = selectedVerseNums.includes(verseNum)
      ? selectedVerseNums.filter((selected) => selected !== verseNum)
      : [...selectedVerseNums, verseNum].sort((a, b) => a - b);
    setSelectedVerseNums(nextSelected);
    // Tray visibility is driven by nextSelected.length > 0 — no extra state needed
  }, [selectedVerseNums]);

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

  const openScriptureSearchTarget = useCallback((target: ScriptureSearchTarget) => {
    const start = target.verseStart;
    const end = target.verseEnd ?? target.verseStart;
    setSelectedBook(target.book);
    setSelectedChapter(target.chapter);
    setFocusedVerseRange(start && end ? {
      bookNum: target.book.num,
      chapter: target.chapter,
      start: Math.min(start, end),
      end: Math.max(start, end),
    } : null);
    setPendingVerseJump([]);
    setSelectedVerseNums([]);
    setActiveTab("reader");
    setShowNavSearch(false);
    setNavQuery("");
  }, []);

  // ── Navigation search handler (parse "Romans 3" / "Romans 3:23") ─────────
  const handleNavSearch = useCallback((q: string) => {
    const target = getScriptureSearchSuggestions(q, books, translation, 1)[0];
    if (target) openScriptureSearchTarget(target);
  }, [books, openScriptureSearchTarget, translation]);

  useEffect(() => {
    if (pendingVerseJump.length === 0 || !chapterData) return;
    const validVerses = pendingVerseJump.filter((verseNum) =>
      chapterData.verses.some((verse) => verse.verse === verseNum)
    );
    if (validVerses.length === 0) {
      setPendingVerseJump([]);
      return;
    }

    const timer = window.setTimeout(() => {
      const el = verseRefs.current[validVerses[0]];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setSelectedVerseNums(validVerses);
      setPendingVerseJump([]);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [pendingVerseJump, chapterData]);

  // ── Books + chapter loading ───────────────────────────────────────────────
  useEffect(() => {
    const bookParam    = searchParams.get("book");
    const chapterParam = searchParams.get("chapter");
    const selectParam  = searchParams.get("select"); // comma-separated verse numbers

    setBooksLoading(true);
    setBooksError(false);
    fetchBooks()
      .then(({ books: bks, hasStrongs: hs }) => {
        setBooks(bks);
        setHasStrongs(hs);
        setBooksLoading(false);

        // If URL params specify a book, navigate there; otherwise default to John 3.
        if (bookParam) {
          const target = bks.find(
            (b) => b.name.toLowerCase() === bookParam.toLowerCase()
          );
          if (target) {
            setSelectedBook(target);
            setSelectedChapter(chapterParam ? Math.max(1, Number(chapterParam)) : 1);
            // If specific verses requested, queue them for selection once chapter loads
            if (selectParam) {
              const nums = selectParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
              if (nums.length > 0) setPendingVerseJump(nums);
            }
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
    setActiveToken(null);
    setStrongsEntry(null);
    setSelectedVerseNums([]);

    fetchChapter(selectedBook.num, selectedChapter, translation).then((data) => {
      if (fetchId !== fetchIdRef.current) return; // stale fetch — discard
      setChapterData(data);
      setChapterError(null);
    }).catch((err) => {
      if (fetchId !== fetchIdRef.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setChapterError(`Could not load chapter. ${msg}`);
    }).finally(() => {
      if (fetchId !== fetchIdRef.current) return;
      setLoadingChapter(false);
    });
  }, [selectedBook, selectedChapter, translation]);

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
        if (selectedBook && selectedChapter < selectedBook.chapters) {
          setFocusedVerseRange(null);
          setSelectedVerseNums([]);
          setSelectedChapter((c) => c + 1);
        }
      }
      if (e.key === "ArrowLeft") {
        if (selectedChapter > 1) {
          setFocusedVerseRange(null);
          setSelectedVerseNums([]);
          setSelectedChapter((c) => c - 1);
        }
      }
      if (e.key === "Escape") setSelectedVerseNums([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedBook, selectedChapter]);

  const pickerQuery = pickerBookSearch.trim();
  const filteredPickerBooks = books.filter((b) => testamentFilter === "ALL" ? true : b.testament === testamentFilter);
  const suggestedBookMatches = pickerQuery
    ? filteredPickerBooks
        .map((book) => ({ book, score: getBookSearchScore(book, pickerQuery, translation) }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score || a.book.num - b.book.num)
        .slice(0, 6)
        .map(({ book }) => book)
    : [];
  const pickerUsingSuggestions = Boolean(pickerQuery);
  const visibleBooks = pickerUsingSuggestions ? suggestedBookMatches : filteredPickerBooks;
  const pickerLastBook = pickerLastPosition ? books.find((b) => b.name === pickerLastPosition.bookName) : null;
  const navSearchSuggestions = getScriptureSearchSuggestions(navQuery, books, translation);
  const activeFocusedRange =
    focusedVerseRange &&
    selectedBook &&
    focusedVerseRange.bookNum === selectedBook.num &&
    focusedVerseRange.chapter === selectedChapter
      ? focusedVerseRange
      : null;
  const focusedReferenceLabel = activeFocusedRange && selectedBook
    ? `${getBookDisplayName(selectedBook, translation)} ${selectedChapter}:${activeFocusedRange.start}${activeFocusedRange.end !== activeFocusedRange.start ? `-${activeFocusedRange.end}` : ""}`
    : "";
  const chapterNums = selectedBook
    ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)
    : [];

  useEffect(() => {
    if (!showBookPicker || pickerView !== "books") return;
    setPickerLastPosition(loadLastPosition());
  }, [showBookPicker, pickerView]);

  const goNext = () => {
    setFocusedVerseRange(null);
    setSelectedVerseNums([]);
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      setSelectedChapter((c) => c + 1);
    } else if (selectedBook && selectedBook.num < 66) {
      const next = books.find((b) => b.num === selectedBook.num + 1);
      if (next) { setSelectedBook(next); setSelectedChapter(1); }
    }
  };

  const goPrev = () => {
    setFocusedVerseRange(null);
    setSelectedVerseNums([]);
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
    } else if (selectedBook && selectedBook.num > 1) {
      const prev = books.find((b) => b.num === selectedBook.num - 1);
      if (prev) { setSelectedBook(prev); setSelectedChapter(prev.chapters); }
    }
  };

  const highlightedVerseCount = Object.keys(verseColors).length;
  const currentTranslation = getTranslationMeta(translation);
  const fontSizeIndex = Math.max(FONT_SIZES.indexOf(fontSize), 0);
  const canDecreaseFont = fontSizeIndex > 0;
  const canIncreaseFont = fontSizeIndex < FONT_SIZES.length - 1;
  const changeFontSize = (direction: -1 | 1) => {
    const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, fontSizeIndex + direction))];
    setReaderFontSize(next);
  };
  const openTranslationPicker = () => {
    setPickerCategory(currentTranslation.group);
    setShowTranslationPicker(true);
  };
  const selectTranslation = (next: BibleTranslation) => {
    setTranslation(next);
    try { localStorage.setItem("ryc-translation", next); } catch {}
    setShowTranslationPicker(false);
  };

  useEffect(() => {
    const toolbar = scriptureToolbarRef.current;
    if (!toolbar) return;

    const updateToolbarHeight = () => {
      setScriptureToolbarHeight(Math.ceil(toolbar.getBoundingClientRect().height));
    };

    updateToolbarHeight();
    const observer = new ResizeObserver(updateToolbarHeight);
    observer.observe(toolbar);
    window.addEventListener("resize", updateToolbarHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateToolbarHeight);
    };
  }, [activeTab, showNavSearch]);

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
      style={{
        background: isLight ? "#ffffff" : "#0b0d13",
        color: isLight ? "#0a0a0a" : "#ffffff",
      }}
    >
      {/* ── Books error banner ── */}
      {booksError && (
        <div className="max-w-screen-xl mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] px-5 py-4 flex items-start gap-3">
            <UiIcon name="warning" size={20} className="flex-shrink-0 mt-0.5 text-red-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-300/90 mb-1">Couldn&apos;t connect to the Bible server</p>
              <p className="text-xs text-red-400/60 leading-relaxed mb-3">The backend may be sleeping or unreachable. This sometimes happens after a period of inactivity — try again in a moment.</p>
              <button
                onClick={() => {
                  setBooksError(false);
                  setBooksLoading(true);
                  fetchBooks()
                    .then(({ books: bks, hasStrongs: hs }) => {
                      setBooks(bks); setHasStrongs(hs); setBooksLoading(false);
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
      {/* ── Translation picker full screen ── */}
      {showTranslationPicker && (
        <div
          className="motion-page-enter fixed inset-0 z-[90] print:hidden"
          style={{ background: isLight ? "#ffffff" : "#101010", color: isLight ? "#0a0a0a" : "#f5f5f5" }}
        >
          <div
            className="h-full w-full max-w-xl mx-auto flex flex-col"
            style={{ paddingTop: "max(env(safe-area-inset-top), 22px)" }}
          >
            <div className="px-7 pb-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowTranslationPicker(false)}
                  className="h-11 w-11 -ml-2 rounded-full flex items-center justify-center transition-colors"
                  style={{ color: isLight ? "#111111" : "#ffffff" }}
                  aria-label={lang === "es" ? "Cerrar traducciones" : "Close translations"}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h2 className="flex-1 text-[30px] font-semibold tracking-[-0.04em]">
                  {lang === "es" ? "Traducciones" : "Translations"}
                </h2>
              </div>

              <div
                className="mt-4 rounded-[24px] p-4 flex items-center gap-4"
                style={{
                  background: isLight ? "#f2f3f5" : "#242424",
                  border: isLight ? "1px solid #e4e5e7" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-base font-black"
                  style={{ background: isLight ? "#ffffff" : "#101010", border: isLight ? "1px solid #dadcdf" : "1px solid rgba(255,255,255,0.10)" }}
                >
                  {currentTranslation.abbr}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: isLight ? "#8a8a8a" : "#9a9a9a" }}>
                    {lang === "es" ? "Selección actual" : "Current Selection"}
                  </p>
                  <p className="truncate text-[19px] font-semibold tracking-[-0.02em]">{currentTranslation.name}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {TRANSLATION_GROUPS.map((group) => {
                  const active = pickerCategory === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setPickerCategory(group.id)}
                      className="rounded-full py-3.5 text-center transition-colors"
                      style={{
                        background: active ? (isLight ? "#e5e7eb" : "#ffffff") : (isLight ? "#f2f3f5" : "#242424"),
                        color: active ? (isLight ? "#0b0b0b" : "#0b0b0b") : (isLight ? "#656565" : "#b8b8b8"),
                        boxShadow: active && isLight ? "inset 0 0 0 1px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      <span className="block text-[17px] font-semibold tracking-[-0.02em]">{getTranslationGroupLabel(group.id, lang)}</span>
                      <span className="block text-[11px] font-semibold opacity-60">
                        {getTranslationGroupCount(group.id, group.options.length, lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-7 pb-24">
              <div className="flex flex-col">
                {TRANSLATION_GROUPS.find((g) => g.id === pickerCategory)?.options.map((option) => {
                  const active = translation === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => selectTranslation(option.key)}
                      className="w-full py-4 flex items-center gap-4 text-left transition-opacity active:opacity-60"
                    >
                      <span
                        className="h-12 w-16 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{
                          background: isLight ? "#f2f3f5" : "#242424",
                          border: isLight ? "1px solid #e4e5e7" : "1px solid rgba(255,255,255,0.08)",
                          color: isLight ? "#111111" : "#f5f5f5",
                        }}
                      >
                        {option.abbr}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[21px] leading-tight font-semibold tracking-[-0.03em]">{option.name}</span>
                        <span className="block mt-1 text-sm font-medium" style={{ color: isLight ? "#8a8a8a" : "#9a9a9a" }}>
                          {option.note ? `${option.note} · ${option.detail}` : option.detail}
                        </span>
                      </span>
                      {active && (
                        <span
                          className="h-9 w-9 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                          style={{ background: isLight ? "#e5e7eb" : "#ffffff", color: "#0b0b0b", border: isLight ? "1px solid #d1d5db" : "none" }}
                        >
                          <UiIcon name="check" size={18} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Scripture toolbar ── */}
      <header
        ref={scriptureToolbarRef}
        className="fixed left-0 right-0 top-0 md:sticky md:top-14 z-50 print:hidden"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)",
          background: isLight ? "rgba(255,255,255,0.98)" : "rgba(9,10,16,0.98)",
          boxShadow: isLight ? "0 10px 26px rgba(15,23,42,0.06)" : "0 14px 32px rgba(0,0,0,0.30)",
        }}
      >
        <div className="relative max-w-screen-xl mx-auto px-4 py-2">
          <div
            className="flex items-center gap-2 rounded-[26px] border p-1.5"
            style={{
              background: isLight ? "#f4f5f6" : "rgba(255,255,255,0.055)",
              borderColor: isLight ? "#e2e4e7" : "rgba(255,255,255,0.10)",
              boxShadow: isLight ? "inset 0 1px 0 rgba(255,255,255,0.85)" : "inset 0 1px 0 rgba(255,255,255,0.045)",
            }}
          >
            <button
              type="button"
              onClick={() => setShowFontPicker((v) => !v)}
              className="h-11 rounded-[20px] px-3.5 flex items-center gap-2 text-[13px] font-black transition-transform active:scale-95"
              style={{
                background: isLight ? "#ffffff" : "rgba(255,255,255,0.055)",
                color: isLight ? "#111111" : "rgba(255,255,255,0.84)",
                border: isLight ? "1px solid #d9dbdf" : "1px solid rgba(255,255,255,0.10)",
              }}
              title={lang === "es" ? "Texto y fuente bíblica" : "Text and scripture font"}
            >
              <span className="text-[15px]">Aa</span>
              <span className="hidden min-[360px]:inline text-[10px] font-black tracking-[0.08em] opacity-55">
                {FONT_SIZE_LABELS[fontSize]}
              </span>
            </button>

            <button
              type="button"
              onClick={openTranslationPicker}
              className="h-11 rounded-[20px] px-4 text-[12px] font-black transition-transform active:scale-95"
              style={{
                background: isLight ? "#ffffff" : "rgba(255,255,255,0.055)",
                color: isLight ? "#111111" : "rgba(255,255,255,0.82)",
                border: isLight ? "1px solid #d9dbdf" : "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {currentTranslation.abbr}
            </button>

            {activeTab === "reader" && (
              <button
                type="button"
                onClick={() => setShowNavSearch((v) => !v)}
                className="ml-auto h-11 rounded-[20px] px-4 border text-[12px] font-black transition-all flex items-center gap-2 active:scale-95"
                style={{
                  background: showNavSearch ? (isLight ? "#e7e9ec" : "rgba(255,255,255,0.12)") : (isLight ? "#ffffff" : "rgba(255,255,255,0.055)"),
                  borderColor: showNavSearch ? (isLight ? "#ccd0d5" : "rgba(255,255,255,0.18)") : (isLight ? "#d9dbdf" : "rgba(255,255,255,0.10)"),
                  color: isLight ? "#111111" : "rgba(255,255,255,0.86)",
                  boxShadow: showNavSearch ? (isLight ? "0 8px 18px rgba(15,23,42,0.10)" : "0 10px 28px rgba(0,0,0,0.24)") : "none",
                }}
                aria-label={lang === "es" ? "Buscar pasaje bíblico" : "Search Bible passage"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                </svg>
                <span className="hidden min-[360px]:inline">{lang === "es" ? "Buscar" : "Search"}</span>
              </button>
            )}
          </div>

          {activeTab === "reader" && showNavSearch && (
            <div
              className="absolute left-4 right-4 top-full z-[65] mt-2"
              style={{ maxHeight: "calc(100vh - 110px)", overflowY: "auto" }}
            >
            <form
              onSubmit={(e) => { e.preventDefault(); handleNavSearch(navQuery); }}
              className="rounded-[28px] border p-3"
              style={{
                background: isLight ? "#f4f5f6" : "rgba(13,15,23,0.98)",
                borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.12)",
                boxShadow: isLight ? "0 18px 40px rgba(15,23,42,0.14)" : "0 20px 54px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.52)" }}>
                    {lang === "es" ? "Buscar Pasaje" : "Scripture Search"}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.34)" }}>
                    {lang === "es" ? "Ve directo a un libro, capítulo o versículos" : "Jump straight to a book, chapter, or verses"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowNavSearch(false); setNavQuery(""); }}
                  className="h-8 w-8 rounded-full text-sm transition-colors"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.055)", color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.38)", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)" }}
                  aria-label={lang === "es" ? "Cerrar búsqueda" : "Close search"}
                >
                  <UiIcon name="close" size={14} />
                </button>
              </div>

              <div
                className="flex items-center gap-2 rounded-2xl border px-3 py-2.5"
                style={{
                  background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.055)",
                  borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.09)",
                }}
              >
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.76)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setShowNavSearch(false); setNavQuery(""); } }}
                  placeholder={lang === "es" ? "Juan 3, Romanos 8, Hechos 1..." : "John 3, Romans 8, Acts 1..."}
                  style={{ fontSize: "16px", color: isLight ? "#0a0a0a" : "#ffffff" }}
                  className="min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none"
                />
	                <button
	                  type="submit"
	                  className="rounded-xl px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
	                  style={{
	                    background: isLight ? "#e5e7eb" : "#ffffff",
                    color: "#08090f",
                    boxShadow: isLight ? "none" : "0 8px 20px rgba(0,0,0,0.18)",
                  }}
                >
	                  {lang === "es" ? "Ir" : "Go"}
	                </button>
	              </div>

	              {navQuery.trim() && navSearchSuggestions.length > 0 && (
	                <div className="mt-3 space-y-2">
	                  <p
	                    className="px-1 text-[9px] font-black uppercase tracking-[0.18em]"
	                    style={{ color: isLight ? "rgba(0,0,0,0.44)" : "rgba(255,255,255,0.50)" }}
	                  >
	                    {lang === "es" ? "Sugerencias" : "Suggestions"}
	                  </p>
	                  <div className="grid gap-2">
	                    {navSearchSuggestions.map((suggestion) => {
	                      const bookLabel = getBookDisplayName(suggestion.book, translation);
                        const hasVerseTarget = suggestion.verseStart != null;
                        const verseSuffix = hasVerseTarget
                          ? `${suggestion.verseStart}${suggestion.verseEnd && suggestion.verseEnd !== suggestion.verseStart ? `-${suggestion.verseEnd}` : ""}`
                          : "";
	                      const chapterLabel = hasVerseTarget
	                        ? `${lang === "es" ? "Cap." : "Ch."} ${suggestion.chapter}:${verseSuffix}`
	                        : `${lang === "es" ? "Cap." : "Ch."} ${suggestion.chapter}`;
	                      const referenceLabel = hasVerseTarget
	                        ? `${bookLabel} ${suggestion.chapter}:${verseSuffix}`
	                        : `${bookLabel} ${suggestion.chapter}`;
	                      return (
	                        <button
	                          key={`${suggestion.book.num}-${suggestion.chapter}-${suggestion.verseStart ?? 0}-${suggestion.verseEnd ?? 0}`}
	                          type="button"
	                          onClick={() => openScriptureSearchTarget(suggestion)}
	                          className="group w-full rounded-[22px] border px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
	                          style={{
	                            background: isLight ? "linear-gradient(180deg, #ffffff 0%, #f7f7f8 100%)" : "rgba(255,255,255,0.055)",
	                            borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)",
	                            boxShadow: isLight ? "0 10px 22px rgba(15,23,42,0.055)" : "none",
	                          }}
	                        >
	                          <span className="flex items-center gap-3.5">
	                            <span className="min-w-0 flex-1">
	                              <span className="flex items-baseline gap-2">
	                                <span className="block truncate text-[18px] font-black leading-tight" style={{ color: isLight ? "#090909" : "#ffffff" }}>
	                                  {referenceLabel}
	                                </span>
	                                <span
	                                  className="hidden min-[380px]:inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]"
	                                  style={{
	                                    background: isLight ? "#eceef1" : "rgba(255,255,255,0.08)",
	                                    color: isLight ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.56)",
	                                  }}
	                                >
	                                  {suggestion.book.num <= 39 ? (lang === "es" ? "AT" : "OT") : (lang === "es" ? "NT" : "NT")}
	                                </span>
	                              </span>
	                              <span className="mt-1 block truncate text-[12px] font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.42)" }}>
	                                {hasVerseTarget
                                    ? (lang === "es" ? "Abrir solo este pasaje" : "Open this passage only")
                                    : (lang === "es" ? "Abrir capítulo completo" : "Open whole chapter")}
	                              </span>
	                            </span>
	                            <span
	                              className="hidden sm:inline-flex rounded-full px-3 py-1.5 text-[11px] font-black"
	                              style={{
	                                background: isLight ? "#eceef1" : "rgba(255,255,255,0.08)",
	                                color: isLight ? "#111111" : "rgba(255,255,255,0.78)",
	                              }}
	                            >
	                              {chapterLabel}
	                            </span>
	                            <span
	                              className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-active:translate-x-0.5"
	                              style={{ background: isLight ? "#eceef1" : "rgba(255,255,255,0.06)", color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.72)" }}
	                            >
	                              <UiIcon name="chevron-right" size={15} />
	                            </span>
	                          </span>
	                        </button>
	                      );
	                    })}
	                  </div>
	                </div>
	              )}

	            </form>
	          </div>
	        )}
        </div>

      </header>
      <div
        className="md:hidden print:hidden"
        style={{ height: scriptureToolbarHeight }}
        aria-hidden="true"
      />

      {/* ── Font picker full screen ── */}
      {showFontPicker && (
        <div
          className="motion-page-enter fixed inset-0 z-[90] print:hidden"
          style={{
            background: isLight ? "#ffffff" : "#090a10",
            color: isLight ? "#0a0a0a" : "#f5f5f5",
          }}
        >
          <div
            className="h-full w-full max-w-2xl mx-auto flex flex-col"
            style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
          >
            <div className="px-5 sm:px-8 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFontPicker(false)}
                  className="h-10 w-10 -ml-1 rounded-full flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    background: isLight ? "#f1f2f4" : "rgba(255,255,255,0.07)",
                    border: isLight ? "1px solid #e0e2e5" : "1px solid rgba(255,255,255,0.10)",
                    color: isLight ? "#111111" : "#ffffff",
                  }}
                  aria-label={lang === "es" ? "Cerrar fuentes" : "Close fonts"}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: isLight ? "#888d94" : "#8d929c" }}>
                    {lang === "es" ? "Lectura biblica" : "Scripture Reading"}
                  </p>
                  <h2 className="text-[24px] font-semibold tracking-[-0.04em] leading-tight">
                    {lang === "es" ? "Fuente y tamano" : "Font & Size"}
                  </h2>
                </div>
              </div>

            </div>

            <div className="overflow-y-auto flex-1 px-5 sm:px-8 pb-24">
              <div
                className="mb-5 overflow-hidden rounded-[24px] border shadow-sm"
                style={{
                  background: isLight ? "#f4f5f7" : "#11131b",
                  borderColor: isLight ? "#e1e3e7" : "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background: isLight
                      ? "linear-gradient(180deg, #ffffff 0%, #f7f8fa 100%)"
                      : "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: isLight ? "#8a8f97" : "#8f949f" }}>
                        {lang === "es" ? "Vista previa" : "Preview"}
                      </p>
                      <p
                        className="mt-1 truncate text-[21px] leading-tight tracking-[-0.02em]"
                        style={{
                          color: isLight ? "#101114" : "#f6f3ee",
                          fontFamily: activeFontFamily,
                        }}
                      >
                        {lang === "es" ? "En el principio era el Verbo" : "In the beginning was the Word"}
                      </p>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-2 text-[17px] font-black"
                      style={{
                        background: isLight ? "#eef0f3" : "rgba(255,255,255,0.07)",
                        color: isLight ? "#111111" : "#ffffff",
                      }}
                    >
                      {FONT_SIZE_LABELS[fontSize]}
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: isLight ? "#8a8f97" : "#8f949f" }}>
                        {lang === "es" ? "Tamano" : "Text Size"}
                      </p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: isLight ? "#4b5563" : "rgba(255,255,255,0.62)" }}>
                        {lang === "es" ? "Guardado automaticamente" : "Saved automatically"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => changeFontSize(-1)}
                        disabled={!canDecreaseFont}
                        className="h-10 w-14 rounded-2xl text-[14px] font-black transition-opacity active:scale-95 disabled:opacity-35"
                        style={{
                          background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                          border: isLight ? "1px solid #d9dce1" : "1px solid rgba(255,255,255,0.10)",
                          color: isLight ? "#111111" : "#ffffff",
                        }}
                      >
                        A-
                      </button>
                      <button
                        type="button"
                        onClick={() => changeFontSize(1)}
                        disabled={!canIncreaseFont}
                        className="h-10 w-14 rounded-2xl text-base font-black transition-opacity active:scale-95 disabled:opacity-35"
                        style={{
                          background: isLight ? "#111111" : "#f3f4f6",
                          border: isLight ? "1px solid #111111" : "1px solid #f3f4f6",
                          color: isLight ? "#ffffff" : "#111111",
                        }}
                      >
                        A+
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {FONT_SIZES.map((size) => {
                      const active = size === fontSize;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setReaderFontSize(size)}
                          className="min-w-[68px] rounded-[18px] border px-3 py-2.5 text-left transition-transform active:scale-[0.98]"
                          style={{
                            background: active ? (isLight ? "#101010" : "#f5f5f5") : (isLight ? "#ffffff" : "rgba(255,255,255,0.05)"),
                            borderColor: active ? (isLight ? "#101010" : "#f5f5f5") : (isLight ? "#e0e2e5" : "rgba(255,255,255,0.08)"),
                            color: active ? (isLight ? "#ffffff" : "#111111") : (isLight ? "#111111" : "#f4f4f4"),
                          }}
                        >
                          <span className="block text-[14px] font-black leading-none">{FONT_SIZE_LABELS[size]}</span>
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] opacity-55">
                            {size === "base" ? (lang === "es" ? "Base" : "Base") : size.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {SCRIPTURE_FONT_GROUPS.map((group) => {
                const fonts = SCRIPTURE_FONTS.filter((font) => font.category === group.key);
                return (
                  <section key={group.key} className="mb-6">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: isLight ? "#8a8f97" : "#8f949f" }}>
                      {lang === "es" ? group.es : group.en}
                    </p>
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {fonts.map((f) => {
                        const active = scriptureFont === f.key;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => selectFont(f.key)}
                            className="group relative overflow-hidden rounded-[26px] border p-5 text-left transition-transform active:scale-[0.985]"
                            style={{
                              background: active
                                ? (isLight ? "#111111" : "#f4f5f7")
                                : (isLight ? "#f5f6f8" : "rgba(255,255,255,0.045)"),
                              borderColor: active
                                ? (isLight ? "#111111" : "#f4f5f7")
                                : (isLight ? "#e1e3e7" : "rgba(255,255,255,0.08)"),
                              color: active ? (isLight ? "#ffffff" : "#111111") : "inherit",
                              boxShadow: active
                                ? (isLight ? "0 16px 34px rgba(0,0,0,0.12)" : "0 16px 34px rgba(0,0,0,0.34)")
                                : "none",
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[16px] font-black tracking-[-0.02em]">{f.label}</p>
                                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] opacity-55">{f.mood}</p>
                              </div>
                              <span
                                className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: active
                                    ? (isLight ? "#ffffff" : "#111111")
                                    : (isLight ? "#ffffff" : "rgba(255,255,255,0.07)"),
                                  color: active
                                    ? (isLight ? "#111111" : "#ffffff")
                                    : (isLight ? "#9aa0a8" : "rgba(255,255,255,0.45)"),
                                  border: active
                                    ? "none"
                                    : (isLight ? "1px solid #e2e4e8" : "1px solid rgba(255,255,255,0.08)"),
                                }}
                              >
                                {active ? <UiIcon name="check" size={16} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-current opacity-45" />}
                              </span>
                            </div>
                            <p
                              className="mt-5 text-[25px] leading-snug tracking-[-0.025em]"
                              style={{ fontFamily: f.family }}
                            >
                              {lang === "es" ? "La gracia sea con todos vosotros." : "Grace be with all who love our Lord."}
                            </p>
                            <p className="mt-3 text-[15px] font-semibold leading-relaxed opacity-62">
                              {lang === "es" ? SCRIPTURE_FONT_ES_COPY[f.key] : f.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
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
              style={{ fontSize: "16px" }}
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
        <div className="max-w-screen-xl mx-auto px-4 py-8 pb-[17rem] sm:pb-48">

          {/* Chapter hero */}
          {selectedBook && (
            <div className="text-center mb-10">
              <p
                className="pn-book-name text-sm font-semibold tracking-widest uppercase mb-2"
                style={{ color: isLight ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.25)" }}
              >
                {getBookDisplayName(selectedBook, translation)}
              </p>
              <p
                className="pn-chapter-num text-8xl font-black leading-none mb-3"
                style={{ color: isLight ? "#050505" : "#ffffff" }}
              >
                {selectedChapter}
              </p>
              <p
                className="pn-chapter-subtitle text-[11px] tracking-wide"
                style={{ color: isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.20)" }}
              >
                {TRANSLATION_OPTIONS.find((option) => option.key === translation)?.name ?? "King James Version"}
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

          <div className={`grid gap-6 ${strongsEntry || loadingStrongs ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1 max-w-2xl mx-auto"}`}>

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
                  <UiIcon name="warning" size={30} className="text-red-300" />
                  <p className="text-white/50 text-sm">{chapterError}</p>
                  <button
                    onClick={() => { setChapterError(null); setLoadingChapter(true); fetchChapter(selectedBook!.num, selectedChapter, translation).then((d) => { setChapterData(d); setChapterError(null); }).catch((e) => setChapterError(e.message ?? "Failed to load")).finally(() => setLoadingChapter(false)); }}
                    className="text-xs font-bold px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {chapterData && (() => {
                const visibleVerses = activeFocusedRange
                  ? chapterData.verses.filter((verse) => verse.verse >= activeFocusedRange.start && verse.verse <= activeFocusedRange.end)
                  : chapterData.verses;

                return (
                  <>
                    {activeFocusedRange && (
                      <div
                        className="mb-7 rounded-[24px] border p-4 flex items-center gap-3"
                        style={{
                          background: isLight ? "#f4f5f6" : "rgba(255,255,255,0.055)",
                          borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[10px] font-black uppercase tracking-[0.18em]"
                            style={{ color: isLight ? "rgba(0,0,0,0.46)" : "rgba(255,255,255,0.50)" }}
                          >
                            {lang === "es" ? "Pasaje seleccionado" : "Selected Passage"}
                          </p>
                          <p className="mt-1 truncate text-[18px] font-black tracking-[-0.02em]" style={{ color: isLight ? "#080808" : "#ffffff" }}>
                            {focusedReferenceLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFocusedVerseRange(null);
                            setSelectedVerseNums([]);
                            window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
                          }}
                          className="rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
                          style={{
                            background: isLight ? "#e5e7eb" : "rgba(255,255,255,0.08)",
                            color: isLight ? "#111111" : "#ffffff",
                          }}
                        >
                          {lang === "es" ? "Leer capítulo" : "Read chapter"}
                        </button>
                      </div>
                    )}

                    <div
                      className={`${FONT_SIZE_CLASSES[fontSize]} ${FONT_SIZE_LEADING_CLASSES[fontSize]}`}
                      style={{ fontFamily: activeFontFamily }}
                      translate="no"
                    >
                      {visibleVerses.map((verse) => {
                        const color = verseColors[verse.verse];
                        const colorCfg = color ? HIGHLIGHT_COLORS[color] : null;
                        const isSelected = selectedVerseNums.includes(verse.verse);
                        return (
                          <span
                            key={verse.verse}
                            ref={(el) => { if (el) verseRefs.current[verse.verse] = el as unknown as HTMLDivElement; }}
                            className="relative inline cursor-pointer"
                            style={{
                              ...(colorCfg ? {
                                backgroundColor: `rgba(${colorCfg.bgRgb},0.78)`,
                                color: colorCfg.textColor,
                              } : {}),
                              ...(isSelected ? {
                                textDecorationLine: "underline",
                                textDecorationStyle: "dotted",
                                textDecorationColor: colorCfg ? colorCfg.dot : (isLight ? "rgba(0,0,0,0.35)" : "rgba(201,169,97,0.95)"),
                                textUnderlineOffset: "5px",
                                textDecorationThickness: "2px",
                              } : {}),
                              borderRadius: "4px",
                              padding: "2px 4px",
                              boxDecorationBreak: "clone",
                              WebkitBoxDecorationBreak: "clone",
                            }}
                            onClick={(e) => handleVerseClick(verse.verse, e)}
                            title={isSelected ? "Selected. Tap another verse to add it." : color ? "Tap to change or remove highlight" : "Tap to select this verse"}
                          >
                            <span
                              className="font-black align-super select-none"
                              style={colorCfg ? {
                                backgroundColor: `rgba(0,0,0,0.25)`,
                                borderRadius: "0.22em",
                                padding: "0 0.18em",
                                marginLeft: "0.12em",
                                marginRight: "0.18em",
                                color: "rgba(255,255,255,0.9)",
                                fontSize: "clamp(12px, 0.46em, 24px)",
                                lineHeight: 1,
                              } : {
                                color: theme === "gold-navy" ? "rgba(201,169,97,0.72)" : (isLight ? "rgba(0,0,0,0.48)" : "rgba(201,169,97,0.68)"),
                                marginLeft: "0.08em",
                                marginRight: "0.18em",
                                fontSize: "clamp(12px, 0.46em, 24px)",
                                lineHeight: 1,
                              }}
                            >
                              {verse.verse}
                            </span>
                            {verse.text}
                            {" "}
                          </span>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

            </div>
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
                <button onClick={() => setShowNotes(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors" aria-label={lang === "es" ? "Cerrar notas" : "Close notes"}>
                  <UiIcon name="close" size={14} />
                </button>
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


      {/* ── Floating reader bar ── */}
      {activeTab === "reader" && (
        <div className="scripture-reader-bar fixed left-0 right-0 z-40 px-4 print:hidden"
          style={{ bottom: "calc(76px + max(env(safe-area-inset-bottom), 0px))" }}>
          <div
            className="le-chapter-nav rounded-[28px] shadow-2xl border grid grid-cols-[54px_1fr_54px] items-center gap-2 p-1.5"
            style={{
              background: isLight ? "rgba(246,247,248,0.98)" : "rgba(19,20,24,0.96)",
              borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)",
              boxShadow: isLight ? "0 16px 32px rgba(15,23,42,0.12)" : "0 18px 42px rgba(0,0,0,0.45)",
            }}
          >

            {/* Prev chapter */}
            <button
              onClick={goPrev}
              className="le-nav-arrow h-[52px] w-[52px] rounded-[22px] flex items-center justify-center transition-transform active:scale-95"
              style={{
                background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                color: isLight ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.62)",
                border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.05)",
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Book + chapter — opens picker */}
            <button
              onClick={() => {
                setPickerView("books");
                setPickerBook(selectedBook);
                setTestamentFilter("ALL");
                setPickerBookSearch("");
                setShowBookPicker(true);
              }}
              className="min-w-0 h-[52px] rounded-[22px] border flex items-center justify-center px-4 transition-transform active:scale-[0.99]"
              style={{
                background: isLight ? "#ffffff" : "rgba(255,255,255,0.045)",
                borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
              }}
            >
              <span className="min-w-0 flex items-baseline justify-center gap-2 text-center">
                <span
                  className="min-w-0 truncate text-[18px] font-black leading-none tracking-[-0.02em]"
                  style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}
                >
                  {getBookDisplayName(selectedBook, translation)}
                </span>
                <span
                  className="shrink-0 text-[18px] font-black leading-none"
                  style={{ color: isLight ? "#111111" : "#f4f4f4" }}
                >
                  {selectedChapter}
                </span>
              </span>
            </button>

            {/* Next chapter */}
            <button
              onClick={goNext}
              className="le-nav-arrow h-[52px] w-[52px] rounded-[22px] flex items-center justify-center transition-transform active:scale-95"
              style={{
                background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                color: isLight ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.62)",
                border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.05)",
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Book / Chapter picker sheet ── */}
      {showBookPicker && (
        <div
          className="fixed inset-0 z-[90] print:hidden"
          style={{ background: isLight ? "#ffffff" : "#101010", color: isLight ? "#0a0a0a" : "#f5f5f5" }}
        >
          <div
            className="h-full w-full max-w-xl mx-auto flex flex-col"
            style={{ paddingTop: "max(env(safe-area-inset-top), 22px)" }}
          >

            {/* Books view */}
            {pickerView === "books" && (
              <>
                <div className="px-7 pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setShowBookPicker(false)}
                      className="h-11 w-11 -ml-2 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: isLight ? "#111111" : "#ffffff", background: "transparent" }}
                      aria-label={lang === "es" ? "Cerrar libros" : "Close books"}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <h2 className="flex-1 text-[30px] font-semibold tracking-[-0.04em]">
                      {lang === "es" ? "Libros" : "Books"}
                    </h2>

                  </div>

                  <div
                    className="mt-4 h-[58px] rounded-full flex items-center gap-4 px-5"
                    style={{ background: isLight ? "#f2f3f5" : "#343232", color: isLight ? "#111111" : "#ffffff" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ opacity: 0.78 }}>
                      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.2" />
                      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    <input
                      type="search"
                      value={pickerBookSearch}
                      onChange={(e) => setPickerBookSearch(e.target.value)}
                      placeholder={lang === "es" ? "Buscar" : "Search"}
                      className="min-w-0 flex-1 bg-transparent outline-none font-medium placeholder:opacity-70"
                      style={{ fontSize: "21px", color: "inherit" }}
                    />
                    {pickerBookSearch && (
                      <button
                        type="button"
                        onClick={() => setPickerBookSearch("")}
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ background: isLight ? "#e5e7eb" : "rgba(255,255,255,0.08)", color: "inherit" }}
                        aria-label={lang === "es" ? "Limpiar búsqueda" : "Clear search"}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {pickerLastBook && pickerLastPosition && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBook(pickerLastBook);
                        setSelectedChapter(Math.max(1, Math.min(pickerLastPosition.chapter, pickerLastBook.chapters)));
                        setShowBookPicker(false);
                        setPickerBookSearch("");
                      }}
                      className="motion-pressable tap-target ui-interactive mt-3 w-full rounded-[22px] px-5 py-3 text-left"
                      style={{
                        background: isLight ? "#f2f3f5" : "rgba(255,255,255,0.07)",
                        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.09)",
                        color: isLight ? "#111111" : "#ffffff",
                      }}
                      aria-label={`${lang === "es" ? "Continuar" : "Continue"} ${getBookDisplayName(pickerLastBook, translation)} ${pickerLastPosition.chapter}`}
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span className="min-w-0">
                          <span className="block text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.45)" }}>
                            {lang === "es" ? "Continuar lectura" : "Continue reading"}
                          </span>
                          <span className="mt-1 block truncate text-base font-black">
                            {getBookDisplayName(pickerLastBook, translation)} {pickerLastPosition.chapter}
                          </span>
                        </span>
                        <span
                          className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em]"
                          style={{ background: isLight ? "#ffffff" : "rgba(255,255,255,0.08)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.10)" }}
                        >
                          {lang === "es" ? "Abrir" : "Open"}
                        </span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 px-9 pb-24">
                  {pickerUsingSuggestions && (
                    <div className="pb-3 pt-1">
                      <p
                        className="text-[11px] font-black uppercase tracking-[0.2em]"
                        style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.48)" }}
                      >
                        {lang === "es" ? "Sugerencias" : "Suggestions"}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: isLight ? "rgba(0,0,0,0.52)" : "rgba(255,255,255,0.55)" }}>
                        {lang === "es" ? "Libros cercanos a lo que escribes." : "Closest books to what you are typing."}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col">
                    {visibleBooks.map((b) => (
                      <button
                        key={b.num}
                        onClick={() => { setPickerBook(b); setPickerView("chapters"); }}
                        className="w-full text-left py-[13px] transition-opacity active:opacity-60"
                        style={{ color: selectedBook?.num === b.num ? (isLight ? "#000000" : "#ffffff") : (isLight ? "#242424" : "#eeeeee") }}
                      >
                        <span className="block text-[26px] leading-tight font-normal tracking-[-0.03em]">
                          {getBookDisplayName(b, translation)}
                        </span>
                        {pickerUsingSuggestions && (
                          <span className="mt-1 block text-sm font-medium" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)" }}>
                            {b.chapters} {lang === "es" ? "capítulos" : "chapters"} · {b.testament === "OT" ? (lang === "es" ? "Antiguo Testamento" : "Old Testament") : (lang === "es" ? "Nuevo Testamento" : "New Testament")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {visibleBooks.length === 0 && (
                    <div className="py-16 text-center" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
                      <p className="text-lg font-semibold">{lang === "es" ? "No se encontró ese libro." : "No book found."}</p>
                      <p className="mx-auto mt-2 max-w-xs text-sm">
                        {lang === "es" ? "Prueba una abreviatura como Rom, Jn o Sal." : "Try an abbreviation like Rom, Jn, or Ps."}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Chapters view */}
            {pickerView === "chapters" && pickerBook && (
              <>
                <div
                  className="px-7 pb-4 flex items-center gap-3 flex-shrink-0"
                  style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}
                >
                  <button
                    onClick={() => setPickerView("books")}
                    className="h-11 w-11 -ml-2 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: isLight ? "#111111" : "#ffffff" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[28px] font-semibold tracking-[-0.04em]">{getBookDisplayName(pickerBook, translation)}</p>
                    <p className="text-sm mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
                      {pickerBook.chapters} {lang === "es" ? "capítulos" : "chapters"}
                    </p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 px-7 pb-24 pt-5">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: pickerBook.chapters }, (_, i) => i + 1).map((ch) => (
                      <button key={ch}
                        onClick={() => {
                          setSelectedBook(pickerBook);
                          setSelectedChapter(ch);
                          setFocusedVerseRange(null);
                          setSelectedVerseNums([]);
                          setShowBookPicker(false);
                          setPickerView("books");
                        }}
                        className="aspect-square rounded-2xl flex items-center justify-center text-lg font-semibold transition-colors active:scale-95"
                        style={{
                          background: selectedBook?.num === pickerBook.num && selectedChapter === ch
                            ? (isLight ? "#e5e7eb" : "#ffffff")
                            : (isLight ? "#f2f3f5" : "#242424"),
                          color: selectedBook?.num === pickerBook.num && selectedChapter === ch
                            ? "#0b0b0b"
                            : (isLight ? "#111111" : "#f2f2f2"),
                          border: selectedBook?.num === pickerBook.num && selectedChapter === ch && isLight
                            ? "1px solid #d1d5db"
                            : "1px solid transparent",
                        }}
                      >
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

      {/* Verse selection tray — slides up from bottom */}
      <VerseSelectionTray
        visible={selectedVerseNums.length > 0}
        selectedVerseNums={selectedVerseNums}
        selectedText={selectedVerseText}
        selectedReference={selectedReference}
        bookName={selectedBook?.name ?? ""}
        chapter={selectedChapter}
        verseColors={verseColors}
        onSelect={(c) => {
          selectedVerseNums.forEach((verseNum) => setVerseColor(verseNum, c));
          setSelectedVerseNums([]);
        }}
        onRemove={() => {
          selectedVerseNums.forEach((verseNum) => clearVerseColor(verseNum));
          setSelectedVerseNums([]);
        }}
        onClearSelection={() => setSelectedVerseNums([])}
        onBookmark={(data) => setBookmarkPopup(data)}
      />

      {/* Bookmark popup — category picker */}
      {bookmarkPopup && (
        <BookmarkPopup
          ref_={bookmarkPopup.ref}
          text={bookmarkPopup.text}
          lang={lang}
          onClose={() => setBookmarkPopup(null)}
          onSaved={() => setBookmarkPopup(null)}
        />
      )}
    </div>
  );
}
