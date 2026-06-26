// app/lib/cloudSync.ts
// Syncs localStorage data to/from Supabase for cross-device access.
//
// Keys synced (by prefix):
//   ryc-vcolor-*         verse highlight colors
//   ryc-chapter-note-*   chapter notes
//   axiom-hl-bible-*     highlight collections (Collections page)
//   ryc-last-position    last reading position
//   tulip-church-analyses church analysis results
//   ryc-bookmarks        bookmarks
//   tulip_badges_earned_v1 earned badges
//   tulip-reader-highlights:* library book & historical document highlights
//   tulip_notes_v1       sermon/scripture notes
//
// Keys NOT synced (device-local preferences):
//   ryc-theme, ryc-device-mode, ryc-scripture-font, tulip_notif_enabled, etc.

import { createClient } from "./supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── Keys to sync ─────────────────────────────────────────────────────────────

const SYNC_PREFIXES = [
  // Reading data
  "ryc-vcolor-",
  "ryc-chapter-note-",
  "axiom-hl-bible-",
  "ryc-bookmarks",
  "ryc-last-position",
  "ryc-translation",
  // Church & study
  "tulip-church-analyses",
  // Family worship
  "axiom-fw-prayers",
  "axiom-fw-date",
  // Progress & badges
  "tulip_badges_earned_v1",
  "tulip_scripture_shares_v1",
  "tulip_bible_tracker_v1",
  // Highlights (library books & historical documents) and sermon notes
  "tulip-reader-highlights:",
  "tulip_notes_v1",
  // Account & preferences
  "tulip_user_name",
  "ryc-lang",
  "tulip_onboarded",
  "ryc-android-mode",
];

function isSyncKey(key: string): boolean {
  return SYNC_PREFIXES.some((p) => key.startsWith(p));
}

function getAllSyncableLocalStorage(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isSyncKey(key)) {
        const value = localStorage.getItem(key);
        if (value !== null) result[key] = value;
      }
    }
  } catch { /* */ }
  return result;
}

// ─── Upload all local data to Supabase ───────────────────────────────────────

export async function pushToCloud(user: User): Promise<void> {
  const supabase = createClient();
  const localData = getAllSyncableLocalStorage();
  if (Object.keys(localData).length === 0) return;

  const rows = Object.entries(localData).map(([storage_key, value]) => ({
    user_id: user.id,
    storage_key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("user_sync_data")
    .upsert(rows, { onConflict: "user_id,storage_key" });

  if (error) console.error("[cloudSync] push error:", error.message);
}

// ─── Pull cloud data into localStorage ───────────────────────────────────────

export async function pullFromCloud(user: User): Promise<void> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_sync_data")
    .select("storage_key, value")
    .eq("user_id", user.id);

  if (error) {
    console.error("[cloudSync] pull error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    // No cloud data yet — push local data up
    await pushToCloud(user);
    return;
  }

  // Merge: cloud wins for keys that exist in cloud; keep local-only keys
  // Exception: device-preference keys where local value is the source of truth.
  // If local already has a value for these keys, don't overwrite with cloud
  // (the toggle handler calls syncKey() immediately, so cloud stays in sync).
  const LOCAL_WINS_KEYS = new Set(["ryc-last-position"]);

  try {
    for (const row of data) {
      if (row.storage_key && row.value !== null) {
        if (LOCAL_WINS_KEYS.has(row.storage_key) && localStorage.getItem(row.storage_key) !== null) {
          continue; // local value wins — cloud stays in sync via syncKey() on toggle
        }
        localStorage.setItem(row.storage_key, row.value);
      }
    }
    // Push any local keys that aren't in cloud yet
    const cloudKeys = new Set(data.map((r: { storage_key: string }) => r.storage_key));
    const localData = getAllSyncableLocalStorage();
    const missingRows = Object.entries(localData)
      .filter(([k]) => !cloudKeys.has(k))
      .map(([storage_key, value]) => ({
        user_id: user.id,
        storage_key,
        value,
        updated_at: new Date().toISOString(),
      }));
    if (missingRows.length > 0) {
      await supabase
        .from("user_sync_data")
        .upsert(missingRows, { onConflict: "user_id,storage_key" });
    }
  } catch { /* */ }
}

// ─── Upsert a single key to cloud (call after any data change) ────────────────

export async function syncKey(storageKey: string, value: string | null): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (value === null) {
    // Key was removed — delete from cloud
    await supabase
      .from("user_sync_data")
      .delete()
      .eq("user_id", user.id)
      .eq("storage_key", storageKey);
  } else {
    await supabase
      .from("user_sync_data")
      .upsert(
        { user_id: user.id, storage_key: storageKey, value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,storage_key" }
      );
  }
}

// ─── Get current user (returns null if not logged in) ────────────────────────

export async function getCloudUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
