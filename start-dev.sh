#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — Dev startup script
# Starts the FastAPI backend and Next.js frontend in parallel.
# Usage: bash start-dev.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║       Rebuttal Your Church — Dev Mode     ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# ── Check for .env ──────────────────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "⚠  No backend/.env found. Create it with your ANTHROPIC_API_KEY."
  echo "   See README.md for instructions."
  echo ""
fi

if grep -q "PLACEHOLDER" "$BACKEND_DIR/.env" 2>/dev/null; then
  echo "🔬 DEMO MODE: No Anthropic API key found."
  echo "   The app will run but analysis results will be sample data."
  echo "   To enable real AI analysis:"
  echo "   1. Sign up at https://console.anthropic.com (free \$5 credit)"
  echo "   2. Create an API key"
  echo "   3. Replace PLACEHOLDER in backend/.env with your real key (sk-ant-...)"
  echo "   4. Restart this script"
  echo ""
fi

# ── Start backend ───────────────────────────────────────────────────────────
echo "▶ Starting FastAPI backend on http://localhost:8000 ..."
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Give the backend a moment to boot
sleep 2

# ── Start frontend ──────────────────────────────────────────────────────────
echo ""
echo "▶ Starting Next.js frontend on http://localhost:3000 ..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "──────────────────────────────────────────────"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API docs: http://localhost:8000/docs"
echo "──────────────────────────────────────────────"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# ── Cleanup on exit ─────────────────────────────────────────────────────────
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
