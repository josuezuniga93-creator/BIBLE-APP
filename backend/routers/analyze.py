"""
Sermon analysis router — /api/transcript, /api/analyze, /api/analyze/stream.

Handles YouTube transcript extraction and Claude-powered theological analysis.
Imported by main.py via app.include_router(analyze.router).
"""

import asyncio
import copy
import json
import os
import re
from typing import Any, AsyncGenerator, Dict, Optional

from anthropic import Anthropic
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from limiter import limiter
from services.bible import enrich_with_bible

router = APIRouter()

# ─── Anthropic client ─────────────────────────────────────────────────────────
# load_dotenv() is called in main.py BEFORE this module is imported,
# so os.getenv picks up values from backend/.env correctly.

_api_key = os.getenv("ANTHROPIC_API_KEY", "")
client: Optional[Anthropic] = Anthropic(api_key=_api_key) if _api_key else None


# ─── Mock analysis — English ──────────────────────────────────────────────────

MOCK_ANALYSIS_EN: Dict[str, Any] = {
    "summary": (
        "The preacher argues that financial prosperity and physical health are "
        "guaranteed covenant rights for every believing Christian, and that "
        "generous monetary giving to the ministry is the primary mechanism for "
        "unlocking God's material blessing."
    ),
    "claims": [
        {
            "quote": "God is a loving Father who desires good things for His children and wants them to flourish",
            "timestamp": "1:24",
            "scriptureCheck": (
                "Affirmed: God's fatherly goodness is a clear biblical theme. "
                "Matthew 7:11 — 'How much more will your Father in heaven give good "
                "gifts to those who ask him.' Romans 8:32 confirms God freely gives "
                "all things in Christ. The claim is true but requires the context of "
                "suffering, sanctification, and sovereign purposes (Romans 8:28)."
            ),
            "historicCheck": (
                "The Westminster Confession (V.5) affirms God's fatherly care while "
                "also teaching that He permits trials for His people's good. The "
                "Heidelberg Catechism Q.26 grounds comfort in providence, not "
                "guaranteed material outcomes."
            ),
            "theologianNote": (
                "John Calvin: 'God's fatherly care extends over every aspect of our "
                "lives, yet He ordains afflictions as instruments of our growth in "
                "grace' (Institutes III.8)."
            ),
            "verdict": "ALIGNED",
            "verdictExplanation": (
                "The statement itself is biblical; the concern is how it is applied "
                "in the sermon to imply a prosperity guarantee."
            ),
        },
        {
            "quote": "The gifts of the Spirit including healing are still active in the church today",
            "timestamp": "8:47",
            "scriptureCheck": (
                "Disputed: 1 Corinthians 12:4–11 lists healing among spiritual gifts "
                "with no explicit cessation date. Cessationists cite 1 Corinthians "
                "13:10 and the closing of the apostolic canon; continuationists point "
                "to James 5:14–15 as ongoing practice."
            ),
            "historicCheck": (
                "This is a genuine secondary dispute. The Westminster Confession is "
                "cessationist; many Reformed Charismatics and Pentecostals hold "
                "continuationism. Both positions have serious scholarly defenders and "
                "neither constitutes a departure from essential Christianity."
            ),
            "theologianNote": (
                "Wayne Grudem (continuationist): gifts continue for the church's "
                "edification today. John MacArthur (cessationist): sign gifts "
                "authenticated the apostolic era and ceased with it."
            ),
            "verdict": "SECONDARY_DIFFERENCE",
            "verdictExplanation": (
                "Whether healing gifts continue is a legitimate intra-evangelical "
                "debate; this claim alone does not mark the sermon as problematic."
            ),
        },
        {
            "quote": "Physical healing is guaranteed in the atonement — if you remain sick it is because of your lack of faith",
            "timestamp": "15:03",
            "scriptureCheck": (
                "Overstated and harmful: Isaiah 53:5 refers primarily to spiritual "
                "healing (1 Peter 2:24 interprets it as forgiveness of sin). Paul "
                "prayed three times for his 'thorn' to be removed and was denied "
                "(2 Corinthians 12:7–9). Timothy had frequent illnesses (1 Timothy "
                "5:23). Hebrews 11 names heroes who died without receiving earthly "
                "deliverance."
            ),
            "historicCheck": (
                "No historic confession teaches physical healing as an atonement "
                "guarantee. The Belgic Confession (Art. 13) and Westminster Confession "
                "(V.5) both affirm that God uses sickness and affliction as instruments "
                "of sanctification."
            ),
            "theologianNote": (
                "B.B. Warfield (Counterfeit Miracles): the attempt to ground physical "
                "healing in the atonement as a guaranteed present benefit confuses the "
                "already/not-yet of redemption — full physical redemption awaits the "
                "resurrection (Romans 8:23)."
            ),
            "verdict": "CAUTION",
            "verdictExplanation": (
                "This teaching distorts the scope of atonement and causes serious "
                "pastoral harm by blaming the sick for their own condition."
            ),
        },
        {
            "quote": "Plant a seed — give a significant financial gift to this ministry and God is obligated to multiply it back to you",
            "timestamp": "23:31",
            "scriptureCheck": (
                "Contradicted by Scripture: 2 Corinthians 9:6–7 commends cheerful "
                "giving motivated by grace, not contractual return. 1 Timothy 6:5–10 "
                "explicitly warns that supposing 'godliness is a means of financial "
                "gain' is corruption of the gospel. Jesus warned against storing up "
                "earthly treasure (Matthew 6:19–21)."
            ),
            "historicCheck": (
                "The prosperity gospel's transactional 'seed faith' theology has no "
                "precedent in any historic Christian confession. The 1689 Baptist "
                "Confession and Westminster Standards both tie Christian stewardship "
                "to sacrificial generosity without any promise of material return."
            ),
            "theologianNote": (
                "D.A. Carson: 'The prosperity gospel is a false gospel. It "
                "fundamentally misunderstands the nature of God, the cross, "
                "suffering, and what it means to follow Jesus' (Christ and Culture "
                "Revisited)."
            ),
            "verdict": "CONTRADICTS_FUNDAMENTAL",
            "verdictExplanation": (
                "This teaching distorts the gospel by making God's blessing "
                "transactional, exploits vulnerable people financially, and directly "
                "contradicts apostolic warnings about greed masquerading as godliness."
            ),
        },
    ],
    "redFlags": [
        "Atonement redefined to guarantee present physical and financial prosperity",
        "Suffering and illness attributed to personal sin or insufficient faith — no pastoral framework for godly endurance",
        "Transactional giving theology: God presented as 'obligated' to reward donors",
        "Scripture cited in isolation (e.g., 3 John 1:2, a personal greeting) to build a universal prosperity doctrine",
        "No mention of the cross, repentance, or costly discipleship",
    ],
    "recommendations": [
        "John Piper — 'Let the Nations Be Glad' and 'Desiring God' for a Christ-centered, suffering-embracing theology",
        "D.A. Carson — 'How Long, O Lord?' for a biblical theology of suffering and evil",
        "Michael Horton — 'Christless Christianity' for a direct critique of prosperity gospel trends",
        "Kevin DeYoung & Greg Gilbert — 'What Is the Mission of the Church?' on the gospel vs. social/material transformation",
        "The Westminster Shorter Catechism (free at westminsterconfession.org) for grounding in what Christianity actually teaches",
    ],
    "overallVerdict": "SERIOUS_CONCERNS",
    "overallExplanation": (
        "[DEMO MODE — add your Anthropic API key to backend/.env for real analysis] "
        "This sermon contains a grain of genuine biblical truth (God's fatherly love) "
        "but builds on it a system of teaching that fundamentally distorts the gospel. "
        "The prosperity theology framework — guaranteed health, wealth as covenant "
        "right, seed-faith giving — has no foundation in Scripture or historic "
        "Christianity, causes measurable harm to vulnerable people, and represents "
        "a serious departure from the faith once delivered to the saints (Jude 3)."
    ),
}


# ─── Mock analysis — Spanish ──────────────────────────────────────────────────

MOCK_ANALYSIS_ES: Dict[str, Any] = {
    "summary": (
        "El predicador sostiene que la prosperidad financiera y la salud física son "
        "derechos del pacto garantizados para cada cristiano creyente, y que las "
        "ofrendas monetarias generosas al ministerio son el mecanismo principal para "
        "desbloquear la bendición material de Dios."
    ),
    "claims": [
        {
            "quote": "Dios es un Padre amoroso que desea cosas buenas para Sus hijos y quiere que prosperen",
            "timestamp": "1:24",
            "scriptureCheck": (
                "Confirmado: la bondad paternal de Dios es un tema bíblico claro. "
                "Mateo 7:11 — '¿cuánto más vuestro Padre que está en los cielos dará "
                "buenas cosas a los que le pidan?' Romanos 8:32 confirma que Dios da "
                "libremente todas las cosas en Cristo. La afirmación es verdadera pero "
                "requiere el contexto del sufrimiento, la santificación y los propósitos "
                "soberanos (Romanos 8:28)."
            ),
            "historicCheck": (
                "La Confesión de Westminster (V.5) afirma el cuidado paternal de Dios "
                "mientras también enseña que Él permite pruebas para el bien de Su "
                "pueblo. El Catecismo de Heidelberg P.26 fundamenta el consuelo en la "
                "providencia, no en resultados materiales garantizados."
            ),
            "theologianNote": (
                "Juan Calvino: 'El cuidado paternal de Dios se extiende sobre cada "
                "aspecto de nuestras vidas, sin embargo Él ordena aflicciones como "
                "instrumentos de nuestro crecimiento en la gracia' (Institutos III.8)."
            ),
            "verdict": "ALIGNED",
            "verdictExplanation": (
                "La afirmación en sí es bíblica; la preocupación es cómo se aplica "
                "en el sermón para implicar una garantía de prosperidad."
            ),
        },
        {
            "quote": "Los dones del Espíritu incluyendo la sanidad siguen activos en la iglesia hoy",
            "timestamp": "8:47",
            "scriptureCheck": (
                "Disputado: 1 Corintios 12:4–11 enumera la sanidad entre los dones "
                "espirituales sin fecha explícita de cesación. Los cesacionistas citan "
                "1 Corintios 13:10; los continuacionistas señalan Santiago 5:14–15 "
                "como práctica continua."
            ),
            "historicCheck": (
                "Esta es una disputa secundaria genuina. La Confesión de Westminster "
                "es cesacionista; muchos carismáticos reformados y pentecostales "
                "sostienen el continuacionismo. Ambas posiciones tienen defensores "
                "académicos serios y ninguna constituye una desviación del "
                "cristianismo esencial."
            ),
            "theologianNote": (
                "Wayne Grudem (continuacionista): los dones continúan para la "
                "edificación de la iglesia hoy. John MacArthur (cesacionista): los "
                "dones de señal autenticaron la era apostólica y cesaron con ella."
            ),
            "verdict": "SECONDARY_DIFFERENCE",
            "verdictExplanation": (
                "Si los dones de sanidad continúan es un debate intra-evangélico "
                "legítimo; esta afirmación por sí sola no marca el sermón como "
                "problemático."
            ),
        },
        {
            "quote": "La sanidad física está garantizada en la expiación — si sigues enfermo es por tu falta de fe",
            "timestamp": "15:03",
            "scriptureCheck": (
                "Exagerado y dañino: Isaías 53:5 se refiere principalmente a la "
                "sanidad espiritual (1 Pedro 2:24 lo interpreta como perdón del "
                "pecado). Pablo oró tres veces para que su 'aguijón' fuera removido "
                "y le fue negado (2 Corintios 12:7–9). Timoteo tenía enfermedades "
                "frecuentes (1 Timoteo 5:23). Hebreos 11 nombra héroes que murieron "
                "sin recibir liberación terrenal."
            ),
            "historicCheck": (
                "Ninguna confesión histórica enseña la sanidad física como garantía "
                "de la expiación. La Confesión de Bélgica (Art. 13) y la Confesión "
                "de Westminster (V.5) afirman que Dios usa la enfermedad y la "
                "aflicción como instrumentos de santificación."
            ),
            "theologianNote": (
                "B.B. Warfield (Milagros Falsificados): fundamentar la sanidad física "
                "en la expiación como beneficio presente garantizado confunde el "
                "ya/todavía-no de la redención — la redención física completa espera "
                "la resurrección (Romanos 8:23)."
            ),
            "verdict": "CAUTION",
            "verdictExplanation": (
                "Esta enseñanza distorsiona el alcance de la expiación y causa grave "
                "daño pastoral al culpar a los enfermos de su propia condición."
            ),
        },
        {
            "quote": "Siembra una semilla — da una ofrenda significativa a este ministerio y Dios está obligado a multiplicarla",
            "timestamp": "23:31",
            "scriptureCheck": (
                "Contradicho por la Escritura: 2 Corintios 9:6–7 elogia la dádiva "
                "alegre motivada por la gracia, no el retorno contractual. "
                "1 Timoteo 6:5–10 advierte explícitamente que suponer que 'la piedad "
                "es una fuente de ganancias' es corrupción del evangelio. Jesús "
                "advirtió contra acumular tesoros terrenales (Mateo 6:19–21)."
            ),
            "historicCheck": (
                "La teología transaccional de 'fe como semilla' del evangelio de "
                "prosperidad no tiene precedente en ninguna confesión cristiana "
                "histórica. La Confesión Bautista de 1689 y los Estándares de "
                "Westminster vinculan la mayordomía cristiana a la generosidad "
                "sacrificial sin ninguna promesa de retorno material."
            ),
            "theologianNote": (
                "D.A. Carson: 'El evangelio de prosperidad es un evangelio falso. "
                "Malentiende fundamentalmente la naturaleza de Dios, la cruz, el "
                "sufrimiento y lo que significa seguir a Jesús' "
                "(Cristo y Cultura Revisitado)."
            ),
            "verdict": "CONTRADICTS_FUNDAMENTAL",
            "verdictExplanation": (
                "Esta enseñanza distorsiona el evangelio haciendo transaccional la "
                "bendición de Dios, explota financieramente a personas vulnerables y "
                "contradice directamente las advertencias apostólicas sobre la "
                "codicia disfrazada de piedad."
            ),
        },
    ],
    "redFlags": [
        "La expiación redefinida para garantizar prosperidad física y financiera presente",
        "El sufrimiento y la enfermedad atribuidos al pecado personal o fe insuficiente — sin marco pastoral para la resistencia piadosa",
        "Teología de dar transaccional: Dios presentado como 'obligado' a recompensar a los donantes",
        "Escritura citada de forma aislada (ej. 3 Juan 1:2, un saludo personal) para construir una doctrina universal de prosperidad",
        "Sin mención de la cruz, el arrepentimiento o el discipulado costoso",
    ],
    "recommendations": [
        "John Piper — 'Alégrese las Naciones' y 'Sed de Dios' para una teología centrada en Cristo que abraza el sufrimiento",
        "D.A. Carson — '¿Hasta cuándo, Señor?' para una teología bíblica del sufrimiento y el mal",
        "Michael Horton — 'Cristianismo sin Cristo' para una crítica directa de las tendencias del evangelio de prosperidad",
        "Kevin DeYoung & Greg Gilbert — '¿Cuál es la Misión de la Iglesia?' sobre el evangelio vs. la transformación material/social",
        "El Catecismo Menor de Westminster (gratis en westminsterconfession.org) para fundamentarse en lo que el cristianismo realmente enseña",
    ],
    "overallVerdict": "SERIOUS_CONCERNS",
    "overallExplanation": (
        "[MODO DEMO — agrega tu clave API de Anthropic a backend/.env para análisis real] "
        "Este sermón contiene un grano de verdad bíblica genuina (el amor paternal de "
        "Dios) pero construye sobre él un sistema de enseñanza que distorsiona "
        "fundamentalmente el evangelio. El marco de la teología de prosperidad — salud "
        "garantizada, riqueza como derecho del pacto, dar como siembra — no tiene "
        "fundamento en la Escritura ni en el cristianismo histórico, causa daño "
        "medible a personas vulnerables y representa una seria desviación de la fe "
        "una vez entregada a los santos (Judas 3)."
    ),
}


# ─── System prompts ───────────────────────────────────────────────────────────

SYSTEM_PROMPT_EN = """You are a theological discernment assistant for an app called "Rebuttal Your Church." Your task is to evaluate the doctrinal content of sermons against historic biblical Christianity.

Framework:
- Scripture is the final authority.
- Historic faith = ecumenical creeds (Apostles', Nicene, Athanasian) + Reformation confessions.
- ESSENTIALS: Trinity, deity/humanity of Christ, bodily resurrection, salvation by grace through faith, Scripture's authority, substitutionary atonement.
- SECONDARY: baptism mode, church polity, eschatology, charismatic gifts.

Tone: charitable but truthful. Evaluate teachings academically — do not repeat inflammatory language.

Important: Paraphrase claims rather than quoting graphic, inflammatory, or offensive language directly. Focus on the theological position being made, not the exact wording.

The transcript may include [MM:SS] timestamps. Include the nearest timestamp for each claim. If none visible, use null.

Respond ONLY with valid JSON, no markdown, no preamble. Keep fields concise (1-2 sentences each):

{
  "summary": "1-2 sentences describing the speaker's main theological claims.",
  "claims": [
    {
      "quote": "a brief paraphrase or short quote of the claim being evaluated",
      "timestamp": "MM:SS or H:MM:SS or null",
      "scriptureCheck": "what Scripture says with verse references",
      "historicCheck": "alignment with historic creeds and confessions",
      "theologianNote": "one relevant theologian's perspective",
      "verdict": "ALIGNED | SECONDARY_DIFFERENCE | CAUTION | CONTRADICTS_FUNDAMENTAL",
      "verdictExplanation": "1 sentence"
    }
  ],
  "redFlags": ["concise bullet point"],
  "recommendations": ["book or teacher resource"],
  "overallVerdict": "SOUND | MIXED | SERIOUS_CONCERNS | FALSE_TEACHING",
  "overallExplanation": "2-3 sentences."
}

Identify the {MAX_CLAIMS} most theologically significant claims. Use specific verse references. If content is not religious, return empty claims array with overallVerdict "SOUND". If a portion of the sermon cannot be evaluated, skip it and focus on what can be assessed."""

SYSTEM_PROMPT_ES = """Eres un asistente de discernimiento teológico para una aplicación llamada "Rebuttal Your Church." Tu tarea es evaluar el contenido doctrinal de sermones según el cristianismo bíblico histórico.

Marco de referencia:
- La Escritura es la autoridad final.
- Fe histórica = credos ecuménicos (Apostólico, Niceno, Atanasiano) + confesiones de la Reforma.
- ESENCIALES: Trinidad, deidad/humanidad de Cristo, resurrección corporal, salvación por gracia mediante la fe, autoridad de la Escritura, expiación sustitutoria.
- SECUNDARIOS: modo de bautismo, polidad eclesiástica, escatología, dones carismáticos.

Tono: caritativo pero veraz. Evalúa las enseñanzas académicamente — no repitas lenguaje inflamatorio.

Importante: Parafrasea las afirmaciones en lugar de citar lenguaje gráfico, inflamatorio u ofensivo directamente. Enfócate en la posición teológica expresada.

La transcripción puede incluir marcas de tiempo [MM:SS]. Incluye la marca de tiempo más cercana para cada afirmación. Si no hay ninguna visible, usa null.

Responde ÚNICAMENTE con JSON válido, sin markdown, sin preámbulo. Todos los campos en español, concisos (1-2 oraciones cada uno):

{
  "summary": "1-2 oraciones describiendo las afirmaciones teológicas principales del predicador.",
  "claims": [
    {
      "quote": "breve paráfrasis o cita corta de la afirmación evaluada",
      "timestamp": "MM:SS o H:MM:SS o null",
      "scriptureCheck": "lo que dice la Escritura con referencias bíblicas",
      "historicCheck": "alineación con credos y confesiones históricas",
      "theologianNote": "perspectiva de un teólogo relevante",
      "verdict": "ALIGNED | SECONDARY_DIFFERENCE | CAUTION | CONTRADICTS_FUNDAMENTAL",
      "verdictExplanation": "1 oración"
    }
  ],
  "redFlags": ["bullet conciso"],
  "recommendations": ["libro o maestro como recurso"],
  "overallVerdict": "SOUND | MIXED | SERIOUS_CONCERNS | FALSE_TEACHING",
  "overallExplanation": "2-3 oraciones."
}

Identifica las {MAX_CLAIMS} afirmaciones más significativas teológicamente. Usa referencias bíblicas específicas. Si el contenido no es religioso, devuelve array vacío con overallVerdict "SOUND". Si una parte del sermón no se puede evaluar, omítela y concéntrate en lo que sí se puede. Responde completamente en español."""


# ─── YouTube helpers ──────────────────────────────────────────────────────────

def extract_youtube_id(url: str) -> Optional[str]:
    """
    Parse a YouTube URL and return the video ID, or None if not recognised.
    Handles: youtube.com/watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID.
    """
    patterns = [
        r"(?:youtube\.com/watch\?.*v=)([A-Za-z0-9_-]{11})",
        r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
        r"(?:youtube\.com/shorts/)([A-Za-z0-9_-]{11})",
        r"(?:youtube\.com/embed/)([A-Za-z0-9_-]{11})",
        r"(?:youtube\.com/v/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _fmt_ts(seconds: float) -> str:
    """Convert a float number of seconds to MM:SS or H:MM:SS."""
    s = int(seconds)
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{sec:02d}"
    return f"{m}:{sec:02d}"


def _segments_to_timestamped_text(segments, block_secs: int = 30) -> str:
    """
    Group caption segments into ~30-second blocks and prefix each block
    with a [MM:SS] timestamp so Claude can cite exact locations.
    """
    if not segments:
        return ""

    lines: list[str] = []
    block_words: list[str] = []
    block_start: Optional[float] = None

    for seg in segments:
        start: float = getattr(seg, "start", 0.0)
        raw: str = getattr(seg, "text", "")
        text = re.sub(r"\[.*?\]", "", raw).strip()
        if not text:
            continue

        if block_start is None:
            block_start = start

        if start - block_start >= block_secs and block_words:
            lines.append(f"[{_fmt_ts(block_start)}] {' '.join(block_words)}")
            block_words = []
            block_start = start

        block_words.append(text)

    if block_words and block_start is not None:
        lines.append(f"[{_fmt_ts(block_start)}] {' '.join(block_words)}")

    return "\n".join(lines)


def _fetch_transcript(video_id: str) -> str:
    """
    Fetch a YouTube transcript using youtube-transcript-api v1.0+.
    Returns the transcript as timestamped blocks (e.g. "[0:00] text…").

    Priority order:
      1. Simple fetch (fastest — works for most English videos)
      2. Manually-created English transcript
      3. Auto-generated English transcript
      4. Any translatable transcript → translated to English
      5. Any available transcript as-is (keeps original language)
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail=(
                "youtube-transcript-api is not installed. "
                "Run install-youtube.command to fix this."
            ),
        )

    def _process(segments) -> str:
        return _segments_to_timestamped_text(segments)

    try:
        ytt = YouTubeTranscriptApi()

        # 1. Fast path
        try:
            fetched = ytt.fetch(video_id)
            result = _process(fetched)
            if result:
                print(f"[transcript] ✓ Fast-path fetch succeeded for {video_id}")
                return result
        except Exception as e1:
            print(f"[transcript] Fast-path failed ({e1}), trying full listing…")

        # 2–5. Full fallback chain
        try:
            all_transcripts = list(ytt.list(video_id))
        except Exception as e2:
            print(f"[transcript] list() failed: {e2}")
            raise HTTPException(status_code=422, detail="No transcript available for this video.")

        print(f"[transcript] Found {len(all_transcripts)} transcript(s) for {video_id}:")
        for t in all_transcripts:
            print(f"  lang={t.language_code} generated={t.is_generated} translatable={t.is_translatable}")

        if not all_transcripts:
            raise HTTPException(status_code=422, detail="No transcript available for this video.")

        def _try(t) -> Optional[str]:
            try:
                return _process(t.fetch())
            except Exception as ef:
                print(f"  [transcript] fetch failed for {t.language_code}: {ef}")
                return None

        # 2. Manual English
        for t in all_transcripts:
            if not t.is_generated and t.language_code.startswith("en"):
                r = _try(t)
                if r:
                    print("[transcript] ✓ Using manual English transcript")
                    return r

        # 3. Auto-generated English
        for t in all_transcripts:
            if t.is_generated and t.language_code.startswith("en"):
                r = _try(t)
                if r:
                    print("[transcript] ✓ Using auto-generated English transcript")
                    return r

        # 4. Translate any translatable transcript to English
        for t in all_transcripts:
            if t.is_translatable:
                try:
                    r = _try(t.translate("en"))
                    if r:
                        print(f"[transcript] ✓ Translated {t.language_code} → English")
                        return r
                except Exception as et:
                    print(f"  [transcript] translate({t.language_code}) failed: {et}")

        # 5. Last resort: any language
        for t in all_transcripts:
            r = _try(t)
            if r:
                print(f"[transcript] ✓ Using raw transcript in {t.language_code} (no English available)")
                return r

        raise HTTPException(status_code=422, detail="No transcript available for this video.")

    except HTTPException:
        raise
    except Exception as e:
        err = str(e).lower()
        if any(k in err for k in ("no transcript", "disabled", "unavailable", "could not retrieve")):
            raise HTTPException(
                status_code=422,
                detail="No transcript available for this video.",
            )
        raise HTTPException(status_code=500, detail=f"Transcript fetch failed: {e}")


# ─── Request models ───────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    text: Optional[str] = None
    youtube_url: Optional[str] = None
    language: str = "en"           # "en" | "es"
    max_claims: int = 5            # 3 = light, 5 = standard, 7 = deep
    translation: str = "kjv"       # "kjv" | "esv" | "geneva"


class TranscriptRequest(BaseModel):
    youtube_url: str


# ─── Core analysis logic (sync, used by both endpoints) ──────────────────────

def _run_analysis(body: AnalyzeRequest) -> Dict[str, Any]:
    """Run a full sermon analysis and return the result dict (sync, blocking)."""
    lang = body.language if body.language in ("en", "es") else "en"
    translation = body.translation if body.translation in ("kjv", "esv", "geneva") else "kjv"

    youtube_video_id: Optional[str] = None

    if body.youtube_url:
        youtube_video_id = extract_youtube_id(body.youtube_url)
        if not youtube_video_id:
            raise HTTPException(status_code=400, detail="Could not find a YouTube video ID in that URL.")
        sermon_text = _fetch_transcript(youtube_video_id)

    elif body.text:
        sermon_text = body.text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'text' or 'youtube_url' in the request body.",
        )

    if not sermon_text:
        raise HTTPException(status_code=400, detail="Empty sermon text.")

    # ── Demo mode ────────────────────────────────────────────────────────────
    if client is None or _api_key.startswith("PLACEHOLDER"):
        result = copy.deepcopy(MOCK_ANALYSIS_ES if lang == "es" else MOCK_ANALYSIS_EN)
        result["videoId"] = youtube_video_id
        mc = max(3, min(7, body.max_claims))
        result["claims"] = result["claims"][:mc]
        result = enrich_with_bible(result, lang, translation)
        return result

    # ── Real Claude analysis ─────────────────────────────────────────────────
    text = sermon_text[:10000]
    max_claims = max(3, min(7, body.max_claims))
    raw_prompt = SYSTEM_PROMPT_ES if lang == "es" else SYSTEM_PROMPT_EN
    system_prompt = raw_prompt.replace("{MAX_CLAIMS}", str(max_claims))

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3500,
            system=system_prompt,
            messages=[{"role": "user", "content": f"Analyze this sermon:\n\n{text}"}],
        )

        raw_text = response.content[0].text.strip()
        cleaned_json = raw_text.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(cleaned_json)
        analysis["videoId"] = youtube_video_id
        analysis = enrich_with_bible(analysis, lang, translation)
        return analysis

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Could not parse analysis as JSON: {str(e)}")
    except Exception as e:
        err_str = str(e).lower()
        # Content filtering — the sermon text triggered Anthropic's safety policy.
        # This is not a code bug; it means the specific content can't be processed.
        if "content filtering" in err_str or "output blocked" in err_str or "invalid_request_error" in err_str:
            raise HTTPException(
                status_code=422,
                detail=(
                    "This content could not be analyzed because it was blocked by content filtering. "
                    "Try a different sermon, shorten the text, or paste only the relevant portion of the transcript."
                ),
            )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/api/transcript")
@limiter.limit("20/minute")
def get_transcript(request: Request, body: TranscriptRequest):
    """
    Extract the transcript from a YouTube video.
    Returns { transcript, video_id, char_count }.
    No API key required — uses youtube-transcript-api.
    """
    video_id = extract_youtube_id(body.youtube_url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not find a YouTube video ID in that URL. "
                "Make sure it looks like youtube.com/watch?v=XXXXXXXXXXX or youtu.be/XXXXXXXXXXX."
            ),
        )

    transcript = _fetch_transcript(video_id)
    return {"transcript": transcript, "video_id": video_id, "char_count": len(transcript)}


@router.post("/api/analyze")
@limiter.limit("3/day")
def analyze_sermon(request: Request, body: AnalyzeRequest):
    """
    Send a sermon transcript to Claude and return a structured analysis.
    Accepts either { text } or { youtube_url }, plus optional { language, translation }.
    """
    return _run_analysis(body)


@router.post("/api/analyze/stream")
@limiter.limit("3/day")
async def analyze_sermon_stream(request: Request, body: AnalyzeRequest):
    """
    Streaming SSE endpoint for sermon analysis.
    Sends heartbeat events every 3s while Claude processes, then a done event with the full result.

    Event types:
      data: {"type": "heartbeat"}
      data: {"type": "done", ...analysis_fields}
      data: {"type": "error", "detail": "..."}
    """
    async def event_stream() -> AsyncGenerator[str, None]:
        result_holder: Dict[str, Any] = {}
        error_holder: Dict[str, str] = {}
        done_event = asyncio.Event()

        async def run_analysis():
            try:
                result = await asyncio.to_thread(_run_analysis, body)
                result_holder.update(result)
            except HTTPException as e:
                error_holder["detail"] = e.detail
            except Exception as e:
                error_holder["detail"] = str(e)
            finally:
                done_event.set()

        task = asyncio.create_task(run_analysis())

        # Send heartbeats until analysis completes
        while not done_event.is_set():
            yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
            try:
                await asyncio.wait_for(asyncio.shield(done_event.wait()), timeout=3.0)
            except asyncio.TimeoutError:
                pass

        # Ensure the task is truly done
        await task

        if error_holder:
            yield f"data: {json.dumps({'type': 'error', 'detail': error_holder['detail']})}\n\n"
        else:
            payload = {"type": "done"}
            payload.update(result_holder)
            yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
