"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

import { createPortal } from "react-dom";
import { useLanguage } from "../../lib/useLanguage";

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

const cache = new Map();

function useResource(url) {
  const [state, setState] = useState({
    data: cache.get(url),
    loading: !cache.has(url),
    error: null,
  });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    if (!url) return;
    const existing = cache.get(url);
    setState({ data: existing, loading: !existing, error: null });
    if (existing) return;
    fetch(url, { signal: abort.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw Error(
            data.error || data.detail || "Unable to load this reading.",
          );
        return data;
      })
      .then((data) => {
        cache.set(url, data);
        setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setState({ data: null, loading: false, error: e.message });
      });
    return () => abort.abort();
  }, [url, retry]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}

function useCount(value) {
  const { motion } = useApp();
  const [shown, setShown] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (!motion) {
      setShown(value);
      return;
    }
    let frame;
    const started = performance.now();
    const draw = (now) => {
      const p = Math.min(1, (now - started) / 550);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [value, motion]);
  return shown;
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  selected = false,
  className = "",
  ...rest
}) {
  return (
    <button
      type="button"
      className={"icon-button " + className + (selected ? " selected" : "")}
      aria-label={label}
      title={label}
      onClick={onClick}
      {...rest}
    >
      <Icon size={20} strokeWidth={1.65} />
    </button>
  );
}

function Action({
  children,
  onClick,
  icon: Icon = ArrowRight,
  secondary = false,
  disabled = false,
}) {
  return (
    <button
      className={"action " + (secondary ? "secondary" : "")}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{children}</span>
      <Icon size={18} strokeWidth={1.7} />
    </button>
  );
}

/** @param {{title?: React.ReactNode, kicker?: string, back?: boolean, action?: React.ReactNode}} props */
function PageHeading({ title = null, kicker = "", back = true, action = null }) {
  const a = useApp();
  return (
    <>
      <header className="topbar">
        <div>
          {back ? (
            <IconButton
              icon={ArrowLeft}
              label="Back"
              onClick={() => a.go(a.screen === "detail" ? (a.params.kind === "doc" ? "documents" : "library") : "more")}
            />
          ) : (
            <span className="wordmark">
              TULIP<span className="wordmark-period">.</span>
            </span>
          )}
        </div>
        <span className="topbar-caption">{kicker || ""}</span>
        <div>
          {action || (
            <IconButton
              icon={UserRound}
              label="Your profile"
              onClick={() => a.go("profile")}
            />
          )}
        </div>
      </header>
      {title && (
        <div className="page-heading">
          <p className="eyebrow">{kicker}</p>
          <h1>{title}</h1>
        </div>
      )}
    </>
  );
}

/** @param {{children: React.ReactNode, action?: string, onClick?: React.MouseEventHandler<HTMLButtonElement>}} props */
function SectionTitle({ children, action, onClick }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action && (
        <button className="text-command" onClick={onClick}>
          {action}
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}

function Tabs({ items, value, onChange }) {
  const active = Math.max(
    0,
    items.findIndex((x) => (typeof x === "string" ? x : x.id) === value),
  );
  return (
    <div
      className="tabs"
      role="tablist"
      style={{ "--count": items.length, "--active": active }}
    >
      <span className="tab-indicator" />
      {items.map((item) => {
        const id = typeof item === "string" ? item : item.id;
        const label = typeof item === "string" ? item : item.label;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={id === value}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SearchField({
  value,
  onChange,
  placeholder = "Search",
  label = "Search",
}) {
  return (
    <label className="search-field">
      <Search size={18} strokeWidth={1.6} />
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={16} />
        </button>
      )}
    </label>
  );
}

/** @param {{icon?: React.ElementType, title: React.ReactNode, sub?: React.ReactNode, onClick?: React.MouseEventHandler<HTMLButtonElement>, after?: React.ReactNode, muted?: boolean}} props */
function Row({ icon: Icon, title, sub, onClick, after, muted = false }) {
  return (
    <button className={"list-row " + (muted ? "muted" : "")} onClick={onClick}>
      {Icon && (
        <span className="row-icon">
          <Icon size={21} strokeWidth={1.5} />
        </span>
      )}
      <span className="row-copy">
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </span>
      {after || (
        <ChevronRight className="row-chevron" size={17} strokeWidth={1.5} />
      )}
    </button>
  );
}

function Loading() {
  return (
    <div className="loading-state" role="status" aria-label="Loading content">
      <span className="loading-track" />
      <span className="skeleton" />
      <span className="skeleton short" />
      <span className="skeleton" />
    </div>
  );
}

function ErrorState({ message, retry }) {
  return (
    <div className="error-state" role="alert">
      <TriangleAlert size={22} />
      <p>{message}</p>
      {retry && (
        <button className="text-command" onClick={retry}>
          Try again
          <RotateCcw size={15} />
        </button>
      )}
    </div>
  );
}

function Empty({ title, children }) {
  return (
    <div className="empty">
      <BookOpen size={27} strokeWidth={1.2} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Dial({
  value = 0,
  total = 4,
  size = 96,
  label = "Daily progress",
  count,
}) {
  const canvas = useRef(null);
  const { motion, theme } = useApp();
  const n = useCount(count ?? value);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    el.width = size * dpr;
    el.height = size * dpr;
    const ctx = el.getContext("2d");
    ctx.scale(dpr, dpr);
    let frame;
    const started = performance.now();
    const styles = getComputedStyle(document.documentElement);
    const fg = styles.getPropertyValue("--ink").trim(),
      line = styles.getPropertyValue("--line").trim();
    const render = (now) => {
      ctx.clearRect(0, 0, size, size);
      const r = size * 0.42,
        c = size / 2;
      const entrance = motion ? Math.min(1, (now - started) / 900) : 1;
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const complete = i / 60 < value / total;
        const active = Math.floor((value / total) * 60) === i;
        ctx.beginPath();
        ctx.strokeStyle = complete ? fg : line;
        ctx.lineWidth = active ? 2 : 1;
        ctx.globalAlpha =
          active && motion ? 0.55 + 0.45 * Math.sin(now / 550) : 1;
        ctx.moveTo(
          c + Math.cos(angle) * (r - 5),
          c + Math.sin(angle) * (r - 5),
        );
        ctx.lineTo(c + Math.cos(angle) * r, c + Math.sin(angle) * r);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.arc(
        c,
        c,
        r - 12,
        -Math.PI / 2,
        -Math.PI / 2 + Math.max(0.003, value / total) * Math.PI * 2 * entrance,
      );
      ctx.stroke();
      if (motion) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [value, total, size, motion, theme]);
  return (
    <div
      className="dial"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemax={total}
    >
      <canvas ref={canvas} aria-hidden="true" />
      <div>
        <strong>{n}</strong>
        <span>{count !== undefined ? "chapters" : `of ${total}`}</span>
      </div>
    </div>
  );
}

function Jacket({ book, document = false, large = false, index = 0 }) {
  return (
    <div
      className={"jacket edition-" + (index % 4) + (large ? " large" : "")}
      aria-label={book.title + " cover"}
    >
      <div className="jacket-top">
        <span>TULIP</span>
        <span>{document ? "ARCHIVE" : "CLASSICS"}</span>
      </div>
      <div className="jacket-title">
        <small>{book.year || "CLASSIC"}</small>
        <strong>{book.shortTitle || book.title}</strong>
      </div>
      {book.author === "J.C. Ryle" && (
        <img
          className="jacket-portrait"
          src="/quotes/jc-ryle.jpg"
          alt="J.C. Ryle"
        />
      )}
      <div className="jacket-bottom">
        {book.author || book.origin || "Historic Christianity"}
      </div>
      <span className="jacket-spine" />
    </div>
  );
}

function Home() {
  const a = useApp();
  const today = a.catalog.today;
  const steps = a.daySteps;
  const completed = steps.filter(Boolean).length;
  return (
    <div className="home-page">
      <PageHeading
        back={false}
        kicker={new Intl.DateTimeFormat("en", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(new Date())}
      />
      <section className="daily-word">
        <div className="eyebrow">
          <span className="live-tick" />
          THE DAILY WORD
        </div>
        <h1>
          Abide in me.
          <br />
          <em>And I in you.</em>
        </h1>
        <button
          className="verse-reference"
          onClick={() => a.go("scripture", { book: 43, chapter: 15 })}
        >
          John 15:4 <ArrowUpRight size={16} />
        </button>
      </section>
      <button
        className="resume-row"
        onClick={() => a.go("scripture", { book: a.resume.book, chapter: a.resume.chapter })}
      >
        <BookOpen size={22} strokeWidth={1.4} />
        <span>
          <small>CONTINUE READING</small>
          <strong>
            {a.resume.name} {a.resume.chapter} <span>{a.resume.book===43&&a.resume.chapter===15?"The true vine":"Your last chapter"}</span>
          </strong>
        </span>
        <ArrowRight size={20} />
        <span className="resume-line">
          <i />
        </span>
      </button>
      <section className="rhythm-section">
        <SectionTitle action="Today" onClick={() => a.go("devotional")}>
          Your daily rhythm
        </SectionTitle>
        <div className="rhythm-instrument">
          <Dial value={completed} total={4} size={112} />
          <div className="rhythm-stages">
            {["Scripture", "Reflection", "Hymn", "Prayer"].map((s, i) => (
              <button
                key={s}
                className={steps[i] ? "done" : i === completed ? "current" : ""}
                onClick={() => a.go("devotional", { step: i })}
              >
                <span className="stage-mark">
                  {steps[i] ? <Check size={11} /> : <span />}
                </span>
                <span>{s}</span>
                <small>
                  {steps[i] ? "Completed" : i === completed ? "Up next" : ""}
                </small>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section>
        <SectionTitle action="Explore" onClick={() => a.go("videos")}>
          Featured
        </SectionTitle>
        <div className="media-rail featured-video-only">
          <button
            className="media-item"
            onClick={() =>
              a.open("video", {
                title: "HeartCry Missionary's Testimony",
                src: "/videos/featured-en.mp4",
              })
            }
          >
            <div className="media-photo">
              <img
                src="/meditation-thumb.jpg"
                alt="HeartCry missionary testimony"
              />
              <span className="play-well">
                <Play size={17} fill="currentColor" />
              </span>
            </div>
            <small>MEDITATION</small>
            <h3>A life given to the gospel</h3>
          </button>
        </div>
      </section>
      <section className="memory-preview">
        <SectionTitle>Keep the Word close</SectionTitle>
        <p className="reading-serif">
          “Thy word have I hid in mine heart, that I might not sin against
          thee.”
        </p>
        <div className="section-foot">
          <span>Psalm 119:11</span>
          <button className="text-command" onClick={() => a.open("memory")}>
            Memorize
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
      <section>
        <SectionTitle action="Library" onClick={() => a.go("library")}>
          From your library
        </SectionTitle>
        <div className="book-rail compact">
          {a.catalog.books.slice(0, 4).map((b, i) => (
            <button
              key={b.slug}
              onClick={() => a.go("detail", { id: b.slug, kind: "book" })}
            >
              <Jacket book={b} index={i} />
              <strong>{b.title}</strong>
              <small>{b.author}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LibraryPage({ documents = false }) {
  const a = useApp();
  const [tab, setTab] = useState("All"),
    [query, setQuery] = useState("");
  const source = documents ? a.catalog.documents : a.catalog.books;
  const key = documents ? "doc" : "book";
  const data = source.filter(
    (item) =>
      `${item.title} ${item.author || item.origin}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (tab === "All" ||
        (tab === "Favorites"
          ? a.favorites.includes(key + ":" + (item.slug || item.id))
          : a.progress[key + ":" + (item.slug || item.id)])),
  );
  const [selectedYear, setSelectedYear] = useState(1647);
  const rail = useRef(null);
  const pick = (item) =>
    a.go("detail", { kind: key, id: item.slug || item.id });
  return (
    <>
      <PageHeading
        kicker={documents ? "THE ARCHIVE" : "THE LIBRARY"}
        action={
          <IconButton
            icon={Heart}
            label="Show favorites"
            selected={tab === "Favorites"}
            onClick={() => setTab(tab === "Favorites" ? "All" : "Favorites")}
          />
        }
      />
      <div className="page-pad library-heading">
        <p className="eyebrow">
          {documents ? "FAITH THROUGH THE CENTURIES" : "THE WRITTEN WORD"}
        </p>
        <h1>
          {documents ? (
            <>
              Historical
              <br />
              documents.
            </>
          ) : (
            <>
              The reading
              <br />
              room.
            </>
          )}
        </h1>
        <p className="page-subtitle">
          {documents
            ? "Creeds, confessions and the voices that shaped the church."
            : "Timeless Christian works. A place to read deeply."}
        </p>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={
            documents ? "Search the archive" : "Find a title or author"
          }
        />
        <Tabs
          items={["All", "Reading", "Favorites"]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {documents && tab === "All" && !query && (
        <section className="archive-timeline">
          <div className="timeline-year">
            <span className="eyebrow">THROUGH TIME</span>
            <strong>
              {selectedYear < 0 ? Math.abs(selectedYear) + " BC" : selectedYear}
            </strong>
          </div>
          <div
            className="timeline-tape"
            ref={rail}
            onScroll={(e) => {
              const index = Math.round(e.currentTarget.scrollLeft / 84);
              const doc = [...source].sort((a, b) => a.year - b.year)[
                Math.min(index, source.length - 1)
              ];
              if (doc) setSelectedYear(doc.year);
            }}
          >
            {[...source]
              .sort((a, b) => a.year - b.year)
              .map((doc) => (
                <button key={doc.id} onClick={() => pick(doc)}>
                  <span className="tape-ticks" />
                  <strong>{doc.year}</strong>
                  <span>{doc.shortTitle}</span>
                </button>
              ))}
          </div>
        </section>
      )}
      <div className="page-pad">
        <SectionTitle>
          {tab === "Favorites"
            ? "Your favorites"
            : documents
              ? "From the archive"
              : tab === "Reading"
                ? "Continue reading"
                : "The collection"}
          <span className="section-count">{data.length}</span>
        </SectionTitle>
        {data.length ? (
          <div className="library-grid">
            {data.map((item, index) => (
              <div className="library-item" key={item.slug || item.id}>
                <button className="cover-command" onClick={() => pick(item)}>
                  <Jacket book={item} document={documents} index={index} />
                </button>
                <IconButton
                  className="favorite-corner"
                  icon={Heart}
                  label={
                    a.favorites.includes(key + ":" + (item.slug || item.id))
                      ? "Remove favorite"
                      : "Add favorite"
                  }
                  selected={a.favorites.includes(
                    key + ":" + (item.slug || item.id),
                  )}
                  onClick={() =>
                    a.toggleFavorite(key + ":" + (item.slug || item.id))
                  }
                />
                <button
                  className="library-item-copy"
                  onClick={() => pick(item)}
                >
                  <strong>{item.shortTitle || item.title}</strong>
                  <span>{item.author || item.origin}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title={
              tab === "Favorites"
                ? "Your own small library"
                : "Nothing here yet"
            }
          >
            {tab === "Favorites"
              ? "Favorite a title to keep it here."
              : "Choose a different title or search."}
          </Empty>
        )}
      </div>
    </>
  );
}

function Detail() {
  const a = useApp(),
    kind = a.params.kind || "book",
    id = a.params.id;
  const item = (kind === "doc" ? a.catalog.documents : a.catalog.books).find(
    (x) => (x.slug || x.id) === id,
  );
  const bookMeta = useResource(kind === "book" ? `/api/books/${id}` : null);
  if (!item)
    return (
      <Empty title="Title unavailable">
        Return to the library to choose another reading.
      </Empty>
    );
  const favorite = a.favorites.includes(kind + ":" + id);
  const progress = a.progress[kind + ":" + id] || 0;
  const sections = kind === "doc" ? item.sections : bookMeta.data?.chapters;
  return (
    <>
      <PageHeading
        kicker={kind === "doc" ? "HISTORICAL DOCUMENT" : "FREE BOOK"}
        action={
          <IconButton
            icon={MoreHorizontal}
            label="Reading options"
            onClick={() => a.open("detail-options", { item, kind })}
          />
        }
      />
      <div className="detail-hero page-pad">
        <div className="detail-jacket">
          <Jacket
            book={item}
            document={kind === "doc"}
            large
            index={Math.max(
              0,
              (kind === "doc" ? a.catalog.documents : a.catalog.books).indexOf(
                item,
              ),
            )}
          />
        </div>
        <h1>{item.title}</h1>
        <p>
          {item.author || item.origin}
          <span>/</span>
          {item.year}
        </p>
        <div className="detail-actions">
          <Action
            icon={BookOpen}
            onClick={() => a.go("reader", { kind, id, chapter: progress || 1 })}
          >
            {progress ? "Continue reading" : "Read now"}
          </Action>
          <IconButton
            className="detail-heart"
            icon={Heart}
            label={favorite ? "Remove favorite" : "Add favorite"}
            selected={favorite}
            onClick={() => a.toggleFavorite(kind + ":" + id)}
          />
        </div>
        <div className="detail-progress">
          <span>{progress ? "Chapter " + progress : "Not started"}</span>
          <span>
            {sections?.length || "—"} {kind === "doc" ? "sections" : "chapters"}
          </span>
        </div>
        <div className="thin-progress">
          <i
            style={{
              width:
                (progress && sections
                  ? (progress / sections.length) * 100
                  : 0) + "%",
            }}
          />
        </div>
      </div>
      <div className="page-pad detail-content">
        <SectionTitle>
          About this {kind === "doc" ? "document" : "book"}
        </SectionTitle>
        <p className="body-copy">{item.description}</p>
        <details className="contents" open>
          <summary>
            <span>Contents</span>
            <ChevronDown size={16} />
          </summary>
          <div className="contents-body">
            {sections?.map((section, i) => (
              <button
                key={section.id || i}
                onClick={() => a.go("reader", { kind, id, chapter: i + 1 })}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{section.title}</strong>
                <ArrowUpRight size={15} />
              </button>
            )) || <Loading />}
          </div>
        </details>
      </div>
    </>
  );
}

const tools = [
  ["study-tools", "Study tools", "Commentary & dictionary", BookOpen],
  ["library", "Free books", "The reading room", Library],
  ["documents", "Historical documents", "Creeds & confessions", ScrollText],
  ["videos", "Video library", "Teaching & testimony", Play],
  ["plans", "Reading plans", "One day at a time", CalendarDays],
  [
    "tracker",
    "Bible tracker",
    "Your journey through Scripture",
    ChartNoAxesColumn,
  ],
  ["highlights", "Saved passages", "Words to return to", Bookmark],
  ["quotes", "Collected wisdom", "From trusted Christian voices", Quote],
  ["kids", "Children's books", "Read together", BookHeart],
  [
    "church-analysis",
    "Church analysis",
    "Discern sermons & teaching",
    ShieldCheck,
  ],
  ["churches", "Find a church", "Reformed congregations", Church],
  ["fellowship", "Fellowship", "Community & encouragement", UsersRound],
  ["give", "Give", "Support the ministry", HandHeart],
];

function More() {
  const a = useApp();
  const { lang, setLang } = useLanguage();
  return (
    <>
      <PageHeading back={false} kicker="YOUR STUDY SPACE" />
      <div className="page-pad">
        <div className="more-heading">
          <h1>
            More to
            <br />
            <em>discover.</em>
          </h1>
          <span className="more-index">
            13
            <br />
            <small>RESOURCES</small>
          </span>
        </div>
        <button className="account-row" onClick={() => a.go("profile")}>
          <span className="avatar"><UserRound size={20} /></span>
          <span>
            <strong>Your study space</strong>
            <small>{a.accountLabel || "Your account"}</small>
          </span>
          <ArrowUpRight size={18} />
        </button>
        <SectionTitle>Library & study</SectionTitle>
        <div className="tool-list">
          {tools.slice(0, 4).map(([screen, title, sub, icon]) => (
            <Row
              key={screen}
              title={title}
              sub={sub}
              icon={icon}
              onClick={() => a.go(screen)}
            />
          ))}
        </div>
        <SectionTitle>Daily rhythms</SectionTitle>
        <div className="tool-list">
          {tools.slice(4, 8).map(([screen, title, sub, icon]) => (
            <Row
              key={screen}
              title={title}
              sub={sub}
              icon={icon}
              onClick={() => a.go(screen)}
            />
          ))}
        </div>
        <SectionTitle>Community & beyond</SectionTitle>
        <div className="tool-list">
          {tools.slice(8).map(([screen, title, sub, icon]) => (
            <Row
              key={screen}
              title={title}
              sub={sub}
              icon={icon}
              onClick={() => a.go(screen)}
            />
          ))}
        </div>
        <SectionTitle>Make it yours</SectionTitle>
        <div className="setting-row">
          <span>Appearance</span>
          <div
            className="theme-switch"
            style={{ "--selected": a.theme === "dark" ? 1 : 0 }}
          >
            <i />
            <button
              aria-pressed={a.theme === "light"}
              aria-label="Light appearance"
              onClick={() => a.setTheme("light")}
            >
              <Sun size={17} />
            </button>
            <button
              aria-pressed={a.theme === "dark"}
              aria-label="Dark appearance"
              onClick={() => a.setTheme("dark")}
            >
              <Moon size={17} />
            </button>
          </div>
        </div>
        <div className="setting-row">
          <span>Interface motion</span>
          <button
            className={"switch " + (a.motionRequested ? "on" : "")}
            role="switch"
            aria-checked={a.motionRequested}
            aria-label="Interface motion"
            onClick={() => a.setMotionRequested(!a.motionRequested)}
          >
            <i />
          </button>
        </div>
        <div className="setting-row">
          <span>Language</span>
          <div className="language-switch" role="group" aria-label="App language">
            <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
            <button aria-pressed={lang === "es"} onClick={() => setLang("es")}>ES</button>
          </div>
        </div>
        <Row
          title="Privacy"
          icon={ShieldCheck}
          onClick={() => a.go("privacy")}
        />
        <footer className="app-footer">
          <span>TULIP</span>
          <span>Read. Reflect. Remain.</span>
        </footer>
      </div>
    </>
  );
}

function Sheet({ title, children, full = false, onClose }) {
  const dialog = useRef(null),
    start = useRef(0),
    [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 170);
  };
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className={
        "study-design sheet " + (full ? "full-sheet " : "") + (closing ? "closing" : "")
      }
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="sheet-surface">
        <div
          className="sheet-handle"
          aria-label="Drag down to close"
          onPointerDown={(e) => {
            start.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            dialog.current.style.setProperty(
              "--drag",
              Math.max(0, e.clientY - start.current) + "px",
            );
          }}
          onPointerUp={(e) => {
            const delta = e.clientY - start.current;
            dialog.current.style.setProperty("--drag", "0px");
            if (delta > 85) close();
          }}
        >
          <span />
        </div>
        <header className="sheet-header">
          <h2>{title}</h2>
          <IconButton icon={X} label="Close panel" onClick={close} />
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}

function Memory() {
  const a = useApp(),
    words =
      "Thy word have I hid in mine heart, that I might not sin against thee.".split(
        " ",
      );
  const [hidden, setHidden] = useState(
    words.map((_, i) => i).filter((i) => i % 3 === 1),
  );
  return (
    <div className="memory-tool">
      <p className="eyebrow">PSALM 119:11</p>
      <div className="memory-words">
        {words.map((word, i) => (
          <button
            key={i}
            aria-label={hidden.includes(i) ? "Reveal word " + (i + 1) : word}
            className={hidden.includes(i) ? "masked" : ""}
            style={{ width: word.length + 0.4 + "ch" }}
            onClick={() =>
              setHidden(
                hidden.includes(i)
                  ? hidden.filter((n) => n !== i)
                  : [...hidden, i],
              )
            }
          >
            <span>{word}</span>
          </button>
        ))}
      </div>
      <div className="memory-count">
        <span>
          {words.length - hidden.length} of {words.length} words visible
        </span>
        <span>
          {Math.round(((words.length - hidden.length) / words.length) * 100)}%
        </span>
      </div>
      <div className="thin-progress">
        <i
          style={{
            width: ((words.length - hidden.length) / words.length) * 100 + "%",
          }}
        />
      </div>
      <Action
        onClick={() => setHidden(hidden.length ? [] : words.map((_, i) => i))}
        icon={hidden.length ? BookOpen : RotateCcw}
      >
        {hidden.length ? "Reveal all" : "Hide all"}
      </Action>
      <Action
        secondary
        icon={Check}
        onClick={() => {
          a.setDaySteps(a.daySteps.map((v, i) => (i === 1 ? true : v)));
          a.close();
          a.notify("Memorization complete");
        }}
      >
        Finish memorizing
      </Action>
    </div>
  );
}
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export { AppContext, useResource, useCount, IconButton, Action, PageHeading, SectionTitle, Tabs, SearchField, Row, Loading, ErrorState, Empty, Dial, Jacket, Home, LibraryPage, Detail, More, Sheet, Memory };

function Notes() {
  const a = useApp();
  const [tab, setTab] = useState("All"),
    [query, setQuery] = useState("");
  const notes = a.notes.filter(
    (n) =>
      (tab === "All" || (tab === "Sermons" ? n.reference : !n.reference)) &&
      `${n.title} ${n.body} ${n.reference}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        back={false}
        kicker="PERSONAL STUDY"
        action={
          <IconButton
            icon={Plus}
            label="New note"
            onClick={() => a.open("note-editor")}
          />
        }
      />
      <div className="page-heading compact-heading">
        <div>
          <p className="eyebrow">YOUR NOTEBOOK</p>
          <h1>
            Study notes<span className="count-label">{a.notes.length}</span>
          </h1>
        </div>
      </div>
      <div className="page-pad">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search your notes"
        />
        <Tabs
          items={["All", "Sermons", "Journal"]}
          value={tab}
          onChange={setTab}
        />
        <div className="notes-list">
          {notes.length ? (
            notes.map((note, i) => (
              <button
                key={note.id}
                className="note-row"
                onClick={() => a.open("note-view", { note })}
                style={{ "--i": i }}
              >
                <div className="note-row-date">
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString("en", {
                      month: "short",
                    })}
                  </span>
                  <strong>{new Date(note.updatedAt).getDate()}</strong>
                </div>
                <div>
                  <h2>{note.title || "Untitled note"}</h2>
                  <span className="note-reference">
                    {note.reference || "Journal"}
                  </span>
                  <p>{note.body}</p>
                </div>
                <ArrowUpRight size={17} />
              </button>
            ))
          ) : (
            <Empty title="A page for your thoughts">
              {query
                ? "No notes match this search."
                : "Your next insight starts here."}
            </Empty>
          )}
        </div>
        <button className="notebook-add" onClick={() => a.open("note-editor")}>
          <Plus size={19} />
          <span>A new page</span>
        </button>
      </div>
    </>
  );
}

function Tracker() {
  const a = useApp(),
    [query, setQuery] = useState(""),
    [opened, setOpened] = useState(43);
  const count = Object.keys(a.readChapters).filter(
    (k) => a.readChapters[k],
  ).length;
  return (
    <>
      <PageHeading title={<>A chapter<br/>at a time.</>} kicker="BIBLE TRACKER" />
      <div className="page-pad">
        <div className="tracker-instrument">
          <Dial value={count} total={1189} count={count} size={154} />
          <div>
            <span className="eyebrow">YOUR READING</span>
            <p>
              <strong>
                {Math.round((count / 1189) * 100)}
                <span>%</span>
              </strong>
            </p>
            <span className="muted-copy">of 1,189 chapters</span>
          </div>
        </div>
        <div className="tracker-stats">
          <div>
            <span>Old Testament</span>
            <strong>
              {
                Object.keys(a.readChapters).filter(
                  (k) => a.readChapters[k] && Number(k.split(":")[0]) < 40,
                ).length
              }
              <small>/ 929</small>
            </strong>
          </div>
          <div>
            <span>New Testament</span>
            <strong>
              {
                Object.keys(a.readChapters).filter(
                  (k) => a.readChapters[k] && Number(k.split(":")[0]) >= 40,
                ).length
              }
              <small>/ 260</small>
            </strong>
          </div>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Find a book"
        />
        <div className="tracker-books">
          {a.catalog.bibleBooks
            .filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
            .map((book) => {
              const done = Object.keys(a.readChapters).filter(
                (k) => a.readChapters[k] && k.startsWith(book.num + ":"),
              ).length;
              return (
                <div className="tracker-book" key={book.num}>
                  <button
                    className="tracker-book-title"
                    aria-expanded={opened === book.num}
                    onClick={() =>
                      setOpened(opened === book.num ? null : book.num)
                    }
                  >
                    <span className="book-number">
                      {String(book.num).padStart(2, "0")}
                    </span>
                    <strong>{book.name}</strong>
                    <span>
                      {done}/{book.chapters}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {opened === book.num && (
                    <div className="chapter-matrix">
                      {Array.from({ length: book.chapters }, (_, i) => (
                        <button
                          key={i}
                          aria-label={`${book.name} chapter ${i + 1}`}
                          aria-pressed={
                            !!a.readChapters[book.num + ":" + (i + 1)]
                          }
                          className={
                            a.readChapters[book.num + ":" + (i + 1)]
                              ? "read"
                              : ""
                          }
                          onClick={() => a.markChapter(book.num, i + 1, true)}
                        >
                          {a.readChapters[book.num + ":" + (i + 1)] ? (
                            <Check size={14} />
                          ) : (
                            i + 1
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
export { Notes, Tracker };
