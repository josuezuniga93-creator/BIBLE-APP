"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { usePagination } from "../hooks/usePagination";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { LEARN_DOCUMENTS, FULL_DOCUMENT_SECTIONS, LearnDocument, LearnSection } from "../lib/learnData";
import { applyHighlightsToHtml } from "../lib/highlights";
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
type DocTab = "all" | "confession" | "creed" | "debate" | "council" | "catechism";

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
  const isLight = theme === "light-elegant";
  const isGoldNavy = theme === "gold-navy";
  const d = <T,>(light: T, gold: T, dark: T): T => isLight ? light : isGoldNavy ? gold : dark;

  const th = {
    pageBg:         isLight ? "#f5f1eb"                               : "#0e0e18",
    textPrimary:    isLight ? "#1c1409"                               : "rgba(255,255,255,0.95)",
    textSecondary:  isLight ? "#6b5226"                               : "rgba(255,255,255,0.85)",
    textMuted:      isLight ? "#9b8560"                               : "rgba(255,255,255,0.5)",
    textFaint:      isLight ? "#b09878"                               : "rgba(255,255,255,0.4)",
    textContent:    isLight ? "#2a1e08"                               : "rgba(255,255,255,0.78)",
    accent:         d("#9b7228",  "#c9a961", "#a78bfa"),
    accentLight:    d("#c4973a",  "#d4b878", "#c4b5fd"),
    primary:        d("#9b7228",  "#c9a961", "#7c3aed"),
    topBarBg:       isLight ? "rgba(245,241,235,0.95)"                : "rgba(14,14,24,0.95)",
    topBarBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.07)",
    drawerBg:       isLight ? "#f0ebe0"                               : "#141424",
    drawerBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    drawerItemActive:    d("rgba(155,114,40,0.15)", "rgba(201,169,97,0.20)", "rgba(124,58,237,0.2)"),
    drawerItemActiveColor: d("#9b7228", "#c9a961",  "#c4b5fd"),
    drawerItemColor:isLight ? "#9b8560"                               : "rgba(255,255,255,0.4)",
    settingsBg:     isLight ? "#f0ebe0"                               : "#141424",
    settingsBorder: isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    settingsBtnActive:       d("rgba(155,114,40,0.2)",  "rgba(201,169,97,0.25)", "rgba(124,58,237,0.3)"),
    settingsBtnActiveBorder: d("rgba(155,114,40,0.5)",  "rgba(201,169,97,0.50)", "rgba(124,58,237,0.5)"),
    settingsBtnInactive: isLight ? "rgba(155,114,40,0.06)"            : "rgba(255,255,255,0.05)",
    settingsBtnInactiveBorder: isLight ? "rgba(155,114,40,0.14)"      : "rgba(255,255,255,0.08)",
    navBtnBg:       isLight ? "rgba(155,114,40,0.08)"                 : "rgba(255,255,255,0.07)",
    navBtnBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    navBtnColor:    isLight ? "#6b5226"                               : "rgba(255,255,255,0.6)",
    navNextGradient: d("linear-gradient(135deg,#c4973a,#9b7228)", "linear-gradient(135deg,#c9a961,#d4b878)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    dividerColor:   isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.06)",
    footerText:     isLight ? "rgba(155,114,40,0.5)"                  : "rgba(255,255,255,0.15)",
    progressTrack:  isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.08)",
    progressBar:    d("linear-gradient(90deg,#c4973a,#9b7228)", "linear-gradient(90deg,#c9a961,#d4b878)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    bottomBarBg:    isLight ? "rgba(245,241,235,0.97)"                : "rgba(14,14,24,0.97)",
    bottomBarBorder:isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.07)",
    bottomBarDivider:isLight? "rgba(155,114,40,0.12)"                 : "rgba(255,255,255,0.05)",
    sliderTrack:    d(`linear-gradient(to right,#9b7228 `, `linear-gradient(to right,#c9a961 `, `linear-gradient(to right,#a855f7 `),
    sliderThumb:    d("linear-gradient(135deg,#c4973a,#9b7228)", "linear-gradient(135deg,#c9a961,#d4b878)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    sliderThumbShadow: isLight ? "" : isGoldNavy ? "" : "box-shadow:0 0 8px rgba(168,85,247,0.6);",
    sliderTrackBg:  isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.1)",
    bottomIconColor:isLight ? "#9b8560"                               : "rgba(255,255,255,0.4)",
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
  const isLight = theme === "light-elegant";
  const isGoldNavy = theme === "gold-navy";
  const d = <T,>(light: T, gold: T, dark: T): T => isLight ? light : isGoldNavy ? gold : dark;
  const fullDocumentSections = FULL_DOCUMENT_SECTIONS[doc.id] ?? null;
  const hasFullDocument = !!fullDocumentSections;

  const th = {
    pageBg:         isLight ? "#f5f1eb"                               : "#0e0e18",
    textPrimary:    isLight ? "#1c1409"                               : "rgba(255,255,255,0.95)",
    textSecondary:  isLight ? "#6b5226"                               : "rgba(255,255,255,0.85)",
    textMuted:      isLight ? "#9b8560"                               : "rgba(255,255,255,0.45)",
    textFaint:      isLight ? "#b09878"                               : "rgba(255,255,255,0.3)",
    accent:         d("#9b7228",  "#c9a961", "#a78bfa"),
    accentLight:    d("#c4973a",  "#d4b878", "#c4b5fd"),
    primary:        d("#9b7228",  "#c9a961", "#7c3aed"),
    topBarBg:       isLight ? "rgba(245,241,235,0.95)"                : "rgba(14,14,24,0.95)",
    topBarBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.07)",
    tagBg:          d("rgba(155,114,40,0.12)",  "rgba(201,169,97,0.18)", "rgba(124,58,237,0.2)"),
    tagBorder:      d("rgba(155,114,40,0.35)",  "rgba(201,169,97,0.40)", "rgba(124,58,237,0.35)"),
    tagColor:       d("#9b7228",  "#c9a961", "#c4b5fd"),
    btnBorder:      isLight ? "rgba(155,114,40,0.22)"                 : "rgba(255,255,255,0.12)",
    modeBg:         isLight ? "rgba(155,114,40,0.07)"                 : "rgba(255,255,255,0.04)",
    modeBorder:     isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    modeActiveBg:   d("rgba(155,114,40,0.18)",  "rgba(201,169,97,0.22)", "rgba(124,58,237,0.24)"),
    modeActiveText: d("#6b5226",  "#d4b878", "#ddd6fe"),
    modeInactiveText:isLight ? "#9b8560"                              : "rgba(255,255,255,0.42)",
    progressTrack:  isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.08)",
    progressBar:    d("linear-gradient(90deg,#c4973a,#9b7228)", "linear-gradient(90deg,#c9a961,#d4b878)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    readGradient:   d("linear-gradient(135deg,#c4973a,#9b7228)", "linear-gradient(135deg,#c9a961,#d4b878)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    divider:        isLight ? "rgba(155,114,40,0.12)"                 : "rgba(255,255,255,0.06)",
    sectionRowBg:   isLight ? "rgba(155,114,40,0.06)"                 : "rgba(255,255,255,0.03)",
    sectionRowBorder:isLight ? "rgba(155,114,40,0.18)"                : "rgba(255,255,255,0.07)",
    sectionDoneBg:  d("rgba(155,114,40,0.15)",  "rgba(201,169,97,0.22)", "rgba(124,58,237,0.3)"),
    sectionDoneBorder:d("rgba(155,114,40,0.45)","rgba(201,169,97,0.50)", "rgba(124,58,237,0.5)"),
    sectionDoneNum: d("#9b7228",  "#c9a961", "#c4b5fd"),
    sectionPendingBg:isLight ? "rgba(155,114,40,0.06)"                : "rgba(255,255,255,0.07)",
    sectionPendingBorder:isLight?"rgba(155,114,40,0.18)"              : "rgba(255,255,255,0.1)",
    sectionPendingNum:isLight ? "#9b8560"                             : "rgba(255,255,255,0.3)",
    sectionDoneTitle:d("#9b7228", "#c9a961", "#c4b5fd"),
    sectionTitle:   isLight ? "#2a1e08"                               : "rgba(255,255,255,0.8)",
    sectionLabel:   isLight ? "#9b8560"                               : "rgba(255,255,255,0.3)",
    sectionArrow:   isLight ? "rgba(155,114,40,0.5)"                  : "rgba(255,255,255,0.25)",
    star:           d("#c4973a",  "#c9a961", "#c9a961"),
    starText:       isLight ? "#6b5226"                               : "rgba(255,255,255,0.7)",
    starFaint:      isLight ? "#9b8560"                               : "rgba(255,255,255,0.3)",
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
        <button onClick={() => setReading(validSavedProgress?.sectionId ?? readerSections[0]?.id ?? null)} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
          style={{ background: th.readGradient }}>
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
  const isLight = theme === "light-elegant";
  const isPink = theme === "light-pink";
  const isGoldNavy = theme === "gold-navy";
  const pick = (pink: string, light: string, dark: string) => isPink ? pink : isLight ? light : dark;

  const th = {
    pageBg:            pick("#fff0f5", "#f5f1eb", "#0e0e18"),
    textPrimary:       pick("#4a0020", "#1c1409", "rgba(255,255,255,0.95)"),
    textSecondary:     pick("rgba(74,0,32,0.62)", "#6b5226", "rgba(255,255,255,0.38)"),
    textMuted:         pick("rgba(74,0,32,0.52)", "#9b8560", "rgba(255,255,255,0.45)"),
    textFaint:         pick("rgba(74,0,32,0.38)", "#b09878", "rgba(255,255,255,0.25)"),
    textVeryFaint:     pick("rgba(74,0,32,0.28)", "#c4b090", "rgba(255,255,255,0.22)"),
    accent:            pick("#db2777", "#9b7228", "#a78bfa"),
    accentLight:       pick("#be185d", "#c4973a", "#c4b5fd"),
    primary:           pick("#db2777", "#9b7228", "#7c3aed"),
    heroBg:            pick(
      "linear-gradient(135deg,#f8dce9 0%,#fff8fb 55%,#f7cedf 100%)",
      "linear-gradient(135deg,rgba(196,151,58,0.28) 0%,rgba(237,228,205,0.96) 55%,rgba(215,196,148,0.22) 100%)",
      "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)"
    ),
    heroAccentText:    pick("#be185d", "#9b7228", "#c084fc"),
    heroSubtext:       pick("rgba(74,0,32,0.62)", "rgba(107,82,38,0.85)", "rgba(255,255,255,0.4)"),
    searchBg:          pick("rgba(252,231,243,0.7)", "rgba(155,114,40,0.08)", "rgba(255,255,255,0.06)"),
    searchBorder:      pick("rgba(219,39,119,0.20)", "rgba(155,114,40,0.22)", "rgba(255,255,255,0.08)"),
    catActiveBg:       pick("#f7d1e3", "rgba(155,114,40,0.15)", "rgba(124,58,237,0.25)"),
    catActiveBorder:   pick("rgba(219,39,119,0.38)", "rgba(155,114,40,0.5)", "rgba(167,139,250,0.5)"),
    catInactiveBg:     pick("rgba(252,231,243,0.72)", "rgba(155,114,40,0.04)", "rgba(255,255,255,0.04)"),
    catInactiveBorder: pick("rgba(219,39,119,0.14)", "rgba(155,114,40,0.14)", "rgba(255,255,255,0.08)"),
    cardBg:            pick("#fff8fb", "rgba(155,114,40,0.06)", "rgba(255,255,255,0.03)"),
    cardBorder:        pick("rgba(219,39,119,0.16)", "rgba(155,114,40,0.20)", "rgba(255,255,255,0.07)"),
    progressTrack:     pick("rgba(219,39,119,0.14)", "rgba(155,114,40,0.15)", "rgba(255,255,255,0.08)"),
    progressBar:       pick("linear-gradient(90deg,#ec4899,#be185d)", "linear-gradient(90deg,#c4973a,#9b7228)", "linear-gradient(90deg,#ec4899,#a855f7)"),
    tabStripBorder:    pick("rgba(219,39,119,0.16)", "rgba(155,114,40,0.18)", "rgba(255,255,255,0.07)"),
    tabActiveBorder:   pick("#db2777", "#9b7228", "#7c3aed"),
    tabInactiveColor:  pick("rgba(74,0,32,0.45)", "#9b8560", "rgba(255,255,255,0.3)"),
    timelineLine:      pick("linear-gradient(90deg,transparent,rgba(219,39,119,0.28),transparent)", "linear-gradient(90deg,transparent,rgba(155,114,40,0.4),transparent)", "linear-gradient(90deg,transparent,rgba(167,139,250,0.4),transparent)"),
    timelineDotEven:   pick("linear-gradient(135deg,#ec4899,#db2777)", "linear-gradient(135deg,#c4973a,#9b7228)", "linear-gradient(135deg,#ec4899,#a855f7)"),
    timelineDotOdd:    pick("linear-gradient(135deg,#db2777,#be185d)", "linear-gradient(135deg,#9b7228,#6b4a10)", "linear-gradient(135deg,#a855f7,#7c3aed)"),
    timelineDotShadow: pick("none", "none", "0 0 8px rgba(168,85,247,0.5)"),
    timelineYear:      pick("#be185d", "#9b7228", "#a78bfa"),
    timelineLabel:     pick("rgba(74,0,32,0.52)", "#9b8560", "rgba(255,255,255,0.45)"),
    startReading:      pick("#be185d", "#9b7228", "rgba(167,139,250,0.65)"),
    star:              pick("#db2777", "#c4973a", "#c9a961"),
    footerText:        pick("rgba(74,0,32,0.46)", "rgba(155,114,40,0.5)", "rgba(255,255,255,0.15)"),
    iconMuted:         pick("rgba(74,0,32,0.48)", "#9b8560", "rgba(255,255,255,0.3)"),
  };

  // Gold Navy overrides — replace purple/violet with antique gold
  if (isGoldNavy) {
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

  function refreshSaved() {
    setSavedDocs(new Set(LEARN_DOCUMENTS.filter((d) => isAnySaved(`learn::${d.id}`)).map((d) => d.id)));
  }

  useEffect(() => { refreshSaved(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* Header */}
      <div className="flex items-center px-4 pt-5 pb-2">
        <h1 className="text-lg font-bold" style={{ color: th.textPrimary }}>
          {lang === "es" ? t(lang, "learn_page_title") : "Historical"} <span style={{ color: th.accent }}>{lang === "es" ? t(lang, "learn_page_accent") : "Documents"}</span>
        </h1>
      </div>

      {/* Hero banner */}
      <div className="mx-4 mb-6 rounded-2xl overflow-hidden relative" style={{ background: th.heroBg, minHeight: "130px" }}>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none">
          <GeneratedCategoryMark id="document" size={76} />
        </div>
        {!isLight && !isPink && (
          <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle,#c084fc 0%,transparent 70%)" }} />
        )}
        <div className="relative px-5 py-5">
          <h2 className="text-xl font-black leading-tight mb-1">
            <span style={{ color: th.heroAccentText }}>{t(lang, "learn_hero_line1")}</span>
            <br /><span style={{ color: th.textPrimary }}>{t(lang, "learn_hero_line2")}</span>
          </h2>
          <p className="text-xs mb-4" style={{ color: th.heroSubtext }}>
            {t(lang, "learn_hero_sub")}
          </p>
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

      {/* Browse by Type */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>{t(lang, "learn_browse_type")}</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>{t(lang, "learn_view_all")}</button>
        </div>
        <div className="flex gap-2.5 px-4 overflow-x-auto pb-1 scrollbar-none">
          {DOC_TYPES.map(({ key, label }) => {
            const active = activeType === key;
            const labelText =
              key === "all" ? t(lang, "learn_type_all") :
              key === "confession" ? t(lang, "learn_type_confessions") :
              key === "creed" ? t(lang, "learn_type_creeds") :
              key === "debate" ? t(lang, "learn_type_debates") :
              key === "council" ? t(lang, "learn_type_councils") :
              lang === "es" && key === "catechism" ? "Catecismos" :
              label;
            return (
              <button key={key} onClick={() => { setActiveType(key); setActiveTab("all"); }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ border: active ? `1px solid ${th.catActiveBorder}` : `1px solid ${th.catInactiveBorder}`, backgroundColor: active ? th.catActiveBg : th.catInactiveBg, color: active ? th.accentLight : th.textMuted }}>
                <GeneratedCategoryMark id={key} active={active} size={30} />
                <span className="text-[10px] font-bold whitespace-nowrap">{labelText}</span>
              </button>
            );
          })}
        </div>
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
                <div key={doc.id} className="flex-shrink-0 w-32 text-left">
                  <div className="relative w-32 h-44 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40" style={{ border: `1px solid ${th.cardBorder}` }}>
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

      {/* Featured Documents */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Featured Documents</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
          {filteredDocs.slice(0, 8).map((doc) => {
            const saved = savedDocs.has(doc.id);
            return (
              <div key={doc.id} className="flex-shrink-0 w-28 text-left">
                <div className="relative w-28 h-40 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40" style={{ border: `1px solid ${th.cardBorder}` }}>
                  <button onClick={() => setSelected(doc.id)} className="absolute inset-0 w-full h-full active:scale-95 transition-transform" />
                  <DocCover doc={doc} />
                  {/* Floating bookmark */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setBookmarkTarget(doc); }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)", color: saved ? "#c4973a" : "rgba(255,255,255,0.6)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}>
                      <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <button onClick={() => setSelected(doc.id)} className="w-full text-left">
                  <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{documentTitle(doc, lang)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>{doc.origin}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span style={{ color: th.star, fontSize: "10px" }}>★</span>
                    <span style={{ color: th.textSecondary, fontSize: "10px" }}>{doc.year}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Documents */}
      <div id="my-documents" className="px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold" style={{ color: th.textPrimary }}>My Documents</p>
          <div className="flex items-center gap-3">
            <button style={{ color: th.iconMuted }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <button style={{ color: th.iconMuted }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-5" style={{ borderBottom: `1px solid ${th.tabStripBorder}` }}>
          {(["all","confession","creed","debate","council"] as DocTab[]).map((tab) => {
            const labels: Record<string,string> = { all:"All", confession:"Confessions", creed:"Creeds", debate:"Debates", council:"Councils" };
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-[10px] font-bold transition-all"
                style={{ borderBottom: active ? `2px solid ${th.tabActiveBorder}` : "2px solid transparent", color: active ? th.accentLight : th.tabInactiveColor, marginBottom: "-1px" }}>
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {listDocs.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-3 flex justify-center">
              <GeneratedMetaIcon type="document" size={44} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: th.textMuted }}>
              {lang === "es" ? "No se encontraron documentos" : "No documents found"}
            </p>
            <p className="text-xs" style={{ color: th.textFaint }}>
              {lang === "es" ? "Prueba otro tipo o pestaña" : "Try selecting a different type or tab"}
            </p>
          </div>
        )}

        {/* Document rows */}
        <div className="space-y-3">
          {listDocs.map((doc) => {
            const pct = progressMap[doc.id] ?? 0;
            const isDone = pct === 100;
            const saved = savedDocs.has(doc.id);
            const savedProgress = loadReaderProgress(doc.id, FULL_DOCUMENT_SECTIONS[doc.id] ? "full" : "overview");
            return (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.99]"
                style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
                <button onClick={() => setSelected(doc.id)} className="flex-shrink-0 w-14 h-[72px] rounded-xl overflow-hidden shadow-lg shadow-black/40" style={{ border: `1px solid ${th.cardBorder}` }}>
                  <DocCover doc={doc} size="small" />
                </button>
                <button onClick={() => setSelected(doc.id)} className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold truncate" style={{ color: th.textPrimary }}>{documentTitle(doc, lang)}</p>
                  <p className="text-xs mt-0.5" style={{ color: th.textSecondary }}>{doc.origin} · {doc.year}</p>
                  {isDone ? (
                    <p className="text-xs font-bold mt-1.5" style={{ color: "#34d399" }}>{lang === "es" ? "Completado" : "Completed"}</p>
                  ) : pct > 0 ? (
                    <div className="mt-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: th.progressTrack }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: th.progressBar }} />
                        </div>
                        <span style={{ color: th.textSecondary, fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>{pct}%</span>
                      </div>
                      {savedProgress && (
                        <p className="text-[10px] mt-1" style={{ color: th.textSecondary }}>
                          {lang === "es" ? "Página" : "Page"} {savedProgress.page} {lang === "es" ? "de" : "of"} {savedProgress.total}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: th.startReading, fontSize: "11px", marginTop: "5px", fontWeight: "600" }}>{lang === "es" ? "Empezar a leer →" : "Start reading →"}</p>
                  )}
                </button>
                {isDone ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ border: "2px solid #34d399" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ) : (
                  <button
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                    style={{ color: saved ? "#c4973a" : th.textVeryFaint }}
                    onClick={() => setBookmarkTarget(doc)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}>
                      <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] mt-10" style={{ color: th.footerText }}>
          All documents are public domain · Progress saved locally in your browser
        </p>
      </div>

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
