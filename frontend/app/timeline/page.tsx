"use client";

import Link from "next/link";
import { useTheme } from "../lib/useTheme";

// ─── Timeline data ────────────────────────────────────────────────────────────

interface TimelineEvent {
  year: string;
  label: string;
  detail: string;
  docId?: string;
  isTarget?: boolean; // 1689 LBC — the endpoint
}

interface TimelineSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  borderColor: string;
  events: TimelineEvent[];
}

const TIMELINE_SECTIONS: TimelineSection[] = [
  {
    id: "early-church",
    title: "Early Church",
    subtitle: "AD 49 – 529",
    icon: "✦",
    color: "#6ee7b7",
    borderColor: "#065f46",
    events: [
      {
        year: "AD 49",
        label: "Jerusalem Council",
        detail: "The first church council settles the Gentile question — salvation is by grace alone, not the Mosaic law. Peter: 'We believe we will be saved through the grace of the Lord Jesus, just as they will.'",
        docId: "jerusalem-council",
      },
      {
        year: "AD 140",
        label: "Apostles' Creed",
        detail: "The Old Roman Symbol — the earliest Christian baptismal confession — emerges at Rome. Structured around Father, Son, and Holy Spirit, it becomes the universal summary of Christian faith.",
        docId: "apostles-creed",
      },
      {
        year: "AD 325",
        label: "Council of Nicaea",
        detail: "Emperor Constantine convenes the first ecumenical council to answer Arius, who taught the Son is a created being. The council affirms: the Son is homoousios — of the same substance as the Father.",
        docId: "council-nicaea",
      },
      {
        year: "AD 381",
        label: "Nicene Creed",
        detail: "The Council of Constantinople completes the Nicene Creed, adding the full divinity of the Holy Spirit. The Creed is now confessed by the entire church — East and West, Catholic and Reformed.",
        docId: "nicene-creed",
      },
      {
        year: "AD 397",
        label: "Augustine: Grace & Election",
        detail: "Augustine of Hippo — fighting Pelagianism — develops the doctrines of total depravity, sovereign grace, and unconditional election that Luther, Calvin, and the 1689 Confession would recover.",
        docId: "augustine-grace",
      },
      {
        year: "AD 418",
        label: "Council of Carthage",
        detail: "Formally condemns Pelagianism. The church declares: original sin is real, grace is necessary, and the beginning of faith is God's gift — not human initiative.",
        docId: "council-carthage",
      },
      {
        year: "AD 451",
        label: "Council of Chalcedon",
        detail: "Defines Christ as one Person in two natures — fully God and fully man — without confusion, change, division, or separation. The four adverbs guard orthodox Christology against every heresy.",
        docId: "council-chalcedon",
      },
      {
        year: "AD 500",
        label: "Athanasian Creed",
        detail: "'Whoever desires to be saved must above all things hold the catholic faith.' The most precise Trinitarian creed, affirming the co-equality and co-eternity of Father, Son, and Holy Spirit.",
        docId: "athanasian-creed",
      },
      {
        year: "AD 529",
        label: "Council of Orange",
        detail: "Decisively condemns semi-Pelagianism — the view that humans take the first step toward God. The council affirms: even the beginning of faith is God's sovereign gift. Augustine vindicated.",
        docId: "council-orange",
      },
    ],
  },
  {
    id: "pre-reformation",
    title: "Pre-Reformation",
    subtitle: "1378 – 1516",
    icon: "🌅",
    color: "#fcd34d",
    borderColor: "#92400e",
    events: [
      {
        year: "1378",
        label: "Wycliffe & the English Bible",
        detail: "'Morning Star of the Reformation.' John Wycliffe translates the Bible into English for the first time, attacks papal authority and transubstantiation, and insists Scripture is the supreme rule. His followers — the Lollards — are persecuted but survive.",
        docId: "wycliffe",
      },
      {
        year: "1415",
        label: "Jan Hus Martyred",
        detail: "The Council of Constance burns Jan Hus for preaching Scripture's authority over the papacy — despite a promised safe-conduct. His last words: 'You burn a goose, but a swan will come whom you cannot burn.' Luther would later call himself a Hussite.",
        docId: "jan-hus",
      },
      {
        year: "1455",
        label: "Gutenberg Bible",
        detail: "Johannes Gutenberg's movable-type press produces the first printed Bible. The press will make the Reformation unstoppable — Luther's 95 Theses, spread in weeks across Europe, could never have reached that audience by hand.",
        docId: "gutenberg",
      },
    ],
  },
  {
    id: "reformation",
    title: "Protestant Reformation",
    subtitle: "1517 – 1563",
    icon: "🔥",
    color: "#fb923c",
    borderColor: "#7c2d12",
    events: [
      {
        year: "1517",
        label: "Luther's 95 Theses",
        detail: "Martin Luther nails his 95 Theses to the door of the Castle Church in Wittenberg, challenging the sale of indulgences. Within weeks, printed copies flood Germany. The Reformation begins.",
        docId: "95theses",
      },
      {
        year: "1521",
        label: "Diet of Worms",
        detail: "'Here I stand. I can do no other. God help me. Amen.' Luther refuses to recant before Emperor Charles V. Conscience bound by Scripture alone — not pope, not councils. The formal principle of the Reformation is declared.",
        docId: "diet-of-worms",
      },
      {
        year: "1525",
        label: "Tyndale's New Testament",
        detail: "William Tyndale translates the New Testament from Greek into English — the first such translation — and smuggles it into England in bales of cloth. 83% of the King James Bible will be his words. He is later strangled and burned for it.",
        docId: "tyndale",
      },
      {
        year: "1530",
        label: "Augsburg Confession",
        detail: "Philip Melanchthon presents the Lutheran confession to Emperor Charles V — affirming justification by faith alone, Scripture's authority, and the church as congregation of the faithful.",
        docId: "augsburg-confession",
      },
      {
        year: "1536",
        label: "Calvin's Institutes",
        detail: "John Calvin publishes the Institutes of the Christian Religion in Basel — the masterwork of Reformed theology. Its doctrines of Scripture, sovereignty, grace, justification, and election will shape Westminster (1647) and the 1689 Baptist Confession.",
        docId: "calvins-institutes",
      },
      {
        year: "1537",
        label: "Smalcald Articles",
        detail: "Luther's theological final testament — declaring justification the 'first and chief article' on which 'all that we teach and practice' rests. 'On this article rests all that we teach in opposition to the pope, the devil, and the world.'",
        docId: "smalcald-articles",
      },
      {
        year: "1559",
        label: "Geneva Bible",
        detail: "English exiles in Calvin's Geneva produce the first English Bible with verse numbers and Reformed marginal notes. It becomes the Bible of the Puritans, the Pilgrims, Shakespeare — and the Particular Baptists who will write the 1689 Confession.",
        docId: "geneva-bible",
      },
      {
        year: "1561",
        label: "Belgic Confession",
        detail: "Guido de Brès writes 37 articles of Reformed theology under persecution in the Spanish Netherlands — a faith worth dying for, presented directly to King Philip II. It remains one of the Three Forms of Unity in Reformed churches worldwide.",
        docId: "belgic-confession",
      },
      {
        year: "1563",
        label: "Heidelberg Catechism",
        detail: "'What is your only comfort in life and in death? That I, with body and soul, both in life and death, am not my own, but belong to my faithful Savior Jesus Christ.' The most beloved catechism of the Reformation.",
        docId: "heidelberg",
      },
      {
        year: "1563",
        label: "Thirty-Nine Articles",
        detail: "The Church of England's doctrinal standard — strongly Reformed in its doctrine of justification ('by faith only, a most wholesome doctrine'), election, and Scripture's authority.",
        docId: "thirty-nine-articles",
      },
    ],
  },
  {
    id: "confessional",
    title: "Reformed Confessions",
    subtitle: "1611 – 1648",
    icon: "📜",
    color: "#c084fc",
    borderColor: "#4c1d95",
    events: [
      {
        year: "1611",
        label: "King James Bible",
        detail: "47 scholars produce the Authorized Version — the Bible of the Westminster Assembly, the Puritans, and the Particular Baptists. Its theological vocabulary becomes the language of English-speaking Christianity for 350 years.",
        docId: "king-james-bible",
      },
      {
        year: "1618–19",
        label: "Synod of Dort",
        detail: "Representatives from Reformed churches across Europe convene at Dordrecht to answer Arminius. They affirm the five points: Total Depravity, Unconditional Election, Definite Atonement, Irresistible Grace, Perseverance of the Saints — TULIP.",
        docId: "canons-of-dort",
      },
      {
        year: "1643–47",
        label: "Westminster Assembly",
        detail: "Parliament convenes 121 ministers plus lay commissioners to reform the Church of England. They produce the Westminster Confession of Faith, the Shorter Catechism, and the Larger Catechism — the most thorough systematization of Reformed theology in history.",
        docId: "westminster-confession",
      },
      {
        year: "1647",
        label: "Westminster Confession of Faith",
        detail: "The most comprehensive Reformed confession — 33 chapters covering every major doctrine. Its structure and much of its wording will be adopted by the 1689 Baptist Confession, adapted in ecclesiology and baptism but identical in soteriology.",
        docId: "westminster-confession",
      },
      {
        year: "1647",
        label: "Westminster Shorter Catechism",
        detail: "'What is the chief end of man? Man's chief end is to glorify God, and to enjoy him forever.' 107 questions and answers that have formed generations of Reformed and Baptist children in the faith.",
        docId: "westminster-shorter",
      },
      {
        year: "1648",
        label: "Westminster Larger Catechism",
        detail: "196 questions for public worship and mature instruction — especially renowned for its exhaustive exposition of the Ten Commandments, showing both what is required and what is forbidden in each.",
        docId: "westminster-larger",
      },
    ],
  },
  {
    id: "baptist",
    title: "Baptist Roots & the 1689",
    subtitle: "1644 – 1689",
    icon: "🛡",
    color: "#f0c060",
    borderColor: "#78350f",
    events: [
      {
        year: "1644",
        label: "First London Baptist Confession",
        detail: "Seven London Particular Baptist churches produce their first confession — fully Calvinist in soteriology, explicitly affirming believer's baptism by immersion. The founding document of the Particular Baptist movement.",
        docId: "first-london-baptist",
      },
      {
        year: "1677",
        label: "Second London Baptist Confession (Draft)",
        detail: "During severe persecution under the Conventicle Acts, Particular Baptist leaders draft a revised confession following the Westminster Confession closely — making Baptist modifications in ecclesiology and baptism, but identical in Reformed soteriology. Circulated privately.",
        docId: "1689-lbc",
      },
      {
        year: "1678",
        label: "Pilgrim's Progress",
        detail: "John Bunyan — Bedford tinker, Particular Baptist, and prisoner for his faith — publishes the greatest allegory in the English language. Christian's journey from the City of Destruction to the Celestial City maps the 1689's ordo salutis in story form.",
      },
      {
        year: "1689",
        label: "Second London Baptist Confession",
        detail: "Following the Glorious Revolution and the Toleration Act, 107 Particular Baptist churches from England and Wales formally adopt the confession. The crown of the Reformed Baptist tradition — standing at the end of a line that runs through Nicaea, Augustine, Wycliffe, Hus, Luther, Calvin, Westminster, and the London Baptist churches.",
        docId: "1689-lbc",
        isTarget: true,
      },
    ],
  },
];

// ─── Color maps ───────────────────────────────────────────────────────────────

const SECTION_DOT_COLORS: Record<string, { dot: string; glow: string; line: string }> = {
  "early-church":    { dot: "#6ee7b7", glow: "rgba(110,231,183,0.4)", line: "rgba(110,231,183,0.2)" },
  "pre-reformation": { dot: "#fbbf24", glow: "rgba(251,191,36,0.4)",  line: "rgba(251,191,36,0.2)"  },
  "reformation":     { dot: "#fb923c", glow: "rgba(251,146,60,0.4)",  line: "rgba(251,146,60,0.2)"  },
  "confessional":    { dot: "#c084fc", glow: "rgba(192,132,252,0.4)", line: "rgba(192,132,252,0.2)" },
  "baptist":         { dot: "#f0c060", glow: "rgba(240,192,96,0.5)",  line: "rgba(240,192,96,0.2)"  },
};

// ─── Components ───────────────────────────────────────────────────────────────

function SectionHeader({ section, isLight }: { section: TimelineSection; isLight: boolean }) {
  return (
    <div className="relative flex items-center gap-4 mb-8 mt-12 first:mt-0">
      {/* Accent line */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, ${section.color}60, transparent)` }}
      />
      {/* Badge */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
        style={{
          background: isLight ? `${section.color}18` : `${section.color}14`,
          border: `1px solid ${section.color}40`,
          color: section.color,
        }}
      >
        <span>{section.icon}</span>
        <span className="uppercase tracking-wider">{section.title}</span>
        <span className="opacity-60 font-normal">{section.subtitle}</span>
      </div>
      {/* Accent line */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${section.color}60)` }}
      />
    </div>
  );
}

function TimelineItem({
  event,
  sectionId,
  isLast,
  isLight,
}: {
  event: TimelineEvent;
  sectionId: string;
  isLast: boolean;
  isLight: boolean;
}) {
  const colors = SECTION_DOT_COLORS[sectionId] ?? SECTION_DOT_COLORS["early-church"];
  const isTarget = event.isTarget;

  const content = (
    <div
      className="flex gap-4 group cursor-pointer relative"
      style={{ paddingBottom: isLast ? 0 : "28px" }}
    >
      {/* Timeline spine */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-7 bottom-0 w-px pointer-events-none"
          style={{ background: colors.line }}
        />
      )}

      {/* Dot */}
      <div className="flex-shrink-0 relative z-10 mt-1">
        {isTarget ? (
          // Special target dot for 1689
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #f0c060, #c9a227)",
              boxShadow: "0 0 0 4px rgba(240,192,96,0.2), 0 0 16px rgba(240,192,96,0.5)",
            }}
          >
            <span style={{ fontSize: "10px" }}>✦</span>
          </div>
        ) : (
          <div
            className="w-[22px] h-[22px] rounded-full border-2 transition-all duration-200 group-hover:scale-110"
            style={{
              background: event.docId
                ? `radial-gradient(circle, ${colors.dot}cc, ${colors.dot}66)`
                : isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
              borderColor: event.docId ? colors.dot : isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)",
              boxShadow: event.docId ? `0 0 8px ${colors.glow}` : "none",
            }}
          />
        )}
      </div>

      {/* Content card */}
      <div
        className="flex-1 rounded-xl p-4 transition-all duration-200"
        style={{
          background: isTarget
            ? isLight ? "rgba(240,192,96,0.12)" : "rgba(240,192,96,0.08)"
            : event.docId
              ? isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.03)"
              : isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.015)",
          border: isTarget
            ? "1px solid rgba(240,192,96,0.4)"
            : event.docId
              ? isLight ? `1px solid ${colors.dot}25` : `1px solid ${colors.dot}18`
              : isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Year + title row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-black tracking-widest uppercase font-mono"
              style={{
                color: isTarget ? "#f0c060" : colors.dot,
                opacity: isTarget ? 1 : 0.9,
              }}
            >
              {event.year}
            </span>
            <span
              className="font-bold text-sm leading-snug"
              style={{ color: isLight ? "#1c1409" : "rgba(255,255,255,0.92)" }}
            >
              {event.label}
            </span>
            {isTarget && (
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: "rgba(240,192,96,0.2)", color: "#f0c060" }}
              >
                Destination
              </span>
            )}
          </div>

          {event.docId && (
            <span
              className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{
                background: isTarget ? "rgba(240,192,96,0.2)" : `${colors.dot}18`,
                color: isTarget ? "#f0c060" : colors.dot,
              }}
            >
              Read →
            </span>
          )}
        </div>

        {/* Detail text */}
        <p
          className="text-xs leading-relaxed"
          style={{ color: isLight ? "#6b5226" : "rgba(255,255,255,0.48)" }}
        >
          {event.detail}
        </p>
      </div>
    </div>
  );

  if (event.docId) {
    return (
      <Link href={`/learn?doc=${event.docId}`} className="block no-underline">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { theme } = useTheme();
  const isLight = theme === "light-elegant";

  const pageBg      = isLight ? "#f5f1eb" : "#0e0e18";
  const textPrimary = isLight ? "#1c1409" : "rgba(255,255,255,0.95)";
  const textMuted   = isLight ? "#9b8560" : "rgba(255,255,255,0.35)";
  const heroBg      = isLight
    ? "linear-gradient(135deg,#78350f 0%,#9b7228 55%,#3b1a00 100%)"
    : "linear-gradient(135deg,#1a0845 0%,#3b1a00 55%,#0f0a2a 100%)";

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textPrimary }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-5 pt-8 pb-10"
        style={{ background: heroBg }}
      >
        {/* decorative glows */}
        <div className="absolute top-4 right-4 w-40 h-40 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #f0c060, transparent 70%)" }} />
        <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />

        <div className="relative">
          {/* eyebrow */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-70 text-amber-200">
            Reformed Heritage
          </p>

          <h1 className="text-2xl font-black text-white leading-tight mb-2">
            Road to the<br />
            <span style={{ color: "#f0c060" }}>1689 Confession</span>
          </h1>

          <p className="text-xs leading-relaxed mb-5 opacity-70 text-amber-100">
            From the Jerusalem Council to the Second London Baptist Confession —
            every event, every document, every martyr who shaped the Reformed Baptist faith.
          </p>

          {/* stat pills */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Events", value: TIMELINE_SECTIONS.reduce((n, s) => n + s.events.length, 0).toString() },
              { label: "Sections", value: TIMELINE_SECTIONS.length.toString() },
              { label: "Years", value: "~1,640" },
              { label: "Documents", value: "Tap to read" },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 py-1.5 rounded-full text-[10px]"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span className="font-black text-white">{value}</span>
                <span className="ml-1 opacity-60 text-amber-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center gap-4 text-[10px]"
        style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: "radial-gradient(circle,#6ee7b7cc,#6ee7b766)", border: "2px solid #6ee7b7", boxShadow: "0 0 6px rgba(110,231,183,0.4)" }} />
          <span style={{ color: textMuted }}>Has document — tap to read</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)", border: isLight ? "2px solid rgba(0,0,0,0.15)" : "2px solid rgba(255,255,255,0.12)" }} />
          <span style={{ color: textMuted }}>Historical event</span>
        </div>
      </div>

      {/* ── Jump links ───────────────────────────────────────────────────── */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto hide-scrollbar"
        style={{ borderBottom: isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.04)" }}>
        {TIMELINE_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold no-underline"
            style={{
              background: `${s.color}14`,
              border: `1px solid ${s.color}30`,
              color: s.color,
            }}
          >
            {s.icon} {s.title}
          </a>
        ))}
      </div>

      {/* ── Timeline body ─────────────────────────────────────────────────── */}
      <div className="px-4 py-6 max-w-2xl mx-auto">

        {TIMELINE_SECTIONS.map((section) => (
          <div key={section.id} id={section.id}>
            <SectionHeader section={section} isLight={isLight} />

            <div>
              {section.events.map((event, idx) => (
                <TimelineItem
                  key={`${event.year}-${event.label}`}
                  event={event}
                  sectionId={section.id}
                  isLast={idx === section.events.length - 1}
                  isLight={isLight}
                />
              ))}
            </div>
          </div>
        ))}

        {/* ── End marker ──────────────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{
              background: "linear-gradient(135deg,#f0c060,#c9a227)",
              boxShadow: "0 0 0 6px rgba(240,192,96,0.15), 0 0 24px rgba(240,192,96,0.4)",
            }}
          >
            ✦
          </div>
          <p className="font-black text-base" style={{ color: "#f0c060" }}>
            1689
          </p>
          <p className="font-bold text-sm" style={{ color: textPrimary }}>
            Second London Baptist Confession of Faith
          </p>
          <p className="text-xs max-w-xs leading-relaxed" style={{ color: textMuted }}>
            The crown of the Reformed Baptist tradition — adopted by 107 churches,
            standing on the shoulders of 1,640 years of faithful witnesses.
          </p>
          <Link
            href="/learn?doc=1689-lbc"
            className="mt-2 px-6 py-3 rounded-full font-bold text-sm no-underline active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg,#f0c060,#c9a227)",
              color: "#1a0e00",
            }}
          >
            Read the 1689 Confession →
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] mt-10 mb-2" style={{ color: textMuted }}>
          Tap any highlighted event to open the full document
        </p>
      </div>

    </div>
  );
}
