"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SYNC_COMPLETE_EVENT } from "../lib/cloudSync";
import {
  collectUnifiedHighlights,
  deleteUnifiedHighlight,
  type UnifiedHighlight,
  type UnifiedHighlightSource,
} from "../lib/unifiedHighlights";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";

const FILTERS: Array<{ key: "all" | UnifiedHighlightSource; en: string; es: string }> = [
  { key: "all", en: "All", es: "Todo" },
  { key: "scripture", en: "Scripture", es: "Biblia" },
  { key: "study-tools", en: "Study Tools", es: "Estudio" },
  { key: "free-books", en: "Free Books", es: "Libros" },
  { key: "historical-documents", en: "Historical Docs", es: "Historia" },
];

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

function HighlightCard({
  item,
  isLight,
  lang,
  onOpen,
  onRequestDelete,
}: {
  item: UnifiedHighlight;
  isLight: boolean;
  lang: "en" | "es";
  onOpen: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <div
      className="w-full rounded-[26px] p-5 text-left active:scale-[0.99] transition-transform"
      style={{
        background: isLight ? "#f6f7f8" : "rgba(255,255,255,0.055)",
        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isLight ? "0 16px 35px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full"
          style={{
            background: item.color ?? (isLight ? "#111111" : "#d8bc78"),
            boxShadow: isLight ? "none" : `0 0 18px ${item.color ?? "rgba(216,188,120,0.35)"}`,
          }}
        />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: isLight ? "rgba(0,0,0,0.46)" : "rgba(216,188,120,0.84)" }}
          >
            {sourceTitle(item.source, lang)}
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight" style={{ color: isLight ? "#050505" : "#ffffff" }}>
            {item.title}
          </h2>
          <p className="mt-1 text-sm font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.54)" : "rgba(255,255,255,0.48)" }}>
            {item.reference}
          </p>
          <p className="mt-4 line-clamp-4 text-[15px] leading-7" style={{ color: isLight ? "rgba(0,0,0,0.76)" : "rgba(255,255,255,0.72)" }}>
            “{item.text}”
          </p>
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-lg"
          style={{
            background: isLight ? "rgba(0,0,0,0.045)" : "rgba(255,255,255,0.06)",
            color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.38)",
          }}
          aria-label={lang === "es" ? "Eliminar resaltado" : "Delete highlight"}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function HighlightsPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const themeName = String(theme);
  const isLight = themeName === "white-noir" || themeName === "light";
  const [highlights, setHighlights] = useState<UnifiedHighlight[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | UnifiedHighlightSource>("all");
  const [pendingDelete, setPendingDelete] = useState<UnifiedHighlight | null>(null);

  function refresh() {
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
    <main
      className="min-h-screen px-6 pb-28 pt-12"
      style={{ background: isLight ? "#ffffff" : "#080b13", color: isLight ? "#050505" : "#ffffff" }}
    >
      <div className="mx-auto max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-black uppercase tracking-[0.28em]"
              style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(216,188,120,0.88)" }}
            >
              {lang === "es" ? "En tu bolsillo" : "In Your Pocket"}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {lang === "es" ? "Mis resaltados" : "My Highlights"}
            </h1>
            <p className="mt-2 text-sm" style={{ color: isLight ? "rgba(0,0,0,0.54)" : "rgba(255,255,255,0.52)" }}>
              {lang === "es"
                ? "Biblia, comentarios, libros y documentos en un solo lugar."
                : "Scripture, commentary, books, and documents in one place."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full text-xl"
            style={{
              background: isLight ? "#f2f3f5" : "rgba(255,255,255,0.08)",
              border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
            }}
            aria-label={lang === "es" ? "Volver" : "Back"}
          >
            ‹
          </button>
        </div>

        <div
          className="mt-7 rounded-[26px] px-4 py-3"
          style={{
            background: isLight ? "#f5f6f7" : "rgba(255,255,255,0.055)",
            border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={lang === "es" ? "Buscar resaltados..." : "Search highlights..."}
            className="w-full bg-transparent text-[16px] font-semibold outline-none placeholder:text-black/35"
            style={{ color: isLight ? "#050505" : "#ffffff" }}
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {FILTERS.map((item) => {
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
          <div
            className="mt-8 rounded-[30px] p-7"
            style={{
              background: isLight ? "#f6f7f8" : "rgba(255,255,255,0.055)",
              border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-xl font-black">{lang === "es" ? "No hay resaltados todavía" : "No highlights yet"}</p>
            <p className="mt-2 text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.56)" : "rgba(255,255,255,0.52)" }}>
              {lang === "es"
                ? "Cuando resaltes en Biblia, Study Tools, libros o documentos, aparecerán aquí."
                : "When you highlight in Scripture, Study Tools, books, or documents, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-8">
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
                      item={highlight}
                      isLight={isLight}
                      lang={lang}
                      onOpen={() => router.push(highlight.openHref)}
                      onRequestDelete={() => setPendingDelete(highlight)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-[260] grid place-items-center px-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setPendingDelete(null)}
            aria-label={lang === "es" ? "Cancelar" : "Cancel"}
          />
          <div
            className="relative w-full max-w-sm rounded-[28px] p-6"
            style={{
              background: isLight ? "#ffffff" : "#101522",
              color: isLight ? "#050505" : "#ffffff",
              border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
            }}
          >
            <p className="text-xl font-black">
              {lang === "es" ? "¿Eliminar resaltado?" : "Delete highlight?"}
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.58)" : "rgba(255,255,255,0.58)" }}>
              {lang === "es"
                ? "Esto lo quitará de su sección original y de tu lista de resaltados."
                : "This removes it from the original section and your highlights list."}
            </p>
            <p className="mt-4 line-clamp-3 rounded-2xl p-4 text-sm leading-6" style={{ background: isLight ? "#f5f6f7" : "rgba(255,255,255,0.055)" }}>
              “{pendingDelete.text}”
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="h-12 rounded-2xl text-sm font-black"
                style={{ background: isLight ? "#f1f2f4" : "rgba(255,255,255,0.07)", color: isLight ? "#111" : "#fff" }}
              >
                {lang === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUnifiedHighlight(pendingDelete);
                  setPendingDelete(null);
                  refresh();
                }}
                className="h-12 rounded-2xl text-sm font-black"
                style={{ background: "#ef4444", color: "#ffffff" }}
              >
                {lang === "es" ? "Eliminar" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
