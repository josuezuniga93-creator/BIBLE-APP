import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<h[1-6][^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&hellip;/g, "…")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !url.startsWith("https://marrowministries.org/")) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; TULIPBibleApp/1.0)",
    "Accept": "application/json, text/html",
  };

  // ── Strategy 1: Squarespace JSON API (?format=json) ──────────────────────
  // Squarespace exposes the full article body as structured JSON — no scraping needed.
  try {
    const jsonUrl = url.includes("?") ? `${url}&format=json` : `${url}?format=json`;
    const res = await fetch(jsonUrl, { headers, signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      // Squarespace wraps the article in `item` or `collection.items[0]`
      const item = data?.item ?? data?.collection?.items?.[0] ?? null;
      if (item) {
        const title  = item.title ? stripTags(item.title) : "";
        const body   = item.body ?? item.systemDataVariants?.[0]?.body ?? "";
        const content = body ? stripTags(body) : "";

        // Only credit the author if the article wasn't written by a guest.
        // Squarespace always returns the account owner; "Guest Writers" is a category.
        const categories: string[] = (item.categories ?? []).map((c: unknown) =>
          typeof c === "string" ? c : (c as { title?: string })?.title ?? ""
        );
        const isGuest = categories.some((c) => /guest/i.test(c));
        const rawAuthor = item.author?.displayName ?? item.author?.firstName ?? "";
        const author = isGuest ? "" : rawAuthor;

        // publishOn is a Unix timestamp in milliseconds
        const date = item.publishOn
          ? new Date(item.publishOn).toISOString().slice(0, 10)
          : "";
        const isVideoOnly = content.length < 200 && /youtube\.com|youtu\.be/i.test(body);
        if (content.length > 100) {
          return NextResponse.json({ title, date, content, author, source: "json", isVideoOnly });
        }
      }
    }
  } catch {
    // fall through to HTML strategies
  }

  // ── Strategy 2: RSS full-content ─────────────────────────────────────────
  // Some Squarespace RSS feeds include <content:encoded> with the full body.
  try {
    const slug = url.split("/").filter(Boolean).pop() ?? "";
    const rssUrl = `https://marrowministries.org/articles?format=rss`;
    const res = await fetch(rssUrl, { headers, signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const xml = await res.text();
      // Find the item whose link matches our slug
      const itemRe = /<item>([\s\S]*?)<\/item>/gi;
      let m;
      while ((m = itemRe.exec(xml)) !== null) {
        const block = m[1];
        if (!block.includes(slug)) continue;
        // Prefer <content:encoded>, fall back to <description>
        const fullMatch =
          block.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i) ??
          block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
        const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const dateMatch  = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        if (fullMatch && fullMatch[1].length > 100) {
          return NextResponse.json({
            title:   titleMatch ? stripTags(titleMatch[1]) : "",
            date:    dateMatch  ? new Date(dateMatch[1]).toISOString().slice(0, 10) : "",
            content: stripTags(fullMatch[1]),
            author:  "",
            source:  "rss",
          });
        }
      }
    }
  } catch {
    // fall through
  }

  // ── Strategy 3: HTML scraping (last resort) ───────────────────────────────
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? stripTags(titleMatch[1]) : "";

    const dateMatch =
      html.match(/<time[^>]*datetime="([^"]+)"/i) ??
      html.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1].slice(0, 10) : "";

    // Grab ALL paragraph text from the page — better than stopping at first </div>
    const ps = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => stripTags(m[1]))
      .filter((t) => t.length > 40)
      .join("\n\n");

    // Author patterns
    let author = "";
    const authorPatterns = [
      /<span[^>]*class="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
      /<a[^>]*rel="author"[^>]*>([\s\S]*?)<\/a>/i,
      /"author"\s*:\s*\{\s*"@type"[^}]*"name"\s*:\s*"([^"]+)"/i,
    ];
    for (const pat of authorPatterns) {
      const m = html.match(pat);
      if (m) { author = stripTags(m[1]).trim(); break; }
    }

    return NextResponse.json({ title, date, content: ps, author, source: "html" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
