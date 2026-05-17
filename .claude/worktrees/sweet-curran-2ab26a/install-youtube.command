#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — Install youtube-transcript-api
#
# Double-click this file in Finder to install the YouTube transcript library
# into the backend virtual environment.
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="$BACKEND_DIR/venv"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Rebuttal Your Church — YouTube Transcript Lib   ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Verify venv exists ────────────────────────────────────────────────────────
if [ ! -d "$VENV_DIR" ]; then
  echo "✗ Virtual environment not found at: $VENV_DIR"
  echo ""
  echo "  Run start-dev.sh at least once first to create the venv."
  echo ""
  echo "Press Enter to close."
  read
  exit 1
fi

# ── Activate venv and install ──────────────────────────────────────────────────
echo "▶ Activating virtual environment..."
source "$VENV_DIR/bin/activate"

echo ""
echo "▶ Installing youtube-transcript-api..."
pip install youtube-transcript-api --quiet

if [ $? -ne 0 ]; then
  echo ""
  echo "✗ Installation failed. Trying with --break-system-packages..."
  pip install youtube-transcript-api --break-system-packages --quiet
  if [ $? -ne 0 ]; then
    echo "✗ Still failed. Check pip output above."
    echo "Press Enter to close."
    read
    exit 1
  fi
fi

# ── Verify install ─────────────────────────────────────────────────────────────
python -c "from youtube_transcript_api import YouTubeTranscriptApi; print('  ✓ Import OK')" 2>/dev/null
if [ $? -eq 0 ]; then
  VERSION=$(pip show youtube-transcript-api 2>/dev/null | grep "^Version:" | awk '{print $2}')
  echo ""
  echo "══════════════════════════════════════════════════"
  echo "  ✓ SUCCESS"
  echo "  youtube-transcript-api $VERSION installed"
  echo ""
  echo "  Restart the backend (Ctrl+C then bash start-dev.sh)"
  echo "  to pick up the new library."
  echo "══════════════════════════════════════════════════"
else
  echo ""
  echo "✗ Installation succeeded but import failed — check errors above."
fi

echo ""
echo "Press Enter to close this window."
read
