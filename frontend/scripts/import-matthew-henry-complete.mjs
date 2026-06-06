import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public/commentaries/matthew-henry-complete");
const TMP_DIR = "/tmp/mhc-all";
const ZIP_FILES = [1, 2, 3, 4, 5, 6].map((n) => `/tmp/mhc-v${n}.zip`);
const CCEL_BASE = "https://ccel.org/h/henry/mhc2/";

const BOOKS = [
  ["Genesis", 1, 50], ["Exodus", 2, 40], ["Leviticus", 3, 27], ["Numbers", 4, 36],
  ["Deuteronomy", 5, 34], ["Joshua", 6, 24], ["Judges", 7, 21], ["Ruth", 8, 4],
  ["1 Samuel", 9, 31], ["2 Samuel", 10, 24], ["1 Kings", 11, 22], ["2 Kings", 12, 25],
  ["1 Chronicles", 13, 29], ["2 Chronicles", 14, 36], ["Ezra", 15, 10], ["Nehemiah", 16, 13],
  ["Esther", 17, 10], ["Job", 18, 42], ["Psalms", 19, 150], ["Proverbs", 20, 31],
  ["Ecclesiastes", 21, 12], ["Song of Solomon", 22, 8], ["Isaiah", 23, 66],
  ["Jeremiah", 24, 52], ["Lamentations", 25, 5], ["Ezekiel", 26, 48], ["Daniel", 27, 12],
  ["Hosea", 28, 14], ["Joel", 29, 3], ["Amos", 30, 9], ["Obadiah", 31, 1],
  ["Jonah", 32, 4], ["Micah", 33, 7], ["Nahum", 34, 3], ["Habakkuk", 35, 3],
  ["Zephaniah", 36, 3], ["Haggai", 37, 2], ["Zechariah", 38, 14], ["Malachi", 39, 4],
  ["Matthew", 40, 28], ["Mark", 41, 16], ["Luke", 42, 24], ["John", 43, 21],
  ["Acts", 44, 28], ["Romans", 45, 16], ["1 Corinthians", 46, 16], ["2 Corinthians", 47, 13],
  ["Galatians", 48, 6], ["Ephesians", 49, 6], ["Philippians", 50, 4], ["Colossians", 51, 4],
  ["1 Thessalonians", 52, 5], ["2 Thessalonians", 53, 3], ["1 Timothy", 54, 6],
  ["2 Timothy", 55, 4], ["Titus", 56, 3], ["Philemon", 57, 1], ["Hebrews", 58, 13],
  ["James", 59, 5], ["1 Peter", 60, 5], ["2 Peter", 61, 3], ["1 John", 62, 5],
  ["2 John", 63, 1], ["3 John", 64, 1], ["Jude", 65, 1], ["Revelation", 66, 22],
];

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-");
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|center|table|tr|td|h1|h2|h3|h4)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r/g, "\n")
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) =>
      line &&
      !/^\[(Table of Contents|Previous|Next)\]/i.test(line) &&
      !/^Matthew Henry$/i.test(line) &&
      !/^Commentary on the Whole Bible/i.test(line) &&
      !/^Back to/i.test(line)
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function titleCaseFromHtml(html) {
  const match = html.match(/<FONT SIZE=\+1><I>([\s\S]*?)<\/I><\/FONT>/i);
  return match ? stripHtml(match[1]) : "";
}

function getFilePath(book, chapter) {
  return path.join(TMP_DIR, `MHC${String(book).padStart(2, "0")}${String(chapter).padStart(3, "0")}.HTM`);
}

function parseSections(html, bookName, book, chapter) {
  const bodyStart = html.indexOf("<!-- (Begin Body) -->");
  const bodyEnd = html.indexOf("<!-- (End Body) -->");
  const body = html.slice(bodyStart >= 0 ? bodyStart : 0, bodyEnd >= 0 ? bodyEnd : html.length);

  const secMatches = [...body.matchAll(/<A NAME="Sec(\d+)">\s*<\/A>/gi)];
  if (secMatches.length === 0) {
    const text = stripHtml(body);
    return [{ verse: 1, verses: [1], title: `${bookName} ${chapter}`, text }];
  }

  const sections = [];
  for (let i = 0; i < secMatches.length; i += 1) {
    const sec = secMatches[i];
    const secStart = sec.index ?? 0;
    const nextStart = secMatches[i + 1]?.index ?? body.length;
    const previousStart = i === 0 ? 0 : (secMatches[i - 1].index ?? 0);

    const anchorArea = body.slice(previousStart, secStart);
    const verseAnchors = [...anchorArea.matchAll(/<A NAME="[A-Za-z0-9]+?(\d+)_(\d+)">\s*<\/A>/g)]
      .map((m) => Number(m[2]))
      .filter((n) => Number.isFinite(n));
    const verses = [...new Set(verseAnchors)].sort((a, b) => a - b);
    const verse = verses[0] ?? 1;
    const sectionHtml = body.slice(secStart, nextStart);
    const title = titleCaseFromHtml(sectionHtml) || `${bookName} ${chapter}:${verse}`;
    let text = stripHtml(sectionHtml);

    text = text
      .replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")
      .replace(/^\s*A\.?\s*D\.?\s*\d+\.?\s*/i, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (text.length > 40) sections.push({ verse, verses, title, text });
  }

  return sections;
}

async function main() {
  for (const zip of ZIP_FILES) {
    if (!existsSync(zip)) {
      throw new Error(`Missing ${zip}. Download volumes first with curl from ${CCEL_BASE}`);
    }
  }

  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });
  for (const zip of ZIP_FILES) {
    execFileSync("unzip", ["-q", "-o", zip, "-d", TMP_DIR]);
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];
  let totalSections = 0;
  let totalChapters = 0;

  for (const [bookName, book, chapters] of BOOKS) {
    const bookDir = path.join(OUT_DIR, String(book));
    await mkdir(bookDir, { recursive: true });
    manifest.push({ book, bookName, chapters });

    for (let chapter = 1; chapter <= chapters; chapter += 1) {
      const filePath = getFilePath(book, chapter);
      if (!existsSync(filePath)) throw new Error(`Missing ${filePath}`);
      const html = await readFile(filePath, "latin1");
      const sections = parseSections(html, bookName, book, chapter);
      totalSections += sections.length;
      totalChapters += 1;
      await writeFile(
        path.join(bookDir, `${chapter}.json`),
        JSON.stringify({
          source: "Matthew Henry Complete Commentary",
          sourceUrl: `${CCEL_BASE}MHC${String(book).padStart(2, "0")}${String(chapter).padStart(3, "0")}.HTM`,
          book,
          bookName,
          chapter,
          sections,
        }),
        "utf8"
      );
    }
    process.stdout.write(`${bookName}: ${chapters} chapters\n`);
  }

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify({
      source: "Matthew Henry Complete Commentary on the Whole Bible",
      sourceUrl: `${CCEL_BASE}MHC00000.HTM`,
      rights: "Public domain text. No rights reserved. May be distributed freely.",
      books: manifest,
      totalChapters,
      totalSections,
      importedAt: new Date().toISOString(),
    }),
    "utf8"
  );

  console.log(`Imported ${totalChapters} chapters and ${totalSections} sections.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
