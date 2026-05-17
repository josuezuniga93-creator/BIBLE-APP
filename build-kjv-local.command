#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rebuttal Your Church — KJV Bible Builder
# Double-click in Finder to download the KJV Bible locally chapter by chapter.
# Takes ~5-6 minutes. Only needs to run once.
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Building KJV Bible from bible-api.com      ║"
echo "║   This takes ~5-6 minutes. Please wait.      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

mkdir -p backend/data

python3 - << 'PYEOF'
import json
import time
import urllib.request
import urllib.parse
import sys
import os

BOOKS = [
    ("Genesis", 50), ("Exodus", 40), ("Leviticus", 27), ("Numbers", 36),
    ("Deuteronomy", 34), ("Joshua", 24), ("Judges", 21), ("Ruth", 4),
    ("1 Samuel", 31), ("2 Samuel", 24), ("1 Kings", 22), ("2 Kings", 25),
    ("1 Chronicles", 29), ("2 Chronicles", 36), ("Ezra", 10), ("Nehemiah", 13),
    ("Esther", 10), ("Job", 42), ("Psalms", 150), ("Proverbs", 31),
    ("Ecclesiastes", 12), ("Song of Solomon", 8), ("Isaiah", 66),
    ("Jeremiah", 52), ("Lamentations", 5), ("Ezekiel", 48), ("Daniel", 12),
    ("Hosea", 14), ("Joel", 3), ("Amos", 9), ("Obadiah", 1), ("Jonah", 4),
    ("Micah", 7), ("Nahum", 3), ("Habakkuk", 3), ("Zephaniah", 3),
    ("Haggai", 2), ("Zechariah", 14), ("Malachi", 4),
    ("Matthew", 28), ("Mark", 16), ("Luke", 24), ("John", 21), ("Acts", 28),
    ("Romans", 16), ("1 Corinthians", 16), ("2 Corinthians", 13),
    ("Galatians", 6), ("Ephesians", 6), ("Philippians", 4), ("Colossians", 4),
    ("1 Thessalonians", 5), ("2 Thessalonians", 3), ("1 Timothy", 6),
    ("2 Timothy", 4), ("Titus", 3), ("Philemon", 1), ("Hebrews", 13),
    ("James", 5), ("1 Peter", 5), ("2 Peter", 3), ("1 John", 5),
    ("2 John", 1), ("3 John", 1), ("Jude", 1), ("Revelation", 22),
]

total_chapters = sum(c for _, c in BOOKS)
done = 0
result = []
errors = []

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data", "kjv.json")

for book_num, (book_name, num_chapters) in enumerate(BOOKS, 1):
    for chapter in range(1, num_chapters + 1):
        done += 1
        pct = int(done / total_chapters * 100)
        print(f"\r[{pct:3d}%] {book_name} {chapter}/{num_chapters}   ", end="", flush=True)

        slug = urllib.parse.quote_plus(f"{book_name} {chapter}")
        url = f"https://bible-api.com/{slug}?translation=kjv"

        try:
            req = urllib.request.Request(url, headers={"User-Agent": "RebuttalYourChurch/1.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode())
            for v in data.get("verses", []):
                vnum = int(v.get("verse", 0))
                text = v.get("text", "").strip().replace("\n", " ")
                if vnum and text:
                    result.append({"b": book_num, "c": chapter, "v": vnum, "t": text})
        except Exception as e:
            errors.append(f"{book_name} {chapter}: {e}")

        time.sleep(0.25)

print("\n")

if result:
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)
    print(f"✓ KJV saved — {len(result)} verses → backend/data/kjv.json")
else:
    print("✗ No verses downloaded. Check your internet connection.")
    sys.exit(1)

if errors:
    print(f"\n⚠  {len(errors)} chapters failed (will use API fallback for those):")
    for e in errors[:10]:
        print(f"   {e}")

print("\n  Restart the backend to activate the local KJV file.")
PYEOF

echo ""
echo "Press any key to close…"
read -n 1
