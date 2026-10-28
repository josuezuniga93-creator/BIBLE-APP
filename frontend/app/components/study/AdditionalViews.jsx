"use client";
import React, {useState} from "react";
import { searchScore } from "../../lib/searchSuggestions";
import { useLanguage } from "../../lib/useLanguage";
import { parsePassageInput } from "../../lib/passageParser";
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
import PublicDomainDictionary from "./PublicDomainDictionary";
export default function AdditionalViews(){
const a = useApp(),
    screen = a.screen;
const [query, setQuery] = useState("");
const { lang } = useLanguage();
const openDictionaryReference = reference => {
  const passage = parsePassageInput(reference,43);
  if (passage) a.go("scripture", {book:passage.bookNum,chapter:passage.chapter,...(passage.verseStart ? {select:Array.from({length:(passage.verseEnd || passage.verseStart)-passage.verseStart+1},(_,i)=>passage.verseStart+i).join(",")} : {})});
};
const dictionaryResults = a.catalog.dictionary.map(entry => {
  const searchTerms = [entry.term, entry.termEs, ...(entry.aliases || []), ...entry.originalLanguages.flatMap(note => [note.script, note.lemma, note.transliteration, note.strongs])];
  return {entry, score: Math.min(...searchTerms.map(term => searchScore(query, term)))};
}).filter(item => Number.isFinite(item.score)).sort((a,b) => a.score - b.score || a.entry.term.localeCompare(b.entry.term));
const meta = null;
const title =
    meta?.[1] ||
    {
      profile: "Your study space",
      privacy: "Your privacy",
      history: "Church history",
    }[screen] ||
    "Study space";
if (screen === "study-tools" || screen === "dictionary")
    return (
      <>
        <PageHeading title={screen === "dictionary" ? (lang === "es" ? "Diccionario bíblico" : "Bible dictionary") : "Commentary"} kicker="RESOURCES" />
        <div className="page-pad">
          {screen === "dictionary" && <div className="dictionary-resource">
          <section className="dictionary-intro" aria-label={lang === "es" ? "Acerca del diccionario" : "About this dictionary"}>
            <div className="dictionary-language-mark" aria-hidden="true"><span>א</span><span>Ω</span></div>
            <div>
              <p className="eyebrow">{lang === "es" ? "HEBREO · GRIEGO · TEOLOGIA REFORMADA" : "HEBREW · GREEK · REFORMED THEOLOGY"}</p>
              <h2>{lang === "es" ? "Las palabras detrás de la Palabra." : "The words behind the Word."}</h2>
              <p>{lang === "es" ? "Definiciones originales arraigadas en la Escritura y guiadas por las confesiones historicas reformadas." : "Original definitions rooted in Scripture and guided by the historic Reformed confessions."}</p>
            </div>
          </section>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={lang === "es" ? "Gracia, pacto, δικαιόω..." : "Grace, covenant, δικαιόω..."}
          />
          <SectionTitle>{query ? (lang === "es" ? "Resultados" : "Matches") : (lang === "es" ? "Teologia biblica" : "Biblical theology")} <small className="dictionary-count">{dictionaryResults.length}</small></SectionTitle>
          {query && dictionaryResults[0]?.score >= 1 && <p className="dictionary-correction">{lang === "es" ? "¿Quisiste decir" : "Did you mean"} <button onClick={() => setQuery(lang === "es" ? dictionaryResults[0].entry.termEs : dictionaryResults[0].entry.term)}>{lang === "es" ? dictionaryResults[0].entry.termEs : dictionaryResults[0].entry.term}</button>?</p>}
          {dictionaryResults.map(({entry}, i) => (
              <details className="dictionary-entry" key={`${entry.id}-${query}`} open={query ? i === 0 : undefined}>
                <summary>
                  <span className="dictionary-summary-copy"><strong>{lang === "es" ? entry.termEs : entry.term}</strong><small className="dictionary-category">{entry.category}</small></span>
                  <span className="dictionary-summary-languages" aria-hidden="true">{entry.originalLanguages.map(note => note.symbol).filter((value,index,all)=>all.indexOf(value)===index).join(" ")}</span>
                  <Plus size={16} />
                </summary>
                <div className="body-copy dictionary-entry-body">
                  <p className="dictionary-definition">{lang === "es" ? entry.definitionEs : entry.definition}</p>
                  <div className="dictionary-word-grid">
                    {entry.originalLanguages.map(note => <article className="dictionary-word-card" key={`${entry.id}-${note.strongs}`}>
                      <header><span className="dictionary-language-symbol" aria-hidden="true">{note.symbol}</span><span>{note.language}</span><b>{note.strongs}</b></header>
                      <div className="dictionary-script" lang={note.language === "Hebrew" ? "he" : "grc"} dir={note.language === "Hebrew" ? "rtl" : "ltr"}>{note.script}</div>
                      <p><strong>{note.transliteration}</strong><span>{note.pronunciation}</span></p>
                      <small>{note.meaning}</small>
                    </article>)}
                  </div>
                  <section className="dictionary-reformed-note">
                    <p className="eyebrow">{lang === "es" ? "POR QUE IMPORTA" : "WHY IT MATTERS"}</p>
                    <p>{lang === "es" ? entry.reformedNoteEs : entry.reformedNote}</p>
                    {entry.confession && <small>{lang === "es" ? "Estandares confesionales" : "Confessional standards"}: {entry.confession}</small>}
                  </section>
                  <p className="dictionary-proof-label">{lang === "es" ? "LEER EN CONTEXTO" : "READ IN CONTEXT"}</p>
                  <div className="dictionary-references">{entry.references?.map(reference => <button key={reference} onClick={() => openDictionaryReference(reference)}>{reference}</button>)}</div>
                </div>
              </details>
            ))}
          <PublicDomainDictionary query={query} lang={lang} onReference={openDictionaryReference}/>
          <aside className="dictionary-editorial-note">
            <p className="eyebrow">{lang === "es" ? "NORMA EDITORIAL" : "EDITORIAL STANDARD"}</p>
            <p>{lang === "es" ? "La Escritura gobierna cada definicion. Las confesiones historicas de Westminster y Bautista de 1689 aclaran los contornos doctrinales. Los numeros de Strong identifican lemas para estudio, no reemplazan la lectura de cada palabra en su contexto." : "Scripture governs every definition. The historic Westminster and 1689 Baptist confessions clarify doctrinal contours. Strong's numbers identify study lemmas; they do not replace reading each word in its biblical context."}</p>
          </aside>
          </div>}
          {screen === "study-tools" && <>
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
          </>}
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
