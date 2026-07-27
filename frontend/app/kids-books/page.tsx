"use client";

/**
 * Kids Books — Editorial Reading Room layout
 *
 * Single-typeface (inherited from layout's Inter), gold accent. Adds an
 * Editor's Pick hero, generous section headers with deks, larger covers,
 * and a discreet underlined buy CTA so the cover is the visual hero.
 */

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../lib/useTheme";
import { UiIcon, collectionIconName } from "../components/UiIcon";

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
    fallbackEmoji: "landmark",
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
    fallbackEmoji: "prayer",
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
    fallbackEmoji: "file",
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
    fallbackEmoji: "cross",
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
    fallbackEmoji: "book",
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
    fallbackEmoji: "calendar",
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
    fallbackEmoji: "cross",
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
    fallbackEmoji: "heart",
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
    fallbackEmoji: "external",
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
    fallbackEmoji: "leaf",
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
    fallbackEmoji: "library",
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
    fallbackEmoji: "heart",
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
    fallbackEmoji: "dove",
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
    fallbackEmoji: "church",
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
    fallbackEmoji: "book",
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
    fallbackEmoji: "flame",
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
    fallbackEmoji: "leaf",
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
    fallbackEmoji: "file",
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
    fallbackEmoji: "map",
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
    fallbackEmoji: "sparkle",
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
    fallbackEmoji: "book",
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
    fallbackEmoji: "file",
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
    fallbackEmoji: "star",
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
    fallbackEmoji: "landmark",
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
    fallbackEmoji: "shield",
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
    fallbackEmoji: "star",
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
    fallbackEmoji: "mic",
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
    fallbackEmoji: "file",
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
  fallbackEmoji: "book",
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

function EditorsPick({ book, isLight }: { book: KidsBook; isLight: boolean }) {
  const [imgError, setImgError] = useState(false);
  const src = coverHref(book);

  return (
    <section className="mb-16 sm:mb-20">
      <div
        className="mx-auto mb-8 flex h-[304px] max-w-[298px] flex-col items-center justify-center rounded-[30px]"
        style={{
          background: isLight ? "#ffffff" : "rgba(255,255,255,0.045)",
          border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="group relative mb-0 aspect-[138/176] w-[138px] overflow-hidden rounded-[18px]"
          style={{
            background: isLight ? "#f6f1e9" : "#111111",
            border: isLight ? "1px solid rgba(210,179,117,0.35)" : "1px solid rgba(201,169,97,0.25)",
            boxShadow: isLight ? "none" : "0 24px 55px rgba(0,0,0,0.35)",
          }}
        >
          {src && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${book.title} cover`}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
              style={{ background: isLight ? "#e8e8e8" : "linear-gradient(to bottom right, #1a1220, #0d0a14)" }}
            >
              <UiIcon name={collectionIconName(book.fallbackEmoji)} size={54} className="mb-4" />
              <p
                className="text-xs font-semibold leading-snug"
                style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.40)" }}
              >{book.title}</p>
            </div>
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              display: isLight ? "none" : undefined,
              background: "linear-gradient(to top, rgba(10,6,22,0.25) 0%, transparent 30%), linear-gradient(to bottom, rgba(10,6,22,0.10) 0%, transparent 25%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ display: isLight ? "none" : undefined, background: "radial-gradient(ellipse 70% 50% at 20% 12%, rgba(201,169,97,0.22) 0%, transparent 70%)" }}
          />
        </div>
      </div>
        <p
          className="text-center text-[11px] font-black uppercase"
          style={{ color: isLight ? "#b2a58f" : "rgba(255,255,255,0.45)" }}
        >
          Featured of the Month
        </p>

      <div className="mt-5 flex flex-col text-center">
        <div className="flex flex-col justify-start flex-1 min-w-0">
          <h2
            className="mb-3 text-[24px] font-black leading-none sm:text-3xl md:text-4xl"
            style={{ color: "#0a0a0a" }}
          >
            {book.title}
          </h2>
          <p className="mb-4 text-sm italic sm:text-base" style={{ color: isLight ? "rgba(0,0,0,0.55)" : "#c9a961" }}>by {book.author}</p>
          <p
            className="mx-auto mb-6 max-w-[298px] text-[15px] font-medium leading-[1.18] sm:max-w-2xl"
            style={{ color: isLight ? "#777777" : "rgba(255,255,255,0.65)" }}
          >
            A warm catechism companion for parents and children learning Christian doctrine together.
          </p>

          <div className="mx-auto mb-7 hidden max-w-md grid-cols-3 gap-6 sm:grid">
            <div>
              <p
                className="text-[10px] font-bold tracking-wider uppercase mb-1"
                style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.35)" }}
              >
                Publisher
              </p>
              <p className="text-sm" style={{ color: isLight ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.80)" }}>{book.publisher ?? "—"}</p>
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-wider uppercase mb-1"
                style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.35)" }}
              >
                Pages
              </p>
              <p className="text-sm" style={{ color: isLight ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.80)" }}>{book.pages ?? "—"}</p>
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-wider uppercase mb-1"
                style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.35)" }}
              >
                Reading level
              </p>
              <p className="text-sm" style={{ color: isLight ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.80)" }}>{book.readingLevel ?? "—"}</p>
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-3 sm:flex">
            <a
              href={book.buyLink ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-colors"
              style={{ background: isLight ? "#e5e7eb" : "#c9a961", color: isLight ? "#0a0a0a" : "#1a0e2e", border: isLight ? "1px solid rgba(17,17,17,0.12)" : "none" }}
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
  const { theme } = useTheme();
  const domTheme = typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null;
  const isLight = domTheme === "white-noir" || domTheme === "light" || theme === "white-noir" || (theme as string) === "light";

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
      className="fixed inset-0 z-[999] overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-10">
      {/* Modal panel */}
      <div
        className="kids-book-modal-panel relative isolate w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "#ffffff",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.10)",
          color: "#0a0a0a",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.15)", color: "#0a0a0a" }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Cover */}
        <div className="w-full flex items-center justify-center pt-8 pb-5 px-8"
          style={{ backgroundColor: "#f5f5f5" }}>
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
              style={{ backgroundColor: "#e8e8e8" }}>
              <UiIcon name={collectionIconName(book.fallbackEmoji)} size={46} className="mb-2" />
            </div>
          )}
        </div>

        {/* Info */}
        <div
          className="kids-book-modal-info relative z-[1] px-6 pb-7 pt-5"
          style={{
            background: "#ffffff",
            backgroundColor: "#ffffff",
            color: "#0a0a0a",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Age badge */}
          <span className="inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#0a0a0a" }}>
            {book.ageLabel.toUpperCase()}
          </span>

          <h2 className="text-[18px] font-bold leading-snug mb-1" style={{ color: "#0a0a0a" }}>
            {book.title}
          </h2>
          <p className="text-[13px] italic mb-4" style={{ color: "#333333" }}>
            by {book.author}
          </p>

          <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#111111" }}>
            {book.description}
          </p>

          {/* Meta grid */}
          {(book.publisher || book.pages || book.readingLevel) && (
            <div className="grid grid-cols-3 gap-3 mb-6 py-4 rounded-xl px-3"
              style={{ backgroundColor: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              {book.publisher && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(0,0,0,0.55)" }}>Publisher</p>
                  <p className="text-[12px] leading-snug" style={{ color: "#0a0a0a" }}>{book.publisher}</p>
                </div>
              )}
              {book.pages && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(0,0,0,0.55)" }}>Pages</p>
                  <p className="text-[12px]" style={{ color: "#0a0a0a" }}>{book.pages}</p>
                </div>
              )}
              {book.readingLevel && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(0,0,0,0.55)" }}>Level</p>
                  <p className="text-[12px] leading-snug" style={{ color: "#0a0a0a" }}>{book.readingLevel}</p>
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
              style={{ backgroundColor: "#e5e7eb", color: "#0a0a0a" }}
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
    </div>
  );
}

// ─── Section card grid ────────────────────────────────────────────────────────

function BookCard({ book, isLight }: { book: KidsBook; isLight: boolean }) {
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
          className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden group cursor-pointer text-left shadow-lg"
          style={{ background: isLight ? "#f0f0f0" : "#111111" }}
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
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
              style={{ background: isLight ? "#e8e8e8" : "linear-gradient(to bottom right, #1a1220, #0d0a14)" }}
            >
              <UiIcon name={collectionIconName(book.fallbackEmoji)} size={46} className="mb-3" />
              <p
                className="text-[11px] font-semibold leading-snug line-clamp-3"
                style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}
              >
                {book.title}
              </p>
            </div>
          )}

          {/* Subtle edge vignette — keeps cover visible */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              display: isLight ? "none" : undefined,
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
            className="text-[15px] font-bold leading-snug mb-1 cursor-pointer transition-colors"
            style={{ color: "#0a0a0a" }}
            onClick={() => setModalOpen(true)}
          >{book.title}</h3>
          <p className="text-[12px] italic mb-2" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(201,169,97,0.85)" }}>{book.author}</p>
          <p className="text-[12px] leading-relaxed mb-3 line-clamp-3" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.45)" }}>
            {book.description}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold underline underline-offset-4 decoration-[#c9a961]/40 hover:decoration-[#c9a961] transition-colors"
            style={{ color: isLight ? "#0a0a0a" : "#c9a961" }}
          >
            {label} ↗
          </a>
        </div>
      </div>
    </>
  );
}

function SectionHeader({ section, count, isLight }: { section: SectionMeta; count: number; isLight: boolean }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#0a0a0a" }}>
          {section.name}
        </h2>
        <p
          className="text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap"
          style={{ color: isLight ? "rgba(0,0,0,0.45)" : "#c9a961" }}
        >
          {count} {count === 1 ? "title" : "titles"}
        </p>
      </div>
      <p className="text-[14px] leading-relaxed max-w-2xl" style={{ color: isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.45)" }}>{section.dek}</p>
      <div className="h-px mt-5" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KidsBooksPage() {
  const { theme } = useTheme();
  const isLight = (typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") : null) === "white-noir" || theme === "white-noir";

  const booksBySection = SECTIONS
    .map((section) => ({
      section,
      books: BOOKS.filter((b) => b.section === section.name),
    }))
    .filter((s) => s.books.length > 0);

  return (
    <div className="min-h-screen" style={{ background: isLight ? "#fbfbfa" : "#0a0a0c", color: "#0a0a0a" }}>
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-14 sm:px-8">
        <p
          className="mb-5 text-[12px] font-black uppercase"
          style={{ color: isLight ? "#a3a3a3" : "#c9a961" }}
        >
          The Reading Room
        </p>
        <h1 className="mb-1 text-[35px] font-black leading-none sm:text-5xl md:text-6xl" style={{ color: "#0a0a0a" }}>
          Books for children
        </h1>
        <h1
          className="mb-[48px] text-[25px] italic leading-none sm:mb-6 sm:text-5xl md:text-6xl"
          style={{ color: isLight ? "#8e8e8e" : "rgba(255,255,255,0.55)", fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          and the families who love them.
        </h1>
        <p className="max-w-[326px] text-[17px] font-medium leading-[1.18] sm:max-w-2xl sm:text-lg" style={{ color: isLight ? "#6f6f6f" : "rgba(255,255,255,0.55)" }}>
          Gospel-centered reading lists for every age — curated to plant
          deep roots and make the gospel feel glorious to your children.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-28 pt-5 sm:px-8 sm:py-12">
        <EditorsPick book={EDITORS_PICK} isLight={isLight} />

        <div className="space-y-20">
          {booksBySection.map(({ section, books }) => (
            <section key={section.name}>
              <SectionHeader section={section} count={books.length} isLight={isLight} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} isLight={isLight} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 pt-10 text-center" style={{ borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
          <p className="text-[13px] max-w-xl mx-auto leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.35)" }}>
            Curated from a Reformed perspective. Theological soundness, literary quality,
            and a love for Christ in every recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
