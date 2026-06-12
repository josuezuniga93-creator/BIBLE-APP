"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BADGE_CATEGORIES,
  BADGE_DEFINITIONS,
  BadgeDefinition,
  badgeText,
  categoryTitle,
  collectBadgeStats,
  getBadgeProgress,
  getBestEarnedBadges,
  getEarnedBadgeDefinitions,
  type BadgeLang,
} from "../lib/badges";
import { useLanguage } from "../lib/useLanguage";
import { shareBadge } from "./BadgeRuntime";

function BadgeGalleryCard({
  badge,
  earned,
  lang,
  isPN = false,
}: {
  badge: BadgeDefinition & { earnedAt?: string };
  earned: boolean;
  lang: BadgeLang;
  isPN?: boolean;
}) {
  const stats = collectBadgeStats();
  const progress = getBadgeProgress(badge, stats);
  const copy = badgeText(badge, lang);
  const Tag = earned ? "button" : "div";
  return (
    <Tag
      type={earned ? "button" : undefined}
      onClick={earned ? () => shareBadge(badge, lang) : undefined}
      aria-label={earned ? (lang === "es" ? `Compartir ${copy.name}` : `Share ${copy.name}`) : undefined}
      className={`w-full rounded-3xl p-4 ${earned ? "bg-white/[0.045] text-left active:scale-[0.985]" : "bg-white/[0.025] opacity-55 grayscale"}`}
      style={{ border: earned ? `1px solid ${isPN ? "rgba(124,58,237,0.30)" : "rgba(216,184,103,0.30)"}` : "1px solid rgba(255,255,255,0.08)" }}
    >
      <img src={badge.image} alt={copy.name} className="mx-auto h-24 w-24 object-contain" />
      <h3 className="mt-3 text-center text-sm font-black leading-tight text-white">{copy.name}</h3>
      <p className="mt-1 text-center text-[11px] leading-5 text-white/50">{copy.reason}</p>
      {earned ? (
        <div className="mt-3 flex items-center justify-center rounded-full px-3 py-1.5"
          style={{ background: isPN ? "rgba(124,58,237,0.12)" : "rgba(216,184,103,0.12)", color: isPN ? "#a78bfa" : "#d8b867" }}>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {lang === "es" ? "Ganada" : "Earned"}
          </span>
        </div>
      ) : (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <span className="block h-full rounded-full" style={{ width: `${Math.round(progress * 100)}%`, background: isPN ? "#7c3aed" : "#d8b867" }} />
        </div>
      )}
    </Tag>
  );
}

export function BadgeShelf() {
  const { lang } = useLanguage();
  const [best, setBest] = useState<ReturnType<typeof getBestEarnedBadges>>([]);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [isLE, setIsLE] = useState(false);
  const [isPN, setIsPN] = useState(false);

  function refresh() {
    const earned = getEarnedBadgeDefinitions();
    setBest(getBestEarnedBadges(3));
    setEarnedIds(new Set(earned.map((badge) => badge.id)));
  }

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("tulip-badges-change", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("tulip-badges-change", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    const check = () => {
      const t = localStorage.getItem("ryc-theme") ?? "";
      setIsLE(t === "light-elegant");
      setIsPN(t === "premium-neon");
    };
    check();
    window.addEventListener("ryc-theme-change", check as EventListener);
    return () => window.removeEventListener("ryc-theme-change", check as EventListener);
  }, []);

  const grouped = useMemo(() => {
    return BADGE_CATEGORIES.map((category) => ({
      ...category,
      badges: BADGE_DEFINITIONS.filter((badge) => badge.category === category.id),
    }));
  }, []);

  if (best.length === 0) return null;

  return (
    <>
      <section
        className="home-badge-shelf mt-9 rounded-[1.7rem] p-5"
        style={{
          background: isLE ? "rgba(201,169,97,0.06)" : "rgba(255,255,255,0.02)",
          border: isLE ? "1px solid rgba(124,92,46,0.18)" : "1px solid rgba(255,255,255,0.07)",
          boxShadow: isLE ? "0 8px 32px rgba(28,20,9,0.08)" : "0 18px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: isPN ? "rgba(167,139,250,0.80)" : "rgba(216,184,103,0.80)" }}>
              {lang === "es" ? "Insignias" : "Badges"}
            </p>
            <h3 className="mt-1 text-xl font-black" style={{ color: isLE ? "#1c1409" : "white" }}>
              {lang === "es" ? "Metas Ganadas" : "Milestones Earned"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full px-4 py-2 text-xs font-black active:scale-[0.98]"
            style={{ border: `1px solid ${isPN ? "rgba(124,58,237,0.24)" : "rgba(216,184,103,0.24)"}`, color: isPN ? "#a78bfa" : "#d8b867" }}
          >
            {lang === "es" ? "Ver todas" : "View all badges"}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          {best.map((badge) => (
            <button key={badge.id} type="button" onClick={() => setOpen(true)} className="active:scale-95">
              <img src={badge.image} alt={badgeText(badge, lang).name} className="h-20 w-20 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)]" />
            </button>
          ))}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[9998] bg-[#071326] text-white">
          <div className="mx-auto flex h-full max-w-3xl flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: isPN ? "#a78bfa" : "#d8b867" }}>
                  {lang === "es" ? "Insignias Tulip" : "Tulip Badges"}
                </p>
                <h2 className="text-2xl font-black">{lang === "es" ? "Todas las Insignias" : "All Badges"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-2xl text-white/70"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
              {grouped.map((category) => (
                <section key={category.id} className="mb-8">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em]" style={{ color: isPN ? "#a78bfa" : "#d8b867" }}>{categoryTitle(category, lang)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {category.badges.map((badge) => (
                      <BadgeGalleryCard key={badge.id} badge={badge} earned={earnedIds.has(badge.id)} lang={lang} isPN={isPN} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
