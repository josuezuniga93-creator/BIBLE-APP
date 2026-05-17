"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgeFilter = "all" | "2-5" | "4-8" | "6-12" | "8-14" | "parents";

interface KidsBook {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  ageLabel: string;
  ageFilter: AgeFilter;
  description: string;
  section: string;
  fallbackEmoji?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGE_FILTERS: { value: AgeFilter; label: string }[] = [
  { value: "all",     label: "All" },
  { value: "2-5",     label: "Ages 2–5" },
  { value: "4-8",     label: "Ages 4–8" },
  { value: "6-12",    label: "Ages 6–12" },
  { value: "8-14",    label: "Ages 8–14" },
  { value: "parents", label: "Parents" },
];

const SECTIONS = [
  "Kevin DeYoung",
  "Reformed & Gospel-Centered",
  "Catechism & Doctrine",
  "Classic Christian",
] as const;

const BOOKS: KidsBook[] = [
  // ── Kevin DeYoung ────────────────────────────────────────────────────────────
  {
    id: "dey-1",
    isbn: "9781433546686",
    title: "The Biggest Story",
    author: "Kevin DeYoung",
    ageLabel: "Ages 4–8",
    ageFilter: "4-8",
    description:
      "A sweeping retelling of the whole Bible story, showing how every part points to Jesus.",
    section: "Kevin DeYoung",
    fallbackEmoji: "📖",
  },
  {
    id: "dey-2",
    isbn: "9781433564420",
    title: "The Biggest Story ABC",
    author: "Kevin DeYoung",
    ageLabel: "Ages 2–5",
    ageFilter: "2-5",
    description:
      "An alphabet book that traces the gospel from A to Z.",
    section: "Kevin DeYoung",
    fallbackEmoji: "🔤",
  },
  {
    id: "dey-3",
    isbn: "9781433556937",
    title: "How Does Sanctification Work?",
    author: "Kevin DeYoung",
    ageLabel: "For Parents",
    ageFilter: "parents",
    description:
      "A clear, accessible explanation of how God makes His people holy — essential reading for parents seeking to model growth in grace.",
    section: "Kevin DeYoung",
    fallbackEmoji: "🕯",
  },
  {
    id: "dey-4",
    title: "Impossible Christianity",
    author: "Kevin DeYoung",
    ageLabel: "Teens & Parents",
    ageFilter: "parents",
    description:
      "Confronts the impossible standards we impose on the Christian life and points back to grace, trust, and what God actually requires.",
    section: "Kevin DeYoung",
    fallbackEmoji: "✝️",
  },

  // ── Reformed & Gospel-Centered ───────────────────────────────────────────────
  {
    id: "ref-1",
    isbn: "9781936768257",
    title: "Long Story Short",
    author: "Marty Machowski",
    ageLabel: "Ages 6–12",
    ageFilter: "6-12",
    description:
      "A family devotional through the whole Bible in 78 weeks, designed for daily family worship.",
    section: "Reformed & Gospel-Centered",
    fallbackEmoji: "🕯",
  },
  {
    id: "ref-2",
    isbn: "9781936768004",
    title: "The Gospel Story Bible",
    author: "Marty Machowski",
    ageLabel: "Ages 4–10",
    ageFilter: "4-8",
    description:
      "145 stories from Genesis to Revelation, all pointing to Christ.",
    section: "Reformed & Gospel-Centered",
    fallbackEmoji: "📚",
  },
  {
    id: "ref-3",
    isbn: "9781087787732",
    title: "Big Theology for Little Kids",
    author: "Stephen Gagné",
    ageLabel: "Ages 3–7",
    ageFilter: "4-8",
    description:
      "Introduces profound theological truths in simple, memorable language.",
    section: "Reformed & Gospel-Centered",
    fallbackEmoji: "🏛",
  },
  {
    id: "ref-4",
    isbn: "9780310708254",
    title: "Jesus Storybook Bible",
    author: "Sally Lloyd-Jones",
    ageLabel: "Ages 4–8",
    ageFilter: "4-8",
    description:
      "Every story whispers His name — a beloved children's Bible that shows how all Scripture points to Jesus.",
    section: "Reformed & Gospel-Centered",
    fallbackEmoji: "✝️",
  },

  // ── Catechism & Doctrine ─────────────────────────────────────────────────────
  {
    id: "cat-1",
    isbn: "9780875525778",
    title: "Training Hearts, Teaching Minds",
    author: "Starr Meade",
    ageLabel: "Ages 8–14",
    ageFilter: "8-14",
    description:
      "A family devotional built on the Westminster Shorter Catechism, one question per week.",
    section: "Catechism & Doctrine",
    fallbackEmoji: "📜",
  },
  {
    id: "cat-2",
    title: "A Puritan Catechism",
    author: "Charles Spurgeon",
    ageLabel: "For Parents",
    ageFilter: "parents",
    description:
      "Spurgeon's own catechism, faithful to historic Reformed doctrine, suitable for family instruction.",
    section: "Catechism & Doctrine",
    fallbackEmoji: "📋",
  },
  {
    id: "cat-3",
    isbn: "9781936768943",
    title: "First Catechism",
    author: "Great Commission Publications",
    ageLabel: "Ages 4–8",
    ageFilter: "4-8",
    description:
      "Simple questions and answers introducing children to the basics of the Christian faith.",
    section: "Catechism & Doctrine",
    fallbackEmoji: "❓",
  },

  // ── Classic Christian ─────────────────────────────────────────────────────────
  {
    id: "cls-1",
    isbn: "9780802851765",
    title: "Dangerous Journey",
    author: "Oliver Hunkin",
    ageLabel: "Ages 8–12",
    ageFilter: "8-14",
    description:
      "A beautifully illustrated retelling of Bunyan's Pilgrim's Progress for children.",
    section: "Classic Christian",
    fallbackEmoji: "🛤",
  },
  {
    id: "cls-2",
    isbn: "9780802471550",
    title: "Little Pilgrim's Progress",
    author: "Helen Taylor",
    ageLabel: "Ages 8–12",
    ageFilter: "8-14",
    description:
      "Bunyan's classic rewritten for children, following young Christian through the journey of faith.",
    section: "Classic Christian",
    fallbackEmoji: "🏰",
  },
  {
    id: "cls-3",
    title: "In His Steps",
    author: "Charles Sheldon (adapted)",
    ageLabel: "Ages 8–12",
    ageFilter: "8-14",
    description:
      "The classic 'What Would Jesus Do?' story in a form children can follow.",
    section: "Classic Christian",
    fallbackEmoji: "👣",
  },
  {
    id: "cls-4",
    isbn: "9781884377136",
    title: "Missionary Stories with the Millers",
    author: "Mildred Martin",
    ageLabel: "Ages 6–12",
    ageFilter: "6-12",
    description:
      "True stories of faith, courage, and God's faithfulness through missionaries around the world.",
    section: "Classic Christian",
    fallbackEmoji: "🌍",
  },
];

// ─── Book Card ────────────────────────────────────────────────────────────────

function BookCard({ book }: { book: KidsBook }) {
  const [imgError, setImgError] = useState(false);
  const coverSrc =
    book.isbn && !imgError
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
      : null;

  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
    book.title + " " + book.author
  )}`;

  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all group">
      {/* Book cover */}
      <div className="relative w-full aspect-[2/3] bg-[#181818] overflow-hidden">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={`${book.title} cover`}
            className="w-full aspect-[2/3] object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-900/20 to-[#181818] p-4 text-center">
            <span className="text-5xl mb-3">{book.fallbackEmoji ?? "📖"}</span>
            <p className="text-white/30 text-[11px] font-semibold leading-5 line-clamp-3">
              {book.title}
            </p>
          </div>
        )}
        {/* Age badge */}
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/70 text-amber-300/80 border border-amber-500/25 backdrop-blur-sm">
            {book.ageLabel}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-bold text-white/85 leading-snug mb-0.5 group-hover:text-white transition-colors">
          {book.title}
        </h3>
        <p className="text-[11px] text-amber-300/50 font-semibold mb-2">{book.author}</p>
        <p className="text-[11px] text-white/40 leading-relaxed flex-1 mb-3">
          {book.description}
        </p>
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] text-amber-300/70 text-[11px] font-semibold hover:bg-amber-500/15 hover:text-amber-200 transition-colors"
        >
          🛒 Buy on Amazon
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KidsBooksPage() {
  const [activeAge, setActiveAge] = useState<AgeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = BOOKS.filter((book) => {
    if (activeAge !== "all" && book.ageFilter !== activeAge) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const booksBySection = SECTIONS.map((section) => ({
    section,
    books: filtered.filter((b) => b.section === section),
  })).filter((s) => s.books.length > 0);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero */}
      <div className="max-w-screen-xl mx-auto px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📚</span>
          <span className="text-xs font-bold text-amber-400/70 uppercase tracking-widest">
            Christian Children&apos;s Literature
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Books for Children &amp; Families
        </h1>
        <p className="text-white/40 text-sm leading-relaxed max-w-xl">
          Reformed and gospel-centered books for every age — curated to plant deep roots and
          make the gospel feel glorious to your children.
        </p>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-14 z-30 border-b border-white/[0.06] bg-[#0f0f0f]/95 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          {/* Age chips */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {AGE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveAge(value)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                  activeAge === value
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                    : "border-white/[0.08] text-white/35 hover:border-amber-500/20 hover:text-white/55"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search books, authors…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/65 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {booksBySection.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/25 text-sm">No books match your filters.</p>
            <button
              onClick={() => {
                setActiveAge("all");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-amber-400/50 hover:text-amber-300 font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {booksBySection.map(({ section, books }) => (
              <section key={section}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-white/70">{section}</h2>
                    <p className="text-[11px] text-white/25 mt-0.5">
                      {books.length} book{books.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Book grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-white/[0.06] pt-8 text-center">
          <p className="text-xs text-white/20 max-w-lg mx-auto leading-relaxed">
            These recommendations reflect a Reformed, Calvinist perspective. All books are selected
            for theological soundness, literary quality, and their ability to help children love God
            and understand the gospel.
          </p>
        </div>
      </div>
    </div>
  );
}
