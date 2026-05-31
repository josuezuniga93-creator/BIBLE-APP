# Claude Deploy Handoff: Generated Badges And Covers

## Goal

Deploy the latest phone-app design update for TULIP / Rebuttal Your Church.

This update replaces emoji-based badges and static cover-image overrides with generated in-app SVG/CSS artwork that follows the active appearance theme.

## Files Changed

Use these files for the deploy handoff:

```text
frontend/app/components/GeneratedArtwork.tsx
frontend/app/globals.css
frontend/app/page.tsx
frontend/app/family-worship/page.tsx
frontend/app/library/page.tsx
frontend/app/library/[slug]/page.tsx
frontend/app/learn/page.tsx
frontend/app/timeline/page.tsx
```

## What Changed

- Added `GeneratedArtwork.tsx`, a shared component for generated badge logos, book covers, historical document covers, category marks, and metadata icons.
- Replaced home-page streak badge emojis with generated badge logos.
- Replaced Family Worship devotional badge emojis with generated badge logos.
- Replaced Library book cover image overrides with generated covers.
- Replaced book-detail cover rendering with generated covers.
- Replaced Historical Documents cover image overrides with generated covers.
- Replaced Historical Documents browse-category emojis with generated marks.
- Replaced Historical Documents metadata emoji icons with generated icons.
- Replaced Timeline section emoji marks with generated marks.
- Added theme-aware generated artwork CSS in `globals.css`.
- Pink Blossom and Light Elegant stay lighter and readable.
- Glow is limited to Premium Neon artwork styling.

## Verification Already Run

These commands passed locally:

```bash
cd ~/Documents/Claude/Projects/Rebuttal\ your\ church/frontend
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

Lint passed with existing unrelated warnings only:

- `kids-books/page.tsx` and `videos/page.tsx` still have existing `<img>` warnings.
- `learn/page.tsx`, `library/page.tsx`, and `library/[slug]/page.tsx` still have existing hook dependency warnings.

## Deploy Command

Run this from Terminal:

```bash
cd ~/Documents/Claude/Projects/Rebuttal\ your\ church/frontend && vercel --prod
```

## Note

The working tree already contains other modified files from previous work. Deploying with Vercel will publish the current project state, including those existing changes.
