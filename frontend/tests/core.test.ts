import assert from "node:assert/strict";
import test from "node:test";
import { createReminderCalendar } from "../app/lib/calendarReminder";
import { createReadingBackup } from "../app/lib/readingBackup";
import { parsePassageInput, validatePassageParserExamples } from "../app/lib/passageParser";
import { isBackupStorageKey, isSyncableStorageKey } from "../app/lib/storageKeys";

test("passage parser accepts scripture references with loose spaces", () => {
  const cases = [
    ["John 3: 5-7", "John 3:5-7"],
    ["John 3 :   5 - 7", "John 3:5-7"],
    ["  Juan   3:   5  ", "John 3:5"],
    ["1   John   2:1", "1 John 2:1"],
    ["Romans 8", "Romans 8"],
  ] as const;

  for (const [input, expected] of cases) {
    assert.equal(parsePassageInput(input, 43)?.displayRef, expected);
  }
});

test("passage parser rejects unsafe or malformed references", () => {
  assert.equal(parsePassageInput("John 999", 43), null);
  assert.equal(parsePassageInput("John 3:abc", 43), null);
  assert.equal(parsePassageInput("John 3:0", 43), null);
  assert.equal(parsePassageInput("John 3:999999", 43), null);
});

test("documented parser examples still pass", () => {
  const results = validatePassageParserExamples();
  assert.deepEqual(results.filter((result) => !result.pass), []);
});

test("calendar reminders create daily local-time events", () => {
  const ics = createReminderCalendar(8, 0, false, new Date("2026-09-26T13:00:00.000Z"));
  assert.match(ics, /BEGIN:VCALENDAR\r\nVERSION:2\.0/);
  assert.match(ics, /SUMMARY:Read Scripture - Tulip Bible/);
  assert.match(ics, /RRULE:FREQ=DAILY/);
  assert.match(ics, /URL:https:\/\/tulip-bible-app\.vercel\.app\/lexicon/);
  assert.match(ics, /BEGIN:VALARM/);
});

test("backup allowlist includes reading data and excludes credentials", () => {
  assert.equal(isSyncableStorageKey("tulip_notes_v1"), true);
  assert.equal(isSyncableStorageKey("tulip-favorite-book-pilgrims-progress"), true);
  assert.equal(isBackupStorageKey("ryc-theme"), true);
  assert.equal(isBackupStorageKey("supabase.auth.token"), false);
  assert.equal(isBackupStorageKey("sb-user-session"), false);
});

test("reading backup exports only allowed localStorage keys", () => {
  const entries = new Map([
    ["tulip_notes_v1", "[1]"],
    ["ryc-theme", "white-noir"],
    ["supabase.auth.token", "secret"],
  ]);
  const storage: Storage = {
    get length() {
      return entries.size;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    setItem() {},
    removeItem() {},
    clear() {},
  };
  const backup = createReadingBackup(storage);
  assert.equal(backup.app, "Tulip Bible");
  assert.deepEqual(Object.keys(backup.data).sort(), ["ryc-theme", "tulip_notes_v1"]);
});
