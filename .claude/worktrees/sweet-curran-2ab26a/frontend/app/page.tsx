"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Analysis, InputTab, Lang, HistoryEntry } from "./lib/types";
import { TRANSLATIONS } from "./lib/translations";
import {
  CLAIM_STYLES,
  OVERALL_STYLES,
  MIN_CHARS,
  EXAMPLE_TEXT,
  isValidYouTubeUrl,
} from "./lib/constants";
import { analyzeSermonStream } from "./lib/api";
import { useHistory } from "./hooks/useHistory";
import { DemoBanner } from "./components/DemoBanner";
import { ClaimCard } from "./components/ClaimCard";
import { HistoryDrawer } from "./components/HistoryDrawer";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState<InputTab>("text");
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [isTranscriptPhase, setIsTranscriptPhase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const [maxClaims, setMaxClaims] = useState<3 | 5 | 7>(5);
  const [selectedTranslation, setSelectedTranslation] = useState<"kjv" | "esv" | "geneva">("kjv");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [preacherName, setPreacherName] = useState("");
  const [preacherSaved, setPreacherSaved] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSharedResult, setIsSharedResult] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { history, saveHistory } = useHistory();
  const t = TRANSLATIONS[lang];

  const charCount = text.trim().length;
  const textReady = activeTab === "text" && charCount >= MIN_CHARS;
  const youtubeReady =
    activeTab === "youtube" && isValidYouTubeUrl(youtubeUrl.trim());
  const isReady = (textReady || youtubeReady) && !loading;

  const toggleLang = () => setLang((l) => (l === "en" ? "es" : "en"));

  // ── Analyze ──────────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(() => {
    if (!isReady) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setIsDemoResult(false);
    setIsSharedResult(false);
    setPreacherName("");
    setPreacherSaved(false);
    setCurrentEntryId(null);

    let body: Parameters<typeof analyzeSermonStream>[0];

    if (activeTab === "youtube") {
      setIsTranscriptPhase(true);
      setLoadingMsg(t.fetchingTranscript);
      body = {
        youtube_url: youtubeUrl.trim(),
        language: lang,
        max_claims: maxClaims,
        translation: lang === "en" ? selectedTranslation : undefined,
      };
    } else {
      setIsTranscriptPhase(false);
      setLoadingMsg(t.analyzingSermon);
      body = {
        text: text.trim(),
        language: lang,
        max_claims: maxClaims,
        translation: lang === "en" ? selectedTranslation : undefined,
      };
    }

    analyzeSermonStream(
      body,
      // onHeartbeat
      () => {
        setIsTranscriptPhase(false);
        setLoadingMsg(t.stillAnalyzing);
      },
      // onDone
      (data) => {
        const isDemo =
          data.overallExplanation?.includes("[DEMO MODE") ||
          data.overallExplanation?.includes("[MODO DEMO");
        setIsDemoResult(isDemo);
        setAnalysis(data);
        setLoading(false);
        setIsTranscriptPhase(false);

        const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setCurrentEntryId(entryId);
        const entry: HistoryEntry = {
          id: entryId,
          date: new Date().toISOString(),
          inputType: activeTab,
          youtubeUrl: activeTab === "youtube" ? youtubeUrl.trim() : undefined,
          lang,
          overallVerdict: data.overallVerdict,
          analysis: data,
          inputPreview:
            activeTab === "youtube" ? youtubeUrl.trim() : text.trim().slice(0, 100),
        };
        saveHistory([entry, ...history]);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      },
      // onError
      (msg) => {
        const isNoTranscript =
          msg.toLowerCase().includes("no transcript") ||
          msg.toLowerCase().includes("no subtitles") ||
          msg.toLowerCase().includes("captions");
        setError(isNoTranscript ? t.noTranscriptHelp : msg);
        setLoading(false);
        setIsTranscriptPhase(false);
      }
    );
  }, [isReady, activeTab, youtubeUrl, text, lang, t, maxClaims, selectedTranslation, history, saveHistory]);

  // ── Keyboard shortcut: Cmd/Ctrl + Enter ──────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (isReady) handleAnalyze();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isReady, handleAnalyze]);

  // ── Shared-link on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#result=")) {
      try {
        const encoded = hash.slice("#result=".length);
        const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
        setAnalysis(decoded as Analysis);
        setIsDemoResult(false);
        setIsSharedResult(true);
      } catch {
        // malformed hash — ignore
      }
    }
  }, []);

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    if (!analysis) return;
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(analysis)));
      window.location.hash = `result=${encoded}`;
      const url = window.location.href;
      navigator.clipboard.writeText(url).catch(() => {});
      setToastMessage(t.copied);
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      // clipboard unavailable — still set the hash
    }
  }, [analysis, t.copied]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setIsDemoResult(false);
    setIsSharedResult(false);
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Load example ─────────────────────────────────────────────────────────
  const handleExample = () => {
    setText(EXAMPLE_TEXT);
    setActiveTab("text");
    setError(null);
  };

  // ── History callbacks ─────────────────────────────────────────────────────
  const handleHistorySelect = useCallback(
    ({
      analysis: a,
      isDemoResult: demo,
      preacher,
      entryId,
    }: {
      analysis: Analysis;
      isDemoResult: boolean;
      preacher: string;
      entryId: string;
    }) => {
      setAnalysis(a);
      setIsDemoResult(demo);
      setPreacherName(preacher);
      setPreacherSaved(!!preacher);
      setCurrentEntryId(entryId);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    },
    []
  );

  const handleHistoryDelete = useCallback(
    (id: string) => {
      saveHistory(history.filter((e) => e.id !== id));
    },
    [history, saveHistory]
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden print:hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f0f]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl -translate-y-1/3" />

        {/* Top-right controls */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-10 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 max-w-[calc(100vw-1.5rem)]">
          {/* Scripture Explorer link */}
          <a
            href="/lexicon"
            aria-label="Scripture Explorer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/[0.10] transition-all duration-150 text-xs font-semibold text-white/40 hover:text-white/70"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Scripture Explorer</span>
          </a>

          {/* History button */}
          <button
            onClick={() => setHistoryOpen(true)}
            aria-label="Analysis history"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/[0.10] transition-all duration-150 text-xs font-semibold text-white/40 hover:text-white/70"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t.historyTitle}
            {history.length > 0 && (
              <span className="ml-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/80 text-[9px] font-black text-white flex items-center justify-center">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            aria-label="Switch language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/[0.10] transition-all duration-150 text-xs font-black tracking-widest"
          >
            <span className={lang === "en" ? "text-violet-400" : "text-white/35"}>EN</span>
            <span className="text-white/20">|</span>
            <span className={lang === "es" ? "text-violet-400" : "text-white/35"}>ES</span>
          </button>
        </div>

        {/* ── History Drawer ─────────────────────────────────────────────────── */}
        <HistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          history={history}
          onSelect={handleHistorySelect}
          onDelete={handleHistoryDelete}
          t={t}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            {t.badge}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-none title-gradient">
            Rebuttal
            <br className="md:hidden" />
            <span className="md:ml-4">Your Church</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/55 max-w-2xl mx-auto leading-relaxed font-light">
            {t.taglinePre}{" "}
            <span className="text-white/75 font-medium">{t.taglineHighlight}</span>
            {t.taglineSuffix}
          </p>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
            {t.stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-violet-400">{value}</div>
                <div className="text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* ── Input Form ───────────────────────────────────────────────────── */}
        {!analysis && (
          <div className="space-y-4 fade-in print:hidden">

            {/* Demo Mode Banner */}
            <DemoBanner t={t} />

            {/* Tab Switcher */}
            <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1 gap-1">
              {(["text", "youtube"] as InputTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {tab === "text" ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t.tabText}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      {t.tabYoutube}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Text Panel */}
            {activeTab === "text" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    {t.sermonLabel}
                  </label>
                  <button
                    onClick={handleExample}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                  >
                    {t.loadExample}
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.textareaPlaceholder}
                  rows={14}
                  className="w-full bg-transparent px-5 py-4 text-white/85 placeholder-white/20 text-base leading-relaxed resize-none focus:outline-none font-mono"
                />
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
                  <span
                    className={`text-xs font-mono transition-colors ${
                      charCount >= MIN_CHARS ? "text-emerald-400" : "text-white/30"
                    }`}
                  >
                    {charCount >= MIN_CHARS
                      ? t.charsReady(charCount)
                      : t.charsMin(charCount, MIN_CHARS)}
                  </span>
                  {charCount > 0 && charCount < MIN_CHARS && (
                    <span className="text-xs text-white/25">
                      {t.charsToGo(MIN_CHARS - charCount)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* YouTube Panel */}
            {activeTab === "youtube" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-white/10">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    {t.youtubeLabel}
                  </label>
                </div>

                <div className="px-5 py-6 space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder={t.youtubePlaceholder}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && youtubeReady) {
                          e.preventDefault();
                          handleAnalyze();
                        }
                      }}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-10 py-3.5 text-white/85 placeholder-white/20 text-base focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                    {youtubeUrl.trim() && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {youtubeReady ? (
                          <span className="text-emerald-400 text-sm font-bold">✓</span>
                        ) : (
                          <span className="text-red-400 text-sm font-bold">✗</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-white/30 leading-relaxed">{t.youtubeHelperMain}</p>
                    <p className="text-xs text-white/20">{t.youtubeHelperFormats}</p>
                  </div>

                  {youtubeUrl.trim() && !youtubeReady && (
                    <p className="text-xs text-amber-400/70">{t.youtubeInvalidHint}</p>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-white/10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                  <span className="text-xs text-white/25">{t.youtubeCaptionsNote}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-300 text-sm font-semibold mb-1">{t.errorTitle}</p>
                <p className="text-red-200/70 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Depth selector */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30 flex-shrink-0">
                {t.depthLabel}
              </span>
              <div className="flex gap-1.5 flex-1 min-w-0">
                {([3, 5, 7] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setMaxClaims(n)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      maxClaims === n
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                        : "bg-white/[0.04] text-white/35 hover:text-white/55 hover:bg-white/[0.07]"
                    }`}
                  >
                    {n === 3 ? t.depth3 : n === 5 ? t.depth5 : t.depth7}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation selector (English only) */}
            {lang === "en" && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/30 flex-shrink-0">
                  {t.translationLabel}
                </span>
                <div className="flex gap-1.5 flex-1 min-w-0">
                  {(["kjv", "esv", "geneva"] as const).map((tr) => (
                    <button
                      key={tr}
                      onClick={() => setSelectedTranslation(tr)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                        selectedTranslation === tr
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                          : "bg-white/[0.04] text-white/35 hover:text-white/55 hover:bg-white/[0.07]"
                      }`}
                    >
                      {tr === "kjv" ? t.translationKjv : tr === "esv" ? t.translationEsv : t.translationGeneva}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="relative">
              <button
                onClick={handleAnalyze}
                disabled={!isReady}
                className="btn-primary w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200
                  bg-gradient-to-r from-violet-700 to-violet-600
                  hover:from-violet-600 hover:to-violet-500
                  disabled:from-white/[0.06] disabled:to-white/[0.03]
                  disabled:text-white/20 disabled:cursor-not-allowed
                  text-white shadow-lg shadow-violet-500/10
                  hover:shadow-violet-500/30 disabled:shadow-none
                  active:scale-[0.99]"
              >
                {loading
                  ? t.analyzingBtn
                  : activeTab === "youtube"
                  ? t.fetchAnalyzeBtn
                  : t.analyzeBtn}
              </button>
              {isReady && !loading && (
                <p className="text-center text-xs text-white/20 mt-2">{t.keyboardHint}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Loading State ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 space-y-8 fade-in">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-500 spinner-outer" />
              <div className="absolute inset-2 rounded-full border-2 border-amber-400/20 border-t-amber-400/70 spinner-inner" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-white/80">{loadingMsg}</p>
              <p className="text-sm text-white/35">
                {isTranscriptPhase ? t.fetchingSubtitle : t.analyzingSubtitle}
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-500/40 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {analysis && !loading && (
          <div ref={resultsRef} className="space-y-6 fade-in">

            {/* Shared analysis banner */}
            {isSharedResult && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 flex items-center gap-2 print:hidden">
                <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sky-300 text-sm font-semibold">🔗 {t.sharedAnalysis}</span>
              </div>
            )}

            {/* Demo mode notice */}
            {isDemoResult && <DemoBanner t={t} />}

            {/* Overall Verdict */}
            {(() => {
              const s = OVERALL_STYLES[analysis.overallVerdict] ?? OVERALL_STYLES.MIXED;
              const label = t.overallLabels[analysis.overallVerdict] ?? analysis.overallVerdict;
              const explanation = analysis.overallExplanation
                .replace(/\[DEMO MODE[^\]]*\]\s*/g, "")
                .replace(/\[MODO DEMO[^\]]*\]\s*/g, "")
                .trim();
              return (
                <div
                  className={`rounded-2xl border-2 ${s.bg} ${s.border} p-8 shadow-2xl ${s.glow} card-animate`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-1">
                        {t.overallVerdictLabel}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`text-4xl md:text-5xl font-black ${s.text}`}>
                          {label}
                        </span>
                        <span className={`text-2xl font-black ${s.text} opacity-60`}>
                          {s.icon}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full border ${s.border} ${s.bg} text-xs font-black uppercase tracking-widest ${s.text} self-start`}
                    >
                      {analysis.overallVerdict.replace(/_/g, " ")}
                    </div>
                  </div>

                  {analysis.summary && (
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-1.5">
                        {t.summaryLabel}
                      </p>
                      <p className="text-white/65 leading-relaxed text-sm">{analysis.summary}</p>
                    </div>
                  )}

                  <p className="text-white/80 leading-relaxed text-base">{explanation}</p>
                </div>
              );
            })()}

            {/* Claims */}
            {analysis.claims?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/35 px-1">
                  {t.claimsHeader(analysis.claims.length)}
                </h2>
                {analysis.claims.map((claim, i) => (
                  <ClaimCard
                    key={i}
                    claim={claim}
                    index={i}
                    videoId={analysis.videoId}
                    t={t}
                  />
                ))}
              </div>
            )}

            {/* Red Flags */}
            {analysis.redFlags?.length > 0 && (
              <div className="rounded-xl border border-orange-500/25 bg-orange-500/[0.08] p-6 card-animate">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400/80 mb-4">
                  {t.redFlagsHeader}
                </h3>
                <ul className="space-y-2.5">
                  {analysis.redFlags.map((flag, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/65 leading-relaxed"
                    >
                      <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.08] p-6 card-animate">
                <h3 className="text-xs font-black uppercase tracking-widest text-violet-400/80 mb-4">
                  {t.recommendationsHeader}
                </h3>
                <ul className="space-y-2.5">
                  {analysis.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/65 leading-relaxed"
                    >
                      <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preacher Tagger */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">
                🎤 {t.preacherLabel}
              </p>
              {preacherSaved ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/70 flex-1">{preacherName}</span>
                  <button
                    onClick={() => setPreacherSaved(false)}
                    className="text-xs text-white/25 hover:text-violet-400 font-semibold transition-colors"
                  >
                    ✎ Edit
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preacherName}
                    onChange={(e) => setPreacherName(e.target.value)}
                    placeholder={t.preacherPlaceholder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && preacherName.trim() && currentEntryId) {
                        const updated = history.map((h) =>
                          h.id === currentEntryId ? { ...h, preacher: preacherName.trim() } : h
                        );
                        saveHistory(updated);
                        setPreacherSaved(true);
                      }
                    }}
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (preacherName.trim() && currentEntryId) {
                        const updated = history.map((h) =>
                          h.id === currentEntryId
                            ? { ...h, preacher: preacherName.trim() }
                            : h
                        );
                        saveHistory(updated);
                        setPreacherSaved(true);
                      }
                    }}
                    disabled={!preacherName.trim() || !currentEntryId}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 disabled:bg-white/[0.05] disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.preacherSave}
                  </button>
                </div>
              )}
            </div>

            {/* Reset + Share + PDF Export */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 pb-4 print:hidden">
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 py-3 px-8 rounded-xl font-semibold border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all duration-200 justify-center sm:flex-none"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                {t.resetBtn.replace("← ", "")}
              </button>
              <div className="flex gap-2 flex-1 sm:flex-none">
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold border border-sky-500/25 bg-sky-500/[0.07] hover:bg-sky-500/[0.14] text-sky-400 hover:text-sky-300 transition-all duration-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t.share}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold border border-violet-500/25 bg-violet-500/[0.07] hover:bg-violet-500/[0.14] text-violet-400 hover:text-violet-300 transition-all duration-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.exportPdf}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-xl shadow-violet-500/30 pointer-events-none print:hidden">
          {toastMessage}
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] mt-16 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-3">
          <p className="text-white/35 text-sm leading-relaxed max-w-xl mx-auto">
            {t.footerDisclaimer}
          </p>
          <p className="text-white/20 text-xs">
            {t.footerFramework}{" "}
            <span className="text-white/15">{t.footerBuilt}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
