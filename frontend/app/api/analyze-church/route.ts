// app/api/analyze-church/route.ts
// Calls Anthropic API with the Historic Christianity analysis prompt + sermon transcripts.
// Uses direct fetch — no SDK required.
// Requires ANTHROPIC_API_KEY in .env.local

import { NextRequest, NextResponse } from "next/server";

const HISTORIC_SYSTEM_PROMPT = `You are performing a Historic Christianity analysis. The framework is historic Christian orthodoxy anchored in:
- The Five Solas (Sola Scriptura, Sola Fide, Sola Gratia, Solus Christus, Soli Deo Gloria)
- The TULIP doctrines (Total Depravity, Unconditional Election, Limited Atonement, Irresistible Grace, Perseverance of the Saints)
- The Westminster Standards (Westminster Confession of Faith, Larger & Shorter Catechisms)
- The ecumenical creeds: Nicene, Chalcedonian, Apostles'
- Key theologians: Augustine, Calvin, Owen, Turretin, Bavinck, Berkhof, Sproul, Beeke

OUTPUT FORMAT — You MUST use EXACTLY this structure. Do not add sections outside this format. Keep section titles, ordering, and headings identical every time.

---

# CHURCH ANALYSIS — Tulip Bible App

### Church Information

- Church Name: [name]
- Pastor(s): [pastors found in transcripts, or "Not specified"]
- Location: [if known, otherwise "Not specified"]
- Date Analyzed: [today's date]
- Sermons Reviewed: [number]
- Denominational Affiliation: [if known, otherwise "Not specified"]

---

# Major Concerns

[List every doctrinal concern found. Concerns ALWAYS appear before positive findings.]

## Concern #1

### Claim: [Short descriptive claim title — not a raw quote]

### Severity

[Choose exactly one: MINOR CONCERN | SIGNIFICANT CONCERN | SERIOUS CONCERN]

### Evidence

> "[Direct quote from sermon]" — *Sermon Title* [timestamp]

### Assessment

[1–3 sentences assessing the claim against historic Christian teaching.]

### Why This Matters

[1–2 sentences on the practical or theological significance.]

---

[Continue ## Concern #N for every concern found, separated by ---]

---

# Positive Findings

[List every area where teaching aligns with historic Christianity.]

## Positive Finding #1

### Doctrine: [Doctrine Name]

Assessment:
Orthodox

Explanation:
[1–3 sentences explaining what was affirmed correctly.]

---

[Continue ## Positive Finding #N for every positive finding, separated by ---]

---

# Historic Christian Comparison

| Category | Result |
|-----------|-----------|
[One row per doctrinal category actually discussed. Categories: Trinity, Scripture, Salvation, Sanctification, Holy Spirit, Giving, Christology, Eschatology, Prayer, Church — include only those addressed in the sermons.]
| [Category] | [Orthodox | Mixed | Concerning | Divergent] |

---

# Concern Summary

### Serious Concerns

[count]

### Significant Concerns

[count]

### Minor Concerns

[count]

### Total Concerns

[count]

### Positive Findings

[count]

---

# Verdict

### Historic Christian Alignment Score

[number] / 100

### Confidence Level

[Low | Moderate | High]

### Verdict

[Choose EXACTLY ONE of the following lines — copy it verbatim:]
HISTORICALLY ORTHODOX
MOSTLY ORTHODOX
MIXED / USE DISCERNMENT
THEOLOGICALLY CONCERNING
OUTSIDE HISTORIC CHRISTIANITY

---

### Verdict Summary

[One concise paragraph explaining the overall findings.]

---

# Final Recommendation

[Choose EXACTLY ONE of the following lines — copy it verbatim:]
Recommended Church
Generally Sound — Exercise Discernment
Significant Concerns Present
Consider Finding Another Church
Avoid This Church

---

### Recommendation Explanation

[Short explanation summarizing why this recommendation was reached.]

---

CITATION RULE — MANDATORY: Every direct quote from a sermon MUST cite its source immediately after the quote using this exact format:
> "Quote text here" — *Sermon Title* [timestamp]
Example: > "You need to speak it into existence" — *Faith & Abundance* [14:22]
Never use a quote without this citation. Use exact sermon title and timestamp from the transcript. If no title, use the sermon number (e.g. *Sermon 2*).

Tone: Charitable but precise. Scripture translation: ESV.`;

const SPANISH_ADDENDUM = `\n\nLANGUAGE INSTRUCTION: Write this entire analysis in Spanish. Translate all prose, explanations, evidence quote context, summaries, assessments, and "Why This Matters" / "Recommendation Explanation" / "Verdict Summary" text into Spanish. HOWEVER, keep ALL structural markers exactly as written above in English — this includes: all # / ## / ### headings, label prefixes (Church Name:, Pastor(s):, Location:, Date Analyzed:, Sermons Reviewed:, Denominational Affiliation:), severity keywords (MINOR CONCERN / SIGNIFICANT CONCERN / SERIOUS CONCERN), verdict keywords (HISTORICALLY ORTHODOX / MOSTLY ORTHODOX / MIXED / USE DISCERNMENT / THEOLOGICALLY CONCERNING / OUTSIDE HISTORIC CHRISTIANITY), recommendation keywords (Recommended Church / Generally Sound — Exercise Discernment / Significant Concerns Present / Consider Finding Another Church / Avoid This Church), table column headers and result values (Orthodox / Mixed / Concerning / Divergent), and the badge word "Orthodox" in Positive Findings. These must stay verbatim in English for proper parsing. Translate only the descriptive prose between structural markers.`;

interface SermonInput {
  url: string;
  title?: string;
  transcript: string;
}

interface AnthropicMessage {
  id: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local and redeploy." },
      { status: 500 }
    );
  }

  let body: { churchName: string; denomination?: string; sermons: SermonInput[]; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { churchName, denomination, sermons, language } = body;
  const systemPrompt = language === "es" ? HISTORIC_SYSTEM_PROMPT + SPANISH_ADDENDUM : HISTORIC_SYSTEM_PROMPT;

  if (!churchName || !sermons || sermons.length < 4) {
    return NextResponse.json(
      { error: "churchName and at least 4 sermons with transcripts are required" },
      { status: 400 }
    );
  }

  // Build user message from all transcripts.
  // Each block is explicitly labeled so Claude can cite sermon title + timestamp in quotes.
  const transcriptBlock = sermons
    .map((s, i) => {
      const title = s.title ? `"${s.title}"` : `Sermon ${i + 1}`;
      const urlLine = s.url ? `\nURL: ${s.url}` : "";
      return `SERMON: ${title}${urlLine}\nTRANSCRIPT (with timestamps):\n${s.transcript}`;
    })
    .join("\n\n---\n\n");

  const userMessage = `Church/Pastor: ${churchName}
${denomination ? `Denomination/Tradition: ${denomination}` : ""}

The following are sermon transcripts (${sermons.length} sermons) to analyze:

${transcriptBlock}

Please provide a complete Historic Christianity analysis following the structured format in your instructions.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error ${response.status}: ${errText}` },
        { status: 502 }
      );
    }

    const data = (await response.json()) as AnthropicMessage;
    const analysisText = data.content?.[0]?.text ?? "";

    // Extract verdict from the analysis text
    const verdictMatch = analysisText.match(
      /\n(OUTSIDE HISTORIC CHRISTIANITY|THEOLOGICALLY CONCERNING|MIXED \/ USE DISCERNMENT|MOSTLY ORTHODOX|HISTORICALLY ORTHODOX)\n/
    );
    const verdict = verdictMatch
      ? verdictMatch[1].trim()
      : "THEOLOGICALLY CONCERNING";

    return NextResponse.json({ analysis: analysisText, verdict });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
