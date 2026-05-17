#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — Lexicon Data Downloader
# Double-click in Finder to run, OR:
#   bash download-lexicon.command
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

# Use the venv Python if available, otherwise fall back to system Python
PYTHON="backend/venv/bin/python3"
if [ ! -f "$PYTHON" ]; then
  PYTHON="python3"
fi

"$PYTHON" backend/download_lexicon.py

echo ""
echo "Press any key to close…"
read -n 1
