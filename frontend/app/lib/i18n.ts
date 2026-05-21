// ─── Translations ─────────────────────────────────────────────────────────────
// Add new keys here. All keys must exist in both `en` and `es`.

export type Lang = "en" | "es";

const translations = {
  en: {
    // Nav
    nav_scripture:     "Scripture",
    nav_learn:         "Learn",
    nav_free_books:    "Free Books",
    nav_family:        "Family Worship",
    nav_tracker:       "Bible Tracker",
    nav_plans:         "Plans",
    nav_notes:         "Notes",
    nav_kids:          "Kids",

    // Nav titles (tooltip)
    title_scripture:   "Scripture Explorer",
    title_learn:       "Theological Library",
    title_free_books:  "Free Books",
    title_family:      "Family Worship",
    title_tracker:     "Bible Reading Tracker",
    title_plans:       "Bible Reading Plans",
    title_notes:       "Study Notes",
    title_kids:        "Kids Books",

    // Library page
    lib_badge:         "Classic Christian Books",
    lib_heading:       "Free Christian Library",
    lib_sub:           "Read the great works of historic Christianity — free, no account needed.",
    lib_continue:      "Continue Reading",
    lib_available:     "Available Now",
    lib_coming_soon:   "Coming Soon",
    lib_read:          "Read",
    lib_chapter:       "Chapter",
    lib_of:            "of",

    // Learn page
    learn_badge:       "Theological Library",
    learn_heading:     "Study the Historic Faith",
    learn_sub:         "Work through the great confessions, catechisms, and documents of biblical Christianity. Track your progress section by section.",
    learn_continue:    "Continue Studying",
    learn_sections:    "sections",
    learn_complete:    "Complete ✓",
    learn_footer:      "All documents are public domain. Progress is saved locally in your browser.",
    learn_of:          "of",
    learn_sections_read: "sections read",

    // Family Worship page
    family_badge:      "Daily Devotional",
    family_heading:    "Family Worship",
    family_sub:        "A daily guide for family worship rooted in Scripture and the Reformed tradition.",

    // Bible Tracker
    tracker_heading:   "Bible Reading Tracker",
    tracker_sub:       "Track your way through the whole Bible.",

    // Common
    back:              "Back",
    previous:          "Previous",
    next:              "Next",
    finish:            "Finish ✓",
    mark_read:         "Mark as read",
    completed:         "Completed",
    reset_progress:    "Reset progress",
    loading:           "Loading…",
    error:             "Something went wrong.",
  },

  es: {
    // Nav
    nav_scripture:     "Escritura",
    nav_learn:         "Aprender",
    nav_free_books:    "Libros Gratis",
    nav_family:        "Familia Worship",
    nav_tracker:       "Biblia Tracker",
    nav_plans:         "Planes",
    nav_notes:         "Notas",
    nav_kids:          "Niños",

    // Nav titles (tooltip)
    title_scripture:   "Explorador de Escrituras",
    title_learn:       "Biblioteca Teológica",
    title_free_books:  "Libros Gratis",
    title_family:      "Adoración Familiar",
    title_tracker:     "Seguimiento de Lectura Bíblica",
    title_plans:       "Planes de Lectura Bíblica",
    title_notes:       "Notas de Estudio",
    title_kids:        "Libros para Niños",

    // Library page
    lib_badge:         "Libros Clásicos Cristianos",
    lib_heading:       "Biblioteca Cristiana Gratuita",
    lib_sub:           "Lee las grandes obras del cristianismo histórico — gratis, sin cuenta necesaria.",
    lib_continue:      "Continuar Leyendo",
    lib_available:     "Disponible Ahora",
    lib_coming_soon:   "Próximamente",
    lib_read:          "Leer",
    lib_chapter:       "Capítulo",
    lib_of:            "de",

    // Learn page
    learn_badge:       "Biblioteca Teológica",
    learn_heading:     "Estudia la Fe Histórica",
    learn_sub:         "Estudia las grandes confesiones, catecismos y documentos del cristianismo bíblico. Sigue tu progreso sección por sección.",
    learn_continue:    "Continuar Estudiando",
    learn_sections:    "secciones",
    learn_complete:    "Completo ✓",
    learn_footer:      "Todos los documentos son de dominio público. El progreso se guarda localmente en tu navegador.",
    learn_of:          "de",
    learn_sections_read: "secciones leídas",

    // Family Worship page
    family_badge:      "Devocional Diario",
    family_heading:    "Adoración Familiar",
    family_sub:        "Una guía diaria para la adoración familiar arraigada en la Escritura y la tradición reformada.",

    // Bible Tracker
    tracker_heading:   "Seguimiento de Lectura Bíblica",
    tracker_sub:       "Sigue tu lectura a través de toda la Biblia.",

    // Common
    back:              "Volver",
    previous:          "Anterior",
    next:              "Siguiente",
    finish:            "Finalizar ✓",
    mark_read:         "Marcar como leído",
    completed:         "Completado",
    reset_progress:    "Restablecer progreso",
    loading:           "Cargando…",
    error:             "Algo salió mal.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// ─── Storage key ──────────────────────────────────────────────────────────────

const LANG_KEY = "axiom_lang";

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem(LANG_KEY) as Lang) ?? "en";
}

export function setStoredLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new CustomEvent("axiom-lang-change", { detail: lang }));
}

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
