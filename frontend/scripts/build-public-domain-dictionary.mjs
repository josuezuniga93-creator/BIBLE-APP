import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dictionaryRoot = process.env.BIBLE_DICTIONARY_SOURCE;
const strongsRoot = process.env.STRONGS_SOURCE;

if (!dictionaryRoot || !strongsRoot) {
  throw new Error("Set BIBLE_DICTIONARY_SOURCE and STRONGS_SOURCE to the downloaded source repositories.");
}

const outputRoot = path.resolve("public/dictionary-data");
const lettersRoot = path.join(outputRoot, "letters");
fs.mkdirSync(lettersRoot, { recursive: true });

const dictionaryIndex = [];
for (const letter of "abcdefghijklmnopqrstuvwxyz") {
  const sourcePath = path.join(dictionaryRoot, "data/01_parsed", `${letter}.json`);
  if (!fs.existsSync(sourcePath)) continue;
  const entries = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const compactEntries = {};
  for (const [key, entry] of Object.entries(entries)) {
    dictionaryIndex.push([entry.name, entry.slug, letter, entry.sources.join("+")]);
    compactEntries[key] = {
      name: entry.name,
      slug: entry.slug,
      definitions: entry.definitions,
      references: entry.scripture_refs.map((item) => item.reference),
      sources: entry.sources,
    };
  }
  fs.writeFileSync(path.join(lettersRoot, `${letter}.json`), JSON.stringify(compactEntries));
}

const greek = require(path.join(strongsRoot, "greek/strongs-greek-dictionary.js"));
const hebrew = require(path.join(strongsRoot, "hebrew/strongs-hebrew-dictionary.js"));
const lexiconIndex = [];
for (const [strongs, entry] of [...Object.entries(greek), ...Object.entries(hebrew)]) {
  lexiconIndex.push([
    strongs,
    strongs.startsWith("H") ? "H" : "G",
    entry.lemma || "",
    entry.translit || entry.xlit || "",
    entry.pron || "",
    String(entry.strongs_def || "").replace(/\s+/g, " ").trim(),
    String(entry.kjv_def || "").replace(/\s+/g, " ").trim(),
  ]);
}

fs.writeFileSync(path.join(outputRoot, "index.json"), JSON.stringify({
  version: 1,
  dictionary: dictionaryIndex,
  lexicon: lexiconIndex,
}));
fs.writeFileSync(path.join(outputRoot, "ATTRIBUTION.txt"), `Bible dictionary data\n\nEaston's Bible Dictionary (1897) and Smith's Bible Dictionary (1863) are public domain.\nStructured dataset copyright 2026 NEUU, licensed CC BY 4.0.\nhttps://github.com/neuu-org/bible-dictionary-dataset\n\nOriginal-language lexicon data\n\nStrong's Greek Dictionary (1890) and Hebrew Dictionary (1894) are public domain.\nOpen Scriptures JSON editions are licensed CC BY-SA.\nhttps://github.com/openscriptures/strongs\n`);

console.log(`Built ${dictionaryIndex.length} dictionary terms and ${lexiconIndex.length} Strong's entries.`);
