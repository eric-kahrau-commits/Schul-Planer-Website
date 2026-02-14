/**
 * Service Worker für Firebase Cloud Messaging (Push-Benachrichtigungen)
 * 
 * Dieser Service Worker läuft im Hintergrund und empfängt Push-Benachrichtigungen,
 * auch wenn die Website nicht geöffnet ist.
 */

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase Config - MUSS mit der Config im Frontend übereinstimmen
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);

// Messaging Instance
const messaging = firebase.messaging();

// Hintergrund-Nachrichten empfangen (wenn App geschlossen ist)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Hintergrund-Nachricht empfangen:", payload);

  const notificationTitle = payload.notification?.title || "StudyFlow";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: payload.data?.tag || "default",
    data: payload.data || {},
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Benachrichtigung anklicken → App öffnen
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Benachrichtigung angeklickt:", event);

  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Wenn bereits ein Fenster geöffnet ist, fokussiere es
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Sonst öffne ein neues Fenster
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
