/**
 * Firebase Configuration für Push-Benachrichtigungen
 * 
 * WICHTIG: Du musst ein Firebase-Projekt erstellen und die Config hier eintragen!
 * 
 * Anleitung:
 * 1. Gehe zu https://console.firebase.google.com/
 * 2. Erstelle ein neues Projekt oder wähle ein bestehendes
 * 3. Gehe zu Project Settings → General → Your apps → Web App hinzufügen
 * 4. Kopiere die Firebase Config (apiKey, authDomain, etc.)
 * 5. Trage sie hier ein oder verwende Environment Variables
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase Config - Wird aus Environment Variables geladen
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase (nur einmal)
let app: FirebaseApp | undefined;
if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else if (getApps().length > 0) {
  app = getApps()[0];
}

// Messaging Instance (nur im Browser)
let messaging: Messaging | null = null;
if (typeof window !== "undefined" && app && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging konnte nicht initialisiert werden:", error);
  }
}

/**
 * Registriert den Service Worker und fordert Push-Permission an
 */
export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !messaging) {
    return null;
  }

  try {
    // Service Worker registrieren
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    
    // FCM Token anfordern
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    console.error("Fehler beim Anfordern des Push-Tokens:", error);
    return null;
  }
}

/**
 * Hört auf eingehende Push-Nachrichten (wenn App geöffnet ist)
 */
export function onMessageListener(): Promise<any> {
  return new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

export { messaging, app };
