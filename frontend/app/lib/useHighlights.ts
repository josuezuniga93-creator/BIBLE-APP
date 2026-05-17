"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type Highlight,
  type HLColor,
  loadHighlights,
  saveHighlights,
} from "./highlights";

export interface SelectionAnchor {
  text: string;
  x: number; // center-x of selection rect (viewport coords)
  y: number; // top-y of selection rect (viewport coords)
}

export function useHighlights(context: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selection, setSelection] = useState<SelectionAnchor | null>(null);

  // Load on context change
  useEffect(() => {
    setHighlights(loadHighlights(context));
    setSelection(null);
  }, [context]);

  // Detect mouse-up text selection anywhere on the page
  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      // Small delay so the selection is finalised before we read it
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim() ?? "";
        if (text.length >= 3 && sel && sel.rangeCount > 0) {
          const rect = sel.getRangeAt(0).getBoundingClientRect();
          setSelection({
            text,
            x: rect.left + rect.width / 2,
            y: rect.top, // toolbar appears above
          });
        } else {
          setSelection(null);
        }
      }, 10);
    };

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  const addHighlight = useCallback(
    (color: HLColor) => {
      if (!selection) return;
      const hl: Highlight = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: selection.text,
        color,
        createdAt: Date.now(),
      };
      const next = [...highlights, hl];
      setHighlights(next);
      saveHighlights(context, next);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    },
    [context, highlights, selection]
  );

  const removeHighlight = useCallback(
    (id: string) => {
      const next = highlights.filter((h) => h.id !== id);
      setHighlights(next);
      saveHighlights(context, next);
    },
    [context, highlights]
  );

  const dismissSelection = useCallback(() => setSelection(null), []);

  return { highlights, selection, addHighlight, removeHighlight, dismissSelection };
}
