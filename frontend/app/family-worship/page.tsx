"use client";

import { useState, useMemo, useEffect, useCallback, createContext, useContext } from "react";
import { useLanguage } from "../lib/useLanguage";
import { t } from "../lib/i18n";
import {
  getDevotionalForDate,
  DailyDevotional,
} from "../lib/devotionalData";
import { fetchChapter } from "../lib/api";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import { getHymnLyrics } from "../lib/hymnLyrics";
import { FAMILY_WORSHIP_WEEK } from "../lib/familyWorshipData";
import {
  loadDevotionalProgress,
  markDevotionalComplete,
  isDevotionalComplete,
  DEVOTIONAL_BADGES,
  type DevotionalBadgeId,
} from "../lib/devotionalProgress";
import { GeneratedBadgeLogo } from "../components/GeneratedArtwork";

// ─── Theme ─────────────────────────────────────────────────────────────────────

type AppTheme = "default" | "premium-neon" | "gold-navy" | "light-pink" | "light-elegant";

interface ThemeTokens {
  rootBg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  scriptureCardBg: string;
  glowShadow: string;
  accent: string;
  accentDim: string;
  accentText: string;        // text color on accent bg (e.g. dark for amber, white for rose)
  labelColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  buttonBg: string;
  buttonBorder: string;
  buttonText: string;
  ctaText: string;
  inputBg: string;
  inputText: string;
  toggleOffBg: string;
  divider: string;
  quoteBg: string;
  blockquoteBorder: string;
  toggleActive: string;
  toastBg: string;
  toastMuted: string;
  toastShadow: string;
  dangerText: string;
  dangerBg: string;
  successText: string;
  pillBg: string;            // dark/light pill badge bg
  pillText: string;          // pill text color
  badgeSectionBorder: string;
  badgeSectionBg: string;
  badgeCardBorder: string;
  badgeCardBg: string;
  badgeLabelColor: string;
  badgeSectionLabel: string;
}

function buildTokens(theme: AppTheme): ThemeTokens {
  if (theme === "premium-neon") {
    return {
      rootBg: "#0e1018",
      cardBg: "#1a1d27",
      cardBorder: "rgba(255,255,255,0.06)",
      cardShadow: "none",
      scriptureCardBg: "#1e2130",
      glowShadow: "none",
      accent: "#c9a961",
      accentDim: "rgba(201,169,97,0.15)",
      accentText: "#0e1018",
      labelColor: "#c9a961",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.45)",
      textMuted: "rgba(255,255,255,0.35)",
      textFaint: "rgba(255,255,255,0.25)",
      buttonBg: "rgba(255,255,255,0.08)",
      buttonBorder: "rgba(255,255,255,0.12)",
      buttonText: "#ffffff",
      ctaText: "#0e1018",
      inputBg: "#242838",
      inputText: "#ffffff",
      toggleOffBg: "rgba(255,255,255,0.10)",
      divider: "rgba(255,255,255,0.06)",
      quoteBg: "rgba(201,169,97,0.04)",
      blockquoteBorder: "#c9a961",
      toggleActive: "#c9a961",
      toastBg: "#1a1d27",
      toastMuted: "rgba(255,255,255,0.50)",
      toastShadow: "0 8px 32px rgba(0,0,0,0.60)",
      dangerText: "rgba(248,113,113,0.80)",
      dangerBg: "rgba(239,68,68,0.08)",
      successText: "#c9a961",
      pillBg: "rgba(255,255,255,0.10)",
      pillText: "rgba(255,255,255,0.90)",
      badgeSectionBorder: "rgba(255,255,255,0.06)",
      badgeSectionBg: "#1a1d27",
      badgeCardBorder: "rgba(255,255,255,0.08)",
      badgeCardBg: "rgba(255,255,255,0.04)",
      badgeLabelColor: "#c9a961",
      badgeSectionLabel: "rgba(255,255,255,0.40)",
    };
  }
  if (theme === "gold-navy") {
    return {
      rootBg: "#0e1018",
      cardBg: "#1a1d27",
      cardBorder: "rgba(255,255,255,0.06)",
      cardShadow: "none",
      scriptureCardBg: "#1e2130",
      glowShadow: "none",
      accent: "#c9a961",
      accentDim: "rgba(201,169,97,0.15)",
      accentText: "#0e1018",
      labelColor: "#c9a961",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.45)",
      textMuted: "rgba(255,255,255,0.35)",
      textFaint: "rgba(255,255,255,0.25)",
      buttonBg: "rgba(255,255,255,0.08)",
      buttonBorder: "rgba(255,255,255,0.12)",
      buttonText: "#ffffff",
      ctaText: "#0e1018",
      inputBg: "#242838",
      inputText: "#ffffff",
      toggleOffBg: "rgba(255,255,255,0.10)",
      divider: "rgba(255,255,255,0.07)",
      quoteBg: "rgba(201,169,97,0.05)",
      blockquoteBorder: "#c9a961",
      toggleActive: "#c9a961",
      toastBg: "#1a1d27",
      toastMuted: "rgba(255,255,255,0.50)",
      toastShadow: "0 8px 32px rgba(0,0,0,0.60)",
      dangerText: "rgba(248,113,113,0.80)",
      dangerBg: "rgba(239,68,68,0.08)",
      successText: "#c9a961",
      pillBg: "rgba(201,169,97,0.12)",
      pillText: "#d4b878",
      badgeSectionBorder: "rgba(201,169,97,0.14)",
      badgeSectionBg: "rgba(201,169,97,0.05)",
      badgeCardBorder: "rgba(201,169,97,0.22)",
      badgeCardBg: "rgba(201,169,97,0.08)",
      badgeLabelColor: "#c9a961",
      badgeSectionLabel: "rgba(201,169,97,0.55)",
    };
  }
  if (theme === "light-elegant") {
    return {
      rootBg: "#faf7f2",
      cardBg: "#ffffff",
      cardBorder: "rgba(0,0,0,0.07)",
      cardShadow: "0 2px 16px rgba(0,0,0,0.06)",
      scriptureCardBg: "#fffdf9",
      glowShadow: "none",
      accent: "#b8860b",
      accentDim: "rgba(184,134,11,0.12)",
      accentText: "#ffffff",
      labelColor: "#9a7d4a",
      textPrimary: "#1a0f00",
      textSecondary: "rgba(26,15,0,0.72)",
      textMuted: "rgba(26,15,0,0.50)",
      textFaint: "rgba(26,15,0,0.35)",
      buttonBg: "rgba(184,134,11,0.08)",
      buttonBorder: "rgba(184,134,11,0.25)",
      buttonText: "#7c5c2e",
      ctaText: "#ffffff",
      inputBg: "#ffffff",
      inputText: "#1a0f00",
      toggleOffBg: "rgba(184,134,11,0.16)",
      divider: "rgba(0,0,0,0.07)",
      quoteBg: "rgba(184,134,11,0.05)",
      blockquoteBorder: "#b8860b",
      toggleActive: "#7c5c2e",
      toastBg: "#ffffff",
      toastMuted: "rgba(26,15,0,0.60)",
      toastShadow: "0 8px 24px rgba(0,0,0,0.12)",
      dangerText: "#b42318",
      dangerBg: "rgba(180,35,24,0.08)",
      successText: "#2d5a27",
      pillBg: "rgba(184,134,11,0.10)",
      pillText: "#7c5c2e",
      badgeSectionBorder: "rgba(0,0,0,0.07)",
      badgeSectionBg: "rgba(184,134,11,0.04)",
      badgeCardBorder: "rgba(184,134,11,0.18)",
      badgeCardBg: "#fdf8f0",
      badgeLabelColor: "#7c5c2e",
      badgeSectionLabel: "#9a7d4a",
    };
  }
  if (theme === "light-pink") {
    return {
      rootBg: "linear-gradient(180deg, #fff5f9 0%, #fff0f5 100%)",
      cardBg: "#ffffff",
      cardBorder: "rgba(236,72,153,0.12)",
      cardShadow: "0 2px 16px rgba(236,72,153,0.08)",
      scriptureCardBg: "#fffafc",
      glowShadow: "none",
      accent: "#be185d",
      accentDim: "rgba(190,24,93,0.10)",
      accentText: "#ffffff",
      labelColor: "#9d174d",
      textPrimary: "#500724",
      textSecondary: "rgba(80,7,36,0.75)",
      textMuted: "rgba(80,7,36,0.55)",
      textFaint: "rgba(80,7,36,0.38)",
      buttonBg: "rgba(236,72,153,0.08)",
      buttonBorder: "rgba(236,72,153,0.22)",
      buttonText: "#9d174d",
      ctaText: "#ffffff",
      inputBg: "#ffffff",
      inputText: "#500724",
      toggleOffBg: "rgba(236,72,153,0.14)",
      divider: "rgba(236,72,153,0.10)",
      quoteBg: "rgba(236,72,153,0.04)",
      blockquoteBorder: "#ec4899",
      toggleActive: "#9d174d",
      toastBg: "#ffffff",
      toastMuted: "rgba(80,7,36,0.60)",
      toastShadow: "0 8px 24px rgba(236,72,153,0.12)",
      dangerText: "#b42318",
      dangerBg: "rgba(180,35,24,0.08)",
      successText: "#166534",
      pillBg: "rgba(236,72,153,0.10)",
      pillText: "#9d174d",
      badgeSectionBorder: "rgba(236,72,153,0.12)",
      badgeSectionBg: "rgba(236,72,153,0.04)",
      badgeCardBorder: "rgba(236,72,153,0.18)",
      badgeCardBg: "rgba(236,72,153,0.06)",
      badgeLabelColor: "#9d174d",
      badgeSectionLabel: "#9d174d",
    };
  }
  // default dark
  return {
    rootBg: "#0f0f0f",
    cardBg: "rgba(139,100,69,0.06)",
    cardBorder: "rgba(139,100,69,0.22)",
    cardShadow: "none",
    scriptureCardBg: "rgba(139,100,69,0.10)",
    glowShadow: "none",
    accent: "#c4924e",
    accentDim: "rgba(196,146,78,0.18)",
    accentText: "#ffffff",
    labelColor: "#c4924e",
    textPrimary: "rgba(255,255,255,0.95)",
    textSecondary: "rgba(255,255,255,0.60)",
    textMuted: "rgba(255,255,255,0.40)",
    textFaint: "rgba(255,255,255,0.25)",
    buttonBg: "rgba(139,100,69,0.12)",
    buttonBorder: "rgba(139,100,69,0.28)",
    buttonText: "#c4924e",
    ctaText: "#ffffff",
    inputBg: "rgba(0,0,0,0.30)",
    inputText: "rgba(255,255,255,0.90)",
    toggleOffBg: "rgba(255,255,255,0.10)",
    divider: "rgba(139,100,69,0.12)",
    quoteBg: "rgba(0,0,0,0.08)",
    blockquoteBorder: "#c4924e",
    toggleActive: "#b45309",
    toastBg: "#1a1510",
    toastMuted: "rgba(255,255,255,0.60)",
    toastShadow: "0 8px 32px rgba(0,0,0,0.40)",
    dangerText: "rgba(248,113,113,0.80)",
    dangerBg: "rgba(239,68,68,0.08)",
    successText: "rgba(52,211,153,0.70)",
    pillBg: "rgba(196,146,78,0.12)",
    pillText: "#c4924e",
    badgeSectionBorder: "rgba(155,114,40,0.18)",
    badgeSectionBg: "rgba(155,114,40,0.04)",
    badgeCardBorder: "rgba(155,114,40,0.25)",
    badgeCardBg: "rgba(155,114,40,0.08)",
    badgeLabelColor: "#c4924e",
    badgeSectionLabel: "rgba(155,114,40,0.55)",
  };
}

const ThemeCtx = createContext<ThemeTokens>(buildTokens("default"));
function useTheme() { return useContext(ThemeCtx); }

function readStoredAppTheme(): AppTheme {
  if (typeof window === "undefined") return "premium-neon";
  try {
    const v = localStorage.getItem("ryc-theme");
    if (v === "premium-neon" || v === "gold-navy" || v === "light-pink" || v === "light-elegant") return v;
  } catch { /* ignore */ }
  return "premium-neon";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(date: Date, lang: "en" | "es" = "en"): string {
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { weekday: "long", month: "long", day: "numeric" });
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function hymnYouTubeUrl(title: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " hymn lyrics")}`;
}

// ─── Shared micro-label style ─────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.62rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const BOOK_NAME_TO_NUM = new Map(
  BIBLE_BOOKS.flatMap((book) => {
    const names: Array<[string, number]> = [[book.name.toLowerCase(), book.num]];
    if (book.name === "Psalms") names.push(["psalm", book.num]);
    return names;
  })
);

interface ParsedPassage {
  bookNum: number;
  chapter: number;
  verses: number[];
}

function parsePassageReference(reference: string): ParsedPassage | null {
  const normalized = reference.replace(/[–—]/g, "-").trim();
  const match = normalized.match(/^(.+)\s+(\d+):([\d,\-\s]+)$/);
  if (!match) return null;

  const bookNum = BOOK_NAME_TO_NUM.get(match[1].trim().toLowerCase());
  if (!bookNum) return null;

  const chapter = Number(match[2]);
  const verseSet = new Set<number>();

  for (const part of match[3].split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      for (let verse = start; verse <= end; verse += 1) verseSet.add(verse);
      continue;
    }

    const verse = Number(trimmed);
    if (Number.isFinite(verse)) verseSet.add(verse);
  }

  const verses = [...verseSet].sort((a, b) => a - b);
  if (!chapter || verses.length === 0) return null;
  return { bookNum, chapter, verses };
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#c9a961", "#a855f7", "#6366f1", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];

function ConfettiOverlay() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.8,
        size: Math.random() * 10 + 6,
        shape: i % 3 === 0 ? "circle" : "rect",
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="fixed inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
        <div className="animate-pop-in text-7xl">🎉</div>
      </div>
    </div>
  );
}

// ─── Scripture + Ryle Card ────────────────────────────────────────────────────

function ScriptureAndDevotionalCard({ entry }: { entry: DailyDevotional }) {
  const tk = useTheme();
  const { lang } = useLanguage();
  const [scriptureText, setScriptureText] = useState("");
  const [scriptureStatus, setScriptureStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [showFullCommentary, setShowFullCommentary] = useState(false);
  const [translatedCommentary, setTranslatedCommentary] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  // Audio is English-only — hide in Spanish mode
  const ryleAudioTracks = lang === "es" ? [] : (entry.audioTracks ?? []);
  const canShowFullCommentary =
    Boolean(entry.fullDevotional) && entry.fullDevotional !== entry.devotional;
  const meditationText =
    showFullCommentary && entry.fullDevotional ? entry.fullDevotional : entry.devotional;

  useEffect(() => {
    setShowFullCommentary(false);
    setTranslatedCommentary(null);
  }, [entry.scripture.reference]);

  // Auto-translate commentary via unofficial Google Translate API — no length limit
  async function translateCommentary(text?: string) {
    if (translating) return;
    setTranslating(true);
    try {
      const fullText = text ?? meditationText;
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(fullText)}`
      );
      const data = await res.json();
      // Response is nested arrays: data[0] = array of [translatedChunk, originalChunk]
      const translated: string = (data[0] as [string, string][])
        .map((chunk) => chunk[0])
        .join("");
      setTranslatedCommentary(translated);
    } catch { /* silently fail — commentary stays in English */ }
    setTranslating(false);
  }

  // Auto-trigger translation when Spanish mode is on
  useEffect(() => {
    if (lang === "es" && meditationText && !translatedCommentary && !translating) {
      void translateCommentary(meditationText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, meditationText]);

  useEffect(() => {
    let cancelled = false;
    const parsed = parsePassageReference(entry.scripture.reference);

    async function loadPassage() {
      if (!parsed) {
        setScriptureText(entry.scripture.text);
        setScriptureStatus("fallback");
        return;
      }

      setScriptureText("");
      setScriptureStatus("loading");

      // In Spanish mode, try to fetch from LBLA (La Biblia de las Américas)
      const translation = lang === "es" ? "lbla" : "esv";

      try {
        const chapter = await fetchChapter(parsed.bookNum, parsed.chapter, translation);
        if (cancelled) return;

        const selected = chapter.verses.filter((verse) => parsed.verses.includes(verse.verse));
        if (selected.length === 0) throw new Error("No matching verses returned");

        setScriptureText(selected.map((verse) => `${verse.verse} ${verse.text}`).join("\n\n"));
        setScriptureStatus("ready");
      } catch {
        if (cancelled) return;
        // Fallback: try ESV if LBLA fails
        if (lang === "es") {
          try {
            const chapter = await fetchChapter(parsed.bookNum, parsed.chapter, "esv");
            if (cancelled) return;
            const selected = chapter.verses.filter((verse) => parsed.verses.includes(verse.verse));
            if (selected.length > 0) {
              setScriptureText(selected.map((verse) => `${verse.verse} ${verse.text}`).join("\n\n"));
              setScriptureStatus("ready");
              return;
            }
          } catch { /* fall through */ }
        }
        setScriptureText(entry.scripture.text);
        setScriptureStatus("fallback");
      }
    }

    void loadPassage();

    return () => {
      cancelled = true;
    };
  }, [entry.scripture.reference, entry.scripture.text, lang]);

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${tk.cardBorder}`,
        backgroundColor: tk.scriptureCardBg,
        boxShadow: tk.cardShadow,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${tk.divider}` }}>
        <p style={{ ...LABEL_STYLE, color: tk.labelColor, marginBottom: 10 }}>
          {t(lang, "family_ryle_label")}
        </p>
        <p style={{ fontSize: "1.75rem", fontWeight: 700, color: tk.textPrimary, lineHeight: 1.1 }}>
          {entry.scripture.reference}
        </p>
        <p className="mt-1" style={{ fontSize: "0.72rem", color: tk.textFaint, letterSpacing: "0.06em" }}>
          {scriptureStatus === "fallback"
            ? `${entry.scripture.translation} fallback`
            : lang === "es" ? "LBLA" : "ESV"}
        </p>
      </div>

      {/* Blockquote */}
      <div className="px-5 py-5" style={{ borderBottom: `1px solid ${tk.divider}`, backgroundColor: tk.quoteBg }}>
        <blockquote
          style={{
            borderLeft: `3px solid ${tk.blockquoteBorder}`,
            paddingLeft: 16,
          }}
        >
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.75,
              fontStyle: "italic",
              color: tk.textPrimary,
              whiteSpace: "pre-line",
            }}
          >
            {scriptureStatus === "loading" ? t(lang, "family_loading_passage") : scriptureText}
          </p>
          <p className="mt-3" style={{ fontSize: "0.85rem", fontWeight: 600, color: tk.accent }}>
            — {entry.scripture.reference}
          </p>
        </blockquote>
        <p className="mt-4" style={{ fontSize: "0.78rem", lineHeight: 1.6, color: tk.textFaint }}>
          {t(lang, "family_read_aloud_prompt")}
        </p>
      </div>

      {/* Meditation */}
      <div className="px-5 py-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p style={{ ...LABEL_STYLE, color: tk.textMuted }}>{t(lang, "family_meditation")}</p>
            {canShowFullCommentary && (
              <p className="mt-1 text-xs" style={{ color: tk.textFaint }}>
                {showFullCommentary ? t(lang, "family_full_commentary") : t(lang, "family_concise_reading")}
              </p>
            )}
          </div>
          {canShowFullCommentary && (
            <button
              type="button"
              onClick={() => setShowFullCommentary((value) => !value)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all"
              style={{
                backgroundColor: tk.buttonBg,
                border: `1px solid ${tk.buttonBorder}`,
                color: tk.buttonText,
              }}
            >
              {showFullCommentary ? t(lang, "family_show_concise") : t(lang, "family_read_full")}
            </button>
          )}
        </div>
        {(translatedCommentary ?? meditationText).split("\n\n").map((para, i) => (
          <p key={i} style={{ fontSize: "0.95rem", lineHeight: 1.75, color: tk.textSecondary }}>
            {para}
          </p>
        ))}
        {lang === "es" && translating && (
          <p className="mt-2 text-xs" style={{ color: tk.textFaint }}>
            🌐 Traduciendo al español…
          </p>
        )}
      </div>

      {ryleAudioTracks.length > 0 && (
        <div className="px-5 pb-5">
          <div
            className="p-4 space-y-3"
            style={{
              borderRadius: 14,
              border: `1px solid ${tk.cardBorder}`,
              backgroundColor: tk.cardBg,
            }}
          >
          <div>
            <p style={{ ...LABEL_STYLE, color: tk.labelColor }}>{t(lang, "family_read_aloud_label")}</p>
            <p className="mt-1 text-sm leading-6" style={{ color: tk.textMuted }}>
              {t(lang, "family_ryle_audio_desc")}
            </p>
          </div>
            {ryleAudioTracks.map((track) => (
              <div key={track.url} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold" style={{ color: tk.textPrimary }}>{track.title}</p>
                  <p className="text-xs" style={{ color: tk.textFaint }}>{track.duration}</p>
                </div>
                <audio controls preload="none" className="w-full">
                  <source src={track.url} type="audio/mpeg" />
                </audio>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-5">
        <p
          className="text-xs italic pt-4"
          style={{ color: tk.textFaint, borderTop: `1px solid ${tk.divider}` }}
        >
          — {t(lang, "family_ryle_attribution")}
        </p>
      </div>
    </div>
  );
}

// ─── Hymn Card ────────────────────────────────────────────────────────────────

// Returns the Spanish hymn for the current day of week (0=Sun…6=Sat)
function getSpanishHymn() {
  const dayIds = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayId = dayIds[new Date().getDay()];
  const worshipDay = FAMILY_WORSHIP_WEEK.find((d) => d.id === dayId);
  return worshipDay?.hymnEs ?? null;
}

function HymnCard({ entry }: { entry: DailyDevotional }) {
  const { lang } = useLanguage();
  const tk = useTheme();

  // In Spanish mode, show the day-of-week Spanish hymn from familyWorshipData
  const spanishHymn = lang === "es" ? getSpanishHymn() : null;

  const hymnTitle = spanishHymn ? spanishHymn.title : entry.hymn.title;
  const hymnAuthor = spanishHymn ? spanishHymn.author : entry.hymn.author;
  const hymnYear = spanishHymn ? spanishHymn.year : entry.hymn.year;
  const lyrics = spanishHymn ? null : getHymnLyrics(entry.hymn.title);
  const spanishVerses = spanishHymn ? spanishHymn.verses : null;

  const [audioOpen, setAudioOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${tk.cardBorder}`,
        backgroundColor: tk.cardBg,
        boxShadow: tk.cardShadow,
        overflow: "hidden",
      }}
    >
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${tk.divider}` }}>
        <p style={{ ...LABEL_STYLE, color: tk.labelColor, marginBottom: 10 }}>🎵 {lang === "es" ? "Himno" : "Hymn"}</p>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: tk.textPrimary, lineHeight: 1.25 }}>
              {hymnTitle}
            </p>
            <p className="mt-1" style={{ fontSize: "0.78rem", color: tk.textFaint }}>
              {hymnAuthor} · {hymnYear}
            </p>
          </div>
          <button
            onClick={() => setAudioOpen(!audioOpen)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-95 transition-all"
            style={{
              backgroundColor: tk.buttonBg,
              border: `1px solid ${tk.buttonBorder}`,
              color: tk.buttonText,
            }}
          >
            {audioOpen ? t(lang, "family_close") : t(lang, "family_listen")}
          </button>
        </div>
      </div>

      {audioOpen && (
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${tk.divider}` }}>
          <p className="text-xs mb-3 leading-5" style={{ color: tk.textMuted }}>
            {lang === "es"
              ? "Busca este himno en YouTube para cantarlo en familia."
              : "Tap below to find this hymn on YouTube and sing along as a family."}
          </p>
          <a
            href={hymnYouTubeUrl(hymnTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border active:scale-95 transition-all"
            style={{ backgroundColor: "rgba(255,0,0,0.07)", borderColor: "rgba(255,0,0,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <div>
              <p className="font-semibold text-sm" style={{ color: tk.textSecondary }}>{hymnTitle}</p>
              <p className="text-xs mt-0.5" style={{ color: tk.textMuted }}>{t(lang, "family_open_youtube")}</p>
            </div>
          </a>
        </div>
      )}

      <div className="px-5 py-5">
        {spanishVerses ? (
          <div className="space-y-6">
            {spanishVerses.map((verse, i) => (
              <div key={i}>
                <p style={{ ...LABEL_STYLE, color: tk.textMuted, marginBottom: 8 }}>
                  Estrofa {i + 1}
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: tk.textSecondary, whiteSpace: "pre-line" }}>
                  {verse}
                </p>
              </div>
            ))}
          </div>
        ) : lyrics ? (
          <div className="space-y-6">
            {lyrics.verses.map((verse, i) => (
              <div key={i}>
                <p style={{ ...LABEL_STYLE, color: tk.textMuted, marginBottom: 8 }}>
                  {t(lang, "family_verse_label")} {i + 1}
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: tk.textSecondary, whiteSpace: "pre-line" }}>
                  {verse}
                </p>
              </div>
            ))}
            {lyrics.chorus && (
              <div className="pt-5" style={{ borderTop: `1px solid ${tk.divider}` }}>
                <p style={{ ...LABEL_STYLE, color: tk.textMuted, marginBottom: 8 }}>
                  {t(lang, "family_chorus_label")}
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: tk.textSecondary, whiteSpace: "pre-line" }}>
                  {lyrics.chorus}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: tk.textMuted }}>
            {entry.hymn.firstLine ? `"${entry.hymn.firstLine}…"` : "See The Baptist Hymnal for full text."}
          </p>
        )}
        <p className="mt-5 text-xs" style={{ color: tk.textFaint }}>
          {lang === "es" ? "Canta o lee en voz alta juntos como familia." : "Sing or read aloud together as a family."}
        </p>
      </div>
    </div>
  );
}

// ─── Prayer Card ──────────────────────────────────────────────────────────────

interface PrayerItem { id: string; text: string; }

function PrayerCard() {
  const { lang } = useLanguage();
  const tk = useTheme();
  const [items, setItems] = useState<PrayerItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("axiom-fw-prayers");
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function save(next: PrayerItem[]) {
    setItems(next);
    try { localStorage.setItem("axiom-fw-prayers", JSON.stringify(next)); } catch { /**/ }
  }

  function addItem() {
    const text = draft.trim();
    if (!text) { setAdding(false); setDraft(""); return; }
    save([...items, { id: Date.now().toString(), text }]);
    setDraft(""); setAdding(false);
  }

  function deleteItem(id: string) { save(items.filter((i) => i.id !== id)); }

  function startEdit(item: PrayerItem) { setEditingId(item.id); setEditDraft(item.text); }

  function commitEdit() {
    const text = editDraft.trim();
    if (!text) { deleteItem(editingId!); }
    else { save(items.map((i) => i.id === editingId ? { ...i, text } : i)); }
    setEditingId(null); setEditDraft("");
  }

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${tk.cardBorder}`,
        backgroundColor: tk.cardBg,
        boxShadow: tk.cardShadow,
        overflow: "hidden",
      }}
    >
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${tk.divider}` }}>
        <p style={{ ...LABEL_STYLE, color: tk.labelColor, marginBottom: 8 }}>{t(lang, "family_prayer_label")}</p>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: tk.textPrimary }}>{t(lang, "family_prayer_title")}</p>
        <p className="mt-1" style={{ fontSize: "0.8rem", lineHeight: 1.55, color: tk.textFaint }}>
          {t(lang, "family_prayer_sub")}
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {items.length === 0 && !adding && (
          <p className="text-sm italic text-center py-3" style={{ color: tk.textFaint }}>
            {t(lang, "family_no_prayers")}
          </p>
        )}

        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="flex gap-2 items-start">
              <textarea
                autoFocus
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); }
                  if (e.key === "Escape") setEditingId(null);
                }}
                rows={2}
                className="flex-1 px-3 py-2 rounded-xl outline-none resize-none text-sm leading-6"
                style={{ backgroundColor: tk.inputBg, color: tk.inputText, border: `1px solid ${tk.buttonBorder}` }}
              />
              <div className="flex flex-col gap-1.5 pt-0.5">
                <button onClick={commitEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95" style={{ backgroundColor: tk.buttonBg, color: tk.buttonText, border: `1px solid ${tk.buttonBorder}` }}>{t(lang, "family_save")}</button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95" style={{ color: tk.textMuted, border: `1px solid ${tk.divider}` }}>{t(lang, "family_cancel")}</button>
              </div>
            </div>
          ) : (
            <div key={item.id} className="flex items-start gap-3 group">
              <div className="flex-shrink-0 mt-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: tk.buttonBg, border: `1px solid ${tk.buttonBorder}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tk.accent }} />
              </div>
              <p className="flex-1 text-sm leading-7" style={{ color: tk.textSecondary }}>{item.text}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                <button onClick={() => startEdit(item)} className="w-6 h-6 flex items-center justify-center rounded-lg text-xs active:scale-90 transition-all" style={{ color: tk.accentDim, backgroundColor: tk.buttonBg }} title="Edit">✏️</button>
                <button onClick={() => deleteItem(item.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-xs active:scale-90 transition-all" style={{ color: tk.dangerText, backgroundColor: tk.dangerBg }} title="Remove">✕</button>
              </div>
            </div>
          )
        )}

        {adding && (
          <div className="flex gap-2 items-start pt-1">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addItem(); }
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              placeholder={t(lang, "family_prayer_placeholder")}
              rows={2}
              className="flex-1 px-3 py-2 rounded-xl outline-none resize-none text-sm leading-6"
              style={{ backgroundColor: tk.inputBg, color: tk.inputText, border: `1px solid ${tk.buttonBorder}` }}
            />
            <div className="flex flex-col gap-1.5 pt-0.5">
              <button onClick={addItem} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95" style={{ backgroundColor: tk.buttonBg, color: tk.buttonText, border: `1px solid ${tk.buttonBorder}` }}>{t(lang, "family_add")}</button>
              <button onClick={() => { setAdding(false); setDraft(""); }} className="px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95" style={{ color: tk.textMuted, border: `1px solid ${tk.divider}` }}>{t(lang, "family_cancel")}</button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <div className="px-5 pb-5">
          <button
            onClick={() => setAdding(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: tk.buttonBg, border: `1px solid ${tk.buttonBorder}`, color: tk.buttonText }}
          >
            <span className="text-base leading-none">+</span>
            {t(lang, "family_add_prayer")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Completion Card ──────────────────────────────────────────────────────────

function CompletionCard({
  dateStr,
  isToday,
  onComplete,
}: {
  dateStr: string;
  isToday: boolean;
  onComplete: (newBadges: DevotionalBadgeId[]) => void;
}) {
  const { lang } = useLanguage();
  const tk = useTheme();
  const [done, setDone] = useState(false);

  useEffect(() => { setDone(isDevotionalComplete(dateStr)); }, [dateStr]);

  function handleComplete() {
    const { newBadges } = markDevotionalComplete(dateStr);
    setDone(true);
    onComplete(newBadges);
  }

  if (done) {
    if (isToday) {
      const [y, mo, day] = dateStr.split("-").map(Number);
      const tomorrow = new Date(y, mo - 1, day + 1);
      return (
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            border: `1px solid ${tk.cardBorder}`,
            backgroundColor: tk.cardBg,
            boxShadow: tk.cardShadow,
            padding: "36px 24px",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ backgroundColor: tk.buttonBg, border: `1px solid ${tk.accent}` }}
          >
            ✅
          </div>
          <p style={{ fontSize: "1.05rem", fontWeight: 700, color: tk.textPrimary }}>
            {t(lang, "family_completed_title")}
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: tk.textMuted }}>
            {t(lang, "family_completed_msg")}
          </p>
          <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${tk.divider}` }}>
            <p style={{ ...LABEL_STYLE, color: tk.textFaint, marginBottom: 4 }}>{t(lang, "family_come_back_tomorrow")}</p>
            <p className="text-sm font-semibold" style={{ color: tk.textSecondary }}>
              {formatDateShort(tomorrow, lang)}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div
        className="flex items-center gap-4 px-5 py-4"
        style={{
          borderRadius: 16,
          border: `1px solid ${tk.cardBorder}`,
          backgroundColor: tk.cardBg,
          boxShadow: tk.cardShadow,
        }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: tk.buttonBg }}>
          ✅
        </div>
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: tk.textPrimary }}>{t(lang, "family_completed_title")}</p>
          <p className="text-xs mt-0.5" style={{ color: tk.textFaint }}>{t(lang, "family_completed_msg")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-center"
      style={{
        borderRadius: 16,
        border: `1px solid ${tk.cardBorder}`,
        backgroundColor: tk.cardBg,
        boxShadow: tk.cardShadow,
        padding: "32px 24px",
      }}
    >
      <div className="text-3xl mb-4">🙏</div>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: tk.textPrimary }}>
        {t(lang, "family_did_complete")}
      </p>
      <p className="text-sm mt-2 leading-6" style={{ color: tk.textMuted }}>
        {t(lang, "family_complete_check")}
      </p>
      <button
        onClick={handleComplete}
        className="mt-5 w-full py-3 rounded-xl active:scale-[0.98] transition-all font-semibold text-sm"
        style={{ backgroundColor: tk.toggleActive, color: tk.ctaText }}
      >
        {t(lang, "family_yes_completed")}
      </button>
    </div>
  );
}

// ─── Daily Reminder Card ──────────────────────────────────────────────────────

const REMINDER_KEY = "axiom-fw-reminder";

function ReminderCard() {
  const { lang } = useLanguage();
  const tk = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("19:00");
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMINDER_KEY);
      if (stored) {
        const { enabled: e, time: t } = JSON.parse(stored);
        setEnabled(!!e);
        if (t) setTime(t);
      }
    } catch {}
    if (typeof Notification !== "undefined") setPermissionState(Notification.permission);
  }, []);

  async function handleToggle() {
    if (!enabled) {
      if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
        const result = await Notification.requestPermission();
        setPermissionState(result);
        if (result !== "granted") return;
      }
      setEnabled(true); save(true, time);
    } else {
      setEnabled(false); save(false, time);
    }
  }

  function handleTimeChange(t: string) { setTime(t); if (enabled) save(enabled, t); }

  function save(e: boolean, t: string) {
    try { localStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled: e, time: t })); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const [h, m] = time.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayTime = `${h12}:${String(m).padStart(2, "0")} ${ampm}`;

  return (
    <div
      className="px-5 py-5 space-y-4"
      style={{
        borderRadius: 16,
        border: `1px solid ${tk.cardBorder}`,
        backgroundColor: tk.cardBg,
        boxShadow: tk.cardShadow,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 600, color: tk.textPrimary }}>{t(lang, "family_daily_reminder")}</p>
          <p className="text-xs mt-0.5" style={{ color: tk.textMuted }}>{t(lang, "family_reminder_desc")}</p>
        </div>
        <button
          onClick={handleToggle}
          className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
          style={{ backgroundColor: enabled ? tk.toggleActive : tk.toggleOffBg }}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <p style={{ ...LABEL_STYLE, color: tk.textMuted }}>{t(lang, "family_reminder_time")}</p>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: tk.inputBg, color: tk.inputText, border: `1px solid ${tk.buttonBorder}` }}
            />
            <span className="text-sm font-semibold flex-shrink-0" style={{ color: tk.accent }}>{displayTime}</span>
          </div>
          {permissionState === "denied" && (
            <p className="text-xs" style={{ color: tk.dangerText }}>{t(lang, "family_notif_blocked")}</p>
          )}
          {saved && <p className="text-xs" style={{ color: tk.successText }}>{t(lang, "family_reminder_saved")}</p>}
          <p className="text-[11px] leading-relaxed" style={{ color: tk.textFaint }}>
            {t(lang, "family_notif_note")}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Badge Toast ──────────────────────────────────────────────────────────────

function BadgeToast({ badges }: { badges: DevotionalBadgeId[] }) {
  const { lang } = useLanguage();
  const tk = useTheme();
  if (badges.length === 0) return null;
  const badge = DEVOTIONAL_BADGES[badges[0]];
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-pop-in">
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
        style={{ backgroundColor: tk.toastBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.toastShadow }}
      >
        <GeneratedBadgeLogo id={badges[0]} family="devotional" size={40} />
        <div>
          <p className="font-black text-sm" style={{ color: tk.accent }}>{t(lang, "family_new_badge")}</p>
          <p className="text-xs mt-0.5" style={{ color: tk.toastMuted }}>
            {lang === "es" ? badge.labelEs : badge.label} — {lang === "es" ? badge.descEs : badge.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyWorshipPage() {
  const { lang } = useLanguage();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadges, setNewBadges] = useState<DevotionalBadgeId[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<DevotionalBadgeId[]>([]);

  const [appTheme, setAppTheme] = useState<AppTheme>(() => readStoredAppTheme());

  useEffect(() => {
    setAppTheme(readStoredAppTheme());
    function onThemeChange() { setAppTheme(readStoredAppTheme()); }
    window.addEventListener("ryc-theme-change", onThemeChange);
    return () => window.removeEventListener("ryc-theme-change", onThemeChange);
  }, []);

  const tokens = useMemo(() => buildTokens(appTheme), [appTheme]);

  useEffect(() => {
    try {
      const progress = loadDevotionalProgress();
      setEarnedBadges(progress.badges as DevotionalBadgeId[]);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("axiom-fw-date");
      if (stored) {
        const d = new Date(stored);
        if (!isNaN(d.getTime())) {
          d.setHours(0, 0, 0, 0);
          if (toDateStr(d) >= toDateStr(today)) {
            setSelectedDate(d);
          } else {
            localStorage.removeItem("axiom-fw-date");
          }
        }
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToDate(d: Date) {
    setSelectedDate(d);
    try { localStorage.setItem("axiom-fw-date", d.toISOString()); } catch { /**/ }
  }

  function goToToday() {
    setSelectedDate(today);
    try { localStorage.removeItem("axiom-fw-date"); } catch { /**/ }
  }

  const handleComplete = useCallback((earned: DevotionalBadgeId[]) => {
    setShowConfetti(true);
    if (earned.length > 0) setNewBadges(earned);
    setTimeout(() => setShowConfetti(false), 2500);
    setTimeout(() => setNewBadges([]), 4000);
    try {
      const progress = loadDevotionalProgress();
      setEarnedBadges(progress.badges as DevotionalBadgeId[]);
    } catch { /* ignore */ }
  }, []);

  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth()    === today.getMonth() &&
    selectedDate.getDate()     === today.getDate();

  const dailyEntry = getDevotionalForDate(selectedDate);
  const dateStr    = toDateStr(selectedDate);

  return (
    <ThemeCtx.Provider value={tokens}>
      <div className="min-h-screen" style={{ background: tokens.rootBg }}>
        {showConfetti && <ConfettiOverlay />}
        {newBadges.length > 0 && <BadgeToast badges={newBadges} />}

        {/* ── Header (no card — floats on bg) ─────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-6">
          {/* Pill badge */}
          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                ...LABEL_STYLE,
                backgroundColor: tokens.pillBg,
                color: tokens.pillText,
                border: `1px solid ${tokens.cardBorder}`,
              }}
            >
              {t(lang, "family_worship_pill")}
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.1 }}>
            {t(lang, "family_heading")}
          </h1>
          <p className="mt-2" style={{ fontSize: "0.9rem", lineHeight: 1.55, color: tokens.textSecondary }}>
            {t(lang, "family_worship_sub")}
          </p>
        </div>

        {/* ── Date navigator ────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-5 mb-3">
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${tokens.cardBorder}`,
              backgroundColor: tokens.cardBg,
              boxShadow: tokens.cardShadow,
              padding: "16px 16px",
            }}
          >
            <div className="flex items-center gap-3">
              {/* Prev */}
              <button
                onClick={() => goToDate(addDays(selectedDate, -1))}
                aria-label="Previous day"
                className="flex items-center justify-center active:scale-90 transition-all"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: tokens.buttonBg,
                  border: `1px solid ${tokens.buttonBorder}`,
                  color: tokens.textSecondary,
                  flexShrink: 0,
                  fontSize: "1.1rem",
                }}
              >
                ‹
              </button>

              {/* Date center */}
              <div className="flex-1 text-center">
                <p style={{ fontSize: "1rem", fontWeight: 700, color: tokens.textPrimary }}>
                  {formatDateShort(selectedDate, lang)}
                </p>
                <p className="mt-0.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: tokens.accent }}>
                  {dailyEntry?.displayDate
                    ? lang === "es"
                      ? dailyEntry.displayDate.replace(/^Reading (\d+) of (\d+)$/, (_, n, total) =>
                          `${t(lang, "family_reading_label")} ${n} ${t(lang, "family_reading_of")} ${total}`)
                      : dailyEntry.displayDate
                    : ""}
                </p>
              </div>

              {/* Next */}
              <button
                onClick={() => goToDate(addDays(selectedDate, 1))}
                aria-label="Next day"
                className="flex items-center justify-center active:scale-90 transition-all"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: tokens.buttonBg,
                  border: `1px solid ${tokens.buttonBorder}`,
                  color: tokens.textSecondary,
                  flexShrink: 0,
                  fontSize: "1.1rem",
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-5 pb-32 space-y-3">
          {dailyEntry ? (
            <>
              {/* Theme row: left = theme title pill, right = Today / Back to Today */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: tokens.cardBg,
                    border: `1px solid ${tokens.cardBorder}`,
                  }}
                >
                  <p
                    className="truncate"
                    style={{ ...LABEL_STYLE, color: tokens.textSecondary, letterSpacing: "0.10em" }}
                  >
                    {dailyEntry.theme}
                  </p>
                </div>
                {isToday ? (
                  <span
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{
                      backgroundColor: tokens.accent,
                      color: tokens.accentText,
                    }}
                  >
                    {t(lang, "family_today")}
                  </span>
                ) : (
                  <button
                    onClick={goToToday}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                    style={{
                      backgroundColor: tokens.accent,
                      color: tokens.accentText,
                    }}
                  >
                    {t(lang, "family_back_today")}
                  </button>
                )}
              </div>

              <ScriptureAndDevotionalCard entry={dailyEntry} />
              <HymnCard entry={dailyEntry} />
              <PrayerCard />
              <CompletionCard dateStr={dateStr} isToday={isToday} onComplete={handleComplete} />
              <ReminderCard />
            </>
          ) : (
            <div
              className="p-8 text-center"
              style={{
                borderRadius: 16,
                border: `1px solid ${tokens.cardBorder}`,
                backgroundColor: tokens.cardBg,
                boxShadow: tokens.cardShadow,
              }}
            >
              <p className="text-4xl mb-3">📖</p>
              <p className="font-semibold mb-1" style={{ color: tokens.textSecondary }}>
                {t(lang, "family_no_devotional")}
              </p>
              <p className="text-sm leading-6" style={{ color: tokens.textFaint }}>
                {t(lang, "family_no_devotional_sub")}
              </p>
              <button
                onClick={goToToday}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: tokens.accent,
                  color: tokens.accentText,
                }}
              >
                {t(lang, "family_go_today")}
              </button>
            </div>
          )}

          {/* Devotional Badges */}
          {earnedBadges.length > 0 && (
            <div
              className="px-5 py-5 space-y-4"
              style={{
                borderRadius: 16,
                border: `1px solid ${tokens.badgeSectionBorder}`,
                backgroundColor: tokens.badgeSectionBg,
                boxShadow: tokens.cardShadow,
              }}
            >
              <p style={{ ...LABEL_STYLE, color: tokens.badgeSectionLabel }}>
                {t(lang, "family_faithfulness")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {earnedBadges.map((id) => {
                  const badge = DEVOTIONAL_BADGES[id];
                  return (
                    <div
                      key={id}
                      title={badge.desc}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                      style={{
                        border: `1px solid ${tokens.badgeCardBorder}`,
                        backgroundColor: tokens.badgeCardBg,
                      }}
                    >
                      <GeneratedBadgeLogo id={id} family="devotional" size={32} />
                      <span className="text-[9px] font-bold text-center leading-tight" style={{ color: tokens.badgeLabelColor }}>
                        {lang === "es" ? badge.labelEs : badge.label}
                      </span>
                      <span className="text-[8px] font-mono" style={{ color: tokens.badgeSectionLabel }}>
                        ✓ {t(lang, "family_earned")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 pb-2 text-center">
            <p className="text-xs leading-6" style={{ color: tokens.textFaint }}>
              {t(lang, "family_proverbs_quote")}
              <br />{t(lang, "family_proverbs_ref")}
            </p>
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
