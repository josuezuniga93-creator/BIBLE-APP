"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "../../lib/useLanguage";
import type { ChurchAnalysis } from "../page";

// ─── Verdict helpers ──────────────────────────────────────────────────────────

function verdictColor(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v.includes("OUTSIDE HISTORIC")) return "#ef4444";
  if (v.includes("THEOLOGICALLY CONCERNING")) return "#f97316";
  if (v.includes("MIXED") || v.includes("DISCERNMENT")) return "#eab308";
  if (v.includes("MOSTLY ORTHODOX")) return "#86efac";
  if (v.includes("HISTORICALLY ORTHODOX")) return "#22c55e";
  // legacy fallbacks
  if (v.includes("HERETICAL")) return "#ef4444";
  if (v.includes("HETERODOX")) return "#f97316";
  if (v.includes("CONCERNING")) return "#eab308";
  if (v.includes("BROADLY")) return "#22c55e";
  return "#c9a961";
}

function verdictBg(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v.includes("OUTSIDE HISTORIC")) return "rgba(239,68,68,0.13)";
  if (v.includes("THEOLOGICALLY CONCERNING")) return "rgba(249,115,22,0.13)";
  if (v.includes("MIXED") || v.includes("DISCERNMENT")) return "rgba(234,179,8,0.13)";
  if (v.includes("MOSTLY ORTHODOX")) return "rgba(134,239,172,0.13)";
  if (v.includes("HISTORICALLY ORTHODOX")) return "rgba(34,197,94,0.13)";
  if (v.includes("HERETICAL")) return "rgba(239,68,68,0.13)";
  if (v.includes("HETERODOX")) return "rgba(249,115,22,0.13)";
  if (v.includes("CONCERNING")) return "rgba(234,179,8,0.13)";
  if (v.includes("BROADLY")) return "rgba(34,197,94,0.13)";
  return "rgba(201,169,97,0.13)";
}

function verdictBorder(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v.includes("OUTSIDE HISTORIC")) return "rgba(239,68,68,0.30)";
  if (v.includes("THEOLOGICALLY CONCERNING")) return "rgba(249,115,22,0.30)";
  if (v.includes("MIXED") || v.includes("DISCERNMENT")) return "rgba(234,179,8,0.30)";
  if (v.includes("MOSTLY ORTHODOX")) return "rgba(134,239,172,0.30)";
  if (v.includes("HISTORICALLY ORTHODOX")) return "rgba(34,197,94,0.30)";
  if (v.includes("HERETICAL")) return "rgba(239,68,68,0.30)";
  if (v.includes("HETERODOX")) return "rgba(249,115,22,0.30)";
  if (v.includes("CONCERNING")) return "rgba(234,179,8,0.30)";
  if (v.includes("BROADLY")) return "rgba(34,197,94,0.30)";
  return "rgba(201,169,97,0.30)";
}

// ─── Design helpers ───────────────────────────────────────────────────────────

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(201,169,97,0.15);padding:1px 4px;border-radius:4px;font-size:11px">$1</code>');
}

function getSeverity(lines: string[]): { label: string; color: string; bg: string; border: string } {
  for (const l of lines) {
    if (l.includes("Serious Concern") || l.includes("SERIOUS CONCERN")) return { label: "SERIOUS CONCERN", color: "#ef4444", bg: "rgba(239,68,68,0.07)", border: "#ef4444" };
    if (l.includes("Significant Concern") || l.includes("SIGNIFICANT CONCERN")) return { label: "SIGNIFICANT CONCERN", color: "#f97316", bg: "rgba(249,115,22,0.07)", border: "#f97316" };
    if (l.includes("Minor Concern") || l.includes("MINOR CONCERN")) return { label: "MINOR CONCERN", color: "#eab308", bg: "rgba(234,179,8,0.07)", border: "#eab308" };
  }
  return { label: "MINOR CONCERN", color: "#eab308", bg: "rgba(234,179,8,0.07)", border: "#eab308" };
}

function extractAfterHeading(lines: string[], heading: string): string {
  const idx = lines.findIndex(l => l.toLowerCase().includes(heading.toLowerCase()));
  if (idx === -1) return "";
  const parts: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    if (lines[i].startsWith("#")) break;
    if (lines[i].trim()) parts.push(lines[i].trim());
  }
  return parts.join(" ");
}

function extractCount(lines: string[], label: string): string {
  const idx = lines.findIndex(l => l.includes(label));
  if (idx === -1) return "0";
  for (let i = idx + 1; i < lines.length; i++) {
    const m = lines[i].trim().match(/^(\d+)/);
    if (m) return m[1];
    if (lines[i].trim() && !lines[i].startsWith("#")) return lines[i].trim();
  }
  return "0";
}

function getSectionColor(title: string): string {
  const t = title.toUpperCase();
  if (t.includes("MAJOR CONCERN") || t.includes("CONCERNS")) return "#ef4444";
  if (t.includes("POSITIVE")) return "#22c55e";
  if (t.includes("COMPARISON") || t.includes("HISTORIC CHRISTIAN C")) return "#60a5fa";
  if (t.includes("VERDICT")) return "#c9a961";
  if (t.includes("RECOMMENDATION")) return "#a78bfa";
  if (t.includes("SUMMARY")) return "#f97316";
  return "#c9a961";
}

function tableResultColor(val: string): string {
  const v = val.toUpperCase();
  if (v.includes("ORTHODOX")) return "#22c55e";
  if (v.includes("MIXED") || v.includes("CONCERNING")) return "#eab308";
  if (v.includes("DIVERGENT")) return "#ef4444";
  return "#c9a961";
}

function getRecColor(rec: string): string {
  const r = rec.toUpperCase();
  if (r.includes("AVOID")) return "#ef4444";
  if (r.includes("FINDING ANOTHER") || r.includes("CONSIDER FINDING")) return "#f97316";
  if (r.includes("SIGNIFICANT CONCERNS")) return "#f97316";
  if (r.includes("GENERALLY SOUND") || r.includes("DISCERNMENT")) return "#eab308";
  return "#22c55e";
}

// ─── Structured analysis renderer ─────────────────────────────────────────────

function renderAnalysis(text: string, fg: string, mutedFg: string, cardBg: string, borderColor: string) {
  const blocks = text.split(/\n---+\n/);
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;
    const lines = block.split("\n");
    const firstLine = lines.find(l => l.trim()) ?? "";

    // ── Skip top-level title block ──────────────────────────────────────────
    if (firstLine.startsWith("# CHURCH ANALYSIS")) continue;

    // ── Church Information ──────────────────────────────────────────────────
    if (lines.some(l => l.includes("### Church Information"))) {
      const items = lines.filter(l => l.startsWith("- ")).map(l => l.slice(2));
      elements.push(
        <div key={key++} className="rounded-2xl border p-4 mb-1" style={{ borderColor, background: cardBg }}>
          <p className="text-[10px] font-black uppercase tracking-[0.20em] mb-3" style={{ color: "#c9a961" }}>Church Information</p>
          <div className="space-y-2">
            {items.map((item, i) => {
              const colonIdx = item.indexOf(":");
              const label = colonIdx !== -1 ? item.slice(0, colonIdx).trim() : item;
              const value = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : "";
              return (
                <div key={i} className="flex gap-3 text-[12px]">
                  <span className="font-semibold flex-shrink-0" style={{ color: mutedFg, minWidth: 120 }}>{label}</span>
                  <span style={{ color: fg }}>{value || "Not specified"}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
      continue;
    }

    // ── Concern card ────────────────────────────────────────────────────────
    if (/^## Concern #\d+/.test(firstLine)) {
      const claim = lines.find(l => l.startsWith("### Claim:"))?.replace("### Claim:", "").trim() ?? "";
      const sev = getSeverity(lines);
      const evidenceLines = lines.filter(l => l.startsWith("> "));
      const assessment = extractAfterHeading(lines, "### Assessment");
      const why = extractAfterHeading(lines, "### Why This Matters");

      elements.push(
        <div key={key++} className="rounded-2xl mb-3 overflow-hidden"
          style={{ border: `1px solid ${sev.border}33`, borderLeft: `3px solid ${sev.border}`, background: sev.bg }}>
          {/* Severity badge */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: sev.color, background: sev.color + "22", border: `1px solid ${sev.color}44` }}>
              {sev.label}
            </span>
          </div>
          {/* Claim title */}
          {claim && (
            <div className="px-4 pb-2">
              <p className="text-[15px] font-bold leading-snug" style={{ color: fg }}>{claim}</p>
            </div>
          )}
          {/* Evidence blockquote(s) */}
          {evidenceLines.length > 0 && (
            <div className="mx-4 mb-3 rounded-xl p-3"
              style={{ background: "rgba(201,169,97,0.09)", borderLeft: "2px solid #c9a961" }}>
              {evidenceLines.map((ev, i) => (
                <p key={i} className="text-[12px] italic leading-relaxed" style={{ color: fg }}
                  dangerouslySetInnerHTML={{ __html: formatInline(ev.replace(/^>\s+/, "")) }} />
              ))}
            </div>
          )}
          {/* Assessment */}
          {assessment && (
            <div className="px-4 pb-2">
              <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: sev.color }}>Assessment</p>
              <p className="text-[13px] leading-relaxed" style={{ color: fg }}
                dangerouslySetInnerHTML={{ __html: formatInline(assessment) }} />
            </div>
          )}
          {/* Why this matters */}
          {why && (
            <div className="px-4 pb-4">
              <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: mutedFg }}>Why This Matters</p>
              <p className="text-[13px] leading-relaxed" style={{ color: mutedFg }}
                dangerouslySetInnerHTML={{ __html: formatInline(why) }} />
            </div>
          )}
        </div>
      );
      continue;
    }

    // ── Positive Finding card ───────────────────────────────────────────────
    if (/^## Positive Finding #\d+/.test(firstLine)) {
      const doctrine = lines.find(l => l.startsWith("### Doctrine:"))?.replace("### Doctrine:", "").trim() ?? "";
      const explanation = extractAfterHeading(lines, "Explanation:");

      elements.push(
        <div key={key++} className="rounded-2xl mb-3 overflow-hidden"
          style={{ border: "1px solid rgba(34,197,94,0.25)", borderLeft: "3px solid #22c55e", background: "rgba(34,197,94,0.06)" }}>
          <div className="px-4 pt-3 pb-2 flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: "#22c55e", background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.35)" }}>
              Orthodox
            </span>
          </div>
          {doctrine && (
            <div className="px-4 pb-2">
              <p className="text-[15px] font-bold" style={{ color: fg }}>{doctrine}</p>
            </div>
          )}
          {explanation && (
            <div className="px-4 pb-4">
              <p className="text-[13px] leading-relaxed" style={{ color: fg }}
                dangerouslySetInnerHTML={{ __html: formatInline(explanation) }} />
            </div>
          )}
        </div>
      );
      continue;
    }

    // ── Concern Summary ─────────────────────────────────────────────────────
    if (lines.some(l => /^# Concern Summary/.test(l))) {
      const serious = extractCount(lines, "Serious Concerns");
      const significant = extractCount(lines, "Significant Concerns");
      const minor = extractCount(lines, "Minor Concerns");
      const total = extractCount(lines, "Total Concerns");
      const positive = extractCount(lines, "Positive Findings");

      elements.push(
        <div key={key++} className="rounded-2xl border p-4 mb-1" style={{ borderColor, background: cardBg }}>
          <p className="text-[10px] font-black uppercase tracking-[0.20em] mb-3" style={{ color: "#f97316" }}>Concern Summary</p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {([
              { label: "Serious", val: serious, color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.22)" },
              { label: "Significant", val: significant, color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.22)" },
              { label: "Minor", val: minor, color: "#eab308", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.22)" },
            ] as { label: string; val: string; color: string; bg: string; border: string }[]).map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${borderColor}` }}>
              <p className="text-xl font-black" style={{ color: fg }}>{total}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: mutedFg }}>Total Concerns</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)" }}>
              <p className="text-xl font-black" style={{ color: "#22c55e" }}>{positive}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: "#22c55e" }}>Positive</p>
            </div>
          </div>
        </div>
      );
      continue;
    }

    // ── Verdict ─────────────────────────────────────────────────────────────
    if (lines.some(l => /^# Verdict/.test(l))) {
      const scoreLine = lines.find(l => /\d+\s*\/\s*100/.test(l));
      const score = scoreLine?.match(/(\d+)\s*\/\s*100/)?.[1] ?? null;
      const confidence = extractAfterHeading(lines, "### Confidence Level");
      const verdictLine = (lines.find(l => {
        const t = l.trim().toUpperCase();
        return t === "HISTORICALLY ORTHODOX" || t === "MOSTLY ORTHODOX" ||
          t === "MIXED / USE DISCERNMENT" || t === "THEOLOGICALLY CONCERNING" ||
          t === "OUTSIDE HISTORIC CHRISTIANITY";
      }) ?? lines.find(l =>
        l.includes("HISTORICALLY ORTHODOX") || l.includes("MOSTLY ORTHODOX") ||
        l.includes("MIXED / USE DISCERNMENT") || l.includes("THEOLOGICALLY CONCERNING") ||
        l.includes("OUTSIDE HISTORIC CHRISTIANITY")
      ) ?? "").trim();
      const summary = extractAfterHeading(lines, "### Verdict Summary");

      const vColor = verdictColor(verdictLine);
      const vBg = verdictBg(verdictLine);
      const vBorder = verdictBorder(verdictLine);
      const scoreNum = score ? parseInt(score, 10) : null;
      const barWidth = scoreNum !== null ? `${scoreNum}%` : "0%";

      elements.push(
        <div key={key++} className="rounded-2xl overflow-hidden mb-1" style={{ border: `1.5px solid ${vBorder}`, background: cardBg }}>
          {/* Score */}
          {score && (
            <div className="px-5 pt-5 pb-4 text-center border-b" style={{ borderColor }}>
              <p className="text-[10px] font-black uppercase tracking-[0.20em] mb-3" style={{ color: mutedFg }}>
                Historic Christian Alignment Score
              </p>
              <div className="flex items-end justify-center gap-1 mb-3">
                <span className="text-6xl font-black leading-none" style={{ color: vColor }}>{score}</span>
                <span className="text-xl font-bold mb-1" style={{ color: mutedFg }}>/100</span>
              </div>
              {/* Progress bar */}
              <div className="rounded-full overflow-hidden h-2 mx-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: barWidth, background: `linear-gradient(90deg, ${vColor}99, ${vColor})` }} />
              </div>
              {confidence && (
                <span className="inline-block mt-2.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: mutedFg, border: `1px solid ${borderColor}` }}>
                  {confidence} Confidence
                </span>
              )}
            </div>
          )}
          {/* Verdict label */}
          <div className="px-5 py-4 text-center" style={{ background: vBg }}>
            <p className="text-[11px] font-black uppercase tracking-[0.20em] mb-1" style={{ color: vColor, opacity: 0.7 }}>Verdict</p>
            <p className="text-lg font-black uppercase tracking-wide" style={{ color: vColor }}>{verdictLine}</p>
          </div>
          {/* Verdict summary */}
          {summary && (
            <div className="px-5 py-4 border-t" style={{ borderColor }}>
              <p className="text-[13px] leading-relaxed text-center" style={{ color: fg }}>{summary}</p>
            </div>
          )}
        </div>
      );
      continue;
    }

    // ── Final Recommendation ────────────────────────────────────────────────
    if (lines.some(l => /^# Final Recommendation/.test(l))) {
      const recLine = lines.find(l =>
        l.includes("Recommended Church") || l.includes("Generally Sound") ||
        l.includes("Significant Concerns Present") || l.includes("Consider Finding Another") ||
        l.includes("Avoid This Church")
      )?.trim() ?? "";
      const explanation = extractAfterHeading(lines, "### Recommendation Explanation");
      const rColor = getRecColor(recLine);

      elements.push(
        <div key={key++} className="rounded-2xl overflow-hidden mb-1"
          style={{ border: `2px solid ${rColor}55`, background: rColor + "0d" }}>
          <div className="px-5 py-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.20em] mb-2" style={{ color: rColor, opacity: 0.65 }}>
              Final Recommendation
            </p>
            <p className="text-base font-black uppercase tracking-wide" style={{ color: rColor }}>{recLine}</p>
          </div>
          {explanation && (
            <div className="px-5 pb-5 border-t" style={{ borderColor: rColor + "33", paddingTop: 14 }}>
              <p className="text-[13px] leading-relaxed text-center" style={{ color: fg }}>{explanation}</p>
            </div>
          )}
        </div>
      );
      continue;
    }

    // ── Section header pill (# Major Concerns, # Positive Findings…) ────────
    if (/^# (?!#)/.test(firstLine)) {
      const title = firstLine.replace(/^#\s+/, "");
      if (title.toUpperCase().startsWith("CHURCH ANALYSIS")) continue;
      const sColor = getSectionColor(title);
      elements.push(
        <div key={key++} className="flex items-center gap-3 mt-6 mb-3">
          <div className="h-px flex-1 rounded" style={{ background: sColor + "40" }} />
          <span className="text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full flex-shrink-0"
            style={{ color: sColor, background: sColor + "18", border: `1px solid ${sColor}35` }}>
            {title}
          </span>
          <div className="h-px flex-1 rounded" style={{ background: sColor + "40" }} />
        </div>
      );
      // Render any content after the heading in this block
      const rest = lines.slice(lines.indexOf(firstLine) + 1).join("\n").trim();
      if (rest) {
        elements.push(<div key={key++}>{renderFallback(rest, fg, mutedFg, borderColor)}</div>);
      }
      continue;
    }

    // ── Historic Christian Comparison table ──────────────────────────────────
    if (lines.some(l => l.trim().startsWith("|"))) {
      const tableLines = lines.filter(l => l.trim().startsWith("|") && !l.includes("---"));
      if (tableLines.length) {
        const rows = tableLines.map(l => l.split("|").filter(c => c.trim()).map(c => c.trim()));
        elements.push(
          <div key={key++} className="rounded-2xl overflow-hidden border mb-1" style={{ borderColor }}>
            {rows.map((cells, ri) => (
              <div key={ri}
                className="flex border-b last:border-b-0"
                style={{
                  borderColor,
                  background: ri === 0
                    ? "rgba(201,169,97,0.12)"
                    : ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                }}>
                <div className="flex-1 px-4 py-2.5 text-[12px] font-semibold"
                  style={{ color: ri === 0 ? "#c9a961" : fg }}>
                  {cells[0]}
                </div>
                <div className="flex-1 px-4 py-2.5 text-[12px] font-semibold text-right"
                  style={{ color: ri === 0 ? "#c9a961" : tableResultColor(cells[1] ?? "") }}
                  dangerouslySetInnerHTML={{ __html: ri === 0 ? (cells[1] ?? "") : formatInline(cells[1] ?? "") }} />
              </div>
            ))}
          </div>
        );
        continue;
      }
    }

    // ── Fallback: generic line-by-line ───────────────────────────────────────
    elements.push(<div key={key++}>{renderFallback(block, fg, mutedFg, borderColor)}</div>);
  }

  return <div className="space-y-1">{elements}</div>;
}

function renderFallback(text: string, fg: string, mutedFg: string, borderColor: string): React.ReactNode {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1" />;
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} className="flex gap-2.5 mb-1.5">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: "#c9a961" }} />
          <p className="text-[13px] leading-relaxed flex-1" style={{ color: fg }}
            dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^[-*]\s+/, "")) }} />
        </div>
      );
    }
    if (line.startsWith("> ")) {
      return (
        <div key={i} className="my-2 pl-3 border-l-2 py-2 rounded-r-lg"
          style={{ borderColor: "#c9a961", background: "rgba(201,169,97,0.07)" }}>
          <p className="text-[12px] italic leading-relaxed" style={{ color: fg }}
            dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^>\s+/, "")) }} />
        </div>
      );
    }
    if (line.trim().startsWith("---")) {
      return <hr key={i} className="my-3 border-0 border-t" style={{ borderColor }} />;
    }
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      return (
        <div key={i} className="flex gap-3 mb-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black mt-0.5"
            style={{ background: "rgba(201,169,97,0.20)", color: "#c9a961" }}>
            {numMatch[1]}
          </span>
          <p className="text-[13px] leading-relaxed flex-1" style={{ color: fg }}
            dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
        </div>
      );
    }
    return (
      <p key={i} className="text-[13px] leading-relaxed mb-1" style={{ color: fg }}
        dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    );
  });
}

// ─── Build plain-text version for sharing ─────────────────────────────────────

function buildShareText(analysis: ChurchAnalysis): string {
  const date = new Date(analysis.analyzedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const header = [
    "CHURCH ANALYSIS — Tulip Bible App",
    `Church/Pastor: ${analysis.churchName}`,
    analysis.denomination ? `Tradition: ${analysis.denomination}` : "",
    `Date: ${date}`,
    `Verdict: ${analysis.verdict}`,
    "",
    "─".repeat(40),
    "",
  ].filter(Boolean).join("\n");
  return header + analysis.result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [analysis, setAnalysis] = useState<ChurchAnalysis | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [showEs, setShowEs] = useState(false);
  const [loadingEs, setLoadingEs] = useState(false);

  const bg = "#0f0f0f";
  const fg = "#ffffff";
  const cardBg = "rgba(255,255,255,0.04)";
  const borderColor = "rgba(255,255,255,0.08)";
  const mutedFg = "rgba(255,255,255,0.38)";

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tulip-church-analyses");
      const list: ChurchAnalysis[] = raw ? JSON.parse(raw) : [];
      const found = list.find((a) => a.id === params.id);
      if (found) setAnalysis(found);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    }
  }, [params.id]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  // ── Download as PDF via window.print() ───────────────────────────────────────
  function handleDownload() {
    window.print();
  }

  // ── Share via Web Share API, fallback to clipboard ────────────────────────────
  async function handleShare() {
    if (!analysis) return;
    const text = buildShareText(analysis);
    const title = `Church Analysis: ${analysis.churchName}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Could not copy — try long-pressing the text");
    }
  }

  // ── Spanish toggle ───────────────────────────────────────────────────────────
  async function handleToggleSpanish() {
    if (!analysis) return;
    if (showEs) { setShowEs(false); return; }
    if (analysis.resultEs) { setShowEs(true); return; }

    const sermonsWithTranscripts = analysis.sermons.filter(s => s.transcript);
    if (sermonsWithTranscripts.length < 4) {
      showToast(lang === "es" ? "No hay transcripciones guardadas" : "Transcripts not stored — re-analyze to get Spanish");
      return;
    }

    setLoadingEs(true);
    try {
      const res = await fetch("/api/analyze-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName: analysis.churchName,
          denomination: analysis.denomination,
          sermons: sermonsWithTranscripts,
          language: "es",
        }),
      });
      const data = await res.json() as { analysis?: string; verdict?: string; error?: string };
      if (!res.ok || data.error || !data.analysis) {
        showToast(data.error ?? "No se pudo traducir");
        return;
      }
      const updated: ChurchAnalysis = { ...analysis, resultEs: data.analysis, verdictEs: data.verdict };
      setAnalysis(updated);
      try {
        const raw = localStorage.getItem("tulip-church-analyses");
        const list: ChurchAnalysis[] = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex(a => a.id === analysis.id);
        if (idx !== -1) { list[idx] = updated; localStorage.setItem("tulip-church-analyses", JSON.stringify(list)); }
      } catch { /**/ }
      setShowEs(true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error");
    } finally {
      setLoadingEs(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: bg }}>
        <p className="text-lg font-bold mb-2" style={{ color: fg }}>Analysis not found</p>
        <button onClick={() => router.push("/church-analysis")} className="text-sm mt-3" style={{ color: "#c9a961" }}>
          ← Back to list
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: "rgba(201,169,97,0.3)", borderTopColor: "#c9a961" }} />
      </div>
    );
  }

  const dateStr = new Date(analysis.analyzedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      {/* ── Print stylesheet — hides app chrome, shows clean analysis ──────── */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #111 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          nav, footer, [data-bottom-nav], [data-app-nav] { display: none !important; }
          .layout-children { padding: 0 !important; }
          #print-root { padding: 24px !important; }
          #print-root h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
          #print-root .print-meta { font-size: 11px; color: #555; margin-bottom: 16px; }
          #print-root .print-verdict {
            display: inline-block;
            border: 1.5px solid #999;
            border-radius: 6px;
            padding: 2px 10px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 20px;
          }
          #print-root .print-body { font-size: 12px; line-height: 1.6; white-space: pre-wrap; }
          #print-root .print-section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            border-top: 1px solid #ddd;
            padding-top: 12px;
            margin-top: 20px;
            margin-bottom: 8px;
            color: #7a5c1e;
          }
          #print-root .print-disclaimer {
            margin-top: 32px;
            font-size: 9px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @page { margin: 1in; }
        }
        @media not print {
          .print-only { display: none !important; }
        }
      `}</style>

      <div id="print-root" className="min-h-screen" style={{ background: bg, color: fg }}>

        {/* ── Print-only header (hidden on screen) ─────────────────────────── */}
        <div className="print-only" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#c9a961", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
            Church Analysis — Tulip Bible App
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{analysis.churchName}</h1>
          {analysis.denomination && <p className="print-meta">{analysis.denomination}</p>}
          <p className="print-meta">{dateStr} · {analysis.sermons.length} sermon{analysis.sermons.length !== 1 ? "s" : ""} analyzed</p>
          <div className="print-verdict">{analysis.verdict}</div>
        </div>

        <main className="max-w-lg mx-auto px-4 pt-5 pb-14">

          {/* ── Back button ──────────────────────────────────────────────────── */}
          <button
            onClick={() => router.push("/church-analysis")}
            className="no-print flex items-center gap-2 mb-5 active:opacity-60 transition-opacity"
            style={{ color: "#c9a961" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span className="text-sm font-semibold">All Analyses</span>
          </button>

          {/* ── Header card ──────────────────────────────────────────────────── */}
          <div className="no-print rounded-2xl border px-4 py-4 mb-4" style={{ borderColor, background: cardBg }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-[0.20em] uppercase mb-1" style={{ color: "rgba(201,169,97,0.75)" }}>
                  Church Analysis
                </p>
                <h1 className="text-xl font-bold leading-tight" style={{ color: fg }}>
                  {analysis.churchName}
                </h1>
                {analysis.denomination && (
                  <p className="text-xs mt-0.5" style={{ color: mutedFg }}>{analysis.denomination}</p>
                )}
              </div>
              {/* Verdict badge */}
              <div
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border"
                style={{
                  color: verdictColor(analysis.verdict),
                  background: verdictBg(analysis.verdict),
                  borderColor: verdictBorder(analysis.verdict),
                }}
              >
                {analysis.verdict}
              </div>
            </div>
            {/* Meta */}
            <div className="flex items-center gap-4 text-[11px]" style={{ color: mutedFg }}>
              <span>{analysis.sermons.length} sermon{analysis.sermons.length !== 1 ? "s" : ""} analyzed</span>
              <span>·</span>
              <span>{dateStr}</span>
            </div>
          </div>

          {/* ── Language toggle ───────────────────────────────────────────────── */}
          <button
            onClick={handleToggleSpanish}
            disabled={loadingEs}
            className="no-print w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform mb-3"
            style={{
              background: showEs ? "rgba(201,169,97,0.15)" : "rgba(255,255,255,0.04)",
              color: showEs ? "#c9a961" : mutedFg,
              border: `1px solid ${showEs ? "rgba(201,169,97,0.35)" : borderColor}`,
              opacity: loadingEs ? 0.6 : 1,
            }}
          >
            {loadingEs ? "Traduciendo al español…" : showEs ? "View in English" : "Ver en Español"}
          </button>

          {/* ── Action buttons: Download + Share ─────────────────────────────── */}
          <div className="no-print flex gap-3 mb-5">
            {/* Download PDF */}
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
              style={{
                background: "rgba(201,169,97,0.12)",
                color: "#c9a961",
                border: "1px solid rgba(201,169,97,0.30)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v13M8 12l4 4 4-4"/>
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
              </svg>
              Download PDF
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
              style={{
                background: "linear-gradient(135deg, #d9b970, #c9a961)",
                color: "#0e1018",
                boxShadow: "0 3px 14px rgba(201,169,97,0.28)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
          </div>

          {/* ── Sermons list (collapsed) ──────────────────────────────────────── */}
          <details className="no-print mb-5 rounded-xl border overflow-hidden" style={{ borderColor, background: cardBg }}>
            <summary className="px-4 py-3 text-sm font-semibold cursor-pointer list-none flex items-center justify-between" style={{ color: fg }}>
              <span>Sermons Analyzed ({analysis.sermons.length})</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={mutedFg} strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </summary>
            <div className="px-4 pb-3 space-y-2 border-t pt-3" style={{ borderColor }}>
              {analysis.sermons.map((s, i) => (
                <div key={i} className="text-xs" style={{ color: mutedFg }}>
                  <span className="font-semibold" style={{ color: fg }}>
                    {s.title || `Sermon ${i + 1}`}
                  </span>
                  {s.url && <span className="block truncate mt-0.5">{s.url}</span>}
                </div>
              ))}
            </div>
          </details>

          {/* ── Analysis result ───────────────────────────────────────────────── */}
          <div className="rounded-2xl border px-4 py-4" style={{ borderColor, background: cardBg }}>
            <p className="no-print text-[10px] font-black uppercase tracking-[0.20em] mb-4" style={{ color: "rgba(201,169,97,0.75)" }}>
              {showEs ? "Análisis Completo" : "Full Analysis"}
            </p>
            {renderAnalysis(
              showEs && analysis.resultEs ? analysis.resultEs : analysis.result,
              fg, mutedFg, cardBg, borderColor
            )}
          </div>

          {/* ── Disclaimer ────────────────────────────────────────────────────── */}
          <p className="no-print text-[10px] text-center mt-8 leading-relaxed px-4" style={{ color: mutedFg }}>
            AI-assisted analysis is a tool, not a substitute for prayerful study, your local church, or godly counsel.
          </p>
        </main>

        {/* ── Toast notification ────────────────────────────────────────────── */}
        <div
          className="no-print fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 pointer-events-none whitespace-nowrap"
          style={{
            background: "#c9a961",
            color: "#0e1018",
            opacity: toastVisible ? 1 : 0,
            transform: `translateX(-50%) translateY(${toastVisible ? "0" : "8px"})`,
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      </div>
    </>
  );
}
