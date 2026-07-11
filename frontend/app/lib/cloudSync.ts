// app/lib/cloudSync.ts
// Local-first Supabase sync for cross-device access.
//
// The app must never wait on profile sync to feel usable. Screens read/write
// localStorage immediately; this module fills missing local data from cloud and
// repairs cloud in the background when local data is newer or different.

import { createClient } from "./supabase/client";
import type { User } from "@supabase/supabase-js";

const SYNC_PREFIXES = [
  // Scripture reading, highlights, notes, bookmarks
  "ryc-vcolor-",
  "ryc-chapter-note-",
  "axiom-hl-",
  "ryc-bookmarks",
  "tulip_bookmarks",
  "tulip_bookmark_categories",
  "ryc-collections",
  "ryc-last-position",
  "ryc-translation",

  // Church, family worship, study, books, historical documents
  "tulip-church-analyses",
  "axiom-fw-prayers",
  "axiom-fw-date",
  "tulip-reader-highlights:",
  "tulip-matthew-henry-highlights",
  "tulip-unified-highlights-v1",
  "tulip-study-tools-continue-reading",
  "axiom-progress-",
  "axiom-bookmark-",
  "tulip_notes_v1",

  // Progress, badges, account preferences
  "tulip_badges_earned_v1",
  "tulip_scripture_shares_v1",
  "tulip_bible_tracker_v1",
  "tulip_user_name",
  "ryc-lang",
  "tulip_onboarded",
  "ryc-android-mode",
];

const PENDING_SYNC_KEY = "tulip_sync_pending_v1";
export const SYNC_STATUS_EVENT = "tulip-cloud-sync-status";
export const SYNC_COMPLETE_EVENT = "tulip-cloud-sync-complete";

type PendingSyncValue = {
  value: string | null;
  updatedAt: string;
};

type SyncStatus = "idle" | "syncing" | "done" | "error";

let flushTimer: number | null = null;
let backgroundSyncStarted = false;
let storageBridgeInstalled = false;

function isSyncKey(key: string): boolean {
  return SYNC_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function isSyncableStorageKey(key: string): boolean {
  return isSyncKey(key);
}

function getAllSyncableLocalStorage(): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof window === "undefined") return result;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !isSyncKey(key)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) result[key] = value;
    }
  } catch {
    // Keep the app usable if localStorage is unavailable.
  }

  return result;
}

function emitSyncStatus(status: SyncStatus): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SYNC_STATUS_EVENT, { detail: { status } }));
}

function emitSyncComplete(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SYNC_COMPLETE_EVENT));
}

function readPendingSync(): Record<string, PendingSyncValue> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePendingSync(pending: Record<string, PendingSyncValue>): void {
  if (typeof window === "undefined") return;

  try {
    if (Object.keys(pending).length === 0) {
      localStorage.removeItem(PENDING_SYNC_KEY);
      return;
    }
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  } catch {
    // Sync queue is best-effort; local app state still wins.
  }
}

function queuePendingSync(storageKey: string, value: string | null): void {
  if (!isSyncKey(storageKey)) return;
  const pending = readPendingSync();
  pending[storageKey] = { value, updatedAt: new Date().toISOString() };
  writePendingSync(pending);
}

export function scheduleCloudFlush(delay = 800): void {
  if (typeof window === "undefined") return;
  if (flushTimer) window.clearTimeout(flushTimer);

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flushPendingSync().catch((err) => {
      console.error("[cloudSync] flush error:", err);
      emitSyncStatus("error");
    });
  }, delay);
}

async function flushPendingSyncForUser(user: User): Promise<void> {
  const pending = readPendingSync();
  const entries = Object.entries(pending);
  if (entries.length === 0) return;

  const supabase = createClient();
  const upsertRows = entries
    .filter(([, item]) => item.value !== null)
    .map(([storage_key, item]) => ({
      user_id: user.id,
      storage_key,
      value: item.value as string,
      updated_at: item.updatedAt,
    }));

  const deleteKeys = entries
    .filter(([, item]) => item.value === null)
    .map(([storageKey]) => storageKey);

  if (upsertRows.length > 0) {
    const { error } = await supabase
      .from("user_sync_data")
      .upsert(upsertRows, { onConflict: "user_id,storage_key" });
    if (error) throw error;
  }

  if (deleteKeys.length > 0) {
    const { error } = await supabase
      .from("user_sync_data")
      .delete()
      .eq("user_id", user.id)
      .in("storage_key", deleteKeys);
    if (error) throw error;
  }

  const latestPending = readPendingSync();
  for (const [storageKey, item] of entries) {
    if (latestPending[storageKey]?.updatedAt === item.updatedAt) {
      delete latestPending[storageKey];
    }
  }
  writePendingSync(latestPending);
}

export async function flushPendingSync(): Promise<void> {
  const user = await getCloudUser();
  if (!user) return;
  await flushPendingSyncForUser(user);
}

// Upload all local data to Supabase. Used when a profile has no cloud data yet.
export async function pushToCloud(user: User): Promise<void> {
  const supabase = createClient();
  const localData = getAllSyncableLocalStorage();
  if (Object.keys(localData).length === 0) return;

  const now = new Date().toISOString();
  const rows = Object.entries(localData).map(([storage_key, value]) => ({
    user_id: user.id,
    storage_key,
    value,
    updated_at: now,
  }));

  const { error } = await supabase
    .from("user_sync_data")
    .upsert(rows, { onConflict: "user_id,storage_key" });

  if (error) console.error("[cloudSync] push error:", error.message);
}

// Pull cloud data into localStorage without overwriting existing local state.
export async function pullFromCloud(user: User): Promise<void> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_sync_data")
    .select("storage_key, value, updated_at")
    .eq("user_id", user.id);

  if (error) {
    console.error("[cloudSync] pull error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    await pushToCloud(user);
    return;
  }

  try {
    let filledMissingLocalData = false;

    for (const row of data) {
      if (!row.storage_key || row.value === null || !isSyncKey(row.storage_key)) continue;

      const localValue = localStorage.getItem(row.storage_key);
      if (localValue === null) {
        localStorage.setItem(row.storage_key, row.value);
        filledMissingLocalData = true;
      } else if (localValue !== row.value) {
        queuePendingSync(row.storage_key, localValue);
      }
    }

    const cloudKeys = new Set(data.map((row: { storage_key: string }) => row.storage_key));
    const localData = getAllSyncableLocalStorage();
    for (const [storageKey, value] of Object.entries(localData)) {
      if (!cloudKeys.has(storageKey)) queuePendingSync(storageKey, value);
    }

    await flushPendingSyncForUser(user);
    if (filledMissingLocalData) emitSyncComplete();
  } catch (err) {
    console.error("[cloudSync] merge error:", err);
  }
}

// Queue a single localStorage key for background sync.
export async function syncKey(storageKey: string, value: string | null): Promise<void> {
  queuePendingSync(storageKey, value);
  scheduleCloudFlush();
}

function installLocalStorageSyncBridge(): void {
  if (typeof window === "undefined" || storageBridgeInstalled) return;
  storageBridgeInstalled = true;

  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function setItemWithCloudQueue(key: string, value: string) {
    nativeSetItem.call(this, key, value);
    if (this === window.localStorage && isSyncKey(key)) {
      queuePendingSync(key, value);
      scheduleCloudFlush();
    }
  };

  Storage.prototype.removeItem = function removeItemWithCloudQueue(key: string) {
    nativeRemoveItem.call(this, key);
    if (this === window.localStorage && isSyncKey(key)) {
      queuePendingSync(key, null);
      scheduleCloudFlush();
    }
  };
}

export function startBackgroundCloudSync(): void {
  if (typeof window === "undefined" || backgroundSyncStarted) return;
  backgroundSyncStarted = true;
  installLocalStorageSyncBridge();

  const run = async () => {
    emitSyncStatus("syncing");
    try {
      const user = await getCloudUser();
      if (!user) {
        emitSyncStatus("idle");
        return;
      }
      await pullFromCloud(user);
      await flushPendingSyncForUser(user);
      emitSyncStatus("done");
    } catch (err) {
      console.error("[cloudSync] background sync error:", err);
      emitSyncStatus("error");
    }
  };

  window.setTimeout(() => {
    run().catch((err) => {
      console.error("[cloudSync] background sync error:", err);
      emitSyncStatus("error");
    });
  }, 300);

  window.addEventListener("online", () => scheduleCloudFlush(250));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleCloudFlush(250);
  });
}

export async function getCloudUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
