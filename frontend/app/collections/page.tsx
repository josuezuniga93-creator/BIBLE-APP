"use client";

import { useState, useEffect } from "react";
import {
  loadCollections, deleteCollection, renameCollection,
  COLLECTION_COLORS, COLLECTION_EMOJIS,
  type Collection, type SavedItem,
} from "../lib/collections";

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-4xl mb-5">
        🔖
      </div>
      <p className="text-base font-bold text-white/70 mb-2">No Collections Yet</p>
      <p className="text-sm text-white/30 max-w-xs leading-relaxed">
        Tap the bookmark icon on any section in the historic documents or free books library to save it here.
      </p>
    </div>
  );
}

// ─── Collection detail view ────────────────────────────────────────────────────

function CollectionDetail({ col, onClose, onUpdated }: { col: Collection; onClose: () => void; onUpdated: () => void }) {
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(col.name);
  const [emoji, setEmoji]       = useState(col.emoji);
  const [color, setColor]       = useState(col.color);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSaveEdit() {
    renameCollection(col.id, name.trim() || col.name, emoji, color);
    setEditing(false);
    onUpdated();
  }

  function handleDelete() {
    deleteCollection(col.id);
    onClose();
    onUpdated();
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#0f0f0f] flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/[0.07]">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.07] text-white/60 flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl">{col.emoji}</span>
          <p className="text-base font-bold text-white truncate">{col.name}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 text-white/50"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-5 py-4 border-b border-white/[0.07] space-y-3">
          {/* Emoji */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {COLLECTION_EMOJIS.map((e) => (
              <button key={e} onClick={() => setEmoji(e)}
                className="flex-shrink-0 w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: emoji === e ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", border: emoji === e ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent" }}>
                {e}
              </button>
            ))}
          </div>
          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          />
          {/* Colors */}
          <div className="flex gap-2">
            {COLLECTION_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: c, outline: color === c ? "2px solid white" : "none", outlineOffset: "2px" }} />
            ))}
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-red-400 border border-red-400/20">
                Delete Collection
              </button>
            ) : (
              <>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/50 border border-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600">Confirm Delete</button>
              </>
            )}
            <button onClick={handleSaveEdit}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: color }}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {col.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">{col.emoji}</p>
            <p className="text-sm text-white/40">This collection is empty.</p>
            <p className="text-xs text-white/25 mt-1">Bookmark sections and books to add them here.</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-2">
            <p className="text-[10px] font-black tracking-widest text-white/25 uppercase mb-3">
              {col.items.length} {col.items.length === 1 ? "item" : "items"}
            </p>
            {[...col.items].sort((a, b) => b.savedAt - a.savedAt).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: `${col.color}30` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5"
                      style={{ backgroundColor: `${col.color}20`, color: col.color }}
                    >
                      {item.type === "learn" ? "📜 Historic" : item.type === "book" ? "📖 Book" : "✝️ Verse"}
                    </span>
                    {item.subtitle && (
                      <p className="text-[10px] text-white/35 mb-0.5">{item.subtitle}</p>
                    )}
                    <p className="text-sm font-bold text-white/85 leading-snug">{item.title}</p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ backgroundColor: `${col.color}25` }}
                  >
                    {item.type === "learn" ? "📜" : item.type === "book" ? "📖" : "✝️"}
                  </div>
                </div>
                {item.preview && (
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2 mt-2 border-t border-white/[0.05] pt-2" style={{ fontFamily: "Georgia, serif" }}>
                    {item.preview}
                  </p>
                )}
                <p className="text-[9px] text-white/20 mt-2">
                  Saved {new Date(item.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Collection card ───────────────────────────────────────────────────────────

function CollectionCard({ col, onClick }: { col: Collection; onClick: () => void }) {
  const topItem = col.items.sort((a, b) => b.savedAt - a.savedAt)[0];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden border active:scale-[0.98] transition-transform text-left"
      style={{ backgroundColor: `${col.color}12`, borderColor: `${col.color}30` }}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: col.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{col.emoji}</span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${col.color}20`, color: col.color }}
          >
            {col.items.length}
          </span>
        </div>
        <p className="text-sm font-bold text-white/90 mb-0.5">{col.name}</p>
        {topItem ? (
          <p className="text-[10px] text-white/35 line-clamp-1">{topItem.title}</p>
        ) : (
          <p className="text-[10px] text-white/25">Empty</p>
        )}
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected]       = useState<Collection | null>(null);

  function refresh() {
    setCollections(loadCollections());
  }

  useEffect(() => { refresh(); }, []);

  const activeCol = selected ? collections.find((c) => c.id === selected.id) ?? null : null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold">Collections</h1>
        <p className="text-xs text-white/30 mt-0.5">Your saved sections, books, and verses</p>
      </div>

      {/* Grid */}
      <main className="max-w-lg mx-auto px-4 pb-24">
        {collections.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {collections.map((col) => (
              <CollectionCard key={col.id} col={col} onClick={() => setSelected(col)} />
            ))}
          </div>
        )}

        {collections.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
            <p className="text-sm font-bold text-white/40 mb-1">Add more to your collections</p>
            <p className="text-xs text-white/25 leading-relaxed">
              Tap the bookmark icon while reading any historic document or free book to save it here.
            </p>
          </div>
        )}
      </main>

      {/* Detail overlay */}
      {activeCol && (
        <CollectionDetail
          col={activeCol}
          onClose={() => setSelected(null)}
          onUpdated={refresh}
        />
      )}
    </div>
  );
}
