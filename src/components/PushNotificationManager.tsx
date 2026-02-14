"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";
import { useStore } from "@/lib/store";
import {
  requestPushPermission,
  onMessageListener,
} from "@/lib/firebase";
import {
  registerPushSubscription,
  unregisterPushSubscription,
  isPushEnabled,
  loadPushSubscription,
} from "@/lib/pushNotifications";

/**
 * Verwaltet Push-Benachrichtigungen
 * - Hört auf eingehende Nachrichten (wenn App geöffnet ist)
 * - Zeigt Browser-Benachrichtigungen an
 */
export function PushNotificationManager() {
  const { t } = useLanguage();
  const { streak, lastVisitDate } = useStore();
  const [isListening, setIsListening] = useState(false);

  // Höre auf eingehende Push-Nachrichten (wenn App geöffnet ist)
  useEffect(() => {
    if (!isPushEnabled()) return;

    const setupMessageListener = async () => {
      try {
        const payload = await onMessageListener();
        if (payload) {
          // Zeige Browser-Benachrichtigung
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(payload.notification?.title || "StudyFlow", {
              body: payload.notification?.body || "",
              icon: "/favicon.ico",
              tag: payload.data?.tag || "default",
              data: payload.data || {},
            });
          }
        }
        setIsListening(true);
      } catch (error) {
        console.error("Fehler beim Einrichten des Message Listeners:", error);
      }
    };

    setupMessageListener();
  }, []);

  return null;
}

/**
 * Hook für Push-Benachrichtigungen in Komponenten
 */
export function usePushNotifications() {
  const { t } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prüfe Browser-Support
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);
    setIsEnabled(isPushEnabled());
  }, []);

  const enable = async () => {
    if (!isSupported) {
      setError(t.settings.pushNotSupported);
      return false;
    }

    setIsRequesting(true);
    setError(null);

    try {
      // 1. Browser-Berechtigung anfordern
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError(t.settings.pushPermissionRequested);
          setIsRequesting(false);
          return false;
        }
      }

      if (Notification.permission !== "granted") {
        setError(t.settings.permissionDenied);
        setIsRequesting(false);
        return false;
      }

      // 2. FCM Token anfordern
      const token = await requestPushPermission();
      if (!token) {
        setError("Fehler beim Anfordern des Push-Tokens");
        setIsRequesting(false);
        return false;
      }

      // 3. Token an Server senden
      const success = await registerPushSubscription(token);
      if (!success) {
        setError("Fehler beim Registrieren der Push-Subscription");
        setIsRequesting(false);
        return false;
      }

      setIsEnabled(true);
      setIsRequesting(false);
      return true;
    } catch (err: any) {
      console.error("Fehler beim Aktivieren von Push-Benachrichtigungen:", err);
      setError(err.message || "Unbekannter Fehler");
      setIsRequesting(false);
      return false;
    }
  };

  const disable = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      await unregisterPushSubscription();
      setIsEnabled(false);
      setIsRequesting(false);
      return true;
    } catch (err: any) {
      console.error("Fehler beim Deaktivieren von Push-Benachrichtigungen:", err);
      setError(err.message || "Unbekannter Fehler");
      setIsRequesting(false);
      return false;
    }
  };

  return {
    isSupported,
    isEnabled,
    isRequesting,
    error,
    enable,
    disable,
  };
}
