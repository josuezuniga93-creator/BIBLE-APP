import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/covers/documents");
const WIDTH = 1024;
const HEIGHT = 1536;

const documents = [
  doc("jerusalem-council", "The Jerusalem Council", "AD 49", "Jerusalem - Acts 15", "Apostolic Council", ["#071617", "#17433f", "#d9b65d"], "jerusalem"),
  doc("apostles-creed", "The Apostles' Creed", "c. AD 140", "Rome - Baptismal Symbol", "Early Creed", ["#09121f", "#223f5d", "#d7bf78"], "creed"),
  doc("council-nicaea", "Council of Nicaea", "AD 325", "Nicaea - Constantine", "Ecumenical Council", ["#120d08", "#4c3217", "#dfb45f"], "council"),
  doc("nicene-creed", "The Nicene Creed", "AD 381", "Constantinople", "Orthodox Creed", ["#071611", "#244f39", "#d7c376"], "creed"),
  doc("athanasian-creed", "Athanasian Creed", "c. AD 500", "Western Church", "Trinitarian Creed", ["#10091f", "#3a285f", "#c9b0ff"], "trinity"),
  doc("council-chalcedon", "Council of Chalcedon", "AD 451", "Chalcedon", "Christological Council", ["#0b0e1b", "#2f365d", "#d7aa71"], "chalcedon"),
  doc("augustine-grace", "Augustine on Grace & Election", "AD 397", "Hippo - North Africa", "Doctor of Grace", ["#130c08", "#55291b", "#e2ad66"], "augustine"),
  doc("council-carthage", "Council of Carthage", "AD 418", "North Africa", "Against Pelagius", ["#091415", "#254641", "#d6a85c"], "african-council"),
  doc("council-orange", "Second Council of Orange", "AD 529", "Orange - Gaul", "Grace Council", ["#150d06", "#5b3515", "#efa84f"], "orange"),
  doc("wycliffe", "Wycliffe & the Pre-Reformation", "1378", "Oxford - England", "Morning Star", ["#11100b", "#463b22", "#dfc06f"], "translator"),
  doc("jan-hus", "Jan Hus - Martyr of Bohemia", "1415", "Constance", "Pre-Reformation Martyr", ["#150807", "#5c1f17", "#ee9d55"], "martyr"),
  doc("gutenberg", "Gutenberg Bible & the Printing Press", "1455", "Mainz - Germany", "Printing Revolution", ["#071018", "#1e3e57", "#d8b86e"], "press"),
  doc("95theses", "The 95 Theses", "1517", "Wittenberg - Germany", "Reformation Spark", ["#120c06", "#4d2c14", "#e5bd62"], "door"),
  doc("diet-of-worms", "Diet of Worms", "1521", "Worms - Germany", "Here I Stand", ["#100907", "#58251a", "#e3a456"], "trial"),
  doc("tyndale", "Tyndale's New Testament", "1526", "Worms - Germany", "English New Testament", ["#06151c", "#21415b", "#d8b46b"], "desk"),
  doc("calvins-institutes", "Calvin's Institutes of the Christian Religion", "1536", "Basel - Switzerland", "Reformed Theology", ["#07101c", "#17365e", "#cdb66d"], "library"),
  doc("augsburg-confession", "Augsburg Confession", "1530", "Augsburg - Germany", "Lutheran Confession", ["#120d07", "#4c321b", "#dfb45e"], "confession"),
  doc("smalcald-articles", "Smalcald Articles", "1537", "Wittenberg - Germany", "Luther's Testament", ["#170806", "#5a2117", "#efaa57"], "articles"),
  doc("geneva-bible", "The Geneva Bible", "1560", "Geneva - Switzerland", "Bible of the Exiles", ["#071510", "#254d35", "#d5be70"], "bible"),
  doc("belgic-confession", "Belgic Confession", "1561", "Southern Netherlands", "Confession Under Fire", ["#071516", "#245251", "#d8b86e"], "persecution"),
  doc("heidelberg", "Heidelberg Catechism", "1563", "Heidelberg - Germany", "Comfort Catechism", ["#0a160f", "#2b5738", "#d7c47b"], "catechism"),
  doc("thirty-nine-articles", "Thirty-Nine Articles", "1563", "Church of England", "Anglican Articles", ["#091220", "#253f62", "#d9bd72"], "articles"),
  doc("canons-of-dort", "Canons of Dort", "1619", "Dordrecht - Netherlands", "Synod of Dort", ["#140b07", "#4d271b", "#e2ad66"], "dort"),
  doc("king-james-bible", "King James Bible", "1611", "London - England", "Authorized Version", ["#100b08", "#49301d", "#e0bd68"], "translators"),
  doc("five-solas", "The Five Solas of the Reformation", "1517", "Protestant Reformers", "Reformation Principles", ["#0d0a18", "#34205a", "#d0b1ff"], "solas"),
  doc("first-london-baptist", "First London Baptist Confession", "1644", "London - England", "Particular Baptist", ["#071516", "#24514d", "#d9bd72"], "baptist"),
  doc("westminster-confession", "Westminster Confession of Faith", "1646", "Westminster Assembly", "Reformed Confession", ["#0a0d19", "#2e315a", "#d9b56d"], "westminster"),
  doc("westminster-shorter", "Westminster Shorter Catechism", "1647", "Westminster Assembly", "107 Questions", ["#08111d", "#253d5f", "#d9bd72"], "catechism"),
  doc("westminster-larger", "Westminster Larger Catechism", "1648", "Westminster Assembly", "196 Questions", ["#0b0b1e", "#34265c", "#d3b0f0"], "catechism"),
  doc("1689-lbc", "Second London Baptist Confession of Faith", "1689", "London - England", "Reformed Baptist", ["#120d07", "#4c341a", "#e2bd65"], "baptist"),
  doc("sinners-in-hands", "Sinners in the Hands of an Angry God", "1741", "Enfield - Connecticut", "Great Awakening Sermon", ["#140808", "#5b1e18", "#f0a04e"], "sermon"),
  doc("monergism-debate", "Monergism vs. Synergism", "1525", "Augustine to Dort", "Doctrine of Grace", ["#100914", "#4a223f", "#d7a3dc"], "debate"),
];

function doc(id, title, year, origin, label, colors, scene) {
  return { id, title, year, origin, label, colors, scene };
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapWords(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
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

function textBlock(text, x, y, maxChars, size, color, weight = 900, anchor = "middle", lineHeight = 1.08, family = "Georgia, 'Times New Roman', serif") {
  const tspans = wrapWords(text, maxChars)
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lineHeight}">${esc(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}">${tspans}</text>`;
}

function smallCaps(text, x, y, color, size = 25, anchor = "middle", opacity = 1) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" opacity="${opacity}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="900" letter-spacing="6">${esc(text.toUpperCase())}</text>`;
}

function titleLayout(title) {
  if (title.length > 54) return { maxChars: 17, size: 48, y: 974, lineHeight: 1.03 };
  if (title.length > 40) return { maxChars: 17, size: 55, y: 984, lineHeight: 1.04 };
  if (title.length > 28) return { maxChars: 15, size: 65, y: 1000, lineHeight: 1.05 };
  return { maxChars: 13, size: 79, y: 1012, lineHeight: 1.04 };
}

function baseSvg(item) {
  const [from, to, accent] = item.colors;
  const layout = titleLayout(item.title);
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="bg-${item.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset=".56" stop-color="${to}"/>
        <stop offset="1" stop-color="#030303"/>
      </linearGradient>
      <radialGradient id="halo-${item.id}" cx=".46" cy=".2" r=".76">
        <stop offset="0" stop-color="${accent}" stop-opacity=".34"/>
        <stop offset=".52" stop-color="${accent}" stop-opacity=".08"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="panel-${item.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff8dd" stop-opacity=".18"/>
        <stop offset=".45" stop-color="#000000" stop-opacity=".02"/>
        <stop offset="1" stop-color="#000000" stop-opacity=".45"/>
      </linearGradient>
      <pattern id="grain-${item.id}" width="86" height="86" patternUnits="userSpaceOnUse">
        <circle cx="14" cy="21" r="1.2" fill="#fff" opacity=".07"/>
        <circle cx="62" cy="17" r="1" fill="#fff" opacity=".05"/>
        <circle cx="38" cy="68" r="1.2" fill="#000" opacity=".12"/>
        <circle cx="78" cy="72" r="1" fill="#fff" opacity=".04"/>
      </pattern>
      <filter id="softShadow-${item.id}" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#000000" flood-opacity=".42"/>
      </filter>
    </defs>
    <rect width="1024" height="1536" fill="url(#bg-${item.id})"/>
    <rect width="1024" height="1536" fill="url(#halo-${item.id})"/>
    <rect width="1024" height="1536" fill="url(#grain-${item.id})" opacity=".62"/>
    ${outerFrame(accent)}
    ${topIdentity(item, accent)}
    ${artPanel(item, accent)}
    <g filter="url(#softShadow-${item.id})">
      <rect x="88" y="870" width="848" height="424" rx="46" fill="rgba(7,6,5,.67)" stroke="${accent}" stroke-opacity=".58" stroke-width="3"/>
      <path d="M150 930h724M150 1204h724" stroke="${accent}" stroke-opacity=".24" stroke-width="2"/>
      ${textBlock(item.title, 512, layout.y, layout.maxChars, layout.size, "#fff8ea", 900, "middle", layout.lineHeight)}
      <path d="M372 1218h280" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity=".72"/>
      ${smallCaps(item.origin, 512, 1264, accent, 22)}
    </g>
    <text x="512" y="1370" text-anchor="middle" fill="rgba(255,250,230,.46)" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="900" letter-spacing="5">HISTORICAL DOCUMENTS</text>
    <path d="M392 1332h240" stroke="rgba(255,250,230,.18)" stroke-width="2" stroke-linecap="round"/>
    <path d="M478 1418h68l-34-48Z" fill="none" stroke="${accent}" stroke-opacity=".62" stroke-width="3" stroke-linejoin="round"/>
  </svg>`;
}

function outerFrame(accent) {
  return `
    <rect x="48" y="48" width="928" height="1440" rx="54" fill="none" stroke="${accent}" stroke-opacity=".66" stroke-width="3"/>
    <rect x="78" y="78" width="868" height="1380" rx="38" fill="none" stroke="#fff4c7" stroke-opacity=".12" stroke-width="2"/>
    <path d="M126 132h112M786 132h112M126 1404h112M786 1404h112" stroke="${accent}" stroke-opacity=".48" stroke-width="4" stroke-linecap="round"/>
    <circle cx="512" cy="164" r="6" fill="${accent}" opacity=".45"/>
    <circle cx="512" cy="1404" r="7" fill="${accent}" opacity=".65"/>
  `;
}

function topIdentity(item, accent) {
  return `
    <g transform="translate(102 104)">
      <rect x="0" y="0" width="152" height="54" rx="27" fill="rgba(0,0,0,.24)" stroke="${accent}" stroke-opacity=".48"/>
      <text x="76" y="35" text-anchor="middle" fill="${accent}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="4">TULIP</text>
    </g>
    ${smallCaps(item.label, 512, 134, accent, 23)}
    <text x="842" y="139" text-anchor="middle" fill="rgba(255,250,230,.68)" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="900" letter-spacing="3">${esc(item.year.toUpperCase())}</text>
  `;
}

function artPanel(item, accent) {
  return `
    <g filter="url(#softShadow-${item.id})">
      <rect x="90" y="188" width="844" height="628" rx="56" fill="rgba(5,4,4,.32)" stroke="${accent}" stroke-opacity=".42" stroke-width="3"/>
      <clipPath id="artClip-${item.id}">
        <rect x="112" y="210" width="800" height="584" rx="42"/>
      </clipPath>
      <g clip-path="url(#artClip-${item.id})">
        <rect x="112" y="210" width="800" height="584" fill="rgba(255,255,255,.05)"/>
        <circle cx="280" cy="330" r="220" fill="${accent}" opacity=".12"/>
        <circle cx="690" cy="690" r="280" fill="#000" opacity=".18"/>
        ${renderScene(item.scene, accent)}
        <rect x="112" y="210" width="800" height="584" fill="url(#panel-${item.id})"/>
      </g>
      <rect x="112" y="210" width="800" height="584" rx="42" fill="none" stroke="#fff4ce" stroke-opacity=".12" stroke-width="2"/>
    </g>
  `;
}

function renderScene(scene, accent) {
  switch (scene) {
    case "jerusalem": return councilScene(accent, { city: true, center: "scroll", halos: true });
    case "council": return councilScene(accent, { throne: true, center: "cross" });
    case "chalcedon": return councilScene(accent, { center: "dual-candles", columns: true });
    case "african-council": return councilScene(accent, { center: "canon", palms: true });
    case "orange": return councilScene(accent, { center: "grace-hand", columns: true });
    case "creed": return manuscriptScene(accent, { cross: true, seal: true });
    case "trinity": return trinityScene(accent);
    case "augustine": return scholarScene(accent, { mitre: true, heart: true });
    case "translator": return scholarScene(accent, { quill: true, bible: true });
    case "martyr": return martyrScene(accent);
    case "press": return pressScene(accent);
    case "door": return doorScene(accent);
    case "trial": return trialScene(accent);
    case "desk": return scholarScene(accent, { quill: true, greek: true });
    case "library": return libraryScene(accent);
    case "confession": return confessionScene(accent, { table: true });
    case "articles": return articlesScene(accent);
    case "bible": return openBibleScene(accent, { city: true });
    case "persecution": return persecutionScene(accent);
    case "catechism": return catechismScene(accent);
    case "dort": return dortScene(accent);
    case "translators": return translatorsScene(accent);
    case "solas": return solasScene(accent);
    case "baptist": return baptistScene(accent);
    case "westminster": return westminsterScene(accent);
    case "sermon": return sermonScene(accent);
    case "debate": return debateScene(accent);
    default: return manuscriptScene(accent, { cross: true });
  }
}

function floorAndBackdrop(accent) {
  return `
    <path d="M112 684c160-72 640-72 800 0v110H112Z" fill="rgba(0,0,0,.26)"/>
    <path d="M140 700h744" stroke="${accent}" stroke-opacity=".24" stroke-width="5"/>
    <path d="M164 628c126-58 570-58 696 0" stroke="#fff5cc" stroke-opacity=".08" stroke-width="22" stroke-linecap="round"/>
  `;
}

function figure(x, y, scale, robe, accent, pose = "standing") {
  const seated = pose === "seated";
  const bodyTop = seated ? 28 : 34;
  const bodyHeight = seated ? 96 : 138;
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="0" cy="${seated ? 142 : 182}" rx="42" ry="14" fill="#000" opacity=".22"/>
      <path d="M-${bodyTop} 62c12-46 56-46 68 0l18 ${bodyHeight}h-${bodyTop * 2 + 36}Z" fill="${robe}" opacity=".94"/>
      <path d="M-${bodyTop} 82c18 22 50 22 68 0" stroke="${accent}" stroke-opacity=".38" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="0" cy="26" rx="24" ry="30" fill="#c99a73"/>
      <path d="M-21 8c10-16 32-18 45-3" stroke="#2b1d15" stroke-width="13" stroke-linecap="round"/>
      <path d="M-15 26h2M15 26h2" stroke="#1a100d" stroke-width="5" stroke-linecap="round"/>
      <path d="M-30 94c-28 18-44 34-58 54M30 94c28 18 44 34 58 54" stroke="${robe}" stroke-width="18" stroke-linecap="round"/>
    </g>
  `;
}

function councilScene(accent, opts = {}) {
  const rows = [
    figure(248, 454, 1.08, "#4b2418", accent, "seated"),
    figure(374, 438, 1.16, "#233d4d", accent, "seated"),
    figure(650, 438, 1.16, "#3d2f55", accent, "seated"),
    figure(776, 454, 1.08, "#4c361f", accent, "seated"),
    figure(304, 576, 1, "#2b4636", accent, "seated"),
    figure(720, 576, 1, "#52261f", accent, "seated"),
  ].join("");
  return `
    ${opts.city ? cityBackdrop(accent) : apseBackdrop(accent, opts.columns)}
    ${opts.palms ? palms(accent) : ""}
    ${rows}
    ${opts.throne ? `<path d="M455 396h114v178H455Z" fill="rgba(0,0,0,.28)" stroke="${accent}" stroke-opacity=".55" stroke-width="5"/><path d="M440 390h144l-24-54h-96Z" fill="${accent}" opacity=".5"/>` : ""}
    ${centerCouncilObject(accent, opts.center)}
    ${floorAndBackdrop(accent)}
  `;
}

function centerCouncilObject(accent, kind = "scroll") {
  if (kind === "cross") {
    return `<path d="M512 330v260M426 432h172" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".86"/><circle cx="512" cy="452" r="116" fill="none" stroke="${accent}" stroke-opacity=".18" stroke-width="9"/>`;
  }
  if (kind === "dual-candles") {
    return `<path d="M470 352v220M554 352v220" stroke="${accent}" stroke-width="14" stroke-linecap="round"/><path d="M470 326c-22 28 2 48 0 0ZM554 326c-22 28 2 48 0 0Z" fill="${accent}" opacity=".86"/><path d="M420 598h184" stroke="#fff4cf" stroke-opacity=".34" stroke-width="10" stroke-linecap="round"/>`;
  }
  if (kind === "canon") {
    return `<rect x="424" y="386" width="176" height="230" rx="16" fill="#eadab8" opacity=".92"/><path d="M456 436h112M456 478h112M456 520h92" stroke="#5b3d25" stroke-width="9" stroke-linecap="round"/><circle cx="512" cy="590" r="24" fill="${accent}" opacity=".72"/>`;
  }
  if (kind === "grace-hand") {
    return `<path d="M398 426c84-70 144-70 228 0" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" opacity=".78"/><path d="M454 508c42 42 74 42 116 0" fill="none" stroke="#fff4cf" stroke-width="15" stroke-linecap="round" opacity=".62"/><path d="M512 344v228" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity=".48"/>`;
  }
  return `<path d="M370 526c92-44 142-40 142 12v112c-54-36-98-40-142-10Z" fill="#f0e3c5"/><path d="M654 526c-92-44-142-40-142 12v112c54-36 98-40 142-10Z" fill="#e0c99f"/><path d="M512 538v112M404 570h76M544 570h76M404 610h62M544 610h62" stroke="#5d3c21" stroke-width="5" opacity=".62"/>`;
}

function apseBackdrop(accent, columns = false) {
  return `
    <path d="M190 788V444c0-170 142-276 322-276s322 106 322 276v344Z" fill="rgba(255,255,255,.07)" stroke="${accent}" stroke-opacity=".24" stroke-width="5"/>
    <path d="M266 788V460c0-118 102-196 246-196s246 78 246 196v328Z" fill="rgba(0,0,0,.18)"/>
    <path d="M512 264v482M318 452h388" stroke="${accent}" stroke-opacity=".16" stroke-width="8"/>
    ${columns ? `<path d="M252 344v372M772 344v372" stroke="#fff5cc" stroke-opacity=".16" stroke-width="26" stroke-linecap="round"/><path d="M224 334h84M744 334h84" stroke="${accent}" stroke-opacity=".38" stroke-width="12" stroke-linecap="round"/>` : ""}
  `;
}

function cityBackdrop(accent) {
  return `
    <path d="M142 516h740v230H142Z" fill="rgba(0,0,0,.18)"/>
    <path d="M184 516v-92h88v92M318 516v-132h98v132M472 516v-184h82v184M622 516v-116h104v116M770 516v-146h74v146" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".18" stroke-width="5"/>
    <path d="M156 516h712" stroke="${accent}" stroke-opacity=".36" stroke-width="7"/>
  `;
}

function palms(accent) {
  return `<path d="M184 382c-28 80-28 170 0 270M840 382c28 80 28 170 0 270" stroke="${accent}" stroke-opacity=".24" stroke-width="13" stroke-linecap="round"/><path d="M174 384c-50-32-64-70-42-116 44 24 62 62 42 116ZM850 384c50-32 64-70 42-116-44 24-62 62-42 116Z" fill="${accent}" opacity=".24"/>`;
}

function manuscriptScene(accent, opts = {}) {
  return `
    <rect x="278" y="270" width="468" height="468" rx="26" fill="#ead9b8" opacity=".92" stroke="${accent}" stroke-opacity=".45" stroke-width="5"/>
    <path d="M330 354h360M330 410h336M330 466h360M330 522h310M330 578h348M330 634h260" stroke="#5b3b24" stroke-width="9" stroke-linecap="round" opacity=".55"/>
    ${opts.cross ? `<path d="M512 312v118M462 370h100" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".78"/>` : ""}
    ${opts.seal ? `<circle cx="644" cy="650" r="46" fill="${accent}" opacity=".74"/><path d="M626 650h36M644 632v36" stroke="#24150e" stroke-width="7" stroke-linecap="round" opacity=".5"/>` : ""}
    <path d="M256 744c96-36 416-36 512 0" stroke="#000" stroke-opacity=".22" stroke-width="22" stroke-linecap="round"/>
  `;
}

function trinityScene(accent) {
  return `
    ${apseBackdrop(accent, true)}
    <circle cx="512" cy="456" r="178" fill="none" stroke="${accent}" stroke-width="9" opacity=".56"/>
    <circle cx="512" cy="328" r="82" fill="rgba(255,255,255,.09)" stroke="${accent}" stroke-width="6"/>
    <circle cx="402" cy="548" r="82" fill="rgba(255,255,255,.09)" stroke="${accent}" stroke-width="6"/>
    <circle cx="622" cy="548" r="82" fill="rgba(255,255,255,.09)" stroke="${accent}" stroke-width="6"/>
    <path d="M512 410 440 500M512 410l72 90M482 548h60" stroke="${accent}" stroke-width="8" opacity=".62"/>
    <path d="M512 286v84M470 328h84" stroke="#fff4cf" stroke-width="9" stroke-linecap="round" opacity=".74"/>
    ${floorAndBackdrop(accent)}
  `;
}

function scholarScene(accent, opts = {}) {
  return `
    <rect x="176" y="570" width="672" height="150" rx="22" fill="rgba(0,0,0,.36)" stroke="${accent}" stroke-opacity=".32" stroke-width="5"/>
    <path d="M230 570c80-96 132-140 258-146 130-6 220 38 306 146Z" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".24" stroke-width="4"/>
    ${figure(386, 382, 1.4, "#3d2f25", accent)}
    <rect x="492" y="444" width="260" height="178" rx="18" fill="#ead9b8" opacity=".92"/>
    <path d="M528 494h176M528 536h160M528 578h120" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".6"/>
    ${opts.quill ? `<path d="M700 438c70-84 124-126 168-128-24 56-78 112-158 150Z" fill="${accent}" opacity=".72"/><path d="M688 456 562 606" stroke="#f8e5b7" stroke-width="8" stroke-linecap="round" opacity=".62"/>` : ""}
    ${opts.heart ? `<path d="M694 354c-40-44-108 2-52 66l52 52 52-52c56-64-12-110-52-66Z" fill="${accent}" opacity=".78"/>` : ""}
    ${opts.bible ? `<path d="M496 674c76-34 118-30 118 8v78c-44-26-80-30-118-8Z" fill="#f1e5c8"/><path d="M728 674c-76-34-118-30-118 8v78c44-26 80-30 118-8Z" fill="#e3cda2"/>` : ""}
    ${opts.greek ? `${smallCaps("GREEK NEW TESTAMENT", 610, 692, accent, 19)}<text x="610" y="736" fill="#5b3b24" font-family="Georgia, serif" font-size="32" font-weight="900" text-anchor="middle">ENGLISH</text>` : ""}
    ${floorAndBackdrop(accent)}
  `;
}

function martyrScene(accent) {
  return `
    <path d="M112 210h800v584H112Z" fill="rgba(0,0,0,.18)"/>
    <path d="M318 720c-84-120-58-214 22-282-10 82 46 110 34 198 58-52 64-118 32-184 126 116 120 220 40 300Z" fill="${accent}" opacity=".55"/>
    <path d="M588 736c70-84 62-170 0-250 90 50 156 132 118 250Z" fill="#f4c46b" opacity=".38"/>
    ${figure(512, 444, 1.34, "#2f2b25", accent)}
    <path d="M512 324v364" stroke="#5a3a20" stroke-width="16" stroke-linecap="round"/>
    <path d="M426 436h172" stroke="#5a3a20" stroke-width="12" stroke-linecap="round"/>
    ${cityBackdrop(accent)}
    ${floorAndBackdrop(accent)}
  `;
}

function pressScene(accent) {
  return `
    <rect x="222" y="300" width="580" height="428" rx="24" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
    <path d="M302 360h420M350 360v300M674 360v300M302 660h420" stroke="#16100c" stroke-width="26" stroke-linecap="round"/>
    <path d="M386 438h252v112H386Z" fill="#ead9b8" opacity=".94"/>
    <path d="M420 476h184M420 512h160" stroke="#5b3b24" stroke-width="7" stroke-linecap="round" opacity=".56"/>
    <path d="M512 276v170M448 276h128" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
    <path d="M268 740h488" stroke="${accent}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
  `;
}

function doorScene(accent) {
  return `
    <path d="M286 248h452v540H286Z" fill="#2a170e" stroke="${accent}" stroke-opacity=".44" stroke-width="6"/>
    <path d="M512 248v540M328 306h140M556 306h140M328 512h140M556 512h140" stroke="${accent}" stroke-opacity=".22" stroke-width="7"/>
    <rect x="388" y="306" width="248" height="362" rx="8" fill="#ead9b8" opacity=".96"/>
    ${Array.from({ length: 11 }, (_, i) => `<path d="M426 ${354 + i * 24}h172" stroke="#5b3b24" stroke-width="6" stroke-linecap="round" opacity=".62"/>`).join("")}
    <circle cx="680" cy="532" r="18" fill="${accent}" opacity=".76"/>
    <path d="M292 788h440" stroke="#000" stroke-opacity=".24" stroke-width="22" stroke-linecap="round"/>
  `;
}

function trialScene(accent) {
  return `
    ${apseBackdrop(accent, true)}
    <rect x="434" y="320" width="156" height="126" rx="18" fill="rgba(0,0,0,.3)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
    <path d="M452 318h120l-22-46h-76Z" fill="${accent}" opacity=".5"/>
    ${figure(512, 288, 1, "#4c2b1a", accent, "seated")}
    ${figure(298, 498, 1.28, "#322a21", accent)}
    ${figure(714, 500, 1.22, "#51251d", accent)}
    <rect x="420" y="602" width="184" height="92" rx="14" fill="#ead9b8" opacity=".92"/>
    <path d="M454 638h116M454 668h94" stroke="#5b3b24" stroke-width="7" stroke-linecap="round"/>
    ${floorAndBackdrop(accent)}
  `;
}

function libraryScene(accent) {
  return `
    <rect x="184" y="260" width="656" height="458" rx="22" fill="rgba(0,0,0,.34)" stroke="${accent}" stroke-opacity=".38" stroke-width="5"/>
    ${bookshelf(230, 318, accent)}
    ${bookshelf(510, 318, accent)}
    <path d="M282 728h460" stroke="${accent}" stroke-width="11" stroke-linecap="round" opacity=".42"/>
    <path d="M372 240h280l-38-50H410Z" fill="${accent}" opacity=".48"/>
  `;
}

function bookshelf(x, y, accent) {
  return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="232" height="330" rx="12" fill="rgba(255,255,255,.06)"/>
      <path d="M20 96h192M20 202h192M20 306h192" stroke="${accent}" stroke-opacity=".25" stroke-width="6"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const bx = 28 + (i % 6) * 30;
        const by = i < 6 ? 28 : 132;
        const h = 52 + (i % 3) * 16;
        return `<rect x="${bx}" y="${by}" width="20" height="${h}" rx="3" fill="${i % 2 ? accent : "#f2dfb8"}" opacity="${i % 2 ? ".68" : ".52"}"/>`;
      }).join("")}
    </g>
  `;
}

function confessionScene(accent) {
  return `
    ${apseBackdrop(accent, false)}
    <rect x="256" y="566" width="512" height="134" rx="20" fill="rgba(0,0,0,.34)" stroke="${accent}" stroke-opacity=".34" stroke-width="5"/>
    <rect x="396" y="392" width="232" height="250" rx="16" fill="#ead9b8" opacity=".94"/>
    <path d="M436 452h152M436 494h152M436 536h132M436 578h110" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".62"/>
    <circle cx="512" cy="624" r="34" fill="${accent}" opacity=".74"/>
    ${figure(278, 480, 1, "#263d4d", accent, "seated")}
    ${figure(746, 480, 1, "#4d2d22", accent, "seated")}
    ${floorAndBackdrop(accent)}
  `;
}

function articlesScene(accent) {
  return `
    <rect x="248" y="254" width="528" height="506" rx="26" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
    <path d="M336 338h352M336 392h352M336 446h352M336 500h352M336 554h352M336 608h260" stroke="#f2e0b9" stroke-width="13" stroke-linecap="round" opacity=".2"/>
    <rect x="378" y="328" width="268" height="336" rx="16" fill="#ead9b8" opacity=".94"/>
    <path d="M422 390h180M422 434h180M422 478h156M422 522h180M422 566h138" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".62"/>
    <path d="M512 292v420" stroke="${accent}" stroke-opacity=".24" stroke-width="7"/>
    <circle cx="512" cy="690" r="34" fill="${accent}" opacity=".76"/>
  `;
}

function openBibleScene(accent) {
  return `
    ${cityBackdrop(accent)}
    <path d="M292 514c118-54 186-48 220 16v204c-80-54-144-62-220-16Z" fill="#f0e4c8"/>
    <path d="M732 514c-118-54-186-48-220 16v204c80-54 144-62 220-16Z" fill="#e0c89d"/>
    <path d="M512 530v204M348 586h112M348 636h108M564 586h112M564 636h90" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".6"/>
    <path d="M512 378v108M460 432h104" stroke="${accent}" stroke-width="13" stroke-linecap="round" opacity=".78"/>
    ${floorAndBackdrop(accent)}
  `;
}

function persecutionScene(accent) {
  return `
    ${cityBackdrop(accent)}
    <rect x="360" y="380" width="304" height="286" rx="20" fill="#ead9b8" opacity=".94"/>
    <path d="M406 444h212M406 490h186M406 536h202M406 582h154" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".6"/>
    <path d="M666 386c68 30 102 82 104 156-64-20-94-74-104-156Z" fill="${accent}" opacity=".45"/>
    <path d="M358 386c-68 30-102 82-104 156 64-20 94-74 104-156Z" fill="${accent}" opacity=".45"/>
    <circle cx="512" cy="654" r="34" fill="${accent}" opacity=".76"/>
    ${floorAndBackdrop(accent)}
  `;
}

function catechismScene(accent) {
  return `
    <rect x="214" y="288" width="596" height="424" rx="24" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".44" stroke-width="5"/>
    <rect x="290" y="362" width="444" height="276" rx="18" fill="#ead9b8" opacity=".94"/>
    <text x="512" y="472" fill="${accent}" font-family="Georgia, serif" font-size="96" font-weight="900" text-anchor="middle">Q</text>
    <text x="512" y="576" fill="#5b3b24" opacity=".72" font-family="Georgia, serif" font-size="96" font-weight="900" text-anchor="middle">A</text>
    <path d="M358 494h308M358 602h308" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".45"/>
    <path d="M284 730h456" stroke="${accent}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
  `;
}

function dortScene(accent) {
  return `
    ${apseBackdrop(accent, true)}
    ${figure(248, 500, 1.08, "#263d4d", accent, "seated")}
    ${figure(380, 470, 1.18, "#49311f", accent, "seated")}
    ${figure(644, 470, 1.18, "#4b263c", accent, "seated")}
    ${figure(776, 500, 1.08, "#2b4636", accent, "seated")}
    <rect x="374" y="560" width="276" height="128" rx="18" fill="#ead9b8" opacity=".94"/>
    <path d="M414 608h196M414 648h158" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".6"/>
    <path d="M512 322c-42 58-42 126 0 204 42-78 42-146 0-204Z" fill="${accent}" opacity=".74"/>
    <path d="M470 386c-54 36-72 90-46 158 58-46 74-100 46-158ZM554 386c54 36 72 90 46 158-58-46-74-100-46-158Z" fill="${accent}" opacity=".46"/>
    ${floorAndBackdrop(accent)}
  `;
}

function translatorsScene(accent) {
  return `
    ${apseBackdrop(accent, false)}
    <rect x="236" y="560" width="552" height="126" rx="22" fill="rgba(0,0,0,.36)" stroke="${accent}" stroke-opacity=".34" stroke-width="5"/>
    ${figure(314, 456, 1, "#263d4d", accent, "seated")}
    ${figure(512, 426, 1.08, "#4b2c1d", accent, "seated")}
    ${figure(710, 456, 1, "#382b52", accent, "seated")}
    <path d="M512 298v126M454 358h116" stroke="${accent}" stroke-width="13" stroke-linecap="round"/>
    <rect x="422" y="548" width="180" height="104" rx="12" fill="#ead9b8" opacity=".94"/>
    <path d="M454 588h116M454 620h88" stroke="#5b3b24" stroke-width="7" stroke-linecap="round" opacity=".62"/>
    ${floorAndBackdrop(accent)}
  `;
}

function solasScene(accent) {
  const xs = [252, 382, 512, 642, 772];
  return `
    <path d="M180 732h664" stroke="${accent}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
    ${xs.map((x, i) => `
      <g transform="translate(${x} 358)">
        <path d="M0 -76 56 -34v312h-112V-34Z" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".48" stroke-width="5"/>
        <path d="M0 16v112M-36 70h72" stroke="${i === 2 ? "#fff4cf" : accent}" stroke-width="9" stroke-linecap="round" opacity=".8"/>
        <text x="0" y="214" text-anchor="middle" fill="${accent}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900">${i + 1}</text>
      </g>
    `).join("")}
  `;
}

function baptistScene(accent) {
  return `
    ${cityBackdrop(accent)}
    <path d="M250 638c112 92 412 92 524 0" fill="none" stroke="${accent}" stroke-width="28" stroke-linecap="round" opacity=".34"/>
    <rect x="378" y="352" width="268" height="262" rx="18" fill="#ead9b8" opacity=".94"/>
    <path d="M420 418h184M420 462h168M420 506h184M420 550h128" stroke="#5b3b24" stroke-width="8" stroke-linecap="round" opacity=".62"/>
    <path d="M512 314v86M470 356h84" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="512" cy="604" r="34" fill="${accent}" opacity=".76"/>
    ${floorAndBackdrop(accent)}
  `;
}

function westminsterScene(accent) {
  return `
    ${apseBackdrop(accent, true)}
    <rect x="218" y="566" width="588" height="126" rx="22" fill="rgba(0,0,0,.34)" stroke="${accent}" stroke-opacity=".34" stroke-width="5"/>
    ${figure(280, 466, 1.02, "#263d4d", accent, "seated")}
    ${figure(420, 438, 1.1, "#4d3220", accent, "seated")}
    ${figure(604, 438, 1.1, "#382b52", accent, "seated")}
    ${figure(744, 466, 1.02, "#2b4636", accent, "seated")}
    <rect x="426" y="542" width="172" height="108" rx="12" fill="#ead9b8" opacity=".94"/>
    <path d="M456 584h112M456 616h88" stroke="#5b3b24" stroke-width="7" stroke-linecap="round" opacity=".62"/>
    <path d="M512 306v138M450 374h124" stroke="${accent}" stroke-width="13" stroke-linecap="round" opacity=".78"/>
    ${floorAndBackdrop(accent)}
  `;
}

function sermonScene(accent) {
  return `
    <path d="M218 494 512 272l294 222v314H218Z" fill="rgba(255,255,255,.07)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
    <path d="M512 272 176 530M512 272l336 258" stroke="${accent}" stroke-width="10" opacity=".4"/>
    <rect x="430" y="548" width="164" height="136" rx="14" fill="rgba(0,0,0,.36)" stroke="${accent}" stroke-opacity=".52" stroke-width="5"/>
    ${figure(512, 410, 1.1, "#2f2b25", accent)}
    <path d="M706 280l-74 128h70L594 574" fill="none" stroke="${accent}" stroke-width="13" stroke-linejoin="round" opacity=".82"/>
    <path d="M308 720c88-44 320-44 408 0" stroke="#000" stroke-opacity=".28" stroke-width="20" stroke-linecap="round"/>
    ${floorAndBackdrop(accent)}
  `;
}

function debateScene(accent) {
  return `
    <rect x="188" y="302" width="648" height="398" rx="28" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-opacity=".42" stroke-width="5"/>
    ${figure(338, 448, 1.24, "#263d4d", accent)}
    ${figure(686, 448, 1.24, "#4d2d22", accent)}
    <path d="M512 330v278" stroke="${accent}" stroke-width="8" opacity=".42"/>
    <path d="M420 414h184M462 490h100" stroke="#fff4cf" stroke-width="11" stroke-linecap="round" opacity=".38"/>
    <path d="M390 654c60-54 184-54 244 0" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".62"/>
    <path d="M512 404c-36 52-36 104 0 156 36-52 36-104 0-156Z" fill="${accent}" opacity=".54"/>
    ${floorAndBackdrop(accent)}
  `;
}

await fs.mkdir(OUT_DIR, { recursive: true });

for (const item of documents) {
  const svg = baseSvg(item);
  const out = path.join(OUT_DIR, `${item.id}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, quality: 95 }).toFile(out);
  console.log(`wrote ${path.relative(process.cwd(), out)}`);
}

const sourceNote = `# Historical Document Cover Sources

These covers are original generated vector compositions rendered to PNG by \`scripts/generate-historical-document-covers.mjs\`.

They are designed to look like vintage historical paintings and manuscript covers, with each scene tailored to the document context: councils use council-hall compositions, Reformation events use doors, trials, printing presses, translation desks, assemblies, sermons, and confessional manuscripts.

No external artwork files are embedded in these generated covers. If a new document such as Council of Trent is added later, add its document id to the generator and use a Trent council-hall scene or a licensed/public-domain source image as the art reference.
`;

await fs.writeFile(path.join(OUT_DIR, "SOURCES.md"), sourceNote);
