import test from "node:test";
import assert from "node:assert/strict";
import { mergeReadingValue } from "../app/lib/readingMerge";
import { safeAuthDestination } from "../app/lib/authRedirect";

const merge = (key: string, local: unknown[], remote: unknown[]) => JSON.parse(mergeReadingValue(key, JSON.stringify(local), JSON.stringify(remote))!);

test("notes from separate devices survive reconciliation", () => {
  assert.deepEqual(merge("tulip_notes_v1", [{ id: "a", notes: "One" }], [{ id: "b", notes: "Two" }]).map((n: { id: string }) => n.id), ["a", "b"]);
});
test("latest note and deletion tombstone win over an older device", () => {
  const older = { id: "a", notes: "Draft", updatedAt: "2026-10-14T00:00:00Z" };
  const newer = { ...older, notes: "Edited", updatedAt: "2026-10-15T00:00:00Z" };
  const deleted = { ...newer, deletedAt: "2026-10-16T00:00:00Z", updatedAt: "2026-10-16T00:00:00Z" };
  assert.deepEqual(merge("tulip_notes_v1", [older], [newer]), [newer]);
  assert.deepEqual(merge("tulip_notes_v1", [deleted], [older]), [deleted]);
});
test("badge records deduplicate and keep the original award date", () => {
  const first = { id: "reader", earnedAt: "2026-10-14T00:00:00Z" };
  assert.deepEqual(merge("tulip_badges_earned_v1", [first], [{ ...first, earnedAt: "2026-10-16T00:00:00Z" }]), [first]);
  assert.deepEqual(merge("tulip_badges_shown_v1", ["reader", "reader"], ["reader", "week"]), ["reader", "week"]);
});
test("invalid saved collections do not silently replace data", () => {
  assert.throws(() => mergeReadingValue("tulip_notes_v1", "not-json", "[]"));
  assert.throws(() => mergeReadingValue("tulip_notes_v1", "{}", "[]"));
  assert.equal(mergeReadingValue("another-key", "a", "b"), undefined);
});
test("sign-in return locations remain inside the app", () => {
  assert.equal(safeAuthDestination("/notes"), "/notes");
  for (const path of ["//example.com", "https://example.com", "/\\example.com", null]) assert.equal(safeAuthDestination(path), "/more");
});
