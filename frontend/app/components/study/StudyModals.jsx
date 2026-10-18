"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Heart } from "lucide-react";
import { useApp, Sheet, Memory, Row, Loading, Action } from "./Views";
import { BookPicker, ReaderSettings, ScriptureSearch } from "./ScriptureViews";
import NoteComposer from "./NoteComposer";
import { getCloudUser } from "../../lib/cloudSync";
import {
  loadNotes,
  makeNote,
  normalizeNotePassage,
  saveNotes,
} from "../../lib/notesData";
import { parsePassageInput } from "../../lib/passageParser";
import { useLanguage } from "../../lib/useLanguage";

function AccountNote({ data }) {
  const a = useApp(),
    router = useRouter();
  const [user, setUser] = useState(undefined),
    [error, setError] = useState("");
  const [initial] = useState(() => {
    if (data.note) return data.note;
    const p = parsePassageInput(data.reference || "", 43);
    return makeNote({
      noteType: p ? "sermon" : "general",
      ...(p
        ? {
            bookNum: p.bookNum,
            bookName: p.bookName,
            chapter: p.chapter,
            passage: p.displayRef,
            displayRef: p.displayRef,
            verseStart: p.verseStart,
            verseEnd: p.verseEnd,
          }
        : {}),
    });
  });
  useEffect(() => {
    let active = true;
    getCloudUser()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {
        if (active) {
          setError("Your session could not be checked. Please try again.");
          setUser(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  if (!user)
    return (
      <Sheet title="A new page" full onClose={a.close}>
        {user === undefined ? (
          <Loading />
        ) : (
          <>
            <p className="body-copy">
              {error ||
                "Sign in to save and back up your notes to your account."}
            </p>
            <Action
              onClick={() =>
                router.push(
                  `/auth/login?next=${encodeURIComponent(location.pathname + location.search)}`,
                )
              }
            >
              Sign in to save notes
            </Action>
          </>
        )}
      </Sheet>
    );
  const save = async (note) => {
    try {
      const next = normalizeNotePassage(note);
      await saveNotes([next, ...loadNotes().filter((n) => n.id !== next.id)]);
      sessionStorage.removeItem(`tulip-note-draft:${user.id}`);
      a.close();
      a.notify("Note saved to your account");
      return true;
    } catch {
      setError(
        "Account backup did not complete. Your draft is still open. Please try again.",
      );
      return false;
    }
  };
  return (
    <NoteComposer
      initial={initial}
      userId={user.id}
      saveError={error}
      onSave={save}
      onCancel={a.close}
    />
  );
}

export default function StudyModals({ modal }) {
  const a = useApp(),
    { type, data = {} } = modal;
  const { lang } = useLanguage();
  if (type === "note-editor") return <AccountNote data={data} />;
  const titles = lang === "es" ? {
    "book-picker": "Libro y capítulo",
    search: "Buscar un pasaje",
    "reader-settings": "Tu vista de lectura",
    version: "Versión de la Biblia",
    memory: "Guárdalo en tu corazón",
    video: "Mira y reflexiona",
    "date-picker": "Tu lectura diaria",
    "detail-options": "Opciones de lectura",
  } : {
    "book-picker": "Book & chapter",
    search: "Find a passage",
    "reader-settings": "Your reading view",
    version: "Bible version",
    memory: "Keep it in your heart",
    video: "Watch & reflect",
    "date-picker": "Your daily reading",
    "detail-options": "Reading options",
  };
  return (
    <Sheet
      title={titles[type] || "Study"}
      full={type === "book-picker" || type === "video"}
      centered={type === "search"}
      onClose={a.close}
    >
      {type === "book-picker" ? (
        <BookPicker {...data} />
      ) : type === "search" ? (
        <ScriptureSearch {...data} />
      ) : type === "reader-settings" ? (
        <ReaderSettings {...data} />
      ) : type === "version" ? (
        <>
          {(lang === "es" ? [
            ["rv1960", "Reina-Valera 1960"],
            ["ntv", "Nueva Traducción Viviente"],
            ["nvi", "Nueva Versión Internacional"],
            ["lbla", "La Biblia de las Américas"],
          ] : [
            ["kjv", "King James Version"],
            ["esv", "English Standard Version"],
            ["nkjv", "New King James Version"],
            ["nasb", "New American Standard Bible"],
            ["geneva", "Geneva Bible"],
            ["csb", "Christian Standard Bible"],
            ["niv", "New International Version"],
            ["lsb", "Legacy Standard Bible"],
          ]).map(([v, name]) => (
            <Row
              key={v}
              icon={BookOpen}
              title={v.toUpperCase()}
              sub={name}
              after={v === data.version ? <Check size={18} /> : null}
              onClick={() => {
                data.onChange(v);
                a.close();
              }}
            />
          ))}
        </>
      ) : type === "memory" ? (
        <Memory />
      ) : type === "video" ? (
        <div className="fullscreen-video-player">
          <video controls autoPlay muted playsInline src={data.src} />
        </div>
      ) : type === "date-picker" ? (
        <div className="date-picker-grid">
          {Array.from({ length: 21 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i - 7);
            return (
              <button
                className={i - 7 === data.day ? "active" : ""}
                key={i}
                onClick={() => {
                  data.onChange(i - 7);
                  a.close();
                }}
              >
                <span>
                  {date.toLocaleDateString("en", { weekday: "short" })}
                </span>
                <strong>{date.getDate()}</strong>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <Row
            icon={Heart}
            title="Favorite this reading"
            onClick={() => {
              a.toggleFavorite(
                data.kind + ":" + (data.item.slug || data.item.id),
              );
              a.close();
            }}
          />
          <Row
            icon={BookOpen}
            title="Read from the beginning"
            onClick={() => {
              a.go("reader", {
                kind: data.kind,
                id: data.item.slug || data.item.id,
                chapter: 1,
              });
              a.close();
            }}
          />
        </>
      )}
    </Sheet>
  );
}
