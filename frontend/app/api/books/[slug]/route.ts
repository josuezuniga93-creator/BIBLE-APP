import { NextResponse } from "next/server";
import { STATIC_BOOK_CATALOG } from "../../../lib/bookCatalog";
import { getChapters } from "../../../lib/gutenberg";
import { getPublicDomainBook } from "../../../lib/publicDomainBooks";
import { paginateContent } from "../../../lib/pagination";

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
  const chapterList: { number: number; title: string; page_count?: number }[] = [];
  const localBook = await getPublicDomainBook(slug);

  if (localBook) {
    chapterCount = localBook.chapters.length;
    localBook.chapters.forEach((ch, i) => {
      chapterList.push({ number: i + 1, title: ch.title, page_count: paginateContent(ch.content, "md", true).length });
    });
  } else if (book.pg_id) {
    try {
      const chapters = await getChapters(book.pg_id);
      chapterCount = chapters.length;
      chapters.forEach((ch, i) => {
        chapterList.push({ number: i + 1, title: ch.title, page_count: paginateContent(ch.content, "md", true).length });
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
