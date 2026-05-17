import type { BookCatalogEntry } from "./types";

// Static book catalog — no backend required.
// All titles are public domain. Chapters are fetched from Project Gutenberg
// via the backend when it is running; otherwise the reader falls back gracefully.
export const STATIC_BOOK_CATALOG: BookCatalogEntry[] = [
  {
    slug: "pilgrims-progress",
    title: "The Pilgrim's Progress",
    author: "John Bunyan",
    year: 1678,
    description:
      "The greatest allegory in the English language. Christian's journey from the City of Destruction to the Celestial City remains the most widely read Christian book after the Bible.",
    cover_emoji: "📜",
    tags: ["Allegory", "Puritan", "Classic"],
    pg_id: 131,
    coming_soon: false,
  },
  {
    slug: "grace-abounding",
    title: "Grace Abounding to the Chief of Sinners",
    author: "John Bunyan",
    year: 1666,
    description:
      "Bunyan's spiritual autobiography — a raw and searching account of his conversion, his struggles with doubt, and the grace of God that held him fast through years of spiritual darkness.",
    cover_emoji: "✝️",
    tags: ["Autobiography", "Puritan", "Grace"],
    pg_id: 654,
    coming_soon: false,
  },
  {
    slug: "confessions-augustine",
    title: "Confessions",
    author: "Augustine of Hippo",
    year: 400,
    description:
      "The first great autobiography of the Western world. Augustine's honest account of his restless heart and his discovery that it finds rest only in God has spoken to every generation since.",
    cover_emoji: "📖",
    tags: ["Patristic", "Church Father", "Spiritual Memoir"],
    pg_id: 3296,
    coming_soon: false,
  },
  {
    slug: "imitation-of-christ",
    title: "The Imitation of Christ",
    author: "Thomas à Kempis",
    year: 1418,
    description:
      "After the Bible, the most read Christian book in history. A call to interior devotion, humility, and the pursuit of Christ over all earthly knowledge and honour.",
    cover_emoji: "🕊️",
    tags: ["Devotional", "Medieval", "Classic"],
    pg_id: 1653,
    coming_soon: false,
  },
  {
    slug: "institutes-of-religion",
    title: "Institutes of the Christian Religion",
    author: "John Calvin",
    year: 1536,
    description:
      "The masterwork of Reformed theology. Calvin's systematic exposition of Christian doctrine set the course of Protestant thought and remains indispensable for serious students of Scripture.",
    cover_emoji: "📚",
    tags: ["Theology", "Reformed", "Calvin", "Foundational"],
    pg_id: null,
    coming_soon: false,
  },
  {
    slug: "holiness-ryle",
    title: "Holiness",
    author: "J.C. Ryle",
    year: 1879,
    description:
      "Ryle's most celebrated work. Plain-spoken, searching, and practically wise — a thorough examination of what true holiness is, why it matters, and how it is pursued in ordinary Christian life.",
    cover_emoji: "✨",
    tags: ["Victorian", "Sanctification", "Practical", "Reformed"],
    pg_id: null,
    coming_soon: false,
  },
  {
    slug: "morning-evening-spurgeon",
    title: "Morning and Evening",
    author: "Charles H. Spurgeon",
    year: 1865,
    description:
      "366 daily devotional readings — one for morning, one for evening — drawn from Spurgeon's inexhaustible treasury of gospel preaching. A companion for every day of the year.",
    cover_emoji: "☀️",
    tags: ["Daily", "Devotional", "Spurgeon", "Victorian"],
    pg_id: null,
    coming_soon: false,
  },
  {
    slug: "sinners-in-hands-edwards",
    title: "Sinners in the Hands of an Angry God & Other Sermons",
    author: "Jonathan Edwards",
    year: 1741,
    description:
      "Edwards's famous sermon that sparked the Great Awakening, together with other sermons on the excellency of Christ, the reality of heaven, and the importance of seeking God now.",
    cover_emoji: "⚡",
    tags: ["Sermons", "Great Awakening", "Edwards"],
    pg_id: null,
    coming_soon: false,
  },
  {
    slug: "all-of-grace",
    title: "All of Grace",
    author: "Charles H. Spurgeon",
    year: 1886,
    description:
      "Spurgeon's clearest and most direct appeal to the unconverted. Written for ordinary people who want to know how to be saved, and saved now, by the free grace of God alone.",
    cover_emoji: "🎁",
    tags: ["Spurgeon", "Grace", "Foundational"],
    pg_id: null,
    coming_soon: true,
  },
  {
    slug: "knowledge-of-the-holy",
    title: "The Knowledge of the Holy",
    author: "A.W. Tozer",
    year: 1961,
    description:
      "A profound meditation on the attributes of God. Tozer contends that a right understanding of who God is lies at the heart of all genuine worship and Christian living.",
    cover_emoji: "🌟",
    tags: ["Theology", "Classic", "Practical"],
    pg_id: null,
    coming_soon: true,
  },
];
