"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../lib/useLanguage";
import { useTheme, THEMES, type Theme } from "../lib/useTheme";
import { t } from "../lib/i18n";
import { getCloudUser, pullFromCloud, pushToCloud } from "../lib/cloudSync";
import type { User } from "@supabase/supabase-js";

// ─── App tile icon components ─────────────────────────────────────────────────

function PlansAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.5 12.5l3.5 3.5 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LibraryAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="4" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="9" y="4" width="4" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15 4l4 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrackerAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FamilyAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 14c2.5 0 5 1.5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function KidsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M2 19h20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 5V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 5V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideosAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function GiveAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function FellowshipAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 20c0-3.5 2.7-5.5 6-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function HistoricalAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M4 5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="10" y1="9"  x2="17" y2="9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ChurchAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M10 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 10h18v11H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 10V7l5-3 5 3v3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function NotesAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CollectionsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function StudyToolsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.5h6.5A3.5 3.5 0 0114 9v12a3.5 3.5 0 00-3.5-3.5H4V5.5z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 5.5h-4A3.5 3.5 0 0012.5 9v12a3.5 3.5 0 013.5-3.5h4V5.5z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10h3M16 10h2M8 13h2.5M16 13h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function RebuttalAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v3M10.5 3.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 9h16v12H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M9 21v-5h6v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M6 9V7l6-4 6 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="12" cy="14" r="1.4" fill="currentColor"/>
    </svg>
  );
}

// ─── App grid config ──────────────────────────────────────────────────────────

const APP_TILE_DEFS = [
  { href: "/bible-plans",       Icon: PlansAppIcon,        labelKey: "more_tile_plans"       as const, color: "#5b21b6" },
  { href: "/library",           Icon: LibraryAppIcon,      labelKey: "more_tile_books"       as const, color: "#0369a1" },
  { href: "/learn",             Icon: HistoricalAppIcon,   labelKey: "more_tile_history"     as const, color: "#78350f" },
  { href: "/bible-tracker",     Icon: TrackerAppIcon,      labelKey: "more_tile_tracker"     as const, color: "#065f46" },
  { href: "/kids-books",        Icon: KidsAppIcon,         labelKey: "more_tile_kids"        as const, color: "#c2410c" },
  { href: "/videos",            Icon: VideosAppIcon,       labelKey: "more_tile_videos"      as const, color: "#1e3a8a" },
  { href: "/study-tools",       Icon: StudyToolsAppIcon,   labelKey: "more_tile_study_tools" as const, color: "#8a6b2d" },
  { href: "/collections",       Icon: CollectionsAppIcon,  labelKey: "more_tile_collections" as const, color: "#92400e" },
  { href: "/fellowship",        Icon: FellowshipAppIcon,   labelKey: "more_tile_fellowship"  as const, color: "#7c3aed" },
  { href: "/church-directory",  Icon: ChurchAppIcon,       labelKey: "more_tile_church"      as const, color: "#1a6b3a" },
  { href: "/give",              Icon: GiveAppIcon,         labelKey: "more_tile_give"        as const, color: "#b45309" },
  { href: "/church-analysis",  Icon: RebuttalAppIcon,     labelKey: "more_tile_rebuttal"    as const, color: "#6b1d1d" },
];

const TILE_GROUP_DEFS = [
  { titleKey: "more_group_rhythms" as const, dekKey: "more_group_rhythms_dek" as const, columns: 2, indices: [0, 3] },
  { titleKey: "more_group_explore" as const, dekKey: "more_group_explore_dek" as const, columns: 2, indices: [1, 2, 6, 4, 11] },
  { titleKey: "more_group_connect" as const, dekKey: "more_group_connect_dek" as const, columns: 2, indices: [7, 8, 9, 10] },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MorePage() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const themeKeys = Object.keys(THEMES) as Theme[];

  // ── Cloud account state ────────────────────────────────────────────────────
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");

  useEffect(() => {
    getCloudUser().then((user) => {
      setCloudUser(user);
      if (user) {
        // Pull latest data from cloud on page open
        setSyncStatus("syncing");
        pullFromCloud(user)
          .then(() => setSyncStatus("done"))
          .catch(() => setSyncStatus("error"));
      }
    });
  }, []);


  // ── Notification state ──────────────────────────────────────────────────────
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"default"|"granted"|"denied">("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifStatus(Notification.permission as "default"|"granted"|"denied");
    }
    try {
      setNotifEnabled(localStorage.getItem("tulip_notif_enabled") === "true");
    } catch { /**/ }
  }, []);

  async function handleNotifToggle() {
    if (notifEnabled) {
      // Turn off
      setNotifEnabled(false);
      try { localStorage.setItem("tulip_notif_enabled", "false"); } catch { /**/ }
      return;
    }
    // Request permission
    if (typeof Notification === "undefined") return;
    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
      setNotifStatus(perm as "default"|"granted"|"denied");
    }
    if (perm === "granted") {
      setNotifEnabled(true);
      try { localStorage.setItem("tulip_notif_enabled", "true"); } catch { /**/ }
      // Tell the service worker to start scheduling
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({ type: "SCHEDULE_NOTIFICATIONS" });
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6">

        {/* ── Account / Cloud Sync ──────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">Account</p>
          {cloudUser ? (
            <div className="rounded-2xl bg-white/[0.04] overflow-hidden">
              {/* Logged-in header — tap to view profile */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05] transition-colors active:bg-white/[0.04]"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "rgba(201,169,97,0.18)", color: "#c9a961" }}
                >
                  {(cloudUser.user_metadata?.avatar_url
                    ? <img src={cloudUser.user_metadata.avatar_url} className="w-9 h-9 rounded-full object-cover" />
                    : (cloudUser.email?.[0] ?? "?").toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{cloudUser.user_metadata?.name ?? cloudUser.email}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#c9a961" }}>View my profile →</p>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: syncStatus === "done" ? "#4ade80"
                      : syncStatus === "syncing" ? "#facc15"
                      : syncStatus === "error" ? "#f87171"
                      : "rgba(255,255,255,0.2)",
                  }}
                />
              </Link>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.10) 0%, rgba(14,17,28,0.97) 100%)", border: "1px solid rgba(201,169,97,0.20)" }}
            >
              <div className="flex items-center gap-4 px-4 py-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,169,97,0.14)", border: "1px solid rgba(201,169,97,0.22)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#c9a961" strokeWidth="1.8"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#c9a961" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white">Sync Across Devices</p>
                  <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                    Highlights, bookmarks, notes, plans — everywhere.
                  </p>
                </div>
                <a
                  href="/auth/login"
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ background: "rgba(201,169,97,0.18)", color: "#c9a961", border: "1px solid rgba(201,169,97,0.25)" }}
                >
                  Sign In
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ── Featured Videos banner ────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-[0.22em] uppercase mb-2 px-1" style={{ color: "rgba(201,169,97,0.70)" }}>
            {lang === "es" ? "Destacado" : "Featured"}
          </p>

          <Link href="/videos" className="block">
            <div
              className="rounded-2xl overflow-hidden active:scale-[0.985] transition-transform"
              style={{
                background: "linear-gradient(140deg, #111420 0%, #0a0c14 60%, #0d0f1a 100%)",
                border: "1px solid rgba(201,169,97,0.30)",
                boxShadow: "0 8px 40px rgba(201,169,97,0.12), 0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              {/* Top content row */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 gap-4">
                {/* Left: text */}
                <div className="flex-1 min-w-0">
                  {/* Eyebrow with small play icon */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(201,169,97,0.20)" }}
                    >
                      <svg width="7" height="7" viewBox="0 0 10 10" fill="#c9a961">
                        <path d="M2 1.5v7l6.5-3.5z"/>
                      </svg>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.20em]" style={{ color: "#c9a961" }}>
                      {lang === "es" ? "Biblioteca de Videos" : "Video Library"}
                    </p>
                  </div>

                  <p className="text-[28px] font-black text-white leading-none mb-1.5">
                    Videos
                  </p>
                  <p className="text-[11.5px] font-semibold mb-1.5" style={{ color: "rgba(201,169,97,0.85)" }}>
                    {lang === "es" ? "Enseñanza Bíblica • Testimonios" : "Biblical Teaching • Testimonies"}
                  </p>
                  <p className="text-[11px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {lang === "es"
                      ? "Videos cristianos confiables arraigados en la Escritura."
                      : "Watch trusted Christian videos rooted in Scripture and historic Christianity."}
                  </p>
                  <div
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold"
                    style={{
                      background: "rgba(201,169,97,0.13)",
                      color: "#c9a961",
                      border: "1px solid rgba(201,169,97,0.38)",
                    }}
                  >
                    {lang === "es" ? "Explorar Videos" : "Explore Videos"}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </div>
                </div>

                {/* Right: 3-D gold play icon */}
                <div className="flex-shrink-0">
                  <div
                    className="w-[96px] h-[96px] rounded-[22px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(145deg, #f0d070 0%, #d4a843 40%, #b8872c 75%, #9a6e1e 100%)",
                      boxShadow:
                        "0 16px 48px rgba(201,169,97,0.50), 0 6px 16px rgba(201,169,97,0.30), inset 0 1px 0 rgba(255,255,220,0.35), inset 0 -2px 4px rgba(100,60,0,0.30)",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(15,17,26,0.88)" style={{ marginLeft: 4 }}>
                      <path d="M6 4.5v15l13-7.5z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom category chips */}
              <div
                className="flex gap-2 overflow-x-auto scrollbar-none px-5 pb-4"
                style={{ borderTop: "1px solid rgba(201,169,97,0.10)", paddingTop: 12 }}
              >
                {(lang === "es"
                  ? [
                      { label: "Fundamentos de la Fe",    svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM9 8l7 4-7 4V8z"/></svg> },
                      { label: "Historias de Gracia",     svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></svg> },
                      { label: "Destacados",              svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
                      { label: "Videos Cortos",           svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                      { label: "Preguntas y Respuestas",  svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg> },
                    ]
                  : [
                      { label: "Fundamentals of the Faith", svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM9 8l7 4-7 4V8z"/></svg> },
                      { label: "Stories of Grace",          svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></svg> },
                      { label: "Featured Videos",           svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
                      { label: "Short Videos",              svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                      { label: "Ask & Receive",             svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg> },
                    ]
                ).map((chip) => (
                  <span
                    key={chip.label}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.50)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {chip.svg}
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </section>

        {/* ── App grid ──────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          {TILE_GROUP_DEFS.map((group) => (
            <div key={group.titleKey}>
              <p className="text-[9px] font-black tracking-widest text-white/30 uppercase mb-2 px-1">
                {t(lang, group.titleKey)}
              </p>
              <div className={`grid gap-2.5 ${group.columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {group.indices.map((idx) => {
                  const { href, Icon, labelKey, color } = APP_TILE_DEFS[idx];
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="pn-app-tile flex items-center gap-2.5 px-3 py-2.5 rounded-xl active:scale-95 transition-transform"
                      style={{ backgroundColor: color }}
                    >
                      <span className="flex-shrink-0 opacity-90"><Icon /></span>
                      <span className="text-[12px] font-bold text-white leading-tight">{t(lang, labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* ── Theme picker ──────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">{t(lang, "more_appearance")}</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {themeKeys.map((t) => {
              const meta = THEMES[t];
              const active = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${
                    active
                      ? "border-white/30 bg-white/10"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                  style={{ minWidth: "88px" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl border border-white/20 flex items-center justify-center text-xl relative overflow-hidden"
                    style={{ background: meta.preview[0] }}
                  >
                    <span>{meta.emoji}</span>
                    {active && (
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-white/90 flex items-center justify-center">
                        <span className="text-black text-[8px] font-black">✓</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold leading-tight text-center ${active ? "text-white" : "text-white/50"}`}>
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Language ──────────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">{t(lang, "more_language_section")}</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04]">
            <div>
              <p className="text-sm font-semibold text-white">{t(lang, "more_language_section")}</p>
              <p className="text-xs text-white/40 mt-0.5">{lang === "en" ? "English" : "Español"}</p>
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center h-8 rounded-full border border-white/[0.10] bg-white/[0.04] overflow-hidden"
            >
              <span className={`px-3 py-1 text-xs font-bold transition-all ${lang === "en" ? "text-white bg-white/10" : "text-white/35"}`}>EN</span>
              <span className="w-px h-4 bg-white/[0.10]" />
              <span className={`px-3 py-1 text-xs font-bold transition-all ${lang === "es" ? "text-white bg-white/10" : "text-white/35"}`}>ES</span>
            </button>
          </div>
        </section>

        {/* ── Notifications ─────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">{t(lang, "more_notifications")}</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04]">
            <div>
              <p className="text-sm font-semibold text-white">{t(lang, "more_daily_verse")}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {notifStatus === "denied"
                  ? t(lang, "more_notif_blocked")
                  : notifEnabled
                    ? t(lang, "more_verse_on")
                    : t(lang, "more_verse_off")}
              </p>
            </div>
            <button
              onClick={handleNotifToggle}
              disabled={notifStatus === "denied"}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                notifEnabled ? "bg-white/25" : "bg-white/[0.08]"
              } ${notifStatus === "denied" ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  notifEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── Share ─────────────────────────────────────────────────────────── */}
        <section>
          <button
            onClick={async () => {
              const data = {
                title: "TULIP Bible App",
                text: "Study Scripture with Strong's Concordance, Matthew Henry Commentary, and daily verse. Free & Reformed.",
                url: "https://tulip-bible-app.vercel.app",
              };
              try {
                if (navigator.share) {
                  await navigator.share(data);
                } else if (navigator.clipboard) {
                  await navigator.clipboard.writeText(data.url);
                  alert("Link copied!");
                }
              } catch { /* cancelled */ }
            }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] active:scale-[0.98] transition-all"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-semibold text-white/70">{t(lang, "more_share")}</span>
          </button>
        </section>

      </main>
    </div>
  );
}
