"use client";

import type { HistoryEntry, Analysis, OverallVerdict } from "../lib/types";
import type { T } from "../lib/translations";
import { TRANSLATIONS } from "../lib/translations";
import { OVERALL_STYLES } from "../lib/constants";
import { useState } from "react";

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

// Verdict severity (highest = worst)
const VERDICT_SEVERITY: Record<OverallVerdict, number> = {
  SOUND: 0,
  MIXED: 1,
  SERIOUS_CONCERNS: 2,
  FALSE_TEACHING: 3,
};

const VERDICT_COLORS: Record<OverallVerdict, string> = {
  SOUND: "bg-emerald-500",
  MIXED: "bg-amber-500",
  SERIOUS_CONCERNS: "bg-orange-500",
  FALSE_TEACHING: "bg-red-500",
};

// ── Preacher grouping helpers ─────────────────────────────────────────────────

interface PreacherGroup {
  name: string;
  entries: HistoryEntry[];
  verdictCounts: Record<OverallVerdict, number>;
  worstVerdict: OverallVerdict;
}

function buildPreacherGroups(history: HistoryEntry[]): PreacherGroup[] {
  const map = new Map<string, HistoryEntry[]>();

  for (const entry of history) {
    const key = (entry.preacher ?? "").trim().toLowerCase() || "__unknown__";
    const label = (entry.preacher ?? "").trim() || "Unknown";
    const existing = map.get(label.toLowerCase());
    if (existing) {
      existing.push(entry);
    } else {
      // Use the display name from the first entry with this (normalized) key
      const displayKey = (entry.preacher ?? "").trim() || "Unknown";
      map.set(displayKey.toLowerCase(), [entry]);
    }
  }

  // Rebuild with display names
  const displayMap = new Map<string, { displayName: string; entries: HistoryEntry[] }>();
  for (const entry of history) {
    const displayName = (entry.preacher ?? "").trim() || "Unknown";
    const key = displayName.toLowerCase();
    if (!displayMap.has(key)) {
      displayMap.set(key, { displayName, entries: [] });
    }
    displayMap.get(key)!.entries.push(entry);
  }

  const groups: PreacherGroup[] = [];
  for (const { displayName, entries } of displayMap.values()) {
    // Skip preachers with no name and only one sermon
    if (displayName === "Unknown" && entries.length === 1) continue;

    const verdictCounts: Record<OverallVerdict, number> = {
      SOUND: 0,
      MIXED: 0,
      SERIOUS_CONCERNS: 0,
      FALSE_TEACHING: 0,
    };

    let worstVerdict: OverallVerdict = "SOUND";
    for (const e of entries) {
      verdictCounts[e.overallVerdict]++;
      if (VERDICT_SEVERITY[e.overallVerdict] > VERDICT_SEVERITY[worstVerdict]) {
        worstVerdict = e.overallVerdict;
      }
    }

    groups.push({ name: displayName, entries, verdictCounts, worstVerdict });
  }

  // Sort by sermon count descending
  groups.sort((a, b) => b.entries.length - a.entries.length);
  return groups;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HistoryList({
  history,
  onSelect,
  onDelete,
  onClose,
  t,
}: {
  history: HistoryEntry[];
  onSelect: HistoryDrawerProps["onSelect"];
  onDelete: HistoryDrawerProps["onDelete"];
  onClose: () => void;
  t: T;
}) {
  return (
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
                  className="text-[10px] text-white/20 hover:text-red-400 font-semibold transition-colors px-1 min-h-[28px]"
                >
                  {t.historyDelete}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function PreachersList({
  history,
  onSelect,
  onClose,
  t,
}: {
  history: HistoryEntry[];
  onSelect: HistoryDrawerProps["onSelect"];
  onClose: () => void;
  t: T;
}) {
  const [expandedPreacher, setExpandedPreacher] = useState<string | null>(null);
  const groups = buildPreacherGroups(history);

  if (groups.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-white/25 text-sm text-center py-12">{t.noPreachersTracked}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {groups.map((group) => {
        const ws = OVERALL_STYLES[group.worstVerdict] ?? OVERALL_STYLES.MIXED;
        const isExpanded = expandedPreacher === group.name;
        const total = group.entries.length;

        // Build verdict bar segments (only non-zero)
        const allVerdicts: OverallVerdict[] = [
          "SOUND",
          "MIXED",
          "SERIOUS_CONCERNS",
          "FALSE_TEACHING",
        ];

        return (
          <div
            key={group.name}
            className={`rounded-xl border ${ws.border} bg-black/20 overflow-hidden`}
          >
            {/* Preacher header */}
            <button
              className="w-full text-left px-4 py-3 min-h-[44px]"
              onClick={() =>
                setExpandedPreacher(isExpanded ? null : group.name)
              }
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base">🎤</span>
                  <span className="text-sm font-bold text-white/80 truncate">
                    {group.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${ws.border} ${ws.bg} ${ws.text}`}
                  >
                    {group.worstVerdict.replace(/_/g, " ")}
                  </span>
                  <svg
                    className={`w-3 h-3 text-white/30 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Sermon count */}
              <p className="text-xs text-white/35 mb-2">
                {total} {t.sermonsAnalyzed}
              </p>

              {/* Verdict distribution bar */}
              <div className="flex rounded-full overflow-hidden h-1.5 gap-px">
                {allVerdicts.map((v) => {
                  const count = group.verdictCounts[v];
                  if (count === 0) return null;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div
                      key={v}
                      className={`${VERDICT_COLORS[v]} flex-shrink-0`}
                      style={{ width: `${pct}%` }}
                      title={`${v.replace(/_/g, " ")}: ${count}`}
                    />
                  );
                })}
              </div>

              {/* Verdict pill badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {allVerdicts.map((v) => {
                  const count = group.verdictCounts[v];
                  if (count === 0) return null;
                  const vs = OVERALL_STYLES[v];
                  return (
                    <span
                      key={v}
                      className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full ${vs.bg} ${vs.text} border ${vs.border}`}
                    >
                      {count}× {v.replace(/_/g, " ")}
                    </span>
                  );
                })}
              </div>
            </button>

            {/* Expanded entry list */}
            {isExpanded && (
              <div className="border-t border-white/10 divide-y divide-white/[0.06]">
                {group.entries.map((entry) => {
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
                        <span className={`text-[10px] font-bold ${os.text}`}>{label}</span>
                        <span className="text-[10px] text-white/25 flex-shrink-0">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/30 truncate mt-0.5">
                        {entry.inputType === "youtube" ? "▶ " : ""}
                        {entry.inputPreview}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export function HistoryDrawer({
  open,
  onClose,
  history,
  onSelect,
  onDelete,
  t,
}: HistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<"history" | "preachers">("history");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full sm:max-w-md bg-[#141414] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all min-h-[32px] ${
                activeTab === "history"
                  ? "bg-violet-600 text-white"
                  : "text-white/30 hover:text-white/55"
              }`}
            >
              {t.historyTabLabel}
            </button>
            <button
              onClick={() => setActiveTab("preachers")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all min-h-[32px] ${
                activeTab === "preachers"
                  ? "bg-violet-600 text-white"
                  : "text-white/30 hover:text-white/55"
              }`}
            >
              {t.preachersTabLabel}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {activeTab === "history" ? (
          <HistoryList
            history={history}
            onSelect={onSelect}
            onDelete={onDelete}
            onClose={onClose}
            t={t}
          />
        ) : (
          <PreachersList
            history={history}
            onSelect={onSelect}
            onClose={onClose}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
