"use client";

import Link from "next/link";
import { useLanguage } from "../lib/useLanguage";

// ─── App tile icon components ─────────────────────────────────────────────────

function PlansAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="1.8" />
      <path d="M7.5 12.5l3.5 3.5 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LibraryAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="4" height="16" rx="1.5" stroke="white" strokeWidth="1.7" />
      <rect x="9" y="4" width="4" height="16" rx="1.5" stroke="white" strokeWidth="1.7" />
      <path d="M15 4l4 16" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrackerAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="1.7" />
      <path d="M7.5 12l3 3 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FamilyAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="white" strokeWidth="1.7" />
      <circle cx="17" cy="8" r="2.2" stroke="white" strokeWidth="1.6" />
      <path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 14c2.5 0 5 1.5 5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function KidsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M2 19h20" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 5V3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 5V3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideosAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="3" stroke="white" strokeWidth="1.7" />
      <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function GiveAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function FellowshipAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.7" />
      <circle cx="16" cy="8" r="3" stroke="white" strokeWidth="1.7" />
      <path d="M2 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 20c0-3.5 2.7-5.5 6-5.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChurchAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M10 4h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 10h18v11H3z" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 10V7l5-3 5 3v3" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function NotesAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="white" strokeWidth="1.7" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── App grid config ──────────────────────────────────────────────────────────

const APP_TILES = [
  { href: "/bible-plans",       Icon: PlansAppIcon,    label: "Plans",      color: "#5b21b6" },
  { href: "/library",           Icon: LibraryAppIcon,  label: "Free Books", color: "#0369a1" },
  { href: "/bible-tracker",     Icon: TrackerAppIcon,  label: "Tracker",    color: "#065f46" },
  { href: "/family-worship",    Icon: FamilyAppIcon,   label: "Family",     color: "#9d174d" },
  { href: "/kids-books",        Icon: KidsAppIcon,     label: "Kids Books", color: "#c2410c" },
  { href: "/videos",            Icon: VideosAppIcon,   label: "Videos",     color: "#1e3a8a" },
  { href: "/give",              Icon: GiveAppIcon,     label: "Give",       color: "#b45309" },
  { href: "/fellowship",        Icon: FellowshipAppIcon, label: "Gatherings", color: "#7c3aed" },
  { href: "/church-directory",  Icon: ChurchAppIcon,   label: "Churches",   color: "#1a6b3a" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MorePage() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6">

        <h1 className="text-xl font-bold text-white px-1">Extras</h1>

        {/* ── App grid ──────────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">Features</p>
          <div className="grid grid-cols-3 gap-3">
            {APP_TILES.map(({ href, Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="pn-app-tile flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl p-4 active:scale-95 transition-transform"
                style={{ backgroundColor: color }}
              >
                <Icon />
                <span className="text-[11px] font-bold text-white text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Language ──────────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">Language</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04]">
            <div>
              <p className="text-sm font-semibold text-white">Language</p>
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

      </main>
    </div>
  );
}
