"use client";
import React, { useEffect, useRef, useState } from "react";
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
import {
  useApp,
  IconButton,
  Action,
  Tabs,
  SearchField,
  Row,
  Loading,
  ErrorState,
} from "./Views";
import { useScriptureResource as useResource } from "./useScriptureResource";
import { useReaderStore as useStore } from "./useReaderStore";
import { parsePassageInput } from "../../lib/passageParser";
import { mirrorScriptureHighlight } from "../../lib/unifiedHighlights";
import { syncKey } from "../../lib/cloudSync";
function Scripture() {
  const a = useApp();
  const book = Number(a.params.book) || 43,
    chapter = Number(a.params.chapter) || 15;
  const [version, setVersion] = useStore("version", "kjv");
  const [settings, setSettings] = useStore("reader-settings", {
    size: 21,
    line: 1.8,
    serif: true,
    numbers: true,
  });
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useStore("marks", {});
  const data = useResource(
    `/api/bible/chapter?book=${book}&chapter=${chapter}&translation=${version}`,
  );
  const current =
    a.catalog.bibleBooks.find((b) => b.num === book) ||
    a.catalog.bibleBooks[42];
  const start = useRef(null);
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const change = (delta) => {
    let b = book,
      c = chapter + delta;
    if (c < 1 && book > 1) {
      b--;
      c = a.catalog.bibleBooks[b - 1].chapters;
    } else if (c > current.chapters && book < 66) {
      b++;
      c = 1;
    }
    if (c < 1 || b > 66 || (c > current.chapters && b === book)) return;
    setSelected(null);
    a.go("scripture", { book: b, chapter: c }, true);
  };
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
    setProgress(0);
    const value = JSON.stringify({ bookName: current.name, chapter });
    localStorage.setItem("ryc-last-position", value);
    syncKey("ryc-last-position", value).catch(() => {});
  }, [book, chapter]);
  useEffect(() => {
    const verse = Number(String(a.params.select || "").split(",")[0]);
    if (
      !data.loading &&
      verse &&
      data.data?.verses?.some((v) => v.verse === verse)
    ) {
      setSelected(verse);
      document
        .getElementById("verse-" + verse)
        ?.scrollIntoView({
          block: "center",
          behavior: a.motion ? "smooth" : "auto",
        });
    }
  }, [a.params.select, data.loading, data.data, a.motion]);
  const chooseVerse = (verse, event) => {
    setSelected(selected === verse.verse ? null : verse.verse);
    event.currentTarget.scrollIntoView({
      block: "center",
      behavior: a.motion ? "smooth" : "auto",
    });
  };
  const reference = `${current.name} ${chapter}${selected ? ":" + selected : ""}`;
  const selectedText =
    data.data?.verses?.find((v) => v.verse === selected)?.text || "";
  return (
    <div className="scripture-page">
      <header className="reader-topbar">
        <button
          className="book-picker-command"
          onClick={() => a.open("book-picker", { book, chapter })}
        >
          <BookOpen size={18} />
          <strong>
            {current.name} {chapter}
          </strong>
          <ChevronDown size={14} />
        </button>
        <button
          className="version-command"
          onClick={() => a.open("version", { version, onChange: setVersion })}
        >
          {version.toUpperCase()}
        </button>
        <IconButton
          icon={Type}
          label="Reading settings"
          onClick={() =>
            a.open("reader-settings", { settings, onChange: setSettings })
          }
        />
        <IconButton
          icon={Search}
          label="Search Scripture"
          onClick={() => a.open("search", { book })}
        />
      </header>
      <div className="reader-progress">
        <i style={{ width: progress + "%" }} />
      </div>
      <div
        className="scripture-scroll"
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setProgress(
            el.scrollHeight > el.clientHeight
              ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
              : 0,
          );
        }}
        onTouchStart={(e) => {
          start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!start.current) return;
          const dx = e.changedTouches[0].clientX - start.current.x,
            dy = e.changedTouches[0].clientY - start.current.y;
          if (Math.abs(dx) > 85 && Math.abs(dy) < 35) change(dx < 0 ? 1 : -1);
          start.current = null;
        }}
      >
        <div className="reader-chapter-intro">
          <h1>
            {current.name} <span>{chapter}</span>
          </h1>
        </div>
        {data.loading ? (
          <Loading />
        ) : data.error ? (
          <ErrorState message={data.error} retry={data.retry} />
        ) : (
          <div
            key={`${book}-${chapter}-${version}`}
            className={"verse-content " + (!settings.serif ? "sans" : "")}
            style={{ fontSize: settings.size, lineHeight: settings.line }}
          >
            {data.data.verses.map((verse) => {
              const key = `${book}:${chapter}:${verse.verse}`;
              return (
                <button
                  id={"verse-" + verse.verse}
                  key={verse.verse}
                  aria-label={`${current.name} ${chapter}:${verse.verse}`}
                  aria-pressed={selected === verse.verse}
                  className={
                    "verse " +
                    (selected === verse.verse ? "verse-selected " : "") +
                    (marks[key] ? "marked-" + marks[key] : "")
                  }
                  onClick={(e) => chooseVerse(verse, e)}
                >
                  {settings.numbers && <sup>{verse.verse}</sup>}
                  <span>{verse.text}</span>
                </button>
              );
            })}
            <button
              className="reader-end"
              onClick={() => {
                a.markChapter(book, chapter);
                a.notify("Chapter marked as read");
                change(1);
              }}
            >
              <Check size={18} />
              <span>Mark chapter as read</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      {selected && (
        <div className="annotation-dock" aria-label="Verse actions">
          <div className="swatches">
            {["light", "medium", "underline"].map((tone) => (
              <button
                key={tone}
                className={"swatch " + tone}
                aria-label={"Highlight " + tone}
                onClick={() => {
                  setMarks({
                    ...marks,
                    [`${book}:${chapter}:${selected}`]: tone,
                  });
                  const storageKey = `ryc-vcolor-${book}-${chapter}`;
                  let existing = {};
                  try {
                    existing = JSON.parse(
                      localStorage.getItem(storageKey) || "{}",
                    );
                  } catch {}
                  const value = JSON.stringify({
                    ...existing,
                    [selected]: tone,
                  });
                  localStorage.setItem(storageKey, value);
                  syncKey(storageKey, value).catch(() => {});
                  mirrorScriptureHighlight({
                    bookName: current.name,
                    bookNum: book,
                    chapter,
                    verseNum: selected,
                    verseText: selectedText,
                    color: tone,
                  });
                  a.notify("Highlight saved");
                }}
              />
            ))}
          </div>
          <span className="dock-divider" />
          <IconButton
            icon={Copy}
            label="Copy verse"
            onClick={() =>
              navigator.clipboard
                .writeText(`${reference} — ${selectedText}`)
                .then(() => a.notify("Copied"))
                .catch(() => a.notify("Copy is unavailable"))
            }
          />
          <IconButton
            icon={NotebookPen}
            label="Note on verse"
            onClick={() => a.open("note-editor", { reference })}
          />
          <IconButton
            icon={Bookmark}
            label="Bookmark verse"
            onClick={() => {
              a.toggleSaved(reference, selectedText);
              a.notify("Bookmark updated");
            }}
          />
          <IconButton
            icon={X}
            label="Close verse actions"
            onClick={() => setSelected(null)}
          />
        </div>
      )}
      <div className="chapter-controls">
        <IconButton
          icon={ChevronLeft}
          label="Previous chapter"
          onClick={() => change(-1)}
          disabled={book === 1 && chapter === 1}
        />
        <button onClick={() => a.open("book-picker", { book, chapter })}>
          <span>
            {current.name} {chapter}
          </span>
          <ChevronDown size={13} />
        </button>
        <IconButton
          icon={ChevronRight}
          label="Next chapter"
          onClick={() => change(1)}
          disabled={book === 66 && chapter === 22}
        />
      </div>
    </div>
  );
}

function BookPicker({ book = 43, chapter = 15 }) {
  const a = useApp(),
    [selected, setSelected] = useState(book),
    [query, setQuery] = useState("");
  const current = a.catalog.bibleBooks.find((b) => b.num === selected);
  return (
    <div className="book-picker">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Find a book of the Bible"
      />
      <div className="book-picker-columns">
        <div className="bible-book-list">
          {a.catalog.bibleBooks
            .filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
            .map((b) => (
              <button
                className={selected === b.num ? "active" : ""}
                aria-pressed={selected === b.num}
                key={b.num}
                onClick={() => setSelected(b.num)}
              >
                {b.name}
                <span>{b.chapters}</span>
              </button>
            ))}
        </div>
        <div className="picker-chapters">
          <p>{current.name}</p>
          <div>
            {Array.from({ length: current.chapters }, (_, i) => (
              <button
                className={
                  selected === book && chapter === i + 1 ? "active" : ""
                }
                key={i}
                aria-label={`${current.name} ${i + 1}`}
                onClick={() => {
                  a.go("scripture", { book: selected, chapter: i + 1 });
                  a.close();
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScriptureSearch({ book = 43 }) {
  const a = useApp(),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const p = parsePassageInput(query, book);
    if (!p) {
      setError("Enter a book and chapter, such as John 3:5-7.");
      return;
    }
    a.go("scripture", {
      book: p.bookNum,
      chapter: p.chapter,
      ...(p.verseStart ? { select: p.verseStart } : {}),
    });
    a.close();
    if (p.verseStart)
      setTimeout(
        () =>
          document.getElementById("verse-" + p.verseStart)?.scrollIntoView({
            block: "center",
            behavior: a.motion ? "smooth" : "auto",
          }),
        800,
      );
  };
  return (
    <>
      <form className="passage-search-form" onSubmit={submit}>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="John 3: 5–7"
          label="Passage reference"
        />
        <Action onClick={submit} disabled={!query}>
          Go to passage
        </Action>
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
      </form>
      <p className="eyebrow search-recent-label">RETURN TO</p>
      {["John 15", "Psalm 23", "Romans 8"].map((ref) => (
        <Row
          icon={Clock3}
          title={ref}
          key={ref}
          onClick={() => {
            const p = parsePassageInput(ref);
            a.go("scripture", { book: p.bookNum, chapter: p.chapter });
            a.close();
          }}
        />
      ))}
    </>
  );
}

function ReaderSettings({ settings: initialSettings, onChange }) {
  const [settings, setSettings] = useState(initialSettings);
  const update = (next) => {
    const updated = { ...settings, ...next };
    setSettings(updated);
    onChange(updated);
  };
  return (
    <div className="reader-settings">
      <p
        className="reading-sample"
        style={{
          fontSize: settings.size,
          lineHeight: settings.line,
          fontFamily: settings.serif
            ? "var(--font-lora),Georgia,serif"
            : "var(--font-inter),sans-serif",
        }}
      >
        In the beginning was the Word.
      </p>
      <label>
        Text size<span>{settings.size}</span>
        <input
          aria-label="Text size"
          type="range"
          min="17"
          max="29"
          value={settings.size}
          onChange={(e) => update({ size: Number(e.target.value) })}
        />
      </label>
      <label>
        Line spacing<span>{settings.line.toFixed(1)}</span>
        <input
          aria-label="Line spacing"
          type="range"
          min="1.4"
          max="2.2"
          step="0.1"
          value={settings.line}
          onChange={(e) => update({ line: Number(e.target.value) })}
        />
      </label>
      <Tabs
        items={[
          { id: "serif", label: "Serif" },
          { id: "sans", label: "Sans" },
        ]}
        value={settings.serif ? "serif" : "sans"}
        onChange={(v) => update({ serif: v === "serif" })}
      />
      <div className="setting-row">
        <span>Verse numbers</span>
        <button
          className={"switch " + (settings.numbers ? "on" : "")}
          role="switch"
          aria-checked={settings.numbers}
          aria-label="Verse numbers"
          onClick={() => update({ numbers: !settings.numbers })}
        >
          <i />
        </button>
      </div>
    </div>
  );
}
export { Scripture, BookPicker, ScriptureSearch, ReaderSettings };
