"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/useLanguage";
import { AppSectionIcon, type AppSectionIconName } from "./AppSectionIcon";

type DesktopNavLink = {
  href: string;
  label: string;
  icon: AppSectionIconName;
  title: string;
};

function DesktopLink({ link }: { link: DesktopNavLink }) {
  const pathname = usePathname();
  const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

  return (
    <Link
      href={link.href}
      title={link.title}
      data-active={active ? "true" : undefined}
      className="desktop-nav-link group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all"
    >
      <span className="desktop-nav-icon flex h-10 w-10 items-center justify-center rounded-xl transition-all">
        <AppSectionIcon name={link.icon} size={22} active={active} />
      </span>
      <span className="min-w-0">
        <span className="block truncate leading-tight">{link.label}</span>
        <span className="desktop-nav-subtitle mt-0.5 block truncate text-[11px] font-semibold leading-tight">
          {link.title}
        </span>
      </span>
    </Link>
  );
}

export function AppNav() {
  const { t } = useLanguage();

  const studyLinks: DesktopNavLink[] = [
    { href: "/",                label: t("nav_home"),       icon: "home",        title: "Today" },
    { href: "/lexicon",         label: t("nav_scripture"),  icon: "bible",       title: t("title_scripture") },
    { href: "/study-tools",     label: "Study Tools",       icon: "study-tools", title: "Commentary & dictionary" },
    { href: "/notes",           label: t("nav_notes"),      icon: "notes",       title: t("title_notes") },
    { href: "/family-worship",  label: t("nav_worship"),    icon: "worship",     title: t("title_family") },
  ];

  const libraryLinks: DesktopNavLink[] = [
    { href: "/library",         label: t("nav_free_books"), icon: "library",     title: t("title_free_books") },
    { href: "/learn",           label: "Historical Docs",   icon: "historical",  title: t("title_learn") },
    { href: "/kids-books",      label: t("nav_kids"),       icon: "kids",        title: t("title_kids") },
    { href: "/videos",          label: t("nav_videos"),     icon: "videos",      title: "Video library" },
  ];

  const growthLinks: DesktopNavLink[] = [
    { href: "/bible-tracker",   label: t("nav_tracker"),    icon: "tracker",     title: t("title_tracker") },
    { href: "/bible-plans",     label: t("nav_plans"),      icon: "plans",       title: t("title_plans") },
    { href: "/church-directory", label: "Churches",          icon: "church",      title: "Find a church" },
    { href: "/more",            label: t("nav_extras"),     icon: "extras",      title: "More tools" },
  ];

  return (
    <aside className="desktop-app-sidebar fixed inset-y-0 left-0 z-40 hidden w-[18rem] border-r lg:flex">
      <div className="flex h-full w-full flex-col px-5 py-6">
        <Link href="/" className="desktop-brand-card mb-7 block rounded-3xl p-4 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.24em]">Tulip Bible App</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Bible</h1>
          <p className="mt-1 text-xs font-semibold leading-relaxed">
            Scripture, notes, books, and worship in one focused study space.
          </p>
        </Link>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          <section>
            <p className="desktop-nav-section mb-2 px-2 text-[10px] font-black uppercase tracking-[0.24em]">
              Study
            </p>
            <div className="space-y-1.5">
              {studyLinks.map((link) => <DesktopLink key={link.href} link={link} />)}
            </div>
          </section>

          <section>
            <p className="desktop-nav-section mb-2 px-2 text-[10px] font-black uppercase tracking-[0.24em]">
              Library
            </p>
            <div className="space-y-1.5">
              {libraryLinks.map((link) => <DesktopLink key={link.href} link={link} />)}
            </div>
          </section>

          <section>
            <p className="desktop-nav-section mb-2 px-2 text-[10px] font-black uppercase tracking-[0.24em]">
              Growth
            </p>
            <div className="space-y-1.5">
              {growthLinks.map((link) => <DesktopLink key={link.href} link={link} />)}
            </div>
          </section>
        </nav>

        <div className="desktop-sidebar-footer mt-6 rounded-3xl p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Launch Preview</p>
          <p className="mt-2 text-xs font-semibold leading-relaxed">
            Desktop uses a separate layout. Phone and installed app views stay unchanged.
          </p>
        </div>
      </div>
    </aside>
  );
}
