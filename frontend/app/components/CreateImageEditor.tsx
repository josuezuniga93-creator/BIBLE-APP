"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BG_OPTIONS, renderVerseToCanvas, type VerseQuoteOptions } from "../lib/verseQuoteExport";

// ─── Types & constants ────────────────────────────────────────────────────────

type EditorTab = "font" | "typography" | "aspect" | "color" | "background";

const EDITOR_FONTS = [
  { key: "georgia",     label: "Georgia",     family: "'Georgia', 'Times New Roman', serif" },
  { key: "baskerville", label: "Baskerville", family: "Baskerville, 'Baskerville Old Face', serif" },
  { key: "garamond",    label: "Garamond",    family: "Garamond, 'EB Garamond', Georgia, serif" },
  { key: "charter",     label: "Charter",     family: "Charter, 'Bitstream Charter', Georgia, serif" },
  { key: "palatino",    label: "Palatino",    family: "'Palatino Linotype', Palatino, serif" },
  { key: "modern",      label: "Modern",      family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { key: "typewriter",  label: "Typewriter",  family: "'Courier New', Courier, monospace" },
];

const TEXT_COLORS = [
  "#ffffff", "#000000", "#d4b483", "#f0ede6",
  "#aaaaaa", "#555555", "#87ceeb", "#b8f0b8",
];

function autoFontSize(verseLen: number): number {
  if (verseLen < 80)  return 52;
  if (verseLen < 150) return 44;
  if (verseLen < 250) return 36;
  return 30;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CreateImageEditorProps {
  verseText: string;
  reference: string;
  lang: string;
  onClose: () => void;
}

export default function CreateImageEditor({ verseText, reference, lang, onClose }: CreateImageEditorProps) {
  const previewRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tab,          setTab]          = useState<EditorTab>("font");
  const [fontKey,      setFontKey]      = useState("georgia");
  const [textAlign,    setTextAlign]    = useState<"left" | "center" | "right">("center");
  const [lineHeight,   setLineHeight]   = useState(1.55);
  const [letterSpacing,setLetterSpacing]= useState(0);
  const [fontSize,     setFontSize]     = useState(() => autoFontSize(verseText.length));
  const [aspectRatio,  setAspectRatio]  = useState<"1:1" | "3:4">("1:1");
  const [textColor,    setTextColor]    = useState("#ffffff");
  const [textOpacity,  setTextOpacity]  = useState(1);
  const [bgSrc,        setBgSrc]        = useState<string | null>(null);
  const [bgBrightness, setBgBrightness] = useState(50);
  const [bgBlur,       setBgBlur]       = useState(0);
  const [isExporting,  setIsExporting]  = useState(false);

  const fontFamily = EDITOR_FONTS.find(f => f.key === fontKey)?.family ?? EDITOR_FONTS[0].family;

  const buildOpts = useCallback((): VerseQuoteOptions => ({
    verseText, reference,
    logoSrc: "/tulip-logo.png",
    backgroundSrc: bgSrc,
    fontFamily,
    fontSize,
    textAlign,
    lineHeightMult: lineHeight,
    letterSpacingPx: letterSpacing,
    textColor,
    textOpacity,
    aspectRatio,
    bgBrightness,
    bgBlur,
  }), [verseText, reference, bgSrc, fontFamily, fontSize, textAlign, lineHeight, letterSpacing, textColor, textOpacity, aspectRatio, bgBrightness, bgBlur]);

  // ── Live preview ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas    = previewRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W  = 1080;
    const H  = aspectRatio === "3:4" ? 1440 : 1080;
    const cW = Math.max(container.clientWidth,  100);
    const cH = Math.max(container.clientHeight, 100);
    const scale = Math.min(cW / W, cH / H) * 0.92;

    canvas.style.width  = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;

    renderVerseToCanvas(canvas, buildOpts()).catch(() => {});
  }, [buildOpts, aspectRatio]);

  // ── Export ────────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const H = aspectRatio === "3:4" ? 1440 : 1080;
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1080; exportCanvas.height = H;
      await renderVerseToCanvas(exportCanvas, buildOpts());

      await new Promise<void>((resolve) => {
        exportCanvas.toBlob(async (blob) => {
          if (!blob) { resolve(); return; }
          const safeName = reference.replace(/[^a-zA-Z0-9]/g, "-");
          const file = new File([blob], `${safeName}-tulip.jpg`, { type: "image/jpeg" });
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: reference });
            } else {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
              URL.revokeObjectURL(url);
            }
          } catch { /* cancelled */ }
          resolve();
        }, "image/jpeg", 0.93);
      });
      onClose();
    } finally { setIsExporting(false); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 200, background: "#0a0a0a", paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <p className="text-sm font-black" style={{ color: "rgba(255,255,255,0.8)" }}>
          {lang === "es" ? "Crear Imagen" : "Create Image"}
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl text-sm font-black transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "#c9a961", color: "#08090f" }}
        >
          {isExporting ? "…" : (lang === "es" ? "Exportar" : "Export")}
        </button>
      </div>

      {/* ── Preview ── */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden min-h-0"
        style={{ padding: 12, background: "#0d0d0d" }}
      >
        <canvas
          ref={previewRef}
          className="rounded-2xl shadow-2xl"
          style={{ display: "block", objectFit: "contain" }}
        />
      </div>

      {/* ── Tab panels ── */}
      <div
        className="flex-shrink-0"
        style={{ background: "#111113", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* FONT */}
        {tab === "font" && (
          <div style={{ maxHeight: 248, overflowY: "auto" }}>
            {EDITOR_FONTS.map((f, i) => (
              <button
                key={f.key}
                onClick={() => setFontKey(f.key)}
                className="w-full flex items-center justify-between px-5 transition-colors"
                style={{
                  height: 52,
                  background: fontKey === f.key ? "rgba(201,169,97,0.08)" : "transparent",
                  borderBottom: i < EDITOR_FONTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <span style={{ fontFamily: f.family, fontSize: 16, color: fontKey === f.key ? "#c9a961" : "rgba(255,255,255,0.72)" }}>
                  {f.label}
                </span>
                {fontKey === f.key && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {/* TYPOGRAPHY */}
        {tab === "typography" && (
          <div className="px-5 py-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Alignment */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                {lang === "es" ? "Alineación" : "Alignment"}
              </span>
              <div className="flex gap-1.5">
                {(["left", "center", "right"] as const).map((a) => (
                  <button key={a} onClick={() => setTextAlign(a)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                    style={{ background: textAlign === a ? "rgba(201,169,97,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${textAlign === a ? "rgba(201,169,97,0.4)" : "rgba(255,255,255,0.08)"}` }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={textAlign === a ? "#c9a961" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round">
                      {a === "left"   && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></>}
                      {a === "center" && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>}
                      {a === "right"  && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></>}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            {/* Line height */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                {lang === "es" ? "Interlineado" : "Line Height"}
              </span>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setLineHeight(h => Math.max(1.0, parseFloat((h - 0.1).toFixed(1))))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>−</button>
                <span style={{ width: 32, textAlign: "center", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{lineHeight.toFixed(1)}</span>
                <button onClick={() => setLineHeight(h => Math.min(2.5, parseFloat((h + 0.1).toFixed(1))))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>+</button>
              </div>
            </div>
            {/* Letter spacing */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                {lang === "es" ? "Espaciado" : "Letter Spacing"}
              </span>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setLetterSpacing(s => Math.max(-5, s - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>−</button>
                <span style={{ width: 32, textAlign: "center", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{letterSpacing}</span>
                <button onClick={() => setLetterSpacing(s => Math.min(20, s + 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>+</button>
              </div>
            </div>
            {/* Font size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                  {lang === "es" ? "Tamaño" : "Font Size"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{fontSize}px</span>
              </div>
              <input type="range" min="24" max="80" value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full" style={{ accentColor: "#c9a961" }} />
            </div>
          </div>
        )}

        {/* ASPECT RATIO */}
        {tab === "aspect" && (
          <div className="flex items-center justify-center gap-10" style={{ padding: "20px 20px 28px" }}>
            {(["1:1", "3:4"] as const).map((ratio) => {
              const active = aspectRatio === ratio;
              const w = ratio === "1:1" ? 72 : 54;
              const h = ratio === "1:1" ? 72 : 96;
              return (
                <button key={ratio} onClick={() => setAspectRatio(ratio)}
                  className="flex flex-col items-center gap-2.5 transition-all active:scale-95">
                  <div className="rounded-xl flex items-center justify-center" style={{
                    width: w, height: h,
                    background: active ? "rgba(201,169,97,0.12)" : "rgba(255,255,255,0.06)",
                    border: `2px solid ${active ? "#c9a961" : "rgba(255,255,255,0.12)"}`,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: active ? "#c9a961" : "rgba(255,255,255,0.4)" }}>{ratio}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#c9a961" : "rgba(255,255,255,0.4)" }}>
                    {ratio === "1:1" ? (lang === "es" ? "Cuadrado" : "Square") : (lang === "es" ? "Retrato" : "Portrait")}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* COLOR */}
        {tab === "color" && (
          <div className="px-5 py-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="flex gap-3 flex-wrap">
              {TEXT_COLORS.map((hex) => (
                <button key={hex} onClick={() => setTextColor(hex)}
                  className="w-10 h-10 rounded-full transition-all active:scale-90"
                  style={{
                    background: hex,
                    border: textColor === hex ? "2.5px solid #c9a961" : "2px solid rgba(255,255,255,0.2)",
                    outline: textColor === hex ? "2px solid rgba(201,169,97,0.4)" : "none",
                    outlineOffset: 2,
                  }} />
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                  {lang === "es" ? "Opacidad" : "Opacity"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{Math.round(textOpacity * 100)}%</span>
              </div>
              <input type="range" min="0" max="100" value={Math.round(textOpacity * 100)}
                onChange={(e) => setTextOpacity(Number(e.target.value) / 100)}
                className="w-full" style={{ accentColor: "#c9a961" }} />
            </div>
          </div>
        )}

        {/* BACKGROUND */}
        {tab === "background" && (
          <div className="px-5 py-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Image row */}
            <div className="flex gap-2.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {BG_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => setBgSrc(opt.src)}
                  className="flex-shrink-0 rounded-xl overflow-hidden transition-all active:scale-95 relative"
                  style={{
                    width: 52, height: 52,
                    border: bgSrc === opt.src ? "2.5px solid #c9a961" : "2px solid rgba(255,255,255,0.12)",
                  }}>
                  {opt.src ? (
                    <img src={opt.src} alt={opt.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#08090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{opt.label}</span>
                    </div>
                  )}
                  {bgSrc === opt.src && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                  {lang === "es" ? "Brillo" : "Brightness"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{bgBrightness}%</span>
              </div>
              <input type="range" min="0" max="100" value={bgBrightness}
                onChange={(e) => setBgBrightness(Number(e.target.value))}
                className="w-full" style={{ accentColor: "#c9a961" }} />
            </div>
            {/* Blur */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                  {lang === "es" ? "Difuminado" : "Blur"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{bgBlur}%</span>
              </div>
              <input type="range" min="0" max="100" value={bgBlur}
                onChange={(e) => setBgBlur(Number(e.target.value))}
                className="w-full" style={{ accentColor: "#c9a961" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div
        className="flex-shrink-0 flex"
        style={{
          background: "#0e0e0e",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {(["font", "typography", "aspect", "color", "background"] as EditorTab[]).map((t) => {
          const ICONS: Record<EditorTab, string> = { font: "Tt", typography: "AA", aspect: "⊞", color: "◑", background: "≡" };
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 flex flex-col items-center justify-center transition-colors"
              style={{ height: 60 }}
            >
              <span style={{
                fontSize: t === "aspect" ? 20 : t === "background" ? 22 : 18,
                fontWeight: 900,
                color: active ? "#c9a961" : "rgba(255,255,255,0.28)",
                lineHeight: 1,
                letterSpacing: t === "typography" ? "-0.02em" : "normal",
              }}>
                {ICONS[t]}
              </span>
              {active && (
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c9a961", marginTop: 5 }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
