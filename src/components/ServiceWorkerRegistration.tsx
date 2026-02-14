"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";

/**
 * Registriert den Service Worker beim Laden der App
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker({
      onSuccess: (registration) => {
        console.log("[SW] Service Worker erfolgreich registriert:", registration);
      },
      onUpdate: (registration) => {
        console.log("[SW] Neuer Service Worker verfügbar");
        // Optional: Zeige dem Nutzer eine Nachricht, dass ein Update verfügbar ist
        // und lade die Seite neu, wenn er darauf klickt
        if (confirm("Neue Version verfügbar! Seite neu laden?")) {
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          window.location.reload();
        }
      },
    });
  }, []);

  return null;
}
