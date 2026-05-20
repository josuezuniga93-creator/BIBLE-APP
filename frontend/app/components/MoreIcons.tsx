export function PlansIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke={c} strokeWidth="1.7" />
      <path d="M7.5 12.5l3.5 3.5 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LibraryIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="4" height="16" rx="1.5" stroke={c} strokeWidth="1.6" />
      <rect x="9" y="4" width="4" height="16" rx="1.5" stroke={c} strokeWidth="1.6" />
      <path d="M15 4l4 16" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TrackerIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={c} strokeWidth="1.6" />
      <path d="M7.5 12l3 3 6-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FamilyIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke={c} strokeWidth="1.6" />
      <circle cx="17" cy="8" r="2.2" stroke={c} strokeWidth="1.5" />
      <path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 14c2.5 0 5 1.5 5 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NotesIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke={c} strokeWidth="1.6" />
      <line x1="8" y1="8" x2="16" y2="8" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function KidsIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 19h20" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 5V3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 5V3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VideosIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="3" stroke={c} strokeWidth="1.6" />
      <path d="M17 9l5-3v12l-5-3V9z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function GiveIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12h-2z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function FellowshipIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "rgba(255,255,255,0.6)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="6" r="3" stroke={c} strokeWidth="1.6" />
      <circle cx="15.5" cy="6" r="3" stroke={c} strokeWidth="1.6" />
      <path d="M2 20c0-3.3 2.7-5.5 6.5-5.5s6.5 2.2 6.5 5.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 14.5c2 0 4.5 1.3 4.5 4.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 10.5c.8.3 1.6.5 2.5.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
