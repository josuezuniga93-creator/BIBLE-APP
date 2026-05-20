"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import {
  SermonNote,
  loadNotes,
  saveNotes,
  makeNote,
  detectScriptureRefs,
  PRESET_TAGS,
} from "../lib/notesData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
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
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/10 bg-[#1c1c1c] p-6 max-w-sm w-full shadow-2xl">
        <p className="text-white/75 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/45 text-sm font-semibold hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: SermonNote;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.notes.length > 200;
  const validPoints = note.mainPoints.filter(Boolean);
  const validRefs = note.scriptureRefs.filter(Boolean);
  const clr = getNoteColor(note.bookNum);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121212] shadow-lg transition-all duration-200 overflow-hidden hover:border-white/[0.15] hover:shadow-xl">
      {/* Colored accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${clr.bar}`} />

      <div className="p-5 space-y-3.5">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[15px] font-bold text-white/90 leading-snug flex-1 tracking-tight">
            {note.title || "Untitled Sermon"}
          </h4>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onEdit}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${clr.accent} border-white/[0.12] hover:bg-white/[0.07] hover:border-white/[0.22]`}
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 border border-white/[0.07] hover:bg-red-500/10 hover:text-red-400/70 hover:border-red-500/20 transition-all text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/35">
          <span className="font-medium">{formatDate(note.date)}</span>
          {note.pastor && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-white/40">{note.pastor}</span>
            </>
          )}
          {note.church && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-white/30">{note.church}</span>
            </>
          )}
        </div>

        {/* Passage + Tags row */}
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

        {/* Main Points */}
        {validPoints.length > 0 && (
          <details className="group">
            <summary className={`cursor-pointer list-none text-[11px] font-semibold select-none flex items-center gap-1.5 transition-colors ${clr.points}`}>
              <span className="group-open:rotate-90 inline-block transition-transform text-xs">▸</span>
              Main Points
              <span className="opacity-50 font-mono ml-0.5">({validPoints.length})</span>
            </summary>
            <ul className={`mt-2.5 space-y-2 pl-4 border-l-2 ${clr.border}`}>
              {validPoints.map((pt, i) => (
                <li key={i} className="flex gap-2.5 text-[12px] text-white/55 leading-relaxed">
                  <span className={`${clr.accent} opacity-50 flex-shrink-0 mt-[3px] text-[8px]`}>◆</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Notes text */}
        {note.notes && (
          <div className="text-[13px] text-white/50 leading-relaxed">
            {isLong && !expanded ? (
              <>
                <p className="whitespace-pre-wrap">{note.notes.slice(0, 200)}…</p>
                <button
                  onClick={() => setExpanded(true)}
                  className={`mt-2 text-[11px] font-semibold transition-colors flex items-center gap-1 ${clr.points}`}
                >
                  Show more <span className="text-[9px]">▾</span>
                </button>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{note.notes}</p>
                {isLong && (
                  <button
                    onClick={() => setExpanded(false)}
                    className={`mt-2 text-[11px] font-semibold transition-colors flex items-center gap-1 ${clr.points}`}
                  >
                    Show less <span className="text-[9px]">▴</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Scripture Refs */}
        {validRefs.length > 0 && (
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mb-2">
              Scripture References
            </p>
            <div className="flex flex-wrap gap-1.5">
              {validRefs.map((ref) => (
                <Link
                  key={ref}
                  href={refToHref(ref)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${clr.ref}`}
                >
                  {ref}
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Note Editor Modal ────────────────────────────────────────────────────────

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
  const [draft, setDraft] = useState<SermonNote>({ ...initial });
  const [detectedRefs, setDetectedRefs] = useState<string[]>([]);
  const [newRef, setNewRef] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const patch = (p: Partial<SermonNote>) => setDraft((d) => ({ ...d, ...p }));

  // Detect refs on notes change
  useEffect(() => {
    const found = detectScriptureRefs(draft.notes);
    setDetectedRefs(found.filter((r) => !draft.scriptureRefs.includes(r)));
  }, [draft.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open details if editing an existing note with detail fields filled
  useEffect(() => {
    if (!isNew) {
      const hasDetails =
        draft.pastor || draft.church || draft.passage ||
        draft.tags.length > 0 || draft.mainPoints.filter(Boolean).length > 0 ||
        draft.scriptureRefs.filter(Boolean).length > 0;
      if (hasDetails) setShowDetails(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBook =
    BIBLE_BOOKS.find((b) => b.num === draft.bookNum) ?? BIBLE_BOOKS[39];

  const handleBookChange = (num: number) => {
    const book = BIBLE_BOOKS.find((b) => b.num === num);
    if (book) patch({ bookNum: book.num, bookName: book.name, chapter: 1 });
  };

  const updatePoint = (i: number, val: string) => {
    const pts = [...draft.mainPoints];
    pts[i] = val;
    patch({ mainPoints: pts });
  };
  const addPoint = () => patch({ mainPoints: [...draft.mainPoints, ""] });
  const removePoint = (i: number) => {
    const pts = draft.mainPoints.filter((_, idx) => idx !== i);
    patch({ mainPoints: pts.length ? pts : [""] });
  };

  const toggleTag = (tag: string) =>
    patch({
      tags: draft.tags.includes(tag)
        ? draft.tags.filter((t) => t !== tag)
        : [...draft.tags, tag],
    });

  const addRef = (ref: string) => {
    if (ref.trim() && !draft.scriptureRefs.includes(ref.trim())) {
      patch({ scriptureRefs: [...draft.scriptureRefs, ref.trim()] });
    }
  };
  const removeRef = (ref: string) =>
    patch({ scriptureRefs: draft.scriptureRefs.filter((r) => r !== ref) });

  const handleSave = () =>
    onSave({ ...draft, updatedAt: new Date().toISOString() });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="rounded-t-3xl sm:rounded-3xl border border-white/[0.09] bg-[#131313] w-full max-w-lg shadow-2xl sm:my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <h3 className="text-sm font-bold text-white/80 tracking-tight">
              {isNew ? "New Sermon Note" : "Edit Note"}
            </h3>
            <p className="text-[10px] text-white/25 mt-0.5">{isNew ? "Capture what you heard" : "Update your notes"}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl text-white/25 hover:text-white/65 hover:bg-white/[0.07] transition-colors text-sm flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          {/* ── Essential fields ── */}
          {/* Title */}
          <input
            type="text"
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Sermon title…"
            autoFocus
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-white/90 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] transition-colors"
          />

          {/* Notes textarea */}
          <textarea
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder="Write your notes here…"
            rows={8}
            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3.5 text-[13px] text-white/65 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/35 focus:bg-white/[0.05] resize-none leading-relaxed transition-colors"
          />

          {/* Auto-detected refs — shown right below notes */}
          {detectedRefs.length > 0 && (
            <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 px-3.5 py-3">
              <p className="text-[11px] font-bold text-emerald-300/65 mb-2">
                ✦ References detected — tap to add
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detectedRefs.map((ref) => (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => addRef(ref)}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/35 transition-colors"
                  >
                    + {ref}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Details toggle ── */}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-xs font-semibold text-white/35">
              {showDetails ? "Hide details" : "Add details"}
              <span className="ml-1.5 text-white/20 font-normal">
                book, date, pastor, tags…
              </span>
            </span>
            <span className={`text-white/25 text-xs transition-transform ${showDetails ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {/* ── Collapsible details ── */}
          {showDetails && (
            <div className="space-y-4 pt-1">
              {/* Book + Chapter + Date */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
                    Book
                  </label>
                  <select
                    value={draft.bookNum}
                    onChange={(e) => handleBookChange(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
                  >
                    <optgroup label="— Old Testament —">
                      {BIBLE_BOOKS.filter((b) => b.testament === "OT").map((b) => (
                        <option key={b.num} value={b.num}>{b.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— New Testament —">
                      {BIBLE_BOOKS.filter((b) => b.testament === "NT").map((b) => (
                        <option key={b.num} value={b.num}>{b.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
                    Chapter
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedBook.chapters}
                    value={draft.chapter}
                    onChange={(e) =>
                      patch({
                        chapter: Math.max(
                          1,
                          Math.min(selectedBook.chapters, Number(e.target.value) || 1)
                        ),
                      })
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => patch({ date: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Pastor + Church */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
                    Pastor
                  </label>
                  <input
                    type="text"
                    value={draft.pastor ?? ""}
                    onChange={(e) => patch({ pastor: e.target.value })}
                    placeholder="Speaker name"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
                    Church
                  </label>
                  <input
                    type="text"
                    value={draft.church ?? ""}
                    onChange={(e) => patch({ church: e.target.value })}
                    placeholder="Church name"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>

              {/* Passage */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-1.5">
                  Passage
                </label>
                <input
                  type="text"
                  value={draft.passage}
                  onChange={(e) => patch({ passage: e.target.value })}
                  placeholder={`e.g. ${selectedBook.name} ${draft.chapter}:1-12`}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                        draft.tags.includes(tag)
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                          : "bg-white/[0.03] border-white/[0.08] text-white/30 hover:border-emerald-500/25 hover:text-white/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Points */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">
                  Main Points
                </label>
                <div className="space-y-1.5">
                  {draft.mainPoints.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400/30 text-xs flex-shrink-0">•</span>
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => updatePoint(i, e.target.value)}
                        placeholder={`Point ${i + 1}…`}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40"
                      />
                      <button
                        type="button"
                        onClick={() => removePoint(i)}
                        className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-red-400/60 transition-colors text-xs flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPoint}
                    className="text-[11px] text-emerald-400/45 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    + Add Point
                  </button>
                </div>
              </div>

              {/* Scripture References */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">
                  Scripture References
                </label>
                {draft.scriptureRefs.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {draft.scriptureRefs.filter(Boolean).map((ref) => (
                      <span
                        key={ref}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/12 text-emerald-300/75 border border-emerald-500/20"
                      >
                        {ref}
                        <button
                          type="button"
                          onClick={() => removeRef(ref)}
                          className="text-emerald-300/40 hover:text-emerald-300 ml-0.5 transition-colors"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { addRef(newRef); setNewRef(""); }
                    }}
                    placeholder="e.g. Romans 8:28"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => { addRef(newRef); setNewRef(""); }}
                    className="px-3 py-2 rounded-lg border border-emerald-500/25 text-emerald-400/55 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07] gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/35 text-sm font-semibold hover:bg-white/[0.04] hover:text-white/55 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 active:scale-[0.97] transition-all shadow-md shadow-emerald-900/30"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotesPage() {
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

  useEffect(() => {
    setNotes(loadNotes());
    setMounted(true);
  }, []);

  // ── Filtered + sorted notes ──────────────────────────────────────────────────

  const filtered = notes.filter((note) => {
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

  // ── Actions ──────────────────────────────────────────────────────────────────

  const persistNotes = (next: SermonNote[]) => {
    setNotes(next);
    saveNotes(next);
  };

  const openNewNote = (bookNum?: number, chapter?: number) => {
    const book = bookNum ? BIBLE_BOOKS.find((b) => b.num === bookNum) : undefined;
    setEditingNote(
      makeNote({
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
    // Navigate to the saved note's book/chapter
    setSelectedBookNum(note.bookNum);
    setExpandedChapters((prev) => new Set([...prev, note.chapter]));
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <span className="text-white/20 text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          message="Delete this note? This action cannot be undone."
          onConfirm={() => handleDeleteNote(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
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

      <div className="min-h-screen bg-[#0f0f0f] text-white">
        {/* ── Page Header ─────────────────────────────────────────────────────── */}
        <header className="border-b border-white/[0.07] bg-[#0f0f0f]">
          <div className="max-w-screen-xl mx-auto px-4">
            {/* Breadcrumb + action row */}
            <div className="flex items-center gap-2 py-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-base">📓</span>
                <button
                  onClick={() => setSelectedBookNum(null)}
                  className={`text-sm font-bold transition-colors ${
                    selectedBook
                      ? "text-white/40 hover:text-white/70"
                      : "text-white/70"
                  }`}
                >
                  Study Notes
                </button>
                {notes.length > 0 && !selectedBook && (
                  <span className="text-[10px] font-mono text-white/20 ml-1">
                    {notes.length} note{notes.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {selectedBook && (
                <>
                  <span className="text-white/20 text-xs">/</span>
                  <span className="text-sm font-bold text-emerald-300/80">
                    {selectedBook.name}
                  </span>
                  {bookNotes.length > 0 && (
                    <span className="text-[10px] font-mono text-white/20">
                      {bookNotes.length} note{bookNotes.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </>
              )}
              <Link
                href="/"
                className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white/25 text-xs font-semibold hover:text-white/45 transition-colors"
              >
                ← Home
              </Link>
            </div>

            {/* Search */}
            <div className="pb-2">
              <input
                type="text"
                placeholder="Search notes, pastors, passages, tags…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
            {/* Filters — single scrollable row on mobile */}
            <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none">
              <select
                value={filterTestament}
                onChange={(e) =>
                  setFilterTestament(e.target.value as "all" | "OT" | "NT")
                }
                className="flex-shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/45 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
              >
                <option value="all">All Books</option>
                <option value="OT">Old Testament</option>
                <option value="NT">New Testament</option>
              </select>
              {allTags.length > 0 && (
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="flex-shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/45 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
                >
                  <option value="">All Tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
              <select
                value={filterDate}
                onChange={(e) =>
                  setFilterDate(e.target.value as "all" | "this-year" | "last-year")
                }
                className="flex-shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/45 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
              >
                <option value="all">All Time</option>
                <option value="this-year">This Year</option>
                <option value="last-year">Last Year</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "newest" | "oldest" | "by-book")
                }
                className="flex-shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/45 focus:outline-none focus:border-emerald-500/40 [color-scheme:dark]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="by-book">By Book</option>
              </select>
            </div>
          </div>
        </header>

        {/* ── Layout ──────────────────────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto flex">

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <aside className="hidden md:flex flex-col w-60 lg:w-68 flex-shrink-0 border-r border-white/[0.06] min-h-[calc(100vh-56px)] bg-[#0c0c0c] sticky top-14 self-start max-h-[calc(100vh-56px)]">
            <div className="flex-1 overflow-y-auto py-2">
              {notes.length === 0 || booksWithNotes.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-white/15 text-xs">
                    {notes.length === 0
                      ? "No notes yet"
                      : "No matches for these filters"}
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
                        Old Testament
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
                              <span className="text-xs font-semibold flex-1 truncate">{book.name}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? sclr.sideBadge
                                    : "bg-white/[0.06] text-white/20"
                                }`}
                              >
                                {chCnt}ch
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
                        New Testament
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
                              <span className="text-xs font-semibold flex-1 truncate">{book.name}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? sclr.sideBadge
                                    : "bg-white/[0.06] text-white/20"
                                }`}
                              >
                                {chCnt}ch
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-white/[0.05]">
              <p className="text-[9px] text-white/15 font-mono">
                {notes.length} note{notes.length !== 1 ? "s" : ""} · saved locally
              </p>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 px-4 md:px-6 py-6">

            {/* ── Empty state (no notes at all) ──────────────────────────────── */}
            {notes.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] gap-7 text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-violet-600/20 via-sky-500/15 to-emerald-500/15 border border-white/[0.09] flex items-center justify-center shadow-2xl">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 border-2 border-[#0f0f0f] flex items-center justify-center text-white text-xs font-black">
                    +
                  </div>
                </div>
                <div className="max-w-[260px]">
                  <h2 className="text-[17px] font-bold text-white/60 mb-2.5 tracking-tight">
                    Your sermon archive begins here
                  </h2>
                  <p className="text-white/30 text-[13px] leading-relaxed">
                    Capture sermons, build a personal theological library organized by book and chapter.
                  </p>
                </div>
                <button
                  onClick={() => openNewNote()}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 active:scale-[0.97] transition-all shadow-lg shadow-indigo-900/40"
                >
                  <span className="text-base font-black">+</span>
                  Add First Note
                </button>
              </div>
            )}

            {/* ── Library view (no book selected, has notes) ─────────────────── */}
            {notes.length > 0 && !selectedBook && (
              <div>
                {/* Mobile: book grid */}
                <div className="md:hidden space-y-4 mb-4">
                  {[
                    { label: "Old Testament", books: otBooks },
                    { label: "New Testament", books: ntBooks },
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
                                  {note.title || "Untitled Sermon"}
                                </p>
                                <p className="text-[11px] text-white/25 truncate mt-0.5">
                                  {note.bookName} {note.chapter} · {formatDate(note.date)}
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
            {selectedBook && (
              <div>
                {/* Back button (mobile) */}
                <button
                  onClick={() => setSelectedBookNum(null)}
                  className="md:hidden flex items-center gap-1.5 text-xs text-emerald-400/60 hover:text-emerald-300 font-semibold mb-4 transition-colors"
                >
                  ← Library
                </button>

                {/* Book heading */}
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white/80">{selectedBook.name}</h2>
                    <p className="text-xs text-white/25 mt-1">
                      {chaptersWithNotes.length} chapter
                      {chaptersWithNotes.length !== 1 ? "s" : ""} ·{" "}
                      {bookNotes.length} note{bookNotes.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => openNewNote(selectedBook.num)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/25 text-emerald-400/65 text-xs font-bold hover:bg-emerald-500/[0.08] hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    + Add Note
                  </button>
                </div>

                {/* No notes after filter */}
                {chaptersWithNotes.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-12">
                    No notes match your current filters for {selectedBook.name}
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
                            className="rounded-2xl border border-white/[0.07] overflow-hidden bg-[#111111]"
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
                                    {mostRecent.title || "Untitled"} · {formatDate(mostRecent.date)}
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
          </main>
        </div>
      </div>

      {/* ── Floating New Note button ─────────────────────────────────────────── */}
      <button
        onClick={() => openNewNote(selectedBookNum ?? undefined)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-xl shadow-indigo-900/50 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.96] transition-all"
        aria-label="New Note"
      >
        <span className="text-base font-black leading-none">+</span>
        <span className="text-xs font-bold tracking-wide">New Note</span>
      </button>
    </>
  );
}
