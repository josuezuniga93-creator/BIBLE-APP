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
} from "../lib/devotionalProgress";
import { localizeReference } from "../lib/spanishContent";
import { UiIcon } from "../components/UiIcon";

// ─── Theme ─────────────────────────────────────────────────────────────────────

type AppTheme = "default" | "premium-neon" | "gold-navy" | "light-pink" | "light-elegant" | "white-noir";

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
  if (theme === "white-noir") {
    return {
      rootBg: "#ffffff",
      cardBg: "#f3f4f6",
      cardBorder: "rgba(10,10,10,0.10)",
      cardShadow: "0 2px 12px rgba(10,10,10,0.05)",
      scriptureCardBg: "#ffffff",
      glowShadow: "none",
      accent: "#050505",
      accentDim: "#eef0f2",
      accentText: "#ffffff",
      labelColor: "#555555",
      textPrimary: "#0a0a0a",
      textSecondary: "rgba(10,10,10,0.70)",
      textMuted: "rgba(10,10,10,0.52)",
      textFaint: "rgba(10,10,10,0.34)",
      buttonBg: "#e5e7eb",
      buttonBorder: "rgba(10,10,10,0.12)",
      buttonText: "#0a0a0a",
      ctaText: "#ffffff",
      inputBg: "#f3f4f6",
      inputText: "#0a0a0a",
      toggleOffBg: "rgba(17,17,17,0.12)",
      divider: "rgba(17,17,17,0.10)",
      quoteBg: "#f3f4f6",
      blockquoteBorder: "#111111",
      toggleActive: "#050505",
      toastBg: "#ffffff",
      toastMuted: "rgba(17,17,17,0.60)",
      toastShadow: "0 10px 30px rgba(17,17,17,0.14)",
      dangerText: "#444444",
      dangerBg: "rgba(17,17,17,0.06)",
      successText: "#333333",
      pillBg: "rgba(17,17,17,0.07)",
      pillText: "#292929",
      badgeSectionBorder: "rgba(17,17,17,0.10)",
      badgeSectionBg: "#f3f4f6",
      badgeCardBorder: "rgba(17,17,17,0.12)",
      badgeCardBg: "#ffffff",
      badgeLabelColor: "#292929",
      badgeSectionLabel: "#555555",
    };
  }
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

const ThemeCtx = createContext<ThemeTokens>(buildTokens("white-noir"));
function useTheme() { return useContext(ThemeCtx); }

function readStoredAppTheme(): AppTheme {
  if (typeof window === "undefined") return "white-noir";
  // Check DOM attribute first — set by early script before React hydrates
  const dom = document.documentElement.getAttribute("data-theme") as AppTheme | null;
  if (dom === "white-noir" || dom === "gold-navy") return dom;
  try {
    const v = localStorage.getItem("ryc-theme");
    if (v === "white-noir" || v === "gold-navy") return v as AppTheme;
  } catch { /* ignore */ }
  return "white-noir";
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

const DEVOTIONAL_MOTION_STYLES = `
  .devotional-page-shell {
    min-height: 100vh;
    background:
      linear-gradient(180deg, #f5f1e9 0 228px, #fbfaf7 228px 100%);
    color: #171512;
  }

  .devotional-phone {
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    padding: 0 18px 118px;
  }

  .devotional-topbar {
    padding: 18px 6px 12px;
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr) 54px;
    gap: 16px;
    align-items: center;
    animation: devotional-settle 520ms cubic-bezier(.2,.9,.2,1) both;
  }

  .devotional-icon-button,
  .devotional-date-pill {
    border: 1px solid rgba(23, 21, 18, 0.1);
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 12px 28px rgba(53, 45, 35, 0.08);
  }

  .devotional-icon-button {
    width: 54px;
    height: 54px;
    border-radius: 20px;
    display: grid;
    place-items: center;
    color: #171512;
    font-size: 1.45rem;
    font-weight: 900;
    transition: transform 160ms ease, background-color 160ms ease;
  }

  .devotional-icon-button:active {
    transform: scale(.94);
    background: #fff;
  }

  .devotional-date-pill {
    min-height: 54px;
    border-radius: 24px;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) 30px;
    align-items: center;
    text-align: center;
    color: #716b63;
    font-size: .78rem;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .devotional-hero {
    padding: 18px 6px 0;
    animation: devotional-rise 650ms 70ms cubic-bezier(.2,.9,.2,1) both;
  }

  .devotional-eyebrow {
    margin: 0 0 10px;
    color: #6f7b4d;
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .devotional-title {
    margin: 0;
    max-width: 340px;
    color: #171512;
    font-family: ui-serif, Georgia, "Times New Roman", serif;
    font-size: clamp(3.1rem, 15vw, 4.45rem);
    line-height: .92;
    font-weight: 800;
    letter-spacing: 0;
  }

  .devotional-subtitle {
    margin: 16px 0 0;
    color: #716b63;
    font-size: 1.05rem;
    line-height: 1.45;
  }

  .devotional-progress-card {
    min-height: 84px;
    margin: 22px 6px 0;
    padding: 14px 15px;
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    border: 1px solid rgba(23, 21, 18, 0.08);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 18px 42px rgba(52, 43, 32, 0.08);
    animation: devotional-rise 680ms 170ms cubic-bezier(.2,.9,.2,1) both;
  }

  .devotional-ring {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    position: relative;
    background: conic-gradient(#a9782e var(--devotional-progress), #eee8dc 0);
  }

  .devotional-ring::after {
    content: "";
    position: absolute;
    inset: 7px;
    border-radius: 50%;
    background: #fff;
  }

  .devotional-ring span {
    position: relative;
    z-index: 1;
    color: #171512;
    font-size: .82rem;
    font-weight: 950;
  }

  .devotional-theme-label {
    margin: 0;
    overflow: hidden;
    color: #9a9389;
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .16em;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .devotional-theme-ref {
    margin: 5px 0 0;
    color: #171512;
    font-size: 1.25rem;
    line-height: 1.1;
    font-weight: 950;
  }

  .devotional-today-chip {
    min-height: 38px;
    padding: 10px 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 18px;
    background: #181512;
    color: #fff8ec;
    font-size: .78rem;
    font-weight: 950;
    transition: transform 160ms ease;
  }

  .devotional-today-chip:active {
    transform: scale(.96);
  }

  .devotional-flow {
    padding-top: 18px;
    display: grid;
    gap: 14px;
  }

  .devotional-motion-card {
    border: 1px solid rgba(23, 21, 18, 0.08);
    border-radius: 30px;
    background: #fff;
    box-shadow: 0 16px 40px rgba(54, 45, 34, 0.08);
    overflow: hidden;
    animation: devotional-rise 720ms cubic-bezier(.2,.9,.2,1) both;
    animation-delay: var(--motion-delay, 0ms);
  }

  .devotional-section-label {
    margin: 0;
    color: #4b6f82;
    font-size: .72rem;
    font-weight: 950;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .devotional-scripture-title {
    margin: 8px 0 15px;
    color: #171512;
    font-family: ui-serif, Georgia, "Times New Roman", serif;
    font-size: clamp(2.05rem, 10vw, 2.78rem);
    line-height: .96;
    font-weight: 800;
    letter-spacing: 0;
  }

  .devotional-quote-box {
    margin: 0;
    padding: 16px 16px 16px 18px;
    border-left: 4px solid #a9782e;
    border-radius: 22px;
    background: #f6f3ec;
    color: #423b33;
    font-family: ui-serif, Georgia, "Times New Roman", serif;
    font-size: 1.05rem;
    line-height: 1.62;
    overflow: hidden;
    position: relative;
  }

  .devotional-quote-box::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
    transform: translateX(-105%);
    animation: devotional-shine 1300ms 920ms ease-out both;
  }

  .devotional-scripture-ref {
    margin: 13px 0 0;
    color: #a9782e;
    font-size: .9rem;
    font-weight: 950;
  }

  .devotional-read-prompt {
    margin: 12px 0 0;
    color: #8b8379;
    font-size: .82rem;
    line-height: 1.5;
  }

  .devotional-tabs {
    height: 54px;
    padding: 5px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-radius: 22px;
    background: #ede8de;
    position: relative;
  }

  .devotional-tab-thumb {
    position: absolute;
    width: calc((100% - 10px) / 2);
    height: 44px;
    left: 5px;
    top: 5px;
    border-radius: 18px;
    background: #171512;
    box-shadow: 0 10px 20px rgba(23, 21, 18, 0.16);
    transform: translateX(var(--tab-shift, 0));
    transition: transform 260ms cubic-bezier(.2,.9,.2,1);
  }

  .devotional-tab {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: #716b63;
    font-size: .82rem;
    font-weight: 950;
  }

  .devotional-tab.is-active {
    color: #fff8ec;
  }

  .devotional-meditation-body {
    color: #4d463f;
    font-size: .98rem;
    line-height: 1.72;
    animation: devotional-reveal 680ms 150ms cubic-bezier(.2,.9,.2,1) both;
  }

  .devotional-action-chip {
    min-height: 38px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid rgba(81, 96, 68, 0.08);
    border-radius: 17px;
    background: #f0f4f1;
    color: #516044;
    font-size: .82rem;
    font-weight: 950;
  }

  .devotional-complete-button {
    width: 100%;
    min-height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border: 0;
    border-radius: 24px;
    background: #171512;
    color: #fff8ec;
    box-shadow: 0 18px 36px rgba(23, 21, 18, 0.22);
    font-size: .98rem;
    font-weight: 950;
    animation: devotional-cta 3200ms 1200ms ease-in-out infinite;
    transition: transform 160ms ease;
  }

  .devotional-complete-button:active {
    transform: scale(.98);
  }

  .devotional-check-badge {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: #a9782e;
    color: #fff;
  }

  @media (min-width: 768px) {
    .devotional-phone {
      padding-top: 18px;
    }
  }

  @keyframes devotional-rise {
    from { opacity: 0; transform: translateY(24px) scale(.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes devotional-settle {
    from { opacity: 0; transform: translateY(-14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes devotional-shine {
    to { transform: translateX(105%); }
  }

  @keyframes devotional-reveal {
    from { opacity: 0; clip-path: inset(0 0 100% 0); }
    to { opacity: 1; clip-path: inset(0); }
  }

  @keyframes devotional-cta {
    0%, 65%, 100% { transform: translateY(0) scale(1); }
    72% { transform: translateY(-3px) scale(1.015); }
    80% { transform: translateY(0) scale(1); }
  }
`;

function motionStyle(delay: string): React.CSSProperties {
  return { "--motion-delay": delay } as React.CSSProperties;
}

const RYLE_THEME_ES: Record<string, string> = {
  "The Eternal Word": "El Verbo Eterno",
  "The Witness and the Children of God": "El Testigo y los Hijos de Dios",
  "The Word Made Flesh": "El Verbo Hecho Carne",
  "Grace and Truth in Christ": "Gracia y Verdad en Cristo",
  "The Voice in the Wilderness": "La Voz en el Desierto",
  "The Lamb of God": "El Cordero de Dios",
  "Behold the Lamb": "He Aquí el Cordero",
  "Come and See": "Ven y Ve",
  "The First Sign": "La Primera Señal",
  "Zeal for the Father's House": "Celo por la Casa del Padre",
  "You Must Be Born Again": "Debes Nacer de Nuevo",
  "The Love of God in the Son": "El Amor de Dios en el Hijo",
  "He Must Increase": "Es Necesario que Él Crezca",
};

function familyThemeTitle(theme: string, lang: "en" | "es") {
  return lang === "es" ? RYLE_THEME_ES[theme] ?? theme : theme;
}

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
        <UiIcon name="sparkle" size={72} className="animate-pop-in text-current" />
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
    <article className="devotional-motion-card" style={motionStyle("280ms")}>
      <div className="px-5 pt-5 pb-5">
        <p className="devotional-section-label">
          {t(lang, "family_ryle_label")}
        </p>
        <h2 className="devotional-scripture-title">
          {localizeReference(entry.scripture.reference, lang)}
        </h2>
        <blockquote className="devotional-quote-box">
          <p className="whitespace-pre-line">
            {scriptureStatus === "loading" ? t(lang, "family_loading_passage") : scriptureText}
          </p>
        </blockquote>
        <p className="devotional-scripture-ref">
          {localizeReference(entry.scripture.reference, lang)} ·{" "}
          {scriptureStatus === "fallback"
            ? `${entry.scripture.translation} fallback`
            : lang === "es" ? "LBLA" : "ESV"}
        </p>
        <p className="devotional-read-prompt">
          {t(lang, "family_read_aloud_prompt")}
        </p>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {canShowFullCommentary && (
          <div
            className="devotional-tabs"
            style={{ "--tab-shift": showFullCommentary ? "100%" : "0" } as React.CSSProperties}
          >
            <span className="devotional-tab-thumb" />
            <button
              type="button"
              onClick={() => setShowFullCommentary(false)}
              className={`devotional-tab ${!showFullCommentary ? "is-active" : ""}`}
            >
              {t(lang, "family_meditation")}
            </button>
            <button
              type="button"
              onClick={() => setShowFullCommentary(true)}
              className={`devotional-tab ${showFullCommentary ? "is-active" : ""}`}
            >
              {t(lang, "family_full_commentary")}
            </button>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="devotional-section-label">
              {t(lang, "family_meditation")}
            </p>
            {canShowFullCommentary && (
              <p className="mt-1 text-xs font-semibold" style={{ color: "#9a9389" }}>
                {showFullCommentary ? t(lang, "family_full_commentary") : t(lang, "family_concise_reading")}
              </p>
            )}
          </div>
          {ryleAudioTracks.length > 0 && (
            <span className="devotional-action-chip">
              <UiIcon name="mic" size={15} />
              {t(lang, "family_listen")}
            </span>
          )}
        </div>

        <div className="space-y-4" key={`${entry.scripture.reference}-${showFullCommentary ? "full" : "short"}`}>
          {(translatedCommentary ?? meditationText).split("\n\n").map((para, i) => (
            <p key={i} className="devotional-meditation-body">
              {para}
            </p>
          ))}
        </div>
        {lang === "es" && translating && (
          <p className="mt-2 text-xs" style={{ color: tk.textFaint }}>
            Traduciendo al español...
          </p>
        )}
      </div>

      {ryleAudioTracks.length > 0 && (
        <div className="px-5 pb-5">
          <div className="rounded-[24px] border border-[#e5dfd3] bg-[#f8f6f1] p-4 space-y-3">
            <div>
              <p className="devotional-section-label">{t(lang, "family_read_aloud_label")}</p>
              <p className="mt-1 text-sm leading-6" style={{ color: "#716b63" }}>
                {t(lang, "family_ryle_audio_desc")}
              </p>
            </div>
            {ryleAudioTracks.map((track) => (
              <div key={track.url} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black" style={{ color: "#171512" }}>{track.title}</p>
                  <p className="text-xs font-semibold" style={{ color: "#9a9389" }}>{track.duration}</p>
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
        <p className="text-xs italic pt-4 border-t border-[#eee8dc]" style={{ color: "#9a9389" }}>
          {t(lang, "family_ryle_attribution")}
        </p>
      </div>
    </article>
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
      className="devotional-motion-card"
      style={motionStyle("590ms")}
    >
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #eee8dc" }}>
        <p className="flex items-center gap-2 devotional-section-label" style={{ color: "#a95d52", marginBottom: 10 }}>
          <UiIcon name="music" size={14} />
          {lang === "es" ? "Himno" : "Hymn"}
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#171512", lineHeight: 1.25 }}>
              {hymnTitle}
            </p>
            <p className="mt-1" style={{ fontSize: "0.78rem", color: "#9a9389" }}>
              {hymnAuthor} · {hymnYear}
            </p>
          </div>
          <button
            onClick={() => setAudioOpen(!audioOpen)}
            className="devotional-action-chip active:scale-95 transition-all"
          >
            {audioOpen ? t(lang, "family_close") : t(lang, "family_listen")}
          </button>
        </div>
      </div>

      {audioOpen && (
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #eee8dc" }}>
          <p className="text-xs mb-3 leading-5" style={{ color: "#716b63" }}>
            {lang === "es"
              ? "Busca este himno en YouTube para cantarlo en familia."
              : "Tap below to find this hymn on YouTube and sing along as a family."}
          </p>
          <a
            href={hymnYouTubeUrl(hymnTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[20px] border active:scale-95 transition-all"
            style={{ backgroundColor: "rgba(255,0,0,0.07)", borderColor: "rgba(255,0,0,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#423b33" }}>{hymnTitle}</p>
              <p className="text-xs mt-0.5" style={{ color: "#716b63" }}>{t(lang, "family_open_youtube")}</p>
            </div>
          </a>
        </div>
      )}

      <div className="px-5 py-5">
        {spanishVerses ? (
          <div className="space-y-6">
            {spanishVerses.map((verse, i) => (
              <div key={i}>
                <p style={{ ...LABEL_STYLE, color: "#9a9389", marginBottom: 8 }}>
                  Estrofa {i + 1}
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: "#4d463f", whiteSpace: "pre-line" }}>
                  {verse}
                </p>
              </div>
            ))}
          </div>
        ) : lyrics ? (
          <div className="space-y-6">
            {lyrics.verses.map((verse, i) => (
              <div key={i}>
                <p style={{ ...LABEL_STYLE, color: "#9a9389", marginBottom: 8 }}>
                  {t(lang, "family_verse_label")} {i + 1}
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: "#4d463f", whiteSpace: "pre-line" }}>
                  {verse}
                </p>
              </div>
            ))}
            {lyrics.chorus && (
              <div className="pt-5" style={{ borderTop: "1px solid #eee8dc" }}>
                <p style={{ ...LABEL_STYLE, color: "#9a9389", marginBottom: 8 }}>
                  {t(lang, "family_chorus_label")}
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: "#4d463f", whiteSpace: "pre-line" }}>
                  {lyrics.chorus}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", color: "#716b63" }}>
            {entry.hymn.firstLine ? `"${entry.hymn.firstLine}…"` : "See The Baptist Hymnal for full text."}
          </p>
        )}
        <p className="mt-5 text-xs" style={{ color: "#9a9389" }}>
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
      className="devotional-motion-card"
      style={motionStyle("700ms")}
    >
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #eee8dc" }}>
        <p className="devotional-section-label" style={{ color: "#6f7b4d", marginBottom: 8 }}>{t(lang, "family_prayer_label")}</p>
        <p style={{ fontSize: "1.05rem", fontWeight: 900, color: "#171512" }}>{t(lang, "family_prayer_title")}</p>
        <p className="mt-1" style={{ fontSize: "0.82rem", lineHeight: 1.55, color: "#716b63" }}>
          {t(lang, "family_prayer_sub")}
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {items.length === 0 && !adding && (
          <p className="text-sm italic text-center py-3" style={{ color: "#9a9389" }}>
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
                style={{ backgroundColor: "#fbfaf7", color: "#171512", border: "1px solid #e5dfd3" }}
              />
              <div className="flex flex-col gap-1.5 pt-0.5">
                <button onClick={commitEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95" style={{ backgroundColor: "#f0f4f1", color: "#516044", border: "1px solid #dfe6dc" }}>{t(lang, "family_save")}</button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95" style={{ color: "#716b63", border: "1px solid #eee8dc" }}>{t(lang, "family_cancel")}</button>
              </div>
            </div>
          ) : (
            <div key={item.id} className="flex items-start gap-3 group">
              <div className="flex-shrink-0 mt-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0f4f1", border: "1px solid #dfe6dc" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#6f7b4d" }} />
              </div>
              <p className="flex-1 text-sm leading-7" style={{ color: "#4d463f" }}>{item.text}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                <button onClick={() => startEdit(item)} className="w-6 h-6 flex items-center justify-center rounded-lg active:scale-90 transition-all" style={{ color: "#6f7b4d", backgroundColor: "#f0f4f1" }} title="Edit">
                  <UiIcon name="edit" size={13} />
                </button>
                <button onClick={() => deleteItem(item.id)} className="w-6 h-6 flex items-center justify-center rounded-lg active:scale-90 transition-all" style={{ color: "#a95d52", backgroundColor: "#fbf1ef" }} title="Remove">
                  <UiIcon name="close" size={13} />
                </button>
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
              style={{ backgroundColor: "#fbfaf7", color: "#171512", border: "1px solid #e5dfd3" }}
            />
            <div className="flex flex-col gap-1.5 pt-0.5">
              <button onClick={addItem} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95" style={{ backgroundColor: "#f0f4f1", color: "#516044", border: "1px solid #dfe6dc" }}>{t(lang, "family_add")}</button>
              <button onClick={() => { setAdding(false); setDraft(""); }} className="px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95" style={{ color: "#716b63", border: "1px solid #eee8dc" }}>{t(lang, "family_cancel")}</button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <div className="px-5 pb-5">
          <button
            onClick={() => setAdding(true)}
            className="w-full py-3 rounded-[20px] text-sm font-black active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: "#f0f4f1", border: "1px solid #dfe6dc", color: "#516044" }}
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
  onComplete: () => void;
}) {
  const { lang } = useLanguage();
  const [done, setDone] = useState(false);

  useEffect(() => { setDone(isDevotionalComplete(dateStr)); }, [dateStr]);

  function handleComplete() {
    markDevotionalComplete(dateStr);
    setDone(true);
    onComplete();
  }

  if (done) {
    if (isToday) {
      const [y, mo, day] = dateStr.split("-").map(Number);
      const tomorrow = new Date(y, mo - 1, day + 1);
      return (
        <div
          className="devotional-motion-card text-center px-6 py-9"
          style={motionStyle("820ms")}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ backgroundColor: "#f0f4f1", border: "1px solid #6f7b4d", color: "#516044" }}
          >
            <UiIcon name="check" size={28} strokeWidth={3} />
          </div>
          <p style={{ fontSize: "1.05rem", fontWeight: 900, color: "#171512" }}>
            {t(lang, "family_completed_title")}
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "#716b63" }}>
            {t(lang, "family_completed_msg")}
          </p>
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid #eee8dc" }}>
            <p style={{ ...LABEL_STYLE, color: "#9a9389", marginBottom: 4 }}>{t(lang, "family_come_back_tomorrow")}</p>
            <p className="text-sm font-black" style={{ color: "#4d463f" }}>
              {formatDateShort(tomorrow, lang)}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div
        className="devotional-motion-card flex items-center gap-4 px-5 py-4"
        style={motionStyle("820ms")}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: "#f0f4f1", color: "#516044" }}>
          <UiIcon name="check" size={22} strokeWidth={3} />
        </div>
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 900, color: "#171512" }}>{t(lang, "family_completed_title")}</p>
          <p className="text-xs mt-0.5" style={{ color: "#9a9389" }}>{t(lang, "family_completed_msg")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="devotional-motion-card text-center px-6 py-8"
      style={motionStyle("820ms")}
    >
      <div className="flex items-center justify-center mb-4">
        <span className="devotional-check-badge">
          <UiIcon name="check" size={16} strokeWidth={3} />
        </span>
      </div>
      <p style={{ fontSize: "1rem", fontWeight: 900, color: "#171512" }}>
        {t(lang, "family_did_complete")}
      </p>
      <p className="text-sm mt-2 leading-6" style={{ color: "#716b63" }}>
        {t(lang, "family_complete_check")}
      </p>
      <button
        onClick={handleComplete}
        className="devotional-complete-button mt-5"
        type="button"
      >
        <span className="devotional-check-badge">
          <UiIcon name="check" size={16} strokeWidth={3} />
        </span>
        {t(lang, "family_yes_completed")}
      </button>
    </div>
  );
}

// ─── Daily Reminder Card ──────────────────────────────────────────────────────

const REMINDER_KEY = "axiom-fw-reminder";

function ReminderCard() {
  const { lang } = useLanguage();
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
      className="devotional-motion-card px-5 py-5 space-y-4"
      style={motionStyle("940ms")}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="devotional-section-label" style={{ color: "#4b6f82", marginBottom: 8 }}>{t(lang, "family_daily_reminder")}</p>
          <p className="text-xs mt-0.5" style={{ color: "#716b63" }}>{t(lang, "family_reminder_desc")}</p>
        </div>
        <button
          onClick={handleToggle}
          className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
          style={{ backgroundColor: enabled ? "#171512" : "#ede8de" }}
          type="button"
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <p style={{ ...LABEL_STYLE, color: "#9a9389" }}>{t(lang, "family_reminder_time")}</p>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: "#fbfaf7", color: "#171512", border: "1px solid #e5dfd3" }}
            />
            <span className="text-sm font-black flex-shrink-0" style={{ color: "#a9782e" }}>{displayTime}</span>
          </div>
          {permissionState === "denied" && (
            <p className="text-xs" style={{ color: "#a95d52" }}>{t(lang, "family_notif_blocked")}</p>
          )}
          {saved && <p className="text-xs" style={{ color: "#516044" }}>{t(lang, "family_reminder_saved")}</p>}
          <p className="text-[11px] leading-relaxed" style={{ color: "#9a9389" }}>
            {t(lang, "family_notif_note")}
          </p>
        </div>
      )}
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
  const [heroProgress, setHeroProgress] = useState(72);

  // Must match the SSR value ("white-noir" — what readStoredAppTheme returns
  // when window is undefined). A lazy client-side read here caused a hydration
  // mismatch: React kept the stale dark server HTML, so Light Mode never
  // applied to this page. The mount effect below applies the real theme.
  const [appTheme, setAppTheme] = useState<AppTheme>("white-noir");

  useEffect(() => {
    setAppTheme(readStoredAppTheme());
    function onThemeChange() { setAppTheme(readStoredAppTheme()); }
    window.addEventListener("ryc-theme-change", onThemeChange);
    return () => window.removeEventListener("ryc-theme-change", onThemeChange);
  }, []);

  const tokens = useMemo(() => buildTokens(appTheme), [appTheme]);

  // Always start on today — never restore a persisted date on mount.
  // (Navigation within a session still saves to localStorage via goToDate,
  //  but a fresh page load / refresh always shows today's devotional.)

  function goToDate(d: Date) {
    setSelectedDate(d);
    try { localStorage.setItem("axiom-fw-date", d.toISOString()); } catch { /**/ }
  }

  function goToToday() {
    setSelectedDate(today);
    try { localStorage.removeItem("axiom-fw-date"); } catch { /**/ }
  }

  const handleComplete = useCallback(() => {
    setHeroProgress(100);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  }, []);

  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth()    === today.getMonth() &&
    selectedDate.getDate()     === today.getDate();

  const dailyEntry = getDevotionalForDate(selectedDate);
  const dateStr    = toDateStr(selectedDate);

  useEffect(() => {
    setHeroProgress(isDevotionalComplete(dateStr) ? 100 : 72);
  }, [dateStr]);

  return (
    <ThemeCtx.Provider value={tokens}>
      <style>{DEVOTIONAL_MOTION_STYLES}</style>
      <div className="devotional-page-shell">
        {showConfetti && <ConfettiOverlay />}

        <main className="devotional-phone">
          <nav className="devotional-topbar" aria-label="Devotional date navigation">
            <button
              onClick={() => goToDate(addDays(selectedDate, -1))}
              aria-label="Previous day"
              className="devotional-icon-button"
              type="button"
            >
              ‹
            </button>
            <div className="devotional-date-pill" aria-label={formatDateShort(selectedDate, lang)}>
              <span>‹</span>
              <span>
                {selectedDate.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>›</span>
            </div>
            <div className="devotional-icon-button" aria-label="Current language">
              {lang.toUpperCase()}
            </div>
          </nav>

          <header className="devotional-hero">
            <p className="devotional-eyebrow">{t(lang, "family_worship_pill")}</p>
            <h1 className="devotional-title">
              {lang === "es" ? "Devocional de Hoy" : "Today’s Devotional"}
            </h1>
            <p className="devotional-subtitle">
              {lang === "es"
                ? "Escritura, meditación, himno y oración reunidos en un ritmo diario tranquilo."
                : "Scripture, meditation, hymn, and prayer gathered into one quiet daily rhythm."}
            </p>
          </header>

          {dailyEntry ? (
            <>
              <section className="devotional-progress-card" aria-label="Devotional progress">
                {isToday ? (
                  <div
                    className="devotional-ring"
                    style={{ "--devotional-progress": `${heroProgress}%` } as React.CSSProperties}
                  >
                    <span>{heroProgress}%</span>
                  </div>
                ) : (
                  <div
                    className="devotional-ring"
                    style={{ "--devotional-progress": "45%" } as React.CSSProperties}
                  >
                    <span>45%</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="devotional-theme-label">
                    {familyThemeTitle(dailyEntry.theme, lang)}
                  </p>
                  <p className="devotional-theme-ref">
                    {localizeReference(dailyEntry.scripture.reference, lang)}
                  </p>
                  {dailyEntry.displayDate && (
                    <p className="mt-1 text-xs font-bold" style={{ color: "#9a9389" }}>
                      {lang === "es"
                        ? dailyEntry.displayDate.replace(/^Reading (\d+) of (\d+)$/, (_, n, total) =>
                            `${t(lang, "family_reading_label")} ${n} ${t(lang, "family_reading_of")} ${total}`)
                        : dailyEntry.displayDate}
                    </p>
                  )}
                </div>
                {isToday ? (
                  <span className="devotional-today-chip">
                    {t(lang, "family_today")}
                  </span>
                ) : (
                  <button
                    onClick={goToToday}
                    className="devotional-today-chip"
                    type="button"
                  >
                    {t(lang, "family_back_today")}
                  </button>
                )}
              </section>

              <div className="devotional-flow">
                <ScriptureAndDevotionalCard entry={dailyEntry} />
                <HymnCard entry={dailyEntry} />
                <PrayerCard />
                <CompletionCard dateStr={dateStr} isToday={isToday} onComplete={handleComplete} />
                <ReminderCard />
              </div>
            </>
          ) : (
            <div
              className="devotional-motion-card p-8 text-center mt-6"
              style={motionStyle("220ms")}
            >
              <div className="flex items-center justify-center mb-3">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <p className="font-black mb-1" style={{ color: "#171512" }}>
                {t(lang, "family_no_devotional")}
              </p>
              <p className="text-sm leading-6" style={{ color: "#716b63" }}>
                {t(lang, "family_no_devotional_sub")}
              </p>
              <button
                onClick={goToToday}
                className="mt-5 devotional-today-chip"
                type="button"
              >
                {t(lang, "family_go_today")}
              </button>
            </div>
          )}

          <div className="pt-2 pb-2 text-center">
            <p className="text-xs leading-6" style={{ color: "#9a9389" }}>
              {t(lang, "family_proverbs_quote")}
              <br />{t(lang, "family_proverbs_ref")}
            </p>
          </div>
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}
