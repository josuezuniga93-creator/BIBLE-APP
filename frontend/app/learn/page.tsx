"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { usePagination } from "../hooks/usePagination";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { LEARN_DOCUMENTS, FULL_DOCUMENT_SECTIONS, LearnDocument, LearnSection } from "../lib/learnData";
import { applyHighlightsToHtml, type Highlight } from "../lib/highlights";
import { LEARN_DOCUMENTS as _LEARN_DOCS_FOR_HL } from "../lib/learnData";
import { useTheme } from "../lib/useTheme";
import { BookmarkModal } from "../components/BookmarkModal";
import { isAnySaved } from "../lib/collections";
import { GeneratedCategoryMark, GeneratedDocumentCover, GeneratedMetaIcon } from "../components/GeneratedArtwork";
import { getDocumentCoverImage } from "../lib/documentCoverImages";
import { useLanguage } from "../lib/useLanguage";
import { translateToSpanish } from "../lib/googleTranslate";
import { t } from "../lib/i18n";
import { documentSectionTitle, documentTitle } from "../lib/spanishContent";
import { BracketHighlightReader } from "../components/BracketHighlightReader";
import { syncKey } from "../lib/cloudSync";

// ─── Progress helpers ─────────────────────────────────────────────────────────

type ReaderMode = "full" | "overview";

function storageKey(docId: string) { return `axiom_learn_${docId}`; }

function loadProgress(docId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(docId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

function saveProgress(docId: string, completed: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(docId), JSON.stringify([...completed]));
  localStorage.setItem(`axiom_learn_lastread_${docId}`, String(Date.now()));
}

type ReaderProgress = {
  sectionId: string;
  page: number;
  total: number;
  percent: number;
  updatedAt: number;
};

function readerProgressKey(docId: string, mode: ReaderMode) {
  return `axiom_learn_reader_${docId}_${mode}`;
}

function loadReaderProgress(docId: string, mode: ReaderMode): ReaderProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(readerProgressKey(docId, mode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReaderProgress;
    if (!parsed.sectionId || !parsed.total) return null;
    return parsed;
  } catch { return null; }
}

function saveReaderProgress(docId: string, mode: ReaderMode, progress: ReaderProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(readerProgressKey(docId, mode), JSON.stringify(progress));
  localStorage.setItem(`axiom_learn_lastread_${docId}`, String(Date.now()));
}

function getDocLastRead(docId: string): number {
  try { return parseInt(localStorage.getItem(`axiom_learn_lastread_${docId}`) ?? "0", 10); } catch { return 0; }
}

function getDocPct(doc: LearnDocument): number {
  const sections = FULL_DOCUMENT_SECTIONS[doc.id] ?? doc.sections;
  const completed = loadProgress(doc.id);
  if (sections.length === 0) return 0;
  const completedInScope = sections.filter((section) => completed.has(section.id)).length;
  return Math.round((completedInScope / sections.length) * 100);
}

// ─── Document cover art ───────────────────────────────────────────────────────

function DocCover({ doc, size = "full" }: { doc: LearnDocument; size?: "full" | "small" | "featured" }) {
  const imageSrc = getDocumentCoverImage(doc.id);
  const [imageFailed, setImageFailed] = useState(false);

  if (imageSrc && !imageFailed) {
    return (
      <div className="relative w-full h-full overflow-hidden pointer-events-none">
        <Image
          src={imageSrc}
          alt={`${doc.title} cover`}
          fill
          sizes={size === "small" ? "56px" : "112px"}
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return <GeneratedDocumentCover doc={doc} size={size} />;
}

// ─── Timeline data ────────────────────────────────────────────────────────────

const TIMELINE: { year: string; label: string; docId?: string }[] = [
  // Early Church — foundational orthodoxy affirmed by Reformed theology
  { year: "AD 49",    label: "Jerusalem Council",         docId: "jerusalem-council"  },
  { year: "AD 140",   label: "Apostles' Creed",          docId: "apostles-creed"     },
  { year: "AD 325",   label: "Council of Nicaea",        docId: "council-nicaea"     },
  { year: "AD 381",   label: "Nicene Creed",             docId: "nicene-creed"       },
  { year: "AD 397",   label: "Augustine: Grace",         docId: "augustine-grace"    },
  { year: "AD 418",   label: "Monergism vs Synergism",   docId: "monergism-debate"   },
  { year: "AD 451",   label: "Council of Chalcedon",     docId: "council-chalcedon"  },
  // Pre-Reformation — seeds of reform
  { year: "1378",     label: "Wycliffe's Bible",         docId: "wycliffe"           },
  { year: "1415",     label: "Jan Hus Martyred",         docId: "jan-hus"            },
  { year: "1455",     label: "Gutenberg Bible",          docId: "gutenberg"          },
  // Reformation
  { year: "1517",     label: "Luther's 95 Theses",       docId: "95theses"           },
  { year: "1521",     label: "Diet of Worms",            docId: "diet-of-worms"      },
  { year: "1525",     label: "Tyndale NT in English",    docId: "tyndale"            },
  { year: "1536",     label: "Calvin's Institutes",      docId: "calvins-institutes" },
  { year: "1559",     label: "Geneva Bible",             docId: "geneva-bible"       },
  { year: "1561",     label: "Belgic Confession",        docId: "belgic-confession"  },
  { year: "1563",     label: "Heidelberg Catechism",     docId: "heidelberg"         },
  { year: "1611",     label: "King James Bible",         docId: "king-james-bible"   },
  // Confessional Era
  { year: "1618–19",  label: "Synod of Dort",            docId: "canons-of-dort"     },
  { year: "1644",     label: "First London Baptist",     docId: "first-london-baptist"},
  { year: "1647",     label: "Westminster Confession",   docId: "westminster-confession"},
  { year: "1689",     label: "1689 LBC",                 docId: "1689-lbc"           },
  // Reformed Revival
  { year: "1730s",    label: "Great Awakening",                                     },
  { year: "1741",     label: "Sinners in God's Hands",   docId: "sinners-in-hands"  },
];

// ─── Type categories ──────────────────────────────────────────────────────────

const DOC_TYPES = [
  { key: "all",         label: "All" },
  { key: "confession",  label: "Confessions" },
  { key: "creed",       label: "Creeds" },
  { key: "debate",      label: "Debates" },
  { key: "council",     label: "Councils" },
  { key: "catechism",   label: "Catechisms" },
];

// ─── Tab keys ─────────────────────────────────────────────────────────────────
type DocTab = "all" | "confession" | "creed" | "debate" | "council" | "catechism" | "highlights";

// ─── Historical doc highlights aggregation ────────────────────────────────────
interface DocHighlight extends Highlight {
  docId: string;
  docTitle: string;
  sectionId: string;
}

function loadAllDocHighlights(): DocHighlight[] {
  if (typeof window === "undefined") return [];
  const result: DocHighlight[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("tulip-reader-highlights:learn-")) continue;
    const suffix = key.slice("tulip-reader-highlights:".length); // "learn-{docId}-{sectionId}"
    const m = suffix.match(/^learn-(.+?)-([\w-]+)$/);
    if (!m) continue;
    const docId = m[1];
    const sectionId = m[2];
    const doc = _LEARN_DOCS_FOR_HL.find((d) => d.id === docId);
    try {
      const raw = localStorage.getItem(key);
      const hls = raw ? (JSON.parse(raw) as Highlight[]) : [];
      for (const hl of hls) {
        result.push({ ...hl, docId, docTitle: doc?.title ?? docId, sectionId });
      }
    } catch { /* skip */ }
  }
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderContent(
  text: string,
  textColor: string,
  highlights: import("../lib/highlights").Highlight[] = [],
  onHighlightClick?: (id: string, x: number, y: number) => void
) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { elements.push(<div key={i} className="h-3" />); i++; continue; }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="pt-5 pb-1 text-lg font-black" style={{ color: textColor }}>
          {line.replace(/^##\s+/, "")}
        </h3>
      );
      i++;
      continue;
    }
    const inlined = line
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/—/g, "—");
    const withHL = applyHighlightsToHtml(inlined, highlights);
    elements.push(
      <p
        key={i}
        style={{ lineHeight: "1.85", color: textColor, fontSize: "15px", fontFamily: "Georgia, serif" }}
        dangerouslySetInnerHTML={{ __html: withHL }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.hlId && onHighlightClick) {
            const rect = target.getBoundingClientRect();
            onHighlightClick(target.dataset.hlId, rect.left + rect.width / 2, rect.top);
          }
        }}
      />
    );
    i++;
  }
  return elements;
}

// ─── Section Reader ───────────────────────────────────────────────────────────

type FontSize = "sm" | "md" | "lg" | "xl";
const FONT_SIZES: Record<FontSize, string> = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" };

function SectionReader({
  doc, sections, section, completed, onToggle, onClose, onPrev, onNext, hasPrev, hasNext, onJump, modeLabel, readerMode,
}: {
  doc: LearnDocument; sections: LearnSection[]; section: LearnSection; completed: Set<string>;
  onToggle: (id: string) => void; onClose: () => void;
  onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
  onJump: (id: string) => void;
  modeLabel: string;
  readerMode: ReaderMode;
}) {
  const { theme } = useTheme();
  const isWhiteNoir = theme === "white-noir";
  const isLight = isWhiteNoir;
  const isGoldNavy = theme === "gold-navy";
  const d = <T,>(light: T, gold: T, dark: T): T => isLight ? light : isGoldNavy ? gold : dark;

  const th = {
    pageBg:         isLight ? "#ffffff"                               : "#0e0e18",
    textPrimary:    isLight ? "#0a0a0a"                               : "rgba(255,255,255,0.95)",
    textSecondary:  isLight ? "rgba(10,10,10,0.55)"                  : "rgba(255,255,255,0.85)",
    textMuted:      isLight ? "rgba(10,10,10,0.38)"                  : "rgba(255,255,255,0.5)",
    textFaint:      isLight ? "rgba(10,10,10,0.25)"                  : "rgba(255,255,255,0.4)",
    textContent:    isLight ? "#0a0a0a"                               : "rgba(255,255,255,0.78)",
    accent:         d("#0a0a0a",  "#c9a961", "#a78bfa"),
    accentLight:    d("#333333",  "#d4b878", "#c4b5fd"),
    primary:        d("#0a0a0a",  "#c9a961", "#7c3aed"),
    topBarBg:       isLight ? "rgba(255,255,255,0.96)"               : "rgba(14,14,24,0.95)",
    topBarBorder:   isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.07)",
    drawerBg:       isLight ? "#f5f5f5"                               : "#141424",
    drawerBorder:   isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.08)",
    drawerItemActive:    d("rgba(0,0,0,0.10)", "rgba(201,169,97,0.20)", "rgba(124,58,237,0.2)"),
    drawerItemActiveColor: d("#0a0a0a", "#c9a961",  "#c4b5fd"),
    drawerItemColor:isLight ? "rgba(10,10,10,0.38)"                  : "rgba(255,255,255,0.4)",
    settingsBg:     isLight ? "#f5f5f5"                               : "#141424",
    settingsBorder: isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.08)",
    settingsBtnActive:       d("rgba(0,0,0,0.10)", "rgba(201,169,97,0.25)", "rgba(124,58,237,0.3)"),
    settingsBtnActiveBorder: d("rgba(0,0,0,0.25)", "rgba(201,169,97,0.50)", "rgba(124,58,237,0.5)"),
    settingsBtnInactive: isLight ? "rgba(0,0,0,0.05)"                : "rgba(255,255,255,0.05)",
    settingsBtnInactiveBorder: isLight ? "rgba(0,0,0,0.10)"          : "rgba(255,255,255,0.08)",
    navBtnBg:       isLight ? "rgba(0,0,0,0.05)"                     : "rgba(255,255,255,0.07)",
    navBtnBorder:   isLight ? "rgba(0,0,0,0.10)"                     : "rgba(255,255,255,0.08)",
    navBtnColor:    isLight ? "rgba(10,10,10,0.55)"                  : "rgba(255,255,255,0.6)",
    navNextGradient: d("linear-gradient(135deg,#333,#0a0a0a)", "linear-gradient(135deg,#c9a961,#d4b878)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    dividerColor:   isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.06)",
    footerText:     isLight ? "rgba(10,10,10,0.25)"                  : "rgba(255,255,255,0.15)",
    progressTrack:  isLight ? "rgba(0,0,0,0.08)"                     : "rgba(255,255,255,0.08)",
    progressBar:    d("linear-gradient(90deg,#333,#0a0a0a)", "linear-gradient(90deg,#c9a961,#d4b878)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    bottomBarBg:    isLight ? "rgba(255,255,255,0.96)"               : "rgba(14,14,24,0.97)",
    bottomBarBorder:isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.07)",
    bottomBarDivider:isLight? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.05)",
    sliderTrack:    d(`linear-gradient(to right,#0a0a0a `, `linear-gradient(to right,#c9a961 `, `linear-gradient(to right,#a855f7 `),
    sliderThumb:    d("linear-gradient(135deg,#333,#0a0a0a)", "linear-gradient(135deg,#c9a961,#d4b878)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    sliderThumbShadow: isLight ? "" : isGoldNavy ? "" : "box-shadow:0 0 8px rgba(168,85,247,0.6);",
    sliderTrackBg:  isLight ? "rgba(0,0,0,0.08)"                     : "rgba(255,255,255,0.1)",
    bottomIconColor:isLight ? "rgba(10,10,10,0.38)"                  : "rgba(255,255,255,0.4)",
  };

  const { lang } = useLanguage();
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmark, setShowBookmark] = useState(false);

  // ── Spanish auto-translation ──────────────────────────────────────────────
  const [translatedSection, setTranslatedSection] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0);

  useEffect(() => {
    if (lang !== "es" || !section.content) {
      setTranslatedSection(null);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    setTranslateProgress(0);
    translateToSpanish(
      section.content,
      `learn-${doc.id}-${section.id}`,
      (pct) => { if (!cancelled) setTranslateProgress(pct); }
    )
      .then((text) => { if (!cancelled) setTranslatedSection(text); })
      .catch(() => { if (!cancelled) setTranslatedSection(null); })
      .finally(() => { if (!cancelled) setTranslating(false); });
    return () => { cancelled = true; };
  }, [lang, section.content, doc.id, section.id]);

  const itemId = `learn::${doc.id}::${section.id}`;
  const [bookmarked, setBookmarked] = useState(() => isAnySaved(itemId));

  // Refresh bookmarked state when section changes
  useEffect(() => { setBookmarked(isAnySaved(itemId)); }, [itemId]);

  const contentRef = useRef<HTMLDivElement>(null);

  // ── In-section pagination ─────────────────────────────────────────────────
  const pageStorageKey = `axiom-page-learn-${doc.id}-${section.id}`;
  const {
    pages: sectionPages,
    currentPage,
    totalPages,
    goNextPage,
    goPrevPage,
    isFirstPage,
    isLastPage,
  } = usePagination({
    content: section.content,
    fontSize,
    storageKey: pageStorageKey,
    rawText: section.id.startsWith("md-luther-") || section.id.startsWith("md-edwards-"),
  });

  // Scroll to top when page or section changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [currentPage, section.id]);

  const sectionIndex = sections.findIndex((s) => s.id === section.id);
  const progressPct = sections.length > 0 ? Math.round(((sectionIndex + 1) / sections.length) * 100) : 0;
  const sectionPageLabel = lang === "es" ? "Página" : "Page";
  const sectionOfLabel = lang === "es" ? "de" : "of";

  const sliderCss = `.hist-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.hist-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${th.sliderThumb};${th.sliderThumbShadow}border:2px solid rgba(255,255,255,0.3)}.hist-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${th.sliderThumb};border:2px solid rgba(255,255,255,0.3)}`;

  useEffect(() => { contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [section.id]);
  useEffect(() => { if (!completed.has(section.id)) onToggle(section.id); }, [section.id]);
  useEffect(() => {
    if (sectionIndex < 0) return;
    saveReaderProgress(doc.id, readerMode, {
      sectionId: section.id,
      page: sectionIndex + 1,
      total: sections.length,
      percent: progressPct,
      updatedAt: Date.now(),
    });
  }, [doc.id, readerMode, section.id, sectionIndex, sections.length, progressPct]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* Study Tools style top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between gap-3 px-5 pb-3"
        style={{ backgroundColor: th.topBarBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${th.topBarBorder}` }}
      >
        <div className="min-w-0" style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}>
          <h1 className="text-lg leading-tight font-black line-clamp-2" style={{ color: th.textPrimary }}>
            {documentTitle(doc, lang)} · {documentSectionTitle(doc.id, section.title, lang)}
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: th.accent }}>
            {lang === "es" ? "Documento historico" : "Historical Document"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center active:scale-95"
          style={{ color: th.textMuted, background: "rgba(255,255,255,0.07)", border: `1px solid ${th.topBarBorder}` }}
          aria-label={lang === "es" ? "Volver" : "Back"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* TOC Drawer */}
      {showToc && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setShowToc(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-xs h-full flex flex-col overflow-y-auto shadow-2xl"
            style={{ backgroundColor: th.drawerBg, borderRight: `1px solid ${th.drawerBorder}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${th.drawerBorder}` }}>
              <p className="text-sm font-bold" style={{ color: th.textMuted }}>{lang === "es" ? "Secciones" : "Sections"}</p>
              <button onClick={() => setShowToc(false)} className="text-lg" style={{ color: th.textMuted }}>✕</button>
            </div>
            <div className="p-3 space-y-0.5">
              {sections.map((s, idx) => (
                <button key={s.id} onClick={() => { onJump(s.id); setShowToc(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors min-h-[40px]"
                  style={{ backgroundColor: s.id === section.id ? th.drawerItemActive : "transparent", color: s.id === section.id ? th.drawerItemActiveColor : th.drawerItemColor, fontWeight: s.id === section.id ? "bold" : "normal" }}>
                  {idx + 1}. {documentSectionTitle(doc.id, s.title, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 px-4" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative rounded-2xl px-5 pt-5 pb-6 w-full max-w-sm"
            style={{ backgroundColor: th.settingsBg, border: `1px solid ${th.settingsBorder}` }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-widest mb-4 px-1" style={{ color: th.textMuted }}>{lang === "es" ? "Ajustes de Lectura" : "Display Settings"}</p>
            <div className="flex gap-2">
              {(["sm","md","lg","xl"] as FontSize[]).map((fs) => (
                <button key={fs} onClick={() => setFontSize(fs)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: fontSize === fs ? th.settingsBtnActive : th.settingsBtnInactive, border: fontSize === fs ? `1px solid ${th.settingsBtnActiveBorder}` : `1px solid ${th.settingsBtnInactiveBorder}`, color: fontSize === fs ? th.accentLight : th.textMuted }}>
                  {lang === "es"
                    ? fs === "sm" ? "Pequeño" : fs === "md" ? "Mediano" : fs === "lg" ? "Grande" : "Muy Grande"
                    : fs === "sm" ? "Small" : fs === "md" ? "Medium" : fs === "lg" ? "Large" : "X-Large"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading content */}
      <div ref={contentRef} style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto" }}>
        <main className="max-w-lg mx-auto px-7 pt-5 pb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: th.accent }}>
            {lang === "es" ? (modeLabel === "Full document" ? "Documento completo" : "Resumen") : modeLabel} · {documentSectionTitle(doc.id, section.label, lang)}
            {totalPages > 1 && (
              <span style={{ color: th.textFaint, fontWeight: "normal", letterSpacing: "0.05em" }}>
                {" "}· p. {currentPage}/{totalPages}
              </span>
            )}
          </p>
          {/* Title only on first page */}
          {isFirstPage && (
            <h2 className="text-2xl font-black mb-8 leading-tight" style={{ color: th.textPrimary }}>
              {documentSectionTitle(doc.id, section.title, lang)}
            </h2>
          )}
          <div
            key={`${section.id}-${currentPage}`}
            className={`space-y-1 ${FONT_SIZES[fontSize]}`}
            style={{ animation: "axiomPageIn 0.18s ease-out" }}
          >
            <style>{`@keyframes axiomPageIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            {/* Spanish translation status */}
            {lang === "es" && (translating || translatedSection) && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs"
                style={{ backgroundColor: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.18)", color: th.textMuted }}>
                {translating ? (
                  <>
                    <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
                    <span>Traduciendo al español… {translateProgress}%</span>
                  </>
                ) : (
                  <><span>🌐</span><span>Traducido al español automáticamente</span></>
                )}
              </div>
            )}
            <BracketHighlightReader
              context={`learn-${doc.id}-${section.id}`}
              text={lang === "es" && translatedSection ? translatedSection : sectionPages[currentPage - 1] ?? ""}
              title={documentSectionTitle(doc.id, section.title, lang)}
              reference={`${documentTitle(doc, lang)} · ${documentSectionTitle(doc.id, section.label, lang)}${totalPages > 1 ? ` · ${lang === "es" ? "Página" : "Page"} ${currentPage}` : ""}`}
              textColor={th.textContent}
              fontSizeClass={FONT_SIZES[fontSize]}
              scrollRef={contentRef}
            />
          </div>
        </main>
      </div>

      {/* Study Tools style bottom progress + navigation */}
      <div className="flex-shrink-0 px-5 py-3" style={{ backgroundColor: th.pageBg, borderTop: `1px solid ${th.bottomBarBorder}` }}>
        <div className="flex items-center justify-between text-[11px] font-bold mb-2" style={{ color: th.textSecondary }}>
          <span>
            {lang === "es" ? "Pagina" : "Page"} {currentPage} {lang === "es" ? "de" : "of"} {totalPages}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: th.progressTrack }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: th.progressBar }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={isFirstPage && !hasPrev}
            onClick={() => { if (!goPrevPage()) onPrev(); }}
            className="flex flex-1 items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]"
            style={{
              backgroundColor: (!isFirstPage || hasPrev) ? th.navBtnBg : "transparent",
              color: (!isFirstPage || hasPrev) ? th.navBtnColor : th.textMuted,
              border: `1px solid ${th.navBtnBorder}`,
              cursor: (!isFirstPage || hasPrev) ? "pointer" : "not-allowed",
            }}
          >
            {lang === "es" ? "← Ant." : "← Prev"}
          </button>
          {isLastPage && !hasNext ? (
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm min-h-[44px]"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "white" }}
            >
              {lang === "es" ? "Terminar" : "Finish"} ✓
            </button>
          ) : (
            <button
              onClick={() => { if (!goNextPage()) onNext(); }}
              className="flex flex-1 items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm min-h-[44px]"
              style={{ background: th.navNextGradient, color: "white" }}
            >
              {lang === "es" ? "Siguiente" : "Next"} →
            </button>
          )}
        </div>
      </div>

      {showBookmark && (
        <BookmarkModal
          item={{
            id: itemId,
            type: "learn",
            title: documentSectionTitle(doc.id, section.title, lang),
            subtitle: documentTitle(doc, lang),
            preview: section.content.replace(/[#*_`>]/g, "").slice(0, 120).trim(),
          }}
          label={`${documentTitle(doc, lang)} — ${documentSectionTitle(doc.id, section.title, lang)}`}
          onClose={() => { setShowBookmark(false); setBookmarked(isAnySaved(itemId)); }}
        />
      )}
    </div>
  );
}

// ─── Document detail view ─────────────────────────────────────────────────────

function DocumentDetail({ doc, onClose, allDocs }: { doc: LearnDocument; onClose: () => void; allDocs: LearnDocument[] }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isWhiteNoir = theme === "white-noir";
  const isLight = isWhiteNoir;
  const isGoldNavy = theme === "gold-navy";
  const d = <T,>(light: T, gold: T, dark: T): T => isLight ? light : isGoldNavy ? gold : dark;
  const fullDocumentSections = FULL_DOCUMENT_SECTIONS[doc.id] ?? null;
  const hasFullDocument = !!fullDocumentSections;

  const th = {
    pageBg:         isLight ? "#ffffff"                               : "#0e0e18",
    textPrimary:    isLight ? "#0a0a0a"                               : "rgba(255,255,255,0.95)",
    textSecondary:  isLight ? "rgba(10,10,10,0.55)"                  : "rgba(255,255,255,0.85)",
    textMuted:      isLight ? "rgba(10,10,10,0.38)"                  : "rgba(255,255,255,0.45)",
    textFaint:      isLight ? "rgba(10,10,10,0.25)"                  : "rgba(255,255,255,0.3)",
    accent:         d("#0a0a0a",  "#c9a961", "#a78bfa"),
    accentLight:    d("#333333",  "#d4b878", "#c4b5fd"),
    primary:        d("#0a0a0a",  "#c9a961", "#7c3aed"),
    topBarBg:       isLight ? "rgba(255,255,255,0.96)"               : "rgba(14,14,24,0.95)",
    topBarBorder:   isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.07)",
    tagBg:          d("rgba(0,0,0,0.05)",  "rgba(201,169,97,0.18)", "rgba(124,58,237,0.2)"),
    tagBorder:      d("rgba(0,0,0,0.12)",  "rgba(201,169,97,0.40)", "rgba(124,58,237,0.35)"),
    tagColor:       d("#0a0a0a",  "#c9a961", "#c4b5fd"),
    btnBorder:      isLight ? "rgba(0,0,0,0.09)"                     : "rgba(255,255,255,0.12)",
    modeBg:         isLight ? "rgba(0,0,0,0.04)"                     : "rgba(255,255,255,0.04)",
    modeBorder:     isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.08)",
    modeActiveBg:   d("rgba(0,0,0,0.10)",  "rgba(201,169,97,0.22)", "rgba(124,58,237,0.24)"),
    modeActiveText: d("#0a0a0a",  "#d4b878", "#ddd6fe"),
    modeInactiveText:isLight ? "rgba(10,10,10,0.38)"                 : "rgba(255,255,255,0.42)",
    progressTrack:  isLight ? "rgba(0,0,0,0.08)"                     : "rgba(255,255,255,0.08)",
    progressBar:    d("linear-gradient(90deg,#333,#0a0a0a)", "linear-gradient(90deg,#c9a961,#d4b878)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    readGradient:   d("#f3f4f6", "linear-gradient(135deg,#c9a961,#d4b878)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    readBtnText:    d("#0a0a0a", "#ffffff", "#ffffff"),
    divider:        isLight ? "rgba(0,0,0,0.07)"                     : "rgba(255,255,255,0.06)",
    sectionRowBg:   isLight ? "rgba(0,0,0,0.03)"                     : "rgba(255,255,255,0.03)",
    sectionRowBorder:isLight ? "rgba(0,0,0,0.07)"                    : "rgba(255,255,255,0.07)",
    sectionDoneBg:  d("rgba(0,0,0,0.10)",  "rgba(201,169,97,0.22)", "rgba(124,58,237,0.3)"),
    sectionDoneBorder:d("rgba(0,0,0,0.25)","rgba(201,169,97,0.50)", "rgba(124,58,237,0.5)"),
    sectionDoneNum: d("#0a0a0a",  "#c9a961", "#c4b5fd"),
    sectionPendingBg:isLight ? "rgba(0,0,0,0.04)"                    : "rgba(255,255,255,0.07)",
    sectionPendingBorder:isLight?"rgba(0,0,0,0.07)"                  : "rgba(255,255,255,0.1)",
    sectionPendingNum:isLight ? "rgba(10,10,10,0.38)"                : "rgba(255,255,255,0.3)",
    sectionDoneTitle:d("#0a0a0a", "#c9a961", "#c4b5fd"),
    sectionTitle:   isLight ? "#0a0a0a"                               : "rgba(255,255,255,0.8)",
    sectionLabel:   isLight ? "rgba(10,10,10,0.38)"                  : "rgba(255,255,255,0.3)",
    sectionArrow:   isLight ? "rgba(0,0,0,0.25)"                     : "rgba(255,255,255,0.25)",
    star:           d("#0a0a0a",  "#c9a961", "#c9a961"),
    starText:       isLight ? "#0a0a0a"                               : "rgba(255,255,255,0.7)",
    starFaint:      isLight ? "rgba(10,10,10,0.38)"                  : "rgba(255,255,255,0.3)",
  };

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reading, setReading] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState<ReaderMode>(hasFullDocument ? "full" : "overview");
  const [descExpanded, setDescExpanded] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(() => isAnySaved(`learn::${doc.id}`));
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [savedReaderProgress, setSavedReaderProgress] = useState<ReaderProgress | null>(null);

  useEffect(() => { setCompleted(loadProgress(doc.id)); }, [doc.id]);
  useEffect(() => {
    setReading(null);
    setReaderMode(hasFullDocument ? "full" : "overview");
    setDescExpanded(false);
    setTranslatedDescription(null);
    setSavedReaderProgress(loadReaderProgress(doc.id, hasFullDocument ? "full" : "overview"));
  }, [doc.id, hasFullDocument]);

  useEffect(() => {
    setSavedReaderProgress(loadReaderProgress(doc.id, readerMode));
  }, [doc.id, readerMode, reading]);

  useEffect(() => {
    let cancelled = false;
    if (lang !== "es") {
      setTranslatedDescription(null);
      return;
    }
    translateToSpanish(doc.description, `learn-desc-${doc.id}`)
      .then((value) => {
        if (!cancelled) setTranslatedDescription(value);
      })
      .catch(() => {
        if (!cancelled) setTranslatedDescription(null);
      });
    return () => { cancelled = true; };
  }, [doc.description, lang]);

  const toggleSection = useCallback((sectionId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      saveProgress(doc.id, next);
      return next;
    });
  }, [doc.id]);

  const readerSections = readerMode === "full" && fullDocumentSections ? fullDocumentSections : doc.sections;
  const validSavedProgress = savedReaderProgress && readerSections.some((section) => section.id === savedReaderProgress.sectionId)
    ? savedReaderProgress
    : null;
  const completedInReader = readerSections.filter((section) => completed.has(section.id)).length;
  const progress = validSavedProgress?.percent ?? (readerSections.length > 0 ? Math.round((completedInReader / readerSections.length) * 100) : 0);
  const readerModeLabel = readerMode === "full" ? "Full document" : "Overview";
  const descriptionText = lang === "es" ? translatedDescription ?? doc.description : doc.description;

  const sectionIndex = reading ? readerSections.findIndex((s) => s.id === reading) : -1;
  const currentSection = sectionIndex >= 0 ? readerSections[sectionIndex] : null;

  if (currentSection) {
    return (
      <SectionReader
        doc={doc} sections={readerSections} section={currentSection} completed={completed} onToggle={toggleSection}
        onClose={() => setReading(null)}
        onPrev={() => { if (sectionIndex > 0) setReading(readerSections[sectionIndex - 1].id); }}
        onNext={() => { if (sectionIndex < readerSections.length - 1) setReading(readerSections[sectionIndex + 1].id); }}
        hasPrev={sectionIndex > 0} hasNext={sectionIndex < readerSections.length - 1}
        onJump={(id) => setReading(id)}
        modeLabel={readerModeLabel}
        readerMode={readerMode}
      />
    );
  }

  const related = allDocs.filter((d) => d.id !== doc.id && (d.category === doc.category || d.year === doc.year)).slice(0, 5);
  const typeLabel = doc.category.charAt(0).toUpperCase() + doc.category.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 h-12"
        style={{ backgroundColor: th.topBarBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${th.topBarBorder}` }}>
        <button onClick={onClose} style={{ color: th.textMuted }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ width: "48px" }} />
      </div>

      {/* Cover + meta */}
      <div className="flex gap-4 px-4 pt-6 pb-5">
        <div className="flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60" style={{ width: "110px", height: "148px", border: `1px solid ${th.btnBorder}` }}>
          <DocCover doc={doc} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className="text-base font-black leading-tight mb-1" style={{ color: th.textPrimary }}>{documentTitle(doc, lang)}</h1>
          <p className="text-sm font-semibold mb-1" style={{ color: th.accent }}>{doc.origin}</p>
          <div className="flex items-center gap-1 mb-2">
            <span style={{ color: th.star }}>★</span>
            <span className="text-xs font-bold" style={{ color: th.starText }}>4.8</span>
            <span className="text-xs" style={{ color: th.starFaint }}>{lang === "es" ? "(Histórico)" : "(Historic)"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: th.tagBg, border: `1px solid ${th.tagBorder}`, color: th.tagColor }}>
              {lang === "es" ? ({ confession: "Confesión", catechism: "Catecismo", creed: "Credo", council: "Concilio", debate: "Debate", history: "Historia", theses: "Tesis", solas: "Solas" } as Record<string, string>)[doc.category] ?? typeLabel : typeLabel}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: th.tagBg, border: `1px solid ${th.tagBorder}`, color: th.tagColor }}>
              {lang === "es" ? "Doctrinal" : "Doctrinal"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#34d399", fontSize: "12px" }}>✓</span>
            <span style={{ color: "#34d399", fontSize: "11px", fontWeight: "bold" }}>{lang === "es" ? "Gratis" : "Free"}</span>
            <span style={{ color: "rgba(52,211,153,0.6)", fontSize: "11px" }}>{lang === "es" ? "100% gratis para leer" : "100% free to read"}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 flex flex-col gap-2.5 mb-5">
        {hasFullDocument && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl" style={{ backgroundColor: th.modeBg, border: `1px solid ${th.modeBorder}` }}>
            {(["full", "overview"] as ReaderMode[]).map((mode) => {
              const active = readerMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => { setReaderMode(mode); setReading(null); }}
                  className="py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98]"
                  style={{ backgroundColor: active ? th.modeActiveBg : "transparent", color: active ? th.modeActiveText : th.modeInactiveText }}
                >
                  {lang === "es" ? (mode === "full" ? "Documento completo" : "Resumen") : (mode === "full" ? "Full document" : "Overview")}
                </button>
              );
            })}
          </div>
        )}
        <button onClick={() => setReading(validSavedProgress?.sectionId ?? readerSections[0]?.id ?? null)} className="w-full py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ background: th.readGradient, color: th.readBtnText }}>
          {validSavedProgress
            ? (lang === "es" ? "Continuar Leyendo" : "Continue Reading")
            : lang === "es" ? (readerMode === "full" ? "Leer Documento Completo" : "Leer Resumen") : (readerMode === "full" ? "Read Full Document" : "Read Overview")}
        </button>
        <button onClick={() => setShowBookmarkModal(true)} className="w-full py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          style={{ border: `1px solid ${th.btnBorder}`, color: th.textSecondary }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} style={{ color: bookmarked ? "#c4973a" : "currentColor" }}>
            <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          {bookmarked ? (lang === "es" ? "Guardado" : "Bookmarked") : (lang === "es" ? "Agregar a Biblioteca" : "Add to Library")}
        </button>
      </div>

      {/* About */}
      <div className="px-4 mb-4">
        <p className="text-sm font-bold mb-2" style={{ color: th.textPrimary }}>{lang === "es" ? "Acerca de este documento" : "About this document"}</p>
        <p className="text-xs leading-relaxed" style={{ color: th.textMuted }}>
          {descExpanded ? descriptionText : descriptionText.slice(0, 160)}
          {!descExpanded && descriptionText.length > 160 && (
            <button onClick={() => setDescExpanded(true)} className="font-bold ml-1" style={{ color: th.accent }}>{lang === "es" ? "Más" : "More"}</button>
          )}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 px-4 mb-5">
        {[
          { icon: "sections", label: `${readerSections.length} ${lang === "es" ? (readerMode === "full" ? "Secciones del Documento" : "Secciones de Resumen") : (readerMode === "full" ? "Document Sections" : "Overview Sections")}` },
          { icon: "language", label: lang === "es" ? "Español automático" : "English" },
          { icon: "year", label: lang === "es" ? `Publicado ${doc.year}` : `Published ${doc.year}` },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-1.5">
            <GeneratedMetaIcon type={m.icon as "sections" | "language" | "year"} size={15} />
            <span className="text-xs" style={{ color: th.textMuted }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="px-4 mb-5">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: th.textFaint }}>
            <span>
              {validSavedProgress
                ? `${lang === "es" ? "Página" : "Page"} ${validSavedProgress.page} ${lang === "es" ? "de" : "of"} ${validSavedProgress.total}`
                : lang === "es"
                ? `${completedInReader} de ${readerSections.length} secciones ${readerMode === "full" ? "del documento" : "del resumen"} leídas`
                : `${completedInReader} of ${readerSections.length} ${readerMode === "full" ? "document" : "overview"} sections read`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: th.progressTrack }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: th.progressBar }} />
          </div>
        </div>
      )}

      <div className="mx-4 mb-4" style={{ height: "1px", backgroundColor: th.divider }} />

      {/* Section list */}
      <div className="px-4 mb-6">
        <p className="text-sm font-bold mb-1" style={{ color: th.textPrimary }}>
          {lang === "es" ? (readerMode === "full" ? "Secciones del documento completo" : "Secciones de resumen") : (readerMode === "full" ? "Full document sections" : "Overview sections")}
        </p>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: th.textMuted }}>
          {readerMode === "full"
            ? lang === "es" ? "Lee el texto primario por capítulos, artículos, preguntas, cánones o secciones." : "Read the primary text by chapter, article, question, canon, or sermon section."
            : lang === "es" ? "Usa el resumen para contexto histórico, teología y notas de estudio." : "Use the overview for historical context, theology, and study notes."}
        </p>
        <div className="space-y-2">
          {readerSections.map((section, idx) => {
            const done = completed.has(section.id);
            return (
              <button key={section.id} onClick={() => setReading(section.id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-[0.99]"
                style={{ backgroundColor: th.sectionRowBg, border: `1px solid ${th.sectionRowBorder}` }}>
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                  onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                  style={{ backgroundColor: done ? th.sectionDoneBg : th.sectionPendingBg, border: done ? `1px solid ${th.sectionDoneBorder}` : `1px solid ${th.sectionPendingBorder}` }}>
                  {done ? <span style={{ color: th.sectionDoneNum, fontSize: "11px", fontWeight: "bold" }}>✓</span>
                         : <span style={{ color: th.sectionPendingNum, fontSize: "11px" }}>{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: done ? th.sectionDoneTitle : th.sectionTitle }}>
                    {documentSectionTitle(doc.id, section.title, lang)}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: th.sectionLabel }}>{documentSectionTitle(doc.id, section.label, lang)}</p>
                </div>
                <span style={{ color: th.sectionArrow, fontSize: "12px" }}>›</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <div className="px-4 pb-10">
          <p className="text-sm font-bold mb-3" style={{ color: th.textPrimary }}>{lang === "es" ? "También te puede gustar" : "You may also like"}</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {related.map((d) => (
                <button key={d.id} onClick={() => onClose()} className="flex-shrink-0 w-24 text-left active:scale-95 transition-transform">
                  <div className="w-24 h-32 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40" style={{ border: `1px solid ${th.btnBorder}` }}>
                    <DocCover doc={d} />
                  </div>
                  <p className="text-[10px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{documentTitle(d, lang)}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: th.textMuted }}>{d.year}</p>
                </button>
            ))}
          </div>
        </div>
      )}

      {showBookmarkModal && (
        <BookmarkModal
          item={{ id: `learn::${doc.id}`, type: "learn", title: documentTitle(doc, lang), subtitle: doc.origin, preview: String(doc.year) }}
          label={documentTitle(doc, lang)}
          onClose={() => { setShowBookmarkModal(false); setBookmarked(isAnySaved(`learn::${doc.id}`)); }}
        />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function LearnPageInner() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const isWhiteNoir = theme === "white-noir";
  const isLight = isWhiteNoir;
  const isPink = false;
  const isGoldNavy = theme === "gold-navy";
  const pick = (pink: string, light: string, dark: string) => isPink ? pink : isLight ? light : dark;

  const th = {
    pageBg:            pick("#fff0f5", "#ffffff", "#0e0e18"),
    textPrimary:       pick("#4a0020", "#0a0a0a", "rgba(255,255,255,0.95)"),
    textSecondary:     pick("rgba(74,0,32,0.62)", "rgba(10,10,10,0.55)", "rgba(255,255,255,0.38)"),
    textMuted:         pick("rgba(74,0,32,0.52)", "rgba(10,10,10,0.38)", "rgba(255,255,255,0.45)"),
    textFaint:         pick("rgba(74,0,32,0.38)", "rgba(10,10,10,0.25)", "rgba(255,255,255,0.25)"),
    textVeryFaint:     pick("rgba(74,0,32,0.28)", "rgba(10,10,10,0.22)", "rgba(255,255,255,0.22)"),
    accent:            pick("#db2777", "#0a0a0a", "#a78bfa"),
    accentLight:       pick("#be185d", "#333333", "#c4b5fd"),
    primary:           pick("#db2777", "#0a0a0a", "#7c3aed"),
    heroBg:            pick(
      "linear-gradient(135deg,#f8dce9 0%,#fff8fb 55%,#f7cedf 100%)",
      "linear-gradient(135deg,#f7f7f7 0%,#ffffff 100%)",
      "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)"
    ),
    heroAccentText:    pick("#be185d", "#0a0a0a", "#c084fc"),
    heroSubtext:       pick("rgba(74,0,32,0.62)", "rgba(10,10,10,0.55)", "rgba(255,255,255,0.4)"),
    searchBg:          pick("rgba(252,231,243,0.7)", "rgba(0,0,0,0.04)", "rgba(255,255,255,0.06)"),
    searchBorder:      pick("rgba(219,39,119,0.20)", "rgba(0,0,0,0.09)", "rgba(255,255,255,0.08)"),
    catActiveBg:       pick("#f7d1e3", "rgba(0,0,0,0.10)", "rgba(124,58,237,0.25)"),
    catActiveBorder:   pick("rgba(219,39,119,0.38)", "rgba(0,0,0,0.25)", "rgba(167,139,250,0.5)"),
    catInactiveBg:     pick("rgba(252,231,243,0.72)", "rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)"),
    catInactiveBorder: pick("rgba(219,39,119,0.14)", "rgba(0,0,0,0.07)", "rgba(255,255,255,0.08)"),
    cardBg:            pick("#fff8fb", "#ffffff", "rgba(255,255,255,0.03)"),
    cardBorder:        pick("rgba(219,39,119,0.16)", "rgba(0,0,0,0.07)", "rgba(255,255,255,0.07)"),
    progressTrack:     pick("rgba(219,39,119,0.14)", "rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)"),
    progressBar:       pick("linear-gradient(90deg,#ec4899,#be185d)", "linear-gradient(90deg,#333,#0a0a0a)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    tabStripBorder:    pick("rgba(219,39,119,0.16)", "rgba(0,0,0,0.07)", "rgba(255,255,255,0.07)"),
    tabActiveBorder:   pick("#db2777", "#0a0a0a", "#7c3aed"),
    tabInactiveColor:  pick("rgba(74,0,32,0.45)", "rgba(10,10,10,0.38)", "rgba(255,255,255,0.3)"),
    timelineLine:      pick("linear-gradient(90deg,transparent,rgba(219,39,119,0.28),transparent)", "linear-gradient(90deg,transparent,rgba(0,0,0,0.15),transparent)", "linear-gradient(90deg,transparent,rgba(167,139,250,0.4),transparent)"),
    timelineDotEven:   pick("linear-gradient(135deg,#ec4899,#db2777)", "linear-gradient(135deg,#333,#0a0a0a)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    timelineDotOdd:    pick("linear-gradient(135deg,#db2777,#be185d)", "linear-gradient(135deg,#0a0a0a,#333)", "linear-gradient(135deg,#a855f7,#7c3aed)"),
    timelineDotShadow: pick("none", "none", "0 0 8px rgba(168,85,247,0.5)"),
    timelineYear:      pick("#be185d", "#0a0a0a", "#a78bfa"),
    timelineLabel:     pick("rgba(74,0,32,0.52)", "rgba(10,10,10,0.38)", "rgba(255,255,255,0.45)"),
    startReading:      pick("#be185d", "#0a0a0a", "rgba(167,139,250,0.65)"),
    star:              pick("#db2777", "#0a0a0a", "#c9a961"),
    footerText:        pick("rgba(74,0,32,0.46)", "rgba(10,10,10,0.25)", "rgba(255,255,255,0.15)"),
    iconMuted:         pick("rgba(74,0,32,0.48)", "rgba(10,10,10,0.38)", "rgba(255,255,255,0.3)"),
  };

  // Gold Navy overrides — replace purple/violet with antique gold
  if (isGoldNavy && !isLight) {
    th.accent            = "#c9a961";
    th.accentLight       = "#d4b878";
    th.primary           = "#c9a961";
    th.heroBg            = "linear-gradient(135deg,rgba(201,169,97,0.22) 0%,#1a1d27 55%,#0e1018 100%)";
    th.heroAccentText    = "#c9a961";
    th.catActiveBg       = "rgba(201,169,97,0.20)";
    th.catActiveBorder   = "rgba(201,169,97,0.45)";
    th.progressBar       = "linear-gradient(90deg,#c9a961,#d4b878)";
    th.tabActiveBorder   = "#c9a961";
    th.startReading      = "#c9a961";
    th.timelineLine      = "linear-gradient(90deg,transparent,rgba(201,169,97,0.35),transparent)";
    th.timelineDotEven   = "linear-gradient(135deg,#c9a961,#d4b878)";
    th.timelineDotOdd    = "linear-gradient(135deg,#d4b878,#b8922e)";
    th.timelineDotShadow = "none";
    th.timelineYear      = "#c9a961";
    th.star              = "#c9a961";
  }

  const [selected, setSelected] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("all");
  const [activeTab, setActiveTab] = useState<DocTab>("all");
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [bookmarkTarget, setBookmarkTarget] = useState<LearnDocument | null>(null);
  const [savedDocs, setSavedDocs] = useState<Set<string>>(new Set());
  const [docHighlights, setDocHighlights] = useState<DocHighlight[]>([]);
  const [showHighlightPocket, setShowHighlightPocket] = useState(false);
  const [hlSearch, setHlSearch] = useState("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [hlDocCollapsed, setHlDocCollapsed] = useState<Record<string, boolean>>({});
  const [catExpanded, setCatExpanded] = useState<Record<string, boolean>>({});
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselTouchX, setCarouselTouchX] = useState(0);
  const carouselSwipedRef = useRef(false);

  function refreshSaved() {
    setSavedDocs(new Set(LEARN_DOCUMENTS.filter((d) => isAnySaved(`learn::${d.id}`)).map((d) => d.id)));
  }

  useEffect(() => { refreshSaved(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showHighlightPocket) setDocHighlights(loadAllDocHighlights());
  }, [showHighlightPocket]);

  // Deep-link: /learn?doc=ID opens that document directly
  useEffect(() => {
    const docId = searchParams.get("doc");
    if (docId && LEARN_DOCUMENTS.some((d) => d.id === docId)) {
      setSelected(docId);
    }
  }, [searchParams]);

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const doc of LEARN_DOCUMENTS) { map[doc.id] = getDocPct(doc); }
    setProgressMap(map);
  }, [selected]);

  const handleClose = () => {
    setSelected(null);
    const map: Record<string, number> = {};
    for (const doc of LEARN_DOCUMENTS) { map[doc.id] = getDocPct(doc); }
    setProgressMap(map);
  };

  // Carousel auto-advance every 4 seconds
  const FEATURED_IDS = ["westminster-confession", "heidelberg", "nicene-creed"];
  const featuredDocs = LEARN_DOCUMENTS
    .filter((d) => FEATURED_IDS.includes(d.id))
    .sort((a, b) => FEATURED_IDS.indexOf(a.id) - FEATURED_IDS.indexOf(b.id));

  useEffect(() => {
    if (featuredDocs.length <= 1 || carouselPaused) return;
    const id = setInterval(() => setCarouselSlide((prev) => (prev + 1) % featuredDocs.length), 4000);
    return () => clearInterval(id);
  }, [featuredDocs.length, carouselPaused]);

  const selectedDoc = selected ? LEARN_DOCUMENTS.find((d) => d.id === selected) : null;
  if (selectedDoc) return <DocumentDetail doc={selectedDoc} onClose={handleClose} allDocs={LEARN_DOCUMENTS} />;

  const available = LEARN_DOCUMENTS;

  // Filter by Browse-by-Type pill
  const filteredDocs = available.filter((doc) =>
    activeType === "all" || doc.category === activeType
  );

  // Further filter by My Documents tab (independent control)
  const listDocs = filteredDocs.filter((doc) =>
    activeTab === "all" || doc.category === activeTab
  );

  const filteredDocHls = hlSearch.trim()
    ? docHighlights.filter(hl => {
        const q = hlSearch.toLowerCase();
        return hl.docTitle.toLowerCase().includes(q) || hl.sectionId.toLowerCase().includes(q) || hl.text.toLowerCase().includes(q);
      })
    : docHighlights;

  const hlByDoc: Record<string, { docTitle: string; docId: string; sections: Record<string, DocHighlight[]> }> = {};
  for (const hl of filteredDocHls) {
    if (!hlByDoc[hl.docId]) hlByDoc[hl.docId] = { docTitle: hl.docTitle, docId: hl.docId, sections: {} };
    if (!hlByDoc[hl.docId].sections[hl.sectionId]) hlByDoc[hl.docId].sections[hl.sectionId] = [];
    hlByDoc[hl.docId].sections[hl.sectionId].push(hl);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* Header */}
      <div className="flex items-center px-4 pt-5 pb-2">
        <h1 className="text-lg font-bold" style={{ color: th.textPrimary }}>
          {lang === "es" ? t(lang, "learn_page_title") : "Historical"} <span style={{ color: th.accent }}>{lang === "es" ? t(lang, "learn_page_accent") : "Documents"}</span>
        </h1>
      </div>


      {/* ── Hero Carousel ───────────────────────────────────────────────────────── */}
      <div
        className="mx-4 mb-6 rounded-[22px] overflow-hidden relative select-none"
        style={{
          height: "214px",
          boxShadow: isLight ? "0 18px 45px rgba(0,0,0,0.08)" : "0 18px 45px rgba(0,0,0,0.35)",
          border: `1px solid ${th.cardBorder}`,
        }}
        onTouchStart={(e) => {
          setCarouselTouchX(e.touches[0].clientX);
          setCarouselPaused(true);
          carouselSwipedRef.current = false;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - carouselTouchX;
          if (Math.abs(dx) > 40) {
            carouselSwipedRef.current = true;
            setCarouselSlide((prev) =>
              dx < 0
                ? (prev + 1) % featuredDocs.length
                : (prev - 1 + featuredDocs.length) % featuredDocs.length
            );
          }
        }}
      >
        {/* Sliding track */}
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{
            width: `${featuredDocs.length * 100}%`,
            transform: `translateX(-${(carouselSlide * 100) / featuredDocs.length}%)`,
          }}
        >
          {featuredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex h-full flex-shrink-0 relative"
              style={{ width: `${100 / featuredDocs.length}%`, background: th.heroBg }}
            >
              {/* Tap to open */}
              <button
                className="absolute inset-0 z-30"
                onClick={() => { if (carouselSwipedRef.current) { carouselSwipedRef.current = false; return; } setSelected(doc.id); }}
              />
              {/* Radial glow */}
              <div
                className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none"
                style={{ background: isLight ? "none" : "radial-gradient(circle at 65% 42%, rgba(201,169,97,0.18), transparent 42%)" }}
              />
              {/* Document cover */}
              <div
                className="flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/25 relative z-10"
                style={{ width: "108px", height: "164px", alignSelf: "center", marginLeft: "16px" }}
              >
                <DocCover doc={doc} />
              </div>
              {/* Decorative SVG */}
              <div className="absolute right-5 top-9 hidden min-[380px]:block opacity-70">
                <svg width="92" height="112" viewBox="0 0 92 112" fill="none">
                  <path d="M55 5C37 22 31 50 38 82" stroke={th.accent} strokeWidth="3" strokeLinecap="round"/>
                  <path d="M55 5C70 37 65 68 38 82" stroke={th.accent} strokeWidth="2" strokeLinecap="round" opacity=".55"/>
                  <path d="M33 81h22c9 0 16 7 16 16v4H17v-4c0-9 7-16 16-16Z" fill={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} opacity=".8"/>
                  <path d="M27 102h34" stroke={isLight ? "#0a0a0a" : "#c9a961"} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Info panel */}
              <div className="flex-1 pt-7 pb-5 pr-4 pl-4 flex flex-col justify-between min-w-0 relative z-10">
                <div>
                  <div className="mb-2">
                    <p
                      className="inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em]"
                      style={{ color: th.heroAccentText, background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.12)", border: isLight ? "1px solid rgba(0,0,0,0.15)" : undefined }}
                    >
                      {lang === "es" ? "Documento Destacado" : "Featured Document"}
                    </p>
                  </div>
                  <p className="text-[17px] font-black leading-[1.08] mb-1.5 line-clamp-3" style={{ color: th.textPrimary }}>
                    {documentTitle(doc, lang)}
                  </p>
                  <p className="text-[11px] font-semibold mb-2 truncate" style={{ color: th.heroAccentText }}>
                    {doc.year} · {doc.origin}
                  </p>
                  <p className="text-[10px] leading-[1.45] line-clamp-3 max-w-[190px]" style={{ color: th.heroSubtext }}>
                    {(doc as any).description ?? "A foundational document of the Reformed tradition."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination dots */}
        <div className="absolute bottom-3.5 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
          {featuredDocs.map((_, i) => (
            <button
              key={i}
              className="rounded-full transition-all pointer-events-auto active:opacity-70"
              style={{
                width: i === carouselSlide ? "8px" : "6px",
                height: "6px",
                backgroundColor: i === carouselSlide ? th.accent : (isLight ? "rgba(0,0,0,0.20)" : "rgba(255,255,255,0.25)"),
              }}
              onClick={() => setCarouselSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* Timeline Highlights */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>{t(lang, "learn_timeline")}</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>{t(lang, "learn_view_all")}</button>
        </div>
        <div className="px-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-start gap-0 relative" style={{ minWidth: "max-content" }}>
            {/* Connector line */}
            <div className="absolute top-[9px] left-4 right-4 h-px" style={{ background: th.timelineLine, zIndex: 0 }} />
            {TIMELINE.map((item, i) => {
              const hasDoc = !!item.docId && LEARN_DOCUMENTS.some(d => d.id === item.docId);
              const dot = (
                <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: hasDoc ? (i % 2 === 0 ? th.timelineDotEven : th.timelineDotOdd) : pick("rgba(219,39,119,0.18)", "rgba(155,114,40,0.25)", "rgba(255,255,255,0.12)"),
                    boxShadow: hasDoc ? th.timelineDotShadow : "none",
                  }}>
                  <div className="w-2 h-2 rounded-full opacity-80" style={{ backgroundColor: hasDoc ? "white" : pick("rgba(190,24,93,0.5)", "rgba(155,114,40,0.6)", "rgba(255,255,255,0.4)") }} />
                </div>
              );
              const label = (
                <div className="text-center">
                  <p className="text-xs font-black" style={{ color: hasDoc ? th.timelineYear : pick("rgba(74,0,32,0.38)", "#b09878", "rgba(255,255,255,0.3)") }}>{item.year}</p>
                  <p className="text-[9px] leading-tight text-center" style={{ color: hasDoc ? th.timelineLabel : pick("rgba(74,0,32,0.28)", "#c4b090", "rgba(255,255,255,0.22)"), maxWidth: "80px" }}>{item.label}</p>
                </div>
              );
              return hasDoc ? (
                <button key={item.year} onClick={() => setSelected(item.docId!)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform relative z-10"
                  style={{ minWidth: "90px", padding: "0 8px" }}>
                  {dot}{label}
                </button>
              ) : (
                <div key={item.year} className="flex flex-col items-center gap-2 relative z-10 pointer-events-none"
                  style={{ minWidth: "90px", padding: "0 8px" }}>
                  {dot}{label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* My Highlights Banner */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowHighlightPocket(true)}
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl active:scale-[0.99] transition-transform"
          style={{
            background: "rgba(201,169,97,0.07)",
            border: "1px solid rgba(201,169,97,0.22)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(201,169,97,0.14)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-black" style={{ color: th.textPrimary }}>
              {lang === "es" ? "Mis Resaltados" : "My Highlights"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: th.textSecondary }}>
              {lang === "es" ? "Pasajes guardados de documentos históricos" : "Saved passages from Historical Documents"}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Continue Reading */}
      {LEARN_DOCUMENTS.some(d => (progressMap[d.id] ?? 0) > 0 && (progressMap[d.id] ?? 0) < 100) && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-sm font-bold" style={{ color: th.textPrimary }}>{t(lang, "learn_continue")}</p>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
            {[...LEARN_DOCUMENTS.filter(doc => (progressMap[doc.id] ?? 0) > 0 && (progressMap[doc.id] ?? 0) < 100)].sort((a, b) => getDocLastRead(b.id) - getDocLastRead(a.id)).map(doc => {
              const pct = progressMap[doc.id] ?? 0;
              const savedProgress = loadReaderProgress(doc.id, FULL_DOCUMENT_SECTIONS[doc.id] ? "full" : "overview");
              return (
                <div key={doc.id} className="flex-shrink-0 w-[108px] text-left">
                  <div className="relative w-[108px] rounded-[14px] overflow-hidden mb-1.5 shadow-md shadow-black/40" style={{ aspectRatio: "2/3", border: `1px solid ${th.cardBorder}` }}>
                    <button onClick={() => setSelected(doc.id)} className="absolute inset-0 w-full h-full active:scale-95 transition-transform" />
                    <DocCover doc={doc} />
                  </div>
                  <button onClick={() => setSelected(doc.id)} className="w-full text-left">
                    <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{documentTitle(doc, lang)}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>{doc.origin}</p>
                    <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: th.progressBar }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-[9px]" style={{ color: th.textSecondary }}>
                        {savedProgress
                          ? `${lang === "es" ? "Página" : "Page"} ${savedProgress.page} ${lang === "es" ? "de" : "of"} ${savedProgress.total}`
                          : lang === "es" ? "En progreso" : "In progress"}
                      </p>
                      <p className="text-[9px] font-bold" style={{ color: th.accent }}>{pct}%</p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Rows */}
      {([
        { key: "confession", label: "Confessions",       esLabel: "Confesiones" },
        { key: "creed",      label: "Creeds",            esLabel: "Credos" },
        { key: "catechism",  label: "Catechisms",        esLabel: "Catecismos" },
        { key: "council",    label: "Councils & Synods", esLabel: "Concilios y Sínodos" },
        { key: "debate",     label: "Debates",           esLabel: "Debates" },
        { key: "theses",     label: "Theses",            esLabel: "Tesis" },
        { key: "solas",      label: "The Five Solas",    esLabel: "Las Cinco Solas" },
        { key: "history",    label: "Church History",    esLabel: "Historia de la Iglesia" },
      ] as { key: string; label: string; esLabel: string }[]).map(({ key, label, esLabel }) => {
        const docs = LEARN_DOCUMENTS.filter((d) => d.category === key);
        if (docs.length === 0) return null;
        const showAll = catExpanded[key] ?? false;
        const displayed = showAll ? docs : docs.slice(0, 3);
        return (
          <div key={key} className="mb-7">
            <div className="flex items-center justify-between px-4 mb-3">
              <p className="text-sm font-black" style={{ color: th.textPrimary }}>
                {lang === "es" ? esLabel : label}
              </p>
              {docs.length > 3 && (
                <button
                  onClick={() => setCatExpanded((p) => ({ ...p, [key]: !p[key] }))}
                  className="text-xs font-semibold"
                  style={{ color: th.accent }}
                >
                  {showAll
                    ? (lang === "es" ? "Mostrar menos" : "Show less")
                    : (lang === "es" ? "Ver todo" : "See all")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 px-4">
              {displayed.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelected(doc.id)}
                  className="text-left active:scale-95 transition-transform"
                >
                  <div
                    className="relative w-full rounded-[14px] overflow-hidden mb-1.5 shadow-md shadow-black/40"
                    style={{ aspectRatio: "2/3", border: `1px solid ${th.cardBorder}` }}
                  >
                    <DocCover doc={doc} size="full" />
                  </div>
                  <p className="text-[10px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>
                    {documentTitle(doc, lang)}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: th.textSecondary }}>{doc.year}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-center text-[10px] px-4 pb-10 mt-4" style={{ color: th.footerText }}>
        All documents are public domain · Progress saved locally in your browser
      </p>

      {/* ── My Highlights Pocket ──────────────────────────────────────────────── */}
      {showHighlightPocket && (
        <div className="fixed inset-0 z-[65]" style={{ background: isLight ? "#ffffff" : "#070b14", color: isLight ? "#0a0a0a" : "white" }}>
          <div className="max-w-lg mx-auto h-full overflow-hidden flex flex-col">

            {/* Header */}
            <div
              className="px-5 pb-4 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.14)", paddingTop: "max(env(safe-area-inset-top), 18px)" }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                  {lang === "es" ? "Documentos Históricos" : "Historical Documents"}
                </p>
                <h2 className="text-[30px] leading-none font-black mt-1">
                  {lang === "es" ? "Mis Resaltados" : "My Highlights"}
                </h2>
              </div>
              <button
                onClick={() => { setShowHighlightPocket(false); setConfirmRemoveId(null); setHlSearch(""); }}
                className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", color: isLight ? "rgba(0,0,0,0.4)" : undefined }}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4 pb-3 flex-shrink-0">
              <label
                className="flex items-center gap-3 rounded-[22px] px-4 py-3"
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.055)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="1.8" />
                  <path d="M16.5 16.5L21 21" stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  value={hlSearch}
                  onChange={(e) => setHlSearch(e.target.value)}
                  placeholder={lang === "es" ? "Buscar documento, sección o texto..." : "Search document, section, or text..."}
                  className="min-w-0 flex-1 bg-transparent outline-none text-sm font-bold"
                  style={{ color: isLight ? "#0a0a0a" : "white" }}
                />
                {hlSearch && (
                  <button onClick={() => setHlSearch("")} className="text-sm flex-shrink-0 leading-none" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                    ✕
                  </button>
                )}
              </label>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 pb-10">
              {docHighlights.length === 0 ? (
                <div
                  className="rounded-[30px] p-7 text-center mt-4"
                  style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p className="font-black text-lg mb-2">
                    {lang === "es" ? "Sin resaltados aún" : "No highlights yet"}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                    {lang === "es"
                      ? "Selecciona texto mientras lees un documento para guardar un resaltado."
                      : "Select text while reading a document to save a highlight."}
                  </p>
                </div>
              ) : filteredDocHls.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}>
                    {lang === "es" ? "Sin resultados" : `No results for "${hlSearch}"`}
                  </p>
                </div>
              ) : (
                <div className="space-y-7 pt-2">

                  {/* Recent */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-black mb-3" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                      {lang === "es" ? "Recientes" : "Recent"}
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x" style={{ scrollbarWidth: "none" }}>
                      {filteredDocHls.slice(0, 5).map((hl) => {
                        const DOT: Record<string, string> = { purple: "#a855f7", yellow: "#eab308", red: "#ef4444", blue: "#3b82f6", lime: "#84cc16", pink: "#ec4899", gold: "#c9a961", rose: "#f472b6", green: "#4ade80" };
                        const dot = DOT[hl.color] ?? "#c9a961";
                        return (
                          <div
                            key={hl.id}
                            className="w-[82%] snap-start rounded-[26px] p-4 flex flex-col gap-2 flex-shrink-0 overflow-hidden"
                            style={{ background: isLight ? "rgba(0,0,0,0.03)" : `linear-gradient(135deg,${dot}18 0%,rgba(255,255,255,0.04) 100%)`, border: isLight ? "1px solid rgba(0,0,0,0.08)" : `1px solid ${dot}30` }}
                          >
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] truncate" style={{ color: isLight ? "rgba(0,0,0,0.45)" : dot }}>
                              {hl.docTitle}
                            </p>
                            <p
                              className="text-[13px] leading-snug line-clamp-3 flex-1"
                              style={{ color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)", fontFamily: "Georgia, serif" }}
                            >
                              &ldquo;{hl.text}&rdquo;
                            </p>
                            <button
                              onClick={() => { setSelected(hl.docId); setShowHighlightPocket(false); }}
                              className="self-start text-[10px] font-black px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                              style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.15)", color: isLight ? "#0a0a0a" : "#c9a961", border: isLight ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(201,169,97,0.28)" }}
                            >
                              {lang === "es" ? "Abrir resaltado →" : "Open highlight →"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* By Document */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-black mb-3" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "#c9a961" }}>
                      {lang === "es" ? "Por Documento" : "By Document"}
                    </p>
                    <div className="space-y-3">
                      {Object.keys(hlByDoc).map((docId) => {
                        const { docTitle: dTitle, sections } = hlByDoc[docId];
                        const sectionIds = Object.keys(sections);
                        const totalHls = Object.values(sections).reduce((n, arr) => n + arr.length, 0);
                        return (
                          <div
                            key={docId}
                            className="rounded-[28px] p-4"
                            style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.035)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.07)" }}
                          >
                            <button
                              className="w-full flex items-center justify-between mb-1 active:opacity-70 transition-opacity"
                              onClick={() => setHlDocCollapsed((p) => ({ ...p, [docId]: !p[docId] }))}
                            >
                              <p className="font-black text-sm text-left">{dTitle}</p>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                                  style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.15)", color: isLight ? "#0a0a0a" : "#c9a961" }}
                                >
                                  {totalHls}
                                </span>
                                <svg
                                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="2.2"
                                  strokeLinecap="round" strokeLinejoin="round"
                                  style={{ transform: hlDocCollapsed[docId] ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </div>
                            </button>
                            {!hlDocCollapsed[docId] && <div className="space-y-2 mt-3">
                              {sectionIds.map((secId) => {
                                const sectionLabel = FULL_DOCUMENT_SECTIONS[docId]?.find(s => s.id === secId)?.title
                                  ?? LEARN_DOCUMENTS.find(d => d.id === docId)?.sections.find(s => s.id === secId)?.title
                                  ?? secId.replace(/-/g, " ");
                                return (
                                  <div
                                    key={secId}
                                    className="rounded-[22px] p-3"
                                    style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.06)" }}
                                  >
                                    <p
                                      className="text-[9px] font-black uppercase tracking-widest mb-2"
                                      style={{ color: isLight ? "rgba(0,0,0,0.38)" : "rgba(201,169,97,0.65)" }}
                                    >
                                      {sectionLabel}
                                    </p>
                                    <div className="space-y-2">
                                      {sections[secId].map((hl) => {
                                        const DOT: Record<string, string> = { purple: "#a855f7", yellow: "#eab308", red: "#ef4444", blue: "#3b82f6", lime: "#84cc16", pink: "#ec4899", gold: "#c9a961", rose: "#f472b6", green: "#4ade80" };
                                        const dot = DOT[hl.color] ?? "#c9a961";
                                        return (
                                          <div
                                            key={hl.id}
                                            className="rounded-[18px] p-3"
                                            style={{ background: isLight ? "rgba(0,0,0,0.03)" : `${dot}0a`, border: isLight ? "1px solid rgba(0,0,0,0.07)" : `1px solid ${dot}22` }}
                                          >
                                            <div className="flex items-start gap-2 mb-2">
                                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: dot }} />
                                              <p
                                                className="text-[13px] leading-snug flex-1"
                                                style={{ color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)", fontFamily: "Georgia, serif" }}
                                              >
                                                &ldquo;{hl.text}&rdquo;
                                              </p>
                                              <button
                                                onClick={() => setConfirmRemoveId(hl.id)}
                                                className="text-xs flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
                                                style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)" }}
                                              >
                                                ×
                                              </button>
                                            </div>
                                            <button
                                              onClick={() => { setSelected(hl.docId); setShowHighlightPocket(false); }}
                                              className="text-[10px] font-black px-3 py-1 rounded-full active:scale-95 transition-transform"
                                              style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(201,169,97,0.12)", color: isLight ? "#0a0a0a" : "#c9a961", border: isLight ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(201,169,97,0.22)" }}
                                            >
                                              {lang === "es" ? "Abrir resaltado →" : "Open highlight →"}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Confirm remove */}
          {confirmRemoveId && (
            <div className="absolute inset-0 z-10 flex items-center justify-center px-8 bg-black/55 backdrop-blur-sm">
              <div
                className="w-full max-w-[300px] rounded-[28px] p-5 text-center"
                style={{ background: isLight ? "#f5f5f5" : "#1a1d27", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.18)", color: isLight ? "#0a0a0a" : "white" }}
              >
                <p className="font-black text-base mb-1">
                  {lang === "es" ? "¿Eliminar resaltado?" : "Remove highlight?"}
                </p>
                <p className="text-sm mb-5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
                  {lang === "es" ? "Esta acción no se puede deshacer." : "This cannot be undone."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                    style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)" }}
                  >
                    {lang === "es" ? "Cancelar" : "Cancel"}
                  </button>
                  <button
                    onClick={() => {
                      const target = docHighlights.find(h => h.id === confirmRemoveId);
                      if (target) {
                        const key = `tulip-reader-highlights:learn-${target.docId}-${target.sectionId}`;
                        try {
                          const raw = localStorage.getItem(key);
                          const arr = raw ? (JSON.parse(raw) as Highlight[]) : [];
                          const value = JSON.stringify(arr.filter(h => h.id !== confirmRemoveId));
                          localStorage.setItem(key, value);
                          syncKey(key, value).catch(() => {});
                        } catch {}
                        setDocHighlights(prev => prev.filter(h => h.id !== confirmRemoveId));
                      }
                      setConfirmRemoveId(null);
                    }}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                    style={{ background: "rgba(239,68,68,0.18)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.28)" }}
                  >
                    {lang === "es" ? "Eliminar" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bookmark modal */}
      {bookmarkTarget && (
        <BookmarkModal
          item={{
            id: `learn::${bookmarkTarget.id}`,
            type: "learn",
            title: bookmarkTarget.title,
            subtitle: bookmarkTarget.origin,
            preview: String(bookmarkTarget.year),
          }}
          label={bookmarkTarget.title}
          onClose={() => { setBookmarkTarget(null); refreshSaved(); }}
        />
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnPageInner />
    </Suspense>
  );
}
