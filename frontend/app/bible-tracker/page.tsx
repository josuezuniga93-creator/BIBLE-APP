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
  color = "#0a0a0a",
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="#f4f4f2" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
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
    <div className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02]"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={40} stroke={3.5} color={allRead ? "#10b981" : "#0a0a0a"} />
          <div className="absolute inset-0 flex items-center justify-center">
            {allRead ? (
              <span className="text-[9px] font-black text-emerald-600">Done</span>
            ) : (
              <span className="text-[9px] font-black text-black/45">{pct}%</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-black ${allRead ? "text-emerald-700" : "text-[#0a0a0a]"}`}>
            {lang === "es" ? bibleBookName({ num: bookNum, name }, "es") : name}
          </p>
          <p className="text-[12px] font-medium text-black/50">
            {readCount}/{chapters} {lang === "es" ? "capítulos" : "chapters"}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkAll(bookNum, chapters, !allRead);
          }}
          className={`h-9 rounded-[18px] border px-3 text-[12px] font-black transition-colors ${
            allRead
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-black/[0.08] bg-[#f1f1ef] text-[#555]"
          }`}
        >
          {allRead ? (lang === "es" ? "Desmarcar todo" : "Unmark all") : (lang === "es" ? "Marcar todo" : "Mark all")}
        </button>

        <span className="ml-1 text-xs text-black/25">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Chapter grid */}
      {expanded && (
        <div className="border-t border-black/[0.06] px-4 pb-4 pt-1">
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
                      ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-700"
                      : "bg-[#f4f4f2] border border-black/[0.08] text-black/45 hover:text-black/70"
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-black/35">{lang === "es" ? "Toca un capítulo para marcarlo como leído" : "Tap a chapter to mark it read"}</p>
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
    <div className="mb-6 rounded-[26px] border border-black/[0.08] bg-white p-6">
      <div className="mb-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={88} stroke={7} color={pct === 100 ? "#10b981" : "#0a0a0a"} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-[#0a0a0a]">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-[36px] font-black leading-none text-[#0a0a0a]">{totalRead.toLocaleString()}</p>
          <p className="mt-2 text-[15px] font-medium text-[#707070]">{lang === "es" ? "de" : "of"} {TOTAL_CHAPTERS.toLocaleString()} {t("tracker_chapters_read")}</p>
          {pct === 100 && (
            <p className="mt-1 text-xs font-bold text-emerald-700">{lang === "es" ? "¡Has leído toda la Biblia!" : "You've read the entire Bible!"}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] border border-black/[0.08] bg-[#f7f7f5] px-5 py-5">
          <p className="mb-4 text-[12px] font-black uppercase leading-tight text-[#6b6b6b]">{t("tracker_ot")}</p>
          <p className="text-[21px] font-black text-[#0a0a0a]">{otRead}/{OT_CHAPTERS}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-[#c9a961] transition-all"
              style={{ width: `${otPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-black/35">{otPct}%</p>
        </div>
        <div className="rounded-[18px] border border-black/[0.08] bg-[#f7f7f5] px-5 py-5">
          <p className="mb-4 text-[12px] font-black uppercase leading-tight text-[#6b6b6b]">{t("tracker_nt")}</p>
          <p className="text-[21px] font-black text-[#0a0a0a]">{ntRead}/{NT_CHAPTERS}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${ntPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-black/35">{ntPct}%</p>
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
      <div className="bible-tracker-page flex min-h-screen items-center justify-center bg-[#fbfbfa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black" />
      </div>
    );
  }

  return (
    <div className="bible-tracker-page min-h-screen bg-[#fbfbfa] text-[#0a0a0a]">
      <div className="mx-auto max-w-2xl px-6 pb-6 pt-14">
        <p className="text-[12px] font-black uppercase text-[#7f745f]">
          {t("tracker_badge")}
        </p>
        <h1 className="mt-6 max-w-[330px] text-[34px] font-black leading-[1.14]">
          {t("tracker_heading")}
        </h1>
        <p className="mt-3 max-w-[326px] text-[16px] font-medium leading-[1.25] text-[#656565]">
          {lang === "es"
            ? "Un panel blanco/noir con señales doradas y verdes para tu progreso."
            : "A white/noir dashboard with gold and green signals for your progress."}
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-28">
        <StatsBar readMap={readMap} />

        <div className="mb-7 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("tracker_search")}
            className="h-12 flex-1 rounded-[17px] border border-black/[0.08] bg-[#f4f4f2] px-5 text-[15px] font-bold text-[#0a0a0a] placeholder:text-[#aaa] focus:outline-none"
          />
          <div className="flex gap-1 rounded-[17px] border border-black/[0.08] bg-[#eeeeeb] p-1">
            {(["ALL", "OT", "NT"] as const).map((testamentOption) => (
              <button
                key={testamentOption}
                onClick={() => setTestament(testamentOption)}
                className={`h-10 rounded-[14px] px-4 text-xs font-black transition-all ${
                  testament === testamentOption
                    ? "bg-[#0a0a0a] text-white"
                    : "text-black/45 hover:text-black/70"
                }`}
              >
                {testamentOption === "ALL" ? (lang === "es" ? "Todos" : "All") : testamentOption}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {groups.map((group) => {
            const groupBooks = getBooksInGroup(group).filter((b) =>
              books.some((fb) => fb.num === b.num)
            );
            if (groupBooks.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-2 px-1 text-xs font-black uppercase text-black/35">
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

        <div className="mt-10 border-t border-black/[0.06] pt-6 text-center">
          {confirmReset ? (
            <div className="space-y-3">
              <p className="text-sm text-black/50">{lang === "es" ? "¿Restablecer todo el progreso de lectura? Esto no se puede deshacer." : "Reset all reading progress? This cannot be undone."}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetAll}
                  className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-600"
                >
                  {lang === "es" ? "Sí, restablecer todo" : "Yes, reset everything"}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-black/50"
                >
                  {t("notes_cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-black/25 transition-colors hover:text-red-500"
            >
              {t("reset_progress")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
