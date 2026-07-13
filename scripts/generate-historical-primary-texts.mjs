import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "frontend/app/lib/historicalPrimaryTexts.ts");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function decodeHtml(input) {
  const named = {
    amp: "&",
    apos: "'",
    bull: "•",
    em: "—",
    en: "–",
    hellip: "...",
    ldquo: '"',
    lsquo: "'",
    mdash: "—",
    nbsp: " ",
    ndash: "–",
    quot: '"',
    rdquo: '"',
    rsquo: "'",
  };

  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === "#") {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity] ?? match;
  });
}

function stripHtml(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<div class="next-previous-box">[\s\S]*?<\/div>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanWikiText(text) {
  let cleaned = text
    .replace(/<noinclude>[\s\S]*?<\/noinclude>/g, "")
    .replace(/\[\[[^\]|]+?\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?br>/gi, "\n");

  for (let i = 0; i < 8; i += 1) {
    cleaned = cleaned.replace(/\{\{(?:sc|sm|larger|x-larger|xx-larger|fine|uc|sp)\|([^{}]*)\}\}/gi, "$1");
    cleaned = cleaned.replace(/\{\{c\|([^{}]*)\}\}/gi, "$1");
    cleaned = cleaned.replace(/\{\{right\|([^{}]*)\}\}/gi, "$1");
  }

  return cleaned
    .replace(/\{\{(?:rh|dhr|rule|nop|page break|border2?|smaller block)[^{}]*\}\}/gi, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/'{2,}/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function paragraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function chunkParagraphs(parts, maxChars) {
  const chunks = [];
  let current = "";

  for (const paragraph of parts) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (current && candidate.length > maxChars) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function section(id, label, title, content) {
  return { id, label, title, content };
}

function sourcePreface(name, source) {
  return `**Primary source:** ${name}\n\n**Source:** ${source}\n\n`;
}

function extractMain(filePath) {
  const html = read(filePath);
  const main = html.match(/<main>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const title = decodeHtml(main.match(/<h2>([\s\S]*?)<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, "") ?? "Section").trim();
  const body = main.replace(/<h2>[\s\S]*?<\/h2>/i, "");
  return { title, body: stripHtml(body) };
}

const smalcaldFiles = [
  ["preface", "Preface", "preface.html"],
  ["part-1", "Part I", "i-divine-majesty.html"],
  ["part-1-article-1", "Part I, Article I", "i-nature-of-god.html"],
  ["part-1-article-2", "Part I, Article II", "i-the-father.html"],
  ["part-1-article-3", "Part I, Article III", "i-the-son.html"],
  ["part-1-article-4", "Part I, Article IV", "i-the-work-of-salvation.html"],
  ["part-2", "Part II", "ii-office-and-work-of-jesus.html"],
  ["part-2-article-1", "Part II, Article I", "ii-first-and-chief-article.html"],
  ["part-2-article-2", "Part II, Article II", "ii-of-the-mass.html"],
  ["part-2-article-3", "Part II, Article III", "ii-of-chapters-and-cloisters.html"],
  ["part-2-article-4", "Part II, Article IV", "ii-of-the-papacy.html"],
  ["part-3", "Part III", "iii-part-iii.html"],
  ["part-3-article-1", "Part III, Article I", "iii-of-sin.html"],
  ["part-3-article-2", "Part III, Article II", "iii-of-the-law.html"],
  ["part-3-article-3", "Part III, Article III", "iii-of-repentance.html"],
  ["part-3-article-4", "Part III, Article IV", "iii-of-the-gospel.html"],
  ["part-3-article-5", "Part III, Article V", "iii-of-baptism.html"],
  ["part-3-article-6", "Part III, Article VI", "iii-of-the-scarament-of-the-altar.html"],
  ["part-3-article-7", "Part III, Article VII", "iii-of-the-keys.html"],
  ["part-3-article-8", "Part III, Article VIII", "iii-of-confession.html"],
  ["part-3-article-9", "Part III, Article IX", "iii-of-excommunication.html"],
  ["part-3-article-10", "Part III, Article X", "iii-of-ordination.html"],
  ["part-3-article-11", "Part III, Article XI", "iii-of-the-marriage-of-priests.html"],
  ["part-3-article-12", "Part III, Article XII", "iii-of-the-church.html"],
  ["part-3-article-13", "Part III, Article XIII", "iii-of-good-works.html"],
  ["part-3-article-14", "Part III, Article XIV", "iii-of-monastic-vows.html"],
  ["part-3-article-15", "Part III, Article XV", "iii-of-human-tradition.html"],
  ["signatures", "Signatures", "signatories.html"],
];

const smalcaldArticlesFullText = smalcaldFiles.map(([id, label, filename]) => {
  const { title, body } = extractMain(path.join("/tmp/smalcald-pages", filename));
  return section(
    `sa-${id}`,
    label,
    title,
    `${sourcePreface("The Smalcald Articles by Martin Luther", "BookOfConcord.org, public-domain Book of Concord text")}${body}`
  );
});

function buildSinners() {
  const pageNumbers = Array.from({ length: 15 }, (_, index) => index + 6);
  const raw = pageNumbers.map((page) => read(`/tmp/sinners-page${page}.raw`)).join("\n\n");
  const text = cleanWikiText(raw);
  const start = text.indexOf("There is nothing that keeps wicked men");
  const sermon = start >= 0 ? text.slice(start) : text;
  const clean = sermon.replace(/\n?THE END\.?$/i, "").trim();
  const parts = paragraphs(clean);
  return chunkParagraphs(parts, 6500).map((content, index) =>
    section(
      `sih-full-${index + 1}`,
      `Part ${index + 1}`,
      index === 0
        ? "Doctrine: Sinners Preserved by God's Pleasure"
        : index === 1
          ? "Considerations Continued"
          : index === 2
            ? "Application: The Danger of the Unconverted"
            : index === 3
              ? "The Fierceness and Duration of Wrath"
              : "The Urgent Call to Flee to Christ",
      `${sourcePreface("Sinners in the Hands of an Angry God by Jonathan Edwards", "Wikisource page transcription of the public-domain sermon")}${content}`
    )
  );
}

const sinnersInHandsFullText = buildSinners();

function buildOrange() {
  const html = read("/tmp/orange.html");
  const allParagraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((text) => /^(CANON|CONCLUSION|According to)/.test(text));

  return [
    section(
      "orange-full-1",
      "Canons 1-8",
      "Original Sin, Prayer, Faith, and Free Will",
      `${sourcePreface("The Canons of the Council of Orange, 529", "CRTA/Reformed.org archived public text")}${allParagraphs.slice(0, 8).join("\n\n")}`
    ),
    section(
      "orange-full-2",
      "Canons 9-17",
      "Grace, Prayer, Restored Will, and Christian Courage",
      `${sourcePreface("The Canons of the Council of Orange, 529", "CRTA/Reformed.org archived public text")}${allParagraphs.slice(8, 17).join("\n\n")}`
    ),
    section(
      "orange-full-3",
      "Canons 18-25",
      "Merit, Nature, Grace, and the Love of God",
      `${sourcePreface("The Canons of the Council of Orange, 529", "CRTA/Reformed.org archived public text")}${allParagraphs.slice(17, 25).join("\n\n")}`
    ),
    section(
      "orange-full-4",
      "Conclusion",
      "The Council's Conclusion",
      `${sourcePreface("The Canons of the Council of Orange, 529", "CRTA/Reformed.org archived public text")}${allParagraphs.slice(25).join("\n\n")}`
    ),
  ];
}

const councilOrangeFullText = buildOrange();

function buildCarthage() {
  const html = read("/tmp/carthage418.html");
  const flat = stripHtml(html).replace(/\s+/g, " ");
  const start = flat.indexOf("Council of Carthage To Investigate Pelagianism");
  const endNeedle = "The Synod also prayed that Aurelius would sign all the documents to be published.";
  const end = flat.indexOf(endNeedle);
  const text = flat.slice(start, end >= 0 ? end + endNeedle.length : undefined).trim();
  const canonStart = text.indexOf("Can. 1");
  const intro = text.slice(0, canonStart).trim();
  const canonText = text.slice(canonStart);
  const canons = canonText.match(/Can\. \d+(?:\.\d+)?[\s\S]*?(?= Can\. \d+(?:\.\d+)?|$)/g) ?? [];

  return [
    section(
      "carthage-full-1",
      "Context",
      "Council of Carthage to Investigate Pelagianism",
      `${sourcePreface("Canons of the Council of Carthage, May 1, 418", "Patristics in English text edited by Daniel R. Jennings")}${intro}`
    ),
    section(
      "carthage-full-2",
      "Canons 1-8",
      "Anti-Pelagian Canons on Sin, Baptism, and Grace",
      `${sourcePreface("Canons of the Council of Carthage, May 1, 418", "Patristics in English text edited by Daniel R. Jennings")}${canons.slice(0, 9).join("\n\n")}`
    ),
    section(
      "carthage-full-3",
      "Canons 9-19",
      "Discipline, Donatist Questions, Appeals, and Council Administration",
      `${sourcePreface("Canons of the Council of Carthage, May 1, 418", "Patristics in English text edited by Daniel R. Jennings")}${canons.slice(9).join("\n\n")}`
    ),
  ];
}

const councilCarthageFullText = buildCarthage();

function buildTheses() {
  const html = read("/tmp/luthers-95-theses.html");
  const main = html.match(/<main>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const afterHeading = main.replace(/<h2>[\s\S]*?<\/h2>/i, "");
  const start = afterHeading.indexOf("Out of love for the truth");
  const source = start >= 0 ? afterHeading.slice(start) : afterHeading;
  const olStart = source.indexOf("<ol>");
  const olEnd = source.indexOf("</ol>");

  if (olStart < 0 || olEnd < 0) {
    const body = stripHtml(source);
    const parts = paragraphs(body);
    return chunkParagraphs(parts, 4500).map((content, index) =>
      section(
        `theses-full-${index + 1}`,
        index === 0 ? "Preface" : `Theses ${index}`,
        index === 0 ? "Disputation on the Power and Efficacy of Indulgences" : `The 95 Theses: Section ${index}`,
        `${sourcePreface("The 95 Theses by Martin Luther", "BookOfConcord.org source text")}${content}`
      )
    );
  }

  const intro = stripHtml(source.slice(0, olStart));
  const thesisHtml = source.slice(olStart, olEnd);
  const theses = [...thesisHtml.matchAll(/<li>\s*([\s\S]*?)\s*<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  const ranges = [
    [1, 20],
    [21, 40],
    [41, 60],
    [61, 80],
    [81, 95],
  ];

  return [
    section(
      "theses-full-preface",
      "Preface",
      "Disputation on the Power and Efficacy of Indulgences",
      `${sourcePreface("The 95 Theses by Martin Luther", "BookOfConcord.org source text")}${intro}`
    ),
    ...ranges.map(([from, to]) =>
      section(
        `theses-full-${from}-${to}`,
        `Theses ${from}-${to}`,
        `The 95 Theses: ${from}-${to}`,
        `${sourcePreface("The 95 Theses by Martin Luther", "BookOfConcord.org source text")}${theses
          .slice(from - 1, to)
          .map((text, index) => `${from + index}. ${text}`)
          .join("\n\n")}`
      )
    ),
  ];
}

const ninetyFiveThesesFullText = buildTheses();

const file = `// Generated by scripts/generate-historical-primary-texts.mjs.
// Source material is public-domain historical Christian text gathered for the in-app Historical Documents reader.
import type { LearnSection } from "./learnData";

export const smalcaldArticlesFullText: LearnSection[] = ${JSON.stringify(smalcaldArticlesFullText, null, 2)};

export const sinnersInHandsFullText: LearnSection[] = ${JSON.stringify(sinnersInHandsFullText, null, 2)};

export const councilOrangeFullText: LearnSection[] = ${JSON.stringify(councilOrangeFullText, null, 2)};

export const councilCarthageFullText: LearnSection[] = ${JSON.stringify(councilCarthageFullText, null, 2)};

export const ninetyFiveThesesFullText: LearnSection[] = ${JSON.stringify(ninetyFiveThesesFullText, null, 2)};
`;

fs.writeFileSync(outputPath, file);
console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log({
  smalcald: smalcaldArticlesFullText.length,
  sinners: sinnersInHandsFullText.length,
  orange: councilOrangeFullText.length,
  carthage: councilCarthageFullText.length,
  theses95: ninetyFiveThesesFullText.length,
});
