"use client";

import { useEffect, useRef } from "react";
import type { HLColor } from "../lib/highlights";

const COLORS: { key: HLColor; dot: string; label: string }[] = [
  { key: "purple", dot: "", label: "Purple" },
  { key: "yellow", dot: "", label: "Yellow" },
  { key: "red",    dot: "", label: "Red" },
  { key: "blue",   dot: "", label: "Blue" },
  { key: "lime",   dot: "", label: "Lime" },
  { key: "pink",   dot: "", label: "Pink" },
];

interface Props {
  x: number;         // viewport center-x of the selection
  y: number;         // viewport top-y of the selection
  onHighlight: (color: HLColor) => void;
  onDismiss: () => void;
}

export function HighlightToolbar({ x, y, onHighlight, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    // Use capture so it fires before the mouseup selection handler re-runs
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, [onDismiss]);

  // Clamp toolbar so it doesn't overflow viewport edges
  const toolbarW = 192; // approximate px width
  const toolbarH = 40;
  const clampedX = Math.max(toolbarW / 2 + 8, Math.min(x, window.innerWidth - toolbarW / 2 - 8));
  const clampedY = y + window.scrollY - toolbarH - 10;

  return (
    <div
      ref={ref}
      className="fixed z-[60] flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#1c1c1c] border border-white/[0.10] shadow-2xl shadow-black/60"
      style={{
        top: clampedY,
        left: clampedX - toolbarW / 2,
        position: "absolute",
      }}
      // Prevent this click from clearing the text selection
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Label */}
      <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest pr-1">
        Highlight
      </span>

      {/* Color swatches */}
      {COLORS.map(({ key, dot, label }) => (
        <button
          key={key}
          onClick={() => onHighlight(key)}
          title={label}
          className={`w-5 h-5 rounded-full ${dot} hover:scale-125 active:scale-95 transition-transform ring-2 ring-transparent hover:ring-white/20`}
          style={{ backgroundColor: { purple: "#7546e3", yellow: "#f2f06d", red: "#e34646", blue: "#46d3e3", lime: "#a9f558", pink: "#f558f2" }[key] }}
        />
      ))}
    </div>
  );
}
