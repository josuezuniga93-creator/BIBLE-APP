"use client";

import { useState } from "react";
import type { T } from "../lib/translations";
import { UiIcon } from "./UiIcon";

export function DemoBanner({ t }: { t: T }) {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 mt-0.5 flex items-center justify-center flex-shrink-0">
          <UiIcon name="sparkle" size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-amber-300 text-sm font-bold">{t.demoTitle}</p>
          <p className="text-amber-200/60 text-xs leading-relaxed mt-0.5">{t.demoBody}</p>
        </div>
        <button
          onClick={() => setShowSetup((s) => !s)}
          className="flex-shrink-0 text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors"
        >
          {t.demoLink}
        </button>
      </div>

      {showSetup && (
        <div className="border-t border-amber-500/20 bg-black/30 px-4 py-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400/70">
            {t.apiSetupTitle}
          </p>
          <ol className="space-y-2">
            {[t.apiSetupStep1, t.apiSetupStep2, t.apiSetupStep3].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-white/55 leading-relaxed"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className={i === 2 ? "font-mono text-[11px] text-white/45" : ""}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
          >
            {t.apiSetupCta}
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
