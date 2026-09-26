export class RequestInputError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function readBoundedJson(request: Request, maximumBytes: number): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > maximumBytes) {
    throw new RequestInputError("This request is too large.", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestInputError("A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new RequestInputError("This request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new RequestInputError("Invalid JSON body."); }
}

// This is a per-instance guard; platform-wide limits belong at the hosting edge.
const recentRequests = new Map<string, { count: number; expires: number }>();
export function allowRequest(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  for (const [id, entry] of recentRequests) if (entry.expires <= now) recentRequests.delete(id);
  const entry = recentRequests.get(key);
  if (entry) {
    if (entry.count >= limit) return false;
    entry.count++;
    return true;
  }
  if (recentRequests.size >= 2000) return false;
  recentRequests.set(key, { count: 1, expires: now + windowMs });
  return true;
}
