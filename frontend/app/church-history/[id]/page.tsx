"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CHURCH_HISTORY } from "../../lib/churchHistory";

const SERIF   = "'Georgia', 'Palatino Linotype', serif";
const AC      = "#c9a961";                               // gold accent
const BG      = "#0f1023";                               // dark navy-purple
const SURFACE = "#1c1e36";                               // card surface

export default function ChurchHistoryStory() {
  const { id } = useParams<{ id: string }>();
  const entry  = CHURCH_HISTORY.find((e) => e.id === id);

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
          Story not found.
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
          ← Back to Home
        </Link>
      </div>
    );
  }

  const paragraphs = entry.fullStory.split("\n\n").filter(Boolean);

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
          Home
        </Link>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 22px 0" }}>

        {/* Category + Year badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <span
            style={{
              background: "linear-gradient(135deg, #d946ef22, #7c3aed22)",
              border: "1px solid rgba(201,100,220,0.30)",
              color: "#e879f9",
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {entry.category === "missionary" ? "Missionary" : "Hymn"}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#a0a3b8",
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
            color: "#f0ecff",
            lineHeight: 1.3,
            margin: "0 0 24px",
          }}
        >
          {entry.title}
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
              color: "#cec9e0",
              lineHeight: 1.7,
              margin: "0 0 8px",
            }}
          >
            "{entry.verseText}"
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
            color: "#555",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Church History
        </p>

        {/* Full story */}
        <div style={{ marginBottom: 32 }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 16,
                lineHeight: 1.78,
                color: "#b8b4cc",
                marginBottom: i < paragraphs.length - 1 ? 18 : 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Key Takeaway */}
        <div
          style={{
            background: SURFACE,
            border: "1px solid rgba(201,169,97,0.20)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: AC,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Key Takeaway
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              fontStyle: "italic",
              color: "#cec9e0",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {entry.keyTakeaway}
          </p>
        </div>

        {/* Bottom spacing */}
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
