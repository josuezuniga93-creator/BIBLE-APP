"use client";

import Link from "next/link";
import { LibraryIcon, TrackerIcon, FamilyIcon, PlansIcon, KidsIcon, VideosIcon, GiveIcon } from "../components/MoreIcons";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";

function ConcordanceIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <text x="3" y="17" fontSize="13" fontWeight="800" fill={c} fontFamily="serif">α</text>
      <circle cx="17" cy="13" r="5" stroke={c} strokeWidth="1.6"/>
      <path d="M21 17l3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const FEATURES = [
  { href: "/lexicon?tab=search", Icon: ConcordanceIcon, label: "Concordance",  desc: "Search Greek & Hebrew words"    },
  { href: "/library",            Icon: LibraryIcon,     label: "Free Books",   desc: "Classic Christian literature"   },
  { href: "/bible-tracker",      Icon: TrackerIcon,     label: "Tracker",      desc: "Track your Bible reading"       },
  { href: "/family-worship",     Icon: FamilyIcon,      label: "Family",       desc: "Worship together at home"       },
  { href: "/bible-plans",        Icon: PlansIcon,       label: "Plans",        desc: "Bible reading plans"            },
  { href: "/kids-books",         Icon: KidsIcon,        label: "Kids Books",   desc: "Faith books for children"       },
  { href: "/videos",             Icon: VideosIcon,      label: "Videos",       desc: "Watch sermons & teachings"      },
  { href: "/give",               Icon: GiveIcon,        label: "Give",         desc: "Support the ministry"           },
] as const;

export default function MorePage() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-4">
        <h1 className="text-xl font-bold text-white">Extras</h1>

        <div className="space-y-1">
          {FEATURES.map(({ href, Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.04] active:bg-white/[0.08] transition-colors"
            >
              <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.07]">
                <Icon active={false} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-3 pt-2">
          <p className="text-xs text-white/30 font-semibold uppercase tracking-widest px-1">Settings</p>

          {/* Theme toggle */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04]">
            <div>
              <p className="text-sm font-semibold text-white">Appearance</p>
              <p className="text-xs text-white/40 mt-0.5">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center h-8 rounded-full border border-white/[0.10] bg-white/[0.04] overflow-hidden"
            >
              <span className={`px-3 py-1 text-xs font-bold transition-all ${theme === "dark" ? "text-white bg-white/10" : "text-white/35"}`}>🌙 Dark</span>
              <span className="w-px h-4 bg-white/[0.10]" />
              <span className={`px-3 py-1 text-xs font-bold transition-all ${theme === "light" ? "text-white bg-white/10" : "text-white/35"}`}>☀️ Light</span>
            </button>
          </div>

          {/* Language toggle */}
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
        </div>
      </main>
    </div>
  );
}
