"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/useLanguage";

export function AppNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/lexicon",        label: t("nav_scripture"),  icon: "📖",  title: t("title_scripture") },
    { href: "/learn",          label: t("nav_learn"),      icon: "🎓",  title: t("title_learn") },
    { href: "/library",        label: t("nav_free_books"), icon: "🏛️", title: t("title_free_books") },
    { href: "/family-worship", label: t("nav_family"),     icon: "🕯️", title: t("title_family") },
    { href: "/bible-tracker",  label: t("nav_tracker"),    icon: "✅",  title: t("title_tracker") },
    { href: "/bible-plans",    label: t("nav_plans"),      icon: "📅",  title: t("title_plans") },
    { href: "/notes",          label: t("nav_notes"),      icon: "🗒️", title: t("title_notes") },
    { href: "/kids-books",     label: t("nav_kids"),       icon: "📚",  title: t("title_kids") },
  ];

  return (
    <nav className="top-app-nav hidden md:block fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: "var(--nav-bg)", borderColor: "var(--nav-border)" }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <span className="hidden sm:block text-sm font-bold text-white/80">TULIP Bible App</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.title}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: hamburger (desktop only) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile hamburger — hidden on mobile (BottomNav handles mobile navigation) */}
          <button
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.07] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu — only shown on medium+ screens (mobile uses BottomNav) */}
      {menuOpen && (
        <div className="hidden md:block border-t border-white/[0.06] bg-[#0f0f0f]/95 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  active
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-base w-5 text-center">{link.icon}</span>
                {link.label}
                <span className="text-xs text-white/25 ml-auto">{link.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
