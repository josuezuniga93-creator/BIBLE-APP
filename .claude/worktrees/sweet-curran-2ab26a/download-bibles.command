#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — Bible Data Downloader
# Double-click this file in Finder to download the Geneva 1599 Bible for
# offline verse lookup. Requires an internet connection.
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║      Downloading Bible Data Files            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

mkdir -p backend/data

# ── Geneva Bible 1599 ─────────────────────────────────────────────────────────
echo "▶ Downloading Geneva Bible 1599 (public domain)..."

GENEVA_URLS=(
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/t_gen.json"
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/t_gen.json"
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json_web/t_gen.json"
)

GENEVA_OK=false
for URL in "${GENEVA_URLS[@]}"; do
  echo "  Trying: $URL"
  if curl -fsSL --max-time 45 "$URL" -o backend/data/geneva1599.json 2>/dev/null; then
    # Validate it's actually a JSON array with the right shape
    if python3 -c "
import json, sys
try:
    d = json.load(open('backend/data/geneva1599.json'))
    assert isinstance(d, list) and len(d) > 1000
    assert 't' in d[0]
    print(f'  Looks good: {len(d)} verses')
except Exception as e:
    print(f'  Invalid: {e}')
    sys.exit(1)
" 2>&1; then
      BYTES=$(wc -c < backend/data/geneva1599.json | tr -d ' ')
      echo "  ✓ Geneva 1599 saved ($BYTES bytes)"
      GENEVA_OK=true
      break
    else
      rm -f backend/data/geneva1599.json
    fi
  fi
done

if [ "$GENEVA_OK" = false ]; then
  echo ""
  echo "  ✗ Could not download Geneva 1599."
  echo "    The app will still show ESV and KJV — Geneva will be skipped."
fi

# ── KJV local copy (optional — already free via bible-api.com) ────────────────
echo ""
echo "▶ Downloading King James Version (local cache for faster lookup)..."

KJV_URL="https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/t_kjv.json"
if curl -fsSL --max-time 45 "$KJV_URL" -o backend/data/kjv.json 2>/dev/null; then
  if python3 -c "
import json, sys
try:
    d = json.load(open('backend/data/kjv.json'))
    assert isinstance(d, list) and len(d) > 30000
    print(f'  {len(d)} verses')
except Exception as e:
    print(f'  Invalid: {e}')
    sys.exit(1)
" 2>&1; then
    BYTES=$(wc -c < backend/data/kjv.json | tr -d ' ')
    echo "  ✓ KJV saved ($BYTES bytes)"
  else
    rm -f backend/data/kjv.json
    echo "  ✗ KJV download failed (bible-api.com fallback will be used)"
  fi
else
  echo "  ✗ Could not download KJV (bible-api.com fallback will be used)"
fi

echo ""
echo "══════════════════════════════════════════════"
if [ "$GENEVA_OK" = true ]; then
  echo "✓ Geneva 1599 Bible is ready."
else
  echo "⚠  Geneva 1599 could not be downloaded."
fi
echo ""
echo "  Restart the backend server to activate new Bible data."
echo "  (Ctrl+C in the uvicorn terminal, then bash start-dev.sh)"
echo ""
echo "Press any key to close…"
read -n 1
