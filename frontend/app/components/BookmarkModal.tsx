"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadCollections, createCollection, toggleItem, collectionsContaining,
  COLLECTION_COLORS, COLLECTION_EMOJIS,
  type Collection, type SavedItem,
} from "../lib/collections";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";
import { t } from "../lib/i18n";
import { UiIcon, collectionIconName } from "./UiIcon";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BookmarkModalProps {
  item: Omit<SavedItem, "savedAt">;
  /** Human-readable reference shown in the modal header (e.g. "Westminster Confession — Chapter 1") */
  label: string;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BookmarkModal({ item, label, onClose }: BookmarkModalProps) {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const activeTheme = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) ?? theme;
  const light = activeTheme === "white-noir";
  const [collections, setCollections] = useState<Collection[]>([]);
  const [checkedIds, setCheckedIds]   = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState("");
  const [newEmoji, setNewEmoji]       = useState("book");
  const [newColor, setNewColor]       = useState(COLLECTION_COLORS[0]);
  const [toast, setToast]             = useState("");

  // Load on mount
  useEffect(() => {
    const cols = loadCollections();
    setCollections(cols);
    setCheckedIds(new Set(collectionsContaining(item.id)));
  }, [item.id]);

  function handleToggle(colId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) { next.delete(colId); } else { next.add(colId); }
      return next;
    });
  }

  function handleSave() {
    const cols = loadCollections();
    // For each collection, toggle to match checkedIds
    for (const col of cols) {
      const wasIn  = col.items.some((i) => i.id === item.id);
      const shouldBe = checkedIds.has(col.id);
      if (wasIn !== shouldBe) {
        toggleItem(col.id, item);
      }
    }
    const count = checkedIds.size;
    if (count > 0) {
      const col = cols.find((c) => checkedIds.has(c.id));
      setToast(`${t(lang, "bm_saved_to")} ${col?.name ?? ""}`);
      setTimeout(onClose, 900);
    } else {
      setToast(t(lang, "bm_removed"));
      setTimeout(onClose, 900);
    }
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const col = createCollection(newName.trim(), newEmoji, newColor);
    // Auto-check the new collection
    setCheckedIds((prev) => new Set([...prev, col.id]));
    setCollections(loadCollections());
    setShowCreate(false);
    setNewName("");
    setNewEmoji("book");
    setNewColor(COLLECTION_COLORS[0]);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-0 z-[401] flex items-start justify-center pt-16 px-4 pointer-events-none"
      >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden pointer-events-auto"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.10)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <p
            className="text-[10px] font-black tracking-widest uppercase mb-0.5"
            style={{ color: "rgba(0,0,0,0.30)" }}
          >
            {t(lang, "bm_save_to")}
          </p>
          <p
            className="text-sm font-bold leading-snug"
            style={{ fontFamily: "Georgia, serif", color: "rgba(10,10,10,0.85)" }}
          >
            {label}
          </p>
        </div>

        {/* Collection list */}
        <div className="overflow-y-auto flex-1">
          {collections.length === 0 && !showCreate && (
            <p
              className="text-center text-xs py-6"
              style={{ color: "rgba(0,0,0,0.30)" }}
            >
              {t(lang, "bm_no_collections")}
            </p>
          )}
          {collections.map((col) => {
            const checked = checkedIds.has(col.id);
            return (
              <button
                key={col.id}
                onClick={() => handleToggle(col.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors"
                style={{
                  borderLeft: checked ? `3px solid ${col.color}` : "3px solid transparent",
                  backgroundColor: "transparent",
                }}
              >
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${col.color}18`, color: col.color }}>
                  <UiIcon name={collectionIconName(col.emoji)} size={18} />
                </span>
                <div className="flex-1 text-left">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "rgba(10,10,10,0.85)" }}
                  >
                    {col.name}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "rgba(0,0,0,0.30)" }}
                  >
                    {col.items.length} {col.items.length === 1 ? t(lang, "col_item") : t(lang, "col_items")}
                  </p>
                </div>
                {/* Checkmark */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: checked ? col.color : "transparent",
                    border: checked ? `2px solid ${col.color}` : light ? "2px solid rgba(0,0,0,0.18)" : "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {checked && <UiIcon name="check" size={12} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}

          {/* New Collection form */}
          {showCreate && (
            <div
              className="px-5 py-4 space-y-3"
              style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
            >
              {/* Icon row */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {COLLECTION_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: newEmoji === e ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.04)",
                      border: newEmoji === e ? "1px solid rgba(0,0,0,0.25)" : "1px solid transparent",
                      color: newColor,
                    }}
                  >
                    <UiIcon name={collectionIconName(e)} size={17} />
                  </button>
                ))}
              </div>
              {/* Name input */}
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                placeholder={t(lang, "bm_col_name_placeholder")}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.10)",
                  color: "#0a0a0a",
                }}
              />
              {/* Color swatches */}
              <div className="flex gap-2">
                {COLLECTION_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className="w-6 h-6 rounded-full flex-shrink-0 transition-transform active:scale-90"
                    style={{
                      backgroundColor: c,
                      outline: newColor === c ? "2px solid #0a0a0a" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
              {/* Create / Cancel */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCreate(false); setNewName(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    color: "rgba(0,0,0,0.45)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  {t(lang, "bm_cancel")}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity"
                  style={{ backgroundColor: newColor, opacity: newName.trim() ? 1 : 0.4 }}
                >
                  {t(lang, "bm_create")}
                </button>
              </div>
            </div>
          )}

          {/* + New Collection row */}
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
              style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{
                  backgroundColor: "rgba(0,0,0,0.06)",
                  color: "rgba(0,0,0,0.45)",
                }}
              >
                +
              </div>
              <p
                className="text-sm font-bold"
                style={{ color: "rgba(0,0,0,0.45)" }}
              >
                {t(lang, "bm_new_collection")}
              </p>
            </button>
          )}
        </div>

        {/* Save button */}
        {!showCreate && (
          <div
            className="px-5 pt-3 pb-6"
            style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
          >
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl text-sm font-black transition-all active:scale-[0.98]"
              style={{
                background: "#e5e7eb",
                color: "#0a0a0a",
              }}
            >
              {toast || t(lang, "bm_save")}
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
