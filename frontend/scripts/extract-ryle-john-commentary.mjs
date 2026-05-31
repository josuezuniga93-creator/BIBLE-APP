const SOURCE_URL =
  "https://r.jina.ai/http://r.jina.ai/http://https://www.monergism.com/thethreshold/sdg/expository_web.html";
const MONERGISM_SOURCE_URL = "https://www.monergism.com/thethreshold/sdg/expository_web.html#c1.1";
const OUTPUT_PATH = new URL("../app/lib/ryleJohnCommentary.ts", import.meta.url);

function escapeTs(value) {
  return JSON.stringify(value);
}

function normalizeRef(chapter, verseRange) {
  return `John ${Number(chapter)}:${verseRange.replace(/\s+/g, "")}`;
}

function stripMarkdown(value) {
  return value
    .replace(/\r/g, "")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/_/g, "")
    .replace(/\\_/g, "_")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeOpeningScripture(section) {
  let trimmed = section.trimStart();
  if (!trimmed.startsWith("_")) {
    const scriptureStart = trimmed.indexOf("_");
    if (scriptureStart !== -1) {
      trimmed = trimmed.slice(scriptureStart).trimStart();
    }
  }

  while (trimmed.startsWith("_")) {
    const scriptureEnd = trimmed.indexOf("_", 1);
    if (scriptureEnd === -1) return trimmed;
    trimmed = trimmed.slice(scriptureEnd + 1).trimStart();
  }

  return trimmed;
}

function correctSourceRef(ref) {
  if (ref === "John 1:10-18") return "John 10:10-18";
  return ref;
}

function extractJohnSections(markdown) {
  const johnStart = markdown.indexOf("JOHN chapter 1");
  if (johnStart === -1) throw new Error("Could not find JOHN chapter 1 in Monergism source");

  const johnMarkdown = markdown.slice(johnStart);
  const headingPattern = /JOHN\s+(\d+):(\d+(?:-\d+)?)/g;
  const headings = [...johnMarkdown.matchAll(headingPattern)].map((match) => ({
    ref: correctSourceRef(normalizeRef(match[1], match[2])),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));

  const sections = {};

  for (let i = 0; i < headings.length; i += 1) {
    const current = headings[i];
    const next = headings[i + 1];
    const rawBody = johnMarkdown.slice(current.end, next?.start ?? johnMarkdown.length);
    const commentary = stripMarkdown(removeOpeningScripture(rawBody));
    if (commentary.length > 120) sections[current.ref] = commentary;
  }

  return sections;
}

async function main() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`${SOURCE_URL} returned ${response.status}`);

  const markdown = await response.text();
  const sections = extractJohnSections(markdown);
  const body = Object.entries(sections)
    .map(([ref, commentary]) => `  ${escapeTs(ref)}: ${escapeTs(commentary)},`)
    .join("\n");

  const content = `// Generated from public-domain J.C. Ryle, Expository Thoughts on the Gospels: St. John.
// Source: ${MONERGISM_SOURCE_URL}
// Run: node frontend/scripts/extract-ryle-john-commentary.mjs

export const RYLE_JOHN_COMMENTARY: Record<string, string> = {
${body}
};
`;

  const fs = await import("node:fs/promises");
  await fs.writeFile(OUTPUT_PATH, content);
  console.log(`Wrote ${Object.keys(sections).length} commentary sections to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
