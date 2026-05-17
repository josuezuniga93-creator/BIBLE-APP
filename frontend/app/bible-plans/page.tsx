"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BIBLE_PLANS,
  BiblePlan,
  generateSchedule,
  getTodaysPlanDay,
  getPlanProgress,
} from "../lib/biblePlansData";

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "tulip_bible_plans_v1";
const COMPLETION_KEY = "tulip_plans_completion_v1";

type CompletionMap = Record<string, boolean>;

interface SavedPlan {
  planId: string;
  startDate: string; // ISO date string
}

function loadSavedPlans(): SavedPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlans(plans: SavedPlan[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function loadCompletion(): CompletionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COMPLETION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompletion(map: CompletionMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETION_KEY, JSON.stringify(map));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function endDateIso(startIso: string, totalDays: number): string {
  const [y, m, d] = startIso.split("-").map(Number);
  const end = new Date(y, m - 1, d + totalDays - 1);
  return end.toISOString().split("T")[0];
}

// Parse "Matthew 1", "1 Kings 3", "Song of Solomon 5" → { book, chapter }
function parseReading(label: string): { book: string; chapter: string } | null {
  const match = label.match(/^(.+?)\s+(\d+)(?:-\d+)?$/);
  if (match) return { book: match[1].trim(), chapter: match[2] };
  return null;
}

function buildCompletionKey(planId: string, dayNum: number, label: string): string {
  const parsed = parseReading(label);
  if (!parsed) return `${planId}:${dayNum}:${label}`;
  return `${planId}:${dayNum}:${parsed.book}:${parsed.chapter}`;
}

function buildLexiconUrl(label: string): string {
  const parsed = parseReading(label);
  if (!parsed) return "/lexicon";
  return `/lexicon?book=${encodeURIComponent(parsed.book)}&chapter=${parsed.chapter}`;
}

// ─── Plan Card (catalog) ──────────────────────────────────────────────────────

function PlanCard({
  plan,
  isActive,
  onStart,
  onView,
}: {
  plan: BiblePlan;
  isActive: boolean;
  onStart: () => void;
  onView: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isActive
          ? "border-violet-500/40 bg-violet-500/[0.06]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{plan.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-base">{plan.name}</h3>
            {isActive && (
              <span className="text-[10px] font-black text-violet-300 bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-white/30">
              {plan.totalDays} days
            </span>
            <span className="text-white/15">·</span>
            <span className="text-xs text-white/30">
              {typeof plan.chaptersPerDay === "number"
                ? `${plan.chaptersPerDay} ch/day`
                : "~3–4 ch/day"}
            </span>
            <span className="text-white/15">·</span>
            <span
              className={`text-xs font-semibold ${
                plan.testament === "OT"
                  ? "text-amber-400"
                  : plan.testament === "NT"
                  ? "text-violet-400"
                  : "text-emerald-400"
              }`}
            >
              {plan.testament === "FULL"
                ? "Full Bible"
                : plan.testament === "OT"
                ? "Old Testament"
                : "New Testament"}
            </span>
          </div>
        </div>
      </div>
      <p className="text-white/50 text-sm leading-6 mb-4">{plan.description}</p>
      <div className="flex gap-2">
        {isActive ? (
          <button
            onClick={onView}
            className="flex-1 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-bold hover:bg-violet-600/30 transition-colors"
          >
            View My Plan
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 text-sm font-bold hover:text-white/90 hover:bg-white/[0.10] transition-colors"
          >
            Start This Plan
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Active Plan View ─────────────────────────────────────────────────────────

function ActivePlanView({
  plan,
  startDate,
  onClose,
  onRemove,
}: {
  plan: BiblePlan;
  startDate: string;
  onClose: () => void;
  onRemove: () => void;
}) {
  const start = useMemo(() => {
    const [y, m, d] = startDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [startDate]);

  const progress = useMemo(() => getPlanProgress(plan, start), [plan, start]);
  const todayEntry = useMemo(() => getTodaysPlanDay(plan, start), [plan, start]);
  const endIso = endDateIso(startDate, plan.totalDays);

  // Completion tracking
  const [completion, setCompletion] = useState<CompletionMap>({});

  useEffect(() => {
    setCompletion(loadCompletion());
  }, []);

  const toggleCompletion = (dayNum: number, label: string) => {
    const key = buildCompletionKey(plan.id, dayNum, label);
    setCompletion((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      saveCompletion(next);
      return next;
    });
  };

  const isCompleted = (dayNum: number, label: string): boolean =>
    !!completion[buildCompletionKey(plan.id, dayNum, label)];

  // Always compute upcoming entries (next 7 days from today)
  const upcomingEntries = useMemo(() => {
    const today = todayIso();
    const fullSchedule = generateSchedule(plan, start);
    const entries = Array.from(fullSchedule.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return entries.filter(([d]) => d >= today).slice(0, 7);
  }, [plan, start]);

  // Today's chapter completion counts
  const todayReadCount = todayEntry
    ? todayEntry.readings.filter((r) => isCompleted(todayEntry.day, r.label)).length
    : 0;
  const todayTotal = todayEntry ? todayEntry.readings.length : 0;

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        ← Back to plans
      </button>

      {/* Plan header */}
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.05] p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">{plan.icon}</span>
          <div>
            <h2 className="text-white font-bold text-lg">{plan.name}</h2>
            <p className="text-white/40 text-xs mt-0.5">
              Started {formatDate(startDate)} · Ends {formatDate(endIso)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Day {progress.daysElapsed} of {progress.totalDays}</span>
            <span>{progress.percentComplete}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Today's reading */}
      {todayEntry ? (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
              📖 Today&apos;s Reading — Day {todayEntry.day}
            </p>
            {todayTotal > 0 && (
              <span className="text-xs text-emerald-300/70 font-semibold">
                {todayReadCount}/{todayTotal} read
              </span>
            )}
          </div>

          <div className="space-y-2">
            {todayEntry.readings.map((r, i) => {
              const done = isCompleted(todayEntry.day, r.label);
              const lexUrl = buildLexiconUrl(r.label);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    done
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-white/[0.03] border-white/[0.05]"
                  }`}
                >
                  {/* Custom checkbox */}
                  <button
                    onClick={() => toggleCompletion(todayEntry.day, r.label)}
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-white/20 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                    }`}
                    aria-label={done ? "Mark unread" : "Mark read"}
                  >
                    {done && (
                      <span className="text-[10px] font-black leading-none">✓</span>
                    )}
                  </button>

                  {/* Chapter link */}
                  <a
                    href={lexUrl}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      done
                        ? "text-emerald-300/60 line-through"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {r.label}
                  </a>

                  <span className="text-white/20 text-xs flex-shrink-0">📖</span>
                </div>
              );
            })}
          </div>

          {/* Today progress bar */}
          {todayTotal > 0 && (
            <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.round((todayReadCount / todayTotal) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ) : progress.daysElapsed === 0 ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 text-center">
          <p className="text-amber-400 font-semibold text-sm">Plan starts {formatDate(startDate)}</p>
          <p className="text-white/30 text-xs mt-1">Your first reading will appear here when the plan begins.</p>
        </div>
      ) : progress.daysElapsed >= progress.totalDays ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-emerald-400 font-bold text-base">You completed this plan!</p>
          <p className="text-white/30 text-sm mt-1">God&apos;s Word is a lamp to your feet and a light to your path.</p>
        </div>
      ) : null}

      {/* Upcoming readings */}
      {upcomingEntries.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">
            Upcoming Readings
          </p>
          <div className="space-y-2">
            {upcomingEntries.map(([isoDate, entry]) => {
              const isToday = isoDate === todayIso();
              return (
                <div
                  key={isoDate}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isToday
                      ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                      : "border-white/[0.05] bg-white/[0.01]"
                  }`}
                >
                  <div className="flex-shrink-0 text-right w-16">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isToday ? "text-emerald-400" : "text-white/25"
                      }`}
                    >
                      {isToday ? "Today" : formatDate(isoDate).split(",")[0]}
                    </p>
                    <p className="text-[9px] text-white/20">Day {entry.day}</p>
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {entry.readings.map((r, i) => (
                      <p key={i} className="text-white/60 text-xs leading-5 flex items-center gap-1.5">
                        {isToday && (
                          <span
                            className={`flex-shrink-0 w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] font-black ${
                              isCompleted(entry.day, r.label)
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-white/20"
                            }`}
                          >
                            {isCompleted(entry.day, r.label) && "✓"}
                          </span>
                        )}
                        {isToday ? (
                          <a
                            href={buildLexiconUrl(r.label)}
                            className="hover:text-white/90 transition-colors"
                          >
                            {r.label}
                          </a>
                        ) : (
                          r.label
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remove plan */}
      <div className="pt-2 text-center">
        <button
          onClick={onRemove}
          className="text-xs text-white/20 hover:text-red-400 transition-colors"
        >
          Remove this plan
        </button>
      </div>
    </div>
  );
}

// ─── Start Plan Modal ─────────────────────────────────────────────────────────

function StartPlanModal({
  plan,
  onConfirm,
  onCancel,
}: {
  plan: BiblePlan;
  onConfirm: (startDate: string) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState(todayIso());

  return (
    <div className="rounded-2xl border border-white/[0.10] bg-[#1a1a1a] p-6 space-y-5">
      <div>
        <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-1">Starting</p>
        <h3 className="text-white font-bold text-lg">{plan.name}</h3>
        <p className="text-white/40 text-sm mt-1">{plan.description}</p>
      </div>
      <div>
        <label className="text-xs text-white/40 font-bold uppercase tracking-widest block mb-2">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <p className="text-xs text-white/25 mt-2">
          You&apos;ll finish on {formatDate(endDateIso(startDate, plan.totalDays))}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(startDate)}
          className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-colors"
        >
          Start Plan
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-semibold hover:text-white/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BiblePlansPage() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);
  const [startingPlan, setStartingPlan] = useState<BiblePlan | null>(null);

  useEffect(() => {
    setSavedPlans(loadSavedPlans());
    setMounted(true);
  }, []);

  const isActive = (planId: string) => savedPlans.some((p) => p.planId === planId);

  const handleStart = (plan: BiblePlan, startDate: string) => {
    const updated = [
      ...savedPlans.filter((p) => p.planId !== plan.id),
      { planId: plan.id, startDate },
    ];
    setSavedPlans(updated);
    savePlans(updated);
    setStartingPlan(null);
    setViewingPlanId(plan.id);
  };

  const handleRemove = (planId: string) => {
    const updated = savedPlans.filter((p) => p.planId !== planId);
    setSavedPlans(updated);
    savePlans(updated);
    setViewingPlanId(null);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  const viewingPlan = viewingPlanId ? BIBLE_PLANS.find((p) => p.id === viewingPlanId) : null;
  const viewingStart = viewingPlanId
    ? savedPlans.find((p) => p.planId === viewingPlanId)?.startDate
    : null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-6">
        <div className="mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
            Bible Reading Plans
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
          Read Through the Bible
        </h1>
        <p className="text-white/40 text-sm leading-relaxed">
          Structured plans to guide you through God&apos;s Word — at your own pace. Start any plan,
          see today&apos;s reading, and stay on track all year.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        {/* Active plan summary strip */}
        {savedPlans.length > 0 && !viewingPlanId && (
          <div className="mb-6 space-y-2">
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-2">
              Your Active Plans
            </p>
            {savedPlans.map((sp) => {
              const plan = BIBLE_PLANS.find((p) => p.id === sp.planId);
              if (!plan) return null;
              const [y, m, d] = sp.startDate.split("-").map(Number);
              const start = new Date(y, m - 1, d);
              const progress = getPlanProgress(plan, start);
              return (
                <button
                  key={sp.planId}
                  onClick={() => setViewingPlanId(sp.planId)}
                  className="w-full text-left rounded-xl border border-violet-500/25 bg-violet-500/[0.05] px-4 py-3 hover:bg-violet-500/[0.10] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{plan.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-semibold">{plan.name}</p>
                      <p className="text-white/30 text-xs">
                        Day {progress.daysElapsed}/{progress.totalDays} · {progress.percentComplete}% complete
                      </p>
                    </div>
                    <span className="text-white/25 text-xs">→</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${progress.percentComplete}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Start modal */}
        {startingPlan && (
          <div className="mb-6">
            <StartPlanModal
              plan={startingPlan}
              onConfirm={(date) => handleStart(startingPlan, date)}
              onCancel={() => setStartingPlan(null)}
            />
          </div>
        )}

        {/* Active plan detail view */}
        {viewingPlan && viewingStart ? (
          <ActivePlanView
            plan={viewingPlan}
            startDate={viewingStart}
            onClose={() => setViewingPlanId(null)}
            onRemove={() => handleRemove(viewingPlan.id)}
          />
        ) : (
          <>
            {/* Plan catalog */}
            {!startingPlan && (
              <>
                <p className="text-xs text-white/25 font-bold uppercase tracking-widest mb-3">
                  All Reading Plans
                </p>
                <div className="space-y-4">
                  {BIBLE_PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isActive={isActive(plan.id)}
                      onStart={() => setStartingPlan(plan)}
                      onView={() => setViewingPlanId(plan.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Why read the Bible section */}
            {!startingPlan && (
              <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6">
                <p className="text-xs text-white/25 font-bold uppercase tracking-widest mb-4">
                  Why Read Through the Entire Bible?
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: "📖",
                      text: "Scripture is one unified story of redemption — reading it fully reveals how every part connects to Christ.",
                    },
                    {
                      icon: "🌱",
                      text: '"Man does not live by bread alone, but by every word that comes from the mouth of God." — Matthew 4:4',
                    },
                    {
                      icon: "🛡",
                      text: "The whole counsel of God protects against error. Selective reading leaves you vulnerable to distortion.",
                    },
                    {
                      icon: "🔥",
                      text: '"Is not my word like fire, declares the LORD, and like a hammer that breaks the rock in pieces?" — Jeremiah 23:29',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <p className="text-white/45 text-sm leading-6">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
