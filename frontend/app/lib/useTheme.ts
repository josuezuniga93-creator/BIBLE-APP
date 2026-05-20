"use client";

import { useEffect, useState } from "react";

export type Theme = "premium-neon";

const THEME_KEY = "ryc-theme";

export const THEMES: Record<Theme, { label: string; emoji: string; desc: string; preview: string[] }> = {
  "premium-neon": {
    label: "Premium Neon",
    emoji: "💙",
    desc: "Deep black with neon purple & cyan",
    preview: ["#07080d", "#7c3aed", "#10141e", "#ede8ff"],
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("premium-neon");

  useEffect(() => {
    // Always use premium-neon; clear any old saved theme
    localStorage.setItem(THEME_KEY, "premium-neon");
    setThemeState("premium-neon");
    document.documentElement.setAttribute("data-theme", "premium-neon");
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return { theme, setTheme };
}
