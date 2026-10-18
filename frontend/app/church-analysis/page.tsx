"use client";
import {Action,SectionTitle,Row} from "../components/study/Views";

import FeatureFrame from "../components/study/FeatureFrame";
export default function ChurchAnalysisPage() { return <FeatureFrame title="Church analysis" screen="church-analysis"><ChurchAnalysisContent/></FeatureFrame>; }

import { useState, useEffect } from "react";

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
  return "#a3a3a3";
}

function verdictBg(verdict: string): string {
  if (verdict.toLowerCase().includes("broadly")) return "rgba(34,197,94,0.12)";
  if (verdict.toLowerCase().includes("concerning")) return "rgba(234,179,8,0.12)";
  if (verdict.toLowerCase().includes("heterodox")) return "rgba(249,115,22,0.12)";
  if (verdict.toLowerCase().includes("heretical")) return "rgba(239,68,68,0.12)";
  return "rgba(163,163,163,0.12)";
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

function ChurchAnalysisContent() {
  const [analyses, setAnalyses] = useState<ChurchAnalysis[]>([]);

  useEffect(() => {
    setAnalyses(loadAnalyses());
  }, []);

  return (<><p className="body-copy">Compare a pastor or church&apos;s teaching with historic Christian doctrine. Add sermon links or paste a transcript to begin.</p><Action onClick={()=>window.location.assign('/church-analysis/new')}>Start a sermon analysis</Action>{analyses.length>0&&<><SectionTitle>Saved analyses</SectionTitle>{analyses.map(analysis=><Row key={analysis.id} title={analysis.churchName} sub={/heretical|outside historic christianity/i.test(analysis.verdict)?"RED FLAG":analysis.verdict} onClick={()=>window.location.assign('/church-analysis/'+analysis.id)}/>)}</>}</>);
}
