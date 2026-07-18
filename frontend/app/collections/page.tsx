"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SYNC_COMPLETE_EVENT } from "../lib/cloudSync";
import {
  COLLECTION_COLORS,
  COLLECTION_EMOJIS,
  deleteCollection,
  loadCollections,
  renameCollection,
  type Collection,
  type SavedItem,
} from "../lib/collections";
import { getBookmarks, removeBookmark as removeBookmarkById, type Bookmark } from "../lib/bookmarks";
import {
  collectUnifiedHighlights,
  deleteUnifiedHighlight,
  type UnifiedHighlight,
  type UnifiedHighlightSource,
} from "../lib/unifiedHighlights";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";
import { UiIcon, collectionIconName } from "../components/UiIcon";

type CollectionsTab = "highlights" | "collections" | "bookmarks";

const SOURCE_FILTERS: Array<{ key: "all" | UnifiedHighlightSource; en: string; es: string }> = [
  { key: "all", en: "All", es: "Todo" },
  { key: "scripture", en: "Scripture", es: "Biblia" },
  { key: "study-tools", en: "Study Tools", es: "Estudio" },
  { key: "free-books", en: "Free Books", es: "Libros" },
  { key: "historical-documents", en: "Historical Docs", es: "Historia" },
];

const COPY = {
  en: {
    eyebrow: "Your Pocket",
    title: "Collections",
    subtitle: "Highlights, bookmarks, and saved reading in one clean place.",
    highlights: "Highlights",
    collections: "Collections",
    bookmarks: "Bookmarks",
    search: "Search highlights...",
    noHighlights: "No highlights yet",
    noHighlightsSub: "Highlight Scripture, Study Tools, books, or documents and they will appear here.",
    noCollections: "No collections yet",
    noCollectionsSub: "Use Save to Collection on books and documents to build your library.",
    noBookmarks: "No bookmarks yet",
    noBookmarksSub: "Save verses from Scripture and they will appear here by category.",
    delete: "Delete",
    cancel: "Cancel",
    deleteHighlight: "Delete highlight?",
    deleteHighlightSub: "This removes it from its original reader and from your unified highlights.",
    savedItems: "saved items",
    saved: "Saved",
    open: "Open",
    edit: "Edit",
    done: "Done",
    save: "Save",
    deleteCollection: "Delete collection",
    confirmDelete: "Confirm delete",
    emptyCollection: "This collection is empty.",
  },
  es: {
    eyebrow: "Tu Bolsillo",
    title: "Colecciones",
    subtitle: "Resaltados, marcadores y lecturas guardadas en un solo lugar.",
    highlights: "Resaltados",
    collections: "Colecciones",
    bookmarks: "Marcadores",
    search: "Buscar resaltados...",
    noHighlights: "Aún no hay resaltados",
    noHighlightsSub: "Resalta Biblia, herramientas, libros o documentos y aparecerán aquí.",
    noCollections: "Aún no hay colecciones",
    noCollectionsSub: "Usa Guardar en colección en libros y documentos para formar tu biblioteca.",
    noBookmarks: "Aún no hay marcadores",
    noBookmarksSub: "Guarda versículos desde Biblia y aparecerán aquí por categoría.",
    delete: "Eliminar",
    cancel: "Cancelar",
    deleteHighlight: "¿Eliminar resaltado?",
    deleteHighlightSub: "Esto lo elimina del lector original y de tus resaltados unificados.",
    savedItems: "guardados",
    saved: "Guardado",
    open: "Abrir",
    edit: "Editar",
    done: "Listo",
    save: "Guardar",
    deleteCollection: "Eliminar colección",
    confirmDelete: "Confirmar",
    emptyCollection: "Esta colección está vacía.",
  },
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function sourceTitle(source: UnifiedHighlightSource, lang: "en" | "es") {
  const map: Record<UnifiedHighlightSource, { en: string; es: string }> = {
    scripture: { en: "Scripture", es: "Biblia" },
    "study-tools": { en: "Study Tools", es: "Herramientas" },
    "free-books": { en: "Free Books", es: "Libros gratis" },
    "historical-documents": { en: "Historical Docs", es: "Documentos históricos" },
  };
  return map[source][lang];
}

function itemHref(item: SavedItem) {
  if (item.type === "book") return `/library/${encodeURIComponent(item.id.replace(/^book::/, ""))}`;
  if (item.type === "learn") return `/learn?doc=${encodeURIComponent(item.id.replace(/^learn::/, ""))}`;
  if (item.type === "video") return "/videos";
  if (item.type === "verse") {
    const parts = item.id.replace(/^verse::/, "").split("::");
    if (parts.length >= 2) return `/lexicon?book=${encodeURIComponent(parts[0])}&chapter=${parts[1]}`;
    return "/lexicon";
  }
  return "/";
}

function bookmarkHref(bookmark: Bookmark) {
  const match = bookmark.ref.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
  if (!match) return "/lexicon";
  const [, book, chapter, verse] = match;
  return `/lexicon?book=${encodeURIComponent(book)}&chapter=${chapter}${verse ? `&select=${verse}` : ""}`;
}

function countBySource(highlights: UnifiedHighlight[], source: UnifiedHighlightSource) {
  return highlights.filter((highlight) => highlight.source === source).length;
}

function useIsLightTheme() {
  const { theme } = useTheme();
  return String(theme) === "white-noir" || String(theme) === "light";
}

function EmptyCard({ title, subtitle, isLight }: { title: string; subtitle: string; isLight: boolean }) {
  return (
    <div
      className="rounded-[30px] p-7 text-center"
      style={{
        background: isLight ? "#f5f6f7" : "rgba(255,255,255,0.055)",
        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)" }}
      >
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </div>
      <p className="text-xl font-black">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.56)" : "rgba(255,255,255,0.50)" }}>
        {subtitle}
      </p>
    </div>
  );
}

function HighlightCard({
  highlight,
  isLight,
  lang,
  onOpen,
  onDelete,
}: {
  highlight: UnifiedHighlight;
  isLight: boolean;
  lang: "en" | "es";
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className="rounded-[26px] p-5"
      style={{
        background: isLight ? "#f6f7f8" : "rgba(255,255,255,0.055)",
        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full" style={{ background: highlight.color ?? (isLight ? "#111111" : "#d8bc78") }} />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: isLight ? "rgba(0,0,0,0.46)" : "rgba(216,188,120,0.84)" }}>
            {sourceTitle(highlight.source, lang)}
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight">{highlight.title}</h2>
          <p className="mt-1 text-sm font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.54)" : "rgba(255,255,255,0.48)" }}>
            {highlight.reference}
          </p>
          <p className="mt-4 line-clamp-4 text-[15px] leading-7" style={{ color: isLight ? "rgba(0,0,0,0.76)" : "rgba(255,255,255,0.72)" }}>
            “{highlight.text}”
          </p>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-lg"
          style={{
            background: isLight ? "rgba(0,0,0,0.045)" : "rgba(255,255,255,0.06)",
            color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.38)",
          }}
          aria-label={COPY[lang].delete}
        >
          ×
        </button>
      </div>
    </article>
  );
}

function HighlightsPanel({
  highlights,
  isLight,
  lang,
  onRefresh,
}: {
  highlights: UnifiedHighlight[];
  isLight: boolean;
  lang: "en" | "es";
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | UnifiedHighlightSource>("all");
  const [pendingDelete, setPendingDelete] = useState<UnifiedHighlight | null>(null);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return highlights.filter((highlight) => {
      if (filter !== "all" && highlight.source !== filter) return false;
      if (!needle) return true;
      return normalize([
        highlight.sourceLabel,
        highlight.title,
        highlight.subtitle ?? "",
        highlight.reference,
        highlight.groupLabel,
        highlight.text,
      ].join(" ")).includes(needle);
    });
  }, [filter, highlights, query]);

  const grouped = useMemo(() => {
    const groups = new Map<UnifiedHighlightSource, UnifiedHighlight[]>();
    for (const highlight of filtered) {
      const items = groups.get(highlight.source) ?? [];
      items.push(highlight);
      groups.set(highlight.source, items);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <section className="space-y-5">
      <div
        className="rounded-[26px] px-4 py-3"
        style={{
          background: isLight ? "#f5f6f7" : "rgba(255,255,255,0.055)",
          border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={COPY[lang].search}
          className="w-full bg-transparent text-[16px] font-semibold outline-none placeholder:text-black/35"
          style={{ color: isLight ? "#050505" : "#ffffff" }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SOURCE_FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-black"
              style={{
                background: active ? (isLight ? "#050505" : "#ffffff") : (isLight ? "#f1f2f4" : "rgba(255,255,255,0.06)"),
                color: active ? (isLight ? "#ffffff" : "#050505") : (isLight ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.62)"),
                border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {item[lang]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyCard title={COPY[lang].noHighlights} subtitle={COPY[lang].noHighlightsSub} isLight={isLight} />
      ) : (
        <div className="space-y-8">
          {grouped.map(([source, items]) => (
            <section key={source}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-black">{sourceTitle(source, lang)}</h2>
                <span className="text-xs font-black" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.38)" }}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((highlight) => (
                  <HighlightCard
                    key={`${highlight.source}-${highlight.id}-${highlight.openHref}`}
                    highlight={highlight}
                    isLight={isLight}
                    lang={lang}
                    onOpen={() => router.push(highlight.openHref)}
                    onDelete={() => setPendingDelete(highlight)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[300] grid place-items-center px-6">
          <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setPendingDelete(null)} aria-label={COPY[lang].cancel} />
          <div
            className="relative w-full max-w-sm rounded-[28px] p-6"
            style={{
              background: isLight ? "#ffffff" : "#101522",
              color: isLight ? "#050505" : "#ffffff",
              border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
            }}
          >
            <p className="text-xl font-black">{COPY[lang].deleteHighlight}</p>
            <p className="mt-2 text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.58)" : "rgba(255,255,255,0.58)" }}>{COPY[lang].deleteHighlightSub}</p>
            <p className="mt-4 line-clamp-3 rounded-2xl p-4 text-sm leading-6" style={{ background: isLight ? "#f5f6f7" : "rgba(255,255,255,0.055)" }}>
              “{pendingDelete.text}”
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setPendingDelete(null)} className="h-12 rounded-2xl text-sm font-black" style={{ background: isLight ? "#f1f2f4" : "rgba(255,255,255,0.07)" }}>
                {COPY[lang].cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUnifiedHighlight(pendingDelete);
                  setPendingDelete(null);
                  onRefresh();
                }}
                className="h-12 rounded-2xl bg-red-500 text-sm font-black text-white"
              >
                {COPY[lang].delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CollectionsPanel({
  collections,
  isLight,
  lang,
  onRefresh,
}: {
  collections: Collection[];
  isLight: boolean;
  lang: "en" | "es";
  onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<Collection | null>(null);
  const active = selected ? collections.find((collection) => collection.id === selected.id) ?? null : null;

  if (collections.length === 0) {
    return <EmptyCard title={COPY[lang].noCollections} subtitle={COPY[lang].noCollectionsSub} isLight={isLight} />;
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {collections.map((collection) => {
          const latest = [...collection.items].sort((a, b) => b.savedAt - a.savedAt)[0];
          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => setSelected(collection)}
              className="rounded-[26px] p-4 text-left active:scale-[0.98] transition-transform"
              style={{
                background: isLight ? "#f5f6f7" : `${collection.color}16`,
                border: isLight ? "1px solid rgba(0,0,0,0.08)" : `1px solid ${collection.color}35`,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: isLight ? "#fff" : `${collection.color}20`, color: isLight ? "#111" : collection.color }}>
                  <UiIcon name={collectionIconName(collection.emoji)} size={20} />
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: isLight ? "#ffffff" : `${collection.color}22`, color: isLight ? "#111" : collection.color }}>
                  {collection.items.length}
                </span>
              </div>
              <p className="text-base font-black leading-tight">{collection.name}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5" style={{ color: isLight ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.44)" }}>
                {latest?.title ?? COPY[lang].emptyCollection}
              </p>
            </button>
          );
        })}
      </div>

      {active && <CollectionDetail collection={active} isLight={isLight} lang={lang} onClose={() => setSelected(null)} onRefresh={onRefresh} />}
    </section>
  );
}

function CollectionDetail({
  collection,
  isLight,
  lang,
  onClose,
  onRefresh,
}: {
  collection: Collection;
  isLight: boolean;
  lang: "en" | "es";
  onClose: () => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [emoji, setEmoji] = useState(collection.emoji);
  const [color, setColor] = useState(collection.color);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function saveEdits() {
    renameCollection(collection.id, name.trim() || collection.name, emoji, color);
    setEditing(false);
    onRefresh();
  }

  function removeCollection() {
    deleteCollection(collection.id);
    onClose();
    onRefresh();
  }

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: isLight ? "#ffffff" : "#080b13", color: isLight ? "#050505" : "#ffffff" }}>
      <div className="flex items-center gap-3 border-b px-5 pb-4 pt-7" style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full text-2xl" style={{ background: isLight ? "#f2f3f5" : "rgba(255,255,255,0.08)" }}>
          ‹
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: isLight ? "rgba(0,0,0,0.44)" : "rgba(216,188,120,0.82)" }}>
            {COPY[lang].collections}
          </p>
          <h2 className="truncate text-2xl font-black">{collection.name}</h2>
        </div>
        <button type="button" onClick={() => setEditing((value) => !value)} className="rounded-full px-4 py-2 text-xs font-black" style={{ background: isLight ? "#f2f3f5" : "rgba(255,255,255,0.08)" }}>
          {editing ? COPY[lang].done : COPY[lang].edit}
        </button>
      </div>

      {editing && (
        <div className="space-y-3 border-b px-5 py-4" style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm font-bold outline-none"
            style={{ background: isLight ? "#f4f5f6" : "rgba(255,255,255,0.06)" }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {COLLECTION_EMOJIS.map((item) => (
              <button key={item} type="button" onClick={() => setEmoji(item)} className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl" style={{ background: emoji === item ? (isLight ? "#e8eaed" : "rgba(255,255,255,0.14)") : (isLight ? "#f5f6f7" : "rgba(255,255,255,0.06)"), color }}>
                <UiIcon name={collectionIconName(item)} size={18} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {COLLECTION_COLORS.map((item) => (
              <button key={item} type="button" onClick={() => setColor(item)} className="h-7 w-7 rounded-full" style={{ background: item, outline: color === item ? `2px solid ${isLight ? "#111" : "#fff"}` : "none", outlineOffset: 2 }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => confirmDelete ? removeCollection() : setConfirmDelete(true)} className="h-12 rounded-2xl text-sm font-black" style={{ background: confirmDelete ? "#ef4444" : (isLight ? "#fff1f2" : "rgba(239,68,68,0.12)"), color: confirmDelete ? "#fff" : "#ef4444" }}>
              {confirmDelete ? COPY[lang].confirmDelete : COPY[lang].deleteCollection}
            </button>
            <button type="button" onClick={saveEdits} className="h-12 rounded-2xl text-sm font-black text-white" style={{ background: color }}>
              {COPY[lang].save}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {collection.items.length === 0 ? (
          <EmptyCard title={COPY[lang].emptyCollection} subtitle={COPY[lang].noCollectionsSub} isLight={isLight} />
        ) : (
          <div className="space-y-3">
            {[...collection.items].sort((a, b) => b.savedAt - a.savedAt).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(itemHref(item))}
                className="w-full rounded-[24px] p-4 text-left active:scale-[0.99] transition-transform"
                style={{
                  background: isLight ? "#f6f7f8" : "rgba(255,255,255,0.055)",
                  border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: isLight ? "rgba(0,0,0,0.44)" : color }}>
                  {item.type}
                </p>
                <h3 className="mt-1 text-base font-black">{item.title}</h3>
                {item.subtitle && <p className="mt-1 text-sm font-semibold opacity-55">{item.subtitle}</p>}
                {item.preview && <p className="mt-3 line-clamp-3 text-sm leading-6 opacity-70">“{item.preview}”</p>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookmarksPanel({ bookmarks, isLight, lang, onRefresh }: { bookmarks: Bookmark[]; isLight: boolean; lang: "en" | "es"; onRefresh: () => void }) {
  const router = useRouter();

  const grouped = useMemo(() => {
    const map = new Map<string, Bookmark[]>();
    for (const bookmark of bookmarks) {
      const key = bookmark.category || "General";
      const items = map.get(key) ?? [];
      items.push(bookmark);
      map.set(key, items);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [bookmarks]);

  if (bookmarks.length === 0) {
    return <EmptyCard title={COPY[lang].noBookmarks} subtitle={COPY[lang].noBookmarksSub} isLight={isLight} />;
  }

  return (
    <section className="space-y-7">
      {grouped.map(([category, items]) => (
        <div key={category}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">{category}</h2>
            <span className="text-xs font-black opacity-45">{items.length}</span>
          </div>
          <div className="space-y-3">
            {items.map((bookmark) => (
              <article
                key={bookmark.id}
                className="rounded-[26px] p-5"
                style={{
                  background: isLight ? "#f6f7f8" : "rgba(255,255,255,0.055)",
                  border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => router.push(bookmarkHref(bookmark))} className="min-w-0 flex-1 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: isLight ? "rgba(0,0,0,0.46)" : "rgba(216,188,120,0.84)" }}>
                      {bookmark.ref}
                    </p>
                    <p className="mt-3 text-[15px] leading-7" style={{ color: isLight ? "rgba(0,0,0,0.76)" : "rgba(255,255,255,0.72)" }}>
                      “{bookmark.text}”
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeBookmarkById(bookmark.id);
                      onRefresh();
                    }}
                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-lg"
                    style={{
                      background: isLight ? "rgba(0,0,0,0.045)" : "rgba(255,255,255,0.06)",
                      color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.38)",
                    }}
                    aria-label={COPY[lang].delete}
                  >
                    ×
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function CollectionsInner() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const isLight = useIsLightTheme();
  const copy = COPY[lang];
  const [tab, setTab] = useState<CollectionsTab>("highlights");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<UnifiedHighlight[]>([]);

  function refresh() {
    setCollections(loadCollections());
    setBookmarks(getBookmarks());
    setHighlights(collectUnifiedHighlights());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(SYNC_COMPLETE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(SYNC_COMPLETE_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    const target = searchParams.get("tab");
    if (target === "collections" || target === "bookmarks" || target === "highlights") {
      setTab(target);
    }
  }, [searchParams]);

  const tabs: Array<{ key: CollectionsTab; label: string; count: number }> = [
    { key: "highlights", label: copy.highlights, count: highlights.length },
    { key: "collections", label: copy.collections, count: collections.length },
    { key: "bookmarks", label: copy.bookmarks, count: bookmarks.length },
  ];

  return (
    <main className="min-h-screen px-6 pb-28 pt-12" style={{ background: isLight ? "#ffffff" : "#080b13", color: isLight ? "#050505" : "#ffffff" }}>
      <div className="mx-auto max-w-xl">
        <header>
          <p className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(216,188,120,0.88)" }}>
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.54)" : "rgba(255,255,255,0.52)" }}>
            {copy.subtitle}
          </p>
        </header>

        <section className="mt-7 grid grid-cols-3 gap-2">
          {SOURCE_FILTERS.filter((item) => item.key !== "all").slice(0, 3).map((item) => (
            <div key={item.key} className="rounded-2xl p-3" style={{ background: isLight ? "#f5f6f7" : "rgba(255,255,255,0.055)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-2xl font-black">{countBySource(highlights, item.key as UnifiedHighlightSource)}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] opacity-45">{item[lang]}</p>
            </div>
          ))}
        </section>

        <nav className="mt-5 grid grid-cols-3 gap-2 rounded-[24px] p-1.5" style={{ background: isLight ? "#f1f2f4" : "rgba(255,255,255,0.055)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}>
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className="rounded-[18px] px-2 py-3 text-xs font-black transition-transform active:scale-[0.98]"
                style={{
                  background: active ? (isLight ? "#ffffff" : "#ffffff") : "transparent",
                  color: active ? "#050505" : (isLight ? "rgba(0,0,0,0.52)" : "rgba(255,255,255,0.52)"),
                  boxShadow: active && isLight ? "0 10px 24px rgba(0,0,0,0.07)" : "none",
                }}
              >
                <span>{item.label}</span>
                <span className="ml-1 opacity-45">{item.count}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-7">
          {tab === "highlights" && <HighlightsPanel highlights={highlights} isLight={isLight} lang={lang} onRefresh={refresh} />}
          {tab === "collections" && <CollectionsPanel collections={collections} isLight={isLight} lang={lang} onRefresh={refresh} />}
          {tab === "bookmarks" && <BookmarksPanel bookmarks={bookmarks} isLight={isLight} lang={lang} onRefresh={refresh} />}
        </div>
      </div>
    </main>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <CollectionsInner />
    </Suspense>
  );
}
