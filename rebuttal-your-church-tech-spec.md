# Rebuttal Your Church — Technical Specification

**Version:** 0.1 (draft for review)
**Status:** Pre-build planning
**Owner:** Josue

---

## 1. Purpose of This Document

This spec defines *how* Rebuttal Your Church works under the hood — what the system does at each step, what services it depends on, and what the data flow looks like from the moment a user submits a sermon to the moment they see an analysis. The goal is that any competent developer (you, a hire, or a contractor) could read this and start building.

This is a **living document**. Nothing here is final until you sign off.

---

## 2. System Overview

Rebuttal Your Church is a three-layer system:

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (web + mobile)                                       │
│  - User pastes URL/text/audio                                │
│  - Displays the structured analysis report                   │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTPS (REST or GraphQL)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API                                                 │
│  - Receives submission                                       │
│  - Extracts transcript                                       │
│  - Runs analysis pipeline                                    │
│  - Returns structured report                                 │
│  - Stores history (if user is logged in)                     │
└──┬───────────┬──────────┬──────────┬──────────┬─────────────┘
   │           │          │          │          │
   ▼           ▼          ▼          ▼          ▼
┌──────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐
│YouTube│  │Whisper │  │Anthropic│ │ Bible │  │ Confession│
│transcript│ │ STT  │  │   API   │ │  API  │  │  Corpus  │
│   API   │ │      │  │ (Claude)│ │       │  │ (vector) │
└──────┘  └────────┘  └────────┘  └────────┘  └──────────┘
```

Every external service is swappable. We pick the cheapest reliable option in each slot and isolate it behind an interface so we can change vendors later without rewriting the app.

---

## 3. The Analysis Pipeline (End to End)

This is the heart of the product. When a user submits a sermon, here is exactly what happens:

### Step 1 — Ingestion
Three input types are accepted:

| Input Type | What Happens |
|---|---|
| **Pasted text** | Goes straight to Step 3. |
| **YouTube URL** | Backend extracts video ID, calls transcript service, gets text. If no captions exist, falls back to Step 2. |
| **Audio/video file upload** | Backend stores file temporarily, sends to speech-to-text service. |

### Step 2 — Transcription (only if no captions)
- Audio is sent to **OpenAI Whisper API** or **AssemblyAI**.
- Cost: ~$0.006/minute (Whisper) or ~$0.37/hour (AssemblyAI).
- A 45-minute sermon = ~$0.27–$0.28. Cheap.
- Result: clean transcript text.

### Step 3 — Preprocessing
- Strip filler words, clean up punctuation if the transcript is rough.
- Detect language (reject non-English in v1; expand later).
- Compute length. If over a threshold (~10,000 words), chunk into segments for analysis.

### Step 4 — Claim Detection
The first LLM call. We send the transcript to Claude with a prompt like:
> *"Identify the most theologically significant claims in this sermon — statements about God, salvation, Scripture, or Christian living that should be tested. Return a list of 3–7 claims, each as a short paraphrase plus the original quote."*

Output: a structured list of claims to be examined.

### Step 5 — Source Retrieval (RAG)
For each claim, the backend retrieves relevant grounding material from three places:

1. **Bible** — semantic search over a verse-indexed Bible (ESV, KJV, NASB, etc.) returns the top 3–5 most relevant passages.
2. **Creeds & Confessions corpus** — vector search returns relevant articles from the Nicene Creed, Westminster Confession, Heidelberg Catechism, etc.
3. **Trusted theologian summaries** — pre-written notes on common theological topics from a curated knowledge base (Augustine on the Trinity, Calvin on assurance, etc.).

This is the **RAG (Retrieval-Augmented Generation)** layer. It's what keeps the model from making things up.

### Step 6 — Analysis (the main LLM call)
The second LLM call. We send Claude:
- The original claim
- The retrieved Scripture passages (full text)
- The retrieved confession articles
- The retrieved theologian notes
- A system prompt with the framework (essentials vs. secondary, verdict categories, etc.)

Output: a structured JSON analysis for that claim.

### Step 7 — Synthesis
A final pass that takes all the per-claim analyses and produces:
- The overall verdict (SOUND / MIXED / SERIOUS_CONCERNS / FALSE_TEACHING)
- The summary
- The red flags
- The recommendations

### Step 8 — Delivery
The structured report is returned to the client and displayed in the editorial layout (the prototype design).

If the user is logged in, the analysis is saved to their history.

---

## 4. Tech Stack Recommendation

I'm recommending a stack that is **boring, proven, and cheap to run**. No exotic choices.

### Backend
- **Language:** Python 3.11+ (best ecosystem for LLM/RAG work) **OR** Node.js 20+ (if you prefer JavaScript everywhere).
  - **Recommendation:** Python. The libraries are richer and most LLM/RAG examples online assume Python.
- **Web framework:** **FastAPI** (Python) — fast, async-friendly, auto-generates API docs.
- **Hosting:** **Railway** or **Render** to start. Both have generous free tiers and one-click Python deploys. Move to AWS/GCP later if scale demands it.

### Database
- **Primary database:** **PostgreSQL** (managed, via Railway/Render/Supabase). Stores users, submissions, analyses, history.
- **Vector database (for RAG):** **pgvector** extension for Postgres. Same database, no extra service. Stores embeddings of Bible verses, confessions, theologian notes.

### LLM
- **Anthropic API** with Claude (Sonnet for speed/cost balance, Opus for harder analyses).
- Budget: ~$0.05–$0.15 per analysis at typical sermon lengths.

### Speech-to-text
- **OpenAI Whisper API** for v1. Cheap, reliable, simple.

### YouTube transcripts
- **`youtube-transcript-api`** Python library for caption extraction. Free.
- Falls back to **`yt-dlp`** for downloading audio when captions aren't available.

### Bible API
- **ESV API** (free for non-commercial use, paid for commercial — clarify license). Authoritative, clean text.
- Alternative: **API.Bible** (multiple translations, requires free API key).

### Frontend
- **Next.js** (React-based, easy to deploy on Vercel, integrates cleanly with the prototype design you already have).
- **Mobile** (later phase): React Native for code reuse, or wrap the web app with a thin native shell.

### Authentication (later)
- **Clerk** or **Supabase Auth** — both handle email/password, Google sign-in, etc. without custom code.

---

## 5. Data Sources & Corpus

This is what the RAG layer searches. We build this once and update occasionally.

| Source | Format | Source URL | License |
|---|---|---|---|
| Bible — ESV | API call | api.esv.org | Free non-commercial; paid commercial |
| Bible — KJV | Bulk text file | ebible.org / Project Gutenberg | Public domain |
| Apostles' Creed | Text file | ccel.org | Public domain |
| Nicene Creed | Text file | ccel.org | Public domain |
| Athanasian Creed | Text file | ccel.org | Public domain |
| Westminster Confession | Text file | ccel.org | Public domain |
| 1689 Baptist Confession | Text file | the1689confession.com | Public domain |
| Heidelberg Catechism | Text file | heidelberg-catechism.com | Public domain |
| Augsburg Confession | Text file | bookofconcord.org | Public domain |
| Westminster Shorter Catechism | Text file | ccel.org | Public domain |
| Theologian summaries | Hand-curated notes | We write these | Our content |

**Theologian summaries** are short (200–500 word) notes we write ourselves on common topics: "Augustine on the Trinity," "Calvin on assurance," "Athanasius on the Incarnation," etc. These give the analysis depth without us having to ingest entire books (which has copyright complications).

For **modern theologians still under copyright** (Sproul, Piper, Carson, Keller, etc.), we don't ingest their works — we cite them by name and direct users to their published material. This is critical for staying clean on copyright.

---

## 6. The Verdict Framework

The analysis uses these categories. They need to be locked in before we build, because the whole UI/UX flows from them.

### Per-claim verdicts:
| Verdict | Meaning |
|---|---|
| **ALIGNED** | The teaching is consistent with Scripture and historic Christianity. |
| **SECONDARY_DIFFERENCE** | The teaching reflects a denominational stance Christians can disagree on without breaking fellowship. |
| **CAUTION** | The teaching is concerning but not necessarily heretical — could mislead or reflect immature theology. |
| **CONTRADICTS_FUNDAMENTAL** | The teaching contradicts an essential doctrine of the Christian faith. |

### Overall sermon verdicts:
| Verdict | Meaning |
|---|---|
| **SOUND** | All major claims align with biblical Christianity. |
| **MIXED** | Some claims are sound, others raise concerns or contradict fundamentals. |
| **SERIOUS_CONCERNS** | Multiple problematic claims, including some that touch fundamentals. |
| **FALSE_TEACHING** | The sermon's central message contradicts the Christian faith. |

### Essentials list (non-negotiable):
- The Trinity (one God in three Persons)
- The full deity and full humanity of Christ
- The bodily resurrection of Christ
- Salvation by grace through faith in Christ alone
- The authority and sufficiency of Scripture
- The substitutionary atonement
- The bodily return of Christ
- The reality of heaven and hell

### Secondary matters (faithful Christians disagree):
- Mode and recipients of baptism
- Form of church government
- Eschatology (pre-/post-/amillennial)
- Continuation or cessation of charismatic gifts
- Sacramental theology (real presence vs. memorial)
- Lord's Supper frequency and practice
- Calvinism vs. Arminianism on certain points

---

## 7. API Design (Sketch)

These are the key endpoints the backend exposes.

```
POST /api/analyze
  Body: { type: "text" | "youtube" | "audio_url", content: "..." }
  Returns: { analysis_id: "...", status: "processing" }

GET /api/analyze/{id}
  Returns: { status: "complete", analysis: { ...full report... } }

POST /api/auth/signup
POST /api/auth/login

GET /api/history
  Returns: list of past analyses for logged-in user

GET /api/analysis/{id}/share
  Returns: a public shareable link
```

Analyses run asynchronously (they take 15–60 seconds), so the client polls or uses websockets for status.

---

## 8. Cost Estimates (Per Analysis)

| Component | Cost |
|---|---|
| Transcript (if YouTube has captions) | $0.00 |
| Transcript (Whisper, 45 min sermon) | ~$0.28 |
| Embedding generation for claims | ~$0.001 |
| Vector search (Postgres) | ~$0.00 |
| Claim detection LLM call | ~$0.02 |
| Per-claim analysis (×5) | ~$0.10 |
| Synthesis LLM call | ~$0.02 |
| **Total (text/captioned)** | **~$0.15** |
| **Total (audio sermon)** | **~$0.43** |

At 1,000 analyses per month: ~$150–$430 in API costs. Plus ~$20–$50 for hosting and database. **Total: under $500/month at MVP scale.**

---

## 9. Privacy & Trust Considerations

- **Don't store sermon transcripts longer than necessary** unless the user explicitly saves them. Most people won't want their pastor's sermon sitting on our servers.
- **Be very clear about what the app is and isn't.** It's a discernment tool, not infallible. Add a footer: *"AI-assisted analysis is a tool, not a substitute for prayerful study, your local church, or godly counsel."* (Already in the prototype.)
- **Never name a specific living preacher in a verdict.** Test the *teaching*, not the *teacher*. The user can draw their own conclusions about who said it.
- **Bias disclosure.** The framework is reformed-evangelical-leaning (Scripture-first, creeds and confessions as test). We should say so plainly. A Catholic or Eastern Orthodox user has a right to know this isn't neutral ground — no theological tool is.

---

## 10. What's NOT in v1

To keep MVP shippable, these are deferred:
- Mobile app (web only initially)
- User accounts and saved history
- Sharing links
- Audio file uploads
- Multi-language support
- Comments / community / discussion features
- Pastoral dashboards or church-facing features

---

## 11. Open Questions for You

Before we move to Phase 2 (curated source list), confirm or push back on these:

1. **Theological posture.** The framework I've sketched is reformed-evangelical (Scripture-first, ecumenical creeds, Reformation confessions). Does this match your tradition and what you want the app to reflect?
2. **Stack choice.** Python + FastAPI + Postgres + Next.js — agree, or prefer something else (e.g., all JavaScript)?
3. **Hosting comfort.** Are you OK starting on Railway/Render, or do you want enterprise-grade (AWS) from day one?
4. **Bible translation.** Default to ESV, or another (KJV, NASB, NIV, CSB)?
5. **Copyright posture on modern theologians.** I recommended *not* ingesting copyrighted works and instead citing them by name. Agree?
6. **Cost ceiling.** Are you comfortable with the ~$0.15–$0.43 per analysis cost, and how does that affect your monetization thinking (free tier? subscription? per-analysis credits?)?

---

## Next Steps

Once you've reviewed this and answered the open questions, **Phase 2** is to build out the curated source list — actually identify and gather the texts the RAG layer will search. That's a 1–2 day task and gives us the corpus the backend will be built on top of.

After Phase 2, we move to **Phase 3 (MVP scope lock)**, then **Phase 4 (build the backend)**.
