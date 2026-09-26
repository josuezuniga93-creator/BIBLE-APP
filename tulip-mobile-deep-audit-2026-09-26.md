# Tulip Bible Mobile Deep Audit — September 26, 2026

## Executive Summary

I audited Tulip Bible as a mobile-first Bible app, researched real user complaints around Bible software, and applied a first wave of improvements directly to the app. The update focuses on trust, speed, data safety, offline resilience, search forgiveness, and dark/light mobile polish.

The app is now in a stronger place technically: lint passes, TypeScript passes, the production build passes, and the new test suite covers Scripture search edge cases, reminder generation, and backup filtering. A local rollback tag was created before the work: `tulip-before-mobile-audit-2026-09-26`.

## What I Changed In This Release

### 1. Search Reliability

- Scripture references now accept loose spacing like `John 3: 5-7`, `John 3 :   5 - 7`, `Juan 3: 5`, and `1   John 2:1`.
- Invalid chapter and verse inputs now fail instead of silently clamping to a different Bible location.
- Added tests for these cases.

Why it matters: Bible users type references quickly and inconsistently. Search should behave like a pastor wrote it on a whiteboard, not like a strict database form.

### 2. Mobile Nav And Theme Polish

- Made the official floating nav less transparent in both light and dark mode.
- Kept the approved bottom nav design and improved the dark-mode surface opacity.
- Removed remaining light-mode gold from the Bible tracker core progress accents.
- Improved global muted text tokens so dark-mode and light-mode UI has better contrast.

### 3. Devotional Performance And Reliability

- Moved devotional entry loading behind an API route so the full devotional library is not pulled into the client page.
- Added loading and retry behavior for devotional fetch failures.
- Fixed date handling to use calendar-safe UTC math for the Ryle plan index.
- Replaced fragile phone notification promises with downloadable calendar reminders.

### 4. Data Safety, Sync, And Backup

- Added a local reading-data backup export in More.
- Added an allowlist for backup/sync keys so app data exports avoid auth/session secrets.
- Hardened Supabase sync with account ownership checks and conflict preservation.
- Added visible save failure handling for Notes if device storage is full.
- Notes now validate loaded localStorage shape instead of trusting any parsed JSON.

User research strongly supports this: people worry about years of highlights/notes disappearing, privacy changes, and whether they can export their work.

### 5. Offline And Cache Behavior

- Replaced the service worker with safer cache behavior:
  - Public reading routes are network-first with fallback.
  - Static assets are cache-first.
  - Previously opened content/devotional API responses can be reused offline.
  - Auth, AI, profile, and private routes are excluded from offline caching.
- Added chapter caching in Cache Storage with legacy localStorage migration.

Important limitation: this is not yet a full offline Bible download system. It makes previously opened reading screens more resilient, not the entire Bible permanently offline.

### 6. Security And API Safety

- Upgraded Next.js to `15.5.26`.
- Re-enabled build-time lint/type checks.
- Added bounded JSON parsing and rate limiting helpers.
- Hardened `/api/analyze-church`:
  - Requires authentication before analysis.
  - Rejects malformed or oversized transcript payloads.
  - Adds timeout handling and safer provider error responses.
- Removed hardcoded public transcript-bridge fallback token.
- Hardened auth callback path handling.

### 7. Accessibility Fixes

- Removed disabled zoom in viewport metadata.
- Added missing accessible labels for several icon-only buttons and overlay links:
  - Timeline document cards.
  - Library reader buttons.
  - Preview header controls.
  - Church directory back link.
  - Church analysis back button.
  - Videos search toggle.
- Changed Library/Learn tab groups away from invalid tablist semantics where they did not implement true ARIA tabs.

## Verification

- `npm run check`: passed.
- `npm run build`: passed.
- New unit tests: 6 passing.
- Mobile audit script:
  - Full pass: 29 routes x 2 themes at 393px.
  - Targeted final pass after latest labels: core reader routes, More, Timeline, Library reader, Videos, and Scripture.
  - Result: no horizontal overflow on audited mobile routes.
  - Result: no unnamed controls remain on final targeted reader/library/timeline/video sweep.

## Remaining Known Debt

### Highest Priority

1. **Contrast debt on older pages**
   - Timeline, Bible Tracker, Church Directory, Kids, and some legacy pages still have many WCAG contrast findings.
   - This is mostly from old hardcoded muted text and decorative colors.
   - Recommendation: migrate these pages to shared design tokens instead of chasing individual color strings.

2. **Learn page bundle remains too large**
   - `/learn` still ships about 1 MB first load because it imports large historical document content.
   - I reduced shared bundle risk by generating a metadata catalog, but the Learn page itself still needs lazy content loading.
   - Recommendation: load the selected document through an API route or split document bodies into per-document modules.

3. **Full offline Bible is not done**
   - Research showed offline Bible access is a major user need.
   - Current release improves previously opened pages only.
   - Recommendation: build a deliberate "Download translation for offline reading" system with progress, storage size, and removal controls.

4. **Notes and highlights need import/export, not just backup**
   - Backup export is a good first safety feature.
   - Users want portable PDF/CSV/JSON export and future import.
   - Recommendation: add export buttons to Notes, Highlights, Favorites, and Reading Data.

5. **Church analysis needs draft preservation**
   - The API is safer now, but if a user is not signed in the UI should preserve their transcripts while sending them to sign in.
   - Recommendation: store a temporary local draft and restore it after auth.

### Medium Priority

6. **Reader selection/highlight UX should be unified**
   - Free Books and Historical Documents are much improved, but text selection is still browser-dependent.
   - Recommendation: add a consistent reader toolbar anchored near selected text with collision handling for viewport edges.

7. **Timeline should be redesigned as a proper mobile reading experience**
   - It scrolls and works, but it is still visually dense and contrast-heavy.
   - Recommendation: convert the timeline to Apple-style era cards with a single active era rail and document chips.

8. **Bible tracker needs a full mobile redesign**
   - Light-mode gold is reduced, but the page still has high contrast debt.
   - Recommendation: make tracker a quiet progress dashboard: chapters, testament sections, next reading, reset/export, and no decorative copy.

9. **Devotional should gain a "finish today" mental model**
   - The percentage/progress can be clearer.
   - Recommendation: show "Reading 60 of 99" as primary and percentage as secondary, with an explanation sheet.

10. **Supabase sync needs a user-facing conflict screen**
   - Conflicts are preserved now.
   - Recommendation: add a More > Reading Data > Sync Conflicts screen where users can restore or discard remote/local conflicts.

## Research Themes From Bible App Users

I looked at Reddit conversations and community threads around Bible apps and study software. These are qualitative signals, not formal survey data.

1. **People want a clean reader without interruptions**
   - Users complain about popups, social clutter, and donation prompts while trying to read.
   - Tulip should stay quiet, focused, and non-social by default.

2. **People are deeply protective of notes and highlights**
   - Multiple conversations mention fear of losing years of notes, needing export, or app/platform changes affecting access.
   - Tulip should make data ownership a visible promise, not a hidden feature.

3. **Offline matters, especially in church**
   - Users mention poor church internet and prefer apps that remain usable offline.
   - Tulip should treat offline Scripture and saved resources as a core feature.

4. **Fast navigation beats feature bloat**
   - Reformed/Bible-app discussions often praise lightweight apps that jump quickly to a book/chapter/verse.
   - Tulip should keep Scripture search and chapter switching extremely fast.

5. **Notes should stay in context**
   - Users dislike when notes become hard to find or detached from the verse/chapter they were written on.
   - Tulip should let users see notes beside Scripture and jump between both directions.

6. **Habit systems should be gentle**
   - Streaks and gamification divide users. Some like motivation; others feel guilt.
   - Tulip should keep reminders and reading plans optional and pastoral, not pressure-based.

## Sources Used

- Reddit: YouVersion notes visibility discussion, September 21, 2024 — https://www.reddit.com/r/Christianity/comments/1fm4znr/where_did_the_bible_app_notes_go/
- Reddit: notes/context discussion, October 1, 2020 — https://www.reddit.com/r/Christianity/comments/j3emjv
- Reddit: clean popup-free Bible app request, August 12, 2026 — https://www.reddit.com/r/Christianity/comments/1vm54jw/cleanest_popup_free_bible_app/
- Reddit: YouVersion privacy/sign-in concern, May 17, 2026 — https://www.reddit.com/r/Bible/comments/1tg3uvg/youversion_bible_app_privacy_policy/
- Reddit: app with search/highlight and offline needs, November 21, 2021 — https://www.reddit.com/r/Christian/comments/qygvns
- Reddit: notes import/export, August 31, 2024 — https://www.reddit.com/r/Bible/comments/1f5b6de
- Reddit: fear of abandoned note apps and PDF/CSV export, February 12, 2024 — https://www.reddit.com/r/Bible/comments/1aor7sz
- Reddit: Reformed app recommendations and fast navigation, October 20, 2021 — https://www.reddit.com/r/Reformed/comments/qccic7
- Reddit: fast lightweight Bible app discussion, March 3, 2025 — https://www.reddit.com/r/Reformed/comments/1j2dfsq
- Reddit: streaks/gamification debate, July 27, 2022 — https://www.reddit.com/r/Christians/comments/w8zrbm/a_bible_app_shouldnt_have_streaks/
- Reddit: offline commentary and cross-reference needs, May 30, 2024 — https://www.reddit.com/r/Reformed/comments/1d436ji
- Next.js security/update guidance — https://nextjs.org/blog
- Next.js support policy — https://nextjs.org/support-policy
- Next.js 15 upgrade docs — https://nextjs.org/docs/app/guides/upgrading/version-15
- GitHub advisory: PostCSS source map disclosure — https://github.com/advisories/GHSA-r28c-9q8g-f849

## My Recommended Next Sprint

1. Redesign Timeline and Bible Tracker as a shared premium mobile system using the approved light-grey/black style.
2. Add true offline Bible download for ESV/KJV/Geneva where licensing and provider terms allow it.
3. Add Notes/Highlights export and import.
4. Split `/learn` document content so the Learn page stops shipping the whole library at first load.
5. Add a conflict-review screen for Supabase sync.
6. Build an in-Scripture notes panel so notes stay visible in context.

