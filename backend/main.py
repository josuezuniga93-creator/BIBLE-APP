"""
Rebuttal Your Church — FastAPI backend.

Receives sermon text from the frontend, calls Claude with a theological
analysis prompt, returns structured JSON describing the verdict on each
claim and an overall verdict on the sermon.

Run locally with:
    cd backend
    source venv/bin/activate
    uvicorn main:app --reload
"""

import os
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Rebuttal Your Church API")

# Allow the Next.js frontend (which runs on port 3000) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazily fail-soft: don't crash the server if the key is missing or a
# placeholder. We only error when /api/analyze is actually called.
_api_key = os.getenv("ANTHROPIC_API_KEY", "")
client = Anthropic(api_key=_api_key) if _api_key else None


SYSTEM_PROMPT = """You analyze sermons against historic biblical Christianity for an app called "Rebuttal Your Church."

Framework:
- Scripture is final authority.
- Historic faith = ecumenical creeds (Apostles', Nicene, Athanasian) + Reformation confessions.
- ESSENTIALS: Trinity, deity/humanity of Christ, bodily resurrection, salvation by grace through faith, Scripture's authority, substitutionary atonement.
- SECONDARY: baptism mode, polity, eschatology, charismatic gifts.

Tone: charitable but truthful. Test teachings, don't mock teachers.

Respond ONLY with valid JSON, no markdown, no preamble. Keep all fields concise (1-2 sentences each):

{
  "summary": "1-2 sentences on what speaker claims.",
  "claims": [
    {
      "quote": "specific claim, paraphrased",
      "scriptureCheck": "what Scripture says with refs",
      "historicCheck": "alignment with creeds/confessions",
      "theologianNote": "1 theologian's view",
      "verdict": "ALIGNED | SECONDARY_DIFFERENCE | CAUTION | CONTRADICTS_FUNDAMENTAL",
      "verdictExplanation": "1 sentence"
    }
  ],
  "redFlags": ["short bullet"],
  "recommendations": ["resource or teacher"],
  "overallVerdict": "SOUND | MIXED | SERIOUS_CONCERNS | FALSE_TEACHING",
  "overallExplanation": "2-3 sentences."
}

Pick the 3 most significant claims. Use specific verse references (book chapter:verse). If not religious content, return empty claims array with overallVerdict "SOUND"."""


class AnalyzeRequest(BaseModel):
    text: str


@app.get("/")
def root():
    """Health check — also confirms the server is up."""
    return {
        "status": "ok",
        "message": "Rebuttal Your Church API is running",
        "api_key_configured": bool(_api_key) and not _api_key.startswith("PLACEHOLDER"),
    }


@app.post("/api/analyze")
def analyze_sermon(request: AnalyzeRequest):
    """Send a sermon transcript to Claude and return a structured analysis."""

    if client is None or _api_key.startswith("PLACEHOLDER"):
        raise HTTPException(
            status_code=503,
            detail=(
                "ANTHROPIC_API_KEY is not set in backend/.env. "
                "Sign up at console.anthropic.com, create a key, paste it into "
                "backend/.env, then restart this server."
            ),
        )

    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")

    # Truncate very long input — keeps cost bounded for v1.
    text = request.text[:8000]

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=3000,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": f"Analyze this sermon:\n\n{text}"}
            ],
        )

        raw_text = response.content[0].text.strip()
        # Strip any markdown fences just in case the model adds them.
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(cleaned)
        return analysis

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not parse analysis as JSON: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
