"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  List,
  Type,
  X,
} from "lucide-react";
import { IconButton, Loading } from "./Views";
import { saveReaderHighlight } from "../../lib/unifiedHighlights";
import type { AppReaderProps } from "../AppReader";

export default function BookReading(props: AppReaderProps) {
  const {
    title,
    sectionLabel,
    sectionTitle,
    text,
    context,
    reference,
    currentPage,
    totalPages,
    isLoading,
    previousDisabled,
    nextDisabled,
    finishLabel,
    onPrevious,
    onNext,
    onClose,
    onPageOpen,
    highlightAdapter,
  } = props;
  const [font, setFont] = useState(20),
    [selection, setSelection] = useState(""),
    [status, setStatus] = useState("");
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.setAttribute("data-app-book-reader-open", "true");
    return () =>
      document.documentElement.removeAttribute("data-app-book-reader-open");
  }, []);
  useEffect(() => {
    body.current?.scrollTo(0, 0);
    setSelection("");
    onPageOpen?.();
  }, [context, currentPage, onPageOpen]);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2200);
    return () => clearTimeout(t);
  }, [status]);
  const capture = () => {
    const selected = window.getSelection()?.toString().trim();
    if (
      selected &&
      body.current?.contains(window.getSelection()?.anchorNode || null)
    )
      setSelection(selected);
  };
  const save = () => {
    try {
      const highlight = {
        id: crypto.randomUUID(),
        text: selection,
        color: "light",
        createdAt: Date.now(),
        context,
        title: sectionTitle || title,
        reference,
      };
      if (highlightAdapter) highlightAdapter.save(context, highlight);
      else saveReaderHighlight(context, highlight);
      setSelection("");
      setStatus("Passage saved");
    } catch {
      setStatus("Unable to save. Please try again.");
    }
  };
  return (
    <div className="study-design study-reference-reader">
      <div className="book-reader">
        <header className="reader-topbar">
          <IconButton icon={ArrowLeft} label="Back to book" onClick={onClose} />
          <span className="reading-title">{title}</span>
          <IconButton
            icon={Type}
            label="Reader font size"
            onClick={() => setFont(font >= 26 ? 18 : font + 2)}
          />
          <IconButton icon={List} label="Table of contents" onClick={onClose} />
        </header>
        <div
          className="book-scroll"
          ref={body}
          onMouseUp={capture}
          onTouchEnd={() => setTimeout(capture, 180)}
        >
          {isLoading ? (
            <Loading />
          ) : (
            <article
              className="prose book-prose"
              style={{ fontSize: font }}
              key={`${context}-${currentPage}`}
            >
              <p className="eyebrow">
                {sectionLabel || `CHAPTER ${currentPage}`}
              </p>
              <h1>{sectionTitle || title}</h1>
              <Markdown>{text}</Markdown>
              {props.footer}
            </article>
          )}
        </div>
        {selection && (
          <div className="text-selection-dock">
            <span>{selection.length} characters</span>
            <IconButton
              icon={Copy}
              label="Copy selected text"
              onClick={() =>
                navigator.clipboard
                  .writeText(selection)
                  .then(() => setStatus("Copied"))
                  .catch(() => setStatus("Copy is unavailable"))
              }
            />
            <IconButton icon={Bookmark} label="Save passage" onClick={save} />
            <IconButton
              icon={X}
              label="Close selection actions"
              onClick={() => setSelection("")}
            />
          </div>
        )}
        <div className="chapter-controls">
          <IconButton
            icon={ChevronLeft}
            label="Previous section"
            disabled={previousDisabled}
            onClick={onPrevious}
          />
          <span>
            {currentPage} <small>/ {totalPages}</small>
          </span>
          <IconButton
            icon={ChevronRight}
            label={finishLabel || "Next section"}
            disabled={nextDisabled && !finishLabel}
            onClick={onNext}
          />
        </div>
        {status && (
          <div className="toast" role="status">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
