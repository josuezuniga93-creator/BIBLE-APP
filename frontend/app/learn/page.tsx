"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LEARN_DOCUMENTS, ACCENT_CLASSES, LearnDocument, LearnSection } from "../lib/learnData";
import { useHighlights } from "../lib/useHighlights";
import { applyHighlightsToHtml } from "../lib/highlights";
import { HighlightToolbar } from "../components/HighlightToolbar";
import { RemoveHighlightBubble } from "../components/RemoveHighlightBubble";
import { useTheme } from "../lib/useTheme";

// ─── Progress helpers ─────────────────────────────────────────────────────────

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
}

function getDocPct(doc: LearnDocument): number {
  const completed = loadProgress(doc.id);
  if (doc.sections.length === 0) return 0;
  return Math.round((completed.size / doc.sections.length) * 100);
}

// ─── Document cover art ───────────────────────────────────────────────────────

const DOC_COVERS: Record<string, { bg: string; border: string; accent: string; year: string; ornament: string }> = {
  "1689-lbc":          { bg: "linear-gradient(160deg,#1a0e00,#3b2200,#0f0900)", border: "#c9a227", accent: "#f0c060", year: "1689", ornament: "✦" },
  "westminster-cf":    { bg: "linear-gradient(160deg,#0a0a1a,#1a1a40,#060610)", border: "#7c6fc0", accent: "#b0a0e8", year: "1647", ornament: "⛪" },
  "heidelberg":        { bg: "linear-gradient(160deg,#0d1a0d,#1a3a1a,#080f08)", border: "#4a9a4a", accent: "#80cc80", year: "1563", ornament: "✝" },
  "dordrecht":         { bg: "linear-gradient(160deg,#1a0d00,#3a1e00,#0f0800)", border: "#d4822a", accent: "#f0a050", year: "1619", ornament: "🌿" },
  "apostles-creed":    { bg: "linear-gradient(160deg,#0d0d1a,#1e1e40,#080810)", border: "#6060b0", accent: "#9090d8", year: "AD 140", ornament: "α" },
  "nicene-creed":      { bg: "linear-gradient(160deg,#0a1a0a,#1a3a20,#060f08)", border: "#50a050", accent: "#80c880", year: "AD 381", ornament: "✦" },
  "95-theses":         { bg: "linear-gradient(160deg,#1a0a00,#380f00,#0f0600)", border: "#c04010", accent: "#f06030", year: "1517", ornament: "⚡" },
  "canons-of-dort":    { bg: "linear-gradient(160deg,#100a1a,#251560,#08060f)", border: "#8860c0", accent: "#b090e8", year: "1619", ornament: "⚖" },
  "belgic-confession": { bg: "linear-gradient(160deg,#001a10,#003828,#000f08)", border: "#20a060", accent: "#40c880", year: "1561", ornament: "🛡" },
  "council-trent":     { bg: "linear-gradient(160deg,#1a0a0a,#3a1010,#0f0606)", border: "#c03030", accent: "#e06060", year: "1547", ornament: "🏛" },
  "diet-of-worms":     { bg: "linear-gradient(160deg,#1a1200,#3a2800,#0f0c00)", border: "#c0902a", accent: "#e0b050", year: "1521", ornament: "⚔" },
};

const DEFAULT_DOC_COVER = { bg: "linear-gradient(160deg,#0d0d1a,#1a1a3b,#080810)", border: "#7070c0", accent: "#a0a0e0", year: "", ornament: "📜" };

// Custom photo covers — image overrides the gradient entirely
const DOC_IMAGES: Record<string, string> = {
  "jerusalem-council": "/covers/jerusalem-council.png",
  "apostles-creed":    "/covers/apostles-creed.png",
  "council-nicaea":    "/covers/council-nicaea.png",
};

function DocCover({ doc, size = "full" }: { doc: LearnDocument; size?: "full" | "small" | "featured" }) {
  const style = DOC_COVERS[doc.id] ?? DEFAULT_DOC_COVER;
  const imageSrc = DOC_IMAGES[doc.id];
  const isSmall = size === "small";
  const isFeatured = size === "featured";

  // If a custom photo exists, render it as a full-bleed cover image
  if (imageSrc) {
    return (
      <div className="w-full h-full" style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={imageSrc}
          alt={doc.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col justify-between"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}40`,
        padding: isSmall ? "6px" : isFeatured ? "12px" : "16px",
      }}
    >
      {/* Top ornament row */}
      <div className="flex justify-between items-start">
        <div style={{ width: "1px", alignSelf: "stretch", background: style.border, opacity: 0.4 }} />
        <span style={{ color: style.accent, opacity: 0.5, fontSize: isSmall ? "8px" : "14px" }}>{style.ornament}</span>
      </div>

      {/* Center */}
      <div className="text-center" style={{ padding: isSmall ? "0 2px" : "0 4px" }}>
        {!isSmall && style.year && (
          <p style={{ color: style.accent, opacity: 0.8, fontSize: isFeatured ? "20px" : "14px", fontWeight: "900", letterSpacing: "0.05em", marginBottom: "6px" }}>
            {style.year}
          </p>
        )}
        <p
          className="text-white font-bold leading-tight uppercase"
          style={{
            fontSize: isSmall ? "7px" : isFeatured ? "11px" : "11px",
            letterSpacing: "0.08em",
            opacity: 0.85,
            display: "-webkit-box",
            WebkitLineClamp: isSmall ? 4 : 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {doc.shortTitle}
        </p>
      </div>

      {/* Bottom rule */}
      <div style={{ height: "1px", width: "60%", margin: "0 auto", background: style.border, opacity: 0.4 }} />
    </div>
  );
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
  { key: "all",         label: "All",         icon: "📜" },
  { key: "confession",  label: "Confessions", icon: "✝️" },
  { key: "creed",       label: "Creeds",      icon: "🏛" },
  { key: "debate",      label: "Debates",     icon: "⚔️" },
  { key: "council",     label: "Councils",    icon: "👑" },
  { key: "catechism",   label: "Catechisms",  icon: "📖" },
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
  doc, section, completed, onToggle, onClose, onPrev, onNext, hasPrev, hasNext, onJump,
}: {
  doc: LearnDocument; section: LearnSection; completed: Set<string>;
  onToggle: (id: string) => void; onClose: () => void;
  onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
  onJump: (id: string) => void;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light-elegant";

  const th = {
    pageBg:         isLight ? "#f5f1eb"                               : "#0e0e18",
    textPrimary:    isLight ? "#1c1409"                               : "rgba(255,255,255,0.95)",
    textSecondary:  isLight ? "#6b5226"                               : "rgba(255,255,255,0.85)",
    textMuted:      isLight ? "#9b8560"                               : "rgba(255,255,255,0.5)",
    textFaint:      isLight ? "#b09878"                               : "rgba(255,255,255,0.4)",
    textContent:    isLight ? "#2a1e08"                               : "rgba(255,255,255,0.78)",
    accent:         isLight ? "#9b7228"                               : "#a78bfa",
    accentLight:    isLight ? "#c4973a"                               : "#c4b5fd",
    primary:        isLight ? "#9b7228"                               : "#7c3aed",
    topBarBg:       isLight ? "rgba(245,241,235,0.95)"                : "rgba(14,14,24,0.95)",
    topBarBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.07)",
    drawerBg:       isLight ? "#f0ebe0"                               : "#141424",
    drawerBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    drawerItemActive:isLight? "rgba(155,114,40,0.15)"                 : "rgba(124,58,237,0.2)",
    drawerItemActiveColor: isLight ? "#9b7228"                        : "#c4b5fd",
    drawerItemColor:isLight ? "#9b8560"                               : "rgba(255,255,255,0.4)",
    settingsBg:     isLight ? "#f0ebe0"                               : "#141424",
    settingsBorder: isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    settingsBtnActive: isLight ? "rgba(155,114,40,0.2)"               : "rgba(124,58,237,0.3)",
    settingsBtnActiveBorder: isLight ? "rgba(155,114,40,0.5)"         : "rgba(124,58,237,0.5)",
    settingsBtnInactive: isLight ? "rgba(155,114,40,0.06)"            : "rgba(255,255,255,0.05)",
    settingsBtnInactiveBorder: isLight ? "rgba(155,114,40,0.14)"      : "rgba(255,255,255,0.08)",
    navBtnBg:       isLight ? "rgba(155,114,40,0.08)"                 : "rgba(255,255,255,0.07)",
    navBtnBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.08)",
    navBtnColor:    isLight ? "#6b5226"                               : "rgba(255,255,255,0.6)",
    navNextGradient:isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": "linear-gradient(135deg,#ec4899,#a855f7)",
    dividerColor:   isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.06)",
    footerText:     isLight ? "rgba(155,114,40,0.5)"                  : "rgba(255,255,255,0.15)",
    bottomBarBg:    isLight ? "rgba(245,241,235,0.97)"                : "rgba(14,14,24,0.97)",
    bottomBarBorder:isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.07)",
    bottomBarDivider:isLight? "rgba(155,114,40,0.12)"                 : "rgba(255,255,255,0.05)",
    sliderTrack:    isLight ? `linear-gradient(to right,#9b7228 `     : `linear-gradient(to right,#a855f7 `,
    sliderThumb:    isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": "linear-gradient(135deg,#ec4899,#a855f7)",
    sliderThumbShadow: isLight ? ""                                   : "box-shadow:0 0 8px rgba(168,85,247,0.6);",
    sliderTrackBg:  isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.1)",
    bottomIconColor:isLight ? "#9b8560"                               : "rgba(255,255,255,0.4)",
  };

  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const hlContext = `learn-${doc.id}-${section.id}`;
  const { highlights, selection, addHighlight, removeHighlight, dismissSelection } = useHighlights(hlContext);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const sectionIndex = doc.sections.findIndex((s) => s.id === section.id);
  const progressPct = doc.sections.length > 0 ? Math.round(((sectionIndex + 1) / doc.sections.length) * 100) : 0;

  const sliderCss = `.hist-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}.hist-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${th.sliderThumb};${th.sliderThumbShadow}border:2px solid rgba(255,255,255,0.3)}.hist-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${th.sliderThumb};border:2px solid rgba(255,255,255,0.3)}`;

  useEffect(() => { contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [section.id]);
  useEffect(() => { if (!completed.has(section.id)) onToggle(section.id); }, [section.id]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 h-12"
        style={{ backgroundColor: th.topBarBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${th.topBarBorder}` }}
      >
        <button onClick={onClose} className="flex items-center gap-1 min-w-[40px]" style={{ color: th.textMuted }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-sm font-bold truncate px-2 max-w-[55vw]" style={{ color: th.textSecondary }}>
          {doc.shortTitle}
        </p>
        <div className="flex items-center gap-1 min-w-[80px] justify-end">
          <button onClick={() => setShowToc((v) => !v)} className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ color: showToc ? th.accent : th.textFaint }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button onClick={() => setBookmarked((v) => !v)} className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ color: bookmarked ? "#c4973a" : th.textFaint }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"}>
              <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={() => setShowSettings((v) => !v)} className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ color: th.textFaint }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
          </button>
        </div>
      </div>

      {/* TOC Drawer */}
      {showToc && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setShowToc(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-xs h-full flex flex-col overflow-y-auto shadow-2xl"
            style={{ backgroundColor: th.drawerBg, borderRight: `1px solid ${th.drawerBorder}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${th.drawerBorder}` }}>
              <p className="text-sm font-bold" style={{ color: th.textMuted }}>Sections</p>
              <button onClick={() => setShowToc(false)} className="text-lg" style={{ color: th.textMuted }}>✕</button>
            </div>
            <div className="p-3 space-y-0.5">
              {doc.sections.map((s, idx) => (
                <button key={s.id} onClick={() => { onJump(s.id); setShowToc(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors min-h-[40px]"
                  style={{ backgroundColor: s.id === section.id ? th.drawerItemActive : "transparent", color: s.id === section.id ? th.drawerItemActiveColor : th.drawerItemColor, fontWeight: s.id === section.id ? "bold" : "normal" }}>
                  {idx + 1}. {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative rounded-t-3xl px-5 pt-3 pb-8"
            style={{ backgroundColor: th.settingsBg, border: `1px solid ${th.settingsBorder}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: isLight ? "rgba(155,114,40,0.25)" : "rgba(255,255,255,0.2)" }} />
            <p className="text-xs font-black uppercase tracking-widest mb-4 px-1" style={{ color: th.textMuted }}>Display Settings</p>
            <div className="flex gap-2">
              {(["sm","md","lg","xl"] as FontSize[]).map((fs) => (
                <button key={fs} onClick={() => setFontSize(fs)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: fontSize === fs ? th.settingsBtnActive : th.settingsBtnInactive, border: fontSize === fs ? `1px solid ${th.settingsBtnActiveBorder}` : `1px solid ${th.settingsBtnInactiveBorder}`, color: fontSize === fs ? th.accentLight : th.textMuted }}>
                  {fs === "sm" ? "Small" : fs === "md" ? "Medium" : fs === "lg" ? "Large" : "X-Large"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading content */}
      <div ref={contentRef} style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto" }}>
        <main className="max-w-2xl mx-auto px-5 pt-8 pb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: th.accent }}>
            {section.label}
          </p>
          <h2 className="text-2xl font-black mb-8 leading-tight" style={{ color: th.textPrimary }}>
            {section.title}
          </h2>
          <div className={`space-y-1 ${FONT_SIZES[fontSize]}`}>
            {renderContent(section.content, th.textContent, highlights, (id, x, y) => setPendingRemove({ id, x, y }))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-4 mt-14 pt-8" style={{ borderTop: `1px solid ${th.dividerColor}` }}>
            <button disabled={!hasPrev} onClick={onPrev} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm min-h-[44px]"
              style={{ backgroundColor: hasPrev ? th.navBtnBg : "transparent", color: hasPrev ? th.navBtnColor : th.textMuted, border: `1px solid ${th.navBtnBorder}`, cursor: hasPrev ? "pointer" : "not-allowed" }}>
              ← Previous
            </button>
            {hasNext ? (
              <button onClick={onNext} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm min-h-[44px]"
                style={{ background: th.navNextGradient, color: "white" }}>
                Next →
              </button>
            ) : (
              <button onClick={onClose} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm min-h-[44px]"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "white" }}>
                Finish ✓
              </button>
            )}
          </div>
          <p className="text-center text-[10px] mt-8" style={{ color: th.footerText }}>
            All documents are public domain • Free to read, share, and distribute
          </p>
        </main>
      </div>

      {/* Fixed bottom bar */}
      <div className="flex-shrink-0"
        style={{ backgroundColor: th.bottomBarBg, borderTop: `1px solid ${th.bottomBarBorder}` }}>
        <div className="px-5 pt-3 pb-2">
          <style>{sliderCss}</style>
          <input type="range" min={0} max={Math.max(1, doc.sections.length - 1)} value={sectionIndex}
            onChange={(e) => { const idx = Number(e.target.value); if (doc.sections[idx]) onJump(doc.sections[idx].id); }}
            className="hist-slider w-full"
            style={{ background: `${th.sliderTrack}${progressPct}%,${th.sliderTrackBg} ${progressPct}%)` }}
          />
          <p className="text-center mt-2 text-[11px]" style={{ color: th.bottomIconColor }}>
            {sectionIndex + 1} / {doc.sections.length}
          </p>
        </div>
        <div className="flex items-center justify-around px-4 pb-1 pt-1" style={{ borderTop: `1px solid ${th.bottomBarDivider}` }}>
          {[
            { label: "Display", icon: <span style={{ fontFamily:"serif", fontWeight:"bold", fontSize:"13px" }}>Aa</span>, action: () => setShowSettings((v)=>!v) },
            { label: "Contents", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>, action: () => setShowToc((v)=>!v) },
            { label: "Text Size", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20L10 4l6 16M6 15h8M16 20l2-4 2 4M17.5 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>, action: () => setFontSize(prev => { const o:FontSize[]=["sm","md","lg","xl"]; return o[(o.indexOf(prev)+1)%o.length]; }) },
            { label: "More", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>, action: () => setShowSettings((v)=>!v) },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={action} className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl"
              style={{ color: th.bottomIconColor }}>
              {icon}
              <span style={{ fontSize: "9px", fontWeight: "bold" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {selection && <HighlightToolbar x={selection.x} y={selection.y} onHighlight={addHighlight} onDismiss={dismissSelection} />}
      {pendingRemove && <RemoveHighlightBubble x={pendingRemove.x} y={pendingRemove.y} onConfirm={() => { removeHighlight(pendingRemove.id); setPendingRemove(null); }} onDismiss={() => setPendingRemove(null)} />}
    </div>
  );
}

// ─── Document detail view ─────────────────────────────────────────────────────

function DocumentDetail({ doc, onClose, allDocs }: { doc: LearnDocument; onClose: () => void; allDocs: LearnDocument[] }) {
  const { theme } = useTheme();
  const isLight = theme === "light-elegant";

  const th = {
    pageBg:         isLight ? "#f5f1eb"                               : "#0e0e18",
    textPrimary:    isLight ? "#1c1409"                               : "rgba(255,255,255,0.95)",
    textSecondary:  isLight ? "#6b5226"                               : "rgba(255,255,255,0.85)",
    textMuted:      isLight ? "#9b8560"                               : "rgba(255,255,255,0.45)",
    textFaint:      isLight ? "#b09878"                               : "rgba(255,255,255,0.3)",
    accent:         isLight ? "#9b7228"                               : "#a78bfa",
    accentLight:    isLight ? "#c4973a"                               : "#c4b5fd",
    primary:        isLight ? "#9b7228"                               : "#7c3aed",
    topBarBg:       isLight ? "rgba(245,241,235,0.95)"                : "rgba(14,14,24,0.95)",
    topBarBorder:   isLight ? "rgba(155,114,40,0.18)"                 : "rgba(255,255,255,0.07)",
    tagBg:          isLight ? "rgba(155,114,40,0.12)"                 : "rgba(124,58,237,0.2)",
    tagBorder:      isLight ? "rgba(155,114,40,0.35)"                 : "rgba(124,58,237,0.35)",
    tagColor:       isLight ? "#9b7228"                               : "#c4b5fd",
    btnBorder:      isLight ? "rgba(155,114,40,0.22)"                 : "rgba(255,255,255,0.12)",
    progressTrack:  isLight ? "rgba(155,114,40,0.15)"                 : "rgba(255,255,255,0.08)",
    progressBar:    isLight ? "linear-gradient(90deg,#c4973a,#9b7228)": "linear-gradient(90deg,#ec4899,#a855f7)",
    readGradient:   isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": "linear-gradient(135deg,#ec4899,#a855f7)",
    divider:        isLight ? "rgba(155,114,40,0.12)"                 : "rgba(255,255,255,0.06)",
    sectionRowBg:   isLight ? "rgba(155,114,40,0.06)"                 : "rgba(255,255,255,0.03)",
    sectionRowBorder:isLight ? "rgba(155,114,40,0.18)"                : "rgba(255,255,255,0.07)",
    sectionDoneBg:  isLight ? "rgba(155,114,40,0.15)"                 : "rgba(124,58,237,0.3)",
    sectionDoneBorder:isLight? "rgba(155,114,40,0.45)"                : "rgba(124,58,237,0.5)",
    sectionDoneNum: isLight ? "#9b7228"                               : "#c4b5fd",
    sectionPendingBg:isLight ? "rgba(155,114,40,0.06)"                : "rgba(255,255,255,0.07)",
    sectionPendingBorder:isLight?"rgba(155,114,40,0.18)"              : "rgba(255,255,255,0.1)",
    sectionPendingNum:isLight ? "#9b8560"                             : "rgba(255,255,255,0.3)",
    sectionDoneTitle:isLight ? "#9b7228"                              : "#c4b5fd",
    sectionTitle:   isLight ? "#2a1e08"                               : "rgba(255,255,255,0.8)",
    sectionLabel:   isLight ? "#9b8560"                               : "rgba(255,255,255,0.3)",
    sectionArrow:   isLight ? "rgba(155,114,40,0.5)"                  : "rgba(255,255,255,0.25)",
    star:           isLight ? "#c4973a"                               : "#fbbf24",
    starText:       isLight ? "#6b5226"                               : "rgba(255,255,255,0.7)",
    starFaint:      isLight ? "#9b8560"                               : "rgba(255,255,255,0.3)",
  };

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reading, setReading] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => { setCompleted(loadProgress(doc.id)); }, [doc.id]);

  const toggleSection = useCallback((sectionId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      saveProgress(doc.id, next);
      return next;
    });
  }, [doc.id]);

  const progress = doc.sections.length > 0 ? Math.round((completed.size / doc.sections.length) * 100) : 0;
  const style = DOC_COVERS[doc.id] ?? DEFAULT_DOC_COVER;

  const sectionIndex = reading ? doc.sections.findIndex((s) => s.id === reading) : -1;
  const currentSection = sectionIndex >= 0 ? doc.sections[sectionIndex] : null;

  if (currentSection) {
    return (
      <SectionReader
        doc={doc} section={currentSection} completed={completed} onToggle={toggleSection}
        onClose={() => setReading(null)}
        onPrev={() => { if (sectionIndex > 0) setReading(doc.sections[sectionIndex - 1].id); }}
        onNext={() => { if (sectionIndex < doc.sections.length - 1) setReading(doc.sections[sectionIndex + 1].id); }}
        hasPrev={sectionIndex > 0} hasNext={sectionIndex < doc.sections.length - 1}
        onJump={(id) => setReading(id)}
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
        <div className="flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60" style={{ width: "110px", height: "148px", border: `1px solid ${style.border}50` }}>
          <DocCover doc={doc} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className="text-base font-black leading-tight mb-1" style={{ color: th.textPrimary }}>{doc.title}</h1>
          <p className="text-sm font-semibold mb-1" style={{ color: th.accent }}>{doc.origin}</p>
          <div className="flex items-center gap-1 mb-2">
            <span style={{ color: th.star }}>★</span>
            <span className="text-xs font-bold" style={{ color: th.starText }}>4.8</span>
            <span className="text-xs" style={{ color: th.starFaint }}>(Historic)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: th.tagBg, border: `1px solid ${th.tagBorder}`, color: th.tagColor }}>
              {typeLabel}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: th.tagBg, border: `1px solid ${th.tagBorder}`, color: th.tagColor }}>
              Doctrinal
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#34d399", fontSize: "12px" }}>✓</span>
            <span style={{ color: "#34d399", fontSize: "11px", fontWeight: "bold" }}>Free</span>
            <span style={{ color: "rgba(52,211,153,0.6)", fontSize: "11px" }}>100% free to read</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 flex flex-col gap-2.5 mb-5">
        <button onClick={() => setReading(doc.sections[0]?.id ?? null)} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
          style={{ background: th.readGradient }}>
          Read Now
        </button>
        <button onClick={() => setBookmarked((v) => !v)} className="w-full py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          style={{ border: `1px solid ${th.btnBorder}`, color: th.textSecondary }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} style={{ color: bookmarked ? "#c4973a" : "currentColor" }}>
            <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          {bookmarked ? "Bookmarked" : "Add to Library"}
        </button>
      </div>

      {/* About */}
      <div className="px-4 mb-4">
        <p className="text-sm font-bold mb-2" style={{ color: th.textPrimary }}>About this document</p>
        <p className="text-xs leading-relaxed" style={{ color: th.textMuted }}>
          {descExpanded ? doc.description : doc.description.slice(0, 160)}
          {!descExpanded && doc.description.length > 160 && (
            <button onClick={() => setDescExpanded(true)} className="font-bold ml-1" style={{ color: th.accent }}>More</button>
          )}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 px-4 mb-5">
        {[
          { icon: "📄", label: `${doc.sections.length} Sections` },
          { icon: "🌐", label: "English" },
          { icon: "📅", label: `Published ${doc.year}` },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-1.5">
            <span className="text-sm">{m.icon}</span>
            <span className="text-xs" style={{ color: th.textMuted }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="px-4 mb-5">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: th.textFaint }}>
            <span>{completed.size} of {doc.sections.length} sections read</span>
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
        <p className="text-sm font-bold mb-3" style={{ color: th.textPrimary }}>Sections</p>
        <div className="space-y-2">
          {doc.sections.map((section, idx) => {
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
                  <p className="text-xs font-bold truncate" style={{ color: done ? th.sectionDoneTitle : th.sectionTitle }}>{section.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: th.sectionLabel }}>{section.label}</p>
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
          <p className="text-sm font-bold mb-3" style={{ color: th.textPrimary }}>You may also like</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {related.map((d) => {
              const ds = DOC_COVERS[d.id] ?? DEFAULT_DOC_COVER;
              return (
                <button key={d.id} onClick={() => onClose()} className="flex-shrink-0 w-24 text-left active:scale-95 transition-transform">
                  <div className="w-24 h-32 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40" style={{ border: `1px solid ${ds.border}40` }}>
                    <DocCover doc={d} />
                  </div>
                  <p className="text-[10px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{d.shortTitle}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: th.textMuted }}>{d.year}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function LearnPageInner() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const isLight = theme === "light-elegant";

  const th = {
    pageBg:            isLight ? "#f5f1eb"                              : "#0e0e18",
    textPrimary:       isLight ? "#1c1409"                              : "rgba(255,255,255,0.95)",
    textSecondary:     isLight ? "#6b5226"                              : "rgba(255,255,255,0.38)",
    textMuted:         isLight ? "#9b8560"                              : "rgba(255,255,255,0.45)",
    textFaint:         isLight ? "#b09878"                              : "rgba(255,255,255,0.25)",
    textVeryFaint:     isLight ? "#c4b090"                              : "rgba(255,255,255,0.22)",
    accent:            isLight ? "#9b7228"                              : "#a78bfa",
    accentLight:       isLight ? "#c4973a"                              : "#c4b5fd",
    primary:           isLight ? "#9b7228"                              : "#7c3aed",
    heroBg:            isLight ? "linear-gradient(135deg,rgba(196,151,58,0.28) 0%,rgba(237,228,205,0.96) 55%,rgba(215,196,148,0.22) 100%)"
                               : "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)",
    heroAccentText:    isLight ? "#9b7228"                              : "#c084fc",
    heroSubtext:       isLight ? "rgba(107,82,38,0.85)"                 : "rgba(255,255,255,0.4)",
    searchBg:          isLight ? "rgba(155,114,40,0.08)"                : "rgba(255,255,255,0.06)",
    searchBorder:      isLight ? "rgba(155,114,40,0.22)"                : "rgba(255,255,255,0.08)",
    catActiveBg:       isLight ? "rgba(155,114,40,0.15)"                : "rgba(124,58,237,0.25)",
    catActiveBorder:   isLight ? "rgba(155,114,40,0.5)"                 : "rgba(167,139,250,0.5)",
    catInactiveBg:     isLight ? "rgba(155,114,40,0.04)"                : "rgba(255,255,255,0.04)",
    catInactiveBorder: isLight ? "rgba(155,114,40,0.14)"                : "rgba(255,255,255,0.08)",
    cardBg:            isLight ? "rgba(155,114,40,0.06)"                : "rgba(255,255,255,0.03)",
    cardBorder:        isLight ? "rgba(155,114,40,0.20)"                : "rgba(255,255,255,0.07)",
    progressTrack:     isLight ? "rgba(155,114,40,0.15)"                : "rgba(255,255,255,0.08)",
    progressBar:       isLight ? "linear-gradient(90deg,#c4973a,#9b7228)": "linear-gradient(90deg,#ec4899,#a855f7)",
    tabStripBorder:    isLight ? "rgba(155,114,40,0.18)"                : "rgba(255,255,255,0.07)",
    tabActiveBorder:   isLight ? "#9b7228"                              : "#7c3aed",
    tabInactiveColor:  isLight ? "#9b8560"                              : "rgba(255,255,255,0.3)",
    timelineLine:      isLight ? "linear-gradient(90deg,transparent,rgba(155,114,40,0.4),transparent)"
                               : "linear-gradient(90deg,transparent,rgba(167,139,250,0.4),transparent)",
    timelineDotEven:   isLight ? "linear-gradient(135deg,#c4973a,#9b7228)": "linear-gradient(135deg,#ec4899,#a855f7)",
    timelineDotOdd:    isLight ? "linear-gradient(135deg,#9b7228,#6b4a10)": "linear-gradient(135deg,#a855f7,#7c3aed)",
    timelineDotShadow: isLight ? "none"                                 : "0 0 8px rgba(168,85,247,0.5)",
    timelineYear:      isLight ? "#9b7228"                              : "#a78bfa",
    timelineLabel:     isLight ? "#9b8560"                              : "rgba(255,255,255,0.45)",
    startReading:      isLight ? "#9b7228"                              : "rgba(167,139,250,0.65)",
    star:              isLight ? "#c4973a"                              : "#fbbf24",
    footerText:        isLight ? "rgba(155,114,40,0.5)"                 : "rgba(255,255,255,0.15)",
    iconMuted:         isLight ? "#9b8560"                              : "rgba(255,255,255,0.3)",
  };

  const [selected, setSelected] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("all");
  const [activeTab, setActiveTab] = useState<DocTab>("all");
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

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
          Historical <span style={{ color: th.accent }}>Documents</span>
        </h1>
      </div>

      {/* Hero banner */}
      <div className="mx-4 mb-6 rounded-2xl overflow-hidden relative" style={{ background: th.heroBg, minHeight: "130px" }}>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-7xl opacity-20 pointer-events-none select-none">📜</div>
        {!isLight && (
          <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle,#c084fc 0%,transparent 70%)" }} />
        )}
        <div className="relative px-5 py-5">
          <h2 className="text-xl font-black leading-tight mb-1">
            <span style={{ color: th.heroAccentText }}>Timeless Truths.</span>
            <br /><span className="text-white">Lasting Impact.</span>
          </h2>
          <p className="text-xs mb-4" style={{ color: th.heroSubtext }}>
            Explore the confessions, debates, and declarations that shaped history in Christianity.
          </p>
        </div>
      </div>

      {/* Timeline Highlights */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Timeline Highlights</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
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
                    background: hasDoc ? (i % 2 === 0 ? th.timelineDotEven : th.timelineDotOdd) : (isLight ? "rgba(155,114,40,0.25)" : "rgba(255,255,255,0.12)"),
                    boxShadow: hasDoc ? th.timelineDotShadow : "none",
                  }}>
                  <div className="w-2 h-2 rounded-full opacity-80" style={{ backgroundColor: hasDoc ? "white" : (isLight ? "rgba(155,114,40,0.6)" : "rgba(255,255,255,0.4)") }} />
                </div>
              );
              const label = (
                <div className="text-center">
                  <p className="text-xs font-black" style={{ color: hasDoc ? th.timelineYear : (isLight ? "#b09878" : "rgba(255,255,255,0.3)") }}>{item.year}</p>
                  <p className="text-[9px] leading-tight text-center" style={{ color: hasDoc ? th.timelineLabel : (isLight ? "#c4b090" : "rgba(255,255,255,0.22)"), maxWidth: "80px" }}>{item.label}</p>
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
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Browse by Type</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
        </div>
        <div className="flex gap-2.5 px-4 overflow-x-auto pb-1 scrollbar-none">
          {DOC_TYPES.map(({ key, label, icon }) => {
            const active = activeType === key;
            return (
              <button key={key} onClick={() => { setActiveType(key); setActiveTab("all"); }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ border: active ? `1px solid ${th.catActiveBorder}` : `1px solid ${th.catInactiveBorder}`, backgroundColor: active ? th.catActiveBg : th.catInactiveBg, color: active ? th.accentLight : th.textMuted }}>
                <span className="text-lg leading-none">{icon}</span>
                <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Documents */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>Featured Documents</p>
          <button className="text-xs font-semibold" style={{ color: th.accent }}>View all</button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none">
          {filteredDocs.slice(0, 8).map((doc) => {
            const ds = DOC_COVERS[doc.id] ?? DEFAULT_DOC_COVER;
            return (
              <button key={doc.id} onClick={() => setSelected(doc.id)} className="flex-shrink-0 w-28 text-left active:scale-95 transition-transform">
                <div className="w-28 h-40 rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/40" style={{ border: `1px solid ${ds.border}50` }}>
                  <DocCover doc={doc} />
                </div>
                <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{doc.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>{doc.origin}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span style={{ color: th.star, fontSize: "10px" }}>★</span>
                  <span style={{ color: th.textSecondary, fontSize: "10px" }}>{doc.year}</span>
                </div>
              </button>
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
            <p className="text-4xl mb-3">📜</p>
            <p className="text-sm font-bold mb-1" style={{ color: th.textMuted }}>No documents found</p>
            <p className="text-xs" style={{ color: th.textFaint }}>Try selecting a different type or tab</p>
          </div>
        )}

        {/* Document rows */}
        <div className="space-y-3">
          {listDocs.map((doc) => {
            const pct = progressMap[doc.id] ?? 0;
            const isDone = pct === 100;
            const ds = DOC_COVERS[doc.id] ?? DEFAULT_DOC_COVER;
            return (
              <button key={doc.id} onClick={() => setSelected(doc.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.99]"
                style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
                <div className="flex-shrink-0 w-14 h-[72px] rounded-xl overflow-hidden shadow-lg shadow-black/40" style={{ border: `1px solid ${ds.border}40` }}>
                  <DocCover doc={doc} size="small" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: th.textPrimary }}>{doc.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: th.textSecondary }}>{doc.origin} · {doc.year}</p>
                  {isDone ? (
                    <p className="text-xs font-bold mt-1.5" style={{ color: "#34d399" }}>Completed</p>
                  ) : pct > 0 ? (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: th.progressTrack }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: th.progressBar }} />
                      </div>
                      <span style={{ color: th.textSecondary, fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>{pct}%</span>
                    </div>
                  ) : (
                    <p style={{ color: th.startReading, fontSize: "11px", marginTop: "5px", fontWeight: "600" }}>Start reading →</p>
                  )}
                </div>
                {isDone ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ border: "2px solid #34d399" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full" style={{ color: th.textVeryFaint }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] mt-10" style={{ color: th.footerText }}>
          All documents are public domain · Progress saved locally in your browser
        </p>
      </div>
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
