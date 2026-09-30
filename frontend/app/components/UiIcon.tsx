"use client";

import type { CSSProperties } from "react";
import { Archive, Bell, BookOpen, CalendarDays, Check, ChevronRight, Church, Clock3, X, Copy, Cross, Bird, Pencil, ExternalLink, FileText, Flame, Gift, Globe2, Heart, History, House, Landmark, Leaf, Link2, Mail, Map, Mic, Music2, NotebookPen, Paperclip, Pin, HandHeart, Search, ShieldCheck, Sparkles, Star, Sun, Target, Timer, Upload, TriangleAlert, CircleX } from "lucide-react";


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

const UI_ICONS = {
  archive: Archive, bell: Bell, book: BookOpen, calendar: CalendarDays, check: Check,
  "chevron-right": ChevronRight, church: Church, clock: Clock3, close: X, copy: Copy,
  cross: Cross, dove: Bird, edit: Pencil, external: ExternalLink, file: FileText,
  flame: Flame, gift: Gift, globe: Globe2, heart: Heart, history: History, home: House,
  landmark: Landmark, leaf: Leaf, link: Link2, mail: Mail, map: Map, mic: Mic,
  music: Music2, note: NotebookPen, paperclip: Paperclip, pin: Pin, prayer: HandHeart,
  search: Search, shield: ShieldCheck, sparkle: Sparkles, star: Star, sun: Sun,
  target: Target, timer: Timer, upload: Upload, warning: TriangleAlert, "x-circle": CircleX,
} satisfies Record<UiIconName, typeof Archive>;

export function UiIcon({ name, size = 18, className, style, strokeWidth = 1.75 }: Props) {
  const Icon = UI_ICONS[name];
  return <Icon size={size} className={className} style={style} strokeWidth={strokeWidth} aria-hidden="true" />;
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
