import { NextResponse } from "next/server";
import { STATIC_BOOK_CATALOG } from "../../../lib/bookCatalog";
import { getChapters } from "../../../lib/gutenberg";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = STATIC_BOOK_CATALOG.find((b) => b.slug === slug);
  if (!book) {
    return NextResponse.json({ detail: "Book not found" }, { status: 404 });
  }

  let chapterCount = 1;
  const chapterList: { number: number; title: string }[] = [];

  if (book.pg_id) {
    try {
      const chapters = await getChapters(book.pg_id);
      chapterCount = chapters.length;
      chapters.forEach((ch, i) => {
        chapterList.push({ number: i + 1, title: ch.title });
      });
    } catch {
      chapterCount = 1;
      chapterList.push({ number: 1, title: book.title });
    }
  } else {
    chapterList.push({ number: 1, title: "Introduction" });
  }

  return NextResponse.json({
    ...book,
    chapter_count: chapterCount,
    chapters: chapterList,
  });
}
