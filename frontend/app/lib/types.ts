// ─── Verdict types ────────────────────────────────────────────────────────────

export type ClaimVerdict =
  | "ALIGNED"
  | "SECONDARY_DIFFERENCE"
  | "CAUTION"
  | "CONTRADICTS_FUNDAMENTAL";

export type OverallVerdict = "SOUND" | "MIXED" | "SERIOUS_CONCERNS" | "FALSE_TEACHING";
export type InputTab = "text" | "youtube";
export type Lang = "en" | "es";

// ─── Sermon analysis models ───────────────────────────────────────────────────

export interface Claim {
  quote: string;
  timestamp?: string | null;   // "23:07" or null — from YouTube transcript
  scriptureCheck: string;
  historicCheck: string;
  theologianNote: string;
  verdict: ClaimVerdict;
  verdictExplanation: string;
  bibleVerses?: Record<string, Record<string, string>>; // ref → {version → text}
}

export interface Analysis {
  summary: string;
  claims: Claim[];
  redFlags: string[];
  recommendations: string[];
  overallVerdict: OverallVerdict;
  overallExplanation: string;
  videoId?: string | null;     // YouTube video ID for timestamp links
}

export interface HistoryEntry {
  id: string;
  date: string;         // ISO string
  inputType: "text" | "youtube";
  youtubeUrl?: string;
  preacher?: string;
  lang: Lang;
  overallVerdict: OverallVerdict;
  analysis: Analysis;
  inputPreview: string; // first 80 chars of text input or the YouTube URL
}

// ─── Lexicon / Scripture Explorer models ─────────────────────────────────────

export interface BookMeta {
  num: number;
  name: string;
  abbr: string;
  chapters: number;
  testament: "OT" | "NT";
}

export interface WordToken {
  w: string;        // display word
  s: string | null; // Strong's number or null
}

export interface Verse {
  verse: number;
  text: string;
  words: WordToken[];
  hasStrongs: boolean;
}

export interface ChapterData {
  book: number;
  bookName: string;
  chapter: number;
  testament: string;
  verses: Verse[];
  hasStrongs: boolean;
}

export interface StrongsEntry {
  strongs: string;
  lang: "Hebrew" | "Greek";
  lemma: string;
  xlit: string;
  pron: string;
  definition: string;
  fullDefinition: string;
  derivation: string;
  see: string[];
}

export interface CommentaryEntry {
  verse: number;
  text: string;
}
