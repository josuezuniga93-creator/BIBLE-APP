import { NextRequest, NextResponse } from "next/server";

// No edge runtime — standard Node.js serverless function
// helloao.org is confirmed reachable from Vercel (getbible.net is NOT)

// ─── Translation maps ──────────────────────────────────────────────────────────
// English → helloao.org (reachable from Vercel)
const HELLOAO_ID: Record<string, string> = {
  kjv:    "KJV",
  geneva: "GNVA",
};

// Spanish/LBLA → bolls.life (confirmed reachable from Vercel, returns JSON)
const BOLLS_ID: Record<string, string> = {
  // English
  nkjv:  "NKJV",
  esv:   "ESV",
  csb:   "CSB17",
  nasb:  "NASB",
  niv:   "NIV2011",
  lsb:   "LSB",
  // Spanish
  rv1960: "RV1960",
  ntv:   "NTV",
  nvi:   "NVI",
  lbla:  "LBLA",
};

// USFM exceptions (abbr → USFM book code)
const USFM_EXCEPTIONS: Record<string, string> = {
  Eze: "EZK", Joe: "JOL", Nah: "NAM", Mar: "MRK", Joh: "JHN",
  "1Jo": "1JN", "2Jo": "2JN", "3Jo": "3JN",
};

// Minimal book list — num → { name, abbr, testament }
const BOOKS: Record<number, { name: string; abbr: string; testament: "OT" | "NT" }> = {
  1:  { name: "Genesis",         abbr: "Gen",  testament: "OT" },
  2:  { name: "Exodus",          abbr: "Exo",  testament: "OT" },
  3:  { name: "Leviticus",       abbr: "Lev",  testament: "OT" },
  4:  { name: "Numbers",         abbr: "Num",  testament: "OT" },
  5:  { name: "Deuteronomy",     abbr: "Deu",  testament: "OT" },
  6:  { name: "Joshua",          abbr: "Jos",  testament: "OT" },
  7:  { name: "Judges",          abbr: "Jdg",  testament: "OT" },
  8:  { name: "Ruth",            abbr: "Rut",  testament: "OT" },
  9:  { name: "1 Samuel",        abbr: "1Sa",  testament: "OT" },
  10: { name: "2 Samuel",        abbr: "2Sa",  testament: "OT" },
  11: { name: "1 Kings",         abbr: "1Ki",  testament: "OT" },
  12: { name: "2 Kings",         abbr: "2Ki",  testament: "OT" },
  13: { name: "1 Chronicles",    abbr: "1Ch",  testament: "OT" },
  14: { name: "2 Chronicles",    abbr: "2Ch",  testament: "OT" },
  15: { name: "Ezra",            abbr: "Ezr",  testament: "OT" },
  16: { name: "Nehemiah",        abbr: "Neh",  testament: "OT" },
  17: { name: "Esther",          abbr: "Est",  testament: "OT" },
  18: { name: "Job",             abbr: "Job",  testament: "OT" },
  19: { name: "Psalms",          abbr: "Psa",  testament: "OT" },
  20: { name: "Proverbs",        abbr: "Pro",  testament: "OT" },
  21: { name: "Ecclesiastes",    abbr: "Ecc",  testament: "OT" },
  22: { name: "Song of Solomon", abbr: "Sng",  testament: "OT" },
  23: { name: "Isaiah",          abbr: "Isa",  testament: "OT" },
  24: { name: "Jeremiah",        abbr: "Jer",  testament: "OT" },
  25: { name: "Lamentations",    abbr: "Lam",  testament: "OT" },
  26: { name: "Ezekiel",         abbr: "Eze",  testament: "OT" },
  27: { name: "Daniel",          abbr: "Dan",  testament: "OT" },
  28: { name: "Hosea",           abbr: "Hos",  testament: "OT" },
  29: { name: "Joel",            abbr: "Joe",  testament: "OT" },
  30: { name: "Amos",            abbr: "Amo",  testament: "OT" },
  31: { name: "Obadiah",         abbr: "Oba",  testament: "OT" },
  32: { name: "Jonah",           abbr: "Jon",  testament: "OT" },
  33: { name: "Micah",           abbr: "Mic",  testament: "OT" },
  34: { name: "Nahum",           abbr: "Nah",  testament: "OT" },
  35: { name: "Habakkuk",        abbr: "Hab",  testament: "OT" },
  36: { name: "Zephaniah",       abbr: "Zep",  testament: "OT" },
  37: { name: "Haggai",          abbr: "Hag",  testament: "OT" },
  38: { name: "Zechariah",       abbr: "Zec",  testament: "OT" },
  39: { name: "Malachi",         abbr: "Mal",  testament: "OT" },
  40: { name: "Matthew",         abbr: "Mat",  testament: "NT" },
  41: { name: "Mark",            abbr: "Mar",  testament: "NT" },
  42: { name: "Luke",            abbr: "Luk",  testament: "NT" },
  43: { name: "John",            abbr: "Joh",  testament: "NT" },
  44: { name: "Acts",            abbr: "Act",  testament: "NT" },
  45: { name: "Romans",          abbr: "Rom",  testament: "NT" },
  46: { name: "1 Corinthians",   abbr: "1Co",  testament: "NT" },
  47: { name: "2 Corinthians",   abbr: "2Co",  testament: "NT" },
  48: { name: "Galatians",       abbr: "Gal",  testament: "NT" },
  49: { name: "Ephesians",       abbr: "Eph",  testament: "NT" },
  50: { name: "Philippians",     abbr: "Php",  testament: "NT" },
  51: { name: "Colossians",      abbr: "Col",  testament: "NT" },
  52: { name: "1 Thessalonians", abbr: "1Th",  testament: "NT" },
  53: { name: "2 Thessalonians", abbr: "2Th",  testament: "NT" },
  54: { name: "1 Timothy",       abbr: "1Ti",  testament: "NT" },
  55: { name: "2 Timothy",       abbr: "2Ti",  testament: "NT" },
  56: { name: "Titus",           abbr: "Tit",  testament: "NT" },
  57: { name: "Philemon",        abbr: "Phm",  testament: "NT" },
  58: { name: "Hebrews",         abbr: "Heb",  testament: "NT" },
  59: { name: "James",           abbr: "Jas",  testament: "NT" },
  60: { name: "1 Peter",         abbr: "1Pe",  testament: "NT" },
  61: { name: "2 Peter",         abbr: "2Pe",  testament: "NT" },
  62: { name: "1 John",          abbr: "1Jo",  testament: "NT" },
  63: { name: "2 John",          abbr: "2Jo",  testament: "NT" },
  64: { name: "3 John",          abbr: "3Jo",  testament: "NT" },
  65: { name: "Jude",            abbr: "Jud",  testament: "NT" },
  66: { name: "Revelation",      abbr: "Rev",  testament: "NT" },
};

function toUSFM(abbr: string): string {
  return USFM_EXCEPTIONS[abbr] ?? abbr.toUpperCase();
}

// ─── Recursive verse collector ─────────────────────────────────────────────────
type AnyContent = string | { text?: string; type?: string; content?: AnyContent[] };

function extractText(content: AnyContent[]): string {
  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.text) return item.text;
      if (typeof item === "object" && item.content) return extractText(item.content);
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface HelloAOItem {
  type: string;
  number?: number;
  content?: AnyContent[];
}

function collectVerses(items: HelloAOItem[]): HelloAOItem[] {
  const result: HelloAOItem[] = [];
  for (const item of items) {
    if (item.type === "verse" && typeof item.number === "number") {
      result.push(item);
    } else if (item.content) {
      result.push(...collectVerses(item.content as HelloAOItem[]));
    }
  }
  return result;
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Smoke-test: ?ping=1
  if (searchParams.get("ping") === "1") {
    return NextResponse.json({ ok: true, runtime: "nodejs" });
  }

  // Connectivity test: ?testfetch=1
  if (searchParams.get("testfetch") === "1") {
    const results: Record<string, unknown> = {};
    const H = { "Accept": "application/json", "User-Agent": "TulipBibleApp/1.0" };
    // Try different possible bolls.life Spanish translation IDs (John 3)
    const tests: [string, string][] = [
      // English new additions (John 3)
      ["bolls_NKJV",     "https://bolls.life/get-chapter/NKJV/43/3/"],
      ["bolls_ESV",      "https://bolls.life/get-chapter/ESV/43/3/"],
      ["bolls_NASB",     "https://bolls.life/get-chapter/NASB/43/3/"],
      ["bolls_NASB2020", "https://bolls.life/get-chapter/NASB2020/43/3/"],
      ["bolls_NIV",      "https://bolls.life/get-chapter/NIV/43/3/"],
      ["bolls_NIV2011",  "https://bolls.life/get-chapter/NIV2011/43/3/"],
      ["bolls_LSB",      "https://bolls.life/get-chapter/LSB/43/3/"],
      // Spanish new additions
      ["bolls_NTV",      "https://bolls.life/get-chapter/NTV/43/3/"],
      ["bolls_NVI",      "https://bolls.life/get-chapter/NVI/43/3/"],
    ];
    for (const [label, url] of tests) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6_000);
        const r = await fetch(url, { signal: ctrl.signal, headers: H });
        clearTimeout(t);
        const body = await r.text().catch(() => "");
        const isJson = body.trimStart().startsWith("[") || body.trimStart().startsWith("{");
        const hasVerses = body.includes('"verse"') && body.includes('"text"');
        results[label] = { ok: r.ok, status: r.status, isJson, hasVerses, preview: body.slice(0, 80) };
      } catch (err) {
        results[label] = { error: String(err) };
      }
    }
    return NextResponse.json(results);
  }

  const bookNum  = parseInt(searchParams.get("book")    ?? "0", 10);
  const chapter  = parseInt(searchParams.get("chapter") ?? "0", 10);
  const trans    = searchParams.get("translation") ?? "esv";

  if (!bookNum || !chapter) {
    return NextResponse.json({ error: "Missing book or chapter" }, { status: 400 });
  }

  const meta = BOOKS[bookNum];
  if (!meta) {
    return NextResponse.json({ error: `Unknown book ${bookNum}` }, { status: 400 });
  }

  const H = { "Accept": "application/json", "User-Agent": "TulipBibleApp/1.0" };

  // ── Spanish / LBLA → bolls.life ──────────────────────────────────────────────
  const bollsId = BOLLS_ID[trans];
  if (bollsId) {
    try {
      const url = `https://bolls.life/get-chapter/${bollsId}/${bookNum}/${chapter}/`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8_000);
      const res = await fetch(url, { signal: ctrl.signal, headers: H });
      clearTimeout(t);

      if (!res.ok) {
        return NextResponse.json({ error: `bolls.life returned ${res.status}` }, { status: 502 });
      }

      interface BollsVerse { pk: number; verse: number; text: string; }
      const data = await res.json() as BollsVerse[];

      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json(
          { error: `Translation "${trans}" is not available in this Bible source` },
          { status: 404 }
        );
      }

      const verses = data
        .sort((a, b) => a.verse - b.verse)
        .map(({ verse, text }) => {
          // Strip any embedded HTML tags or Strong's markers
          const clean = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          return {
            verse,
            text: clean,
            words: clean.split(/\s+/).filter(Boolean).map((w: string) => ({ w, s: null })),
            hasStrongs: false,
          };
        });

      return NextResponse.json({
        book: bookNum,
        bookName: meta.name,
        chapter,
        testament: meta.testament,
        translation: trans,
        verses,
        hasStrongs: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  // ── English → helloao.org ────────────────────────────────────────────────────
  const helloaoId = HELLOAO_ID[trans];
  if (!helloaoId) {
    return NextResponse.json({ error: `Unsupported translation: ${trans}` }, { status: 400 });
  }

  const bookCode = toUSFM(meta.abbr);

  try {
    const url = `https://bible.helloao.org/api/${helloaoId}/${bookCode}/${chapter}.json`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8_000);
    const res = await fetch(url, { signal: ctrl.signal, headers: H });
    clearTimeout(t);

    if (!res.ok) {
      return NextResponse.json({ error: `helloao.org returned ${res.status}` }, { status: 502 });
    }

    const bodyText = await res.text();
    if (bodyText.trimStart().startsWith("<")) {
      return NextResponse.json({ error: "helloao.org returned HTML (IP blocked)" }, { status: 502 });
    }

    const data = JSON.parse(bodyText) as {
      book: { shortName?: string; name?: string };
      chapter: { number: number; content: HelloAOItem[] };
    };

    const verseItems = collectVerses(data.chapter.content);
    const verses = verseItems.map((item) => {
      const text = extractText((item.content ?? []) as AnyContent[]);
      return {
        verse: item.number as number,
        text,
        words: text.trim().split(/\s+/).filter(Boolean).map((w: string) => ({ w, s: null })),
        hasStrongs: false,
      };
    });

    return NextResponse.json({
      book: bookNum,
      bookName: data.book?.name ?? data.book?.shortName ?? meta.name,
      chapter,
      testament: meta.testament,
      translation: trans,
      verses,
      hasStrongs: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
