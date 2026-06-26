"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeDefinition, badgeText, evaluateBadgeUnlocks, type BadgeLang } from "../lib/badges";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";

export function ShareIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8.7 10.7 15.3 7M8.7 13.3l6.6 3.7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="6.5" cy="12" r="3" fill="currentColor" />
      <circle cx="17.5" cy="6" r="3" fill="currentColor" />
      <circle cx="17.5" cy="18" r="3" fill="currentColor" />
    </svg>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
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

async function buildBadgeShareImage(badge: BadgeDefinition, lang: BadgeLang): Promise<File> {
  const copy = badgeText(badge, lang);
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#071326");
  gradient.addColorStop(0.52, "#0b1a33");
  gradient.addColorStop(1, "#050a16");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size / 2, 325, 60, size / 2, 325, 440);
  glow.addColorStop(0, "rgba(216,184,103,0.32)");
  glow.addColorStop(0.45, "rgba(216,184,103,0.09)");
  glow.addColorStop(1, "rgba(216,184,103,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(216,184,103,0.34)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(72, 72, size - 144, size - 144, 54);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.035)";
  ctx.beginPath();
  ctx.roundRect(100, 100, size - 200, size - 200, 42);
  ctx.fill();

  ctx.fillStyle = "#d8b867";
  ctx.font = "900 30px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText(lang === "es" ? "INSIGNIA GANADA" : "BADGE EARNED", size / 2, 156);

  const badgeImg = await loadImage(badge.image);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.48)";
  ctx.shadowBlur = 38;
  ctx.shadowOffsetY = 22;
  ctx.drawImage(badgeImg, 315, 205, 450, 450);
  ctx.restore();

  ctx.fillStyle = "#fff8e8";
  ctx.font = "900 72px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  const nameLines = wrapText(ctx, copy.name, 760).slice(0, 2);
  let y = 725;
  for (const line of nameLines) {
    ctx.fillText(line, size / 2, y);
    y += 78;
  }

  ctx.fillStyle = "rgba(255,248,232,0.74)";
  ctx.font = "600 34px Inter, Arial, sans-serif";
  const reasonLines = wrapText(ctx, copy.reason, 770).slice(0, 3);
  y += 10;
  for (const line of reasonLines) {
    ctx.fillText(line, size / 2, y);
    y += 46;
  }

  const brandText = "Tulip Bible App";
  ctx.font = "800 28px Inter, Arial, sans-serif";
  ctx.letterSpacing = "0px";
  const logoSize = 48;
  const brandGap = 16;
  const brandWidth = logoSize + brandGap + ctx.measureText(brandText).width;
  const brandX = (size - brandWidth) / 2;
  const brandY = 920;

  ctx.fillStyle = "rgba(216,184,103,0.08)";
  ctx.beginPath();
  ctx.roundRect(brandX - 22, brandY - 14, brandWidth + 44, 76, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(216,184,103,0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  try {
    const logo = await loadImage("/tulip-logo.png");
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(logo, brandX, brandY, logoSize, logoSize);
    ctx.restore();
  } catch {
    ctx.fillStyle = "rgba(216,184,103,0.18)";
    ctx.beginPath();
    ctx.roundRect(brandX, brandY, logoSize, logoSize, 12);
    ctx.fill();
  }

  ctx.fillStyle = "#d8b867";
  ctx.font = "800 28px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(brandText, brandX + logoSize + brandGap, brandY + logoSize / 2);
  ctx.textBaseline = "alphabetic";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Image export failed"))), "image/jpeg", 0.94);
  });
  return new File([blob], `${badge.id}-tulip-badge.jpg`, { type: "image/jpeg" });
}

export async function shareBadge(badge: BadgeDefinition, lang: BadgeLang) {
  const copy = badgeText(badge, lang);
  const text = lang === "es"
    ? `Gané la insignia ${copy.name} en Tulip Bible App: ${copy.reason}.`
    : `I earned the ${copy.name} badge in the Tulip Bible App: ${copy.reason}.`;
  try {
    const file = await buildBadgeShareImage(badge, lang);
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData & { files?: File[] }) => boolean;
      share?: (data: ShareData & { files?: File[] }) => Promise<void>;
    };
    if (nav.share && (!nav.canShare || nav.canShare({ files: [file], title: copy.name, text }))) {
      await nav.share({ files: [file], title: copy.name, text });
      return;
    }
    if (nav.share) {
      await nav.share({ title: copy.name, text });
      return;
    }
    await navigator.clipboard.writeText(text);
  } catch {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }
}

const SHOWN_KEY = "tulip_badges_shown_v1";

// Module-level set: survives component unmount/remount (page navigation within same session)
const _shownThisRuntime = new Set<string>();

// Seed from localStorage on first load so we survive hard reloads too
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(SHOWN_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) arr.forEach((id: string) => _shownThisRuntime.add(id));
  } catch {}
}

function markShown(id: string) {
  _shownThisRuntime.add(id);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SHOWN_KEY, JSON.stringify([..._shownThisRuntime]));
  } catch {}
}

export function BadgeRuntime() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isLight = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) === "white-noir" || theme === "white-noir";
  const [queue, setQueue] = useState<BadgeDefinition[]>([]);
  const [active, setActive] = useState<BadgeDefinition | null>(null);
  const activeRef = useRef<BadgeDefinition | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    function check() {
      const unlocked = evaluateBadgeUnlocks();
      if (unlocked.length === 0) return;
      // Filter out any badge already shown this runtime (module-level — survives navigation)
      const newOnes = unlocked.filter((b) => !_shownThisRuntime.has(b.id));
      if (newOnes.length === 0) return;
      // Mark immediately before setQueue so re-entrant calls (from "tulip-badges-change") are blocked
      for (const b of newOnes) markShown(b.id);
      setQueue((prev) => {
        const existingIds = new Set([...prev.map((b) => b.id), activeRef.current?.id].filter(Boolean) as string[]);
        return [...prev, ...newOnes.filter((b) => !existingIds.has(b.id))];
      });
    }

    const timer = window.setInterval(check, 2500);
    check();
    window.addEventListener("focus", check);
    window.addEventListener("storage", check);
    window.addEventListener("tulip-badges-change", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", check);
      window.removeEventListener("tulip-badges-change", check);
    };
  }, []);

  useEffect(() => {
    if (activeRef.current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setActive(next);
    setQueue(rest);
  }, [queue]);

  if (!active) return null;
  const copy = badgeText(active, lang);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/58 backdrop-blur-md" />
      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] p-6 text-center shadow-2xl"
        style={{
          background: isLight ? "#ffffff" : "rgba(7,19,38,0.95)",
          border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(216,184,103,0.30)",
          boxShadow: isLight ? "0 20px 60px rgba(0,0,0,0.15)" : undefined,
        }}
      >
        <button
          type="button"
          onClick={() => setActive(null)}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full"
          style={{ border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)", background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.55)" }}
          aria-label={lang === "es" ? "Cerrar insignia" : "Close badge popup"}
        >
          ×
        </button>

        <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "#d8b867" }}>
          {lang === "es" ? "Insignia Ganada" : "Badge Earned"}
        </p>
        <img
          src={active.image}
          alt={copy.name}
          className="mx-auto mt-4 h-40 w-40 object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]"
        />
        <h2 className="mt-4 text-3xl font-black leading-tight" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{copy.name}</h2>
        <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.68)" }}>{copy.reason}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => shareBadge(active, lang)}
            aria-label={lang === "es" ? "Compartir insignia" : "Share badge"}
            className="grid place-items-center rounded-2xl px-4 py-3 active:scale-[0.98]"
            style={{ background: isLight ? "#e5e7eb" : "#d8b867", color: isLight ? "#0a0a0a" : "#071326" }}
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setActive(null)}
            className="rounded-2xl px-4 py-3 text-sm font-bold active:scale-[0.98]"
            style={{ border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.12)", background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", color: isLight ? "#0a0a0a" : "rgba(255,255,255,0.80)" }}
          >
            {lang === "es" ? "Seguir" : "Keep Going"}
          </button>
        </div>
      </div>
    </div>
  );
}
