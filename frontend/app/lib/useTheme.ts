"use client";

import { useEffect, useState } from "react";

export type Theme = "gold-navy" | "white-noir";
export type ThemeAlias = "dark" | "light";
export type ThemeInput = Theme | ThemeAlias | string | null | undefined;

const THEME_KEY = "ryc-theme";
const VALID_THEMES: Theme[] = ["gold-navy", "white-noir"];
const THEME_ALIASES: Record<ThemeAlias, Theme> = {
  dark: "gold-navy",
  light: "white-noir",
};

export const THEMES: Record<Theme, { label: string; emoji: string; desc: string; preview: string[] }> = {
  "gold-navy": {
    label: "Dark Mode",
    emoji: "✨",
    desc: "Dark navy with warm amber gold accents",
    preview: ["#0e1018", "#c9a961", "#1a1d27", "#ffffff"],
  },
  "white-noir": {
    label: "Light Mode",
    emoji: "◻️",
    desc: "Clean white with black ink — premium monochrome",
    preview: ["#ffffff", "#0a0a0a", "#f7f7f7", "#0a0a0a"],
  },
};

const COOKIE_KEY = "ryc-theme";

export function normalizeTheme(value: ThemeInput): Theme {
  if (value === "dark" || value === "light") return THEME_ALIASES[value];
  if (value && VALID_THEMES.includes(value as Theme)) return value as Theme;
  return "white-noir";
}

export function themeAlias(value: ThemeInput): ThemeAlias {
  return normalizeTheme(value) === "white-noir" ? "light" : "dark";
}

export function isLightTheme(value: ThemeInput): boolean {
  return normalizeTheme(value) === "white-noir";
}

export function isDarkTheme(value: ThemeInput): boolean {
  return normalizeTheme(value) === "gold-navy";
}

function readThemeFromCookie(): Theme | null {
  try {
    const m = document.cookie.match(/(?:^|;\s*)ryc-theme=([^;]+)/);
    if (m) {
      return normalizeTheme(decodeURIComponent(m[1]) as ThemeInput);
    }
  } catch {}
  return null;
}

function readThemeFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return normalizeTheme(stored as ThemeInput);
    // Fallback: read from cookie and restore to localStorage
    const fromCookie = readThemeFromCookie();
    if (fromCookie) {
      localStorage.setItem(THEME_KEY, fromCookie);
      return fromCookie;
    }
  } catch {}
  return "white-noir";
}

function readThemeEarly(): Theme {
  // Called during client-side lazy init — data-theme is already set by the
  // inline <head> script before React hydrates, so check it first.
  if (typeof window === "undefined") return "white-noir";
  try {
    const fromHtml = document.documentElement.getAttribute("data-theme") as ThemeInput;
    if (fromHtml) return normalizeTheme(fromHtml);
  } catch {}
  return readThemeFromStorage();
}

export function useTheme() {
  // IMPORTANT: the initial state must be deterministic and identical to what
  // the server rendered ("white-noir" is the SSR default). Reading the real
  // theme lazily here caused hydration mismatches: React silently keeps the
  // stale server-rendered inline styles when the first client render differs
  // from SSR, leaving pages stuck in the wrong theme until a manual toggle.
  // The real theme is applied in the mount effect below, which triggers a
  // proper re-render with real DOM writes.
  const [theme, setThemeState] = useState<Theme>("white-noir");

  useEffect(() => {
    // Re-read on mount to ensure sync with storage (handles any edge cases)
    const active = readThemeEarly();
    setThemeState(active);
    document.documentElement.setAttribute("data-theme", active);

    // Re-apply whenever another component calls setTheme()
    function handleChange(e: Event) {
      const t = normalizeTheme((e as CustomEvent<ThemeInput>).detail);
      setThemeState(t);
    }
    window.addEventListener("ryc-theme-change", handleChange);
    return () => window.removeEventListener("ryc-theme-change", handleChange);
  }, []);

  function setTheme(themeInput: ThemeInput) {
    const t = normalizeTheme(themeInput);
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    // Also persist to cookie so early script can restore after localStorage clear
    try { document.cookie = `${COOKIE_KEY}=${t};max-age=31536000;path=/;SameSite=Strict`; } catch {}
    document.documentElement.setAttribute("data-theme", t);
    window.dispatchEvent(new CustomEvent("ryc-theme-change", { detail: t }));
  }

  return { theme, setTheme };
}
