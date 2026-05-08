"use client";

import type { Claim } from "../lib/types";
import type { T } from "../lib/translations";
import { CLAIM_STYLES } from "../lib/constants";
import { ytLink } from "../lib/constants";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  videoId?: string | null;
  t: T;
}

export function ClaimCard({ claim, index, videoId, t }: ClaimCardProps) {
  const cs = CLAIM_STYLES[claim.verdict] ?? CLAIM_STYLES.CAUTION;
  const verdictLabel = t.verdictLabels[claim.verdict] ?? claim.verdict;

  return (
    <div
      key={index}
      className={`rounded-xl border ${cs.bg} ${cs.border} overflow-hidden card-animate`}
    >
      {/* Quote + verdict badge */}
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cs.dot}`} />
          <div className="flex flex-col gap-2">
            <blockquote className="text-white/85 text-base leading-relaxed font-medium">
              &ldquo;{claim.quote}&rdquo;
            </blockquote>
            {claim.timestamp && (
              videoId ? (
                <a
                  href={ytLink(videoId, claim.timestamp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-xs font-semibold ${cs.text} bg-white/10 hover:bg-white/20 transition-colors`}
                >
                  ▶ {claim.timestamp}
                </a>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-xs font-semibold ${cs.text} bg-white/10`}
                >
                  🕐 {claim.timestamp}
                </span>
              )
            )}
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${cs.badge}`}
        >
          {verdictLabel}
        </span>
      </div>

      {/* Verdict explanation */}
      <div className="px-5 pb-4">
        <p className={`text-sm leading-relaxed font-medium ${cs.text}`}>
          {claim.verdictExplanation}
        </p>
      </div>

      {/* Three-panel grid */}
      <div className="grid sm:grid-cols-3 gap-px bg-white/5 border-t border-white/10">
        {[
          { label: t.scriptureLabel, content: claim.scriptureCheck, icon: "📖" },
          { label: t.historicFaithLabel, content: claim.historicCheck, icon: "⛪" },
          { label: t.theologianNoteLabel, content: claim.theologianNote, icon: "✍" },
        ].map(({ label, content, icon }) => (
          <div key={label} className="bg-black/30 px-4 py-3 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white/30">
              {icon} {label}
            </p>
            <p className="text-white/60 text-sm leading-relaxed">{content}</p>
          </div>
        ))}
      </div>

      {/* Bible verse lookup panel */}
      {claim.bibleVerses && Object.keys(claim.bibleVerses).length > 0 && (
        <div className="border-t border-white/10 bg-black/25 px-4 py-3 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/30">
            📜 {t.bibleVersesLabel}
          </p>
          {Object.entries(claim.bibleVerses).map(([ref, versions]) => (
            <div key={ref} className="space-y-1.5">
              <p className={`text-xs font-bold tracking-wide ${cs.text}`}>{ref}</p>
              {Object.entries(versions).map(([version, verseText]) => (
                <div key={version} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-white/25 w-9 flex-shrink-0 pt-0.5">
                    {version}
                  </span>
                  <p className="text-white/55 text-sm italic leading-relaxed">
                    &ldquo;{verseText}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
