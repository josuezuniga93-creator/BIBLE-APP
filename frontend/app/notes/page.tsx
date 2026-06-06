"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/useLanguage";
import { t } from "../lib/i18n";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import { bibleBookName } from "../lib/spanishContent";
import {
  SermonNote,
  loadNotes,
  saveNotes,
  makeNote,
  detectScriptureRefs,
  PRESET_TAGS,
} from "../lib/notesData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, lang: "en" | "es" = "en") {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function refToHref(ref: string) {
  return `/lexicon?ref=${encodeURIComponent(ref)}`;
}

function NotesIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.75h8.8c1.25 0 2.45 1.2 2.45 2.45v12.05c0 .55-.45 1-1 1H7A2.25 2.25 0 014.75 17V6A2.25 2.25 0 017 3.75z" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M8.25 8.25h6.25M8.25 11.75h5.25M8.25 15.25h3.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M17.25 19.25l-3.2-2.1-3.2 2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".55"/>
    </svg>
  );
}

// ─── Note color palette (keyed by Bible section) ─────────────────────────────

function getNoteColor(bookNum: number) {
  // Torah
  if (bookNum <= 5)   return { bar: "from-amber-500/70 via-amber-500/20 to-transparent",   accent: "text-amber-400",   pill: "bg-amber-500/[0.10] border-amber-500/25 text-amber-300/90",    dot: "bg-amber-400",   ref: "text-amber-300/70 bg-amber-500/[0.07] hover:bg-amber-500/15 hover:text-amber-200 border-amber-500/15",    points: "text-amber-400/60 hover:text-amber-300",   border: "border-amber-500/[0.14]",   sideActive: "border-l-amber-500 bg-amber-500/[0.07] text-amber-200/80",   sideBadge: "bg-amber-500/20 text-amber-300/60" };
  // Historical
  if (bookNum <= 17)  return { bar: "from-orange-500/70 via-orange-500/20 to-transparent",  accent: "text-orange-400",  pill: "bg-orange-500/[0.10] border-orange-500/25 text-orange-300/90",   dot: "bg-orange-400",  ref: "text-orange-300/70 bg-orange-500/[0.07] hover:bg-orange-500/15 hover:text-orange-200 border-orange-500/15",  points: "text-orange-400/60 hover:text-orange-300", border: "border-orange-500/[0.14]",  sideActive: "border-l-orange-500 bg-orange-500/[0.07] text-orange-200/80", sideBadge: "bg-orange-500/20 text-orange-300/60" };
  // Wisdom / Poetry
  if (bookNum <= 22)  return { bar: "from-violet-500/70 via-violet-500/20 to-transparent",  accent: "text-violet-400",  pill: "bg-violet-500/[0.10] border-violet-500/25 text-violet-300/90",   dot: "bg-violet-400",  ref: "text-violet-300/70 bg-violet-500/[0.07] hover:bg-violet-500/15 hover:text-violet-200 border-violet-500/15",  points: "text-violet-400/60 hover:text-violet-300", border: "border-violet-500/[0.14]",  sideActive: "border-l-violet-500 bg-violet-500/[0.07] text-violet-200/80", sideBadge: "bg-violet-500/20 text-violet-300/60" };
  // Major Prophets
  if (bookNum <= 27)  return { bar: "from-indigo-500/70 via-indigo-500/20 to-transparent",  accent: "text-indigo-400",  pill: "bg-indigo-500/[0.10] border-indigo-500/25 text-indigo-300/90",   dot: "bg-indigo-400",  ref: "text-indigo-300/70 bg-indigo-500/[0.07] hover:bg-indigo-500/15 hover:text-indigo-200 border-indigo-500/15",  points: "text-indigo-400/60 hover:text-indigo-300", border: "border-indigo-500/[0.14]",  sideActive: "border-l-indigo-500 bg-indigo-500/[0.07] text-indigo-200/80", sideBadge: "bg-indigo-500/20 text-indigo-300/60" };
  // Minor Prophets
  if (bookNum <= 39)  return { bar: "from-teal-500/70 via-teal-500/20 to-transparent",      accent: "text-teal-400",    pill: "bg-teal-500/[0.10] border-teal-500/25 text-teal-300/90",       dot: "bg-teal-400",    ref: "text-teal-300/70 bg-teal-500/[0.07] hover:bg-teal-500/15 hover:text-teal-200 border-teal-500/15",          points: "text-teal-400/60 hover:text-teal-300",     border: "border-teal-500/[0.14]",    sideActive: "border-l-teal-500 bg-teal-500/[0.07] text-teal-200/80",     sideBadge: "bg-teal-500/20 text-teal-300/60" };
  // Gospels
  if (bookNum <= 43)  return { bar: "from-sky-500/70 via-sky-500/20 to-transparent",        accent: "text-sky-400",     pill: "bg-sky-500/[0.10] border-sky-500/25 text-sky-300/90",          dot: "bg-sky-400",     ref: "text-sky-300/70 bg-sky-500/[0.07] hover:bg-sky-500/15 hover:text-sky-200 border-sky-500/15",                points: "text-sky-400/60 hover:text-sky-300",       border: "border-sky-500/[0.14]",     sideActive: "border-l-sky-500 bg-sky-500/[0.07] text-sky-200/80",         sideBadge: "bg-sky-500/20 text-sky-300/60" };
  // Acts
  if (bookNum === 44) return { bar: "from-cyan-500/70 via-cyan-500/20 to-transparent",      accent: "text-cyan-400",    pill: "bg-cyan-500/[0.10] border-cyan-500/25 text-cyan-300/90",       dot: "bg-cyan-400",    ref: "text-cyan-300/70 bg-cyan-500/[0.07] hover:bg-cyan-500/15 hover:text-cyan-200 border-cyan-500/15",            points: "text-cyan-400/60 hover:text-cyan-300",     border: "border-cyan-500/[0.14]",    sideActive: "border-l-cyan-500 bg-cyan-500/[0.07] text-cyan-200/80",     sideBadge: "bg-cyan-500/20 text-cyan-300/60" };
  // Paul's letters
  if (bookNum <= 57)  return { bar: "from-purple-500/70 via-purple-500/20 to-transparent",  accent: "text-purple-400",  pill: "bg-purple-500/[0.10] border-purple-500/25 text-purple-300/90",   dot: "bg-purple-400",  ref: "text-purple-300/70 bg-purple-500/[0.07] hover:bg-purple-500/15 hover:text-purple-200 border-purple-500/15",  points: "text-purple-400/60 hover:text-purple-300", border: "border-purple-500/[0.14]",  sideActive: "border-l-purple-500 bg-purple-500/[0.07] text-purple-200/80", sideBadge: "bg-purple-500/20 text-purple-300/60" };
  // General letters
  if (bookNum <= 65)  return { bar: "from-emerald-500/70 via-emerald-500/20 to-transparent",accent: "text-emerald-400", pill: "bg-emerald-500/[0.10] border-emerald-500/25 text-emerald-300/90", dot: "bg-emerald-400", ref: "text-emerald-300/70 bg-emerald-500/[0.07] hover:bg-emerald-500/15 hover:text-emerald-200 border-emerald-500/15", points: "text-emerald-400/60 hover:text-emerald-300", border: "border-emerald-500/[0.14]", sideActive: "border-l-emerald-500 bg-emerald-500/[0.07] text-emerald-200/80", sideBadge: "bg-emerald-500/20 text-emerald-300/60" };
  // Revelation
  return              { bar: "from-red-500/70 via-red-500/20 to-transparent",               accent: "text-red-400",     pill: "bg-red-500/[0.10] border-red-500/25 text-red-300/90",          dot: "bg-red-400",     ref: "text-red-300/70 bg-red-500/[0.07] hover:bg-red-500/15 hover:text-red-200 border-red-500/15",                  points: "text-red-400/60 hover:text-red-300",       border: "border-red-500/[0.14]",     sideActive: "border-l-red-500 bg-red-500/[0.07] text-red-200/80",         sideBadge: "bg-red-500/20 text-red-300/60" };
}

const TAG_COLORS: Record<string, string> = {
  "Grace":       "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Faith":       "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "Gospel":      "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "Salvation":   "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Prophecy":    "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Prayer":      "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "Love":        "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "Sovereignty": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Holiness":    "bg-red-500/15 text-red-300 border-red-500/30",
  "Repentance":  "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  lang = "en",
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  lang?: "en" | "es";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--fg-mid)" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ border: "1px solid var(--border)", color: "var(--fg-lo)" }}
          >
            {t(lang, "notes_cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
          >
            {t(lang, "notes_delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Note Detail (fullscreen modal) ──────────────────────────────────────────

function NoteDetail({
  note,
  onEdit,
  onDelete,
  onClose,
}: {
  note: SermonNote;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const clr = getNoteColor(note.bookNum);
  const validPoints = note.mainPoints.filter(Boolean);
  const validRefs = note.scriptureRefs.filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto" style={{ background: "var(--bg)" }}>
      {/* Gradient header */}
      <div className={`relative flex-shrink-0 bg-gradient-to-b ${clr.bar} pt-safe`}>
        <div className="px-4 pt-4 pb-6">
          {/* Top row: close + actions */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-white/50 text-sm font-semibold hover:text-white/80 transition-colors"
            >
              <span className="text-base">←</span> {t(lang, "notes_back")}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); setTimeout(onEdit, 50); }}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${clr.accent} border-white/[0.15] hover:bg-white/[0.07]`}
              >
                {t(lang, "notes_edit")}
              </button>
              <button
                onClick={() => { onClose(); setTimeout(onDelete, 50); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/25 border border-white/[0.08] hover:bg-red-500/10 hover:text-red-400/70 hover:border-red-500/20 transition-all text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white leading-tight tracking-tight mb-2">
            {note.title || t(lang, "notes_untitled")}
          </h2>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-white/40">
            <span>{formatDate(note.date, lang)}</span>
            {note.pastor && <><span className="text-white/20">·</span><span>{note.pastor}</span></>}
            {note.church && <><span className="text-white/20">·</span><span>{note.church}</span></>}
          </div>

          {/* Passage + Tags */}
          {(note.passage || note.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {note.passage && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${clr.pill}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-60">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {note.passage}
                </span>
              )}
              {note.tags.map((tag) => {
                const tagClr = TAG_COLORS[tag] ?? "bg-white/[0.04] text-white/45 border-white/[0.09]";
                return (
                  <span key={tag} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${tagClr}`}>
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-6 space-y-6 max-w-2xl w-full mx-auto">

        {/* Main Points */}
        {validPoints.length > 0 && (
          <section>
            <p className={`text-[10px] font-black uppercase tracking-[0.14em] mb-3 ${clr.accent} opacity-70`}>
              {t(lang, "notes_main_points")}
            </p>
            <ul className={`space-y-3 pl-4 border-l-2 ${clr.border}`}>
              {validPoints.map((pt, i) => (
                <li key={i} className="flex gap-3 text-[14px] text-white/70 leading-relaxed">
                  <span className={`${clr.accent} opacity-60 flex-shrink-0 mt-1 text-[8px]`}>◆</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Notes body */}
        {note.notes && (
          <section>
            <p className={`text-[10px] font-black uppercase tracking-[0.14em] mb-3 ${clr.accent} opacity-70`}>
              Notes
            </p>
            <p className="text-[14px] text-white/60 leading-relaxed whitespace-pre-wrap">
              {note.notes}
            </p>
          </section>
        )}

        {/* Scripture Refs */}
        {validRefs.length > 0 && (
          <section className="pt-2 border-t border-white/[0.06]">
            <p className={`text-[10px] font-black uppercase tracking-[0.14em] mb-3 ${clr.accent} opacity-70`}>
              {t(lang, "notes_scripture_refs")}
            </p>
            <div className="flex flex-wrap gap-2">
              {validRefs.map((ref) => (
                <Link
                  key={ref}
                  href={refToHref(ref)}
                  onClick={onClose}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-colors ${clr.ref}`}
                >
                  {ref}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom spacer for safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
  onView,
}: {
  note: SermonNote;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const { lang } = useLanguage();
  const clr = getNoteColor(note.bookNum);

  return (
    <button
      onClick={onView}
      className="group w-full text-left rounded-[24px] shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-xl"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.045), transparent), var(--bg-2)", border: "1px solid var(--border)" }}
    >
      {/* Colored accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${clr.bar}`} />

      <div className="p-[18px] space-y-3">
        {/* Title + quick actions */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[16px] font-black leading-snug flex-1 tracking-tight transition-colors" style={{ color: "var(--fg)" }}>
            {note.title || t(lang, "notes_untitled")}
          </h4>
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${clr.accent} border-white/[0.12] hover:bg-white/[0.07] hover:border-white/[0.22]`}
            >
              {lang === "es" ? "Editar" : "Edit"}
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] hover:bg-red-500/10 hover:text-red-400/70 hover:border-red-500/20 transition-all text-xs"
              style={{ color: "var(--fg-dim)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]" style={{ color: "var(--fg-dim)" }}>
          <span className="font-medium">{formatDate(note.date, lang)}</span>
          {note.pastor && <><span className="opacity-40">·</span><span>{note.pastor}</span></>}
          {note.church && <><span className="opacity-40">·</span><span>{note.church}</span></>}
        </div>

        {/* Passage + Tags */}
        {(note.passage || note.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {note.passage && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${clr.pill}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-60">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {note.passage}
              </span>
            )}
            {note.tags.map((tag) => {
              const tagClr = TAG_COLORS[tag] ?? "bg-white/[0.04] text-white/45 border-white/[0.09]";
              return (
                <span key={tag} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${tagClr}`}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Preview snippet */}
        {note.notes && (
          <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "var(--fg-lo)" }}>
            {note.notes}
          </p>
        )}

        {/* Tap hint */}
        <p className={`text-[10px] font-semibold ${clr.accent} opacity-40`}>{t(lang, "notes_tap_hint")}</p>
      </div>
    </button>
  );
}

// ─── Note Editor (Full-Screen Immersive) ─────────────────────────────────────

function NoteEditorModal({
  initial,
  isNew,
  onSave,
  onCancel,
}: {
  initial: SermonNote;
  isNew: boolean;
  onSave: (note: SermonNote) => void;
  onCancel: () => void;
}) {
  const { lang } = useLanguage();
  const [draft, setDraft] = useState<SermonNote>({ ...initial });
  const [detectedRefs, setDetectedRefs] = useState<string[]>([]);
  const [newRef, setNewRef] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [chapterText, setChapterText] = useState(String(initial.chapter));
  const [scriptureInput, setScriptureInput] = useState("");
  const [showScriptureInput, setShowScriptureInput] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const patch = useCallback((p: Partial<SermonNote>) => setDraft((d) => ({ ...d, ...p })), []);

  // Auto-focus title on open
  useEffect(() => {
    const id = setTimeout(() => titleRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  // Auto-resize textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // Detect refs on notes change
  useEffect(() => {
    const found = detectScriptureRefs(draft.notes);
    setDetectedRefs(found.filter((r) => !draft.scriptureRefs.includes(r)));
  }, [draft.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open details for existing notes with data
  useEffect(() => {
    if (!isNew) {
      const hasDetails =
        draft.pastor || draft.church || draft.passage ||
        draft.tags.length > 0 || draft.mainPoints.filter(Boolean).length > 0 ||
        draft.scriptureRefs.filter(Boolean).length > 0;
      if (hasDetails) setShowDetails(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBook = BIBLE_BOOKS.find((b) => b.num === draft.bookNum) ?? BIBLE_BOOKS[39];

  const handleBookChange = (num: number) => {
    const book = BIBLE_BOOKS.find((b) => b.num === num);
    if (book) { patch({ bookNum: book.num, bookName: book.name, chapter: 1 }); setChapterText("1"); }
  };

  const updatePoint = (i: number, val: string) => {
    const pts = [...draft.mainPoints]; pts[i] = val; patch({ mainPoints: pts });
  };
  const addPoint = () => patch({ mainPoints: [...draft.mainPoints, ""] });
  const removePoint = (i: number) => {
    const pts = draft.mainPoints.filter((_, idx) => idx !== i);
    patch({ mainPoints: pts.length ? pts : [""] });
  };

  const toggleTag = (tag: string) =>
    patch({ tags: draft.tags.includes(tag) ? draft.tags.filter((t) => t !== tag) : [...draft.tags, tag] });

  const addRef = (ref: string) => {
    if (ref.trim() && !draft.scriptureRefs.includes(ref.trim()))
      patch({ scriptureRefs: [...draft.scriptureRefs, ref.trim()] });
  };
  const removeRef = (ref: string) =>
    patch({ scriptureRefs: draft.scriptureRefs.filter((r) => r !== ref) });

  const insertScripture = () => {
    if (!scriptureInput.trim()) return;
    const tag = `[${scriptureInput.trim()}]`;
    const ta = bodyRef.current;
    if (ta) {
      const start = ta.selectionStart ?? draft.notes.length;
      const newNotes = draft.notes.slice(0, start) + "\n" + tag + "\n" + draft.notes.slice(start);
      patch({ notes: newNotes.trimStart() });
      addRef(scriptureInput.trim());
    } else {
      patch({ notes: draft.notes + "\n" + tag });
      addRef(scriptureInput.trim());
    }
    setScriptureInput("");
    setShowScriptureInput(false);
  };

  const handleSave = () => onSave({ ...draft, updatedAt: new Date().toISOString() });

  const dateDisplay = (() => {
    try {
      return new Date(draft.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
    } catch { return draft.date; }
  })();

  // Inline scripture card detection from notes body
  const scriptureCardRefs = draft.notes.split("\n")
    .map((line) => { const m = line.match(/^\[(.+?)\]$/); return m ? m[1] : null; })
    .filter(Boolean) as string[];

  return (
    <>
      {/* ── Main full-screen editor ── */}
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
        >
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm font-semibold transition-opacity active:opacity-60"
            style={{ color: "var(--fg-lo)" }}
          >
            <span className="text-base">‹</span>
            <span>{t(lang, "notes_back")}</span>
          </button>
          <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--fg-dim)" }}>
            {isNew ? t(lang, "notes_new_note") : t(lang, "notes_edit_note")}
          </span>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all active:scale-[0.96]"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--accent) 40%, transparent)",
            }}
          >
            {t(lang, "notes_save")}
          </button>
        </div>

        {/* Scrollable writing area */}
        <div className="flex-1 overflow-y-auto pb-20 relative" style={{ background: "var(--bg)" }}>
          <div className="max-w-2xl mx-auto px-5 pt-6 pb-4">

            {/* Date */}
            <div className="flex items-center gap-2 mb-4">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg-dim)", flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="text-[12px]" style={{ color: "var(--fg-dim)", fontFamily: "Georgia, serif" }}>{dateDisplay}</span>
            </div>

            {/* Title */}
            <textarea
              ref={titleRef}
              value={draft.title}
              onChange={(e) => { patch({ title: e.target.value }); autoResize(e.target); }}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
              placeholder="Untitled Note"
              rows={1}
              className="w-full resize-none bg-transparent border-none outline-none leading-tight font-bold overflow-hidden"
              style={{
                fontSize: "clamp(24px, 6vw, 30px)",
                color: "var(--fg)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                minHeight: "44px",
                caretColor: "var(--accent)",
              }}
            />

            {/* Subtle divider */}
            <div className="my-5" style={{ height: "1px", background: "var(--border)", opacity: 0.6 }} />

            {/* Body */}
            <textarea
              ref={bodyRef}
              value={draft.notes}
              onChange={(e) => { patch({ notes: e.target.value }); autoResize(e.target); }}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
              placeholder={lang === "es" ? "Empieza a escribir tus notas…" : "Start writing your notes…"}
              rows={12}
              className="w-full resize-none bg-transparent border-none outline-none leading-relaxed"
              style={{
                fontSize: "15px",
                color: "var(--fg-mid)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                minHeight: "220px",
                caretColor: "var(--accent)",
              }}
            />

            {/* Inline scripture reference cards */}
            {scriptureCardRefs.length > 0 && (
              <div className="space-y-2 mt-3">
                {scriptureCardRefs.map((ref) => (
                  <div key={ref}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ background: "var(--accent-soft)", border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)", flexShrink: 0 }}>
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: "var(--accent-text)", fontFamily: "Georgia, serif" }}>{ref}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Auto-detected refs */}
            {detectedRefs.length > 0 && (
              <div className="mt-4 rounded-xl px-3.5 py-3" style={{ background: "var(--accent-soft)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}>
                <p className="text-[11px] font-bold mb-2" style={{ color: "var(--accent-text)" }}>
                  ✦ {lang === "es" ? "Referencias detectadas — toca para agregar" : "References detected — tap to add"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedRefs.map((ref) => (
                    <button key={ref} type="button" onClick={() => addRef(ref)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-opacity active:opacity-60"
                      style={{ background: "var(--accent)", color: "#fff", opacity: 0.85 }}>
                      + {ref}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Bible Book & Passage (sermon notes only) ── */}
            {draft.noteType !== "general" && (
              <div className="mt-8 flex items-center gap-2 rounded-2xl px-4 py-3"
                style={{ border: "1px solid var(--border)", background: "var(--bg-2)" }}>
                {/* Book dropdown */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)", flexShrink: 0 }}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <select
                  value={draft.bookNum}
                  onChange={(e) => handleBookChange(Number(e.target.value))}
                  className="bg-transparent text-sm font-semibold focus:outline-none [color-scheme:inherit] flex-shrink-0"
                  style={{ color: "var(--fg-mid)" }}
                >
                  <optgroup label={lang === "es" ? "— Antiguo Testamento —" : "— Old Testament —"}>
                    {BIBLE_BOOKS.filter((b) => b.testament === "OT").map((b) => (
                      <option key={b.num} value={b.num}>{bibleBookName(b, lang)}</option>
                    ))}
                  </optgroup>
                  <optgroup label={lang === "es" ? "— Nuevo Testamento —" : "— New Testament —"}>
                    {BIBLE_BOOKS.filter((b) => b.testament === "NT").map((b) => (
                      <option key={b.num} value={b.num}>{bibleBookName(b, lang)}</option>
                    ))}
                  </optgroup>
                </select>
                {/* Divider */}
                <span style={{ color: "var(--border)", fontSize: "18px", fontWeight: 100 }}>|</span>
                {/* Passage — free text e.g. "3:16" or "1:1-18" */}
                <input
                  type="text"
                  value={draft.passage}
                  onChange={(e) => patch({ passage: e.target.value })}
                  placeholder={`e.g. ${draft.chapter}:1–12`}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--fg-mid)", minWidth: 0 }}
                />
              </div>
            )}

            {/* + Add Details button */}
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-2 mt-5 text-sm font-semibold transition-opacity active:opacity-60"
              style={{ color: "var(--fg-lo)" }}
            >
              <span className="text-base font-bold" style={{ color: "var(--accent)" }}>+</span>
              <span>{lang === "es" ? "Agregar detalles" : "Add Details"}</span>
              <span className="text-xs font-normal" style={{ color: "var(--fg-dim)" }}>
                {lang === "es" ? "Agrega más información para organizar tu nota" : "Add more information to organize your note"}
              </span>
            </button>

            {/* Summary pills if details already filled */}
            {(draft.pastor || draft.church || draft.tags.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {draft.pastor && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: "var(--bg-2)", color: "var(--fg-mid)", border: "1px solid var(--border)" }}>
                    {draft.pastor}
                  </span>
                )}
                {draft.tags.slice(0, 3).map((t) => (
                  <span key={t} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ background: "var(--bg-2)", color: "var(--fg-lo)", border: "1px solid var(--border)" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Insert Scripture input (appears above toolbar) */}
        {showScriptureInput && (
          <div className="absolute bottom-16 left-4 right-4 z-[60] rounded-2xl shadow-2xl p-3 flex gap-2"
            style={{ background: "var(--bg-3)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <input autoFocus type="text" value={scriptureInput}
              onChange={(e) => setScriptureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") insertScripture(); if (e.key === "Escape") setShowScriptureInput(false); }}
              placeholder={lang === "es" ? "ej. Juan 3:16" : "e.g. John 3:16"}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--fg)" }} />
            <button onClick={insertScripture}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
              style={{ background: "var(--accent)" }}>{lang === "es" ? "Insertar" : "Insert"}</button>
            <button onClick={() => setShowScriptureInput(false)}
              className="px-2 py-1.5 rounded-xl text-xs font-semibold"
              style={{ color: "var(--fg-lo)" }}>✕</button>
          </div>
        )}


        {/* Bottom toolbar */}
        <div
          className="flex-shrink-0 flex items-center justify-around px-1 safe-area-bottom"
          style={{
            background: "var(--nav-bg)",
            borderTop: "1px solid var(--border)",
            minHeight: "56px",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Bold */}
          <button type="button" onClick={() => {
            const ta = bodyRef.current; if (!ta) return;
            const s = ta.selectionStart, e = ta.selectionEnd;
            const sel = draft.notes.slice(s, e);
            patch({ notes: draft.notes.slice(0, s) + (sel ? `**${sel}**` : "**bold**") + draft.notes.slice(e) });
          }} className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50" style={{ color: "var(--fg-lo)" }}>
            <span className="text-base font-black leading-none">B</span>
            <span className="text-[9px]">{lang === "es" ? "Negrita" : "Bold"}</span>
          </button>

          {/* Italic */}
          <button type="button" onClick={() => {
            const ta = bodyRef.current; if (!ta) return;
            const s = ta.selectionStart, e = ta.selectionEnd;
            const sel = draft.notes.slice(s, e);
            patch({ notes: draft.notes.slice(0, s) + (sel ? `_${sel}_` : "_italic_") + draft.notes.slice(e) });
          }} className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50" style={{ color: "var(--fg-lo)" }}>
            <span className="text-base italic font-bold leading-none">I</span>
            <span className="text-[9px]">{lang === "es" ? "Cursiva" : "Italic"}</span>
          </button>

          {/* Highlight */}
          <button type="button" onClick={() => {
            const ta = bodyRef.current; if (!ta) return;
            const s = ta.selectionStart, e = ta.selectionEnd;
            const sel = draft.notes.slice(s, e);
            patch({ notes: draft.notes.slice(0, s) + (sel ? `==${sel}==` : "==highlight==") + draft.notes.slice(e) });
          }} className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50" style={{ color: "var(--fg-lo)" }}>
            <span className="text-base leading-none">H</span>
            <span className="text-[9px]">Highlight</span>
          </button>

          {/* Scripture */}
          <button type="button" onClick={() => setShowScriptureInput(true)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50"
            style={{ color: "var(--accent)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[9px]">Scripture</span>
          </button>

          {/* Checklist */}
          <button type="button" onClick={() => {
            patch({ notes: draft.notes + (draft.notes.endsWith("\n") || !draft.notes ? "☐ " : "\n☐ ") });
            setTimeout(() => bodyRef.current?.focus(), 30);
          }} className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50" style={{ color: "var(--fg-lo)" }}>
            <span className="text-base leading-none">☐</span>
            <span className="text-[9px]">Checklist</span>
          </button>

          {/* Audio placeholder */}
          <button type="button"
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50"
            style={{ color: "var(--fg-dim)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[9px]">Audio</span>
          </button>

          {/* Image placeholder */}
          <button type="button"
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50"
            style={{ color: "var(--fg-dim)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
              <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[9px]">Image</span>
          </button>

          {/* Voice placeholder */}
          <button type="button"
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-opacity active:opacity-50"
            style={{ color: "var(--fg-dim)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[9px]">Voice</span>
          </button>
        </div>
      </div>

      {/* ── Add Details popup — fixed centered from top ── */}
      {showDetails && (
        <div
          className="fixed inset-0 z-[70] flex flex-col"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDetails(false); }}
        >
          {/* Panel drops from top */}
          <div
            className="w-full max-h-[85vh] overflow-y-auto flex-shrink-0"
            style={{
              background: "var(--bg)",
              borderBottom: "1px solid var(--border)",
              borderBottomLeftRadius: "24px",
              borderBottomRightRadius: "24px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 1 }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--fg)" }}>{lang === "es" ? "Agregar detalles" : "Add Details"}</h3>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-dim)" }}>
                  {lang === "es" ? "Agrega más información para organizar tu nota" : "Add more information to organize your note"}
                </p>
              </div>
              <button onClick={() => setShowDetails(false)}
                className="px-4 py-1.5 rounded-xl text-sm font-bold transition-opacity active:opacity-60"
                style={{ background: "var(--accent)", color: "#fff" }}>
                Done
              </button>
            </div>

            {/* 2-column grid of detail fields */}
            <div className="grid grid-cols-2 gap-px p-px" style={{ background: "var(--border)" }}>

              {/* Sermon Title */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">🎙</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>
                    {lang === "es" ? "Título del sermón" : "Sermon Title"}
                  </label>
                  <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Optional"
                    className="w-full text-xs bg-transparent border-none outline-none"
                    style={{ color: "var(--fg-mid)" }} />
                </div>
              </div>

              {/* Speaker / Pastor */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">👤</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>
                    {lang === "es" ? "Predicador / Pastor" : "Speaker / Pastor"}
                  </label>
                  <input type="text" value={draft.pastor ?? ""} onChange={(e) => patch({ pastor: e.target.value })}
                    placeholder="Optional"
                    className="w-full text-xs bg-transparent border-none outline-none"
                    style={{ color: "var(--fg-mid)" }} />
                </div>
              </div>

              {/* Bible Book */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">📖</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>
                    {lang === "es" ? "Libro de la Biblia" : "Bible Book"}
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <select value={draft.bookNum} onChange={(e) => handleBookChange(Number(e.target.value))}
                      className="flex-1 text-xs bg-transparent border-none outline-none [color-scheme:inherit] min-w-0"
                      style={{ color: "var(--fg-mid)" }}>
                      {BIBLE_BOOKS.map((b) => <option key={b.num} value={b.num}>{bibleBookName(b, lang)}</option>)}
                    </select>
                    <input type="text" inputMode="numeric" value={chapterText}
                      onChange={(e) => setChapterText(e.target.value.replace(/\D/g, ""))}
                      onBlur={() => {
                        const num = Math.max(1, Math.min(selectedBook.chapters, Number(chapterText) || 1));
                        setChapterText(String(num)); patch({ chapter: num });
                      }}
                      className="w-10 text-xs bg-transparent border-none outline-none text-center flex-shrink-0"
                      style={{ color: "var(--fg-mid)" }} />
                  </div>
                  <input type="text" value={draft.passage} onChange={(e) => patch({ passage: e.target.value })}
                    placeholder={lang === "es" ? `ej. ${bibleBookName(selectedBook, lang)} 3:16` : `e.g. ${selectedBook.name} 3:16`}
                    className="w-full text-[11px] bg-transparent border-none outline-none mt-1"
                    style={{ color: "var(--fg-lo)" }} />
                </div>
              </div>

              {/* Scripture References */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">🔖</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>
                    {lang === "es" ? "Referencias bíblicas" : "Scripture References"}
                  </label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {draft.scriptureRefs.filter(Boolean).map((ref) => (
                      <span key={ref} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}>
                        {ref}
                        <button type="button" onClick={() => removeRef(ref)} className="ml-0.5" style={{ color: "var(--fg-lo)" }}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={newRef} onChange={(e) => setNewRef(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { addRef(newRef); setNewRef(""); } }}
                      placeholder={lang === "es" ? "ej. Juan 3:16, Romanos 8:1" : "e.g. John 3:16, Romans 8:1"}
                      className="flex-1 text-[11px] bg-transparent border-none outline-none min-w-0"
                      style={{ color: "var(--fg-mid)" }} />
                    <button type="button" onClick={() => { addRef(newRef); setNewRef(""); }}
                      className="text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded transition-opacity active:opacity-60"
                      style={{ color: "var(--accent)", background: "var(--accent-soft)" }}>+</button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">🏷</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "var(--fg-dim)" }}>
                    {lang === "es" ? "Etiquetas" : "Tags"}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_TAGS.slice(0, 6).map((tag) => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                        style={draft.tags.includes(tag)
                          ? { background: "var(--accent)", color: "#fff" }
                          : { background: "var(--bg-2)", color: "var(--fg-lo)", border: "1px solid var(--border)" }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highlight Color */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">🎨</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "var(--fg-dim)" }}>Highlight Color</label>
                  <div className="flex gap-2">
                    {["#fde047","#86efac","#93c5fd","#f9a8d4"].map((c) => (
                      <button key={c} type="button"
                        className="w-6 h-6 rounded-full transition-transform active:scale-90 border-2"
                        style={{ background: c, borderColor: "transparent" }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">📂</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>Category</label>
                  <input type="text" placeholder="Select category" className="w-full text-xs bg-transparent border-none outline-none" style={{ color: "var(--fg-mid)" }} />
                </div>
              </div>

              {/* Church Name */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">⛪</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>Church Name</label>
                  <input type="text" value={draft.church ?? ""} onChange={(e) => patch({ church: e.target.value })}
                    placeholder="Optional"
                    className="w-full text-xs bg-transparent border-none outline-none"
                    style={{ color: "var(--fg-mid)" }} />
                </div>
              </div>

              {/* Attach Media */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">📎</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>Attach Media</label>
                  <p className="text-[11px]" style={{ color: "var(--fg-dim)" }}>Images, files, docs</p>
                </div>
              </div>

              {/* Audio Recording */}
              <div className="flex items-start gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="text-xl mt-0.5 flex-shrink-0">🎙</span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>Audio Recording</label>
                  <p className="text-[11px]" style={{ color: "var(--fg-dim)" }}>Record sermon audio</p>
                </div>
              </div>
            </div>

            {/* Main Points (full width) */}
            <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--fg-dim)" }}>Main Points</label>
              <div className="space-y-1.5">
                {draft.mainPoints.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--accent)" }}>◆</span>
                    <input type="text" value={pt} onChange={(e) => updatePoint(i, e.target.value)}
                      placeholder={`Point ${i + 1}…`}
                      className="flex-1 text-sm bg-transparent border-none outline-none"
                      style={{ color: "var(--fg-mid)" }} />
                    <button type="button" onClick={() => removePoint(i)}
                      className="w-6 h-6 flex items-center justify-center rounded text-xs flex-shrink-0"
                      style={{ color: "var(--fg-dim)" }}>✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPoint}
                className="text-[11px] font-semibold mt-2 transition-opacity active:opacity-60"
                style={{ color: "var(--accent)" }}>+ Add Point</button>
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-4" />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const { lang } = useLanguage();
  const [notes, setNotes] = useState<SermonNote[]>([]);
  const [mounted, setMounted] = useState(false);

  // Navigation state
  const [selectedBookNum, setSelectedBookNum] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  // Filter / sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTestament, setFilterTestament] = useState<"all" | "OT" | "NT">("all");
  const [filterTag, setFilterTag] = useState("");
  const [filterDate, setFilterDate] = useState<"all" | "this-year" | "last-year">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "by-book">("newest");

  // Sidebar collapse state
  const [otExpanded, setOtExpanded] = useState(true);
  const [ntExpanded, setNtExpanded] = useState(true);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SermonNote | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fullscreen note viewer
  const [viewingNote, setViewingNote] = useState<SermonNote | null>(null);

  // Active tab: "sermon" = Bible-book-organized, "general" = freeform flat list
  const [activeTab, setActiveTab] = useState<"sermon" | "general">("sermon");

  useEffect(() => {
    setNotes(loadNotes());
    setMounted(true);
  }, []);

  // ── Filtered + sorted notes ──────────────────────────────────────────────────

  const sermonNoteCount = notes.filter((n) => n.noteType !== "general").length;
  const generalNoteCount = notes.filter((n) => n.noteType === "general").length;

  const filtered = notes.filter((note) => {
    // Tab filter
    if (activeTab === "general") {
      if (note.noteType !== "general") return false;
    } else {
      if (note.noteType === "general") return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hit =
        note.title.toLowerCase().includes(q) ||
        (note.pastor ?? "").toLowerCase().includes(q) ||
        (note.church ?? "").toLowerCase().includes(q) ||
        note.notes.toLowerCase().includes(q) ||
        note.passage.toLowerCase().includes(q) ||
        note.bookName.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.scriptureRefs.some((r) => r.toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (filterTestament !== "all") {
      const book = BIBLE_BOOKS.find((b) => b.num === note.bookNum);
      if (book && book.testament !== filterTestament) return false;
    }
    if (filterTag && !note.tags.includes(filterTag)) return false;
    if (filterDate !== "all") {
      const thisYear = new Date().getFullYear();
      const ny = new Date(note.date).getFullYear();
      if (filterDate === "this-year" && ny !== thisYear) return false;
      if (filterDate === "last-year" && ny !== thisYear - 1) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") return b.date.localeCompare(a.date);
    if (sortOrder === "oldest") return a.date.localeCompare(b.date);
    if (a.bookNum !== b.bookNum) return a.bookNum - b.bookNum;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return b.date.localeCompare(a.date);
  });

  // Books that have at least one note in the filtered set
  const booksWithNotes = BIBLE_BOOKS.filter((book) =>
    sorted.some((n) => n.bookNum === book.num)
  );
  const otBooks = booksWithNotes.filter((b) => b.testament === "OT");
  const ntBooks = booksWithNotes.filter((b) => b.testament === "NT");

  // Selected book info
  const selectedBook = selectedBookNum
    ? BIBLE_BOOKS.find((b) => b.num === selectedBookNum) ?? null
    : null;

  const bookNotes = sorted.filter((n) => n.bookNum === selectedBookNum);
  const chaptersWithNotes = [...new Set(bookNotes.map((n) => n.chapter))].sort(
    (a, b) => a - b
  );

  // All tags for filter dropdown
  const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();
  const activeCount = activeTab === "sermon" ? sermonNoteCount : generalNoteCount;
  const hasActiveFilters = searchQuery || filterTestament !== "all" || filterTag || filterDate !== "all" || sortOrder !== "newest";

  // ── Actions ──────────────────────────────────────────────────────────────────

  const persistNotes = (next: SermonNote[]) => {
    setNotes(next);
    saveNotes(next);
  };

  const openNewNote = (bookNum?: number, chapter?: number) => {
    const book = bookNum ? BIBLE_BOOKS.find((b) => b.num === bookNum) : undefined;
    setEditingNote(
      makeNote({
        noteType: activeTab,
        bookNum: book?.num ?? 40,
        bookName: book?.name ?? "Matthew",
        chapter: chapter ?? 1,
      })
    );
    setIsNewNote(true);
    setEditorOpen(true);
  };

  const openEditNote = (note: SermonNote) => {
    setEditingNote({ ...note });
    setIsNewNote(false);
    setEditorOpen(true);
  };

  const handleSaveNote = (note: SermonNote) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      const next = exists
        ? prev.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev];
      saveNotes(next);
      return next;
    });
    setEditorOpen(false);
    setEditingNote(null);
    // Navigate to the saved note's book/chapter (sermon notes only)
    if (note.noteType !== "general") {
      setSelectedBookNum(note.bookNum);
      setExpandedChapters((prev) => new Set([...prev, note.chapter]));
    }
  };

  const handleDeleteNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    persistNotes(next);
    // If selected book now empty, return to library
    if (selectedBookNum && !next.some((n) => n.bookNum === selectedBookNum)) {
      setSelectedBookNum(null);
    }
    setConfirmDeleteId(null);
  };

  const toggleChapter = (ch: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
  };

  const selectBook = (num: number) => {
    setSelectedBookNum(num);
    setExpandedChapters(new Set());
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <span className="text-sm" style={{ color: "var(--fg-dim)" }}>Loading…</span>
      </div>
    );
  }

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          message={t(lang, "notes_confirm_delete")}
          onConfirm={() => handleDeleteNote(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          lang={lang}
        />
      )}

      {editorOpen && editingNote && (
        <NoteEditorModal
          initial={editingNote}
          isNew={isNewNote}
          onSave={handleSaveNote}
          onCancel={() => { setEditorOpen(false); setEditingNote(null); }}
        />
      )}

      {viewingNote && (
        <NoteDetail
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={() => { setViewingNote(null); openEditNote(viewingNote); }}
          onDelete={() => { setViewingNote(null); setConfirmDeleteId(viewingNote.id); }}
        />
      )}

      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        {/* ── Premium Header + Controls ───────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_20%_0%,rgba(201,169,97,0.14),transparent_42%),radial-gradient(circle_at_92%_14%,rgba(201,169,97,0.10),transparent_38%)]" />
          <div className="relative max-w-screen-xl mx-auto px-4 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.045] text-[#c9a961] shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
                  <NotesIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
                    {lang === "es" ? "Archivo personal" : "Personal archive"}
                  </p>
                  <h1 className="mt-0.5 text-[24px] font-black leading-none tracking-tight" style={{ color: "var(--fg)" }}>
                    {t(lang, "notes_title")}
                  </h1>
                  <p className="mt-1 text-[12px]" style={{ color: "var(--fg-dim)" }}>
                    {activeCount} {lang === "es" ? (activeCount === 1 ? "nota" : "notas") : `note${activeCount !== 1 ? "s" : ""}`}
                    {selectedBook && activeTab === "sermon" ? ` · ${bibleBookName(selectedBook, lang)}` : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => openNewNote(activeTab === "sermon" ? (selectedBookNum ?? undefined) : undefined)}
                className="flex min-h-12 flex-shrink-0 items-center gap-2 rounded-2xl px-4 text-[12px] font-black text-[#08090f] transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 74%, #ffffff 26%))",
                  boxShadow: "0 18px 36px color-mix(in srgb, var(--accent) 20%, transparent)",
                }}
              >
                <span className="text-lg leading-none">+</span>
                <span className="leading-tight">{t(lang, "notes_new")}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-white/[0.07] bg-black/[0.18] p-1">
              {(["sermon", "general"] as const).map((tab) => {
                const active = activeTab === tab;
                const count = tab === "sermon" ? sermonNoteCount : generalNoteCount;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); if (tab === "general") setSelectedBookNum(null); }}
                    className="rounded-[18px] px-3 py-3 text-left transition-all active:scale-[0.98]"
                    style={{
                      background: active ? "rgba(255,255,255,0.09)" : "transparent",
                      border: active ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                      boxShadow: active ? "0 10px 26px rgba(0,0,0,0.18)" : "none",
                    }}
                  >
                    <span className="block text-[13px] font-black" style={{ color: active ? "var(--fg)" : "var(--fg-lo)" }}>
                      {tab === "sermon" ? t(lang, "notes_tab_sermon") : t(lang, "notes_tab_general")}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold" style={{ color: active ? "var(--accent)" : "var(--fg-dim)" }}>
                      {count} {lang === "es" ? (count === 1 ? "nota" : "notas") : `note${count !== 1 ? "s" : ""}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.035] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg-dim)" }}>
                  <path d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder={t(lang, "notes_search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border bg-black/[0.14] py-3 pl-10 pr-4 text-[14px] focus:outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--fg)", caretColor: "var(--accent)" }}
                />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
              <select
                value={filterTestament}
                onChange={(e) => setFilterTestament(e.target.value as "all" | "OT" | "NT")}
                className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                style={{ background: "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
              >
                <option value="all">{t(lang, "notes_filter_all_books")}</option>
                <option value="OT">{t(lang, "notes_filter_ot")}</option>
                <option value="NT">{t(lang, "notes_filter_nt")}</option>
              </select>
              {allTags.length > 0 && (
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                  style={{ background: "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
                >
                  <option value="">All Tags</option>
                  {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as "all" | "this-year" | "last-year")}
                className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                style={{ background: "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
              >
                <option value="all">{t(lang, "notes_filter_all_time")}</option>
                <option value="this-year">{t(lang, "notes_filter_this_year")}</option>
                <option value="last-year">{t(lang, "notes_filter_last_year")}</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "by-book")}
                className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                style={{ background: "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
              >
                <option value="newest">{t(lang, "notes_sort_newest")}</option>
                <option value="oldest">{t(lang, "notes_sort_oldest")}</option>
                <option value="by-book">{t(lang, "notes_sort_by_book")}</option>
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTestament("all");
                    setFilterTag("");
                    setFilterDate("all");
                    setSortOrder("newest");
                  }}
                  className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-black transition-opacity active:opacity-70"
                  style={{ background: "var(--accent-soft)", borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)", color: "var(--accent-text)" }}
                >
                  {lang === "es" ? "Limpiar" : "Clear"}
                </button>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Layout ──────────────────────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto flex">

          {/* ── Sidebar (sermon tab only) ────────────────────────────────────── */}
          <aside
            className={`${activeTab === "general" ? "hidden" : "hidden md:flex"} flex-col w-60 lg:w-68 flex-shrink-0 min-h-[calc(100vh-56px)] sticky top-14 self-start max-h-[calc(100vh-56px)]`}
            style={{ borderRight: "1px solid var(--border)", background: "var(--bg)" }}
          >
            <div className="flex-1 overflow-y-auto py-2">
              {notes.length === 0 || booksWithNotes.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-white/15 text-xs">
                    {notes.length === 0
                      ? (lang === "es" ? "Aún no hay notas" : "No notes yet")
                      : (lang === "es" ? "No hay resultados para estos filtros" : "No matches for these filters")}
                  </p>
                </div>
              ) : (
                <>
                  {/* Old Testament section */}
                  {otBooks.length > 0 && (
                    <div>
                      <button
                        onClick={() => setOtExpanded((v) => !v)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/20 hover:text-white/35 transition-colors"
                      >
                        <span className="text-[8px]">{otExpanded ? "▾" : "▸"}</span>
                        {lang === "es" ? "Antiguo Testamento" : "Old Testament"}
                        <span className="ml-auto text-white/15">{otBooks.length}</span>
                      </button>
                      {otExpanded &&
                        otBooks.map((book) => {
                          const cnt = sorted.filter((n) => n.bookNum === book.num);
                          const chCnt = new Set(cnt.map((n) => n.chapter)).size;
                          const active = selectedBookNum === book.num;
                          const sclr = getNoteColor(book.num);
                          return (
                            <button
                              key={book.num}
                              onClick={() => selectBook(book.num)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-left border-l-2 transition-all ${
                                active
                                  ? sclr.sideActive
                                  : "border-l-transparent text-white/40 hover:text-white/65 hover:bg-white/[0.03]"
                              }`}
                            >
                              <span className="text-xs font-semibold flex-1 truncate">{bibleBookName(book, lang)}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? sclr.sideBadge
                                    : "bg-white/[0.06] text-white/20"
                                }`}
                              >
                                {chCnt}{lang === "es" ? "cap" : "ch"}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}

                  {/* New Testament section */}
                  {ntBooks.length > 0 && (
                    <div className="mt-1">
                      <button
                        onClick={() => setNtExpanded((v) => !v)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/20 hover:text-white/35 transition-colors"
                      >
                        <span className="text-[8px]">{ntExpanded ? "▾" : "▸"}</span>
                        {lang === "es" ? "Nuevo Testamento" : "New Testament"}
                        <span className="ml-auto text-white/15">{ntBooks.length}</span>
                      </button>
                      {ntExpanded &&
                        ntBooks.map((book) => {
                          const cnt = sorted.filter((n) => n.bookNum === book.num);
                          const chCnt = new Set(cnt.map((n) => n.chapter)).size;
                          const active = selectedBookNum === book.num;
                          const sclr = getNoteColor(book.num);
                          return (
                            <button
                              key={book.num}
                              onClick={() => selectBook(book.num)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-left border-l-2 transition-all ${
                                active
                                  ? sclr.sideActive
                                  : "border-l-transparent text-white/40 hover:text-white/65 hover:bg-white/[0.03]"
                              }`}
                            >
                              <span className="text-xs font-semibold flex-1 truncate">{bibleBookName(book, lang)}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? sclr.sideBadge
                                    : "bg-white/[0.06] text-white/20"
                                }`}
                              >
                                {chCnt}{lang === "es" ? "cap" : "ch"}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-[9px] font-mono" style={{ color: "var(--fg-dim)" }}>
                {notes.length} note{notes.length !== 1 ? "s" : ""} · saved locally
              </p>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 px-4 md:px-6 py-6">

            {/* ── General Notes tab ──────────────────────────────────────────── */}
            {activeTab === "general" && (
              <div>
                {sorted.length === 0 ? (
                  <div className="mx-auto flex min-h-[48vh] max-w-sm items-center justify-center">
                    <div className="w-full rounded-[32px] border border-white/[0.08] bg-white/[0.035] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                      <div className="relative mx-auto mb-5 w-fit">
                        <div
                          className="w-24 h-24 rounded-[30px] border border-white/[0.09] flex items-center justify-center shadow-2xl"
                          style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(255,255,255,0.035))" }}
                        >
                          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg-lo)" }}>
                          <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black" style={{ borderColor: "var(--bg)", background: "var(--accent)", color: "#08090f" }}>+</div>
                      </div>
                      <h2 className="text-[20px] font-black tracking-tight" style={{ color: "var(--fg)" }}>{t(lang, "notes_general_empty_title")}</h2>
                      <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed" style={{ color: "var(--fg-lo)" }}>{t(lang, "notes_general_empty_sub")}</p>
                      <div className="mt-5 flex justify-center gap-2">
                        <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Ideas" : "Ideas"}</span>
                        <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Oración" : "Prayer"}</span>
                      </div>
                      <button
                        onClick={() => openNewNote()}
                        className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 76%, #ffffff 24%))",
                          color: "#08090f",
                          boxShadow: "0 18px 36px color-mix(in srgb, var(--accent) 22%, transparent)",
                        }}
                      >
                        <span className="text-base font-black">+</span>
                        {t(lang, "notes_add_first")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sorted.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onView={() => setViewingNote(note)}
                        onEdit={() => openEditNote(note)}
                        onDelete={() => setConfirmDeleteId(note.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Sermon Notes tab content below ─────────────────────────────── */}
            {activeTab === "sermon" && (
            <>

            {/* ── Empty state (no sermon notes) ──────────────────────────────── */}
            {sermonNoteCount === 0 && (
              <div className="mx-auto flex min-h-[48vh] max-w-sm items-center justify-center">
                <div className="w-full rounded-[32px] border border-white/[0.08] bg-white/[0.035] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                  <div className="relative mx-auto mb-5 w-fit">
                    <div
                      className="w-24 h-24 rounded-[30px] border border-white/[0.09] flex items-center justify-center shadow-2xl"
                      style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(255,255,255,0.035))" }}
                    >
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg-lo)" }}>
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black" style={{ borderColor: "var(--bg)", background: "var(--accent)", color: "#08090f" }}>
                      +
                    </div>
                  </div>
                  <h2 className="text-[20px] font-black tracking-tight" style={{ color: "var(--fg)" }}>
                    {t(lang, "notes_sermon_empty_title")}
                  </h2>
                  <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed" style={{ color: "var(--fg-lo)" }}>
                    {t(lang, "notes_sermon_empty_sub")}
                  </p>
                  <div className="mt-5 flex justify-center gap-2">
                    <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Libro" : "Book"}</span>
                    <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Capítulo" : "Chapter"}</span>
                    <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Pasaje" : "Passage"}</span>
                  </div>
                  <button
                    onClick={() => openNewNote()}
                    className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 76%, #ffffff 24%))",
                      color: "#08090f",
                      boxShadow: "0 18px 36px color-mix(in srgb, var(--accent) 22%, transparent)",
                    }}
                  >
                    <span className="text-base font-black">+</span>
                    {t(lang, "notes_add_first")}
                  </button>
                </div>
              </div>
            )}

            {/* ── Library view (no book selected, has sermon notes) ──────────── */}
            {sermonNoteCount > 0 && !selectedBook && (
              <div>
                {/* Mobile: book grid */}
                <div className="md:hidden space-y-4 mb-4">
                  {[
                    { label: lang === "es" ? "Antiguo Testamento" : "Old Testament", books: otBooks },
                    { label: lang === "es" ? "Nuevo Testamento" : "New Testament", books: ntBooks },
                  ].map(
                    ({ label, books }) =>
                      books.length > 0 && (
                        <div key={label}>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-white/20 px-1 mb-2">
                            {label}
                          </h3>
                          <div className="space-y-1.5">
                            {books.map((book) => {
                              const cnt = sorted.filter((n) => n.bookNum === book.num);
                              const chCnt = new Set(cnt.map((n) => n.chapter)).size;
                              const bclr = getNoteColor(book.num);
                              return (
                                <button
                                  key={book.num}
                                  onClick={() => selectBook(book.num)}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all text-left"
                                >
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${bclr.dot}`} />
                                  <span className="flex-1 text-sm font-semibold text-white/60">
                                    {book.name}
                                  </span>
                                  <span className="text-[11px] text-white/20">
                                    {chCnt} ch · {cnt.length} note{cnt.length !== 1 ? "s" : ""}
                                  </span>
                                  <span className="text-white/15 text-xs">→</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                  )}
                  {booksWithNotes.length === 0 && (
                    <p className="text-white/20 text-sm text-center py-8">
                      No notes match your current filters
                    </p>
                  )}
                </div>

                {/* Desktop: recent notes overview */}
                <div className="hidden md:block">
                  <div className="flex items-baseline gap-3 mb-5">
                    <h2 className="text-base font-bold text-white/45">Study Library</h2>
                    <span className="text-xs text-white/20">
                      {sorted.length} note{sorted.length !== 1 ? "s" : ""} across{" "}
                      {booksWithNotes.length} book{booksWithNotes.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {sorted.length === 0 ? (
                    <p className="text-white/20 text-sm py-10 text-center">
                      No notes match your current filters
                    </p>
                  ) : (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">
                        Recent Notes
                      </p>
                      <div className="space-y-2">
                        {sorted.slice(0, 8).map((note) => {
                          const nclr = getNoteColor(note.bookNum);
                          return (
                            <button
                              key={note.id}
                              onClick={() => {
                                setSelectedBookNum(note.bookNum);
                                setExpandedChapters(new Set([note.chapter]));
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all text-left group"
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${nclr.dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white/60 truncate group-hover:text-white/75 transition-colors">
                                  {note.title || t(lang, "notes_untitled")}
                                </p>
                                <p className="text-[11px] text-white/25 truncate mt-0.5">
                                  {note.bookName} {note.chapter} · {formatDate(note.date, lang)}
                                  {note.pastor && ` · ${note.pastor}`}
                                </p>
                              </div>
                              {note.passage && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 hidden sm:inline ${nclr.pill}`}>
                                  {note.passage}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {sorted.length > 8 && (
                        <p className="text-xs text-white/15 mt-4 text-center">
                          Select a book in the sidebar to browse all notes
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Book Detail view ──────────────────────────────────────────── */}
            {activeTab === "sermon" && selectedBook && (
              <div>
                {/* Back button (mobile) */}
                <button
                  onClick={() => setSelectedBookNum(null)}
                  className="md:hidden flex items-center gap-1.5 text-xs text-emerald-400/60 hover:text-emerald-300 font-semibold mb-4 transition-colors"
                >
                  ← {lang === "es" ? "Biblioteca" : "Library"}
                </button>

                {/* Book heading */}
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white/80">{bibleBookName(selectedBook, lang)}</h2>
                    <p className="text-xs text-white/25 mt-1">
                      {chaptersWithNotes.length} {lang === "es" ? (chaptersWithNotes.length === 1 ? "capítulo" : "capítulos") : `chapter${chaptersWithNotes.length !== 1 ? "s" : ""}`} ·{" "}
                      {bookNotes.length} {lang === "es" ? (bookNotes.length === 1 ? "nota" : "notas") : `note${bookNotes.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <button
                    onClick={() => openNewNote(selectedBook.num)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/25 text-emerald-400/65 text-xs font-bold hover:bg-emerald-500/[0.08] hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    + {lang === "es" ? "Agregar nota" : "Add Note"}
                  </button>
                </div>

                {/* No notes after filter */}
                {chaptersWithNotes.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-12">
                    {lang === "es"
                      ? `No hay notas que coincidan con los filtros para ${bibleBookName(selectedBook, lang)}`
                      : `No notes match your current filters for ${selectedBook.name}`}
                  </p>
                )}

                {/* Chapter list */}
                {(() => {
                  const bookClr = getNoteColor(selectedBook.num);
                  return (
                    <div className="space-y-2.5">
                      {chaptersWithNotes.map((ch) => {
                        const chNotes = bookNotes
                          .filter((n) => n.chapter === ch)
                          .sort((a, b) =>
                            sortOrder === "oldest"
                              ? a.date.localeCompare(b.date)
                              : b.date.localeCompare(a.date)
                          );
                        const mostRecent = chNotes[0];
                        const isExp = expandedChapters.has(ch);

                        return (
                          <div
                            key={ch}
                            className="rounded-2xl overflow-hidden"
                            style={{ border: "1px solid var(--border)", background: "var(--bg-2)" }}
                          >
                            {/* Chapter header toggle */}
                            <button
                              onClick={() => toggleChapter(ch)}
                              className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left"
                            >
                              <span
                                className={`${bookClr.accent} opacity-60 text-[10px] transition-transform flex-shrink-0 ${
                                  isExp ? "rotate-90" : ""
                                }`}
                              >
                                ▸
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white/70 tracking-tight">
                                  Chapter {ch}
                                </p>
                                {!isExp && mostRecent && (
                                  <p className="text-[11px] text-white/30 truncate mt-0.5">
                                    {mostRecent.title || t(lang, "notes_untitled")} · {formatDate(mostRecent.date)}
                                  </p>
                                )}
                              </div>
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${bookClr.sideBadge} border-white/[0.07]`}>
                                {chNotes.length} note{chNotes.length !== 1 ? "s" : ""}
                              </span>
                            </button>

                            {/* Expanded: note cards */}
                            {isExp && (
                              <div className="p-3.5 pt-0 space-y-3">
                                <div className="border-t border-white/[0.05] pt-3.5 space-y-3">
                                  {chNotes.map((note) => (
                                    <NoteCard
                                      key={note.id}
                                      note={note}
                                      onView={() => setViewingNote(note)}
                                      onEdit={() => openEditNote(note)}
                                      onDelete={() => setConfirmDeleteId(note.id)}
                                    />
                                  ))}
                                  <button
                                    onClick={() => openNewNote(selectedBook.num, ch)}
                                    className={`w-full py-3 rounded-xl border border-dashed text-xs font-semibold transition-all ${bookClr.accent} opacity-40 hover:opacity-70 border-current hover:bg-white/[0.02]`}
                                  >
                                    + Add another note for Chapter {ch}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
            </> /* end sermon tab */
            )} {/* end activeTab === "sermon" */}
          </main>
        </div>
      </div>

    </>
  );
}
