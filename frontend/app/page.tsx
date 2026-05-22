"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  loadStreak,
  recordLogin,
  getNewBadges,
  BADGES,
  type StreakData,
  type BadgeId,
} from "./lib/streakData";
import {
  loadDevotionalProgress,
  DEVOTIONAL_BADGES,
  type DevotionalBadgeId,
} from "./lib/devotionalProgress";

// ─── Church History Verses ────────────────────────────────────────────────────

interface HistoryVerse {
  reference: string;
  book: string;
  chapter: number;
  text: string;
  event: string;
  year: string;
  history: string;
  color: string;
  accent: string;
}

const HISTORY_VERSES: HistoryVerse[] = [
  {
    reference: "John 1:1",
    book: "John", chapter: 1,
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    event: "Council of Nicaea",
    year: "325 AD",
    color: "from-sky-900/60 to-sky-950/80",
    accent: "text-sky-400",
    history: "When Arius taught that Christ was a created being — 'there was a time when he was not' — the church convened at Nicaea under Emperor Constantine. John 1:1 was the anchor text: if the Word was God from the beginning, he could not have had a beginning. Bishop Athanasius argued from this verse that a less-than-God Christ saves no one. The council affirmed the Son is homoousios — of the same substance as the Father — a position Athanasius would defend alone against emperors and bishops for decades, giving rise to the phrase Athanasius contra mundum: Athanasius against the world.",
  },
  {
    reference: "Romans 1:17",
    book: "Romans", chapter: 1,
    text: "For in it the righteousness of God is revealed from faith for faith, as it is written, 'The righteous shall live by faith.'",
    event: "Luther's Tower Experience",
    year: "c. 1515",
    color: "from-amber-900/60 to-amber-950/80",
    accent: "text-amber-400",
    history: "Martin Luther was a tormented Augustinian monk who hated the phrase 'righteousness of God' — he read it as God's punishing justice against sinners. While studying Romans in his tower cell in Wittenberg, he was struck: the righteousness Paul describes is not demanded from us but given to us, received through faith. 'I felt myself to be reborn and to have gone through open doors into paradise,' he wrote. This single verse ignited the Protestant Reformation. Two years later, Luther nailed his 95 Theses to the Wittenberg church door, and the medieval church was never the same.",
  },
  {
    reference: "Galatians 2:16",
    book: "Galatians", chapter: 2,
    text: "A person is not justified by works of the law but through faith in Jesus Christ.",
    event: "The Reformation Debate",
    year: "1517–1545",
    color: "from-orange-900/60 to-orange-950/80",
    accent: "text-orange-400",
    history: "This verse was the sword of the Reformation. When Rome insisted that justification required both faith and meritorious works — and condemned the Reformers at the Council of Trent (1545–1563) — Luther, Calvin, and Melanchthon all returned to Galatians. Calvin called justification 'the hinge on which all true religion turns.' The Reformers insisted: to add works to faith as the ground of justification is to preach a different gospel. The Council of Trent formally anathematized the Reformation position, a condemnation that formally stands to this day in Roman Catholic canon law.",
  },
  {
    reference: "John 6:37",
    book: "John", chapter: 6,
    text: "All that the Father gives me will come to me, and whoever comes to me I will never cast out.",
    event: "The Synod of Dort",
    year: "1618–1619",
    color: "from-violet-900/60 to-violet-950/80",
    accent: "text-violet-400",
    history: "After Jacobus Arminius and his followers challenged Calvinist teaching on predestination, the Dutch Reformed church convened an international council at Dordrecht with delegates from England, Germany, Switzerland, and the Netherlands. Five points were at stake: total depravity, unconditional election, limited atonement, irresistible grace, and perseverance of the saints — the TULIP doctrines. John 6:37–40 was central: 'All that the Father gives me will come' — election is the Father's act. 'I will never cast out' — preservation is Christ's promise. The Canons of Dort remain one of the most carefully argued theological documents in Christian history.",
  },
  {
    reference: "Acts 5:29",
    book: "Acts", chapter: 5,
    text: "We must obey God rather than men.",
    event: "Diet of Worms",
    year: "1521",
    color: "from-red-900/60 to-red-950/80",
    accent: "text-red-400",
    history: "Standing before Emperor Charles V and the full assembly of the Holy Roman Empire, Martin Luther was ordered to recant his writings. His answer has echoed for five centuries: 'Unless I am convinced by the testimony of the Scriptures or by clear reason — for I do not trust either in the pope or in councils alone, since it is well known that they have often erred and contradicted themselves — I am bound by the Scriptures I have quoted, and my conscience is captive to the Word of God. I cannot and will not recant anything, since it is neither safe nor right to go against conscience. Here I stand. I cannot do otherwise. God help me. Amen.' He was declared an outlaw of the Empire the next day.",
  },
  {
    reference: "2 Timothy 3:16",
    book: "2 Timothy", chapter: 3,
    text: "All Scripture is breathed out by God and profitable for doctrine, for reproof, for correction, for training in righteousness.",
    event: "Sola Scriptura",
    year: "Reformation Era",
    color: "from-emerald-900/60 to-emerald-950/80",
    accent: "text-emerald-400",
    history: "The first of the Five Solas — Scripture alone — was not an invention of the Reformers but a recovery of the early church's conviction. When Rome argued that Scripture and Church Tradition carried equal authority, the Reformers cited 2 Timothy 3:16: God breathed out Scripture; councils and popes are fallible men. Sola Scriptura does not mean 'no creeds or confessions' — Luther, Calvin, and the Westminster Divines all wrote extensive confessional documents. It means Scripture is the supreme and final authority to which all tradition must submit. This principle was the formal cause of the Reformation.",
  },
  {
    reference: "Romans 8:30",
    book: "Romans", chapter: 8,
    text: "And those whom he predestined he also called, and those whom he called he also justified, and those whom he justified he also glorified.",
    event: "Augustine vs. Pelagius",
    year: "410–430 AD",
    color: "from-indigo-900/60 to-indigo-950/80",
    accent: "text-indigo-400",
    history: "Pelagius, a British monk in Rome, taught that human beings have the natural ability to choose good and earn salvation — sin is imitation, not inherited corruption. Augustine of Hippo saw this as the destruction of grace. His debate with Pelagius produced some of the most important theology in Christian history: original sin, the bondage of the will, prevenient and irresistible grace, and predestination. Romans 8:29–30 — the 'golden chain' of salvation — was Augustine's anchor. The Council of Carthage (418 AD) condemned Pelagianism. Augustine's framework became the backbone of both Catholic and Protestant soteriology, though the Reformers argued Rome itself had drifted back toward Pelagius.",
  },
  {
    reference: "Hebrews 4:12",
    book: "Hebrews", chapter: 4,
    text: "For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow, and discerning the thoughts and intentions of the heart.",
    event: "William Tyndale & the English Bible",
    year: "1526–1536",
    color: "from-teal-900/60 to-teal-950/80",
    accent: "text-teal-400",
    history: "William Tyndale believed ordinary English people deserved to read this living Word in their own language. When a church official told him 'we are better to be without God's law than the Pope's,' Tyndale replied: 'I defy the Pope, and all his laws; and if God spare my life, ere many years I will cause a boy that driveth the plough, to know more of the Scripture than thou dost.' He translated the New Testament from Greek and much of the Old Testament from Hebrew — the first printed English Bible from the original languages. He was strangled and burned at the stake in 1536. Eighty percent of the King James Bible (1611) is Tyndale's translation. His dying prayer: 'Lord, open the King of England's eyes.'",
  },
];

// ─── Guided Scripture video ───────────────────────────────────────────────────
// To change the video: update GUIDED_SCRIPTURE_URL with any YouTube watch URL
const GUIDED_SCRIPTURE_URL = "https://www.youtube.com/watch?v=e50Rgh7rGw8";
const GUIDED_SCRIPTURE_EMBED_ID = GUIDED_SCRIPTURE_URL.split("v=")[1]?.split("&")[0] ?? "e50Rgh7rGw8";
const GUIDED_SCRIPTURE_TITLE = "Guided Scripture — 2 Min Devotional";

// ─── Greeting ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

// ─── Share helper ─────────────────────────────────────────────────────────────

async function shareApp() {
  const data = {
    title: "TULIP Bible App",
    text: "Study Scripture with Strong's Concordance, Matthew Henry Commentary, and daily verse. Free & Reformed.",
    url: "https://tulip-bible-app.vercel.app",
  };
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(data);
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(data.url);
      alert("Link copied!");
    }
  } catch {
    // cancelled or unavailable
  }
}

// ─── Article types ────────────────────────────────────────────────────────────

interface MarrowArticle {
  title: string;
  href: string;
  excerpt: string;
  date: string;
  slug: string;
}

interface ArticleContent {
  title: string;
  date: string;
  content: string;
  author?: string;
}

// Returns a stable week number so the same 3 articles show all week
function weekIndex() {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  // Today's church history verse — rotates daily through the 8 entries
  const todayHV = HISTORY_VERSES[new Date().getDate() % HISTORY_VERSES.length];

  const [streakData,        setStreakData]        = useState<StreakData | null>(null);
  const [newBadgeIds,       setNewBadgeIds]       = useState<BadgeId[]>([]);
  const [toastVisible,      setToastVisible]      = useState(false);
  const [greeting,          setGreeting]          = useState("Good Morning");
  const [devotionalBadges,  setDevotionalBadges]  = useState<DevotionalBadgeId[]>([]);
  const [videoOpen,    setVideoOpen]    = useState(false);
  const [historyVerse, setHistoryVerse] = useState<HistoryVerse | null>(null);

  // Articles
  const [articles,        setArticles]        = useState<MarrowArticle[]>([]);
  const [articleLoading,  setArticleLoading]  = useState(false);
  const [openArticle,     setOpenArticle]     = useState<MarrowArticle | null>(null);
  const [articleContent,  setArticleContent]  = useState<ArticleContent | null>(null);
  const [contentLoading,  setContentLoading]  = useState(false);

  useEffect(() => { setGreeting(getGreeting()); }, []);

  // Lock body scroll when article modal is open
  useEffect(() => {
    if (openArticle) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [openArticle]);

  useEffect(() => {
    // Load devotional badges
    const dp = loadDevotionalProgress();
    setDevotionalBadges(dp.badges as DevotionalBadgeId[]);
  }, []);

  useEffect(() => {
    const prev = loadStreak();
    const next = recordLogin();
    const earned = getNewBadges(prev, next);
    setStreakData(next);
    if (earned.length > 0) {
      setNewBadgeIds(earned);
      setToastVisible(true);
      const timer = setTimeout(() => setToastVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch articles once on mount
  useEffect(() => {
    setArticleLoading(true);
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        if (data.articles?.length) setArticles(data.articles);
      })
      .catch(() => {})
      .finally(() => setArticleLoading(false));
  }, []);

  // Open an article and fetch its content
  const openArticleModal = async (article: MarrowArticle) => {
    setOpenArticle(article);
    setArticleContent(null);
    setContentLoading(true);
    try {
      const r = await fetch(`/api/articles/content?url=${encodeURIComponent(article.href)}`);
      const data = await r.json();
      setArticleContent(data);
    } catch {
      setArticleContent({ title: article.title, date: article.date, content: "Could not load article." });
    } finally {
      setContentLoading(false);
    }
  };

  // Weekly pick — 1 article rotating every week, skipping video-only posts
  const weeklyArticles = (() => {
    if (articles.length === 0) return [];
    const base = weekIndex() % articles.length;
    // Try up to articles.length candidates starting from base
    for (let i = 0; i < articles.length; i++) {
      const candidate = articles[(base + i) % articles.length];
      // Skip video/episode posts
      const combined = candidate.title + candidate.excerpt + candidate.href;
      if (/youtube\.com|youtu\.be|marrow\s*show|in this episode|\/marrow-show/i.test(combined)) continue;
      return [candidate];
    }
    return [articles[base]];
  })();

  const earnedBadgeIds = ((streakData?.badges ?? []) as BadgeId[]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── Guided Scripture video modal ──────────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${GUIDED_SCRIPTURE_EMBED_ID}?autoplay=1&rel=0`}
                title={GUIDED_SCRIPTURE_TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white/75">{GUIDED_SCRIPTURE_TITLE}</p>
              <button
                onClick={() => setVideoOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History verse centered modal ──────────────────────────────────────── */}
      {historyVerse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setHistoryVerse(null)}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-3xl border border-white/[0.10] bg-[#161616] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${historyVerse.color} px-5 pt-5 pb-4`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${historyVerse.accent} mb-1`}>
                    {historyVerse.event} · {historyVerse.year}
                  </p>
                  <p className={`text-base font-bold ${historyVerse.accent}`}>{historyVerse.reference}</p>
                </div>
                <button
                  onClick={() => setHistoryVerse(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-colors flex-shrink-0 mt-0.5"
                >✕</button>
              </div>
              <p className="text-sm text-white/80 italic leading-relaxed">&ldquo;{historyVerse.text}&rdquo;</p>
            </div>
            {/* History body */}
            <div className="px-5 py-4 max-h-[45vh] overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25 mb-3">Church History</p>
              <p className="text-[13px] text-white/60 leading-relaxed">{historyVerse.history}</p>
            </div>
            {/* Read Chapter link */}
            <div className="px-5 pb-5">
              <Link
                href={`/lexicon?book=${encodeURIComponent(historyVerse.book)}&chapter=${historyVerse.chapter}`}
                onClick={() => setHistoryVerse(null)}
                className={`block w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] ${historyVerse.accent}`}
              >
                Read {historyVerse.reference} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Article reader modal ─────────────────────────────────────────────── */}
      {openArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOpenArticle(null)}>
          <div className="relative w-full max-w-lg bg-[#141414] rounded-3xl border border-white/[0.09] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.07] flex-shrink-0">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/80">
                    Marrow Ministries
                  </p>
                </div>
                <button onClick={() => setOpenArticle(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-colors flex-shrink-0 -mt-0.5">✕</button>
              </div>
              <h2 className="text-[15px] font-bold text-white/90 leading-snug">
                {articleContent?.title || openArticle.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {articleContent?.author && (
                  <p className="text-[11px] text-white/45 font-medium">
                    By {articleContent.author}
                  </p>
                )}
                {articleContent?.author && (articleContent?.date || openArticle.date) && (
                  <span className="text-white/15 text-[10px]">·</span>
                )}
                {(articleContent?.date || openArticle.date) && (
                  <p className="text-[11px] text-white/25">
                    {new Date((articleContent?.date || openArticle.date) + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            {/* Body */}
            <div className="overflow-y-auto overscroll-contain px-5 py-4" style={{ flex: "1 1 0", minHeight: 0, WebkitOverflowScrolling: "touch" }}>
              {contentLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <span className="text-white/20 text-xs">Loading article…</span>
                </div>
              ) : (
                <>
                  <p className="text-[14px] text-white/65 leading-[1.75] whitespace-pre-wrap">
                    {articleContent?.content || openArticle.excerpt}
                  </p>
                  {/* Attribution footer inside body */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <p className="text-[10px] text-white/20 leading-relaxed">
                      Article by <span className="text-white/35 font-semibold">{articleContent?.author || "Marrow Ministries"}</span> — originally published at{" "}
                      <a href="https://marrowministries.org/articles" target="_blank" rel="noopener noreferrer" className="text-emerald-500/60 underline underline-offset-2">
                        marrowministries.org
                      </a>. All rights reserved.
                    </p>
                  </div>
                </>
              )}
            </div>
            {/* Footer link */}
            <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] flex-shrink-0">
              <a href={openArticle.href} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.09] text-emerald-400/80 transition-all">
                Open on Marrow Ministries →
              </a>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-4">

        {/* ── Header row: greeting + share ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-white/25 uppercase mb-1">
              TULIP Bible App
            </p>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {greeting} 👋
            </h1>
          </div>
          <button
            onClick={shareApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white/50 text-xs font-semibold hover:bg-white/[0.09] hover:text-white/75 transition-all active:scale-95"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Share
          </button>
        </div>

        {/* ── Verse of the Day — church history verse, rotates daily ──────────── */}
        <button
          onClick={() => setHistoryVerse(todayHV)}
          className={`home-votd-card w-full text-left relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${todayHV.color} active:scale-[0.99] transition-all`}
          style={{ minHeight: "185px" }}
        >
          <div
            className="home-votd-overlay absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.06) 0%, transparent 60%), " +
                "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col p-4" style={{ minHeight: "185px" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">
              Verse of the Day
            </p>
            <p className={`text-[10px] font-semibold mb-auto ${todayHV.accent}`}>
              {todayHV.event} · {todayHV.year}
            </p>
            <div className="py-3">
              <p className="text-sm font-light text-white leading-relaxed italic drop-shadow-sm">
                &ldquo;{todayHV.text}&rdquo;
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-white/80 mb-3">{todayHV.reference}</p>
              <div className="flex">
                <span className="flex-1 text-center py-2.5 rounded-xl bg-black/25 backdrop-blur-sm text-white/85 text-xs font-semibold">
                  📜 Read the Full Story
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* ── Featured Articles — Marrow Ministries, rotates weekly ──────────── */}
        <section>
            <div className="flex items-center justify-between px-1 mb-2.5">
              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                Featured
              </p>
              <p className="text-[9px] text-white/15 font-semibold">marrowministries.org</p>
            </div>
            {articleLoading ? (
              <div className="space-y-2.5">
                {[0].map((i) => (
                  <div key={i} className="h-[72px] rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {weeklyArticles.map((article) => (
                  <button
                    key={article.slug}
                    onClick={() => openArticleModal(article)}
                    className="w-full text-left rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] active:scale-[0.99] transition-all px-4 py-3.5 flex items-center gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/80 leading-snug line-clamp-2">{article.title}</p>
                      {article.date && (
                        <p className="text-[10px] text-white/25 mt-0.5">
                          {new Date(article.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white/15 flex-shrink-0">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
        </section>

        {/* ── Guided Scripture ─────────────────────────────────────────────── */}
        <button
          onClick={() => setVideoOpen(true)}
          className="w-full flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] active:scale-[0.98] transition-all px-4 py-3.5 text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-violet-400 ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/85 leading-tight">Guided Scripture</p>
            <p className="text-[11px] text-white/35 mt-0.5">2 min devotional · tap to watch</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white/20 flex-shrink-0">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Badges showcase (earned only) ─────────────────────────────────── */}
        {(earnedBadgeIds.length > 0 || devotionalBadges.length > 0) && (
          <section className="pt-1">
            <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">
              Badges
            </p>
            <div className="grid grid-cols-4 gap-2">
              {earnedBadgeIds.map((id) => {
                const badge = BADGES[id];
                return (
                  <div
                    key={id}
                    title={badge.desc}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-violet-500/35 bg-violet-500/10"
                  >
                    <span className="text-2xl">{badge.emoji}</span>
                    <span className="text-[9px] font-bold text-center leading-tight text-violet-300/90">
                      {badge.label}
                    </span>
                    <span className="text-[8px] font-mono text-violet-400/50">✓ earned</span>
                  </div>
                );
              })}
              {devotionalBadges.map((id) => {
                const badge = DEVOTIONAL_BADGES[id];
                return (
                  <div
                    key={`dev-${id}`}
                    title={badge.desc}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-amber-600/35 bg-amber-600/10"
                  >
                    <span className="text-2xl">{badge.emoji}</span>
                    <span className="text-[9px] font-bold text-center leading-tight text-amber-300/90">
                      {badge.label}
                    </span>
                    <span className="text-[8px] font-mono text-amber-400/50">✓ earned</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Streak — compact, bottom ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-1 pt-1">
          {toastVisible && newBadgeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] text-amber-300/80 text-[10px] font-semibold animate-pulse">
              <span>{BADGES[newBadgeIds[0]].emoji}</span>
              <span>{newBadgeIds.map((id) => BADGES[id].label).join(", ")} unlocked!</span>
            </div>
          )}
          {!toastVisible && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔥</span>
              {streakData && streakData.streak > 0 ? (
                <span className="text-[11px] text-white/25 font-semibold">
                  {streakData.streak}-day streak
                </span>
              ) : (
                <span className="text-[11px] text-white/20">Start your streak today</span>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
