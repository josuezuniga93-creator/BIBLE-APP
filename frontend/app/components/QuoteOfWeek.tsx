"use client";
import { getCurrentQuote } from "../data/quotes";
import { useLanguage } from "../lib/useLanguage";
import { useState, useEffect } from "react";

export default function QuoteOfWeek() {
  const quote = getCurrentQuote();
  const { lang } = useLanguage();
  const text = lang === "es" ? quote.textEs : quote.text;
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [isLightElegant, setIsLightElegant] = useState(false);
  const [isPremiumNeon,  setIsPremiumNeon]  = useState(false);
  useEffect(() => {
    const check = () => {
      const t = localStorage.getItem("ryc-theme") ?? "";
      setIsLightElegant(t === "white-noir");
      setIsPremiumNeon(t === "premium-neon");
    };
    check();
    window.addEventListener("ryc-theme-change", check as EventListener);
    return () => window.removeEventListener("ryc-theme-change", check as EventListener);
  }, []);
  const qAC  = isPremiumNeon ? "#a78bfa" : isLightElegant ? "#111111" : "#c9a961";
  const qACb = isPremiumNeon ? "rgba(167,139,250,0.70)" : isLightElegant ? "rgba(17,17,17,0.70)" : "rgba(201,169,97,0.70)";

  function handleCopy() {
    const shareText = `"${text}" — ${quote.author} (${quote.born}–${quote.died})`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleShare() {
    setSharing(true);
    try {
      const SIZE = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Load portrait
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = quote.image;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });

      // 2. Draw the full portrait artwork so the head stays visible and
      // the beard naturally reaches toward the quote.
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      // 3. Dark fade toward the quote side. The fade starts late enough that
      // Ryle's beard remains close to the first words without covering them.
      const grad = ctx.createLinearGradient(SIZE * 0.34, 0, SIZE, 0);
      grad.addColorStop(0, "rgba(13,15,23,0)");
      grad.addColorStop(0.24, "rgba(13,15,23,0.12)");
      grad.addColorStop(0.43, "rgba(13,15,23,0.72)");
      grad.addColorStop(0.68, "rgba(13,15,23,0.96)");
      grad.addColorStop(1, "rgba(13,15,23,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // 4. Quote text — close to the beard, then flowing into the dark fade.
      const textX = SIZE * 0.52;
      const textMaxW = SIZE * 0.43;
      const quoteText = lang === "es" ? quote.textEs : quote.text;
      const displayText = `"${quoteText}"`;

      // Auto-size font: start at 38px, reduce if > 7 lines
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
      const authorBlockH = 44 + 36 + 24; // gap + author line + years line
      const totalTextH = lines.length * lineH + authorBlockH;
      const startY = (SIZE - totalTextH) / 2;

      // Draw quote lines
      ctx.fillStyle = "#ffffff";
      ctx.font = `italic ${fontSize}px Georgia, serif`;
      ctx.textAlign = "left";
      let y = startY + lineH;
      for (const line of lines) {
        ctx.fillText(line, textX, y);
        y += lineH;
      }

      // 5. Author name
      y += 24;
      ctx.fillStyle = "rgba(201,169,97,1)";
      ctx.font = `bold 34px sans-serif`;
      ctx.fillText(`— ${quote.author}`, textX, y);

      // 6. Years
      y += 36;
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `26px sans-serif`;
      ctx.fillText(`${quote.born}–${quote.died}`, textX, y);

      // 7. Logo bottom-right
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

      // 8. Export
      canvas.toBlob(async (blob) => {
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
      }, "image/jpeg", 0.93);
    } finally {
      setSharing(false);
    }
  }

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

  function handleLike() {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  return (
    <section className="mt-8 mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[15px] font-bold"
          style={{ color: isLightElegant ? "#0a0a0a" : "var(--color-text, #fff)" }}
        >
          {lang === "es" ? "Cita de la Semana" : "Quote of the Week"}
        </h3>
        <span className="text-[11px]" style={{ color: qACb }}>
          {lang === "es" ? "Voces del pasado" : "Voices from the past"}
        </span>
      </div>

      {/* Quote card */}
      <div
        className="quote-week-media-card relative rounded-2xl overflow-hidden w-full"
        style={{
          minHeight: "370px",
          background: isLightElegant ? "#f0f1f3" : "#0b0d15",
          border: isLightElegant ? "1px solid rgba(10,10,10,0.14)" : "1px solid rgba(201,169,97,0.10)",
          boxShadow: isLightElegant ? "0 4px 20px rgba(10,10,10,0.10)" : undefined,
        }}
      >
        {/* Portrait artwork — full card so the beard naturally reaches the quote */}
        <img
          src={quote.image}
          alt={quote.author}
          className="absolute inset-0 h-full w-full"
          style={{
            objectFit: "cover",
            objectPosition: "left top",
          }}
        />

        {/* Gradient overlay — portrait fades into dark right */}
        <div
          className="absolute inset-0"
          style={{
            background: isLightElegant
              ? "linear-gradient(to right, rgba(240,241,243,0) 34%, rgba(240,241,243,0.42) 45%, rgba(240,241,243,0.88) 58%, rgba(240,241,243,0.97) 74%, rgba(240,241,243,1) 100%)"
              : "linear-gradient(to right, rgba(11,13,21,0) 34%, rgba(11,13,21,0.22) 45%, rgba(11,13,21,0.78) 58%, rgba(11,13,21,0.98) 74%, rgba(11,13,21,1) 100%)",
          }}
        />

        {/* Quote text — close to Ryle's beard, flowing into the dark fade */}
        <div
          className="absolute inset-y-0 flex flex-col justify-center"
          style={{ left: "52%", right: "5%", paddingTop: "20px", paddingBottom: "22px" }}
        >
          <p className="text-[15px] italic font-semibold leading-[1.22] mb-5 tracking-[-0.02em]" style={{ color: isLightElegant ? "#0a0a0a" : "#ffffff" }}>
            {lang === "es" ? `"${quote.textEs}"` : `"${quote.text}"`}
          </p>
          <div>
            <p className="text-[14px] font-bold mb-0.5" style={{ color: qAC }}>
              {quote.author}
            </p>
            <p className="text-[11px]" style={{ color: isLightElegant ? "rgba(10,10,10,0.50)" : "rgba(255,255,255,0.42)" }}>
              {quote.born}–{quote.died}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive bar */}
      <div className="flex items-center justify-between mt-3 px-1">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-[12px] transition-all"
          style={{ color: liked ? qAC : isLightElegant ? "rgba(10,10,10,0.48)" : "rgba(255,255,255,0.4)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? qAC : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>
            {likeCount > 0
              ? likeCount
              : lang === "es"
              ? "Me inspira"
              : "Inspiring"}
          </span>
        </button>

        {/* Copy + Share */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[12px] transition-all"
            style={{
              color: copied ? qAC : isLightElegant ? "rgba(10,10,10,0.48)" : "rgba(255,255,255,0.4)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>
              {copied
                ? lang === "es"
                  ? "¡Copiado!"
                  : "Copied!"
                : lang === "es"
                ? "Copiar"
                : "Copy"}
            </span>
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-1.5 text-[12px]"
            style={{ color: sharing ? qACb : isLightElegant ? "rgba(10,10,10,0.48)" : "rgba(255,255,255,0.4)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>
              {sharing
                ? lang === "es" ? "Exportando..." : "Exporting..."
                : lang === "es" ? "Compartir" : "Share"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
