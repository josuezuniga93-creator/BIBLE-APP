"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UiIcon, type UiIconName } from "./UiIcon";
import { BG_OPTIONS, renderVerseToCanvas, type VerseQuoteOptions } from "../lib/verseQuoteExport";
import { isLightTheme, useTheme } from "../lib/useTheme";

type EditorTab = "presets" | "font" | "layout" | "color" | "background";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=EB+Garamond:ital@0;1&family=Lora:ital@0;1&family=Cinzel:wght@400;700&family=Montserrat:ital,wght@0,400;1,400;0,700&family=Nunito:ital,wght@0,1;0,700&family=Libre+Baskerville:ital@0;1&display=swap";

const EDITOR_FONTS = [
  { key: "georgia", label: "Georgia", family: "Georgia, 'Times New Roman', serif", tag: "Classic" },
  { key: "playfair", label: "Playfair", family: "'Playfair Display', Georgia, serif", tag: "Elegant" },
  { key: "cormorant", label: "Cormorant", family: "'Cormorant Garamond', Georgia, serif", tag: "Graceful" },
  { key: "ebgaramond", label: "EB Garamond", family: "'EB Garamond', Georgia, serif", tag: "Literary" },
  { key: "baskerville", label: "Baskerville", family: "'Libre Baskerville', Baskerville, serif", tag: "Premium" },
  { key: "lora", label: "Lora", family: "'Lora', Georgia, serif", tag: "Warm" },
  { key: "cinzel", label: "Cinzel", family: "'Cinzel', Georgia, serif", tag: "Inscribed" },
  { key: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", tag: "Modern" },
  { key: "nunito", label: "Nunito", family: "'Nunito', sans-serif", tag: "Soft" },
  { key: "system", label: "System", family: "-apple-system, BlinkMacSystemFont, sans-serif", tag: "Clean" },
];

const TEXT_COLORS = ["#111111", "#ffffff", "#4b5563", "#f5f5f5", "#0f172a", "#e8dfc7"];

type Preset = {
  id: string;
  label: string;
  desc: string;
  mode: "light" | "dark" | "photo";
  fontKey: string;
  textAlign: "left" | "center" | "right";
  aspectRatio: "1:1" | "3:4";
  textColor: string;
  textOpacity: number;
  bgSrc: string | null;
  backgroundColor: string;
  bgBrightness: number;
  bgBlur: number;
  showQuoteMark: boolean;
  accentColor: string;
};

const PRESETS: Preset[] = [
  {
    id: "clean-light",
    label: "Clean Light",
    desc: "White card, black type",
    mode: "light",
    fontKey: "georgia",
    textAlign: "left",
    aspectRatio: "1:1",
    textColor: "#111111",
    textOpacity: 1,
    bgSrc: null,
    backgroundColor: "#f7f7f7",
    bgBrightness: 100,
    bgBlur: 0,
    showQuoteMark: false,
    accentColor: "#111111",
  },
  {
    id: "classic-dark",
    label: "Classic Dark",
    desc: "Deep navy, warm accent",
    mode: "dark",
    fontKey: "baskerville",
    textAlign: "center",
    aspectRatio: "1:1",
    textColor: "#ffffff",
    textOpacity: 1,
    bgSrc: null,
    backgroundColor: "#08090f",
    bgBrightness: 48,
    bgBlur: 0,
    showQuoteMark: false,
    accentColor: "#c9a961",
  },
  {
    id: "portrait",
    label: "Portrait",
    desc: "Tall social image",
    mode: "photo",
    fontKey: "playfair",
    textAlign: "center",
    aspectRatio: "3:4",
    textColor: "#ffffff",
    textOpacity: 1,
    bgSrc: "/bg/bg1.png",
    backgroundColor: "#08090f",
    bgBrightness: 42,
    bgBlur: 0,
    showQuoteMark: false,
    accentColor: "#c9a961",
  },
  {
    id: "minimal",
    label: "Minimal",
    desc: "Quiet gray, centered",
    mode: "light",
    fontKey: "system",
    textAlign: "center",
    aspectRatio: "1:1",
    textColor: "#0f172a",
    textOpacity: 1,
    bgSrc: null,
    backgroundColor: "#eef0f3",
    bgBrightness: 100,
    bgBlur: 0,
    showQuoteMark: false,
    accentColor: "#111111",
  },
  {
    id: "photo-quote",
    label: "Photo Quote",
    desc: "Image background, readable",
    mode: "photo",
    fontKey: "lora",
    textAlign: "left",
    aspectRatio: "1:1",
    textColor: "#ffffff",
    textOpacity: 1,
    bgSrc: "/bg/bg2.png",
    backgroundColor: "#08090f",
    bgBrightness: 36,
    bgBlur: 12,
    showQuoteMark: false,
    accentColor: "#c9a961",
  },
];

function autoFontSize(verseLen: number): number {
  if (verseLen < 80) return 52;
  if (verseLen < 150) return 44;
  if (verseLen < 250) return 36;
  return 30;
}

interface CreateImageEditorProps {
  verseText: string;
  reference: string;
  lang: string;
  onClose: () => void;
}

export default function CreateImageEditor({ verseText, reference, lang, onClose }: CreateImageEditorProps) {
  const { theme } = useTheme();
  const isLight = isLightTheme(theme);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultPreset = isLight ? PRESETS[0] : PRESETS[1];
  const [tab, setTab] = useState<EditorTab>("presets");
  const [fontKey, setFontKey] = useState(defaultPreset.fontKey);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(defaultPreset.textAlign);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontSize, setFontSize] = useState(() => autoFontSize(verseText.length));
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4">(defaultPreset.aspectRatio);
  const [textColor, setTextColor] = useState(defaultPreset.textColor);
  const [textOpacity, setTextOpacity] = useState(defaultPreset.textOpacity);
  const [bgSrc, setBgSrc] = useState<string | null>(defaultPreset.bgSrc);
  const [backgroundColor, setBackgroundColor] = useState(defaultPreset.backgroundColor);
  const [bgBrightness, setBgBrightness] = useState(defaultPreset.bgBrightness);
  const [bgBlur, setBgBlur] = useState(defaultPreset.bgBlur);
  const [showQuoteMark, setShowQuoteMark] = useState(defaultPreset.showQuoteMark);
  const [accentColor, setAccentColor] = useState(defaultPreset.accentColor);
  const [activePreset, setActivePreset] = useState(defaultPreset.id);
  const [isExporting, setIsExporting] = useState(false);

  const palette = useMemo(() => {
    if (isLight) {
      return {
        root: "#f5f6f8",
        header: "rgba(255,255,255,0.94)",
        stage: "#eceff3",
        panel: "#ffffff",
        panelAlt: "#f1f2f4",
        text: "#090909",
        muted: "#6b7280",
        faint: "#9ca3af",
        border: "#dedfe3",
        active: "#111111",
        activeText: "#ffffff",
        shadow: "0 18px 42px rgba(15,23,42,0.14)",
      };
    }
    return {
      root: "#070910",
      header: "rgba(10,12,18,0.94)",
      stage: "#0d1018",
      panel: "#12151d",
      panelAlt: "#1b1f29",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.64)",
      faint: "rgba(255,255,255,0.36)",
      border: "rgba(255,255,255,0.1)",
      active: "#c9a961",
      activeText: "#08090f",
      shadow: "0 18px 42px rgba(0,0,0,0.38)",
    };
  }, [isLight]);

  const fontFamily = EDITOR_FONTS.find((f) => f.key === fontKey)?.family ?? EDITOR_FONTS[0].family;

  useEffect(() => {
    const id = "tulip-editor-gfonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const preset = isLight ? PRESETS[0] : PRESETS[1];
    setFontKey(preset.fontKey);
    setTextAlign(preset.textAlign);
    setAspectRatio(preset.aspectRatio);
    setTextColor(preset.textColor);
    setTextOpacity(preset.textOpacity);
    setBgSrc(preset.bgSrc);
    setBackgroundColor(preset.backgroundColor);
    setBgBrightness(preset.bgBrightness);
    setBgBlur(preset.bgBlur);
    setShowQuoteMark(preset.showQuoteMark);
    setAccentColor(preset.accentColor);
    setActivePreset(preset.id);
  }, [isLight]);

  const buildOpts = useCallback((): VerseQuoteOptions => ({
    verseText,
    reference,
    logoSrc: "/tulip-logo.png",
    backgroundSrc: bgSrc,
    backgroundColor,
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
    showQuoteMark,
    accentColor,
    dividerColor: isLight ? "rgba(17,17,17,0.18)" : "rgba(255,255,255,0.22)",
    brandColor: isLight ? "rgba(17,17,17,0.55)" : "rgba(255,255,255,0.42)",
  }), [
    verseText, reference, bgSrc, backgroundColor, fontFamily, fontSize, textAlign,
    lineHeight, letterSpacing, textColor, textOpacity, aspectRatio, bgBrightness,
    bgBlur, showQuoteMark, accentColor, isLight,
  ]);

  useEffect(() => {
    const canvas = previewRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W = 1080;
    const H = aspectRatio === "3:4" ? 1440 : 1080;
    const cW = Math.max(container.clientWidth, 100);
    const cH = Math.max(container.clientHeight, 100);
    const scale = Math.min(cW / W, cH / H) * 0.94;

    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;

    document.fonts.ready.then(() => {
      renderVerseToCanvas(canvas, buildOpts()).catch(() => {});
    });
  }, [buildOpts, aspectRatio]);

  const applyPreset = (preset: Preset) => {
    setFontKey(preset.fontKey);
    setTextAlign(preset.textAlign);
    setAspectRatio(preset.aspectRatio);
    setTextColor(preset.textColor);
    setTextOpacity(preset.textOpacity);
    setBgSrc(preset.bgSrc);
    setBackgroundColor(preset.backgroundColor);
    setBgBrightness(preset.bgBrightness);
    setBgBlur(preset.bgBlur);
    setShowQuoteMark(preset.showQuoteMark);
    setAccentColor(preset.accentColor);
    setActivePreset(preset.id);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const H = aspectRatio === "3:4" ? 1440 : 1080;
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1080;
      exportCanvas.height = H;
      await renderVerseToCanvas(exportCanvas, buildOpts());

      await new Promise<void>((resolve) => {
        exportCanvas.toBlob(async (blob) => {
          if (!blob) {
            resolve();
            return;
          }
          const safeName = reference.replace(/[^a-zA-Z0-9]/g, "-");
          const file = new File([blob], `${safeName}-bible.jpg`, { type: "image/jpeg" });
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: reference });
            } else {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = file.name;
              a.click();
              URL.revokeObjectURL(url);
            }
          } catch {}
          resolve();
        }, "image/jpeg", 0.94);
      });
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  const backgroundChoices = [
    { id: "solid-light", label: lang === "es" ? "Claro" : "Light", src: null, color: "#f7f7f7" },
    { id: "solid-gray", label: lang === "es" ? "Gris" : "Gray", src: null, color: "#eef0f3" },
    { id: "solid-dark", label: lang === "es" ? "Oscuro" : "Dark", src: null, color: "#08090f" },
    ...BG_OPTIONS.filter((opt) => opt.src !== null).map((opt) => ({ id: opt.id, label: opt.label, src: opt.src, color: null })),
  ];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 240, background: palette.root, paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ height: 58, background: palette.header, borderBottom: `1px solid ${palette.border}`, backdropFilter: "blur(16px)" }}
      >
        <button
          onClick={onClose}
          aria-label={lang === "es" ? "Cerrar editor" : "Close editor"}
          className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all active:scale-95"
          style={{ color: palette.text, background: palette.panelAlt, border: `1px solid ${palette.border}` }}
        >
          <UiIcon name="close" size={19} />
        </button>

        <div className="min-w-0 text-center px-3">
          <p style={{ color: palette.faint, fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {lang === "es" ? "Crear imagen" : "Create Image"}
          </p>
          <p className="truncate" style={{ color: palette.text, fontSize: 14, fontWeight: 900 }}>
            {reference}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95 disabled:opacity-45"
          style={{ background: palette.active, color: palette.activeText, boxShadow: isLight ? "none" : "0 10px 24px rgba(201,169,97,0.16)" }}
        >
          {isExporting ? "..." : lang === "es" ? "Exportar" : "Export"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden min-h-0"
        style={{ padding: "14px 14px 10px", background: palette.stage }}
      >
        <canvas
          ref={previewRef}
          className="rounded-[28px]"
          style={{ display: "block", objectFit: "contain", boxShadow: palette.shadow }}
        />
      </div>

      <div
        className="flex-shrink-0 rounded-t-[30px] overflow-hidden"
        style={{ background: palette.panel, borderTop: `1px solid ${palette.border}`, boxShadow: "0 -16px 44px rgba(0,0,0,0.12)" }}
      >
        <div className="flex gap-2 px-4 pt-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["presets", "font", "layout", "color", "background"] as EditorTab[]).map((item) => {
            const active = tab === item;
            const icon: Record<EditorTab, UiIconName> = {
              presets: "sparkle",
              font: "edit",
              layout: "file",
              color: "target",
              background: "archive",
            };
            const label: Record<EditorTab, string> = {
              presets: lang === "es" ? "Estilos" : "Styles",
              font: lang === "es" ? "Fuente" : "Font",
              layout: lang === "es" ? "Diseño" : "Layout",
              color: lang === "es" ? "Color" : "Color",
              background: lang === "es" ? "Fondo" : "Background",
            };
            return (
              <button
                key={item}
                onClick={() => setTab(item)}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all active:scale-95"
                style={{
                  background: active ? palette.active : palette.panelAlt,
                  color: active ? palette.activeText : palette.muted,
                  border: `1px solid ${active ? palette.active : palette.border}`,
                }}
              >
                <UiIcon name={icon[item]} size={16} />
                <span>{label[item]}</span>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4" style={{ maxHeight: "min(320px, 38vh)", overflowY: "auto" }}>
          {tab === "presets" && (
            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((preset) => {
                const active = activePreset === preset.id;
                const swatch = preset.bgSrc ? undefined : preset.backgroundColor;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="text-left rounded-3xl p-4 transition-all active:scale-[0.98]"
                    style={{
                      background: active ? (isLight ? "#111111" : "rgba(201,169,97,0.16)") : palette.panelAlt,
                      color: active ? (isLight ? "#ffffff" : "#f4dfac") : palette.text,
                      border: `1px solid ${active ? palette.active : palette.border}`,
                    }}
                  >
                    <div className="mb-3 rounded-2xl overflow-hidden" style={{ height: 56, background: swatch ?? "#12151d", border: `1px solid ${palette.border}` }}>
                      {preset.bgSrc && <img src={preset.bgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 950, lineHeight: 1.1 }}>{preset.label}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.62, marginTop: 4 }}>{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "font" && (
            <div className="space-y-2">
              {EDITOR_FONTS.map((font) => {
                const active = fontKey === font.key;
                return (
                  <button
                    key={font.key}
                    onClick={() => setFontKey(font.key)}
                    className="w-full flex items-center justify-between rounded-2xl px-4 py-3 transition-all active:scale-[0.99]"
                    style={{ background: active ? palette.active : palette.panelAlt, color: active ? palette.activeText : palette.text, border: `1px solid ${active ? palette.active : palette.border}` }}
                  >
                    <span style={{ fontFamily: font.family, fontSize: 18, fontWeight: 700 }}>{font.label}</span>
                    <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 900, opacity: 0.55 }}>{font.tag}</span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "layout" && (
            <div className="space-y-4">
              <SegmentLabel label={lang === "es" ? "Alineación" : "Alignment"} color={palette.faint} />
              <div className="grid grid-cols-3 gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setTextAlign(align)}
                    className="rounded-2xl py-3 text-sm font-black capitalize transition-all active:scale-95"
                    style={{ background: textAlign === align ? palette.active : palette.panelAlt, color: textAlign === align ? palette.activeText : palette.muted, border: `1px solid ${textAlign === align ? palette.active : palette.border}` }}
                  >
                    {lang === "es" ? (align === "left" ? "Izq." : align === "center" ? "Centro" : "Der.") : align}
                  </button>
                ))}
              </div>

              <SegmentLabel label={lang === "es" ? "Formato" : "Format"} color={palette.faint} />
              <div className="grid grid-cols-2 gap-2">
                {(["1:1", "3:4"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className="rounded-2xl py-3 text-sm font-black transition-all active:scale-95"
                    style={{ background: aspectRatio === ratio ? palette.active : palette.panelAlt, color: aspectRatio === ratio ? palette.activeText : palette.muted, border: `1px solid ${aspectRatio === ratio ? palette.active : palette.border}` }}
                  >
                    {ratio === "1:1" ? (lang === "es" ? "Cuadrado" : "Square") : (lang === "es" ? "Retrato" : "Portrait")}
                  </button>
                ))}
              </div>

              <RangeControl label={lang === "es" ? "Tamaño" : "Size"} value={fontSize} min={24} max={80} suffix="px" onChange={setFontSize} accent={palette.active} text={palette.text} muted={palette.faint} />
              <RangeControl label={lang === "es" ? "Interlineado" : "Line height"} value={Math.round(lineHeight * 10)} min={10} max={24} display={(lineHeight).toFixed(1)} onChange={(v) => setLineHeight(v / 10)} accent={palette.active} text={palette.text} muted={palette.faint} />
              <RangeControl label={lang === "es" ? "Espaciado" : "Letter spacing"} value={letterSpacing} min={-4} max={16} onChange={setLetterSpacing} accent={palette.active} text={palette.text} muted={palette.faint} />
            </div>
          )}

          {tab === "color" && (
            <div className="space-y-4">
              <SegmentLabel label={lang === "es" ? "Color de texto" : "Text color"} color={palette.faint} />
              <div className="flex flex-wrap gap-3">
                {TEXT_COLORS.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setTextColor(hex)}
                    aria-label={hex}
                    className="h-11 w-11 rounded-full transition-all active:scale-90"
                    style={{ background: hex, border: `2px solid ${textColor === hex ? palette.active : palette.border}`, boxShadow: textColor === hex ? `0 0 0 4px ${isLight ? "rgba(0,0,0,0.08)" : "rgba(201,169,97,0.16)"}` : "none" }}
                  />
                ))}
              </div>
              <RangeControl label={lang === "es" ? "Opacidad" : "Opacity"} value={Math.round(textOpacity * 100)} min={40} max={100} suffix="%" onChange={(v) => setTextOpacity(v / 100)} accent={palette.active} text={palette.text} muted={palette.faint} />
              <button
                onClick={() => setShowQuoteMark((value) => !value)}
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-black"
                style={{ background: showQuoteMark ? palette.active : palette.panelAlt, color: showQuoteMark ? palette.activeText : palette.text, border: `1px solid ${showQuoteMark ? palette.active : palette.border}` }}
              >
                {lang === "es" ? "Marca de cita decorativa" : "Decorative quote mark"}
              </button>
            </div>
          )}

          {tab === "background" && (
            <div className="space-y-4">
              <SegmentLabel label={lang === "es" ? "Fondos" : "Backgrounds"} color={palette.faint} />
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {backgroundChoices.map((option) => {
                  const active = option.src ? bgSrc === option.src : bgSrc === null && backgroundColor === option.color;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setBgSrc(option.src);
                        if (option.color) setBackgroundColor(option.color);
                        if (option.color === "#08090f") setTextColor("#ffffff");
                        if (option.color && option.color !== "#08090f") setTextColor("#111111");
                      }}
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl transition-all active:scale-95"
                      style={{ background: option.color ?? "#111827", border: `2px solid ${active ? palette.active : palette.border}` }}
                    >
                      {option.src && <img src={option.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center" style={{ color: option.color === "#f7f7f7" || option.color === "#eef0f3" ? "#111111" : "#ffffff", background: "rgba(0,0,0,0.06)" }}>
                          <UiIcon name="check" size={18} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <RangeControl label={lang === "es" ? "Brillo" : "Brightness"} value={bgBrightness} min={0} max={100} suffix="%" onChange={setBgBrightness} accent={palette.active} text={palette.text} muted={palette.faint} />
              <RangeControl label={lang === "es" ? "Difuminado" : "Blur"} value={bgBlur} min={0} max={100} suffix="%" onChange={setBgBlur} accent={palette.active} text={palette.text} muted={palette.faint} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SegmentLabel({ label, color }: { label: string; color: string }) {
  return (
    <p style={{ color, fontSize: 10, fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>
      {label}
    </p>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  suffix = "",
  display,
  onChange,
  accent,
  text,
  muted,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  display?: string;
  onChange: (value: number) => void;
  accent: string;
  text: string;
  muted: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SegmentLabel label={label} color={muted} />
        <span style={{ color: text, fontSize: 13, fontWeight: 850 }}>{display ?? value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
        style={{ accentColor: accent }}
      />
    </div>
  );
}
