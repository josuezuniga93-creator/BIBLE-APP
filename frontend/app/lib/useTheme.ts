"use client";

import { useEffect, useState } from "react";

export type Theme = "premium-neon" | "light-elegant";

const THEME_KEY = "ryc-theme";
const VALID_THEMES: Theme[] = ["premium-neon", "light-elegant"];

export const THEMES: Record<Theme, { label: string; emoji: string; desc: string; preview: string[] }> = {
  "premium-neon": {
    label: "Premium Neon",
    emoji: "💜",
    desc: "Deep black with neon purple & cyan",
    preview: ["#07080d", "#7c3aed", "#10141e", "#ede8ff"],
  },
  "light-elegant": {
    label: "Light Elegant",
    emoji: "☀️",
    desc: "Warm parchment with amber gold",
    preview: ["#ede8df", "#9b7228", "#f5f1eb", "#1c1409"],
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("premium-neon");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const active = saved && VALID_THEMES.includes(saved) ? saved : "premium-neon";
    localStorage.setItem(THEME_KEY, active);
    setThemeState(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return { theme, setTheme };
}
