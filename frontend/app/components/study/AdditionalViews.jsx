"use client";
import React, {useState} from "react";
import Markdown from "react-markdown";
import {
  House,
  BookOpen,
  NotebookPen,
  BookHeart,
  Grid2X2,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  X,
  Check,
  Copy,
  Bookmark,
  Heart,
  Type,
  SlidersHorizontal,
  Sun,
  Moon,
  UserRound,
  Play,
  Pause,
  Volume2,
  ScrollText,
  Library,
  CalendarDays,
  ChartNoAxesColumn,
  Clock3,
  Church,
  UsersRound,
  HandHeart,
  Quote,
  ShieldCheck,
  FileText,
  CheckCheck,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  RotateCcw,
  List,
  CheckSquare,
  Bold,
  Italic,
  Link2,
  Download,
  Trash2,
  TriangleAlert,
  MoveHorizontal,
  PanelBottomClose,
} from "lucide-react";
import { useApp, PageHeading, SearchField, SectionTitle, Row, Action } from "./Views";
export default function AdditionalViews(){
const a = useApp(),
    screen = a.screen;
const [query, setQuery] = useState("");
const meta = null;
const title =
    meta?.[1] ||
    {
      profile: "Your study space",
      privacy: "Your privacy",
      history: "Church history",
    }[screen] ||
    "Study space";
if (screen === "study-tools")
    return (
      <>
        <PageHeading title="Go deeper." kicker="STUDY TOOLS" />
        <div className="page-pad">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search the dictionary"
          />
          <SectionTitle>Dictionary</SectionTitle>
          {a.catalog.dictionary
            .filter((x) =>
              JSON.stringify(x).toLowerCase().includes(query.toLowerCase()),
            )
            .map((entry, i) => (
              <details className="dictionary-entry" key={i}>
                <summary>
                  {entry.term || entry.word || entry.title}
                  <Plus size={16} />
                </summary>
                <div className="body-copy">
                  <Markdown>
                    {entry.definition ||
                      entry.description ||
                      entry.content ||
                      ""}
                  </Markdown>
                </div>
              </details>
            ))}
          <SectionTitle>Commentary</SectionTitle>
          <Row
            icon={BookOpen}
            title="Expository Thoughts on John"
            sub="J.C. Ryle"
            onClick={() => a.go("devotional", {step: 1})}
          />
          <Row
            icon={Library}
            title="Matthew Henry"
            sub="Commentary library"
            onClick={() => a.go("study-tools", {view: "commentary"})}
          />
        </div>
      </>
    );
if (screen === "videos")
    return (
      <>
        <PageHeading
          title={<>Watch.<br/>Listen. Reflect.</>}
          kicker="VIDEO LIBRARY"
        />
        <div className="page-pad">
          <button
            className="video-feature"
            onClick={() =>
              a.open("video", {
                title: "HeartCry Missionary's Testimony",
                src: "/videos/featured-en.mp4",
              })
            }
          >
            <img src="/meditation-thumb.jpg" alt="HeartCry missionary" />
            <span className="large-play">
              <Play size={23} fill="currentColor" />
            </span>
          </button>
          <p className="eyebrow">FEATURED TESTIMONY</p>
          <h2 className="video-feature-title">A life given to the gospel</h2>
          <Row
            icon={Play}
            title="HeartCry Missionary's Testimony"
            sub="English"
            onClick={() =>
              a.open("video", {
                title: "HeartCry Missionary's Testimony",
                src: "/videos/featured-en.mp4",
              })
            }
          />
          <Row
            icon={Play}
            title="Testimonio Misionero HeartCry"
            sub="Español"
            onClick={() =>
              a.open("video", {
                title: "Testimonio Misionero HeartCry",
                src: "/videos/featured-es.mp4",
              })
            }
          />
          <Row icon={Library} title="All teaching and testimony" sub="Browse the full video library" onClick={()=>a.go("videos",{view:"all"})}/>
        </div>
      </>
    );
if (screen === "quotes")
    return (
      <>
        <PageHeading
          title={<>Words with<br/>lasting weight.</>}
          kicker="COLLECTED WISDOM"
        />
        <div className="page-pad">
          <img
            className="quote-portrait"
            src="/quotes/jc-ryle.jpg"
            alt="J.C. Ryle"
          />
          <blockquote className="quote-large">
            “Happy indeed is that church whose members not only desire to reach
            heaven themselves, but desire also to take others with them.”
          </blockquote>
          <p className="source-line">J.C. Ryle / 1816–1900</p>
          <Action
            secondary
            icon={Copy}
            onClick={() =>
              navigator.clipboard
                .writeText(
                  "Happy indeed is that church whose members not only desire to reach heaven themselves, but desire also to take others with them. — J.C. Ryle",
                )
                .then(() => a.notify("Copied"))
            }
          >
            Copy quotation
          </Action>
          <Row icon={Quote} title="Explore the collection" sub="Quotes, images and sharing" onClick={()=>a.go("quotes",{view:"collection"})}/>
        </div>
      </>
    );
if (screen === "kids")
    return (
      <>
        <PageHeading title={<>Read<br/>together.</>} kicker="CHILDREN'S READING" />
        <div className="page-pad">
          <div className="children-art">
            <img
              src="/books/believe-and-be-saved.jpg"
              alt="Christian reading"
            />
          </div>
          {a.catalog.books
            .filter((b) =>
              [
                "duties-of-parents",
                "thoughts-for-young-men",
                "pilgrims-progress",
              ].includes(b.slug),
            )
            .map((b) => (
              <Row
                icon={BookHeart}
                key={b.slug}
                title={b.title}
                sub={b.author}
                onClick={() => a.go("detail", { kind: "book", id: b.slug })}
              />
            ))}
          <Row icon={Library} title="Children's book catalog" sub="Browse all ages and titles" onClick={()=>a.go("kids",{view:"catalog"})}/>
        </div>
      </>
    );
return null;
}
