"use client";
import { QUOTES, type Quote } from "../data/quotes";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "../lib/supabase/client";

function wrapTextCanvas(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

async function generateQuoteImage(quote: Quote, lang: string): Promise<Blob | null> {
  const SIZE = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = quote.image;
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });
  ctx.drawImage(img, 0, 0, SIZE, SIZE);

  const grad = ctx.createLinearGradient(SIZE * 0.34, 0, SIZE, 0);
  grad.addColorStop(0, "rgba(13,15,23,0)");
  grad.addColorStop(0.24, "rgba(13,15,23,0.12)");
  grad.addColorStop(0.43, "rgba(13,15,23,0.72)");
  grad.addColorStop(0.68, "rgba(13,15,23,0.96)");
  grad.addColorStop(1, "rgba(13,15,23,1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const textX = SIZE * 0.52;
  const textMaxW = SIZE * 0.43;
  const quoteText = lang === "es" ? quote.textEs : quote.text;
  const displayText = `"${quoteText}"`;

  let fontSize = 38;
  ctx.font = `italic ${fontSize}px Georgia, serif`;
  while (fontSize > 22) {
    const testLines = wrapTextCanvas(ctx, displayText, textMaxW);
    if (testLines.length <= 7) break;
    fontSize -= 2;
    ctx.font = `italic ${fontSize}px Georgia, serif`;
  }

  const lines = wrapTextCanvas(ctx, displayText, textMaxW);
  const lineH = fontSize * 1.55;
  const authorBlockH = 44 + 36 + 24;
  const totalTextH = lines.length * lineH + authorBlockH;
  const startY = (SIZE - totalTextH) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.font = `italic ${fontSize}px Georgia, serif`;
  ctx.textAlign = "left";
  let y = startY + lineH;
  for (const line of lines) {
    ctx.fillText(line, textX, y);
    y += lineH;
  }

  y += 24;
  ctx.fillStyle = "rgba(201,169,97,1)";
  ctx.font = `bold 34px sans-serif`;
  ctx.fillText(`— ${quote.author}`, textX, y);

  y += 36;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `26px sans-serif`;
  ctx.fillText(`${quote.born}–${quote.died}`, textX, y);

  try {
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/tulip-logo.png";
    await new Promise<void>((res) => { logo.onload = () => res(); logo.onerror = () => res(); });
    if (logo.naturalWidth > 0) {
      const pillW = 310;
      const pillH = 76;
      const pillX = SIZE - pillW - 42;
      const pillY = SIZE - pillH - 36;
      const radius = 22;
      ctx.beginPath();
      ctx.moveTo(pillX + radius, pillY);
      ctx.lineTo(pillX + pillW - radius, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + radius);
      ctx.lineTo(pillX + pillW, pillY + pillH - radius);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - radius, pillY + pillH);
      ctx.lineTo(pillX + radius, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - radius);
      ctx.lineTo(pillX, pillY + radius);
      ctx.quadraticCurveTo(pillX, pillY, pillX + radius, pillY);
      ctx.closePath();
      ctx.fillStyle = "rgba(8,9,15,0.46)";
      ctx.fill();
      ctx.strokeStyle = "rgba(201,169,97,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const lSize = 46;
      const lx = pillX + 18;
      const ly = pillY + (pillH - lSize) / 2;
      ctx.globalAlpha = 0.94;
      ctx.drawImage(logo, lx, ly, lSize, lSize);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("TULIP", lx + lSize + 14, pillY + 32);
      ctx.fillStyle = "rgba(201,169,97,0.78)";
      ctx.font = "18px sans-serif";
      ctx.fillText("Bible App", lx + lSize + 14, pillY + 55);
    }
  } catch {}

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.93));
}

export default function QuotesArchivePage() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const isLight = theme === "white-noir";
  const supabase = useMemo(() => createClient(), []);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchCounts() {
      const { data } = await supabase
        .from("quote_likes")
        .select("quote_id")
        .in("quote_id", QUOTES.map((q) => q.id));
      if (!active) return;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        const id = row.quote_id as string;
        counts[id] = (counts[id] ?? 0) + 1;
      }
      setLikeCounts(counts);
    }
    fetchCounts();
    return () => { active = false; };
  }, [supabase]);

  const sortedQuotes = [...QUOTES].sort((a, b) => b.week - a.week);

  async function handleSave(quote: Quote) {
    setBusyId(quote.id);
    try {
      const blob = await generateQuoteImage(quote, lang);
      if (!blob) return;
      const safeName = quote.author.replace(/[^a-zA-Z0-9]/g, "-");
      const file = new File([blob], `${safeName}-quote.jpg`, { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${quote.author} Quote` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleShareQuote(quote: Quote) {
    setBusyId(quote.id);
    try {
      const text = lang === "es" ? quote.textEs : quote.text;
      const shareText = `"${text}" — ${quote.author} (${quote.born}–${quote.died})`;
      const blob = await generateQuoteImage(quote, lang);
      const safeName = quote.author.replace(/[^a-zA-Z0-9]/g, "-");
      const file = blob ? new File([blob], `${safeName}-quote.jpg`, { type: "image/jpeg" }) : null;

      if (navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText, title: `${quote.author} Quote` });
      } else if (navigator.share) {
        await navigator.share({ text: shareText, title: `${quote.author} Quote` });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(quote.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // user cancelled share sheet — no-op
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: isLight ? "#ffffff" : "#0b101d", color: isLight ? "#0a0a0a" : "#ffffff" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 pb-3"
        style={{
          background: isLight ? "#ffffff" : "#0b101d",
          borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.12)",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-[20px] active:opacity-60"
          style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-[16px] font-bold">
          {lang === "es" ? "Citas Pasadas" : "Past Quotes"}
        </h1>
      </div>

      {/* List */}
      <div className="px-4 py-4 flex flex-col gap-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 24px)" }}>
        {sortedQuotes.map((q) => {
          const isBusy = busyId === q.id;
          return (
            <div
              key={q.id}
              className="flex items-center gap-3 rounded-2xl p-3"
              style={{
                background: isLight ? "#f5f5f5" : "rgba(255,255,255,0.04)",
                border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.10)",
              }}
            >
              <img
                src={q.image}
                alt={q.author}
                className="w-[60px] h-[60px] rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] italic leading-snug overflow-hidden"
                  style={{
                    color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.80)",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  &ldquo;{lang === "es" ? q.textEs : q.text}&rdquo;
                </p>
                <p className="text-[11px] font-bold mt-1" style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}>
                  {q.author}{" "}
                  <span className="font-normal" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.40)" }}>
                    {q.born}–{q.died}
                  </span>
                </p>
                {copiedId === q.id && (
                  <p className="text-[10px] font-semibold mt-1" style={{ color: "#c9a961" }}>
                    {lang === "es" ? "¡Copiado!" : "Copied!"}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#e53e3e" stroke="#e53e3e" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-[12px] font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)" }}>
                    {likeCounts[q.id] ?? 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(q)}
                    disabled={isBusy}
                    aria-label="Save"
                    className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-60"
                    style={{
                      background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
                      color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShareQuote(q)}
                    disabled={isBusy}
                    aria-label="Share"
                    className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-60"
                    style={{
                      background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
                      color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
