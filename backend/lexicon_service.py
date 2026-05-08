"""
lexicon_service.py
──────────────────
Handles Strong's Concordance lookups and Matthew Henry Commentary.
All data files live in backend/data/ and are loaded lazily on first use.
"""

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

# ── Book metadata ─────────────────────────────────────────────────────────────

BOOK_LIST = [
    # (number, name, abbreviation, chapters, testament)
    (1,  "Genesis",          "Gen",  50, "OT"),
    (2,  "Exodus",           "Exo",  40, "OT"),
    (3,  "Leviticus",        "Lev",  27, "OT"),
    (4,  "Numbers",          "Num",  36, "OT"),
    (5,  "Deuteronomy",      "Deu",  34, "OT"),
    (6,  "Joshua",           "Jos",  24, "OT"),
    (7,  "Judges",           "Jdg",  21, "OT"),
    (8,  "Ruth",             "Rut",   4, "OT"),
    (9,  "1 Samuel",         "1Sa",  31, "OT"),
    (10, "2 Samuel",         "2Sa",  24, "OT"),
    (11, "1 Kings",          "1Ki",  22, "OT"),
    (12, "2 Kings",          "2Ki",  25, "OT"),
    (13, "1 Chronicles",     "1Ch",  29, "OT"),
    (14, "2 Chronicles",     "2Ch",  36, "OT"),
    (15, "Ezra",             "Ezr",  10, "OT"),
    (16, "Nehemiah",         "Neh",  13, "OT"),
    (17, "Esther",           "Est",  10, "OT"),
    (18, "Job",              "Job",  42, "OT"),
    (19, "Psalms",           "Psa", 150, "OT"),
    (20, "Proverbs",         "Pro",  31, "OT"),
    (21, "Ecclesiastes",     "Ecc",  12, "OT"),
    (22, "Song of Solomon",  "Sng",   8, "OT"),
    (23, "Isaiah",           "Isa",  66, "OT"),
    (24, "Jeremiah",         "Jer",  52, "OT"),
    (25, "Lamentations",     "Lam",   5, "OT"),
    (26, "Ezekiel",          "Eze",  48, "OT"),
    (27, "Daniel",           "Dan",  12, "OT"),
    (28, "Hosea",            "Hos",  14, "OT"),
    (29, "Joel",             "Joe",   3, "OT"),
    (30, "Amos",             "Amo",   9, "OT"),
    (31, "Obadiah",          "Oba",   1, "OT"),
    (32, "Jonah",            "Jon",   4, "OT"),
    (33, "Micah",            "Mic",   7, "OT"),
    (34, "Nahum",            "Nah",   3, "OT"),
    (35, "Habakkuk",         "Hab",   3, "OT"),
    (36, "Zephaniah",        "Zep",   3, "OT"),
    (37, "Haggai",           "Hag",   2, "OT"),
    (38, "Zechariah",        "Zec",  14, "OT"),
    (39, "Malachi",          "Mal",   4, "OT"),
    # ── New Testament ──
    (40, "Matthew",          "Mat",  28, "NT"),
    (41, "Mark",             "Mar",  16, "NT"),
    (42, "Luke",             "Luk",  24, "NT"),
    (43, "John",             "Jhn",  21, "NT"),
    (44, "Acts",             "Act",  28, "NT"),
    (45, "Romans",           "Rom",  16, "NT"),
    (46, "1 Corinthians",    "1Co",  16, "NT"),
    (47, "2 Corinthians",    "2Co",  13, "NT"),
    (48, "Galatians",        "Gal",   6, "NT"),
    (49, "Ephesians",        "Eph",   6, "NT"),
    (50, "Philippians",      "Php",   4, "NT"),
    (51, "Colossians",       "Col",   4, "NT"),
    (52, "1 Thessalonians",  "1Th",   5, "NT"),
    (53, "2 Thessalonians",  "2Th",   3, "NT"),
    (54, "1 Timothy",        "1Ti",   6, "NT"),
    (55, "2 Timothy",        "2Ti",   4, "NT"),
    (56, "Titus",            "Tit",   3, "NT"),
    (57, "Philemon",         "Phm",   1, "NT"),
    (58, "Hebrews",          "Heb",  13, "NT"),
    (59, "James",            "Jam",   5, "NT"),
    (60, "1 Peter",          "1Pe",   5, "NT"),
    (61, "2 Peter",          "2Pe",   3, "NT"),
    (62, "1 John",           "1Jn",   5, "NT"),
    (63, "2 John",           "2Jn",   1, "NT"),
    (64, "3 John",           "3Jn",   1, "NT"),
    (65, "Jude",             "Jud",   1, "NT"),
    (66, "Revelation",       "Rev",  22, "NT"),
]

BOOK_BY_NUMBER: Dict[int, dict] = {
    b[0]: {"num": b[0], "name": b[1], "abbr": b[2], "chapters": b[3], "testament": b[4]}
    for b in BOOK_LIST
}

BOOK_BY_NAME: Dict[str, int] = {}
for b in BOOK_LIST:
    BOOK_BY_NAME[b[1].lower()] = b[0]
    BOOK_BY_NAME[b[2].lower()] = b[0]


# ── Internal caches ───────────────────────────────────────────────────────────

_strongs: Dict[str, Any] = {}          # "H430" → entry dict
_strongs_loaded = False

_kjv_strongs: Dict[str, List] = {}     # "1_1_1" → [{w, s}, ...]
_kjv_strongs_loaded = False

_mhc: Dict[str, Any] = {}             # "1_1_0" (verse=0 → intro) → text
_mhc_loaded = False


# ── Paths ─────────────────────────────────────────────────────────────────────

def _dp(filename: str) -> str:
    return os.path.join(os.path.dirname(__file__), "data", filename)


# ── Strong's loading ──────────────────────────────────────────────────────────

def _load_strongs() -> None:
    global _strongs, _strongs_loaded
    if _strongs_loaded:
        return
    _strongs_loaded = True

    for prefix, filename in [("H", "strongs_hebrew.json"), ("G", "strongs_greek.json")]:
        path = _dp(filename)
        if not os.path.exists(path):
            continue
        try:
            with open(path, encoding="utf-8") as f:
                raw = json.load(f)
            for key, entry in raw.items():
                norm = _norm_key(key, prefix)
                _strongs[norm] = _norm_entry(norm, entry)
            logging.info("Loaded %d Strong's entries from %s", len(raw), filename)
        except Exception as exc:
            logging.error("Error loading %s: %s", filename, exc)


def _norm_key(key: str, default_prefix: str) -> str:
    k = key.strip().upper()
    if k and k[0] not in ("H", "G"):
        k = default_prefix + k
    return k


def _norm_entry(key: str, e: dict) -> dict:
    lang = "Hebrew" if key.startswith("H") else "Greek"
    return {
        "strongs":        key,
        "lang":           lang,
        "lemma":          e.get("lemma",  e.get("word",   "")),
        "xlit":           e.get("xlit",   e.get("translit", "")),
        "pron":           e.get("pron",   e.get("pronunciation", "")),
        "definition":     e.get("kjv",    e.get("kjv_def", e.get("def", e.get("definition", "")))),
        "fullDefinition": e.get("strongs_def", e.get("data", e.get("fullDefinition", ""))),
        "derivation":     e.get("derivation", e.get("deriv", "")),
        "see":            e.get("see", []),
    }


# ── KJV Strong's word-tagging ─────────────────────────────────────────────────

def _load_kjv_strongs() -> None:
    global _kjv_strongs, _kjv_strongs_loaded
    if _kjv_strongs_loaded:
        return
    _kjv_strongs_loaded = True

    path = _dp("kjv_strongs.json")
    if not os.path.exists(path):
        return
    try:
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
        if isinstance(raw, list):
            for item in raw:
                b, c, v = item.get("b", 0), item.get("c", 0), item.get("v", 0)
                _kjv_strongs[f"{b}_{c}_{v}"] = item.get("words", [])
        elif isinstance(raw, dict):
            _kjv_strongs.update(raw)
        logging.info("Loaded %d tagged KJV verses", len(_kjv_strongs))
    except Exception as exc:
        logging.error("Error loading kjv_strongs.json: %s", exc)


# ── Matthew Henry Commentary loading ──────────────────────────────────────────

def _load_mhc() -> None:
    global _mhc, _mhc_loaded
    if _mhc_loaded:
        return
    _mhc_loaded = True

    path = _dp("mhc.json")
    if not os.path.exists(path):
        return
    try:
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)

        # Normalize various MHC JSON formats into: "book_ch_v" → text str
        # Format A: list of {book, chapter, verse, text}
        if isinstance(raw, list) and raw and isinstance(raw[0], dict):
            for item in raw:
                b = _resolve_book_num(item)
                c = int(item.get("chapter", item.get("c", 0)))
                v = int(item.get("verse",   item.get("v", 0)))
                text = item.get("text", item.get("commentary", item.get("content", "")))
                if b and c and text:
                    _mhc[f"{b}_{c}_{v}"] = text

        # Format B: nested dict {bookName: {chapterNum: {verseNum: text}}}
        elif isinstance(raw, dict):
            for book_key, chapters in raw.items():
                b = _resolve_book_from_str(book_key)
                if not b or not isinstance(chapters, dict):
                    continue
                for ch_key, verses in chapters.items():
                    try:
                        c = int(ch_key)
                    except (ValueError, TypeError):
                        continue
                    if isinstance(verses, dict):
                        for v_key, text in verses.items():
                            try:
                                v = int(v_key)
                            except (ValueError, TypeError):
                                v = 0
                            if isinstance(text, str) and text.strip():
                                _mhc[f"{b}_{c}_{v}"] = text
                    elif isinstance(verses, str):
                        # Chapter-level entry
                        _mhc[f"{b}_{c}_0"] = verses

        logging.info("Loaded %d Matthew Henry Commentary entries", len(_mhc))
    except Exception as exc:
        logging.error("Error loading mhc.json: %s", exc)


def _resolve_book_num(item: dict) -> int:
    for field in ("book", "b", "book_num", "bookNum"):
        val = item.get(field)
        if isinstance(val, int):
            return val
        if isinstance(val, str):
            n = _resolve_book_from_str(val)
            if n:
                return n
    return 0


def _resolve_book_from_str(s: str) -> int:
    s = s.strip().lower()
    direct = BOOK_BY_NAME.get(s)
    if direct:
        return direct
    # Try numeric
    try:
        n = int(s)
        if 1 <= n <= 66:
            return n
    except ValueError:
        pass
    # Partial match
    for name, num in BOOK_BY_NAME.items():
        if s in name or name in s:
            return num
    return 0


# ── Public API ────────────────────────────────────────────────────────────────

def get_strongs_entry(number: str) -> Optional[dict]:
    """Return a single Strong's entry for a number like 'H430' or 'G2316'."""
    _load_strongs()
    return _strongs.get(number.strip().upper())


def search_strongs(query: str, lang: Optional[str] = None, limit: int = 24) -> List[dict]:
    """Search Strong's dictionary by English word, transliteration, or lemma."""
    _load_strongs()
    q = query.strip().lower()
    results: List[dict] = []

    # Direct key lookup first (e.g. query = "H430")
    direct = _strongs.get(q.upper())
    if direct:
        results.append(direct)

    for key, entry in _strongs.items():
        if lang and not key.startswith(lang.upper()):
            continue
        if any(q in (entry.get(f) or "").lower()
               for f in ("definition", "lemma", "xlit", "fullDefinition")):
            if entry not in results:
                results.append(entry)
        if len(results) >= limit:
            break

    return results


def get_chapter(book_num: int, chapter: int, kjv_cache: Dict[str, str]) -> List[dict]:
    """
    Return a list of verse dicts for the given book + chapter.
    Each verse has: verse, text, words (with optional Strong's).
    kjv_cache: the KJV plain-text dict already loaded in main.py
    """
    _load_strongs()
    _load_kjv_strongs()

    # Find all verses belonging to this book+chapter in the KJV cache
    prefix = f"{book_num}_{chapter}_"
    verse_nums = sorted(
        int(k[len(prefix):])
        for k in kjv_cache
        if k.startswith(prefix) and k[len(prefix):].isdigit()
    )

    verses = []
    for v in verse_nums:
        key = f"{book_num}_{chapter}_{v}"
        text = kjv_cache.get(key, "")
        if not text:
            continue

        tagged = _kjv_strongs.get(key)
        if tagged:
            words = tagged          # [{w: str, s: str|None}, ...]
            has_strongs = True
        else:
            # Tokenise preserving punctuation as separate tokens
            tokens = re.findall(r"[\w']+|[.,;:!?\"()]", text)
            words = [{"w": t, "s": None} for t in tokens]
            has_strongs = False

        verses.append({
            "verse":      v,
            "text":       text,
            "words":      words,
            "hasStrongs": has_strongs,
        })

    return verses


def get_commentary(book_num: int, chapter: int, verse: int = 0) -> Optional[str]:
    """
    Return Matthew Henry Commentary text.
    verse=0 returns a chapter-level introduction (if available).
    """
    _load_mhc()
    # Try exact verse
    entry = _mhc.get(f"{book_num}_{chapter}_{verse}")
    if entry:
        return entry
    # Fallback: chapter intro (verse 0)
    if verse != 0:
        return _mhc.get(f"{book_num}_{chapter}_0")
    return None


def get_chapter_commentary(book_num: int, chapter: int) -> List[dict]:
    """Return all MHC entries for a book+chapter, sorted by verse."""
    _load_mhc()
    prefix = f"{book_num}_{chapter}_"
    results = []
    for key, text in _mhc.items():
        if key.startswith(prefix):
            v_str = key[len(prefix):]
            try:
                v = int(v_str)
            except ValueError:
                continue
            results.append({"verse": v, "text": text})
    results.sort(key=lambda x: x["verse"])
    return results


def has_strongs_data() -> bool:
    _load_strongs()
    return bool(_strongs)


def has_mhc_data() -> bool:
    _load_mhc()
    return bool(_mhc)


def book_info() -> List[dict]:
    """Return the full book list (for the frontend navigator)."""
    return [
        {"num": b[0], "name": b[1], "abbr": b[2],
         "chapters": b[3], "testament": b[4]}
        for b in BOOK_LIST
    ]
