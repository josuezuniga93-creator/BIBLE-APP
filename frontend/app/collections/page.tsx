"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loadCollections, deleteCollection, renameCollection,
  COLLECTION_COLORS, COLLECTION_EMOJIS,
  type Collection, type SavedItem,
} from "../lib/collections";
import { getBookmarks, removeBookmark as removeBookmarkById, type Bookmark } from "../lib/bookmarks";
import type { Highlight, HLColor } from "../lib/highlights";
import { useLanguage } from "../lib/useLanguage";
import { t } from "../lib/i18n";

// ─── Highlight aggregation ────────────────────────────────────────────────────

interface AggregatedHighlight extends Highlight {
  context: string;       // raw key suffix, e.g. "book-pilgrim-1"
  contextLabel: string;  // human-readable
}

type ColorNames = Record<HLColor, string>;
const HL_NAMES_KEY = "axiom-hl-colornames";
const DEFAULT_NAMES: ColorNames = { purple: "Purple", yellow: "Yellow", red: "Red", blue: "Blue", lime: "Lime Green", pink: "Pink", gold: "Gold" };

function loadColorNames(): ColorNames {
  try {
    const raw = localStorage.getItem(HL_NAMES_KEY);
    return raw ? { ...DEFAULT_NAMES, ...JSON.parse(raw) } : { ...DEFAULT_NAMES };
  } catch { return { ...DEFAULT_NAMES }; }
}

function saveColorNames(names: ColorNames) {
  localStorage.setItem(HL_NAMES_KEY, JSON.stringify(names));
}

function makeContextLabel(ctx: string): string {
  // bible-{bookName-slug}-{chapter}
  const bibleM = ctx.match(/^bible-(.+)-(\d+)$/);
  if (bibleM) {
    const bookName = bibleM[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `Bible · ${bookName} ${bibleM[2]}`;
  }
  // book-{slug}-{chapter}
  const bookM = ctx.match(/^book-(.+)-(\d+)$/);
  if (bookM) {
    const slug = bookM[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `Free Books · ${slug} Ch.${bookM[2]}`;
  }
  // learn-{docId}-{sectionId}
  const learnM = ctx.match(/^learn-(.+)$/);
  if (learnM) {
    const label = learnM[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `Historical Docs · ${label}`;
  }
  return ctx.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parse a bible highlight id like "bible-{bookNum}-{chapter}-{verseNum}" → verse number */
function parseBibleVerseNum(id: string): number | null {
  const m = id.match(/^bible-\d+-\d+-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

/** Build a link back to the Bible chapter for a highlight */
function highlightHref(context: string): string {
  const bibleM = context.match(/^bible-(.+)-(\d+)$/);
  if (bibleM) {
    const bookName = bibleM[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `/lexicon?book=${encodeURIComponent(bookName)}&chapter=${bibleM[2]}`;
  }
  const bookM = context.match(/^book-(.+)-(\d+)$/);
  if (bookM) return `/library/${bookM[1]}`;
  const learnM = context.match(/^learn-(.+?)(-[^-]+)?$/);
  if (learnM) return `/learn?doc=${learnM[1]}`;
  return "/";
}

function isBibleHighlight(context: string) { return /^bible-/.test(context); }

function loadAllHighlights(): AggregatedHighlight[] {
  if (typeof window === "undefined") return [];
  const result: AggregatedHighlight[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("axiom-hl-")) continue;
    if (key === HL_NAMES_KEY) continue;
    const context = key.replace("axiom-hl-", "");
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const items: Highlight[] = JSON.parse(raw);
      items.forEach((hl) => result.push({ ...hl, context, contextLabel: makeContextLabel(context) }));
    } catch { /* skip */ }
  }
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

function deleteHighlight(context: string, id: string) {
  if (typeof window === "undefined") return;
  const key = `axiom-hl-${context}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const items: Highlight[] = JSON.parse(raw);
    const next = items.filter((h) => h.id !== id);
    if (next.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(next));
  } catch { /* */ }
}

// ─── Color config ─────────────────────────────────────────────────────────────

const HL_COLORS: { key: HLColor; dot: string; ring: string }[] = [
  { key: "purple", dot: "#7546e3", ring: "rgba(117,70,227,0.30)" },
  { key: "yellow", dot: "#f2f06d", ring: "rgba(242,240,109,0.30)" },
  { key: "red",    dot: "#e34646", ring: "rgba(227,70,70,0.30)" },
  { key: "blue",   dot: "#46d3e3", ring: "rgba(70,211,227,0.30)" },
  { key: "lime",   dot: "#a9f558", ring: "rgba(169,245,88,0.30)" },
  { key: "pink",   dot: "#f558f2", ring: "rgba(245,88,242,0.30)" },
];

// ─── Section config ───────────────────────────────────────────────────────────

interface SectionDef {
  key: "bible" | "books" | "history";
  labelEn: string;
  labelEs: string;
  icon: string;
  color: string;
  match: (context: string) => boolean;
}

const SECTIONS: SectionDef[] = [
  {
    key: "bible",
    labelEn: "Scripture",
    labelEs: "Escritura",
    icon: "✝",
    color: "#c9a961",
    match: (ctx) => ctx.startsWith("bible-"),
  },
];

// Note: Free Books highlights live in /library · Historical Docs highlights live in /learn

// ─── Highlight color detail ───────────────────────────────────────────────────

function HighlightColorDetail({
  color,
  colorDot,
  displayName,
  highlights: initialHighlights,
  onClose,
}: {
  color: HLColor;
  colorDot: string;
  displayName: string;
  highlights: AggregatedHighlight[];
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const router = useRouter();
  const [highlights, setHighlights] = useState(initialHighlights);

  const handleDelete = (hl: AggregatedHighlight) => {
    deleteHighlight(hl.context, hl.id);
    setHighlights((prev) => prev.filter((h) => h.id !== hl.id));
  };

  const handleNavigate = (hl: AggregatedHighlight) => {
    const href = highlightHref(hl.context);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col max-w-lg mx-auto" style={{ background: "#0f0f0f" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: colorDot }} />
          <p className="text-base font-bold text-white">{displayName}</p>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full ml-1"
            style={{ background: colorDot + "25", color: colorDot }}
          >
            {highlights.length}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {highlights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🖊️</div>
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
              {lang === "es" ? "Aún no hay resaltados" : "No highlights yet"}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
              {lang === "es"
                ? "Resalta texto en Escritura, libros o documentos para verlo aquí."
                : "Highlight text in Scripture, books, or documents to see it here."}
            </p>
          </div>
        ) : (
          highlights.map((hl) => {
            const isBible = isBibleHighlight(hl.context);
            const verseNum = isBible ? parseBibleVerseNum(hl.id) : null;
            // Build a display reference like "Genesis 1:3"
            const bibleRef = (() => {
              if (!isBible) return null;
              const m = hl.context.match(/^bible-(.+)-(\d+)$/);
              if (!m || verseNum === null) return null;
              const bookName = m[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return `${bookName} ${m[2]}:${verseNum}`;
            })();

            return (
              <div
                key={hl.id}
                className="rounded-2xl px-4 py-3.5 space-y-2 active:scale-[0.98] transition-transform cursor-pointer"
                style={{ background: colorDot + "10", border: `1px solid ${colorDot}28` }}
                onClick={() => handleNavigate(hl)}
              >
                {/* Highlighted text */}
                <p
                  className="text-sm leading-relaxed font-medium"
                  style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Georgia, serif", borderLeft: `3px solid ${colorDot}`, paddingLeft: "10px" }}
                >
                  &ldquo;{hl.text}&rdquo;
                </p>
                {/* Reference + date + delete */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                      style={{ background: colorDot + "18", color: colorDot }}
                    >
                      {bibleRef ?? hl.contextLabel}
                    </span>
                    <span className="text-[9px] pl-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {new Date(hl.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(hl); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)" }}
                    title={lang === "es" ? "Eliminar resaltado" : "Delete highlight"}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Section highlight detail ─────────────────────────────────────────────────

function SectionHighlightDetail({
  section,
  highlights: initialHighlights,
  onClose,
}: {
  section: SectionDef;
  highlights: AggregatedHighlight[];
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const router = useRouter();
  const [highlights, setHighlights] = useState(initialHighlights);

  const handleDelete = (hl: AggregatedHighlight) => {
    deleteHighlight(hl.context, hl.id);
    setHighlights((prev) => prev.filter((h) => h.id !== hl.id));
  };

  const handleNavigate = (hl: AggregatedHighlight) => {
    router.push(highlightHref(hl.context));
  };

  const HL_DOT: Record<HLColor, string> = {
    purple: "#7546e3", yellow: "#f2f06d", red: "#e34646",
    blue: "#46d3e3", lime: "#a9f558", pink: "#f558f2", gold: "#c9a961",
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col max-w-lg mx-auto" style={{ background: "#0f0f0f" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <span className="text-xl">{section.icon}</span>
          <p className="text-base font-bold text-white">{lang === "es" ? section.labelEs : section.labelEn}</p>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full ml-1"
            style={{ background: section.color + "25", color: section.color }}>
            {highlights.length}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {highlights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">{section.icon}</div>
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
              {lang === "es" ? "Aún no hay resaltados" : "No highlights yet"}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
              {lang === "es"
                ? "Resalta texto en esta sección para verlo aquí."
                : "Highlight text in this section to see it here."}
            </p>
          </div>
        ) : (
          highlights.map((hl) => {
            const dot = HL_DOT[hl.color] ?? "#c9a961";
            const isBible = isBibleHighlight(hl.context);
            const verseNum = isBible ? parseBibleVerseNum(hl.id) : null;
            const bibleRef = (() => {
              if (!isBible) return null;
              const m = hl.context.match(/^bible-(.+)-(\d+)$/);
              if (!m || verseNum === null) return null;
              const bookName = m[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return `${bookName} ${m[2]}:${verseNum}`;
            })();

            return (
              <div key={hl.id}
                className="rounded-2xl px-4 py-3.5 space-y-2 active:scale-[0.98] transition-transform cursor-pointer"
                style={{ background: dot + "10", border: `1px solid ${dot}28` }}
                onClick={() => handleNavigate(hl)}
              >
                <p className="text-sm leading-relaxed font-medium"
                  style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Georgia, serif", borderLeft: `3px solid ${dot}`, paddingLeft: "10px" }}>
                  &ldquo;{hl.text}&rdquo;
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                      style={{ background: dot + "18", color: dot }}>
                      {bibleRef ?? hl.contextLabel}
                    </span>
                    <span className="text-[9px] pl-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {new Date(hl.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(hl); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Highlights section ───────────────────────────────────────────────────────

type HLView = "color" | "section";

function HighlightsSection() {
  const { lang } = useLanguage();
  const [allHighlights, setAllHighlights] = useState<AggregatedHighlight[]>([]);
  const [colorNames, setColorNames]       = useState<ColorNames>(DEFAULT_NAMES);
  const [editingColor, setEditingColor]   = useState<HLColor | null>(null);
  const [editValue, setEditValue]         = useState("");
  const [openColor, setOpenColor]         = useState<{ key: HLColor; dot: string } | null>(null);
  const [openSection, setOpenSection]     = useState<SectionDef | null>(null);
  const [hlView, setHlView]               = useState<HLView>("section");

  useEffect(() => {
    setAllHighlights(loadAllHighlights());
    setColorNames(loadColorNames());
  }, []);

  const countFor = (color: HLColor) => allHighlights.filter((h) => h.color === color).length;
  const countForSection = (sec: SectionDef) => allHighlights.filter((h) => sec.match(h.context)).length;

  const startEdit = (color: HLColor, currentName: string) => {
    setEditingColor(color);
    setEditValue(currentName);
  };

  const commitEdit = useCallback(() => {
    if (!editingColor) return;
    const name = editValue.trim() || DEFAULT_NAMES[editingColor];
    const next = { ...colorNames, [editingColor]: name };
    setColorNames(next);
    saveColorNames(next);
    setEditingColor(null);
  }, [editingColor, editValue, colorNames]);

  const openDetail = useOpenColor(setOpenColor);

  if (openColor) {
    const cfg = HL_COLORS.find((c) => c.key === openColor.key)!;
    return (
      <HighlightColorDetail
        color={openColor.key}
        colorDot={cfg.dot}
        displayName={colorNames[openColor.key]}
        highlights={allHighlights.filter((h) => h.color === openColor.key)}
        onClose={() => setOpenColor(null)}
      />
    );
  }

  if (openSection) {
    return (
      <SectionHighlightDetail
        section={openSection}
        highlights={allHighlights.filter((h) => openSection.match(h.context))}
        onClose={() => setOpenSection(null)}
      />
    );
  }

  return (
    <section className="space-y-3">
      {/* Header + total */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#c9a961" }}>
          {lang === "es" ? "Mis Resaltados" : "My Highlights"}
        </h2>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          {allHighlights.length} {lang === "es" ? "total" : "total"}
        </span>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {(["section", "color"] as HLView[]).map((v) => {
          const active = hlView === v;
          const labelEn = v === "section" ? "By Section" : "By Color";
          const labelEs = v === "section" ? "Por Sección" : "Por Color";
          return (
            <button
              key={v}
              onClick={() => setHlView(v)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: active ? "rgba(201,169,97,0.18)" : "transparent",
                border: active ? "1px solid rgba(201,169,97,0.3)" : "1px solid transparent",
                color: active ? "#c9a961" : "rgba(255,255,255,0.30)",
              }}
            >
              {lang === "es" ? labelEs : labelEn}
            </button>
          );
        })}
      </div>

      {/* ── By Section view ─────────────────────────────────────────────────── */}
      {hlView === "section" && (
        <div className="space-y-3">
          {SECTIONS.map((sec) => {
            const count = countForSection(sec);
            const sectionHighlights = allHighlights.filter((h) => sec.match(h.context));
            const preview = sectionHighlights[0];
            return (
              <button
                key={sec.key}
                onClick={() => { if (count > 0) setOpenSection(sec); }}
                className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
                style={{
                  background: sec.color + "0d",
                  border: `1px solid ${sec.color}${count > 0 ? "35" : "15"}`,
                  opacity: count === 0 ? 0.55 : 1,
                }}
              >
                {/* Top accent bar */}
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, ${sec.color}, transparent)` }} />

                <div className="p-4 flex items-start gap-3.5">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: sec.color + "18", border: `1px solid ${sec.color}28` }}>
                    {sec.icon}
                  </div>

                  {/* Label + count + preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-black" style={{ color: "rgba(255,255,255,0.88)" }}>
                        {lang === "es" ? sec.labelEs : sec.labelEn}
                      </p>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sec.color + "22", color: sec.color }}>
                        {count}
                      </span>
                    </div>
                    {preview ? (
                      <p className="text-[11px] leading-relaxed line-clamp-2"
                        style={{ color: "rgba(255,255,255,0.38)", fontFamily: "Georgia, serif" }}>
                        &ldquo;{preview.text}&rdquo;
                      </p>
                    ) : (
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                        {lang === "es" ? "Sin resaltados aún" : "No highlights yet"}
                      </p>
                    )}
                  </div>

                  {count > 0 && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-1"
                      style={{ color: sec.color + "80" }}>
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── By Color view ───────────────────────────────────────────────────── */}
      {hlView === "color" && (
        <div className="grid grid-cols-2 gap-3">
          {HL_COLORS.map(({ key, dot, ring }) => {
            const count = countFor(key);
            const name = colorNames[key];
            const isEditing = editingColor === key;

            return (
              <div
                key={key}
                className="rounded-2xl overflow-hidden"
                style={{ background: dot + "10", border: `1px solid ${dot}28` }}
              >
                <div className="h-1 w-full" style={{ background: dot }} />
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full border-2 flex-shrink-0"
                      style={{ background: dot, borderColor: ring, boxShadow: `0 0 8px ${ring}` }} />
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: dot + "22", color: dot }}>
                      {count}
                    </span>
                  </div>
                  {isEditing ? (
                    <input autoFocus value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingColor(null); }}
                      className="w-full text-sm font-bold rounded-lg px-2 py-1 focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: `1px solid ${dot}50` }}
                    />
                  ) : (
                    <button onClick={() => { if (count > 0) openDetail({ key, dot }); }}
                      onContextMenu={(e) => { e.preventDefault(); startEdit(key, name); }}
                      className="w-full text-left">
                      <p className="text-sm font-bold leading-none" style={{ color: "rgba(255,255,255,0.85)" }}>{name}</p>
                      <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {count === 0 ? "No highlights" : `${count} passage${count !== 1 ? "s" : ""}`}
                      </p>
                    </button>
                  )}
                  <div className="flex items-center justify-between pt-0.5">
                    <button onClick={() => startEdit(key, name)} className="text-[9px] font-bold"
                      style={{ color: "rgba(255,255,255,0.25)" }}>
                      Rename
                    </button>
                    {count > 0 && (
                      <button onClick={() => openDetail({ key, dot })}
                        className="text-[9px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: dot + "18", color: dot }}>
                        View all →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// tiny helper so the component body isn't polluted
function useOpenColor(setter: (v: { key: HLColor; dot: string } | null) => void) {
  return useCallback((v: { key: HLColor; dot: string }) => setter(v), [setter]);
}

// ─── Collections helpers ──────────────────────────────────────────────────────

function itemHref(item: SavedItem): string {
  if (item.type === "book") {
    const slug = item.id.replace(/^book::/, "");
    return `/library/${slug}`;
  }
  if (item.type === "learn") {
    const docId = item.id.replace(/^learn::/, "");
    return `/learn?doc=${docId}`;
  }
  if (item.type === "video") return `/videos`;
  if (item.type === "verse") {
    const parts = item.id.replace(/^verse::/, "").split("::");
    if (parts.length >= 2) return `/lexicon?book=${encodeURIComponent(parts[0])}&chapter=${parts[1]}`;
    return `/lexicon`;
  }
  return "/";
}

function EmptyState({ lang }: { lang: import("../lib/i18n").Lang }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-4xl mb-5">
        🔖
      </div>
      <p className="text-base font-bold text-white/70 mb-2">{t(lang, "col_empty_title")}</p>
      <p className="text-sm text-white/30 max-w-xs leading-relaxed">{t(lang, "col_empty_sub")}</p>
    </div>
  );
}

function CollectionDetail({ col, onClose, onUpdated, lang }: { col: Collection; onClose: () => void; onUpdated: () => void; lang: import("../lib/i18n").Lang }) {
  const router = useRouter();
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(col.name);
  const [emoji, setEmoji]       = useState(col.emoji);
  const [color, setColor]       = useState(col.color);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSaveEdit() {
    renameCollection(col.id, name.trim() || col.name, emoji, color);
    setEditing(false);
    onUpdated();
  }

  function handleDelete() {
    deleteCollection(col.id);
    onClose();
    onUpdated();
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#0f0f0f] flex flex-col max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/[0.07]">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.07] text-white/60 flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl">{col.emoji}</span>
          <p className="text-base font-bold text-white truncate">{col.name}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 text-white/50"
        >
          {editing ? t(lang, "col_done") : t(lang, "col_edit")}
        </button>
      </div>

      {editing && (
        <div className="px-5 py-4 border-b border-white/[0.07] space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {COLLECTION_EMOJIS.map((e) => (
              <button key={e} onClick={() => setEmoji(e)}
                className="flex-shrink-0 w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: emoji === e ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", border: emoji === e ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent" }}>
                {e}
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          />
          <div className="flex gap-2">
            {COLLECTION_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: c, outline: color === c ? "2px solid white" : "none", outlineOffset: "2px" }} />
            ))}
          </div>
          <div className="flex gap-2">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-red-400 border border-red-400/20">
                {t(lang, "col_delete")}
              </button>
            ) : (
              <>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/50 border border-white/10">{t(lang, "col_cancel")}</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600">{t(lang, "col_confirm_delete")}</button>
              </>
            )}
            <button onClick={handleSaveEdit}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: color }}>
              {t(lang, "col_save")}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {col.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">{col.emoji}</p>
            <p className="text-sm text-white/40">{t(lang, "col_empty_col")}</p>
            <p className="text-xs text-white/25 mt-1">{t(lang, "col_bookmark_hint")}</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-2">
            <p className="text-[10px] font-black tracking-widest text-white/25 uppercase mb-3">
              {col.items.length} {col.items.length === 1 ? t(lang, "col_item") : t(lang, "col_items")}
            </p>
            {[...col.items].sort((a, b) => b.savedAt - a.savedAt).map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(itemHref(item))}
                className="w-full rounded-2xl p-4 border text-left active:scale-[0.98] transition-transform"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: `${col.color}30` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5"
                      style={{ backgroundColor: `${col.color}20`, color: col.color }}
                    >
                      {item.type === "learn" ? t(lang, "col_historic") : item.type === "book" ? t(lang, "col_book") : item.type === "video" ? t(lang, "col_video") : t(lang, "col_verse")}
                    </span>
                    {item.subtitle && <p className="text-[10px] text-white/35 mb-0.5">{item.subtitle}</p>}
                    <p className="text-sm font-bold text-white/85 leading-snug">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${col.color}25` }}>
                      {item.type === "learn" ? "📜" : item.type === "book" ? "📖" : item.type === "video" ? "▶️" : "✝️"}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white/20">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {item.preview && (
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2 mt-2 border-t border-white/[0.05] pt-2" style={{ fontFamily: "Georgia, serif" }}>
                    {item.preview}
                  </p>
                )}
                <p className="text-[9px] text-white/20 mt-2">
                  {t(lang, "col_saved")} {new Date(item.savedAt).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionCard({ col, onClick, lang }: { col: Collection; onClick: () => void; lang: import("../lib/i18n").Lang }) {
  const topItem = col.items.sort((a, b) => b.savedAt - a.savedAt)[0];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden border active:scale-[0.98] transition-transform text-left"
      style={{ backgroundColor: `${col.color}12`, borderColor: `${col.color}30` }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: col.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{col.emoji}</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${col.color}20`, color: col.color }}>
            {col.items.length}
          </span>
        </div>
        <p className="text-sm font-bold text-white/90 mb-0.5">{col.name}</p>
        {topItem ? (
          <p className="text-[10px] text-white/35 line-clamp-1">{topItem.title}</p>
        ) : (
          <p className="text-[10px] text-white/25">{t(lang, "col_empty")}</p>
        )}
      </div>
    </button>
  );
}

// ─── Bookmarks section ───────────────────────────────────────────────────────

function BookmarksSection() {
  const { lang } = useLanguage();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (id: string) => {
    removeBookmarkById(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="text-4xl mb-3">🔖</div>
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
          {lang === "es" ? "Sin marcadores aún" : "No bookmarks yet"}
        </p>
        <p className="text-xs mt-1 max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
          {lang === "es"
            ? "Toca 'Guardar' en cualquier versículo para marcarlo aquí."
            : "Tap 'Save' on any verse to bookmark it."}
        </p>
      </div>
    );
  }

  // Group by category, sort categories alphabetically
  const grouped = bookmarks.reduce<Record<string, Bookmark[]>>((acc, bm) => {
    const cat = bm.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bm);
    return acc;
  }, {});
  const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      {sortedCategories.map((cat) => {
        const items = grouped[cat]; // already newest-first from getBookmarks()
        const isOpen = !collapsed.has(cat);
        return (
          <div key={cat}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-1 py-1.5 mb-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: "#c9a961" }}
                >
                  {cat}
                </span>
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(201,169,97,0.15)", color: "#c9a961" }}
                >
                  {items.length}
                </span>
              </div>
              <svg
                width="13" height="13"
                viewBox="0 0 24 24" fill="none"
                stroke="rgba(201,169,97,0.5)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
              >
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* Verse cards */}
            {isOpen && (
              <div className="space-y-2.5">
                {items.map((bm) => (
                  <div
                    key={bm.id}
                    className="rounded-2xl px-4 py-3.5 space-y-2"
                    style={{ background: "rgba(201,169,97,0.07)", border: "1px solid rgba(201,169,97,0.18)" }}
                  >
                    {/* Reference */}
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block"
                      style={{ background: "rgba(201,169,97,0.15)", color: "#c9a961" }}
                    >
                      {bm.ref}
                    </span>
                    {/* Verse text */}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Georgia, serif", borderLeft: "3px solid rgba(201,169,97,0.5)", paddingLeft: "10px" }}
                    >
                      {bm.text}
                    </p>
                    {/* Date + remove */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {new Date(bm.date).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => handleRemove(bm.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}
                        title={lang === "es" ? "Eliminar marcador" : "Remove bookmark"}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page (inner — needs useSearchParams) ────────────────────────────────

type CollectionsTab = "highlights" | "collections" | "bookmarks";

function CollectionsInner() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected]       = useState<Collection | null>(null);
  const [activeTab, setActiveTab]     = useState<CollectionsTab>("highlights");

  function refresh() {
    setCollections(loadCollections());
  }

  useEffect(() => { refresh(); }, []);

  // Auto-select tab from ?tab= query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "bookmarks") setActiveTab("bookmarks");
    else if (tab === "collections") setActiveTab("collections");
    else if (tab === "highlights") setActiveTab("highlights");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCol = selected ? collections.find((c) => c.id === selected.id) ?? null : null;

  const tabs: { key: CollectionsTab; labelEn: string; labelEs: string }[] = [
    { key: "highlights",  labelEn: "Highlights",   labelEs: "Resaltados" },
    { key: "collections", labelEn: "Collections",  labelEs: "Colecciones" },
    { key: "bookmarks",   labelEn: "Bookmarks",    labelEs: "Marcadores" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold">{t(lang, "col_heading")}</h1>
        <p className="text-xs text-white/30 mt-0.5">{t(lang, "col_sub")}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-2 pb-0 max-w-lg mx-auto">
        {tabs.map(({ key, labelEn, labelEs }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
              style={{
                background: active ? "rgba(201,169,97,0.15)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(201,169,97,0.3)" : "1px solid rgba(255,255,255,0.07)",
                color: active ? "#c9a961" : "rgba(255,255,255,0.35)",
              }}
            >
              {lang === "es" ? labelEs : labelEn}
            </button>
          );
        })}
      </div>

      <main className="max-w-lg mx-auto px-4 pb-24 mt-4">

        {/* ── Highlights tab ─────────────────────────────────────────────── */}
        {activeTab === "highlights" && <HighlightsSection />}

        {/* ── Collections tab ────────────────────────────────────────────── */}
        {activeTab === "collections" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#c9a961" }}>
                {t(lang, "col_heading")}
              </h2>
              {collections.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(201,169,97,0.15)", color: "#c9a961" }}>
                  {collections.length}
                </span>
              )}
            </div>

            {collections.length === 0 ? (
              <EmptyState lang={lang} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {collections.map((col) => (
                  <CollectionCard key={col.id} col={col} onClick={() => setSelected(col)} lang={lang} />
                ))}
              </div>
            )}

            {collections.length > 0 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                <p className="text-sm font-bold text-white/40 mb-1">{t(lang, "col_add_more")}</p>
                <p className="text-xs text-white/25 leading-relaxed">{t(lang, "col_add_more_sub")}</p>
              </div>
            )}
          </section>
        )}

        {/* ── Bookmarks tab ──────────────────────────────────────────────── */}
        {activeTab === "bookmarks" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#c9a961" }}>
                {lang === "es" ? "Mis Marcadores" : "My Bookmarks"}
              </h2>
            </div>
            <BookmarksSection />
          </section>
        )}
      </main>

      {/* Collection detail overlay */}
      {activeCol && (
        <CollectionDetail col={activeCol} onClose={() => setSelected(null)} onUpdated={refresh} lang={lang} />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f]" />}>
      <CollectionsInner />
    </Suspense>
  );
}
