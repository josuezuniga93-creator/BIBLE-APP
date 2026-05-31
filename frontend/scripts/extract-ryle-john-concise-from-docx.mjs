import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";

const INPUT_PATH = process.argv[2] ?? "/Users/josuezuniga/Desktop/1663.04John.docx";
const OUTPUT_PATH = new URL("../app/lib/ryleJohnConciseCommentary.ts", import.meta.url);

function decodeXml(input) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function paragraphsFromDocx(path) {
  const xml = execFileSync("unzip", ["-p", path, "word/document.xml"], {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });

  return [...xml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)]
    .map((paragraph) =>
      [...paragraph[0].matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((text) => decodeXml(text[1]))
        .join("")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

function referenceFromHeading(paragraph) {
  const match = paragraph.match(/JOHN\s+(\d+):(\d+(?:-\d+)?)/);
  if (!match) return null;

  const rawRef = `John ${Number(match[1])}:${match[2]}`;
  if (rawRef === "John 1:10-18") return "John 10:10-18";
  return rawRef;
}

function isChapterMarker(paragraph) {
  return /^JOHN\s+\d+\s+\[\[@Bible:JOHN\s+\d+\]\]$/.test(paragraph);
}

function extractSections(paragraphs) {
  const headings = paragraphs
    .map((paragraph, index) => ({ paragraph, index, ref: referenceFromHeading(paragraph) }))
    .filter((item) => item.ref);

  const sections = {};

  for (let i = 0; i < headings.length; i += 1) {
    const current = headings[i];
    const next = headings[i + 1];
    const sectionParagraphs = paragraphs
      .slice(current.index + 1, next?.index ?? paragraphs.length)
      .filter((paragraph) => !isChapterMarker(paragraph))
      .filter((paragraph) => !referenceFromHeading(paragraph));

    const body = sectionParagraphs
      .slice(1)
      .join("\n\n")
      .trim();

    if (body.length > 120) sections[current.ref] = body;
  }

  return sections;
}

function escapeTs(value) {
  return JSON.stringify(value);
}

async function main() {
  const paragraphs = paragraphsFromDocx(INPUT_PATH);
  const sections = extractSections(paragraphs);
  const body = Object.entries(sections)
    .map(([ref, commentary]) => `  ${escapeTs(ref)}: ${escapeTs(commentary)},`)
    .join("\n");

  const content = `// Generated from ${INPUT_PATH}
// Concise family/private reading version of J.C. Ryle, Expository Thoughts on the Gospel of John.
// Run: node frontend/scripts/extract-ryle-john-concise-from-docx.mjs /path/to/1663.04John.docx

export const RYLE_JOHN_CONCISE_COMMENTARY: Record<string, string> = {
${body}
};
`;

  await fs.writeFile(OUTPUT_PATH, content);
  console.log(`Wrote ${Object.keys(sections).length} concise sections to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
