"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Type, X } from "lucide-react";
import { IconButton, Loading } from "./Views";
import { BracketHighlightReader } from "../BracketHighlightReader";
import { useLanguage } from "../../lib/useLanguage";
import type { AppReaderProps } from "../AppReader";

export default function BookReading(props: AppReaderProps) {
  const { title, sectionLabel, sectionTitle, text, context, reference, currentPage, totalPages, isLoading, previousDisabled, nextDisabled, finishLabel, onPrevious, onNext, onClose, highlightAdapter } = props;
  const { lang } = useLanguage();
  const [font, setFont] = useState(20);
  const body = useRef<HTMLDivElement>(null);
  const contents = useRef<HTMLDialogElement>(null);
  const onPageOpen = props.onPageOpen;
  useEffect(() => {
    document.documentElement.setAttribute("data-app-book-reader-open", "true");
    return () => document.documentElement.removeAttribute("data-app-book-reader-open");
  }, []);
  useEffect(() => { body.current?.scrollTo(0, 0); }, [context, currentPage]);
  useEffect(() => { onPageOpen?.(); }, [onPageOpen]);
  return <div className="study-design study-reference-reader">
    <div className="book-reader">
      <header className="reader-topbar">
        <IconButton icon={ArrowLeft} label={lang === "es" ? "Volver" : "Back to book"} onClick={onClose} />
        <span className="reading-title">{title}</span>
        <IconButton icon={Type} label="Reader font size" onClick={() => setFont(font >= 26 ? 18 : font + 2)} />
        <IconButton icon={List} label={lang === "es" ? "Índice" : "Table of contents"} onClick={() => contents.current?.showModal()} />
      </header>
      <div className="book-scroll" ref={body}>
        {isLoading ? <Loading /> : <article className="prose book-prose" style={{ fontSize: font }} key={context + "-" + currentPage}>
          <p className="eyebrow">{sectionLabel}</p>
          {props.showSectionTitle !== false && <h1>{sectionTitle || title}</h1>}
          {props.translationStatus}
          <BracketHighlightReader context={context} text={text} title={title} reference={reference} textColor="inherit" headingColor="inherit" fontSizeClass="text-inherit" scrollRef={body} targetHighlightId={props.targetHighlightId} highlightAdapter={highlightAdapter} />
          {props.footer}
        </article>}
      </div>
      <div className="chapter-controls">
        <IconButton icon={ChevronLeft} label="Previous page" disabled={previousDisabled || isLoading} onClick={onPrevious} />
        <span>{lang === "es" ? "Página" : "Page"} {props.displayPage ?? currentPage} {lang === "es" ? "de" : "of"} {props.workTotalPages ?? totalPages}</span>
        <IconButton icon={ChevronRight} label={finishLabel || "Next page"} disabled={isLoading || (nextDisabled && !finishLabel)} onClick={onNext} />
      </div>
    </div>
    <dialog ref={contents} className="reader-contents" onClick={e => { if (e.target === e.currentTarget) contents.current?.close(); }}>
      <header><h2>{lang === "es" ? "Índice" : "Contents"}</h2><IconButton icon={X} label="Close contents" onClick={() => contents.current?.close()} /></header>
      <nav>{props.contents?.map(item => <button key={item.id} aria-current={props.activeSectionId === item.id ? "location" : undefined} onClick={() => { props.onSelectSection?.(item.id); contents.current?.close(); }}><span>{item.title}</span><small>{item.page}</small></button>)}</nav>
    </dialog>
  </div>;
}
