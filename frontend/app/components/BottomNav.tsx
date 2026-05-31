"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/useLanguage";

// ─── SVG Icons — use currentColor so theme CSS variables drive the color ─────

function HomeIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5L2 10.5V21h7v-6h6v6h7V10.5L12 2.5z" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5L2 10.5V21h7v-6h6v6h7V10.5L12 2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BibleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <rect x="7" y="5" width="10" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function PlansIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 12.5l3.5 3.5 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Historical — scroll/parchment icon
function DiscoverIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="10" y1="9"  x2="17" y2="9"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="10" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="10" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// Extras — 3×3 dot grid icon
function YouIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="5"  cy="5"  r="2" fill="currentColor"/>
      <circle cx="12" cy="5"  r="2" fill="currentColor"/>
      <circle cx="19" cy="5"  r="2" fill="currentColor"/>
      <circle cx="5"  cy="12" r="2" fill="currentColor"/>
      <circle cx="12" cy="12" r="2.5" fill={active ? "var(--accent-text)" : "currentColor"}/>
      <circle cx="19" cy="12" r="2" fill="currentColor"/>
      <circle cx="5"  cy="19" r="2" fill="currentColor"/>
      <circle cx="12" cy="19" r="2" fill="currentColor"/>
      <circle cx="19" cy="19" r="2" fill="currentColor"/>
    </svg>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const PRIMARY_TABS_EN = [
  { href: "/",               label: "Home"     },
  { href: "/lexicon",        label: "Bible"    },
  { href: "/notes",          label: "Notes"    },
  { href: "/family-worship", label: "Worship"  },
];

const PRIMARY_TABS_ES = [
  { href: "/",               label: "Inicio"    },
  { href: "/lexicon",        label: "Biblia"    },
  { href: "/notes",          label: "Notas"     },
  { href: "/family-worship", label: "Adoración" },
];

// ─── Sheet link SVG icons ─────────────────────────────────────────────────────

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="4" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="4" width="4" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 4l4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TrackerIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FamilyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 14c2.5 0 5 1.5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NotesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function KidsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 19h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideosIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function GiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="5"  r="2.2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2.2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="19" r="2.2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"/>
      <line x1="12" y1="5"  x2="18" y2="5"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="12" y1="12" x2="7"  y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const MORE_LINKS = [
  { href: "/timeline",      Icon: TimelineIcon, label: "Timeline"      },
  { href: "/library",       Icon: LibraryIcon,  label: "Free Books"    },
  { href: "/bible-tracker", Icon: TrackerIcon,  label: "Bible Tracker" },
  { href: "/bible-plans",   Icon: PlansIcon,    label: "Plans"         },
  { href: "/kids-books",    Icon: KidsIcon,     label: "Kids Books"    },
  { href: "/videos",        Icon: VideosIcon,   label: "Videos"        },
  { href: "/give",          Icon: GiveIcon,     label: "Give"          },
  { href: "/fellowship",    Icon: GiveIcon,     label: "Fellowship"    },
] as const;

// Family Worship nav tab icon — cross/hearth style
function FamilyWorshipIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 4 15.5 4 9.5a4 4 0 018 0 4 4 0 018 0C20 15.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.18 : 0}
      />
      <line x1="12" y1="5" x2="12" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="3" x2="14" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function TabIcon({ href, active }: { href: string; active: boolean }) {
  if (href === "/")               return <HomeIcon active={active} />;
  if (href === "/lexicon")        return <BibleIcon active={active} />;
  if (href === "/notes")          return <NotesIcon active={active} />;
  if (href === "/family-worship") return <FamilyWorshipIcon active={active} />;
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const PRIMARY_TABS = lang === "es" ? PRIMARY_TABS_ES : PRIMARY_TABS_EN;

  const youActive = MORE_LINKS.some((l) => pathname.startsWith(l.href)) ||
    pathname === "/more";

  return (
    <nav
      className="mobile-nav-floating md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "transparent",
        borderColor: "transparent",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      <div className="mobile-nav-surface flex items-stretch h-[58px]">

        {PRIMARY_TABS.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              data-active={active ? "true" : undefined}
              className="nav-tab flex-1 flex flex-col items-center justify-center gap-[3px]"
              style={{ color: active ? "var(--fg)" : "var(--fg-lo)" }}
            >
              <TabIcon href={href} active={active} />
              <span className="text-[10px] font-bold tracking-wide leading-none">
                {label}
              </span>
            </Link>
          );
        })}

        {/* Extras — links to /more page */}
        <Link
          href="/more"
          data-active={youActive ? "true" : undefined}
          className="nav-tab flex-1 flex flex-col items-center justify-center gap-[3px]"
          style={{ color: youActive ? "var(--fg)" : "var(--fg-lo)" }}
        >
          <YouIcon active={youActive} />
          <span className="text-[10px] font-bold tracking-wide leading-none">
            {lang === "es" ? "Más" : "Extras"}
          </span>
        </Link>

      </div>
    </nav>
  );
}
