"use client";

import { useEffect, useState } from "react";
import { getSyncStatus, SYNC_STATUS_EVENT, syncReadingData, type SyncStatus } from "../lib/cloudSync";
import { downloadReadingBackup } from "../lib/readingBackup";
import { useLanguage } from "../lib/useLanguage";
import { UiIcon } from "./UiIcon";

export function ReadingDataTools() {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [online, setOnline] = useState(true);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    setStatus(getSyncStatus());
    const sync = (event: Event) => setStatus((event as CustomEvent<{ status: SyncStatus }>).detail.status);
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener(SYNC_STATUS_EVENT, sync);
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    return () => {
      window.removeEventListener(SYNC_STATUS_EVENT, sync);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, []);

  const statusText = !online
    ? (es ? "Sin conexión. Tus cambios se guardan en este dispositivo." : "Offline. Your changes are saved on this device.")
    : status === "done"
      ? (es ? "Sincronizado con tu cuenta." : "Synced with your account.")
      : status === "syncing"
        ? (es ? "Sincronizando tus lecturas..." : "Syncing your reading data...")
        : status === "error"
          ? (es ? "Guardado en este dispositivo. La sincronización necesita atención." : "Saved on this device. Cloud sync needs attention.")
          : (es ? "Guardado en este dispositivo. Inicia sesión para sincronizar." : "Saved on this device. Sign in to sync across devices.");

  return (
    <section className="reading-data-tools" aria-labelledby="reading-data-title">
      <h2 id="reading-data-title">{es ? "Tus lecturas" : "Your reading data"}</h2>
      <p role="status">{statusText}</p>
      {status === "error" && online && (
        <button type="button" onClick={() => { syncReadingData().catch(() => {}); }}>
          <UiIcon name="history" />{es ? "Reintentar sincronización" : "Retry sync"}
        </button>
      )}
      <button type="button" onClick={() => {
        try {
          downloadReadingBackup();
          setFeedback(es ? "Copia de seguridad descargada." : "Backup downloaded.");
        } catch {
          setFeedback(es ? "No se pudo descargar. Vuelve a intentarlo." : "Could not download your backup. Please try again.");
        }
      }}>
        <UiIcon name="upload" style={{ transform: "rotate(180deg)" }} />
        {es ? "Descargar copia de seguridad" : "Download reading backup"}
      </button>
      <p>{es ? "Notas, resaltados, favoritos y progreso de lectura." : "Notes, highlights, favorites, and reading progress."}</p>
      <p className="sr-only" aria-live="polite">{feedback}</p>
    </section>
  );
}
