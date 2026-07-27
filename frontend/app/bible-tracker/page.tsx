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

const BIBLE_TRACKER_THEME_STYLES = `
  .bible-tracker-page {
    --bt-bg: #fbfbfa;
    --bt-card: #ffffff;
    --bt-card-soft: #f7f7f5;
    --bt-input: #f4f4f2;
    --bt-segment: #eeeeeb;
    --bt-border: rgba(10, 10, 10, 0.08);
    --bt-border-soft: rgba(10, 10, 10, 0.06);
    --bt-text: #0a0a0a;
    --bt-muted: #656565;
    --bt-faint: rgba(10, 10, 10, 0.45);
    --bt-dim: rgba(10, 10, 10, 0.28);
    --bt-gold: #c9a961;
    --bt-gold-strong: #7f745f;
    --bt-ring-fill: #f4f4f2;
    --bt-shadow: 0 18px 42px rgba(12, 12, 10, 0.06);
    min-height: 100vh;
    background:
      radial-gradient(circle at 22% -8%, rgba(201, 169, 97, 0.10), transparent 32%),
      var(--bt-bg);
    color: var(--bt-text);
  }

  html[data-theme-mode="dark"] .bible-tracker-page {
    --bt-bg: #0e1018;
    --bt-card: #171a24;
    --bt-card-soft: #1d2130;
    --bt-input: #1d2130;
    --bt-segment: #191d29;
    --bt-border: rgba(255, 255, 255, 0.08);
    --bt-border-soft: rgba(255, 255, 255, 0.06);
    --bt-text: rgba(255, 255, 255, 0.94);
    --bt-muted: rgba(255, 255, 255, 0.62);
    --bt-faint: rgba(255, 255, 255, 0.42);
    --bt-dim: rgba(255, 255, 255, 0.26);
    --bt-gold: #c9a961;
    --bt-gold-strong: #d4b878;
    --bt-ring-fill: rgba(255, 255, 255, 0.035);
    --bt-shadow: 0 20px 54px rgba(0, 0, 0, 0.22);
    background:
      radial-gradient(circle at 20% -8%, rgba(201, 169, 97, 0.16), transparent 34%),
      linear-gradient(180deg, #111421 0%, #0e1018 52%, #0b0d14 100%);
  }

  .bt-card {
    border: 1px solid var(--bt-border);
    background: var(--bt-card);
    box-shadow: var(--bt-shadow);
  }

  .bt-soft {
    border: 1px solid var(--bt-border);
    background: var(--bt-card-soft);
  }

  .bt-input {
    border: 1px solid var(--bt-border);
    background: var(--bt-input);
    color: var(--bt-text);
  }

  .bt-input::placeholder {
    color: var(--bt-faint);
  }

  .bt-segment {
    border: 1px solid var(--bt-border);
    background: var(--bt-segment);
  }

  .bt-row:hover {
    background: color-mix(in srgb, var(--bt-text) 3%, transparent);
  }
`;

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
  color = "var(--bt-text)",
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="var(--bt-ring-fill)" stroke="var(--bt-border)" strokeWidth={stroke} />
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
    <div className="bt-card overflow-hidden rounded-[18px]">
      <div
        className="bt-row flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={40} stroke={3.5} color={allRead ? "#10b981" : "var(--bt-text)"} />
          <div className="absolute inset-0 flex items-center justify-center">
            {allRead ? (
              <span className="text-[9px] font-black text-emerald-600">Done</span>
            ) : (
              <span className="text-[9px] font-black" style={{ color: "var(--bt-faint)" }}>{pct}%</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-black ${allRead ? "text-emerald-500" : ""}`} style={{ color: allRead ? undefined : "var(--bt-text)" }}>
            {lang === "es" ? bibleBookName({ num: bookNum, name }, "es") : name}
          </p>
          <p className="text-[12px] font-medium" style={{ color: "var(--bt-faint)" }}>
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
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "bt-soft"
          }`}
          style={{ color: allRead ? undefined : "var(--bt-muted)" }}
        >
          {allRead ? (lang === "es" ? "Desmarcar todo" : "Unmark all") : (lang === "es" ? "Marcar todo" : "Mark all")}
        </button>

        <span className="ml-1 text-xs" style={{ color: "var(--bt-dim)" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Chapter grid */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-1" style={{ borderColor: "var(--bt-border-soft)" }}>
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
                      ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-500"
                      : "bt-soft hover:brightness-105"
                  }`}
                  style={{ color: read ? undefined : "var(--bt-faint)" }}
                >
                  {ch}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[10px]" style={{ color: "var(--bt-dim)" }}>{lang === "es" ? "Toca un capítulo para marcarlo como leído" : "Tap a chapter to mark it read"}</p>
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
    <div className="bt-card mb-6 rounded-[26px] p-6">
      <div className="mb-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={88} stroke={7} color={pct === 100 ? "#10b981" : "var(--bt-text)"} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black" style={{ color: "var(--bt-text)" }}>{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-[36px] font-black leading-none" style={{ color: "var(--bt-text)" }}>{totalRead.toLocaleString()}</p>
          <p className="mt-2 text-[15px] font-medium" style={{ color: "var(--bt-muted)" }}>{lang === "es" ? "de" : "of"} {TOTAL_CHAPTERS.toLocaleString()} {t("tracker_chapters_read")}</p>
          {pct === 100 && (
            <p className="mt-1 text-xs font-bold text-emerald-500">{lang === "es" ? "¡Has leído toda la Biblia!" : "You've read the entire Bible!"}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bt-soft rounded-[18px] px-5 py-5">
          <p className="mb-4 text-[12px] font-black uppercase leading-tight" style={{ color: "var(--bt-muted)" }}>{t("tracker_ot")}</p>
          <p className="text-[21px] font-black" style={{ color: "var(--bt-text)" }}>{otRead}/{OT_CHAPTERS}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bt-border-soft)" }}>
            <div
              className="h-full rounded-full bg-[#c9a961] transition-all"
              style={{ width: `${otPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--bt-dim)" }}>{otPct}%</p>
        </div>
        <div className="bt-soft rounded-[18px] px-5 py-5">
          <p className="mb-4 text-[12px] font-black uppercase leading-tight" style={{ color: "var(--bt-muted)" }}>{t("tracker_nt")}</p>
          <p className="text-[21px] font-black" style={{ color: "var(--bt-text)" }}>{ntRead}/{NT_CHAPTERS}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bt-border-soft)" }}>
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${ntPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--bt-dim)" }}>{ntPct}%</p>
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
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#c9a961]/25 bg-[#c9a961]/10 px-4 py-3">
      <span className="text-lg text-[#c9a961]">→</span>
      <div>
        <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-[#c9a961]">{lang === "es" ? "Leer Después" : "Read Next"}</p>
        <p className="text-sm font-semibold" style={{ color: "var(--bt-text)" }}>
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
      <div className="bible-tracker-page flex min-h-screen items-center justify-center">
        <style>{BIBLE_TRACKER_THEME_STYLES}</style>
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "var(--bt-border)", borderTopColor: "var(--bt-text)" }} />
      </div>
    );
  }

  return (
    <div className="bible-tracker-page">
      <style>{BIBLE_TRACKER_THEME_STYLES}</style>
      <div className="mx-auto max-w-2xl px-6 pb-6 pt-14">
        <p className="text-[12px] font-black uppercase" style={{ color: "var(--bt-gold-strong)" }}>
          {t("tracker_badge")}
        </p>
        <h1 className="mt-6 max-w-[330px] text-[34px] font-black leading-[1.14]">
          {t("tracker_heading")}
        </h1>
        <p className="mt-3 max-w-[326px] text-[16px] font-medium leading-[1.25]" style={{ color: "var(--bt-muted)" }}>
          {lang === "es"
            ? "Un panel bíblico con señales doradas y verdes para tu progreso."
            : "A Bible dashboard with gold and green signals for your progress."}
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
            className="bt-input h-12 flex-1 rounded-[17px] px-5 text-[15px] font-bold focus:outline-none"
          />
          <div className="bt-segment flex gap-1 rounded-[17px] p-1">
            {(["ALL", "OT", "NT"] as const).map((testamentOption) => (
              <button
                key={testamentOption}
                onClick={() => setTestament(testamentOption)}
                className={`h-10 rounded-[14px] px-4 text-xs font-black transition-all ${
                  testament === testamentOption
                    ? "bg-[var(--bt-text)] text-[var(--bt-bg)]"
                    : "hover:brightness-110"
                }`}
                style={{ color: testament === testamentOption ? undefined : "var(--bt-faint)" }}
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
                <p className="mb-2 px-1 text-xs font-black uppercase" style={{ color: "var(--bt-dim)" }}>
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

        <div className="mt-10 border-t pt-6 text-center" style={{ borderColor: "var(--bt-border-soft)" }}>
          {confirmReset ? (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: "var(--bt-faint)" }}>{lang === "es" ? "¿Restablecer todo el progreso de lectura? Esto no se puede deshacer." : "Reset all reading progress? This cannot be undone."}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetAll}
                  className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-600"
                >
                  {lang === "es" ? "Sí, restablecer todo" : "Yes, reset everything"}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "var(--bt-border)", color: "var(--bt-faint)" }}
                >
                  {t("notes_cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs transition-colors hover:text-red-500"
              style={{ color: "var(--bt-dim)" }}
            >
              {t("reset_progress")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
