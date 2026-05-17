#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — Upgrade to Next.js 15
#
# Double-click this file in Finder to:
#   1. Remove next.config.ts (not supported in Next.js 14, replaced by .mjs)
#   2. Run npm install to get Next.js 15
#   3. Run npm audit fix
#   4. Run a production build to confirm everything compiles
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║   Rebuttal Your Church — Next.js 15 Setup  ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# ── Step 1: Remove next.config.ts ──────────────────────────────────────────
if [ -f "$FRONTEND_DIR/next.config.ts" ]; then
  rm "$FRONTEND_DIR/next.config.ts"
  echo "✓ Removed next.config.ts  (replaced by next.config.mjs)"
else
  echo "  next.config.ts already gone — nothing to remove."
fi

# ── Step 2: npm install (gets Next.js 15) ──────────────────────────────────
echo ""
echo "▶ Running npm install (this may take a minute)..."
cd "$FRONTEND_DIR"
npm install

if [ $? -ne 0 ]; then
  echo ""
  echo "✗ npm install failed. Check errors above."
  echo "Press Enter to close."
  read
  exit 1
fi

# ── Step 3: npm audit fix ──────────────────────────────────────────────────
echo ""
echo "▶ Running npm audit fix..."
npm audit fix

# ── Step 4: production build to verify ────────────────────────────────────
echo ""
echo "▶ Running production build to verify everything compiles..."
npm run build

if [ $? -eq 0 ]; then
  NEXT_VERSION=$(node -e "console.log(require('./node_modules/next/package.json').version)")
  echo ""
  echo "══════════════════════════════════════════════"
  echo "  ✓ SUCCESS"
  echo "  Next.js version installed: $NEXT_VERSION"
  echo "  Build: PASSED"
  echo ""
  echo "  You can now run the app:"
  echo "    bash \"$PROJECT_DIR/start-dev.sh\""
  echo "══════════════════════════════════════════════"
else
  echo ""
  echo "✗ Build failed — check errors above."
fi

echo ""
echo "Press Enter to close this window."
read
