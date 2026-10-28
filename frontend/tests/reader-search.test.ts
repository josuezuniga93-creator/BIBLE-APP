import test from "node:test";
import assert from "node:assert/strict";
import { suggestPassages, parsePassageInput } from "../app/lib/passageParser";
import { searchScore } from "../app/lib/searchSuggestions";
import { paginateContent } from "../app/lib/pagination";

test("passage suggestions preserve verses and correct transposed letters", () => {
  const first = suggestPassages("Jhon 3:  14-18")[0];
  assert.equal(first.passage?.bookNum, 43);
  assert.equal(first.passage?.verseStart, 14);
  assert.equal(first.passage?.verseEnd, 18);
});
test("numbered books and Spanish suggestions stay distinct", () => {
  assert.ok(suggestPassages("1 Corintians 13").every(item => item.passage?.bookNum === 46));
  assert.equal(suggestPassages("Jua", "es")[0].label, "Juan");
  assert.equal(parsePassageInput("Juan 3:   5-7", 1)?.bookNum, 43);
  assert.equal(suggestPassages("John 999").length, 0);
});
test("dictionary ranks exact, partial, and misspelled terms", () => {
  assert.equal(searchScore("grace", "Grace"), 0);
  assert.equal(searchScore("justif", "Justification"), 0.25);
  assert.ok(Number.isFinite(searchScore("justificaton", "Justification")));
  assert.equal(searchScore("zzzz", "Faith"), Infinity);
});
test("whole-work page offsets use the reader's stable pagination", () => {
  const chapters = ["A short opening.", "This is a sentence in the book. ".repeat(300), "The end."];
  const counts = chapters.map(text => paginateContent(text, "md", true).length);
  assert.ok(counts[1] > 1);
  assert.deepEqual(counts, chapters.map(text => paginateContent(text, "xl", true).length));
  assert.equal(1 + counts.slice(0, 2).reduce((a, b) => a + b, 0), counts.reduce((a, b) => a + b, 0));
});
