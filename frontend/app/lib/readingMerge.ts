type RecordWithId = { id: string; [key: string]: unknown };

function array(value: string | null): unknown[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Saved reading data is invalid. Export a backup before trying again.");
  return parsed;
}

function records(value: string | null): RecordWithId[] {
  return array(value).filter((item): item is RecordWithId => !!item && typeof item === "object" && "id" in item && typeof item.id === "string");
}

/** Merge independent notes and permanent awards instead of replacing a device's list. */
export function mergeReadingValue(key: string, local: string | null, remote: string | null): string | undefined {
  if (key === "tulip_badges_shown_v1") {
    return JSON.stringify([...new Set([...array(local), ...array(remote)].filter((id): id is string => typeof id === "string"))].sort());
  }
  if (key !== "tulip_notes_v1" && key !== "tulip_badges_earned_v1") return undefined;
  const byId = new Map<string, RecordWithId>();
  for (const item of [...records(local), ...records(remote)]) {
    const previous = byId.get(item.id);
    const stamp = key === "tulip_notes_v1" ? "updatedAt" : "earnedAt";
    const time = (value: unknown) => typeof value === "string" ? Date.parse(value) || 0 : 0;
    const wins = previous && (key === "tulip_notes_v1"
      ? time(item[stamp]) > time(previous[stamp])
      : time(item[stamp]) < time(previous[stamp]));
    if (!previous || wins) byId.set(item.id, item);
  }
  return JSON.stringify([...byId.values()].sort((a, b) => a.id.localeCompare(b.id)));
}
