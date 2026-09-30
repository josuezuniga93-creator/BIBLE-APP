"use client";

import { House, BookOpen, NotebookPen, BookHeart, Menu, CalendarDays, LibraryBig, ListChecks, Baby, PlaySquare, BookOpenCheck, ScrollText, Layers, Users, Church, HeartHandshake, ShieldCheck, History } from "lucide-react";

const SECTION_ICONS = {
  home: House, bible: BookOpen, notes: NotebookPen, worship: BookHeart, extras: Menu,
  plans: CalendarDays, library: LibraryBig, tracker: ListChecks, kids: Baby,
  videos: PlaySquare, "study-tools": BookOpenCheck, historical: ScrollText,
  collections: Layers, fellowship: Users, church: Church, give: HeartHandshake,
  "church-analysis": ShieldCheck, timeline: History,
};

export type AppSectionIconName = keyof typeof SECTION_ICONS;

export function AppSectionIcon({ name, size = 22, active = false, className }: {
  name: AppSectionIconName; size?: number; active?: boolean; className?: string;
}) {
  const Icon = SECTION_ICONS[name];
  return <Icon size={size} strokeWidth={active ? 2 : 1.65} className={className} aria-hidden="true" />;
}
