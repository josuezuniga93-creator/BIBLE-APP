"use client";
import { useState, useEffect } from "react";
import { getCategories, addCategory, saveBookmark } from "../lib/bookmarks";
import { useTheme } from "../lib/useTheme";

interface Props {
  ref_: string;
  text: string;
  lang: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function BookmarkPopup({ ref_, text, lang, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const isLight = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) === "white-noir" || theme === "white-noir";

  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [newCat, setNewCat] = useState("");
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
    setSelected(cats[0] ?? "General");
  }, []);

  function handleSave() {
    const category = mode === "new" ? newCat.trim() || "General" : selected;
    if (mode === "new" && newCat.trim()) addCategory(newCat.trim());
    saveBookmark({ ref: ref_, text, category, date: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 900);
  }

  return (
    <>
      {/* Backdrop — tapping closes */}
      <div
        className="fixed inset-0 z-[70]"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      {/* Popup card */}
      <div
        className="fixed z-[80] left-4 right-4 rounded-2xl p-4"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 16px) + 80px)",
          background: isLight ? "#ffffff" : "#0f1016",
          border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.25)",
          boxShadow: isLight ? "0 -4px 32px rgba(0,0,0,0.12)" : "0 -4px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>
            {lang === "es" ? "Guardar en categoría" : "Save to category"}
          </span>
          <button onClick={onClose} className="text-[18px]" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.4)" }}>×</button>
        </div>

        {/* Verse preview */}
        <p className="text-[11px] italic mb-3 leading-snug" style={{
          color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.45)",
          borderLeft: isLight ? "2px solid rgba(0,0,0,0.20)" : "2px solid rgba(201,169,97,0.4)",
          paddingLeft: 8,
        }}>
          {ref_} — {text.length > 80 ? text.slice(0, 80) + "…" : text}
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("pick")}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{
              background: mode === "pick"
                ? (isLight ? "rgba(0,0,0,0.12)" : "rgba(201,169,97,1)")
                : (isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)"),
              color: mode === "pick"
                ? (isLight ? "#0a0a0a" : "#08090f")
                : (isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)"),
            }}
          >
            {lang === "es" ? "Categoría existente" : "Existing"}
          </button>
          <button
            onClick={() => setMode("new")}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{
              background: mode === "new"
                ? (isLight ? "rgba(0,0,0,0.12)" : "rgba(201,169,97,1)")
                : (isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)"),
              color: mode === "new"
                ? (isLight ? "#0a0a0a" : "#08090f")
                : (isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)"),
            }}
          >
            {lang === "es" ? "+ Nueva categoría" : "+ New category"}
          </button>
        </div>

        {/* Pick existing */}
        {mode === "pick" && (
          <div className="flex flex-col gap-1.5 mb-3 max-h-36 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className="text-left rounded-xl px-3 py-2 text-[12px] font-medium"
                style={{
                  background: selected === cat
                    ? (isLight ? "rgba(0,0,0,0.08)" : "rgba(201,169,97,0.15)")
                    : (isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"),
                  border: selected === cat
                    ? (isLight ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(201,169,97,0.4)")
                    : "1px solid transparent",
                  color: selected === cat
                    ? (isLight ? "#0a0a0a" : "rgba(201,169,97,1)")
                    : (isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.7)"),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* New category input */}
        {mode === "new" && (
          <input
            autoFocus
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder={lang === "es" ? "Nombre de categoría..." : "Category name..."}
            className="w-full rounded-xl px-3 py-2.5 mb-3 text-[13px]"
            style={{
              background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)",
              border: isLight ? "1px solid rgba(0,0,0,0.15)" : "1px solid rgba(201,169,97,0.2)",
              color: isLight ? "#0a0a0a" : "#fff",
              outline: "none",
              fontSize: "16px",
            }}
          />
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full rounded-xl py-2.5 text-[13px] font-bold"
          style={{
            background: isLight ? "rgba(0,0,0,0.12)" : "rgba(201,169,97,1)",
            color: isLight ? "#0a0a0a" : "#08090f",
          }}
        >
          {saved ? "Saved!" : (lang === "es" ? "Guardar" : "Save")}
        </button>
      </div>
    </>
  );
}
