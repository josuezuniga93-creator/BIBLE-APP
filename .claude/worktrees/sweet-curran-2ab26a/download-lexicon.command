#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — Lexicon Data Downloader
# Double-click in Finder to download:
#   1. Strong's Hebrew Concordance  (~9,000 entries, public domain)
#   2. Strong's Greek Concordance   (~5,600 entries, public domain)
#   3. KJV with Strong's word tags  (word-level alignment, optional)
#   4. Matthew Henry Commentary     (full MHC, public domain, 1706)
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       Downloading Scripture Explorer Data Files          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

mkdir -p backend/data

# ── Helper: try to parse a JS module assignment into JSON ────────────────────
parse_js_dict() {
  local jsfile="$1" outfile="$2"
  python3 - "$jsfile" "$outfile" <<'PYEOF'
import sys, re, json
content = open(sys.argv[1], encoding='utf-8').read()
m = re.search(r'(?:exports\.default\s*=\s*|module\.exports\s*=\s*|var\s+\w+\s*=\s*)({[\s\S]*})\s*;?\s*$', content)
if not m:
    m = re.search(r'({[\s\S]*})\s*;?\s*$', content)
if m:
    data = json.loads(m.group(1))
    json.dump(data, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False)
    print(f"  Parsed {len(data)} entries from JS module")
else:
    print("  Could not parse JS module format")
    sys.exit(1)
PYEOF
}

# ── 1. Strong's Hebrew Dictionary ────────────────────────────────────────────
echo "▶  Strong's Hebrew Concordance (~8,700 entries)…"

HEBREW_OK=false

HEBREW_JSON_URLS=(
  "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew.json"
  "https://raw.githubusercontent.com/seven1m/strongs/main/hebrew.json"
  "https://raw.githubusercontent.com/loganwilliams/strongs-greek-hebrew/main/data/hebrew.json"
)

for URL in "${HEBREW_JSON_URLS[@]}"; do
  echo "  Trying: $URL"
  if curl -fsSL --max-time 45 "$URL" -o backend/data/strongs_hebrew.json 2>/dev/null; then
    if python3 -c "
import json,sys
d=json.load(open('backend/data/strongs_hebrew.json'))
assert isinstance(d,dict) and len(d)>1000, 'Too small'
print(f'  ✓ {len(d)} Hebrew entries')
" 2>&1; then
      HEBREW_OK=true
      break
    else
      rm -f backend/data/strongs_hebrew.json
    fi
  fi
done

if [ "$HEBREW_OK" = false ]; then
  JS_URLS=(
    "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js"
    "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/extras/strongs_hebrew.js"
  )
  for URL in "${JS_URLS[@]}"; do
    echo "  Trying JS: $URL"
    if curl -fsSL --max-time 45 "$URL" -o /tmp/strongs_heb_raw.js 2>/dev/null; then
      if parse_js_dict /tmp/strongs_heb_raw.js backend/data/strongs_hebrew.json 2>&1; then
        HEBREW_OK=true; break
      fi
    fi
  done
fi

if [ "$HEBREW_OK" = true ]; then
  BYTES=$(wc -c < backend/data/strongs_hebrew.json | tr -d ' ')
  echo "  ✓ Hebrew Strong's saved ($BYTES bytes)"
else
  echo "  ✗ Could not download Hebrew Strong's"
fi

# ── 2. Strong's Greek Dictionary ─────────────────────────────────────────────
echo ""
echo "▶  Strong's Greek Concordance (~5,600 entries)…"

GREEK_OK=false

GREEK_JSON_URLS=(
  "https://raw.githubusercontent.com/openscriptures/strongs/master/greek.json"
  "https://raw.githubusercontent.com/seven1m/strongs/main/greek.json"
  "https://raw.githubusercontent.com/loganwilliams/strongs-greek-hebrew/main/data/greek.json"
)

for URL in "${GREEK_JSON_URLS[@]}"; do
  echo "  Trying: $URL"
  if curl -fsSL --max-time 45 "$URL" -o backend/data/strongs_greek.json 2>/dev/null; then
    if python3 -c "
import json,sys
d=json.load(open('backend/data/strongs_greek.json'))
assert isinstance(d,dict) and len(d)>1000, 'Too small'
print(f'  ✓ {len(d)} Greek entries')
" 2>&1; then
      GREEK_OK=true
      break
    else
      rm -f backend/data/strongs_greek.json
    fi
  fi
done

if [ "$GREEK_OK" = false ]; then
  JS_URLS=(
    "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js"
    "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/extras/strongs_greek.js"
  )
  for URL in "${JS_URLS[@]}"; do
    echo "  Trying JS: $URL"
    if curl -fsSL --max-time 45 "$URL" -o /tmp/strongs_grk_raw.js 2>/dev/null; then
      if parse_js_dict /tmp/strongs_grk_raw.js backend/data/strongs_greek.json 2>&1; then
        GREEK_OK=true; break
      fi
    fi
  done
fi

if [ "$GREEK_OK" = true ]; then
  BYTES=$(wc -c < backend/data/strongs_greek.json | tr -d ' ')
  echo "  ✓ Greek Strong's saved ($BYTES bytes)"
else
  echo "  ✗ Could not download Greek Strong's"
fi

# ── 3. KJV with Strong's word-level tagging (optional) ──────────────────────
echo ""
echo "▶  KJV with per-word Strong's tagging (optional — enables click-any-word)…"

KJV_STRONGS_OK=false

KJV_STRONGS_URLS=(
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/t_kjv_strongs.json"
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/t_kjv_strongs.json"
  "https://raw.githubusercontent.com/openbible-io/strongs/main/kjv_strongs.json"
)

for URL in "${KJV_STRONGS_URLS[@]}"; do
  echo "  Trying: $URL"
  if curl -fsSL --max-time 90 "$URL" -o backend/data/kjv_strongs.json 2>/dev/null; then
    if python3 -c "
import json
d=json.load(open('backend/data/kjv_strongs.json'))
ct=len(d) if isinstance(d,list) else len(d)
assert ct>30000, 'Too small'
print(f'  ✓ {ct} tagged entries')
" 2>&1; then
      KJV_STRONGS_OK=true
      break
    else
      rm -f backend/data/kjv_strongs.json
    fi
  fi
done

if [ "$KJV_STRONGS_OK" = false ]; then
  echo "  ℹ  Word-tagged KJV not found — lexicon will run in search mode."
  echo "     (You can still click words; it will fuzzy-match via the Strong's definitions.)"
fi

# ── 4. Matthew Henry Commentary ──────────────────────────────────────────────
echo ""
echo "▶  Matthew Henry Commentary (1706, public domain — ~2.5 MB)…"

MHC_OK=false

MHC_URLS=(
  "https://raw.githubusercontent.com/christians94/Matthew-Henry-Commentary/main/mhc.json"
  "https://raw.githubusercontent.com/suchipi/matthew-henry-commentary/main/data.json"
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/extras/matthew_henry.json"
  "https://raw.githubusercontent.com/openbible-io/mhc/main/mhc.json"
)

for URL in "${MHC_URLS[@]}"; do
  echo "  Trying: $URL"
  if curl -fsSL --max-time 90 "$URL" -o backend/data/mhc.json 2>/dev/null; then
    if python3 -c "
import json
d=json.load(open('backend/data/mhc.json'))
ct=len(d) if isinstance(d,(list,dict)) else 0
assert ct>100, 'Too small'
print(f'  ✓ {ct} commentary entries')
" 2>&1; then
      MHC_OK=true
      break
    else
      rm -f backend/data/mhc.json
    fi
  fi
done

if [ "$MHC_OK" = false ]; then
  echo "  Trying alternate CCEL plain-text format…"
  # Try to build from individual chapter files
  python3 - <<'PYEOF'
import urllib.request, json, os, sys

# Try a well-known structured MHC JSON from a CDN
urls = [
    "https://cdn.jsdelivr.net/gh/christians94/Matthew-Henry-Commentary@main/mhc.json",
    "https://cdn.jsdelivr.net/gh/suchipi/matthew-henry-commentary@main/data.json",
]
for url in urls:
    try:
        print(f"  Trying CDN: {url}")
        req = urllib.request.urlopen(url, timeout=60)
        data = json.loads(req.read().decode('utf-8'))
        if isinstance(data, (list, dict)) and len(data) > 100:
            with open('backend/data/mhc.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False)
            print(f"  ✓ Saved {len(data)} entries via CDN")
            sys.exit(0)
    except Exception as e:
        print(f"    Failed: {e}")
sys.exit(1)
PYEOF
  if [ $? -eq 0 ]; then MHC_OK=true; fi
fi

if [ "$MHC_OK" = true ]; then
  BYTES=$(wc -c < backend/data/mhc.json | tr -d ' ')
  echo "  ✓ Matthew Henry Commentary saved ($BYTES bytes)"
else
  echo "  ✗ Matthew Henry Commentary could not be downloaded."
  echo "    The lexicon page will still work — commentary section will be empty."
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════"
[ "$HEBREW_OK"      = true ] && echo "✓ Hebrew Strong's" || echo "✗ Hebrew Strong's (not downloaded)"
[ "$GREEK_OK"       = true ] && echo "✓ Greek Strong's"  || echo "✗ Greek Strong's (not downloaded)"
[ "$KJV_STRONGS_OK" = true ] && echo "✓ Word-tagged KJV" || echo "ℹ Word-tagged KJV (search mode active)"
[ "$MHC_OK"         = true ] && echo "✓ Matthew Henry Commentary" || echo "✗ Matthew Henry Commentary (not downloaded)"
echo ""
echo "  Restart the backend server to activate new data."
echo "  (Ctrl+C in the uvicorn terminal, then bash start-dev.sh)"
echo ""
echo "Press any key to close…"
read -n 1
