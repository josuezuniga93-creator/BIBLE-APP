/**
 * Free Google Translate integration using the unofficial gtx endpoint.
 * No API key required. Max ~4 500 chars per request.
 */

const CHUNK_SIZE = 4000; // chars per API call

/** Split text into chunks at paragraph boundaries so sentences stay whole. */
function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > CHUNK_SIZE && current) {
      chunks.push(current.trimEnd());
      current = para + "\n\n";
    } else {
      current += para + "\n\n";
    }
  }
  if (current.trim()) chunks.push(current.trimEnd());
  return chunks;
}

/** Translate a single chunk via the free Google Translate endpoint. */
async function translateChunk(text: string): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=` +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  // Response is a nested array: [[["translated","original",...],...],...]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data[0] as any[]).map((item: any) => item[0] ?? "").join("");
}

/** Translate full (potentially long) text from English → Spanish, with
 *  sessionStorage caching so re-opens don't re-fetch. */
export async function translateToSpanish(
  text: string,
  cacheKey: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const storageKey = `gtx_es_${cacheKey}`;
  try {
    const cached = sessionStorage.getItem(storageKey);
    if (cached) return cached;
  } catch { /* private browsing — ignore */ }

  const chunks = chunkText(text);
  const translated: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    translated.push(await translateChunk(chunks[i]));
    onProgress?.(Math.round(((i + 1) / chunks.length) * 100));
  }
  const result = translated.join("\n\n");

  try {
    sessionStorage.setItem(storageKey, result);
  } catch { /* quota exceeded — skip cache */ }

  return result;
}
