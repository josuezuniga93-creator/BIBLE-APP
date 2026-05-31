import { promises as fs } from "fs";
import path from "path";
import type { ParsedChapter } from "./gutenberg";

export interface PublicDomainBookData {
  slug: string;
  title: string;
  source: {
    label: string;
    url: string;
  };
  chapters: ParsedChapter[];
}

const LOCAL_BOOK_SLUGS = new Set([
  "mortification-of-sin",
  "bondage-of-the-will",
  "religious-affections",
  "death-of-death",
  "body-of-divinity",
  "freedom-of-the-will",
  "commentary-on-romans-hodge",
  "fourfold-state",
  "practical-religion",
  "knots-untied",
  "thoughts-for-young-men",
  "duties-of-parents",
]);

const bookCache = new Map<string, PublicDomainBookData>();

export function hasPublicDomainBook(slug: string): boolean {
  return LOCAL_BOOK_SLUGS.has(slug);
}

export async function getPublicDomainBook(slug: string): Promise<PublicDomainBookData | null> {
  if (!hasPublicDomainBook(slug)) return null;

  const cached = bookCache.get(slug);
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "public", "books", `${slug}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as PublicDomainBookData;
  bookCache.set(slug, parsed);
  return parsed;
}
