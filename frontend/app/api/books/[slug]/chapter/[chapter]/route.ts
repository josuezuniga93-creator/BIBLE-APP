import { NextResponse } from "next/server";
import { STATIC_BOOK_CATALOG } from "../../../../../lib/bookCatalog";
import { getChapters } from "../../../../../lib/gutenberg";

const NO_CONTENT_MSG = `This book's full text is being prepared for in-app reading.

In the meantime, you can read it free at:
• Christian Classics Ethereal Library — ccel.org
• Project Gutenberg — gutenberg.org
• Standard Ebooks — standardebooks.org

All of these titles are in the public domain.`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; chapter: string }> }
) {
  const { slug, chapter: chapterStr } = await params;
  const chapterNum = parseInt(chapterStr, 10);

  const book = STATIC_BOOK_CATALOG.find((b) => b.slug === slug);
  if (!book) {
    return NextResponse.json({ detail: "Book not found" }, { status: 404 });
  }

  if (!book.pg_id) {
    return NextResponse.json({
      slug,
      chapter_number: 1,
      chapter_title: book.title,
      content: NO_CONTENT_MSG,
      total_chapters: 1,
      has_prev: false,
      has_next: false,
    });
  }

  try {
    const chapters = await getChapters(book.pg_id);
    const idx = chapterNum - 1;

    if (idx < 0 || idx >= chapters.length) {
      return NextResponse.json({ detail: "Chapter not found" }, { status: 404 });
    }

    const ch = chapters[idx];
    return NextResponse.json({
      slug,
      chapter_number: chapterNum,
      chapter_title: ch.title,
      content: ch.content,
      total_chapters: chapters.length,
      has_prev: idx > 0,
      has_next: idx < chapters.length - 1,
    });
  } catch (e) {
    return NextResponse.json(
      { detail: `Could not load chapter: ${(e as Error).message}` },
      { status: 502 }
    );
  }
}
