import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "books");

const REQUEST_HEADERS = {
  "user-agent": "Tulip Bible App public-domain text importer",
  accept: "text/plain,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const CCEL = "https://www.ccel.org/ccel";

const TEXT_BOOKS = [
  {
    slug: "mortification-of-sin",
    title: "The Mortification of Sin",
    sourceLabel: "Christian Classics Ethereal Library",
    sourceUrl: `${CCEL}/o/owen/mort/cache/mort.txt`,
    urls: [`${CCEL}/o/owen/mort/cache/mort.txt`, "https://ccel.org/ccel/o/owen/mort/cache/mort.txt"],
    kind: "ccel",
  },
  {
    slug: "bondage-of-the-will",
    title: "The Bondage of the Will",
    sourceLabel: "Christian Classics Ethereal Library",
    sourceUrl: `${CCEL}/l/luther/bondage/cache/bondage.txt`,
    urls: [`${CCEL}/l/luther/bondage/cache/bondage.txt`, "https://ccel.org/ccel/l/luther/bondage/cache/bondage.txt"],
    kind: "ccel",
  },
  {
    slug: "religious-affections",
    title: "Religious Affections",
    sourceLabel: "Christian Classics Ethereal Library",
    sourceUrl: `${CCEL}/e/edwards/affections/cache/affections.txt`,
    urls: [`${CCEL}/e/edwards/affections/cache/affections.txt`, "https://ccel.org/ccel/e/edwards/affections/cache/affections.txt"],
    kind: "ccel",
  },
  {
    slug: "death-of-death",
    title: "The Death of Death in the Death of Christ",
    sourceLabel: "Christian Classics Ethereal Library",
    sourceUrl: `${CCEL}/o/owen/deathofdeath/cache/deathofdeath.txt`,
    urls: [`${CCEL}/o/owen/deathofdeath/cache/deathofdeath.txt`, "https://ccel.org/ccel/o/owen/deathofdeath/cache/deathofdeath.txt"],
    kind: "ccel",
  },
  {
    slug: "body-of-divinity",
    title: "Body of Divinity",
    sourceLabel: "Christian Classics Ethereal Library",
    sourceUrl: `${CCEL}/w/watson/divinity/cache/divinity.txt`,
    urls: [`${CCEL}/w/watson/divinity/cache/divinity.txt`, "https://ccel.org/ccel/w/watson/divinity/cache/divinity.txt"],
    kind: "ccel",
  },
  {
    slug: "freedom-of-the-will",
    title: "The Freedom of the Will",
    sourceLabel: "Christian Classics Ethereal Library",
    sourceUrl: `${CCEL}/e/edwards/will/cache/will.txt`,
    urls: [`${CCEL}/e/edwards/will/cache/will.txt`, "https://ccel.org/ccel/e/edwards/will/cache/will.txt"],
    kind: "ccel",
  },
  {
    slug: "commentary-on-romans-hodge",
    title: "Commentary on Romans",
    sourceLabel: "Internet Archive",
    sourceUrl: "https://archive.org/details/commentaryonepis00hodgiala",
    urls: [
      "https://archive.org/download/commentaryonepis00hodgiala/commentaryonepis00hodgiala_djvu.txt",
      "https://archive.org/stream/commentaryonepis00hodgiala/commentaryonepis00hodgiala_djvu.txt",
    ],
    kind: "archive-romans",
  },
  {
    slug: "fourfold-state",
    title: "Human Nature in Its Fourfold State",
    sourceLabel: "Internet Archive",
    sourceUrl: "https://archive.org/details/humannatureinits01bost",
    urls: ["https://archive.org/download/humannatureinits01bost/humannatureinits01bost_djvu.txt"],
    kind: "archive",
  },
  {
    slug: "practical-religion",
    title: "Practical Religion",
    sourceLabel: "Project Gutenberg",
    sourceUrl: "https://www.gutenberg.org/ebooks/38162",
    urls: [
      "https://www.gutenberg.org/ebooks/38162.txt.utf-8",
      "https://www.gutenberg.org/cache/epub/38162/pg38162.txt",
    ],
    kind: "gutenberg",
  },
];

const KNOTS_CHAPTERS = [
  ["Preface", "preface.html"],
  ["Evangelical Religion", "evangelical-religion.html"],
  ["Only One Way of Salvation", "only-one-way-of-salvation.html"],
  ["Private Judgment", "private-judgment.html"],
  ["The Thirty-Nine Articles", "the-thirty-nine-articles.html"],
  ["Regeneration", "regeneration.html"],
  ["Prayer-Book Statements About Regeneration", "prayer-book-statements-about-regeneration.html"],
  ["The Lord's Supper", "the-lords-supper.html"],
  ["The Real Presence", "the-real-presence.html"],
  ["The Church", "the-church.html"],
  ["The Priest", "the-priest.html"],
  ["Confession", "confession.html"],
  ["Worship", "worship.html"],
  ["The Sabbath", "the-sabbath.html"],
  ["Pharisees and Sadducees", "pharisees-and-sadducees.html"],
  ["Divers and Strange Doctrines", "divers-and-strange-doctrines.html"],
  ["The Fallibility of Ministers", "the-fallibility-of-ministers.html"],
  ["Apostolic Fears", "apostolic-fears.html"],
  ["Idolatry", "idolatry.html"],
];

const HTML_BOOKS = [
  {
    slug: "knots-untied",
    title: "Knots Untied",
    sourceLabel: "Bible Study Tools Classics",
    sourceUrl: "https://www.biblestudytools.com/classics/ryle-knots-untied/",
    kind: "knots",
  },
  {
    slug: "thoughts-for-young-men",
    title: "Thoughts for Young Men",
    sourceLabel: "Precept Austin",
    sourceUrl: "https://www.preceptaustin.org/thoughts-for-young-men-j-c-ryle",
    kind: "precept",
  },
  {
    slug: "duties-of-parents",
    title: "The Duties of Parents",
    sourceLabel: "SermonIndex",
    sourceUrl: "https://sermonindex.net/speakers/jc-ryle/the-duties-of-parents/",
    kind: "sermonindex",
  },
];

async function main() {
  await mkdir(outputDir, { recursive: true });

  const summaries = [];

  for (const book of TEXT_BOOKS) {
    const raw = await fetchFirst(book.urls);
    const clean = cleanSourceText(raw, book.kind, book.slug);
    const chapters = book.kind === "archive-romans"
      ? splitRomans(clean)
      : splitReadableSections(clean, book.title);
    await writeBook(book, chapters);
    summaries.push(`${book.slug}: ${chapters.length} sections`);
  }

  for (const book of HTML_BOOKS) {
    const chapters = await buildHtmlBook(book);
    await writeBook(book, chapters);
    summaries.push(`${book.slug}: ${chapters.length} sections`);
  }

  await writeSources();
  console.log(summaries.join("\n"));
}

async function fetchFirst(urls) {
  let lastError;
  for (const url of urls) {
    try {
      const text = await fetchText(url);
      if (wordCount(stripHtml(text)) > 150) return text;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`No source returned usable text: ${urls.join(", ")}`);
}

async function fetchText(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

async function buildHtmlBook(book) {
  if (book.kind === "knots") {
    const chapters = [];
    for (const [title, file] of KNOTS_CHAPTERS) {
      const url = new URL(file, book.sourceUrl).toString();
      const html = await fetchText(url);
      const text = extractBibleStudyToolsChapter(html, title);
      chapters.push(...splitOversizedChapter({ title, content: text }, 2600));
    }
    return chapters;
  }

  if (book.kind === "precept") {
    const html = await fetchText(book.sourceUrl);
    const text = extractBetween(
      htmlToText(html),
      "THOUGHTS FOR YOUNG MEN",
      "Related Resources"
    );
    return splitByKnownHeadings(text, [
      "I. REASONS FOR EXHORTING YOUNG MEN",
      "II. DANGERS OF YOUNG MEN",
      "III. GENERAL COUNSELS TO YOUNG MEN",
      "IV. SPECIAL RULES FOR YOUNG MEN",
      "CONCLUSION",
    ]);
  }

  if (book.kind === "sermonindex") {
    const html = await fetchText(book.sourceUrl);
    const text = extractBetween(
      htmlToText(html),
      "\"Train a child in the way he should go",
      "Everything we make is"
    );
    return splitByHintHeadings(`"${text}`, book.title);
  }

  throw new Error(`Unhandled HTML book kind: ${book.kind}`);
}

function extractBibleStudyToolsChapter(html, title) {
  const text = htmlToText(html);
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const titleIndexes = lines
    .map((line, index) => line === title || line === title.toUpperCase() ? index : -1)
    .filter((index) => index >= 0);
  let start = titleIndexes.length ? titleIndexes[titleIndexes.length - 1] + 1 : 0;

  while (
    start < lines.length &&
    /^(share|close|previous|next|john charles ryle)$/i.test(lines[start])
  ) {
    start += 1;
  }

  const stop = lines.findIndex((line, index) =>
    index > start &&
    /^(featured verse topics|privacy policy|our sites|proud member|copyright)/i.test(line)
  );
  const body = lines.slice(start, stop > -1 ? stop : undefined).join("\n\n");
  return normalizeWhitespace(body);
}

function extractBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) throw new Error(`Start marker not found: ${startMarker}`);
  const end = text.indexOf(endMarker, start + startMarker.length);
  return normalizeWhitespace(text.slice(start, end === -1 ? undefined : end));
}

function cleanSourceText(text, kind, slug) {
  let clean = text;
  if (kind === "gutenberg") clean = stripGutenbergWrapper(clean);
  if (kind === "ccel") clean = stripCcelScaffold(clean);
  if (kind === "archive" || kind === "archive-romans") clean = stripArchiveScaffold(clean);
  if (kind === "archive-romans") clean = stripHodgeRomansScaffold(clean);
  if (slug === "practical-religion") clean = stripPracticalReligionScaffold(clean);
  if (slug === "body-of-divinity") clean = stripBefore(clean, /A Body of Divinity/i);
  return normalizeWhitespace(clean);
}

function stripGutenbergWrapper(text) {
  const start = text.search(/\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG/i);
  const end = text.search(/\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG/i);
  let body = text;
  if (start >= 0) {
    const startLineEnd = text.indexOf("\n", start);
    body = text.slice(startLineEnd >= 0 ? startLineEnd + 1 : start);
  }
  if (end >= 0) body = body.slice(0, end);
  return body;
}

function stripCcelScaffold(text) {
  return text
    .replace(/_{20,}/g, "\n\n")
    .replace(/^Title:.*$/gim, "")
    .replace(/^Creator\(s\):.*$/gim, "")
    .replace(/^CCEL Subjects:.*$/gim, "")
    .replace(/^LC (Call no|Subjects):.*$/gim, "")
    .replace(/^This document has been generated.*$/gim, "");
}

function stripArchiveScaffold(text) {
  return text
    .replace(/Digitized by Google[\s\S]{0,900}?Public Domain/gi, "")
    .replace(/Google[\s\S]{0,400}?Digitized/gi, "")
    .replace(/\n\s*\d+\s*\n/g, "\n")
    .replace(/\n\s*[-_=]{3,}\s*\n/g, "\n\n");
}

function stripHodgeRomansScaffold(text) {
  let clean = text;
  const start = clean.search(/COMMENTARY\s+ON\s+THE\s+EPISTLE\s+TO\s+THE\s+ROMANS/i);
  if (start > 0) clean = clean.slice(start);

  const end = clean.search(/\n\s*THE\s+(?:END|BSD)\.?\s*\n/i);
  if (end > 0) clean = clean.slice(0, end);
  return clean;
}

function stripPracticalReligionScaffold(text) {
  return stripBefore(text, /\n\s*PREFACE\s*\n\s*The volume now in the reader's hands/i);
}

function stripBefore(text, marker) {
  const match = text.match(marker);
  if (!match || match.index === undefined || match.index <= 0) return text;
  return text.slice(match.index).trim();
}

function splitReadableSections(text, fallbackTitle) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const headings = [];
  const headingPattern = /^(?:(?:BOOK|Book|PART|Part|CHAPTER|Chapter|SECTION|Section)\s+(?:[IVXLCDM]+|\d+)[\s.:;-]*(?:.{0,140})|[IVXLCDM]+\.\s+.{4,140}|[A-Z][A-Z0-9 ,;:'"()—\-]{8,140})$/;

  lines.forEach((line, index) => {
    const compact = line.replace(/\s+/g, " ").trim();
    if (
      compact.length <= 160 &&
      (compact.length >= 8 || /^PREFACE$/i.test(compact)) &&
      (headingPattern.test(compact) || /^PREFACE$/i.test(compact)) &&
      !/^(Title|Creator|Publisher|Copyright|Contents|Index|Downloaded)/i.test(compact) &&
      !/\s\d{1,4}$/.test(compact)
    ) {
      headings.push({ index, title: titleCaseHeading(compact) });
    }
  });

  if (headings.length >= 4) {
    const chapters = [];
    const firstHeading = headings[0].index;
    const preface = lines.slice(0, firstHeading).join("\n\n");
    if (wordCount(preface) > 250) {
      chapters.push({ title: "Introduction", content: preface });
    }
    headings.forEach((heading, i) => {
      const next = headings[i + 1]?.index ?? lines.length;
      const content = lines.slice(heading.index + 1, next).join("\n\n");
      if (wordCount(content) > 80) {
        chapters.push({ title: heading.title, content });
      }
    });
    return chapters.flatMap((chapter) => splitOversizedChapter(chapter));
  }

  return chunkByWords(text, fallbackTitle, 1900);
}

function splitRomans(text) {
  const normalized = normalizeWhitespace(text)
    .replace(/\bEOMANS\b/gi, "ROMANS")
    .replace(/\bCHAP\.\s+/g, "CHAPTER ")
    .replace(/\bChap\.\s+/g, "CHAPTER ")
    .replace(/\bCHAPTE[RKBE]\s+/gi, "CHAPTER ");

  const romanHeading = /(?:^|\n)\s*(CHAPTER\s+(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI)\.?)\s*(?:\n|$)/g;
  const matches = [...normalized.matchAll(romanHeading)];

  if (matches.length >= 12) {
    const chapters = [];
    const intro = normalized.slice(0, matches[0].index).trim();
    if (wordCount(intro) > 400) chapters.push({ title: "Introduction", content: intro });

    matches.forEach((match, index) => {
      const start = match.index + match[0].length;
      const end = matches[index + 1]?.index ?? normalized.length;
      const chapterNumber = romanToInt(match[1].replace(/CHAPTER|\./g, "").trim());
      const content = normalized.slice(start, end).trim();
      if (chapterNumber >= 1 && chapterNumber <= 16 && wordCount(content) > 80) {
        chapters.push(...splitRomansChapterSections(chapterNumber, improveRomansVerseMarkers(content)));
      }
    });

    return chapters.flatMap((chapter) => splitOversizedChapter(chapter, 3200));
  }

  return chunkByWords(normalized, "Romans Commentary", 2400);
}

function splitRomansChapterSections(chapterNumber, content) {
  const sections = [];
  const sectionHeading = /(?:^|\n)\s*(ROMANS\s+([IVXLCDM]+)\.\s+\d+[\d\s.,:;-]*\.?)\s*(?=\n\s*(?:ANALYSIS|COMMENTARY)\.)/gi;
  const matches = [...content.matchAll(sectionHeading)]
    .filter((match) =>
      romanToInt(match[2]) === chapterNumber &&
      !/\d+\.\s+\d+/.test(match[1])
    );

  if (!matches.length) {
    return [{ title: `Romans ${chapterNumber}`, content }];
  }

  const intro = content.slice(0, matches[0].index).trim();
  if (wordCount(intro) > 120) {
    sections.push({ title: `Romans ${chapterNumber} -- Overview`, content: intro });
  }

  matches.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? content.length;
    const sectionContent = content.slice(start, end).trim();
    if (wordCount(sectionContent) > 80) {
      sections.push({
        title: formatRomansSectionTitle(match[1]),
        content: sectionContent,
      });
    }
  });

  return sections;
}

function formatRomansSectionTitle(heading) {
  const match = heading.match(/ROMANS\s+([IVXLCDM]+)\.\s+(.+?)\.?$/i);
  if (!match) return titleCaseHeading(heading);
  const chapter = romanToInt(match[1]);
  const range = match[2]
    .replace(/\s+/g, " ")
    .replace(/\s*--\s*/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ", ")
    .trim();
  return `Romans ${chapter}:${range}`;
}

function normalizeChapterTitle(bookSlug, title) {
  const clean = normalizeWhitespace(title);
  if (bookSlug === "religious-affections" && /^Jonathan Edwards/i.test(clean)) {
    return "Introduction";
  }
  if (bookSlug === "bondage-of-the-will" && /^Henry Atherton/i.test(clean)) {
    return clean.replace(/^Henry Atherton,?/, "Prefatory Note");
  }
  if (bookSlug === "fourfold-state" && /^Practical Discc?urses/i.test(clean)) {
    return "Title Page";
  }
  if (bookSlug !== "commentary-on-romans-hodge") return clean;

  const romansMatch = clean.match(/^Romans\s+([IVXLCDM]+)\.\s+(.+?)(?:\.)?(?:\s+--\s+Part\s+(\d+))?$/i);
  if (!romansMatch) return clean;

  const chapter = romanToInt(romansMatch[1]);
  const range = romansMatch[2]
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*--\s*/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ", ")
    .trim();
  const part = romansMatch[3] ? ` -- Part ${romansMatch[3]}` : "";
  return `Romans ${chapter}:${range}${part}`;
}

function normalizeChapterContent(bookSlug, content) {
  let clean = normalizeWhitespace(content)
    .replace(/^(?:Title:.*\n|Creator\(s\):.*\n|Rights:.*\n|CCEL Subjects:.*\n|LC (?:Call no|Subjects):.*\n)+/gim, "")
    .trim();

  if (bookSlug === "body-of-divinity") {
    clean = clean.replace(
      /^A Body of Divinity\s+Christian Denominations[\s\S]*?A Body of Divinity/i,
      "A Body of Divinity"
    );
  }

  return clean;
}

function improveRomansVerseMarkers(text) {
  return text
    .replace(/(?:^|\n)\s*(VERSE[S]?\s+\d+[^\n]{0,60})/gi, "\n\n$1\n\n")
    .replace(/(?:^|\n)\s*(VER\.\s+\d+[^\n]{0,60})/gi, "\n\n$1\n\n")
    .replace(/(?:^|\n)\s*((?:\d+\.)\s+[^.\n]{0,90})/g, "\n\n$1\n\n");
}

function splitByKnownHeadings(text, headings) {
  const normalized = normalizeWhitespace(text);
  const positions = headings
    .map((heading) => ({ heading, index: normalized.indexOf(heading) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);

  if (positions.length < 2) return chunkByWords(normalized, "Section", 1800);

  return positions.flatMap((position, index) => {
    const start = position.index + position.heading.length;
    const end = positions[index + 1]?.index ?? normalized.length;
    const content = normalized.slice(start, end).trim();
    return splitOversizedChapter({ title: titleCaseHeading(position.heading), content }, 2200);
  });
}

function splitByHintHeadings(text, fallbackTitle) {
  const normalized = normalizeWhitespace(text);
  const regex = /(?:^|\n)(Hint #\d+\.[^\n]+)/g;
  const matches = [...normalized.matchAll(regex)];
  if (matches.length < 5) return chunkByWords(normalized, fallbackTitle, 1700);

  const chapters = [];
  const intro = normalized.slice(0, matches[0].index).trim();
  if (wordCount(intro) > 80) chapters.push({ title: "Introduction", content: intro });

  matches.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? normalized.length;
    const content = normalized.slice(start, end).trim();
    chapters.push({ title: match[1].trim(), content });
  });

  return chapters.flatMap((chapter) => splitOversizedChapter(chapter, 1800));
}

function splitOversizedChapter(chapter, wordsPerPart = 2200) {
  if (wordCount(chapter.content) <= wordsPerPart) return [chapter];
  return chunkByWords(chapter.content, chapter.title, wordsPerPart);
}

function chunkByWords(text, title, wordsPerChunk) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = [];
  let count = 0;

  for (const paragraph of paragraphs) {
    const words = wordCount(paragraph);
    if (current.length && count + words > wordsPerChunk) {
      chunks.push(current.join("\n\n"));
      current = [];
      count = 0;
    }
    current.push(paragraph);
    count += words;
  }
  if (current.length) chunks.push(current.join("\n\n"));

  return chunks.map((content, index) => ({
    title: chunks.length === 1 ? title : `${title} — Part ${index + 1}`,
    content,
  }));
}

function htmlToText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h1|h2|h3|h4|li|blockquote|section|article)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

function decodeHtmlEntities(text) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "...",
    ldquo: "\"",
    lsquo: "'",
    mdash: "--",
    ndash: "-",
    nbsp: " ",
    quot: "\"",
    rdquo: "\"",
    rsquo: "'",
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_match, entity) => {
    const lower = entity.toLowerCase();
    if (lower[0] === "#") {
      const value = lower[1] === "x" ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : "";
    }
    return named[lower] ?? "";
  });
}

function normalizeWhitespace(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\u00ad/g, "")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "--")
    .replace(/[ﬁ]/g, "fi")
    .replace(/[ﬂ]/g, "fl")
    .replace(/\[[Pp]g\.?\s*\d+\]/g, "")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function titleCaseHeading(heading) {
  const trimmed = heading.replace(/\s+/g, " ").trim();
  if (!/[a-z]/.test(trimmed)) {
    return trimmed
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase())
      .replace(/\bIi\b/g, "II")
      .replace(/\bIii\b/g, "III")
      .replace(/\bIv\b/g, "IV")
      .replace(/\bVi\b/g, "VI")
      .replace(/\bVii\b/g, "VII")
      .replace(/\bViii\b/g, "VIII")
      .replace(/\bIx\b/g, "IX")
      .replace(/\bXi\b/g, "XI")
      .replace(/\bXii\b/g, "XII");
  }
  return trimmed;
}

function romanToInt(roman) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let total = 0;
  let prev = 0;
  for (const char of roman.toUpperCase().split("").reverse()) {
    const value = values[char] ?? 0;
    total += value < prev ? -value : value;
    prev = Math.max(prev, value);
  }
  return total;
}

function wordCount(text) {
  return (text.match(/\S+/g) ?? []).length;
}

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, " ");
}

async function writeBook(book, chapters) {
  const payload = {
    slug: book.slug,
    title: book.title,
    source: {
      label: book.sourceLabel,
      url: book.sourceUrl,
    },
    chapters: chapters
      .filter((chapter) => chapter.content && wordCount(chapter.content) > 20)
      .map((chapter) => ({
        title: normalizeChapterTitle(book.slug, chapter.title),
        content: normalizeChapterContent(book.slug, chapter.content),
      })),
  };

  if (!payload.chapters.length) {
    throw new Error(`${book.slug} produced no readable chapters`);
  }

  await writeFile(
    path.join(outputDir, `${book.slug}.json`),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
}

async function writeSources() {
  const rows = [...TEXT_BOOKS, ...HTML_BOOKS]
    .map((book) => `- ${book.title}: ${book.sourceLabel} — ${book.sourceUrl}`)
    .join("\n");
  await writeFile(
    path.join(outputDir, "SOURCES.md"),
    `# Public-domain book sources\n\n${rows}\n`,
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
