# Tulip Bible App — Project Notes for Claude

## What this project is
A mobile-first Reformed theology Bible app called the **Tulip Bible App**, built with **Next.js 13+ App Router** and deployed on **Vercel**. The frontend lives in `/frontend`. Deploy command: `git add -A && git commit -m "..." && cd frontend && vercel --prod`

Live URL: **https://tulip-bible-app.vercel.app**

---

## Tech stack
- Next.js 13+ App Router, TypeScript, Tailwind CSS
- `"use client"` pages throughout
- `localStorage` for all user data (highlights, notes, prayers, progress)
- Backend: Python/FastAPI (separate service), Next.js API routes in `/frontend/app/api/`

---

## Theme system
- Three themes: **Premium Neon** (default dark), **Dark Minimal**, **Light Elegant**
- Theme hook: `useTheme()` from `../lib/useTheme`
- CSS custom properties on `html[data-theme="light-elegant"]` in `globals.css`
- Key Light Elegant values: `--accent: #9b7228`, `--bg: #ede8df`, `--fg: #1c1409`
- Pattern in components: `const isLight = theme === "light-elegant"`

---

## Key pages and what they do

| Page | File | Notes |
|------|------|-------|
| Home | `app/page.tsx` | Verse of the Day, Featured Article (Marrow Ministries), Featured Meditation of Scripture (video), Badges |
| Bible Reader | `app/lexicon/page.tsx` | Full Strong's concordance, verse highlighting, chapter notes, translations (KJV/Geneva/RV60) |
| Free Books | `app/library/page.tsx` | Book grid with photo cover overrides |
| Book Reader | `app/library/[slug]/page.tsx` | Full-screen book reader with highlights |
| Historical Docs | `app/learn/page.tsx` | Creeds, confessions, catechisms with timeline |
| Family Worship | `app/family-worship/page.tsx` | Daily entry with hymn, Bible verse, prayer list |
| Timeline | `app/timeline/page.tsx` | Interactive church history timeline to 1741 |

---

## Photo book covers
Stored in `/frontend/public/covers/`. The `COVER_IMAGES` map (slug → path) is defined in **both**:
- `app/library/page.tsx` (book grid cards)
- `app/library/[slug]/page.tsx` (book reader detail)

Current covers: `pilgrims-progress.png`, `grace-abounding.png`, `confessions-augustine.png`, `jerusalem-council.png`, `apostles-creed.png`, `council-nicaea.png`

---

## Article reader (home page)
- Marrow Ministries articles fetched via `/api/articles/` and `/api/articles/content/`
- Full-screen reader (`z-[200]`) with back arrow, covers tab bar
- Guest articles detected by Squarespace category — author credit hidden when category contains "Guest"
- Body scroll: `overscroll-contain`, `WebkitOverflowScrolling: touch`, `minHeight: 0`

---

## Bible reader verse highlighting
- Tap a verse's text → whole verse underlines (violet in dark themes, gold in Light Elegant) → color picker appears
- Colors stored in localStorage per book/chapter
- Key: `ryc-vcolor-{bookNum}-{chapterNum}`

---

## Family Worship prayer section
- localStorage key: `"axiom-fw-prayers"`
- `PrayerItem { id: string; text: string }` interface
- Add/edit/delete with inline textarea; Enter = submit, Escape = cancel

---

## Light Elegant CSS overrides (globals.css)
- `.le-nav-arrow` — gold Bible reader nav arrows
- `.le-testament-label` — gold "New Testament / Old Testament" label
- `.home-votd-card` / `.home-votd-overlay` — warm parchment Verse of the Day card

---

## Things to keep in mind
- When editing large files, always `Read` the specific offset before editing
- The `.claude/worktrees/` folder shows as modified — this is normal, ignore it in git
- The `index.lock` error means a previous git process crashed — fix with `rm .git/index.lock`
- Josue prefers concise responses and deploy commands ready to copy-paste
