"use client";

/**
 * Tulip Bible App — Videos Section
 *
 * Phase 1: Frontend structure with categories
 * Phase 2: Fundamentals of the Faith educational library
 * Architecture is designed for Supabase integration (Phase 7).
 * All video content is delivered via the official Tulip Bible App YouTube channel.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";
import { AppSectionIcon } from "../components/AppSectionIcon";
import { UiIcon } from "../components/UiIcon";
import type { VideoLanguage } from "../lib/videoTypes";
import {
  ARCHIVE_VIDEOS,
  CATEGORY_COLORS,
  COMMUNITY_VIDEOS,
  CURRENT_FEATURED,
  FUNDAMENTALS,
  SHORT_VIDEOS,
  TESTIMONIES_VIDEOS,
  matchesVideoSearch,
  uniqueVideos,
  type FundamentalsSection,
  type VideoEntry,
} from "../data/videoLibrary";

// ─── Design constants (matches app-wide system) ────────────────────────────────
const AC        = "#c9a961";
const AC_BG     = "rgba(201,169,97,0.12)";
const AC_BORDER = "rgba(201,169,97,0.35)";
const SERIF     = "'Iowan Old Style','Georgia','Times New Roman',serif";
const BG_ROOT   = "#08090f";
const BG_CARD   = "rgba(255,255,255,0.033)";
const BD_CARD   = "rgba(255,255,255,0.08)";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ytThumb(id: string, quality: "hq" | "mq" = "hq") {
  return `https://img.youtube.com/vi/${id}/${quality}default.jpg`;
}

function formatDuration(secs?: number): string {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${m} min`;
}

// ─── Continue Watching — localStorage-backed history ───────────────────────────

interface WatchItem {
  videoId: string;
  title: string;
  speaker?: string;
  isShort?: boolean;
  ts: number;
}

const WATCH_KEY = "tba_watch_history";

function loadWatchHistory(): WatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WATCH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WatchItem[]) : [];
  } catch {
    return [];
  }
}

function recordWatch(item: WatchItem) {
  if (typeof window === "undefined") return;
  try {
    const prev = loadWatchHistory().filter((w) => w.videoId !== item.videoId);
    const next = [item, ...prev].slice(0, 12);
    window.localStorage.setItem(WATCH_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function removeFromHistory(videoId: string) {
  if (typeof window === "undefined") return;
  try {
    const next = loadWatchHistory().filter((w) => w.videoId !== videoId);
    window.localStorage.setItem(WATCH_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

// ─── Back arrow icon ───────────────────────────────────────────────────────────

function BackArrow({ onClick, isLight = false }: { onClick: () => void; isLight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 hover:opacity-80 transition-colors py-1"
      style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      <span className="text-[13px] font-semibold">Back</span>
    </button>
  );
}

// ─── YouTube embed player (full-screen modal) ──────────────────────────────────

function VideoPlayerModal({ videoId, title, onClose, vertical = false }: { videoId: string; title: string; onClose: () => void; vertical?: boolean }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[500] bg-black flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Minimal back button — no title, no badge */}
      <div className="flex items-center px-3 py-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        {vertical && (
          <span className="ml-3 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: "rgba(201,169,97,0.90)", color: "#08090f" }}>
            Short
          </span>
        )}
      </div>
      {/* Player — vertical shorts are centered in a 9:16 frame */}
      {vertical ? (
        <div className="flex-1 flex items-center justify-center px-3 pb-3">
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ maxWidth: "min(440px, calc((100vh - 110px) * 0.5625))", aspectRatio: "9/16", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Video card — horizontal scroll list ──────────────────────────────────────

function VideoCard({
  video,
  size = "md",
  onClick,
  showChurch = false,
  isLight = false,
}: {
  video: VideoEntry;
  size?: "sm" | "md" | "lg";
  onClick: () => void;
  showChurch?: boolean;
  isLight?: boolean;
}) {
  const widthClass = size === "sm" ? "w-[130px]" : size === "lg" ? "w-[220px]" : "w-[165px]";
  const thumbQuality = size === "lg" ? "hq" : "mq";

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 ${widthClass} rounded-xl overflow-hidden text-left active:scale-[0.97] transition-all`}
      style={{ background: isLight ? "rgba(0,0,0,0.03)" : BG_CARD, border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}
    >
      {/* Thumbnail */}
      <div className="relative" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ytThumb(video.id, thumbQuality)}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        </div>
        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.78)", color: "rgba(255,255,255,0.85)" }}>
            {video.duration}
          </span>
        )}
        {/* Short badge */}
        {video.isShort && (
          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: isLight ? "rgba(0,0,0,0.10)" : "rgba(201,169,97,0.90)", color: isLight ? "#0a0a0a" : "#08090f" }}>
            SHORT
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-2.5">
        <p className="text-[10px] font-bold mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>
          {video.speaker}
        </p>
        {showChurch && video.church && (
          <p className="text-[9px] mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>{video.church}</p>
        )}
        <p className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: isLight ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.80)" }}>{video.title}</p>
      </div>
    </button>
  );
}

// ─── Short card — vertical 9:16 (phone "shorts" format) ────────────────────────

function ShortCard({
  video,
  size = "md",
  onClick,
  isLight = false,
}: {
  video: VideoEntry;
  size?: "sm" | "md";
  onClick: () => void;
  isLight?: boolean;
}) {
  const widthClass = size === "sm" ? "w-[124px]" : "w-[142px]";
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 ${widthClass} rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-all relative`}
      style={{ background: isLight ? "rgba(0,0,0,0.05)" : "#0d0d18", border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}
    >
      {/* Vertical thumbnail (YouTube thumb cropped to 9:16) */}
      <div className="relative" style={{ aspectRatio: "9/16" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ytThumb(video.id, "hq")}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => { const t = e.currentTarget; if (!t.dataset.fallback) { t.dataset.fallback = "1"; t.src = ytThumb(video.id, "mq"); } }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,9,15,0.92) 0%, rgba(8,9,15,0.10) 45%, rgba(8,9,15,0.05) 100%)" }} />
        {/* Short badge */}
        <span className="absolute top-2 left-2 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded" style={{ background: isLight ? "rgba(0,0,0,0.10)" : "rgba(201,169,97,0.92)", color: isLight ? "#0a0a0a" : "#08090f" }}>
          SHORT
        </span>
        {/* Play ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>
          </div>
        </div>
        {/* Info pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[9px] font-bold mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.50)" : AC }}>{video.speaker}</p>
          <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2">{video.title}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Recently watched card ─────────────────────────────────────────────────────

function ContinueCard({ item, onClick, onRemove, isLight = false }: { item: WatchItem; onClick: () => void; onRemove: () => void; isLight?: boolean }) {
  return (
    <div
      className="flex-shrink-0 w-[200px] rounded-xl overflow-hidden text-left active:scale-[0.97] transition-all relative"
      style={{ background: isLight ? "rgba(0,0,0,0.03)" : BG_CARD, border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}
    >
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)" }}
        aria-label="Remove from history"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <button onClick={onClick} className="w-full text-left">
        <div className="relative" style={{ aspectRatio: "16/9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ytThumb(item.videoId, "hq")} alt={item.title} className="w-full h-full object-cover" onError={(e) => { const t = e.currentTarget; if (!t.dataset.fallback) { t.dataset.fallback = "1"; t.src = ytThumb(item.videoId, "mq"); } }} />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: isLight ? "rgba(30,30,30,0.85)" : "rgba(201,169,97,0.92)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={isLight ? "#ffffff" : "#08090f"}><polygon points="6,3 20,12 6,21"/></svg>
            </div>
          </div>
        </div>
        <div className="p-2.5">
          {item.speaker && <p className="text-[10px] font-bold mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>{item.speaker}</p>}
          <p className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: isLight ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.80)" }}>{item.title}</p>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
            Recently watched
          </p>
        </div>
      </button>
    </div>
  );
}

function VideoLibraryHero({
  lang,
  isLight,
  featured,
  onExplore,
  onAsk,
  onWatch,
  activeLanguage,
}: {
  lang: string;
  isLight: boolean;
  featured: VideoEntry | null;
  onExplore: () => void;
  onAsk: () => void;
  onWatch: (video: VideoEntry) => void;
  activeLanguage: VideoLanguage;
}) {
  const accent = isLight ? "#0a0a0a" : AC;
  const headline = lang === "es" ? "Aprende de voces confiables." : "Learn from trusted voices.";
  const subcopy = lang === "es"
    ? "Sermones, testimonios y enseñanza bíblica para crecer con claridad."
    : "Sermons, testimonies, and biblical teaching for focused growth.";

  return (
    <section className="px-4 pt-4 mb-7">
      <div
        className="video-premium-hero relative overflow-hidden rounded-[28px] p-5 pb-6"
        style={{
          background: isLight
            ? "linear-gradient(112deg, #ffffff 0%, #f2f3f4 60%, #e8eaec 100%)"
            : "radial-gradient(circle at 88% 8%, rgba(201,169,97,0.28), transparent 42%), linear-gradient(135deg, #101420 0%, #08090f 100%)",
          border: `1px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)"}`,
          boxShadow: isLight ? "0 22px 50px rgba(15,23,42,0.12)" : "0 24px 60px rgba(0,0,0,0.40)",
          minHeight: "280px",
        }}
      >
        <div className="video-premium-sweep" />
        <div className="video-premium-orb" />
        {!isLight && (
          <div className="video-premium-motes" aria-hidden="true">
            {[
              { left: "58%", size: 4, dur: "7s", delay: "0s", drift: "6px" },
              { left: "70%", size: 3, dur: "8.5s", delay: "1.6s", drift: "-8px" },
              { left: "82%", size: 5, dur: "6.4s", delay: "3s", drift: "9px" },
              { left: "91%", size: 3, dur: "9.2s", delay: "0.8s", drift: "-6px" },
            ].map((m, i) => (
              <span
                key={i}
                className="video-premium-mote"
                style={{
                  left: m.left,
                  width: m.size,
                  height: m.size,
                  animationDuration: m.dur,
                  animationDelay: m.delay,
                  ["--mote-drift" as string]: m.drift,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          {/* Badge */}
          <div
            className="video-hero-badge inline-flex items-center gap-2 rounded-full px-3 py-2 mb-3"
            style={{
              background: isLight ? "#f0f1f2" : "rgba(255,255,255,0.07)",
              border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)"}`,
              color: isLight ? "#0a0a0a" : "rgba(255,255,255,0.90)",
            }}
          >
            <span className="h-[6px] w-[6px] rounded-full flex-shrink-0" style={{ background: accent }} />
            <span className="text-[9px] font-black uppercase tracking-[0.18em]">
              {lang === "es" ? "Videos cristianos" : "Christian videos"}
            </span>
          </div>

          {/* Gold accent line */}
          {!isLight && (
            <div
              className="mb-4 rounded-full"
              style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${AC}, transparent)` }}
            />
          )}

          {/* Headline */}
          <h2
            className="video-hero-headline text-[34px] font-black leading-[0.95] tracking-[-0.04em] mb-3"
            style={{ color: isLight ? "#050505" : "#ffffff", maxWidth: "66%" }}
          >
            {headline}
          </h2>

          {/* Subcopy */}
          <p
            className="video-hero-sub text-[13px] leading-[1.5] mb-6"
            style={{ color: isLight ? "rgba(0,0,0,0.56)" : "rgba(255,255,255,0.60)", maxWidth: "70%" }}
          >
            {subcopy}
          </p>

          {/* CTA row */}
          <div className="video-hero-cta flex items-center gap-3">
            <div className="relative flex-shrink-0 video-hero-play-wrap">
              <button
                onClick={() => featured ? onWatch(featured) : onExplore()}
                className="relative z-10 h-[50px] w-[50px] rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: isLight ? "#050505" : AC, color: isLight ? "#ffffff" : "#08090f" }}
                aria-label={lang === "es" ? "Reproducir video" : "Play video"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="7,4 19,12 7,20"/></svg>
              </button>
              {!isLight && (
                <>
                  <span className="video-hero-pulse-ring" />
                  <span className="video-hero-pulse-ring" style={{ animationDelay: "0.66s" }} />
                  <span className="video-hero-pulse-ring" style={{ animationDelay: "1.33s" }} />
                </>
              )}
            </div>
            <button
              onClick={onExplore}
              className="rounded-full px-5 py-[14px] text-[13px] font-black active:scale-[0.98] transition-transform"
              style={{
                background: isLight ? "#050505" : "rgba(255,255,255,0.10)",
                color: "#ffffff",
                border: `1px solid ${isLight ? "#050505" : "rgba(255,255,255,0.12)"}`,
              }}
            >
              {lang === "es" ? "Ver ahora" : "Watch now"}
            </button>
          </div>

          {/* Language + Ask — subtle text row */}
          <div className="mt-4 flex items-center gap-3">
            <span
              className="text-[10.5px] font-semibold"
              style={{ color: isLight ? "rgba(0,0,0,0.36)" : "rgba(255,255,255,0.36)" }}
            >
              EN · ES
            </span>
            <span style={{ color: isLight ? "rgba(0,0,0,0.20)" : "rgba(255,255,255,0.22)", fontSize: 10 }}>|</span>
            <button
              onClick={onAsk}
              className="text-[10.5px] font-semibold active:opacity-60 transition-opacity"
              style={{ background: "transparent", border: "none", color: isLight ? "rgba(0,0,0,0.36)" : "rgba(255,255,255,0.36)" }}
            >
              {lang === "es" ? "Haz una pregunta" : "Ask a question"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoHubTile({
  icon,
  title,
  subtitle,
  onClick,
  isLight = false,
}: {
  icon: "videos" | "study-tools" | "worship" | "library";
  title: string;
  subtitle: string;
  onClick: () => void;
  isLight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[22px] p-4 text-left active:scale-[0.98] transition-transform"
      style={{
        background: isLight ? "#ffffff" : "rgba(255,255,255,0.045)",
        border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: isLight ? "0 14px 34px rgba(15,23,42,0.07)" : "none",
      }}
    >
      <span
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: isLight ? "#f0f1f2" : "rgba(201,169,97,0.12)", color: isLight ? "#101010" : AC }}
      >
        <AppSectionIcon name={icon} size={23} />
      </span>
      <span className="block text-[18px] font-black leading-tight" style={{ color: isLight ? "#050505" : "#ffffff" }}>
        {title}
      </span>
      <span className="mt-1.5 block text-[12px] leading-snug" style={{ color: isLight ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.52)" }}>
        {subtitle}
      </span>
    </button>
  );
}

function EmptyVideoShelf({
  title,
  body,
  action,
  onAction,
  isLight = false,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  isLight?: boolean;
}) {
  return (
    <div
      className="rounded-[24px] p-5 text-left"
      style={{
        background: isLight ? "#ffffff" : "rgba(255,255,255,0.04)",
        border: `1px dashed ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: isLight ? "#f0f1f2" : "rgba(201,169,97,0.11)", color: isLight ? "#111111" : AC }}
      >
        <AppSectionIcon name="videos" size={23} />
      </div>
      <h3 className="text-[19px] font-black leading-tight" style={{ color: isLight ? "#050505" : "#ffffff" }}>{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.52)" : "rgba(255,255,255,0.55)" }}>{body}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-full px-4 py-2.5 text-[12px] font-black active:scale-[0.98] transition-transform"
          style={{ background: isLight ? "#111111" : AC, color: isLight ? "#ffffff" : "#08090f" }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Featured Video Banner (Phase 1) ──────────────────────────────────────────

function FeaturedVideoBanner({ video, onWatch }: { video: VideoEntry; onWatch: () => void }) {
  return (
    <div className="mx-4 mb-6 rounded-2xl overflow-hidden relative" style={{ background: "#0d0d18", border: `1px solid ${BD_CARD}` }}>
      {/* Thumbnail */}
      <div className="relative" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ytThumb(video.id, "hq")}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(8,9,15,0.98) 0%, rgba(8,9,15,0.45) 55%, rgba(8,9,15,0.10) 100%)" }}
        />
        {/* Play button overlay */}
        <button
          onClick={onWatch}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
            style={{ background: "rgba(201,169,97,0.90)", backdropFilter: "blur(8px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#08090f"><polygon points="6,3 20,12 6,21"/></svg>
          </div>
        </button>
        {/* Live badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[9px] font-black tracking-widest px-2 py-1 rounded" style={{ background: AC, color: "#08090f" }}>
            FEATURED
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="px-4 pt-3 pb-4">
        <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: AC }}>
          {video.speaker}{video.church ? ` · ${video.church}` : ""}
        </p>
        <h2 className="text-[17px] font-bold text-white leading-snug mb-1">{video.title}</h2>
        {video.description && (
          <p className="text-[12px] text-white/50 leading-relaxed mb-3 line-clamp-2">{video.description}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={onWatch}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: AC, color: "#08090f" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            Watch Now
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{ background: "rgba(255,0,0,0.12)", color: "#ff4444", border: "1px solid rgba(255,0,0,0.22)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Ask a Question — localStorage queue ───────────────────────────────────────

interface QuestionItem {
  question: string;
  email?: string;
  ts: number;
}

const QUESTIONS_KEY = "tba_questions";

function saveQuestion(item: QuestionItem) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(QUESTIONS_KEY);
    const prev: QuestionItem[] = raw ? JSON.parse(raw) : [];
    window.localStorage.setItem(QUESTIONS_KEY, JSON.stringify([item, ...prev].slice(0, 50)));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

// ─── Coming Soon feature banners (hero + 2 stacked, 231-style) ─────────────────

function ComingSoonBanners({ onAsk, isLight = false }: { onAsk: () => void; isLight?: boolean }) {
  return (
    <section className="px-4 pt-4 mb-8">
      <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-3" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
        Coming Soon
      </p>

      {/* Hero banner — Fundamentals */}
      <div
        className="relative rounded-2xl overflow-hidden mb-3 flex flex-col justify-center"
        style={{ minHeight: 132, background: isLight ? "#e2e2e2" : "#0d1b33", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(59,130,246,0.40)", padding: "18px" }}
      >
        <p className="text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "#6ea8fe" }}>Series · Fundamentals of the Faith</p>
        <h2 className="text-[26px] font-bold leading-[1.06]" style={{ fontFamily: SERIF, color: isLight ? "#0a0a0a" : "#ffffff" }}>Fundamentals</h2>
        <span className="absolute top-3.5 right-3.5 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "#6ea8fe", border: isLight ? "1px solid rgba(0,0,0,0.18)" : "1px solid rgba(59,130,246,0.45)" }}>SOON</span>
      </div>

      {/* Two stacked cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Testimonies */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-end"
          style={{ minHeight: 104, background: isLight ? "#e2e2e2" : "#1d1305", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.30)", padding: "14px" }}
        >
          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>Stories of Grace</p>
          <h3 className="text-[17px] font-bold leading-[1.1]" style={{ fontFamily: SERIF, color: isLight ? "#0a0a0a" : "#ffffff" }}>Testimonies</h3>
          <span className="absolute top-3 right-3 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: isLight ? "rgba(0,0,0,0.35)" : AC, border: isLight ? "1px solid rgba(0,0,0,0.18)" : `1px solid ${AC_BORDER}` }}>SOON</span>
        </div>

        {/* Ask a Question — opens request form */}
        <button
          onClick={onAsk}
          className="relative rounded-2xl overflow-hidden flex flex-col justify-end text-left active:scale-[0.97] transition-all"
          style={{ minHeight: 104, background: isLight ? "#e2e2e2" : "#0e1f1a", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.30)", padding: "14px" }}
        >
          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>Ask &amp; Receive</p>
          <h3 className="text-[17px] font-bold leading-[1.1]" style={{ fontFamily: SERIF, color: isLight ? "#0a0a0a" : "#ffffff" }}>Ask a Question</h3>
          <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: isLight ? "rgba(0,0,0,0.08)" : AC_BG, border: isLight ? "1px solid rgba(0,0,0,0.15)" : `1px solid ${AC_BORDER}` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isLight ? "rgba(0,0,0,0.55)" : AC} strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
          </span>
        </button>
      </div>
    </section>
  );
}

// ─── Ask a Question — request form (bottom sheet) ──────────────────────────────

function QuestionFormModal({ onClose, isLight = false }: { onClose: () => void; isLight?: boolean }) {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  const submit = () => {
    if (!question.trim()) return;
    saveQuestion({ question: question.trim(), email: email.trim() || undefined, ts: Date.now() });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[450] flex flex-col items-center px-4 pt-14 overflow-y-auto">
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: isLight ? "#ffffff" : "#11131c", border: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : AC_BORDER}`, maxHeight: "88vh", animation: "sheetDrop 0.26s cubic-bezier(0.22,1,0.36,1)" }}
      >
        <style>{`@keyframes sheetDrop{from{transform:translateY(-14px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full active:scale-90"
          style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        {submitted ? (
          <div className="px-6 pt-4 pb-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: isLight ? "rgba(0,0,0,0.06)" : AC_BG, border: `1px solid ${isLight ? "rgba(0,0,0,0.15)" : AC_BORDER}` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isLight ? "#0a0a0a" : AC} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h2 className="text-[19px] font-bold mb-2" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Question received</h2>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.50)" }}>
              Thanks for asking. We&rsquo;ll answer it in a short video &mdash; keep an eye on the Short Videos shelf.
            </p>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]" style={{ background: isLight ? "#0a0a0a" : AC, color: isLight ? "#ffffff" : "#08090f" }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-2 pb-4" style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
              <p className="text-[9px] font-black tracking-widest uppercase" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>Ask &amp; Receive</p>
              <h2 className="text-[19px] font-bold leading-tight" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Ask a Question</h2>
              <p className="text-[11px] mt-2" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)" }}>
                Submit your question and we&rsquo;ll answer it in a short video.
              </p>
            </div>

            <div className="px-5 py-4">
              <label className="text-[10px] font-bold tracking-wide uppercase block mb-1.5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>Your question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="What would you like us to address?"
                className={`w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none mb-4 ${isLight ? "text-black placeholder-black/30" : "text-white placeholder-white/30"}`}
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", border: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}` }}
              />
              <label className="text-[10px] font-bold tracking-wide uppercase block mb-1.5" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>Email (optional)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="So we can let you know when it's answered"
                className={`w-full rounded-xl px-3 py-2.5 text-[14px] outline-none mb-5 ${isLight ? "text-black placeholder-black/30" : "text-white placeholder-white/30"}`}
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", border: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}` }}
              />
              <button
                onClick={submit}
                disabled={!question.trim()}
                className="w-full py-3 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
                style={{ background: isLight ? "#0a0a0a" : AC, color: isLight ? "#ffffff" : "#08090f", opacity: question.trim() ? 1 : 0.45 }}
              >
                Submit Question
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  onViewAll,
  color = AC,
  isLight = false,
}: {
  label: string;
  title: string;
  onViewAll?: () => void;
  color?: string;
  isLight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div>
        <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: isLight ? "rgba(0,0,0,0.40)" : color }}>{label}</p>
        <h3 className="text-[16px] font-bold" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{title}</h3>
      </div>
      {onViewAll && (
        <button onClick={onViewAll} className="text-[11px] font-bold" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(201,169,97,0.55)" }}>
          View all →
        </button>
      )}
    </div>
  );
}

// ─── Browse-by-Topic grid card (clean, emoji-free) ─────────────────────────────

function TopicCategoryCard({
  section,
  onSelect,
  isLight = false,
}: {
  section: FundamentalsSection;
  onSelect: (section: FundamentalsSection) => void;
  isLight?: boolean;
}) {
  const color = CATEGORY_COLORS[section.category];
  const dotColor = isLight ? "rgba(0,0,0,0.25)" : color;
  const available = section.topics.filter((t) => t.videoCount > 0).length;

  return (
    <button
      onClick={() => onSelect(section)}
      className="rounded-2xl p-4 text-left transition-all active:scale-[0.97]"
      style={{ background: isLight ? "rgba(0,0,0,0.09)" : BG_CARD, border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}
    >
      {/* Accent dot */}
      <span className="block w-2.5 h-2.5 rounded-full mb-3" style={{ background: dotColor, boxShadow: isLight ? "none" : `0 0 10px ${color}66` }} />
      <p className="text-[14px] font-bold leading-tight mb-1" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{section.category}</p>
      <p className="text-[10px] tracking-wide" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>
        {section.topics.length} topics
      </p>
      <p className="text-[10px] mt-2 font-semibold tracking-wide uppercase" style={{ color: isLight ? (available > 0 ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)") : (available > 0 ? color : "rgba(255,255,255,0.25)") }}>
        {available > 0 ? `${available} available` : "Coming soon"}
      </p>
    </button>
  );
}

// ─── Category bottom sheet (tap a category to see what's available) ────────────

function CategorySheet({
  section,
  onClose,
  onSeeAll,
  onSelectTopic,
  isLight = false,
}: {
  section: FundamentalsSection;
  onClose: () => void;
  onSeeAll: () => void;
  onSelectTopic: (topicId: string) => void;
  isLight?: boolean;
}) {
  const catColor = CATEGORY_COLORS[section.category];
  const color = isLight ? "rgba(0,0,0,0.45)" : catColor;
  const dotColor = isLight ? "rgba(0,0,0,0.30)" : catColor;
  const borderColor = isLight ? "rgba(0,0,0,0.12)" : `${catColor}33`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[400] flex flex-col justify-end">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}
      />

      {/* Panel */}
      <div
        className="relative rounded-t-3xl overflow-hidden"
        style={{
          background: isLight ? "#ffffff" : "#11131c",
          borderTop: `1px solid ${borderColor}`,
          maxHeight: "82vh",
          animation: "sheetUp 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Grabber */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="block w-10 h-1 rounded-full" style={{ background: isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4" style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
          <div className="flex items-center gap-3">
            <span className="block w-3 h-3 rounded-full flex-shrink-0" style={{ background: dotColor, boxShadow: isLight ? "none" : `0 0 12px ${catColor}77` }} />
            <div className="flex-1">
              <p className="text-[9px] font-black tracking-widest uppercase" style={{ color }}>
                Fundamentals of the Faith
              </p>
              <h2 className="text-[19px] font-bold leading-tight" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{section.category}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", color: isLight ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.60)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <p className="text-[11px] mt-2.5" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)" }}>
            Tap any topic to jump into that part of the study
          </p>
        </div>

        {/* Topic list — every topic navigates into the section */}
        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "52vh" }}>
          <div className="flex flex-col gap-2">
            {section.topics.map((topic) => {
              const hasVideos = topic.videoCount > 0;
              return (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className="w-full text-left rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] transition-all"
                  style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.035)", border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold leading-snug" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{topic.title}</p>
                    <p className="text-[10px] mt-0.5 font-semibold tracking-wide uppercase" style={{ color: hasVideos ? color : (isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)") }}>
                      {hasVideos ? `${topic.videoCount} video${topic.videoCount !== 1 ? "s" : ""} · Start watching` : "Coming soon · Browse section"}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className="flex-shrink-0" style={{ opacity: 0.8 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pt-2 pb-5" style={{ borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
          <button
            onClick={onSeeAll}
            className="w-full py-3 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: isLight ? "rgba(0,0,0,0.06)" : AC_BG, color: isLight ? "#0a0a0a" : AC, border: `1px solid ${isLight ? "rgba(0,0,0,0.15)" : AC_BORDER}` }}
          >
            See the full library
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fundamentals Detail View ─────────────────────────────────────────────────

function FundamentalsDetailView({
  section,
  onBack,
  onPlayVideo,
  focusTopicId,
  isLight = false,
}: {
  section: FundamentalsSection;
  onBack: () => void;
  onPlayVideo: (id: string, title: string) => void;
  focusTopicId?: string;
  isLight?: boolean;
}) {
  const catColor = CATEGORY_COLORS[section.category];
  const color = isLight ? "rgba(0,0,0,0.45)" : catColor;
  const dotColor = isLight ? "rgba(0,0,0,0.30)" : catColor;
  const filtered = section.topics;

  useEffect(() => {
    if (!focusTopicId) return;
    const el = document.getElementById(`topic-${focusTopicId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusTopicId]);

  return (
    <div className="min-h-screen" style={{ background: isLight ? "#f9fafb" : BG_ROOT }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: isLight ? "#f9fafb" : BG_ROOT, borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}>
        <BackArrow onClick={onBack} isLight={isLight} />
        <div className="flex items-center gap-3 mt-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isLight ? "rgba(0,0,0,0.06)" : `${catColor}20` }}>
            <span className="block w-3 h-3 rounded-full" style={{ background: dotColor, boxShadow: isLight ? "none" : `0 0 10px ${catColor}66` }} />
          </div>
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase" style={{ color }}>
              Fundamentals of the Faith
            </p>
            <h1 className="text-[18px] font-bold" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{section.category}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24">
        {/* Topics */}
        <div className="flex flex-col gap-2">
          {filtered.map((topic) => {
            const focused = topic.id === focusTopicId;
            const hasVideos = topic.videoCount > 0;
            return (
              <div
                key={topic.id}
                id={`topic-${topic.id}`}
                onClick={() => hasVideos && topic.featuredVideoId && onPlayVideo(topic.featuredVideoId, topic.title)}
                className={`rounded-xl px-4 py-3.5 transition-all ${hasVideos ? "cursor-pointer active:scale-[0.98]" : ""}`}
                style={{
                  background: focused ? (isLight ? "rgba(0,0,0,0.05)" : `${catColor}14`) : (isLight ? "rgba(0,0,0,0.03)" : BG_CARD),
                  border: focused ? `1px solid ${isLight ? "rgba(0,0,0,0.20)" : `${catColor}66`}` : `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}`,
                  boxShadow: focused && !isLight ? `0 0 0 1px ${catColor}33` : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold leading-snug" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{topic.title}</p>
                  {hasVideos ? (
                    <span
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: isLight ? "rgba(0,0,0,0.08)" : `${catColor}18`, color }}
                    >
                      {topic.videoCount} video{topic.videoCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", color: isLight ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.32)" }}>
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Archive & Community List Views ───────────────────────────────────────────

function VideoListView({
  title,
  videos,
  onBack,
  onPlay,
  showSearch = true,
  showChurch = false,
  isLight = false,
}: {
  title: string;
  videos: VideoEntry[];
  onBack: () => void;
  onPlay: (id: string, title: string) => void;
  showSearch?: boolean;
  showChurch?: boolean;
  isLight?: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = videos.filter((v) => matchesVideoSearch(v, q));

  return (
    <div className="min-h-screen" style={{ background: isLight ? "#f9fafb" : BG_ROOT }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: isLight ? "#f9fafb" : BG_ROOT, borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}>
        <BackArrow onClick={onBack} isLight={isLight} />
        <h1 className="text-[18px] font-bold mt-3" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{title}</h1>
        {showSearch && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", border: `1px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)"}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={`flex-1 bg-transparent text-[13px] outline-none ${isLight ? "text-black placeholder-black/30" : "text-white placeholder-white/30"}`}
              placeholder="Search videos…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 pt-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((v) => (
            <div key={v.id} className="rounded-xl overflow-hidden" style={{ background: isLight ? "rgba(0,0,0,0.03)" : BG_CARD, border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}>
              <button
                onClick={() => onPlay(v.id, v.title)}
                className="w-full text-left active:scale-[0.97] transition-all"
              >
                <div className="relative" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ytThumb(v.id, "mq")} alt={v.title} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.22)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                  </div>
                  {v.duration && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.75)", color: "rgba(255,255,255,0.85)" }}>
                      {v.duration}
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-bold mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>{v.speaker}</p>
                  {showChurch && v.church && (
                    <p className="text-[9px] mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>{v.church}</p>
                  )}
                  <p className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: isLight ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.80)" }}>{v.title}</p>
                  {v.datePublished && (
                    <p className="text-[9px] mt-1.5" style={{ color: isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.28)" }}>
                      {new Date(v.datePublished).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-[14px] mt-12" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }}>No videos found.</p>
        )}
      </div>
    </div>
  );
}

// ─── Shorts grid view (vertical 9:16) ──────────────────────────────────────────

function ShortsGridView({
  videos,
  onBack,
  onPlay,
  isLight = false,
}: {
  videos: VideoEntry[];
  onBack: () => void;
  onPlay: (id: string, title: string, isShort: boolean) => void;
  isLight?: boolean;
}) {
  return (
    <div className="min-h-screen" style={{ background: isLight ? "#f9fafb" : BG_ROOT }}>
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: isLight ? "#f9fafb" : BG_ROOT, borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}>
        <BackArrow onClick={onBack} isLight={isLight} />
        <h1 className="text-[18px] font-bold mt-3" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Short Videos</h1>
        <p className="text-[11px] mt-1" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>
          Quick vertical teachings, made for your phone
        </p>
      </div>

      <div className="px-4 pt-4 pb-24">
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => onPlay(v.id, v.title, true)}
                className="rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-all relative"
                style={{ background: isLight ? "rgba(0,0,0,0.05)" : "#0d0d18", border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}
              >
                <div className="relative" style={{ aspectRatio: "9/16" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ytThumb(v.id, "hq")} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,9,15,0.92) 0%, rgba(8,9,15,0.10) 45%, rgba(8,9,15,0.05) 100%)" }} />
                  <span className="absolute top-2 left-2 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded" style={{ background: isLight ? "rgba(0,0,0,0.10)" : "rgba(201,169,97,0.92)", color: isLight ? "#0a0a0a" : "#08090f" }}>SHORT</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[10px] font-bold mb-0.5 truncate" style={{ color: isLight ? "rgba(0,0,0,0.50)" : AC }}>{v.speaker}</p>
                    <p className="text-[12px] font-semibold text-white leading-tight line-clamp-2">{v.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-[14px] mt-12" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }}>No shorts yet — content in progress.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Screen =
  | { id: "home" }
  | { id: "archive" }
  | { id: "short" }
  | { id: "community" }
  | { id: "testimonies" }
  | { id: "fundamentals-home" }
  | { id: "fundamentals-detail"; section: FundamentalsSection; focusTopicId?: string };

export default function VideosPage() {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const isLight =
    (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) === "white-noir" ||
    theme === "white-noir";
  const [screen, setScreen] = useState<Screen>({ id: "home" });
  const [player, setPlayer] = useState<{ videoId: string; title: string; isShort?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sheetSection, setSheetSection] = useState<FundamentalsSection | null>(null);
  const [history, setHistory] = useState<WatchItem[]>([]);
  const [askOpen, setAskOpen] = useState(false);
  const [showSubmitSheet, setShowSubmitSheet] = useState(false);

  useEffect(() => { setHistory(loadWatchHistory()); }, []);

  const go = (s: Screen) => { setScreen(s); window.scrollTo(0, 0); };
  const playVideo = useCallback((videoId: string, title: string, isShort = false, speaker?: string) => {
    setPlayer({ videoId, title, isShort });
    recordWatch({ videoId, title, isShort, speaker, ts: Date.now() });
    setHistory(loadWatchHistory());
  }, []);

  const activeVideoLanguage: VideoLanguage = lang === "es" ? "es" : "en";
  const matchesLanguage = (video: VideoEntry) => (video.language ?? "en") === activeVideoLanguage;
  const currentFeatured = CURRENT_FEATURED && matchesLanguage(CURRENT_FEATURED) ? CURRENT_FEATURED : null;
  const archiveVideos = ARCHIVE_VIDEOS.filter(matchesLanguage);
  const shortVideos = SHORT_VIDEOS.filter(matchesLanguage);
  const communityVideos = COMMUNITY_VIDEOS.filter(matchesLanguage);
  const testimoniesVideos = TESTIMONIES_VIDEOS.filter(matchesLanguage);
  const allShorts = uniqueVideos([...shortVideos, ...testimoniesVideos.filter((v) => v.isShort)]);
  const visibleVideoIds = new Set(
    uniqueVideos([
      ...(currentFeatured ? [currentFeatured] : []),
      ...archiveVideos,
      ...shortVideos,
      ...communityVideos,
      ...testimoniesVideos,
    ]).map((video) => video.id)
  );
  const visibleHistory = history.filter((item) => visibleVideoIds.has(item.videoId));

  // Filtered home results
  const allVideos = uniqueVideos([...(currentFeatured ? [currentFeatured] : []), ...archiveVideos, ...shortVideos, ...communityVideos, ...testimoniesVideos]);
  const hasFundamentalsVideos = FUNDAMENTALS.some((section) => section.topics.some((topic) => topic.videoCount > 0));
  const searchResults = searchQuery
    ? allVideos.filter((v) => matchesVideoSearch(v, searchQuery))
    : [];

  // ── Sub-screen renders ────────────────────────────────────────────────────────

  if (screen.id === "archive") {
    return (
      <>
        {player && <VideoPlayerModal videoId={player.videoId} title={player.title} vertical={player.isShort} onClose={() => setPlayer(null)} />}
        <VideoListView
          title="Featured Video Archive"
          videos={archiveVideos}
          onBack={() => go({ id: "home" })}
          onPlay={playVideo}
          showChurch
          isLight={isLight}
        />
      </>
    );
  }

  if (screen.id === "short") {
    return (
      <>
        {player && <VideoPlayerModal videoId={player.videoId} title={player.title} vertical={player.isShort} onClose={() => setPlayer(null)} />}
        <ShortsGridView
          videos={allShorts}
          onBack={() => go({ id: "home" })}
          onPlay={playVideo}
          isLight={isLight}
        />
      </>
    );
  }

  if (screen.id === "community") {
    return (
      <>
        {player && <VideoPlayerModal videoId={player.videoId} title={player.title} vertical={player.isShort} onClose={() => setPlayer(null)} />}
        <VideoListView
          title="Community Videos"
          videos={communityVideos}
          onBack={() => go({ id: "home" })}
          onPlay={playVideo}
          showChurch
          isLight={isLight}
        />
      </>
    );
  }

  if (screen.id === "testimonies") {
    return (
      <>
        {player && <VideoPlayerModal videoId={player.videoId} title={player.title} vertical={player.isShort} onClose={() => setPlayer(null)} />}
        <VideoListView
          title="Testimonies"
          videos={testimoniesVideos}
          onBack={() => go({ id: "home" })}
          onPlay={playVideo}
          showChurch
          isLight={isLight}
        />
      </>
    );
  }

  if (screen.id === "fundamentals-home") {
    return (
      <>
        {player && <VideoPlayerModal videoId={player.videoId} title={player.title} vertical={player.isShort} onClose={() => setPlayer(null)} />}
        <FundamentalsHomeView
          onBack={() => go({ id: "home" })}
          onSelectCategory={(s) => go({ id: "fundamentals-detail", section: s })}
          onPlay={playVideo}
          isLight={isLight}
        />
      </>
    );
  }

  if (screen.id === "fundamentals-detail") {
    return (
      <>
        {player && <VideoPlayerModal videoId={player.videoId} title={player.title} vertical={player.isShort} onClose={() => setPlayer(null)} />}
        <FundamentalsDetailView
          section={screen.section}
          focusTopicId={screen.focusTopicId}
          onBack={() => go({ id: "fundamentals-home" })}
          onPlayVideo={playVideo}
          isLight={isLight}
        />
      </>
    );
  }

  // ── HOME SCREEN ───────────────────────────────────────────────────────────────

  return (
    <>
      {player && <VideoPlayerModal videoId={player.videoId} title={player.title} onClose={() => setPlayer(null)} />}
      {askOpen && <QuestionFormModal onClose={() => setAskOpen(false)} isLight={isLight} />}
      {sheetSection && (
        <CategorySheet
          section={sheetSection}
          onClose={() => setSheetSection(null)}
          onSeeAll={() => { setSheetSection(null); go({ id: "fundamentals-home" }); }}
          onSelectTopic={(topicId) => {
            const s = sheetSection;
            setSheetSection(null);
            go({ id: "fundamentals-detail", section: s, focusTopicId: topicId });
          }}
          isLight={isLight}
        />
      )}

      <div className="min-h-screen pb-24" style={{ background: isLight ? "#f9fafb" : BG_ROOT, color: isLight ? "#0a0a0a" : "#ffffff" }}>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-4 pt-5 pb-3"
          style={{ background: isLight ? "#f9fafb" : BG_ROOT, borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}
        >
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: isLight ? "rgba(0,0,0,0.40)" : AC }}>
              Tulip Bible App
            </p>
            <h1 className="text-[22px] font-bold leading-none" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{t("videos_heading")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubmitSheet(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-[0.97]"
              style={{ background: isLight ? "rgba(0,0,0,0.06)" : AC_BG, color: isLight ? "#0a0a0a" : AC, border: `1px solid ${isLight ? "rgba(0,0,0,0.15)" : AC_BORDER}` }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {lang === "es" ? "Enviar" : "Submit"}
            </button>
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(""); }}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
              style={{ background: showSearch ? (isLight ? "rgba(0,0,0,0.06)" : AC_BG) : (isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)"), border: showSearch ? `1px solid ${isLight ? "rgba(0,0,0,0.15)" : AC_BORDER}` : "1px solid transparent" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showSearch ? (isLight ? "#0a0a0a" : AC) : (isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)")} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Search bar ──────────────────────────────────────────────────────── */}
        {showSearch && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)", border: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                autoFocus
                className={`flex-1 bg-transparent text-[14px] outline-none ${isLight ? "text-black placeholder-black/30" : "text-white placeholder-white/30"}`}
                placeholder={t("videos_search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={isLight ? "text-black/30 hover:text-black/60" : "text-white/30 hover:text-white/60"} aria-label="Clear search">
                  <UiIcon name="close" size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Search results ───────────────────────────────────────────────────── */}
        {searchQuery && (
          <div className="px-4 pb-6">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }}>
              {searchResults.length} {lang === "es" ? (searchResults.length === 1 ? "resultado" : "resultados") : `result${searchResults.length !== 1 ? "s" : ""}`}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((v) => (
                <VideoCard key={v.id} video={v} onClick={() => playVideo(v.id, v.title, v.isShort, v.speaker)} showChurch isLight={isLight} />
              ))}
            </div>
            {searchResults.length === 0 && (
              <p className="text-center text-[14px] mt-8" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)" }}>{lang === "es" ? "Sin resultados para" : "No results for"} &ldquo;{searchQuery}&rdquo;</p>
            )}
          </div>
        )}

        {!searchQuery && (
          <>
            <VideoLibraryHero
              lang={lang}
              isLight={isLight}
              featured={currentFeatured}
              activeLanguage={activeVideoLanguage}
              onExplore={() => currentFeatured ? go({ id: "archive" }) : go({ id: "testimonies" })}
              onAsk={() => setAskOpen(true)}
              onWatch={(video) => playVideo(video.id, video.title, video.isShort, video.speaker)}
            />

            <section className="mb-7 px-4">
              <div className="grid grid-cols-2 gap-3">
                {archiveVideos.length > 0 && (
                  <VideoHubTile
                    icon="videos"
                    title={lang === "es" ? "Enseñanza" : "Teaching"}
                    subtitle={lang === "es" ? "Biblioteca curada" : "Curated library"}
                    onClick={() => go({ id: "archive" })}
                    isLight={isLight}
                  />
                )}
                {testimoniesVideos.length > 0 && (
                  <VideoHubTile
                    icon="worship"
                    title={lang === "es" ? "Testimonios" : "Testimonies"}
                    subtitle={lang === "es" ? "Historias de gracia" : "Stories of grace"}
                    onClick={() => go({ id: "testimonies" })}
                    isLight={isLight}
                  />
                )}
                {hasFundamentalsVideos && (
                  <VideoHubTile
                    icon="study-tools"
                    title={lang === "es" ? "Fundamentos" : "Foundations"}
                    subtitle={lang === "es" ? "Temas doctrinales" : "Doctrine topics"}
                    onClick={() => go({ id: "fundamentals-home" })}
                    isLight={isLight}
                  />
                )}
                {allShorts.length > 0 && (
                  <VideoHubTile
                    icon="library"
                    title={lang === "es" ? "Cortos" : "Shorts"}
                    subtitle={lang === "es" ? "Respuestas breves" : "Quick answers"}
                    onClick={() => go({ id: "short" })}
                    isLight={isLight}
                  />
                )}
              </div>
            </section>

            {!allVideos.length && (
              <section className="mb-7 px-4">
                <EmptyVideoShelf
                  title={lang === "es" ? "Biblioteca en preparación." : "The video library is being curated."}
                  body={lang === "es"
                    ? "Aun no hay videos aprobados para este idioma. Puedes enviar contenido para revision o hacer una pregunta para futuros videos."
                    : "Approved videos will appear here by language, category, and topic. Submit trusted teaching or ask a question for future short answers."}
                  action={lang === "es" ? "Enviar video" : "Submit video"}
                  onAction={() => setShowSubmitSheet(true)}
                  isLight={isLight}
                />
              </section>
            )}

            {/* ── Recently watched (only when there's history) ─────────────── */}
            {visibleHistory.length > 0 && (
              <section className="mb-8">
                <SectionHeader label={lang === "es" ? "Historial local" : "Local history"} title={lang === "es" ? "Vistos recientemente" : "Recently Watched"} color={AC} isLight={isLight} />
                <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
                  {visibleHistory.map((item) => (
                    <ContinueCard
                      key={item.videoId}
                      item={item}
                      onClick={() => playVideo(item.videoId, item.title, item.isShort, item.speaker)}
                      onRemove={() => {
                        removeFromHistory(item.videoId);
                        setHistory(loadWatchHistory());
                      }}
                      isLight={isLight}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Short Videos (vertical 9:16) ─────────────────────────────── */}
            {allShorts.length > 0 && (
              <section className="mb-7">
                <SectionHeader
                  label={lang === "es" ? "Enseñanzas breves · Hechas para tu teléfono" : "Quick Teachings · Made for your phone"}
                  title={lang === "es" ? "Videos Cortos" : "Short Videos"}
                  onViewAll={() => go({ id: "short" })}
                  color={AC}
                  isLight={isLight}
                />
                <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
                  {allShorts.map((v) => (
                    <ShortCard key={v.id} video={v} onClick={() => playVideo(v.id, v.title, true, v.speaker)} isLight={isLight} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Featured Videos (landscape grid, 231-style) ────────────────── */}
            {archiveVideos.length > 0 && (
              <section className="mb-8 px-4">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.20em] uppercase" style={{ color: isLight ? "rgba(0,0,0,0.38)" : AC }}>
                      {lang === "es" ? "Biblioteca" : "Library"}
                    </p>
                    <h3 className="text-[19px] font-black tracking-[-0.03em]" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>
                      {lang === "es" ? "Ensenanza destacada" : "Featured Teaching"}
                    </h3>
                  </div>
                  <button onClick={() => go({ id: "archive" })} className="text-[12px] font-bold" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(201,169,97,0.75)" }}>
                    {lang === "es" ? "Ver todo" : "View all"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {archiveVideos.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => playVideo(v.id, v.title, v.isShort, v.speaker)}
                      className="text-left active:scale-[0.97] transition-all"
                    >
                      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", background: isLight ? "rgba(0,0,0,0.03)" : BG_CARD, border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ytThumb(v.id, "mq")} alt={v.title} className="w-full h-full object-cover" />
                        {v.isFeatured && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded" style={{ background: isLight ? "rgba(0,0,0,0.10)" : AC, color: isLight ? "#0a0a0a" : "#08090f" }}>NEW</span>
                        )}
                      </div>
                      <p className="text-[12px] font-semibold leading-tight line-clamp-2 mt-2" style={{ color: isLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)" }}>{v.title}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ── Browse by Topic ───────────────────────────────────────────── */}
            {hasFundamentalsVideos && (
              <section className="mb-8">
                <div className="px-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px flex-1" style={{ background: isLight ? "linear-gradient(to right, transparent, rgba(0,0,0,0.15))" : "linear-gradient(to right, transparent, rgba(201,169,97,0.35))" }} />
                    <p className="text-[9px] font-black tracking-[0.22em] uppercase" style={{ color: isLight ? "rgba(0,0,0,0.40)" : AC }}>
                      {lang === "es" ? "Fundamentos de la fe" : "Fundamentals of the Faith"}
                    </p>
                    <span className="h-px flex-1" style={{ background: isLight ? "linear-gradient(to left, transparent, rgba(0,0,0,0.15))" : "linear-gradient(to left, transparent, rgba(201,169,97,0.35))" }} />
                  </div>
                  <h3 className="text-[18px] font-bold text-center" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{lang === "es" ? "Explorar por tema" : "Browse by Topic"}</h3>
                </div>
                <div className="px-4 grid grid-cols-2 gap-3">
                  {FUNDAMENTALS.map((section) => (
                    <TopicCategoryCard
                      key={section.category}
                      section={section}
                      onSelect={(s) => setSheetSection(s)}
                      isLight={isLight}
                    />
                  ))}
                </div>
                <div className="px-4 mt-3">
                  <button
                    onClick={() => go({ id: "fundamentals-home" })}
                    className="w-full py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all active:scale-[0.98]"
                    style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)", border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}` }}
                  >
                    {lang === "es" ? "Ver biblioteca completa" : "See the full library"}
                  </button>
                </div>
              </section>
            )}

            {/* ── Community Videos (only when content exists) ────────────────── */}
            {communityVideos.length > 0 && (
              <section className="mb-7">
                <SectionHeader
                  label="Approved Submissions"
                  title="Community Videos"
                  onViewAll={() => go({ id: "community" })}
                  color="#10b981"
                  isLight={isLight}
                />
                <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
                  {communityVideos.map((v) => (
                    <VideoCard key={v.id} video={v} size="md" onClick={() => playVideo(v.id, v.title, v.isShort, v.speaker)} showChurch isLight={isLight} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Testimonies (only when content exists) ────────────────────── */}
            {testimoniesVideos.length > 0 && (
              <section className="mb-7">
                <SectionHeader
                  label="Stories of Grace"
                  title="Testimonies"
                  onViewAll={() => go({ id: "testimonies" })}
                  color="#c9a961"
                  isLight={isLight}
                />
                <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
                  {testimoniesVideos.map((v) => (
                    <VideoCard key={v.id} video={v} size="md" onClick={() => playVideo(v.id, v.title, v.isShort, v.speaker)} showChurch isLight={isLight} />
                  ))}
                </div>
              </section>
            )}

          </>
        )}

        {/* ── Submit Info Sheet ──────────────────────────────────────────────── */}
        {showSubmitSheet && (
          <div className="fixed inset-0 z-[450] flex flex-col justify-end">
            <button
              aria-label="Close"
              onClick={() => setShowSubmitSheet(false)}
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}
            />
            <div
              className="relative rounded-t-3xl overflow-hidden"
              style={{ background: isLight ? "#ffffff" : "#11131c", borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : AC_BORDER}`, maxHeight: "85vh" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <span className="block w-10 h-1 rounded-full" style={{ background: isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)" }} />
              </div>

              <div className="px-6 pt-4 pb-10 overflow-y-auto">
                {/* Submit a Video */}
                <p className="text-[9px] font-black uppercase tracking-[0.20em] mb-1" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>{lang === "es" ? "Enviar un Video" : "Submit a Video"}</p>
                <h2 className="text-[20px] font-bold mb-2" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{lang === "es" ? "Comparte Enseñanza Bíblica" : "Share Biblical Teaching"}</h2>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }}>
                  {lang === "es"
                    ? "¿Eres pastor o maestro? Envía un video para revisión y publicación en el canal oficial de YouTube de Tulip Bible App — compartiendo sana doctrina con creyentes en todo el mundo."
                    : "Are you a pastor or teacher? Submit a video to be reviewed and published through the official Tulip Bible App YouTube channel — sharing sound doctrine with believers worldwide."}
                </p>
                <Link
                  href="/videos/submit"
                  onClick={() => setShowSubmitSheet(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-extrabold mb-6 transition-all active:scale-[0.98]"
                  style={{ background: isLight ? "#0a0a0a" : `linear-gradient(135deg, #d9b970, #c9a961)`, color: isLight ? "#ffffff" : "#08090f" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  {lang === "es" ? "Ir al Formulario" : "Go to Submit Form"}
                </Link>

                {/* Divider */}
                <div className="mb-6" style={{ height: "1px", background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)" }} />

                {/* Video Philosophy */}
                <p className="text-[9px] font-black uppercase tracking-[0.20em] mb-1" style={{ color: isLight ? "rgba(0,0,0,0.45)" : AC }}>{lang === "es" ? "Nuestra Filosofía de Video" : "Our Video Philosophy"}</p>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)", fontFamily: SERIF }}>
                  {lang === "es"
                    ? "Todos los videos aprobados se publican en el canal oficial de YouTube de Tulip Bible App y se integran aquí — manteniendo la experiencia nativa de la app con responsabilidad doctrinal."
                    : "All approved videos are published through the official Tulip Bible App YouTube channel and embedded here — keeping the experience native to the app while maintaining doctrinal accountability."}
                </p>
                <a
                  href="https://www.youtube.com/@TulipBibleApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[12px] font-bold"
                  style={{ color: isLight ? "#0a0a0a" : AC }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                  Visit our YouTube channel
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Fundamentals Home View ────────────────────────────────────────────────────

function FundamentalsHomeView({
  onBack,
  onSelectCategory,
  onPlay,
  isLight = false,
}: {
  onBack: () => void;
  onSelectCategory: (s: FundamentalsSection) => void;
  onPlay: (id: string, title: string) => void;
  isLight?: boolean;
}) {
  const totalTopics = FUNDAMENTALS.reduce((a, s) => a + s.topics.length, 0);

  return (
    <div className="min-h-screen pb-24" style={{ background: isLight ? "#f9fafb" : BG_ROOT }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: isLight ? "#f9fafb" : BG_ROOT, borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}>
        <BackArrow onClick={onBack} isLight={isLight} />
        <div className="mt-3">
          <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: isLight ? "rgba(0,0,0,0.40)" : AC }}>Educational Library</p>
          <h1 className="text-[20px] font-bold" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Fundamentals of the Faith</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Categories", value: FUNDAMENTALS.length.toString() },
            { label: "Topics", value: totalTopics.toString() },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: isLight ? "rgba(0,0,0,0.03)" : BG_CARD, border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}` }}>
              <p className="text-[20px] font-bold" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{s.value}</p>
              <p className="text-[9px] font-bold tracking-wider uppercase mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category sections */}
        {FUNDAMENTALS.map((section) => {
          const catColor = CATEGORY_COLORS[section.category];
          const dotColor = isLight ? "rgba(0,0,0,0.30)" : catColor;

          return (
            <div key={section.category} className="mb-4">
              <button
                onClick={() => onSelectCategory(section)}
                className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                style={{
                  background: isLight ? "rgba(0,0,0,0.03)" : `linear-gradient(135deg, ${catColor}12, ${catColor}04)`,
                  border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : `${catColor}22`}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: isLight ? "rgba(0,0,0,0.06)" : `${catColor}20` }}>
                      <span className="block w-2.5 h-2.5 rounded-full" style={{ background: dotColor, boxShadow: isLight ? "none" : `0 0 8px ${catColor}66` }} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{section.category}</p>
                      <p className="text-[10px]" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
                        {section.topics.length} topics
                      </p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)"} strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {section.topics.slice(0, 4).map((t) => (
                    <span key={t.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
                      {t.title}
                    </span>
                  ))}
                  {section.topics.length > 4 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)" }}>
                      +{section.topics.length - 4} more
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}

        {/* Submit CTA */}
        <div
          className="rounded-2xl p-5 mt-2"
          style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(201,169,97,0.06)", border: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : AC_BORDER}` }}
        >
          <p className="text-[13px] font-bold mb-1" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Help Build the Library</p>
          <p className="text-[12px] mb-3" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
            Are you a pastor, teacher, or ministry? Submit a video for any of these topics for review.
          </p>
          <Link
            href="/videos/submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98]"
            style={{ background: isLight ? "#0a0a0a" : AC, color: isLight ? "#ffffff" : "#08090f" }}
          >
            Submit a Video →
          </Link>
        </div>
      </div>
    </div>
  );
}
