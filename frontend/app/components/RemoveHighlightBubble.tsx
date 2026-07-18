"use client";

import { useEffect, useRef } from "react";
import { UiIcon } from "./UiIcon";

interface Props {
  x: number; // viewport center-x (used to position the bubble)
  y: number; // viewport top-y of the highlighted element
  onConfirm: () => void;
  onDismiss: () => void;
}

export function RemoveHighlightBubble({ x, y, onConfirm, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Dismiss on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, [onDismiss]);

  const W = 172;
  const H = 40;
  const clampedX = Math.max(W / 2 + 8, Math.min(x, window.innerWidth - W / 2 - 8));
  const top = y + window.scrollY - H - 10;

  return (
    <div
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      style={{ position: "absolute", top, left: clampedX - W / 2, zIndex: 60, width: W }}
      className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1c1c1c] border border-white/[0.10] shadow-2xl shadow-black/60"
    >
      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex-1">
        Remove?
      </span>
      <button
        onClick={onConfirm}
        className="px-2.5 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 text-xs font-bold transition-colors"
      >
        Remove
      </button>
      <button
        onClick={onDismiss}
        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 text-xs transition-colors"
      >
        <UiIcon name="close" size={12} />
      </button>
    </div>
  );
}
