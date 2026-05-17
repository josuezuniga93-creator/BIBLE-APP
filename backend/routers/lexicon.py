"""
Lexicon router — Strong's Concordance, KJV chapter text, and Matthew Henry Commentary.

Routes:
  GET /api/lexicon/books
  GET /api/lexicon/chapter?book=&chapter=
  GET /api/lexicon/strongs/{number}
  GET /api/lexicon/search?q=&lang=&limit=
  GET /api/commentary/chapter?book=&chapter=
  GET /api/commentary/verse?book=&chapter=&verse=

Imported by main.py via app.include_router(lexicon.router).
"""

import json
import re
import sys
import urllib.request
import urllib.parse
from typing import Optional

import lexicon_service as _lex
from fastapi import APIRouter, HTTPException

try:
    import requests as _requests   # already installed via youtube-transcript-api
    _HAS_REQUESTS = True
except ImportError:
    _HAS_REQUESTS = False

from services.bible import load_local_bible, BOOK_NUMBERS

router = APIRouter()

# ── In-memory chapter cache (avoids repeat API calls per session) ─────────────
_chapter_api_cache: dict = {}


_TRANSLATION_API_SLUG = {
    "kjv":    "kjv",
    "geneva": "kjv",   # Geneva not on bible-api.com, fall back to KJV
}


def _fetch_rv60_chapter(book_num: int, chapter: int) -> dict:
    """
    Fetch a Reina Valera 1960 chapter.
    Tries bolls.life first, then getbible.net (SSL verify off) as fallback.
    Returns { 'book_chapter_verse' → text } dict matching the local-file format.
    NOTE: Only caches successful (non-empty) results so failures auto-retry.
    """
    cache_key = f"{book_num}_{chapter}_rv60"
    if cache_key in _chapter_api_cache:
        return _chapter_api_cache[cache_key]

    result: dict = {}
    ua = {"User-Agent": "RebuttalYourChurch/1.0"}

    def _log(msg: str):
        print(msg, flush=True)
        sys.stdout.flush()

    # ── Primary: bolls.life — try multiple translation codes ──────────────────
    # Response: [{"pk": 43001001, "verse": 1, "text": "..."}, ...]
    _BOLLS_CODES = ["RVR60", "RV60", "SpaRV1960"]
    for _code in _BOLLS_CODES:
        try:
            url = f"https://bolls.life/get-chapter/{_code}/{book_num}/{chapter}/"
            _log(f"[RV60] fetching {url}")
            if _HAS_REQUESTS:
                resp = _requests.get(url, headers=ua, timeout=12)
                resp.raise_for_status()
                verses_list = resp.json()
            else:
                req = urllib.request.Request(url, headers=ua)
                with urllib.request.urlopen(req, timeout=12) as r:
                    verses_list = json.loads(r.read().decode())
            _tmp: dict = {}
            for v in verses_list:
                vnum = int(v.get("verse", 0))
                text = v.get("text", "").strip().replace("\n", " ")
                if vnum and text:
                    _tmp[f"{book_num}_{chapter}_{vnum}"] = text
            _log(f"[bolls.life/{_code}] fetched {len(_tmp)} RV60 verses for book {book_num} ch {chapter}")
            if _tmp:
                result = _tmp
                _chapter_api_cache[cache_key] = result
                return result
            else:
                _log(f"[bolls.life/{_code}] 0 verses — trying next code")
        except Exception as exc:
            _log(f"[bolls.life/{_code}] error: {exc}")
    _log(f"[bolls.life] all codes exhausted — trying getbible.net")

    # ── Fallback: getbible.net v2 (SSL verify disabled — cert expired) ────────
    # Response: {"verses": {"1": {"verse": 1, "text": "..."}, ...}}
    try:
        import ssl as _ssl
        url = f"https://getbible.net/v2/rvr60/{book_num}/{chapter}.json"
        _log(f"[RV60] fetching fallback {url}")
        if _HAS_REQUESTS:
            resp = _requests.get(url, headers=ua, timeout=12, verify=False)
            resp.raise_for_status()
            data = resp.json()
        else:
            ctx = _ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = _ssl.CERT_NONE
            req = urllib.request.Request(url, headers=ua)
            with urllib.request.urlopen(req, timeout=12, context=ctx) as r:
                data = json.loads(r.read().decode())
        for vnum_str, v in data.get("verses", {}).items():
            vnum = int(vnum_str)
            text = v.get("text", "").strip().replace("\n", " ")
            if vnum and text:
                result[f"{book_num}_{chapter}_{vnum}"] = text
        _log(f"[getbible.net] fetched {len(result)} RV60 verses for book {book_num} ch {chapter}")
        if result:
            _chapter_api_cache[cache_key] = result
    except Exception as exc:
        _log(f"[getbible.net] error: {exc}")

    return result


@router.get("/api/test/rv60")
def test_rv60_api(book: int = 43, chapter: int = 3):
    """Diagnostic endpoint — tests bolls.life API with multiple translation codes and book offsets."""
    ua = {"User-Agent": "RebuttalYourChurch/1.0"}
    results = {"has_requests": _HAS_REQUESTS, "trials": []}

    # Try a range of translation codes and book number variants
    codes_to_try = ["RVR60", "RV60", "SpaRV1960", "SpaRV", "RVR1960"]
    book_offsets = [0, -1, 1]  # try book_num as-is, then ±1 to catch 0-indexing

    for code in codes_to_try:
        for offset in book_offsets:
            b = book + offset
            if b < 1:
                continue
            url = f"https://bolls.life/get-chapter/{code}/{b}/{chapter}/"
            trial: dict = {"code": code, "book": b, "url": url}
            try:
                if _HAS_REQUESTS:
                    r = _requests.get(url, headers=ua, timeout=10)
                    trial["http_status"] = r.status_code
                    data = r.json() if r.ok else []
                else:
                    req = urllib.request.Request(url, headers=ua)
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        data = json.loads(resp.read().decode())
                    trial["http_status"] = 200
                trial["verse_count"] = len(data)
                trial["first_verse"] = data[0] if data else None
                trial["status"] = "ok"
                if data:
                    # Found working combo — surface it prominently
                    results["WORKING_CODE"] = code
                    results["WORKING_BOOK_OFFSET"] = offset
            except Exception as e:
                trial["status"] = "error"
                trial["message"] = str(e)
            results["trials"].append(trial)
            # Stop early once we find something that works
            if trial.get("verse_count", 0) > 0:
                break
        if results.get("WORKING_CODE"):
            break

    # Also fetch bolls.life translation list to confirm available codes
    try:
        turl = "https://bolls.life/api/translations/"
        if _HAS_REQUESTS:
            tr = _requests.get(turl, headers=ua, timeout=10)
            translations = tr.json()
        else:
            req = urllib.request.Request(turl, headers=ua)
            with urllib.request.urlopen(req, timeout=10) as resp:
                translations = json.loads(resp.read().decode())
        # Filter for Spanish
        spanish = [t for t in translations if "spa" in str(t).lower() or "rv" in str(t).lower() or "reina" in str(t).lower()]
        results["bolls_spanish_translations"] = spanish
        results["all_translation_codes"] = [t.get("short_name", t) if isinstance(t, dict) else t for t in translations]
    except Exception as e:
        results["translations_error"] = str(e)

    return results


def _fetch_chapter_from_api(book_name: str, chapter: int, translation: str) -> dict:
    """
    Fetch a whole chapter from bible-api.com and return a
    { 'book_chapter_verse' → text } dict matching the local-file format.
    """
    cache_key = f"{book_name}_{chapter}_{translation}"
    if cache_key in _chapter_api_cache:
        return _chapter_api_cache[cache_key]

    # bible-api.com expects names like "john+3" or "1+corinthians+5"
    slug = urllib.parse.quote_plus(f"{book_name} {chapter}")
    tr = _TRANSLATION_API_SLUG.get(translation, "kjv")
    url = f"https://bible-api.com/{slug}?translation={tr}"

    result: dict = {}
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RebuttalYourChurch/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        book_num = BOOK_NUMBERS.get(book_name, 0)
        for v in data.get("verses", []):
            vnum = int(v.get("verse", 0))
            text = v.get("text", "").strip().replace("\n", " ")
            if book_num and vnum and text:
                result[f"{book_num}_{chapter}_{vnum}"] = text
        print(f"[Bible API] fetched {len(result)} verses for {book_name} {chapter} ({tr})")
    except Exception as exc:
        print(f"[Bible API] error fetching {book_name} {chapter}: {exc}")

    _chapter_api_cache[cache_key] = result
    return result


@router.get("/api/lexicon/books")
def lexicon_books():
    """Return the list of all 66 Bible books with chapter counts."""
    return {
        "books":      _lex.book_info(),
        "hasStrongs": _lex.has_strongs_data(),
        "hasMhc":     _lex.has_mhc_data(),
    }


@router.get("/api/lexicon/chapter")
def lexicon_chapter(book: int, chapter: int, translation: Optional[str] = "kjv"):
    """
    Return Bible text for a book+chapter with per-word Strong's tagging.
    book       = 1–66 (1 = Genesis, 40 = Matthew, etc.)
    translation = 'kjv' (default) or 'geneva' (Geneva 1599)
    """
    if book < 1 or book > 66:
        raise HTTPException(status_code=400, detail="book must be 1–66")

    book_meta = _lex.BOOK_BY_NUMBER.get(book, {})
    book_name = book_meta.get("name", "")

    # rv60 has no local file — fetch from getbible.net (bible-api.com doesn't support rv60)
    if translation == "rv60":
        bible_data = _fetch_rv60_chapter(book, chapter)
    else:
        # Pick the right source file
        bible_file = "geneva1599.json" if translation == "geneva" else "kjv.json"
        bible_data = load_local_bible(bible_file) or {}

        # Fall back to KJV if Geneva data is missing
        if not bible_data and translation == "geneva":
            bible_data = load_local_bible("kjv.json") or {}

        # If local file is still missing, fetch the chapter live from bible-api.com
        if not bible_data and book_name:
            bible_data = _fetch_chapter_from_api(book_name, chapter, translation or "kjv")

    verses = _lex.get_chapter(book, chapter, bible_data)

    return {
        "book":        book,
        "bookName":    book_name,
        "chapter":     chapter,
        "testament":   book_meta.get("testament", ""),
        "translation": translation or "kjv",
        "verses":      verses,
        "hasStrongs":  any(v["hasStrongs"] for v in verses),
    }


@router.get("/api/lexicon/strongs/{number}")
def lexicon_strongs(number: str):
    """Look up a Strong's Concordance entry. number = H430 or G2316."""
    entry = _lex.get_strongs_entry(number)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Strong's entry '{number}' not found")
    return entry


@router.get("/api/lexicon/search")
def lexicon_search(q: str, lang: Optional[str] = None, limit: int = 20):
    """
    Search Strong's dictionary.
    lang = 'H' (Hebrew/Aramaic) or 'G' (Greek) or omit for both.
    """
    results = _lex.search_strongs(q, lang=lang, limit=min(limit, 50))
    return {"query": q, "results": results, "count": len(results)}


@router.get("/api/commentary/chapter")
def commentary_chapter(book: int, chapter: int):
    """Return Matthew Henry Commentary entries for a whole chapter."""
    entries = _lex.get_chapter_commentary(book, chapter)
    book_meta = _lex.BOOK_BY_NUMBER.get(book, {})
    return {
        "book":     book,
        "bookName": book_meta.get("name", ""),
        "chapter":  chapter,
        "entries":  entries,
        "count":    len(entries),
    }


@router.get("/api/commentary/verse")
def commentary_verse(book: int, chapter: int, verse: int = 0):
    """
    Return Matthew Henry Commentary for a specific verse.
    verse=0 returns the chapter introduction/overview.
    """
    text = _lex.get_commentary(book, chapter, verse)
    if text is None:
        raise HTTPException(status_code=404, detail="Commentary not available for this passage")
    return {"book": book, "chapter": chapter, "verse": verse, "text": text}
