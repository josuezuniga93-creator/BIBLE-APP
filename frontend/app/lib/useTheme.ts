"use client";

import { useEffect, useState } from "react";

export type Theme = "midnight" | "ivory" | "lavender" | "sage" | "rose" | "slate" | "neon" | "premium-neon";

const THEME_KEY = "ryc-theme";

export const THEMES: Record<Theme, { label: string; emoji: string; desc: string; preview: string[] }> = {
  midnight: {
    label: "Midnight",
    emoji: "🌙",
    desc: "Deep dark — easy on the eyes",
    preview: ["#0f0f0f", "#7c3aed", "#1c1c1e", "#ffffff"],
  },
  ivory: {
    label: "Ivory",
    emoji: "☀️",
    desc: "Clean & professional light",
    preview: ["#f0f0f0", "#5b21b6", "#e8e4de", "#111111"],
  },
  lavender: {
    label: "Lavender Mist",
    emoji: "💜",
    desc: "Soft pastel purple",
    preview: ["#f3eeff", "#8b5cf6", "#ede8ff", "#2d1b69"],
  },
  sage: {
    label: "Sage Garden",
    emoji: "🌿",
    desc: "Calm pastel green",
    preview: ["#eef5ee", "#16a34a", "#e4f0e4", "#1a3a1a"],
  },
  rose: {
    label: "Rose Petal",
    emoji: "🌸",
    desc: "Warm pastel blush",
    preview: ["#fff0f4", "#db2777", "#fde8ee", "#3b1021"],
  },
  slate: {
    label: "Space Grey",
    emoji: "🩶",
    desc: "Dark space grey premium",
    preview: ["#2c2c2e", "#8e8e93", "#1c1c1e", "#f2f2f7"],
  },
  neon: {
    label: "Neon City",
    emoji: "⚡",
    desc: "Cyberpunk neon glow",
    preview: ["#050510", "#00ffff", "#06061a", "#e0f7ff"],
  },
  "premium-neon": {
    label: "Premium Neon",
    emoji: "💙",
    desc: "Deep navy with electric blue",
    preview: ["#080c13", "#3b82f6", "#10141e", "#eef2ff"],
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("midnight");

  useEffect(() => {
    const raw = localStorage.getItem(THEME_KEY);
    // migrate old "dark"/"light" values
    const migrated: Theme =
      raw === "dark" ? "midnight" :
      raw === "light" ? "ivory" :
      (raw && raw in THEMES) ? raw as Theme : "midnight";
    setThemeState(migrated);
    document.documentElement.setAttribute("data-theme", migrated);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return { theme, setTheme };
}
