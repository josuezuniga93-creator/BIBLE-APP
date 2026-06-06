export interface VerseQuoteOptions {
  verseText: string;
  reference: string; // e.g. "John 3:16"
  logoSrc?: string;  // path to logo, e.g. "/tulip-logo.png"
}

export async function exportVerseAsQuoteImage(opts: VerseQuoteOptions): Promise<void> {
  const SIZE = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const GOLD     = "rgba(201,169,97,1)";
  const GOLD_DIM = "rgba(201,169,97,0.25)";
  const BG       = "#08090f";

  // 1. Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 2. Subtle corner decorations (gold lines)
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 2;
  // top-left
  ctx.beginPath(); ctx.moveTo(60, 60);          ctx.lineTo(160, 60);          ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, 60);          ctx.lineTo(60, 160);          ctx.stroke();
  // bottom-right
  ctx.beginPath(); ctx.moveTo(SIZE - 60, SIZE - 60); ctx.lineTo(SIZE - 160, SIZE - 60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SIZE - 60, SIZE - 60); ctx.lineTo(SIZE - 60, SIZE - 160); ctx.stroke();

  // 3. Thin gold horizontal rule near top
  ctx.strokeStyle = "rgba(201,169,97,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, 140); ctx.lineTo(SIZE - 80, 140); ctx.stroke();

  // 4. Small "TULIP BIBLE APP" label top center
  ctx.fillStyle = "rgba(201,169,97,0.6)";
  ctx.font = "500 22px sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("TULIP BIBLE APP", SIZE / 2, 115);

  // 5. Opening quote mark
  ctx.fillStyle = GOLD_DIM;
  ctx.font = "bold 120px serif";
  ctx.textAlign = "left";
  ctx.fillText("“", 72, 290);

  // 6. Verse text — word wrap, centered
  ctx.fillStyle = "#ffffff";
  const fontSize = getVerseFont(opts.verseText.length);
  ctx.font = `italic 500 ${fontSize}px Georgia, serif`;
  ctx.textAlign = "center";
  const lines = wrapText(ctx, opts.verseText, SIZE - 200);
  const lineHeight = fontSize * 1.55;
  const totalH = lines.length * lineHeight;
  let y = SIZE / 2 - totalH / 2 + 20;
  for (const line of lines) {
    ctx.fillText(line, SIZE / 2, y);
    y += lineHeight;
  }

  // 7. Gold rule before reference
  const refY = Math.max(y + 40, SIZE * 0.72);
  ctx.strokeStyle = "rgba(201,169,97,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SIZE / 2 - 60, refY - 20);
  ctx.lineTo(SIZE / 2 + 60, refY - 20);
  ctx.stroke();

  // 8. Reference
  ctx.fillStyle = GOLD;
  ctx.font = "bold 38px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.reference, SIZE / 2, refY + 10);

  // 9. Logo watermark (bottom-right)
  if (opts.logoSrc) {
    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = opts.logoSrc;
      await new Promise<void>((res) => {
        logo.onload = () => res();
        logo.onerror = () => res();
      });
      if (logo.complete && logo.naturalWidth > 0) {
        const lSize = 64;
        ctx.globalAlpha = 0.6;
        ctx.drawImage(logo, SIZE - lSize - 40, SIZE - lSize - 40, lSize, lSize);
        ctx.globalAlpha = 1;
      }
    } catch {
      // logo load failed — fallback text below covers it
    }
  }

  // 10. Bottom branding text
  ctx.fillStyle = "rgba(201,169,97,0.35)";
  ctx.font = "400 20px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("tulipbibleapp.com", SIZE - 50, SIZE - 48);

  // 11. Export — share sheet on mobile, download on desktop
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const safeName = opts.reference.replace(/[^a-zA-Z0-9]/g, "-");
    const file = new File([blob], `${safeName}-tulip.jpg`, { type: "image/jpeg" });
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({ files: [file], title: opts.reference });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, "image/jpeg", 0.93);
}

function getVerseFont(charCount: number): number {
  if (charCount < 80)  return 52;
  if (charCount < 150) return 44;
  if (charCount < 250) return 36;
  return 30;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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
