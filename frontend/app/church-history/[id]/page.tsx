"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CHURCH_HISTORY } from "../../lib/churchHistory";
import { useLanguage } from "../../lib/useLanguage";
import { translateToSpanish } from "../../lib/googleTranslate";

const SERIF   = "'Georgia', 'Palatino Linotype', serif";
const AC      = "#c9a961";                               // gold accent
const BG      = "#0f1023";                               // dark navy-purple
const SURFACE = "#1c1e36";                               // card surface

export default function ChurchHistoryStory() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const entry  = CHURCH_HISTORY.find((e) => e.id === id);

  const [esTitle,     setEsTitle]     = useState<string | null>(null);
  const [esVerseText, setEsVerseText] = useState<string | null>(null);
  const [esFullStory, setEsFullStory] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (lang !== "es" || !entry) {
      setEsTitle(null); setEsVerseText(null); setEsFullStory(null);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    (async () => {
      try {
        const [tt, tv, tf] = await Promise.all([
          translateToSpanish(entry.title,     `story_title_${entry.id}`),
          translateToSpanish(entry.verseText, `story_verse_${entry.id}`),
          translateToSpanish(entry.fullStory, `story_body_${entry.id}`),
        ]);
        if (!cancelled) { setEsTitle(tt); setEsVerseText(tv); setEsFullStory(tf); }
      } catch { /* fall back to English */ }
      finally { if (!cancelled) setTranslating(false); }
    })();
    return () => { cancelled = true; };
  }, [lang, entry?.id]);

  /* ── Not found ─────────────────────────────────────────────────────────── */
  if (!entry) {
    return (
      <div
        style={{
          background: BG,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "env(safe-area-inset-top)",
          gap: 16,
        }}
      >
        <p style={{ color: "#aaa", fontFamily: SERIF, fontSize: 18 }}>
          {lang === "es" ? "Historia no encontrada." : "Story not found."}
        </p>
        <Link
          href="/"
          style={{
            color: AC,
            fontSize: 14,
            textDecoration: "none",
            borderBottom: `1px solid ${AC}`,
          }}
        >
          {lang === "es" ? "← Volver al inicio" : "← Back to Home"}
        </Link>
      </div>
    );
  }

  const displayTitle     = lang === "es" ? (esTitle     ?? entry.title)     : entry.title;
  const displayVerseText = lang === "es" ? (esVerseText ?? entry.verseText) : entry.verseText;
  const displayFullStory = lang === "es" ? (esFullStory ?? entry.fullStory) : entry.fullStory;
  const paragraphs = displayFullStory.split("\n\n").filter(Boolean);

  return (
    <div
      style={{
        background: BG,
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: 40,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: SURFACE,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: AC,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={AC}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {lang === "es" ? "Inicio" : "Home"}
        </Link>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 22px 0" }}>

        {/* Category + Year badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <span
            style={{
              background: "rgba(201,169,97,0.14)",
              border: "1px solid rgba(201,169,97,0.38)",
              color: "#c9a961",
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {entry.category === "missionary"
              ? (lang === "es" ? "Misionero" : "Missionary")
              : (lang === "es" ? "Himno" : "Hymn")}
          </span>
          <span
            style={{
              background: "rgba(201,169,97,0.07)",
              border: "1px solid rgba(201,169,97,0.20)",
              color: "#a09070",
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {entry.year}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 26,
            fontWeight: 700,
            color: "#f5f0e8",
            lineHeight: 1.3,
            margin: "0 0 24px",
          }}
        >
          {displayTitle}
        </h1>

        {/* Verse blockquote */}
        <blockquote
          style={{
            borderLeft: `3px solid ${AC}`,
            paddingLeft: 16,
            margin: "0 0 30px",
          }}
        >
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              fontStyle: "italic",
              color: "#d4cdb8",
              lineHeight: 1.7,
              margin: "0 0 8px",
            }}
          >
            "{displayVerseText}"
          </p>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: AC,
              textTransform: "uppercase",
            }}
          >
            {entry.verseReference}
          </span>
        </blockquote>

        {/* Section label */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "rgba(201,169,97,0.45)",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          {lang === "es" ? "Historia de la Iglesia" : "Church History"}
        </p>

        {/* Translating indicator */}
        {lang === "es" && translating && (
          <p style={{ fontSize: 11, color: "rgba(201,169,97,0.65)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="animate-spin" style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(201,169,97,0.25)", borderTopColor: AC }} />
            Traduciendo al español…
          </p>
        )}

        {/* Full story */}
        <div style={{ marginBottom: 32 }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 16,
                lineHeight: 1.78,
                color: "#c8c2b0",
                marginBottom: i < paragraphs.length - 1 ? 18 : 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Bottom spacing */}
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
