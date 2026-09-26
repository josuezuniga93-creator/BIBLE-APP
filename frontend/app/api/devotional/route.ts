import { NextRequest, NextResponse } from "next/server";
import { getDevotionalForDate } from "../../lib/devotionalData";

export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return NextResponse.json({ error: "A calendar date is required." }, { status: 400 });
  }
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return NextResponse.json({ error: "That date is not valid." }, { status: 400 });
  }
  const entry = getDevotionalForDate(date);
  if (!entry) return NextResponse.json({ error: "This reading is unavailable." }, { status: 404 });
  return NextResponse.json(entry, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
