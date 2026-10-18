"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  House,
  BookOpen,
  NotebookPen,
  BookHeart,
  Grid2X2,
  ArrowUpRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  X,
  Copy,
  Eraser,
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
import { useLanguage } from "../../lib/useLanguage";
import { bibleBookName } from "../../lib/spanishContent";
import {
  mirrorScriptureHighlight,
  removeMirroredScriptureHighlight,
} from "../../lib/unifiedHighlights";
import { syncKey } from "../../lib/cloudSync";
const SPANISH_VERSIONS = ["rv1960", "ntv", "nvi", "lbla"];
function Scripture() {
  const a = useApp();
  const { lang } = useLanguage();
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
  useEffect(() => {
    if (lang === "es" && !SPANISH_VERSIONS.includes(version)) setVersion("lbla");
    if (lang === "en" && SPANISH_VERSIONS.includes(version)) setVersion("esv");
  }, [lang, version]);
  const data = useResource(
    `/api/bible/chapter?book=${book}&chapter=${chapter}&translation=${version}`,
  );
  const current =
    a.catalog.bibleBooks.find((b) => b.num === book) ||
    a.catalog.bibleBooks[42];
  const currentName = bibleBookName(current, lang);
  const passageVerses = String(a.params.select || "")
    .split(",")
    .map(Number)
    .filter((verse) => Number.isSafeInteger(verse) && verse > 0);
  const isPassageView = passageVerses.length > 0;
  const passageStart = passageVerses[0];
  const passageEnd = passageVerses[passageVerses.length - 1];
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
    if (isPassageView) setSelected(null);
  }, [a.params.select, isPassageView]);
  const chooseVerse = (verse, event) => {
    setSelected(selected === verse.verse ? null : verse.verse);
    event.currentTarget.scrollIntoView({
      block: "center",
      behavior: a.motion ? "smooth" : "auto",
    });
  };
  const reference = `${currentName} ${chapter}${selected ? ":" + selected : ""}`;
  const selectedText =
    data.data?.verses?.find((v) => v.verse === selected)?.text || "";
  return (
    <div className="scripture-page">
      <header className="reader-topbar">
        <button
          className="book-picker-command notranslate"
          translate="no"
          onClick={() => a.open("book-picker", { book, chapter })}
        >
          <BookOpen size={18} />
          <strong>
            {currentName} {chapter}
          </strong>
          <ChevronDown size={14} />
        </button>
        <button
          className="version-command notranslate"
          translate="no"
          onClick={() => a.open("version", { version, onChange: setVersion })}
        >
          {version.toUpperCase()}
        </button>
        <IconButton
          icon={Type}
          label={lang === "es" ? "Configuración de lectura" : "Reading settings"}
          onClick={() =>
            a.open("reader-settings", { settings, onChange: setSettings })
          }
        />
        <IconButton
          icon={Search}
          label={lang === "es" ? "Buscar en la Biblia" : "Search Scripture"}
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
        <div className="reader-chapter-intro notranslate" translate="no">
          <h1>
            {currentName}{" "}
            <span>
              {isPassageView
                ? `${chapter}:${passageStart}${passageEnd !== passageStart ? `-${passageEnd}` : ""}`
                : chapter}
            </span>
          </h1>
        </div>
        {data.loading ? (
          <Loading label={lang === "es" ? `Cargando ${version.toUpperCase()}` : `Loading ${version.toUpperCase()}`} />
        ) : data.error ? (
          <ErrorState message={data.error} retry={data.retry} />
        ) : (
          <div
            key={`${book}-${chapter}-${version}`}
            className={"verse-content notranslate " + (!settings.serif ? "sans" : "")}
            translate="no"
            style={{ fontSize: settings.size, lineHeight: settings.line }}
          >
            {data.data.verses
              .filter(
                (verse) =>
                  !isPassageView || passageVerses.includes(verse.verse),
              )
              .map((verse) => {
              const key = `${book}:${chapter}:${verse.verse}`;
              return (
                <button
                  id={"verse-" + verse.verse}
                  key={verse.verse}
                  aria-label={`${currentName} ${chapter}:${verse.verse}`}
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
            {isPassageView && (
              <div className="passage-full-chapter">
                <Action
                  secondary
                  icon={BookOpen}
                  onClick={() => a.go("scripture", { book, chapter })}
                >
                  {lang === "es" ? "Leer el capítulo completo" : "Read Full Chapter"}
                </Action>
              </div>
            )}
          </div>
        )}
      </div>
      {selected && (
        <div className="annotation-dock" aria-label={lang === "es" ? "Acciones del versículo" : "Verse actions"}>
          <div className="highlight-strip">
            <span>{lang === "es" ? "Resaltar" : "Highlight"}</span>
            <div className="swatches">
              {["yellow", "blue", "pink", "green"].map((tone) => (
                <button
                  key={tone}
                  className={"swatch " + tone}
                  aria-label={(lang === "es" ? "Resaltar " : "Highlight ") + tone}
                  aria-pressed={marks[`${book}:${chapter}:${selected}`] === tone}
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
                    a.notify(lang === "es" ? "Resaltado guardado" : "Highlight saved");
                  }}
                />
              ))}
            </div>
          </div>
          <div className="annotation-actions">
            <IconButton
              icon={Copy}
              label={lang === "es" ? "Copiar versículo" : "Copy verse"}
              onClick={() =>
                navigator.clipboard
                  .writeText(`${reference} — ${selectedText}`)
                  .then(() => a.notify(lang === "es" ? "Copiado" : "Copied"))
                  .catch(() => a.notify(lang === "es" ? "No se puede copiar" : "Copy is unavailable"))
              }
            />
            <IconButton
              icon={NotebookPen}
              label={lang === "es" ? "Nota del versículo" : "Note on verse"}
              onClick={() => a.open("note-editor", { reference })}
            />
            <IconButton
              icon={Eraser}
              label={lang === "es" ? "Quitar resaltado" : "Remove highlight"}
              disabled={!marks[`${book}:${chapter}:${selected}`]}
              onClick={() => {
                const markKey = `${book}:${chapter}:${selected}`;
                const nextMarks = { ...marks };
                delete nextMarks[markKey];
                setMarks(nextMarks);

                const storageKey = `ryc-vcolor-${book}-${chapter}`;
                let chapterMarks = {};
                try {
                  chapterMarks = JSON.parse(
                    localStorage.getItem(storageKey) || "{}",
                  );
                } catch {}
                delete chapterMarks[selected];
                const value = JSON.stringify(chapterMarks);
                localStorage.setItem(storageKey, value);
                syncKey(storageKey, value).catch(() => {});
                removeMirroredScriptureHighlight(book, chapter, selected);
                a.notify(lang === "es" ? "Resaltado eliminado" : "Highlight removed");
              }}
            />
            <IconButton
              icon={X}
              label={lang === "es" ? "Cerrar acciones" : "Close verse actions"}
              onClick={() => setSelected(null)}
            />
          </div>
        </div>
      )}
      {!isPassageView && <div className="chapter-controls notranslate" translate="no">
        <IconButton
          icon={ChevronLeft}
          label={lang === "es" ? "Capítulo anterior" : "Previous chapter"}
          onClick={() => change(-1)}
          disabled={book === 1 && chapter === 1}
        />
        <button onClick={() => a.open("book-picker", { book, chapter })}>
          <span>
            {currentName} {chapter}
          </span>
          <ChevronDown size={13} />
        </button>
        <IconButton
          icon={ChevronRight}
          label={lang === "es" ? "Capítulo siguiente" : "Next chapter"}
          onClick={() => change(1)}
          disabled={book === 66 && chapter === 22}
        />
      </div>}
    </div>
  );
}

function BookPicker({ book = 43, chapter = 15 }) {
  const a = useApp(),
    [selected, setSelected] = useState(book),
    [query, setQuery] = useState("");
  const { lang } = useLanguage();
  const current = a.catalog.bibleBooks.find((b) => b.num === selected);
  return (
    <div className="book-picker">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={lang === "es" ? "Busca un libro de la Biblia" : "Find a book of the Bible"}
      />
      <div className="book-picker-columns notranslate" translate="no">
        <div className="bible-book-list">
          {a.catalog.bibleBooks
            .filter((b) => bibleBookName(b, lang).toLowerCase().includes(query.toLowerCase()))
            .map((b) => (
              <button
                className={selected === b.num ? "active" : ""}
                aria-pressed={selected === b.num}
                key={b.num}
                onClick={() => setSelected(b.num)}
              >
                {bibleBookName(b, lang)}
                <span>{b.chapters}</span>
              </button>
            ))}
        </div>
        <div className="picker-chapters">
          <p>{bibleBookName(current, lang)}</p>
          <div>
            {Array.from({ length: current.chapters }, (_, i) => (
              <button
                className={
                  selected === book && chapter === i + 1 ? "active" : ""
                }
                key={i}
                aria-label={`${bibleBookName(current, lang)} ${i + 1}`}
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
  const { lang } = useLanguage();
  const submit = (e) => {
    e.preventDefault();
    const p = parsePassageInput(query, book);
    if (!p) {
      setError(lang === "es" ? "Escribe un libro y capítulo, por ejemplo Juan 3:5-7." : "Enter a book and chapter, such as John 3:5-7.");
      return;
    }
    a.go("scripture", {
      book: p.bookNum,
      chapter: p.chapter,
      ...(p.verseStart
        ? {
            select: p.verseEnd
              ? Array.from(
                  { length: p.verseEnd - p.verseStart + 1 },
                  (_, index) => p.verseStart + index,
                ).join(",")
              : p.verseStart,
          }
        : {}),
    });
    a.close();
  };
  return (
    <form className="passage-search-form" onSubmit={submit}>
      <p className="passage-search-copy">
        {lang === "es" ? "Escribe un libro, capítulo o rango de versículos." : "Enter a book, chapter, or verse range."}
      </p>
      <div className="passage-search-control">
        <SearchField
          value={query}
          onChange={(value) => {
            setQuery(value);
            if (error) setError("");
          }}
          placeholder={lang === "es" ? "Juan 3:5-7" : "John 3:5-7"}
          label={lang === "es" ? "Referencia bíblica" : "Passage reference"}
        />
      </div>
      <p className="passage-search-example">{lang === "es" ? "Prueba Juan 3, Salmo 23 o Romanos 8:1-4" : "Try John 3, Psalm 23, or Romans 8:1-4"}</p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <div className="passage-search-actions">
        <Action type="submit" disabled={!query.trim()}>
          {lang === "es" ? "Abrir pasaje" : "Open passage"}
        </Action>
      </div>
    </form>
  );
}

function ReaderSettings({ settings: initialSettings, onChange }) {
  const { lang } = useLanguage();
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
        {lang === "es" ? "En el principio era el Verbo." : "In the beginning was the Word."}
      </p>
      <label>
        {lang === "es" ? "Tamaño del texto" : "Text size"}<span>{settings.size}</span>
        <input
          aria-label={lang === "es" ? "Tamaño del texto" : "Text size"}
          type="range"
          min="17"
          max="29"
          value={settings.size}
          onChange={(e) => update({ size: Number(e.target.value) })}
        />
      </label>
      <label>
        {lang === "es" ? "Espaciado de líneas" : "Line spacing"}<span>{settings.line.toFixed(1)}</span>
        <input
          aria-label={lang === "es" ? "Espaciado de líneas" : "Line spacing"}
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
          { id: "serif", label: lang === "es" ? "Con serifas" : "Serif" },
          { id: "sans", label: lang === "es" ? "Sin serifas" : "Sans" },
        ]}
        value={settings.serif ? "serif" : "sans"}
        onChange={(v) => update({ serif: v === "serif" })}
      />
      <div className="setting-row">
        <span>{lang === "es" ? "Números de versículo" : "Verse numbers"}</span>
        <button
          className={"switch " + (settings.numbers ? "on" : "")}
          role="switch"
          aria-checked={settings.numbers}
          aria-label={lang === "es" ? "Números de versículo" : "Verse numbers"}
          onClick={() => update({ numbers: !settings.numbers })}
        >
          <i />
        </button>
      </div>
    </div>
  );
}
export { Scripture, BookPicker, ScriptureSearch, ReaderSettings };
