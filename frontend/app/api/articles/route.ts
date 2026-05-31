import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

interface Article {
  title: string;
  href: string;
  excerpt: string;
  date: string;
  slug: string;
  imageUrl?: string;
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "“").replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "").trim();
}

// ── Hardcoded fallback articles (always shown if fetch fails) ─────────────────
const FALLBACK: Article[] = [
  {
    title: "What Is the Gospel?",
    href: "https://marrowministries.org/articles/what-is-the-gospel",
    excerpt: "The gospel is the good news that God saves sinners through the life, death, and resurrection of Jesus Christ.",
    date: "2023-01-01",
    slug: "what-is-the-gospel",
  },
  {
    title: "Why Expository Preaching?",
    href: "https://marrowministries.org/articles/why-expository-preaching",
    excerpt: "Expository preaching takes the meaning of the text and makes it the message of the sermon.",
    date: "2023-02-01",
    slug: "why-expository-preaching",
  },
  {
    title: "The Doctrines of Grace",
    href: "https://marrowministries.org/articles/the-doctrines-of-grace",
    excerpt: "TULIP summarizes the five points that emerged from the Synod of Dort in 1618–1619.",
    date: "2023-03-01",
    slug: "the-doctrines-of-grace",
  },
  {
    title: "Union with Christ",
    href: "https://marrowministries.org/articles/union-with-christ",
    excerpt: "Every spiritual blessing flows from our union with Christ — the foundation of the Christian life.",
    date: "2023-04-01",
    slug: "union-with-christ",
  },
];

async function tryRss(url: string): Promise<Article[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TULIPBibleApp/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const xml = await res.text();

  const articles: Article[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch ? decode(titleMatch[1]) : "";

    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i) ??
      block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i);
    const href = linkMatch ? linkMatch[1].trim() : "";

    const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const excerpt = descMatch ? decode(descMatch[1]).slice(0, 220) : "";

    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const date = dateMatch
      ? new Date(dateMatch[1]).toISOString().slice(0, 10)
      : "";

    const slug = href.split("/").filter(Boolean).pop() ?? "";

    // Extract image URL from common RSS image tags
    const mediaContent  = block.match(/<media:content[^>]+url="([^"]+)"[^>]*>/i);
    const mediaThumbnail = block.match(/<media:thumbnail[^>]+url="([^"]+)"[^>]*>/i);
    const enclosure     = block.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image[^"]*"[^>]*>/i);
    const wpFeatured    = block.match(/<wp:attachment_url>(?:<!\[CDATA\[)?(https?:\/\/[^<]+?)(?:\]\]>)?<\/wp:attachment_url>/i);
    // Also try to grab first <img src> from content:encoded
    const contentEnc    = block.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i);
    const contentImg    = contentEnc ? contentEnc[1].match(/<img[^>]+src="(https?:\/\/[^"]+)"/) : null;
    const imageUrl: string | undefined =
      (mediaContent?.[1] ?? mediaThumbnail?.[1] ?? enclosure?.[1] ?? wpFeatured?.[1] ?? contentImg?.[1]) || undefined;

    // Skip video/episode posts — YouTube embeds, show episodes, or bare video descriptions
    const rawDesc = descMatch ? descMatch[1] : "";
    const isVideoOnly =
      /youtube\.com|youtu\.be/i.test(rawDesc) ||
      /marrow\s*show|the\s*marrow\s*show|episode\s*\d|in this episode/i.test(title + rawDesc) ||
      /\/marrow-show|\/episodes?\//i.test(href) ||
      (excerpt.length < 120 && /youtube\.com|youtu\.be/i.test(rawDesc));

    if (title && href && href.includes("marrowministries.org") && !isVideoOnly) {
      articles.push({ title, href, excerpt, date, slug, imageUrl });
    }
  }
  return articles;
}

export async function GET() {
  const rssUrls = [
    "https://marrowministries.org/articles?format=rss",
    "https://marrowministries.org/feed.xml",
    "https://marrowministries.org/rss.xml",
    "https://marrowministries.org/?format=rss",
    "https://marrowministries.org/feed",
  ];

  let articles: Article[] = [];

  for (const url of rssUrls) {
    try {
      const result = await tryRss(url);
      if (result.length > 0) { articles = result; break; }
    } catch {
      // try next
    }
  }

  // Always fall back to curated list if fetch yields nothing
  if (articles.length === 0) articles = FALLBACK;

  return NextResponse.json({ articles }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
