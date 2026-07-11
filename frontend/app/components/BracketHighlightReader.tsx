"use client";

import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";
import {
  deleteReaderHighlight,
  getReaderHighlights,
  saveReaderHighlight,
  type UnifiedReaderHighlight,
} from "../lib/unifiedHighlights";
import CreateImageEditor from "./CreateImageEditor";

type HighlightColor = "gold" | "blue" | "rose" | "green";

type ReaderHighlight = {
  id: string;
  text: string;
  color: HighlightColor;
  createdAt: number;
  context: string;
  title: string;
  reference: string;
};

type BracketSelection = {
  start: number;
  end: number;
};

type ReaderToken =
  | { type: "word"; text: string; index: number; highlight?: ReaderHighlight }
  | { type: "space"; text: string; highlight?: ReaderHighlight }
  | { type: "break"; text: string };

type HighlightRect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
};

type SelectionGeometry = {
  rects: HighlightRect[];
  startHandle?: { left: number; top: number };
  endHandle?: { left: number; top: number };
};

type Props = {
  context: string;
  text: string;
  title: string;
  reference: string;
  textColor: string;
  className?: string;
  headingColor?: string;
  fontSizeClass?: string;
  scrollRef?: React.RefObject<HTMLElement | null>;
  targetHighlightId?: string;
};

const HIGHLIGHT_COLORS: Record<HighlightColor, { label: string; labelEs: string; bg: string; dot: string }> = {
  gold:  { label: "Highlight", labelEs: "Resaltar", bg: "rgba(201,169,97,0.58)", dot: "#c9a961" },
  blue:  { label: "Blue",      labelEs: "Azul",      bg: "rgba(82,156,255,0.58)", dot: "#60a5fa" },
  rose:  { label: "Rose",      labelEs: "Rosa",      bg: "rgba(244,114,182,0.56)", dot: "#f472b6" },
  green: { label: "Green",     labelEs: "Verde",     bg: "rgba(74,222,128,0.52)", dot: "#4ade80" },
};

const ACTIVE_SELECTION_BG = "rgba(54,97,208,0.58)";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function renderInlineText(value: string) {
  return value
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/<[^>]+>/g, "");
}

function selectedRange(selection: BracketSelection | null) {
  if (!selection) return null;
  return {
    start: Math.min(selection.start, selection.end),
    end: Math.max(selection.start, selection.end),
  };
}

function splitTextByHighlights(text: string, highlights: ReaderHighlight[]) {
  const cleanText = renderInlineText(text);
  const normalizedHighlights = highlights
    .map((highlight) => ({ ...highlight, normalized: normalizeText(highlight.text) }))
    .filter((highlight) => highlight.normalized.length > 0)
    .sort((a, b) => b.normalized.length - a.normalized.length);

  const parts: { text: string; highlight?: ReaderHighlight }[] = [];
  let cursor = 0;

  while (cursor < cleanText.length) {
    const remaining = cleanText.slice(cursor);
    const normalizedRemaining = normalizeText(remaining);
    const match = normalizedHighlights
      .map((highlight) => {
        const idx = normalizedRemaining.toLowerCase().indexOf(highlight.normalized.toLowerCase());
        return idx >= 0 ? { highlight, idx } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.idx - b!.idx)[0];

    if (!match) {
      parts.push({ text: cleanText.slice(cursor) });
      break;
    }

    const compactBefore = normalizedRemaining.slice(0, match.idx);
    const rawStart = compactBefore.length === 0 ? 0 : Math.max(0, remaining.indexOf(compactBefore) + compactBefore.length);
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

function tokenize(parts: { text: string; highlight?: ReaderHighlight }[]): ReaderToken[] {
  let wordIndex = 0;
  const tokens: ReaderToken[] = [];

  parts.forEach((part) => {
    part.text.split(/(\s+)/).forEach((chunk) => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        tokens.push(chunk.includes("\n")
          ? { type: "break", text: "\n\n" }
          : { type: "space", text: " ", highlight: part.highlight });
        return;
      }
      tokens.push({ type: "word", text: chunk, index: wordIndex, highlight: part.highlight });
      wordIndex += 1;
    });
  });

  return tokens;
}

export function BracketHighlightReader({
  context,
  text,
  title,
  reference,
  textColor,
  className = "",
  fontSizeClass = "text-[18px]",
  scrollRef,
  targetHighlightId,
}: Props) {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const activeTheme = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) ?? theme;
  const isLight = activeTheme === "white-noir";
  const [selection, setSelection] = useState<BracketSelection | null>(null);
  const [highlights, setHighlights] = useState<ReaderHighlight[]>([]);
  const [selectionGeometry, setSelectionGeometry] = useState<SelectionGeometry>({ rects: [] });
  const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);
  const [showPocket, setShowPocket] = useState(false);
  const [highlightSearchQuery, setHighlightSearchQuery] = useState("");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const activeHandle = useRef<"start" | "end" | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef) return;
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-app-reader-open", "true");
    return () => {
      document.documentElement.removeAttribute("data-app-reader-open");
    };
  }, [scrollRef]);

  // Scroll to target highlight when navigated from library
  useEffect(() => {
    if (!targetHighlightId) return;
    const container = scrollRef?.current ?? textLayerRef.current;
    if (!container) return;
    const timer = setTimeout(() => {
      const el = (scrollRef?.current ?? document).querySelector(`[data-hl-id="${targetHighlightId}"]`);
      if (el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [targetHighlightId, highlights]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setHighlights(getReaderHighlights(context).map((highlight) => ({
      id: highlight.id,
      text: highlight.text,
      color: (highlight.color ?? "gold") as HighlightColor,
      createdAt: highlight.createdAt ?? Date.now(),
      context: highlight.context ?? context,
      title: highlight.title ?? title,
      reference: highlight.reference ?? reference,
    })));
    setSelection(null);
    setPendingRemoveId(null);
    setHighlightSearchQuery("");
  }, [context, title, reference]);

  const parts = useMemo(() => splitTextByHighlights(text, highlights), [text, highlights]);
  const tokens = useMemo(() => tokenize(parts), [parts]);
  const selectedText = useMemo(() => {
    const range = selectedRange(selection);
    if (!range) return "";
    return normalizeText(tokens
      .filter((token) => token.type === "word" && token.index >= range.start && token.index <= range.end)
      .map((token) => token.text)
      .join(" "));
  }, [tokens, selection]);
  const visibleHighlights = useMemo(() => {
    const sorted = [...highlights].sort((a, b) => b.createdAt - a.createdAt);
    const needle = normalizeText(highlightSearchQuery).toLowerCase();
    if (!needle) return sorted;

    return sorted.filter((highlight) =>
      normalizeText([highlight.title, highlight.reference, highlight.text].join(" "))
        .toLowerCase()
        .includes(needle)
    );
  }, [highlights, highlightSearchQuery]);
  const highlightsBySection = useMemo(() => {
    const sections = new Map<string, ReaderHighlight[]>();
    visibleHighlights.forEach((highlight) => {
      const sectionTitle = highlight.title || highlight.reference;
      const current = sections.get(sectionTitle) ?? [];
      current.push(highlight);
      sections.set(sectionTitle, current);
    });

    return Array.from(sections.entries()).map(([sectionTitle, items]) => ({
      sectionTitle,
      items,
    }));
  }, [visibleHighlights]);

  const persistHighlights = useCallback((next: ReaderHighlight[]) => {
    const sorted = [...next].sort((a, b) => b.createdAt - a.createdAt);
    setHighlights(sorted);
  }, [context]);

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function startWordPress(index: number, highlight?: ReaderHighlight) {
    clearLongPressTimer();
    if (highlight) return;
    longPressTimer.current = window.setTimeout(() => {
      setSelection({ start: index, end: index });
      if ("vibrate" in navigator) navigator.vibrate?.(12);
      longPressTimer.current = null;
    }, 360);
  }

  function finishWordPress() {
    clearLongPressTimer();
    activeHandle.current = null;
  }

  function addHighlightForSelection(color: HighlightColor) {
    const selected = normalizeText(selectedText);
    if (selected.length < 2) return;
    const newHighlight: ReaderHighlight = {
      id: `reader_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text: selected,
      color,
      createdAt: Date.now(),
      context,
      title,
      reference,
    };
    persistHighlights([newHighlight, ...highlights]);
    saveReaderHighlight(context, newHighlight as UnifiedReaderHighlight);
    setSelection(null);
  }

  function removeHighlight(id: string) {
    persistHighlights(highlights.filter((highlight) => highlight.id !== id));
    deleteReaderHighlight(context, id);
    setPendingRemoveId(null);
  }

  function clearSelection() {
    setSelection(null);
    setPendingRemoveId(null);
    activeHandle.current = null;
    clearLongPressTimer();
  }

  function openUnifiedHighlights() {
    if (typeof window !== "undefined") window.location.href = "/highlights";
  }

  async function copySelection() {
    const selected = normalizeText(selectedText);
    if (!selected) return;
    try {
      await navigator.clipboard?.writeText(selected);
    } catch {}
  }

  function getWordIndexFromPoint(clientX: number, clientY: number) {
    const directTarget = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const directWord = directTarget?.closest<HTMLElement>("[data-reader-word]");
    const directIndex = Number(directWord?.dataset.index);
    if (Number.isFinite(directIndex)) return directIndex;

    const words = Array.from(textLayerRef.current?.querySelectorAll<HTMLElement>("[data-reader-word]") ?? []);
    let closestIndex: number | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const word of words) {
      const rect = word.getBoundingClientRect();
      const clampedX = Math.max(rect.left, Math.min(clientX, rect.right));
      const clampedY = Math.max(rect.top, Math.min(clientY, rect.bottom));
      const distance = Math.hypot(clientX - clampedX, clientY - clampedY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = Number(word.dataset.index);
      }
    }

    return closestIndex;
  }

  function beginHandleDrag(handle: "start" | "end", event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    activeHandle.current = handle;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function updateHandleDrag(event: PointerEvent) {
    if (!activeHandle.current || !selection) return;
    const scrollEl = scrollRef?.current;
    if (scrollEl) {
      const rect = scrollEl.getBoundingClientRect();
      if (event.clientY < rect.top + 88) {
        scrollEl.scrollBy({ top: -24, behavior: "auto" });
      } else if (event.clientY > rect.bottom - 132) {
        scrollEl.scrollBy({ top: 24, behavior: "auto" });
      }
    }
    const index = getWordIndexFromPoint(event.clientX, event.clientY);
    if (index === null || !Number.isFinite(index)) return;
    setSelection((current) => {
      if (!current || !activeHandle.current) return current;
      return activeHandle.current === "start"
        ? { ...current, start: index }
        : { ...current, end: index };
    });
  }

  function getRectsForWordRange(start: number, end: number, color: string, idPrefix: string): HighlightRect[] {
    const layer = textLayerRef.current;
    if (!layer) return [];
    const layerRect = layer.getBoundingClientRect();
    const words = Array.from(layer.querySelectorAll<HTMLElement>("[data-reader-word]"))
      .map((word) => ({ index: Number(word.dataset.index), rect: word.getBoundingClientRect() }))
      .filter((item) => Number.isFinite(item.index) && item.index >= start && item.index <= end && item.rect.width > 1);

    const lines: Array<{ top: number; bottom: number; left: number; right: number }> = [];
    words.forEach(({ rect }) => {
      const existing = lines.find((line) => Math.abs(line.top - rect.top) < 10);
      if (existing) {
        existing.top = Math.min(existing.top, rect.top);
        existing.bottom = Math.max(existing.bottom, rect.bottom);
        existing.left = Math.min(existing.left, rect.left);
        existing.right = Math.max(existing.right, rect.right);
      } else {
        lines.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
      }
    });

    return lines
      .sort((a, b) => a.top - b.top)
      .map((line, idx) => {
        const lineHeight = line.bottom - line.top;
        return {
          id: `${idPrefix}-${idx}`,
          left: line.left - layerRect.left - 4,
          top: line.top - layerRect.top - 2,
          width: line.right - line.left + 8,
          height: lineHeight + 4,
          color,
        };
      });
  }

  function refreshHighlightGeometry() {
    const range = selectedRange(selection);
    const selectionRects = range
      ? getRectsForWordRange(range.start, range.end, ACTIVE_SELECTION_BG, "selection")
      : [];

    const first = selectionRects[0];
    const last = selectionRects[selectionRects.length - 1];
    setSelectionGeometry({
      rects: selectionRects,
      startHandle: first ? { left: first.left + 3, top: first.top + first.height - 1 } : undefined,
      endHandle: last ? { left: last.left + last.width - 3, top: last.top + last.height - 1 } : undefined,
    });

    const grouped = new Map<string, { highlight: ReaderHighlight; indexes: number[] }>();
    tokens.forEach((token) => {
      if (token.type !== "word" || !token.highlight) return;
      const existing = grouped.get(token.highlight.id) ?? { highlight: token.highlight, indexes: [] };
      existing.indexes.push(token.index);
      grouped.set(token.highlight.id, existing);
    });

    const nextHighlightRects = Array.from(grouped.values()).flatMap(({ highlight, indexes }) =>
      getRectsForWordRange(
        Math.min(...indexes),
        Math.max(...indexes),
        HIGHLIGHT_COLORS[highlight.color].bg,
        `highlight-${highlight.id}`
      )
    );
    setHighlightRects(nextHighlightRects);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(refreshHighlightGeometry);
    return () => window.cancelAnimationFrame(frame);
  }, [selection, tokens, highlights]);

  return (
    <>
      <div
        className="fixed left-0 right-0 z-[260] px-5"
        style={{
          bottom: 0,
          paddingTop: 14,
          paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
          background: isLight ? "rgba(249,250,251,0.98)" : "rgba(12,14,22,0.98)",
          borderTop: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
          transform: ((selection && selectedText) || pendingRemoveId) ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: ((selection && selectedText) || pendingRemoveId) ? "auto" : "none",
          boxShadow: isLight ? "0 -18px 48px rgba(0,0,0,0.10)" : "0 -18px 48px rgba(0,0,0,0.48)",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="max-w-lg mx-auto">
          {pendingRemoveId ? (
            <div className="flex items-center gap-3">
              <p className="flex-1 text-sm font-black" style={{ color: isLight ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.72)" }}>
                {lang === "es" ? "Eliminar este resaltado?" : "Remove this highlight?"}
              </p>
              <button
                onClick={() => removeHighlight(pendingRemoveId)}
                className="h-10 px-4 rounded-2xl text-sm font-black active:scale-95"
                style={{ background: "rgba(239,68,68,0.18)", color: "rgba(248,113,113,1)" }}
              >
                {lang === "es" ? "Eliminar" : "Remove"}
              </button>
              <button
                onClick={() => setPendingRemoveId(null)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black active:scale-95"
                style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
              >
                {"x"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => addHighlightForSelection(color)}
                      className="w-10 h-10 rounded-full active:scale-90 transition-transform flex-shrink-0"
                      style={{ background: HIGHLIGHT_COLORS[color].dot, boxShadow: `0 3px 10px ${HIGHLIGHT_COLORS[color].dot}55` }}
                      aria-label={lang === "es" ? HIGHLIGHT_COLORS[color].labelEs : HIGHLIGHT_COLORS[color].label}
                    />
                  ))}
                </div>
                <div className="w-px h-7 flex-shrink-0" style={{ background: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.12)" }} />
                <button
                  onClick={copySelection}
                  className="h-10 px-4 rounded-2xl text-sm font-black active:scale-95 flex-shrink-0"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }}
                >
                  {lang === "es" ? "Copiar" : "Copy"}
                </button>
                <button
                  onClick={openUnifiedHighlights}
                  className="h-10 px-4 rounded-2xl text-sm font-black active:scale-95 flex-shrink-0"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.12)", color: isLight ? "#0a0a0a" : "#d7bd78", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.18)" }}
                >
                  {lang === "es" ? "Bolsa" : "Pocket"}
                </button>
                <button
                  onClick={() => { if (selectedText) setShowImageEditor(true); }}
                  className="h-10 px-4 rounded-2xl text-sm font-black active:scale-95 flex-shrink-0"
                  style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(201,169,97,1)", color: isLight ? "#0a0a0a" : "#08090f" }}
                >
                  {lang === "es" ? "Imagen" : "Image"}
                </button>
                <button
                  onClick={clearSelection}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black active:scale-95 flex-shrink-0"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
                >
                  {"x"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={openUnifiedHighlights}
        className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black"
        style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.14)", color: isLight ? "#0a0a0a" : "#d7bd78", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.18)" }}
      >
        {highlights.length > 0
          ? `${highlights.length} ${lang === "es" ? "resaltados guardados" : "saved highlights"}`
          : (lang === "es" ? "Mis resaltados" : "My highlights")}
      </button>

      <div
        ref={textLayerRef}
        className={`relative font-serif select-none whitespace-pre-line ${fontSizeClass} ${className}`}
        style={{ color: textColor, lineHeight: "1.9", WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none", touchAction: "pan-y" }}
        onClick={(event) => {
          if (!selection) return;
          const target = event.target as HTMLElement;
          if (target.closest("[data-reader-word]")) return;
          if (target.closest("[data-selection-handle]")) return;
          clearSelection();
        }}
        onPointerMove={updateHandleDrag}
        onPointerUp={finishWordPress}
        onPointerCancel={finishWordPress}
        onPointerLeave={() => {
          clearLongPressTimer();
          activeHandle.current = null;
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          {[...highlightRects, ...selectionGeometry.rects].map((rect) => (
            <span
              key={rect.id}
              className="absolute rounded-[4px]"
              style={{
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                background: rect.color,
              }}
            />
          ))}
        </div>
          {selectionGeometry.startHandle && (
          <button
            type="button"
            aria-label={lang === "es" ? "Mover inicio de selección" : "Move selection start"}
            data-selection-handle
            onPointerDown={(event) => beginHandleDrag("start", event)}
            className="absolute z-20 active:opacity-70"
            style={{ left: selectionGeometry.startHandle.left - 18, top: selectionGeometry.startHandle.top - 3, width: 36, height: 46, touchAction: "none", background: "none", border: "none", padding: 0 }}
          >
            <span style={{ position: "absolute", left: 13, top: 2, width: 10, height: 36, borderRadius: 99, background: "linear-gradient(180deg, #ffffff 0%, #e7e7e7 100%)", boxShadow: "0 6px 16px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.35)" }} />
            <span style={{ position: "absolute", left: 5, top: 0, width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderRight: "14px solid #eeeeee", filter: "drop-shadow(0 4px 7px rgba(0,0,0,0.50))" }} />
          </button>
        )}
        {selectionGeometry.endHandle && (
          <button
            type="button"
            aria-label={lang === "es" ? "Mover final de selección" : "Move selection end"}
            data-selection-handle
            onPointerDown={(event) => beginHandleDrag("end", event)}
            className="absolute z-20 active:opacity-70"
            style={{ left: selectionGeometry.endHandle.left - 18, top: selectionGeometry.endHandle.top - 3, width: 36, height: 46, touchAction: "none", background: "none", border: "none", padding: 0 }}
          >
            <span style={{ position: "absolute", left: 13, top: 2, width: 10, height: 36, borderRadius: 99, background: "linear-gradient(180deg, #ffffff 0%, #e7e7e7 100%)", boxShadow: "0 6px 16px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.35)" }} />
            <span style={{ position: "absolute", right: 5, top: 0, width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "14px solid #eeeeee", filter: "drop-shadow(0 4px 7px rgba(0,0,0,0.50))" }} />
          </button>
        )}
        {tokens.map((token, idx) => {
          if (token.type === "break") return <span key={`break-${idx}`}>{"\n\n"}</span>;
          if (token.type === "space") return <span key={`space-${idx}`} className="relative z-10"> </span>;
          return (
            <span
              key={`word-${token.index}`}
              data-reader-word
              data-index={token.index}
              data-hl-id={token.highlight?.id}
              className="relative z-10"
              onPointerDown={(event) => {
                event.preventDefault();
                startWordPress(token.index, token.highlight);
              }}
              onPointerUp={finishWordPress}
              onPointerCancel={finishWordPress}
              onClick={() => token.highlight ? setPendingRemoveId(token.highlight.id) : undefined}
              title={token.highlight ? (lang === "es" ? "Toca para opciones" : "Tap for options") : undefined}
            >
              {token.text}
            </span>
          );
        })}
      </div>

      {showPocket && (
        <div className="fixed inset-0 z-[280]" style={{ background: isLight ? "#ffffff" : "#070b14", color: isLight ? "#0a0a0a" : "white" }}>
          <div className="max-w-lg mx-auto h-full overflow-hidden flex flex-col">
            <div className="px-5 pb-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.14)", paddingTop: "max(env(safe-area-inset-top), 18px)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                  {lang === "es" ? "En tu bolsillo" : "In your pocket"}
                </p>
                <h2 className="text-[30px] leading-none font-black mt-1">{lang === "es" ? "Mis Resaltados" : "My Highlights"}</h2>
              </div>
              <button onClick={() => { setShowPocket(false); setPendingRemoveId(null); }} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)" }}>✕</button>
            </div>
            <div className="px-5 pt-4 flex-shrink-0">
              <label className="flex items-center gap-3 rounded-[22px] px-4 py-3" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.055)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={highlightSearchQuery}
                  onChange={(event) => setHighlightSearchQuery(event.target.value)}
                  placeholder={lang === "es" ? "Buscar seccion o texto..." : "Search section or text..."}
                  className="min-w-0 flex-1 bg-transparent outline-none text-sm font-bold"
                  style={{ color: isLight ? "#0a0a0a" : "white" }}
                />
                {highlightSearchQuery && (
                  <button onClick={() => setHighlightSearchQuery("")} className="text-sm font-black" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }} aria-label={lang === "es" ? "Limpiar busqueda" : "Clear search"}>
                    ✕
                  </button>
                )}
              </label>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-7 pb-10">
              {highlights.length === 0 ? (
                <div className="rounded-[30px] p-7 text-center" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.045)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-black" style={{ color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }}>{lang === "es" ? "Aun no hay resaltados" : "No highlights yet"}</p>
                  <p className="text-sm mt-2" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.38)" }}>
                    {lang === "es" ? "Selecciona texto en el lector para guardarlo." : "Select text in the reader to save it."}
                  </p>
                </div>
              ) : visibleHighlights.length === 0 ? (
                <div className="rounded-[30px] p-7 text-center" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.045)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-black" style={{ color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }}>{lang === "es" ? "Sin resultados" : "No results"}</p>
                  <p className="text-sm mt-2" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.38)" }}>
                    {lang === "es" ? "Prueba buscar otra seccion o frase." : "Try another section or phrase."}
                  </p>
                </div>
              ) : (
                <>
                  <section>
                    <div className="flex items-end justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                          {lang === "es" ? "Reciente" : "Recent"}
                        </p>
                        <h3 className="text-xl font-black">{lang === "es" ? "Mis resaltados recientes" : "My Most Recent Highlights"}</h3>
                      </div>
                      <p className="text-xs font-bold" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>{visibleHighlights.length}</p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 snap-x">
                      {visibleHighlights.slice(0, 8).map((highlight) => (
                        <article
                          key={`recent-${highlight.id}`}
                          className="min-w-[82%] snap-start rounded-[26px] p-4"
                          style={{ background: isLight ? "rgba(0,0,0,0.03)" : "linear-gradient(135deg, rgba(201,169,97,0.10), rgba(255,255,255,0.045))", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.16)" }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>{highlight.reference}</p>
                              <h4 className="text-sm font-black mt-1" style={{ color: isLight ? "#0a0a0a" : "rgba(255,255,255,0.85)" }}>{highlight.title}</h4>
                            </div>
                            <button onClick={() => setPendingRemoveId(highlight.id)} className="text-sm font-black" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }} aria-label={lang === "es" ? "Eliminar resaltado" : "Delete highlight"}>
                              ✕
                            </button>
                          </div>
                          <p className="mt-3 text-sm leading-6 line-clamp-5" style={{ color: isLight ? "rgba(0,0,0,0.64)" : "rgba(255,255,255,0.64)" }}>"{highlight.text}"</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                        {lang === "es" ? "Organizado" : "Organized"}
                      </p>
                      <h3 className="text-xl font-black">{lang === "es" ? "Por seccion" : "By Section"}</h3>
                    </div>
                    <div className="space-y-4">
                      {highlightsBySection.map((section) => (
                        <section key={section.sectionTitle} className="rounded-[28px] p-4" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.035)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.08)" }}>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-lg font-black">{section.sectionTitle}</h4>
                            <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.13)", color: isLight ? "#0a0a0a" : "#d7bd78" }}>
                              {section.items.length}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {section.items.map((highlight) => (
                              <article key={`section-${highlight.id}`} className="rounded-[22px] p-4" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.045)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.07)" }}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>{highlight.reference}</p>
                                  <button onClick={() => setPendingRemoveId(highlight.id)} className="text-sm font-black" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }} aria-label={lang === "es" ? "Eliminar resaltado" : "Delete highlight"}>
                                    ✕
                                  </button>
                                </div>
                                <p className="text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.62)" }}>"{highlight.text}"</p>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
            {pendingRemoveId && (
              <div className="fixed left-0 right-0 bottom-0 z-[290] px-5" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)", paddingTop: 14, background: isLight ? "rgba(249,250,251,0.98)" : "rgba(12,14,22,0.98)", borderTop: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}>
                <div className="max-w-lg mx-auto flex items-center gap-3">
                  <p className="flex-1 text-sm font-black" style={{ color: isLight ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.72)" }}>
                    {lang === "es" ? "Eliminar este resaltado?" : "Remove this highlight?"}
                  </p>
                  <button onClick={() => removeHighlight(pendingRemoveId)} className="h-10 px-4 rounded-2xl text-sm font-black" style={{ background: "rgba(239,68,68,0.18)", color: "rgba(248,113,113,1)" }}>
                    {lang === "es" ? "Eliminar" : "Remove"}
                  </button>
                  <button onClick={() => setPendingRemoveId(null)} className="w-10 h-10 rounded-2xl text-xl font-black" style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                    {"x"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Full-screen Create Image editor ─────────────────────────────── */}
      {showImageEditor && (
        <CreateImageEditor
          verseText={selectedText}
          reference={reference || title}
          lang={lang}
          onClose={() => setShowImageEditor(false)}
        />
      )}
    </>
  );
}
