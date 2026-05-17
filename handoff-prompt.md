# Rebuttal Your Church — Project Handoff Prompt

Paste this entire document into a new chat to give full context on what this project is, how it's built, and what's already been done. Feel free to then ask for improvements, new features, bug fixes, or anything else.

---

## What This Project Is

**Rebuttal Your Church** is a web app that analyzes sermons against historic biblical Christianity. The user pastes in sermon text (or drops in a YouTube URL), chooses English or Spanish, picks a depth (3, 5, or 7 claims), and clicks Analyze. The app sends the transcript to Claude claude-sonnet-4-6, which returns a structured JSON analysis of the sermon's theological claims — each one checked against Scripture, historic creeds/confessions, and notable theologians, with a verdict (ALIGNED / SECONDARY_DIFFERENCE / CAUTION / CONTRADICTS_FUNDAMENTAL). The overall sermon gets a verdict too (SOUND / MIXED / SERIOUS_CONCERNS / FALSE_TEACHING).

It also has a **Scripture Explorer** (the Lexicon page) where the user can browse the KJV Bible chapter by chapter, tap on any word to see its Strong's Concordance entry (Hebrew/Greek definition, transliteration, pronunciation), search Strong's by keyword, and read Matthew Henry Commentary for any chapter.

The app works in demo mode with no API key (returns a hardcoded prosperity-gospel example analysis) and switches to live Claude analysis automatically when `ANTHROPIC_API_KEY` is set in `backend/.env`.

---

## Tech Stack

**Frontend:** Next.js 15 with App Router, TypeScript, Tailwind CSS. Runs on `http://localhost:3000`.

**Backend:** Python + FastAPI + Uvicorn. Runs on `http://localhost:8000`. Key dependencies: `anthropic`, `python-dotenv`, `pydantic`, `youtube-transcript-api`.

**No database.** All persistence is localStorage on the client (analysis history, up to 50 entries).

**Bible data:** Local JSON files in `backend/data/` (downloaded via `download-bibles.command`). Format is scrollmapper-style: each entry has `b` (book number 1–66), `c` (chapter), `v` (verse), `t` (text). Files: `kjv.json`, `geneva1599.json`. ESV available via api.esv.org with `ESV_API_KEY`. Spanish (RVR1960 / LBLA) via scripture.api.bible with `BIBLE_API_KEY`.

---

## Project File Structure

```
Rebuttal your church/
├── backend/
│   ├── main.py                     # ~40-line entry point: load_dotenv, FastAPI app, CORS, include routers
│   ├── requirements.txt
│   ├── .env                        # ANTHROPIC_API_KEY, ESV_API_KEY, BIBLE_API_KEY
│   ├── lexicon_service.py          # Strong's Concordance + Matthew Henry Commentary data access
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── analyze.py              # POST /api/transcript, POST /api/analyze
│   │   └── lexicon.py              # GET /api/lexicon/*, GET /api/commentary/*
│   └── services/
│       ├── __init__.py
│       └── bible.py                # Bible verse lookup, enrichment, all fetcher helpers
│
├── frontend/
│   └── app/
│       ├── page.tsx                # Main sermon analyzer page (~430 lines)
│       ├── layout.tsx
│       ├── globals.css
│       ├── lexicon/
│       │   └── page.tsx            # Scripture Explorer page
│       ├── lib/
│       │   ├── types.ts            # All shared TypeScript types/interfaces
│       │   ├── api.ts              # Typed API client (apiFetch + named exports)
│       │   ├── translations.ts     # All UI strings for EN + ES
│       │   └── constants.ts        # Shared constants
│       ├── hooks/
│       │   └── useHistory.ts       # localStorage history read/write hook
│       └── components/
│           ├── ClaimCard.tsx       # Renders a single theological claim
│           ├── DemoBanner.tsx      # "Demo mode — set your API key" banner
│           └── HistoryDrawer.tsx   # Slide-in panel of past analyses
│
├── start-dev.sh                    # Starts both frontend and backend
├── download-bibles.command         # Downloads kjv.json and geneva1599.json
├── download-lexicon.command        # Downloads Strong's and Matthew Henry data
└── install-youtube.command         # Installs youtube-transcript-api in the venv
```

---

## Backend Architecture

### `main.py`
The slim entry point. Its only jobs:
1. Call `load_dotenv()` — this MUST happen before any router imports so that `os.getenv()` in the routers sees the `.env` values.
2. Create the FastAPI app and add CORS middleware (allows `http://localhost:3000`).
3. Include `analyze.router` and `lexicon.router`.
4. Expose `GET /` health check.

### `routers/analyze.py`
Contains everything related to sermon analysis:
- `MOCK_ANALYSIS_EN` / `MOCK_ANALYSIS_ES` — hardcoded demo analysis (a prosperity gospel example with 4 claims)
- `SYSTEM_PROMPT_EN` / `SYSTEM_PROMPT_ES` — the Claude system prompts. Both use `{MAX_CLAIMS}` as a placeholder filled at call time.
- `extract_youtube_id(url)` — parses all YouTube URL formats
- `_fmt_ts(seconds)` / `_segments_to_timestamped_text(segments)` — convert transcript segments to `[MM:SS] text` blocks so Claude can cite timestamps
- `_fetch_transcript(video_id)` — uses `youtube-transcript-api` v1.0+ with a priority fallback chain (fast path → manual EN → auto EN → translate → any language)
- `AnalyzeRequest` and `TranscriptRequest` Pydantic models
- `POST /api/transcript` — extract YouTube transcript only (no Claude), returns `{transcript, video_id, char_count}`
- `POST /api/analyze` — full analysis; demo mode if no API key, otherwise calls Claude claude-sonnet-4-6 with `max_tokens=3500`, parses JSON response, then calls `enrich_with_bible` to attach verse texts to each claim
- Anthropic client initialized at module level: `_api_key = os.getenv("ANTHROPIC_API_KEY", "")` / `client = Anthropic(api_key=_api_key) if _api_key else None`

### `routers/lexicon.py`
Contains the 6 lexicon/commentary routes:
- `GET /api/lexicon/books` — all 66 books with chapter counts, plus flags `hasStrongs` and `hasMhc`
- `GET /api/lexicon/chapter?book=&chapter=` — KJV verse text with per-word Strong's tagging. Calls `load_local_bible("kjv.json")` from `services.bible` for the text, then `_lex.get_chapter(book, chapter, kjv_data)` for tagged verse objects.
- `GET /api/lexicon/strongs/{number}` — single Strong's entry (e.g. `H430`, `G2316`)
- `GET /api/lexicon/search?q=&lang=&limit=` — search Strong's by English keyword; `lang` = `H` or `G`
- `GET /api/commentary/chapter?book=&chapter=` — all Matthew Henry entries for a chapter
- `GET /api/commentary/verse?book=&chapter=&verse=` — single verse commentary (verse=0 = chapter intro)

### `services/bible.py`
All Bible verse lookup logic, extracted from the original monolithic `main.py`:
- `BOOK_CODES` — 66-entry dict mapping English canonical book names → 3-letter api.bible codes
- `BOOK_NORMALIZE` — Spanish book names → English canonical names
- `BOOK_NUMBERS` — English canonical → scrollmapper book number 1–66
- `load_local_bible(filename)` — loads a scrollmapper JSON from `backend/data/`, returns dict keyed `"{b}_{c}_{v}" → text`, cached in memory. Path uses `os.path.join(os.path.dirname(__file__), "..", "data", filename)` (goes up one level from `services/` to `backend/`).
- Private fetchers: `_fetch_kjv`, `_fetch_esv`, `_fetch_rvr60`, `_fetch_lbla`, `_fetch_geneva` — each tries local file first, then live API as fallback
- `_VERSE_REF_RE` — compiled regex that matches verse references in both English and Spanish (e.g. "Matthew 7:11", "Mateo 7:11", "2 Corintios 12:7")
- `enrich_with_bible(analysis, lang)` — public orchestrator: scans all `scriptureCheck` fields for verse refs, fetches verse texts in parallel (ThreadPoolExecutor, max 8 workers, 12s timeout, capped at 14 unique refs), attaches `claim["bibleVerses"]` dict keyed `ref → {version → text}`

### `lexicon_service.py`
Pre-existing file (not part of the refactor). Handles Strong's Concordance and Matthew Henry Commentary data files. Key public API used by the lexicon router: `book_info()`, `has_strongs_data()`, `has_mhc_data()`, `get_chapter(book, chapter, kjv_data)`, `get_strongs_entry(number)`, `search_strongs(q, lang, limit)`, `get_chapter_commentary(book, chapter)`, `get_commentary(book, chapter, verse)`, `BOOK_BY_NUMBER`.

---

## Frontend Architecture

### `app/lib/types.ts`
All shared TypeScript interfaces:
- `ClaimVerdict` — `"ALIGNED" | "SECONDARY_DIFFERENCE" | "CAUTION" | "CONTRADICTS_FUNDAMENTAL"`
- `OverallVerdict` — `"SOUND" | "MIXED" | "SERIOUS_CONCERNS" | "FALSE_TEACHING"`
- `Claim` — one theological claim: `quote`, `timestamp`, `scriptureCheck`, `historicCheck`, `theologianNote`, `verdict`, `verdictExplanation`, optional `bibleVerses`
- `Analysis` — full sermon result: `summary`, `claims[]`, `redFlags[]`, `recommendations[]`, `overallVerdict`, `overallExplanation`, optional `videoId`
- `HistoryEntry` — one saved analysis in localStorage
- `BookMeta`, `WordToken`, `Verse`, `ChapterData`, `StrongsEntry`, `CommentaryEntry` — Lexicon page models

### `app/lib/api.ts`
Typed API client. Single `apiFetch<T>` base handles errors. Named exports:
- `analyzeSermon(body: AnalyzeTextParams | AnalyzeYoutubeParams): Promise<Analysis>`
- `fetchBooks(): Promise<BooksResponse>`
- `fetchChapter(book, chapter): Promise<ChapterData>`
- `fetchCommentary(book, chapter): Promise<CommentaryEntry[]>`
- `fetchStrongs(id): Promise<StrongsEntry>`
- `searchStrongs(opts): Promise<StrongsEntry[]>`

### `app/hooks/useHistory.ts`
Custom hook that encapsulates `localStorage` history. Storage key: `"ryc-history"`, max 50 entries. Returns `{ history: HistoryEntry[], saveHistory: (entries) => void }`.

### `app/components/`
- **`DemoBanner`** — collapsible info panel shown when no API key is configured. Shows setup instructions.
- **`ClaimCard`** — renders one claim with verdict badge (color-coded), quote, timestamp link (if YouTube), and a three-panel grid (Scripture / Historic / Theologian). Also renders `bibleVerses` inline if present.
- **`HistoryDrawer`** — fixed slide-in overlay showing past analyses. Accepts `onSelect` callback with `{analysis, isDemoResult, preacher, entryId}`.

### `app/page.tsx` (main analyzer)
~430 lines after refactor (was 1,288). Key state: `tab` (text/youtube), `lang` (en/es), `maxClaims` (3/5/7), `loading`, `error`, `result: Analysis | null`, `preacher`, `youtubeUrl`, `sermonText`, `showHistory`, `isDemoResult`. Uses `useHistory` hook. `handleAnalyze` calls `analyzeSermon(...)` from `lib/api`.

### `app/lexicon/page.tsx` (Scripture Explorer)
Key state: `books`, `selectedBook`, `selectedChapter`, `verses`, `commentary`, `selectedWord`, `strongsEntry`, `searchQuery`, `searchResults`. Uses all 5 lexicon API functions from `lib/api`.

---

## API Key Setup

Create `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...       # Required for real analysis
ESV_API_KEY=...                    # Optional — English ESV verse text
BIBLE_API_KEY=...                  # Optional — Spanish RVR1960/LBLA verse text
```

Without `ANTHROPIC_API_KEY`, the app runs in demo mode. KJV verse fetching (via local file or bible-api.com) works without any key.

---

## How to Run

```bash
# Install backend deps (first time)
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Download Bible data (first time)
./download-bibles.command
./download-lexicon.command

# Start backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Start frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:3000. Health check: http://localhost:8000.

---

## Current State

- TypeScript passes `npx tsc --noEmit` with zero errors. All backend Python files parse cleanly.
- Full four-tier backend refactor is complete: slim `main.py`, routers in `routers/`, Bible service in `services/bible.py`.
- Demo mode works without any API keys.
- YouTube transcript extraction works with `youtube-transcript-api` v1.0+ (fast path + full fallback chain).
- Bible verse enrichment runs in parallel via `ThreadPoolExecutor` — verse texts are attached to each claim and displayed inline in the frontend.
- History stored in localStorage, max 50 entries, viewable/deletable via `HistoryDrawer`.
- **Rate limiting** — `slowapi` wired up. `/api/transcript` is capped at 20/min; `/api/analyze` and `/api/analyze/stream` at **3/day** per IP. 429 responses return `{"detail": "Rate limit exceeded…"}`.
- **Streaming SSE** — `POST /api/analyze/stream` sends `{"type":"heartbeat"}` every 3s while Claude works, then `{"type":"done", ...analysis}`. Frontend uses `analyzeSermonStream()` from `lib/api.ts`.
- **Geneva 1599 selectable (everywhere)** — KJV / Geneva 1599 toggle on the sermon analyzer input form AND in the Scripture Explorer. `enrich_with_bible` dispatches fetchers accordingly. The lexicon `/api/lexicon/chapter` endpoint accepts `?translation=geneva`.
- **Shareable links** — Share button copies a URL with `#result=<base64-encoded-JSON>` to clipboard. On page load, if that hash is present the analysis is decoded and shown with a "Shared Analysis" badge.
- **PDF export enhanced** — `@page` rule sets A4 with 18mm margins. Cards get `break-inside: avoid`. Three-panel grid collapses to single column for print. A print-only header shows the app name and export date.
- **Preacher tracking tab** — `HistoryDrawer` now has History/Preachers tabs. Preachers tab groups past analyses by preacher name, shows sermon count, verdict distribution pills, and worst overall verdict.
- **Mobile polish** — History drawer is full-width on mobile (`w-full sm:max-w-md`). ClaimCard grid uses `md:grid-cols-3` (stacks below 768px). All interactive elements meet 44px minimum tap target.
- **Global AppNav** — fixed top nav bar (`components/AppNav.tsx`) with links to all five pages, community CTA, mobile hamburger. Wired into `layout.tsx` with `pt-14` body offset.
- **Featured Videos page** (`/videos`) — curated YouTube embeds from Reformed teachers (Piper, Sproul, Washer, Baucham, Ferguson, Begg, Ravenhill, Edwards, Chan). Category filter, thumbnail grid, lightbox player.
- **Community/Donations page** (`/give`) — free vs. $4.99 community tier cards, one-time donation buttons, 30/70 revenue split explanation, FAQ, Patreon + Ko-fi links.
- **Free Books Library** (`/library`) — catalog of public-domain Reformed classics fetched from Project Gutenberg, cached locally in `backend/data/books/`. Grid listing with cover emoji, tags, author, year. Coming-soon books shown grayed out.
  - **In-app book reader** (`/library/[slug]`) — chapter nav, font size controls (5 sizes), dark/sepia/light themes, bookmark (localStorage), Table of Contents drawer, keyboard navigation (← →).
  - **Presentation / Sunday mode** — full-screen clean reader at 2xl–3xl font, large verse numbers, nav bar at bottom. Press F or use the ⛶ button to enter.
  - **Books backend router** (`routers/books.py`) — `GET /api/books`, `GET /api/books/{slug}`, `GET /api/books/{slug}/chapter/{n}`. PG text fetcher strips header/footer boilerplate, heuristically splits into chapters, caches in `backend/data/books/`.
- **Enhanced Scripture Explorer** — Geneva 1599 toggle, font size controls (A+ / A-), word highlight mode (click or right-click words, persisted per chapter in localStorage), Presentation / Sunday service mode (full-screen large text), keyboard shortcuts (F = presentation, H = highlight mode, ← → = chapter nav).

---

## Ideas for Improvement

- **Error recovery on bad JSON** — if Claude returns malformed JSON, a 500 is raised. Could auto-retry with a stricter prompt.
- **Authentication / user accounts** — currently fully local/no-auth. Could add Clerk or simple session-based auth if deploying publicly.
- **Server-side share IDs** — the current shareable link encodes the full analysis in the URL hash (can be long). A `/api/share` endpoint storing results by short ID would produce cleaner URLs.
- **Streaming per-claim** — currently streaming sends the full analysis as one done event. True per-claim streaming would require partial JSON parsing.
- **Licensed Bible translations** — ESV, NASB 1995, NKJV, LSB all require ministry licenses. Send letters to rights holders now that the app is operational.
- **Lexicon mobile polish** — the Scripture Explorer two-panel layout hasn't been fully optimized for small screens yet.
- **Real Patreon/Ko-fi links** — `/give` page currently links to patreon.com and ko-fi.com (root). Replace with actual campaign URLs when accounts are created.
- **Book highlight sync** — highlights are stored per chapter in localStorage. Could extend to sync across devices via a simple backend endpoint for logged-in community members.
