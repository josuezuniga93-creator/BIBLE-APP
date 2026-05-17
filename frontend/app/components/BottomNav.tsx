"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── SVG Icons (YouVersion style) ────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.5L2 10.5V21h7v-6h6v6h7V10.5L12 2.5z" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5L2 10.5V21h7v-6h6v6h7V10.5L12 2.5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BibleIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.5)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="4" stroke={c} strokeWidth="1.7" />
      <rect x="7" y="5" width="10" height="14" rx="2.5" stroke={c} strokeWidth="1.3" />
    </svg>
  );
}

function PlansIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.5)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke={c} strokeWidth="1.7" />
      <path d="M7.5 12.5l3.5 3.5 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiscoverIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.5)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="10" r="7" stroke={c} strokeWidth="1.7" />
      <path d="M15.5 15.5L21 21" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function YouIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
      <defs>
        <linearGradient id="youGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={active ? "#7aabff" : "#5a87e8"} />
          <stop offset="100%" stopColor={active ? "#4a6fd4" : "#3a5abf"} />
        </linearGradient>
      </defs>
      <circle cx="15" cy="15" r="14" fill="url(#youGrad)" />
      <circle cx="15" cy="12" r="4.5" fill="white" />
      <path d="M5.5 27c0-5.2 4.3-9 9.5-9s9.5 3.8 9.5 9" fill="white" />
    </svg>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const PRIMARY_TABS = [
  { href: "/",        label: "Home"     },
  { href: "/lexicon", label: "Bible"    },
  { href: "/notes",   label: "Notes"    },
  { href: "/learn",   label: "Discover" },
] as const;

// ─── Sheet link SVG icons ─────────────────────────────────────────────────────

function LibraryIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="4" height="16" rx="1.5" stroke={c} strokeWidth="1.6" />
      <rect x="9" y="4" width="4" height="16" rx="1.5" stroke={c} strokeWidth="1.6" />
      <path d="M15 4l4 16" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TrackerIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={c} strokeWidth="1.6" />
      <path d="M7.5 12l3 3 6-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FamilyIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke={c} strokeWidth="1.6" />
      <circle cx="17" cy="8" r="2.2" stroke={c} strokeWidth="1.5" />
      <path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 14c2.5 0 5 1.5 5 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NotesIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke={c} strokeWidth="1.6" />
      <line x1="8" y1="8" x2="16" y2="8" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function KidsIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 19h20" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 5V3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 5V3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideosIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="3" stroke={c} strokeWidth="1.6" />
      <path d="M17 9l5-3v12l-5-3V9z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function GiveIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const MORE_LINKS = [
  { href: "/library",        Icon: LibraryIcon, label: "Free Books"  },
  { href: "/bible-tracker",  Icon: TrackerIcon, label: "Tracker"     },
  { href: "/family-worship", Icon: FamilyIcon,  label: "Family"      },
  { href: "/bible-plans",    Icon: PlansIcon,   label: "Plans"       },
  { href: "/kids-books",     Icon: KidsIcon,    label: "Kids Books"  },
  { href: "/videos",         Icon: VideosIcon,  label: "Videos"      },
  { href: "/give",           Icon: GiveIcon,    label: "Give"        },
] as const;

function TabIcon({ href, active }: { href: string; active: boolean }) {
  if (href === "/")        return <HomeIcon active={active} />;
  if (href === "/lexicon") return <BibleIcon active={active} />;
  if (href === "/notes")   return <NotesIcon active={active} />;
  if (href === "/learn")   return <DiscoverIcon active={active} />;
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();

  const youActive = MORE_LINKS.some((l) => pathname.startsWith(l.href)) ||
    pathname === "/more";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-white/[0.06]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex items-stretch h-[48px]">

        {PRIMARY_TABS.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px]"
            >
              <TabIcon href={href} active={active} />
              <span className={`text-[10px] font-bold tracking-wide leading-none ${
                active ? "text-white" : "text-white/40"
              }`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* You — links to /more page */}
        <Link
          href="/more"
          className="flex-1 flex flex-col items-center justify-center gap-[3px]"
        >
          <YouIcon active={youActive} />
          <span className={`text-[10px] font-bold tracking-wide leading-none ${
            youActive ? "text-white" : "text-white/40"
          }`}>
            You
          </span>
        </Link>

      </div>
    </nav>
  );
}
