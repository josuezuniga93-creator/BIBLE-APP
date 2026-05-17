import type { ClaimVerdict, OverallVerdict } from "./types";

// ─── Minimum sermon length ────────────────────────────────────────────────────

export const MIN_CHARS = 200;

// ─── Verdict styling maps ─────────────────────────────────────────────────────

export const CLAIM_STYLES: Record<
  ClaimVerdict,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {
  ALIGNED: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
    badge: "bg-emerald-500 text-white",
    dot: "bg-emerald-400",
  },
  SECONDARY_DIFFERENCE: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    text: "text-blue-300",
    badge: "bg-blue-500 text-white",
    dot: "bg-blue-400",
  },
  CAUTION: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    text: "text-amber-300",
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-400",
  },
  CONTRADICTS_FUNDAMENTAL: {
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    text: "text-red-300",
    badge: "bg-red-600 text-white",
    dot: "bg-red-500",
  },
};

export const OVERALL_STYLES: Record<
  OverallVerdict,
  { bg: string; border: string; text: string; glow: string; icon: string }
> = {
  SOUND: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-400",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/20",
    icon: "✓",
  },
  MIXED: {
    bg: "bg-amber-500/15",
    border: "border-amber-400",
    text: "text-amber-300",
    glow: "shadow-amber-500/20",
    icon: "⚡",
  },
  SERIOUS_CONCERNS: {
    bg: "bg-orange-500/15",
    border: "border-orange-400",
    text: "text-orange-300",
    glow: "shadow-orange-500/20",
    icon: "⚠",
  },
  FALSE_TEACHING: {
    bg: "bg-red-500/15",
    border: "border-red-400",
    text: "text-red-300",
    glow: "shadow-red-500/20",
    icon: "✗",
  },
};

// ─── Example sermon (prosperity gospel) ─────────────────────────────────────

export const EXAMPLE_TEXT =
  `Today I want to talk about the goodness of God and how He wants every single one of you to prosper, to be wealthy, and to be in perfect health.\n\nThe Bible says in 3 John 1:2 "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers." This is God's unconditional will for every believer. If you are sick or struggling financially, the problem is your lack of faith. God cannot lie — He promised prosperity to all who believe.\n\nJesus died not just for our sins, but to redeem us from poverty and sickness. Isaiah 53:5 says "by His stripes we are healed" — this means physical healing is included in the atonement, and if you remain sick, it is because you are not claiming your covenant rights.\n\nSome of you are struggling because you have not given enough to this ministry. When you give to God, He opens the windows of heaven. Plant a seed of faith — a significant financial gift — and God is obligated to return it to you multiplied. This is a spiritual law as real as gravity.\n\nRemember: you are a king's kid. Poverty is a curse. Jesus became poor so we could become rich. The anointing on this ministry can break every financial curse over your life. But you must act in faith today.`;

// ─── YouTube helpers ──────────────────────────────────────────────────────────

export function isValidYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.test(url);
}

/** Convert "23:07" or "1:23:07" → total seconds (for YouTube &t= param) */
export function tsToSeconds(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/** Build a youtube.com/watch?v=ID&t=Ns deep-link */
export function ytLink(videoId: string, timestamp: string): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${tsToSeconds(timestamp)}s`;
}
