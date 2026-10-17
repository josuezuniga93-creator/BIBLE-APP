"use client";

import { type CSSProperties, type ReactNode, type Ref, type UIEventHandler, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Type } from "lucide-react";
import { useLanguage } from "../lib/useLanguage";
import { useTheme, type Theme } from "../lib/useTheme";
import { BracketHighlightReader, type ReaderHighlightAdapter } from "./BracketHighlightReader";

type AppReaderTone = {
  pageBg: string;
  textPrimary: string;
  textContent: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  border: string;
  progressTrack: string;
  progressBar: string;
  prevBg: string;
  prevBorder: string;
  prevText: string;
  nextBg: string;
  nextText: string;
};

type AppReaderShellProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  pagePercent?: number;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  finishLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  contentRef?: Ref<HTMLDivElement>;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  contentOnScroll?: UIEventHandler<HTMLDivElement>;
  zIndexClassName?: string;
  showBottomControls?: boolean;
};

export type AppReaderProps = {
  title: string;
  eyebrow?: string;
  sectionLabel?: string;
  sectionTitle?: string;
  showSectionTitle?: boolean;
  text: string;
  context: string;
  reference: string;
  fontSizeClass: string;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  pagePercent?: number;
  targetHighlightId?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  translationStatus?: ReactNode;
  footer?: ReactNode;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  finishLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onPageOpen?: () => void;
  highlightAdapter?: ReaderHighlightAdapter;
};

function activeTheme(fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  const value = document.documentElement.getAttribute("data-theme") as Theme | null;
  return value ?? fallback;
}

function getTone(theme: Theme): AppReaderTone {
  const isLight = theme === "white-noir";

  if (isLight) {
    return {
      pageBg: "#ffffff",
      textPrimary: "#0a0a0a",
      textContent: "rgba(10,10,10,0.82)",
      textMuted: "rgba(10,10,10,0.50)",
      textFaint: "rgba(10,10,10,0.30)",
      accent: "#0a0a0a",
      border: "rgba(0,0,0,0.09)",
      progressTrack: "rgba(0,0,0,0.08)",
      progressBar: "linear-gradient(90deg,#333333,#0a0a0a)",
      prevBg: "rgba(0,0,0,0.05)",
      prevBorder: "rgba(0,0,0,0.10)",
      prevText: "rgba(10,10,10,0.62)",
      nextBg: "#0a0a0a",
      nextText: "#ffffff",
    };
  }

  return {
    pageBg: "var(--page)",
    textPrimary: "rgba(255,255,255,0.95)",
    textContent: "var(--ink)",
    textMuted: "rgba(255,255,255,0.62)",
    textFaint: "rgba(255,255,255,0.36)",
    accent: "var(--secondary)",
    border: "rgba(255,255,255,0.08)",
    progressTrack: "rgba(255,255,255,0.08)",
    progressBar: "linear-gradient(90deg,#c9a961,#d4b878)",
    prevBg: "rgba(255,255,255,0.07)",
    prevBorder: "rgba(255,255,255,0.10)",
    prevText: "rgba(255,255,255,0.72)",
    nextBg: "#c9a961",
    nextText: "#10131d",
  };
}

function readingPercent(currentPage: number, totalPages: number) {
  if (totalPages <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((currentPage / totalPages) * 100)));
}

export function AppReaderShell({
  title,
  eyebrow,
  children,
  currentPage,
  totalPages,
  progressPercent,
  pagePercent,
  previousDisabled = false,
  nextDisabled = false,
  finishLabel,
  onPrevious,
  onNext,
  onClose,
  contentRef,
  contentClassName = "flex-1 min-h-0 overflow-y-auto",
  contentStyle,
  contentOnScroll,
  zIndexClassName = "z-[220]",
  showBottomControls = true,
}: AppReaderShellProps) {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const resolvedTheme = activeTheme(theme);
  const tone = getTone(resolvedTheme);
  const displayPercent = pagePercent ?? readingPercent(currentPage, totalPages);
  const safeProgress = Math.max(0, Math.min(100, progressPercent));
  const hasMultiplePages = totalPages > 1;
  const [readerSize, setReaderSize] = useState(20);

  useEffect(() => {
    document.documentElement.setAttribute("data-app-book-reader-open", "true");
    return () => {
      document.documentElement.removeAttribute("data-app-book-reader-open");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={`study-design fixed inset-0 ${zIndexClassName} app-reader-shell study-book-reader motion-app-reader-enter flex flex-col`}
      style={{ backgroundColor: "var(--page)", color: "var(--ink)", "--reader-size": `${readerSize}px` } as CSSProperties}
      role="region"
      aria-label={title}
    >
      <header className="reader-topbar">
        <button className="icon-button" onClick={onClose} aria-label={lang === "es" ? "Volver" : "Back to book"}><ArrowLeft size={20}/></button>
        <span className="reading-title">{title}</span>
        <button className="icon-button" aria-label="Reader font size" onClick={()=>setReaderSize(readerSize>=26?18:readerSize+2)}><Type size={20}/></button>
        <button className="icon-button" aria-label="Table of contents" onClick={onClose}><List size={20}/></button>
      </header>

      <div ref={contentRef} className={contentClassName} style={contentStyle} onScroll={contentOnScroll}>
        {children}
      </div>

      {showBottomControls && (
        <div className="chapter-controls study-book-controls">
          <button className="icon-button" disabled={previousDisabled} onClick={onPrevious} aria-label="Previous section"><ChevronLeft size={20}/></button>
          <span>{currentPage} <small>/ {totalPages}</small></span>
          <button className="icon-button" disabled={nextDisabled && !finishLabel} onClick={onNext} aria-label={finishLabel || "Next section"}><ChevronRight size={20}/></button>
          {hasMultiplePages && (
            <p className="sr-only">
              {lang === "es" ? "Progreso de página" : "Page progress"}: {displayPercent}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AppReader({
  title,
  eyebrow,
  sectionLabel,
  sectionTitle,
  showSectionTitle = false,
  text,
  context,
  reference,
  fontSizeClass,
  currentPage,
  totalPages,
  progressPercent,
  pagePercent,
  targetHighlightId,
  isLoading = false,
  loadingLabel,
  translationStatus,
  footer,
  previousDisabled = false,
  nextDisabled = false,
  finishLabel,
  onPrevious,
  onNext,
  onClose,
  onPageOpen,
  highlightAdapter,
}: AppReaderProps) {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const tone = getTone(activeTheme(theme));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    onPageOpen?.();
  }, [currentPage, context, onPageOpen]);

  const hasMultiplePages = totalPages > 1;

  return (
    <AppReaderShell
      title={title}
      eyebrow={eyebrow}
      currentPage={currentPage}
      totalPages={totalPages}
      pagePercent={pagePercent}
      progressPercent={progressPercent}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
      finishLabel={finishLabel}
      onPrevious={onPrevious}
      onNext={onNext}
      onClose={onClose}
      contentRef={scrollRef}
    >
        <main className="study-book-content prose book-prose max-w-lg mx-auto px-7 pt-5 pb-8">
          {sectionLabel && (
            <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: tone.accent }}>
              {sectionLabel}
              {hasMultiplePages && (
                <span style={{ color: tone.textFaint, fontWeight: "normal", letterSpacing: "0.05em" }}>
                  {" "}· p. {currentPage}/{totalPages}
                </span>
              )}
            </p>
          )}
          {showSectionTitle && sectionTitle && (
            <h2 className="text-2xl font-black mb-8 leading-tight" style={{ color: tone.textPrimary }}>
              {sectionTitle}
            </h2>
          )}
          {translationStatus}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: tone.border, borderTopColor: tone.accent }}
                aria-label={loadingLabel ?? (lang === "es" ? "Cargando" : "Loading")}
              />
            </div>
          ) : (
            <div key={`${context}-${currentPage}`} className="motion-page-enter">
              <BracketHighlightReader
                context={context}
                text={text}
                title={sectionTitle ?? title}
                reference={reference}
                textColor={tone.textContent}
                fontSizeClass={fontSizeClass}
                scrollRef={scrollRef}
                targetHighlightId={targetHighlightId}
                highlightAdapter={highlightAdapter}
              />
            </div>
          )}
          {footer}
        </main>
    </AppReaderShell>
  );
}
