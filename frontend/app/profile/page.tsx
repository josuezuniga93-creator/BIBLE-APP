"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCloudUser, signOut } from "../lib/cloudSync";
import { createClient } from "../lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const AC = "#c9a961";
const AC_BG = "rgba(201,169,97,0.14)";
const AC_BORDER = "rgba(201,169,97,0.30)";

interface SyncRow {
  storage_key: string;
  value: string;
  updated_at: string;
}

interface ActivityStats {
  highlightedChapters: number;
  highlightedVerses: number;
  chapterNotes: number;
  collections: number;
  bookmarks: number;
  churchAnalyses: number;
  lastPosition: string | null;
}

interface ChurchAnalysis {
  churchName?: string;
  pastor?: string;
  date?: string;
  createdAt?: string;
}

interface Bookmark {
  book?: string;
  chapter?: number;
  verse?: number;
  reference?: string;
  label?: string;
}

interface Collection {
  name?: string;
  verses?: unknown[];
  count?: number;
}

function parseStats(rows: SyncRow[]): ActivityStats {
  let highlightedChapters = 0;
  let highlightedVerses = 0;
  let chapterNotes = 0;
  let collections = 0;
  let bookmarks = 0;
  let churchAnalyses = 0;
  let lastPosition: string | null = null;

  for (const row of rows) {
    if (row.storage_key.startsWith("ryc-vcolor-")) {
      highlightedChapters++;
      try {
        const obj = JSON.parse(row.value);
        highlightedVerses += Object.keys(obj).length;
      } catch { /* */ }
    } else if (row.storage_key.startsWith("ryc-chapter-note-")) {
      if (row.value && row.value.trim().length > 2) chapterNotes++;
    } else if (row.storage_key.startsWith("axiom-hl-bible-")) {
      collections++;
    } else if (row.storage_key === "ryc-bookmarks") {
      try {
        const arr = JSON.parse(row.value);
        bookmarks = Array.isArray(arr) ? arr.length : 0;
      } catch { /* */ }
    } else if (row.storage_key === "tulip-church-analyses") {
      try {
        const arr = JSON.parse(row.value);
        churchAnalyses = Array.isArray(arr) ? arr.length : 0;
      } catch { /* */ }
    } else if (row.storage_key === "ryc-last-position") {
      try {
        const obj = JSON.parse(row.value);
        if (obj?.reference) lastPosition = obj.reference as string;
      } catch { /* */ }
    }
  }

  return { highlightedChapters, highlightedVerses, chapterNotes, collections, bookmarks, churchAnalyses, lastPosition };
}

function getRecentAnalyses(rows: SyncRow[]): ChurchAnalysis[] {
  const row = rows.find((r) => r.storage_key === "tulip-church-analyses");
  if (!row) return [];
  try {
    const arr = JSON.parse(row.value) as ChurchAnalysis[];
    return Array.isArray(arr) ? arr.slice(-5).reverse() : [];
  } catch { return []; }
}

function getRecentBookmarks(rows: SyncRow[]): Bookmark[] {
  const row = rows.find((r) => r.storage_key === "ryc-bookmarks");
  if (!row) return [];
  try {
    const arr = JSON.parse(row.value) as Bookmark[];
    return Array.isArray(arr) ? arr.slice(-6).reverse() : [];
  } catch { return []; }
}

function getCollections(rows: SyncRow[]): Collection[] {
  return rows
    .filter((r) => r.storage_key.startsWith("axiom-hl-bible-"))
    .map((r) => {
      try {
        return JSON.parse(r.value) as Collection;
      } catch { return {}; }
    })
    .slice(0, 6);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const u = await getCloudUser();
      if (!u) { router.replace("/auth/login"); return; }
      setUser(u);
      const supabase = createClient();
      const { data } = await supabase
        .from("user_sync_data")
        .select("storage_key, value, updated_at")
        .eq("user_id", u.id);
      setRows((data as SyncRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

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

  const stats = parseStats(rows);
  const analyses = getRecentAnalyses(rows);
  const bookmarks = getRecentBookmarks(rows);
  const collections = getCollections(rows);
  const initials = (user?.user_metadata?.full_name as string | undefined)
    ?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    ?? (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#08090f" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-4" style={{ background: "rgba(8,9,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-base font-bold text-white">My Profile</h1>
      </div>

      <main className="max-w-lg mx-auto px-5 pb-28 pt-6">

        {/* ── Avatar + Email ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3"
            style={{ background: AC_BG, color: AC, border: `2px solid ${AC_BORDER}` }}
          >
            {initials}
          </div>
          <p className="text-white font-semibold text-base">
            {(user?.user_metadata?.full_name as string | undefined) ?? user?.email}
          </p>
          {user?.user_metadata?.full_name && (
            <p className="text-white/40 text-sm mt-0.5">{user.email}</p>
          )}
          {stats.lastPosition && (
            <p className="text-xs mt-2 px-3 py-1.5 rounded-full" style={{ background: AC_BG, color: AC }}>
              Last read: {stats.lastPosition}
            </p>
          )}
        </div>

        {/* ── Stats grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Verses Highlighted", value: stats.highlightedVerses, icon: "✦" },
            { label: "Chapter Notes", value: stats.chapterNotes, icon: "✎" },
            { label: "Bookmarks", value: stats.bookmarks, icon: "◈" },
            { label: "Collections", value: stats.collections, icon: "⊞" },
            { label: "Chapters Marked", value: stats.highlightedChapters, icon: "◉" },
            { label: "Church Reports", value: stats.churchAnalyses, icon: "⛪" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl flex flex-col items-center justify-center py-4 px-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xl mb-1" style={{ color: AC }}>{s.icon}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/35 text-center leading-tight mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Recent Bookmarks ─────────────────────────────────────────────── */}
        {bookmarks.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Recent Bookmarks</p>
              <Link href="/bible-tracker" className="text-[11px] font-semibold" style={{ color: AC }}>View all</Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {bookmarks.map((bm, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < bookmarks.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: AC_BG, color: AC }}>
                    {(bm.book ?? "?")?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {bm.reference ?? `${bm.book ?? ""} ${bm.chapter ?? ""}:${bm.verse ?? ""}`}
                    </p>
                    {bm.label && <p className="text-xs text-white/40 truncate">{bm.label}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Highlight Collections ────────────────────────────────────────── */}
        {collections.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Collections</p>
              <Link href="/collections" className="text-[11px] font-semibold" style={{ color: AC }}>View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {collections.map((col, i) => (
                <div key={i} className="rounded-2xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-sm font-semibold text-white truncate">{col.name ?? `Collection ${i + 1}`}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {col.verses ? `${(col.verses as unknown[]).length} verses` : col.count ? `${col.count} verses` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Church Analyses ───────────────────────────────────────── */}
        {analyses.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Church Reports</p>
              <Link href="/church-analysis" className="text-[11px] font-semibold" style={{ color: AC }}>View all</Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {analyses.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < analyses.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm" style={{ background: AC_BG }}>⛪</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.churchName ?? "Church Analysis"}</p>
                    <p className="text-xs text-white/40 truncate">
                      {a.pastor ? `Pastor ${a.pastor}` : a.date ?? (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {stats.highlightedVerses === 0 && stats.bookmarks === 0 && stats.chapterNotes === 0 && stats.churchAnalyses === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📖</p>
            <p className="text-white font-semibold mb-2">Start reading to build your history</p>
            <p className="text-white/40 text-sm mb-5 max-w-xs mx-auto">Your highlights, notes, and bookmarks will appear here as you study Scripture.</p>
            <Link href="/" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: AC_BG, color: AC }}>
              Open Bible
            </Link>
          </div>
        )}

        {/* ── Sign Out ─────────────────────────────────────────────────────── */}
        <section className="mt-4">
          <button
            onClick={handleSignOut}
            className="w-full rounded-2xl px-4 py-4 flex items-center justify-between"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "#f87171" }}>Sign Out</p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "#f87171" }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </section>

      </main>
    </div>
  );
}
