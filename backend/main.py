"""
Rebuttal Your Church — FastAPI backend.

Receives sermon text (or a YouTube URL) from the frontend, calls Claude with
a theological analysis prompt, returns structured JSON describing the verdict
on each claim and an overall verdict on the sermon.

Supports English ("en") and Spanish ("es") via the `language` field.

Run locally with:
    cd backend
    source venv/bin/activate
    uvicorn main:app --reload
"""

import os
import re
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv


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


load_dotenv()

# ─── Lexicon service (Strong's + Matthew Henry) ───────────────────────────────
import lexicon_service as _lex

# ─── Bible lookup service ─────────────────────────────────────────────────────
#
# English:  Geneva 1599 — local JSON file (run download-bibles.command first)
#           KJV         — local JSON file (same download) or bible-api.com fallback
#           ESV         — api.esv.org (set ESV_API_KEY in backend/.env)
# Spanish:  RVR1960 & LBLA via api.bible (set BIBLE_API_KEY from scripture.api.bible)

ESV_API_KEY   = os.getenv("ESV_API_KEY", "")
BIBLE_API_KEY = os.getenv("BIBLE_API_KEY", "")   # from scripture.api.bible (free)

# scripture.api.bible Bible IDs
_API_BIBLE_IDS = {
    "rvr60": "b32b9d1b64b4ef29-04",   # Reina-Valera 1960
    "lbla":  "c315fa9f71d4af3d-01",   # La Biblia de las Américas
}

# Book name → 3-letter api.bible code (English canonical names)
_BOOK_CODES: Dict[str, str] = {
    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
    "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
    "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
    "1 Chronicles": "1CH", "2 Chronicles": "2CH",
    "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB",
    "Psalms": "PSA", "Psalm": "PSA", "Proverbs": "PRO", "Ecclesiastes": "ECC",
    "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
    "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
    "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA",
    "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB",
    "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
    "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
    "Acts": "ACT", "Romans": "ROM",
    "1 Corinthians": "1CO", "2 Corinthians": "2CO",
    "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP",
    "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
    "1 Timothy": "1TI", "2 Timothy": "2TI",
    "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
    "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE",
    "1 John": "1JN", "2 John": "2JN", "3 John": "3JN",
    "Jude": "JUD", "Revelation": "REV",
}

# Spanish (and variant) book names → English canonical name
_BOOK_NORMALIZE: Dict[str, str] = {
    # OT Spanish
    "Génesis": "Genesis", "Exodo": "Exodus", "Éxodo": "Exodus",
    "Levítico": "Leviticus", "Números": "Numbers", "Deuteronomio": "Deuteronomy",
    "Josué": "Joshua", "Jueces": "Judges", "Rut": "Ruth",
    "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
    "1 Reyes": "1 Kings", "2 Reyes": "2 Kings",
    "1 Crónicas": "1 Chronicles", "2 Crónicas": "2 Chronicles",
    "Esdras": "Ezra", "Nehemías": "Nehemiah", "Ester": "Esther", "Job": "Job",
    "Salmos": "Psalms", "Salmo": "Psalms", "Proverbios": "Proverbs",
    "Eclesiastés": "Ecclesiastes", "Cantares": "Song of Solomon",
    "Isaías": "Isaiah", "Jeremías": "Jeremiah", "Lamentaciones": "Lamentations",
    "Ezequiel": "Ezekiel", "Daniel": "Daniel",
    "Oseas": "Hosea", "Joel": "Joel", "Amós": "Amos", "Abdías": "Obadiah",
    "Jonás": "Jonah", "Miqueas": "Micah", "Nahúm": "Nahum", "Habacuc": "Habakkuk",
    "Sofonías": "Zephaniah", "Hageo": "Haggai", "Zacarías": "Zechariah",
    "Malaquías": "Malachi",
    # NT Spanish
    "Mateo": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "Juan": "John",
    "Hechos": "Acts", "Romanos": "Romans",
    "1 Corintios": "1 Corinthians", "2 Corintios": "2 Corinthians",
    "Gálatas": "Galatians", "Efesios": "Ephesians", "Filipenses": "Philippians",
    "Colosenses": "Colossians",
    "1 Tesalonicenses": "1 Thessalonians", "2 Tesalonicenses": "2 Thessalonians",
    "1 Timoteo": "1 Timothy", "2 Timoteo": "2 Timothy",
    "Tito": "Titus", "Filemón": "Philemon", "Hebreos": "Hebrews",
    "Santiago": "James", "1 Pedro": "1 Peter", "2 Pedro": "2 Peter",
    "1 Juan": "1 John", "2 Juan": "2 John", "3 Juan": "3 John",
    "Judas": "Jude", "Apocalipsis": "Revelation",
}

# ── Local Bible file index ────────────────────────────────────────────────────
# Book name (English canonical) → scrollmapper book number (1-66)
_BOOK_NUMBERS: Dict[str, int] = {
    "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
    "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
    "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
    "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18,
    "Psalms": 19, "Psalm": 19, "Proverbs": 20, "Ecclesiastes": 21,
    "Song of Solomon": 22, "Isaiah": 23, "Jeremiah": 24, "Lamentations": 25,
    "Ezekiel": 26, "Daniel": 27, "Hosea": 28, "Joel": 29, "Amos": 30,
    "Obadiah": 31, "Jonah": 32, "Micah": 33, "Nahum": 34, "Habakkuk": 35,
    "Zephaniah": 36, "Haggai": 37, "Zechariah": 38, "Malachi": 39,
    "Matthew": 40, "Mark": 41, "Luke": 42, "John": 43, "Acts": 44,
    "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
    "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
    "1 Thessalonians": 52, "2 Thessalonians": 53,
    "1 Timothy": 54, "2 Timothy": 55, "Titus": 56, "Philemon": 57,
    "Hebrews": 58, "James": 59, "1 Peter": 60, "2 Peter": 61,
    "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65, "Revelation": 66,
}

_LOCAL_BIBLE_CACHE: Dict[str, Optional[Dict[str, str]]] = {}  # filename → {key → text}


def _load_local_bible(filename: str) -> Optional[Dict[str, str]]:
    """
    Load a scrollmapper-format Bible JSON file from backend/data/.
    Returns a dict keyed as '{book_num}_{chapter}_{verse}' → verse text.
    Result is cached in memory after first load.
    """
    if filename in _LOCAL_BIBLE_CACHE:
        return _LOCAL_BIBLE_CACHE[filename]

    data_path = os.path.join(os.path.dirname(__file__), "data", filename)
    if not os.path.exists(data_path):
        _LOCAL_BIBLE_CACHE[filename] = None
        return None

    try:
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        index: Dict[str, str] = {}
        for entry in data:
            key = f"{entry['b']}_{entry['c']}_{entry['v']}"
            index[key] = entry.get("t", "").strip()
        _LOCAL_BIBLE_CACHE[filename] = index
        print(f"[Bible] Loaded {len(index):,} verses from {filename}")
        return index
    except Exception as e:
        print(f"[Bible] Failed to load {filename}: {e}")
        _LOCAL_BIBLE_CACHE[filename] = None
        return None


def _lookup_local(filename: str, ref: str) -> Optional[str]:
    """Look up a normalized English verse reference in a local Bible file."""
    index = _load_local_bible(filename)
    if not index:
        return None
    parts = ref.rsplit(" ", 1)
    if len(parts) != 2:
        return None
    book_name, cv = parts[0].strip(), parts[1].strip()
    book_num = _BOOK_NUMBERS.get(book_name)
    if not book_num:
        return None
    chapter, _, verse_part = cv.partition(":")
    verse = re.split(r"[-–]", verse_part)[0].strip()
    return index.get(f"{book_num}_{chapter}_{verse}")


def _fetch_geneva(ref: str) -> Optional[str]:
    """Fetch Geneva 1599 text from local file (download-bibles.command required)."""
    return _lookup_local("geneva1599.json", ref)


def _fetch_kjv_local(ref: str) -> Optional[str]:
    """Fetch KJV text from local file (download-bibles.command required)."""
    return _lookup_local("kjv.json", ref)


# Regex: catches verse refs in English and Spanish
_VERSE_REF_RE = re.compile(
    r'\b((?:[123]\s)?'
    r'(?:'
    # English
    r'Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|'
    r'Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs?|Ecclesiastes|Isaiah|Jeremiah|Lamentations|'
    r'Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|'
    r'Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|'
    r'Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation|'
    # Spanish
    r'G[eé]nesis|[EÉ]xodo|Lev[ií]tico|N[uú]meros|Deuteronomio|Jos[uú][eé]|Jueces|Rut|'
    r'Reyes|Cr[oó]nicas|Esdras|Nehem[ií]as|Ester|Salmos?|Proverbios|Eclesiast[eé]s|'
    r'Isa[ií]as|Jerem[ií]as|Lamentaciones|Ezequiel|Oseas|Am[oó]s|Abd[ií]as|Jon[aá]s|'
    r'Miqueas|Nah[uú]m|Habacuc|Sofon[ií]as|Hageo|Zacar[ií]as|Malaqu[ií]as|'
    r'Mateo|Marcos|Lucas|Hechos|Romanos|Corintios|G[aá]latas|Efesios|Filipenses|'
    r'Colosenses|Tesalonicenses|Timoteo|Tito|File[mó]n|Hebreos|Santiago|Pedro|Judas|Apocalipsis'
    r'))'
    r'\s+(\d+:\d+)',
    re.IGNORECASE | re.UNICODE,
)


def _normalize_book(raw: str) -> Optional[str]:
    """Return the canonical English book name for any English or Spanish book name."""
    raw = raw.strip()
    # Already a canonical English name?
    if raw in _BOOK_CODES:
        return raw
    # In the Spanish → English map?
    if raw in _BOOK_NORMALIZE:
        return _BOOK_NORMALIZE[raw]
    # Case-insensitive fallback
    low = raw.lower()
    for k in list(_BOOK_CODES.keys()) + list(_BOOK_NORMALIZE.keys()):
        if k.lower() == low:
            return _BOOK_NORMALIZE.get(k, k if k in _BOOK_CODES else None)
    return None


def _extract_verse_refs(text: str) -> List[str]:
    """Return deduplicated, normalized English verse references from text."""
    seen: set[str] = set()
    result: List[str] = []
    for m in _VERSE_REF_RE.finditer(text):
        raw_book = m.group(1).strip()
        cv = m.group(2)
        canon = _normalize_book(raw_book)
        if canon:
            ref = f"{canon} {cv}"
            if ref not in seen:
                seen.add(ref)
                result.append(ref)
    return result


def _ref_to_api_bible_id(ref: str) -> Optional[str]:
    """'Matthew 7:11' → 'MAT.7.11', '1 Corinthians 12:4' → '1CO.12.4'."""
    parts = ref.rsplit(" ", 1)
    if len(parts) != 2:
        return None
    book_key, cv = parts[0].strip(), parts[1].strip()
    code = _BOOK_CODES.get(book_key)
    if not code:
        return None
    chapter, _, verse_part = cv.partition(":")
    verse = re.split(r"[-–]", verse_part)[0]  # only first verse of a range
    return f"{code}.{chapter}.{verse}"


# ── Per-version fetch functions ───────────────────────────────────────────────

def _fetch_kjv(ref: str) -> Optional[str]:
    """KJV — local file first (fast), then bible-api.com (free fallback)."""
    local = _fetch_kjv_local(ref)
    if local:
        return local
    # Fallback: live API (no key required)
    try:
        url = f"https://bible-api.com/{urllib.parse.quote(ref)}?translation=kjv"
        req = urllib.request.Request(url, headers={"User-Agent": "RebuttalYourChurch/1.0"})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            return data.get("text", "").strip().replace("\n", " ")
    except Exception as e:
        print(f"[KJV] '{ref}': {e}")
        return None


def _fetch_esv(ref: str) -> Optional[str]:
    """ESV via api.esv.org — requires ESV_API_KEY in backend/.env."""
    if not ESV_API_KEY:
        return None
    try:
        params = urllib.parse.urlencode({
            "q": ref,
            "include-headings": "false",
            "include-footnotes": "false",
            "include-verse-numbers": "false",
            "include-short-copyright": "false",
            "include-passage-references": "false",
        })
        url = f"https://api.esv.org/v3/passage/text/?{params}"
        req = urllib.request.Request(url, headers={"Authorization": f"Token {ESV_API_KEY}"})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            passages = data.get("passages", [])
            return passages[0].strip().replace("\n", " ") if passages else None
    except Exception as e:
        print(f"[ESV] '{ref}': {e}")
        return None


def _fetch_api_bible(ref: str, bible_id: str, version_name: str) -> Optional[str]:
    """Fetch from scripture.api.bible — requires BIBLE_API_KEY."""
    if not BIBLE_API_KEY:
        return None
    verse_id = _ref_to_api_bible_id(ref)
    if not verse_id:
        return None
    try:
        params = urllib.parse.urlencode({
            "content-type": "text",
            "include-notes": "false",
            "include-titles": "false",
            "include-chapter-numbers": "false",
            "include-verse-numbers": "false",
            "include-short-copyright": "false",
        })
        url = f"https://api.scripture.api.bible/v1/bibles/{bible_id}/verses/{verse_id}?{params}"
        req = urllib.request.Request(url, headers={"api-key": BIBLE_API_KEY})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            content = data.get("data", {}).get("content", "").strip()
            return content or None
    except Exception as e:
        print(f"[{version_name}] '{ref}': {e}")
        return None


def _fetch_rvr60(ref: str) -> Optional[str]:
    return _fetch_api_bible(ref, _API_BIBLE_IDS["rvr60"], "RVR60")


def _fetch_lbla(ref: str) -> Optional[str]:
    return _fetch_api_bible(ref, _API_BIBLE_IDS["lbla"], "LBLA")


# ── Enrichment orchestrator ───────────────────────────────────────────────────

def _enrich_with_bible(analysis: Dict[str, Any], lang: str) -> Dict[str, Any]:
    """
    After Claude returns the analysis, fetch actual Bible verse texts for every
    verse reference cited in every scriptureCheck field.

    English sermons → ESV + KJV
    Spanish sermons → RVR1960 + LBLA (both via scripture.api.bible)

    Results are attached per-claim as:
        claim["bibleVerses"] = {
            "Matthew 7:11": {"esv": "...", "kjv": "..."},
            "Romans 8:32":  {"esv": "...", "kjv": "..."},
        }
    """
    if lang == "es":
        fetchers = [("rvr60", _fetch_rvr60), ("lbla", _fetch_lbla)]
    else:
        fetchers = [("esv", _fetch_esv), ("kjv", _fetch_kjv), ("geneva", _fetch_geneva)]

    # Collect all unique refs across all claims so we can de-dup API calls
    all_refs: List[str] = []
    ref_set: set[str] = set()
    for claim in analysis.get("claims", []):
        for ref in _extract_verse_refs(claim.get("scriptureCheck", "")):
            if ref not in ref_set:
                ref_set.add(ref)
                all_refs.append(ref)

    all_refs = all_refs[:14]  # cap at 14 unique refs total

    if not all_refs:
        return analysis

    # Fetch all (version × ref) combos in parallel for speed
    cache: Dict[str, Dict[str, str]] = {ref: {} for ref in all_refs}
    tasks = [(name, fn, ref) for name, fn in fetchers for ref in all_refs]

    try:
        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = {pool.submit(fn, ref): (name, ref) for name, fn, ref in tasks}
            for future in as_completed(futures, timeout=12):
                name, ref = futures[future]
                try:
                    text = future.result()
                    if text:
                        cache[ref][name] = text
                except Exception:
                    pass
    except Exception as e:
        print(f"[Bible] parallel fetch error: {e}")

    # Attach per-claim
    for claim in analysis.get("claims", []):
        claim_refs = _extract_verse_refs(claim.get("scriptureCheck", ""))
        bible_verses: Dict[str, Dict[str, str]] = {}
        for ref in claim_refs:
            if cache.get(ref):
                bible_verses[ref] = cache[ref]
        if bible_verses:
            claim["bibleVerses"] = bible_verses

    return analysis


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


# ─── System prompts ───────────────────────────────────────────────────────────

SYSTEM_PROMPT_EN = """You analyze sermons against historic biblical Christianity for an app called "Rebuttal Your Church."

Framework:
- Scripture is final authority.
- Historic faith = ecumenical creeds (Apostles', Nicene, Athanasian) + Reformation confessions.
- ESSENTIALS: Trinity, deity/humanity of Christ, bodily resurrection, salvation by grace through faith, Scripture's authority, substitutionary atonement.
- SECONDARY: baptism mode, polity, eschatology, charismatic gifts.

Tone: charitable but truthful. Test teachings, don't mock teachers.

The transcript you receive may include [MM:SS] or [H:MM:SS] timestamps at the start of each block. For each claim you identify, find the timestamp closest to where that claim was made and include it as the "timestamp" field. If no timestamp is visible in the transcript, use null.

Respond ONLY with valid JSON, no markdown, no preamble. Keep all fields concise (1-2 sentences each):

{
  "summary": "1-2 sentences on what speaker claims.",
  "claims": [
    {
      "quote": "the speaker's exact or near-exact words (not a paraphrase)",
      "timestamp": "MM:SS or H:MM:SS from the transcript, or null if unknown",
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

Pick the {MAX_CLAIMS} most significant claims. Use specific verse references (book chapter:verse). If not religious content, return empty claims array with overallVerdict "SOUND"."""

SYSTEM_PROMPT_ES = """Eres un analizador de sermones contra el cristianismo bíblico histórico para una aplicación llamada "Rebuttal Your Church."

Marco de referencia:
- La Escritura es la autoridad final.
- Fe histórica = credos ecuménicos (Apostólico, Niceno, Atanasiano) + confesiones de la Reforma.
- ESENCIALES: Trinidad, deidad/humanidad de Cristo, resurrección corporal, salvación por gracia mediante la fe, autoridad de la Escritura, expiación sustitutoria.
- SECUNDARIOS: modo de bautismo, polidad eclesiástica, escatología, dones carismáticos.

Tono: caritativo pero veraz. Prueba las enseñanzas, no te burles de los maestros.

La transcripción que recibes puede incluir marcas de tiempo [MM:SS] o [H:MM:SS] al inicio de cada bloque. Para cada afirmación que identifiques, encuentra la marca de tiempo más cercana a donde se hizo esa afirmación e inclúyela en el campo "timestamp". Si no hay marca de tiempo visible, usa null.

Responde ÚNICAMENTE con JSON válido, sin markdown, sin preámbulo. Todos los campos deben estar en español, concisos (1-2 oraciones cada uno):

{
  "summary": "1-2 oraciones sobre lo que el predicador afirma.",
  "claims": [
    {
      "quote": "las palabras exactas o casi exactas del predicador (no parafraseadas)",
      "timestamp": "MM:SS o H:MM:SS de la transcripción, o null si se desconoce",
      "scriptureCheck": "lo que dice la Escritura con referencias bíblicas",
      "historicCheck": "alineación con credos y confesiones históricas",
      "theologianNote": "opinión de 1 teólogo",
      "verdict": "ALIGNED | SECONDARY_DIFFERENCE | CAUTION | CONTRADICTS_FUNDAMENTAL",
      "verdictExplanation": "1 oración"
    }
  ],
  "redFlags": ["bullet corto en español"],
  "recommendations": ["recurso o maestro"],
  "overallVerdict": "SOUND | MIXED | SERIOUS_CONCERNS | FALSE_TEACHING",
  "overallExplanation": "2-3 oraciones en español."
}

Selecciona las {MAX_CLAIMS} afirmaciones más significativas. Usa referencias bíblicas específicas (libro capítulo:versículo). Si el contenido no es religioso, devuelve array de afirmaciones vacío con overallVerdict "SOUND". Responde completamente en español."""


# ─── Helpers ──────────────────────────────────────────────────────────────────

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

    Example output:
        [0:00] Welcome everyone today we're going to talk about the goodness…
        [0:30] …and how He wants every single one of you to prosper…
        [1:00] The Bible says in 3 John 1 verse 2…
    """
    if not segments:
        return ""

    lines: list[str] = []
    block_words: list[str] = []
    block_start: Optional[float] = None

    for seg in segments:
        start: float = getattr(seg, "start", 0.0)
        raw: str = getattr(seg, "text", "")
        # Strip noise tags [Music], [Applause], etc.
        text = re.sub(r"\[.*?\]", "", raw).strip()
        if not text:
            continue

        if block_start is None:
            block_start = start

        # Flush current block when we hit a new ~30-second boundary
        if start - block_start >= block_secs and block_words:
            lines.append(f"[{_fmt_ts(block_start)}] {' '.join(block_words)}")
            block_words = []
            block_start = start

        block_words.append(text)

    # Flush the final block
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
        result = _segments_to_timestamped_text(segments)
        return result

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
            all_transcripts = list(ytt.list(video_id))  # list() avoids iterator exhaustion
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
        raise  # re-raise our own 4xx/5xx untouched
    except Exception as e:
        err = str(e).lower()
        if any(k in err for k in ("no transcript", "disabled", "unavailable", "could not retrieve")):
            raise HTTPException(
                status_code=422,
                detail="No transcript available for this video.",
            )
        raise HTTPException(status_code=500, detail=f"Transcript fetch failed: {e}")


# ─── Request / Response models ────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    text: Optional[str] = None
    youtube_url: Optional[str] = None
    language: str = "en"      # "en" | "es"
    max_claims: int = 5       # 3 = light, 5 = standard, 7 = deep


class TranscriptRequest(BaseModel):
    youtube_url: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check — also confirms the server is up."""
    return {
        "status": "ok",
        "message": "Rebuttal Your Church API is running",
        "api_key_configured": bool(_api_key) and not _api_key.startswith("PLACEHOLDER"),
    }


@app.post("/api/transcript")
def get_transcript(request: TranscriptRequest):
    """
    Extract the transcript from a YouTube video.
    Returns { transcript, video_id, char_count }.
    No API key required — uses youtube-transcript-api.
    """
    video_id = extract_youtube_id(request.youtube_url)
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


@app.post("/api/analyze")
def analyze_sermon(request: AnalyzeRequest):
    """
    Send a sermon transcript to Claude and return a structured analysis.
    Accepts either { text } or { youtube_url }, plus an optional { language }.
    """

    # Normalise language
    lang = request.language if request.language in ("en", "es") else "en"

    # ── Determine sermon text ────────────────────────────────────────────────
    youtube_video_id: Optional[str] = None

    if request.youtube_url:
        youtube_video_id = extract_youtube_id(request.youtube_url)
        if not youtube_video_id:
            raise HTTPException(status_code=400, detail="Could not find a YouTube video ID in that URL.")

        # Timestamped transcript so Claude can cite exact locations
        sermon_text = _fetch_transcript(youtube_video_id)

    elif request.text:
        sermon_text = request.text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'text' or 'youtube_url' in the request body.",
        )

    if not sermon_text:
        raise HTTPException(status_code=400, detail="Empty sermon text.")

    # ── Demo mode ────────────────────────────────────────────────────────────
    if client is None or _api_key.startswith("PLACEHOLDER"):
        import copy
        result = copy.deepcopy(MOCK_ANALYSIS_ES if lang == "es" else MOCK_ANALYSIS_EN)
        result["videoId"] = youtube_video_id
        # Respect max_claims in demo mode too
        mc = max(3, min(7, request.max_claims))
        result["claims"] = result["claims"][:mc]
        result = _enrich_with_bible(result, lang)
        return result

    # ── Real Claude analysis ─────────────────────────────────────────────────
    text = sermon_text[:10000]   # ~10k chars ≈ 30–40 min sermon
    max_claims = max(3, min(7, request.max_claims))  # clamp to 3–7
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
        analysis = _enrich_with_bible(analysis, lang)
        return analysis

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Could not parse analysis as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ─── Lexicon routes ────────────────────────────────────────────────────────────

@app.get("/api/lexicon/books")
def lexicon_books():
    """Return the list of all 66 Bible books with chapter counts."""
    return {
        "books": _lex.book_info(),
        "hasStrongs": _lex.has_strongs_data(),
        "hasMhc":     _lex.has_mhc_data(),
    }


@app.get("/api/lexicon/chapter")
def lexicon_chapter(book: int, chapter: int):
    """
    Return KJV text for a book+chapter with per-word Strong's tagging.
    book = 1-66 (1=Genesis, 40=Matthew, etc.)
    """
    if book < 1 or book > 66:
        raise HTTPException(status_code=400, detail="book must be 1–66")

    # Ensure KJV local cache is loaded (uses _LOCAL_BIBLE_CACHE from main.py)
    kjv_data = _load_local_bible("kjv.json") or {}

    verses = _lex.get_chapter(book, chapter, kjv_data)

    book_meta = _lex.BOOK_BY_NUMBER.get(book, {})
    return {
        "book":     book,
        "bookName": book_meta.get("name", ""),
        "chapter":  chapter,
        "testament": book_meta.get("testament", ""),
        "verses":   verses,
        "hasStrongs": any(v["hasStrongs"] for v in verses),
    }


@app.get("/api/lexicon/strongs/{number}")
def lexicon_strongs(number: str):
    """Look up a Strong's Concordance entry. number = H430 or G2316."""
    entry = _lex.get_strongs_entry(number)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Strong's entry '{number}' not found")
    return entry


@app.get("/api/lexicon/search")
def lexicon_search(q: str, lang: Optional[str] = None, limit: int = 20):
    """
    Search Strong's dictionary.
    lang = 'H' (Hebrew/Aramaic) or 'G' (Greek) or omit for both.
    """
    results = _lex.search_strongs(q, lang=lang, limit=min(limit, 50))
    return {"query": q, "results": results, "count": len(results)}


@app.get("/api/commentary/chapter")
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


@app.get("/api/commentary/verse")
def commentary_verse(book: int, chapter: int, verse: int = 0):
    """
    Return Matthew Henry Commentary for a specific verse.
    verse=0 returns the chapter introduction/overview.
    """
    text = _lex.get_commentary(book, chapter, verse)
    if text is None:
        raise HTTPException(status_code=404, detail="Commentary not available for this passage")
    return {"book": book, "chapter": chapter, "verse": verse, "text": text}
