"use client";

import type { CSSProperties, ReactNode } from "react";

type CoverSize = "full" | "small" | "featured" | "detail";
type ArtKind = "book" | "document" | "badge" | "category" | "meta";

interface CoverPalette {
  darkFrom: string;
  darkVia: string;
  darkTo: string;
  darkAccent: string;
  darkBorder: string;
  pinkFrom: string;
  pinkVia: string;
  pinkTo: string;
  pinkAccent: string;
  pinkBorder: string;
  elegantFrom: string;
  elegantVia: string;
  elegantTo: string;
  elegantAccent: string;
  elegantBorder: string;
}

const COVER_PALETTES: CoverPalette[] = [
  {
    darkFrom: "#0d1b2a",
    darkVia: "#1b4332",
    darkTo: "#05080d",
    darkAccent: "#74c69d",
    darkBorder: "rgba(116,198,157,0.35)",
    pinkFrom: "#fff7fb",
    pinkVia: "#fce7f3",
    pinkTo: "#f8d8e8",
    pinkAccent: "#be185d",
    pinkBorder: "rgba(219,39,119,0.22)",
    elegantFrom: "#fbf4e6",
    elegantVia: "#ead9b8",
    elegantTo: "#d8c295",
    elegantAccent: "#8a621f",
    elegantBorder: "rgba(155,114,40,0.26)",
  },
  {
    darkFrom: "#1b1028",
    darkVia: "#4c1d5f",
    darkTo: "#08050d",
    darkAccent: "#d8b4fe",
    darkBorder: "rgba(216,180,254,0.32)",
    pinkFrom: "#fff4f9",
    pinkVia: "#f9d3e5",
    pinkTo: "#f0b8d4",
    pinkAccent: "#db2777",
    pinkBorder: "rgba(190,24,93,0.24)",
    elegantFrom: "#f7efe0",
    elegantVia: "#ddc28a",
    elegantTo: "#c7a260",
    elegantAccent: "#7a551b",
    elegantBorder: "rgba(122,85,27,0.28)",
  },
  {
    darkFrom: "#1f1308",
    darkVia: "#5a2e12",
    darkTo: "#090603",
    darkAccent: "#f4b860",
    darkBorder: "rgba(244,184,96,0.34)",
    pinkFrom: "#fff8f5",
    pinkVia: "#fde2e7",
    pinkTo: "#f7cbd6",
    pinkAccent: "#c02667",
    pinkBorder: "rgba(192,38,103,0.22)",
    elegantFrom: "#fff8e8",
    elegantVia: "#e8cf9d",
    elegantTo: "#caa566",
    elegantAccent: "#8b6914",
    elegantBorder: "rgba(139,105,20,0.30)",
  },
  {
    darkFrom: "#07141d",
    darkVia: "#164e63",
    darkTo: "#03070a",
    darkAccent: "#67e8f9",
    darkBorder: "rgba(103,232,249,0.30)",
    pinkFrom: "#fff7fc",
    pinkVia: "#fae8ff",
    pinkTo: "#f3d5f7",
    pinkAccent: "#a21caf",
    pinkBorder: "rgba(162,28,175,0.20)",
    elegantFrom: "#f8f1e4",
    elegantVia: "#e3d3b5",
    elegantTo: "#cbb387",
    elegantAccent: "#8b6b2a",
    elegantBorder: "rgba(139,107,42,0.28)",
  },
  {
    darkFrom: "#1c0b12",
    darkVia: "#831843",
    darkTo: "#080307",
    darkAccent: "#f9a8d4",
    darkBorder: "rgba(249,168,212,0.30)",
    pinkFrom: "#fff6fa",
    pinkVia: "#fbcfe8",
    pinkTo: "#f5b5d2",
    pinkAccent: "#be123c",
    pinkBorder: "rgba(190,18,60,0.20)",
    elegantFrom: "#fbf1df",
    elegantVia: "#e4c993",
    elegantTo: "#bd9852",
    elegantAccent: "#7c531a",
    elegantBorder: "rgba(124,83,26,0.28)",
  },
];

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function paletteFor(seed: string): CoverPalette {
  return COVER_PALETTES[hashString(seed) % COVER_PALETTES.length];
}

function coverStyle(seed: string, kind: ArtKind): CSSProperties {
  const palette = paletteFor(`${kind}:${seed}`);
  return {
    "--cover-dark-from": palette.darkFrom,
    "--cover-dark-via": palette.darkVia,
    "--cover-dark-to": palette.darkTo,
    "--cover-dark-accent": palette.darkAccent,
    "--cover-dark-border": palette.darkBorder,
    "--cover-pink-from": palette.pinkFrom,
    "--cover-pink-via": palette.pinkVia,
    "--cover-pink-to": palette.pinkTo,
    "--cover-pink-accent": palette.pinkAccent,
    "--cover-pink-border": palette.pinkBorder,
    "--cover-elegant-from": palette.elegantFrom,
    "--cover-elegant-via": palette.elegantVia,
    "--cover-elegant-to": palette.elegantTo,
    "--cover-elegant-accent": palette.elegantAccent,
    "--cover-elegant-border": palette.elegantBorder,
  } as CSSProperties;
}

function compactTitle(title: string, fallback = "Classic"): string {
  const cleaned = title.replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function initials(text: string): string {
  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => !["the", "of", "and", "a", "an"].includes(word.toLowerCase()));
  const source = words.length > 0 ? words : ["T"];
  return source.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}

function BookSeal({ seed, small = false }: { seed: string; small?: boolean }) {
  const mode = hashString(seed) % 3;
  if (mode === 0) {
    return (
      <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
        <path d="M12 15c5-3 10-3 12 1v20c-3-3-7-4-12-1V15Z" />
        <path d="M36 15c-5-3-10-3-12 1v20c3-3 7-4 12-1V15Z" />
        <path d="M24 16v20" />
      </svg>
    );
  }
  if (mode === 1) {
    return (
      <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
        <path d="M24 10v28" />
        <path d="M15 20h18" />
        <path d="M16 38h16" />
        <path d="M18 13c4-4 8-4 12 0" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
      <path d="M14 35h20" />
      <path d="M16 30h16" />
      <path d="M18 25h12" />
      <path d="M12 38 24 10l12 28" />
      {!small && <path d="M19 29h10" />}
    </svg>
  );
}

function DocumentSeal({ seed }: { seed: string }) {
  const mode = hashString(seed) % 4;
  if (mode === 0) {
    return (
      <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
        <path d="M15 11h18l4 5v22H15V11Z" />
        <path d="M33 11v6h5" />
        <path d="M20 22h16M20 28h13M20 34h10" />
      </svg>
    );
  }
  if (mode === 1) {
    return (
      <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
        <path d="M24 9 11 16h26L24 9Z" />
        <path d="M15 19v16M24 19v16M33 19v16" />
        <path d="M11 38h26" />
      </svg>
    );
  }
  if (mode === 2) {
    return (
      <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
        <path d="M24 10v26" />
        <path d="M15 20h18" />
        <path d="M16 37h16" />
        <path d="M12 14c5-4 19-4 24 0" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="generated-cover__seal" aria-hidden="true">
      <path d="M14 13h20v25H14V13Z" />
      <path d="M18 18h12M18 23h12M18 28h9" />
      <path d="M34 13l-5 5" />
    </svg>
  );
}

function BadgeGlyph({ id }: { id: string }) {
  if (id.includes("three") || id.includes("week")) {
    return (
      <>
        <path d="M12 20c4-2 6-5 5-10 4 3 6 7 6 11 0 5-4 9-9 9s-9-4-9-9c0-4 2-7 5-10-.2 4 .5 7 2 9Z" />
        <path d="M14 29c-2-2-2-5 1-8 3 3 4 6 1 8" />
      </>
    );
  }
  if (id.includes("first")) {
    return (
      <>
        <path d="M15 30V13" />
        <path d="M15 17c-6-1-9 2-9 7 5 1 8-1 9-7Z" />
        <path d="M15 17c6-1 9 2 9 7-5 1-8-1-9-7Z" />
      </>
    );
  }
  if (id.includes("fortnight") || id.includes("two")) {
    return (
      <>
        <path d="M5 27 13 11l6 11 4-7 7 12" />
        <path d="M8 27h20" />
      </>
    );
  }
  if (id.includes("month")) {
    return (
      <>
        <circle cx="15" cy="15" r="4" />
        <path d="M15 19v11" />
        <path d="M10 24h10" />
        <path d="M8 30h14" />
      </>
    );
  }
  if (id.includes("century") || id.includes("90")) {
    return (
      <>
        <path d="M10 27c-4-4-4-10 0-14" />
        <path d="M22 13c4 4 4 10 0 14" />
        <path d="M11 26c3 3 8 3 11 0" />
        <path d="M12 14c3-3 7-3 10 0" />
        <path d="M16 11v18" />
      </>
    );
  }
  if (id.includes("year")) {
    return (
      <>
        <path d="m6 26 2-13 6 6 6-6 2 13H6Z" />
        <path d="M7 30h14" />
      </>
    );
  }
  if (id.includes("devotional")) {
    return (
      <>
        <path d="M8 12c4-2 9-2 13 1v15c-4-3-9-3-13-1V12Z" />
        <path d="M8 12v15" />
        <path d="M14 14v11" />
      </>
    );
  }
  return (
    <>
      <path d="M15 5v20" />
      <path d="M8 13h14" />
      <path d="M7 30h16" />
    </>
  );
}

function CategoryGlyph({ id }: { id: string }) {
  const key = id.toLowerCase();
  if (key.includes("book") || key === "all" || key.includes("library")) {
    return (
      <>
        <path d="M8 9h8c3 0 5 2 5 5v14c-2-2-5-3-8-3H8V9Z" />
        <path d="M22 14v14" />
        <path d="M10 14h6M10 18h6" />
      </>
    );
  }
  if (key.includes("confession") || key.includes("reformed") || key.includes("puritan")) {
    return (
      <>
        <path d="M16 7v22" />
        <path d="M9 15h14" />
        <path d="M8 29h16" />
      </>
    );
  }
  if (key.includes("creed") || key.includes("patristic") || key.includes("council")) {
    return (
      <>
        <path d="M16 6 6 12h20L16 6Z" />
        <path d="M9 14v12M16 14v12M23 14v12" />
        <path d="M6 29h20" />
      </>
    );
  }
  if (key.includes("debate")) {
    return (
      <>
        <path d="M8 10h10a4 4 0 0 1 0 8h-5l-5 5V10Z" />
        <path d="M21 18h3v9l-4-3h-6" />
      </>
    );
  }
  if (key.includes("catechism") || key.includes("theology")) {
    return (
      <>
        <path d="M16 6v23" />
        <path d="M8 13h16" />
        <path d="M10 29h12" />
        <path d="M11 18h10" />
      </>
    );
  }
  if (key.includes("allegory") || key.includes("devotional")) {
    return (
      <>
        <path d="M7 25c8-1 13-6 17-16" />
        <path d="M10 16c6-5 11-4 14-1-4 4-9 5-14 1Z" />
        <path d="M8 28h16" />
      </>
    );
  }
  return (
    <>
      <path d="M9 8h14v20H9V8Z" />
      <path d="M13 13h6M13 18h6M13 23h4" />
    </>
  );
}

function MetaGlyph({ type }: { type: string }) {
  if (type === "sections" || type === "document") {
    return (
      <>
        <path d="M8 6h13v20H8V6Z" />
        <path d="M12 11h5M12 16h5M12 21h4" />
      </>
    );
  }
  if (type === "language") {
    return (
      <>
        <circle cx="16" cy="16" r="10" />
        <path d="M6 16h20" />
        <path d="M16 6c3 3 4 17 0 20" />
        <path d="M16 6c-3 3-4 17 0 20" />
      </>
    );
  }
  if (type === "year") {
    return (
      <>
        <path d="M8 9h16v17H8V9Z" />
        <path d="M11 6v5M21 6v5M8 14h16" />
      </>
    );
  }
  if (type === "community") {
    return (
      <>
        <circle cx="12" cy="13" r="4" />
        <circle cx="22" cy="15" r="3" />
        <path d="M5 27c1-5 4-8 7-8s6 3 7 8" />
        <path d="M18 27c1-3 3-5 6-5" />
      </>
    );
  }
  return (
    <>
      <path d="M8 11c4-2 8-2 12 1v14c-4-2-8-2-12 0V11Z" />
      <path d="M20 12c2-1 4-1 6 0v14c-2-1-4-1-6 0" />
    </>
  );
}

export function GeneratedBadgeLogo({
  id,
  family = "streak",
  size = 30,
}: {
  id: string;
  family?: "streak" | "devotional";
  size?: number;
}) {
  return (
    <span
      className={`generated-badge-logo generated-badge-logo--${family}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" fill="none">
        <BadgeGlyph id={id} />
      </svg>
    </span>
  );
}

export function GeneratedCategoryMark({
  id,
  active = false,
  size = 30,
}: {
  id: string;
  label?: string;
  active?: boolean;
  size?: number;
}) {
  return (
    <span
      className="generated-category-mark"
      data-active={active ? "true" : "false"}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" fill="none">
        <CategoryGlyph id={id} />
      </svg>
    </span>
  );
}

export function GeneratedMetaIcon({
  type,
  size = 16,
}: {
  type: "sections" | "language" | "year" | "empty" | "book" | "document" | "community";
  size?: number;
}) {
  return (
    <span className="generated-meta-icon" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <MetaGlyph type={type} />
      </svg>
    </span>
  );
}

function CoverPattern({ seed, kind }: { seed: string; kind: ArtKind }) {
  const offset = hashString(seed) % 12;
  return (
    <svg className="generated-cover__pattern" viewBox="0 0 160 220" aria-hidden="true">
      <path d={`M${18 + offset} 20h76c26 0 46 20 46 46v134`} />
      <path d={`M${8 + offset} 184c32-20 70-22 126-8`} />
      <path d={`M${22 + offset} 52h48M${18 + offset} 72h72M${16 + offset} 92h58`} />
      {kind === "document" ? (
        <>
          <path d="M112 32v52h28" />
          <path d="M36 142h88M36 158h74" />
        </>
      ) : (
        <>
          <path d="M80 38v128" />
          <path d="M52 118c18-10 38-10 56 0" />
        </>
      )}
    </svg>
  );
}

function CoverFrame({ children, seed, kind, size }: { children: ReactNode; seed: string; kind: ArtKind; size: CoverSize }) {
  return (
    <div
      className={`generated-cover generated-cover--${kind} generated-cover--${size}`}
      style={coverStyle(seed, kind)}
    >
      <CoverPattern seed={seed} kind={kind} />
      {children}
    </div>
  );
}

export function GeneratedBookCover({
  slug,
  title,
  author,
  year,
  size = "full",
}: {
  slug: string;
  title: string;
  author?: string;
  year?: number | string | null;
  size?: CoverSize;
}) {
  const isSmall = size === "small";
  const displayTitle = compactTitle(title);
  const authorLabel = author ? compactTitle(author) : "TULIP Classics";
  return (
    <CoverFrame seed={slug || displayTitle} kind="book" size={size}>
      <div className="generated-cover__top">
        <span className="generated-cover__series">{isSmall ? initials(authorLabel) : "TULIP Classics"}</span>
        <BookSeal seed={slug || displayTitle} small={isSmall} />
      </div>
      <div className="generated-cover__center">
        {!isSmall && <span className="generated-cover__eyebrow">{year ?? "Classic"}</span>}
        <span className="generated-cover__title">{displayTitle}</span>
      </div>
      <div className="generated-cover__bottom">
        <span>{isSmall ? initials(displayTitle) : authorLabel}</span>
      </div>
    </CoverFrame>
  );
}

export function GeneratedDocumentCover({
  doc,
  size = "full",
}: {
  doc: {
    id: string;
    title: string;
    shortTitle: string;
    year?: number | string;
    origin?: string;
    category?: string;
  };
  size?: CoverSize;
}) {
  const isSmall = size === "small";
  const displayTitle = compactTitle(doc.shortTitle || doc.title, "Historical Document");
  const seed = doc.id || displayTitle;
  return (
    <CoverFrame seed={seed} kind="document" size={size}>
      <div className="generated-cover__top">
        <span className="generated-cover__series">{isSmall ? initials(doc.category || "doc") : compactTitle(doc.category || "Document")}</span>
        <DocumentSeal seed={seed} />
      </div>
      <div className="generated-cover__center">
        <span className="generated-cover__eyebrow">{doc.year ?? "History"}</span>
        <span className="generated-cover__title">{displayTitle}</span>
      </div>
      <div className="generated-cover__bottom">
        <span>{isSmall ? initials(displayTitle) : compactTitle(doc.origin || "Historic Christianity")}</span>
      </div>
    </CoverFrame>
  );
}
