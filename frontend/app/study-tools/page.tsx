"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import {
  DICTIONARY_ENTRIES,
  STUDY_TOOL_SOURCES,
  findCompleteCommentaryByReference,
  getBookName,
  listCommentaryChapters,
  searchDictionary,
  type CommentarySearchResult,
  type DictionaryEntry,
} from "../lib/studyToolsData";

type ToolTab = "commentaries" | "dictionary";
const COMMENTARY_PAGE_LIMIT = 1500;
const HENRY_HIGHLIGHTS_KEY = "tulip-matthew-henry-highlights";

type HenryHighlightColor = "gold" | "blue" | "rose" | "green";

type HenryHighlight = {
  id: string;
  text: string;
  color: HenryHighlightColor;
  createdAt: number;
  reference: string;
  sectionTitle: string;
  book: number;
  bookName: string;
  chapter: number;
  verse?: number;
  source: string;
};

type SelectionState = {
  text: string;
  x: number;
  y: number;
};

const HIGHLIGHT_COLORS: Record<HenryHighlightColor, { label: string; bg: string; text: string; dot: string }> = {
  gold:  { label: "Gold",  bg: "rgba(201,169,97,0.35)", text: "#fff4cf", dot: "#c9a961" },
  blue:  { label: "Blue",  bg: "rgba(82,156,255,0.28)", text: "#dbeafe", dot: "#60a5fa" },
  rose:  { label: "Rose",  bg: "rgba(244,114,182,0.28)", text: "#fce7f3", dot: "#f472b6" },
  green: { label: "Green", bg: "rgba(74,222,128,0.24)", text: "#dcfce7", dot: "#4ade80" },
};

function paginateText(text: string, limit = COMMENTARY_PAGE_LIMIT): string[] {
  const clean = text.trim();
  if (!clean) return [""];
  const pages: string[] = [];
  let remaining = clean;

  while (remaining.length > limit) {
    const slice = remaining.slice(0, limit);
    const paragraphBreak = slice.lastIndexOf("\n\n");
    const sentenceBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
    const wordBreak = slice.lastIndexOf(" ");
    const cut = paragraphBreak > limit * 0.45
      ? paragraphBreak + 2
      : sentenceBreak > limit * 0.55
        ? sentenceBreak + 2
        : Math.max(wordBreak, limit);

    pages.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) pages.push(remaining);
  return pages;
}

function loadHenryHighlights(): HenryHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HENRY_HIGHLIGHTS_KEY) ?? "[]") as HenryHighlight[];
  } catch {
    return [];
  }
}

function saveHenryHighlights(highlights: HenryHighlight[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HENRY_HIGHLIGHTS_KEY, JSON.stringify(highlights));
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function splitPageIntoParts(page: string, highlights: HenryHighlight[]) {
  const normalizedHighlights = highlights
    .map((highlight) => ({ ...highlight, normalized: normalizeText(highlight.text) }))
    .filter((highlight) => highlight.normalized.length > 0)
    .sort((a, b) => b.normalized.length - a.normalized.length);

  const parts: { text: string; highlight?: HenryHighlight }[] = [];
  let cursor = 0;

  while (cursor < page.length) {
    const remaining = page.slice(cursor);
    const match = normalizedHighlights
      .map((highlight) => {
        const idx = normalizeText(remaining).indexOf(highlight.normalized);
        return idx >= 0 ? { highlight, idx } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a!.idx - b!.idx))[0];

    if (!match) {
      parts.push({ text: page.slice(cursor) });
      break;
    }

    const compactBefore = normalizeText(remaining).slice(0, match.idx);
    const approxStart = compactBefore.length === 0 ? 0 : remaining.indexOf(compactBefore) + compactBefore.length;
    const rawStart = Math.max(0, approxStart);
    const rawText = remaining.slice(rawStart);
    const words = match.highlight.normalized.split(" ");
    let rawEnd = rawStart;
    let searchFrom = 0;
    for (const word of words) {
      const found = rawText.toLowerCase().indexOf(word.toLowerCase(), searchFrom);
      if (found === -1) break;
      rawEnd = rawStart + found + word.length;
      searchFrom = found + word.length;
    }

    if (rawStart > 0) parts.push({ text: remaining.slice(0, rawStart) });
    parts.push({ text: remaining.slice(rawStart, rawEnd), highlight: match.highlight });
    cursor += Math.max(rawEnd, 1);
  }

  return parts;
}

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 4.5h6.5A3.5 3.5 0 0115 8v12a3.5 3.5 0 00-3.5-3.5H5V4.5z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M19 4.5h-4A3.5 3.5 0 0011.5 8v12a3.5 3.5 0 013.5-3.5h4V4.5z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function DictionaryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function categoryLabel(entry: DictionaryEntry, lang: "en" | "es") {
  if (lang === "en") return entry.category;
  const map: Record<DictionaryEntry["category"], string> = {
    Person: "Persona",
    Place: "Lugar",
    Doctrine: "Doctrina",
    Object: "Objeto",
    Book: "Libro",
  };
  return map[entry.category];
}

export default function StudyToolsPage() {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<ToolTab>("commentaries");
  const [query, setQuery] = useState("");
  const [reader, setReader] = useState<CommentarySearchResult | null>(null);
  const [readerPage, setReaderPage] = useState(0);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [highlights, setHighlights] = useState<HenryHighlight[]>([]);
  const [showHighlightPocket, setShowHighlightPocket] = useState(false);
  const [commentaryResult, setCommentaryResult] = useState<CommentarySearchResult | null>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const readerScrollRef = useRef<HTMLDivElement | null>(null);
  const commentaryChapters = listCommentaryChapters();
  const dictionaryEntries = useMemo(() => searchDictionary(query), [query]);
  const hasReferenceQuery = query.trim().length > 0;
  const readerPages = useMemo(() => paginateText(reader?.text ?? ""), [reader]);
  const currentReaderPage = Math.min(readerPage, Math.max(0, readerPages.length - 1));
  const currentReference = reader
    ? `${reader.bookName} ${reader.chapter}${reader.requestedVerse ? `:${reader.requestedVerse}` : ""}`
    : "";
  const currentHighlights = useMemo(() => {
    if (!reader) return [];
    return highlights.filter((highlight) =>
      highlight.book === reader.book &&
      highlight.chapter === reader.chapter &&
      highlight.sectionTitle === (reader.title ?? `${reader.bookName} ${reader.chapter}`)
    );
  }, [highlights, reader]);
  const currentPageParts = useMemo(
    () => splitPageIntoParts(readerPages[currentReaderPage] ?? "", currentHighlights),
    [readerPages, currentReaderPage, currentHighlights]
  );

  useEffect(() => {
    setHighlights(loadHenryHighlights());
  }, []);

  function openReader(result: CommentarySearchResult) {
    setReader(result);
    setReaderPage(0);
    setSelection(null);
  }

  const persistHighlights = useCallback((next: HenryHighlight[]) => {
    const sorted = [...next].sort((a, b) => b.createdAt - a.createdAt);
    setHighlights(sorted);
    saveHenryHighlights(sorted);
  }, []);

  function addHighlight(color: HenryHighlightColor) {
    if (!reader || !selection?.text.trim()) return;
    const text = normalizeText(selection.text);
    const next = [
      {
        id: `mh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text,
        color,
        createdAt: Date.now(),
        reference: currentReference,
        sectionTitle: reader.title ?? `${reader.bookName} ${reader.chapter}`,
        book: reader.book,
        bookName: reader.bookName,
        chapter: reader.chapter,
        verse: reader.requestedVerse,
        source: reader.source,
      },
      ...highlights,
    ];
    persistHighlights(next);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  function removeHighlight(id: string) {
    persistHighlights(highlights.filter((highlight) => highlight.id !== id));
  }

  const handleReaderSelection = useCallback(() => {
    const selected = window.getSelection();
    const text = normalizeText(selected?.toString() ?? "");
    if (!text || text.length < 4) return;
    const range = selected?.rangeCount ? selected.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    if (!rect) return;
    setSelection({
      text,
      x: Math.min(Math.max(rect.left + rect.width / 2, 88), window.innerWidth - 88),
      y: Math.max(rect.top - 12, 70),
    });
  }, []);

  function openHighlightInReader(highlight: HenryHighlight) {
    openReader({
      book: highlight.book,
      bookName: highlight.bookName,
      chapter: highlight.chapter,
      requestedVerse: highlight.verse,
      matchedVerse: highlight.verse ?? 1,
      source: highlight.source as CommentarySearchResult["source"],
      title: highlight.sectionTitle,
      text: highlight.text,
    });
    setShowHighlightPocket(false);
  }

  useEffect(() => {
    if (!reader) return;
    let timer: number;
    function onSelectionChange() {
      clearTimeout(timer);
      timer = window.setTimeout(handleReaderSelection, 300);
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      clearTimeout(timer);
    };
  }, [reader, handleReaderSelection]);

  useEffect(() => {
    if (tab !== "commentaries" || !query.trim()) {
      setCommentaryResult(null);
      setCommentaryLoading(false);
      return;
    }

    let cancelled = false;
    setCommentaryLoading(true);
    const timer = window.setTimeout(() => {
      findCompleteCommentaryByReference(query).then((result) => {
        if (cancelled) return;
        setCommentaryResult(result);
        setCommentaryLoading(false);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, tab]);

  return (
    <div className="min-h-screen bg-[#0b101d] text-white">
      {reader && (
        <div className="fixed inset-0 z-50 bg-[#0b101d] text-white">
          {selection && (
            <>
            <div className="fixed inset-0 z-[68]" onClick={() => setSelection(null)} />
            <div
              className="fixed z-[70] -translate-x-1/2 rounded-2xl px-3 py-3 shadow-2xl"
              style={{ left: selection.x, top: selection.y, background: "#121827", border: "1px solid rgba(201,169,97,0.28)" }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] font-black mb-2" style={{ color: "#c9a961" }}>
                {lang === "es" ? "Guardar resaltado" : "Save highlight"}
              </p>
              <div className="flex items-center gap-2">
                {(Object.keys(HIGHLIGHT_COLORS) as HenryHighlightColor[]).map((color) => (
                  <button
                    key={color}
                    onClick={() => addHighlight(color)}
                    className="w-9 h-9 rounded-full active:scale-95"
                    style={{ background: HIGHLIGHT_COLORS[color].dot, border: "2px solid rgba(255,255,255,0.72)" }}
                    aria-label={HIGHLIGHT_COLORS[color].label}
                  />
                ))}
              </div>
            </div>
            </>
          )}
          <div className="h-full max-w-lg mx-auto flex flex-col">
            <div
              className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(201,169,97,0.16)", paddingTop: "max(env(safe-area-inset-top), 20px)" }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                  {reader.source}
                </p>
                <h2 className="text-xl font-black mt-1">
                  {reader.bookName} {reader.chapter}
                  {reader.requestedVerse ? `:${reader.requestedVerse}` : ""}
                </h2>
              </div>
              <button
                onClick={() => setReader(null)}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white/60 active:scale-95"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                aria-label={lang === "es" ? "Cerrar lector" : "Close reader"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div ref={readerScrollRef} className="overflow-y-auto flex-1 px-5 py-6">
              <div className="rounded-[30px] p-5 mb-5" style={{ background: "linear-gradient(145deg, rgba(201,169,97,0.14), rgba(255,255,255,0.045))", border: "1px solid rgba(201,169,97,0.22)" }}>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                  {reader.requestedVerse
                    ? lang === "es" ? "Seccion encontrada" : "Matched section"
                    : lang === "es" ? "Capitulo" : "Chapter"}
                </p>
                <h3 className="mt-2 text-3xl font-black leading-tight">
                  {reader.title ?? (reader.requestedVerse
                    ? `${reader.bookName} ${reader.chapter}:${reader.requestedVerse}`
                    : `${reader.bookName} ${reader.chapter}`)}
                </h3>
                {reader.requestedVerse && (
                  <p className="mt-2 text-sm text-white/45">
                    {lang === "es" ? "Matthew Henry explica esta seccion" : "Matthew Henry section"}: {reader.verses?.length ? `v.${reader.verses[0]}-${reader.verses[reader.verses.length - 1]}` : `v.${reader.matchedVerse}`}
                  </p>
                )}
                {currentHighlights.length > 0 && (
                  <button
                    onClick={() => setShowHighlightPocket(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black"
                    style={{ background: "rgba(201,169,97,0.14)", color: "#d7bd78", border: "1px solid rgba(201,169,97,0.18)" }}
                  >
                    {currentHighlights.length} {lang === "es" ? "resaltados guardados" : "saved highlights"}
                  </button>
                )}
              </div>

              <article
                className="rounded-[30px] px-5 py-6"
                style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                    {lang === "es" ? "Pagina" : "Page"} {currentReaderPage + 1} / {readerPages.length}
                  </p>
                  <p className="text-[10px] font-bold text-white/32">
                    {readerPages[currentReaderPage]?.length ?? 0} chars
                  </p>
                </div>
                <p
                  className="text-[18px] leading-9 text-white/80 font-serif whitespace-pre-line select-text"
                  onMouseUp={handleReaderSelection}
                >
                  {currentPageParts.map((part, idx) => part.highlight ? (
                    <mark
                      key={`${part.highlight.id}-${idx}`}
                      onClick={() => removeHighlight(part.highlight!.id)}
                      title={lang === "es" ? "Toca para eliminar" : "Tap to remove"}
                      style={{
                        background: HIGHLIGHT_COLORS[part.highlight.color].bg,
                        color: HIGHLIGHT_COLORS[part.highlight.color].text,
                        borderRadius: "6px",
                        padding: "1px 3px",
                      }}
                    >
                      {part.text}
                    </mark>
                  ) : (
                    <span key={idx}>{part.text}</span>
                  ))}
                </p>
              </article>

              {readerPages.length > 1 && (
                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <button
                    onClick={() => setReaderPage((page) => Math.max(0, page - 1))}
                    disabled={currentReaderPage === 0}
                    className="h-12 rounded-2xl text-sm font-black disabled:opacity-30 active:scale-95"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    ← {lang === "es" ? "Anterior" : "Prev"}
                  </button>
                  <div className="flex items-center gap-1.5">
                    {readerPages.slice(0, 7).map((_, idx) => (
                      <span
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: idx === currentReaderPage ? "#c9a961" : "rgba(255,255,255,0.18)" }}
                      />
                    ))}
                    {readerPages.length > 7 && <span className="text-white/25 text-xs">+</span>}
                  </div>
                  <button
                    onClick={() => setReaderPage((page) => Math.min(readerPages.length - 1, page + 1))}
                    disabled={currentReaderPage >= readerPages.length - 1}
                    className="h-12 rounded-2xl text-sm font-black disabled:opacity-30 active:scale-95"
                    style={{ background: "#c9a961", color: "#10131d" }}
                  >
                    {lang === "es" ? "Siguiente" : "Next"} →
                  </button>
                </div>
              )}

              <div className="mt-5 rounded-[24px] px-4 py-4" style={{ background: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.14)" }}>
                <p className="text-xs leading-relaxed text-white/48">
                  {lang === "es"
                    ? "Texto de dominio publico de Matthew Henry. El lector permanece dentro de Herramientas de Estudio."
                    : "Public-domain Matthew Henry text. This reader stays inside Study Tools."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHighlightPocket && (
        <div className="fixed inset-0 z-[65] bg-black/65 backdrop-blur-md px-5 py-6 text-white">
          <div className="max-w-lg mx-auto h-full rounded-[32px] overflow-hidden flex flex-col" style={{ background: "#0b101d", border: "1px solid rgba(201,169,97,0.20)" }}>
            <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(201,169,97,0.14)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                  Matthew Henry
                </p>
                <h2 className="text-2xl font-black">{lang === "es" ? "Mis Resaltados" : "My Highlights"}</h2>
              </div>
              <button
                onClick={() => setShowHighlightPocket(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {highlights.length === 0 ? (
                <div className="rounded-[24px] p-6 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="font-black text-white/70">{lang === "es" ? "Aun no hay resaltados" : "No highlights yet"}</p>
                  <p className="text-sm text-white/38 mt-2">
                    {lang === "es" ? "Selecciona texto en el lector para guardar una explicacion." : "Select text in the reader to save an explanation."}
                  </p>
                </div>
              ) : highlights.map((highlight) => (
                <article key={highlight.id} className="rounded-[24px] p-4" style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>
                        {highlight.reference}
                      </p>
                      <h3 className="text-sm font-black mt-1 text-white/80">{highlight.sectionTitle}</h3>
                    </div>
                    <button onClick={() => removeHighlight(highlight.id)} className="text-white/30 text-sm font-black">✕</button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/64">
                    “{highlight.text}”
                  </p>
                  <button
                    onClick={() => openHighlightInReader(highlight)}
                    className="mt-4 text-xs font-black px-3 py-2 rounded-full"
                    style={{ background: "rgba(201,169,97,0.12)", color: "#d7bd78" }}
                  >
                    {lang === "es" ? "Abrir resaltado" : "Open highlight"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-5 pt-7 pb-32">
        <header className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.26em]" style={{ color: "#c9a961" }}>
            {lang === "es" ? "Herramientas de estudio" : "Study Tools"}
          </p>
          <h1 className="mt-2 text-[34px] leading-none font-black tracking-tight">
            {lang === "es" ? "Comentario y Diccionario" : "Commentaries & Dictionaries"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/52">
            {lang === "es"
              ? "Matthew Henry, definiciones biblicas y recursos organizados para estudiar desde el telefono."
              : "Matthew Henry, Bible definitions, and organized tools built for focused phone study."}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 mb-6">
          {STUDY_TOOL_SOURCES.map((source) => (
            <div
              key={source.id}
              className="rounded-[24px] p-4 border"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(201,169,97,0.075))",
                borderColor: "rgba(201,169,97,0.20)",
              }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(201,169,97,0.15)", color: "#d7bd78" }}>
                {source.id === "bible-dictionary" ? <DictionaryIcon /> : <BookIcon />}
              </div>
              <h2 className="text-sm font-black leading-tight">
                {lang === "es" ? source.titleEs : source.title}
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-white/42">
                {lang === "es" ? source.descriptionEs : source.description}
              </p>
            </div>
          ))}
        </section>

        <div className="flex rounded-full p-1 mb-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { key: "commentaries" as const, label: lang === "es" ? "Comentarios" : "Commentaries" },
            { key: "dictionary" as const, label: lang === "es" ? "Diccionario" : "Dictionary" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="flex-1 h-11 rounded-full text-sm font-black transition-all"
              style={{
                background: tab === item.key ? "#c9a961" : "transparent",
                color: tab === item.key ? "#10131d" : "rgba(255,255,255,0.52)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "commentaries" && (
          <button
            onClick={() => setShowHighlightPocket(true)}
            className="w-full rounded-[24px] px-5 py-4 mb-5 text-left active:scale-[0.99]"
            style={{ background: "rgba(201,169,97,0.10)", border: "1px solid rgba(201,169,97,0.18)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                  {lang === "es" ? "En tu bolsillo" : "In your pocket"}
                </p>
                <h2 className="text-lg font-black mt-1">{lang === "es" ? "Mis resaltados de Henry" : "My Henry Highlights"}</h2>
                <p className="text-xs text-white/42 mt-1">
                  {highlights.length} {lang === "es" ? "explicaciones guardadas" : "saved explanations"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#c9a961", color: "#10131d" }}>
                <BookIcon />
              </div>
            </div>
          </button>
        )}

        <label className="block rounded-[24px] px-4 py-4 mb-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,169,97,0.16)" }}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: "#c9a961" }}>
            {tab === "commentaries"
              ? lang === "es" ? "Buscar un versiculo" : "Search a verse"
              : lang === "es" ? "Buscar una palabra" : "Search a word"}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/35 flex-shrink-0">
              <path d="M21 21l-4.5-4.5M10.8 18a7.2 7.2 0 100-14.4 7.2 7.2 0 000 14.4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "commentaries"
                ? lang === "es" ? "Ej. Romanos 1:1, Juan 3:16" : "Ex. Romans 1:1, John 3:16"
                : lang === "es" ? "Ej. pacto, justificacion, Sion" : "Ex. covenant, justification, Zion"}
              className="w-full bg-transparent outline-none text-base font-bold text-white placeholder:text-white/28"
            />
          </div>
        </label>

        {tab === "commentaries" ? (
          <section className="space-y-4">
            {hasReferenceQuery && commentaryLoading && (
              <div className="rounded-[24px] p-5 border flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-[#c9a961] animate-spin" />
                <p className="text-sm font-bold text-white/55">
                  {lang === "es" ? "Buscando en Matthew Henry..." : "Searching Matthew Henry..."}
                </p>
              </div>
            )}

            {hasReferenceQuery && !commentaryLoading && (
              commentaryResult ? (
                <article className="rounded-[28px] p-5 border" style={{ background: "linear-gradient(145deg, rgba(201,169,97,0.13), rgba(255,255,255,0.045))", borderColor: "rgba(201,169,97,0.26)" }}>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                    {commentaryResult.source}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {commentaryResult.title ?? `${commentaryResult.bookName} ${commentaryResult.chapter}${commentaryResult.requestedVerse ? `:${commentaryResult.requestedVerse}` : ""}`}
                  </h2>
                  {commentaryResult.requestedVerse && (
                    <p className="mt-1 text-xs text-white/40">
                      {lang === "es" ? "Seccion de Henry" : "Henry section"}: {commentaryResult.verses?.length ? `v.${commentaryResult.verses[0]}-${commentaryResult.verses[commentaryResult.verses.length - 1]}` : `v.${commentaryResult.matchedVerse}`}
                    </p>
                  )}
                  <p className="mt-4 text-[15px] leading-7 text-white/74">
                    {commentaryResult.text.length > 480 ? `${commentaryResult.text.slice(0, 480)}...` : commentaryResult.text}
                  </p>
                  <button
                    onClick={() => openReader(commentaryResult)}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black"
                    style={{ background: "#c9a961", color: "#10131d" }}
                  >
                    {lang === "es" ? "Leer Comentario" : "Read Commentary"}
                    <span>→</span>
                  </button>
                </article>
              ) : (
                <div className="rounded-[24px] p-5 border text-center" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-sm font-bold text-white/72">
                    {lang === "es" ? "No encontre esa referencia." : "I could not find that reference."}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/42">
                    {lang === "es"
                      ? "Prueba algo como Romanos 1:5, Juan 3:16, Salmo 23:1 o Genesis 1:1."
                      : "Try something like Romans 1:5, John 3:16, Psalm 23:1, or Genesis 1:1."}
                  </p>
                </div>
              )
            )}

            <div className="rounded-[28px] p-5 border" style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(201,169,97,0.16)" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#c9a961", color: "#10131d" }}>
                  <BookIcon />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>
                    {lang === "es" ? "Dominio publico" : "Public domain"}
                  </p>
                  <h2 className="text-xl font-black mt-1">Matthew Henry</h2>
                  <p className="text-sm text-white/48 leading-relaxed mt-2">
                    {lang === "es"
                      ? "Comentario completo de dominio publico, cargado por capitulo para que el telefono no tenga que cargarlo todo de una vez."
                      : "Complete public-domain commentary, loaded by chapter so the phone never has to load the whole library at once."}
                  </p>
                </div>
              </div>
            </div>

            {!hasReferenceQuery && commentaryChapters.map((chapter) => (
              <button
                key={`${chapter.book}-${chapter.chapter}`}
                onClick={() => openReader({
                  book: chapter.book,
                  bookName: getBookName(chapter.book),
                  chapter: chapter.chapter,
                  matchedVerse: chapter.entries[0]?.verse ?? 0,
                  source: chapter.source,
                  text: chapter.entries.map((entry) => `v.${entry.verse} — ${entry.text}`).join("\n\n"),
                })}
                className="block w-full text-left rounded-[24px] p-4 border active:scale-[0.99] transition-transform"
                style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: "#c9a961" }}>
                      {chapter.source}
                    </p>
                    <h3 className="text-lg font-black mt-1">
                      {getBookName(chapter.book)} {chapter.chapter}
                    </h3>
                    <p className="text-xs text-white/42 mt-1">
                      {chapter.entries.length} {lang === "es" ? "entradas disponibles" : "entries available"}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,97,0.14)", color: "#c9a961" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <section>
            <div className="space-y-3">
              {(query ? dictionaryEntries : DICTIONARY_ENTRIES).map((entry) => (
                <article key={entry.id} className="rounded-[24px] p-4 border" style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: "#c9a961" }}>
                        {categoryLabel(entry, lang)}
                      </p>
                      <h3 className="text-xl font-black mt-1">{lang === "es" ? entry.termEs : entry.term}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,97,0.14)", color: "#c9a961" }}>
                      <DictionaryIcon />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    {lang === "es" ? entry.definitionEs : entry.definition}
                  </p>
                  {entry.originalLanguages && entry.originalLanguages.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {entry.originalLanguages.map((note) => (
                        <div
                          key={`${entry.id}-${note.strongs}`}
                          className="rounded-2xl px-3 py-3"
                          style={{ background: "rgba(201,169,97,0.10)", border: "1px solid rgba(201,169,97,0.14)" }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: "#c9a961" }}>
                              {note.language} · {note.strongs}
                            </p>
                            <p className="text-sm font-black text-white">{note.lemma}</p>
                          </div>
                          <p className="mt-1 text-xs text-white/50">
                            {note.transliteration} — {note.meaning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {entry.references.map((ref) => (
                      <span key={ref} className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(201,169,97,0.12)", color: "#d7bd78" }}>
                        {ref}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
