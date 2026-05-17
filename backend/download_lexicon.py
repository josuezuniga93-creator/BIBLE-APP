#!/usr/bin/env python3
"""
Rebuttal Your Church — Lexicon Data Downloader
Downloads Strong's Concordance and Matthew Henry Commentary data files.
Run from the project root: python3 backend/download_lexicon.py
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 RYC-Lexicon/2.0"}


def fetch(url: str, label: str, timeout: int = 120) -> str | None:
    print(f"    ↓ {label}", flush=True)
    print(f"      {url}", flush=True)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read()
        kb = len(data) // 1024
        print(f"      ✓ {kb:,} KB received", flush=True)
        return data.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        print(f"      ✗ HTTP {e.code}: {e.reason}", flush=True)
    except Exception as e:
        print(f"      ✗ {type(e).__name__}: {e}", flush=True)
    return None


def parse_js_module(text: str) -> dict | None:
    """
    Parse a CommonJS/openscriptures JS file like:
        module.exports = { "H1": {...}, ... }
    Returns the dict, or None on failure.
    """
    t = text.strip()
    # Strip well-known module-export prefixes
    for prefix in ("module.exports =", "exports.default =", "export default"):
        if t.startswith(prefix):
            t = t[len(prefix):].strip()
            break
    # Strip trailing semicolon
    if t.endswith(";"):
        t = t[:-1].strip()
    try:
        d = json.loads(t)
        if isinstance(d, dict):
            return d
    except json.JSONDecodeError as e:
        print(f"      ✗ JSON parse error at char {e.pos}: {e.msg}", flush=True)

    # Fallback: find the outermost { ... }
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        try:
            d = json.loads(text[start : end + 1])
            if isinstance(d, dict):
                print("      ↺ Recovered via brace extraction", flush=True)
                return d
        except json.JSONDecodeError:
            pass
    return None


def save_json(filename: str, data: object) -> bool:
    path = os.path.join(DATA, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(path) // 1024
    ct = len(data) if isinstance(data, (dict, list)) else "?"
    print(f"      ✓ Saved {filename} ({size_kb:,} KB, {ct} entries)", flush=True)
    return True


# ─── Banner ───────────────────────────────────────────────────────────────────

print()
print("╔══════════════════════════════════════════════════════════╗")
print("║       Rebuttal Your Church — Lexicon Data Downloader     ║")
print("╚══════════════════════════════════════════════════════════╝")
print()

results = {
    "Hebrew Strong's": False,
    "Greek Strong's": False,
    "Word-tagged KJV": False,
    "Matthew Henry Commentary": False,
}


# ─── 1. Strong's Hebrew ───────────────────────────────────────────────────────

print("[ 1/4 ] Strong's Hebrew Dictionary (~8,700 entries)")
print()

HEBREW_SOURCES = [
    # openscriptures/strongs — the canonical public-domain source
    (
        "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js",
        "JS",
    ),
    # Mirror / alternative JSON if the JS parse fails
    (
        "https://raw.githubusercontent.com/seven1m/strongs/main/hebrew.json",
        "JSON",
    ),
]

for url, fmt in HEBREW_SOURCES:
    raw = fetch(url, f"Hebrew ({fmt})")
    if raw is None:
        continue
    if fmt == "JS":
        d = parse_js_module(raw)
    else:
        try:
            d = json.loads(raw)
        except Exception:
            d = None
    if isinstance(d, dict) and len(d) > 5_000:
        results["Hebrew Strong's"] = save_json("strongs_hebrew.json", d)
        break
    else:
        print(f"      ✗ Unexpected data (type={type(d).__name__}, len={len(d) if isinstance(d, dict) else '?'})", flush=True)

if not results["Hebrew Strong's"]:
    print("    ✗ Hebrew Strong's could not be downloaded.")
print()


# ─── 2. Strong's Greek ────────────────────────────────────────────────────────

print("[ 2/4 ] Strong's Greek Dictionary (~5,600 entries)")
print()

GREEK_SOURCES = [
    (
        "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js",
        "JS",
    ),
    (
        "https://raw.githubusercontent.com/seven1m/strongs/main/greek.json",
        "JSON",
    ),
]

for url, fmt in GREEK_SOURCES:
    raw = fetch(url, f"Greek ({fmt})")
    if raw is None:
        continue
    if fmt == "JS":
        d = parse_js_module(raw)
    else:
        try:
            d = json.loads(raw)
        except Exception:
            d = None
    if isinstance(d, dict) and len(d) > 4_000:
        results["Greek Strong's"] = save_json("strongs_greek.json", d)
        break
    else:
        print(f"      ✗ Unexpected data", flush=True)

if not results["Greek Strong's"]:
    print("    ✗ Greek Strong's could not be downloaded.")
print()


# ─── 3. KJV with per-word Strong's tagging (optional) ────────────────────────

print("[ 3/4 ] KJV Word-level Strong's Tagging (optional)")
print("        (Enables click-any-word → see Hebrew/Greek definition)")
print()

KJV_SOURCES = [
    "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/t_kjv_strongs.json",
    "https://raw.githubusercontent.com/openbible-io/strongs/main/kjv_strongs.json",
    "https://cdn.jsdelivr.net/gh/scrollmapper/bible_databases@master/json/t_kjv_strongs.json",
]

for url in KJV_SOURCES:
    raw = fetch(url, "Tagged KJV")
    if raw is None:
        continue
    try:
        d = json.loads(raw)
        ct = len(d)
        if ct > 30_000:
            results["Word-tagged KJV"] = save_json("kjv_strongs.json", d)
            break
        else:
            print(f"      ✗ Too small ({ct} entries, expected >30,000)", flush=True)
    except json.JSONDecodeError as e:
        print(f"      ✗ JSON parse error: {e}", flush=True)

if not results["Word-tagged KJV"]:
    print("    ℹ  Word-tagged KJV not available from known sources.")
    print("       Lexicon will show verse text; clicking words opens search mode.")
print()


# ─── 4. Matthew Henry Commentary ─────────────────────────────────────────────

print("[ 4/4 ] Matthew Henry Commentary (1706, public domain)")
print()

MHC_SOURCES = [
    "https://raw.githubusercontent.com/christians94/Matthew-Henry-Commentary/main/mhc.json",
    "https://cdn.jsdelivr.net/gh/christians94/Matthew-Henry-Commentary@main/mhc.json",
    "https://raw.githubusercontent.com/suchipi/matthew-henry-commentary/main/data.json",
    "https://cdn.jsdelivr.net/gh/suchipi/matthew-henry-commentary@main/data.json",
    "https://raw.githubusercontent.com/chadsr/matthew-henry-commentary/master/mhc.json",
    "https://raw.githubusercontent.com/scrollmapper/bible_commentary/master/mhc/mhc.json",
    "https://raw.githubusercontent.com/scrollmapper/bible_commentary/master/json/matthew-henry.json",
    "https://raw.githubusercontent.com/openscriptures/matthew-henry/master/mhc.json",
    "https://raw.githubusercontent.com/seven1m/mhc/main/data.json",
]

for url in MHC_SOURCES:
    raw = fetch(url, "Matthew Henry Commentary")
    if raw is None:
        continue
    try:
        d = json.loads(raw)
        ct = len(d) if isinstance(d, (list, dict)) else 0
        if ct > 100:
            results["Matthew Henry Commentary"] = save_json("mhc.json", d)
            break
        else:
            print(f"      ✗ Too small ({ct} entries)", flush=True)
    except json.JSONDecodeError as e:
        print(f"      ✗ JSON parse error: {e}", flush=True)

if not results["Matthew Henry Commentary"]:
    print("    ✗ Matthew Henry Commentary not available from known sources.")
    print("       Commentary panel will be empty (app still fully functional).")
print()


# ─── Summary ──────────────────────────────────────────────────────────────────

print("══════════════════════════════════════════════════════════")
print("  Download Summary")
print("══════════════════════════════════════════════════════════")
for label, ok in results.items():
    if label == "Word-tagged KJV":
        icon = "✓" if ok else "ℹ"
        status = "downloaded" if ok else "optional — skipped"
    else:
        icon = "✓" if ok else "✗"
        status = "downloaded" if ok else "not downloaded"
    print(f"  {icon}  {label}: {status}")

print()

any_downloaded = any(results.values())
if any_downloaded:
    print("  Next step: restart the backend to load the new files.")
    print("  → Ctrl+C in the uvicorn terminal, then:")
    print("    cd backend && source venv/bin/activate && uvicorn main:app --reload")
else:
    print("  ✗ Nothing was downloaded.")
    print("    Check your internet connection and try again.")
    print("    If the problem persists, the source URLs may have changed.")

print("══════════════════════════════════════════════════════════")
print()
