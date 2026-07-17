"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../lib/useLanguage";
import { useTheme, type Theme } from "../lib/useTheme";
import { t } from "../lib/i18n";
import { getCloudUser, pullFromCloud, pushToCloud } from "../lib/cloudSync";
import type { User } from "@supabase/supabase-js";
import { AppSectionIcon } from "../components/AppSectionIcon";

// ─── App tile icon components ─────────────────────────────────────────────────

function PlansAppIcon() {
  return <AppSectionIcon name="plans" size={23} />;
}

function LibraryAppIcon() {
  return <AppSectionIcon name="library" size={23} />;
}

function TrackerAppIcon() {
  return <AppSectionIcon name="tracker" size={23} />;
}

function FamilyAppIcon() {
  return <AppSectionIcon name="worship" size={23} />;
}

function KidsAppIcon() {
  return <AppSectionIcon name="kids" size={23} />;
}

function VideosAppIcon() {
  return <AppSectionIcon name="videos" size={23} />;
}

function GiveAppIcon() {
  return <AppSectionIcon name="give" size={23} />;
}

function FellowshipAppIcon() {
  return <AppSectionIcon name="fellowship" size={23} />;
}

function HistoricalAppIcon() {
  return <AppSectionIcon name="historical" size={23} />;
}

function ChurchAppIcon() {
  return <AppSectionIcon name="church" size={23} />;
}

function NotesAppIcon() {
  return <AppSectionIcon name="notes" size={23} />;
}

function CollectionsAppIcon() {
  return <AppSectionIcon name="collections" size={23} />;
}

function StudyToolsAppIcon() {
  return <AppSectionIcon name="study-tools" size={23} />;
}

function RebuttalAppIcon() {
  return <AppSectionIcon name="church-analysis" size={23} />;
}

// ─── App grid config ──────────────────────────────────────────────────────────

const APP_TILE_DEFS = [
  { href: "/bible-plans",       Icon: PlansAppIcon,        labelKey: "more_tile_plans"       as const, color: "#5b21b6", sub: { en: "Guided reading plans", es: "Planes de lectura guiados" } },
  { href: "/library",           Icon: LibraryAppIcon,      labelKey: "more_tile_books"       as const, color: "#0369a1", sub: { en: "Free books & theology", es: "Libros gratis y teología" } },
  { href: "/learn",             Icon: HistoricalAppIcon,   labelKey: "more_tile_history"     as const, color: "#78350f", sub: { en: "Historical documents & creeds", es: "Documentos históricos y credos" } },
  { href: "/bible-tracker",     Icon: TrackerAppIcon,      labelKey: "more_tile_tracker"     as const, color: "#065f46", sub: { en: "Track your reading progress", es: "Sigue tu progreso de lectura" } },
  { href: "/kids-books",        Icon: KidsAppIcon,         labelKey: "more_tile_kids"        as const, color: "#c2410c", sub: { en: "Bible stories for children", es: "Historias bíblicas para niños" } },
  { href: "/videos",            Icon: VideosAppIcon,       labelKey: "more_tile_videos"      as const, color: "#1e3a8a", sub: { en: "Teaching & testimonies", es: "Enseñanza y testimonios" } },
  { href: "/study-tools",       Icon: StudyToolsAppIcon,   labelKey: "more_tile_study_tools" as const, color: "#8a6b2d", sub: { en: "Commentaries & concordance", es: "Comentarios y concordancia" } },
  { href: "/collections",       Icon: CollectionsAppIcon,  labelKey: "more_tile_collections" as const, color: "#92400e", sub: { en: "Saved verses & notes", es: "Versículos y notas guardados" } },
  { href: "/fellowship",        Icon: FellowshipAppIcon,   labelKey: "more_tile_fellowship"  as const, color: "#7c3aed", sub: { en: "Connect with believers", es: "Conéctate con creyentes" } },
  { href: "/church-directory",  Icon: ChurchAppIcon,       labelKey: "more_tile_church"      as const, color: "#1a6b3a", sub: { en: "Find a church near you", es: "Encuentra una iglesia cerca" } },
  { href: "/give",              Icon: GiveAppIcon,         labelKey: "more_tile_give"        as const, color: "#b45309", sub: { en: "Support the ministry", es: "Apoya el ministerio" } },
  { href: "/church-analysis",  Icon: RebuttalAppIcon,     labelKey: "more_tile_rebuttal"    as const, color: "#6b1d1d", sub: { en: "Analyze church teachings", es: "Analiza enseñanzas de iglesias" } },
];

// Top featured square cards, 2x2: Videos, Free Books (Library), Historical Documents, Study Tools
const TOP_TILE_INDICES = [5, 1, 2, 6];
// Remaining tiles as full-width banner cards, in exact required order:
// Kid's Books, Bible Tracker, Plans, Fellowship, Collections, Find a Church, Church Analysis, Give
const BANNER_TILE_INDICES = [4, 3, 0, 8, 7, 9, 11, 10];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MorePage() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

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

  const isLight = theme === "white-noir";

  const [isLightElegant, setIsLightElegant] = useState(false);
  useEffect(() => {
    const check = () => {
      const t = document.documentElement.getAttribute("data-theme") ?? localStorage.getItem("ryc-theme") ?? "white-noir";
      setIsLightElegant(t === "white-noir");
    };
    check();
    window.addEventListener("ryc-theme-change", check as EventListener);
    return () => window.removeEventListener("ryc-theme-change", check as EventListener);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: isLight ? "#ffffff" : "#0f0f0f", color: isLight ? "#0a0a0a" : "white" }}>
      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6">

        {/* ── Account / Cloud Sync ──────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 px-1" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.30)" }}>Account</p>
          {cloudUser ? (
            <div className="rounded-2xl overflow-hidden" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)" }}>
              {/* Logged-in header — tap to view profile */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)" }}
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
                  <p className="text-sm font-semibold truncate">{cloudUser.user_metadata?.name ?? cloudUser.email}</p>
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
              style={{ background: isLight ? "rgba(0,0,0,0.04)" : "linear-gradient(135deg, rgba(201,169,97,0.10) 0%, rgba(14,17,28,0.97) 100%)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.20)" }}
            >
              <div className="flex items-center gap-4 px-4 py-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.14)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(201,169,97,0.22)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={isLight ? "#555" : "#c9a961"} strokeWidth="1.8"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={isLight ? "#555" : "#c9a961"} strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold">Sync Across Devices</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>
                    Highlights, bookmarks, notes, plans — everywhere.
                  </p>
                </div>
                <a
                  href="/auth/login"
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.18)", color: isLight ? "#0a0a0a" : "#c9a961", border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(201,169,97,0.25)" }}
                >
                  Sign In
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section style={{ marginTop: 24 }}>
          {/* Top row: 2 featured square cards */}
          <div className="grid grid-cols-2" style={{ gap: 10, marginBottom: 10 }}>
            {TOP_TILE_INDICES.map((idx) => {
              const { href, Icon, labelKey, sub } = APP_TILE_DEFS[idx];
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col justify-between active:scale-[0.98] transition-transform"
                  style={{
                    background: isLightElegant ? "#f4f4f4" : "rgba(255,255,255,0.04)",
                    border: isLightElegant ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: 20,
                    height: 140,
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: isLightElegant ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.18)",
                      color: isLightElegant ? "rgba(0,0,0,0.75)" : "#c9a961",
                    }}
                  >
                    <span style={{ lineHeight: 0 }}>
                      <Icon />
                    </span>
                  </div>
                  <div>
                    <p className="font-bold" style={{ fontSize: 15, color: isLightElegant ? "#000000" : "#ffffff" }}>
                      {t(lang, labelKey)}
                    </p>
                    <p
                      className="leading-snug"
                      style={{
                        fontSize: 12,
                        marginTop: 2,
                        color: isLightElegant ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.40)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {lang === "es" ? sub.es : sub.en}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Remaining features as full-width banner cards */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            {BANNER_TILE_INDICES.map((idx) => {
              const { href, Icon, labelKey, sub } = APP_TILE_DEFS[idx];
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center active:scale-[0.985] transition-transform"
                  style={{
                    background: isLightElegant ? "#f4f4f4" : "rgba(255,255,255,0.04)",
                    border: isLightElegant ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    height: 70,
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: isLightElegant ? "rgba(0,0,0,0.06)" : "rgba(201,169,97,0.18)",
                      color: isLightElegant ? "rgba(0,0,0,0.75)" : "#c9a961",
                    }}
                  >
                    <span style={{ lineHeight: 0 }}>
                      <Icon />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0" style={{ marginLeft: 14 }}>
                    <p className="font-bold truncate" style={{ fontSize: 14, color: isLightElegant ? "#000000" : "#ffffff" }}>
                      {t(lang, labelKey)}
                    </p>
                    <p className="truncate" style={{ fontSize: 11.5, marginTop: 1, color: isLightElegant ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.40)" }}>
                      {lang === "es" ? sub.es : sub.en}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: 20, color: isLightElegant ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)" }}
                  >
                    ›
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Appearance ────────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 px-1" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.30)" }}>Appearance</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)" }}>
            {[
              { key: "gold-navy", label: "Dark Mode", desc: "Dark navy with warm gold", swatch: ["#0e1018", "#c9a961"] },
              { key: "white-noir", label: "Light Mode", desc: "Clean white with black ink", swatch: ["#ffffff", "#0a0a0a"] },
            ].map((t, i, arr) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key as Theme)}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/[0.04] transition-colors text-left"
                style={{ borderBottom: i < arr.length - 1 ? (isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)") : "none" }}
              >
                <div className="flex gap-1 flex-shrink-0">
                  {t.swatch.map((c, j) => (
                    <div key={j} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{t.label}</p>
                  <p className="text-xs" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>{t.desc}</p>
                </div>
                {theme === t.key && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? "#0a0a0a" : "#c9a961"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Language ──────────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 px-1" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.30)" }}>{t(lang, "more_language_section")}</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)" }}>
            <div>
              <p className="text-sm font-semibold">{t(lang, "more_language_section")}</p>
              <p className="text-xs mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>{lang === "en" ? "English" : "Español"}</p>
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center h-8 rounded-full overflow-hidden"
              style={{ border: isLight ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)", background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)" }}
            >
              <span className="px-3 py-1 text-xs font-bold transition-all" style={{ color: lang === "en" ? (isLight ? "#0a0a0a" : "white") : (isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"), background: lang === "en" ? (isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)") : "transparent" }}>EN</span>
              <span className="w-px h-4" style={{ background: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)" }} />
              <span className="px-3 py-1 text-xs font-bold transition-all" style={{ color: lang === "es" ? (isLight ? "#0a0a0a" : "white") : (isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"), background: lang === "es" ? (isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)") : "transparent" }}>ES</span>
            </button>
          </div>
        </section>

        {/* ── Notifications ─────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 px-1" style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.30)" }}>{t(lang, "more_notifications")}</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)" }}>
            <div>
              <p className="text-sm font-semibold">{t(lang, "more_daily_verse")}</p>
              <p className="text-xs mt-0.5" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.40)" }}>
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
                title: "Tulip Bible App",
                text: "Study Scripture with Strong's Concordance, Matthew Henry Commentary, and daily verse. Free forever.",
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
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl active:scale-[0.98] transition-all"
            style={{ border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: isLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.70)" }}>{t(lang, "more_share")}</span>
          </button>
        </section>

      </main>
    </div>
  );
}
