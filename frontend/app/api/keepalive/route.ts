import { NextResponse } from "next/server";

// ─── Keep-alive ping ──────────────────────────────────────────────────────────
// Called by Vercel Cron every 10 minutes to prevent the Railway backend from
// sleeping. Railway's free tier suspends services after ~10 min of inactivity.

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://tulip-bible-backend-production.up.railway.app";

export const runtime = "edge";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(`${BACKEND}/api/lexicon/books`, {
      signal: controller.signal,
      headers: { "User-Agent": "vercel-cron/keepalive" },
    });
    clearTimeout(timeout);
    return NextResponse.json({ ok: res.ok, status: res.status, ts: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), ts: Date.now() },
      { status: 200 } // always 200 so Vercel doesn't retry aggressively
    );
  }
}
