"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gathering {
  id: string;
  title: string;
  location: string;
  date: string;      // ISO date string YYYY-MM-DD
  time: string;      // "HH:MM" 24h
  notes: string;
  reminder: boolean; // whether user wants a reminder
}

const STORE_KEY = "ryc-gatherings";

function loadGatherings(): Gathering[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveGatherings(gs: Gathering[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(gs));
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Reminder scheduling ──────────────────────────────────────────────────────

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
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isUpcoming(g: Gathering): boolean {
  const dt = new Date(`${g.date}T${g.time}`);
  return dt.getTime() > Date.now();
}

// ─── Empty form ───────────────────────────────────────────────────────────────

function emptyForm(): Omit<Gathering, "id"> {
  const today = new Date().toISOString().split("T")[0];
  return { title: "", location: "", date: today, time: "10:00", notes: "", reminder: false };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FellowshipPage() {
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  useEffect(() => {
    const gs = loadGatherings();
    setGatherings(gs);
    if ("Notification" in window) setNotifPerm(Notification.permission);
    scheduleReminders(gs);
  }, []);

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
    setForm({ title: g.title, location: g.location, date: g.date, time: g.time, notes: g.notes, reminder: g.reminder });
    setEditId(g.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = gatherings.filter((g) => g.id !== id);
    saveGatherings(updated);
    setGatherings(updated);
  }, [gatherings]);

  const toggleReminder = useCallback(async (g: Gathering) => {
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

  const displayed = filter === "upcoming"
    ? gatherings.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    : [...gatherings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 space-y-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Home Gatherings</h1>
            <p className="text-xs text-white/35 mt-0.5">Track fellowship meetings · get reminders</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors active:scale-95"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        </div>

        {/* ── Notification permission banner ──────────────────────────────── */}
        {notifPerm === "denied" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 text-xs text-amber-300">
            Notifications are blocked. Enable them in browser settings to receive gathering reminders.
          </div>
        )}

        {/* ── Filter tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] w-fit">
          {(["upcoming", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {f === "upcoming" ? "Upcoming" : "All"}
            </button>
          ))}
        </div>

        {/* ── Gathering cards ───────────────────────────────────────────────── */}
        {displayed.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">🏠</div>
            <p className="text-white/40 text-sm font-semibold">No gatherings yet</p>
            <p className="text-white/25 text-xs">Add your first home fellowship meeting to track it and get reminders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((g) => {
              const upcoming = isUpcoming(g);
              return (
                <div
                  key={g.id}
                  className={`rounded-2xl border p-4 space-y-3 ${
                    upcoming
                      ? "border-violet-500/25 bg-violet-500/[0.06]"
                      : "border-white/[0.07] bg-white/[0.02] opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white leading-snug">{g.title}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        <span className="text-xs text-white/50">{formatDate(g.date)}</span>
                        <span className="text-white/20 text-[10px]">·</span>
                        <span className="text-xs text-white/50">{g.time}</span>
                        {g.location && (
                          <>
                            <span className="text-white/20 text-[10px]">·</span>
                            <span className="text-xs text-white/40 truncate">{g.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Reminder bell */}
                    <button
                      onClick={() => toggleReminder(g)}
                      title={g.reminder ? "Reminder on — tap to disable" : "Enable reminder"}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        g.reminder
                          ? "bg-violet-500/20 text-violet-400"
                          : "bg-white/[0.05] text-white/25 hover:text-white/50"
                      }`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {g.notes && (
                    <p className="text-xs text-white/40 leading-relaxed border-t border-white/[0.06] pt-2">{g.notes}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(g)}
                      className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors"
                    >
                      Edit
                    </button>
                    <span className="text-white/15">·</span>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-[10px] font-bold text-white/30 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Add / Edit form sheet ──────────────────────────────────────────── */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end"
            onClick={() => setShowForm(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] px-5 pb-8 pt-4 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <p className="text-sm font-black text-white">{editId ? "Edit Gathering" : "New Gathering"}</p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 block">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Tuesday Bible Study"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 block">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. 123 Oak St / John's home"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 block">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 block">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 block">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Study topic, what to bring, etc."
                    rows={3}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>

                {/* Reminder toggle */}
                <button
                  onClick={() => setForm((f) => ({ ...f, reminder: !f.reminder }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    form.reminder
                      ? "border-violet-500/30 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={form.reminder ? "text-violet-400" : "text-white/30"}>
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${form.reminder ? "text-violet-300" : "text-white/60"}`}>
                        Set reminder
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">1 day before + morning of</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    form.reminder ? "border-violet-400 bg-violet-500" : "border-white/20"
                  }`}>
                    {form.reminder && <span className="text-white text-[10px]">✓</span>}
                  </div>
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 font-bold text-sm hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editId ? "Save Changes" : "Add Gathering"}
                </button>
              </div>

              <div style={{ height: "max(env(safe-area-inset-bottom), 8px)" }} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
