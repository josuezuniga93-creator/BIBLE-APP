"use client";

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface VideoEntry {
  id: string;
  title: string;
  speaker: string;
  series?: string;
  category: string;
  tags: string[];
  description: string;
  duration?: string;
  rating: number;
  reviewCount: number;
}

interface WatchedItem {
  id: string;
  progress: number; // 0–100
  completed: boolean;
  watchedAt: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const WATCHLIST_KEY = "ryc-video-watchlist";
const WATCHED_KEY   = "ryc-video-watched";

const CATEGORY_TILES = [
  { id: "Bible Studies", label: "Bible Studies", icon: "📖", color: "#1d4ed8" },
  { id: "Discipleship",  label: "Discipleship",  icon: "✝️",  color: "#065f46" },
  { id: "Gospel",        label: "Gospel",        icon: "📢",  color: "#7c3aed" },
  { id: "Devotionals",   label: "Devotionals",   icon: "🙏",  color: "#9d174d" },
];

const SAMPLE_REVIEWS: Record<string, { name: string; text: string; stars: number }[]> = {
  default: [
    { name: "Reformed Reader",  text: "One of the clearest explanations I've heard. Highly recommended for every believer.", stars: 5 },
    { name: "Sola Scriptura",   text: "Grounded in Scripture, faithful to the confessions. Excellent teaching.", stars: 5 },
    { name: "Truth Seeker",     text: "Changed how I read my Bible. Pray more people hear this.", stars: 4 },
  ],
};

const VIDEOS: VideoEntry[] = [
  {
    id: "Yba_bm4nYmA",
    title: "What Is Reformed Theology?",
    speaker: "R.C. Sproul",
    series: "Reformed Theology Explained",
    category: "Bible Studies",
    tags: ["Doctrine", "Church History"],
    rating: 4.8,
    reviewCount: 51,
    duration: "31 min",
    description: "In this foundational message, R.C. Sproul explains the core convictions of Reformed Theology and how they shape our understanding of God, salvation, and the church. A must-watch for anyone wanting to understand the historic faith.",
  },
  {
    id: "V_r3sFJWVQE",
    title: "What Is the Gospel?",
    speaker: "John Piper",
    series: "Core Christianity",
    category: "Gospel",
    tags: ["Gospel", "Doctrine"],
    rating: 4.9,
    reviewCount: 87,
    duration: "45 min",
    description: "A clear, concise biblical explanation of the gospel of Jesus Christ and why it is the power of God unto salvation for everyone who believes.",
  },
  {
    id: "Kn-bsE2jBjA",
    title: "The Holiness of God",
    speaker: "R.C. Sproul",
    series: "The Attributes of God",
    category: "Bible Studies",
    tags: ["Holiness", "Doctrine"],
    rating: 4.9,
    reviewCount: 134,
    duration: "55 min",
    description: "Sproul's definitive lecture on the holiness of God — the attribute that underlies every other attribute of the divine nature. Compelling, reverent, and transformative.",
  },
  {
    id: "e50Rgh7rGw8",
    title: "Shocking Youth Message",
    speaker: "Paul Washer",
    series: "HeartCry Messages",
    category: "Gospel",
    tags: ["Gospel", "Holiness", "Evangelism"],
    rating: 4.8,
    reviewCount: 203,
    duration: "58 min",
    description: "The sermon that shook a generation — a biblical confrontation with easy-believism and a call to genuine repentance and faith in Christ alone.",
  },
  {
    id: "k1kEt4lFAuM",
    title: "Don't Waste Your Life",
    speaker: "John Piper",
    series: "Core Christianity",
    category: "Discipleship",
    tags: ["Holiness", "Evangelism"],
    rating: 4.7,
    reviewCount: 76,
    duration: "42 min",
    description: "The urgent call to live for the glory of God rather than comfort, safety, and the accumulation of worldly things. Life is too short to live for anything less than God.",
  },
  {
    id: "vvmKQn27WKM",
    title: "The One True God",
    speaker: "Paul Washer",
    series: "HeartCry Messages",
    category: "Bible Studies",
    tags: ["Doctrine", "Sovereignty"],
    rating: 4.8,
    reviewCount: 61,
    duration: "48 min",
    description: "A powerful message on the true nature of God as revealed in Scripture — His sovereignty, majesty, and absolute authority over all creation and history.",
  },
  {
    id: "bA7ga7iP0bo",
    title: "Why I Choose to Believe the Bible",
    speaker: "Voddie Baucham",
    series: "Expository Apologetics",
    category: "Bible Studies",
    tags: ["Doctrine"],
    rating: 4.9,
    reviewCount: 92,
    duration: "52 min",
    description: "A compelling defense of the sufficiency and authority of Scripture — why the Bible is the foundation of the Christian life and witness against all challengers.",
  },
  {
    id: "Y5YzxWpSrY4",
    title: "Contending for the Faith",
    speaker: "Voddie Baucham",
    series: "Expository Apologetics",
    category: "Gospel",
    tags: ["Evangelism", "Doctrine"],
    rating: 4.7,
    reviewCount: 44,
    duration: "38 min",
    description: "The church's call to contend earnestly for the faith once for all delivered to the saints — standing firm in the face of cultural pressure and apostasy.",
  },
  {
    id: "S-VlBzCQyiY",
    title: "The Christian Life",
    speaker: "Sinclair Ferguson",
    series: "Union with Christ",
    category: "Discipleship",
    tags: ["Holiness", "Doctrine"],
    rating: 4.8,
    reviewCount: 39,
    duration: "49 min",
    description: "Ferguson walks through the shape and texture of the Christian life — union with Christ, sanctification, and the means of grace that sustain the believer.",
  },
  {
    id: "Hm-hP7q5dJ8",
    title: "The Sovereignty of God in Salvation",
    speaker: "Alistair Begg",
    series: "Truth For Life",
    category: "Bible Studies",
    tags: ["Sovereignty", "Gospel"],
    rating: 4.7,
    reviewCount: 55,
    duration: "44 min",
    description: "A clear, pastoral exposition of God's sovereign grace in election, calling, and salvation — from Scripture alone, for the glory of God alone.",
  },
  {
    id: "QLo9r1V0PzI",
    title: "Why Revival Tarries",
    speaker: "Leonard Ravenhill",
    series: "Revival Messages",
    category: "Devotionals",
    tags: ["Prayer", "Holiness", "Evangelism"],
    rating: 4.9,
    reviewCount: 118,
    duration: "60 min",
    description: "Ravenhill's legendary message on the church's prayerlessness — the primary reason for spiritual deadness and the absence of revival in our generation.",
  },
  {
    id: "KwHHBRtqc5Y",
    title: "Stop Faking It",
    speaker: "Francis Chan",
    series: "Crazy Love Series",
    category: "Discipleship",
    tags: ["Holiness", "Gospel"],
    rating: 4.6,
    reviewCount: 67,
    duration: "35 min",
    description: "An honest confrontation with nominal Christianity and a passionate call to authentic, costly discipleship that bears the marks of a true follower of Christ.",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function loadWatchlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]"); } catch { return []; }
}
function saveWatchlist(ids: string[]) {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids)); } catch {}
}
function loadWatched(): WatchedItem[] {
  try { return JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]"); } catch { return []; }
}

function Stars({ rating }: { rating: number }) {
  return <span className="text-amber-400 text-xs font-bold">★ {rating.toFixed(1)}</span>;
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

// ─── Thumbnail card ────────────────────────────────────────────────────────────

function VideoCard({ video, onClick, progress }: { video: VideoEntry; onClick: () => void; progress?: number }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-40 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.07] active:scale-95 transition-transform text-left"
    >
      <div className="relative aspect-video">
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
            <span className="text-xs text-white ml-0.5">▶</span>
          </div>
        </div>
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-violet-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-[10px] text-violet-400 font-bold truncate">{video.speaker}</p>
        <p className="text-[11px] font-bold text-white/80 leading-tight line-clamp-2">{video.title}</p>
      </div>
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function VideosPage() {
  const [selected, setSelected]       = useState<VideoEntry | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [watchlist, setWatchlist]     = useState<string[]>([]);
  const [watched, setWatched]         = useState<WatchedItem[]>([]);
  const [activeTab, setActiveTab]     = useState<"info" | "chapters" | "notes" | "reviews">("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch]   = useState(false);
  const [watchlistTab, setWatchlistTab] = useState<"watching" | "completed">("watching");

  useEffect(() => {
    setWatchlist(loadWatchlist());
    setWatched(loadWatched());
  }, []);

  function openVideo(v: VideoEntry) {
    setSelected(v);
    setActiveTab("info");
    window.scrollTo(0, 0);
  }

  function closeVideo() {
    setSelected(null);
  }

  function toggleWatchlist(id: string) {
    setWatchlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveWatchlist(next);
      return next;
    });
  }

  const filteredVideos = VIDEOS.filter((v) => {
    const matchesCat    = activeCategory === "All" || v.category === activeCategory || v.tags.includes(activeCategory);
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const continueWatching = watched
    .filter((w) => !w.completed && w.progress > 0)
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .map((w) => ({ video: VIDEOS.find((v) => v.id === w.id), progress: w.progress }))
    .filter((x) => x.video) as { video: VideoEntry; progress: number }[];

  const watchlistVideos  = watchlist.map((id) => VIDEOS.find((v) => v.id === id)).filter(Boolean) as VideoEntry[];
  const completedVideos  = watched.filter((w) => w.completed).map((w) => VIDEOS.find((v) => v.id === w.id)).filter(Boolean) as VideoEntry[];

  const isInWatchlist = selected ? watchlist.includes(selected.id) : false;
  const seriesVideos  = selected ? VIDEOS.filter((v) => v.series === selected.series && v.id !== selected.id) : [];
  const relatedVideos = selected ? VIDEOS.filter((v) => v.id !== selected.id && v.tags.some((t) => selected.tags.includes(t))).slice(0, 6) : [];
  const reviews       = SAMPLE_REVIEWS[selected?.id ?? ""] ?? SAMPLE_REVIEWS.default;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── HOME SCREEN ──────────────────────────────────────────────────────── */}
      {!selected && (
        <main className="max-w-lg mx-auto pb-24">

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-6 pb-3">
            <h1 className="text-xl font-bold text-white">Videos</h1>
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(""); }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] text-white/60"
            >
              <SearchIcon />
            </button>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="px-4 pb-4">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, topics, speakers…"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
              />
            </div>
          )}

          {/* Hero banner */}
          {!searchQuery && activeCategory === "All" && (
            <div className="mx-4 mb-6 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 p-5 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 75% 40%, rgba(167,139,250,0.18) 0%, transparent 65%)" }} />
                <div className="flex items-center gap-4 relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0 border border-white/10">
                    📖
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black tracking-widest text-violet-300/60 uppercase mb-0.5">Reformed Teaching</p>
                    <h2 className="text-[15px] font-black text-white leading-tight">Watch. Learn.<br/>Grow in Truth.</h2>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-snug">Biblical teaching and inspirational truth for today.</p>
                  </div>
                </div>
                <button
                  onClick={() => openVideo(VIDEOS[0])}
                  className="mt-4 w-full py-2.5 rounded-xl bg-white/12 text-white text-sm font-bold flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
                >
                  <span className="text-violet-300">▶</span> Start Watching
                </button>
              </div>
            </div>
          )}

          {/* Browse by Category */}
          {!searchQuery && activeCategory === "All" && (
            <section className="mb-5">
              <div className="flex items-center justify-between px-4 mb-3">
                <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">Browse by Category</p>
                <button onClick={() => setActiveCategory("All")} className="text-[11px] text-violet-400 font-bold">View all</button>
              </div>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
                {CATEGORY_TILES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-20 py-3.5 rounded-2xl active:scale-95 transition-transform"
                    style={{ backgroundColor: cat.color + "2a", border: `1px solid ${cat.color}40` }}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] font-bold text-white/75 text-center leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Category filter pills (when a category is active) */}
          {activeCategory !== "All" && !searchQuery && (
            <div className="flex gap-2 px-4 mb-5 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setActiveCategory("All")}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/[0.06] text-white/50 border border-white/10"
              >
                ← All
              </button>
              {CATEGORY_TILES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? "bg-violet-600 text-white"
                      : "bg-white/[0.05] text-white/40 border border-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Continue Watching */}
          {!searchQuery && activeCategory === "All" && continueWatching.length > 0 && (
            <section className="mb-5">
              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase px-4 mb-3">Continue Watching</p>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
                {continueWatching.map(({ video, progress }) => (
                  <VideoCard key={video.id} video={video} onClick={() => openVideo(video)} progress={progress} />
                ))}
              </div>
            </section>
          )}

          {/* My Watchlist */}
          {!searchQuery && activeCategory === "All" && (watchlistVideos.length > 0 || completedVideos.length > 0) && (
            <section className="mb-5">
              <div className="flex items-center justify-between px-4 mb-3">
                <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">My Watchlist</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setWatchlistTab("watching")}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${watchlistTab === "watching" ? "bg-violet-600 text-white" : "text-white/40"}`}
                  >Watching</button>
                  <button
                    onClick={() => setWatchlistTab("completed")}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${watchlistTab === "completed" ? "bg-violet-600 text-white" : "text-white/40"}`}
                  >Completed</button>
                </div>
              </div>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
                {(watchlistTab === "watching" ? watchlistVideos : completedVideos).map((v) => (
                  <VideoCard key={v.id} video={v} onClick={() => openVideo(v)} />
                ))}
                {(watchlistTab === "watching" ? watchlistVideos : completedVideos).length === 0 && (
                  <p className="text-xs text-white/25 py-4 px-1">
                    {watchlistTab === "watching" ? "No videos in your watchlist yet." : "No completed videos yet."}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Video list */}
          <section className="px-4">
            <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeCategory !== "All"
                  ? activeCategory
                  : "All Videos"}
            </p>
            {filteredVideos.length === 0 && (
              <p className="text-center py-10 text-white/25 text-sm">No videos found.</p>
            )}
            <div className="space-y-3">
              {filteredVideos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => openVideo(v)}
                  className="w-full flex gap-3 rounded-xl p-2.5 bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.07] active:scale-[0.98] transition-all text-left"
                >
                  <div className="relative w-28 flex-shrink-0 aspect-video rounded-lg overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-[11px] text-white ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-[10px] text-violet-400 font-bold mb-0.5">{v.speaker}</p>
                    <p className="text-xs font-bold text-white/90 leading-snug line-clamp-2 mb-1">{v.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Stars rating={v.rating} />
                      <span className="text-[10px] text-white/30">({v.reviewCount})</span>
                      {v.duration && <span className="text-[10px] text-white/30">{v.duration}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </main>
      )}

      {/* ── DETAIL SCREEN ─────────────────────────────────────────────────────── */}
      {selected && (
        <div className="min-h-screen bg-[#0f0f0f] max-w-lg mx-auto flex flex-col pb-16">

          {/* Back */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-3">
            <button
              onClick={closeVideo}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.07] text-white/70 active:bg-white/10 transition-colors flex-shrink-0"
            >
              <BackIcon />
            </button>
            <p className="text-sm font-semibold text-white/50 truncate flex-1">{selected.series ?? "Videos"}</p>
          </div>

          {/* Thumbnail / player */}
          <div className="mx-4 rounded-2xl overflow-hidden bg-black mb-5" style={{ aspectRatio: "16/9" }}>
            <a
              href={`https://www.youtube.com/watch?v=${selected.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block w-full h-full"
            >
              <img
                src={`https://img.youtube.com/vi/${selected.id}/hqdefault.jpg`}
                alt={selected.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-violet-600/85 flex items-center justify-center border-2 border-white/20 shadow-2xl shadow-violet-900/60">
                  <span className="text-white text-2xl ml-1">▶</span>
                </div>
              </div>
            </a>
          </div>

          {/* Title & meta */}
          <div className="px-4 mb-4">
            <h1 className="text-lg font-black text-white leading-tight mb-2">{selected.title}</h1>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Stars rating={selected.rating} />
              <span className="text-xs text-white/30">({selected.reviewCount})</span>
              <span className="text-white/15">•</span>
              <span className="text-xs text-white/50">{selected.speaker}</span>
              {selected.duration && (
                <>
                  <span className="text-white/15">•</span>
                  <span className="text-xs text-white/40">{selected.duration}</span>
                </>
              )}
            </div>
            {selected.series && (
              <p className="text-[11px] text-violet-400 font-bold">{selected.series}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 px-4 mb-5">
            <a
              href={`https://www.youtube.com/watch?v=${selected.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 active:bg-violet-700 transition-colors shadow-lg shadow-violet-900/30"
            >
              <span>▶</span> Watch Now
            </a>
            <button
              onClick={() => toggleWatchlist(selected.id)}
              className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-1.5 border transition-all ${
                isInWatchlist
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/[0.05] border-white/10 text-white/55 active:bg-white/10"
              }`}
            >
              <span>{isInWatchlist ? "✓" : "+"}</span>
              <span>Watchlist</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.07] px-4 mb-0 gap-0">
            {(["info","chapters","notes","reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2.5 text-xs font-bold capitalize transition-colors ${
                  activeTab === tab
                    ? "text-white border-b-2 border-violet-500 -mb-px"
                    : "text-white/35 hover:text-white/55"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-4 pt-4 pb-2">
            {activeTab === "info" && (
              <div>
                <p className="text-sm text-white/65 leading-relaxed mb-4">{selected.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/[0.05] border border-white/[0.08] text-white/45">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chapters" && (
              <div>
                {["Introduction", "Main Exposition", "Application", "Conclusion"].map((ch, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.05]">
                    <span className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] text-white/40 font-bold flex-shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white/80">{ch}</p>
                    </div>
                    <span className="text-[10px] text-white/25 font-mono">{["0:00","8:30","22:15","29:40"][i]}</span>
                  </div>
                ))}
                <p className="text-[10px] text-white/20 text-center pt-3">Chapters are approximate time markers</p>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="py-8 text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm font-bold text-white/40">Personal Notes</p>
                <p className="text-xs text-white/25 mt-1 max-w-xs mx-auto">Take notes while you watch and save them here for future reference.</p>
                <p className="text-[10px] text-white/20 mt-3">Coming soon</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.07]">
                  <div className="text-center">
                    <p className="text-4xl font-black text-white">{selected.rating.toFixed(1)}</p>
                    <p className="text-amber-400 text-sm">{"★".repeat(Math.round(selected.rating))}</p>
                    <p className="text-[10px] text-white/30">{selected.reviewCount} reviews</p>
                  </div>
                </div>
                {reviews.map((r, i) => (
                  <div key={i} className="py-3 border-b border-white/[0.05]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white/70">{r.name}</p>
                      <span className="text-amber-400 text-xs">{"★".repeat(r.stars)}</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* More from this Series */}
          {seriesVideos.length > 0 && (
            <section className="mt-5">
              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase px-4 mb-3">More from this Series</p>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
                {seriesVideos.map((v) => (
                  <VideoCard key={v.id} video={v} onClick={() => openVideo(v)} />
                ))}
              </div>
            </section>
          )}

          {/* You may also like */}
          {relatedVideos.length > 0 && (
            <section className="mt-5">
              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase px-4 mb-3">You May Also Like</p>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
                {relatedVideos.map((v) => (
                  <VideoCard key={v.id} video={v} onClick={() => openVideo(v)} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
}
