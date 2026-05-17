# Rebuttal Your Church

A theological discernment tool that analyzes sermons against historic biblical Christianity — testing every teaching against Scripture, the ecumenical creeds, and the Reformation confessions.

**Stack:** Next.js 14 (TypeScript + Tailwind) · FastAPI (Python) · Claude (Anthropic)

---

## How it works

You paste a sermon transcript into the web app. The frontend sends it to the FastAPI backend, which forwards it to Claude with a carefully crafted theological analysis prompt. Claude returns a structured JSON analysis that the frontend renders with color-coded verdicts.

**Verdict categories:**

| Claim verdict | Meaning |
|---|---|
| **Aligned** | Consistent with Scripture and historic Christianity |
| **Secondary Difference** | A denominational stance — acceptable disagreement |
| **Caution** | Concerning but not necessarily heretical |
| **Contradicts Scripture** | Contradicts an essential doctrine |

| Overall verdict | Meaning |
|---|---|
| **Sound Teaching** | All major claims align with biblical Christianity |
| **Mixed** | Some sound, some raise concerns |
| **Serious Concerns** | Multiple problematic claims touching fundamentals |
| **False Teaching** | Central message contradicts the Christian faith |

---

## Project structure

```
Rebuttal your church/
├── backend/
│   ├── main.py           # FastAPI app — the analysis endpoint
│   ├── requirements.txt  # Python dependencies
│   ├── .env              # ← YOUR API KEY GOES HERE (never committed to git)
│   └── venv/             # Python virtual environment
├── frontend/
│   ├── app/
│   │   ├── layout.tsx    # Root layout + Inter font
│   │   ├── page.tsx      # Full UI — input, loading, results
│   │   └── globals.css   # Tailwind + custom animations
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
├── install-frontend.command  # Double-click to install npm packages
├── start-dev.sh              # Starts both servers
└── README.md
```

---

## First-time setup

### Step 1 — Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up and create an API key (looks like `sk-ant-api03-...`)
3. Add at least $5 in credits

### Step 2 — Add your API key to the backend

Open `backend/.env` in a text editor. Find this line:

```
ANTHROPIC_API_KEY=PLACEHOLDER_REPLACE_WITH_REAL_KEY
```

Replace `PLACEHOLDER_REPLACE_WITH_REAL_KEY` with your actual key.

### Step 3 — Install frontend dependencies

**Double-click `install-frontend.command`** in Finder.

A Terminal window will open and run `npm install`. This takes 1–2 minutes and only needs to be done once.

> If macOS says "install-frontend.command cannot be opened", right-click it → Open → Open.

---

## Running the app

### Option A — Start script (recommended)

```bash
bash start-dev.sh
```

This starts both servers at once and prints their URLs.

### Option B — Manual (two terminal windows)

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## URLs

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (auto-generated) | http://localhost:8000/docs |

---

## Troubleshooting

**"API key not configured" error in the app**
→ You still have the placeholder key in `backend/.env`. Replace it with your real key and restart the backend (Ctrl+C, then `uvicorn main:app --reload`).

**"Cannot reach the backend server"**
→ The FastAPI backend isn't running. Start it in a terminal (see above).

**`npm run dev` fails**
→ You haven't run `npm install` yet. Double-click `install-frontend.command`.

**`source venv/bin/activate` says no such file**
→ The Python virtual environment needs to be recreated:
```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Anthropic SDK error about model name**
→ If `claude-sonnet-4-5-20250929` doesn't work, open `backend/main.py` and try `claude-sonnet-4-20250514`.

---

## What's next (future versions)

- YouTube URL support — paste a video link, get the transcript automatically
- Audio file upload — drag and drop a sermon recording
- RAG layer — ground analysis in actual Bible text, creeds, and confessions stored in Postgres
- User accounts and saved history
- Shareable analysis links

---

> *AI-assisted analysis is a tool, not a substitute for prayerful study, your local church, or godly counsel.*
>
> Framework: reformed-evangelical — Scripture-first, ecumenical creeds, Reformation confessions.
