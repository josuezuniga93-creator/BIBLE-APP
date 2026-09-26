// app/lib/cloudSync.ts
// Local-first Supabase sync for cross-device access.
//
// The app must never wait on profile sync to feel usable. Screens read/write
// localStorage immediately; this module fills missing local data from cloud and
// repairs cloud in the background when local data is newer or different.

import { createClient } from "./supabase/client";
import type { User } from "@supabase/supabase-js";
import { isSyncableStorageKey as isSyncKey } from "./storageKeys";
export { isSyncableStorageKey } from "./storageKeys";

const PENDING_SYNC_KEY = "tulip_sync_pending_v1";
const SYNC_BASELINE_KEY = "tulip_sync_baseline_v1";
const SYNC_OWNER_KEY = "tulip_sync_owner_v1";
export const SYNC_STATUS_EVENT = "tulip-cloud-sync-status";
export const SYNC_COMPLETE_EVENT = "tulip-cloud-sync-complete";

type PendingSyncValue = {
  value: string | null;
  updatedAt: string;
};

export type SyncStatus = "idle" | "syncing" | "done" | "error";

let flushTimer: number | null = null;
let backgroundSyncStarted = false;
let storageBridgeInstalled = false;
let applyingCloudData = false;
let activeSync: Promise<void> | null = null;
let currentStatus: SyncStatus = "idle";

export function getSyncStatus(): SyncStatus { return currentStatus; }

function assertAccount(user: User) {
  const owner = localStorage.getItem(SYNC_OWNER_KEY);
  if (owner && owner !== user.id) {
    throw new Error("This device has reading data from another account. Export a backup before switching accounts.");
  }
  localStorage.setItem(SYNC_OWNER_KEY, user.id);
}

function readBaseline(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(SYNC_BASELINE_KEY) || "{}"); }
  catch { return {}; }
}

function fingerprint(value: string | null): string {
  if (value === null) return "deleted";
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `${value.length}:${hash >>> 0}`;
}

function rememberSynced(key: string, value: string | null) {
  const baseline = readBaseline();
  if (value === null) delete baseline[key];
  else baseline[key] = fingerprint(value);
  localStorage.setItem(SYNC_BASELINE_KEY, JSON.stringify(baseline));
}

function preserveConflict(key: string, value: string) {
  const keyName = "tulip_sync_conflicts_v1";
  let conflicts: Array<{ key: string; value: string; savedAt: string }> = [];
  try { conflicts = JSON.parse(localStorage.getItem(keyName) || "[]"); } catch { /* first backup */ }
  if (!Array.isArray(conflicts)) conflicts = [];
  if (!conflicts.some((item) => item.key === key && item.value === value)) {
    localStorage.setItem(keyName, JSON.stringify([...conflicts, { key, value, savedAt: new Date().toISOString() }]));
  }
}

function applyCloudValue(key: string, value: string | null) {
  applyingCloudData = true;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    rememberSynced(key, value);
  } finally { applyingCloudData = false; }
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
  currentStatus = status;
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
    syncReadingData().catch((err) => {
      console.error("[cloudSync] flush error:", err);
      emitSyncStatus("error");
    });
  }, delay);
}

async function flushPendingSyncForUser(user: User): Promise<void> {
  assertAccount(user);
  const pending = readPendingSync();
  const entries = Object.entries(pending).filter(([key]) => isSyncKey(key));
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
    rememberSynced(storageKey, item.value);
    if (latestPending[storageKey]?.updatedAt === item.updatedAt && latestPending[storageKey]?.value === item.value) {
      delete latestPending[storageKey];
    }
  }
  writePendingSync(latestPending);
}

export async function flushPendingSync(): Promise<void> {
  await syncReadingData();
}

// Upload all local data to Supabase. Used when a profile has no cloud data yet.
export async function pushToCloud(user: User): Promise<void> {
  assertAccount(user);
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

  if (error) throw error;
  for (const [key, value] of Object.entries(localData)) rememberSynced(key, value);
}

// Pull cloud data into localStorage without overwriting existing local state.
export async function pullFromCloud(user: User): Promise<void> {
  assertAccount(user);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_sync_data")
    .select("storage_key, value, updated_at")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
  const rows = data ?? [];
  const baseline = readBaseline();
  try {
    let filledMissingLocalData = false;

    for (const row of rows) {
      if (!row.storage_key || row.value === null || !isSyncKey(row.storage_key)) continue;

      const localValue = localStorage.getItem(row.storage_key);
      const pending = readPendingSync()[row.storage_key];
      if (pending) {
        if (localValue !== row.value) preserveConflict(row.storage_key, row.value);
        continue;
      }
      if (localValue === row.value) {
        rememberSynced(row.storage_key, row.value);
      } else if (localValue === null || baseline[row.storage_key] === fingerprint(localValue)) {
        applyCloudValue(row.storage_key, row.value);
        filledMissingLocalData = true;
      } else if (localValue !== row.value) {
        preserveConflict(row.storage_key, row.value);
        queuePendingSync(row.storage_key, localValue);
      }
    }

    const cloudKeys = new Set(rows.map((row: { storage_key: string }) => row.storage_key));
    const localData = getAllSyncableLocalStorage();
    for (const [storageKey, value] of Object.entries(localData)) {
      if (cloudKeys.has(storageKey) || readPendingSync()[storageKey]) continue;
      if (baseline[storageKey] === fingerprint(value)) {
        applyCloudValue(storageKey, null);
        filledMissingLocalData = true;
      } else {
        queuePendingSync(storageKey, value);
      }
    }

    await flushPendingSyncForUser(user);
    if (filledMissingLocalData) emitSyncComplete();
  } catch (err) {
    console.error("[cloudSync] merge error:", err);
    throw err;
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
    const changed = this.getItem(key) !== String(value);
    nativeSetItem.call(this, key, value);
    if (changed && !applyingCloudData && this === window.localStorage && isSyncKey(key)) {
      queuePendingSync(key, value);
      scheduleCloudFlush();
    }
  };

  Storage.prototype.removeItem = function removeItemWithCloudQueue(key: string) {
    nativeRemoveItem.call(this, key);
    if (!applyingCloudData && this === window.localStorage && isSyncKey(key)) {
      queuePendingSync(key, null);
      scheduleCloudFlush();
    }
  };
}

export function startBackgroundCloudSync(): void {
  if (typeof window === "undefined" || backgroundSyncStarted) return;
  backgroundSyncStarted = true;
  installLocalStorageSyncBridge();

  window.setTimeout(() => { syncReadingData().catch(() => {}); }, 300);
  window.addEventListener("online", () => scheduleCloudFlush(250));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleCloudFlush(250);
  });
  window.addEventListener("storage", (event) => {
    if (event.key && isSyncKey(event.key)) emitSyncComplete();
  });
}

export function syncReadingData(): Promise<void> {
  if (activeSync) return activeSync;
  activeSync = (async () => {
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
  })().finally(() => {
    activeSync = null;
    if (currentStatus === "done" && Object.keys(readPendingSync()).length > 0) scheduleCloudFlush();
  });
  return activeSync;
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
