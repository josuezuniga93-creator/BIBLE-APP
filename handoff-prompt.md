# Handoff Prompt — Rebuttal Your Church

Copy everything from `---START---` to `---END---` below into a fresh AI/coding session
to pick up where we left off.

---START---

I'm building a web app called **Rebuttal Your Church** — it analyzes sermons against
historic biblical Christianity using Claude. Pasted text → structured theological
analysis (verdicts on individual claims + an overall verdict on the sermon). Reformed
evangelical framework, charitable but truthful tone.

Full project context lives in this folder. Read these two files first before doing
anything:

- `rebuttal-your-church-tech-spec.md` — full architecture, verdict framework, RAG plan.
- `rebuttal-your-church-setup-guide.md` — original setup guide (written for Windows; I'm
  on Mac, so commands have been translated as we go).

## My environment

- macOS Tahoe 26.3.1, Apple Silicon (M-series).
- Username: `josuezuniga`.
- Project lives at: `/Users/josuezuniga/Documents/Claude/Projects/Rebuttal your church/`
  (note: path has spaces — must be quoted in shell commands).
- Default shell: zsh.
- I am NOT a developer. Go slowly, explain each step before running it, and ask
  permission before installing anything or changing system settings.

## What's already installed (verified working)

- Homebrew 5.1.9
- Python 3.13.13 (use `python3.13`, not `python3` — system `python3` is the old 3.9.6)
- Node.js 25.9.0 + npm 11.12.1
- PostgreSQL 17.9, running as a Homebrew service (`brew services start postgresql@17`)
- VS Code 1.118.1 (`code` command works in shell)
- Git 2.50.1 (Apple) — already configured with name + email

## What's already built

```
Rebuttal your church/
├── .gitignore                           ← excludes .env, venv/, node_modules/, etc.
├── handoff-prompt.md                    ← this file
├── rebuttal-your-church-concept.md      ← MISSING (lost from previous chat)
├── rebuttal-your-church-tech-spec.md    ← present, full architecture
├── rebuttal-your-church-setup-guide.md  ← present, original Windows setup guide
├── backend/
│   ├── main.py                          ← FastAPI app, complete and working
│   ├── requirements.txt                 ← 6 packages: fastapi, uvicorn[standard],
│   │                                       anthropic, python-dotenv, psycopg2-binary,
│   │                                       pydantic
│   ├── .env                             ← contains PLACEHOLDER API key + working
│   │                                       DATABASE_URL
│   └── venv/                            ← Python virtual environment (gitignored)
└── frontend/                            ← EMPTY — needs Next.js scaffolding
```

The backend runs cleanly on `http://127.0.0.1:8000`. Health check returns:
```json
{"status":"ok","message":"Rebuttal Your Church API is running","api_key_configured":false}
```

The `/api/analyze` endpoint returns 503 with a clear error until a real API key is
in `backend/.env`. This is intentional — `main.py` checks for the placeholder string
and fails soft.

## What's NOT done (in priority order)

1. **Git initial commit.** I need to run `git init`, `git add .`, verify `.env` is
   gitignored via `git status`, then `git commit -m "Initial commit"` in the project
   root.

2. **Next.js frontend.** Folder exists but is empty. The previous Claude conversation
   produced a JSX prototype called `rebuttal-your-church.jsx` — it's lost. Either I
   recover it from the previous chat, or we build a fresh Next.js page from scratch
   based on the JSON shape the backend returns (see `main.py` SYSTEM_PROMPT).

3. **Anthropic API key.** Deferred — I'm waiting until I have ~$5 to spare. When
   ready: console.anthropic.com → API Keys → Create → paste into `backend/.env`
   replacing `PLACEHOLDER_REPLACE_WITH_YOUR_KEY_FROM_console.anthropic.com`. Set a
   monthly spend limit (~$20).

4. **End-to-end test.** Paste a real sermon excerpt into the running app and confirm
   the structured analysis renders correctly. This is blocked on items 2 + 3.

## How to start the backend

```bash
cd "/Users/josuezuniga/Documents/Claude/Projects/Rebuttal your church/backend"
source venv/bin/activate
uvicorn main:app --reload
```

Leave that terminal running. Visit `http://127.0.0.1:8000` to confirm.

## Important rules

- **Never paste my API key into chat or commit it to git.** It belongs only in
  `backend/.env` on my machine.
- **Use Mac syntax**: zsh, `source venv/bin/activate` (not `venv\Scripts\activate`),
  paths quoted because of spaces.
- **Use `python3.13`** explicitly. `python3` points to the old system Python.
- **Postgres on Mac/Homebrew uses my OS user (`josuezuniga`) with no password** for
  local dev. The `DATABASE_URL` already reflects this.
- **Hosting plan**: everything stays local for now to keep costs near zero. Only
  Anthropic API calls cost money.
- **Ask before running any install/uninstall command or modifying system settings.**

## Suggested first message back to me

After reading the docs above and skimming `backend/main.py`, summarize what you
understand about the project and propose what we should tackle next. Don't start
running commands until I say go.

---END---
