"use client";

import { useState, useCallback, useEffect } from "react";
import type { HistoryEntry } from "../lib/types";

const STORAGE_KEY = "ryc-history";
const MAX_ENTRIES = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved) as HistoryEntry[]);
    } catch {}
  }, []);

  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    } catch {}
  }, []);

  return { history, saveHistory };
}
