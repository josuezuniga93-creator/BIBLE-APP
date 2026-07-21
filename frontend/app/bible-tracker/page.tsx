"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BIBLE_BOOKS,
  OT_BOOKS,
  NT_BOOKS,
  TOTAL_CHAPTERS,
  OT_CHAPTERS,
  NT_CHAPTERS,
  getBookGroups,
  getBooksInGroup,
} from "../lib/bibleBooks";
import { useLanguage } from "../lib/useLanguage";
import { BIBLE_GROUP_ES, bibleBookName } from "../lib/spanishContent";

// ─── localStorage key ─────────────────────────────────────────────────────────

const STORAGE_KEY = "tulip_bible_tracker_v1";

type ReadMap = Record<string, boolean>; // "BookNum:Chapter" → true

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chapterKey(bookNum: number, chapter: number): string {
  return `${bookNum}:${chapter}`;
}

function loadReadMap(): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReadMap(map: ReadMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  pct,
  size = 60,
  stroke = 5,
  color = "#7c3aed",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
  );
}

// ─── Book Row ─────────────────────────────────────────────────────────────────

function BookRow({
  bookNum,
  name,
  chapters,
  readMap,
  onToggle,
  onMarkAll,
}: {
  bookNum: number;
  name: string;
  chapters: number;
  readMap: ReadMap;
  onToggle: (bookNum: number, ch: number) => void;
  onMarkAll: (bookNum: number, chapters: number, read: boolean) => void;
}) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const readCount = useMemo(() => {
    let n = 0;
    for (let ch = 1; ch <= chapters; ch++) {
      if (readMap[chapterKey(bookNum, ch)]) n++;
    }
    return n;
  }, [readMap, bookNum, chapters]);

  const pct = Math.round((readCount / chapters) * 100);
  const allRead = readCount === chapters;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {/* Book header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Progress ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={38} stroke={3.5} color={allRead ? "#10b981" : "#7c3aed"} />
          <div className="absolute inset-0 flex items-center justify-center">
            {allRead ? (
              <span className="text-emerald-400 text-[10px] font-black">Done</span>
            ) : (
              <span className="text-white/50 text-[9px] font-bold">{pct}%</span>
            )}
          </div>
        </div>

        {/* Name + count */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${allRead ? "text-emerald-400" : "text-white/80"}`}>
            {lang === "es" ? bibleBookName({ num: bookNum, name }, "es") : name}
          </p>
          <p className="text-xs text-white/30">
            {readCount}/{chapters} {lang === "es" ? "capítulos" : "chapters"}
          </p>
        </div>

        {/* Mark all / Unmark all */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkAll(bookNum, chapters, !allRead);
          }}
          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
            allRead
              ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              : "border-white/10 text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
          }`}
        >
          {allRead ? (lang === "es" ? "Desmarcar todo" : "Unmark all") : (lang === "es" ? "Marcar todo" : "Mark all")}
        </button>

        <span className="text-white/20 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Chapter grid */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Array.from({ length: chapters }, (_, i) => i + 1).map((ch) => {
              const key = chapterKey(bookNum, ch);
              const read = !!readMap[key];
              return (
                <button
                  key={ch}
                  onClick={() => onToggle(bookNum, ch)}
                  title={`${name} ${ch}`}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    read
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-white/[0.04] border border-white/[0.08] text-white/35 hover:text-white/70 hover:bg-white/[0.08]"
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-white/20 mt-3">{lang === "es" ? "Toca un capítulo para marcarlo como leído" : "Tap a chapter to mark it read"}</p>
        </div>
      )}
    </div>
  );
}

// ─── Overall Stats Bar ────────────────────────────────────────────────────────

function StatsBar({ readMap }: { readMap: ReadMap }) {
  const { lang, t } = useLanguage();
  const totalRead = useMemo(() => {
    let n = 0;
    for (const book of BIBLE_BOOKS) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        if (readMap[chapterKey(book.num, ch)]) n++;
      }
    }
    return n;
  }, [readMap]);

  const otRead = useMemo(() => {
    let n = 0;
    for (const book of OT_BOOKS) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        if (readMap[chapterKey(book.num, ch)]) n++;
      }
    }
    return n;
  }, [readMap]);

  const ntRead = totalRead - otRead;
  const pct = Math.round((totalRead / TOTAL_CHAPTERS) * 100);
  const otPct = Math.round((otRead / OT_CHAPTERS) * 100);
  const ntPct = Math.round((ntRead / NT_CHAPTERS) * 100);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 mb-6">
      {/* Overall */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={72} stroke={6} color={pct === 100 ? "#10b981" : "#7c3aed"} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-sm">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-white font-bold text-lg">{totalRead.toLocaleString()}</p>
          <p className="text-white/40 text-sm">{lang === "es" ? "de" : "of"} {TOTAL_CHAPTERS.toLocaleString()} {t("tracker_chapters_read")}</p>
          {pct === 100 && (
            <p className="text-emerald-400 text-xs font-bold mt-0.5">{lang === "es" ? "¡Has leído toda la Biblia!" : "You've read the entire Bible!"}</p>
          )}
        </div>
      </div>

      {/* OT / NT breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 px-4 py-3">
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">{t("tracker_ot")}</p>
          <p className="text-white font-bold">{otRead}/{OT_CHAPTERS}</p>
          <div className="h-1.5 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${otPct}%` }}
            />
          </div>
          <p className="text-white/30 text-xs mt-1">{otPct}%</p>
        </div>
        <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/15 px-4 py-3">
          <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-1">{t("tracker_nt")}</p>
          <p className="text-white font-bold">{ntRead}/{NT_CHAPTERS}</p>
          <div className="h-1.5 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${ntPct}%` }}
            />
          </div>
          <p className="text-white/30 text-xs mt-1">{ntPct}%</p>
        </div>
      </div>
    </div>
  );
}

// ─── What's Next ──────────────────────────────────────────────────────────────

function WhatsNext({ readMap }: { readMap: ReadMap }) {
  const { lang } = useLanguage();
  const next = useMemo(() => {
    for (const book of BIBLE_BOOKS) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        if (!readMap[chapterKey(book.num, ch)]) {
          return { book, chapter: ch };
        }
      }
    }
    return null;
  }, [readMap]);

  if (!next) return null;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 mb-4 flex items-center gap-3">
      <span className="text-violet-400 text-lg">→</span>
      <div>
        <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-0.5">{lang === "es" ? "Leer Después" : "Read Next"}</p>
        <p className="text-white/80 text-sm font-semibold">
          {bibleBookName(next.book, lang)} {next.chapter}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BibleTrackerPage() {
  const { lang, t } = useLanguage();
  const [readMap, setReadMap] = useState<ReadMap>({});
  const [mounted, setMounted] = useState(false);
  const [testament, setTestament] = useState<"ALL" | "OT" | "NT">("ALL");
  const [search, setSearch] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setReadMap(loadReadMap());
    setMounted(true);
  }, []);

  const toggle = (bookNum: number, ch: number) => {
    setReadMap((prev) => {
      const key = chapterKey(bookNum, ch);
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) delete next[key];
      saveReadMap(next);
      return next;
    });
  };

  const markAll = (bookNum: number, chapters: number, read: boolean) => {
    setReadMap((prev) => {
      const next = { ...prev };
      for (let ch = 1; ch <= chapters; ch++) {
        const key = chapterKey(bookNum, ch);
        if (read) next[key] = true;
        else delete next[key];
      }
      saveReadMap(next);
      return next;
    });
  };

  const resetAll = () => {
    setReadMap({});
    saveReadMap({});
    setConfirmReset(false);
  };

  const books = useMemo(() => {
    const base = testament === "OT" ? OT_BOOKS : testament === "NT" ? NT_BOOKS : BIBLE_BOOKS;
    if (!search.trim()) return base;
    return base.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  }, [testament, search]);

  const groups = useMemo(() => {
    const groupNames = getBookGroups(testament === "ALL" ? "ALL" : testament);
    return groupNames;
  }, [testament]);

  if (!mounted) {
    return (
      <div className="bible-tracker-page min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bible-tracker-page min-h-screen bg-[#0f0f0f]">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-6">
        <div className="mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {t("tracker_badge")}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
          {t("tracker_heading")}
        </h1>
        <p className="text-white/40 text-sm leading-relaxed">
          {t("tracker_sub")}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        {/* Stats */}
        <StatsBar readMap={readMap} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("tracker_search")}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          {/* Testament filter */}
          <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
            {(["ALL", "OT", "NT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTestament(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testament === t
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {t === "ALL" ? (lang === "es" ? "Todos" : "All") : t}
              </button>
            ))}
          </div>
        </div>
        {/* Book list grouped */}
        <div className="space-y-6">
          {groups.map((group) => {
            const groupBooks = getBooksInGroup(group).filter((b) =>
              books.some((fb) => fb.num === b.num)
            );
            if (groupBooks.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-2 px-1">
                  {lang === "es" ? BIBLE_GROUP_ES[group] ?? group : group}
                </p>
                <div className="space-y-2">
                  {groupBooks.map((book) => (
                    <BookRow
                      key={book.num}
                      bookNum={book.num}
                      name={book.name}
                      chapters={book.chapters}
                      readMap={readMap}
                      onToggle={toggle}
                      onMarkAll={markAll}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] text-center">
          {confirmReset ? (
            <div className="space-y-3">
              <p className="text-white/50 text-sm">{lang === "es" ? "¿Restablecer todo el progreso de lectura? Esto no se puede deshacer." : "Reset all reading progress? This cannot be undone."}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-colors"
                >
                  {lang === "es" ? "Sí, restablecer todo" : "Yes, reset everything"}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/40 text-sm font-semibold hover:text-white/60 transition-colors"
                >
                  {t("notes_cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-white/20 hover:text-red-400 transition-colors"
            >
              {t("reset_progress")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
