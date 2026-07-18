import type { ClaimVerdict, Lang, OverallVerdict } from "./types";

// ─── Translation shape ────────────────────────────────────────────────────────

export interface T {
  langToggleLabel: string;
  badge: string;
  taglinePre: string;
  taglineHighlight: string;
  taglineSuffix: string;
  stats: { label: string; value: string }[];
  tabText: string;
  tabYoutube: string;
  sermonLabel: string;
  loadExample: string;
  textareaPlaceholder: string;
  charsMin: (n: number, min: number) => string;
  charsReady: (n: number) => string;
  charsToGo: (n: number) => string;
  youtubeLabel: string;
  youtubePlaceholder: string;
  youtubeHelperMain: string;
  youtubeHelperFormats: string;
  youtubeInvalidHint: string;
  youtubeCaptionsNote: string;
  analyzeBtn: string;
  fetchAnalyzeBtn: string;
  analyzingBtn: string;
  fetchingTranscript: string;
  analyzingSermon: string;
  fetchingSubtitle: string;
  analyzingSubtitle: string;
  errorTitle: string;
  noTranscriptHelp: string;
  backendError: string;
  overallVerdictLabel: string;
  summaryLabel: string;
  claimsHeader: (n: number) => string;
  scriptureLabel: string;
  historicFaithLabel: string;
  theologianNoteLabel: string;
  redFlagsHeader: string;
  recommendationsHeader: string;
  resetBtn: string;
  footerDisclaimer: string;
  footerFramework: string;
  footerBuilt: string;
  demoTitle: string;
  demoBody: string;
  demoLink: string;
  apiSetupTitle: string;
  apiSetupStep1: string;
  apiSetupStep2: string;
  apiSetupStep3: string;
  apiSetupCta: string;
  keyboardHint: string;
  bibleVersesLabel: string;
  depthLabel: string;
  depth3: string;
  depth5: string;
  depth7: string;
  historyTitle: string;
  historyEmpty: string;
  historyDelete: string;
  exportPdf: string;
  preacherLabel: string;
  preacherPlaceholder: string;
  preacherSave: string;
  shareBtn: string;
  shareCopied: string;
  sharedBadge: string;
  translationLabel: string;
  translationKjv: string;
  translationEsv: string;
  translationGeneva: string;
  historyTab: string;
  preachersTab: string;
  preachersEmpty: string;
  sermonCount: (n: number) => string;
  worstVerdict: string;
  stillAnalyzing: string;
  verdictLabels: Record<ClaimVerdict, string>;
  overallLabels: Record<OverallVerdict, string>;
}

// ─── Translation data ─────────────────────────────────────────────────────────

export const TRANSLATIONS: Record<Lang, T> = {
  en: {
    langToggleLabel: "ES",
    badge: "Theological Discernment Tool",
    taglinePre: "Analyze sermons against",
    taglineHighlight: "historic biblical Christianity",
    taglineSuffix:
      ". Test every teaching against Scripture, the creeds, and the confessions.",
    stats: [
      { label: "Essentials tested", value: "8" },
      { label: "Historic confessions", value: "6+" },
      { label: "Verdict categories", value: "4" },
    ],
    tabText: "Paste Text",
    tabYoutube: "YouTube Link",
    sermonLabel: "Sermon Text",
    loadExample: "Load example →",
    textareaPlaceholder:
      "Paste the sermon transcript, teaching notes, or any Christian content here…",
    charsMin: (n, min) => `${n} / ${min} chars minimum`,
    charsReady: (n) => `${n.toLocaleString()} chars `,
    charsToGo: (n) => `${n} more to go`,
    youtubeLabel: "YouTube Sermon URL",
    youtubePlaceholder: "https://www.youtube.com/watch?v=…",
    youtubeHelperMain:
      "Paste any YouTube sermon URL. The transcript will be extracted automatically — no API key needed.",
    youtubeHelperFormats:
      "Supported: youtube.com/watch?v=…, youtu.be/…, /shorts/…",
    youtubeInvalidHint:
      "That doesn't look like a valid YouTube URL yet. Make sure it includes a video ID.",
    youtubeCaptionsNote:
      "Requires the video to have captions / auto-generated subtitles enabled",
    analyzeBtn: "Analyze Sermon",
    fetchAnalyzeBtn: "Fetch & Analyze Sermon",
    analyzingBtn: "Analyzing…",
    fetchingTranscript: "Fetching transcript from YouTube…",
    analyzingSermon: "Analyzing sermon…",
    fetchingSubtitle: "Extracting captions from the video",
    analyzingSubtitle: "Comparing against Scripture, creeds, and confessions",
    errorTitle: "Error",
    noTranscriptHelp:
      "This video has no accessible captions. Try: (1) a different sermon video, (2) paste the transcript text manually, or (3) check that the video has CC/subtitles enabled on YouTube.",
    backendError:
      "Cannot reach the backend server. Please try again in a moment.",
    overallVerdictLabel: "Overall Verdict",
    summaryLabel: "Summary",
    claimsHeader: (n) => `Individual Claims — ${n} examined`,
    scriptureLabel: "Scripture",
    historicFaithLabel: "Historic Faith",
    theologianNoteLabel: "Theologian Note",
    redFlagsHeader: "Warning: Red Flags",
    recommendationsHeader: "→ Recommended Resources",
    resetBtn: "← Analyze Another Sermon",
    footerDisclaimer:
      "AI-assisted analysis is a tool, not a substitute for prayerful study, your local church, or godly counsel.",
    footerFramework:
      "Framework: reformed-evangelical — Scripture-first, ecumenical creeds, Reformation confessions.",
    footerBuilt: "Built with Next.js + FastAPI + Claude.",
    demoTitle: "Demo Mode Active",
    demoBody:
      "Results below are sample data. Add a free Anthropic API key to get real AI-powered theological analysis.",
    demoLink: "Get your free API key →",
    apiSetupTitle: "Enable Real Analysis",
    apiSetupStep1: "Sign up at console.anthropic.com (free $5 credit)",
    apiSetupStep2: 'Create an API key under "API Keys"',
    apiSetupStep3:
      "Add ANTHROPIC_API_KEY=sk-ant-… to backend/.env, then restart",
    apiSetupCta: "Open console.anthropic.com",
    keyboardHint: "Press ⌘ Enter to analyze",
    bibleVersesLabel: "Scripture (KJV · ESV · Geneva)",
    depthLabel: "Analysis depth",
    depth3: "Light (3 claims)",
    depth5: "Standard (5 claims)",
    depth7: "Deep (7 claims)",
    historyTitle: "Analysis History",
    historyEmpty: "No saved analyses yet.",
    historyDelete: "Delete",
    exportPdf: "Export PDF",
    preacherLabel: "Tag this preacher",
    preacherPlaceholder: "e.g. John Smith",
    preacherSave: "Save tag",
    shareBtn: "Share",
    shareCopied: "Link copied!",
    sharedBadge: "Shared Analysis",
    translationLabel: "Bible translation",
    translationKjv: "KJV",
    translationEsv: "ESV",
    translationGeneva: "Geneva 1599",
    historyTab: "History",
    preachersTab: "Preachers",
    preachersEmpty: "No preachers tracked yet.",
    sermonCount: (n: number) => `${n} sermon${n === 1 ? "" : "s"}`,
    worstVerdict: "Worst verdict",
    stillAnalyzing: "Still analyzing…",
    verdictLabels: {
      ALIGNED: "Aligned",
      SECONDARY_DIFFERENCE: "Secondary",
      CAUTION: "Caution",
      CONTRADICTS_FUNDAMENTAL: "Contradicts Scripture",
    },
    overallLabels: {
      SOUND: "Sound Teaching",
      MIXED: "Mixed",
      SERIOUS_CONCERNS: "Serious Concerns",
      FALSE_TEACHING: "False Teaching",
    },
  },

  es: {
    langToggleLabel: "EN",
    badge: "Herramienta de Discernimiento Teológico",
    taglinePre: "Analiza sermones contra",
    taglineHighlight: "el cristianismo bíblico histórico",
    taglineSuffix:
      ". Examina cada enseñanza con las Escrituras, los credos y las confesiones.",
    stats: [
      { label: "Esenciales probados", value: "8" },
      { label: "Confesiones históricas", value: "6+" },
      { label: "Categorías de veredicto", value: "4" },
    ],
    tabText: "Pegar Texto",
    tabYoutube: "YouTube Link",
    sermonLabel: "Texto del Sermón",
    loadExample: "Cargar ejemplo →",
    textareaPlaceholder:
      "Pega aquí la transcripción del sermón, notas de enseñanza o cualquier contenido cristiano…",
    charsMin: (n, min) => `${n} / ${min} caracteres mínimo`,
    charsReady: (n) => `${n.toLocaleString()} caracteres `,
    charsToGo: (n) => `${n} más necesarios`,
    youtubeLabel: "URL del Sermón en YouTube",
    youtubePlaceholder: "https://www.youtube.com/watch?v=…",
    youtubeHelperMain:
      "Pega cualquier URL de sermón de YouTube. La transcripción se extraerá automáticamente — sin clave API.",
    youtubeHelperFormats:
      "Compatible: youtube.com/watch?v=…, youtu.be/…, /shorts/…",
    youtubeInvalidHint:
      "Esa no parece una URL de YouTube válida. Asegúrate de que incluya un ID de video.",
    youtubeCaptionsNote:
      "Requiere que el video tenga subtítulos / subtítulos automáticos habilitados",
    analyzeBtn: "Analizar Sermón",
    fetchAnalyzeBtn: "Obtener y Analizar Sermón",
    analyzingBtn: "Analizando…",
    fetchingTranscript: "Obteniendo transcripción de YouTube…",
    analyzingSermon: "Analizando sermón…",
    fetchingSubtitle: "Extrayendo subtítulos del video",
    analyzingSubtitle: "Comparando con las Escrituras, credos y confesiones",
    errorTitle: "Error",
    noTranscriptHelp:
      "Este video no tiene subtítulos accesibles. Prueba: (1) un video de sermón diferente, (2) pega el texto manualmente, o (3) verifica que el video tenga CC/subtítulos habilitados en YouTube.",
    backendError:
      "No se puede conectar con el servidor. Por favor intenta de nuevo en un momento.",
    overallVerdictLabel: "Veredicto General",
    summaryLabel: "Resumen",
    claimsHeader: (n) => `Afirmaciones Analizadas — ${n} examinadas`,
    scriptureLabel: "Escritura",
    historicFaithLabel: "Fe Histórica",
    theologianNoteLabel: "Nota del Teólogo",
    redFlagsHeader: "Warning: Señales de Alerta",
    recommendationsHeader: "→ Recursos Recomendados",
    resetBtn: "← Analizar Otro Sermón",
    footerDisclaimer:
      "El análisis asistido por IA es una herramienta, no un sustituto del estudio en oración, tu iglesia local o el consejo piadoso.",
    footerFramework:
      "Marco: evangélico-reformado — Escritura primero, credos ecuménicos, confesiones de la Reforma.",
    footerBuilt: "Construido con Next.js + FastAPI + Claude.",
    demoTitle: "Modo Demo Activo",
    demoBody:
      "Los resultados son datos de muestra. Agrega una clave API de Anthropic para obtener análisis teológico real con IA.",
    demoLink: "Obtener clave API gratis →",
    apiSetupTitle: "Activar Análisis Real",
    apiSetupStep1: "Regístrate en console.anthropic.com (crédito gratis de $5)",
    apiSetupStep2: 'Crea una clave API en "API Keys"',
    apiSetupStep3:
      "Agrega ANTHROPIC_API_KEY=sk-ant-… a backend/.env y reinicia",
    apiSetupCta: "Abrir console.anthropic.com",
    keyboardHint: "Presiona ⌘ Enter para analizar",
    bibleVersesLabel: "Escritura (RVR60 · LBLA)",
    depthLabel: "Profundidad del análisis",
    depth3: "Rápido (3 afirmaciones)",
    depth5: "Estándar (5 afirmaciones)",
    depth7: "Profundo (7 afirmaciones)",
    historyTitle: "Historial de Análisis",
    historyEmpty: "Aún no hay análisis guardados.",
    historyDelete: "Eliminar",
    exportPdf: "Exportar PDF",
    preacherLabel: "Etiquetar predicador",
    preacherPlaceholder: "ej. Juan García",
    preacherSave: "Guardar etiqueta",
    shareBtn: "Compartir",
    shareCopied: "¡Enlace copiado!",
    sharedBadge: "Análisis Compartido",
    translationLabel: "Traducción bíblica",
    translationKjv: "KJV",
    translationEsv: "ESV",
    translationGeneva: "Ginebra 1599",
    historyTab: "Historial",
    preachersTab: "Predicadores",
    preachersEmpty: "Aún no hay predicadores.",
    sermonCount: (n: number) => `${n} sermón${n === 1 ? "" : "es"}`,
    worstVerdict: "Peor veredicto",
    stillAnalyzing: "Aún analizando…",
    verdictLabels: {
      ALIGNED: "Alineado",
      SECONDARY_DIFFERENCE: "Secundario",
      CAUTION: "Precaución",
      CONTRADICTS_FUNDAMENTAL: "Contradice las Escrituras",
    },
    overallLabels: {
      SOUND: "Enseñanza Sólida",
      MIXED: "Mixto",
      SERIOUS_CONCERNS: "Preocupaciones Serias",
      FALSE_TEACHING: "Falsa Enseñanza",
    },
  },
};
