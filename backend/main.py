"""
Rebuttal Your Church — FastAPI backend entry point.

load_dotenv() MUST run before any router imports so that os.getenv()
calls inside routers/analyze.py and services/bible.py see the values
from backend/.env.

Run locally with:
    cd backend
    source venv/bin/activate
    uvicorn main:app --reload
"""

import os

from dotenv import load_dotenv

# ── IMPORTANT: load .env before importing routers ────────────────────────────
load_dotenv()

from fastapi import FastAPI, Request                   # noqa: E402
from fastapi.middleware.cors import CORSMiddleware      # noqa: E402
from fastapi.responses import JSONResponse              # noqa: E402
from slowapi.errors import RateLimitExceeded            # noqa: E402

from limiter import limiter                             # noqa: E402
from routers import analyze, books, lexicon              # noqa: E402

# ─── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(title="Rebuttal Your Church API")

# Wire up slowapi
app.state.limiter = limiter

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://tulip-bible-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rate limit error handler ─────────────────────────────────────────────────

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please wait a moment before trying again."},
    )

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(analyze.router)
app.include_router(lexicon.router)
app.include_router(books.router)

# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check — confirms the server is up and whether the API key is set."""
    key = os.getenv("ANTHROPIC_API_KEY", "")
    return {
        "status": "ok",
        "message": "Rebuttal Your Church API is running",
        "api_key_configured": bool(key) and not key.startswith("PLACEHOLDER"),
    }
