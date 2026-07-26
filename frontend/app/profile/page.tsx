"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCloudUser, signOut } from "../lib/cloudSync";
import { createClient } from "../lib/supabase/client";
import { useTheme } from "../lib/useTheme";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import { BADGE_DEFINITIONS } from "../lib/badges";
import { collectUnifiedHighlights } from "../lib/unifiedHighlights";
import { UiIcon, type UiIconName } from "../components/UiIcon";
import type { User } from "@supabase/supabase-js";
import type { EarnedBadge } from "../lib/badges";

// ─── Design constants (matches app-wide system) ────────────────────────────────
const AC         = "#c9a961";
const AC_BG      = "rgba(201,169,97,0.14)";
const AC_BORDER  = "rgba(201,169,97,0.35)";
const BG_ROOT     = "#08090f";
const BG_CARD     = "rgba(255,255,255,0.033)";
const BD_CARD     = "rgba(255,255,255,0.08)";

// ─── Book num → name lookup ───────────────────────────────────────────────────
const BOOK_MAP: Record<number, string> = {};
for (const b of BIBLE_BOOKS) BOOK_MAP[b.num] = b.name;

// ─── Data types ───────────────────────────────────────────────────────────────
interface SyncRow { storage_key: string; value: string; updated_at: string; }

type ActivityType = "highlight" | "note" | "bookmark" | "church" | "badge";
interface ActivityItem {
  type: ActivityType;
  label: string;       // "You highlighted Genesis 1"
  sub?: string;        // verse ref, church name, etc.
  color?: string;      // highlight dot color
  updated_at: string;
  // Navigation target for highlights/notes
  navBook?: string;    // book name for lexicon URL
  navChapter?: number;
  navVerses?: number[];
  navHref?: string;
  sourceLabel?: string;
  badgeImage?: string; // /badges/xxx.png for badge items
}

// ─── Parse all activity from sync rows ───────────────────────────────────────
function buildActivity(rows: SyncRow[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const highlight of collectUnifiedHighlights(rows)) {
    items.push({
      type: "highlight",
      label: highlight.title,
      sub: `${highlight.sourceLabel}${highlight.text ? ` · "${highlight.text.slice(0, 140)}${highlight.text.length > 140 ? "..." : ""}"` : ""}`,
      color: highlight.color,
      updated_at: new Date(highlight.createdAt).toISOString(),
      navHref: highlight.openHref,
      sourceLabel: highlight.sourceLabel,
    });
  }

  for (const row of rows) {
    // ── Highlights: ryc-vcolor-{bookNum}-{chapter} ──
    if (row.storage_key.startsWith("ryc-vcolor-")) {
      continue;
    }

    // ── Chapter notes: ryc-chapter-note-{bookNum}-{chapter} ──
    else if (row.storage_key.startsWith("ryc-chapter-note-")) {
      if (!row.value || row.value.trim().length <= 2) continue;
      const parts = row.storage_key.split("-");
      const bookNum = parseInt(parts[3]);
      const chapter = parseInt(parts[4]);
      const bookName = BOOK_MAP[bookNum] ?? `Book ${bookNum}`;
      items.push({
        type: "note",
        label: `You added a note to ${bookName} ${chapter}`,
        sub: row.value.trim().slice(0, 80),
        updated_at: row.updated_at,
      });
    }

    // ── Bookmarks: ryc-bookmarks ──
    else if (row.storage_key === "ryc-bookmarks") {
      try {
        const arr = JSON.parse(row.value) as Array<{
          reference?: string; book?: string; chapter?: number;
          verse?: number; label?: string; createdAt?: string;
        }>;
        for (const bm of arr) {
          items.push({
            type: "bookmark",
            label: `You bookmarked ${bm.reference ?? `${bm.book ?? ""} ${bm.chapter ?? ""}:${bm.verse ?? ""}`}`,
            sub: bm.label,
            updated_at: bm.createdAt ?? row.updated_at,
          });
        }
      } catch { /* skip */ }
    }

    // ── Church analyses: tulip-church-analyses ──
    else if (row.storage_key === "tulip-church-analyses") {
      try {
        const arr = JSON.parse(row.value) as Array<{
          churchName?: string; pastor?: string; date?: string; createdAt?: string;
        }>;
        for (const a of arr) {
          items.push({
            type: "church",
            label: `You analyzed ${a.churchName ?? "a church"}`,
            sub: a.pastor ? `Pastor ${a.pastor}` : a.date ?? undefined,
            updated_at: a.createdAt ?? row.updated_at,
          });
        }
      } catch { /* skip */ }
    }

    // ── Badges: tulip_badges_earned_v1 ──
    else if (row.storage_key === "tulip_badges_earned_v1") {
      try {
        const arr = JSON.parse(row.value) as EarnedBadge[];
        for (const b of arr) {
          const def = BADGE_DEFINITIONS.find((d) => d.id === b.id);
          if (!def) continue;
          items.push({
            type: "badge",
            label: `You earned "${def.name}"`,
            sub: def.reason,
            updated_at: b.earnedAt,
            badgeImage: def.image,
          });
        }
      } catch { /* skip */ }
    }
  }

  // Sort newest first
  return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

// ─── Relative time helper ─────────────────────────────────────────────────────
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

// ─── Stat helpers ─────────────────────────────────────────────────────────────
function countStats(rows: SyncRow[]) {
  let highlights = 0, notes = 0, bookmarks = 0, churches = 0, badges = 0;
  highlights = collectUnifiedHighlights(rows).length;
  for (const r of rows) {
    if (r.storage_key.startsWith("ryc-vcolor-")) {
      continue;
    } else if (r.storage_key.startsWith("ryc-chapter-note-")) {
      if (r.value?.trim().length > 2) notes++;
    } else if (r.storage_key === "ryc-bookmarks") {
      try { bookmarks = (JSON.parse(r.value) as unknown[]).length; } catch { /**/ }
    } else if (r.storage_key === "tulip-church-analyses") {
      try { churches = (JSON.parse(r.value) as unknown[]).length; } catch { /**/ }
    } else if (r.storage_key === "tulip_badges_earned_v1") {
      try { badges = (JSON.parse(r.value) as unknown[]).length; } catch { /**/ }
    }
  }
  return { highlights, notes, bookmarks, churches, badges };
}

// ─── Type filter tabs ─────────────────────────────────────────────────────────
type Filter = "all" | "highlight" | "note" | "bookmark" | "church" | "badge";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "highlight", label: "Highlights" },
  { key: "note", label: "Notes" },
  { key: "bookmark", label: "Bookmarks" },
  { key: "church", label: "Church" },
  { key: "badge", label: "Badges" },
];

// ─── Activity Card ────────────────────────────────────────────────────────────
const TYPE_ICON: Record<ActivityType, UiIconName> = {
  highlight: "sparkle", note: "note", bookmark: "book", church: "church", badge: "shield",
};

function ActivityCard({ item, isLight = false }: { item: ActivityItem; isLight?: boolean }) {
  const router = useRouter();

  function handleCardClick() {
    if (item.navHref) {
      router.push(item.navHref);
      return;
    }
    if (item.navBook && item.navChapter) {
      const params = new URLSearchParams({ book: item.navBook, chapter: String(item.navChapter) });
      if (item.navVerses && item.navVerses.length > 0) {
        params.set("select", item.navVerses.join(","));
      }
      router.push(`/lexicon?${params.toString()}`);
    }
  }

  const isNavigable = !!(item.navHref || (item.navBook && item.navChapter));

  return (
    <div
      className="rounded-2xl p-4 mb-3 transition-all active:scale-[0.99]"
      style={{
        background: isLight ? "rgba(0,0,0,0.025)" : BG_CARD,
        border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : BD_CARD}`,
        cursor: isNavigable ? "pointer" : "default",
      }}
      onClick={isNavigable ? handleCardClick : undefined}
    >
      <div className="flex items-start gap-3">
        {item.type === "badge" && item.badgeImage ? (
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Image
              src={item.badgeImage}
              alt={item.label}
              width={40}
              height={40}
              className="w-10 h-10 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
            />
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{ background: isLight ? "rgba(0,0,0,0.06)" : AC_BG, color: isLight ? "#0a0a0a" : AC }}
          >
            <UiIcon name={TYPE_ICON[item.type]} size={17} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{item.label}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {item.color && (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              )}
              <p className="text-[11px]" style={{ color: isLight ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.30)" }}>{relTime(item.updated_at)}</p>
            </div>
          </div>
          {item.sub && (
            <div
              className="mt-2 pl-3 border-l-2"
              style={{ borderColor: item.type === "highlight" ? (item.color ?? AC) : (isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)") }}
            >
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: isLight ? "rgba(0,0,0,0.52)" : "rgba(255,255,255,0.50)" }}>{item.sub}</p>
            </div>
          )}
          {item.sourceLabel && (
            <p className="text-[10px] uppercase tracking-[0.14em] mt-2" style={{ color: isLight ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.30)" }}>{item.sourceLabel}</p>
          )}
          {isNavigable && (
            <p className="text-[10px] mt-2 font-bold" style={{ color: isLight ? "#0a0a0a" : AC }}>Tap to read →</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cloudinary avatar upload ─────────────────────────────────────────────────
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

async function uploadAvatarToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "avatars");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json() as { secure_url: string };
  return json.secure_url;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight =
    (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) === "white-noir" ||
    theme === "white-noir";

  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const u = await getCloudUser();
      if (!u) { router.replace("/auth/login"); return; }
      setUser(u);
      // Load saved avatar URL from user metadata
      const saved = (u.user_metadata?.avatar_url as string | undefined) ?? null;
      setAvatarUrl(saved);
      const supabase = createClient();
      const { data } = await supabase
        .from("user_sync_data")
        .select("storage_key, value, updated_at")
        .eq("user_id", u.id);

      // Merge localStorage on top of cloud data so fresh highlights appear instantly
      // without waiting for the next cloud push.
      const cloudMap = new Map<string, SyncRow>(
        ((data as SyncRow[]) ?? []).map((r) => [r.storage_key, r])
      );
      const now = new Date().toISOString();
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (
            key.startsWith("ryc-vcolor-") ||
            key.startsWith("ryc-chapter-note-") ||
            key === "ryc-bookmarks" ||
            key.startsWith("axiom-hl-bible-") ||
            key.startsWith("tulip-reader-highlights:") ||
            key === "tulip-matthew-henry-highlights" ||
            key === "tulip-unified-highlights-v1" ||
            key === "tulip-church-analyses" ||
            key === "tulip_badges_earned_v1"
          ) {
            const val = localStorage.getItem(key);
            if (val !== null) {
              // Local wins (more recent than cloud snapshot)
              cloudMap.set(key, { storage_key: key, value: val, updated_at: now });
            }
          }
        }
      } catch { /* localStorage not available */ }

      setRows(Array.from(cloudMap.values()));
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatarToCloudinary(file);
      // Save URL to Supabase user metadata
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setAvatarUrl(url);
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isLight ? "#f9fafb" : BG_ROOT }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)", borderTopColor: AC }} />
      </div>
    );
  }

  const stats = countStats(rows);
  const allActivity = buildActivity(rows);
  const filteredByType = filter === "all" ? allActivity : allActivity.filter((i) => i.type === filter);
  const searchNeedle = activitySearch.trim().toLowerCase();
  const filtered = searchNeedle
    ? filteredByType.filter((item) =>
        [item.label, item.sub, item.sourceLabel]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchNeedle)
      )
    : filteredByType;

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.toUpperCase() ?? "";
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const initials = fullName ? nameParts.map((n) => n[0]).join("").slice(0, 2) : (user?.email?.[0] ?? "?").toUpperCase();

  const streakRaw = typeof window !== "undefined" ? localStorage.getItem("ryc-streak") : null;
  let streak = 0;
  try { if (streakRaw) streak = (JSON.parse(streakRaw) as { current?: number }).current ?? 0; } catch { /**/ }

  const STAT_TILES: { label: string; value: number; filter: Filter; icon: UiIconName }[] = [
    { label: "Verses", value: stats.highlights, filter: "highlight", icon: TYPE_ICON.highlight },
    { label: "Notes", value: stats.notes, filter: "note", icon: TYPE_ICON.note },
    { label: "Saved", value: stats.bookmarks, filter: "bookmark", icon: TYPE_ICON.bookmark },
    { label: "Church", value: stats.churches, filter: "church", icon: TYPE_ICON.church },
    { label: "Badges", value: stats.badges, filter: "badge", icon: TYPE_ICON.badge },
  ];

  return (
    <div className="min-h-screen" style={{ background: isLight ? "#f9fafb" : BG_ROOT }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div
        className="motion-page-enter sticky top-0 z-20 flex items-center justify-between px-5 py-4"
        style={{
          background: isLight ? "rgba(249,250,251,0.92)" : "rgba(8,9,15,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)"}`,
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)" }}
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke={isLight ? "#0a0a0a" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}>
          Profile
        </p>
        <button
          onClick={handleSignOut}
          className="rounded-full px-3 py-1.5 text-[11px] font-black transition-all active:scale-[0.96]"
          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.28)" }}
        >
          Sign Out
        </button>
      </div>

      <main className="max-w-lg mx-auto px-5 pb-28">

        {/* ── Hero: premium gold-glass card with avatar + name ────────────────── */}
        <section className="pt-5 pb-6">
          <div
            className="video-premium-hero motion-nav-enter relative overflow-hidden rounded-[28px] p-5"
            style={{
              background: isLight
                ? "linear-gradient(112deg, #ffffff 0%, #f2f3f4 60%, #e8eaec 100%)"
                : "radial-gradient(circle at 88% 8%, rgba(201,169,97,0.28), transparent 42%), linear-gradient(135deg, #101420 0%, #08090f 100%)",
              border: `1px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)"}`,
              boxShadow: isLight ? "0 22px 50px rgba(15,23,42,0.12)" : "0 24px 60px rgba(0,0,0,0.40)",
            }}
          >
            <div className="video-premium-sweep" />
            <div className="video-premium-orb" />

            <div className="relative z-10 flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                {fullName ? (
                  <>
                    <h1 className="text-4xl font-black leading-none tracking-tight truncate" style={{ color: isLight ? "#050505" : "#ffffff" }}>{firstName}</h1>
                    {lastName && <h1 className="text-4xl font-black leading-none tracking-tight truncate" style={{ color: isLight ? "#050505" : "#ffffff" }}>{lastName}</h1>}
                  </>
                ) : (
                  <h1 className="text-2xl font-black leading-none truncate" style={{ color: isLight ? "#050505" : "#ffffff" }}>{user?.email}</h1>
                )}
                <p className="text-xs mt-2 truncate" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.40)" }}>{user?.email}</p>
              </div>

              {/* Tappable avatar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-20 h-20 rounded-full flex-shrink-0 overflow-hidden transition-transform active:scale-95"
                style={{
                  border: `2px solid ${isLight ? "rgba(0,0,0,0.14)" : AC_BORDER}`,
                  boxShadow: isLight ? "0 10px 24px rgba(15,23,42,0.14)" : `0 0 0 1px rgba(201,169,97,0.15), 0 10px 28px rgba(201,169,97,0.22)`,
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl font-black"
                    style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.18)", color: isLight ? "#0a0a0a" : AC }}
                  >
                    {initials}
                  </div>
                )}
                {/* Camera overlay on upload */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity"
                  style={{ background: "rgba(0,0,0,0.45)", opacity: uploading ? 1 : 0 }}
                >
                  {uploading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 animate-spin" style={{ borderTopColor: "white" }} />
                  ) : null}
                </div>
                {/* Camera badge */}
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: AC }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#1a0e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="#1a0e2e" strokeWidth="2"/>
                  </svg>
                </div>
              </button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </section>

        {/* ── Quick-action stat tiles ──────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {STAT_TILES.map((s) => (
            <button
              key={s.label}
              onClick={() => setFilter(f => f === s.filter ? "all" : s.filter)}
              className="rounded-2xl flex flex-col items-center justify-center py-3.5 gap-1.5 transition-all active:scale-[0.96]"
              style={{
                background: filter === s.filter ? AC_BG : (isLight ? "rgba(0,0,0,0.03)" : BG_CARD),
                border: filter === s.filter ? `1px solid ${AC_BORDER}` : `1px solid ${isLight ? "rgba(0,0,0,0.07)" : BD_CARD}`,
                boxShadow: filter === s.filter ? "0 6px 16px rgba(201,169,97,0.18)" : "none",
              }}
            >
              <span style={{ color: filter === s.filter ? AC : (isLight ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.38)") }}>
                <UiIcon name={s.icon} size={15} />
              </span>
              <p className="text-base font-black leading-none" style={{ color: filter === s.filter ? AC : (isLight ? "#0a0a0a" : "white") }}>{s.value}</p>
              <p className="text-[9.5px] font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.38)" }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* ── Streak card ──────────────────────────────────────────────────── */}
        {streak > 0 && (
          <div
            className="rounded-2xl flex items-center justify-between px-5 py-4 mb-3 relative overflow-hidden"
            style={{
              background: isLight
                ? "linear-gradient(112deg, #fff9ee 0%, #fdf3dd 100%)"
                : "linear-gradient(112deg, rgba(201,169,97,0.16) 0%, rgba(201,169,97,0.05) 100%)",
              border: `1px solid ${isLight ? "rgba(201,169,97,0.35)" : AC_BORDER}`,
            }}
          >
            <div>
              <p className="text-2xl font-black" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>{streak}</p>
              <p className="text-xs font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>Day Streak</p>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ color: AC, background: isLight ? "rgba(201,169,97,0.16)" : AC_BG }}>
              <UiIcon name="flame" size={21} />
            </div>
          </div>
        )}

        {/* ── Activity feed ────────────────────────────────────────────────── */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-base font-black" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Activity</p>
            <Link
              href="/highlights"
              className="rounded-full px-3 py-1.5 text-[11px] font-black transition-all active:scale-[0.97]"
              style={{
                background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)",
                color: isLight ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.82)",
                border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              View all highlights →
            </Link>
          </div>

          <div
            className="mb-3 rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)", border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}` }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ color: isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.35)" }}>
              <path d="m21 21-4.35-4.35M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={activitySearch}
              onChange={(event) => setActivitySearch(event.target.value)}
              placeholder="Search highlights, notes, saved items..."
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}
            />
            {activitySearch && (
              <button
                onClick={() => setActivitySearch("")}
                className="text-xs font-black"
                style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}
                aria-label="Clear search"
              >
                <UiIcon name="close" size={14} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.96]"
                style={
                  filter === f.key
                    ? { background: AC, color: "#08090f" }
                    : { background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)", color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.5)" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : AC_BG, color: isLight ? "rgba(0,0,0,0.35)" : AC }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <p className="font-semibold mb-1" style={{ color: isLight ? "#0a0a0a" : "#ffffff" }}>Nothing here yet</p>
              <p className="text-sm" style={{ color: isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.40)" }}>
                {filter === "all"
                  ? "Start reading to see your activity"
                  : `No ${filter}s synced yet`}
              </p>
              <Link
                href="/"
                className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                style={{ background: isLight ? "rgba(201,169,97,0.14)" : AC_BG, color: isLight ? "#0a0a0a" : AC }}
              >
                Open Bible
              </Link>
            </div>
          ) : (
            filtered.map((item, i) => <ActivityCard key={i} item={item} isLight={isLight} />)
          )}
        </div>

      </main>
    </div>
  );
}
