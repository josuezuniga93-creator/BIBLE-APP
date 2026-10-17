"use client";

import { useEffect, useState } from "react";
import { collectUnifiedHighlights } from "../../lib/unifiedHighlights";
import { syncKey } from "../../lib/cloudSync";

const keys = {
  version: "ryc-translation",
  "reader-settings": "tulip-reader-settings-v1",
  marks: "tulip-scripture-marks-v1",
};
export function useReaderStore(name, fallback) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(keys[name]);
      if (raw) {
        setValue(name === "version" ? raw : JSON.parse(raw));
        return;
      }
      if (name === "marks") {
        const marks = {};
        for (const mark of collectUnifiedHighlights().filter(
          (m) => m.source === "scripture",
        )) {
          const match = mark.id.match(/^scripture-(\d+)-(\d+)-(\d+)$/);
          if (match)
            marks[`${match[1]}:${match[2]}:${match[3]}`] = [
              "light",
              "medium",
              "underline",
            ].includes(mark.meta?.colorName)
              ? mark.meta.colorName
              : "light";
        }
        setValue(marks);
      }
    } catch {}
  }, [name]);
  const update = (next) => {
    const raw = name === "version" ? next : JSON.stringify(next);
    localStorage.setItem(keys[name], raw);
    syncKey(keys[name], raw).catch(() => {});
    setValue(next);
  };
  return [value, update];
}
