"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { searchScore } from "../../lib/searchSuggestions";

const SOURCE_NAMES = {
  EAS: "Easton's Bible Dictionary · 1897",
  SMI: "Smith's Bible Dictionary · 1863",
};

function normalize(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function rank(query, value, allowFuzzy = false) {
  const q = normalize(query), text = normalize(value);
  if (!q || !text) return Infinity;
  if (text === q) return 0;
  if (text.startsWith(q)) return 1;
  if (text.split(" ").some(word => word === q)) return 1.5;
  if (text.split(" ").some(word => word.startsWith(q))) return 2;
  if (text.includes(q)) return 3;
  const plausibleTypo = allowFuzzy
    && q[0] === text[0]
    && !text.includes(" ")
    && Math.abs(q.length - text.length) <= Math.max(2, Math.floor(q.length / 3));
  return plausibleTypo ? 4 + searchScore(q, text) : Infinity;
}

function HistoricalEntry({ item, autoOpen, lang, onReference }) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    if (entry || loading) return;
    setLoading(true); setError(false);
    try {
      const response = await fetch(`/dictionary-data/letters/${item.letter}.json`);
      if (!response.ok) throw new Error("Dictionary source unavailable");
      const entries = await response.json();
      const match = Object.values(entries).find(value => value.slug === item.slug);
      if (!match) throw new Error("Entry not found");
      setEntry(match);
    } catch { setError(true); } finally { setLoading(false); }
  }, [entry, item.letter, item.slug, loading]);
  useEffect(() => { if (autoOpen) load(); }, [autoOpen, load]);
  return <details className="dictionary-entry historical-dictionary-entry" open={autoOpen || undefined} onToggle={event => { if (event.currentTarget.open) load(); }}>
    <summary><span className="dictionary-summary-copy"><strong>{item.name}</strong><small className="dictionary-category">{item.sources.map(source => SOURCE_NAMES[source] || source).join(" · ")}</small></span><Plus size={16}/></summary>
    <div className="body-copy historical-entry-body">
      {loading && <p className="dictionary-loading">{lang === "es" ? "Abriendo la fuente historica..." : "Opening historical source..."}</p>}
      {error && <button className="dictionary-retry" onClick={load}>{lang === "es" ? "Intentar de nuevo" : "Try again"}</button>}
      {entry?.definitions.map((definition, index) => <section key={`${definition.source}-${index}`} className="historical-definition">
        <p className="eyebrow">{SOURCE_NAMES[definition.source] || definition.source}</p>
        <p>{definition.text}</p>
      </section>)}
      {entry?.references?.length > 0 && <><p className="dictionary-proof-label">{lang === "es" ? "LEER EN CONTEXTO" : "READ IN CONTEXT"}</p><div className="dictionary-references">{entry.references.slice(0, 18).map(reference => <button key={reference} onClick={() => onReference(reference)}>{reference}</button>)}</div></>}
    </div>
  </details>;
}

function LexiconCard({ item }) {
  const isHebrew = item.language === "H";
  return <article className="dictionary-word-card public-lexicon-card">
    <header><span className="dictionary-language-symbol" aria-hidden="true">{isHebrew ? "א" : "Ω"}</span><span>{isHebrew ? "Hebrew" : "Greek"}</span><b>{item.strongs}</b></header>
    <div className="dictionary-script" lang={isHebrew ? "he" : "grc"} dir={isHebrew ? "rtl" : "ltr"}>{item.script}</div>
    <p><strong>{item.transliteration}</strong>{item.pronunciation && <span>{item.pronunciation}</span>}</p>
    <small>{item.definition}</small>
    {item.kjv && <p className="lexicon-usage"><b>KJV:</b> {item.kjv}</p>}
  </article>;
}

export default function PublicDomainDictionary({ query, lang, onReference }) {
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < 2 || index) return;
    let live = true;
    setLoading(true); setFailed(false);
    fetch("/dictionary-data/index.json").then(response => {
      if (!response.ok) throw new Error("Dictionary index unavailable");
      return response.json();
    }).then(data => { if (live) setIndex(data); }).catch(() => { if (live) setFailed(true); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [trimmed, index]);

  const results = useMemo(() => {
    if (!index || trimmed.length < 2) return { dictionary: [], lexicon: [] };
    const dictionary = index.dictionary.map(([name, slug, letter, sources]) => ({ name, slug, letter, sources: sources.split("+"), score: rank(trimmed, name, trimmed.length >= 4) })).filter(item => Number.isFinite(item.score)).sort((a,b) => a.score-b.score || a.name.localeCompare(b.name)).slice(0, 10);
    const lexicon = index.lexicon.map(([strongs, language, script, transliteration, pronunciation, definition, kjv]) => ({ strongs, language, script, transliteration, pronunciation, definition, kjv, score: Math.min(rank(trimmed, strongs), rank(trimmed, script), rank(trimmed, transliteration, trimmed.length >= 4), rank(trimmed, `${definition} ${kjv}`)) })).filter(item => Number.isFinite(item.score)).sort((a,b) => a.score-b.score || a.strongs.localeCompare(b.strongs)).slice(0, 12);
    return { dictionary, lexicon };
  }, [index, trimmed]);

  if (trimmed.length < 2) return null;
  if (loading) return <p className="dictionary-loading" role="status">{lang === "es" ? "Buscando 20,000 entradas historicas y lexicas..." : "Searching 20,000 historical and lexical entries..."}</p>;
  if (failed) return <p className="dictionary-loading" role="status">{lang === "es" ? "La biblioteca historica no esta disponible ahora." : "The historical library is unavailable right now."}</p>;
  if (!index) return null;
  return <div className="public-dictionary-results">
    {results.dictionary.length > 0 && <section><SectionHeading title={lang === "es" ? "Diccionarios historicos" : "Historical dictionaries"} count={results.dictionary.length}/>{results.dictionary.map((item,index) => <HistoricalEntry key={item.slug} item={item} autoOpen={index === 0 && item.score === 0} lang={lang} onReference={onReference}/>)}</section>}
    {results.lexicon.length > 0 && <section><SectionHeading title={lang === "es" ? "Palabras originales" : "Original-language words"} count={results.lexicon.length}/><div className="dictionary-word-grid">{results.lexicon.map(item => <LexiconCard key={item.strongs} item={item}/>)}</div></section>}
    {results.dictionary.length === 0 && results.lexicon.length === 0 && <p role="status" className="dictionary-loading">{lang === "es" ? "No encontramos ese termino biblico. Prueba otra forma de la palabra." : "We could not find that biblical term. Try another form of the word."}</p>}
    <p className="dictionary-attribution">Easton 1897 · Smith 1863 · Strong 1890/1894 · Public domain texts</p>
  </div>;
}

function SectionHeading({ title, count }) {
  return <div className="public-dictionary-heading"><h3>{title}</h3><span>{count}</span></div>;
}
