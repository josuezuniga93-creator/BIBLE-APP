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
import { useLanguage } from "./lib/useLanguage";

// ─── Church History Verses ────────────────────────────────────────────────────

interface HistoryVerse {
  reference: string;
  book: string;
  chapter: number;
  text: string;
  event: string;
  year: string;
  history: string;
  glow: string;
}

const HISTORY_VERSES: HistoryVerse[] = [
  {
    reference: "John 1:1",
    book: "John", chapter: 1,
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    event: "Council of Nicaea",
    year: "325 AD",
    glow: "rgba(56,189,248,0.18)",
    history:
      "When Arius taught that Christ was a created being — 'there was a time when he was not' — the church convened at Nicaea under Emperor Constantine. John 1:1 was the anchor text: if the Word was God from the beginning, he could not have had a beginning. Bishop Athanasius argued from this verse that a less-than-God Christ saves no one. The council affirmed the Son is homoousios — of the same substance as the Father — a position Athanasius would defend alone against emperors and bishops for decades, giving rise to the phrase Athanasius contra mundum: Athanasius against the world.",
  },
  {
    reference: "Romans 1:17",
    book: "Romans", chapter: 1,
    text: "For in it the righteousness of God is revealed from faith for faith, as it is written, 'The righteous shall live by faith.'",
    event: "Luther's Tower Experience",
    year: "c. 1515",
    glow: "rgba(245,158,11,0.18)",
    history:
      "Martin Luther was a tormented Augustinian monk who hated the phrase 'righteousness of God' — he read it as God's punishing justice against sinners. While studying Romans in his tower cell in Wittenberg, he was struck: the righteousness Paul describes is not demanded from us but given to us, received through faith. 'I felt myself to be reborn and to have gone through open doors into paradise,' he wrote. This single verse ignited the Protestant Reformation. Two years later, Luther nailed his 95 Theses to the Wittenberg church door, and the medieval church was never the same.",
  },
  {
    reference: "Galatians 2:16",
    book: "Galatians", chapter: 2,
    text: "A person is not justified by works of the law but through faith in Jesus Christ.",
    event: "The Reformation Debate",
    year: "1517–1545",
    glow: "rgba(249,115,22,0.18)",
    history:
      "This verse was the sword of the Reformation. When Rome insisted that justification required both faith and meritorious works — and condemned the Reformers at the Council of Trent (1545–1563) — Luther, Calvin, and Melanchthon all returned to Galatians. Calvin called justification 'the hinge on which all true religion turns.' The Reformers insisted: to add works to faith as the ground of justification is to preach a different gospel. The Council of Trent formally anathematized the Reformation position, a condemnation that formally stands to this day in Roman Catholic canon law.",
  },
  {
    reference: "John 6:37",
    book: "John", chapter: 6,
    text: "All that the Father gives me will come to me, and whoever comes to me I will never cast out.",
    event: "The Synod of Dort",
    year: "1618–1619",
    glow: "rgba(139,92,246,0.18)",
    history:
      "After Jacobus Arminius and his followers challenged Calvinist teaching on predestination, the Dutch Reformed church convened an international council at Dordrecht with delegates from England, Germany, Switzerland, and the Netherlands. Five points were at stake: total depravity, unconditional election, limited atonement, irresistible grace, and perseverance of the saints — the TULIP doctrines. John 6:37–40 was central: 'All that the Father gives me will come' — election is the Father's act. 'I will never cast out' — preservation is Christ's promise. The Canons of Dort remain one of the most carefully argued theological documents in Christian history.",
  },
  {
    reference: "Acts 5:29",
    book: "Acts", chapter: 5,
    text: "We must obey God rather than men.",
    event: "Diet of Worms",
    year: "1521",
    glow: "rgba(239,68,68,0.18)",
    history:
      "Standing before Emperor Charles V and the full assembly of the Holy Roman Empire, Martin Luther was ordered to recant his writings. His answer has echoed for five centuries: 'Unless I am convinced by the testimony of the Scriptures or by clear reason — for I do not trust either in the pope or in councils alone, since it is well known that they have often erred and contradicted themselves — I am bound by the Scriptures I have quoted, and my conscience is captive to the Word of God. I cannot and will not recant anything, since it is neither safe nor right to go against conscience. Here I stand. I cannot do otherwise. God help me. Amen.' He was declared an outlaw of the Empire the next day.",
  },
  {
    reference: "2 Timothy 3:16",
    book: "2 Timothy", chapter: 3,
    text: "All Scripture is breathed out by God and profitable for doctrine, for reproof, for correction, for training in righteousness.",
    event: "Sola Scriptura",
    year: "Reformation Era",
    glow: "rgba(16,185,129,0.18)",
    history:
      "The first of the Five Solas — Scripture alone — was not an invention of the Reformers but a recovery of the early church's conviction. When Rome argued that Scripture and Church Tradition carried equal authority, the Reformers cited 2 Timothy 3:16: God breathed out Scripture; councils and popes are fallible men. Sola Scriptura does not mean 'no creeds or confessions' — Luther, Calvin, and the Westminster Divines all wrote extensive confessional documents. It means Scripture is the supreme and final authority to which all tradition must submit. This principle was the formal cause of the Reformation.",
  },
  {
    reference: "Romans 8:30",
    book: "Romans", chapter: 8,
    text: "And those whom he predestined he also called, and those whom he called he also justified, and those whom he justified he also glorified.",
    event: "Augustine vs. Pelagius",
    year: "410–430 AD",
    glow: "rgba(99,102,241,0.18)",
    history:
      "Pelagius, a British monk in Rome, taught that human beings have the natural ability to choose good and earn salvation — sin is imitation, not inherited corruption. Augustine of Hippo saw this as the destruction of grace. His debate with Pelagius produced some of the most important theology in Christian history: original sin, the bondage of the will, prevenient and irresistible grace, and predestination. Romans 8:29–30 — the 'golden chain' of salvation — was Augustine's anchor. The Council of Carthage (418 AD) condemned Pelagianism. Augustine's framework became the backbone of both Catholic and Protestant soteriology, though the Reformers argued Rome itself had drifted back toward Pelagius.",
  },
  {
    reference: "Hebrews 4:12",
    book: "Hebrews", chapter: 4,
    text: "For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow, and discerning the thoughts and intentions of the heart.",
    event: "Tyndale & the English Bible",
    year: "1526–1536",
    glow: "rgba(20,184,166,0.18)",
    history:
      "William Tyndale believed ordinary English people deserved to read this living Word in their own language. When a church official told him 'we are better to be without God's law than the Pope's,' Tyndale replied: 'I defy the Pope, and all his laws; and if God spare my life, ere many years I will cause a boy that driveth the plough, to know more of the Scripture than thou dost.' He translated the New Testament from Greek and much of the Old Testament from Hebrew — the first printed English Bible from the original languages. He was strangled and burned at the stake in 1536. Eighty percent of the King James Bible (1611) is Tyndale's translation. His dying prayer: 'Lord, open the King of England's eyes.'",
  },
];

// ─── Featured Meditation videos ───────────────────────────────────────────────
const FEATURED_VIDEOS = {
  en: { file: "/videos/featured-en.mp4", youtubeId: "e50Rgh7rGw8", title: "Featured Meditation of Scripture" },
  es: { file: "/videos/featured-es.mp4", youtubeId: "",             title: "Meditación Destacada de la Escritura" },
};

// ─── Article types ─────────────────────────────────────────────────────────────
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

function weekIndex() {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

function dayOfWeekIndex() {
  return new Date().getDay();
}

// ─── Share helper ──────────────────────────────────────────────────────────────
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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const today = new Date();
  const todayHV = HISTORY_VERSES[today.getDate() % HISTORY_VERSES.length];

  const [streakData,       setStreakData]       = useState<StreakData | null>(null);
  const [newBadgeIds,      setNewBadgeIds]      = useState<BadgeId[]>([]);
  const [toastVisible,     setToastVisible]     = useState(false);
  const [devotionalBadges, setDevotionalBadges] = useState<DevotionalBadgeId[]>([]);
  const [videoOpen,        setVideoOpen]        = useState(false);
  const [historyOpen,      setHistoryOpen]      = useState(false);
  const { lang } = useLanguage();
  const featuredVideo = FEATURED_VIDEOS[lang as "en" | "es"] ?? FEATURED_VIDEOS.en;

  // Articles
  const [articles,       setArticles]       = useState<MarrowArticle[]>([]);
  const [articleLoading, setArticleLoading] = useState(false);

  // In-app article reader
  const [openArticle,    setOpenArticle]    = useState<MarrowArticle | null>(null);
  const [articleContent, setArticleContent] = useState<ArticleContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Theme detection — drives the full accent palette
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "premium-neon";
    return localStorage.getItem("ryc-theme") ?? "premium-neon";
  });
  useEffect(() => {
    const sync = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail as string | undefined;
      setTheme(detail ?? localStorage.getItem("ryc-theme") ?? "premium-neon");
    };
    sync();
    window.addEventListener("ryc-theme-change", sync);
    return () => window.removeEventListener("ryc-theme-change", sync);
  }, []);

  const isPremiumNeon = theme === "premium-neon";
  const isLightPink   = theme === "light-pink";

  // ── Derived accent palette ────────────────────────────────────────────────
  // premium-neon → violet/cyan  |  light-pink → rose  |  default → cinematic gold
  const ac         = isPremiumNeon ? "#a78bfa"  : isLightPink ? "#db2777"                  : "#c9a961";
  const acSub      = isPremiumNeon ? "rgba(167,139,250,0.80)" : isLightPink ? "rgba(190,24,93,0.80)"    : "rgba(201,169,97,0.75)";
  const acBg       = isPremiumNeon ? "rgba(124,58,237,0.14)"  : isLightPink ? "rgba(219,39,119,0.10)"   : "rgba(201,169,97,0.14)";
  const acBorder   = isPremiumNeon ? "rgba(124,58,237,0.45)"  : isLightPink ? "rgba(219,39,119,0.35)"   : "rgba(201,169,97,0.40)";
  const acBorderSm = isPremiumNeon ? "rgba(124,58,237,0.30)"  : isLightPink ? "rgba(219,39,119,0.22)"   : "rgba(201,169,97,0.30)";
  const acCTAGrad  = isPremiumNeon
    ? "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(56,189,248,0.08))"
    : isLightPink
      ? "linear-gradient(135deg, rgba(219,39,119,0.14), rgba(244,114,182,0.06))"
      : "linear-gradient(135deg, rgba(201,169,97,0.18), rgba(201,169,97,0.05))";
  const storyAc       = isLightPink ? "#be185d" : ac;
  const storyAcBg     = isLightPink ? "rgba(219,39,119,0.09)" : acBg;
  const storyAcBorder = isLightPink ? "rgba(219,39,119,0.24)" : acBorder;
  const storyBorderSm = isLightPink ? "rgba(219,39,119,0.18)" : acBorderSm;
  const logoBadgeGrad = isPremiumNeon
    ? "linear-gradient(135deg, #7c3aed, #38bdf8)"
    : isLightPink
      ? "linear-gradient(135deg, #db2777, #f472b6)"
      : "linear-gradient(135deg, #c9a961, #8b6f2e)";
  const logoGlyphColor = isPremiumNeon ? "#e0d8ff" : isLightPink ? "#fff" : "#1a0e2e";
  const pageBg         = isPremiumNeon ? "#07080d"  : isLightPink ? "#fff0f5" : "#050507";

  // Streak dot colours
  const dotDone    = isPremiumNeon ? "#a78bfa"               : isLightPink ? "#db2777"                : "#c9a961";
  const dotDoneText= isPremiumNeon ? "#0d0b20"               : isLightPink ? "#fff"                   : "#1a0e2e";
  const dotCurBg   = isPremiumNeon ? "rgba(124,58,237,0.18)" : isLightPink ? "rgba(219,39,119,0.12)"  : "rgba(201,169,97,0.15)";
  const dotCurBdr  = isPremiumNeon ? "#7c3aed"               : isLightPink ? "#db2777"                : "#c9a961";

  // Continue card backgrounds
  const meditBg    = isPremiumNeon
    ? "linear-gradient(135deg, #2a0a45, #10052a)"
    : isLightPink
      ? "linear-gradient(135deg, #fce7f3, #f9d0e6)"
      : "linear-gradient(135deg, #1a4a3a, #0a1f18)";
  const articleBg  = isPremiumNeon
    ? "linear-gradient(135deg, #051828, #020c18)"
    : isLightPink
      ? "linear-gradient(135deg, #fde8f4, #f5d3ec)"
      : "linear-gradient(135deg, #4a2a1a, #1f140a)";
  const scriptureBg= isPremiumNeon
    ? "linear-gradient(135deg, #1a0a3a, #0a0522)"
    : isLightPink
      ? "linear-gradient(135deg, #fff0f5, #fce7f3)"
      : "linear-gradient(135deg, #3a1a3a, #18091a)";

  // Card glows are reserved for Premium Neon.
  const meditGlow  = isPremiumNeon ? "0 0 22px rgba(232,121,249,0.20)" : "none";
  const articleGlow= isPremiumNeon ? "0 0 22px rgba(56,189,248,0.18)"  : "none";
  const scriptGlow = isPremiumNeon ? "0 0 22px rgba(124,58,237,0.22)"  : "none";

  const heroAtmosphere = isLightPink
    ? "radial-gradient(70% 80% at 50% 0%, rgba(244,114,182,0.10) 0%, transparent 72%)"
    : `${isPremiumNeon ? "radial-gradient(90% 60% at 50% 0%, rgba(124,58,237,0.28) 0%, transparent 65%), " : ""}radial-gradient(60% 80% at 50% 0%, ${todayHV.glow} 0%, transparent 70%), radial-gradient(120% 80% at 50% 0%, rgba(59,42,107,0.35) 0%, rgba(17,10,38,0.0) 60%)`;

  // Streak box glow
  const streakBoxGlow = isPremiumNeon
    ? "0 0 0 1px rgba(124,58,237,0.20), 0 0 28px rgba(124,58,237,0.10)"
    : "none";

  // ─────────────────────────────────────────────────────────────────────────

  // Streak / badges
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

  useEffect(() => {
    const dp = loadDevotionalProgress();
    setDevotionalBadges(dp.badges as DevotionalBadgeId[]);
  }, []);

  // Fetch articles
  useEffect(() => {
    setArticleLoading(true);
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { if (data.articles?.length) setArticles(data.articles); })
      .catch(() => {})
      .finally(() => setArticleLoading(false));
  }, []);

  // Lock body scroll when article reader is open
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

  // Open article in-app reader
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

  // Weekly article pick
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

  const earnedBadgeIds = (streakData?.badges ?? []) as BadgeId[];

  const todayIdx  = dayOfWeekIndex();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const streak    = streakData?.streak ?? 0;
  const dayUpper  = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  const heroHeadline = todayHV.event === "Diet of Worms"
    ? ["Here I stand.", "I cannot do otherwise."]
    : todayHV.text.split(/[,.]/).map((s) => s.trim()).filter(Boolean).slice(0, 2);

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: pageBg }}>

      {/* Radial per-verse glow at top (neon adds an extra violet ring) */}
      <div
        aria-hidden
        className="home-hero-atmosphere absolute inset-x-0 top-0 h-[520px] pointer-events-none"
        style={{ background: heroAtmosphere }}
      />

      {/* ── History verse modal ───────────────────────────────────────────────── */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setHistoryOpen(false)}
        >
          <div className={`home-story-backdrop absolute inset-0 bg-black/80 backdrop-blur-sm${isLightPink ? " home-story-backdrop-blossom" : ""}`} />
          <div
            className={`home-story-modal relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden${isLightPink ? " home-story-modal-blossom" : ""}`}
            style={{
              background: isPremiumNeon
                ? "#0a0818"
                : isLightPink
                  ? "linear-gradient(160deg, #fffafb 0%, #fce7f3 100%)"
                  : "#0a0a0f",
              border: `1px solid ${storyBorderSm}`,
              boxShadow: isPremiumNeon
                ? `0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(56,189,248,0.10)`
                : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 pt-5 pb-4"
              style={{ borderBottom: isLightPink ? "1px solid rgba(219,39,119,0.13)" : "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: storyAc }}>
                  {todayHV.event} · {todayHV.year}
                </p>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="home-story-close w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                >✕</button>
              </div>
              <p className="home-story-reference text-lg font-bold">{todayHV.reference}</p>
              <p className="home-story-quote mt-3 text-sm italic leading-relaxed"
                style={{ fontFamily: "'Iowan Old Style','Georgia','Times New Roman',serif" }}>
                &ldquo;{todayHV.text}&rdquo;
              </p>
            </div>
            <div className="px-5 py-4 max-h-[45vh] overflow-y-auto">
              <p className="home-story-label text-[9px] font-black uppercase tracking-[0.20em] mb-2">Church History</p>
              <p className="home-story-body text-[13px] leading-relaxed">{todayHV.history}</p>
            </div>
            <div className="px-5 pb-5">
              <Link
                href={`/lexicon?book=${encodeURIComponent(todayHV.book)}&chapter=${todayHV.chapter}`}
                onClick={() => setHistoryOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: storyAcBg, border: `1px solid ${storyAcBorder}`, color: storyAc }}
              >
                Read {todayHV.reference} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Meditation video modal ──────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black flex flex-col"
          onClick={() => setVideoOpen(false)}
        >
          <button
            onClick={() => setVideoOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
          >✕</button>
          <div className="flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <video
              src={featuredVideo.file}
              autoPlay controls playsInline
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = "none";
                const iframe = document.getElementById("featured-yt-fallback");
                if (iframe) iframe.style.display = "block";
              }}
            />
            {featuredVideo.youtubeId && (
              <iframe
                id="featured-yt-fallback"
                style={{ display: "none" }}
                src={`https://www.youtube-nocookie.com/embed/${featuredVideo.youtubeId}?autoplay=1&rel=0`}
                title={featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
          <div className="px-5 py-4 bg-black/80 flex-shrink-0">
            <p className="text-sm font-semibold text-white/75 text-center">{featuredVideo.title}</p>
          </div>
        </div>
      )}

      {/* ── In-app article reader ─────────────────────────────────────────────── */}
      {openArticle && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0e0e18]" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-4 border-b border-white/[0.07]">
            <button
              onClick={() => setOpenArticle(null)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] active:bg-white/[0.12] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/70">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: acBg, border: `1px solid ${acBorderSm}` }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ color: ac }}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] truncate" style={{ color: acSub }}>Marrow Ministries</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ minHeight: 0, WebkitOverflowScrolling: "touch" }}>
            <div className="px-5 pt-6 pb-4">
              <h1 className="text-[20px] font-bold text-white/92 leading-snug mb-3">
                {articleContent?.title || openArticle.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-6">
                {articleContent?.author && !/guest|marrow ministries|free content/i.test(articleContent.author) && (
                  <p className="text-[12px] text-white/45 font-medium">By {articleContent.author}</p>
                )}
                {articleContent?.author && !/guest|marrow ministries|free content/i.test(articleContent.author) && (articleContent?.date || openArticle.date) && (
                  <span className="text-white/15 text-[11px]">·</span>
                )}
                {(articleContent?.date || openArticle.date) && (
                  <p className="text-[12px] text-white/25">
                    {new Date((articleContent?.date || openArticle.date) + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              {contentLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-6 h-6 rounded-full animate-spin"
                    style={{ border: `2px solid ${acBg}`, borderTopColor: ac }} />
                  <span className="text-white/20 text-xs">Loading article…</span>
                </div>
              ) : (
                <>
                  <p className="text-[15px] text-white/70 leading-[1.8] whitespace-pre-wrap">
                    {articleContent?.content || openArticle.excerpt}
                  </p>
                  <div className="mt-8 pt-5 border-t border-white/[0.06]">
                    <p className="text-[11px] text-white/20 leading-relaxed">
                      {articleContent?.author && !/guest|marrow ministries|free content/i.test(articleContent.author)
                        ? <>Article by <span className="text-white/35 font-semibold">{articleContent.author}</span> — originally published at{" "}</>
                        : <>Originally published at{" "}</>
                      }
                      <a href="https://marrowministries.org/articles" target="_blank" rel="noopener noreferrer"
                        style={{ color: acSub }} className="underline underline-offset-2">
                        marrowministries.org
                      </a>. All rights reserved.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.07]">
            <a
              href={openArticle.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-2xl text-sm font-bold transition-all"
              style={{ background: acBg, border: `1px solid ${acBorder}`, color: ac }}
            >
              Open on Marrow Ministries →
            </a>
          </div>
        </div>
      )}

      {/* ── Badge unlock toast ────────────────────────────────────────────────── */}
      {toastVisible && newBadgeIds.length > 0 && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-sm"
          style={{ background: pageBg, border: `1px solid ${acBorderSm}`,
            boxShadow: isPremiumNeon ? `0 0 24px rgba(124,58,237,0.35)` : undefined }}
        >
          <span className="text-base">{BADGES[newBadgeIds[0]].emoji}</span>
          <span className="text-[12px] font-bold" style={{ color: ac }}>
            {newBadgeIds.map((id) => BADGES[id].label).join(", ")} unlocked!
          </span>
        </div>
      )}

      {/* ── Page content ──────────────────────────────────────────────────────── */}
      <main className="relative max-w-lg mx-auto px-5 pt-10 pb-28">

        {/* Top brand row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tulip-logo.png"
              alt="TULIP Bible App logo"
              className="w-9 h-9 rounded-xl object-cover"
              style={{ boxShadow: isPremiumNeon ? `0 0 14px rgba(124,58,237,0.50), 0 0 28px rgba(56,189,248,0.20)` : undefined }}
            />
            <div>
              <p className="text-[13px] font-bold tracking-tight text-white leading-none">TULIP</p>
              <p className="home-accent-muted text-[9px] tracking-wider mt-0.5 uppercase" style={{ color: acSub }}>Bible App</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={shareApp}
              className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/60 active:bg-white/[0.10] transition-colors"
              title="Share TULIP Bible App"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <Link href="/more" className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/60 active:bg-white/[0.10] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6 8c0-3 3-5 6-5s6 2 6 5v5l2 3H4l2-3V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Hero — date label + serif headline */}
        <p className="home-accent text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ac }}>
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
          <span
            className="home-accent-chip px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{ border: `1px solid ${acBorder}`, background: acBg, color: ac }}
          >
            {todayHV.event}
          </span>
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 bg-white/[0.04] text-white/55">
            {todayHV.year}
          </span>
        </div>

        {/* ── Display blockquote ────────────────────────────────────── */}
        {(() => {
          const text = todayHV.text;
          const pf   = "var(--font-playfair),'Iowan Old Style','Georgia',serif";

          // Split at a conjunction after a comma for two-tone styling
          const m = text.match(/,\s+(and\b|but\b|yet\b|so\b|for\b|who\b|that\b|as\b|since\b|if\b)/i);
          let part1 = text, bridge: string | null = null, part2: string | null = null;
          if (m && m.index !== undefined) {
            part1  = text.slice(0, m.index + 1);
            bridge = m[1];
            part2  = text.slice(m.index + m[0].length).trim();
          }
          const showDash = bridge && /^(and|but|yet|so)$/i.test(bridge);

          return (
            <div className="relative mb-8 mt-1">
              {/* Giant opening mark — ghost behind text */}
              <span
                aria-hidden
                className="absolute -top-4 -left-1 leading-none select-none pointer-events-none"
                style={{ fontFamily: pf, fontSize: "100px", color: ac, opacity: 0.45, lineHeight: 1 }}
              >
                &ldquo;
              </span>

              {/* Verse body with subtle left accent rule */}
              <div
                className="relative pl-4 pt-9 pb-1"
                style={{ borderLeft: `2px solid ${acBorderSm}` }}
              >
                {/* Main clause — large bold white */}
                <p
                  className="leading-[1.18] font-bold"
                  style={{ fontFamily: pf, fontSize: "30px", color: "rgba(255,255,255,0.94)" }}
                >
                  {part1}
                </p>

                {/* Bridge word — italic accent with optional dashes */}
                {bridge && (
                  <p
                    className="leading-[1.18] font-medium italic mt-1"
                    style={{ fontFamily: pf, fontSize: "26px", color: ac }}
                  >
                    {showDash ? `— ${bridge} —` : bridge}
                  </p>
                )}

                {/* Second clause — italic accent */}
                {part2 && (
                  <p
                    className="leading-[1.18] font-semibold italic mt-0.5"
                    style={{ fontFamily: pf, fontSize: "30px", color: ac }}
                  >
                    {part2}
                  </p>
                )}

                {/* Closing mark — floated right */}
                <span
                  aria-hidden
                  className="float-right leading-none select-none pointer-events-none -mt-4 -mr-2"
                  style={{ fontFamily: pf, fontSize: "80px", color: ac, opacity: 0.45 }}
                >
                  &rdquo;
                </span>
                <div className="clear-both" />
              </div>
            </div>
          );
        })()}

        {/* Gold / neon CTA card */}
        <button
          onClick={() => setHistoryOpen(true)}
          className="home-feature-cta w-full flex items-center justify-between px-4 py-3.5 rounded-2xl active:scale-[0.99] transition-all"
          style={{
            background: acCTAGrad,
            border: `1px solid ${acBorder}`,
            boxShadow: isPremiumNeon ? `0 0 20px rgba(124,58,237,0.20), 0 0 40px rgba(56,189,248,0.08)` : undefined,
          }}
        >
          <div className="text-left">
            <p className="home-accent-muted text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: acSub }}>
              {todayHV.reference}
            </p>
            <p className="text-[14px] font-bold text-white mt-0.5">Read the full story</p>
          </div>
          <svg className="home-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: ac }}>
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Continue section ──────────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white">Continue</h3>
            <Link href="/library" className="text-[11px] font-semibold text-white/40 hover:text-white/70">See all</Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
            {/* Featured meditation */}
            <button
              onClick={() => setVideoOpen(true)}
              className="home-continue-card home-continue-meditation flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
              style={{ background: meditBg, boxShadow: meditGlow }}
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

            {/* Featured article */}
            {weeklyArticle && (
              <button
                onClick={() => openArticleModal(weeklyArticle)}
                className="home-continue-card home-continue-article flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
                style={{ background: articleBg, boxShadow: articleGlow }}
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
              </button>
            )}

            {/* Bible reading */}
            <Link
              href="/lexicon"
              className="home-continue-card home-continue-scripture flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
              style={{ background: scriptureBg, boxShadow: scriptGlow }}
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
                <p className="text-[10px] text-white/40 mt-1.5">Strong&rsquo;s + commentary</p>
              </div>
            </Link>
          </div>

          {articleLoading && articles.length === 0 && (
            <div className="text-[10px] text-white/30 px-1 mt-2">Loading articles…</div>
          )}
        </section>

        {/* ── Your streak ───────────────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white">Your streak</h3>
            <p className="home-accent text-[12px] font-bold" style={{ color: ac }}>
              {streak} {streak === 1 ? "day" : "days"}
            </p>
          </div>
          <div
            className="home-streak-card rounded-2xl px-3 py-4 flex justify-between"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
              boxShadow: streakBoxGlow,
            }}
          >
            {dayLabels.map((d, i) => {
              const isCurrent = i === todayIdx;
              const isDone = i < todayIdx && i >= Math.max(0, todayIdx - streak + 1);
              return (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${
                      isDone ? "home-streak-dot-done" : isCurrent ? "home-streak-dot-current" : ""
                    }`}
                    style={
                      isDone
                        ? { background: dotDone, color: dotDoneText }
                        : isCurrent
                          ? { background: dotCurBg, border: `1px solid ${dotCurBdr}` }
                          : { background: "rgba(255,255,255,0.05)" }
                    }
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {isCurrent && (
                      <div className="home-streak-dot-center w-1.5 h-1.5 rounded-full" style={{ background: dotCurBdr }} />
                    )}
                  </div>
                  <span className={"text-[10px] " + (isCurrent ? "text-white font-semibold" : "text-white/35")}>{d}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Badges showcase ───────────────────────────────────────────────── */}
        {(earnedBadgeIds.length > 0 || devotionalBadges.length > 0) && (
          <section className="mt-9">
            <h3 className="text-[15px] font-bold text-white mb-3">Badges</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {earnedBadgeIds.map((id) => {
                const badge = BADGES[id];
                return (
                  <div
                    key={id}
                    title={badge.desc}
                    className="home-badge-card flex flex-col items-center gap-1 p-1.5 rounded-xl"
                    style={{ border: `1px solid ${acBorderSm}`, background: acBg,
                      boxShadow: isPremiumNeon ? `0 0 8px rgba(124,58,237,0.20)` : undefined }}
                  >
                    <span className="text-lg">{badge.emoji}</span>
                    <span className="home-accent-muted text-[8px] font-bold text-center leading-tight" style={{ color: acSub }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
              {devotionalBadges.map((id) => {
                const badge = DEVOTIONAL_BADGES[id];
                return (
                  <div
                    key={`dev-${id}`}
                    title={badge.desc}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-amber-600/35 bg-amber-600/10"
                  >
                    <span className="text-lg">{badge.emoji}</span>
                    <span className="text-[8px] font-bold text-center leading-tight text-amber-300/90">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
