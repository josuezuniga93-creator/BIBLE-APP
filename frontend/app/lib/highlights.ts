// ─── Highlight system ─────────────────────────────────────────────────────────
// Highlights are stored per reading context (book chapter / learn section).
// Format: axiom-hl-book-{slug}-{chapter}  |  axiom-hl-learn-{docId}-{sectionId}

export type HLColor = "purple" | "yellow" | "red" | "blue" | "lime" | "pink";

export interface Highlight {
  id: string;
  text: string;       // exact selected text — used for matching on re-render
  color: HLColor;
  createdAt: number;  // for ordering in a "My Highlights" view
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export function hlStorageKey(context: string) {
  return `axiom-hl-${context}`;
}

export function loadHighlights(context: string): Highlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(hlStorageKey(context));
    return raw ? (JSON.parse(raw) as Highlight[]) : [];
  } catch {
    return [];
  }
}

export function saveHighlights(context: string, highlights: Highlight[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(hlStorageKey(context), JSON.stringify(highlights));
}

// ─── HTML injection ───────────────────────────────────────────────────────────
// Applied AFTER inline markdown rendering so we never accidentally match HTML tags.

export function applyHighlightsToHtml(html: string, highlights: Highlight[]): string {
  if (!highlights.length) return html;

  // Process longest highlights first to avoid partial-match conflicts
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);

  let result = html;
  for (const hl of sorted) {
    // Escape special regex chars in the user's text
    const escaped = hl.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only match text that isn't already inside a tag or mark
    const re = new RegExp(`(?!<[^>]*)(${escaped})(?![^<]*>)`, "g");
    result = result.replace(
      re,
      `<mark class="axiom-hl axiom-hl-${hl.color}" data-hl-id="${hl.id}" title="Click to remove">$1</mark>`
    );
  }
  return result;
}
