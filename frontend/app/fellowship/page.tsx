"use client";
import {Action,SectionTitle,Row,Empty,Sheet} from "../components/study/Views";

import FeatureFrame from "../components/study/FeatureFrame";
export default function FellowshipPage() { return <FeatureFrame title="Fellowship" screen="fellowship"><FellowshipContent/></FeatureFrame>; }

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "../lib/useLanguage";
import { useTheme } from "../lib/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gathering {
  id: string;
  title: string;
  location: string;
  date: string;      // ISO date string YYYY-MM-DD
  time: string;      // "HH:MM" 24h
  notes: string;
  reminder: boolean;
  phone: string;     // optional recipient phone for SMS
  families: string[]; // families hosted (used in past section)
}

const STORE_KEY = "ryc-gatherings";

function loadGatherings(): Gathering[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const gs = raw ? JSON.parse(raw) : [];
    // back-compat: ensure new fields exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return gs.map((g: any) => ({ phone: "", families: [], ...g } as Gathering));
  } catch { return []; }
}

function saveGatherings(gs: Gathering[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(gs));
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Notification helpers ─────────────────────────────────────────────────────

async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

function scheduleReminders(gatherings: Gathering[]) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const now = Date.now();
  gatherings.forEach((g) => {
    if (!g.reminder) return;
    const dt = new Date(`${g.date}T${g.time}`).getTime();
    const oneDayBefore = dt - 24 * 60 * 60 * 1000;
    const morningOf = new Date(`${g.date}T07:00`).getTime();
    [oneDayBefore, morningOf].forEach((fireAt) => {
      const delay = fireAt - now;
      if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          new Notification(`Gathering reminder: ${g.title}`, {
            body: `${g.location} · ${g.time}`,
            icon: "/icon-192.png",
          });
        }, delay);
      }
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isUpcoming(g: Gathering): boolean {
  return new Date(`${g.date}T${g.time}`).getTime() > Date.now();
}

function daysUntil(g: Gathering): number {
  const dt = new Date(`${g.date}T${g.time}`).getTime();
  return Math.ceil((dt - Date.now()) / (1000 * 60 * 60 * 24));
}

function emptyForm(): Omit<Gathering, "id"> {
  const today = new Date().toISOString().split("T")[0];
  return { title: "", location: "", date: today, time: "10:00", notes: "", reminder: false, phone: "", families: [] };
}

function buildSmsBody(g: Gathering): string {
  return [
    g.title,
    `${formatDate(g.date)} at ${formatTime(g.time)}`,
    g.location ? g.location : null,
    g.notes ? `\n${g.notes}` : null,
  ].filter(Boolean).join("\n");
}

function sendSms(phone: string, body: string) {
  const clean = phone.replace(/\s/g, "");
  window.open(`sms:${clean}?body=${encodeURIComponent(body)}`, "_self");
}

// ─── Past card with families ──────────────────────────────────────────────────

function PastGatheringCard({
  g,
  onEdit,
  onDelete,
  onAddFamily,
  onRemoveFamily,
  onShare,
  isLight,
}: {
  g: Gathering;
  onEdit: (g: Gathering) => void;
  onDelete: (id: string) => void;
  onAddFamily: (id: string, name: string) => void;
  onRemoveFamily: (id: string, name: string) => void;
  onShare: (g: Gathering) => void;
  isLight: boolean;
}) {
  const [addingFamily, setAddingFamily] = useState(false);
  const [familyInput, setFamilyInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commitFamily = () => {
    const name = familyInput.trim();
    if (name) onAddFamily(g.id, name);
    setFamilyInput("");
    setAddingFamily(false);
  };

  return (
    <div className="rounded-2xl border overflow-hidden border-[color:var(--accent,#7c3aed)]/[0.08] bg-[color:var(--fg,#fff)]/[0.02]">
      <div className="px-4 py-3 space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-snug text-[color:var(--fg,#fff)] opacity-70">{g.title}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <span className="text-[10px] text-[color:var(--fg,#fff)]/35">{formatDateShort(g.date)}</span>
              <span className="text-[color:var(--fg,#fff)]/20 text-[10px]">·</span>
              <span className="text-xs text-[color:var(--fg,#fff)]/40">{formatTime(g.time)}</span>
              {g.location && (
                <>
                  <span className="text-[color:var(--fg,#fff)]/20 text-[10px]">·</span>
                  <span className="text-xs text-[color:var(--fg,#fff)]/35 truncate">{g.location}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => onShare(g)}
            title="Share"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[color:var(--fg,#fff)]/[0.05] text-[color:var(--fg,#fff)]/30 hover:text-[color:var(--fg,#fff)]/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {g.notes && (
          <p className="text-xs text-[color:var(--fg,#fff)]/35 leading-relaxed border-t border-[color:var(--fg,#fff)]/[0.06] pt-2.5">
            {g.notes}
          </p>
        )}

        {/* Families hosted section */}
        <div className="border-t border-[color:var(--fg,#fff)]/[0.06] pt-2.5 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--accent,#7c3aed)]/60">
            Families Hosted
          </p>

          {(g.families ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(g.families ?? []).map((fam) => (
                <span
                  key={fam}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: "var(--accent, #7c3aed)" + "18", color: "var(--accent, #7c3aed)", border: "1px solid var(--accent, #7c3aed)" + "30" }}
                >
                  {fam}
                  <button
                    onClick={() => onRemoveFamily(g.id, fam)}
                    className="opacity-50 hover:opacity-100 transition-opacity ml-0.5"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-[color:var(--fg,#fff)]/25 italic">No families logged yet</p>
          )}

          {addingFamily ? (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={familyInput}
                onChange={(e) => setFamilyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitFamily(); if (e.key === "Escape") setAddingFamily(false); }}
                placeholder="Family name…"
                autoFocus
                className="flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", color: "var(--fg, #fff)", border: "1px solid var(--accent, #7c3aed)" + "44" }}
              />
              <button
                onClick={commitFamily}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: "var(--accent, #7c3aed)" }}
              >
                Add
              </button>
              <button
                onClick={() => setAddingFamily(false)}
                className="px-2 py-1.5 rounded-lg text-xs text-[color:var(--fg,#fff)]/40 hover:text-[color:var(--fg,#fff)]/70"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAddingFamily(true); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="flex items-center gap-1.5 text-[10px] font-bold transition-colors"
              style={{ color: "var(--accent, #7c3aed)", opacity: 0.7 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Add family
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 pt-0.5">
          <button
            onClick={() => onEdit(g)}
            className="text-[10px] font-bold text-[color:var(--fg,#fff)]/30 hover:text-[color:var(--fg,#fff)]/60 transition-colors"
          >
            Edit
          </button>
          <span className="text-[color:var(--fg,#fff)]/15 text-[10px]">·</span>
          <button
            onClick={() => onDelete(g.id)}
            className="text-[10px] font-bold text-[color:var(--fg,#fff)]/30 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming card ────────────────────────────────────────────────────────────

function GatheringCard({
  g,
  onEdit,
  onDelete,
  onToggleReminder,
  onShare,
}: {
  g: Gathering;
  onEdit: (g: Gathering) => void;
  onDelete: (id: string) => void;
  onToggleReminder: (g: Gathering) => void;
  onShare: (g: Gathering) => void;
}) {
  const days = daysUntil(g);
  const dayLabel =
    days === 0 ? "Today" :
    days === 1 ? "Tomorrow" :
    `In ${days} days`;

  return (
    <div className="rounded-2xl border overflow-hidden border-[color:var(--accent,#7c3aed)]/25 bg-[color:var(--accent,#7c3aed)]/[0.05]">
      <div className="px-4 py-2 border-b border-[color:var(--accent,#7c3aed)]/15 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--accent,#7c3aed)]/80">
          {dayLabel}
        </span>
        <span className="text-[10px] text-[color:var(--fg,#fff)]/30">{formatDateShort(g.date)}</span>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-snug text-[color:var(--fg,#fff)]">{g.title}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <span className="text-xs text-[color:var(--fg,#fff)]/50">{formatTime(g.time)}</span>
              {g.location && (
                <>
                  <span className="text-[color:var(--fg,#fff)]/20 text-[10px]">·</span>
                  <span className="text-xs text-[color:var(--fg,#fff)]/40 truncate">{g.location}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onShare(g)}
              title="Share gathering"
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[color:var(--fg,#fff)]/[0.05] text-[color:var(--fg,#fff)]/35 hover:text-[color:var(--fg,#fff)]/70 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              onClick={() => onToggleReminder(g)}
              title={g.reminder ? "Reminder on — tap to disable" : "Enable reminder"}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                g.reminder
                  ? "bg-[color:var(--accent,#7c3aed)]/20 text-[color:var(--accent,#7c3aed)]"
                  : "bg-[color:var(--fg,#fff)]/[0.05] text-[color:var(--fg,#fff)]/25 hover:text-[color:var(--fg,#fff)]/50"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {g.notes && (
          <p className="text-xs text-[color:var(--fg,#fff)]/40 leading-relaxed border-t border-[color:var(--fg,#fff)]/[0.06] pt-2.5">
            {g.notes}
          </p>
        )}

        {/* Phone indicator */}
        {g.phone && (
          <div className="flex items-center gap-1.5 border-t border-[color:var(--fg,#fff)]/[0.06] pt-2.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="var(--accent,#7c3aed)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px]" style={{ color: "var(--accent,#7c3aed)", opacity: 0.7 }}>{g.phone}</span>
            <button
              onClick={() => sendSms(g.phone, buildSmsBody(g))}
              className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
              style={{ background: "var(--accent,#7c3aed)" + "20", color: "var(--accent,#7c3aed)" }}
            >
              Send Message
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 pt-0.5">
          <button onClick={() => onEdit(g)} className="text-[10px] font-bold text-[color:var(--fg,#fff)]/30 hover:text-[color:var(--fg,#fff)]/60 transition-colors">Edit</button>
          <span className="text-[color:var(--fg,#fff)]/15 text-[10px]">·</span>
          <button onClick={() => onDelete(g.id)} className="text-[10px] font-bold text-[color:var(--fg,#fff)]/30 hover:text-red-400 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function FellowshipContent() {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) === "white-noir" || theme === "white-noir";
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");
  const [showPast, setShowPast] = useState(false);
  const [copyMsg, setCopyMsg] = useState(false);
  // SMS modal state
  const [smsModal, setSmsModal] = useState<{ g: Gathering; phone: string } | null>(null);

  useEffect(() => {
    const gs = loadGatherings();
    setGatherings(gs);
    if ("Notification" in window) setNotifPerm(Notification.permission);
    scheduleReminders(gs);
  }, []);

  const upcoming = gatherings
    .filter(isUpcoming)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const past = gatherings
    .filter((g) => !isUpcoming(g))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) return;
    if (form.reminder) {
      const granted = await requestNotificationPermission();
      if (granted) setNotifPerm("granted");
    }
    const updated = editId
      ? gatherings.map((g) => (g.id === editId ? { ...form, id: editId } : g))
      : [...gatherings, { ...form, id: uid() }];
    saveGatherings(updated);
    setGatherings(updated);
    scheduleReminders(updated);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm());
  }, [form, editId, gatherings]);

  const handleEdit = useCallback((g: Gathering) => {
    setForm({ title: g.title, location: g.location, date: g.date, time: g.time, notes: g.notes, reminder: g.reminder, phone: g.phone ?? "", families: g.families ?? [] });
    setEditId(g.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = gatherings.filter((g) => g.id !== id);
    saveGatherings(updated);
    setGatherings(updated);
  }, [gatherings]);

  const handleToggleReminder = useCallback(async (g: Gathering) => {
    const nextReminder = !g.reminder;
    if (nextReminder) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setNotifPerm("granted");
    }
    const updated = gatherings.map((x) => x.id === g.id ? { ...x, reminder: nextReminder } : x);
    saveGatherings(updated);
    setGatherings(updated);
    scheduleReminders(updated);
  }, [gatherings]);

  const handleShare = useCallback(async (g: Gathering) => {
    // Show SMS modal with the gathering
    setSmsModal({ g, phone: g.phone ?? "" });
  }, []);

  const handleAddFamily = useCallback((id: string, name: string) => {
    const updated = gatherings.map((g) =>
      g.id === id ? { ...g, families: [...(g.families ?? []).filter((f) => f !== name), name] } : g
    );
    saveGatherings(updated);
    setGatherings(updated);
  }, [gatherings]);

  const handleRemoveFamily = useCallback((id: string, name: string) => {
    const updated = gatherings.map((g) =>
      g.id === id ? { ...g, families: (g.families ?? []).filter((f) => f !== name) } : g
    );
    saveGatherings(updated);
    setGatherings(updated);
  }, [gatherings]);

  return (<>
 <Action onClick={()=>{setShowForm(true);setEditId(null);setForm(emptyForm());}}>New gathering</Action>
 {upcoming.length?<><SectionTitle>Upcoming</SectionTitle>{upcoming.map(g=><Row key={g.id} title={g.title} sub={formatDateShort(g.date)+' / '+formatTime(g.time)+' / '+g.location} onClick={()=>handleEdit(g)}/>)}</>:<Empty title="Fellowship">Gather your community for study and encouragement.</Empty>}
 {past.length>0&&<><SectionTitle>Past gatherings</SectionTitle>{past.map(g=><Row key={g.id} title={g.title} sub={formatDateShort(g.date)} onClick={()=>handleEdit(g)}/>)}</>}
 {showForm&&<Sheet title={editId?'Edit gathering':'A new gathering'} full onClose={()=>setShowForm(false)}>
 {(['title','location','date','time','phone'] as const).map(key=><label className="form-label" key={key}>{key[0].toUpperCase()+key.slice(1)}<input type={key==='date'?'date':key==='time'?'time':key==='phone'?'tel':'text'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
 <label className="form-label">Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={5}/></label>
 <div className="setting-row"><span>Reminders</span><button role="switch" aria-label="Gathering reminders" aria-checked={form.reminder} className={'switch '+(form.reminder?'on':'')} onClick={()=>setForm({...form,reminder:!form.reminder})}><i/></button></div>
 <label className="form-label">Families<input value={form.families.join(', ')} onChange={e=>setForm({...form,families:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/></label>
 <Action disabled={!form.title.trim()} onClick={handleSave}>Save gathering</Action>
 {editId&&<><Row title="Share gathering" onClick={()=>{const g=gatherings.find(x=>x.id===editId);if(g)handleShare(g);}}/><Action secondary onClick={()=>{handleDelete(editId);setShowForm(false);}}>Delete gathering</Action></>}
 </Sheet>}
 {smsModal&&<Sheet title="Share gathering" onClose={()=>setSmsModal(null)}><p className="body-copy" style={{whiteSpace:'pre-line'}}>{buildSmsBody(smsModal.g)}</p><label className="form-label">Phone number<input type="tel" value={smsModal.phone} onChange={e=>setSmsModal({...smsModal,phone:e.target.value})}/></label><Action onClick={()=>{sendSms(smsModal.phone,buildSmsBody(smsModal.g));setSmsModal(null);}} disabled={!smsModal.phone.trim()}>Send message</Action><Action secondary onClick={()=>navigator.clipboard.writeText(buildSmsBody(smsModal.g)).then(()=>setCopyMsg(true))}>{copyMsg?'Copied':'Copy details'}</Action></Sheet>}
 </>);
}
