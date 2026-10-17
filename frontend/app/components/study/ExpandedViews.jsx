"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Heart,
  LogOut,
  Play,
  RefreshCw,
  Share2,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useApp,
  PageHeading,
  SearchField,
  SectionTitle,
  Row,
  Action,
  Sheet,
  Empty,
  IconButton,
  Loading,
} from "./Views";
import { QUOTES } from "../../data/quotes";
import {
  ARCHIVE_VIDEOS,
  SHORT_VIDEOS,
  COMMUNITY_VIDEOS,
  TESTIMONIES_VIDEOS,
  FUNDAMENTALS,
} from "../../data/videoLibrary";
import kids from "../../lib/studyKidsCatalog.json";
import { BIBLE_PLANS } from "../../lib/biblePlansData";
import { findCompleteCommentaryByReference } from "../../lib/studyToolsData";
import {
  getCloudUser,
  signOut,
  syncReadingData,
  syncKey,
} from "../../lib/cloudSync";
import {
  getStudyToolHighlights,
  saveStudyToolHighlight,
  deleteStudyToolHighlight,
} from "../../lib/unifiedHighlights";
import { downloadReadingBackup } from "../../lib/readingBackup";
import { AppReader } from "../AppReader";

function useStored(key, initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      setValue(JSON.parse(localStorage.getItem(key) || "null") || initial);
    } catch {}
  }, [key]);
  return [
    value,
    (next) => {
      localStorage.setItem(key, JSON.stringify(next));
      syncKey(key, JSON.stringify(next)).catch(() => {});
      setValue(next);
    },
  ];
}

export default function ExpandedViews() {
  const a = useApp(),
    router = useRouter();
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [reader, setReader] = useState(null),
    [index, setIndex] = useState(0),
    [user, setUser] = useState(null);
  const [plans, setPlans] = useStored("tulip_bible_plans_v1", []),
    [planId, setPlanId] = useState(BIBLE_PLANS[0].id),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    if (a.screen === "profile")
      getCloudUser()
        .then(setUser)
        .catch(() => {});
  }, [a.screen]);
  const openCommentary = async (reference) => {
    setBusy(true);
    try {
      const result = await findCompleteCommentaryByReference(reference);
      if (result) setReader(result);
      else a.notify("No commentary found. Enter a book and chapter.");
    } catch {
      a.notify("This reading is unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (a.screen === "study-tools" && a.params.highlight) {
      const item = getStudyToolHighlights().find(
        (h) => h.id === a.params.highlight,
      );
      if (item) openCommentary(item.reference);
    }
  }, [a.screen, a.params.highlight]);
  if (reader)
    return (
      <AppReader
        title="Matthew Henry"
        sectionTitle={
          reader.title ||
          reader.reference ||
          `${reader.bookName} ${reader.chapter}`
        }
        text={reader.text}
        context={`henry-${reader.book}-${reader.chapter}`}
        reference={`${reader.bookName} ${reader.chapter}`}
        fontSizeClass=""
        currentPage={1}
        totalPages={1}
        progressPercent={0}
        previousDisabled
        nextDisabled
        onPrevious={() => {}}
        onNext={() => setReader(null)}
        onClose={() => setReader(null)}
        finishLabel="Done"
        highlightAdapter={{
          load: () => getStudyToolHighlights(),
          save: (_context, h) =>
            saveStudyToolHighlight({
              ...h,
              reference: `${reader.bookName} ${reader.chapter}`,
              sectionTitle: reader.title || "Matthew Henry",
              book: reader.book,
              bookName: reader.bookName,
              chapter: reader.chapter,
              source: reader.source,
            }),
          delete: (_context, id) => deleteStudyToolHighlight(id),
        }}
      />
    );
  if (a.screen === "study-tools")
    return (
      <>
        <PageHeading title="Go deeper." kicker="STUDY TOOLS" />
        <div className="page-pad">
          <form
            className="passage-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              openCommentary(query);
            }}
          >
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="John 15:1"
              label="Commentary reference"
            />
            <Action
              disabled={busy || !query}
              onClick={() => openCommentary(query)}
            >
              Read commentary
            </Action>
          </form>
          {busy && <Loading />}
          <SectionTitle>Matthew Henry</SectionTitle>
          <Row
            icon={BookOpen}
            title="The Gospel of John"
            sub="John 15"
            onClick={() => openCommentary("John 15")}
          />
          <Row
            icon={BookOpen}
            title="The Psalms"
            sub="Psalm 23"
            onClick={() => openCommentary("Psalm 23")}
          />
          <Row
            icon={BookOpen}
            title="Saved commentary passages"
            onClick={() => a.go("highlights")}
          />
        </div>
      </>
    );
  if (a.screen === "videos") {
    const videos = [
      ...new Map(
        [
          ...TESTIMONIES_VIDEOS,
          ...ARCHIVE_VIDEOS,
          ...SHORT_VIDEOS,
          ...COMMUNITY_VIDEOS,
        ].map((v) => [v.id, v]),
      ).values(),
    ].filter((v) =>
      `${v.title} ${v.speaker}`.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <>
        <PageHeading
          title={
            <>
              Watch.
              <br />
              Listen. Reflect.
            </>
          }
          kicker="VIDEO LIBRARY"
        />
        <div className="page-pad">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Find teaching or testimony"
          />
          {videos.map((video) => (
            <Row
              key={video.id}
              icon={Play}
              title={video.title}
              sub={video.speaker}
              onClick={() => setSelected(video)}
            />
          ))}
          <SectionTitle>Fundamentals of the faith</SectionTitle>
          {FUNDAMENTALS.flatMap((section) => section.topics)
            .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
            .map((topic) => (
              <Row
                key={topic.id}
                icon={Play}
                title={topic.title}
                sub={`${topic.videoCount} videos`}
                onClick={() =>
                  topic.featuredVideoId
                    ? setSelected({
                        id: topic.featuredVideoId,
                        title: topic.title,
                      })
                    : a.notify(
                        "No video has been published for this topic yet.",
                      )
                }
              />
            ))}
        </div>
        {selected && (
          <Sheet title={selected.title} onClose={() => setSelected(null)}>
            <iframe
              className="study-video"
              title={selected.title}
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selected.id)}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </Sheet>
        )}
      </>
    );
  }
  if (a.screen === "quotes") {
    const quote = QUOTES[index % QUOTES.length];
    return (
      <>
        <PageHeading
          title={
            <>
              Words with
              <br />
              lasting weight.
            </>
          }
          kicker="COLLECTED WISDOM"
        />
        <div className="page-pad">
          <img
            className="quote-portrait"
            src={quote.image}
            alt={quote.author}
          />
          <blockquote className="quote-large">“{quote.text}”</blockquote>
          <p className="source-line">
            {quote.author} / {quote.born}–{quote.died}
          </p>
          <Action
            secondary
            icon={Copy}
            onClick={() =>
              navigator.clipboard
                .writeText(`${quote.text} - ${quote.author}`)
                .then(() => a.notify("Copied"))
                .catch(() => a.notify("Copy is unavailable"))
            }
          >
            Copy quotation
          </Action>
          <div className="plan-day-control">
            <IconButton
              icon={ChevronLeft}
              label="Previous quote"
              onClick={() =>
                setIndex((index + QUOTES.length - 1) % QUOTES.length)
              }
            />
            <span>
              {index + 1} / {QUOTES.length}
            </span>
            <IconButton
              icon={ChevronRight}
              label="Next quote"
              onClick={() => setIndex((index + 1) % QUOTES.length)}
            />
          </div>
          <Row
            icon={Share2}
            title="Share quotation"
            onClick={() =>
              navigator.share
                ? navigator
                    .share({ title: quote.author, text: quote.text })
                    .catch(() => {})
                : navigator.clipboard
                    .writeText(`${quote.text} - ${quote.author}`)
                    .then(() => a.notify("Copied"))
            }
          />
        </div>
      </>
    );
  }
  if (a.screen === "kids")
    return (
      <>
        <PageHeading
          title={
            <>
              Read
              <br />
              together.
            </>
          }
          kicker="CHILDREN'S READING"
        />
        <div className="page-pad">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Find a title or author"
          />
          {kids
            .filter((b) =>
              `${b.title} ${b.author}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((book) => (
              <Row
                key={book.id}
                icon={BookOpen}
                title={book.title}
                sub={`${book.author} / ${book.ageLabel}`}
                onClick={() => setSelected(book)}
              />
            ))}
        </div>
        {selected && (
          <Sheet title={selected.title} onClose={() => setSelected(null)}>
            {selected.localImage && (
              <img
                className="children-art"
                src={selected.localImage}
                alt={selected.title}
              />
            )}
            <p className="body-copy">{selected.description}</p>
            <p className="source-line">
              {selected.author} / {selected.ageLabel}
            </p>
            {selected.buyLink && (
              <a
                className="action primary"
                href={selected.buyLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selected.buyLabel || "View book"}
              </a>
            )}
          </Sheet>
        )}
      </>
    );
  if (a.screen === "plans")
    return (
      <>
        <PageHeading
          title={
            <>
              A daily
              <br />
              commitment.
            </>
          }
          kicker="READING PLANS"
        />
        <div className="page-pad">
          <label className="select-label">
            YOUR PLAN
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {BIBLE_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Start date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <Action
            onClick={() => {
              if (!date) return;
              setPlans([
                ...plans.filter((p) => p.planId !== planId),
                { planId, startDate: date },
              ]);
              a.notify("Reading plan saved");
            }}
          >
            Start plan
          </Action>
          <SectionTitle>Your active plans</SectionTitle>
          {plans.map((plan) => (
            <Row
              key={plan.planId}
              icon={BookOpen}
              title={
                BIBLE_PLANS.find((p) => p.id === plan.planId)?.name ||
                plan.planId
              }
              sub={plan.startDate}
              onClick={() => setSelected(plan)}
            />
          ))}
        </div>
        {selected && (
          <Sheet title="Reading plan" onClose={() => setSelected(null)}>
            <Row
              icon={BookOpen}
              title="Open readings"
              onClick={() => a.go("plans")}
            />
            <Action
              secondary
              icon={Trash2}
              onClick={() => {
                setPlans(plans.filter((p) => p.planId !== selected.planId));
                setSelected(null);
              }}
            >
              Stop this plan
            </Action>
          </Sheet>
        )}
      </>
    );
  if (a.screen === "profile")
    return (
      <>
        <PageHeading
          title={
            <>
              A place
              <br />
              to grow.
            </>
          }
          kicker="YOUR STUDY SPACE"
        />
        <div className="page-pad">
          <div className="profile-name">
            <span className="avatar large-avatar">
              <UserRound size={28} />
            </span>
            <h2>{user?.user_metadata?.full_name || "Your study space"}</h2>
            <span className="muted-copy">
              {user?.email || "Sign in to back up your notebook"}
            </span>
          </div>
          <Row
            icon={RefreshCw}
            title="Sync your account"
            onClick={async () => {
              setBusy(true);
              try {
                await syncReadingData();
                a.notify("Account synced");
              } catch {
                a.notify("Sync did not complete. Please try again.");
              } finally {
                setBusy(false);
              }
            }}
          />
          <Row
            icon={Download}
            title="Download reading backup"
            onClick={downloadReadingBackup}
          />
          <Row
            icon={Heart}
            title="Your saved passages"
            onClick={() => a.go("highlights")}
          />
          {busy && <Loading />}
          {user ? (
            <Row
              icon={LogOut}
              title="Sign out"
              onClick={async () => {
                await signOut();
                router.push("/auth/login");
              }}
            />
          ) : (
            <Action onClick={() => router.push("/auth/login?next=%2Fprofile")}>
              Sign in
            </Action>
          )}
        </div>
      </>
    );
  return null;
}
