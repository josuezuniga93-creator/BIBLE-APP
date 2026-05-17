"""
Free Books router — /api/books, /api/books/{slug}, /api/books/{slug}/chapter/{n}

Serves public-domain Reformed and Christian classics from Project Gutenberg.
Books are fetched once and cached locally in backend/data/books/.
"""

import os
import re
import json
import hashlib
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

router = APIRouter()

# ─── Local cache dir ──────────────────────────────────────────────────────────

_DATA_DIR = Path(__file__).parent.parent / "data" / "books"
_DATA_DIR.mkdir(parents=True, exist_ok=True)

# ─── Book catalog ─────────────────────────────────────────────────────────────
# All texts are confirmed public domain via Project Gutenberg.
# pg_id: Project Gutenberg text ID. mirror: direct plain-text URL.

BOOKS_CATALOG: List[Dict[str, Any]] = [
    {
        "slug": "pilgrims-progress",
        "title": "The Pilgrim's Progress",
        "author": "John Bunyan",
        "year": 1678,
        "description": (
            "One of the most widely read books in the English language — a vivid "
            "allegorical journey of Christian from the City of Destruction to the "
            "Celestial City. Essential reading for every believer."
        ),
        "cover_emoji": "🏔️",
        "tags": ["Allegory", "Puritan", "Foundational"],
        "pg_id": 131,
        "mirror": "https://www.gutenberg.org/cache/epub/131/pg131.txt",
    },
    {
        "slug": "grace-abounding",
        "title": "Grace Abounding to the Chief of Sinners",
        "author": "John Bunyan",
        "year": 1666,
        "description": (
            "Bunyan's powerful spiritual autobiography — an honest account of his "
            "conversion, doubts, despair, and the grace that finally broke through. "
            "A companion to every struggling soul."
        ),
        "cover_emoji": "🕊️",
        "tags": ["Autobiography", "Puritan", "Grace"],
        "pg_id": 654,
        "mirror": "https://www.gutenberg.org/cache/epub/654/pg654.txt",
    },
    {
        "slug": "confessions-augustine",
        "title": "Confessions",
        "author": "Augustine of Hippo",
        "year": 400,
        "description": (
            "One of the greatest spiritual classics ever written. Augustine's deeply "
            "personal account of his restless life before God, culminating in his "
            "famous cry: 'Thou madest us for Thyself, and our heart is restless until "
            "it repose in Thee.'"
        ),
        "cover_emoji": "✝️",
        "tags": ["Patristic", "Church Father", "Spiritual Memoir"],
        "pg_id": 3296,
        "mirror": "https://www.gutenberg.org/cache/epub/3296/pg3296.txt",
    },
    {
        "slug": "imitation-of-christ",
        "title": "The Imitation of Christ",
        "author": "Thomas à Kempis",
        "year": 1418,
        "description": (
            "The second most widely read Christian book after the Bible. A timeless "
            "manual for the interior life — self-denial, humility, and devotion to "
            "Christ above all learning and worldly pleasure."
        ),
        "cover_emoji": "📿",
        "tags": ["Devotional", "Medieval", "Classic"],
        "pg_id": 1653,
        "mirror": "https://www.gutenberg.org/cache/epub/1653/pg1653.txt",
    },
    {
        "slug": "institutes-of-religion",
        "title": "Institutes of the Christian Religion (Selections)",
        "author": "John Calvin",
        "year": 1536,
        "description": (
            "The magnum opus of Reformed theology. These selected portions from "
            "Calvin's systematic masterwork cover the knowledge of God, human "
            "depravity, grace, Scripture, and the church."
        ),
        "cover_emoji": "⛪",
        "tags": ["Reformed", "Theology", "Calvin"],
        "pg_id": None,
        "mirror": None,
        "coming_soon": True,
    },
    {
        "slug": "holiness-ryle",
        "title": "Holiness",
        "author": "J.C. Ryle",
        "year": 1879,
        "description": (
            "Ryle's masterpiece on practical sanctification. Incisive, plain-spoken, "
            "and deeply biblical — each chapter challenges the reader to examine their "
            "walk with God with unflinching honesty."
        ),
        "cover_emoji": "🔥",
        "tags": ["Sanctification", "Victorian", "Practical"],
        "pg_id": None,
        "mirror": None,
        "coming_soon": True,
    },
    {
        "slug": "morning-evening-spurgeon",
        "title": "Morning and Evening",
        "author": "Charles H. Spurgeon",
        "year": 1865,
        "description": (
            "Spurgeon's beloved daily devotional — 365 morning and evening readings "
            "drawn from Scripture. Rich, gospel-centered meditations from the Prince "
            "of Preachers."
        ),
        "cover_emoji": "🌅",
        "tags": ["Devotional", "Spurgeon", "Daily"],
        "pg_id": None,
        "mirror": None,
        "coming_soon": True,
    },
    {
        "slug": "sinners-in-hands-edwards",
        "title": "Sinners in the Hands of an Angry God & Other Sermons",
        "author": "Jonathan Edwards",
        "year": 1741,
        "description": (
            "Edwards's most famous sermon — a sober, urgent call to flee the wrath "
            "to come. Paired with his equally powerful meditations on the excellency "
            "of Christ and divine love."
        ),
        "cover_emoji": "⚡",
        "tags": ["Sermons", "Great Awakening", "Edwards"],
        "pg_id": None,
        "mirror": None,
        "coming_soon": True,
    },
]

# Build a quick lookup by slug
_CATALOG_BY_SLUG: Dict[str, Dict[str, Any]] = {b["slug"]: b for b in BOOKS_CATALOG}


# ─── Fetcher / cache ──────────────────────────────────────────────────────────

def _cache_path(pg_id: int) -> Path:
    return _DATA_DIR / f"pg{pg_id}.txt"


def _fetch_and_cache(book: Dict[str, Any]) -> str:
    """Download the plain text from PG and cache it locally. Returns raw text."""
    pg_id = book["pg_id"]
    url = book["mirror"]
    cache = _cache_path(pg_id)
    if cache.exists():
        return cache.read_text(encoding="utf-8", errors="replace")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RebuttaYourChurch/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        cache.write_text(raw, encoding="utf-8")
        return raw
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not fetch book text: {e}")


# ─── Text parsing ─────────────────────────────────────────────────────────────

def _clean_title(title: str) -> str:
    """Remove Gutenberg italic markers (_word_) and extra whitespace from a title."""
    title = re.sub(r"_([^_]+)_", r"\1", title)   # _italic_ → italic
    title = re.sub(r"\s+", " ", title)             # collapse whitespace
    return title.strip()


def _strip_gutenberg_header_footer(text: str) -> str:
    """Remove PG legal boilerplate so readers see only the book content."""
    # Strip everything before the actual start
    start_patterns = [
        r"\*\*\* START OF (THE|THIS) PROJECT GUTENBERG",
        r"START OF THE PROJECT GUTENBERG",
    ]
    for pat in start_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            text = text[m.end():]
            # Skip the rest of that line
            nl = text.find("\n")
            if nl != -1:
                text = text[nl + 1:]
            break

    # Strip everything after the end marker
    end_patterns = [
        r"\*\*\* END OF (THE|THIS) PROJECT GUTENBERG",
        r"END OF THE PROJECT GUTENBERG",
    ]
    for pat in end_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            text = text[: m.start()]
            break

    return text.strip()


def _split_into_chapters(text: str) -> List[Dict[str, Any]]:
    """
    Heuristically split plain text into chapters.
    Returns list of {number, title, content}.
    Falls back to splitting every ~3000 chars if no chapter headings found.
    """
    # Try heading patterns: CHAPTER I, Chapter 1, PART I, Book I, etc.
    pattern = re.compile(
        r"^(CHAPTER|BOOK|PART|SECTION|PROLOGUE|PREFACE|INTRODUCTION|CONCLUSION"
        r"|APPENDIX|FOREWORD|AFTERWORD)"
        r"[\s\.\-]*([\w\s\-—,\'\"]*?)[\n\r]",
        re.MULTILINE | re.IGNORECASE,
    )
    matches = list(pattern.finditer(text))

    if len(matches) >= 2:
        chapters = []
        for i, m in enumerate(matches):
            start = m.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            raw_title = _clean_title(m.group(0).strip())
            chapters.append({
                "number": i + 1,
                "title": raw_title[:120],
                "content": text[start:end].strip(),
            })
        return chapters

    # Fallback: split into ~3000-char pages
    chunk_size = 3000
    words = text.split()
    pages: List[str] = []
    current: List[str] = []
    current_len = 0
    for w in words:
        current.append(w)
        current_len += len(w) + 1
        if current_len >= chunk_size:
            pages.append(" ".join(current))
            current = []
            current_len = 0
    if current:
        pages.append(" ".join(current))

    return [
        {"number": i + 1, "title": f"Section {i + 1}", "content": page}
        for i, page in enumerate(pages)
    ]


def _get_chapters(book: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fetch (or load from cache) and parse chapters for a book."""
    raw = _fetch_and_cache(book)
    clean = _strip_gutenberg_header_footer(raw)
    return _split_into_chapters(clean)


# ─── Metadata cache (per-process) ─────────────────────────────────────────────

_chapters_cache: Dict[str, List[Dict[str, Any]]] = {}


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/api/books")
def list_books():
    """Return the full book catalog (no chapter content)."""
    return [
        {k: v for k, v in book.items() if k not in ("mirror",)}
        for book in BOOKS_CATALOG
    ]


@router.get("/api/books/{slug}")
def get_book_meta(slug: str):
    """Return metadata + chapter list (titles only, no content) for one book."""
    book = _CATALOG_BY_SLUG.get(slug)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.get("coming_soon"):
        raise HTTPException(status_code=404, detail="Book coming soon — not yet available")

    if slug not in _chapters_cache:
        _chapters_cache[slug] = _get_chapters(book)

    chapters_meta = [
        {"number": ch["number"], "title": ch["title"]}
        for ch in _chapters_cache[slug]
    ]
    return {
        "slug": book["slug"],
        "title": book["title"],
        "author": book["author"],
        "year": book["year"],
        "description": book["description"],
        "cover_emoji": book["cover_emoji"],
        "tags": book["tags"],
        "chapter_count": len(chapters_meta),
        "chapters": chapters_meta,
    }


@router.get("/api/books/{slug}/chapter/{number}")
def get_chapter(slug: str, number: int):
    """Return the text content of a single chapter."""
    book = _CATALOG_BY_SLUG.get(slug)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.get("coming_soon"):
        raise HTTPException(status_code=404, detail="Book coming soon")

    if slug not in _chapters_cache:
        _chapters_cache[slug] = _get_chapters(book)

    chapters = _chapters_cache[slug]
    if number < 1 or number > len(chapters):
        raise HTTPException(
            status_code=404,
            detail=f"Chapter {number} not found — book has {len(chapters)} chapters",
        )
    ch = chapters[number - 1]
    return {
        "slug": slug,
        "chapter_number": ch["number"],
        "chapter_title": ch["title"],
        "content": ch["content"],
        "total_chapters": len(chapters),
        "has_prev": number > 1,
        "has_next": number < len(chapters),
    }
