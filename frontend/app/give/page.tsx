"use client";

import { useLanguage } from "../lib/useLanguage";

export default function GivePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-8 pb-24 space-y-6">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z"
                fill="rgba(244,63,94,0.3)"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-widest text-white/25 uppercase mb-2">{t("give_badge")}</p>
            <h1 className="text-2xl font-black text-white leading-tight">{t("give_heading")}</h1>
          </div>

          <p className="text-white/55 text-sm leading-relaxed max-w-xs mx-auto">
            {t("give_sub")}
          </p>

          <p className="text-white/25 text-xs italic">
            {t("give_quote")}
          </p>
        </section>

        {/* ── Giving options ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase px-1">{t("give_ways")}</p>

          {/* One-time */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎁</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t("give_one_time")}</p>
                <p className="text-xs text-white/45 mt-0.5">{t("give_one_time_sub")}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["$5", "$10", "$25", "$50"].map((amount) => (
                <a
                  key={amount}
                  href="https://ko-fi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold text-sm hover:bg-amber-500/15 hover:border-amber-500/30 hover:text-amber-200 transition-all active:scale-95"
                >
                  {amount}
                </a>
              ))}
              <a
                href="https://ko-fi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/50 font-bold text-sm hover:bg-white/[0.07] transition-all active:scale-95"
              >
                {t("give_custom")}
              </a>
            </div>
            <p className="text-white/20 text-[10px]">{t("give_via")}</p>
          </div>

          {/* Monthly */}
          <div className="rounded-2xl border border-violet-500/30 bg-violet-600/[0.07] p-5 space-y-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/25 text-violet-300 text-[10px] font-bold uppercase tracking-widest">
              {t("give_popular")}
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤝</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t("give_monthly")}</p>
                <p className="text-xs text-white/45 mt-0.5">{t("give_monthly_sub")}</p>
              </div>
            </div>
            <a
              href="https://patreon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-colors active:scale-95 shadow-lg shadow-violet-900/30"
            >
              {t("give_monthly_cta")}
            </a>
            <p className="text-center text-white/20 text-[10px]">{t("give_cancel")}</p>
          </div>
        </section>

        {/* ── How gifts help ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
          <p className="text-sm font-bold text-white/80">{t("give_help_title")}</p>
          {[
            { emoji: "🖥️", text: t("give_help_servers") },
            { emoji: "✨", text: t("give_help_features") },
            { emoji: "🌍", text: t("give_help_global") },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">{emoji}</span>
              <p className="text-xs text-white/50 leading-relaxed">{text}</p>
            </div>
          ))}
        </section>

        {/* ── Footer note ───────────────────────────────────────────────────── */}
        <p className="text-center text-white/20 text-xs px-4 leading-relaxed">
          {t("give_footer")}
        </p>

      </main>
    </div>
  );
}
