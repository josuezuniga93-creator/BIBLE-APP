"use client";

import { useState, useMemo } from "react";
import type { HistoryEntry, Analysis, OverallVerdict } from "../lib/types";
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

// Preacher grouping type
interface PreacherGroup {
  name: string;
  entries: HistoryEntry[];
  worstVerdict: OverallVerdict;
}

const VERDICT_RANK: Record<OverallVerdict, number> = {
  SOUND: 0,
  MIXED: 1,
  SERIOUS_CONCERNS: 2,
  FALSE_TEACHING: 3,
};

export function HistoryDrawer({
  open,
  onClose,
  history,
  onSelect,
  onDelete,
  t,
}: HistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<"history" | "preachers">("history");

  // Group history entries by preacher name
  const preacherGroups = useMemo<PreacherGroup[]>(() => {
    const groups: Map<string, HistoryEntry[]> = new Map();
    for (const entry of history) {
      const name = entry.preacher?.trim() || "";
      if (!name) continue;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(entry);
    }
    return Array.from(groups.entries()).map(([name, entries]) => {
      const worstVerdict = entries.reduce<OverallVerdict>(
        (worst, e) =>
          VERDICT_RANK[e.overallVerdict] > VERDICT_RANK[worst]
            ? e.overallVerdict
            : worst,
        "SOUND"
      );
      return { name, entries, worstVerdict };
    });
  }, [history]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full width on mobile, capped on larger screens */}
      <div className="relative ml-auto w-full sm:max-w-md bg-[#141414] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.05] border border-white/10">
            {(["history", "preachers"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 ${
                  activeTab === tab
                    ? "bg-violet-600 text-white shadow"
                    : "text-white/35 hover:text-white/55"
                }`}
              >
                {tab === "history" ? t.historyTab : t.preachersTab}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* ── History Tab ─────────────────────────────────────────────────────── */}
        {activeTab === "history" && (
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
                      className="w-full text-left px-4 py-3 min-h-[44px]"
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
                        className="text-[10px] text-white/20 hover:text-red-400 font-semibold transition-colors px-1 min-h-[32px] flex items-center"
                      >
                        {t.historyDelete}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Preachers Tab ────────────────────────────────────────────────────── */}
        {activeTab === "preachers" && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {preacherGroups.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-white/25 text-sm">{t.preachersEmpty}</p>
                <p className="text-white/15 text-xs">
                  Tag a preacher after analyzing a sermon to track them here.
                </p>
              </div>
            ) : (
              preacherGroups.map((group) => {
                const os = OVERALL_STYLES[group.worstVerdict] ?? OVERALL_STYLES.MIXED;
                const worstLabel =
                  t.overallLabels[group.worstVerdict] ?? group.worstVerdict;

                // Verdict distribution
                const dist: Partial<Record<OverallVerdict, number>> = {};
                for (const e of group.entries) {
                  dist[e.overallVerdict] = (dist[e.overallVerdict] ?? 0) + 1;
                }

                return (
                  <div
                    key={group.name}
                    className={`rounded-xl border ${os.border} ${os.bg} overflow-hidden`}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-white/80">🎤 {group.name}</p>
                        <span className="text-[10px] text-white/30 flex-shrink-0">
                          {t.sermonCount(group.entries.length)}
                        </span>
                      </div>

                      {/* Verdict distribution pills */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(Object.entries(dist) as [OverallVerdict, number][]).map(([verdict, count]) => {
                          const vs = OVERALL_STYLES[verdict] ?? OVERALL_STYLES.MIXED;
                          const vl = t.overallLabels[verdict] ?? verdict;
                          return (
                            <span
                              key={verdict}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${vs.text} border ${vs.border} bg-black/20`}
                            >
                              {vl} ×{count}
                            </span>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-white/30">
                        {t.worstVerdict}:{" "}
                        <span className={`font-bold ${os.text}`}>{worstLabel}</span>
                      </p>
                    </div>

                    {/* Sermon list */}
                    <div className="border-t border-white/10 divide-y divide-white/[0.06]">
                      {group.entries.map((entry) => {
                        const es = OVERALL_STYLES[entry.overallVerdict] ?? OVERALL_STYLES.MIXED;
                        const el =
                          (TRANSLATIONS[entry.lang] ?? TRANSLATIONS.en).overallLabels[
                            entry.overallVerdict
                          ] ?? entry.overallVerdict;
                        const isDemo =
                          entry.analysis.overallExplanation?.includes("[DEMO MODE") ||
                          entry.analysis.overallExplanation?.includes("[MODO DEMO");
                        const dateStr = new Date(entry.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <button
                            key={entry.id}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/[0.04] transition-colors min-h-[44px]"
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
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-white/45 truncate flex-1">
                                {entry.inputType === "youtube" ? "▶ " : ""}
                                {entry.inputPreview}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-[10px] font-bold ${es.text}`}>{el}</span>
                                <span className="text-[10px] text-white/20">{dateStr}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
