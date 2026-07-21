# Plugin-Backed Launch Audit - 2026-07-21

## Scope

This pass focused on the launch recommendations for the Bible app using the connectors currently available in Codex:

- Notion: backlog tracking was created in the workspace.
- Supabase: project health and advisors were checked.
- Local repo: design-system, theme, asset, and build audits were run.
- GitHub, Google Drive, and Figma: tools are present, but this workspace did not expose enough connected account/file context to safely write into them from this task.

## Current Connector Findings

### Notion

Launch backlog exists:

https://app.notion.com/p/c7ecaf35eb504e16a6d33ee5d409aa82

Primary tracked work:

1. Unify app themes into Light and Dark semantic tokens.
2. Create a shared component layer for cards, buttons, modals, reader shells, and nav.
3. Optimize heavy routes and public assets.
4. Audit full text coverage for Free Books and Historical Docs.
5. Audit Supabase auth, sync, RLS, and local-first conflict rules.
6. Launch QA for accessibility, build, mobile, and desktop.

### Supabase

Project found:

- Name: tulip-bible-app
- Project ID: pencbnbfnpncijcmqymu
- Status: ACTIVE_HEALTHY
- Region: us-east-2
- Postgres: 17.6.1.127

Advisor findings:

- Security warning: leaked password protection is disabled.
- Performance warning resolved during this pass: `public.user_sync_data` RLS policy `Users manage their own data` now wraps `auth.uid()` as `(select auth.uid())` to avoid per-row re-evaluation.

Recommended Supabase action:

1. Enable leaked password protection in Supabase Auth settings.
2. Re-run security advisors after the Auth setting is enabled.

## Local App Findings

### Theme System

The app is moving toward two public themes:

- Light Mode
- Dark Mode

Legacy storage values still exist:

- `white-noir` maps to Light Mode.
- `gold-navy` maps to Dark Mode.

The new shared contract is:

- `data-theme-mode="light"`
- `data-theme-mode="dark"`

Current work in progress:

- Theme scripts now set both legacy `data-theme` and modern `data-theme-mode`.
- Bottom nav now watches both attributes.
- Light-mode CSS guardrails were added for nav, translation picker, and shared reader surfaces.

Remaining theme debt:

- Several pages still read `data-theme` directly instead of using `useTheme`, `normalizeTheme`, or `data-theme-mode`.
- `globals.css` still contains retired theme selectors such as `light-pink`, `light-elegant`, `premium-neon`, `ivory`, `lavender`, `sage`, `rose`, `slate`, and `neon`.
- Some home-page cards and older feature pages still hardcode gold, purple, or black accents that should be token-driven.

### Asset Weight

Largest assets currently found:

- `frontend/public/guided-scripture.mp4` - 24 MB
- `frontend/public/videos/featured-en.mp4` - 5.8 MB
- `frontend/public/videos/featured-es.mp4` - 5.8 MB
- Several cover images around 2-3.2 MB
- Multiple old PNG section icons around 1.3 MB each

Recommended asset action:

1. Replace old large PNG section icons with the new SVG icon system everywhere.
2. Compress or stream large video assets.
3. Convert large covers to optimized WebP/AVIF variants where browser support is acceptable.
4. Keep badge artwork colorful, but compress badge PNGs after final art approval.

### Build Health

Current verification commands for this pass:

- `npm run build`
- `npx tsc --noEmit --incremental false`
- `git diff --check`

Build result:

- TypeScript passed.
- Production build passed.
- Supabase performance advisor passed after the RLS policy fix.

Known unresolved QA debt from prior audit:

- `npm run lint` still needs modernization because `next lint` is deprecated and several ESLint rule issues remain.
- Some heavy routes exceed ideal first-load size and should be split or lazy-loaded:
  - `/family-worship`: about 1.67 MB first-load JS
  - `/`: about 1.05 MB first-load JS
  - `/learn`: about 1 MB first-load JS
  - `/library/[slug]`: about 1.01 MB first-load JS
  - `/lexicon`, `/library`, `/study-tools`, `/collections`, `/highlights`, and `/profile`: roughly 959 KB-996 KB first-load JS

## Recommended Next Implementation Order

### Phase 1 - Finish Theme Contract

1. Replace page-level `data-theme` reads with `useTheme()` or `data-theme-mode`.
2. Remove visible black/gold UI leaks in Light Mode.
3. Keep badge artwork colors untouched.
4. Preserve only two public theme names in user-facing UI: Light Mode and Dark Mode.

### Phase 2 - Shared Components

1. Create shared primitives for card, button, pill, sheet, modal, reader header, and page section heading.
2. Migrate high-traffic pages first:
   - Home
   - Scripture
   - Notes
   - Study Tools
   - Free Books
   - Historical Docs
   - Extras

### Phase 3 - Shared Reader And Highlight System

1. Confirm Study Tools, Free Books, and Historical Docs all use the same AppReader.
2. Confirm all reader highlights write into the unified highlight store.
3. Keep source-specific organization views, but one underlying highlight engine.

### Phase 4 - Content Completeness

1. Audit every Historical Docs entry for full primary text.
2. Audit every Free Books entry for full readable text.
3. Add a content status flag:
   - full-text
   - excerpt-only
   - metadata-only
   - external-link-only

### Phase 5 - Sync And Launch Reliability

1. Audit local-first writes for notes, highlights, bookmarks, badges, and reader progress.
2. Ensure UI updates instantly before cloud sync returns.
3. Surface sync errors gently without blocking reading or writing.
4. Resolve Supabase advisor warnings.

### Phase 6 - Performance And Launch QA

1. Split heavy routes and lazy-load noncritical modals/readers.
2. Compress media assets.
3. Replace remaining emojis with SVG icons.
4. Run build, typecheck, audit, and mobile/desktop smoke tests.
