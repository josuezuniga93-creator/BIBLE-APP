"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const THEME_KEY = "ryc-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const resolved = stored ?? "dark";
    setThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return { theme, setTheme };
}
