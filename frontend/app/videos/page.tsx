"use client";

import { useState } from "react";

interface VideoEntry {
  id: string;
  title: string;
  speaker: string;
  topic: string;
  tags: string[];
  description: string;
}

const CATEGORIES = ["All", "Gospel", "Holiness", "Sovereignty", "Prayer", "Evangelism", "Doctrine", "Church History"];

const VIDEOS: VideoEntry[] = [
  // John Piper
  {
    id: "V_r3sFJWVQE",
    title: "What Is the Gospel?",
    speaker: "John Piper",
    topic: "Gospel",
    tags: ["Gospel", "Doctrine"],
    description: "A clear, concise biblical explanation of the gospel of Jesus Christ and why it is the power of God unto salvation.",
  },
  {
    id: "k1kEt4lFAuM",
    title: "Don't Waste Your Life",
    speaker: "John Piper",
    topic: "Discipleship",
    tags: ["Holiness", "Evangelism"],
    description: "The urgent call to live for the glory of God rather than comfort, safety, and the accumulation of worldly things.",
  },
  // R.C. Sproul
  {
    id: "Kn-bsE2jBjA",
    title: "The Holiness of God",
    speaker: "R.C. Sproul",
    topic: "Holiness",
    tags: ["Holiness", "Doctrine"],
    description: "Sproul's definitive lecture on the holiness of God — the attribute that underlies every other attribute of the divine nature.",
  },
  {
    id: "Yba_bm4nYmA",
    title: "What Is Reformed Theology?",
    speaker: "R.C. Sproul",
    topic: "Doctrine",
    tags: ["Doctrine", "Church History"],
    description: "A foundational overview of Reformed theology — its roots in Scripture, the Reformation, and the great confessions of the church.",
  },
  // Paul Washer
  {
    id: "e50Rgh7rGw8",
    title: "Shocking Youth Message",
    speaker: "Paul Washer",
    topic: "Gospel",
    tags: ["Gospel", "Holiness", "Evangelism"],
    description: "The sermon that shook a generation — a biblical confrontation with easy-believism and a call to genuine repentance and faith.",
  },
  {
    id: "vvmKQn27WKM",
    title: "The One True God",
    speaker: "Paul Washer",
    topic: "Doctrine",
    tags: ["Doctrine", "Sovereignty"],
    description: "A powerful message on the true nature of God as revealed in Scripture — His sovereignty, majesty, and absolute authority.",
  },
  // Voddie Baucham
  {
    id: "bA7ga7iP0bo",
    title: "Why I Choose to Believe the Bible",
    speaker: "Voddie Baucham",
    topic: "Doctrine",
    tags: ["Doctrine"],
    description: "A compelling defense of the sufficiency and authority of Scripture — why the Bible is the foundation of the Christian life and witness.",
  },
  {
    id: "Y5YzxWpSrY4",
    title: "Contending for the Faith",
    speaker: "Voddie Baucham",
    topic: "Evangelism",
    tags: ["Evangelism", "Doctrine"],
    description: "The church's call to contend earnestly for the faith once for all delivered to the saints — standing firm in the face of apostasy.",
  },
  // Sinclair Ferguson
  {
    id: "S-VlBzCQyiY",
    title: "The Christian Life",
    speaker: "Sinclair Ferguson",
    topic: "Holiness",
    tags: ["Holiness", "Doctrine"],
    description: "Ferguson walks through the shape and texture of the Christian life — union with Christ, sanctification, and the means of grace.",
  },
  // Alistair Begg
  {
    id: "Hm-hP7q5dJ8",
    title: "The Sovereignty of God in Salvation",
    speaker: "Alistair Begg",
    topic: "Sovereignty",
    tags: ["Sovereignty", "Gospel"],
    description: "A clear, pastoral exposition of God's sovereign grace in election, calling, and salvation — from Scripture alone.",
  },
  // Leonard Ravenhill
  {
    id: "QLo9r1V0PzI",
    title: "Why Revival Tarries",
    speaker: "Leonard Ravenhill",
    topic: "Prayer",
    tags: ["Prayer", "Holiness", "Evangelism"],
    description: "Ravenhill's legendary message on the church's prayerlessness — the primary reason for spiritual deadness and absent revival.",
  },
  // Francis Chan
  {
    id: "KwHHBRtqc5Y",
    title: "Stop Faking It",
    speaker: "Francis Chan",
    topic: "Holiness",
    tags: ["Holiness", "Gospel"],
    description: "An honest confrontation with nominal Christianity and a passionate call to authentic, costly discipleship.",
  },
];

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);

  const filtered = activeCategory === "All"
    ? VIDEOS
    : VIDEOS.filter((v) => v.tags.includes(activeCategory));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-amber-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
            ▶ Featured Teachings
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-violet-200 to-amber-200 bg-clip-text text-transparent">
            Reformed Voices
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Curated messages from faithful preachers and teachers. Sound doctrine, "rightly dividing the word of truth."
          </p>
          <p className="mt-2 text-white/25 text-xs">2 Timothy 2:15</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[36px] ${
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                  : "bg-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.09] border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden hover:border-violet-500/30 hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
              onClick={() => setActiveVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-violet-600/80 transition-colors">
                    <span className="text-white text-xl ml-1">▶</span>
                  </div>
                </div>
                {/* Tags */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {video.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white/70 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-violet-400 font-bold mb-1">{video.speaker}</p>
                <h3 className="text-sm font-bold text-white/90 leading-snug mb-2 group-hover:text-white transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/25 text-sm">
            No videos in this category yet.
          </div>
        )}

        {/* Suggest a video */}
        <div className="mt-16 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center">
          <p className="text-lg font-bold text-white/70 mb-2">Know a faithful teacher?</p>
          <p className="text-white/35 text-sm max-w-md mx-auto mb-5">
            We only feature preachers who hold to historic Reformed Christianity and preach the whole counsel of God. Suggest a sermon for inclusion.
          </p>
          <a
            href="/give"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-colors"
          >
            🤝 Join the Community to Suggest
          </a>
        </div>
      </div>

      {/* Video lightbox modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Embed */}
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            {/* Info bar */}
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-violet-400 font-bold mb-0.5">{activeVideo.speaker}</p>
                <h2 className="text-base font-bold text-white/90">{activeVideo.title}</h2>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">{activeVideo.description}</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
