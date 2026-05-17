"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { type Lang, type TranslationKey, t as translate } from "./i18n";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setGTCookie(lang: Lang) {
  const value = lang === "es" ? "/en/es" : "/en/en";
  const exp = lang === "es" ? "" : `; expires=${new Date(0).toUTCString()}`;
  const host = window.location.hostname;
  // Set on both root and subdomain to cover all environments
  document.cookie = `googtrans=${value}; path=/${exp}`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}${exp}`;
  document.cookie = `googtrans=${value}; path=/; domain=.${host}${exp}`;
}

function readLangFromCookie(): Lang {
  if (typeof document === "undefined") return "en";
  return /googtrans=\/en\/es/.test(document.cookie) ? "es" : "en";
}

// ─── Google Translate trigger ─────────────────────────────────────────────────

function triggerGT(attempt = 0) {
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = "es";
    select.dispatchEvent(new Event("change"));
  } else if (attempt < 40) {
    // Widget not ready yet — retry every 250 ms (up to 10 s total)
    setTimeout(() => triggerGT(attempt + 1), 250);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>("en");
  const pathname = usePathname();

  // On mount: read language from cookie
  useEffect(() => {
    const stored = readLangFromCookie();
    setLangState(stored);
  }, []);

  // Re-trigger translation after every client-side navigation (Next.js SPA)
  useEffect(() => {
    if (lang === "es") {
      // Small delay to let React finish rendering the new page content
      const id = setTimeout(() => triggerGT(), 400);
      return () => clearTimeout(id);
    }
  }, [pathname, lang]);

  const setLang = useCallback((next: Lang) => {
    setGTCookie(next);
    // Hard reload so Google Translate reads the cookie cleanly before React hydrates
    window.location.reload();
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(lang, key),
    [lang]
  );

  return { lang, setLang, t };
}
