import type { FundamentalsCategory, VideoLanguage } from "../lib/videoTypes";

export type LibraryVideoCategory =
  | "featured"
  | "archive"
  | "fundamentals"
  | "short"
  | "community"
  | "testimonies";

export interface VideoEntry {
  id: string;
  title: string;
  speaker: string;
  church?: string;
  series?: string;
  category: LibraryVideoCategory;
  fundamentalsTopicId?: string;
  description: string;
  duration?: string;
  durationSeconds?: number;
  datePublished?: string;
  scriptureRefs?: string[];
  isShort?: boolean;
  isFeatured?: boolean;
  language?: VideoLanguage;
}

export interface FundamentalsSection {
  category: FundamentalsCategory;
  topics: {
    id: string;
    title: string;
    videoCount: number;
    featuredVideoId?: string;
  }[];
}

const FORCRY_TESTIMONY: VideoEntry = {
  id: "fU3Hek_exX0",
  title: "ForCry Ministry Testimony",
  speaker: "ForCry Ministry",
  category: "testimonies",
  description: "A testimony of God's grace shared through ForCry Ministry.",
  isShort: true,
  isFeatured: true,
  language: "en",
};

// Future: replace these arrays with approved rows from Supabase.
export const CURRENT_FEATURED: VideoEntry | null = FORCRY_TESTIMONY;
export const ARCHIVE_VIDEOS: VideoEntry[] = [];
export const SHORT_VIDEOS: VideoEntry[] = [];
export const COMMUNITY_VIDEOS: VideoEntry[] = [];
export const TESTIMONIES_VIDEOS: VideoEntry[] = [FORCRY_TESTIMONY];

export const FUNDAMENTALS: FundamentalsSection[] = [
  {
    category: "God",
    topics: [
      { id: "who-is-god", title: "Who Is God?", videoCount: 0 },
      { id: "the-trinity", title: "The Trinity", videoCount: 0 },
      { id: "attributes-of-god", title: "Attributes of God", videoCount: 0 },
      { id: "holiness-of-god", title: "Holiness of God", videoCount: 0 },
      { id: "sovereignty-of-god", title: "Sovereignty of God", videoCount: 0 },
    ],
  },
  {
    category: "Jesus Christ",
    topics: [
      { id: "who-is-jesus", title: "Who Is Jesus?", videoCount: 0 },
      { id: "deity-of-christ", title: "Deity of Christ", videoCount: 0 },
      { id: "humanity-of-christ", title: "Humanity of Christ", videoCount: 0 },
      { id: "sinless-life", title: "Sinless Life of Christ", videoCount: 0 },
      { id: "death-of-christ", title: "Death of Christ", videoCount: 0 },
      { id: "resurrection", title: "Resurrection of Christ", videoCount: 0 },
      { id: "ascension", title: "Ascension of Christ", videoCount: 0 },
      { id: "return-of-christ", title: "Return of Christ", videoCount: 0 },
    ],
  },
  {
    category: "The Gospel",
    topics: [
      { id: "what-is-gospel", title: "What Is the Gospel?", videoCount: 0 },
      { id: "what-is-sin", title: "What Is Sin?", videoCount: 0 },
      { id: "why-jesus-die", title: "Why Did Jesus Die?", videoCount: 0 },
      { id: "repentance", title: "Repentance", videoCount: 0 },
      { id: "faith", title: "Faith", videoCount: 0 },
      { id: "grace", title: "Grace", videoCount: 0 },
      { id: "justification", title: "Justification", videoCount: 0 },
      { id: "adoption", title: "Adoption", videoCount: 0 },
      { id: "sanctification", title: "Sanctification", videoCount: 0 },
    ],
  },
  {
    category: "Scripture",
    topics: [
      { id: "what-is-bible", title: "What Is the Bible?", videoCount: 0 },
      { id: "trust-bible", title: "Why Can We Trust the Bible?", videoCount: 0 },
      { id: "inspiration", title: "Inspiration of Scripture", videoCount: 0 },
      { id: "authority", title: "Authority of Scripture", videoCount: 0 },
      { id: "sufficiency", title: "Sufficiency of Scripture", videoCount: 0 },
    ],
  },
  {
    category: "Salvation",
    topics: [
      { id: "what-is-salvation", title: "What Is Salvation?", videoCount: 0 },
      { id: "regeneration", title: "Regeneration", videoCount: 0 },
      { id: "conversion", title: "Conversion", videoCount: 0 },
      { id: "union-with-christ", title: "Union with Christ", videoCount: 0 },
      { id: "assurance", title: "Assurance of Salvation", videoCount: 0 },
      { id: "perseverance", title: "Perseverance of the Saints", videoCount: 0 },
    ],
  },
  {
    category: "The Holy Spirit",
    topics: [
      { id: "who-is-hs", title: "Who Is the Holy Spirit?", videoCount: 0 },
      { id: "work-of-hs", title: "Work of the Holy Spirit", videoCount: 0 },
      { id: "fruit-of-spirit", title: "Fruit of the Spirit", videoCount: 0 },
    ],
  },
  {
    category: "The Church",
    topics: [
      { id: "what-is-church", title: "What Is the Church?", videoCount: 0 },
      { id: "baptism", title: "Baptism", videoCount: 0 },
      { id: "lords-supper", title: "The Lord's Supper", videoCount: 0 },
      { id: "membership", title: "Church Membership", videoCount: 0 },
      { id: "leadership", title: "Biblical Leadership", videoCount: 0 },
      { id: "worship", title: "Corporate Worship", videoCount: 0 },
    ],
  },
];

export const CATEGORY_COLORS: Record<FundamentalsCategory, string> = {
  God: "#f59e0b",
  "Jesus Christ": "#3b82f6",
  "The Gospel": "#ef4444",
  Scripture: "#c9a961",
  Salvation: "#8b5cf6",
  "The Holy Spirit": "#06b6d4",
  "The Church": "#10b981",
};

export function uniqueVideos(videos: VideoEntry[]): VideoEntry[] {
  const seen = new Set<string>();
  return videos.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  });
}

export function matchesVideoSearch(video: VideoEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    video.title,
    video.speaker,
    video.church,
    video.series,
    video.category,
    video.description,
    ...(video.scriptureRefs ?? []),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}
