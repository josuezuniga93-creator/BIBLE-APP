#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Double-click this file in Finder to install the frontend dependencies.
# Only needs to be run once (or after updating package.json).
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo ""
echo "Installing frontend dependencies for Rebuttal Your Church..."
echo "This may take 1-2 minutes. Please wait."
echo ""

cd "$FRONTEND_DIR"
npm install

echo ""
if [ $? -eq 0 ]; then
  echo "✓ Done! Dependencies installed successfully."
  echo ""
  echo "Next steps:"
  echo "  1. Make sure backend/.env has your real ANTHROPIC_API_KEY"
  echo "  2. Run:  bash start-dev.sh"
  echo "  3. Open: http://localhost:3000"
else
  echo "✗ npm install failed. Check the output above for errors."
fi

echo ""
echo "Press Enter to close this window."
read
