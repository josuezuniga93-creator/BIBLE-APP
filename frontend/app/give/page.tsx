"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../lib/useLanguage";

function GiftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2"/>
      <path d="M21 8H3V6a2 2 0 012-2h14a2 2 0 012 2v2z"/>
      <path d="M12 8v13"/>
      <path d="M12 6c0 0-2-3-4-2s-1 3 0 3"/>
      <path d="M12 6c0 0 2-3 4-2s1 3 0 3"/>
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l5-5h4l2-2h3l5 5"/>
      <path d="M7 7l-5 5 5 5 2-2"/>
      <path d="M17 7l5 5-5 5-2-2"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}

export default function GivePage() {
  const { t } = useLanguage();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsLight(theme === "white-noir");
    const obs = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "white-noir");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const bg        = isLight ? "#ffffff" : "#0f0f0f";
  const fg        = isLight ? "#0a0a0a" : "#ffffff";
  const fgMuted   = isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.50)";
  const fgFaint   = isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.25)";
  const cardBg    = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const cardBdr   = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const amberBg   = isLight ? "rgba(180,120,0,0.08)" : "rgba(245,158,11,0.12)";
  const amberBdr  = isLight ? "rgba(180,120,0,0.15)" : "rgba(245,158,11,0.18)";
  const amberFg   = isLight ? "rgba(120,80,0,0.70)" : "rgba(245,158,11,0.80)";
  const btnBdr    = isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)";
  const btnBg     = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";

  const helpItems = [
    { Icon: MonitorIcon, text: t("give_help_servers") },
    { Icon: SparkleIcon, text: t("give_help_features") },
    { Icon: GlobeIcon,   text: t("give_help_global") },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg, color: fg }}>
      <main className="max-w-lg mx-auto px-4 pt-8 pb-24 space-y-6">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.22)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z"
                fill="rgba(244,63,94,0.25)"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: fgFaint }}>{t("give_badge")}</p>
            <h1 className="text-2xl font-black leading-tight" style={{ color: fg }}>{t("give_heading")}</h1>
          </div>

          <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: fgMuted }}>
            {t("give_sub")}
          </p>

          <p className="text-xs italic" style={{ color: fgFaint }}>
            {t("give_quote")}
          </p>
        </section>

        {/* ── Giving options ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-[10px] font-black tracking-widest uppercase px-1" style={{ color: fgFaint }}>{t("give_ways")}</p>

          {/* One-time */}
          <div className="rounded-2xl p-5 space-y-4" style={{ border: `1px solid ${cardBdr}`, background: cardBg }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: amberBg, border: `1px solid ${amberBdr}`, color: amberFg }}>
                <GiftIcon />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: fg }}>{t("give_one_time")}</p>
                <p className="text-xs mt-0.5" style={{ color: fgMuted }}>{t("give_one_time_sub")}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["$5", "$10", "$25", "$50"].map((amount) => (
                <button
                  key={amount}
                  onClick={(e) => e.preventDefault()}
                  className="px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{ border: `1px solid ${btnBdr}`, background: btnBg, color: fgMuted }}
                >
                  {amount}
                </button>
              ))}
              <button
                onClick={(e) => e.preventDefault()}
                className="px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ border: `1px solid ${btnBdr}`, background: btnBg, color: fgFaint }}
              >
                {t("give_custom")}
              </button>
            </div>
            <p className="text-[10px]" style={{ color: fgFaint }}>{t("give_via")} — <span className="italic">Link coming soon</span></p>
          </div>

          {/* Monthly */}
          <div className="rounded-2xl p-5 space-y-4 relative overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.28)", background: "rgba(124,58,237,0.06)" }}>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.22)", color: "rgba(167,139,250,1)" }}>
              {t("give_popular")}
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-violet-400" style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.22)" }}>
                <HandshakeIcon />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: fg }}>{t("give_monthly")}</p>
                <p className="text-xs mt-0.5" style={{ color: fgMuted }}>{t("give_monthly_sub")}</p>
              </div>
            </div>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
              style={{ background: "#7c3aed" }}
            >
              {t("give_monthly_cta")}
            </button>
            <p className="text-center text-[10px]" style={{ color: fgFaint }}>{t("give_cancel")} — <span className="italic">Link coming soon</span></p>
          </div>
        </section>

        {/* ── How gifts help ────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-5 space-y-3" style={{ border: `1px solid ${cardBdr}`, background: cardBg }}>
          <p className="text-sm font-bold" style={{ color: fg, opacity: 0.8 }}>{t("give_help_title")}</p>
          {helpItems.map(({ Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5" style={{ color: fgFaint }}>
                <Icon />
              </span>
              <p className="text-xs leading-relaxed" style={{ color: fgMuted }}>{text}</p>
            </div>
          ))}
        </section>

        {/* ── Footer note ───────────────────────────────────────────────────── */}
        <p className="text-center text-xs px-4 leading-relaxed" style={{ color: fgFaint }}>
          {t("give_footer")}
        </p>

      </main>
    </div>
  );
}
