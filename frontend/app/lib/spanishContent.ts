import type { BookCatalogEntry, BookDetail } from "./types";
import type { BibleBook } from "./bibleBooks";
import type { BiblePlan } from "./biblePlansData";
import type { LearnDocument } from "./learnData";

export const BIBLE_BOOK_ES: Record<number, string> = {
  1: "Génesis", 2: "Éxodo", 3: "Levítico", 4: "Números", 5: "Deuteronomio",
  6: "Josué", 7: "Jueces", 8: "Rut", 9: "1 Samuel", 10: "2 Samuel",
  11: "1 Reyes", 12: "2 Reyes", 13: "1 Crónicas", 14: "2 Crónicas", 15: "Esdras",
  16: "Nehemías", 17: "Ester", 18: "Job", 19: "Salmos", 20: "Proverbios",
  21: "Eclesiastés", 22: "Cantares", 23: "Isaías", 24: "Jeremías", 25: "Lamentaciones",
  26: "Ezequiel", 27: "Daniel", 28: "Oseas", 29: "Joel", 30: "Amós",
  31: "Abdías", 32: "Jonás", 33: "Miqueas", 34: "Nahúm", 35: "Habacuc",
  36: "Sofonías", 37: "Hageo", 38: "Zacarías", 39: "Malaquías", 40: "Mateo",
  41: "Marcos", 42: "Lucas", 43: "Juan", 44: "Hechos", 45: "Romanos",
  46: "1 Corintios", 47: "2 Corintios", 48: "Gálatas", 49: "Efesios", 50: "Filipenses",
  51: "Colosenses", 52: "1 Tesalonicenses", 53: "2 Tesalonicenses", 54: "1 Timoteo",
  55: "2 Timoteo", 56: "Tito", 57: "Filemón", 58: "Hebreos", 59: "Santiago",
  60: "1 Pedro", 61: "2 Pedro", 62: "1 Juan", 63: "2 Juan", 64: "3 Juan",
  65: "Judas", 66: "Apocalipsis",
};

export const BIBLE_GROUP_ES: Record<string, string> = {
  Pentateuch: "Pentateuco",
  Historical: "Históricos",
  Poetic: "Poéticos",
  "Major Prophets": "Profetas Mayores",
  "Minor Prophets": "Profetas Menores",
  Gospels: "Evangelios",
  History: "Historia",
  "Pauline Epistles": "Cartas de Pablo",
  "General Epistles": "Cartas Generales",
  Prophecy: "Profecía",
};

export function bibleBookName(book: Pick<BibleBook, "num" | "name"> | null | undefined, lang: "en" | "es") {
  if (!book) return "";
  return lang === "es" ? BIBLE_BOOK_ES[book.num] ?? book.name : book.name;
}

export function localizeReference(ref: string, lang: "en" | "es") {
  if (lang !== "es") return ref;
  let next = ref;
  Object.entries(BIBLE_BOOK_ES)
    .sort((a, b) => {
      const an = EN_BOOK_BY_NUM[Number(a[0])]?.length ?? 0;
      const bn = EN_BOOK_BY_NUM[Number(b[0])]?.length ?? 0;
      return bn - an;
    })
    .forEach(([num, es]) => {
      const en = EN_BOOK_BY_NUM[Number(num)];
      if (en) next = next.replace(new RegExp(`\\b${escapeRegExp(en)}\\b`, "g"), es);
    });
  return next;
}

const EN_BOOK_BY_NUM: Record<number, string> = {
  1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
  6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
  11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
  16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
  21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah", 25: "Lamentations",
  26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel", 30: "Amos",
  31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum", 35: "Habakkuk",
  36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
  41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
  46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians", 49: "Ephesians", 50: "Philippians",
  51: "Colossians", 52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy",
  55: "2 Timothy", 56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James",
  60: "1 Peter", 61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John",
  65: "Jude", 66: "Revelation",
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PLAN_ES: Record<string, { name: string; description: string }> = {
  "year-canonical": {
    name: "Biblia en un Año",
    description: "Lee los 1,189 capítulos de la Biblia en orden canónico — de Génesis a Apocalipsis — en un año.",
  },
  chronological: {
    name: "Biblia Cronológica",
    description: "Lee la Biblia en un orden histórico aproximado, siguiendo la historia de la redención desde la creación hasta Apocalipsis.",
  },
  "nt-first": {
    name: "Nuevo Testamento Primero",
    description: "Comienza con el Nuevo Testamento y luego avanza por todo el Antiguo Testamento. Ideal para nuevos creyentes.",
  },
  "nt-90": {
    name: "Nuevo Testamento en 90 Días",
    description: "Lee los 27 libros del Nuevo Testamento en 90 días, aproximadamente tres capítulos por día.",
  },
  "psalms-proverbs": {
    name: "Salmos y Proverbios",
    description: "Un recorrido de seis meses por el himnario de Israel y su literatura de sabiduría.",
  },
};

export function planName(plan: BiblePlan, lang: "en" | "es") {
  return lang === "es" ? PLAN_ES[plan.id]?.name ?? plan.name : plan.name;
}

export function planDescription(plan: BiblePlan, lang: "en" | "es") {
  return lang === "es" ? PLAN_ES[plan.id]?.description ?? plan.description : plan.description;
}

const BOOK_ES: Record<string, { title: string; description?: string }> = {
  "pilgrims-progress": { title: "El Progreso del Peregrino" },
  "grace-abounding": { title: "Gracia Abundante para el Principal de los Pecadores" },
  "confessions-augustine": { title: "Confesiones" },
  "imitation-of-christ": { title: "La Imitación de Cristo" },
  "institutes-of-religion": { title: "Institución de la Religión Cristiana" },
  "holiness-ryle": { title: "Santidad" },
  "morning-evening-spurgeon": { title: "Mañana y Noche" },
  "sinners-in-hands-edwards": { title: "Pecadores en Manos de un Dios Airado" },
  "mortification-of-sin": { title: "La Mortificación del Pecado" },
  "bondage-of-the-will": { title: "La Esclavitud de la Voluntad" },
  "religious-affections": { title: "Afectos Religiosos" },
  "death-of-death": { title: "La Muerte de la Muerte en la Muerte de Cristo" },
  "body-of-divinity": { title: "Cuerpo de Divinidad" },
  "freedom-of-the-will": { title: "La Libertad de la Voluntad" },
  "commentary-on-romans-hodge": { title: "Comentario sobre Romanos" },
  "fourfold-state": { title: "La Naturaleza Humana en su Cuádruple Estado" },
  "practical-religion": { title: "Religión Práctica" },
  "knots-untied": { title: "Nudos Desatados" },
  "thoughts-for-young-men": { title: "Pensamientos para Hombres Jóvenes" },
  "duties-of-parents": { title: "Los Deberes de los Padres" },
};

export function bookTitle(book: Pick<BookCatalogEntry | BookDetail, "slug" | "title">, lang: "en" | "es") {
  return lang === "es" ? BOOK_ES[book.slug]?.title ?? book.title : book.title;
}

const BOOK_SECTION_ES: Record<string, Record<string, string>> = {
  "mortification-of-sin": {
    "Preface": "Prefacio",
    "Introduction": "Introducción",
    "The Mortification of Sin": "La Mortificación del Pecado",
  },
  "bondage-of-the-will": {
    "Introduction": "Introducción",
    "Preface": "Prefacio",
    "The Bondage of the Will": "La Esclavitud de la Voluntad",
  },
  "religious-affections": {
    "Preface": "Prefacio",
    "Introduction": "Introducción",
    "Part I": "Parte I",
    "Part II": "Parte II",
    "Part III": "Parte III",
    "Concerning The Nature Of The Affections And Their Importance In -- Part 1": "Sobre la Naturaleza de los Afectos y su Importancia — Parte 1",
    "Concerning The Nature Of The Affections And Their Importance In -- Part 2": "Sobre la Naturaleza de los Afectos y su Importancia — Parte 2",
    "II. The second thing proposed, which was to observe some things that -- Part 1": "II. Segunda Propuesta: Observar Algunas Cosas — Parte 1",
    "II. The second thing proposed, which was to observe some things that -- Part 2": "II. Segunda Propuesta: Observar Algunas Cosas — Parte 2",
    "II. The second thing proposed, which was to observe some things that -- Part 3": "II. Segunda Propuesta: Observar Algunas Cosas — Parte 3",
    "II. The second thing proposed, which was to observe some things that -- Part 4": "II. Segunda Propuesta: Observar Algunas Cosas — Parte 4",
    "II. The second thing proposed, which was to observe some things that -- Part 5": "II. Segunda Propuesta: Observar Algunas Cosas — Parte 5",
    "II. The second thing proposed, which was to observe some things that -- Part 6": "II. Segunda Propuesta: Observar Algunas Cosas — Parte 6",
    "Showing What Are No Certain Signs That Religious Affections Are": "Señales que No Prueban con Certeza que los Afectos Religiosos Sean Verdaderos",
  },
  "commentary-on-romans-hodge": {
    "Introduction": "Introducción",
    "Preface": "Prefacio",
  },
  "practical-religion": {
    "Introduction": "Introducción",
    "Preface": "Prefacio",
  },
  "knots-untied": {
    "Preface": "Prefacio",
    "Introduction": "Introducción",
  },
  "thoughts-for-young-men": {
    "Introduction": "Introducción",
    "Thoughts for Young Men": "Pensamientos para Hombres Jóvenes",
  },
  "duties-of-parents": {
    "Introduction": "Introducción",
    "The Duties of Parents": "Los Deberes de los Padres",
  },
};

function partSuffix(title: string) {
  const match = title.match(/\s--\sPart\s+(\d+)$/i);
  return match ? ` — Parte ${match[1]}` : "";
}

function cleanPartSuffix(title: string) {
  return title.replace(/\s--\sPart\s+\d+$/i, "").trim();
}

function religiousAffectionsTitle(title: string) {
  const suffix = partSuffix(title);
  const base = cleanPartSuffix(title);

  if (/^Concerning The Nature Of The Affections/i.test(base)) {
    return `Sobre la Naturaleza de los Afectos y su Importancia${suffix}`;
  }
  if (/^II\. The second thing proposed/i.test(base)) {
    return `II. Segunda Propuesta: Observar Algunas Cosas${suffix}`;
  }
  if (/^Showing What Are No Certain Signs/i.test(base)) {
    return "Señales que No Prueban con Certeza que los Afectos Religiosos Sean Verdaderos";
  }
  if (/^I\. It is no sign one way or the other/i.test(base)) {
    return "I. No es una Señal Decisiva, en un Sentido u Otro, que los Afectos Religiosos Sean Verdaderos";
  }
  if (/^II\. It is no sign that affections have the nature of true religion/i.test(base)) {
    return "II. No es Señal de que los Afectos Tengan la Naturaleza de la Verdadera Religión";
  }
  if (/^III\. It is no sign that affections are truly gracious/i.test(base)) {
    return "III. No es Señal de que los Afectos Sean Verdaderamente de Gracia";
  }
  if (/^IV\. It is no sign that affections are gracious/i.test(base)) {
    return "IV. No es Señal de que los Afectos Sean de Gracia";
  }
  if (/^V\. It is no sign that religious affections are truly holy/i.test(base)) {
    return "V. No es Señal de que los Afectos Religiosos Sean Verdaderamente Santos";
  }
  if (/^VI\. It is no evidence that religious affections are saving/i.test(base)) {
    return "VI. No es Evidencia de que los Afectos Religiosos Sean Salvadores";
  }
  if (/^VII\. Persons having religious affections/i.test(base)) {
    return "VII. Personas con Muchos Tipos de Afectos Religiosos";
  }
  if (/^VIII\. Nothing can certainly be determined/i.test(base)) {
    return `VIII. Nada Puede Determinarse con Certeza sobre la Naturaleza de los Afectos${suffix}`;
  }
  if (/^IX\. It is no certain sign/i.test(base)) {
    return "IX. No es Señal Cierta que los Afectos Religiosos de una Persona Sean Verdaderos";
  }
  if (/^X\. Nothing can be certainly known/i.test(base)) {
    return "X. Nada Puede Saberse con Certeza de la Naturaleza de los Afectos Religiosos";
  }
  if (/^XI\. It is no sign that affections are right/i.test(base)) {
    return `XI. No es Señal de que los Afectos Sean Correctos o Incorrectos${suffix}`;
  }
  if (/^XII\. Nothing can be certainly concluded/i.test(base)) {
    return `XII. Nada Puede Concluirse con Certeza sobre la Naturaleza de los Afectos${suffix}`;
  }
  if (/^Showing What Are Distinguishing Signs/i.test(base)) {
    return "Señales Distintivas de los Afectos Verdaderamente Santos y de Gracia";
  }
  if (/^I\. Affections that are truly spiritual and gracious/i.test(base)) {
    return `I. Los Afectos Verdaderamente Espirituales y de Gracia Nacen de una Fuente Espiritual${suffix}`;
  }
  if (/^II\. The first objective ground of gracious affections/i.test(base)) {
    return `II. El Primer Fundamento Objetivo de los Afectos de Gracia${suffix}`;
  }
  if (/^III\. Those affections that are truly holy/i.test(base)) {
    return `III. Los Afectos Verdaderamente Santos se Fundan Principalmente en la Belleza Divina${suffix}`;
  }
  if (/^IV\. Gracious affections do arise from the mind's being enlightened/i.test(base)) {
    return `IV. Los Afectos de Gracia Nacen de una Mente Iluminada${suffix}`;
  }
  if (/^V\. Truly gracious affections are attended with a reasonable/i.test(base)) {
    return `V. Los Afectos Verdaderamente de Gracia Vienen con una Convicción Razonable${suffix}`;
  }
  if (/^VI\. Gracious affections are attended with evangelical humiliation/i.test(base)) {
    return `VI. Los Afectos de Gracia Vienen con Humillación Evangélica${suffix}`;
  }
  if (/^VII\. Another thing, wherein gracious affections are distinguished/i.test(base)) {
    return "VII. Otra Señal que Distingue los Afectos de Gracia";
  }
  if (/^VIII\. Truly gracious affections differ from those affections/i.test(base)) {
    return `VIII. Los Afectos Verdaderamente de Gracia Difieren de los Afectos Falsos${suffix}`;
  }
  if (/^IX\. Gracious affections soften the heart/i.test(base)) {
    return `IX. Los Afectos de Gracia Ablandan el Corazón${suffix}`;
  }
  if (/^X\. Another thing wherein those affections/i.test(base)) {
    return `X. Otra Señal de los Afectos Verdaderamente de Gracia${suffix}`;
  }
  if (/^XI\. Another great and very distinguishing difference/i.test(base)) {
    return `XI. Otra Gran Diferencia Distintiva de los Afectos de Gracia${suffix}`;
  }
  if (/^XII\. Gracious and holy affections have their exercise and fruit/i.test(base)) {
    return `XII. Los Afectos Santos y de Gracia se Ejercitan y Dan Fruto en la Práctica Cristiana${suffix}`;
  }
  if (/^III\. Chap\. vii\./i.test(base)) return "III. Capítulo VII";
  if (/^Part I\. p\./i.test(base)) return base.replace(/^Part/i, "Parte");
  return null;
}

const TITLE_PHRASE_ES: Array<[RegExp, string]> = [
  [/\bIntroduction\b/gi, "Introducción"],
  [/\bPreface\b/gi, "Prefacio"],
  [/\bConclusion\b/gi, "Conclusión"],
  [/\bChapter\b/gi, "Capítulo"],
  [/\bSection\b/gi, "Sección"],
  [/\bPart\b/gi, "Parte"],
  [/\bBook\b/gi, "Libro"],
  [/\bArticle\b/gi, "Artículo"],
  [/\bQuestion\b/gi, "Pregunta"],
  [/\bAnswer\b/gi, "Respuesta"],
  [/\bCanon\b/gi, "Canon"],
  [/\bHead\b/gi, "Punto"],
  [/\bSermon\b/gi, "Sermón"],
  [/\bLetter\b/gi, "Carta"],
  [/\bPsalm\b/gi, "Salmo"],
  [/\bRomans\b/g, "Romanos"],
  [/\bGenesis\b/g, "Génesis"],
  [/\bJohn\b/g, "Juan"],
  [/\bMatthew\b/g, "Mateo"],
  [/\bMark\b/g, "Marcos"],
  [/\bLuke\b/g, "Lucas"],
  [/\bActs\b/g, "Hechos"],
  [/\bGalatians\b/g, "Gálatas"],
  [/\bEphesians\b/g, "Efesios"],
  [/\bFaith\b/gi, "Fe"],
  [/\bGrace\b/gi, "Gracia"],
  [/\bSin\b/gi, "Pecado"],
  [/\bDeath\b/gi, "Muerte"],
  [/\bChrist\b/g, "Cristo"],
  [/\bGod\b/g, "Dios"],
  [/\bWill\b/gi, "Voluntad"],
  [/\bPrayer\b/gi, "Oración"],
  [/\bBaptism\b/gi, "Bautismo"],
  [/\bChurch\b/gi, "Iglesia"],
  [/\bScripture\b/gi, "Escritura"],
  [/\bConfession\b/gi, "Confesión"],
  [/\bCreed\b/gi, "Credo"],
  [/\bCouncil\b/gi, "Concilio"],
  [/\bLord\b/g, "Señor"],
  [/\bJesus\b/g, "Jesús"],
  [/\bHoly Spirit\b/g, "Espíritu Santo"],
  [/\bHoly\b/g, "Santo"],
  [/\bMan\b/gi, "Hombre"],
  [/\bParents\b/gi, "Padres"],
  [/\bChildren\b/gi, "Hijos"],
  [/\bYoung Men\b/gi, "Hombres Jóvenes"],
  [/\bThe Gospel\b/gi, "El Evangelio"],
  [/\bThe Law\b/gi, "La Ley"],
  [/\bThe Word\b/gi, "La Palabra"],
  [/\bThe Flesh\b/gi, "La Carne"],
  [/\bThe World\b/gi, "El Mundo"],
  [/\bThe Church\b/gi, "La Iglesia"],
  [/\bThe Covenant\b/gi, "El Pacto"],
  [/\bof the\b/gi, "de"],
  [/\bof\b/gi, "de"],
  [/\band\b/gi, "y"],
  [/\bin\b/gi, "en"],
  [/\bon\b/gi, "sobre"],
  [/\bto\b/gi, "a"],
];

export function bookSectionTitle(slug: string, title: string, lang: "en" | "es") {
  if (lang !== "es") return title;
  const trimmed = title.trim();
  const exact = BOOK_SECTION_ES[slug]?.[trimmed];
  if (exact) return exact;
  if (slug === "religious-affections") {
    const special = religiousAffectionsTitle(trimmed);
    if (special) return special;
  }

  let next = localizeReference(trimmed, "es");
  TITLE_PHRASE_ES.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement);
  });
  next = next
    .replace(/\s--\sParte\s+(\d+)$/i, " — Parte $1")
    .replace(/\bThe\b/g, "El")
    .replace(/\bthe\b/g, "el")
    .replace(/\bThat\b/g, "Que")
    .replace(/\bthat\b/g, "que")
    .replace(/\bTheir\b/g, "Su")
    .replace(/\btheir\b/g, "su")
    .replace(/\bNature\b/gi, "Naturaleza")
    .replace(/\bAffections\b/gi, "Afectos")
    .replace(/\bImportance\b/gi, "Importancia")
    .replace(/\bReligious\b/gi, "Religiosos")
    .replace(/\bCertain Signs\b/gi, "Señales Ciertas")
    .replace(/\bSigns\b/gi, "Señales")
    .replace(/\s+/g, " ")
    .trim();
  return next || trimmed;
}

export const DOC_TITLE_ES: Record<string, string> = {
  "jerusalem-council": "Concilio de Jerusalén",
  "apostles-creed": "Credo de los Apóstoles",
  "council-nicaea": "Concilio de Nicea",
  "nicene-creed": "Credo Niceno",
  "augustine-grace": "Agustín sobre la Gracia",
  "monergism-debate": "Monergismo vs. Sinergismo",
  "council-chalcedon": "Concilio de Calcedonia",
  wycliffe: "Wycliffe y la Biblia Inglesa",
  "jan-hus": "Martirio de Jan Hus",
  gutenberg: "Biblia de Gutenberg",
  "95theses": "Las 95 Tesis de Lutero",
  "diet-of-worms": "Dieta de Worms",
  tyndale: "Nuevo Testamento de Tyndale",
  "calvins-institutes": "Institución de Calvino",
  "geneva-bible": "Biblia de Ginebra",
  "belgic-confession": "Confesión Belga",
  heidelberg: "Catecismo de Heidelberg",
  "king-james-bible": "Biblia King James",
  "canons-of-dort": "Cánones de Dort",
  "first-london-baptist": "Primera Confesión Bautista de Londres",
  "westminster-confession": "Confesión de Fe de Westminster",
  "1689-lbc": "Confesión Bautista de Londres de 1689",
  "sinners-in-hands": "Pecadores en Manos de un Dios Airado",
};

export function documentTitle(doc: Pick<LearnDocument, "id" | "title">, lang: "en" | "es") {
  return lang === "es" ? DOC_TITLE_ES[doc.id] ?? doc.title : doc.title;
}

const DOC_SECTION_ES: Record<string, Record<string, string>> = {
  "apostles-creed": {
    "The Apostles' Creed": "El Credo de los Apóstoles",
    "Full Text": "Texto Completo",
    "Historic Context": "Contexto Histórico",
    "Theology": "Teología",
  },
  "nicene-creed": {
    "The Nicene Creed": "El Credo Niceno",
    "The Text": "El Texto",
    "The Arian Crisis": "La Crisis Arriana",
    "Key Terms": "Términos Clave",
    "Full Text": "Texto Completo",
    "Historic Context": "Contexto Histórico",
    "Theology": "Teología",
    "The Nicene-Constantinopolitan Creed (381 AD)": "El Credo Niceno-Constantinopolitano (381 d.C.)",
    "Why This Creed Was Necessary": "Por Qué Este Credo Fue Necesario",
    "Homoousios and the Filioque": "Homoousios y el Filioque",
  },
  "westminster-confession": {
    "Of the Holy Scripture": "De la Santa Escritura",
    "Of God, and of the Holy Trinity": "De Dios y de la Santa Trinidad",
  },
  "1689-lbc": {
    "Of the Holy Scriptures": "De las Santas Escrituras",
    "Of God and of the Holy Trinity": "De Dios y de la Santa Trinidad",
  },
};

export function documentSectionTitle(docId: string, title: string, lang: "en" | "es") {
  if (lang !== "es") return title;
  const trimmed = title.trim();
  const exact = DOC_SECTION_ES[docId]?.[trimmed];
  if (exact) return exact;

  let next = localizeReference(trimmed, "es");
  TITLE_PHRASE_ES.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement);
  });
  next = next.replace(/\bFull Text\b/gi, "Texto Completo")
    .replace(/\bHistoric Context\b/gi, "Contexto Histórico")
    .replace(/\bHistorical Context\b/gi, "Contexto Histórico")
    .replace(/\bStudy Notes\b/gi, "Notas de Estudio")
    .replace(/\bSummary\b/gi, "Resumen")
    .replace(/\bOverview\b/gi, "Resumen")
    .replace(/\bDoctrine\b/gi, "Doctrina")
    .replace(/\bTheology\b/gi, "Teología")
    .replace(/\bBackground\b/gi, "Trasfondo")
    .replace(/\bLegacy\b/gi, "Legado")
    .replace(/\s+/g, " ")
    .trim();
  return next || trimmed;
}
