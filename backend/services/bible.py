"""
Bible verse lookup service.

English:  Geneva 1599 — local JSON (run download-bibles.command first)
          KJV         — local JSON or bible-api.com fallback
          ESV         — api.esv.org (set ESV_API_KEY in backend/.env)
Spanish:  RVR1960 & LBLA via scripture.api.bible (set BIBLE_API_KEY)
"""

import os
import re
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional

ESV_API_KEY   = os.getenv("ESV_API_KEY", "")
BIBLE_API_KEY = os.getenv("BIBLE_API_KEY", "")

_API_BIBLE_IDS = {
    "rvr60": "b32b9d1b64b4ef29-04",
    "lbla":  "c315fa9f71d4af3d-01",
}

# ─── Book lookup maps ─────────────────────────────────────────────────────────

BOOK_CODES: Dict[str, str] = {
    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
    "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
    "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
    "1 Chronicles": "1CH", "2 Chronicles": "2CH",
    "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB",
    "Psalms": "PSA", "Psalm": "PSA", "Proverbs": "PRO", "Ecclesiastes": "ECC",
    "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
    "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
    "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA",
    "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB",
    "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
    "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
    "Acts": "ACT", "Romans": "ROM",
    "1 Corinthians": "1CO", "2 Corinthians": "2CO",
    "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP",
    "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
    "1 Timothy": "1TI", "2 Timothy": "2TI",
    "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
    "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE",
    "1 John": "1JN", "2 John": "2JN", "3 John": "3JN",
    "Jude": "JUD", "Revelation": "REV",
}

BOOK_NORMALIZE: Dict[str, str] = {
    "Génesis": "Genesis", "Exodo": "Exodus", "Éxodo": "Exodus",
    "Levítico": "Leviticus", "Números": "Numbers", "Deuteronomio": "Deuteronomy",
    "Josué": "Joshua", "Jueces": "Judges", "Rut": "Ruth",
    "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
    "1 Reyes": "1 Kings", "2 Reyes": "2 Kings",
    "1 Crónicas": "1 Chronicles", "2 Crónicas": "2 Chronicles",
    "Esdras": "Ezra", "Nehemías": "Nehemiah", "Ester": "Esther", "Job": "Job",
    "Salmos": "Psalms", "Salmo": "Psalms", "Proverbios": "Proverbs",
    "Eclesiastés": "Ecclesiastes", "Cantares": "Song of Solomon",
    "Isaías": "Isaiah", "Jeremías": "Jeremiah", "Lamentaciones": "Lamentations",
    "Ezequiel": "Ezekiel", "Daniel": "Daniel",
    "Oseas": "Hosea", "Joel": "Joel", "Amós": "Amos", "Abdías": "Obadiah",
    "Jonás": "Jonah", "Miqueas": "Micah", "Nahúm": "Nahum", "Habacuc": "Habakkuk",
    "Sofonías": "Zephaniah", "Hageo": "Haggai", "Zacarías": "Zechariah",
    "Malaquías": "Malachi",
    "Mateo": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "Juan": "John",
    "Hechos": "Acts", "Romanos": "Romans",
    "1 Corintios": "1 Corinthians", "2 Corintios": "2 Corinthians",
    "Gálatas": "Galatians", "Efesios": "Ephesians", "Filipenses": "Philippians",
    "Colosenses": "Colossians",
    "1 Tesalonicenses": "1 Thessalonians", "2 Tesalonicenses": "2 Thessalonians",
    "1 Timoteo": "1 Timothy", "2 Timoteo": "2 Timothy",
    "Tito": "Titus", "Filemón": "Philemon", "Hebreos": "Hebrews",
    "Santiago": "James", "1 Pedro": "1 Peter", "2 Pedro": "2 Peter",
    "1 Juan": "1 John", "2 Juan": "2 John", "3 Juan": "3 John",
    "Judas": "Jude", "Apocalipsis": "Revelation",
}

BOOK_NUMBERS: Dict[str, int] = {
    "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
    "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
    "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
    "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18,
    "Psalms": 19, "Psalm": 19, "Proverbs": 20, "Ecclesiastes": 21,
    "Song of Solomon": 22, "Isaiah": 23, "Jeremiah": 24, "Lamentations": 25,
    "Ezekiel": 26, "Daniel": 27, "Hosea": 28, "Joel": 29, "Amos": 30,
    "Obadiah": 31, "Jonah": 32, "Micah": 33, "Nahum": 34, "Habakkuk": 35,
    "Zephaniah": 36, "Haggai": 37, "Zechariah": 38, "Malachi": 39,
    "Matthew": 40, "Mark": 41, "Luke": 42, "John": 43, "Acts": 44,
    "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
    "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
    "1 Thessalonians": 52, "2 Thessalonians": 53,
    "1 Timothy": 54, "2 Timothy": 55, "Titus": 56, "Philemon": 57,
    "Hebrews": 58, "James": 59, "1 Peter": 60, "2 Peter": 61,
    "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65, "Revelation": 66,
}

_LOCAL_BIBLE_CACHE: Dict[str, Optional[Dict[str, str]]] = {}


# ─── Local Bible loading ──────────────────────────────────────────────────────

def load_local_bible(filename: str) -> Optional[Dict[str, str]]:
    """
    Load a scrollmapper-format Bible JSON from backend/data/.
    Returns a dict keyed '{book_num}_{chapter}_{verse}' → text.
    Cached in memory after first load.
    """
    if filename in _LOCAL_BIBLE_CACHE:
        return _LOCAL_BIBLE_CACHE[filename]

    data_path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    if not os.path.exists(data_path):
        _LOCAL_BIBLE_CACHE[filename] = None
        return None

    try:
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        index: Dict[str, str] = {}
        for entry in data:
            key = f"{entry['b']}_{entry['c']}_{entry['v']}"
            index[key] = entry.get("t", "").strip()
        _LOCAL_BIBLE_CACHE[filename] = index
        print(f"[Bible] Loaded {len(index):,} verses from {filename}")
        return index
    except Exception as e:
        print(f"[Bible] Failed to load {filename}: {e}")
        _LOCAL_BIBLE_CACHE[filename] = None
        return None


def _lookup_local(filename: str, ref: str) -> Optional[str]:
    index = load_local_bible(filename)
    if not index:
        return None
    parts = ref.rsplit(" ", 1)
    if len(parts) != 2:
        return None
    book_name, cv = parts[0].strip(), parts[1].strip()
    book_num = BOOK_NUMBERS.get(book_name)
    if not book_num:
        return None
    chapter, _, verse_part = cv.partition(":")
    verse = re.split(r"[-–]", verse_part)[0].strip()
    return index.get(f"{book_num}_{chapter}_{verse}")


def _fetch_geneva(ref: str) -> Optional[str]:
    return _lookup_local("geneva1599.json", ref)


def _fetch_kjv_local(ref: str) -> Optional[str]:
    return _lookup_local("kjv.json", ref)


# ─── Verse reference regex ────────────────────────────────────────────────────

_VERSE_REF_RE = re.compile(
    r'\b((?:[123]\s)?'
    r'(?:'
    r'Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|'
    r'Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs?|Ecclesiastes|Isaiah|Jeremiah|Lamentations|'
    r'Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|'
    r'Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|'
    r'Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation|'
    r'G[eé]nesis|[EÉ]xodo|Lev[ií]tico|N[uú]meros|Deuteronomio|Jos[uú][eé]|Jueces|Rut|'
    r'Reyes|Cr[oó]nicas|Esdras|Nehem[ií]as|Ester|Salmos?|Proverbios|Eclesiast[eé]s|'
    r'Isa[ií]as|Jerem[ií]as|Lamentaciones|Ezequiel|Oseas|Am[oó]s|Abd[ií]as|Jon[aá]s|'
    r'Miqueas|Nah[uú]m|Habacuc|Sofon[ií]as|Hageo|Zacar[ií]as|Malaqu[ií]as|'
    r'Mateo|Marcos|Lucas|Hechos|Romanos|Corintios|G[aá]latas|Efesios|Filipenses|'
    r'Colosenses|Tesalonicenses|Timoteo|Tito|File[mó]n|Hebreos|Santiago|Pedro|Judas|Apocalipsis'
    r'))'
    r'\s+(\d+:\d+)',
    re.IGNORECASE | re.UNICODE,
)


def _normalize_book(raw: str) -> Optional[str]:
    raw = raw.strip()
    if raw in BOOK_CODES:
        return raw
    if raw in BOOK_NORMALIZE:
        return BOOK_NORMALIZE[raw]
    low = raw.lower()
    for k in list(BOOK_CODES.keys()) + list(BOOK_NORMALIZE.keys()):
        if k.lower() == low:
            return BOOK_NORMALIZE.get(k, k if k in BOOK_CODES else None)
    return None


def _extract_verse_refs(text: str) -> List[str]:
    seen: set[str] = set()
    result: List[str] = []
    for m in _VERSE_REF_RE.finditer(text):
        raw_book = m.group(1).strip()
        cv = m.group(2)
        canon = _normalize_book(raw_book)
        if canon:
            ref = f"{canon} {cv}"
            if ref not in seen:
                seen.add(ref)
                result.append(ref)
    return result


def _ref_to_api_bible_id(ref: str) -> Optional[str]:
    parts = ref.rsplit(" ", 1)
    if len(parts) != 2:
        return None
    book_key, cv = parts[0].strip(), parts[1].strip()
    code = BOOK_CODES.get(book_key)
    if not code:
        return None
    chapter, _, verse_part = cv.partition(":")
    verse = re.split(r"[-–]", verse_part)[0]
    return f"{code}.{chapter}.{verse}"


# ─── Per-version fetchers ─────────────────────────────────────────────────────

def _fetch_kjv(ref: str) -> Optional[str]:
    local = _fetch_kjv_local(ref)
    if local:
        return local
    try:
        url = f"https://bible-api.com/{urllib.parse.quote(ref)}?translation=kjv"
        req = urllib.request.Request(url, headers={"User-Agent": "RebuttalYourChurch/1.0"})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            return data.get("text", "").strip().replace("\n", " ")
    except Exception as e:
        print(f"[KJV] '{ref}': {e}")
        return None


def _fetch_esv(ref: str) -> Optional[str]:
    if not ESV_API_KEY:
        return None
    try:
        params = urllib.parse.urlencode({
            "q": ref,
            "include-headings": "false",
            "include-footnotes": "false",
            "include-verse-numbers": "false",
            "include-short-copyright": "false",
            "include-passage-references": "false",
        })
        url = f"https://api.esv.org/v3/passage/text/?{params}"
        req = urllib.request.Request(url, headers={"Authorization": f"Token {ESV_API_KEY}"})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            passages = data.get("passages", [])
            return passages[0].strip().replace("\n", " ") if passages else None
    except Exception as e:
        print(f"[ESV] '{ref}': {e}")
        return None


def _fetch_api_bible(ref: str, bible_id: str, version_name: str) -> Optional[str]:
    if not BIBLE_API_KEY:
        return None
    verse_id = _ref_to_api_bible_id(ref)
    if not verse_id:
        return None
    try:
        params = urllib.parse.urlencode({
            "content-type": "text",
            "include-notes": "false",
            "include-titles": "false",
            "include-chapter-numbers": "false",
            "include-verse-numbers": "false",
            "include-short-copyright": "false",
        })
        url = f"https://api.scripture.api.bible/v1/bibles/{bible_id}/verses/{verse_id}?{params}"
        req = urllib.request.Request(url, headers={"api-key": BIBLE_API_KEY})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            content = data.get("data", {}).get("content", "").strip()
            return content or None
    except Exception as e:
        print(f"[{version_name}] '{ref}': {e}")
        return None


def _fetch_rvr60(ref: str) -> Optional[str]:
    return _fetch_api_bible(ref, _API_BIBLE_IDS["rvr60"], "RVR60")


def _fetch_lbla(ref: str) -> Optional[str]:
    return _fetch_api_bible(ref, _API_BIBLE_IDS["lbla"], "LBLA")


# ─── Enrichment orchestrator ──────────────────────────────────────────────────

def enrich_with_bible(analysis: Dict[str, Any], lang: str) -> Dict[str, Any]:
    """
    Fetch Bible verse texts for every ref cited in every scriptureCheck field
    and attach them to the analysis claims.
    """
    if lang == "es":
        fetchers = [("rvr60", _fetch_rvr60), ("lbla", _fetch_lbla)]
    else:
        fetchers = [("esv", _fetch_esv), ("kjv", _fetch_kjv), ("geneva", _fetch_geneva)]

    all_refs: List[str] = []
    ref_set: set[str] = set()
    for claim in analysis.get("claims", []):
        for ref in _extract_verse_refs(claim.get("scriptureCheck", "")):
            if ref not in ref_set:
                ref_set.add(ref)
                all_refs.append(ref)

    all_refs = all_refs[:14]

    if not all_refs:
        return analysis

    cache: Dict[str, Dict[str, str]] = {ref: {} for ref in all_refs}
    tasks = [(name, fn, ref) for name, fn in fetchers for ref in all_refs]

    try:
        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = {pool.submit(fn, ref): (name, ref) for name, fn, ref in tasks}
            for future in as_completed(futures, timeout=12):
                name, ref = futures[future]
                try:
                    text = future.result()
                    if text:
                        cache[ref][name] = text
                except Exception:
                    pass
    except Exception as e:
        print(f"[Bible] parallel fetch error: {e}")

    for claim in analysis.get("claims", []):
        claim_refs = _extract_verse_refs(claim.get("scriptureCheck", ""))
        bible_verses: Dict[str, Dict[str, str]] = {}
        for ref in claim_refs:
            if cache.get(ref):
                bible_verses[ref] = cache[ref]
        if bible_verses:
            claim["bibleVerses"] = bible_verses

    return analysis
