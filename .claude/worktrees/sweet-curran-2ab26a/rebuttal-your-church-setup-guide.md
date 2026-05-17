# Rebuttal Your Church — Local Setup Guide

**Goal:** Get the entire app running on your own computer, end to end. By the time you finish this guide, you will be able to paste a sermon into a web page running on your machine and get back a real theological analysis powered by Claude.

**Time required:** 2–4 hours the first time, depending on how comfortable you are with the command line.

**Cost:** $5–$10 in Anthropic API credits to get started. Nothing else.

**Operating system:** This guide assumes **Windows 10/11**. If you're on Mac, the concepts are the same but a few commands change — let me know and I'll give you the Mac version.

---

## Before You Start — What You're Building

You're going to install five things on your computer:

1. **Python** — the programming language the backend is written in.
2. **Node.js** — the runtime the frontend (Next.js) needs.
3. **PostgreSQL** — the database that stores users, analyses, and the searchable corpus of Scripture and confessions.
4. **VS Code** — the code editor you'll use to look at and modify the code.
5. **Git** — the tool used to manage code versions.

Then you'll get an Anthropic API key, build a simple backend, build a simple frontend, and connect them.

Don't be intimidated. Each step is small. We'll go slowly.

---

## Phase 1 — Install the Tools

### Step 1.1 — Install Python

1. Go to **https://www.python.org/downloads/**
2. Click the big yellow "Download Python 3.x.x" button.
3. **IMPORTANT:** When the installer opens, check the box that says **"Add Python to PATH"** at the bottom of the first screen. This is critical.
4. Click "Install Now."
5. When done, open Command Prompt (press Windows key, type `cmd`, hit Enter) and type:
   ```
   python --version
   ```
   You should see something like `Python 3.12.x`. If you see "command not found," Python wasn't added to PATH — uninstall and reinstall with the box checked.

### Step 1.2 — Install Node.js

1. Go to **https://nodejs.org/**
2. Download the **LTS version** (the green button on the left).
3. Run the installer with all default options.
4. In Command Prompt, verify:
   ```
   node --version
   npm --version
   ```
   Both should print version numbers.

### Step 1.3 — Install PostgreSQL

1. Go to **https://www.postgresql.org/download/windows/**
2. Click "Download the installer."
3. Run the installer. Use defaults except:
   - **Remember the password you set for the `postgres` user.** Write it down. You'll need it.
   - When asked about port, leave it as `5432`.
   - You can skip "Stack Builder" at the end if it asks.
4. Verify by opening Command Prompt and typing:
   ```
   psql --version
   ```
   Should show a version number.

### Step 1.4 — Install VS Code

1. Go to **https://code.visualstudio.com/**
2. Download and install with default options.
3. Open it once to make sure it works.

### Step 1.5 — Install Git

1. Go to **https://git-scm.com/download/win**
2. Run the installer. Use all defaults.
3. Verify in Command Prompt:
   ```
   git --version
   ```

---

## Phase 2 — Get Your Anthropic API Key

1. Go to **https://console.anthropic.com/**
2. Sign up (use your real email — this account is what bills you).
3. Once logged in, find **"API Keys"** in the left sidebar.
4. Click **"Create Key."** Name it something like "Rebuttal Your Church Dev."
5. **Copy the key immediately and save it somewhere safe.** You will not be able to see it again. It looks like `sk-ant-api03-...`.
6. Go to **"Plans & Billing"** → **"Buy credits"** and add $5–$10 to start. Set a monthly spend limit too (something like $20) so you can't be surprised.

---

## Phase 3 — Create the Project

### Step 3.1 — Make a project folder

In Command Prompt:

```
cd %USERPROFILE%\Documents
mkdir rebuttal-your-church
cd rebuttal-your-church
mkdir backend
mkdir frontend
```

This creates a folder structure like:
```
rebuttal-your-church/
├── backend/   (the Python API)
└── frontend/  (the Next.js website)
```

### Step 3.2 — Open the project in VS Code

```
code .
```

VS Code opens with your project folder.

---

## Phase 4 — Build the Backend

### Step 4.1 — Set up a Python virtual environment

A "virtual environment" keeps this project's Python packages separate from other projects on your computer. In VS Code's terminal (Terminal menu → New Terminal):

```
cd backend
python -m venv venv
venv\Scripts\activate
```

After this, your terminal prompt should start with `(venv)`. That means you're inside the virtual environment.

### Step 4.2 — Install backend packages

Still in the backend folder with venv active:

```
pip install fastapi uvicorn anthropic python-dotenv psycopg2-binary pydantic
```

This installs:
- **fastapi** — the web framework
- **uvicorn** — the server that runs FastAPI
- **anthropic** — the official Claude SDK
- **python-dotenv** — loads secret keys from a `.env` file
- **psycopg2-binary** — connects to PostgreSQL
- **pydantic** — data validation

### Step 4.3 — Create the `.env` file (where your secret key lives)

In the `backend` folder, create a file called `.env` (yes, just `.env` with no name before it). Add:

```
ANTHROPIC_API_KEY=sk-ant-api03-paste-your-actual-key-here
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/rebuttal
```

Replace `YOURPASSWORD` with the password you set when installing PostgreSQL.

**IMPORTANT:** Never commit this file to git. We'll set that up shortly.

### Step 4.4 — Create `main.py` (the actual backend)

In the `backend` folder, create a file called `main.py` and paste this:

```python
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="Rebuttal Your Church API")

# Allow the frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

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
    return {"status": "ok", "message": "Rebuttal Your Church API is running"}


@app.post("/api/analyze")
def analyze_sermon(request: AnalyzeRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")

    # Truncate very long input
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
        # Clean any markdown fences just in case
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(cleaned)
        return analysis

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Could not parse analysis: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
```

### Step 4.5 — Create the database

Open Command Prompt (a fresh one, outside VS Code is fine) and run:

```
psql -U postgres
```

Enter your PostgreSQL password when prompted. Then at the `postgres=#` prompt, type:

```
CREATE DATABASE rebuttal;
\q
```

The database is now created. We won't put any tables in it yet — we'll add those later when we add user accounts and history.

### Step 4.6 — Run the backend

In VS Code's terminal (with venv still active, in the `backend` folder):

```
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Open your browser and go to **http://127.0.0.1:8000** — you should see:
```json
{"status": "ok", "message": "Rebuttal Your Church API is running"}
```

**Congratulations — your backend is alive.** Leave this terminal running.

You can also visit **http://127.0.0.1:8000/docs** to see auto-generated API documentation FastAPI gives you for free. You can even test the `/api/analyze` endpoint right from that page.

---

## Phase 5 — Build the Frontend

### Step 5.1 — Create a Next.js app

Open a **second** VS Code terminal (so the backend stays running). Then:

```
cd ../frontend
npx create-next-app@latest .
```

Answer the prompts:
- TypeScript? **No** (simpler for now)
- ESLint? **Yes**
- Tailwind CSS? **Yes**
- `src/` directory? **No**
- App Router? **Yes**
- Customize import alias? **No**

This takes 1–2 minutes.

### Step 5.2 — Replace the home page with the Rebuttal Your Church UI

Open `frontend/app/page.js` and replace the entire contents with the JSX from your prototype (the file `rebuttal-your-church.jsx` we built earlier), with one change:

The prototype calls `https://api.anthropic.com/v1/messages` directly. You need to change it to call your *own* backend instead. Find the `fetchWithRetry` call and change the URL to:

```javascript
const response = await fetchWithRetry('http://127.0.0.1:8000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: trimmedInput })
});
```

And simplify the response parsing — your backend already returns JSON, so:

```javascript
if (!response.ok) {
  const errData = await response.json().catch(() => ({}));
  throw new Error(errData.detail || `Request failed (${response.status})`);
}
const parsed = await response.json();
setAnalysis(parsed);
```

Also at the very top of the file, add:

```javascript
"use client";
```

This tells Next.js the page uses interactive React state.

### Step 5.3 — Run the frontend

In the frontend terminal:

```
npm run dev
```

You should see:
```
Local:        http://localhost:3000
```

Open **http://localhost:3000** in your browser.

**You should see your Rebuttal Your Church app, running entirely on your own computer, talking to your own backend, talking to Claude.** Click "Load Example" and hit "Analyze." Within a few seconds, you should see the full theological analysis appear.

---

## Phase 6 — Set Up Git (Important)

You don't want to lose this code. Set up version control:

In the project root (`rebuttal-your-church`):

```
git init
```

Create a file called `.gitignore` in the root with this content:

```
# Python
backend/venv/
backend/__pycache__/
backend/.env

# Node
frontend/node_modules/
frontend/.next/
frontend/.env.local

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

This tells git to never save your secret keys, virtual environments, or huge node_modules folders.

Then:

```
git add .
git commit -m "Initial commit: working local prototype"
```

Your code is now versioned. If you mess something up, you can always go back.

(Later you'll push this to a private GitHub repo as a backup.)

---

## What You Have Now

A complete, working application running on your computer:

- **Backend** at http://127.0.0.1:8000 — accepts sermon text, calls Claude, returns analysis
- **Frontend** at http://localhost:3000 — the editorial UI you and Claude designed
- **Database** ready for when you add accounts and history later
- **API key** safely stored in `.env`, never committed to git

Both terminals (backend and frontend) need to be running for the app to work. When you want to use the app:

1. Open VS Code
2. Open two terminals
3. In one: `cd backend`, `venv\Scripts\activate`, `uvicorn main:app --reload`
4. In the other: `cd frontend`, `npm run dev`
5. Open http://localhost:3000

When you're done, close the terminals (Ctrl+C in each, then close).

---

## Troubleshooting

**"`psql` is not recognized..."**
PostgreSQL bin folder isn't in your PATH. Add `C:\Program Files\PostgreSQL\16\bin` (adjust version number) to your system PATH variable.

**"`python` is not recognized..."**
You skipped the "Add to PATH" checkbox during install. Reinstall Python with the checkbox checked.

**The backend says "Analysis failed"**
Check the backend terminal for the actual error. Most common: invalid API key in `.env`, or out of API credits.

**The frontend says "Failed to fetch"**
Backend isn't running, or CORS is misconfigured. Make sure the backend terminal shows "Uvicorn running" with no errors.

**Anthropic SDK error about model name**
If `claude-sonnet-4-5-20250929` doesn't work, try `claude-sonnet-4-20250514`. Anthropic occasionally renames models.

---

## What's Next (After This Works)

Once you have the local app working end to end, the next steps are:

1. **Add the RAG layer** — load Bible text, creeds, and confessions into Postgres with embeddings, and have the backend retrieve relevant passages before sending to Claude. This is what makes the analysis actually grounded in real sources rather than the model's memory.
2. **Add YouTube URL support** — wire up `youtube-transcript-api` so users can paste a video link.
3. **Deploy to a free cloud tier** — when you want to show people, deploy to Railway/Render/Vercel free tiers without leaving your computer running 24/7.
4. **Add user accounts and history** — so people can log in and see past analyses.

Each of those is its own focused project. We'll tackle them one at a time when you're ready.

---

## A Note on Difficulty

If any of this guide gets confusing, **stop and ask**. Don't try to push through. Coding is one of those things where 80% of progress is just getting the environment right, and 20% is the actual code. Every developer alive has spent hours stuck on installation problems. It's normal.

Just tell me what step you're on, what command you ran, and what error you're seeing — I can almost always figure out what's wrong.

You've got this.
