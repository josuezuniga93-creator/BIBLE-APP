import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600; // cache 1 hour

interface Article {
  title: string;
  href: string;
  excerpt: string;
  date: string;
  slug: string;
}

function extractText(html: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = html.match(re);
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”").replace(/&#8211;/g, "–").replace(/&nbsp;/g, " ").trim() : "";
}

export async function GET() {
  try {
    const res = await fetch("https://marrowministries.org/articles", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TULIPBibleApp/1.0)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract article entries — marrowministries uses standard WordPress/Squarespace-like markup
    const articles: Article[] = [];

    // Try to match article/post blocks by common patterns
    const blockRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let blockMatch;
    while ((blockMatch = blockRe.exec(html)) !== null && articles.length < 20) {
      const block = blockMatch[1];

      // Title + href
      const linkRe = /href="(https:\/\/marrowministries\.org\/articles\/[^"]+)"/i;
      const linkMatch = block.match(linkRe);
      if (!linkMatch) continue;
      const href = linkMatch[1];
      const slug = href.split("/").filter(Boolean).pop() ?? href;

      const titleMatch = block.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#8217;/g, "'").trim()
        : slug.replace(/-/g, " ");

      // Date
      const dateMatch = block.match(/<time[^>]*datetime="([^"]+)"/i) ??
        block.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1].slice(0, 10) : "";

      // Excerpt
      const excerptMatch = block.match(/<p[^>]*class="[^"]*excerpt[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ??
        block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const excerpt = excerptMatch
        ? excerptMatch[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&nbsp;/g, " ").trim().slice(0, 200)
        : "";

      if (title && href) articles.push({ title, href, excerpt, date, slug });
    }

    // Fallback: try link-based extraction if no <article> tags found
    if (articles.length === 0) {
      const linkRe2 = /href="(https:\/\/marrowministries\.org\/articles\/([^/"]+))"/gi;
      const seen = new Set<string>();
      let m2;
      while ((m2 = linkRe2.exec(html)) !== null && articles.length < 20) {
        const href = m2[1];
        const slug = m2[2];
        if (seen.has(slug) || slug === "articles") continue;
        seen.add(slug);
        const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        articles.push({ title, href, excerpt: "", date: "", slug });
      }
    }

    return NextResponse.json({ articles }, { headers: { "Cache-Control": "s-maxage=3600" } });
  } catch (err) {
    console.error("articles fetch error:", err);
    return NextResponse.json({ articles: [], error: String(err) }, { status: 200 });
  }
}
