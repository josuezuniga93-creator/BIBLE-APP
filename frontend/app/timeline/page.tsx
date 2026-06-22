"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "../lib/useTheme";
import { useLanguage } from "../lib/useLanguage";
import { GeneratedDocumentCover, GeneratedCategoryMark } from "../components/GeneratedArtwork";

// ─── Document catalog ──────────────────────────────────────────────────────────

interface DocEntry {
  docId: string;
  label: string;
  shortTitle: string;
  year: string;
  origin: string;
  category: string;
  detail: string;
  sectionId: string;
}

const DOC_CATALOG: DocEntry[] = [
  { docId: "apostles-creed",         label: "Apostles' Creed",                    shortTitle: "Apostles' Creed",     year: "AD 140",  origin: "Rome · Baptismal Symbol",       category: "Creed",       detail: "The universal summary of Christian faith structured around Father, Son, and Holy Spirit.", sectionId: "early-church" },
  { docId: "nicene-creed",           label: "Nicene Creed",                       shortTitle: "Nicene Creed",        year: "AD 381",  origin: "Constantinople · Ecumenical",   category: "Creed",       detail: "The great ecumenical creed affirming Trinitarian faith — confessed by the entire church.", sectionId: "early-church" },
  { docId: "athanasian-creed",       label: "Athanasian Creed",                   shortTitle: "Athanasian Creed",    year: "AD 500",  origin: "Western Church",                category: "Creed",       detail: "The most precise Trinitarian creed, affirming the co-equality and co-eternity of the three Persons.", sectionId: "early-church" },
  { docId: "augsburg-confession",    label: "Augsburg Confession",                shortTitle: "Augsburg Conf.",      year: "1530",    origin: "Augsburg · Germany",            category: "Confession",  detail: "The Lutheran confession affirming justification by faith alone, presented to Emperor Charles V.", sectionId: "reformation" },
  { docId: "belgic-confession",      label: "Belgic Confession",                  shortTitle: "Belgic Confession",   year: "1561",    origin: "Netherlands · Reformed",        category: "Confession",  detail: "37 articles of Reformed theology written under persecution. One of the Three Forms of Unity.", sectionId: "reformation" },
  { docId: "westminster-confession", label: "Westminster Confession of Faith",    shortTitle: "Westminster Conf.",   year: "1647",    origin: "London · Westminster Assembly", category: "Confession",  detail: "The most comprehensive Reformed confession — 33 chapters covering every major doctrine.", sectionId: "confessional" },
  { docId: "first-london-baptist",   label: "First London Baptist Confession",    shortTitle: "First London Conf.",  year: "1644",    origin: "London · Seven Churches",       category: "Confession",  detail: "The founding document of the Particular Baptist movement — fully Calvinist, believer's baptism.", sectionId: "baptist" },
  { docId: "1689-lbc",               label: "Second London Baptist Confession",   shortTitle: "1689 Confession",     year: "1689",    origin: "London · 107 Churches",         category: "Confession",  detail: "107 Particular Baptist churches — identical in soteriology to Westminster, Baptist in ecclesiology.", sectionId: "baptist" },
  { docId: "heidelberg",             label: "Heidelberg Catechism",               shortTitle: "Heidelberg Cat.",     year: "1563",    origin: "Heidelberg · Germany",          category: "Catechism",   detail: "'What is your only comfort? That I am not my own, but belong to my faithful Savior Jesus Christ.'", sectionId: "reformation" },
  { docId: "westminster-shorter",    label: "Westminster Shorter Catechism",      shortTitle: "Shorter Catechism",   year: "1647",    origin: "London · Westminster Assembly", category: "Catechism",   detail: "'Man's chief end is to glorify God, and to enjoy him forever.' 107 questions for all ages.", sectionId: "confessional" },
  { docId: "westminster-larger",     label: "Westminster Larger Catechism",       shortTitle: "Larger Catechism",    year: "1648",    origin: "London · Westminster Assembly", category: "Catechism",   detail: "196 questions for public worship and mature instruction — famous for its exposition of the Ten Commandments.", sectionId: "confessional" },
  { docId: "jerusalem-council",      label: "Jerusalem Council",                  shortTitle: "Jerusalem Council",   year: "AD 49",   origin: "Jerusalem · Acts 15",           category: "Council",     detail: "The first church council settles the Gentile question — salvation is by grace alone, not the law.", sectionId: "early-church" },
  { docId: "council-nicaea",         label: "Council of Nicaea",                  shortTitle: "Council of Nicaea",   year: "AD 325",  origin: "Nicaea · Asia Minor",           category: "Council",     detail: "Affirms the Son is homoousios — of the same substance as the Father — against Arianism.", sectionId: "early-church" },
  { docId: "council-chalcedon",      label: "Council of Chalcedon",               shortTitle: "Council of Chalcedon", year: "AD 451", origin: "Chalcedon · Asia Minor",        category: "Council",     detail: "Defines Christ as one Person in two natures — fully God and fully man — without confusion or division.", sectionId: "early-church" },
  { docId: "canons-of-dort",         label: "Canons of Dort",                     shortTitle: "Canons of Dort",      year: "1618",    origin: "Dordrecht · Netherlands",       category: "Council",     detail: "The Synod of Dort affirms TULIP — Total Depravity, Unconditional Election, Definite Atonement, Irresistible Grace, Perseverance.", sectionId: "confessional" },
  { docId: "95theses",               label: "Luther's 95 Theses",                 shortTitle: "The 95 Theses",       year: "1517",    origin: "Wittenberg · Germany",          category: "Debate",      detail: "Martin Luther nails 95 Theses to the Castle Church door, challenging indulgences. The Reformation begins.", sectionId: "reformation" },
  { docId: "diet-of-worms",          label: "Diet of Worms",                      shortTitle: "Diet of Worms",       year: "1521",    origin: "Worms · Germany",               category: "Debate",      detail: "'Here I stand. I can do no other.' Luther refuses to recant before Emperor Charles V.", sectionId: "reformation" },
  { docId: "thirty-nine-articles",   label: "Thirty-Nine Articles",               shortTitle: "39 Articles",         year: "1563",    origin: "Church of England",             category: "Debate",      detail: "The Church of England's doctrinal standard — Reformed in justification, Scripture's authority, and election.", sectionId: "reformation" },
  { docId: "augustine-grace",        label: "Augustine on Grace & Election",      shortTitle: "Augustine: Grace",    year: "AD 397",  origin: "Hippo · North Africa",          category: "Treatise",    detail: "Augustine develops total depravity, sovereign grace, and unconditional election against Pelagianism.", sectionId: "early-church" },
  { docId: "calvins-institutes",     label: "Calvin's Institutes",                shortTitle: "Calvin's Institutes", year: "1536",    origin: "Basel · Switzerland",           category: "Treatise",    detail: "The masterwork of Reformed theology covering Scripture, sovereignty, grace, justification, and election.", sectionId: "reformation" },
  { docId: "sinners-in-hands",       label: "Sinners in the Hands of an Angry God", shortTitle: "Sinners in the Hands", year: "1741", origin: "Enfield, Connecticut",         category: "Sermon",      detail: "Jonathan Edwards — total depravity, sovereign grace, and an open door of mercy. The most famous sermon in American history.", sectionId: "awakening" },
  { docId: "wycliffe",               label: "Wycliffe's Bible",                   shortTitle: "Wycliffe's Bible",    year: "1378",    origin: "Oxford · England",              category: "Translation", detail: "The first English Bible translation. Wycliffe insists Scripture is the supreme rule of the church.", sectionId: "pre-reformation" },
  { docId: "tyndale",                label: "Tyndale's New Testament",            shortTitle: "Tyndale's NT",        year: "1525",    origin: "Cologne · Germany",             category: "Translation", detail: "The first Greek-to-English NT. 83% of the King James Bible will be Tyndale's words.", sectionId: "reformation" },
  { docId: "gutenberg",              label: "Gutenberg Bible",                    shortTitle: "Gutenberg Bible",     year: "1455",    origin: "Mainz · Germany",               category: "Translation", detail: "The first printed Bible — making the Reformation unstoppable by enabling mass distribution of Scripture.", sectionId: "pre-reformation" },
  { docId: "king-james-bible",       label: "King James Bible",                   shortTitle: "King James Bible",    year: "1611",    origin: "England · Authorized",          category: "Translation", detail: "47 scholars produce the Authorized Version — the Bible of the Westminster Assembly and the Puritans.", sectionId: "confessional" },
];

const FEATURED_DOCS = [
  DOC_CATALOG.find(d => d.docId === "westminster-confession"),
  DOC_CATALOG.find(d => d.docId === "heidelberg"),
  DOC_CATALOG.find(d => d.docId === "95theses"),
].filter((d): d is DocEntry => !!d);

interface CategorySection {
  title: string;
  esTitle: string;
  docIds: string[];
}

const CATEGORY_SECTIONS: CategorySection[] = [
  {
    title: "Popular",
    esTitle: "Populares",
    docIds: ["westminster-confession", "heidelberg", "nicene-creed"],
  },
  {
    title: "Creeds",
    esTitle: "Credos",
    docIds: ["apostles-creed", "nicene-creed", "athanasian-creed"],
  },
  {
    title: "Confessions",
    esTitle: "Confesiones",
    docIds: ["westminster-confession", "belgic-confession", "1689-lbc", "augsburg-confession", "first-london-baptist"],
  },
  {
    title: "Catechisms",
    esTitle: "Catecismos",
    docIds: ["heidelberg", "westminster-shorter", "westminster-larger"],
  },
  {
    title: "Councils & Synods",
    esTitle: "Concilios y Sínodos",
    docIds: ["canons-of-dort", "council-chalcedon", "council-nicaea", "jerusalem-council"],
  },
  {
    title: "Articles & Debates",
    esTitle: "Artículos y Debates",
    docIds: ["95theses", "diet-of-worms", "thirty-nine-articles"],
  },
  {
    title: "Sermons",
    esTitle: "Sermones",
    docIds: ["sinners-in-hands"],
  },
  {
    title: "Translations",
    esTitle: "Traducciones",
    docIds: ["king-james-bible", "tyndale", "wycliffe", "gutenberg"],
  },
  {
    title: "Treatises",
    esTitle: "Tratados",
    docIds: ["calvins-institutes", "augustine-grace"],
  },
];

// ─── Timeline data ─────────────────────────────────────────────────────────────

interface TimelineEvent {
  year: string;
  label: string;
  detail: string;
  docId?: string;
  isTarget?: boolean;
}

interface TimelineSection {
  id: string;
  title: string;
  subtitle: string;
  mark: string;
  color: string;
  events: TimelineEvent[];
}

const TIMELINE_SECTIONS: TimelineSection[] = [
  {
    id: "early-church",
    title: "Early Church",
    subtitle: "AD 49 – 529",
    mark: "creed",
    color: "#6ee7b7",
    events: [
      { year: "AD 49",  label: "Jerusalem Council",         detail: "The first church council settles the Gentile question — salvation is by grace alone, not the Mosaic law. Peter: 'We believe we will be saved through the grace of the Lord Jesus, just as they will.'", docId: "jerusalem-council" },
      { year: "AD 140", label: "Apostles' Creed",           detail: "The Old Roman Symbol — the earliest Christian baptismal confession — emerges at Rome. Structured around Father, Son, and Holy Spirit, it becomes the universal summary of Christian faith.", docId: "apostles-creed" },
      { year: "AD 325", label: "Council of Nicaea",         detail: "Emperor Constantine convenes the first ecumenical council to answer Arius, who taught the Son is a created being. The council affirms: the Son is homoousios — of the same substance as the Father.", docId: "council-nicaea" },
      { year: "AD 381", label: "Nicene Creed",              detail: "The Council of Constantinople completes the Nicene Creed, adding the full divinity of the Holy Spirit. The Creed is now confessed by the entire church — East and West, Catholic and Reformed.", docId: "nicene-creed" },
      { year: "AD 397", label: "Augustine: Grace & Election", detail: "Augustine of Hippo — fighting Pelagianism — develops the doctrines of total depravity, sovereign grace, and unconditional election that Luther, Calvin, and the 1689 Confession would recover.", docId: "augustine-grace" },
      { year: "AD 418", label: "Council of Carthage",       detail: "Formally condemns Pelagianism. The church declares: original sin is real, grace is necessary, and the beginning of faith is God's gift — not human initiative." },
      { year: "AD 451", label: "Council of Chalcedon",      detail: "Defines Christ as one Person in two natures — fully God and fully man — without confusion, change, division, or separation. The four adverbs guard orthodox Christology against every heresy.", docId: "council-chalcedon" },
      { year: "AD 500", label: "Athanasian Creed",          detail: "'Whoever desires to be saved must above all things hold the catholic faith.' The most precise Trinitarian creed, affirming the co-equality and co-eternity of Father, Son, and Holy Spirit.", docId: "athanasian-creed" },
      { year: "AD 529", label: "Council of Orange",         detail: "Decisively condemns semi-Pelagianism — the view that humans take the first step toward God. The council affirms: even the beginning of faith is God's sovereign gift. Augustine vindicated." },
    ],
  },
  {
    id: "pre-reformation",
    title: "Pre-Reformation",
    subtitle: "1378 – 1516",
    mark: "history",
    color: "#fcd34d",
    events: [
      { year: "1378", label: "Wycliffe & the English Bible", detail: "'Morning Star of the Reformation.' John Wycliffe translates the Bible into English for the first time, attacks papal authority and transubstantiation, and insists Scripture is the supreme rule.", docId: "wycliffe" },
      { year: "1415", label: "Jan Hus Martyred",             detail: "The Council of Constance burns Jan Hus for preaching Scripture's authority over the papacy — despite a promised safe-conduct. His last words: 'You burn a goose, but a swan will come whom you cannot burn.'" },
      { year: "1455", label: "Gutenberg Bible",              detail: "Johannes Gutenberg's movable-type press produces the first printed Bible. The press will make the Reformation unstoppable — Luther's 95 Theses, spread in weeks across Europe, could never have reached that audience by hand.", docId: "gutenberg" },
    ],
  },
  {
    id: "reformation",
    title: "Protestant Reformation",
    subtitle: "1517 – 1563",
    mark: "debate",
    color: "#fb923c",
    events: [
      { year: "1517", label: "Luther's 95 Theses",       detail: "Martin Luther nails his 95 Theses to the door of the Castle Church in Wittenberg, challenging the sale of indulgences. Within weeks, printed copies flood Germany. The Reformation begins.", docId: "95theses" },
      { year: "1521", label: "Diet of Worms",            detail: "'Here I stand. I can do no other. God help me. Amen.' Luther refuses to recant before Emperor Charles V. Conscience bound by Scripture alone — not pope, not councils.", docId: "diet-of-worms" },
      { year: "1525", label: "Tyndale's New Testament", detail: "William Tyndale translates the New Testament from Greek into English — the first such translation — and smuggles it into England in bales of cloth. 83% of the King James Bible will be his words.", docId: "tyndale" },
      { year: "1530", label: "Augsburg Confession",     detail: "Philip Melanchthon presents the Lutheran confession to Emperor Charles V — affirming justification by faith alone, Scripture's authority, and the church as congregation of the faithful.", docId: "augsburg-confession" },
      { year: "1536", label: "Calvin's Institutes",     detail: "John Calvin publishes the Institutes of the Christian Religion in Basel — the masterwork of Reformed theology. Its doctrines of Scripture, sovereignty, grace, justification, and election will shape Westminster and the 1689.", docId: "calvins-institutes" },
      { year: "1537", label: "Smalcald Articles",       detail: "Luther's theological final testament — declaring justification the 'first and chief article' on which 'all that we teach and practice' rests." },
      { year: "1559", label: "Geneva Bible",            detail: "English exiles in Calvin's Geneva produce the first English Bible with verse numbers and Reformed marginal notes. It becomes the Bible of the Puritans, the Pilgrims, and the Particular Baptists." },
      { year: "1561", label: "Belgic Confession",       detail: "Guido de Brès writes 37 articles of Reformed theology under persecution in the Spanish Netherlands. It remains one of the Three Forms of Unity in Reformed churches worldwide.", docId: "belgic-confession" },
      { year: "1563", label: "Heidelberg Catechism",    detail: "'What is your only comfort in life and in death? That I, with body and soul, both in life and death, am not my own, but belong to my faithful Savior Jesus Christ.' The most beloved catechism of the Reformation.", docId: "heidelberg" },
      { year: "1563", label: "Thirty-Nine Articles",   detail: "The Church of England's doctrinal standard — strongly Reformed in its doctrine of justification ('by faith only'), election, and Scripture's authority.", docId: "thirty-nine-articles" },
    ],
  },
  {
    id: "confessional",
    title: "Reformed Confessions",
    subtitle: "1611 – 1648",
    mark: "confession",
    color: "#c084fc",
    events: [
      { year: "1611",    label: "King James Bible",                   detail: "47 scholars produce the Authorized Version — the Bible of the Westminster Assembly, the Puritans, and the Particular Baptists. Its theological vocabulary becomes the language of English-speaking Christianity for 350 years.", docId: "king-james-bible" },
      { year: "1618–19", label: "Synod of Dort",                      detail: "Representatives from Reformed churches across Europe affirm the five points: Total Depravity, Unconditional Election, Definite Atonement, Irresistible Grace, Perseverance of the Saints — TULIP.", docId: "canons-of-dort" },
      { year: "1643–47", label: "Westminster Assembly",               detail: "Parliament convenes 121 ministers plus lay commissioners to reform the Church of England. They produce the Westminster Confession of Faith, the Shorter Catechism, and the Larger Catechism." },
      { year: "1647",    label: "Westminster Confession of Faith",    detail: "The most comprehensive Reformed confession — 33 chapters covering every major doctrine. Its structure and wording will be adopted by the 1689 Baptist Confession.", docId: "westminster-confession" },
      { year: "1647",    label: "Westminster Shorter Catechism",      detail: "'What is the chief end of man? Man's chief end is to glorify God, and to enjoy him forever.' 107 questions that have formed generations of Reformed and Baptist children.", docId: "westminster-shorter" },
      { year: "1648",    label: "Westminster Larger Catechism",       detail: "196 questions for public worship and mature instruction — especially renowned for its exhaustive exposition of the Ten Commandments.", docId: "westminster-larger" },
    ],
  },
  {
    id: "baptist",
    title: "Baptist Roots & the 1689",
    subtitle: "1644 – 1689",
    mark: "document",
    color: "#f0c060",
    events: [
      { year: "1644", label: "First London Baptist Confession",           detail: "Seven London Particular Baptist churches produce their first confession — fully Calvinist in soteriology, explicitly affirming believer's baptism by immersion.", docId: "first-london-baptist" },
      { year: "1677", label: "Second London Baptist Confession (Draft)",  detail: "During severe persecution, Particular Baptist leaders draft a revised confession following Westminster closely — Baptist modifications in ecclesiology and baptism, identical in Reformed soteriology.", docId: "1689-lbc" },
      { year: "1678", label: "Pilgrim's Progress",                        detail: "John Bunyan — Bedford tinker, Particular Baptist, and prisoner for his faith — publishes the greatest allegory in the English language. Christian's journey maps the 1689's ordo salutis in story form." },
      { year: "1689", label: "Second London Baptist Confession",          detail: "Following the Glorious Revolution and the Toleration Act, 107 Particular Baptist churches formally adopt the confession — identical in soteriology to Westminster, Baptist in ecclesiology and baptism.", docId: "1689-lbc" },
    ],
  },
  {
    id: "awakening",
    title: "The Great Awakening",
    subtitle: "1700 – 1741",
    mark: "theology",
    color: "#fb923c",
    events: [
      { year: "1726",    label: "Frelinghuysen & the New Jersey Revival",  detail: "Dutch Reformed pastor Theodore Frelinghuysen preaches experimental Reformed religion in New Jersey, sparking the first stirrings of what will become the Great Awakening." },
      { year: "1734–35", label: "Northampton Revival — Jonathan Edwards", detail: "Jonathan Edwards's congregation in Northampton, Massachusetts experiences a sudden and remarkable awakening. Edwards documents it in 'A Faithful Narrative of the Surprising Work of God'." },
      { year: "1739–40", label: "George Whitefield's American Tour",      detail: "The English evangelist George Whitefield preaches to tens of thousands across the colonies. His Calvinist gospel of the new birth carries the Awakening from Georgia to New England." },
      { year: "1740",    label: "The Great Awakening Peaks",              detail: "The revival reaches its height throughout New England and the middle colonies. Thousands are converted. New churches are planted. The social fabric of colonial America is transformed." },
      { year: "1741",    label: "Sinners in the Hands of an Angry God",  detail: "Jonathan Edwards preaches in Enfield, Connecticut. Before he finishes, people are crying out, clutching the pews, weeping for their souls. The most famous sermon in American history.", docId: "sinners-in-hands", isTarget: true },
    ],
  },
];

const SECTION_DOT_COLORS: Record<string, { dot: string; glow: string; line: string }> = {
  "early-church":    { dot: "#6ee7b7", glow: "rgba(110,231,183,0.4)", line: "rgba(110,231,183,0.2)" },
  "pre-reformation": { dot: "#fbbf24", glow: "rgba(251,191,36,0.4)",  line: "rgba(251,191,36,0.2)"  },
  "reformation":     { dot: "#fb923c", glow: "rgba(251,146,60,0.4)",  line: "rgba(251,146,60,0.2)"  },
  "confessional":    { dot: "#c084fc", glow: "rgba(192,132,252,0.4)", line: "rgba(192,132,252,0.2)" },
  "baptist":         { dot: "#f0c060", glow: "rgba(240,192,96,0.5)",  line: "rgba(240,192,96,0.2)"  },
  "awakening":       { dot: "#fb923c", glow: "rgba(251,146,60,0.5)",  line: "rgba(251,146,60,0.2)"  },
};

// ─── Timeline sub-components ──────────────────────────────────────────────────

function SectionHeader({ section }: { section: TimelineSection }) {
  return (
    <div className="relative flex items-center gap-4 mb-8 mt-12 first:mt-0">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${section.color}60, transparent)` }} />
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
        style={{ background: `${section.color}14`, border: `1px solid ${section.color}40`, color: section.color }}>
        <GeneratedCategoryMark id={section.mark} size={24} />
        <span className="uppercase tracking-wider">{section.title}</span>
        <span className="opacity-60 font-normal">{section.subtitle}</span>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${section.color}60)` }} />
    </div>
  );
}

function TimelineItem({ event, sectionId, isLast }: { event: TimelineEvent; sectionId: string; isLast: boolean }) {
  const colors = SECTION_DOT_COLORS[sectionId] ?? SECTION_DOT_COLORS["early-church"];
  const content = (
    <div className="flex gap-4 group cursor-pointer relative" style={{ paddingBottom: isLast ? 0 : "28px" }}>
      {!isLast && (
        <div className="absolute left-[11px] top-7 bottom-0 w-px pointer-events-none" style={{ background: colors.line }} />
      )}
      <div className="flex-shrink-0 relative z-10 mt-1">
        {event.isTarget ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f0c060, #c9a227)", boxShadow: "0 0 0 4px rgba(240,192,96,0.2), 0 0 16px rgba(240,192,96,0.5)" }}>
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        ) : (
          <div className="w-[22px] h-[22px] rounded-full border-2 transition-all duration-200 group-hover:scale-110"
            style={{
              background: event.docId ? `radial-gradient(circle, ${colors.dot}cc, ${colors.dot}66)` : "rgba(255,255,255,0.06)",
              borderColor: event.docId ? colors.dot : "rgba(255,255,255,0.12)",
              boxShadow: event.docId ? `0 0 8px ${colors.glow}` : "none",
            }} />
        )}
      </div>
      <div className="flex-1 rounded-xl p-4 transition-all duration-200"
        style={{
          background: event.isTarget ? "rgba(240,192,96,0.08)" : event.docId ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
          border: event.isTarget ? "1px solid rgba(240,192,96,0.4)" : event.docId ? `1px solid ${colors.dot}18` : "1px solid rgba(255,255,255,0.05)",
        }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-black tracking-widest uppercase font-mono"
              style={{ color: event.isTarget ? "#f0c060" : colors.dot }}>{event.year}</span>
            <span className="font-bold text-sm leading-snug" style={{ color: "rgba(255,255,255,0.92)" }}>{event.label}</span>
            {event.isTarget && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: "rgba(240,192,96,0.2)", color: "#f0c060" }}>Destination</span>
            )}
          </div>
          {event.docId && (
            <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: event.isTarget ? "rgba(240,192,96,0.2)" : `${colors.dot}18`, color: event.isTarget ? "#f0c060" : colors.dot }}>
              Read →
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>{event.detail}</p>
      </div>
    </div>
  );
  if (event.docId) return <Link href={`/learn?doc=${event.docId}`} className="block no-underline">{content}</Link>;
  return <div>{content}</div>;
}

// ─── Doc card ─────────────────────────────────────────────────────────────────

function DocCard({ doc, th }: { doc: DocEntry; th: Record<string, string> }) {
  return (
    <div className="rounded-xl p-2.5"
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
      <div className="relative rounded-lg overflow-hidden mb-2 shadow-md shadow-black/20" style={{ aspectRatio: "2/3" }}>
        <GeneratedDocumentCover
          size="small"
          doc={{ id: doc.docId, title: doc.label, shortTitle: doc.shortTitle, year: doc.year, origin: doc.origin, category: doc.category }}
        />
        <Link href={`/learn?doc=${doc.docId}`} className="absolute inset-0 z-10 active:opacity-80 transition-opacity" />
      </div>
      <Link href={`/learn?doc=${doc.docId}`}>
        <p className="text-[10px] font-bold leading-tight line-clamp-2" style={{ color: th.textPrimary }}>{doc.label}</p>
        <p className="text-[9px] mt-0.5 truncate" style={{ color: th.textSecondary }}>{doc.origin.split(" · ")[0]}</p>
        <p className="text-[9px] mt-0.5 font-mono" style={{ color: th.textFaint }}>{doc.year}</p>
      </Link>
    </div>
  );
}

// ─── Highlights pocket ────────────────────────────────────────────────────────

function HighlightPocket({
  open,
  onClose,
  th,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  th: Record<string, string>;
  lang: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: th.pageBg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${th.cardBorder}` }}>
        <div>
          <h2 className="text-lg font-black" style={{ color: th.textPrimary }}>
            {lang === "es" ? "Mis Resaltados" : "My Highlights"}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: th.textSecondary }}>
            {lang === "es" ? "Pasajes guardados de documentos históricos" : "Saved passages from Historical Documents"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-60 transition-opacity flex-shrink-0"
          style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(201,169,97,0.10)", border: "1px solid rgba(201,169,97,0.20)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div>
          <p className="font-black text-base mb-2" style={{ color: th.textPrimary }}>
            {lang === "es" ? "Sin resaltados todavía" : "No highlights yet"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: th.textSecondary }}>
            {lang === "es"
              ? "Abre cualquier documento histórico y mantén presionado para guardar un pasaje aquí."
              : "Open any historical document and long-press a passage to save it here."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-3 rounded-full font-bold text-sm active:scale-95 transition-transform"
          style={{ background: "rgba(201,169,97,0.12)", border: "1px solid rgba(201,169,97,0.30)", color: "#c9a961" }}>
          {lang === "es" ? "Explorar documentos" : "Browse Documents"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isLight   = theme === "white-noir";
  const isGoldNavy = theme === "gold-navy";

  const th: Record<string, string> = {
    pageBg:         isLight ? "#ffffff"                              : "#0e0e18",
    textPrimary:    isLight ? "#0a0a0a"                             : "rgba(255,255,255,0.92)",
    textSecondary:  isLight ? "rgba(10,10,10,0.55)"                : "rgba(255,255,255,0.38)",
    textMuted:      isLight ? "rgba(10,10,10,0.38)"                : "rgba(255,255,255,0.40)",
    textFaint:      isLight ? "rgba(10,10,10,0.25)"                : "rgba(255,255,255,0.25)",
    accent:         isLight ? "#0a0a0a"                             : "#a78bfa",
    heroBg:         isLight ? "linear-gradient(135deg,#f7f7f7 0%,#ffffff 100%)" : "linear-gradient(135deg,#1a0845 0%,#2d1b69 55%,#0f0a2a 100%)",
    heroAccentText: isLight ? "#0a0a0a"                             : "#c084fc",
    heroSubtext:    isLight ? "rgba(10,10,10,0.55)"                : "rgba(255,255,255,0.40)",
    cardBg:         isLight ? "#f7f7f7"                             : "rgba(255,255,255,0.03)",
    cardBorder:     isLight ? "rgba(0,0,0,0.07)"                   : "rgba(255,255,255,0.07)",
  };

  if (isGoldNavy && !isLight) {
    th.accent         = "#c9a961";
    th.heroBg         = "linear-gradient(135deg,rgba(201,169,97,0.22) 0%,#1a1d27 55%,#0e1018 100%)";
    th.heroAccentText = "#c9a961";
  }

  // Carousel
  const [slide, setSlide]         = useState(0);
  const [paused, setPaused]       = useState(false);
  const touchXRef                 = useRef(0);
  const swipedRef                 = useRef(false);

  useEffect(() => {
    if (FEATURED_DOCS.length <= 1 || paused) return;
    const id = setInterval(() => setSlide(prev => (prev + 1) % FEATURED_DOCS.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  // Category expand/collapse
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleSection = (title: string) =>
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));

  // Highlights pocket
  const [showHighlights, setShowHighlights] = useState(false);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: th.pageBg, color: th.textPrimary }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-[21px] font-black tracking-[-0.03em]" style={{ color: th.textPrimary }}>
          {lang === "es" ? "Documentos " : "Historical "}
          <span style={{ color: th.accent }}>{lang === "es" ? "Históricos" : "Documents"}</span>
        </h1>
      </div>

      {/* ── Hero Carousel ────────────────────────────────────────────────────── */}
      <div
        className="mx-5 mb-6 rounded-[22px] overflow-hidden relative select-none"
        style={{
          height: "214px",
          boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
          border: `1px solid ${th.cardBorder}`,
        }}
        onTouchStart={e => {
          touchXRef.current = e.touches[0].clientX;
          setPaused(true);
          swipedRef.current = false;
        }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchXRef.current;
          if (Math.abs(dx) > 40) {
            swipedRef.current = true;
            setSlide(prev => dx < 0
              ? (prev + 1) % FEATURED_DOCS.length
              : (prev - 1 + FEATURED_DOCS.length) % FEATURED_DOCS.length);
          }
        }}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ width: `${FEATURED_DOCS.length * 100}%`, transform: `translateX(-${(slide * 100) / FEATURED_DOCS.length}%)` }}
        >
          {FEATURED_DOCS.map(doc => (
            <div key={doc.docId} className="flex h-full flex-shrink-0 relative"
              style={{ width: `${100 / FEATURED_DOCS.length}%`, background: th.heroBg }}>
              <Link
                href={`/learn?doc=${doc.docId}`}
                className="absolute inset-0 z-30"
                onClick={e => { if (swipedRef.current) { e.preventDefault(); swipedRef.current = false; } }}
              />
              {/* Radial glow */}
              <div className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none"
                style={{ background: isLight ? "none" : isGoldNavy
                  ? "radial-gradient(circle at 65% 42%, rgba(201,169,97,0.18), transparent 42%)"
                  : "radial-gradient(circle at 68% 45%, rgba(155,114,40,0.13), transparent 46%)" }} />
              {/* Document cover */}
              <div className="flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/25 relative z-10"
                style={{ width: "108px", height: "164px", alignSelf: "center", marginLeft: "16px" }}>
                <GeneratedDocumentCover
                  doc={{ id: doc.docId, title: doc.label, shortTitle: doc.shortTitle, year: doc.year, origin: doc.origin, category: doc.category }}
                />
              </div>
              {/* Decorative SVG */}
              <div className="absolute right-5 top-9 hidden min-[380px]:block opacity-70">
                <svg width="92" height="112" viewBox="0 0 92 112" fill="none">
                  <path d="M55 5C37 22 31 50 38 82" stroke={th.accent} strokeWidth="3" strokeLinecap="round"/>
                  <path d="M55 5C70 37 65 68 38 82" stroke={th.accent} strokeWidth="2" strokeLinecap="round" opacity=".55"/>
                  <path d="M33 81h22c9 0 16 7 16 16v4H17v-4c0-9 7-16 16-16Z" fill={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} opacity=".8"/>
                  <path d="M27 102h34" stroke={th.accent} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Info panel */}
              <div className="flex-1 pt-7 pb-5 pr-4 pl-4 flex flex-col justify-between min-w-0 relative z-10">
                <div>
                  <div className="mb-2">
                    <p className="inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em]"
                      style={{ color: th.heroAccentText, background: isLight ? "rgba(0,0,0,0.07)" : isGoldNavy ? "rgba(201,169,97,0.12)" : "rgba(0,0,0,0.045)", border: isLight ? "1px solid rgba(0,0,0,0.15)" : undefined }}>
                      {lang === "es" ? "Documento Destacado" : "Featured Document"}
                    </p>
                  </div>
                  <p className="text-[17px] font-black leading-[1.08] mb-1.5 line-clamp-3" style={{ color: th.textPrimary }}>
                    {doc.label}
                  </p>
                  <p className="text-[11px] font-semibold mb-2 truncate" style={{ color: th.heroAccentText }}>
                    {doc.origin}
                  </p>
                  <p className="text-[10px] leading-[1.45] line-clamp-3 max-w-[190px]" style={{ color: th.heroSubtext }}>
                    {doc.detail.slice(0, 110)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination dots */}
        <div className="absolute bottom-3.5 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
          {FEATURED_DOCS.map((_, i) => (
            <button
              key={i}
              className="rounded-full transition-all pointer-events-auto active:opacity-70"
              style={{
                width: i === slide ? "8px" : "6px",
                height: "6px",
                backgroundColor: i === slide
                  ? th.accent
                  : (isLight ? "rgba(0,0,0,0.20)" : "rgba(255,255,255,0.25)"),
              }}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* ── My Highlights Banner ─────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <button
          onClick={() => setShowHighlights(true)}
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl active:scale-[0.99] transition-transform"
          style={{
            background: isGoldNavy ? "rgba(201,169,97,0.07)" : th.cardBg,
            border: `1px solid ${isGoldNavy ? "rgba(201,169,97,0.22)" : th.cardBorder}`,
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(201,169,97,0.14)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-black" style={{ color: th.textPrimary }}>
              {lang === "es" ? "Mis Resaltados" : "My Highlights"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: th.textSecondary }}>
              {lang === "es" ? "Pasajes guardados de documentos históricos" : "Saved passages from Historical Documents"}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* ── Category rows ────────────────────────────────────────────────────── */}
      {CATEGORY_SECTIONS.map(section => {
        const docs = section.docIds
          .map(id => DOC_CATALOG.find(d => d.docId === id))
          .filter((d): d is DocEntry => !!d);
        if (docs.length === 0) return null;
        const isExpanded = !!expanded[section.title];
        const visible = isExpanded ? docs : docs.slice(0, 3);
        const hasMore = docs.length > 3;
        return (
          <div key={section.title} className="mb-6">
            <div className="flex items-center justify-between px-5 mb-3">
              <p className="text-sm font-bold" style={{ color: th.textPrimary }}>
                {lang === "es" ? section.esTitle : section.title}
              </p>
              {hasMore && !isExpanded && (
                <button
                  className="inline-flex items-center gap-1 text-[11px] font-semibold active:opacity-60 transition-opacity"
                  style={{ color: th.textSecondary }}
                  onClick={() => toggleSection(section.title)}>
                  {lang === "es" ? "Ver todo" : "See All"}
                  <span style={{ color: th.textFaint }}>›</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 px-5">
              {visible.map((doc, i) => (
                <DocCard key={`${doc.docId}-${i}`} doc={doc} th={th} />
              ))}
            </div>
            {hasMore && isExpanded && (
              <div className="flex justify-center mt-4">
                <button
                  className="text-[11px] font-semibold px-4 py-2 rounded-full active:opacity-60 transition-opacity"
                  style={{ color: th.textSecondary, border: `1px solid ${th.cardBorder}` }}
                  onClick={() => toggleSection(section.title)}>
                  {lang === "es" ? "Mostrar menos" : "Show less"}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Timeline Highlights ──────────────────────────────────────────────── */}
      <div className="mt-4 mb-2">
        <div className="flex items-center px-5 mb-3">
          <p className="text-sm font-bold" style={{ color: th.textPrimary }}>
            {lang === "es" ? "Lo Más Destacado" : "Timeline Highlights"}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 mx-5 mb-4 rounded-2xl flex items-center gap-4 text-[10px]"
        style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ background: "radial-gradient(circle,#6ee7b7cc,#6ee7b766)", border: "2px solid #6ee7b7", boxShadow: "0 0 6px rgba(110,231,183,0.4)" }} />
          <span style={{ color: th.textSecondary }}>
            {lang === "es" ? "Tiene documento — toca para leer" : "Has document — tap to read"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.12)" }} />
          <span style={{ color: th.textSecondary }}>
            {lang === "es" ? "Evento histórico" : "Historical event"}
          </span>
        </div>
      </div>

      {/* Timeline body */}
      <div className="px-4 py-2 max-w-2xl mx-auto">
        {TIMELINE_SECTIONS.map(section => (
          <div key={section.id} id={section.id}>
            <SectionHeader section={section} />
            <div>
              {section.events.map((event, idx) => (
                <TimelineItem
                  key={`${event.year}-${event.label}`}
                  event={event}
                  sectionId={section.id}
                  isLast={idx === section.events.length - 1}
                />
              ))}
            </div>
          </div>
        ))}

        {/* End marker */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#fb923c,#c2410c)", boxShadow: "0 0 0 6px rgba(251,146,60,0.15), 0 0 24px rgba(251,146,60,0.4)" }}>
            <GeneratedCategoryMark id="document" size={28} />
          </div>
          <p className="font-black text-base" style={{ color: "#fb923c" }}>1741</p>
          <p className="font-bold text-sm" style={{ color: th.textPrimary }}>Sinners in the Hands of an Angry God</p>
          <p className="text-xs max-w-xs leading-relaxed" style={{ color: th.textSecondary }}>
            Jonathan Edwards — Enfield, Connecticut. The most famous sermon in American history.
          </p>
          <Link
            href="/learn?doc=sinners-in-hands"
            className="mt-2 px-6 py-3 rounded-full font-bold text-sm no-underline active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#fb923c,#c2410c)", color: "#fff" }}>
            {lang === "es" ? "Leer el Sermón →" : "Read the Sermon →"}
          </Link>
        </div>

        <p className="text-center text-[10px] mt-8 mb-2" style={{ color: th.textSecondary }}>
          {lang === "es"
            ? "Toca cualquier evento resaltado para abrir el documento completo"
            : "Tap any highlighted event to open the full document"}
        </p>
      </div>

      {/* ── Highlights pocket banner (below timeline) ─────────────────────────── */}
      <div className="flex justify-center mt-6 mb-10 px-5">
        <button
          onClick={() => setShowHighlights(true)}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          style={{
            background: isGoldNavy ? "rgba(201,169,97,0.07)" : th.cardBg,
            border: `1px solid ${isGoldNavy ? "rgba(201,169,97,0.22)" : th.cardBorder}`,
          }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(201,169,97,0.14)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs font-black" style={{ color: th.textPrimary }}>
              {lang === "es" ? "Mis Resaltados" : "My Highlights"}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: th.textSecondary }}>
              {lang === "es" ? "Ver pasajes guardados" : "View saved passages"}
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={th.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* ── Highlights full-screen pocket ────────────────────────────────────── */}
      <HighlightPocket
        open={showHighlights}
        onClose={() => setShowHighlights(false)}
        th={th}
        lang={lang}
      />
    </div>
  );
}
