/**
 * Service Worker für Offline-Funktionalität
 * Cached alle App-Dateien für Offline-Verfügbarkeit
 */

const CACHE_NAME = "studyflow-v1";
const RUNTIME_CACHE = "studyflow-runtime-v1";

// Dateien, die beim Installieren gecacht werden sollen
const PRECACHE_ASSETS = [
  "/",
  "/planer",
  "/kalender",
  "/faecher",
  "/fortschritt",
  "/woche",
  "/tierwelt",
  "/einstellungen",
];

// Install Event - Cache wichtige Dateien
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installiert");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching Assets");
      // Cache nur die wichtigsten Routen
      return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    })
  );
  
  // Sofort aktivieren, ohne auf andere SWs zu warten
  self.skipWaiting();
});

// Activate Event - Alte Caches löschen
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker aktiviert");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log("[SW] Lösche alten Cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Übernehme sofort die Kontrolle über alle Clients
  return self.clients.claim();
});

// Fetch Event - Cache-Strategie
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignoriere Firebase Messaging Service Worker
  if (url.pathname.includes("firebase-messaging-sw.js")) {
    return;
  }

  // Ignoriere nicht-GET Requests
  if (request.method !== "GET") {
    return;
  }

  // Ignoriere externe Requests (außer unsere API)
  if (url.origin !== self.location.origin && !url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache-Strategie: Network First, dann Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Wenn erfolgreich, cache die Antwort
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Wenn Netzwerk fehlschlägt, versuche aus Cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Wenn es eine Navigation ist, gib die Startseite zurück
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          
          // Sonst gib eine leere Response zurück
          return new Response("Offline - Keine Verbindung", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
      })
  );
});

// Message Event - Für Kommunikation mit der App
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
