import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/covers/books");
const PORTRAIT_DIR = path.resolve("public/covers/portraits");
const WIDTH = 1024;
const HEIGHT = 1536;

const books = [
  {
    slug: "pilgrims-progress",
    title: "The Pilgrim's Progress",
    author: "John Bunyan",
    year: "1678",
    label: "Puritan Allegory",
    colors: ["#070b14", "#153f32", "#d6b85f"],
    portrait: "bunyan",
    art: pilgrimsProgress,
  },
  {
    slug: "grace-abounding",
    title: "Grace Abounding to the Chief of Sinners",
    author: "John Bunyan",
    year: "1666",
    label: "Spiritual Autobiography",
    colors: ["#130a0a", "#4a1d16", "#f0b56b"],
    portrait: "bunyan",
    art: graceAbounding,
  },
  {
    slug: "confessions-augustine",
    title: "Confessions",
    author: "Augustine of Hippo",
    year: "c. 400",
    label: "Restless Heart",
    colors: ["#0b1820", "#234054", "#d9a856"],
    portrait: "augustine",
    art: confessionsAugustine,
  },
  {
    slug: "imitation-of-christ",
    title: "The Imitation of Christ",
    author: "Thomas a Kempis",
    year: "1418",
    label: "Medieval Devotion",
    colors: ["#11110d", "#42402f", "#d7c28a"],
    portrait: "kempis",
    art: imitationOfChrist,
  },
  {
    slug: "institutes-of-religion",
    title: "Institutes of the Christian Religion",
    author: "John Calvin",
    year: "1536",
    label: "Reformed Theology",
    colors: ["#07111d", "#173557", "#b8a15a"],
    portrait: "calvin",
    art: institutes,
  },
  {
    slug: "holiness-ryle",
    title: "Holiness",
    author: "J.C. Ryle",
    year: "1879",
    label: "Sanctification",
    colors: ["#111511", "#2f563b", "#e5cf8d"],
    portrait: "ryle",
    art: holiness,
  },
  {
    slug: "morning-evening-spurgeon",
    title: "Morning and Evening",
    author: "Charles H. Spurgeon",
    year: "1865",
    label: "Daily Devotions",
    colors: ["#081626", "#3e2b54", "#e8bd68"],
    portrait: "spurgeon",
    art: morningEvening,
  },
  {
    slug: "sinners-in-hands-edwards",
    title: "Sinners in the Hands of an Angry God & Other Sermons",
    author: "Jonathan Edwards",
    year: "1741",
    label: "Great Awakening",
    colors: ["#10080a", "#4a1c1b", "#ee9b4b"],
    portrait: "edwards",
    art: sinnersInHands,
  },
  {
    slug: "all-of-grace",
    title: "All of Grace",
    author: "Charles H. Spurgeon",
    year: "1886",
    label: "Free Gospel",
    colors: ["#081411", "#1f5f4b", "#e0c66f"],
    portrait: "spurgeon",
    art: allOfGrace,
  },
  {
    slug: "knowledge-of-the-holy",
    title: "The Knowledge of the Holy",
    author: "A.W. Tozer",
    year: "1961",
    label: "Attributes of God",
    colors: ["#050716", "#18245a", "#c9b16d"],
    portrait: "tozer",
    art: knowledgeOfTheHoly,
  },
  {
    slug: "mortification-of-sin",
    title: "The Mortification of Sin",
    author: "John Owen",
    year: "1656",
    label: "Sin and Sanctification",
    colors: ["#100807", "#4a1715", "#eda45b"],
    portrait: "owen",
    art: mortificationOfSin,
  },
  {
    slug: "bondage-of-the-will",
    title: "The Bondage of the Will",
    author: "Martin Luther",
    year: "1525",
    label: "Grace and Will",
    colors: ["#120b07", "#4f2b18", "#e7ad5a"],
    portrait: "luther",
    art: bondageOfTheWill,
  },
  {
    slug: "religious-affections",
    title: "Religious Affections",
    author: "Jonathan Edwards",
    year: "1746",
    label: "True Spiritual Life",
    colors: ["#13080d", "#4f1e2c", "#eda3a8"],
    portrait: "edwards",
    art: religiousAffections,
  },
  {
    slug: "death-of-death",
    title: "The Death of Death in the Death of Christ",
    author: "John Owen",
    year: "1647",
    label: "Definite Atonement",
    colors: ["#10080b", "#542024", "#e8b15e"],
    portrait: "owen",
    art: deathOfDeath,
  },
  {
    slug: "body-of-divinity",
    title: "Body of Divinity",
    author: "Thomas Watson",
    year: "1692",
    label: "Puritan Theology",
    colors: ["#0c1010", "#35453d", "#dec075"],
    portrait: "watson",
    art: bodyOfDivinity,
  },
  {
    slug: "freedom-of-the-will",
    title: "The Freedom of the Will",
    author: "Jonathan Edwards",
    year: "1754",
    label: "Moral Agency",
    colors: ["#0a0b17", "#2e3158", "#d9b86d"],
    portrait: "edwards",
    art: freedomOfTheWill,
  },
  {
    slug: "commentary-on-romans-hodge",
    title: "Commentary on Romans",
    author: "Charles Hodge",
    year: "1835",
    label: "Romans Commentary",
    colors: ["#07121b", "#23445f", "#d7bb74"],
    portrait: "hodge",
    art: romansCommentary,
  },
  {
    slug: "fourfold-state",
    title: "Human Nature in Its Fourfold State",
    author: "Thomas Boston",
    year: "1720",
    label: "Fourfold State",
    colors: ["#09140f", "#244b36", "#d8be73"],
    portrait: "boston",
    art: fourfoldState,
  },
  {
    slug: "practical-religion",
    title: "Practical Religion",
    author: "J.C. Ryle",
    year: "1878",
    label: "Christian Practice",
    colors: ["#11110d", "#4a3f26", "#dfc177"],
    portrait: "ryle",
    art: practicalReligion,
  },
  {
    slug: "knots-untied",
    title: "Knots Untied",
    author: "J.C. Ryle",
    year: "1877",
    label: "Doctrine Clarified",
    colors: ["#0e0c13", "#372b4f", "#d2b1e8"],
    portrait: "ryle",
    art: knotsUntied,
  },
  {
    slug: "thoughts-for-young-men",
    title: "Thoughts for Young Men",
    author: "J.C. Ryle",
    year: "1865",
    label: "Counsel for Youth",
    colors: ["#07131b", "#24455e", "#d9b86d"],
    portrait: "ryle",
    art: thoughtsForYoungMen,
  },
  {
    slug: "duties-of-parents",
    title: "The Duties of Parents",
    author: "J.C. Ryle",
    year: "1888",
    label: "Family Instruction",
    colors: ["#101008", "#4b3f1f", "#e0bf6c"],
    portrait: "ryle",
    art: dutiesOfParents,
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapWords(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(text, x, y, maxChars, size, color, weight = 800, anchor = "middle", lineHeight = 1.12, attrs = "") {
  const lines = wrapWords(text, maxChars);
  const tspans = lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lineHeight}">${esc(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="${weight}" ${attrs}>${tspans}</text>`;
}

function smallCaps(text, x, y, color, size = 31, anchor = "middle") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="900" letter-spacing="7">${esc(text.toUpperCase())}</text>`;
}

function frame(accent) {
  return `
    <rect x="48" y="48" width="928" height="1440" rx="54" fill="none" stroke="${accent}" stroke-opacity=".66" stroke-width="3"/>
    <rect x="78" y="78" width="868" height="1380" rx="38" fill="none" stroke="#fff4c7" stroke-opacity=".12" stroke-width="2"/>
    <path d="M126 132h112M786 132h112M126 1404h112M786 1404h112" stroke="${accent}" stroke-opacity=".48" stroke-width="4" stroke-linecap="round"/>
    <circle cx="512" cy="132" r="7" fill="${accent}" opacity=".65"/>
    <circle cx="512" cy="1404" r="7" fill="${accent}" opacity=".65"/>
  `;
}

async function loadPortraitImages() {
  const kinds = [...new Set(books.map((book) => book.portrait))];
  const images = {};

  for (const kind of kinds) {
    try {
      const image = await fs.readFile(path.join(PORTRAIT_DIR, `${kind}.png`));
      images[kind] = `data:image/png;base64,${image.toString("base64")}`;
    } catch {
      // The vector fallback keeps the cover generator usable if portraits are missing.
    }
  }

  return images;
}

function portraitMedallion(kind, accent, imageHref) {
  const portrait = imageHref
    ? `
        <image href="${imageHref}" x="-74" y="-98" width="148" height="196" preserveAspectRatio="xMidYMid slice"/>
        <rect x="-78" y="-104" width="156" height="208" fill="#2c180c" opacity=".08"/>
        <path d="M-66 -74c30-22 102-22 132 0" stroke="#fff2bf" stroke-opacity=".12" stroke-width="16" stroke-linecap="round"/>
        <path d="M-72 60c38 32 106 32 144 0" stroke="#000" stroke-opacity=".18" stroke-width="20" stroke-linecap="round"/>
      `
    : `
        <rect x="-78" y="-104" width="156" height="198" fill="#31271f"/>
        <path d="M-78 70c36-48 120-48 156 0v44H-78Z" fill="#15120f"/>
        ${portraitFace(kind, accent)}
        <path d="M-68 -70c30-24 106-24 136 0" stroke="#fff4d1" stroke-opacity=".12" stroke-width="18" stroke-linecap="round"/>
        <path d="M-72 58c38 34 106 34 144 0" stroke="#000" stroke-opacity=".22" stroke-width="22" stroke-linecap="round"/>
      `;

  return `
    <g transform="translate(792 352) scale(1.22)">
      <ellipse cx="0" cy="0" rx="86" ry="108" fill="rgba(8,7,6,.56)" stroke="${accent}" stroke-opacity=".72" stroke-width="5"/>
      <ellipse cx="0" cy="0" rx="72" ry="92" fill="#cba77c" opacity=".18"/>
      <clipPath id="portraitClip-${kind}">
        <ellipse cx="0" cy="-2" rx="70" ry="90"/>
      </clipPath>
      <g clip-path="url(#portraitClip-${kind})">
        ${portrait}
      </g>
      <ellipse cx="0" cy="-2" rx="70" ry="90" fill="none" stroke="#fff2bf" stroke-opacity=".24" stroke-width="2"/>
      <path d="M-58 104h116" stroke="${accent}" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>
    </g>
  `;
}

function portraitFace(kind, accent) {
  const skin = "#c99b72";
  const skinHi = "#e0bd94";
  const shadow = "#6d4b35";
  const dark = "#17110e";
  const gray = "#d7d0bd";
  const white = "#f2ead8";

  const commonHead = `
    <ellipse cx="0" cy="-10" rx="30" ry="42" fill="${skin}"/>
    <path d="M-20 -24c8-9 32-9 40 0" stroke="${skinHi}" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
    <path d="M-12 -8h1M13 -8h1" stroke="#1b120d" stroke-width="7" stroke-linecap="round"/>
    <path d="M-7 8c6 4 13 4 19 0" stroke="${shadow}" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  `;

  if (kind === "bunyan") {
    return `
      <path d="M-48 92c6-48 20-78 48-78s42 30 48 78Z" fill="#1c1712"/>
      <path d="M-34 -42c6-30 62-30 68 0v44c-16-16-52-16-68 0Z" fill="#2b2119"/>
      ${commonHead}
      <path d="M-24 10c6 28 42 28 48 0 2 28-6 48-24 54-18-6-26-26-24-54Z" fill="#2b2119"/>
      <path d="M-25 34h50" stroke="#2b2119" stroke-width="12" stroke-linecap="round"/>
      <path d="M-32 68h64l-18 26h-28Z" fill="${white}" opacity=".9"/>
    `;
  }

  if (kind === "augustine") {
    return `
      <path d="M-52 94c8-56 28-88 52-88s44 32 52 88Z" fill="#5b2118"/>
      <path d="M-38 -36c8-30 68-30 76 0-16-8-60-8-76 0Z" fill="#18120f"/>
      ${commonHead}
      <path d="M-26 12c8 24 44 24 52 0 0 34-10 52-26 58-16-6-26-24-26-58Z" fill="#281812"/>
      <path d="M-36 76h72" stroke="${accent}" stroke-opacity=".8" stroke-width="10" stroke-linecap="round"/>
      <path d="M0 54v44" stroke="${accent}" stroke-width="5" opacity=".75"/>
    `;
  }

  if (kind === "kempis") {
    return `
      <path d="M-62 94c4-76 22-128 62-128s58 52 62 128Z" fill="#302a1e"/>
      <path d="M-50 -28c14-52 86-52 100 0-14-14-34-22-50-22s-36 8-50 22Z" fill="#504633"/>
      ${commonHead}
      <path d="M-24 -42c16-10 32-10 48 0" stroke="#6a5438" stroke-width="10" stroke-linecap="round"/>
      <path d="M-22 70h44" stroke="${white}" stroke-opacity=".8" stroke-width="8" stroke-linecap="round"/>
      <path d="M0 38v52M-18 64h36" stroke="${accent}" stroke-width="5" opacity=".75"/>
    `;
  }

  if (kind === "calvin") {
    return `
      <path d="M-54 94c8-54 26-84 54-84s46 30 54 84Z" fill="#111111"/>
      <path d="M-38 -56h76l-8 26h-60Z" fill="#101010"/>
      <path d="M-32 -62c18-16 46-16 64 0" stroke="#171717" stroke-width="14" stroke-linecap="round"/>
      ${commonHead}
      <path d="M-24 0c8 44 16 70 24 84 8-14 16-40 24-84-6 20-42 20-48 0Z" fill="#221916"/>
      <path d="M-36 74h72l-20 24h-32Z" fill="${white}" opacity=".94"/>
    `;
  }

  if (kind === "ryle") {
    return `
      <path d="M-54 94c8-50 26-80 54-80s46 30 54 80Z" fill="#1b1b18"/>
      <path d="M-32 -38c10-28 54-28 64 0" fill="${gray}" opacity=".9"/>
      ${commonHead}
      <path d="M-36 -18c-14 28-8 70 10 92M36 -18c14 28 8 70-10 92" stroke="${gray}" stroke-width="15" stroke-linecap="round"/>
      <path d="M-22 70h44" stroke="${white}" stroke-width="12" stroke-linecap="round"/>
      <path d="M0 62v38" stroke="${accent}" stroke-width="5" opacity=".75"/>
    `;
  }

  if (kind === "spurgeon") {
    return `
      <path d="M-58 94c10-54 28-82 58-82s48 28 58 82Z" fill="#171717"/>
      <path d="M-36 -44c12-30 60-30 72 0-12-6-60-6-72 0Z" fill="#2c241f"/>
      ${commonHead}
      <path d="M-30 4c8 42 52 42 60 0 2 42-8 70-30 82-22-12-32-40-30-82Z" fill="#3b2d24"/>
      <path d="M-38 70h76" stroke="${white}" stroke-width="11" stroke-linecap="round"/>
      <path d="M-15 86h30" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity=".75"/>
    `;
  }

  if (kind === "edwards") {
    return `
      <path d="M-56 94c8-56 28-86 56-86s48 30 56 86Z" fill="#171717"/>
      <path d="M-44 -54c12-34 76-34 88 0v58c-18-18-70-18-88 0Z" fill="${gray}"/>
      <path d="M-58 -28c-18 22-14 62 6 88M58 -28c18 22 14 62-6 88" stroke="${gray}" stroke-width="16" stroke-linecap="round"/>
      ${commonHead}
      <path d="M-20 16c8 18 32 18 40 0" stroke="${shadow}" stroke-width="7" stroke-linecap="round"/>
      <path d="M-36 70h72l-18 28h-36Z" fill="${white}" opacity=".92"/>
    `;
  }

  if (kind === "tozer") {
    return `
      <path d="M-56 94c10-54 28-82 56-82s46 28 56 82Z" fill="#191c24"/>
      <path d="M-36 -44c16-30 58-26 72 0-18-8-54-8-72 0Z" fill="#3b312b"/>
      ${commonHead}
      <circle cx="-13" cy="-8" r="13" fill="none" stroke="#1b120d" stroke-width="4"/>
      <circle cx="18" cy="-8" r="13" fill="none" stroke="#1b120d" stroke-width="4"/>
      <path d="M0 -8h5" stroke="#1b120d" stroke-width="4"/>
      <path d="M-22 18c8 18 36 18 44 0" fill="#3b312b"/>
      <path d="M-38 72h76" stroke="${white}" stroke-width="12" stroke-linecap="round"/>
      <path d="M0 64v36" stroke="${accent}" stroke-width="5" opacity=".72"/>
    `;
  }

  return commonHead;
}

function titleLayout(title) {
  if (title.length > 58) {
    return { maxChars: 19, size: 47, y: 965, lineHeight: 1.03 };
  }

  if (title.length > 44) {
    return { maxChars: 18, size: 54, y: 975, lineHeight: 1.04 };
  }

  if (title.length > 30) {
    return { maxChars: 16, size: 62, y: 982, lineHeight: 1.05 };
  }

  return { maxChars: 14, size: 76, y: 1002, lineHeight: 1.05 };
}

function topIdentity(book, accent) {
  return `
    <g transform="translate(102 104)">
      <rect x="0" y="0" width="144" height="54" rx="27" fill="rgba(0,0,0,.22)" stroke="${accent}" stroke-opacity=".42"/>
      <text x="72" y="35" text-anchor="middle" fill="${accent}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="4">TULIP</text>
    </g>
    ${smallCaps(book.label, 512, 134, accent, 24)}
    <text x="832" y="139" text-anchor="middle" fill="rgba(255,250,230,.62)" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900" letter-spacing="4">${esc(book.year.toUpperCase())}</text>
  `;
}

function heroPanel(book, art, accent, imageHref) {
  const portrait = imageHref
    ? `<image href="${imageHref}" x="595" y="244" width="284" height="418" preserveAspectRatio="xMidYMid slice" clip-path="url(#portraitClip-${book.slug})"/>`
    : `<g transform="translate(738 468) scale(1.8)">${portraitFace(book.portrait, accent)}</g>`;

  return `
    <g filter="url(#softShadow)">
      <rect x="90" y="184" width="844" height="628" rx="56" fill="rgba(5,4,4,.32)" stroke="${accent}" stroke-opacity=".42" stroke-width="3"/>
      <clipPath id="heroClip-${book.slug}">
        <rect x="112" y="206" width="800" height="584" rx="42"/>
      </clipPath>
      <g clip-path="url(#heroClip-${book.slug})">
        <rect x="112" y="206" width="800" height="584" fill="rgba(255,255,255,.04)"/>
        <circle cx="274" cy="320" r="210" fill="${accent}" opacity=".12"/>
        <circle cx="648" cy="674" r="260" fill="#000" opacity=".16"/>
        <g transform="translate(-130 -34) scale(.74)" opacity=".58">
          ${art(accent)}
        </g>
        <rect x="112" y="206" width="800" height="584" fill="url(#heroVignette)"/>
      </g>

      <rect x="573" y="218" width="326" height="488" rx="164" fill="rgba(0,0,0,.54)" stroke="${accent}" stroke-opacity=".72" stroke-width="5"/>
      <clipPath id="portraitClip-${book.slug}">
        <rect x="595" y="244" width="284" height="418" rx="142"/>
      </clipPath>
      ${portrait}
      <rect x="595" y="244" width="284" height="418" rx="142" fill="#160a03" opacity=".09"/>
      <rect x="595" y="244" width="284" height="418" rx="142" fill="none" stroke="#fff2c2" stroke-opacity=".18" stroke-width="2"/>
      <path d="M626 688h220" stroke="${accent}" stroke-opacity=".76" stroke-width="5" stroke-linecap="round"/>
    </g>
  `;
}

function titlePlate(book, accent) {
  const layout = titleLayout(book.title);

  return `
    <g filter="url(#plateShadow)">
      <rect x="88" y="866" width="848" height="420" rx="44" fill="rgba(7,6,5,.62)" stroke="${accent}" stroke-opacity=".52" stroke-width="3"/>
      <path d="M148 926h728M148 1198h728" stroke="${accent}" stroke-opacity=".24" stroke-width="2"/>
      ${textBlock(book.title, 512, layout.y, layout.maxChars, layout.size, "#fff8ea", 900, "middle", layout.lineHeight)}
      <path d="M372 1216h280" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity=".72"/>
      ${smallCaps(book.author, 512, 1260, accent, 24)}
    </g>
  `;
}

function bottomSeriesMark(accent) {
  return `
    <g transform="translate(0 0)">
      <text x="512" y="1366" text-anchor="middle" fill="rgba(255,250,230,.46)" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="900" letter-spacing="5">FREE BOOK LIBRARY</text>
      <path d="M386 1328h252" stroke="rgba(255,250,230,.18)" stroke-width="2" stroke-linecap="round"/>
      <path d="M476 1418h72l-36-48Z" fill="none" stroke="${accent}" stroke-opacity=".58" stroke-width="3" stroke-linejoin="round"/>
    </g>
  `;
}

function baseSvg(book, art, portraitImages) {
  const [from, to, accent] = book.colors;
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset=".58" stop-color="${to}"/>
        <stop offset="1" stop-color="#030304"/>
      </linearGradient>
      <radialGradient id="warm" cx=".5" cy=".25" r=".75">
        <stop offset="0" stop-color="${accent}" stop-opacity=".28"/>
        <stop offset=".48" stop-color="${accent}" stop-opacity=".08"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grain" width="88" height="88" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="22" r="1.3" fill="#fff" opacity=".08"/>
        <circle cx="54" cy="18" r="1" fill="#fff" opacity=".05"/>
        <circle cx="38" cy="64" r="1.2" fill="#000" opacity=".12"/>
        <circle cx="78" cy="76" r="1" fill="#fff" opacity=".04"/>
      </pattern>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000" flood-opacity=".42"/>
      </filter>
      <filter id="plateShadow" x="-14%" y="-20%" width="128%" height="150%">
        <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#000" flood-opacity=".34"/>
      </filter>
      <linearGradient id="heroVignette" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".04"/>
        <stop offset=".48" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity=".48"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#bg)"/>
    <rect width="1024" height="1536" fill="url(#warm)"/>
    <rect width="1024" height="1536" fill="url(#grain)" opacity=".55"/>
    ${frame(accent)}
    ${topIdentity(book, accent)}
    ${heroPanel(book, art, accent, portraitImages[book.portrait])}
    ${titlePlate(book, accent)}
    ${bottomSeriesMark(accent)}
  </svg>`;
}

function pilgrimsProgress(accent) {
  return `
    <g transform="translate(0 26)">
      <path d="M172 724 C325 602 452 534 512 416 C572 534 699 602 852 724 Z" fill="rgba(0,0,0,.28)"/>
      <path d="M138 770 C310 636 436 605 512 472 C588 605 714 636 886 770" fill="none" stroke="${accent}" stroke-opacity=".55" stroke-width="5"/>
      <path d="M512 760 C482 682 497 612 548 548" fill="none" stroke="#f6e2a6" stroke-width="20" stroke-linecap="round" opacity=".72"/>
      <path d="M690 392h28v-72h52v72h28v128H690Z" fill="${accent}" opacity=".72"/>
      <path d="M708 320l36-46 36 46" fill="${accent}" opacity=".72"/>
      <circle cx="353" cy="653" r="28" fill="#0b0b0d"/>
      <path d="M353 682v118M311 740l84-42M360 714l56 110" stroke="#0b0b0d" stroke-width="22" stroke-linecap="round"/>
      <path d="M282 806h150" stroke="#0b0b0d" stroke-width="18" stroke-linecap="round"/>
      <path d="M306 672c-58-28-92-58-124-112 78 6 126 40 124 112Z" fill="${accent}" opacity=".45"/>
    </g>`;
}

function graceAbounding(accent) {
  return `
    <g transform="translate(0 34)">
      <rect x="260" y="294" width="504" height="396" rx="34" fill="rgba(0,0,0,.38)" stroke="${accent}" stroke-opacity=".42" stroke-width="4"/>
      <rect x="330" y="334" width="364" height="150" rx="18" fill="rgba(255,255,255,.08)"/>
      <path d="M362 334v150M434 334v150M506 334v150M578 334v150M650 334v150" stroke="#090909" stroke-width="15"/>
      <path d="M512 484 732 764 348 764Z" fill="${accent}" opacity=".28"/>
      <path d="M368 742c72-36 122-34 144 8v112c-44-38-86-44-144-12Z" fill="#f3ead6" opacity=".9"/>
      <path d="M656 742c-72-36-122-34-144 8v112c44-38 86-44 144-12Z" fill="#efe2c9" opacity=".9"/>
      <path d="M512 750v112M396 786h82M548 786h82M396 826h72M548 826h72" stroke="#5b3821" stroke-width="5" opacity=".65"/>
    </g>`;
}

function confessionsAugustine(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M250 796V430c0-148 116-240 262-240s262 92 262 240v366" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M326 790V442c0-102 80-170 186-170s186 68 186 170v348" fill="rgba(0,0,0,.28)"/>
      <circle cx="512" cy="440" r="82" fill="${accent}" opacity=".18"/>
      <path d="M512 482c-60-48-116-92-116-152 0-44 34-75 75-75 24 0 42 11 41 28 8-17 25-28 50-28 41 0 75 31 75 75 0 60-56 104-125 152Z" fill="${accent}" opacity=".82"/>
      <path d="M362 724c92-46 143-42 150 12v96c-48-34-96-38-150-12Z" fill="#ead9b8"/>
      <path d="M662 724c-92-46-143-42-150 12v96c48-34 96-38 150-12Z" fill="#dfc697"/>
      <path d="M424 606c26-56 150-56 176 0" stroke="#101014" stroke-width="28" stroke-linecap="round"/>
    </g>`;
}

function imitationOfChrist(accent) {
  return `
    <g transform="translate(0 16)">
      <rect x="220" y="300" width="584" height="484" rx="24" fill="rgba(255,255,255,.07)" stroke="${accent}" stroke-opacity=".38" stroke-width="4"/>
      <path d="M278 784V500c0-72 48-128 112-128s112 56 112 128v284" fill="rgba(0,0,0,.26)"/>
      <path d="M522 784V500c0-72 48-128 112-128s112 56 112 128v284" fill="rgba(0,0,0,.26)"/>
      <path d="M512 410v260M420 520h184M446 672h132" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".82"/>
      <path d="M348 842h328" stroke="#ead9b8" stroke-width="26" stroke-linecap="round" opacity=".78"/>
      <path d="M376 806h272" stroke="#ead9b8" stroke-width="18" stroke-linecap="round" opacity=".58"/>
    </g>`;
}

function institutes(accent) {
  return `
    <g transform="translate(0 26)">
      <path d="M226 724h572v96H226Z" fill="rgba(0,0,0,.36)" stroke="${accent}" stroke-opacity=".45" stroke-width="4"/>
      <rect x="274" y="302" width="94" height="422" rx="8" fill="#633b21"/>
      <rect x="384" y="250" width="88" height="474" rx="8" fill="#263d5e"/>
      <rect x="488" y="336" width="82" height="388" rx="8" fill="#5c2525"/>
      <rect x="586" y="278" width="96" height="446" rx="8" fill="#29452f"/>
      <path d="M266 774h492" stroke="#e8d8ad" stroke-width="12" opacity=".42"/>
      <path d="M332 348v306M428 304v336M528 392v262M636 332v322" stroke="${accent}" stroke-width="7" opacity=".62"/>
      <path d="M344 218h336l-38-50H382Z" fill="${accent}" opacity=".56"/>
      <path d="M392 168h240M416 140h192" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity=".5"/>
    </g>`;
}

function holiness(accent) {
  return `
    <g transform="translate(0 28)">
      <rect x="284" y="250" width="456" height="424" rx="26" fill="rgba(255,255,255,.09)" stroke="${accent}" stroke-opacity=".44" stroke-width="4"/>
      <path d="M512 252v422M286 462h452" stroke="${accent}" stroke-width="5" opacity=".35"/>
      <path d="M512 462 318 738M512 462l194 276M512 462V820" stroke="${accent}" stroke-width="8" opacity=".22"/>
      <path d="M334 810c82-42 148-38 178 10v98c-52-36-108-42-178-10Z" fill="#f0e6d0" opacity=".9"/>
      <path d="M690 810c-82-42-148-38-178 10v98c52-36 108-42 178-10Z" fill="#e5d2aa" opacity=".9"/>
      <path d="M512 818v100M394 854h82M548 854h82" stroke="#355032" stroke-width="5" opacity=".55"/>
      <path d="M412 354h200M412 402h200M412 502h200M412 550h200" stroke="#fff" stroke-opacity=".12" stroke-width="10" stroke-linecap="round"/>
    </g>`;
}

function morningEvening(accent) {
  return `
    <g transform="translate(0 18)">
      <path d="M216 472c84-156 236-236 430-238 78 48 132 128 162 238Z" fill="rgba(255,255,255,.08)"/>
      <circle cx="372" cy="444" r="86" fill="${accent}" opacity=".82"/>
      <path d="M690 350a92 92 0 1 0 0 184 112 112 0 1 1 0-184Z" fill="#d8d8ff" opacity=".82"/>
      <path d="M190 624h644" stroke="${accent}" stroke-width="6" opacity=".45"/>
      <path d="M344 710c88-42 140-38 168 8v116c-58-38-112-44-168-12Z" fill="#f1e7d3"/>
      <path d="M680 710c-88-42-140-38-168 8v116c58-38 112-44 168-12Z" fill="#ddc89e"/>
      <path d="M512 718v116M390 758h78M556 758h78" stroke="#604421" stroke-width="5" opacity=".62"/>
    </g>`;
}

function sinnersInHands(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M218 498 512 276l294 222v340H218Z" fill="rgba(255,255,255,.07)" stroke="${accent}" stroke-opacity=".42" stroke-width="4"/>
      <path d="M512 276 176 532M512 276l336 256" stroke="${accent}" stroke-width="10" opacity=".4"/>
      <rect x="314" y="560" width="108" height="156" fill="rgba(0,0,0,.35)" stroke="${accent}" stroke-opacity=".28"/>
      <rect x="602" y="560" width="108" height="156" fill="rgba(0,0,0,.35)" stroke="${accent}" stroke-opacity=".28"/>
      <path d="M444 820h136v-148H444Z" fill="#21110d" stroke="${accent}" stroke-opacity=".5" stroke-width="4"/>
      <path d="M398 840h228" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".5"/>
      <path d="M710 270l-78 134h74l-112 170" fill="none" stroke="${accent}" stroke-width="13" stroke-linejoin="round" opacity=".82"/>
      <path d="M284 838c90-52 366-52 456 0" stroke="#000" stroke-opacity=".32" stroke-width="22" stroke-linecap="round"/>
    </g>`;
}

function allOfGrace(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M300 840V442c0-106 84-192 212-192s212 86 212 192v398" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
      <path d="M512 844V318" stroke="${accent}" stroke-width="10" opacity=".55"/>
      <path d="M310 812c112-118 206-212 202-494M714 812c-112-118-206-212-202-494" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" opacity=".35"/>
      <path d="M512 520 724 852H300Z" fill="${accent}" opacity=".18"/>
      <rect x="406" y="678" width="212" height="146" rx="18" fill="#f0e0bc" opacity=".92"/>
      <path d="M512 678v146M406 732h212" stroke="#815f24" stroke-width="8" opacity=".68"/>
      <path d="M468 678c-44-42-10-88 44-34 54-54 88-8 44 34" fill="${accent}" opacity=".78"/>
    </g>`;
}

function knowledgeOfTheHoly(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M154 812c120-152 224-220 358-220s238 68 358 220Z" fill="rgba(0,0,0,.38)"/>
      <path d="M312 826h400V642L512 492 312 642Z" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
      <path d="M512 492 270 674M512 492l242 182" stroke="${accent}" stroke-width="8" opacity=".42"/>
      <path d="M468 826V680h88v146" fill="#05060a" stroke="${accent}" stroke-opacity=".45" stroke-width="4"/>
      <circle cx="512" cy="390" r="84" fill="none" stroke="${accent}" stroke-width="5" opacity=".42"/>
      <path d="M512 304v172M426 390h172" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity=".72"/>
      <circle cx="252" cy="286" r="5" fill="#fff" opacity=".72"/>
      <circle cx="348" cy="238" r="4" fill="#fff" opacity=".56"/>
      <circle cx="704" cy="260" r="5" fill="#fff" opacity=".68"/>
      <circle cx="792" cy="352" r="3" fill="#fff" opacity=".5"/>
    </g>`;
}

function mortificationOfSin(accent) {
  return `
    <g transform="translate(0 24)">
      <rect x="284" y="268" width="456" height="462" rx="26" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
      <path d="M512 312v360M418 446h188" stroke="${accent}" stroke-width="16" stroke-linecap="round" opacity=".78"/>
      <path d="M340 742c108-48 172-42 172 14v104c-62-42-112-46-172-12Z" fill="#f1e4c8" opacity=".92"/>
      <path d="M684 742c-108-48-172-42-172 14v104c62-42 112-46 172-12Z" fill="#dfc99e" opacity=".92"/>
      <path d="M512 756v104M392 792h76M556 792h76" stroke="#5c3c22" stroke-width="6" opacity=".58"/>
      <path d="M700 300c-70 64-104 142-98 234 76-52 112-130 98-234Z" fill="${accent}" opacity=".46"/>
      <path d="M324 292c88 64 122 152 98 264-76-60-112-142-98-264Z" fill="#090706" opacity=".36"/>
      <path d="M286 870c112-42 340-42 452 0" stroke="#000" stroke-opacity=".28" stroke-width="22" stroke-linecap="round"/>
    </g>`;
}

function bondageOfTheWill(accent) {
  return `
    <g transform="translate(0 24)">
      <rect x="260" y="292" width="504" height="448" rx="28" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M348 502c60-72 164-72 224 0M452 600c60 72 164 72 224 0" fill="none" stroke="#090706" stroke-width="42" stroke-linecap="round" opacity=".72"/>
      <path d="M368 504c58-52 142-52 200 0M472 598c58 52 142 52 200 0" fill="none" stroke="${accent}" stroke-width="15" stroke-linecap="round" opacity=".76"/>
      <path d="M344 752c88-42 140-38 168 8v116c-58-38-112-44-168-12Z" fill="#f1e7d3"/>
      <path d="M680 752c-88-42-140-38-168 8v116c58-38 112-44 168-12Z" fill="#ddc89e"/>
      <path d="M512 760v116M390 800h78M556 800h78" stroke="#604421" stroke-width="5" opacity=".62"/>
      <path d="M512 342v160M446 420h132" stroke="#f7e4aa" stroke-width="11" stroke-linecap="round" opacity=".52"/>
    </g>`;
}

function religiousAffections(accent) {
  return `
    <g transform="translate(0 22)">
      <path d="M512 302c-78-82-202 4-100 124l100 100 100-100c102-120-22-206-100-124Z" fill="${accent}" opacity=".78"/>
      <path d="M512 512v182M436 604h152" stroke="#fff4ce" stroke-width="13" stroke-linecap="round" opacity=".45"/>
      <rect x="292" y="624" width="440" height="160" rx="26" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".38" stroke-width="5"/>
      <path d="M356 692h312M386 738h252" stroke="#f8e5b7" stroke-opacity=".2" stroke-width="12" stroke-linecap="round"/>
      <circle cx="348" cy="396" r="74" fill="none" stroke="${accent}" stroke-opacity=".24" stroke-width="8"/>
      <circle cx="676" cy="396" r="74" fill="none" stroke="${accent}" stroke-opacity=".24" stroke-width="8"/>
      <path d="M310 842c108-40 296-40 404 0" stroke="#000" stroke-opacity=".28" stroke-width="22" stroke-linecap="round"/>
    </g>`;
}

function deathOfDeath(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M512 284v360M406 424h212" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".82"/>
      <path d="M270 710c132-132 352-132 484 0" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="38" stroke-linecap="round"/>
      <path d="M340 730h344l-58 102H398Z" fill="rgba(0,0,0,.4)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
      <path d="M392 732c20-70 220-70 240 0" fill="none" stroke="${accent}" stroke-width="13" stroke-linecap="round" opacity=".56"/>
      <path d="M352 320c66 70 82 144 48 222-70-62-86-138-48-222Z" fill="#090706" opacity=".36"/>
      <path d="M672 320c-66 70-82 144-48 222 70-62 86-138 48-222Z" fill="${accent}" opacity=".38"/>
      <path d="M512 644c-46 56-46 108 0 156 46-48 46-100 0-156Z" fill="${accent}" opacity=".58"/>
    </g>`;
}

function bodyOfDivinity(accent) {
  return `
    <g transform="translate(0 20)">
      <path d="M242 766h540V644H242Z" fill="rgba(0,0,0,.32)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M318 644V380M512 644V342M706 644V380" stroke="#f7e4aa" stroke-opacity=".26" stroke-width="34" stroke-linecap="round"/>
      <path d="M286 374h452M274 334h476M260 296h504" stroke="${accent}" stroke-opacity=".5" stroke-width="12" stroke-linecap="round"/>
      <rect x="364" y="452" width="296" height="236" rx="18" fill="#ead9b8" opacity=".93"/>
      <text x="512" y="565" fill="${accent}" font-family="Georgia, serif" font-size="86" font-weight="900" text-anchor="middle">Q</text>
      <text x="512" y="642" fill="#5b3b24" opacity=".72" font-family="Georgia, serif" font-size="70" font-weight="900" text-anchor="middle">A</text>
      <path d="M318 794h388" stroke="${accent}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
    </g>`;
}

function freedomOfTheWill(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M512 292v372" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".72"/>
      <path d="M344 424h336" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
      <path d="M344 424 268 610h152Z" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".5" stroke-width="5"/>
      <path d="M680 424 604 610h152Z" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".5" stroke-width="5"/>
      <path d="M268 610h152M604 610h152" stroke="#fff4ce" stroke-opacity=".32" stroke-width="10" stroke-linecap="round"/>
      <path d="M512 646c-52-54-132 4-64 82l64 64 64-64c68-78-12-136-64-82Z" fill="${accent}" opacity=".66"/>
      <path d="M320 830h384" stroke="#000" stroke-opacity=".28" stroke-width="22" stroke-linecap="round"/>
    </g>`;
}

function romansCommentary(accent) {
  return `
    <g transform="translate(0 20)">
      <rect x="250" y="286" width="524" height="468" rx="26" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M322 754V428c0-88 60-148 140-148s140 60 140 148v326" fill="rgba(0,0,0,.22)"/>
      <path d="M604 754V428c0-72 50-122 116-122 22 0 42 5 60 16" fill="none" stroke="${accent}" stroke-opacity=".26" stroke-width="18" stroke-linecap="round"/>
      <path d="M386 588c86-42 126-38 126 10v112c-48-34-88-38-126-10Z" fill="#f0e4c8"/>
      <path d="M638 588c-86-42-126-38-126 10v112c48-34 88-38 126-10Z" fill="#dfc99e"/>
      <path d="M512 596v112M420 634h58M548 634h58" stroke="#5b3b24" stroke-width="5" opacity=".6"/>
      <text x="512" y="442" fill="${accent}" font-family="Georgia, serif" font-size="92" font-weight="900" text-anchor="middle">ROM</text>
      <path d="M320 800h384" stroke="${accent}" stroke-opacity=".34" stroke-width="10" stroke-linecap="round"/>
    </g>`;
}

function fourfoldState(accent) {
  return `
    <g transform="translate(0 22)">
      <rect x="228" y="292" width="568" height="448" rx="28" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M512 292v448M228 516h568" stroke="${accent}" stroke-opacity=".28" stroke-width="7"/>
      <circle cx="370" cy="404" r="64" fill="${accent}" opacity=".5"/>
      <path d="M626 360c60 54 68 118 24 184-58-46-66-112-24-184Z" fill="#090706" opacity=".38"/>
      <path d="M370 640v-88M326 596h88" stroke="#fff4ce" stroke-width="13" stroke-linecap="round" opacity=".56"/>
      <path d="M610 668c70-72 122-98 164-78-52 82-104 116-164 78Z" fill="${accent}" opacity=".42"/>
      <path d="M300 808h424" stroke="#000" stroke-opacity=".28" stroke-width="22" stroke-linecap="round"/>
    </g>`;
}

function practicalReligion(accent) {
  return `
    <g transform="translate(0 22)">
      <path d="M250 780c82-132 174-214 262-214s180 82 262 214Z" fill="rgba(0,0,0,.32)"/>
      <path d="M512 308v270" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".72"/>
      <path d="M430 472h164" stroke="${accent}" stroke-width="13" stroke-linecap="round"/>
      <path d="M512 324c-42 54-42 106 0 156 42-50 42-102 0-156Z" fill="${accent}" opacity=".64"/>
      <rect x="376" y="582" width="272" height="154" rx="22" fill="#ead9b8" opacity=".9"/>
      <path d="M420 634h184M420 680h144" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".62"/>
      <path d="M316 826h392" stroke="${accent}" stroke-opacity=".34" stroke-width="10" stroke-linecap="round"/>
    </g>`;
}

function knotsUntied(accent) {
  return `
    <g transform="translate(0 24)">
      <rect x="256" y="314" width="512" height="410" rx="32" fill="rgba(255,255,255,.07)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M306 538c86-130 198-130 254 0 50 116 158 112 224-16" fill="none" stroke="#0a0708" stroke-width="42" stroke-linecap="round"/>
      <path d="M306 538c86-130 198-130 254 0 50 116 158 112 224-16" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>
      <path d="M372 426c88 78 194 78 282 0" fill="none" stroke="#f6e3ad" stroke-opacity=".48" stroke-width="13" stroke-linecap="round"/>
      <path d="M344 766c88-42 140-38 168 8v104c-58-38-112-44-168-12Z" fill="#f1e7d3"/>
      <path d="M680 766c-88-42-140-38-168 8v104c58-38 112-44 168-12Z" fill="#ddc89e"/>
      <path d="M512 774v104" stroke="#5b3b24" stroke-width="5" opacity=".6"/>
    </g>`;
}

function thoughtsForYoungMen(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M216 766c90-152 194-232 296-232s206 80 296 232Z" fill="rgba(0,0,0,.34)"/>
      <circle cx="512" cy="466" r="138" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".46" stroke-width="6"/>
      <path d="M512 338v256M384 466h256" stroke="${accent}" stroke-opacity=".24" stroke-width="7"/>
      <path d="M512 466 604 384" stroke="${accent}" stroke-width="15" stroke-linecap="round"/>
      <path d="M512 466 452 548" stroke="#fff4ce" stroke-opacity=".52" stroke-width="12" stroke-linecap="round"/>
      <circle cx="512" cy="466" r="22" fill="${accent}" opacity=".82"/>
      <path d="M344 812h336" stroke="${accent}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
      <path d="M512 244c-44 70-44 116 0 178 44-62 44-108 0-178Z" fill="${accent}" opacity=".34"/>
    </g>`;
}

function dutiesOfParents(accent) {
  return `
    <g transform="translate(0 24)">
      <path d="M232 496 512 284l280 212v302H232Z" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
      <path d="M512 284 190 530M512 284l322 246" stroke="${accent}" stroke-width="11" opacity=".4"/>
      <rect x="436" y="592" width="152" height="186" rx="14" fill="#130d08" stroke="${accent}" stroke-opacity=".4" stroke-width="5"/>
      <circle cx="448" cy="540" r="30" fill="#d2a37a"/>
      <circle cx="576" cy="540" r="30" fill="#d2a37a"/>
      <circle cx="512" cy="610" r="24" fill="#d2a37a"/>
      <path d="M386 638c56-64 196-64 252 0" fill="none" stroke="${accent}" stroke-width="14" stroke-linecap="round" opacity=".62"/>
      <rect x="310" y="710" width="404" height="74" rx="16" fill="#ead9b8" opacity=".9"/>
      <path d="M356 748h312" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".62"/>
    </g>`;
}

await fs.mkdir(OUT_DIR, { recursive: true });

const portraitImages = await loadPortraitImages();

for (const book of books) {
  const svg = baseSvg(book, book.art, portraitImages);
  const out = path.join(OUT_DIR, `${book.slug}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, quality: 95 }).toFile(out);
  console.log(`wrote ${path.relative(process.cwd(), out)}`);
}
