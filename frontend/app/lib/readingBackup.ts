import { isBackupStorageKey } from "./storageKeys";

export interface ReadingBackup {
  app: "Tulip Bible";
  version: 1;
  createdAt: string;
  data: Record<string, string>;
}

export function createReadingBackup(storage: Storage): ReadingBackup {
  const data: Record<string, string> = {};
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key || !isBackupStorageKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: "Tulip Bible", version: 1, createdAt: new Date().toISOString(), data };
}

export function downloadReadingBackup(): void {
  const backup = createReadingBackup(localStorage);
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `tulip-reading-backup-${backup.createdAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
