"use client";

import type { HistoryEntry, Analysis } from "../lib/types";
import type { T } from "../lib/translations";
import { TRANSLATIONS } from "../lib/translations";
import { OVERALL_STYLES } from "../lib/constants";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onSelect: (entry: {
    analysis: Analysis;
    isDemoResult: boolean;
    preacher: string;
    entryId: string;
  }) => void;
  onDelete: (id: string) => void;
  t: T;
}

export function HistoryDrawer({
  open,
  onClose,
  history,
  onSelect,
  onDelete,
  t,
}: HistoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-[#141414] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
            {t.historyTitle}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-12">{t.historyEmpty}</p>
          ) : (
            history.map((entry) => {
              const os = OVERALL_STYLES[entry.overallVerdict] ?? OVERALL_STYLES.MIXED;
              const label =
                (TRANSLATIONS[entry.lang] ?? TRANSLATIONS.en).overallLabels[
                  entry.overallVerdict
                ] ?? entry.overallVerdict;
              const dateStr = new Date(entry.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const isDemo =
                entry.analysis.overallExplanation?.includes("[DEMO MODE") ||
                entry.analysis.overallExplanation?.includes("[MODO DEMO");

              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border ${os.border} ${os.bg} overflow-hidden`}
                >
                  <button
                    className="w-full text-left px-4 py-3"
                    onClick={() => {
                      onSelect({
                        analysis: entry.analysis,
                        isDemoResult: isDemo,
                        preacher: entry.preacher ?? "",
                        entryId: entry.id,
                      });
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold ${os.text}`}>{label}</span>
                      <span className="text-[10px] text-white/25 flex-shrink-0">{dateStr}</span>
                    </div>
                    {entry.preacher && (
                      <p className="text-xs text-white/50 mb-1">🎤 {entry.preacher}</p>
                    )}
                    <p className="text-xs text-white/35 truncate leading-relaxed">
                      {entry.inputType === "youtube" ? "▶ " : ""}
                      {entry.inputPreview}
                    </p>
                  </button>

                  <div className="border-t border-white/10 px-3 py-1.5 flex justify-end">
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="text-[10px] text-white/20 hover:text-red-400 font-semibold transition-colors px-1"
                    >
                      {t.historyDelete}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
