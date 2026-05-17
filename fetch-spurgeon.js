#!/usr/bin/env node
/**
 * fetch-spurgeon.js
 * Fetches all 730 entries of Spurgeon's Morning and Evening from CCEL
 * and writes frontend/app/lib/devotionalData.ts
 *
 * Run once from the project root:
 *   node fetch-spurgeon.js
 *
 * Requires Node.js 18+ (uses built-in fetch).
 */

const fs = require("fs");
const path = require("path");

const BASE = "https://www.ccel.org/ccel/spurgeon/morneve.d";
const OUT  = path.join(__dirname, "frontend/app/lib/devotionalData.ts");
const DELAY_MS = 400; // be polite to CCEL's servers

// Month/day counts (non-leap year)
const MONTHS = [
  [1,31],[2,28],[3,31],[4,30],[5,31],[6,30],
  [7,31],[8,31],[9,30],[10,31],[11,30],[12,31]
];

const MONTH_NAMES_LONG = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function pad(n){ return String(n).padStart(2,"0"); }
function dateKey(m,d){ return `${pad(m)}-${pad(d)}`; }
function displayDate(m,d){ return `${MONTH_NAMES_LONG[m-1]} ${d}`; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// Common public-domain hymns to rotate
const HYMNS = [
  { title:"Great Is Thy Faithfulness", author:"Thomas O. Chisholm", year:1923 },
  { title:"Be Thou My Vision", author:"Irish hymn, tr. Mary Byrne", year:1905 },
  { title:"A Mighty Fortress Is Our God", author:"Martin Luther", year:1529 },
  { title:"And Can It Be", author:"Charles Wesley", year:1738 },
  { title:"O Sacred Head Now Wounded", author:"Bernard of Clairvaux", year:1153 },
  { title:"Holy, Holy, Holy", author:"Reginald Heber", year:1826 },
  { title:"Come Thou Fount of Every Blessing", author:"Robert Robinson", year:1758 },
  { title:"Immortal, Invisible, God Only Wise", author:"Walter Chalmers Smith", year:1867 },
  { title:"When I Survey the Wondrous Cross", author:"Isaac Watts", year:1707 },
  { title:"Rock of Ages", author:"Augustus Toplady", year:1776 },
  { title:"How Firm a Foundation", author:"John Rippon", year:1787 },
  { title:"To God Be the Glory", author:"Fanny Crosby", year:1875 },
  { title:"All Hail the Power of Jesus' Name", author:"Edward Perronet", year:1779 },
  { title:"Jesus, Lover of My Soul", author:"Charles Wesley", year:1740 },
  { title:"Abide with Me", author:"Henry F. Lyte", year:1847 },
];

function hymnForDay(dayOfYear){
  return HYMNS[dayOfYear % HYMNS.length];
}

async function fetchEntry(m, d, ampm){
  const url = `${BASE}${pad(m)}${pad(d)}${ampm}.html`;
  try {
    const res = await fetch(url, { headers:{"User-Agent":"Mozilla/5.0 CCEL-fetcher/1.0"} });
    if (!res.ok) return null;
    const html = await res.text();
    return parseEntry(html, ampm);
  } catch(e){
    console.error(`  Error fetching ${url}: ${e.message}`);
    return null;
  }
}

function parseEntry(html, ampm){
  // Extract scripture text (inside <em> or italic block near the top)
  // Pattern: *"verse text."* followed by reference
  const verseMatch = html.match(/[*"'"]([^*"'"]{5,300})[*"'"]\s*<\/p>\s*<h3[^>]*>\s*<a[^>]*>([^<]+)<\/a>/s);
  let scriptureText = "";
  let scriptureRef  = "";

  if (verseMatch) {
    scriptureText = verseMatch[1].trim();
    scriptureRef  = verseMatch[2].trim();
  } else {
    // Fallback: look for the h3 tag with the reference
    const refMatch = html.match(/<h3[^>]*>\s*<a[^>]*>([^<]+)<\/a>/);
    if (refMatch) scriptureRef = refMatch[1].trim();
    const italicMatch = html.match(/<em>["']([^"'<]{5,300})["']<\/em>/);
    if (italicMatch) scriptureText = italicMatch[1].trim();
  }

  // Extract main body (everything between the h3 and the | Prev | ... | table)
  const bodyMatch = html.match(/<\/h3>\s*([\s\S]*?)<\/table>/);
  let body = "";
  if (bodyMatch) {
    body = bodyMatch[1]
      .replace(/<[^>]+>/g, " ")   // strip HTML tags
      .replace(/\s+/g, " ")       // collapse whitespace
      .trim();
  }

  return { scriptureText, scriptureRef, body };
}

async function main(){
  console.log("Fetching Spurgeon Morning and Evening from CCEL...");
  console.log("This will take several minutes. Please wait.\n");

  const entries = {};
  let dayOfYear = 0;
  let fetched = 0;

  for (const [m, days] of MONTHS) {
    for (let d = 1; d <= days; d++) {
      const key = dateKey(m, d);
      dayOfYear++;

      process.stdout.write(`  ${displayDate(m,d)} (${key})... `);

      const [am, pm] = await Promise.all([
        fetchEntry(m, d, "am"),
        fetchEntry(m, d, "pm"),
      ]);
      await sleep(DELAY_MS);

      const amText  = am?.body  || "";
      const pmText  = pm?.body  || "";
      const amRef   = am?.scriptureRef  || "";
      const amVerse = am?.scriptureText || "";
      const pmVerse = pm?.scriptureText || "";

      entries[key] = {
        date: key,
        displayDate: displayDate(m, d),
        theme: amRef ? amRef : `${MONTH_NAMES_LONG[m-1]} ${d}`,
        scripture: {
          reference:   amRef   || "Psalm 23:1",
          text:        amVerse || "The LORD is my shepherd; I shall not want.",
          translation: "KJV"
        },
        devotional: (amText ? amText : "(Morning reading unavailable)")
          + (pmText ? `\n\n— Evening —\n\n${pmText}` : ""),
        prayer: "",
        hymn: hymnForDay(dayOfYear),
      };

      fetched++;
      console.log("done");
    }
  }

  // Build TypeScript file
  const ts = buildTS(entries);
  fs.writeFileSync(OUT, ts, "utf8");
  console.log(`\nWrote ${fetched} entries to ${OUT}`);
}

function buildTS(entries){
  const lines = [];
  lines.push(`// ─── Spurgeon's Morning and Evening ─────────────────────────────────────────`);
  lines.push(`// Original text by Charles Haddon Spurgeon (1834–1892). Public domain.`);
  lines.push(`// Source: Christian Classics Ethereal Library (ccel.org)`);
  lines.push(`// Auto-generated by fetch-spurgeon.js — do not edit by hand.`);
  lines.push(``);
  lines.push(`export interface DailyDevotional {`);
  lines.push(`  date: string;`);
  lines.push(`  displayDate: string;`);
  lines.push(`  theme: string;`);
  lines.push(`  scripture: { reference: string; text: string; translation: string; };`);
  lines.push(`  devotional: string;`);
  lines.push(`  prayer: string;`);
  lines.push(`  hymn: { title: string; author: string; year: number; firstLine?: string; };`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const DAILY_DEVOTIONALS: Record<string, DailyDevotional> = {`);

  for (const [key, e] of Object.entries(entries)) {
    const esc = s => s.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\${/g,"\\${");
    lines.push(`  "${key}": {`);
    lines.push(`    date: "${e.date}", displayDate: "${e.displayDate}",`);
    lines.push(`    theme: \`${esc(e.theme)}\`,`);
    lines.push(`    scripture: { reference: \`${esc(e.scripture.reference)}\`, text: \`${esc(e.scripture.text)}\`, translation: "KJV" },`);
    lines.push(`    devotional: \`${esc(e.devotional)}\`,`);
    lines.push(`    prayer: "",`);
    lines.push(`    hymn: { title: "${e.hymn.title}", author: "${e.hymn.author}", year: ${e.hymn.year} },`);
    lines.push(`  },`);
  }
  lines.push(`};`);
  lines.push(``);
  lines.push(`export function dateToKey(date: Date): string {`);
  lines.push(`  const m = String(date.getMonth() + 1).padStart(2, "0");`);
  lines.push(`  const d = String(date.getDate()).padStart(2, "0");`);
  lines.push(`  return \`\${m}-\${d}\`;`);
  lines.push(`}`);
  lines.push(`export function getTodayDevotional(): DailyDevotional | null {`);
  lines.push(`  return DAILY_DEVOTIONALS[dateToKey(new Date())] ?? null;`);
  lines.push(`}`);
  lines.push(`export function getDevotionalForDate(date: Date): DailyDevotional | null {`);
  lines.push(`  return DAILY_DEVOTIONALS[dateToKey(date)] ?? null;`);
  lines.push(`}`);
  lines.push(`export function getNearestDevotional(date: Date, direction: "prev" | "next"): DailyDevotional | null {`);
  lines.push(`  const d = new Date(date);`);
  lines.push(`  for (let i = 0; i < 365; i++) {`);
  lines.push(`    direction === "next" ? d.setDate(d.getDate()+1) : d.setDate(d.getDate()-1);`);
  lines.push(`    const e = getDevotionalForDate(d); if (e) return e;`);
  lines.push(`  }`);
  lines.push(`  return null;`);
  lines.push(`}`);
  lines.push(`export const MONTH_NAMES = [`);
  lines.push(`  "January","February","March","April","May","June",`);
  lines.push(`  "July","August","September","October","November","December"`);
  lines.push(`];`);

  return lines.join("\n") + "\n";
}

main().catch(e => { console.error(e); process.exit(1); });
