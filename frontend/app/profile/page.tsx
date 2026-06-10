"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCloudUser, signOut } from "../lib/cloudSync";
import { createClient } from "../lib/supabase/client";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import { BADGE_DEFINITIONS } from "../lib/badges";
import type { User } from "@supabase/supabase-js";
import type { EarnedBadge } from "../lib/badges";

const AC = "#c9a961";
const AC_BG = "rgba(201,169,97,0.14)";

// ─── Book num → name lookup ───────────────────────────────────────────────────
const BOOK_MAP: Record<number, string> = {};
for (const b of BIBLE_BOOKS) BOOK_MAP[b.num] = b.name;

// ─── Highlight color dot ──────────────────────────────────────────────────────
const COLOR_DOT: Record<string, string> = {
  yellow: "#facc15", gold: "#c9a961", blue: "#60a5fa",
  green: "#4ade80", pink: "#f472b6", purple: "#a78bfa",
  red: "#f87171", orange: "#fb923c",
};

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
}

// ─── Parse all activity from sync rows ───────────────────────────────────────
function buildActivity(rows: SyncRow[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const row of rows) {
    // ── Highlights: ryc-vcolor-{bookNum}-{chapter} ──
    if (row.storage_key.startsWith("ryc-vcolor-")) {
      const parts = row.storage_key.split("-");
      const bookNum = parseInt(parts[2]);
      const chapter = parseInt(parts[3]);
      const bookName = BOOK_MAP[bookNum] ?? `Book ${bookNum}`;
      try {
        const obj = JSON.parse(row.value) as Record<string, string>;
        const verses = Object.entries(obj);
        if (verses.length === 0) continue;
        // One item per chapter (group verses)
        const colors = [...new Set(verses.map(([, c]) => c))];
        const verseNums = verses.map(([v]) => parseInt(v)).filter((n) => !isNaN(n));
        const verseList = verses.map(([v]) => v).join(", ");
        items.push({
          type: "highlight",
          label: `You highlighted ${bookName} ${chapter}`,
          sub: `Verses: ${verseList}`,
          color: COLOR_DOT[colors[0]] ?? AC,
          updated_at: row.updated_at,
          navBook: bookName,
          navChapter: chapter,
          navVerses: verseNums,
        });
      } catch { /* skip */ }
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
  for (const r of rows) {
    if (r.storage_key.startsWith("ryc-vcolor-")) {
      try { highlights += Object.keys(JSON.parse(r.value)).length; } catch { /**/ }
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
const TYPE_ICON: Record<ActivityType, string> = {
  highlight: "✦", note: "✎", bookmark: "◈", church: "⛪", badge: "🏅",
};

function ActivityCard({ item }: { item: ActivityItem }) {
  const router = useRouter();

  function handleCardClick() {
    if (item.navBook && item.navChapter) {
      const params = new URLSearchParams({ book: item.navBook, chapter: String(item.navChapter) });
      if (item.navVerses && item.navVerses.length > 0) {
        params.set("select", item.navVerses.join(","));
      }
      router.push(`/lexicon?${params.toString()}`);
    }
  }

  const isNavigable = !!(item.navBook && item.navChapter);

  return (
    <div
      className="rounded-2xl p-4 mb-3 transition-colors"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: isNavigable ? "pointer" : "default",
      }}
      onClick={isNavigable ? handleCardClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
          style={{ background: AC_BG, color: AC }}
        >
          {TYPE_ICON[item.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white leading-snug">{item.label}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {item.color && (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              )}
              <p className="text-[11px] text-white/30">{relTime(item.updated_at)}</p>
            </div>
          </div>
          {item.sub && (
            <div
              className="mt-2 pl-3 border-l-2 border-white/10"
              style={item.type === "highlight" ? { borderColor: item.color ?? AC } : {}}
            >
              <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{item.sub}</p>
            </div>
          )}
          {isNavigable && (
            <p className="text-[10px] mt-2" style={{ color: AC }}>Tap to read →</p>
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
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#08090f" }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 animate-spin" style={{ borderTopColor: AC }} />
      </div>
    );
  }

  const stats = countStats(rows);
  const allActivity = buildActivity(rows);
  const filtered = filter === "all" ? allActivity : allActivity.filter((i) => i.type === filter);

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.toUpperCase() ?? "";
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const initials = fullName ? nameParts.map((n) => n[0]).join("").slice(0, 2) : (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#08090f" }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-4"
        style={{ background: "rgba(8,9,15,0.95)", backdropFilter: "blur(12px)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={handleSignOut}
          className="text-sm font-semibold"
          style={{ color: "#f87171" }}
        >
          Sign Out
        </button>
      </div>

      <main className="max-w-lg mx-auto px-5 pb-28">

        {/* ── Hero: Big name + avatar (YouVersion style) ─────────────────────── */}
        <div className="flex items-end justify-between pt-4 pb-6">
          <div className="flex-1">
            {fullName ? (
              <>
                <h1 className="text-4xl font-black text-white leading-none tracking-tight">{firstName}</h1>
                {lastName && <h1 className="text-4xl font-black text-white leading-none tracking-tight">{lastName}</h1>}
              </>
            ) : (
              <h1 className="text-2xl font-black text-white leading-none">{user?.email}</h1>
            )}
            <p className="text-xs text-white/40 mt-2">{user?.email}</p>
          </div>
          {/* Tappable avatar */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-20 h-20 rounded-full flex-shrink-0 ml-4 overflow-hidden group"
            style={{ border: `2px solid rgba(201,169,97,0.35)` }}
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
                style={{ background: "rgba(201,169,97,0.18)", color: AC }}
              >
                {initials}
              </div>
            )}
            {/* Camera overlay on hover/tap */}
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

        {/* ── Quick-action stat tiles ──────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {[
            { label: "Verses", value: stats.highlights, filter: "highlight" as Filter },
            { label: "Notes", value: stats.notes, filter: "note" as Filter },
            { label: "Saved", value: stats.bookmarks, filter: "bookmark" as Filter },
            { label: "Church", value: stats.churches, filter: "church" as Filter },
            { label: "Badges", value: stats.badges, filter: "badge" as Filter },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setFilter(f => f === s.filter ? "all" : s.filter)}
              className="rounded-2xl flex flex-col items-center justify-center py-4 gap-1 transition-all"
              style={{
                background: filter === s.filter ? AC_BG : "rgba(255,255,255,0.04)",
                border: filter === s.filter ? `1px solid rgba(201,169,97,0.4)` : "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <p className="text-lg font-black" style={{ color: filter === s.filter ? AC : "white" }}>{s.value}</p>
              <p className="text-[10px] text-white/40">{s.label}</p>
            </button>
          ))}
        </div>

        {/* ── Streak card ──────────────────────────────────────────────────── */}
        {(() => {
          const streakRaw = typeof window !== "undefined" ? localStorage.getItem("ryc-streak") : null;
          let streak = 0;
          try { if (streakRaw) streak = (JSON.parse(streakRaw) as { current?: number }).current ?? 0; } catch { /**/ }
          if (streak === 0) return null;
          return (
            <div
              className="rounded-2xl flex items-center justify-between px-5 py-4 mb-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="text-2xl font-black text-white">{streak}</p>
                <p className="text-xs text-white/40">Day Streak</p>
              </div>
              <div className="text-2xl" style={{ color: AC }}>⚡</div>
            </div>
          );
        })()}

        {/* ── Activity feed ────────────────────────────────────────────────── */}
        <div className="mt-5">
          <p className="text-base font-black text-white mb-3">Activity</p>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  filter === f.key
                    ? { background: "white", color: "#08090f" }
                    : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📖</p>
              <p className="text-white font-semibold mb-1">Nothing here yet</p>
              <p className="text-white/40 text-sm">
                {filter === "all"
                  ? "Start reading to see your activity"
                  : `No ${filter}s synced yet`}
              </p>
              <Link
                href="/"
                className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: AC_BG, color: AC }}
              >
                Open Bible
              </Link>
            </div>
          ) : (
            filtered.map((item, i) => <ActivityCard key={i} item={item} />)
          )}
        </div>

      </main>
    </div>
  );
}
