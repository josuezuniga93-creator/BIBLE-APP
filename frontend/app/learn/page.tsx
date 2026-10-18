"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { usePagination } from "../hooks/usePagination";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { LEARN_DOCUMENTS, FULL_DOCUMENT_SECTIONS, LearnDocument, LearnSection } from "../lib/learnData";
import { getReaderHighlights } from "../lib/unifiedHighlights";
import { useTheme } from "../lib/useTheme";
import { GeneratedDocumentCover } from "../components/GeneratedArtwork";
import { getDocumentCoverImage } from "../lib/documentCoverImages";
import { useLanguage } from "../lib/useLanguage";
import { translateToSpanish } from "../lib/googleTranslate";
import { t } from "../lib/i18n";
import { documentSectionTitle, documentTitle } from "../lib/spanishContent";
import { AppReader } from "../components/AppReader";
import StudyScreen from "../components/study/StudyScreen";
import { UiIcon } from "../components/UiIcon";
import { isFavorite, setFavorite, toggleFavorite } from "../lib/favorites";

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

// ─── Tab keys ─────────────────────────────────────────────────────────────────
type DocTab = "all" | "favorites";

type HighlightTarget = {
  docId: string;
  sectionId: string;
  highlightId: string;
};

// ─── Section Reader ───────────────────────────────────────────────────────────

type FontSize = "sm" | "md" | "lg" | "xl";
const FONT_SIZES: Record<FontSize, string> = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" };

function SectionReader({
  doc, sections, section, completed, onToggle, onClose, onPrev, onNext, hasPrev, hasNext, modeLabel, readerMode,
  targetHighlightId,
}: {
  doc: LearnDocument; sections: LearnSection[]; section: LearnSection; completed: Set<string>;
  onToggle: (id: string) => void; onClose: () => void;
  onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
  modeLabel: string;
  readerMode: ReaderMode;
  targetHighlightId?: string;
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

  // ── In-section pagination ─────────────────────────────────────────────────
  const pageStorageKey = `axiom-page-learn-${doc.id}-${section.id}`;
  const {
    pages: sectionPages,
    currentPage,
    totalPages,
    goNextPage,
    goPrevPage,
    goToPage,
    isFirstPage,
    isLastPage,
  } = usePagination({
    content: lang === "es" && translatedSection ? translatedSection : section.content,
    fontSize,
    storageKey: pageStorageKey,
    rawText: section.id.startsWith("md-luther-") || section.id.startsWith("md-edwards-"),
  });

  useEffect(() => {
    if (!targetHighlightId || sectionPages.length === 0) return;
    const target = getReaderHighlights(`learn-${doc.id}-${section.id}`).find((highlight) => highlight.id === targetHighlightId);
    if (!target) return;
    const snippet = target.text.slice(0, 30);
    const pageIdx = sectionPages.findIndex((page) => page.includes(snippet));
    if (pageIdx >= 0 && pageIdx + 1 !== currentPage) {
      goToPage(pageIdx + 1);
    }
  }, [targetHighlightId, sectionPages, currentPage, goToPage, doc.id, section.id]);

  const sectionIndex = sections.findIndex((s) => s.id === section.id);
  const progressPct = sections.length > 0 && sectionIndex >= 0
    ? Math.round(((sectionIndex + (totalPages > 0 ? currentPage / totalPages : 1)) / sections.length) * 100)
    : 0;

  // Intentionally fires once per section visit (on section.id change only) — including
  // completed/onToggle would re-run on every parent re-render since onToggle isn't memoized upstream.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const translatedText = sectionPages[currentPage - 1] ?? "";
  const sectionTitleText = documentSectionTitle(doc.id, section.title, lang);
  const sectionLabelText = documentSectionTitle(doc.id, section.label, lang);
  const modeText = lang === "es" ? (modeLabel === "Full document" ? "Documento completo" : "Resumen") : modeLabel;
  const translationStatus = lang === "es" && (translating || translatedSection) ? (
    <div
      className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs"
      style={{
        backgroundColor: isLight ? "rgba(0,0,0,0.04)" : "rgba(201,169,97,0.08)",
        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.18)",
        color: th.textMuted,
      }}
    >
      {translating ? (
        <>
          <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
          <span>Traduciendo al español... {translateProgress}%</span>
        </>
      ) : (
        <span>Traducido al español automáticamente</span>
      )}
    </div>
  ) : null;

  return (
    <AppReader
      title={`${documentTitle(doc, lang)} · ${sectionTitleText}`}
      eyebrow={lang === "es" ? "Documento histórico" : "Historical Document"}
      sectionLabel={`${modeText} · ${sectionLabelText}`}
      sectionTitle={sectionTitleText}
      showSectionTitle={isFirstPage}
      text={translatedText}
      context={`learn-${doc.id}-${section.id}`}
      reference={`${documentTitle(doc, lang)} · ${sectionLabelText}${totalPages > 1 ? ` · ${lang === "es" ? "Página" : "Page"} ${currentPage}` : ""}`}
      fontSizeClass={FONT_SIZES[fontSize]}
      targetHighlightId={targetHighlightId}
      currentPage={currentPage}
      totalPages={totalPages}
      progressPercent={progressPct}
      translationStatus={translationStatus}
      previousDisabled={isFirstPage && !hasPrev}
      nextDisabled={isLastPage && !hasNext}
      finishLabel={isLastPage && !hasNext ? (lang === "es" ? "Terminar" : "Finish") : undefined}
      onPrevious={() => { if (!goPrevPage()) onPrev(); }}
      onNext={() => {
        if (isLastPage && !hasNext) onClose();
        else if (!goNextPage()) onNext();
      }}
      onClose={onClose}
    />
  );
}

// ─── Document detail view ─────────────────────────────────────────────────────

function DocumentDetail({
  doc,
  onClose,
  allDocs,
  highlightTarget,
}: {
  doc: LearnDocument;
  onClose: () => void;
  allDocs: LearnDocument[];
  highlightTarget?: HighlightTarget | null;
}) {
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
  const [favorited, setFavorited] = useState(() => isFavorite("learn", doc.id));
  const [savedReaderProgress, setSavedReaderProgress] = useState<ReaderProgress | null>(null);
  const [readerTargetHighlightId, setReaderTargetHighlightId] = useState<string | null>(null);

  useEffect(() => { setCompleted(loadProgress(doc.id)); }, [doc.id]);
  useEffect(() => {
    setReading(null);
    setReaderMode(hasFullDocument ? "full" : "overview");
    setDescExpanded(false);
    setTranslatedDescription(null);
    setFavorited(isFavorite("learn", doc.id));
    setSavedReaderProgress(loadReaderProgress(doc.id, hasFullDocument ? "full" : "overview"));
  }, [doc.id, hasFullDocument]);

  useEffect(() => {
    setSavedReaderProgress(loadReaderProgress(doc.id, readerMode));
  }, [doc.id, readerMode, reading]);

  useEffect(() => {
    if (!highlightTarget || highlightTarget.docId !== doc.id) return;
    const targetMode: ReaderMode = fullDocumentSections?.some((section) => section.id === highlightTarget.sectionId)
      ? "full"
      : "overview";
    setReaderMode(targetMode);
    setReaderTargetHighlightId(highlightTarget.highlightId);
    setReading(highlightTarget.sectionId);
  }, [doc.id, fullDocumentSections, highlightTarget]);

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
  }, [doc.id, doc.description, lang]);

  const toggleSection = useCallback((sectionId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      saveProgress(doc.id, next);
      return next;
    });
  }, [doc.id]);

  const toggleDocFavorite = useCallback(() => {
    setFavorited(toggleFavorite("learn", doc.id));
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
        onClose={() => { setReading(null); setReaderTargetHighlightId(null); }}
        onPrev={() => {
          if (sectionIndex > 0) {
            setReaderTargetHighlightId(null);
            setReading(readerSections[sectionIndex - 1].id);
          }
        }}
        onNext={() => {
          if (sectionIndex < readerSections.length - 1) {
            setReaderTargetHighlightId(null);
            setReading(readerSections[sectionIndex + 1].id);
          }
        }}
        hasPrev={sectionIndex > 0} hasNext={sectionIndex < readerSections.length - 1}
        modeLabel={readerModeLabel}
        readerMode={readerMode}
        targetHighlightId={readerTargetHighlightId ?? undefined}
      />
    );
  }

  const related = allDocs.filter((d) => d.id !== doc.id && (d.category === doc.category || d.year === doc.year)).slice(0, 5);
  return <StudyScreen screen="detail" params={{kind:"doc",id:doc.id}} onBack={onClose} onRead={(number: number)=>setReading(readerSections[Math.max(0,Math.min(number-1,readerSections.length-1))].id)} />;
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
  const [highlightTarget, setHighlightTarget] = useState<HighlightTarget | null>(null);
  const [activeType, setActiveType] = useState("all");
  const [activeTab, setActiveTab] = useState<DocTab>("all");
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [favoriteDocs, setFavoriteDocs] = useState<Set<string>>(new Set());
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [docSearch, setDocSearch] = useState("");
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselTouchX, setCarouselTouchX] = useState(0);
  const carouselSwipedRef = useRef(false);

  function refreshFavorites() {
    setFavoriteDocs(new Set(LEARN_DOCUMENTS.filter((d) => isFavorite("learn", d.id)).map((d) => d.id)));
  }

  function toggleDocFavorite(docId: string) {
    const next = !favoriteDocs.has(docId);
    setFavorite("learn", docId, next);
    setFavoriteDocs((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(docId); else updated.delete(docId);
      return updated;
    });
  }

  useEffect(() => { refreshFavorites(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep-link: /learn?doc=ID opens that document directly.
  // /learn?doc=ID&section=SECTION_ID&hlid=HIGHLIGHT_ID opens the exact highlight.
  useEffect(() => {
    const docId = searchParams.get("doc");
    if (docId && LEARN_DOCUMENTS.some((d) => d.id === docId)) {
      const sectionId = searchParams.get("section");
      const highlightId = searchParams.get("hlid");
      if (sectionId && highlightId) {
        setHighlightTarget({ docId, sectionId, highlightId });
      }
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
    setHighlightTarget(null);
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
  if (selectedDoc) return <DocumentDetail doc={selectedDoc} onClose={handleClose} allDocs={LEARN_DOCUMENTS} highlightTarget={highlightTarget} />;

  const available = LEARN_DOCUMENTS;

  const searchText = docSearch.trim().toLowerCase();
  const filteredDocs = available.filter((doc) =>
    !searchText ||
    documentTitle(doc, lang).toLowerCase().includes(searchText) ||
    doc.title.toLowerCase().includes(searchText) ||
    doc.origin.toLowerCase().includes(searchText) ||
    String(doc.year).includes(searchText)
  );

  const listDocs = filteredDocs.filter((doc) => {
    if (activeType === "reading") return (progressMap[doc.id] ?? 0) > 0 && (progressMap[doc.id] ?? 0) < 100;
    if (activeTab === "favorites") return favoriteDocs.has(doc.id);
    return true;
  });

  return <StudyScreen screen="documents" />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnPageInner />
    </Suspense>
  );
}
