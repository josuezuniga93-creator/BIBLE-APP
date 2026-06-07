"use client";

import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";

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
};

const HIGHLIGHT_COLORS: Record<HighlightColor, { label: string; labelEs: string; bg: string; dot: string }> = {
  gold:  { label: "Highlight", labelEs: "Resaltar", bg: "rgba(201,169,97,0.30)", dot: "#c9a961" },
  blue:  { label: "Blue",      labelEs: "Azul",      bg: "rgba(82,156,255,0.26)", dot: "#60a5fa" },
  rose:  { label: "Rose",      labelEs: "Rosa",      bg: "rgba(244,114,182,0.26)", dot: "#f472b6" },
  green: { label: "Green",     labelEs: "Verde",     bg: "rgba(74,222,128,0.24)", dot: "#4ade80" },
};

const ACTIVE_SELECTION_BG = "rgba(54,97,208,0.58)";

function storageKey(context: string) {
  return `tulip-reader-highlights:${context}`;
}

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

function loadHighlights(context: string): ReaderHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(context)) ?? "[]") as ReaderHighlight[];
  } catch {
    return [];
  }
}

function saveHighlights(context: string, highlights: ReaderHighlight[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(context), JSON.stringify(highlights));
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
}: Props) {
  const { lang } = useLanguage();
  const [selection, setSelection] = useState<BracketSelection | null>(null);
  const [highlights, setHighlights] = useState<ReaderHighlight[]>([]);
  const [selectionGeometry, setSelectionGeometry] = useState<SelectionGeometry>({ rects: [] });
  const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);
  const [showPocket, setShowPocket] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const activeHandle = useRef<"start" | "end" | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHighlights(loadHighlights(context));
    setSelection(null);
  }, [context]);

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

  const persistHighlights = useCallback((next: ReaderHighlight[]) => {
    const sorted = [...next].sort((a, b) => b.createdAt - a.createdAt);
    setHighlights(sorted);
    saveHighlights(context, sorted);
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
    setSelection(null);
  }

  function removeHighlight(id: string) {
    persistHighlights(highlights.filter((highlight) => highlight.id !== id));
  }

  function clearSelection() {
    setSelection(null);
    activeHandle.current = null;
    clearLongPressTimer();
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
          top: line.top - layerRect.top + lineHeight * 0.08,
          width: line.right - line.left + 8,
          height: lineHeight * 0.86,
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
      startHandle: first ? { left: first.left - 15, top: first.top - 3 } : undefined,
      endHandle: last ? { left: last.left + last.width - 3, top: last.top + last.height - 13 } : undefined,
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
      {selection && selectedText && (
        <div className="fixed left-0 right-0 z-[260] px-4" style={{ bottom: "calc(76px + max(env(safe-area-inset-bottom), 10px))" }}>
          <div
            className="max-w-lg mx-auto rounded-[24px] px-4 py-3"
            style={{
              background: "rgba(20,22,30,0.98)",
              border: "1px solid rgba(201,169,97,0.24)",
              boxShadow: "0 18px 52px rgba(0,0,0,0.55)",
            }}
          >
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
              {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => addHighlightForSelection(color)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[56px]"
                  style={{ color: color === "gold" ? "rgba(255,255,255,0.82)" : HIGHLIGHT_COLORS[color].dot }}
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: HIGHLIGHT_COLORS[color].dot, color: color === "gold" ? "#10131d" : "white" }}>
                    {color === "gold" ? "●" : ""}
                  </span>
                  <span className="text-[10px] font-black">{lang === "es" ? HIGHLIGHT_COLORS[color].labelEs : HIGHLIGHT_COLORS[color].label}</span>
                </button>
              ))}
              <button onClick={copySelection} className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[58px] text-white/72">
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>⧉</span>
                <span className="text-[11px] font-black">{lang === "es" ? "Copiar" : "Copy"}</span>
              </button>
              <button onClick={() => setShowPocket(true)} className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[58px] text-white/72">
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>◇</span>
                <span className="text-[11px] font-black">{lang === "es" ? "Bolsa" : "Pocket"}</span>
              </button>
              <button onClick={clearSelection} className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white/40" style={{ background: "rgba(255,255,255,0.07)" }}>✕</button>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/45">“{selectedText}”</p>
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <button
          onClick={() => setShowPocket(true)}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black"
          style={{ background: "rgba(201,169,97,0.14)", color: "#d7bd78", border: "1px solid rgba(201,169,97,0.18)" }}
        >
          {highlights.length} {lang === "es" ? "resaltados guardados" : "saved highlights"}
        </button>
      )}

      <div
        ref={textLayerRef}
        className={`relative font-serif select-none whitespace-pre-line ${fontSizeClass} ${className}`}
        style={{ color: textColor, lineHeight: "1.9", WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none", touchAction: "pan-y" }}
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
            onPointerDown={(event) => beginHandleDrag("start", event)}
            className="absolute z-20 active:scale-95"
            style={{ left: selectionGeometry.startHandle.left, top: selectionGeometry.startHandle.top, width: 24, height: 42, touchAction: "none" }}
          >
            <span style={{ position: "absolute", left: 8, top: 0, width: 10, height: 31, borderRadius: 999, background: "linear-gradient(180deg,#fff,#f4f4f4)", boxShadow: "0 5px 14px rgba(0,0,0,0.46)" }} />
            <span style={{ position: "absolute", left: 5, top: 23, width: 13, height: 13, borderRadius: "4px 10px 10px 10px", background: "#fff", transform: "rotate(45deg)", boxShadow: "0 5px 14px rgba(0,0,0,0.34)" }} />
          </button>
        )}
        {selectionGeometry.endHandle && (
          <button
            type="button"
            aria-label={lang === "es" ? "Mover final de selección" : "Move selection end"}
            onPointerDown={(event) => beginHandleDrag("end", event)}
            className="absolute z-20 active:scale-95"
            style={{ left: selectionGeometry.endHandle.left, top: selectionGeometry.endHandle.top, width: 24, height: 42, touchAction: "none" }}
          >
            <span style={{ position: "absolute", left: 6, top: 11, width: 10, height: 31, borderRadius: 999, background: "linear-gradient(180deg,#fff,#f4f4f4)", boxShadow: "0 5px 14px rgba(0,0,0,0.46)" }} />
            <span style={{ position: "absolute", left: 5, top: 2, width: 13, height: 13, borderRadius: "10px 10px 4px 10px", background: "#fff", transform: "rotate(45deg)", boxShadow: "0 5px 14px rgba(0,0,0,0.34)" }} />
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
              className="relative z-10"
              onPointerDown={() => startWordPress(token.index, token.highlight)}
              onPointerUp={finishWordPress}
              onPointerCancel={finishWordPress}
              onClick={() => token.highlight ? removeHighlight(token.highlight.id) : undefined}
              title={token.highlight ? (lang === "es" ? "Toca para eliminar" : "Tap to remove") : undefined}
            >
              {token.text}
            </span>
          );
        })}
      </div>

      {showPocket && (
        <div className="fixed inset-0 z-[280] bg-black/72 backdrop-blur-sm px-5 py-8 overflow-y-auto" onClick={() => setShowPocket(false)}>
          <div className="max-w-lg mx-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: "#c9a961" }}>{reference}</p>
                <h2 className="text-2xl font-black text-white">{lang === "es" ? "Mis Resaltados" : "My Highlights"}</h2>
              </div>
              <button onClick={() => setShowPocket(false)} className="w-11 h-11 rounded-full text-white/60" style={{ background: "rgba(255,255,255,0.08)" }}>✕</button>
            </div>
            {highlights.length === 0 ? (
              <div className="rounded-[24px] p-5 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-black text-white/70">{lang === "es" ? "Aún no hay resaltados" : "No highlights yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {highlights.map((highlight) => (
                  <article key={highlight.id} className="rounded-[24px] p-4" style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] font-black" style={{ color: HIGHLIGHT_COLORS[highlight.color].dot }}>{highlight.reference}</p>
                        <h3 className="text-sm font-black mt-1 text-white/80">{highlight.title}</h3>
                      </div>
                      <button onClick={() => removeHighlight(highlight.id)} className="text-white/35 text-sm font-black">✕</button>
                    </div>
                    <p className="text-sm leading-6 text-white/66">“{highlight.text}”</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
