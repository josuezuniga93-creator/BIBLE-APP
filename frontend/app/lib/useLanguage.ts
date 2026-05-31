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

  // On mount: read language — check localStorage first (faster), then cookie
  useEffect(() => {
    try {
      const ls = localStorage.getItem("ryc-lang") as Lang | null;
      if (ls === "es" || ls === "en") { setLangState(ls); return; }
    } catch {}
    const stored = readLangFromCookie();
    setLangState(stored);
  }, []);

  // Re-trigger translation after every client-side navigation (Next.js SPA)
  // Fire multiple times to catch async-loaded content (API data, lazy sections)
  useEffect(() => {
    if (lang === "es") {
      const ids = [
        setTimeout(() => triggerGT(), 400),   // initial render
        setTimeout(() => triggerGT(), 1200),  // after fast API calls
        setTimeout(() => triggerGT(), 2500),  // after slower API calls
        setTimeout(() => triggerGT(), 5000),  // catch anything still loading
      ];
      return () => ids.forEach(clearTimeout);
    }
  }, [pathname, lang]);

  const setLang = useCallback((next: Lang) => {
    setGTCookie(next);
    try { localStorage.setItem("ryc-lang", next); } catch {}
    setLangState(next);
    if (next === "es") {
      // Re-trigger GT without a full reload so translation feels instant
      setTimeout(() => triggerGT(), 300);
    } else {
      // Reload is the only reliable way to clear Google Translate's DOM modifications
      window.location.reload();
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(lang, key),
    [lang]
  );

  return { lang, setLang, t };
}
