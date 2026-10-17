"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, BookHeart, Grid2X2, Home, NotebookPen } from "lucide-react";
import { useLanguage } from "../lib/useLanguage";
import type { TranslationKey } from "../lib/i18n";

const TABS: Array<{ href: string; label: TranslationKey; icon: typeof Home }> = [
  { href: "/", label: "nav_home", icon: Home },
  { href: "/lexicon", label: "nav_mobile_scripture", icon: BookOpen },
  { href: "/notes", label: "nav_notes", icon: NotebookPen },
  { href: "/family-worship", label: "nav_mobile_devotional", icon: BookHeart },
  { href: "/more", label: "nav_extras", icon: Grid2X2 },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [hiddenForReader, setHiddenForReader] = useState(false);

  useEffect(() => {
    const update = () => setHiddenForReader(document.documentElement.getAttribute("data-app-reader-open") === "true");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-app-reader-open"] });
    return () => observer.disconnect();
  }, []);

  if (hiddenForReader || pathname.startsWith("/auth")) return null;
  const primaryActive = TABS.slice(0, 4).find(tab => tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href));

  return (
    <nav className="mobile-tab-bar lg:hidden print:hidden" aria-label={t("nav_home") + " / " + t("nav_extras")}>
      <div className="mobile-tab-bar-inner">
        {TABS.map(tab => {
          const active = primaryActive ? tab.href === primaryActive.href : tab.href === "/more";
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className="mobile-tab" aria-current={active ? "page" : undefined}>
              <span className="mobile-tab-icon"><Icon size={22} strokeWidth={active ? 2 : 1.45} /></span>
              <span>{t(tab.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
