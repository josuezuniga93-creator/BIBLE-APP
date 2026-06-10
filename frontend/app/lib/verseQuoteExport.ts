export interface VerseQuoteOptions {
  verseText: string;
  reference: string;
  logoSrc?: string;
  backgroundSrc?: string | null;
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

  const GOLD     = "rgba(201,169,97,1)";
  const GOLD_DIM = "rgba(201,169,97,0.25)";
  const BG_DARK  = "#08090f";

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

  // ── 2. Corner decorations ────────────────────────────────────────────────────
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(60, 60);                     ctx.lineTo(160, 60);                     ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, 60);                     ctx.lineTo(60, 160);                     ctx.stroke();
  ctx.beginPath(); ctx.moveTo(WIDTH - 60, HEIGHT - 60);    ctx.lineTo(WIDTH - 160, HEIGHT - 60);    ctx.stroke();
  ctx.beginPath(); ctx.moveTo(WIDTH - 60, HEIGHT - 60);    ctx.lineTo(WIDTH - 60, HEIGHT - 160);    ctx.stroke();

  // ── 3. Top gold rule ─────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(201,169,97,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, 140); ctx.lineTo(WIDTH - 80, 140); ctx.stroke();

  // ── 4. App label ─────────────────────────────────────────────────────────────
  ctx.fillStyle  = "rgba(201,169,97,0.6)";
  ctx.font       = "500 22px sans-serif";
  ctx.textAlign  = "center";
  (ctx as any).letterSpacing = "4px";
  ctx.fillText("TULIP BIBLE APP", WIDTH / 2, 115);

  // ── 5. Opening quote mark ─────────────────────────────────────────────────────
  ctx.fillStyle  = GOLD_DIM;
  ctx.font       = `bold 120px ${fontFamily}`;
  ctx.textAlign  = "left";
  (ctx as any).letterSpacing = "0px";
  ctx.fillText("“", 72, 290);

  // ── 6. Verse text ─────────────────────────────────────────────────────────────
  const autoSize   = getVerseFont(opts.verseText.length);
  const fontSize   = (opts.fontSize && opts.fontSize > 0) ? opts.fontSize : autoSize;
  const lineHeight = fontSize * lhMult;

  ctx.fillStyle   = textColor;
  ctx.globalAlpha = textOpacity;
  ctx.font        = `italic 500 ${fontSize}px ${fontFamily}`;
  ctx.textAlign   = align;
  (ctx as any).letterSpacing = `${lsPx}px`;

  const textX  = align === "left" ? 100 : align === "right" ? WIDTH - 100 : WIDTH / 2;
  const lines  = wrapText(ctx, opts.verseText, WIDTH - 200);
  const totalH = lines.length * lineHeight;
  let y = HEIGHT / 2 - totalH / 2 + 20;
  for (const line of lines) {
    ctx.fillText(line, textX, y);
    y += lineHeight;
  }

  ctx.globalAlpha = 1;
  (ctx as any).letterSpacing = "0px";

  // ── 7. Reference gold rule ────────────────────────────────────────────────────
  const refY = Math.max(y + 40, HEIGHT * 0.72);
  ctx.strokeStyle = "rgba(201,169,97,0.5)";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 60, refY - 20);
  ctx.lineTo(WIDTH / 2 + 60, refY - 20);
  ctx.stroke();

  // ── 8. Reference text ────────────────────────────────────────────────────────
  ctx.fillStyle  = GOLD;
  ctx.font       = "bold 38px sans-serif";
  ctx.textAlign  = "center";
  (ctx as any).letterSpacing = "0px";
  ctx.fillText(opts.reference, WIDTH / 2, refY + 10);

  // ── 9. Logo ──────────────────────────────────────────────────────────────────
  if (opts.logoSrc) {
    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = opts.logoSrc;
      await new Promise<void>((res) => { logo.onload = () => res(); logo.onerror = () => res(); });
      if (logo.complete && logo.naturalWidth > 0) {
        const lSize = 64;
        ctx.globalAlpha = 0.6;
        ctx.drawImage(logo, WIDTH - lSize - 40, HEIGHT - lSize - 40, lSize, lSize);
        ctx.globalAlpha = 1;
      }
    } catch { /* logo failed */ }
  }

  // ── 10. Branding ─────────────────────────────────────────────────────────────
  ctx.fillStyle  = "rgba(201,169,97,0.35)";
  ctx.font       = "400 20px sans-serif";
  ctx.textAlign  = "right";
  ctx.fillText("tulipbibleapp.com", WIDTH - 50, HEIGHT - 48);
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
