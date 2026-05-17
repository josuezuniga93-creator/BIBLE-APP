import { NextResponse } from "next/server";
import { STATIC_BOOK_CATALOG } from "../../lib/bookCatalog";

export async function GET() {
  return NextResponse.json(STATIC_BOOK_CATALOG);
}
