"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import type { TranslationKey } from "../lib/i18n";
import type { AppSectionIconName } from "./AppSectionIcon";

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

const PRIMARY_TABS: Array<{ href: string; labelKey: TranslationKey }> = [
  { href: "/",               labelKey: "nav_home"               },
  { href: "/lexicon",        labelKey: "nav_mobile_scripture"   },
  { href: "/notes",          labelKey: "nav_notes"              },
  { href: "/family-worship", labelKey: "nav_mobile_devotional"  },
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

const MORE_LINKS: Array<{ href: string; iconName: AppSectionIconName; labelKey: TranslationKey }> = [
  { href: "/learn",         iconName: "historical", labelKey: "nav_learn"      },
  { href: "/timeline",      iconName: "timeline",   labelKey: "nav_timeline"   },
  { href: "/bible-tracker", iconName: "tracker",    labelKey: "nav_tracker"    },
  { href: "/bible-plans",   iconName: "plans",      labelKey: "nav_plans"      },
  { href: "/kids-books",    iconName: "kids",       labelKey: "nav_kids"       },
  { href: "/videos",        iconName: "videos",     labelKey: "nav_videos"     },
  { href: "/give",          iconName: "give",       labelKey: "nav_give"       },
  { href: "/fellowship",    iconName: "fellowship", labelKey: "nav_fellowship" },
] as const;

function MockupNavIcon({ href }: { href: string }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  const strokeProps = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (href === "/") {
    return (
      <svg {...common}>
        <path d="M3 11l9-8 9 8v9H3z" {...strokeProps} />
      </svg>
    );
  }

  if (href === "/lexicon") {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...strokeProps} />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" {...strokeProps} />
      </svg>
    );
  }

  if (href === "/notes") {
    return (
      <svg {...common}>
        <path d="M12 20h9" {...strokeProps} />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" {...strokeProps} />
      </svg>
    );
  }

  if (href === "/family-worship") {
    return (
      <svg {...common}>
        <path d="M12 6v12" {...strokeProps} />
        <path d="M5 8h14v10H5z" {...strokeProps} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 6h16" {...strokeProps} />
      <path d="M4 12h16" {...strokeProps} />
      <path d="M4 18h16" {...strokeProps} />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [hiddenForReader, setHiddenForReader] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Deterministic initial value that matches SSR — a lazy DOM read here causes
  // a hydration mismatch (React keeps stale server styles). Synced on mount below.
  const [isWhiteNoir, setIsWhiteNoir] = useState<boolean>(false);

  useEffect(() => {
    // Sync on mount (in case SSR/hydration mismatch)
    setIsWhiteNoir(
      document.documentElement.getAttribute("data-theme-mode") === "light" ||
      document.documentElement.getAttribute("data-theme") === "white-noir"
    );

    // Listen for live theme changes dispatched by useTheme's setTheme()
    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setIsWhiteNoir(detail === "white-noir" || detail === "light");
    };
    window.addEventListener("ryc-theme-change", handleThemeChange);

    // Also observe data-theme attribute changes (covers edge cases)
    const observer = new MutationObserver(() => {
      setIsWhiteNoir(
        document.documentElement.getAttribute("data-theme-mode") === "light" ||
        document.documentElement.getAttribute("data-theme") === "white-noir"
      );
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-mode"] });

    return () => {
      window.removeEventListener("ryc-theme-change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setHiddenForReader(document.documentElement.getAttribute("data-app-reader-open") === "true");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-app-reader-open"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    for (const { href } of PRIMARY_TABS) router.prefetch(href);
    router.prefetch("/more");
  }, [router]);

  const goTo = (href: string) => {
    if (href === pathname) return;
    setPendingHref(href);
    router.push(href);
  };

  const isTabActive = (href: string) =>
    pendingHref !== null
      ? pendingHref === href
      : href === "/" ? pathname === "/" : pathname.startsWith(href);

  const youActive = pendingHref !== null
    ? pendingHref === "/more" || MORE_LINKS.some((l) => pendingHref === l.href)
    : MORE_LINKS.some((l) => pathname.startsWith(l.href)) || pathname === "/more";

  if (hiddenForReader) return null;
  if (pathname.startsWith("/auth")) return null;

  // White Noir: explicit inline styles so nav is always white regardless of
  // CSS variable support (color-mix() may not work on older Android Chrome).
  const navSurfaceStyle = isWhiteNoir ? {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(255,255,255,0.88)",
    borderRadius: "24px",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 18px 55px rgba(16,17,20,0.16)",
  } : undefined;

  const fgActive   = isWhiteNoir ? "#0a0a0a"              : "var(--fg)";
  const fgInactive = isWhiteNoir ? "rgba(10,10,10,0.36)"  : "var(--fg-lo)";

  return (
    <nav
      className="mobile-nav-floating motion-nav-enter lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "transparent",
        borderColor: "transparent",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 4px)",
      }}
    >
      <div
        className="mobile-nav-surface flex items-stretch h-[70px]"
        suppressHydrationWarning
        style={navSurfaceStyle}
      >

        {PRIMARY_TABS.map(({ href, labelKey }) => {
          const active = isTabActive(href);
          return (
            <button
              key={href}
              type="button"
              onClick={() => goTo(href)}
              data-active={active ? "true" : undefined}
              aria-current={active ? "page" : undefined}
              aria-label={t(labelKey)}
              className="nav-tab motion-pressable tap-target ui-interactive flex-1 flex flex-col items-center justify-center gap-[4px]"
              style={{ color: active ? fgActive : fgInactive }}
            >
              <MockupNavIcon href={href} />
              <span className="text-[10px] font-extrabold leading-none">
                {t(labelKey)}
              </span>
            </button>
          );
        })}

        {/* Extras — links to /more page */}
        <button
          type="button"
          onClick={() => goTo("/more")}
          data-active={youActive ? "true" : undefined}
          aria-current={youActive ? "page" : undefined}
          aria-label={t("nav_extras")}
          className="nav-tab motion-pressable tap-target ui-interactive flex-1 flex flex-col items-center justify-center gap-[4px]"
          style={{ color: youActive ? fgActive : fgInactive }}
        >
          <MockupNavIcon href="/more" />
          <span className="text-[10px] font-extrabold leading-none">
            {t("nav_extras")}
          </span>
        </button>

      </div>
    </nav>
  );
}
