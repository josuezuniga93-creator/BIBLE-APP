"use client";

/**
 * Kids Books — Editorial Reading Room layout
 *
 * Single-typeface (inherited from layout's Inter), gold accent. Adds an
 * Editor's Pick hero, generous section headers with deks, larger covers,
 * and a discreet underlined buy CTA so the cover is the visual hero.
 */

import { useEffect, useMemo, useState } from "react";

interface KidsBook {
  id: string;
  isbn?: string;
  localImage?: string;
  title: string;
  author: string;
  ageLabel: string;
  description: string;
  section: string;
  fallbackEmoji?: string;
  pages?: number;
  publisher?: string;
  readingLevel?: string;
  buyLink?: string;
  buyLabel?: string;
}

interface SectionMeta {
  name: string;
  dek: string;
}

const SECTIONS: SectionMeta[] = [
  {
    name: "Children's Devotionals",
    dek: "Daily bread for young hearts — devotionals and theology primers that teach children to know God, pray with confidence, and understand the Bible's unfolding story.",
  },
  {
    name: "Bible Stories",
    dek: "Gospel-centered reading lists for every age — curated to plant deep roots and make the gospel feel glorious to your children.",
  },
  {
    name: "Toddler Books (Board Books)",
    dek: "Durable, beautifully illustrated board books that introduce the youngest readers to grace, the Holy Spirit, and the heroes of the Reformation — truth that fits in tiny hands.",
  },
  {
    name: "Children & Youth / Christian Picture Books",
    dek: "Picture books and illustrated stories that spark wonder — from Bunyan's pilgrim journey to R.C. Sproul's parables, every page points young imaginations toward Christ.",
  },
  {
    name: "Biographies for Young Readers",
    dek: "Stories of men and women who lived for God — church history made vivid and personal for the next generation.",
  },
];

const BOOKS: KidsBook[] = [
  // ── Children's Devotionals ───────────────────────────────────────────────────
  {
    id: "dev-1",
    localImage: "/kids-books/the-ology.jpg",
    isbn: "9781433541858",
    title: "The Ology: Ancient Truths, Ever New",
    author: "Marty Machowski",
    ageLabel: "Ages 6–12",
    description:
      "Systematic theology for families — 55 beautifully illustrated lessons covering God, creation, sin, salvation, and the Holy Spirit in language children actually understand.",
    section: "Children's Devotionals",
    fallbackEmoji: "🏛",
    publisher: "New Growth Press",
    pages: 240,
    readingLevel: "Family devotional",
    buyLink: "https://a.co/d/01rH77ud",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "dev-2",
    localImage: "/kids-books/teach-me-to-pray.jpg",
    title: "Teach Me to Pray: Praying God's Word from A to Z",
    author: "Kristen Wetherell",
    ageLabel: "Ages 4–8",
    description:
      "An alphabet-driven prayer primer that teaches children to pray using the words of Scripture — from Adoration to Zeal, every letter becomes a conversation with God.",
    section: "Children's Devotionals",
    fallbackEmoji: "🙏",
    publisher: "B&H Kids",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/0dckHV8q",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "dev-3",
    localImage: "/kids-books/more-than-a-story-ot.jpg",
    title: "More Than a Story: Old Testament",
    author: "Sally Michael",
    ageLabel: "Ages 6–12",
    description:
      "Goes beyond the surface narrative to show children the theological depth of every Old Testament story — ideal for family devotions or Sunday school.",
    section: "Children's Devotionals",
    fallbackEmoji: "📜",
    publisher: "Children Desiring God",
    readingLevel: "Family devotional",
    buyLink: "https://a.co/d/09V13jtx",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "dev-4",
    localImage: "/kids-books/more-than-a-story-nt.jpg",
    title: "More Than a Story: New Testament",
    author: "Sally Michael",
    ageLabel: "Ages 6–12",
    description:
      "Explores the Gospels and Epistles with children, drawing out rich doctrinal truth from familiar stories and teaching them to read the Bible as one unified message.",
    section: "Children's Devotionals",
    fallbackEmoji: "✝️",
    publisher: "Children Desiring God",
    readingLevel: "Family devotional",
    buyLink: "https://a.co/d/0bkiLqAm",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "dev-5",
    localImage: "/kids-books/biggest-story-bible-storybook.jpg",
    isbn: "9781433561764",
    title: "The Biggest Story Bible Storybook",
    author: "Kevin DeYoung",
    ageLabel: "Ages 4–8",
    description:
      "Sixty-six stories — one for every book of the Bible — each written to show how the entire Scripture points to the same Savior. Vivid illustrations by Don Clark.",
    section: "Children's Devotionals",
    fallbackEmoji: "📖",
    publisher: "Crossway",
    pages: 384,
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/09W3cmcv",
    buyLabel: "Buy on Amazon",
  },

  // ── Bible Stories ────────────────────────────────────────────────────────────
  {
    id: "bib-1",
    localImage: "/kids-books/365-great-bible-stories.jpg",
    title: "365 Great Bible Stories: The Good News of Jesus from Genesis to Revelation",
    author: "Carine MacKenzie",
    ageLabel: "Ages 4–10",
    description:
      "A story for every day of the year — from Genesis to Revelation — written with clarity and warmth, showing how the whole Bible is one great story of redemption.",
    section: "Bible Stories",
    fallbackEmoji: "📅",
    publisher: "Christian Focus",
    pages: 384,
    readingLevel: "Read-aloud / Independent",
    buyLink: "https://a.co/d/0c6wlZPW",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "bib-2",
    localImage: "/kids-books/jesus-storybook-bible.jpg",
    isbn: "9780310708254",
    title: "The Jesus Storybook Bible: Every Story Whispers His Name",
    author: "Sally Lloyd-Jones",
    ageLabel: "Ages 4–8",
    description:
      "The beloved classic that shows every story in the Bible — from the very beginning to the very end — is really one story: a never-stopping, never-giving-up, unbreakable love story.",
    section: "Bible Stories",
    fallbackEmoji: "✝️",
    publisher: "Zonderkidz",
    pages: 352,
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/02lutmdV",
    buyLabel: "Buy on Amazon",
  },

  // ── Toddler Books (Board Books) ──────────────────────────────────────────────
  {
    id: "tod-1",
    localImage: "/kids-books/his-grace-is-enough.jpg",
    title: "His Grace Is Enough: How God Makes It Right When We've Got It Wrong",
    author: "Melissa Kruger",
    ageLabel: "Ages 2–5",
    description:
      "A beautifully gentle board book that introduces toddlers to the concept of grace — that God loves us even when we mess up, and makes things right through Jesus.",
    section: "Toddler Books (Board Books)",
    fallbackEmoji: "💛",
    publisher: "The Good Book Company",
    readingLevel: "Board book",
    buyLink: "https://a.co/d/0b9uoHoe",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "tod-2",
    localImage: "/kids-books/man-who-preached-outside.jpg",
    title: "Man Who Preached Outside",
    author: "Rebecca VanDoodewaard",
    ageLabel: "Ages 3–6",
    description:
      "The story of George Whitefield — the open-air evangelist who preached to thousands in fields and streets. A vivid board book introduction to one of history's boldest gospel preachers.",
    section: "Toddler Books (Board Books)",
    fallbackEmoji: "📢",
    publisher: "Reformation Heritage Books",
    readingLevel: "Board book",
    buyLink: "https://a.co/d/0hhnnRUP",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "tod-3",
    localImage: "/kids-books/woman-who-helped-a-reformer.jpg",
    title: "Woman Who Helped a Reformer",
    author: "Rebecca VanDoodewaard",
    ageLabel: "Ages 3–6",
    description:
      "The story of Katharina Luther — the former nun who married Martin Luther and became the heart of the Reformation household. A beautiful board book about a woman of quiet faith and great courage.",
    section: "Toddler Books (Board Books)",
    fallbackEmoji: "🌿",
    publisher: "Reformation Heritage Books",
    readingLevel: "Board book",
    buyLink: "https://a.co/d/08EjEWU2",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "tod-4",
    localImage: "/kids-books/woman-who-loved-to-give-books.jpg",
    title: "The Woman Who Loved to Give Books",
    author: "Rebecca VanDoodewaard",
    ageLabel: "Ages 3–6",
    description:
      "The story of Susannah Spurgeon — wife of Charles Spurgeon — who used her health struggles to start a book fund that sent thousands of Christian books to poor pastors across England.",
    section: "Toddler Books (Board Books)",
    fallbackEmoji: "📚",
    publisher: "Reformation Heritage Books",
    readingLevel: "Board book",
    buyLink: "https://a.co/d/03a19H7B",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "tod-5",
    localImage: "/kids-books/doctor-who-became-a-preacher.jpg",
    title: "The Doctor Who Became a Preacher",
    author: "Rebecca VanDoodewaard",
    ageLabel: "Ages 3–6",
    description:
      "The story of Martyn Lloyd-Jones — the Welsh doctor who left medicine to become one of the 20th century's greatest preachers. A board book showing how God redirects even brilliant careers for His glory.",
    section: "Toddler Books (Board Books)",
    fallbackEmoji: "🩺",
    publisher: "Reformation Heritage Books",
    readingLevel: "Board book",
    buyLink: "https://a.co/d/0eZmYjGI",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "tod-6",
    localImage: "/kids-books/the-holy-spirit.jpg",
    title: "The Holy Spirit",
    author: "Devon Provencher",
    ageLabel: "Ages 2–5",
    description:
      "Part of the 'Big Theology for Little Hearts' series — a beautifully illustrated board book introducing the youngest children to who the Holy Spirit is and what He does in the lives of believers.",
    section: "Toddler Books (Board Books)",
    fallbackEmoji: "🕊️",
    publisher: "Big Theology for Little Hearts",
    readingLevel: "Board book",
    buyLink: "https://a.co/d/09TUzw6z",
    buyLabel: "Buy on Amazon",
  },

  // ── Children & Youth / Christian Picture Books ───────────────────────────────
  {
    id: "pic-1",
    localImage: "/kids-books/little-pilgrims-progress.jpg",
    title: "Little Pilgrim's Progress",
    author: "Helen L. Taylor, illustrated by Joe Sutphin",
    ageLabel: "Ages 6–12",
    description:
      "Bunyan's timeless allegory reimagined for children with stunning new illustrations by Joe Sutphin — woodland animal characters guide young Christian through the journey from the City of Destruction to the Celestial City.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🏰",
    publisher: "Moody Publishers",
    readingLevel: "Independent / Read-aloud",
    buyLink: "https://a.co/d/095kszww",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-2",
    localImage: "/kids-books/sophie-and-the-heidelberg-cat.jpg",
    title: "Sophie and the Heidelberg Cat",
    author: "Andrew Wilson",
    ageLabel: "Ages 6–10",
    description:
      "A charming picture book that introduces children to the Heidelberg Catechism through the story of young Sophie and a very theological cat.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🐱",
    publisher: "10Publishing",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/06K7onjD",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-3",
    localImage: "/kids-books/the-king-and-the-dragon.jpg",
    title: "The King and the Dragon",
    author: "James W. Shrimpton",
    ageLabel: "Ages 5–9",
    description:
      "A gospel allegory dressed as a fairy tale — a king battles a fearsome dragon in a story that echoes the great victory of Christ over sin and death.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🐉",
    publisher: "Christian Focus",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/025xBXql",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-4",
    localImage: "/kids-books/the-sower.jpg",
    title: "The Sower",
    author: "Scott James",
    ageLabel: "Ages 4–8",
    description:
      "A beautifully illustrated picture book retelling the Parable of the Sower, helping children understand how God's Word takes root differently in different hearts.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🌱",
    publisher: "The Good Book Company",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/07RQ6w23",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-5",
    localImage: "/kids-books/john-calvins-illustrated-institutes.jpg",
    title: "John Calvin's Illustrated Institutes: Book 1",
    author: "REFTOONS",
    ageLabel: "Ages 10+",
    description:
      "Calvin's Institutes made visual — a graphic adaptation of Chapters 1–5 of Book 1, covering the knowledge of God and knowledge of ourselves. Theology you can see.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🖼",
    publisher: "REFTOONS",
    readingLevel: "Teen / Adult",
    buyLink: "https://www.reftoons.com/products/john-calvins-illustrated-institutes-1?srsltid=AfmBOooCZCkMdZssilbMKtIs4O8zaxvXq5lKu_6Dt1W7WGNpao_XxKiO",
    buyLabel: "Buy on REFTOONS",
  },
  {
    id: "pic-6",
    localImage: "/kids-books/the-knights-map.jpg",
    isbn: "9781567692860",
    title: "The Knight's Map",
    author: "R.C. Sproul",
    ageLabel: "Ages 5–9",
    description:
      "A medieval knight receives a map from the King — an allegory about the Bible as our guide through life, beautifully illustrated for young readers.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🗺",
    publisher: "Reformation Trust",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/0dFcRrpR",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-7",
    localImage: "/kids-books/the-lightlings.jpg",
    isbn: "9781567690521",
    title: "The Lightlings",
    author: "R.C. Sproul",
    ageLabel: "Ages 4–8",
    description:
      "Tiny creatures called Lightlings fear the darkness around them — a beautiful parable of the Fall and redemption, pointing children toward the true Light of the world.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "✨",
    publisher: "Reformation Trust",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/08qoL1M3",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-8",
    localImage: "/kids-books/donkey-who-carried-a-king.jpg",
    isbn: "9781567690538",
    title: "The Donkey Who Carried a King",
    author: "R.C. Sproul",
    ageLabel: "Ages 4–8",
    description:
      "Told from the perspective of the donkey on Palm Sunday — a humble, whimsical story that shows every creature has a role in glorifying the King of kings.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🫏",
    publisher: "Reformation Trust",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/0gB2DFeI",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-9",
    localImage: "/kids-books/priest-with-dirty-clothes.jpg",
    isbn: "9781567691771",
    title: "The Priest with Dirty Clothes",
    author: "R.C. Sproul",
    ageLabel: "Ages 4–8",
    description:
      "Based on Zechariah 3, a story about a filthy priest and a gracious King — a profound picture of justification told through a gentle, illustrated allegory.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "👘",
    publisher: "Reformation Trust",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/0fpnHBLV",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-10",
    localImage: "/kids-books/nugget-and-the-refiner.jpg",
    title: "Nugget and the Refiner",
    author: "Kerry Tittle",
    ageLabel: "Ages 5–9",
    description:
      "A nugget of gold in the hands of a skilled refiner — an illustrated story of sanctification, helping children understand how God uses trials to purify our hearts.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🥇",
    publisher: "Christian Focus",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/020VcqcG",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-11",
    localImage: "/kids-books/david-and-the-very-big-giant.jpg",
    title: "David and the Very Big Giant",
    author: "Tim Thornborough & Jennifer Davison",
    ageLabel: "Ages 3–6",
    description:
      "The beloved story of David and Goliath retold with joyful illustrations — showing young children that God is bigger than any giant we face.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🪨",
    publisher: "The Good Book Company",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/05y8crKR",
    buyLabel: "Buy on Amazon",
  },
  {
    id: "pic-12",
    localImage: "/kids-books/daniel-and-the-very-hungry-lions.jpg",
    title: "Daniel and the Very Hungry Lions",
    author: "Tim Thornborough & Jennifer Davison",
    ageLabel: "Ages 3–6",
    description:
      "Daniel faces a den of very hungry lions — a cheerful retelling of a fearless faith that God honors, perfect for the youngest readers.",
    section: "Children & Youth / Christian Picture Books",
    fallbackEmoji: "🦁",
    publisher: "The Good Book Company",
    readingLevel: "Read-aloud",
    buyLink: "https://a.co/d/07p08ooz",
    buyLabel: "Buy on Amazon",
  },

  // ── Biographies for Young Readers ────────────────────────────────────────────
  {
    id: "bio-1",
    localImage: "/kids-books/lady-jane-grey.jpg",
    isbn: "9781601781093",
    title: "Lady Jane Grey",
    author: "Simonetta Carr",
    ageLabel: "Ages 8–14",
    description:
      "The story of England's nine-day queen who died for her Protestant faith at just sixteen — a biography of courage, conviction, and trust in God's sovereignty.",
    section: "Biographies for Young Readers",
    fallbackEmoji: "👑",
    publisher: "Reformation Heritage Books",
    readingLevel: "Independent",
    buyLink: "https://store.generations.org/products/lady-jane-grey?srsltid=AfmBOoqgNGLVO_ZNdhkAE3V2C4XS2fhfKU9RaXhehsaV3_uqXOCj2W4x",
    buyLabel: "Buy on Generations",
  },
  {
    id: "bio-2",
    localImage: "/kids-books/charles-haddon-spurgeon.jpg",
    isbn: "9781601783615",
    title: "Charles Haddon Spurgeon",
    author: "Simonetta Carr",
    ageLabel: "Ages 8–14",
    description:
      "The Prince of Preachers — from his conversion at fifteen to filling the Metropolitan Tabernacle, Spurgeon's life shows what God does with a heart fully surrendered.",
    section: "Biographies for Young Readers",
    fallbackEmoji: "🎤",
    publisher: "Reformation Heritage Books",
    readingLevel: "Independent",
    buyLink: "https://store.generations.org/products/charles-haddon-spurgeon-1",
    buyLabel: "Buy on Generations",
  },
  {
    id: "bio-3",
    localImage: "/kids-books/john-calvin.jpg",
    isbn: "9781601782090",
    title: "John Calvin",
    author: "Simonetta Carr",
    ageLabel: "Ages 8–14",
    description:
      "The story of a shy scholar who became one of the most influential theologians in Christian history — Carr brings Calvin to life for a new generation of young readers.",
    section: "Biographies for Young Readers",
    fallbackEmoji: "📜",
    publisher: "Reformation Heritage Books",
    readingLevel: "Independent",
    buyLink: "https://a.co/d/07UFxJmY",
    buyLabel: "Buy on Amazon",
  },
];

// ─── Editor's Pick book ───────────────────────────────────────────────────────

const EDITORS_PICK: KidsBook = {
  id: "pick-1",
  isbn: "9780891077824",
  localImage: "/kids-books/big-truths-for-little-kids.jpg",
  title: "Big Truths for Little Kids",
  author: "Susan Hunt & Richie Hunt",
  ageLabel: "Ages 4–8",
  description:
    "A family devotional through the Westminster Shorter Catechism — 52 weeks of truth, each brought to life with a story, a key Scripture, and questions for little hearts. One of the most beloved theology-for-kids books ever written.",
  section: "editor",
  fallbackEmoji: "📖",
  publisher: "Crossway",
  pages: 224,
  readingLevel: "Family devotional",
  buyLink: "https://a.co/d/0ecgjnFM",
  buyLabel: "Buy on Amazon",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function coverHref(book: KidsBook) {
  if (book.localImage) return book.localImage;
  return book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : null;
}

// ─── Hero "Editor's Pick" ─────────────────────────────────────────────────────

function EditorsPick({ book }: { book: KidsBook }) {
  const [imgError, setImgError] = useState(false);
  const src = coverHref(book);

  return (
    <section className="mb-20">
      <div className="flex items-center gap-4 mb-6">
        <p className="text-[11px] font-bold tracking-[0.25em] text-[#c9a961] uppercase">
          Editor&rsquo;s Pick
        </p>
        <div className="flex-1 h-px bg-[#c9a961]/25" />
      </div>

      {/* Featured cover — centered above "Featured" label */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-[160px] aspect-[2/3] rounded-xl overflow-hidden bg-[#111] shadow-2xl mb-4 group">
          {src && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${book.title} cover`}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1a1220] to-[#0d0a14]">
              <span className="text-6xl mb-4">{book.fallbackEmoji ?? "📖"}</span>
              <p className="text-white/40 text-xs font-semibold leading-snug">{book.title}</p>
            </div>
          )}
          {/* Subtle edge vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(10,6,22,0.25) 0%, transparent 30%), linear-gradient(to bottom, rgba(10,6,22,0.10) 0%, transparent 25%)" }}
          />
          {/* Gold sheen */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: "radial-gradient(ellipse 70% 50% at 20% 12%, rgba(201,169,97,0.22) 0%, transparent 70%)" }}
          />
        </div>
        <p className="text-[11px] font-bold tracking-[0.2em] text-white/45 uppercase">
          Featured of the Month
        </p>
      </div>

      {/* Copy — full width below the cover */}
      <div className="flex flex-col">
        <div className="flex flex-col justify-start flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.05] mb-2">
            {book.title}
          </h2>
          <p className="text-base italic text-[#c9a961] mb-5">by {book.author}</p>
          <p className="text-[15px] text-white/65 leading-relaxed mb-6 max-w-2xl">
            {book.description}
          </p>

          {/* Metadata strip */}
          <div className="grid grid-cols-3 gap-6 max-w-md mb-7">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-white/35 uppercase mb-1">
                Publisher
              </p>
              <p className="text-sm text-white/80">{book.publisher ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-white/35 uppercase mb-1">
                Pages
              </p>
              <p className="text-sm text-white/80">{book.pages ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-white/35 uppercase mb-1">
                Reading level
              </p>
              <p className="text-sm text-white/80">{book.readingLevel ?? "—"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={book.buyLink ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c9a961] text-[#1a0e2e] text-sm font-bold hover:bg-[#d9b971] transition-colors"
            >
              {book.buyLabel ?? "Buy"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Book Detail Modal ────────────────────────────────────────────────────────

function BookModal({ book, onClose }: { book: KidsBook; onClose: () => void }) {
  const [imgError, setImgError] = useState(false);
  const src = coverHref(book);

  // Lock scroll & close on Escape
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center px-4 pt-10 pb-10"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#13131a", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Cover */}
        <div className="w-full flex items-center justify-center pt-8 pb-5 px-8"
          style={{ backgroundColor: "#0e0e14" }}>
          {src && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${book.title} cover`}
              className="w-40 object-contain rounded-md shadow-xl"
              style={{ maxHeight: "220px" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-40 h-56 flex flex-col items-center justify-center rounded-md"
              style={{ backgroundColor: "#1a1a24" }}>
              <span className="text-5xl mb-2">{book.fallbackEmoji ?? "📖"}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-6 pb-7 pt-5">
          {/* Age badge */}
          <span className="inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: "rgba(201,169,97,0.12)", color: "#c9a961" }}>
            {book.ageLabel.toUpperCase()}
          </span>

          <h2 className="text-[18px] font-bold text-white leading-snug mb-1">
            {book.title}
          </h2>
          <p className="text-[13px] italic mb-4" style={{ color: "#c9a961" }}>
            by {book.author}
          </p>

          <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
            {book.description}
          </p>

          {/* Meta grid */}
          {(book.publisher || book.pages || book.readingLevel) && (
            <div className="grid grid-cols-3 gap-3 mb-6 py-4 rounded-xl px-3"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {book.publisher && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Publisher</p>
                  <p className="text-[12px] text-white leading-snug">{book.publisher}</p>
                </div>
              )}
              {book.pages && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Pages</p>
                  <p className="text-[12px] text-white">{book.pages}</p>
                </div>
              )}
              {book.readingLevel && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Level</p>
                  <p className="text-[12px] text-white leading-snug">{book.readingLevel}</p>
                </div>
              )}
            </div>
          )}

          {/* Buy CTA */}
          {book.buyLink && (
            <a
              href={book.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[14px] font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#c9a961", color: "#111" }}
            >
              {book.buyLabel ?? "Buy"}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section card grid ────────────────────────────────────────────────────────

function BookCard({ book }: { book: KidsBook }) {
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const src = coverHref(book);
  const href = book.buyLink ?? "#";
  const label = book.buyLabel ?? "Buy";

  return (
    <>
      {modalOpen && <BookModal book={book} onClose={() => setModalOpen(false)} />}

      <div className="flex flex-col">
        {/* Cover — opens modal */}
        <button
          onClick={() => setModalOpen(true)}
          className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#111] group cursor-pointer text-left shadow-lg"
          aria-label={`View details for ${book.title}`}
        >
          {src && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${book.title} cover`}
              className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1a1220] to-[#0d0a14]">
              <span className="text-5xl mb-3">{book.fallbackEmoji ?? "📖"}</span>
              <p className="text-white/35 text-[11px] font-semibold leading-snug line-clamp-3">
                {book.title}
              </p>
            </div>
          )}

          {/* Subtle edge vignette — keeps cover visible */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(10,6,22,0.30) 0%, transparent 35%), linear-gradient(to bottom, rgba(10,6,22,0.12) 0%, transparent 30%)",
            }}
          />

          {/* Gold sheen — top-left glow on hover */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(201,169,97,0.18) 0%, transparent 65%)",
            }}
          />
        </button>

        {/* Metadata under cover */}
        <div className="mt-4">
          <h3
            className="text-[15px] font-bold text-white leading-snug mb-1 cursor-pointer hover:text-[#c9a961] transition-colors"
            onClick={() => setModalOpen(true)}
          >{book.title}</h3>
          <p className="text-[12px] italic text-[#c9a961]/85 mb-2">{book.author}</p>
          <p className="text-[12px] text-white/45 leading-relaxed mb-3 line-clamp-3">
            {book.description}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[#c9a961] underline underline-offset-4 decoration-[#c9a961]/40 hover:decoration-[#c9a961] transition-colors"
          >
            {label} ↗
          </a>
        </div>
      </div>
    </>
  );
}

function SectionHeader({ section, count }: { section: SectionMeta; count: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {section.name}
        </h2>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#c9a961] uppercase whitespace-nowrap">
          {count} {count === 1 ? "title" : "titles"}
        </p>
      </div>
      <p className="text-[14px] text-white/45 leading-relaxed max-w-2xl">{section.dek}</p>
      <div className="h-px bg-white/[0.08] mt-5" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KidsBooksPage() {
  const booksBySection = SECTIONS
    .map((section) => ({
      section,
      books: BOOKS.filter((b) => b.section === section.name),
    }))
    .filter((s) => s.books.length > 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-8">
        <p className="text-[11px] font-bold tracking-[0.25em] text-[#c9a961] uppercase mb-4">
          The Reading Room  /  Christian Children&rsquo;s Literature
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.04] mb-2">
          Books for children
        </h1>
        <h1 className="text-4xl sm:text-5xl md:text-6xl italic font-bold text-white/55 tracking-tight leading-[1.04] mb-6">
          and the families who love them.
        </h1>
        <p className="text-white/55 text-base sm:text-lg leading-relaxed max-w-2xl">
          Gospel-centered reading lists for every age — curated to plant
          deep roots and make the gospel feel glorious to your children.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <EditorsPick book={EDITORS_PICK} />

        <div className="space-y-20">
          {booksBySection.map(({ section, books }) => (
            <section key={section.name}>
              <SectionHeader section={section} count={books.length} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 border-t border-white/[0.06] pt-10 text-center">
          <p className="text-[13px] text-white/35 max-w-xl mx-auto leading-relaxed">
            Curated from a Reformed perspective. Theological soundness, literary quality,
            and a love for Christ in every recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
