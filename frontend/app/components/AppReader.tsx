"use client";

import { type CSSProperties, type ReactNode, type Ref, type UIEventHandler, useEffect, useRef } from "react";
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
    pageBg: "#0b101d",
    textPrimary: "rgba(255,255,255,0.95)",
    textContent: "rgba(255,255,255,0.82)",
    textMuted: "rgba(255,255,255,0.62)",
    textFaint: "rgba(255,255,255,0.36)",
    accent: "#c9a961",
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

  useEffect(() => {
    document.documentElement.setAttribute("data-app-reader-open", "true");
    return () => {
      document.documentElement.removeAttribute("data-app-reader-open");
    };
  }, []);

  return (
    <div className={`fixed inset-0 ${zIndexClassName} app-reader-shell motion-app-reader-enter flex flex-col`} style={{ backgroundColor: tone.pageBg, color: tone.textPrimary }}>
      <div
        className="motion-top-sheet-enter flex-shrink-0 flex items-center justify-between gap-3 px-5 pb-3"
        style={{ backgroundColor: tone.pageBg, borderBottom: `1px solid ${tone.border}` }}
      >
        <div className="min-w-0" style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}>
          <h1 className="text-lg leading-tight font-black line-clamp-2" style={{ color: tone.textPrimary }}>
            {title}
          </h1>
          {eyebrow && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] font-black" style={{ color: tone.accent }}>
              {eyebrow}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="motion-pressable w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ color: tone.textMuted, background: resolvedTheme === "white-noir" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)", border: `1px solid ${tone.border}` }}
          aria-label={lang === "es" ? "Volver" : "Back"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div ref={contentRef} className={contentClassName} style={contentStyle} onScroll={contentOnScroll}>
        {children}
      </div>

      {showBottomControls && (
        <div
          className="motion-sheet-enter flex-shrink-0 px-5 py-3"
          style={{ backgroundColor: tone.pageBg, borderTop: `1px solid ${tone.border}`, paddingBottom: "max(env(safe-area-inset-bottom), 14px)" }}
        >
          <div className="flex items-center justify-between text-[11px] font-bold mb-2" style={{ color: tone.textMuted }}>
            <span>{lang === "es" ? "Página" : "Page"} {currentPage} {lang === "es" ? "de" : "of"} {totalPages}</span>
            <span>{safeProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: tone.progressTrack }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${safeProgress}%`, background: tone.progressBar }} />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <button
              disabled={previousDisabled}
              onClick={onPrevious}
              className="motion-pressable h-11 rounded-2xl text-sm font-black disabled:opacity-30"
              style={{ background: previousDisabled ? "transparent" : tone.prevBg, border: `1px solid ${tone.prevBorder}`, color: previousDisabled ? tone.textFaint : tone.prevText }}
            >
              ← {lang === "es" ? "Anterior" : "Prev"}
            </button>
            <button
              disabled={nextDisabled && !finishLabel}
              onClick={onNext}
              className="motion-pressable h-11 rounded-2xl text-sm font-black disabled:opacity-30"
              style={{ background: nextDisabled && !finishLabel ? "transparent" : tone.nextBg, color: nextDisabled && !finishLabel ? tone.textFaint : tone.nextText }}
            >
              {finishLabel ?? (lang === "es" ? "Siguiente" : "Next")} {!finishLabel ? "→" : ""}
            </button>
          </div>
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
        <main className="max-w-lg mx-auto px-7 pt-5 pb-8">
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
