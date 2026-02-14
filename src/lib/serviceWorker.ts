/**
 * Service Worker Registration und Management
 */

const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" ||
   window.location.hostname === "[::1]");

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function registerServiceWorker(config?: Config) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("[SW] Service Worker wird nicht unterstützt");
    return;
  }

  const publicUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin, window.location.href);
  
  if (publicUrl.origin !== window.location.origin) {
    return;
  }

  window.addEventListener("load", () => {
    const swUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/sw.js`;

    if (isLocalhost) {
      // Localhost: Prüfe ob Service Worker existiert
      checkValidServiceWorker(swUrl, config);
      
      // Zusätzlich: Log für Entwickler
      navigator.serviceWorker.ready.then(() => {
        console.log("[SW] Service Worker läuft auf localhost");
      });
    } else {
      // Produktion: Registriere Service Worker
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // Neuer Service Worker verfügbar
              console.log("[SW] Neuer Inhalt verfügbar. Seite neu laden für Update.");
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Service Worker installiert
              console.log("[SW] Inhalt für Offline-Verfügbarkeit gecacht.");
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("[SW] Fehler beim Registrieren des Service Workers:", error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Prüfe ob Service Worker existiert
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // Kein Service Worker gefunden
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service Worker gefunden, registriere ihn
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log("[SW] Keine Internetverbindung. App läuft im Offline-Modus.");
    });
}

export function unregisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
    })
    .catch((error) => {
      console.error(error.message);
    });
}
