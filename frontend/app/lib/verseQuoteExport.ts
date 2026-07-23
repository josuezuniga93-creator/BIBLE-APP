export interface VerseQuoteOptions {
  verseText: string;
  reference: string;
  logoSrc?: string;
  backgroundSrc?: string | null;
  backgroundColor?: string;
  blurBackground?: boolean; // legacy — maps to bgBlur:60
  // Typography
  fontFamily?: string;
  fontSize?: number;          // canvas px, 0/undefined = auto
  textAlign?: "left" | "center" | "right";
  lineHeightMult?: number;    // default 1.55
  letterSpacingPx?: number;   // default 0
  textColor?: string;         // default "#ffffff"
  textOpacity?: number;       // 0–1, default 1
  // Layout
  aspectRatio?: "1:1" | "3:4"; // default "1:1"
  // Background
  bgBrightness?: number;      // 0–100, default 50
  bgBlur?: number;            // 0–100, default 0
  showQuoteMark?: boolean;
  accentColor?: string;
  dividerColor?: string;
  brandColor?: string;
  brandText?: string;
}

// All available background options (null = default dark)
export const BG_OPTIONS: Array<{ id: string; src: string | null; label: string }> = [
  { id: "dark", src: null,           label: "Dark" },
  { id: "bg1",  src: "/bg/bg1.png",  label: "1"   },
  { id: "bg2",  src: "/bg/bg2.png",  label: "2"   },
  { id: "bg3",  src: "/bg/bg3.png",  label: "3"   },
  { id: "bg4",  src: "/bg/bg4.png",  label: "4"   },
  { id: "bg5",  src: "/bg/bg5.png",  label: "5"   },
];

// ─── Core render function (shared between preview and export) ─────────────────

export async function renderVerseToCanvas(
  canvas: HTMLCanvasElement,
  opts: VerseQuoteOptions,
): Promise<void> {
  const WIDTH  = 1080;
  const HEIGHT = opts.aspectRatio === "3:4" ? 1440 : 1080;
  canvas.width  = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const ACCENT   = opts.accentColor ?? "rgba(201,169,97,1)";
  const BG_DARK  = opts.backgroundColor ?? "#08090f";

  const textColor    = opts.textColor       ?? "#ffffff";
  const textOpacity  = opts.textOpacity     ?? 1;
  const bgBrightness = opts.bgBrightness    ?? 50;
  // bgBlur: legacy blurBackground maps to 60%
  const bgBlurPct    = opts.bgBlur          ?? (opts.blurBackground ? 60 : 0);
  const bgBlurPx     = (bgBlurPct / 100) * 28;
  const align        = opts.textAlign       ?? "center";
  const lhMult       = opts.lineHeightMult  ?? 1.55;
  const lsPx         = opts.letterSpacingPx ?? 0;
  const fontFamily   = opts.fontFamily      ?? "'Georgia', 'Times New Roman', serif";

  // ── 1. Background ────────────────────────────────────────────────────────────
  if (opts.backgroundSrc) {
    try {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = opts.backgroundSrc;
      await new Promise<void>((res) => { bgImg.onload = () => res(); bgImg.onerror = () => res(); });
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        const scale = Math.max(WIDTH / bgImg.naturalWidth, HEIGHT / bgImg.naturalHeight);
        const sw = bgImg.naturalWidth  * scale;
        const sh = bgImg.naturalHeight * scale;
        if (bgBlurPx > 0) ctx.filter = `blur(${bgBlurPx}px)`;
        ctx.drawImage(bgImg, (WIDTH - sw) / 2, (HEIGHT - sh) / 2, sw, sh);
        ctx.filter = "none";
        // Overlay opacity controlled by brightness: 0% = almost black, 100% = very bright
        const overlayAlpha = (1 - bgBrightness / 100) * 0.75;
        ctx.fillStyle = `rgba(6,8,14,${overlayAlpha.toFixed(2)})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      } else {
        ctx.fillStyle = BG_DARK; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }
    } catch {
      ctx.fillStyle = BG_DARK; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  } else {
    ctx.fillStyle = BG_DARK; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // ── 2. Opening quote mark ────────────────────────────────────────────────────
  if (opts.showQuoteMark) {
    ctx.fillStyle  = hexToRgba(ACCENT, 0.24);
    ctx.font       = `bold 120px ${fontFamily}`;
    ctx.textAlign  = "left";
    (ctx as any).letterSpacing = "0px";
    ctx.fillText("“", 72, 220);
  }

  // ── 6. Verse text ─────────────────────────────────────────────────────────────
  const autoSize   = getVerseFont(opts.verseText.length);
  const fontSize   = (opts.fontSize && opts.fontSize > 0) ? opts.fontSize : autoSize;
  const lineHeight = fontSize * lhMult;

  ctx.fillStyle   = textColor;
  ctx.globalAlpha = textOpacity;
  ctx.font        = `italic 500 ${fontSize}px ${fontFamily}`;
  ctx.textAlign   = align;
  (ctx as any).letterSpacing = `${lsPx}px`;

  const textX  = align === "left" ? 108 : align === "right" ? WIDTH - 108 : WIDTH / 2;
  const lines  = wrapText(ctx, opts.verseText, WIDTH - 216);
  const totalH = lines.length * lineHeight;
  let y = Math.max(190, HEIGHT / 2 - totalH / 2);
  for (const line of lines) {
    ctx.fillText(line, textX, y);
    y += lineHeight;
  }

  ctx.globalAlpha = 1;
  (ctx as any).letterSpacing = "0px";

  // ── 7. Reference ────────────────────────────────────────────────────────────
  const refY = Math.max(y + 48, HEIGHT * 0.72);

  // Short divider line
  ctx.strokeStyle = opts.dividerColor ?? `rgba(255,255,255,0.25)`;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 48, refY - 18);
  ctx.lineTo(WIDTH / 2 + 48, refY - 18);
  ctx.stroke();

  // Reference in same color as verse text (white by default)
  ctx.fillStyle   = textColor;
  ctx.globalAlpha = textOpacity;
  ctx.font        = `600 36px ${fontFamily}`;
  ctx.textAlign   = "center";
  (ctx as any).letterSpacing = "2px";
  ctx.fillText(opts.reference, WIDTH / 2, refY + 8);
  ctx.globalAlpha = 1;
  (ctx as any).letterSpacing = "0px";

  // ── 8. Branding ─────────────────────────────────────────────────────────────
  const brandText = opts.brandText ?? "Tulip Bible App";
  const brandColor = opts.brandColor ?? "rgba(255,255,255,0.34)";
  const brandY = HEIGHT - 64;
  const brandFont = "500 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.font = brandFont;
  (ctx as any).letterSpacing = "2.5px";
  const textWidth = ctx.measureText(brandText).width;
  const logoSize = 34;
  const gap = 14;
  const totalWidth = textWidth + (opts.logoSrc ? logoSize + gap : 0);
  let startX = WIDTH / 2 - totalWidth / 2;

  if (opts.logoSrc) {
    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = opts.logoSrc;
      await new Promise<void>((res) => { logo.onload = () => res(); logo.onerror = () => res(); });
      if (logo.complete && logo.naturalWidth > 0) {
        ctx.save();
        roundedRect(ctx, startX, brandY - logoSize + 7, logoSize, logoSize, 7);
        ctx.clip();
        ctx.drawImage(logo, startX, brandY - logoSize + 7, logoSize, logoSize);
        ctx.restore();
        startX += logoSize + gap;
      }
    } catch {}
  }

  ctx.fillStyle  = brandColor;
  ctx.textAlign  = "left";
  ctx.fillText(brandText, startX, brandY);
  (ctx as any).letterSpacing = "0px";
}

// ─── Export wrapper ───────────────────────────────────────────────────────────

export async function exportVerseAsQuoteImage(opts: VerseQuoteOptions): Promise<void> {
  const HEIGHT = opts.aspectRatio === "3:4" ? 1440 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width  = 1080;
  canvas.height = HEIGHT;

  await renderVerseToCanvas(canvas, opts);

  await new Promise<void>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(); return; }
      const safeName = opts.reference.replace(/[^a-zA-Z0-9]/g, "-");
      const file = new File([blob], `${safeName}-tulip.jpg`, { type: "image/jpeg" });
      try {
        if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: opts.reference });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = file.name; a.click();
          URL.revokeObjectURL(url);
        }
      } catch { /* user cancelled share sheet */ }
      resolve();
    }, "image/jpeg", 0.93);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVerseFont(charCount: number): number {
  if (charCount < 80)  return 52;
  if (charCount < 150) return 44;
  if (charCount < 250) return 36;
  return 30;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line + (line ? " " : "") + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hexToRgba(color: string, alpha: number): string {
  if (color.startsWith("rgba") || color.startsWith("rgb")) return color;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return `rgba(201,169,97,${alpha})`;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
