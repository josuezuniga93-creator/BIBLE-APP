"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../lib/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SermonRecord {
  url: string;
  title?: string;
  transcript?: string;
}

export interface ChurchAnalysis {
  id: string;
  churchName: string;
  denomination?: string;
  sermons: SermonRecord[];
  result: string;
  verdict: string;
  resultEs?: string;
  verdictEs?: string;
  analyzedAt: string;
}

const STORAGE_KEY = "tulip-church-analyses";

function loadAnalyses(): ChurchAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChurchAnalysis[]) : [];
  } catch {
    return [];
  }
}

// ─── Verdict helpers ──────────────────────────────────────────────────────────

function verdictColor(verdict: string): string {
  if (verdict.toLowerCase().includes("broadly")) return "#22c55e";   // green
  if (verdict.toLowerCase().includes("concerning")) return "#eab308"; // yellow
  if (verdict.toLowerCase().includes("heterodox")) return "#f97316";  // orange
  if (verdict.toLowerCase().includes("heretical")) return "#ef4444";  // red
  return "#c9a961"; // default gold
}

function verdictBg(verdict: string): string {
  if (verdict.toLowerCase().includes("broadly")) return "rgba(34,197,94,0.12)";
  if (verdict.toLowerCase().includes("concerning")) return "rgba(234,179,8,0.12)";
  if (verdict.toLowerCase().includes("heterodox")) return "rgba(249,115,22,0.12)";
  if (verdict.toLowerCase().includes("heretical")) return "rgba(239,68,68,0.12)";
  return "rgba(201,169,97,0.12)";
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChurchAnalysisIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v3M10.5 3.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 9h16v12H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M9 21v-5h6v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M6 9V7l6-4 6 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChurchAnalysisPage() {
  const { theme } = useTheme();
  const [isLight, setIsLight] = useState(false);
  const [analyses, setAnalyses] = useState<ChurchAnalysis[]>([]);

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    setIsLight(t === "white-noir");
    const obs = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "white-noir");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setAnalyses(loadAnalyses());
  }, []);

  function deleteAnalysis(id: string) {
    const updated = analyses.filter((a) => a.id !== id);
    setAnalyses(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /**/ }
  }

  const bg = isLight ? "#f5f0e8" : "#0f0f0f";
  const fg = isLight ? "#1c1409" : "#ffffff";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";
  const borderColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const mutedFg = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.38)";

  return (
    <div className="min-h-screen" style={{ background: bg, color: fg }}>
      <main className="max-w-lg mx-auto px-4 pt-6 pb-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: "rgba(201,169,97,0.75)" }}>
              Discernment Tool
            </p>
            <h1 className="text-2xl font-bold" style={{ color: fg }}>Church Analysis</h1>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedFg }}>
              Historic Christian analysis of sermons & pastors
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #d9b970, #c9a961)", boxShadow: "0 4px 16px rgba(201,169,97,0.28)" }}
          >
            <ChurchAnalysisIcon size={20} />
          </div>
        </div>

        {/* ── New Analysis button ──────────────────────────────────────────── */}
        <Link href="/church-analysis/new" className="block mt-5 mb-6">
          <div
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #d9b970, #c9a961)",
              color: "#0e1018",
              boxShadow: "0 4px 20px rgba(201,169,97,0.30)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Analysis
          </div>
        </Link>

        {/* ── Saved analyses ───────────────────────────────────────────────── */}
        {analyses.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-2xl border text-center"
            style={{ borderColor, background: cardBg }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(201,169,97,0.10)" }}>
              <ChurchAnalysisIcon size={26} />
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: fg }}>No analyses yet</p>
            <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: mutedFg }}>
              Tap "New Analysis" to analyze a church or pastor's sermons against the historic Christian faith.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-widest uppercase px-1 mb-3" style={{ color: mutedFg }}>
              Saved Analyses ({analyses.length})
            </p>
            {analyses
              .slice()
              .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
              .map((analysis) => (
                <div
                  key={analysis.id}
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor, background: cardBg }}
                >
                  <Link href={`/church-analysis/${analysis.id}`} className="block px-4 py-4 active:opacity-70 transition-opacity">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px] leading-tight truncate" style={{ color: fg }}>
                          {analysis.churchName}
                        </p>
                        {analysis.denomination && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: mutedFg }}>
                            {analysis.denomination}
                          </p>
                        )}
                        <p className="text-[11px] mt-2" style={{ color: mutedFg }}>
                          {analysis.sermons.length} sermon{analysis.sermons.length !== 1 ? "s" : ""} ·{" "}
                          {new Date(analysis.analyzedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {/* Verdict badge */}
                      <div
                        className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide"
                        style={{
                          color: verdictColor(analysis.verdict),
                          background: verdictBg(analysis.verdict),
                        }}
                      >
                        {analysis.verdict.split(" ").slice(0, 2).join(" ")}
                      </div>
                    </div>
                  </Link>
                  {/* Delete row */}
                  <div className="border-t px-4 py-2 flex justify-end" style={{ borderColor }}>
                    <button
                      onClick={() => {
                        if (confirm(`Delete analysis for "${analysis.churchName}"?`)) {
                          deleteAnalysis(analysis.id);
                        }
                      }}
                      className="text-[11px] font-semibold active:opacity-50 transition-opacity"
                      style={{ color: "rgba(239,68,68,0.65)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── Disclaimer ──────────────────────────────────────────────────── */}
        <p className="text-[10px] text-center mt-8 leading-relaxed px-4" style={{ color: mutedFg }}>
          AI-assisted analysis is a tool, not a substitute for prayerful study, your local church, or godly counsel.
          Framework: Historic Christian orthodoxy anchored in Scripture, the ecumenical creeds, and historic confessions.
        </p>
      </main>
    </div>
  );
}
