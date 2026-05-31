"use client";

/**
 * /preview — Cinematic dark home page redesign (v1)
 *
 * This is a parallel route that mirrors the data on the live home page (/),
 * restyled with a bold cinematic dark aesthetic and a gold accent. It is
 * mounted at /preview so the existing home page is untouched and you can
 * compare on-device. If approved, swap the contents of this file into
 * frontend/app/page.tsx.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  loadStreak,
  recordLogin,
  type StreakData,
} from "../lib/streakData";
import { useLanguage } from "../lib/useLanguage";

// ─── Church history verses (same data shape as the live home page) ─────────────
interface HistoryVerse {
  reference: string;
  book: string;
  chapter: number;
  text: string;
  event: string;
  year: string;
  history: string;
  // Per-verse accent that stays subtle inside the gold theme
  glow: string;
}

const HISTORY_VERSES: HistoryVerse[] = [
  {
    reference: "John 1:1",
    book: "John", chapter: 1,
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    event: "Council of Nicaea", year: "325 AD",
    history:
      "When Arius taught that Christ was a created being, Athanasius argued from John 1:1 that the Son is of the same substance as the Father. The Council of Nicaea affirmed the eternal deity of Christ.",
    glow: "rgba(56,189,248,0.18)",
  },
  {
    reference: "Romans 1:17",
    book: "Romans", chapter: 1,
    text: "The righteous shall live by faith.",
    event: "Luther's Tower Experience", year: "c. 1515",
    history:
      "Reading Romans in his Wittenberg tower, Luther discovered that the righteousness of God is given to us through faith, not demanded from us. This single verse ignited the Protestant Reformation.",
    glow: "rgba(245,158,11,0.18)",
  },
  {
    reference: "Galatians 2:16",
    book: "Galatians", chapter: 2,
    text: "A person is not justified by works of the law but through faith in Jesus Christ.",
    event: "The Reformation Debate", year: "1517–1545",
    history:
      "Calvin called justification by faith 'the hinge on which all true religion turns.' Galatians 2:16 was the sword of the Reformation against Rome's insistence on faith plus meritorious works.",
    glow: "rgba(249,115,22,0.18)",
  },
  {
    reference: "John 6:37",
    book: "John", chapter: 6,
    text: "All that the Father gives me will come to me, and whoever comes to me I will never cast out.",
    event: "The Synod of Dort", year: "1618–1619",
    history:
      "The Canons of Dort defended the five points later known as TULIP. John 6:37 was central: election is the Father's act; preservation is Christ's promise.",
    glow: "rgba(139,92,246,0.18)",
  },
  {
    reference: "Acts 5:29",
    book: "Acts", chapter: 5,
    text: "We must obey God rather than men.",
    event: "Diet of Worms", year: "1521",
    history:
      "Standing alone before Emperor Charles V, Luther refused to recant: 'Here I stand. I cannot do otherwise. God help me. Amen.' He was declared an outlaw of the Empire the next day.",
    glow: "rgba(239,68,68,0.18)",
  },
  {
    reference: "2 Timothy 3:16",
    book: "2 Timothy", chapter: 3,
    text: "All Scripture is breathed out by God.",
    event: "Sola Scriptura", year: "Reformation Era",
    history:
      "Sola Scriptura — Scripture alone — was the formal cause of the Reformation. The Reformers held that Scripture is the supreme and final authority to which all tradition must submit.",
    glow: "rgba(16,185,129,0.18)",
  },
  {
    reference: "Romans 8:30",
    book: "Romans", chapter: 8,
    text: "And those whom he predestined he also called, and those whom he called he also justified, and those whom he justified he also glorified.",
    event: "Augustine vs. Pelagius", year: "410–430 AD",
    history:
      "Augustine's debate with Pelagius produced original sin, the bondage of the will, and predestination — the 'golden chain' of Romans 8 became the backbone of Christian soteriology.",
    glow: "rgba(99,102,241,0.18)",
  },
  {
    reference: "Hebrews 4:12",
    book: "Hebrews", chapter: 4,
    text: "For the word of God is living and active, sharper than any two-edged sword.",
    event: "Tyndale & the English Bible", year: "1526–1536",
    history:
      "William Tyndale was burned at the stake for translating Scripture into English. Eighty percent of the King James Bible is his translation. His dying prayer: 'Lord, open the King of England's eyes.'",
    glow: "rgba(20,184,166,0.18)",
  },
];

const FEATURED_VIDEOS = {
  en: { file: "/videos/featured-en.mp4", youtubeId: "e50Rgh7rGw8", title: "Featured Meditation of Scripture" },
  es: { file: "/videos/featured-es.mp4", youtubeId: "", title: "Meditación Destacada de la Escritura" },
};

interface MarrowArticle { title: string; href: string; excerpt: string; date: string; slug: string; }
function weekIndex() { return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); }

function dayOfWeekIndex() {
  // Sunday = 0 (matches our streak strip)
  return new Date().getDay();
}

export default function PreviewHome() {
  const today = new Date();
  const todayHV = HISTORY_VERSES[today.getDate() % HISTORY_VERSES.length];

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { lang } = useLanguage();
  const featuredVideo = FEATURED_VIDEOS[lang as "en" | "es"] ?? FEATURED_VIDEOS.en;

  const [articles, setArticles] = useState<MarrowArticle[]>([]);
  const [articleLoading, setArticleLoading] = useState(false);

  useEffect(() => {
    const next = recordLogin();
    setStreakData(next);
  }, []);

  useEffect(() => {
    setArticleLoading(true);
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { if (data.articles?.length) setArticles(data.articles); })
      .catch(() => {})
      .finally(() => setArticleLoading(false));
  }, []);

  const weeklyArticle = (() => {
    if (articles.length === 0) return null;
    const base = weekIndex() % articles.length;
    for (let i = 0; i < articles.length; i++) {
      const c = articles[(base + i) % articles.length];
      const combined = c.title + c.excerpt + c.href;
      if (/youtube\.com|youtu\.be|marrow\s*show|in this episode|\/marrow-show/i.test(combined)) continue;
      return c;
    }
    return articles[base];
  })();

  const todayIdx = dayOfWeekIndex();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const streak = streakData?.streak ?? 0;
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dayUpper = dayName.toUpperCase();

  // Pull the most memorable two-line phrase from the verse text
  // (falls back to verse text if it isn't a famous phrase)
  const heroHeadline = todayHV.event === "Diet of Worms"
    ? ["Here I stand.", "I cannot do otherwise."]
    : todayHV.text.split(/[,.]/).map((s) => s.trim()).filter(Boolean).slice(0, 2);

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: "#050507" }}
    >
      {/* Radial purple-to-navy glow at top */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
        style={{
          background:
            `radial-gradient(60% 80% at 50% 0%, ${todayHV.glow} 0%, transparent 70%), ` +
            `radial-gradient(120% 80% at 50% 0%, rgba(59,42,107,0.35) 0%, rgba(17,10,38,0.0) 60%)`,
        }}
      />

      {/* ── History verse modal ───────────────────────────────────────────── */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setHistoryOpen(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-3xl border border-[#c9a961]/30 bg-[#0a0a0f] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#c9a961] uppercase mb-1">
                {todayHV.event} · {todayHV.year}
              </p>
              <p className="text-lg font-bold text-white">{todayHV.reference}</p>
              <p className="mt-3 text-sm italic text-white/70 leading-relaxed font-serif">
                &ldquo;{todayHV.text}&rdquo;
              </p>
            </div>
            <div className="px-5 py-4 max-h-[45vh] overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Church History
              </p>
              <p className="text-[13px] text-white/65 leading-relaxed">{todayHV.history}</p>
            </div>
            <div className="px-5 pb-5">
              <Link
                href={`/lexicon?book=${encodeURIComponent(todayHV.book)}&chapter=${todayHV.chapter}`}
                onClick={() => setHistoryOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl text-xs font-bold bg-[#c9a961]/15 border border-[#c9a961]/40 text-[#c9a961]"
              >
                Read {todayHV.reference} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Meditation video modal ──────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black flex flex-col"
          onClick={() => setVideoOpen(false)}
        >
          <button
            onClick={() => setVideoOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white/70"
          >✕</button>
          <div className="flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <video src={featuredVideo.file} autoPlay controls playsInline className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = "none";
                const iframe = document.getElementById("preview-yt-fallback");
                if (iframe) iframe.style.display = "block";
              }}
            />
            {featuredVideo.youtubeId && (
              <iframe id="preview-yt-fallback" style={{ display: "none" }}
                src={`https://www.youtube-nocookie.com/embed/${featuredVideo.youtubeId}?autoplay=1&rel=0`}
                title={featuredVideo.title} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="w-full h-full"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className="relative max-w-lg mx-auto px-5 pt-10 pb-28">

        {/* Top brand row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c9a961, #8b6f2e)" }}
            >
              {/* Simple tulip glyph */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 4 C8 4, 5 8, 5 13 C5 16, 7 18, 9 18 L9 12 C9 7, 12 4, 12 4 Z M12 4 C12 4, 15 7, 15 12 L15 18 C17 18, 19 16, 19 13 C19 8, 16 4, 12 4 Z" fill="#1a0e2e"/>
                <path d="M12 18 L12 22" stroke="#1a0e2e" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold tracking-tight text-white leading-none">TULIP</p>
              <p className="text-[9px] tracking-wider text-[#c9a961]/80 mt-1 uppercase">Rebuttal Your Church</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/60">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <Link href="/more" className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/60">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6 8c0-3 3-5 6-5s6 2 6 5v5l2 3H4l2-3V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Hero — date label + serif headline */}
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#c9a961] uppercase mb-3">
          {dayUpper}{streak > 0 ? ` · DAY ${streak}` : ""}
        </p>
        <h1
          className="text-[40px] leading-[1.04] font-normal text-white tracking-tight"
          style={{ fontFamily: "'Iowan Old Style','Georgia','Times New Roman',serif" }}
        >
          {heroHeadline[0] || todayHV.event}
        </h1>
        {heroHeadline[1] && (
          <h2
            className="text-[40px] leading-[1.04] italic text-white/55 tracking-tight mb-5"
            style={{ fontFamily: "'Iowan Old Style','Georgia','Times New Roman',serif" }}
          >
            {heroHeadline[1]}
          </h2>
        )}

        {/* Pill badges — event + year */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#c9a961]/35 bg-[#c9a961]/[0.10] text-[#c9a961]">
            {todayHV.event}
          </span>
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 bg-white/[0.04] text-white/55">
            {todayHV.year}
          </span>
        </div>

        {/* Italic serif blockquote */}
        <p
          className="text-[14px] text-white/72 italic leading-[1.55] mb-6"
          style={{ fontFamily: "'Iowan Old Style','Georgia','Times New Roman',serif" }}
        >
          &ldquo;{todayHV.text}&rdquo;
        </p>

        {/* Gold CTA card — Read the full story */}
        <button
          onClick={() => setHistoryOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-[#c9a961]/40 active:scale-[0.99] transition-all"
          style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.18), rgba(201,169,97,0.05))" }}
        >
          <div className="text-left">
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#c9a961]/85 uppercase">
              {todayHV.reference}
            </p>
            <p className="text-[14px] font-bold text-white mt-0.5">Read the full story</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#c9a961]">
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Continue section ─────────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white">Continue</h3>
            <Link href="/library" className="text-[11px] font-semibold text-white/40 hover:text-white/70">See all</Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
            {/* Featured meditation video — emerald */}
            <button
              onClick={() => setVideoOpen(true)}
              className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1a4a3a, #0a1f18)" }}
            >
              <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center self-end">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] text-emerald-300/80 uppercase">Meditation</p>
                <p className="text-[12px] font-bold text-white leading-snug mt-0.5">{featuredVideo.title}</p>
                <p className="text-[10px] text-white/40 mt-1.5">Tap to watch</p>
              </div>
            </button>

            {/* Featured article — amber */}
            {weeklyArticle && (
              <a
                href={weeklyArticle.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #4a2a1a, #1f140a)" }}
              >
                <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center self-end">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="5" y="4" width="14" height="16" rx="1.5"/>
                    <path d="M9 4v16"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.15em] text-amber-300/80 uppercase">Article</p>
                  <p className="text-[12px] font-bold text-white leading-snug mt-0.5 line-clamp-3">{weeklyArticle.title}</p>
                  <p className="text-[10px] text-white/40 mt-1.5">5 min read</p>
                </div>
              </a>
            )}

            {/* Bible reading — violet */}
            <Link
              href="/lexicon"
              className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #3a1a3a, #18091a)" }}
            >
              <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center self-end">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 6c0-1 1-2 2-2h12c1 0 2 1 2 2v14H6c-1 0-2-1-2-2V6Z"/>
                  <path d="M4 18c0-1 1-2 2-2h14"/>
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] text-violet-300/80 uppercase">Scripture</p>
                <p className="text-[12px] font-bold text-white leading-snug mt-0.5">Read with Lexicon</p>
                <p className="text-[10px] text-white/40 mt-1.5">Strong&apos;s + commentary</p>
              </div>
            </Link>
          </div>

          {articleLoading && articles.length === 0 && (
            <div className="text-[10px] text-white/30 px-1 mt-2">Loading articles…</div>
          )}
        </section>

        {/* ── Your streak ─────────────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white">Your streak</h3>
            <p className="text-[12px] font-bold text-[#c9a961]">{streak} {streak === 1 ? "day" : "days"}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-3 py-4 flex justify-between">
            {dayLabels.map((d, i) => {
              const isCurrent = i === todayIdx;
              const isDone = i < todayIdx && i >= Math.max(0, todayIdx - streak + 1);
              return (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <div
                    className={
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] " +
                      (isDone
                        ? "bg-[#c9a961] text-[#1a0e2e]"
                        : isCurrent
                          ? "bg-[#c9a961]/15 border border-[#c9a961]"
                          : "bg-white/[0.05]")
                    }
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-[#c9a961]"/>}
                  </div>
                  <span className={"text-[10px] " + (isCurrent ? "text-white font-semibold" : "text-white/35")}>{d}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Compare ribbon — link back to the live home ─────────────────── */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-white/30">
          <span>You&rsquo;re viewing the redesign preview.</span>
          <Link href="/" className="text-[#c9a961]/80 underline-offset-2 underline">← Back to current home</Link>
        </div>
      </main>
    </div>
  );
}
