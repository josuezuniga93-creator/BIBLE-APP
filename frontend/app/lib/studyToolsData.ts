import { BIBLE_BOOKS } from "./bibleBooks";
import type { CommentaryEntry } from "./types";

export type StudyLang = "en" | "es";

export interface CommentaryChapter {
  book: number;
  chapter: number;
  source: "Matthew Henry Concise";
  entries: CommentaryEntry[];
}

export interface CommentarySearchResult {
  book: number;
  bookName: string;
  chapter: number;
  requestedVerse?: number;
  matchedVerse: number;
  source: "Matthew Henry Complete Commentary" | "Matthew Henry Concise";
  text: string;
  title?: string;
  verses?: number[];
  sourceUrl?: string;
}

export interface MatthewHenrySection {
  verse: number;
  verses?: number[];
  title: string;
  text: string;
}

export interface MatthewHenryChapterFile {
  source: "Matthew Henry Complete Commentary";
  sourceUrl: string;
  book: number;
  bookName: string;
  chapter: number;
  sections: MatthewHenrySection[];
}

export interface MatthewHenryManifestBook {
  book: number;
  bookName: string;
  chapters: number;
}

export interface MatthewHenryManifest {
  source: string;
  sourceUrl?: string;
  rights?: string;
  books: MatthewHenryManifestBook[];
  totalChapters: number;
}

export interface OriginalLanguageNote {
  language: "Hebrew" | "Greek";
  lemma: string;
  transliteration: string;
  strongs: string;
  meaning: string;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  termEs: string;
  category: "Person" | "Place" | "Doctrine" | "Object" | "Book";
  definition: string;
  definitionEs: string;
  originalLanguages?: OriginalLanguageNote[];
  references: string[];
}

export const STUDY_TOOL_SOURCES = [
  {
    id: "matthew-henry-concise",
    title: "Matthew Henry Concise Commentary",
    titleEs: "Comentario Conciso de Matthew Henry",
    description:
      "A public-domain, devotional commentary organized by Bible book and chapter for fast phone reading.",
    descriptionEs:
      "Un comentario devocional de dominio publico organizado por libro y capitulo para lectura rapida en el telefono.",
  },
  {
    id: "bible-dictionary",
    title: "Bible Dictionary",
    titleEs: "Diccionario Biblico",
    description:
      "Short definitions of people, places, doctrines, and Bible terms with references.",
    descriptionEs:
      "Definiciones breves de personas, lugares, doctrinas y terminos biblicos con referencias.",
  },
] as const;

const COMMENTARY_CHAPTERS: CommentaryChapter[] = [
  {
    book: 1,
    chapter: 1,
    source: "Matthew Henry Concise",
    entries: [
      {
        verse: 1,
        text:
          "The first verse of the Bible gives us a sure and noble foundation: God created all things. The world did not arise by chance, nor from itself, but from the will and power of the eternal God.",
      },
      {
        verse: 3,
        text:
          "God said, 'Let there be light,' and there was light. His word is effectual. What He commands comes to pass, and this first light prepares us to understand every later mercy of God.",
      },
      {
        verse: 26,
        text:
          "Man is made in the image of God. This gives dignity to human life and calls every person to live under God's rule, reflecting His holiness, wisdom, and goodness.",
      },
    ],
  },
  {
    book: 19,
    chapter: 23,
    source: "Matthew Henry Concise",
    entries: [
      {
        verse: 1,
        text:
          "The Lord is the believer's Shepherd. If He is ours, we may conclude that we shall lack nothing truly good for us. This psalm teaches holy confidence, not in circumstances, but in God's care.",
      },
      {
        verse: 4,
        text:
          "The valley of the shadow of death is not avoided by every saint, but it is walked with God. His rod and staff comfort us because His presence is stronger than fear.",
      },
      {
        verse: 6,
        text:
          "Goodness and mercy following us is not a small comfort. The believer looks back and sees mercy, looks ahead and sees the house of the Lord.",
      },
    ],
  },
  {
    book: 40,
    chapter: 5,
    source: "Matthew Henry Concise",
    entries: [
      {
        verse: 3,
        text:
          "Christ begins with the poor in spirit. The kingdom is not promised to the proud, but to those who know their need of grace and come empty-handed to God.",
      },
      {
        verse: 13,
        text:
          "The disciples of Christ are the salt of the earth. They must preserve truth and holiness in a corrupt world, not by noise alone, but by faithful life and doctrine.",
      },
      {
        verse: 17,
        text:
          "Christ did not come to destroy the law, but to fulfill it. He reveals its true meaning, obeys it perfectly, and brings His people to love God's commandments.",
      },
    ],
  },
  {
    book: 43,
    chapter: 3,
    source: "Matthew Henry Concise",
    entries: [
      {
        verse: 3,
        text:
          "Regeneration is necessary. Nicodemus had religion, rank, and learning, yet Christ tells him he must be born again. No outward privilege can replace the new birth.",
      },
      {
        verse: 16,
        text:
          "Here is the gospel in miniature: God's love, Christ given, faith required, and eternal life promised. The verse invites sinners to look away from themselves to the Son.",
      },
      {
        verse: 17,
        text:
          "Christ was not sent to condemn the world, for the world was already guilty before God. His mission reveals the gracious purpose of salvation: that sinners may be rescued through Him.",
      },
      {
        verse: 19,
        text:
          "The condemnation of sinners lies not in lack of light only, but in loving darkness rather than light. The gospel exposes the heart while offering mercy.",
      },
    ],
  },
  {
    book: 45,
    chapter: 1,
    source: "Matthew Henry Concise",
    entries: [
      {
        verse: 1,
        text:
          "Paul calls himself a servant of Jesus Christ and an apostle separated unto the gospel of God. The highest office in the church is still service under Christ, and the gospel is not man's invention but God's own message. In the opening verses he shows that the gospel was promised before in the holy Scriptures, centers on God's Son, and summons the nations to the obedience of faith.",
      },
      {
        verse: 5,
        text:
          "By Christ Paul received grace and apostleship for obedience to the faith among all nations. The gospel does not merely invite private opinion; it brings sinners under the gracious rule of Christ, so that faith becomes the root of a new obedience.",
      },
      {
        verse: 16,
        text:
          "The apostle is not ashamed of the gospel because it is the power of God unto salvation. It saves not by human wisdom or display, but by divine power applied to everyone who believes.",
      },
      {
        verse: 17,
        text:
          "The righteousness of God is revealed from faith to faith. The gospel shows how God justifies sinners, not by their works, but through faith in the righteousness He provides.",
      },
      {
        verse: 18,
        text:
          "The wrath of God is revealed against ungodliness and unrighteousness. Paul begins with sin and judgment so that grace may be seen as grace, not as a small improvement to human nature.",
      },
    ],
  },
  {
    book: 45,
    chapter: 8,
    source: "Matthew Henry Concise",
    entries: [
      {
        verse: 1,
        text:
          "There is no condemnation to those who are in Christ Jesus. This is not because they are sinless, but because Christ has borne their guilt and joined them to Himself.",
      },
      {
        verse: 28,
        text:
          "All things work together for good to those who love God. The promise does not make every event pleasant, but it assures believers that God's wise hand governs all.",
      },
      {
        verse: 39,
        text:
          "Nothing can separate believers from the love of God in Christ. The chapter ends by lifting the soul above every fear into the triumph of divine love.",
      },
    ],
  },
];

export const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  {
    id: "atonement",
    term: "Atonement",
    termEs: "Expiacion",
    category: "Doctrine",
    definition:
      "The work by which God deals with sin through sacrifice, fulfilled in Christ's death for His people. In Scripture it includes satisfaction for guilt, covering of sin, reconciliation with God, and the removal of wrath through an appointed substitute.",
    definitionEs:
      "La obra por la cual Dios trata con el pecado mediante sacrificio, cumplida en la muerte de Cristo por su pueblo. En la Escritura incluye satisfaccion por la culpa, cobertura del pecado, reconciliacion con Dios y remocion de la ira mediante un sustituto designado.",
    originalLanguages: [
      {
        language: "Hebrew",
        lemma: "kaphar",
        transliteration: "kaphar",
        strongs: "H3722",
        meaning: "to cover, make atonement, purge",
      },
      {
        language: "Greek",
        lemma: "hilasterion",
        transliteration: "hilasterion",
        strongs: "G2435",
        meaning: "propitiatory place or sacrifice of atonement",
      },
    ],
    references: ["Leviticus 16", "Romans 3:24-26", "Hebrews 9:12"],
  },
  {
    id: "covenant",
    term: "Covenant",
    termEs: "Pacto",
    category: "Doctrine",
    definition:
      "A solemn bond established by God, revealing His promises, commands, and saving relationship with His people. Biblical covenants show God's lordship, His faithfulness, and the ordered way He relates to Adam, Noah, Abraham, Israel, David, and finally His people in Christ.",
    definitionEs:
      "Un vinculo solemne establecido por Dios, que revela sus promesas, mandamientos y relacion salvadora con su pueblo. Los pactos biblicos muestran el senorio de Dios, su fidelidad y la manera ordenada en que se relaciona con Adan, Noe, Abraham, Israel, David y finalmente su pueblo en Cristo.",
    originalLanguages: [
      {
        language: "Hebrew",
        lemma: "berith",
        transliteration: "berith",
        strongs: "H1285",
        meaning: "covenant, alliance, solemn agreement",
      },
      {
        language: "Greek",
        lemma: "diatheke",
        transliteration: "diatheke",
        strongs: "G1242",
        meaning: "covenant, testament, appointed arrangement",
      },
    ],
    references: ["Genesis 17:7", "Jeremiah 31:31-34", "Hebrews 8:6"],
  },
  {
    id: "justification",
    term: "Justification",
    termEs: "Justificacion",
    category: "Doctrine",
    definition:
      "God's gracious declaration that a sinner is righteous in His sight through faith in Jesus Christ. It is forensic, meaning God declares the believer righteous because Christ's righteousness is counted to him, not because the sinner has become personally perfect.",
    definitionEs:
      "La declaracion misericordiosa de Dios de que un pecador es justo ante El por medio de la fe en Jesucristo. Es forense: Dios declara justo al creyente porque la justicia de Cristo le es contada, no porque el pecador haya llegado a ser personalmente perfecto.",
    originalLanguages: [
      {
        language: "Greek",
        lemma: "dikaioo",
        transliteration: "dikaioo",
        strongs: "G1344",
        meaning: "to justify, declare righteous, acquit",
      },
    ],
    references: ["Romans 3:28", "Romans 5:1", "Galatians 2:16"],
  },
  {
    id: "pharisees",
    term: "Pharisees",
    termEs: "Fariseos",
    category: "Person",
    definition:
      "A Jewish religious party known for strict attention to the law and traditions. Jesus often rebuked them for hypocrisy, because external religion without humble faith can hide pride instead of curing it.",
    definitionEs:
      "Un grupo religioso judio conocido por su estricta atencion a la ley y las tradiciones. Jesus los reprendio frecuentemente por hipocresia, porque la religion externa sin fe humilde puede esconder orgullo en vez de curarlo.",
    references: ["Matthew 23", "Luke 18:9-14", "John 3:1"],
  },
  {
    id: "zion",
    term: "Zion",
    termEs: "Sion",
    category: "Place",
    definition:
      "A name first associated with Jerusalem and later used for God's dwelling, His people, and the hope of His kingdom. Zion can refer to the historical city, the worshiping people of God, and the heavenly inheritance promised in Christ.",
    definitionEs:
      "Nombre asociado primero con Jerusalen y luego usado para la morada de Dios, su pueblo y la esperanza de su reino. Sion puede referirse a la ciudad historica, al pueblo adorador de Dios y a la herencia celestial prometida en Cristo.",
    originalLanguages: [
      {
        language: "Hebrew",
        lemma: "Tsiyyon",
        transliteration: "Tsiyyon",
        strongs: "H6726",
        meaning: "Zion, a hill of Jerusalem; often used for God's dwelling and people",
      },
    ],
    references: ["Psalm 2:6", "Isaiah 2:3", "Hebrews 12:22"],
  },
];

export function getCommentaryChapter(book: number, chapter: number): CommentaryChapter | null {
  return COMMENTARY_CHAPTERS.find((item) => item.book === book && item.chapter === chapter) ?? null;
}

export function getCommentaryEntries(book: number, chapter: number): CommentaryEntry[] {
  return getCommentaryChapter(book, chapter)?.entries ?? [];
}

export function getBookName(book: number): string {
  return BIBLE_BOOKS.find((item) => item.num === book)?.name ?? `Book ${book}`;
}

export function searchDictionary(query: string): DictionaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return DICTIONARY_ENTRIES;
  return DICTIONARY_ENTRIES.filter((entry) =>
    [entry.term, entry.termEs, entry.definition, entry.definitionEs, entry.category]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

function normalizeBookName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const BOOK_ALIASES: Record<string, number> = {
  gen: 1,
  genesis: 1,
  salmo: 19,
  salmos: 19,
  psalm: 19,
  psalms: 19,
  prov: 20,
  proverb: 20,
  proverbs: 20,
  proverbios: 20,
  mateo: 40,
  matthew: 40,
  matt: 40,
  john: 43,
  juan: 43,
  rom: 45,
  romans: 45,
  romanos: 45,
};

export function parseBibleBook(input: string): { book: number; bookName: string } | null {
  const bookText = normalizeBookName(input)
    .replace(/[.;,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!bookText || /\d/.test(bookText)) return null;

  const book =
    BOOK_ALIASES[bookText] ??
    BIBLE_BOOKS.find((item) => normalizeBookName(item.name) === bookText || normalizeBookName(item.abbr) === bookText)?.num;
  if (!book) return null;

  return { book, bookName: getBookName(book) };
}

export function parseBibleReference(input: string): { book: number; chapter: number; verse?: number } | null {
  const normalized = normalizeBookName(input)
    .replace(/[.;,]/g, " ")
    .replace(/\s+/g, " ");
  const match = normalized.match(/^([1-3]?\s?[a-z]+(?:\s+[a-z]+)*)\s+(\d+)(?::(\d+))?/);
  if (!match) return null;

  const bookText = normalizeBookName(match[1]).replace(/\s+/g, " ");
  const book =
    BOOK_ALIASES[bookText] ??
    BIBLE_BOOKS.find((item) => normalizeBookName(item.name) === bookText || normalizeBookName(item.abbr) === bookText)?.num;
  if (!book) return null;

  return {
    book,
    chapter: Number(match[2]),
    verse: match[3] ? Number(match[3]) : undefined,
  };
}

export async function loadMatthewHenryManifest(): Promise<MatthewHenryManifest | null> {
  try {
    const res = await fetch("/commentaries/matthew-henry-complete/manifest.json", { cache: "force-cache" });
    if (!res.ok) return null;
    return (await res.json()) as MatthewHenryManifest;
  } catch {
    return null;
  }
}

export function findCommentaryByReference(input: string): CommentarySearchResult | null {
  const ref = parseBibleReference(input);
  if (!ref) return null;
  const chapter = getCommentaryChapter(ref.book, ref.chapter);
  if (!chapter || chapter.entries.length === 0) return null;

  const requestedVerse = ref.verse;
  const entry = requestedVerse == null
    ? chapter.entries[0]
    : [...chapter.entries]
        .sort((a, b) => b.verse - a.verse)
        .find((item) => item.verse <= requestedVerse) ?? chapter.entries[0];

  return {
    book: ref.book,
    bookName: getBookName(ref.book),
    chapter: ref.chapter,
    requestedVerse,
    matchedVerse: entry.verse,
    source: chapter.source,
    text: entry.text,
  };
}

function matchSection(sections: MatthewHenrySection[], requestedVerse?: number): MatthewHenrySection | null {
  if (sections.length === 0) return null;
  if (requestedVerse == null) return sections[0];

  const direct = sections.find((section) => section.verses?.includes(requestedVerse));
  if (direct) return direct;

  return [...sections]
    .sort((a, b) => b.verse - a.verse)
    .find((section) => section.verse <= requestedVerse) ?? sections[0];
}

export async function loadMatthewHenryChapter(book: number, chapter: number): Promise<MatthewHenryChapterFile | null> {
  try {
    const res = await fetch(`/commentaries/matthew-henry-complete/${book}/${chapter}.json`, { cache: "force-cache" });
    if (!res.ok) return null;
    return (await res.json()) as MatthewHenryChapterFile;
  } catch {
    return null;
  }
}

export async function findCompleteCommentaryByReference(input: string): Promise<CommentarySearchResult | null> {
  const ref = parseBibleReference(input);
  if (!ref) return null;

  const full = await loadMatthewHenryChapter(ref.book, ref.chapter);
  if (full) {
    const section = matchSection(full.sections, ref.verse);
    if (section) {
      return {
        book: full.book,
        bookName: full.bookName,
        chapter: full.chapter,
        requestedVerse: ref.verse,
        matchedVerse: section.verse,
        source: full.source,
        text: section.text,
        title: section.title,
        verses: section.verses,
        sourceUrl: full.sourceUrl,
      };
    }
  }

  return findCommentaryByReference(input);
}

export function listCommentaryChapters(): CommentaryChapter[] {
  return COMMENTARY_CHAPTERS;
}
