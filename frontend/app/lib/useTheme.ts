"use client";

import { useEffect, useState } from "react";

export type Theme = "premium-neon" | "gold-navy" | "light-elegant" | "light-pink";

const THEME_KEY = "ryc-theme";
const VALID_THEMES: Theme[] = ["premium-neon", "gold-navy", "light-elegant", "light-pink"];

export const THEMES: Record<Theme, { label: string; emoji: string; desc: string; preview: string[] }> = {
  "premium-neon": {
    label: "Premium Neon",
    emoji: "💜",
    desc: "Deep black with neon purple & cyan",
    preview: ["#07080d", "#7c3aed", "#10141e", "#ede8ff"],
  },
  "gold-navy": {
    label: "Gold Navy",
    emoji: "✨",
    desc: "Dark navy with warm amber gold accents",
    preview: ["#0e1018", "#c9a961", "#1a1d27", "#ffffff"],
  },
  "light-elegant": {
    label: "Light Elegant",
    emoji: "☀️",
    desc: "Warm parchment with amber gold",
    preview: ["#f5f0e8", "#7c5c2e", "#ffffff", "#3d2b0e"],
  },
  "light-pink": {
    label: "Pink Blossom",
    emoji: "🌸",
    desc: "Soft floral pink with rose accents",
    preview: ["#fff0f5", "#9d174d", "#ffffff", "#6b1a3a"],
  },
};

function readThemeFromStorage(): Theme {
  if (typeof window === "undefined") return "premium-neon";
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  return saved && VALID_THEMES.includes(saved) ? saved : "gold-navy";
}

export function useTheme() {
  // Sync init from localStorage — no flash on first paint
  const [theme, setThemeState] = useState<Theme>(() => readThemeFromStorage());

  useEffect(() => {
    const active = readThemeFromStorage();
    localStorage.setItem(THEME_KEY, active);
    setThemeState(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
    // Notify same-window listeners (e.g. home page VotD card)
    window.dispatchEvent(new CustomEvent("ryc-theme-change", { detail: t }));
  }

  return { theme, setTheme };
}
