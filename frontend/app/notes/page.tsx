"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/useLanguage";
import { isLightTheme, useTheme } from "../lib/useTheme";
import { t } from "../lib/i18n";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import { bibleBookName } from "../lib/spanishContent";
import {
  SermonNote,
  loadNotes,
  saveNotes,
  makeNote,
  detectScriptureRefs,
  getNoteDisplayRef,
  normalizeNotePassage,
} from "../lib/notesData";
import { AppSectionIcon } from "../components/AppSectionIcon";
import { SYNC_COMPLETE_EVENT } from "../lib/cloudSync";
import { formatParsedPassage, parsePassageInput } from "../lib/passageParser";

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
  return <AppSectionIcon name="notes" size={22} className={className} />;
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.4-3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SlidersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EditorToolButton({
  label,
  onClick,
  children,
  emphasized = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex min-h-12 min-w-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-transform active:scale-95"
      style={{
        color: emphasized ? "var(--fg)" : "var(--fg-lo)",
        background: emphasized ? "var(--bg-2)" : "transparent",
        border: emphasized ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <span className="grid h-5 place-items-center">{children}</span>
      <span className="max-w-[64px] truncate text-[9px] font-bold leading-none">{label}</span>
    </button>
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

const LIGHT_NOTE_TONE = {
  bar: "from-black/55 via-black/12 to-transparent",
  accent: "text-black",
  pill: "bg-black/[0.045] border-black/[0.12] text-black/70",
  dot: "bg-black",
  ref: "text-black/70 bg-black/[0.045] hover:bg-black/[0.08] hover:text-black border-black/[0.10]",
  points: "text-black/45 hover:text-black/70",
  border: "border-black/[0.12]",
  sideActive: "border-l-black bg-black/[0.055] text-black/80",
  sideBadge: "bg-black/[0.07] text-black/50",
};

function getThemeNoteColor(bookNum: number, isLight: boolean) {
  return isLight ? LIGHT_NOTE_TONE : getNoteColor(bookNum);
}

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
  const { theme } = useTheme();
  const isLight = isLightTheme(theme);
  const clr = getThemeNoteColor(note.bookNum, isLight);
  const validPoints = note.mainPoints.filter(Boolean);
  const validRefs = note.scriptureRefs.filter(Boolean);
  const noteRef = note.noteType === "general" ? note.passage : getNoteDisplayRef(note);

  return (
    <div className="fixed inset-0 z-[220] flex flex-col overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div className="relative flex-shrink-0 pt-safe" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-2xl px-5 pb-5 pt-4">
          {/* Top row: close + actions */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={onClose}
              className="flex min-h-11 items-center gap-1.5 text-sm font-semibold transition-opacity active:opacity-60"
              style={{ color: "var(--fg-lo)" }}
            >
              <span className="text-base">←</span> {t(lang, "notes_back")}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); setTimeout(onEdit, 50); }}
                className="min-h-10 rounded-xl px-4 text-[12px] font-bold transition-opacity active:opacity-60"
                style={{ border: "1px solid var(--border)", color: "var(--fg-mid)", background: "var(--bg-2)" }}
              >
                {t(lang, "notes_edit")}
              </button>
              <button
                onClick={() => { onClose(); setTimeout(onDelete, 50); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sm transition-all hover:bg-red-500/10 hover:text-red-500"
                style={{ color: "var(--fg-dim)", border: "1px solid var(--border)" }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-[28px] font-black leading-tight tracking-tight" style={{ color: "var(--fg)" }}>
            {note.title || t(lang, "notes_untitled")}
          </h2>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]" style={{ color: "var(--fg-dim)" }}>
            <span>{formatDate(note.date, lang)}</span>
            {note.pastor && <><span>·</span><span>{note.pastor}</span></>}
            {note.church && <><span>·</span><span>{note.church}</span></>}
          </div>

          {/* Passage + Tags */}
          {(noteRef || note.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {noteRef && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${clr.pill}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-60">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {noteRef}
                </span>
              )}
              {note.tags.map((tag) => {
                const tagClr = TAG_COLORS[tag] ?? (isLight ? "bg-black/[0.06] text-black/50 border-black/[0.12]" : "bg-white/[0.04] text-white/45 border-white/[0.09]");
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
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.7)" }}>
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
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)" }}>
              {note.notes}
            </p>
          </section>
        )}

        {/* Scripture Refs */}
        {validRefs.length > 0 && (
          <section className="pt-2" style={{ borderTop: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)" }}>
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
  const { theme } = useTheme();
  const isLight = isLightTheme(theme);
  const clr = getThemeNoteColor(note.bookNum, isLight);
  const noteRef = note.noteType === "general" ? note.passage : getNoteDisplayRef(note);

  return (
    <article
      className="group w-full overflow-hidden rounded-[24px] text-left transition-all duration-200"
      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", boxShadow: isLight ? "0 10px 30px rgba(15,23,42,0.06)" : "0 14px 34px rgba(0,0,0,0.22)" }}
    >
      {/* Colored accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${clr.bar}`} />

      <div className="p-[18px] space-y-3">
        {/* Title + quick actions */}
        <div className="flex items-start justify-between gap-3">
          <button onClick={onView} className="min-w-0 flex-1 text-left">
            <h4 className="text-[17px] font-black leading-snug tracking-tight" style={{ color: "var(--fg)" }}>
              {note.title || t(lang, "notes_untitled")}
            </h4>
          </button>
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${clr.accent}`}
              style={{ borderColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)" }}
            >
              {lang === "es" ? "Editar" : "Edit"}
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-400/70 transition-all text-xs"
              style={{ color: "var(--fg-dim)", border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.07)" }}
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
        {(noteRef || note.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {noteRef && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${clr.pill}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-60">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {noteRef}
              </span>
            )}
            {note.tags.map((tag) => {
              const tagClr = TAG_COLORS[tag] ?? (isLight ? "bg-black/[0.06] text-black/50 border-black/[0.12]" : "bg-white/[0.04] text-white/45 border-white/[0.09]");
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
          <button onClick={onView} className="block w-full text-left">
            <p className="line-clamp-3 text-[13px] leading-relaxed" style={{ color: "var(--fg-lo)" }}>{note.notes}</p>
          </button>
        )}

        <button onClick={onView} className="flex min-h-10 w-full items-center justify-between border-t pt-3 text-[11px] font-black uppercase tracking-[0.12em]" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>
          <span>{lang === "es" ? "Abrir nota" : "Open note"}</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

function PassagePicker({
  value,
  selectedBook,
  chapter,
  verseStart,
  lang,
  onPassageChange,
  onBookChange,
  onChapterChange,
  onVerseChange,
  showRequiredError = false,
  compact = false,
}: {
  value: string;
  selectedBook: typeof BIBLE_BOOKS[number];
  chapter: number;
  verseStart?: number;
  lang: "en" | "es";
  onPassageChange: (value: string) => void;
  onBookChange: (bookNum: number) => void;
  onChapterChange: (chapter: number) => void;
  onVerseChange: (verse: number) => void;
  showRequiredError?: boolean;
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const activeTheme = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) ?? theme;
  const isLight = isLightTheme(activeTheme);
  const maxChapter = selectedBook.chapters;
  const parsedValue = parsePassageInput(value, selectedBook.num);
  const savedReference = parsedValue?.hasExplicitChapter && parsedValue.verseStart
    ? parsedValue.displayRef
    : formatParsedPassage({ bookName: selectedBook.name, chapter, verseStart });

  return (
    <div
      className={compact ? "space-y-2" : "rounded-2xl px-4 py-4"}
      style={
        compact
          ? undefined
          : { border: "1px solid var(--border)", background: "var(--bg-2)" }
      }
    >
      <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--fg-dim)" }}>
        {lang === "es" ? "Libro, capítulo y versículo" : "Book, chapter and verse"}
      </label>
      <div className="flex items-center gap-2 rounded-2xl px-3 py-3" style={{ border: showRequiredError ? "1px solid rgba(239,68,68,0.55)" : "1px solid var(--border)", background: isLight ? "#ffffff" : "rgba(255,255,255,0.035)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg-lo)", flexShrink: 0 }}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onPassageChange(e.target.value)}
          placeholder={lang === "es" ? "Proverbios 4:5 o 4:5" : "Proverbs 4:5 or 4:5"}
          className="flex-1 bg-transparent text-[15px] font-semibold focus:outline-none"
          style={{ color: "var(--fg)", minWidth: 0 }}
        />
      </div>
      {showRequiredError && (
        <p className="mt-2 rounded-xl px-3 py-2 text-[11px] font-bold leading-relaxed" style={{ background: "rgba(239,68,68,0.09)", color: "#ef4444" }}>
          {lang === "es"
            ? "Agrega un versículo para guardar esta nota, por ejemplo Proverbios 4:5."
            : "Add a verse before saving this note, for example Proverbs 4:5."}
        </p>
      )}
      <div className="mt-2 px-1">
        <p className="truncate text-[11px]" style={{ color: "var(--fg-dim)" }}>
          {lang === "es" ? "Guardado como" : "Saved as"}: <strong style={{ color: "var(--fg-lo)" }}>{lang === "es" ? savedReference.replace(selectedBook.name, bibleBookName(selectedBook, lang)) : savedReference}</strong>
        </p>
      </div>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_78px_78px] gap-2">
        <select
          value={selectedBook.num}
          onChange={(e) => onBookChange(Number(e.target.value))}
          className="rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none [color-scheme:inherit]"
          style={{ color: "var(--fg-mid)", border: "1px solid var(--border)", background: isLight ? "#ffffff" : "rgba(255,255,255,0.035)" }}
        >
          {BIBLE_BOOKS.map((book) => (
            <option key={book.num} value={book.num}>{bibleBookName(book, lang)}</option>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={maxChapter}
          value={chapter}
          onChange={(e) => onChapterChange(Number(e.target.value) || 1)}
          aria-label={lang === "es" ? "Capítulo" : "Chapter"}
          className="rounded-2xl px-3 py-2.5 text-center text-sm font-black outline-none"
          style={{ color: "var(--fg)", border: "1px solid var(--border)", background: isLight ? "#ffffff" : "rgba(255,255,255,0.035)" }}
        />
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={verseStart ?? ""}
          onChange={(e) => onVerseChange(Number(e.target.value) || 1)}
          aria-label={lang === "es" ? "Versículo" : "Verse"}
          placeholder={lang === "es" ? "Ver." : "Ver."}
          className="rounded-2xl px-3 py-2.5 text-center text-sm font-black outline-none"
          style={{ color: "var(--fg)", border: "1px solid var(--border)", background: isLight ? "#ffffff" : "rgba(255,255,255,0.035)" }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--fg-dim)" }}>
        {lang === "es"
          ? "Escribe 4:5 si ya elegiste el libro, o Proverbios 4:5 para cambiar libro y pasaje."
          : "Type 4:5 if the book is already selected, or Proverbs 4:5 to change book and passage."}
      </p>
    </div>
  );
}

// ─── Note Editor (Full-Screen Immersive) ─────────────────────────────────────

function prepareNoteForEditor(note: SermonNote): SermonNote {
  const legacyRefs = note.notes
    .split("\n")
    .map((line) => line.trim().match(/^\[([^\]]+)\]$/)?.[1]?.trim())
    .filter(Boolean) as string[];

  const notes = note.notes
    .split("\n")
    .filter((line) => !/^\s*\[[^\]]+\]\s*$/.test(line))
    .join("\n")
    .replace(/_==([^=\n]+)==_/g, "$1")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/==([^=\n]+)==/g, "$1");

  return {
    ...note,
    notes,
    scriptureRefs: [...new Set([...note.scriptureRefs, ...legacyRefs])],
  };
}

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
  const { theme } = useTheme();
  const [draft, setDraft] = useState<SermonNote>(() => prepareNoteForEditor(initial));
  const [detectedRefs, setDetectedRefs] = useState<string[]>([]);
  const [scriptureInput, setScriptureInput] = useState("");
  const [showScriptureInput, setShowScriptureInput] = useState(false);
  const [fullscreenWrite, setFullscreenWrite] = useState(false);
  const [isLandscapeWriting, setIsLandscapeWriting] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fullscreenBodyRef = useRef<HTMLTextAreaElement>(null);

  // Determine light mode inside editor
  const editorTheme = (typeof window !== "undefined"
    ? document.documentElement.getAttribute("data-theme")
    : null) ?? theme;
  const isEditorLight = isLightTheme(editorTheme);

  const patch = useCallback((p: Partial<SermonNote>) => setDraft((d) => ({ ...d, ...p })), []);

  useEffect(() => {
    document.documentElement.setAttribute("data-app-reader-open", "true");
    return () => document.documentElement.removeAttribute("data-app-reader-open");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 560px)");
    const update = () => setIsLandscapeWriting(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Auto-focus fullscreen textarea when opened
  useEffect(() => {
    if (fullscreenWrite || isLandscapeWriting) {
      const id = setTimeout(() => {
        const el = fullscreenBodyRef.current;
        if (el) {
          el.focus();
          el.selectionStart = el.selectionEnd = el.value.length;
        }
      }, 60);
      return () => clearTimeout(id);
    }
  }, [fullscreenWrite, isLandscapeWriting]);

  // Auto-resize textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoResize(titleRef.current);
    autoResize(bodyRef.current);
  }, []);

  // Detect refs on notes change
  useEffect(() => {
    const found = detectScriptureRefs(draft.notes);
    setDetectedRefs(found.filter((r) => !draft.scriptureRefs.includes(r)));
  }, [draft.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBook = BIBLE_BOOKS.find((b) => b.num === draft.bookNum) ?? BIBLE_BOOKS[39];

  const handleBookChange = (num: number) => {
    const book = BIBLE_BOOKS.find((b) => b.num === num);
    if (!book) return;
    setSaveAttempted(false);
    const nextChapter = Math.max(1, Math.min(book.chapters, draft.chapter || 1));
    const displayRef = formatParsedPassage({
      bookName: book.name,
      chapter: nextChapter,
      verseStart: draft.verseStart,
      verseEnd: draft.verseEnd,
    });
    patch({
      bookNum: book.num,
      bookName: book.name,
      chapter: nextChapter,
      displayRef,
      passage: displayRef,
    });
  };

  const handlePassageChange = (value: string) => {
    setSaveAttempted(false);
    const parsed = parsePassageInput(value, draft.bookNum);
    if (parsed) {
      const parsedBook = BIBLE_BOOKS.find((book) => book.num === parsed.bookNum);
      const nextChapter = parsed.hasExplicitChapter
        ? parsed.chapter
        : Math.max(1, Math.min(parsedBook?.chapters ?? selectedBook.chapters, draft.chapter || 1));
      const displayRef = parsed.hasExplicitChapter
        ? parsed.displayRef
        : formatParsedPassage({
            bookName: parsed.bookName,
            chapter: nextChapter,
            verseStart: draft.verseStart,
            verseEnd: draft.verseEnd,
          });
      patch({
        passage: value,
        bookNum: parsed.bookNum,
        bookName: parsed.bookName,
        chapter: nextChapter,
        verseStart: parsed.hasExplicitChapter ? parsed.verseStart : draft.verseStart,
        verseEnd: parsed.hasExplicitChapter ? parsed.verseEnd : draft.verseEnd,
        displayRef,
      });
      return;
    }
    patch({ passage: value });
  };

  const handleChapterChange = (value: number) => {
    setSaveAttempted(false);
    const nextChapter = Math.max(1, Math.min(selectedBook.chapters, value || 1));
    const displayRef = formatParsedPassage({
      bookName: selectedBook.name,
      chapter: nextChapter,
      verseStart: draft.verseStart,
      verseEnd: draft.verseEnd,
    });
    patch({
      chapter: nextChapter,
      bookName: selectedBook.name,
      displayRef,
      passage: displayRef,
    });
  };

  const handleVerseChange = (value: number) => {
    setSaveAttempted(false);
    const nextVerse = Math.max(1, value || 1);
    const displayRef = formatParsedPassage({
      bookName: selectedBook.name,
      chapter: draft.chapter || 1,
      verseStart: nextVerse,
    });
    patch({
      bookName: selectedBook.name,
      verseStart: nextVerse,
      verseEnd: undefined,
      displayRef,
      passage: displayRef,
    });
  };

  const addRef = (ref: string) => {
    if (ref.trim() && !draft.scriptureRefs.includes(ref.trim()))
      patch({ scriptureRefs: [...draft.scriptureRefs, ref.trim()] });
  };
  const removeRef = (ref: string) =>
    patch({ scriptureRefs: draft.scriptureRefs.filter((r) => r !== ref) });

  const insertScripture = () => {
    if (!scriptureInput.trim()) return;
    addRef(scriptureInput.trim());
    setScriptureInput("");
    setShowScriptureInput(false);
    setTimeout(() => bodyRef.current?.focus(), 30);
  };

  const insertAtCursor = (text: string) => {
    const ta = bodyRef.current;
    const start = ta?.selectionStart ?? draft.notes.length;
    const end = ta?.selectionEnd ?? start;
    const needsLineBreak = start > 0 && draft.notes[start - 1] !== "\n";
    const inserted = `${needsLineBreak ? "\n" : ""}${text}`;
    const next = draft.notes.slice(0, start) + inserted + draft.notes.slice(end);
    patch({ notes: next });
    requestAnimationFrame(() => {
      const editor = bodyRef.current;
      if (!editor) return;
      const caret = start + inserted.length;
      editor.focus();
      editor.setSelectionRange(caret, caret);
      autoResize(editor);
    });
  };

  const normalizedDraft = normalizeNotePassage(draft);
  const passageMissingVerse = normalizedDraft.noteType !== "general" && !normalizedDraft.verseStart;
  const handleSave = () => {
    if (passageMissingVerse) {
      setSaveAttempted(true);
      return;
    }
    onSave({ ...normalizedDraft, updatedAt: new Date().toISOString() });
  };

  const dateDisplay = (() => {
    try {
      return new Date(draft.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
    } catch { return draft.date; }
  })();

  // Fullscreen writing mode colors
  const writingModeActive = fullscreenWrite || isLandscapeWriting;
  const fsBg = isEditorLight ? "#ffffff" : "#0e1018";
  const fsFg = isEditorLight ? "#1a1a1a" : "#e8e8e8";
  const fsBorder = isEditorLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)";
  const fsFgDim = isEditorLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)";

  return (
    <>
      {/* ── Fullscreen Writing Overlay ── */}
      {writingModeActive && (
        <div
          className="fixed inset-x-0 top-0 flex h-[100dvh] flex-col"
          style={{
            zIndex: 9999,
            background: fsBg,
            opacity: writingModeActive ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-5 flex-shrink-0"
            style={{
              height: "52px",
              borderBottom: `1px solid ${fsBorder}`,
              background: fsBg,
            }}
          >
            {/* Note title (truncated, read-only) */}
            <span
              className="text-[13px] font-semibold truncate max-w-[55%]"
              style={{ color: fsFgDim, fontFamily: "Georgia, serif" }}
            >
              {draft.title || (lang === "es" ? "Sin título" : "Untitled")}
            </span>

            <div className="flex items-center gap-3">
              {/* Save */}
              <button
                type="button"
                onClick={() => { handleSave(); setFullscreenWrite(false); }}
                className="px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.96]"
                style={{
                  background: isEditorLight ? "#111111" : "var(--accent)",
                  color: "#fff",
                }}
              >
                {t(lang, "notes_save")}
              </button>

              {!isLandscapeWriting && (
                <button
                  type="button"
                  onClick={() => setFullscreenWrite(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity active:opacity-50"
                  style={{ color: fsFgDim }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 01-2 2H3"/>
                    <path d="M21 8h-3a2 2 0 01-2-2V3"/>
                    <path d="M3 16h3a2 2 0 012 2v3"/>
                    <path d="M16 21v-3a2 2 0 012-2h3"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Textarea fills remaining space */}
          <textarea
            ref={fullscreenBodyRef}
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder={lang === "es" ? "Empieza a escribir tus notas…" : "Start writing your notes…"}
            className="flex-1 w-full resize-none border-none outline-none"
            style={{
              background: fsBg,
              color: fsFg,
              fontSize: "16px",
              lineHeight: "1.75",
              fontFamily: "Georgia, 'Times New Roman', serif",
              padding: "28px 24px",
              caretColor: "var(--accent)",
            }}
          />
        </div>
      )}

      {/* ── Main full-screen editor ── */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col" style={{ background: "var(--bg)" }}>

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
              background: isEditorLight ? "#111111" : "var(--accent)",
              color: "#fff",
              boxShadow: isEditorLight ? "none" : "0 2px 8px color-mix(in srgb, var(--accent) 40%, transparent)",
            }}
          >
            {t(lang, "notes_save")}
          </button>
        </div>

        {/* Scrollable writing area */}
        <div
          className="flex-1 overflow-y-auto relative"
          style={{
            background: "var(--bg)",
            paddingBottom: "calc(92px + env(safe-area-inset-bottom))",
          }}
        >
          <div className="mx-auto w-full max-w-2xl px-5 pb-8 pt-6">

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
              placeholder={lang === "es" ? "Nota sin título" : "Untitled note"}
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
            <div
              className="relative rounded-[28px] p-4"
              style={{
                background: isEditorLight ? "#f8f9fb" : "var(--bg-2)",
                border: "1px solid var(--border)",
                boxShadow: isEditorLight ? "0 18px 44px rgba(0,0,0,0.06)" : "0 18px 44px rgba(0,0,0,0.20)",
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "var(--fg-dim)" }}>
                  {draft.noteType === "general"
                    ? (lang === "es" ? "Nota" : "Note")
                    : (lang === "es" ? "Notas del sermón" : "Sermon notes")}
                </label>
                <button
                  type="button"
                  onClick={() => setFullscreenWrite(true)}
                  className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] transition-opacity active:opacity-60"
                  style={{
                    background: isEditorLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-mid)",
                  }}
                >
                  {lang === "es" ? "Escritura limpia" : "Focus writing"}
                </button>
              </div>
              <textarea
                ref={bodyRef}
                value={draft.notes}
                onChange={(e) => { patch({ notes: e.target.value }); autoResize(e.target); }}
                onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
                onFocus={(e) => {
                  setTimeout(() => e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" }), 120);
                }}
                placeholder={lang === "es" ? "Empieza a escribir tus notas…" : "Start writing your notes…"}
                rows={10}
                className="w-full resize-none overflow-hidden border-none bg-transparent leading-relaxed outline-none"
                style={{
                  fontSize: "16px",
                  color: "var(--fg-mid)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  minHeight: "clamp(340px, 52dvh, 620px)",
                  paddingBottom: "56px",
                  scrollPaddingBottom: "32dvh",
                  caretColor: "var(--accent)",
                }}
              />
              {/* Fullscreen expand button */}
              <button
                type="button"
                onClick={() => setFullscreenWrite(true)}
                title="Fullscreen writing mode"
                className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-xl transition-opacity active:opacity-50"
                style={{
                  opacity: 0.45,
                  background: isEditorLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.35"; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fg-lo)" }}>
                  <path d="M8 3H5a2 2 0 00-2 2v3"/>
                  <path d="M21 8V5a2 2 0 00-2-2h-3"/>
                  <path d="M3 16v3a2 2 0 002 2h3"/>
                  <path d="M16 21h3a2 2 0 002-2v-3"/>
                </svg>
              </button>
            </div>

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

            {draft.scriptureRefs.filter(Boolean).length > 0 && (
              <div className="mt-4 rounded-2xl p-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "var(--fg-dim)" }}>
                  {lang === "es" ? "Referencias guardadas" : "Saved references"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {draft.scriptureRefs.filter(Boolean).map((ref) => (
                    <span key={ref} className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-[12px] font-bold" style={{ background: isEditorLight ? "#e5e7eb" : "rgba(255,255,255,0.06)", color: "var(--fg-mid)" }}>
                      {ref}
                      <button type="button" onClick={() => removeRef(ref)} aria-label={`${lang === "es" ? "Eliminar" : "Remove"} ${ref}`} style={{ color: "var(--fg-dim)" }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Bible Book & Passage (sermon notes only) ── */}
            {draft.noteType !== "general" && (
              <div className="mt-8">
                <PassagePicker
                  value={draft.passage}
                  selectedBook={selectedBook}
                  chapter={draft.chapter}
                  verseStart={draft.verseStart}
                  lang={lang}
                  onPassageChange={handlePassageChange}
                  onBookChange={handleBookChange}
                  onChapterChange={handleChapterChange}
                  onVerseChange={handleVerseChange}
                  showRequiredError={saveAttempted && passageMissingVerse}
                />
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
              style={{ background: isEditorLight ? "#111111" : "var(--accent)" }}>{lang === "es" ? "Guardar" : "Save"}</button>
            <button onClick={() => setShowScriptureInput(false)}
              className="px-2 py-1.5 rounded-xl text-xs font-semibold"
              style={{ color: "var(--fg-lo)" }}>✕</button>
          </div>
        )}


        {/* Keyboard-safe editor dock: only actions that work in plain text. */}
        <div
          className="flex flex-shrink-0 items-center justify-around gap-1 px-2 pt-1.5 safe-area-bottom"
          style={{
            background: "color-mix(in srgb, var(--nav-bg) 96%, transparent)",
            borderTop: "1px solid var(--border)",
            minHeight: "62px",
            paddingBottom: "max(6px, env(safe-area-inset-bottom))",
            boxShadow: "0 -12px 32px rgba(0,0,0,0.08)",
            backdropFilter: "blur(18px)",
          }}
          aria-label={lang === "es" ? "Herramientas de la nota" : "Note tools"}
        >
          <EditorToolButton label={lang === "es" ? "Viñeta" : "Bullet"} onClick={() => insertAtCursor("• ")}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="5" cy="7" r="1.5" fill="currentColor" /><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="5" cy="17" r="1.5" fill="currentColor" />
              <path d="M10 7h9M10 12h9M10 17h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </EditorToolButton>

          <EditorToolButton label={lang === "es" ? "Lista" : "Checklist"} onClick={() => insertAtCursor("☐ ")}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" /><rect x="3" y="15" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 6.5h8M12 17.5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </EditorToolButton>

          <EditorToolButton label={lang === "es" ? "Biblia" : "Scripture"} onClick={() => setShowScriptureInput(true)} emphasized>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </EditorToolButton>

          <EditorToolButton label={lang === "es" ? "Enfoque" : "Focus"} onClick={() => setFullscreenWrite(true)}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
            </svg>
          </EditorToolButton>

          <EditorToolButton label={lang === "es" ? "Guardar" : "Save"} onClick={handleSave}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </EditorToolButton>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const activeTheme = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) ?? theme;
  const isLight = isLightTheme(activeTheme);
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
  const [showFilters, setShowFilters] = useState(false);

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
    const refreshNotes = () => setNotes(loadNotes());
    refreshNotes();
    setMounted(true);
    window.addEventListener(SYNC_COMPLETE_EVENT, refreshNotes);
    window.addEventListener("storage", refreshNotes);
    return () => {
      window.removeEventListener(SYNC_COMPLETE_EVENT, refreshNotes);
      window.removeEventListener("storage", refreshNotes);
    };
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
        (note.noteType === "general" ? note.passage : getNoteDisplayRef(note)).toLowerCase().includes(q) ||
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
    const noteToSave = normalizeNotePassage(note);
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === noteToSave.id);
      const next = exists
        ? prev.map((n) => (n.id === noteToSave.id ? noteToSave : n))
        : [noteToSave, ...prev];
      saveNotes(next);
      return next;
    });
    setEditorOpen(false);
    setEditingNote(null);
    // Navigate to the saved note's book/chapter (sermon notes only)
    if (noteToSave.noteType !== "general") {
      setSelectedBookNum(noteToSave.bookNum);
      setExpandedChapters((prev) => new Set([...prev, noteToSave.chapter]));
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
          {!isLight && <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_20%_0%,rgba(201,169,97,0.14),transparent_42%),radial-gradient(circle_at_92%_14%,rgba(201,169,97,0.10),transparent_38%)]" />}
          <div className="relative max-w-screen-xl mx-auto px-4 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl"
                  style={{
                    border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.09)",
                    background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.045)",
                    color: isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.55)",
                  }}>
                  <NotesIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: isLight ? "var(--fg-dim)" : "var(--accent)" }}>
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
                className="flex min-h-12 flex-shrink-0 items-center gap-2 rounded-2xl px-4 text-[12px] font-black transition-all active:scale-[0.97]"
                style={{
                  background: isLight ? "#e5e7eb" : "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 74%, #ffffff 26%))",
                  color: isLight ? "#0a0a0a" : "#08090f",
                  boxShadow: isLight ? "none" : "0 18px 36px color-mix(in srgb, var(--accent) 20%, transparent)",
                }}
              >
                <span className="text-lg leading-none">+</span>
                <span className="leading-tight">{t(lang, "notes_new")}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-[22px] p-1" style={{ border: isLight ? "1px solid rgba(0,0,0,0.09)" : "1px solid rgba(255,255,255,0.07)", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.18)" }}>
              {(["sermon", "general"] as const).map((tab) => {
                const active = activeTab === tab;
                const count = tab === "sermon" ? sermonNoteCount : generalNoteCount;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); if (tab === "general") setSelectedBookNum(null); }}
                    className="rounded-[18px] px-3 py-3 text-left transition-all active:scale-[0.98]"
                    style={{
                      background: active ? (isLight ? "#ffffff" : "rgba(255,255,255,0.09)") : "transparent",
                      border: active ? (isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)") : "1px solid transparent",
                      boxShadow: active ? (isLight ? "0 2px 12px rgba(0,0,0,0.10)" : "0 10px 26px rgba(0,0,0,0.18)") : "none",
                    }}
                  >
                    <span className="block text-[13px] font-black" style={{ color: active ? "var(--fg)" : "var(--fg-lo)" }}>
                      {tab === "sermon" ? t(lang, "notes_tab_sermon") : t(lang, "notes_tab_general")}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold" style={{ color: active ? (isLight ? "var(--fg-lo)" : "var(--accent)") : "var(--fg-dim)" }}>
                      {count} {lang === "es" ? (count === 1 ? "nota" : "notas") : `note${count !== 1 ? "s" : ""}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[24px] p-2" style={{ border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.07)", background: isLight ? "#f3f4f6" : "rgba(255,255,255,0.035)", boxShadow: isLight ? "0 6px 20px rgba(0,0,0,0.05)" : "0 18px 48px rgba(0,0,0,0.18)" }}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-dim)" }}><SearchIcon size={16} /></span>
                <input
                  type="text"
                  placeholder={t(lang, "notes_search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-[14px] focus:outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--fg)", caretColor: "var(--accent)", background: isLight ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.14)" }}
                />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  aria-expanded={showFilters}
                  aria-label={lang === "es" ? "Filtros" : "Filters"}
                  className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl"
                  style={{ background: showFilters ? (isLight ? "#111111" : "var(--accent)") : "var(--bg)", color: showFilters ? "#ffffff" : "var(--fg-lo)", border: "1px solid var(--border)" }}
                >
                  <SlidersIcon size={17} />
                  {hasActiveFilters && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ background: isLight ? "#111111" : "var(--accent)" }} />}
                </button>
              </div>
              {showFilters && <div className="mt-2 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
              <select
                value={filterTestament}
                onChange={(e) => setFilterTestament(e.target.value as "all" | "OT" | "NT")}
                className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
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
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
                >
                  <option value="">All Tags</option>
                  {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as "all" | "this-year" | "last-year")}
                className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
              >
                <option value="all">{t(lang, "notes_filter_all_time")}</option>
                <option value="this-year">{t(lang, "notes_filter_this_year")}</option>
                <option value="last-year">{t(lang, "notes_filter_last_year")}</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "by-book")}
                className="flex-shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold focus:outline-none [color-scheme:inherit]"
                style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.045)", borderColor: "var(--border)", color: "var(--fg-lo)" }}
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
              </div>}
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
                  <p className="text-xs" style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)" }}>
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
                        className="w-full flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-colors"
                      style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.2)" }}
                      >
                        <span className="text-[8px]">{otExpanded ? "▾" : "▸"}</span>
                        {lang === "es" ? "Antiguo Testamento" : "Old Testament"}
                        <span className="ml-auto" style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)" }}>{otBooks.length}</span>
                      </button>
                      {otExpanded &&
                        otBooks.map((book) => {
                          const cnt = sorted.filter((n) => n.bookNum === book.num);
                          const chCnt = new Set(cnt.map((n) => n.chapter)).size;
                          const active = selectedBookNum === book.num;
                          const sclr = getThemeNoteColor(book.num, isLight);
                          return (
                            <button
                              key={book.num}
                              onClick={() => selectBook(book.num)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-left border-l-2 transition-all ${
                                active
                                  ? sclr.sideActive
                                  : isLight ? "border-l-transparent hover:bg-black/[0.04]" : "border-l-transparent text-white/40 hover:text-white/65 hover:bg-white/[0.03]"
                              }`}
                              style={!(selectedBookNum === book.num) && isLight ? { color: "rgba(0,0,0,0.55)" } : undefined}
                            >
                              <span className="text-xs font-semibold flex-1 truncate">{bibleBookName(book, lang)}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? sclr.sideBadge
                                    : isLight ? "bg-black/[0.07] text-black/30" : "bg-white/[0.06] text-white/20"
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
                        className="w-full flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-colors"
                      style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.2)" }}
                      >
                        <span className="text-[8px]">{ntExpanded ? "▾" : "▸"}</span>
                        {lang === "es" ? "Nuevo Testamento" : "New Testament"}
                        <span className="ml-auto" style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)" }}>{ntBooks.length}</span>
                      </button>
                      {ntExpanded &&
                        ntBooks.map((book) => {
                          const cnt = sorted.filter((n) => n.bookNum === book.num);
                          const chCnt = new Set(cnt.map((n) => n.chapter)).size;
                          const active = selectedBookNum === book.num;
                          const sclr = getThemeNoteColor(book.num, isLight);
                          return (
                            <button
                              key={book.num}
                              onClick={() => selectBook(book.num)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-left border-l-2 transition-all ${
                                active
                                  ? sclr.sideActive
                                  : isLight ? "border-l-transparent hover:bg-black/[0.04]" : "border-l-transparent text-white/40 hover:text-white/65 hover:bg-white/[0.03]"
                              }`}
                              style={!(selectedBookNum === book.num) && isLight ? { color: "rgba(0,0,0,0.55)" } : undefined}
                            >
                              <span className="text-xs font-semibold flex-1 truncate">{bibleBookName(book, lang)}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? sclr.sideBadge
                                    : isLight ? "bg-black/[0.07] text-black/30" : "bg-white/[0.06] text-white/20"
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
                    <div className="w-full rounded-[32px] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                      style={{ border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)", background: isLight ? "#f9fafb" : "rgba(255,255,255,0.035)" }}>
                      <div className="relative mx-auto mb-5 w-fit">
                        <div
                          className="w-24 h-24 rounded-[30px] flex items-center justify-center shadow-2xl"
                          style={{
                            border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.09)",
                            background: isLight ? "rgba(0,0,0,0.07)" : "linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(255,255,255,0.035))",
                          }}
                        >
                          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style={{ color: isLight ? "rgba(0,0,0,0.38)" : "var(--fg-lo)" }}>
                          <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-[20px] font-black tracking-tight" style={{ color: "var(--fg)" }}>{t(lang, "notes_general_empty_title")}</h2>
                      <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed" style={{ color: "var(--fg-lo)" }}>{t(lang, "notes_general_empty_sub")}</p>
                      <div className="mt-5 flex justify-center gap-2">
                        <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Ideas" : "Ideas"}</span>
                        <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--fg-dim)" }}>{lang === "es" ? "Oración" : "Prayer"}</span>
                      </div>
                      <button
                        onClick={() => openNewNote()}
                        className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all"
                        style={{
                          background: isLight ? "#e5e7eb" : "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 76%, #ffffff 24%))",
                          color: "#0a0a0a",
                          boxShadow: isLight ? "none" : "0 18px 36px color-mix(in srgb, var(--accent) 22%, transparent)",
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
                <div className="w-full rounded-[32px] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                  style={{ border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)", background: isLight ? "#f9fafb" : "rgba(255,255,255,0.035)" }}>
                  <div className="relative mx-auto mb-5 w-fit">
                    <div
                      className="w-24 h-24 rounded-[30px] flex items-center justify-center shadow-2xl"
                      style={{
                        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.09)",
                        background: isLight ? "rgba(0,0,0,0.07)" : "linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(255,255,255,0.035))",
                      }}
                    >
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style={{ color: isLight ? "#c9a961" : "var(--fg-lo)" }}>
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
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
                    className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all"
                    style={{
                      background: isLight ? "#e5e7eb" : "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 76%, #ffffff 24%))",
                      color: "#0a0a0a",
                      boxShadow: isLight ? "none" : "0 18px 36px color-mix(in srgb, var(--accent) 22%, transparent)",
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
                  {sorted.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-end justify-between px-1">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "var(--fg-dim)" }}>{lang === "es" ? "Últimas" : "Latest"}</p>
                          <h2 className="mt-0.5 text-xl font-black tracking-tight" style={{ color: "var(--fg)" }}>{lang === "es" ? "Notas recientes" : "Recent notes"}</h2>
                        </div>
                        <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{sorted.length} {lang === "es" ? "en total" : "total"}</span>
                      </div>
                      <div className="space-y-2">
                        {sorted.slice(0, 3).map((note) => (
                          <button
                            key={note.id}
                            onClick={() => setViewingNote(note)}
                            className="flex min-h-20 w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform active:scale-[0.99]"
                            style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
                          >
                            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl" style={{ background: isLight ? "#e5e7eb" : "rgba(255,255,255,0.06)", color: "var(--fg-lo)" }}><NotesIcon /></div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-black" style={{ color: "var(--fg)" }}>{note.title || t(lang, "notes_untitled")}</p>
                              <p className="mt-1 truncate text-[11px]" style={{ color: "var(--fg-dim)" }}>{getNoteDisplayRef(note)} · {formatDate(note.date, lang)}</p>
                            </div>
                            <span style={{ color: "var(--fg-dim)" }}>›</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  <div className="flex items-end justify-between px-1 pt-2">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "var(--fg-dim)" }}>{lang === "es" ? "Archivo" : "Archive"}</p>
                      <h2 className="mt-0.5 text-xl font-black tracking-tight" style={{ color: "var(--fg)" }}>{lang === "es" ? "Explorar por libro" : "Browse by book"}</h2>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{booksWithNotes.length} {lang === "es" ? "libros" : "books"}</span>
                  </div>
                  {[
                    { label: lang === "es" ? "Antiguo Testamento" : "Old Testament", books: otBooks },
                    { label: lang === "es" ? "Nuevo Testamento" : "New Testament", books: ntBooks },
                  ].map(
                    ({ label, books }) =>
                      books.length > 0 && (
                        <div key={label}>
                          <h3 className="text-[9px] font-black uppercase tracking-widest px-1 mb-2" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.2)" }}>
                            {label}
                          </h3>
                          <div className="space-y-1.5">
                            {books.map((book) => {
                              const cnt = sorted.filter((n) => n.bookNum === book.num);
                              const chCnt = new Set(cnt.map((n) => n.chapter)).size;
                              const bclr = getThemeNoteColor(book.num, isLight);
                              return (
                                <button
                                  key={book.num}
                                  onClick={() => selectBook(book.num)}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                                  style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.07)" }}
                                >
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${bclr.dot}`} />
                                  <span className="flex-1 text-sm font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)" }}>
                                    {bibleBookName(book, lang)}
                                  </span>
                                  <span className="text-[11px]" style={{ color: isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)" }}>
                                    {chCnt} {lang === "es" ? "cap." : "ch."} · {cnt.length} {lang === "es" ? (cnt.length === 1 ? "nota" : "notas") : `note${cnt.length !== 1 ? "s" : ""}`}
                                  </span>
                                  <span className="text-xs" style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)" }}>→</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                  )}
                  {booksWithNotes.length === 0 && (
                    <p className="text-sm text-center py-8" style={{ color: isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)" }}>
                      No notes match your current filters
                    </p>
                  )}
                </div>

                {/* Desktop: recent notes overview */}
                <div className="hidden md:block">
                  <div className="flex items-baseline gap-3 mb-5">
                    <h2 className="text-base font-bold" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.45)" }}>Study Library</h2>
                    <span className="text-xs" style={{ color: isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)" }}>
                      {sorted.length} note{sorted.length !== 1 ? "s" : ""} across{" "}
                      {booksWithNotes.length} book{booksWithNotes.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {sorted.length === 0 ? (
                    <p className="text-sm py-10 text-center" style={{ color: isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)" }}>
                      No notes match your current filters
                    </p>
                  ) : (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.2)" }}>
                        Recent Notes
                      </p>
                      <div className="space-y-2">
                        {sorted.slice(0, 8).map((note) => {
                          const nclr = getThemeNoteColor(note.bookNum, isLight);
                          return (
                            <button
                              key={note.id}
                              onClick={() => {
                                setSelectedBookNum(note.bookNum);
                                setExpandedChapters(new Set([note.chapter]));
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group"
                              style={{ background: isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)", border: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.06)" }}
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${nclr.dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate transition-colors" style={{ color: isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.6)" }}>
                                  {note.title || t(lang, "notes_untitled")}
                                </p>
                                <p className="text-[11px] truncate mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.25)" }}>
                                  {note.bookName} {note.chapter} · {formatDate(note.date, lang)}
                                  {note.pastor && ` · ${note.pastor}`}
                                </p>
                              </div>
                              {getNoteDisplayRef(note) && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 hidden sm:inline ${nclr.pill}`}>
                                  {getNoteDisplayRef(note)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {sorted.length > 8 && (
                        <p className="text-xs mt-4 text-center" style={{ color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)" }}>
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
                  className="mb-4 flex min-h-10 items-center gap-1.5 text-xs font-semibold transition-opacity active:opacity-60 md:hidden"
                  style={{ color: "var(--fg-lo)" }}
                >
                  ← {lang === "es" ? "Biblioteca" : "Library"}
                </button>

                {/* Book heading */}
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: isLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.8)" }}>{bibleBookName(selectedBook, lang)}</h2>
                    <p className="text-xs mt-1" style={{ color: isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.25)" }}>
                      {chaptersWithNotes.length} {lang === "es" ? (chaptersWithNotes.length === 1 ? "capítulo" : "capítulos") : `chapter${chaptersWithNotes.length !== 1 ? "s" : ""}`} ·{" "}
                      {bookNotes.length} {lang === "es" ? (bookNotes.length === 1 ? "nota" : "notas") : `note${bookNotes.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <button
                    onClick={() => openNewNote(selectedBook.num)}
                    className="flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-xl px-4 text-xs font-black transition-opacity active:opacity-60"
                    style={{ background: isLight ? "#111111" : "var(--accent)", color: "#ffffff" }}
                  >
                    + {lang === "es" ? "Agregar nota" : "Add Note"}
                  </button>
                </div>

                {/* No notes after filter */}
                {chaptersWithNotes.length === 0 && (
                  <p className="text-sm text-center py-12" style={{ color: isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)" }}>
                    {lang === "es"
                      ? `No hay notas que coincidan con los filtros para ${bibleBookName(selectedBook, lang)}`
                      : `No notes match your current filters for ${selectedBook.name}`}
                  </p>
                )}

                {/* Chapter list */}
                {(() => {
                  const bookClr = getThemeNoteColor(selectedBook.num, isLight);
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
                                <p className="text-sm font-bold tracking-tight" style={{ color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.7)" }}>
                                  {lang === "es" ? "Capítulo" : "Chapter"} {ch}
                                </p>
                                {!isExp && mostRecent && (
                                  <p className="text-[11px] truncate mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)" }}>
                                    {mostRecent.title || t(lang, "notes_untitled")} · {formatDate(mostRecent.date)}
                                  </p>
                                )}
                              </div>
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${bookClr.sideBadge}`} style={{ borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.07)" }}>
                                {chNotes.length} {lang === "es" ? (chNotes.length === 1 ? "nota" : "notas") : `note${chNotes.length !== 1 ? "s" : ""}`}
                              </span>
                            </button>

                            {/* Expanded: note cards */}
                            {isExp && (
                              <div className="p-3.5 pt-0 space-y-3">
                                <div className="pt-3.5 space-y-3" style={{ borderTop: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.05)" }}>
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
                                    + {lang === "es" ? `Agregar otra nota al capítulo ${ch}` : `Add another note for Chapter ${ch}`}
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
