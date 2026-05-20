"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LEARN_DOCUMENTS, ACCENT_CLASSES, LearnDocument, LearnSection } from "../lib/learnData";
import { useLanguage } from "../lib/useLanguage";
import { useHighlights } from "../lib/useHighlights";
import { applyHighlightsToHtml } from "../lib/highlights";
import { HighlightToolbar } from "../components/HighlightToolbar";
import { RemoveHighlightBubble } from "../components/RemoveHighlightBubble";

// ─── Progress helpers (localStorage) ─────────────────────────────────────────

function storageKey(docId: string) {
  return `axiom_learn_${docId}`;
}

function loadProgress(docId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(docId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveProgress(docId: string, completed: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(docId), JSON.stringify([...completed]));
}

function getDocProgress(doc: LearnDocument): number {
  const completed = loadProgress(doc.id);
  if (doc.sections.length === 0) return 0;
  return Math.round((completed.size / doc.sections.length) * 100);
}

// ─── Markdown renderer (minimal) ─────────────────────────────────────────────

function renderContent(
  text: string,
  highlights: import("../lib/highlights").Highlight[] = [],
  onHighlightClick?: (id: string, x: number, y: number) => void
) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      elements.push(<div key={i} className="h-3" />);
      i++;
      continue;
    }

    const inlined = line
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/—/g, "—");

    const withHL = applyHighlightsToHtml(inlined, highlights);

    elements.push(
      <p
        key={i}
        className="leading-7 text-white/75 text-[15px]"
        dangerouslySetInnerHTML={{ __html: withHL }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.hlId && onHighlightClick) {
            const rect = target.getBoundingClientRect();
            onHighlightClick(target.dataset.hlId, rect.left + rect.width / 2, rect.top);
          }
        }}
      />
    );
    i++;
  }

  return elements;
}

// ─── Section Reader ───────────────────────────────────────────────────────────

function SectionReader({
  doc,
  section,
  completed,
  onToggle,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  doc: LearnDocument;
  section: LearnSection;
  completed: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const accent = ACCENT_CLASSES[doc.color as keyof typeof ACCENT_CLASSES] ?? ACCENT_CLASSES.violet;
  const isDone = completed.has(section.id);

  // Highlights keyed per document + section
  const hlContext = `learn-${doc.id}-${section.id}`;
  const { highlights, selection, addHighlight, removeHighlight, dismissSelection } = useHighlights(hlContext);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [section.id]);

  useEffect(() => {
    if (!completed.has(section.id)) {
      onToggle(section.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1.5"
          >
            ← Back
          </button>
          <span className="text-white/20">|</span>
          <span className="text-white/50 text-sm truncate">{doc.shortTitle}</span>
          <span className="ml-auto flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>
              {section.label}
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${accent.text}`}>
            {doc.icon} {doc.shortTitle} · {section.label}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{section.title}</h1>
          <p className="text-white/30 text-sm">{doc.origin} · {doc.year}</p>
        </div>

        <div className="space-y-1 mb-12">
          {renderContent(section.content, highlights, (id, x, y) => setPendingRemove({ id, x, y }))}
        </div>

        {/* Highlight toolbar */}
        {selection && (
          <HighlightToolbar
            x={selection.x}
            y={selection.y}
            onHighlight={addHighlight}
            onDismiss={dismissSelection}
          />
        )}

        {/* Remove-highlight confirmation bubble */}
        {pendingRemove && (
          <RemoveHighlightBubble
            x={pendingRemove.x}
            y={pendingRemove.y}
            onConfirm={() => { removeHighlight(pendingRemove.id); setPendingRemove(null); }}
            onDismiss={() => setPendingRemove(null)}
          />
        )}

        {/* Nav */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            {hasNext ? (
              <button
                onClick={onNext}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${accent.border} ${accent.text} ${accent.bg} hover:opacity-80`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-all"
              >
                Finish ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Document detail view ─────────────────────────────────────────────────────

function DocumentDetail({
  doc,
  onClose,
}: {
  doc: LearnDocument;
  onClose: () => void;
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reading, setReading] = useState<string | null>(null);

  useEffect(() => {
    setCompleted(loadProgress(doc.id));
  }, [doc.id]);

  const toggleSection = useCallback(
    (sectionId: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
        saveProgress(doc.id, next);
        return next;
      });
    },
    [doc.id]
  );

  const accent = ACCENT_CLASSES[doc.color as keyof typeof ACCENT_CLASSES] ?? ACCENT_CLASSES.violet;
  const progress = doc.sections.length > 0 ? Math.round((completed.size / doc.sections.length) * 100) : 0;
  const sectionIndex = reading ? doc.sections.findIndex((s) => s.id === reading) : -1;
  const currentSection = sectionIndex >= 0 ? doc.sections[sectionIndex] : null;

  if (currentSection) {
    return (
      <SectionReader
        doc={doc}
        section={currentSection}
        completed={completed}
        onToggle={toggleSection}
        onClose={() => setReading(null)}
        onPrev={() => {
          if (sectionIndex > 0) setReading(doc.sections[sectionIndex - 1].id);
        }}
        onNext={() => {
          if (sectionIndex < doc.sections.length - 1)
            setReading(doc.sections[sectionIndex + 1].id);
        }}
        hasPrev={sectionIndex > 0}
        hasNext={sectionIndex < doc.sections.length - 1}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top bar */}
      <div className="sticky top-14 z-30 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1.5"
          >
            ← Library
          </button>
          <span className="ml-auto">
            <span className={`text-xs font-bold ${accent.text}`}>{progress}% complete</span>
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className={`border-l-4 ${accent.border} pl-5 mb-10`}>
          <p className="text-4xl mb-3">{doc.icon}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{doc.title}</h1>
          <p className="text-white/40 text-sm mb-3">
            {doc.origin} · {doc.year}
          </p>
          <p className="text-white/55 text-sm leading-6">{doc.description}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>{completed.size} of {doc.sections.length} sections read</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full ${accent.progress} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section list */}
        <div className="space-y-2">
          {doc.sections.map((section, idx) => {
            const done = completed.has(section.id);
            return (
              <div
                key={section.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors group cursor-pointer"
                onClick={() => setReading(section.id)}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                  className={`mt-0.5 w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    done
                      ? `${accent.border} ${accent.progress} border-0`
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {done && <span className="text-white text-[10px] font-bold">✓</span>}
                </button>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold ${accent.text}`}>{section.label}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/30 text-xs">Section {idx + 1}</span>
                  </div>
                  <p className="text-white/75 text-sm font-medium">{section.title}</p>
                </div>

                {/* Read button — always visible on mobile, hover-reveal on desktop */}
                <span
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 ${accent.bg} ${accent.text} border ${accent.border}`}
                >
                  Read
                </span>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        {completed.size > 0 && (
          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
            <button
              onClick={() => {
                setCompleted(new Set());
                saveProgress(doc.id, new Set());
              }}
              className="text-xs text-white/20 hover:text-white/50 transition-colors"
            >
              Reset progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Library grid ─────────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  onOpen,
}: {
  doc: LearnDocument;
  onOpen: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    setProgress(getDocProgress(doc));
  }, [doc]);

  const accent = ACCENT_CLASSES[doc.color as keyof typeof ACCENT_CLASSES] ?? ACCENT_CLASSES.violet;

  return (
    <button
      onClick={onOpen}
      className="text-left w-full p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 group"
    >
      {/* Icon + badge */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{doc.icon}</span>
        {progress > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${accent.badge}`}>
            {progress}%
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-base mb-1 leading-tight group-hover:text-white transition-colors">
        {doc.title}
      </h3>
      <p className="text-white/35 text-xs mb-3">
        {doc.origin} · {doc.year}
      </p>
      <p className="text-white/45 text-sm leading-5 line-clamp-2 mb-4">{doc.description}</p>

      {/* Progress bar */}
      <div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full ${accent.progress} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/25 text-xs mt-1.5">
          {doc.sections.length} {t("learn_sections")}
          {progress === 100 && ` · ${t("learn_complete")}`}
        </p>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface InProgressDoc {
  doc: LearnDocument;
  progress: number;
  completedCount: number;
}

export default function LearnPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<InProgressDoc[]>([]);

  // Load in-progress documents from localStorage on mount
  useEffect(() => {
    const items: InProgressDoc[] = [];
    for (const doc of LEARN_DOCUMENTS) {
      const completed = loadProgress(doc.id);
      if (completed.size > 0 && completed.size < doc.sections.length) {
        const progress = Math.round((completed.size / doc.sections.length) * 100);
        items.push({ doc, progress, completedCount: completed.size });
      }
    }
    setInProgress(items);
  }, []);

  // Refresh shelf when returning from a document detail view
  const handleClose = () => {
    setSelected(null);
    const items: InProgressDoc[] = [];
    for (const doc of LEARN_DOCUMENTS) {
      const completed = loadProgress(doc.id);
      if (completed.size > 0 && completed.size < doc.sections.length) {
        const progress = Math.round((completed.size / doc.sections.length) * 100);
        items.push({ doc, progress, completedCount: completed.size });
      }
    }
    setInProgress(items);
  };

  const selectedDoc = selected ? LEARN_DOCUMENTS.find((d) => d.id === selected) : null;

  if (selectedDoc) {
    return <DocumentDetail doc={selectedDoc} onClose={handleClose} />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-8">
        <div className="mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
            {t("learn_badge")}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">
          {t("learn_heading")}
        </h1>
        <p className="text-white/45 text-base leading-relaxed max-w-2xl">
          {t("learn_sub")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* Continue Studying shelf */}
        {inProgress.length > 0 && (
          <div className="mb-10">
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
              {t("learn_continue")}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {inProgress.map(({ doc, progress, completedCount }) => {
                const accent = ACCENT_CLASSES[doc.color as keyof typeof ACCENT_CLASSES] ?? ACCENT_CLASSES.violet;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelected(doc.id)}
                    className="flex-shrink-0 w-52 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
                        {progress}%
                      </span>
                    </div>
                    <p className="text-white/80 text-sm font-semibold leading-tight mb-1 line-clamp-2">
                      {doc.shortTitle}
                    </p>
                    <p className="text-white/30 text-xs mb-3">
                      {completedCount} {t("learn_of")} {doc.sections.length} {t("learn_sections")}
                    </p>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${accent.progress} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${accent.text} group-hover:underline`}>
                      Continue →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEARN_DOCUMENTS.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onOpen={() => setSelected(doc.id)} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-12">
          {t("learn_footer")}
        </p>
      </div>
    </div>
  );
}

