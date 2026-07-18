"use client";

import type { CSSProperties } from "react";

export type UiIconName =
  | "archive"
  | "bell"
  | "book"
  | "calendar"
  | "check"
  | "chevron-right"
  | "church"
  | "clock"
  | "close"
  | "copy"
  | "cross"
  | "dove"
  | "edit"
  | "external"
  | "file"
  | "flame"
  | "gift"
  | "globe"
  | "heart"
  | "history"
  | "home"
  | "landmark"
  | "leaf"
  | "link"
  | "mail"
  | "map"
  | "mic"
  | "music"
  | "note"
  | "paperclip"
  | "pin"
  | "prayer"
  | "search"
  | "shield"
  | "sparkle"
  | "star"
  | "sun"
  | "target"
  | "timer"
  | "upload"
  | "warning"
  | "x-circle";

type Props = {
  name: UiIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
};

export function UiIcon({ name, size = 18, className, style, strokeWidth = 2 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "archive":
      return <svg {...common}><path d="M4 7h16" /><path d="M5.5 7v12h13V7" /><path d="M9 11h6" /><path d="M7 4h10l1 3H6l1-3Z" /></svg>;
    case "bell":
      return <svg {...common}><path d="M6 9a6 6 0 0 1 12 0c0 6 2 6 2 8H4c0-2 2-2 2-8Z" /><path d="M10 21h4" /></svg>;
    case "book":
      return <svg {...common}><path d="M4 5.5h6.5A3.5 3.5 0 0 1 14 9v10.5a3.5 3.5 0 0 0-3.5-2.5H4V5.5Z" /><path d="M20 5.5h-6.5A3.5 3.5 0 0 0 10 9v10.5a3.5 3.5 0 0 1 3.5-2.5H20V5.5Z" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "chevron-right":
      return <svg {...common}><path d="m9 5 7 7-7 7" /></svg>;
    case "church":
      return <svg {...common}><path d="M12 3v4M10 5h4" /><path d="M5 21v-9l7-5 7 5v9" /><path d="M9.5 21v-4a2.5 2.5 0 0 1 5 0v4" /><path d="M3.5 21h17" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
    case "close":
      return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case "copy":
      return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></svg>;
    case "cross":
      return <svg {...common}><path d="M12 4v16M7 9h10" /></svg>;
    case "dove":
      return <svg {...common}><path d="M4 13c5-1 7-4 9-9 1 4 4 7 7 8-3 1-6 1-9-1-1 4-3 7-7 9 1-3 1-5 0-7Z" /></svg>;
    case "edit":
      return <svg {...common}><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="M13.5 6.5l4 4" /></svg>;
    case "external":
      return <svg {...common}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" /></svg>;
    case "file":
      return <svg {...common}><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>;
    case "flame":
      return <svg {...common}><path d="M12 21c4 0 7-3 7-7 0-3-2-5-4-7 .2 3-1 4-2.5 5C12 9 10.5 6 8 4c.3 4-3 6-3 10 0 4 3 7 7 7Z" /></svg>;
    case "gift":
      return <svg {...common}><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M12 9v11M4 13h16M7.5 9C5 7 6 4 8.5 5c1.5.6 2.5 4 2.5 4M16.5 9C19 7 18 4 15.5 5 14 5.6 13 9 13 9" /></svg>;
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>;
    case "heart":
      return <svg {...common}><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7 3.1C19 15.6 12 20 12 20Z" /></svg>;
    case "history":
      return <svg {...common}><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" /><path d="M4 4v4.5h4.5" /><path d="M12 8v5l3 2" /></svg>;
    case "home":
      return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20H5v-9.5Z" /><path d="M9.5 20v-5h5v5" /></svg>;
    case "landmark":
      return <svg {...common}><path d="M12 3 21 8H3l9-5Z" /><path d="M6 10v7M10 10v7M14 10v7M18 10v7" /><path d="M4 21h16" /></svg>;
    case "leaf":
      return <svg {...common}><path d="M5 19c8-1 13-6 15-15-8 1-13 6-15 15Z" /><path d="M5 19 15 9" /></svg>;
    case "link":
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>;
    case "map":
      return <svg {...common}><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><path d="M9 3v15M15 6v15" /></svg>;
    case "mic":
      return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>;
    case "music":
      return <svg {...common}><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>;
    case "note":
      return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></svg>;
    case "paperclip":
      return <svg {...common}><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.2 3.2 0 0 1 4.5 4.5L10 17a1.5 1.5 0 0 1-2-2l8-8" /></svg>;
    case "pin":
      return <svg {...common}><path d="m14 4 6 6-4 1-3 3 1 6-4-4-4 4 1-6-3-3 6-1 4-6Z" /></svg>;
    case "prayer":
      return <svg {...common}><path d="M8 21c2-3 3-6 3-10V4a2 2 0 0 0-4 0v7" /><path d="M16 21c-2-3-3-6-3-10V4a2 2 0 0 1 4 0v7" /><path d="M8 11h8" /></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 20 6v6c0 4.8-3.2 7.8-8 9-4.8-1.2-8-4.2-8-9V6l8-3Z" /></svg>;
    case "sparkle":
      return <svg {...common}><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></svg>;
    case "star":
      return <svg {...common}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></svg>;
    case "sun":
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.5" /></svg>;
    case "timer":
      return <svg {...common}><path d="M10 2h4" /><path d="M12 6a8 8 0 1 0 8 8" /><path d="M12 10v5l3 2" /></svg>;
    case "upload":
      return <svg {...common}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>;
    case "warning":
      return <svg {...common}><path d="M12 3 22 20H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></svg>;
    case "x-circle":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>;
    default:
      return null;
  }
}

export function collectionIconName(value?: string): UiIconName {
  switch (value) {
    case "\u{1F4D6}":
    case "book":
      return "book";
    case "\u271D\uFE0F":
    case "\u271D":
    case "cross":
      return "cross";
    case "\u{1F64F}":
    case "prayer":
      return "prayer";
    case "\u26EA":
    case "church":
      return "church";
    case "\u2728":
    case "sparkle":
      return "sparkle";
    case "\u{1F33F}":
    case "leaf":
      return "leaf";
    case "\u{1F4DD}":
    case "note":
      return "note";
    case "\u2764\uFE0F":
    case "\u2665\uFE0F":
    case "heart":
      return "heart";
    case "\u{1F525}":
    case "flame":
      return "flame";
    case "\u2B50":
    case "star":
      return "star";
    case "\u{1F3DB}":
    case "landmark":
      return "landmark";
    case "\u{1F4DC}":
    case "file":
    case "scroll":
      return "file";
    case "\u{1F54A}\uFE0F":
    case "\u{1F54A}":
    case "dove":
      return "dove";
    case "\u{1F3AF}":
    case "target":
      return "target";
    case "\u{1F4CC}":
    case "pin":
      return "pin";
    case "\u{1F4A1}":
    case "lightbulb":
    case "light":
      return "sparkle";
    case "\u{1F319}":
    case "moon":
      return "clock";
    case "\u2600\uFE0F":
    case "sun":
      return "sun";
    case "\u{1F5FA}\uFE0F":
    case "map":
      return "map";
    case "calendar":
      return "calendar";
    case "timer":
      return "timer";
    case "music":
      return "music";
    case "library":
      return "book";
    case "scale":
      return "target";
    case "knot":
      return "link";
    case "compass":
      return "map";
    case "sword":
    case "anchor":
    case "shield":
      return "shield";
    case "external":
      return "external";
    case "mic":
      return "mic";
    case "gift":
      return "gift";
    case "home":
      return "home";
    default:
      return "book";
  }
}
