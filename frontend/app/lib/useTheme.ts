"use client";

import { useEffect, useState } from "react";

export type Theme = "gold-navy" | "white-noir";

const THEME_KEY = "ryc-theme";
const VALID_THEMES: Theme[] = ["gold-navy", "white-noir"];

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

function readThemeFromCookie(): Theme | null {
  try {
    const m = document.cookie.match(/(?:^|;\s*)ryc-theme=([^;]+)/);
    if (m) {
      const val = decodeURIComponent(m[1]) as Theme;
      if (VALID_THEMES.includes(val)) return val;
    }
  } catch {}
  return null;
}

function readThemeFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && VALID_THEMES.includes(stored as Theme)) return stored as Theme;
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
    const fromHtml = document.documentElement.getAttribute("data-theme") as Theme;
    if (fromHtml && VALID_THEMES.includes(fromHtml)) return fromHtml;
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
      const t = (e as CustomEvent<Theme>).detail;
      setThemeState(t);
    }
    window.addEventListener("ryc-theme-change", handleChange);
    return () => window.removeEventListener("ryc-theme-change", handleChange);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    // Also persist to cookie so early script can restore after localStorage clear
    try { document.cookie = `${COOKIE_KEY}=${t};max-age=31536000;path=/;SameSite=Strict`; } catch {}
    document.documentElement.setAttribute("data-theme", t);
    window.dispatchEvent(new CustomEvent("ryc-theme-change", { detail: t }));
  }

  return { theme, setTheme };
}
