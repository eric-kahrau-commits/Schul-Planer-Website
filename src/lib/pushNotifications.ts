/**
 * Push-Benachrichtigungen Management
 * Verwaltet Push-Subscriptions und sendet Benachrichtigungen
 */

const PUSH_SUBSCRIPTION_KEY = "studyflow_push_subscription";

export interface PushSubscriptionData {
  token: string;
  subscribedAt: string;
  notificationTimes: {
    morning: string; // z.B. "08:00"
    evening: string; // z.B. "20:00"
  };
}

/**
 * Speichert die Push-Subscription im LocalStorage
 */
export function savePushSubscription(data: PushSubscriptionData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PUSH_SUBSCRIPTION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Fehler beim Speichern der Push-Subscription:", error);
  }
}

/**
 * Lädt die Push-Subscription aus LocalStorage
 */
export function loadPushSubscription(): PushSubscriptionData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(PUSH_SUBSCRIPTION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Entfernt die Push-Subscription
 */
export function removePushSubscription() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PUSH_SUBSCRIPTION_KEY);
  } catch (error) {
    console.error("Fehler beim Entfernen der Push-Subscription:", error);
  }
}

/**
 * Prüft, ob Push-Benachrichtigungen aktiviert sind
 */
export function isPushEnabled(): boolean {
  return loadPushSubscription() !== null;
}

/**
 * Sendet Push-Subscription an den Server
 */
export async function registerPushSubscription(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error("Fehler beim Registrieren der Push-Subscription");
    }

    const subscription: PushSubscriptionData = {
      token,
      subscribedAt: new Date().toISOString(),
      notificationTimes: {
        morning: "08:00",
        evening: "20:00",
      },
    };

    savePushSubscription(subscription);
    return true;
  } catch (error) {
    console.error("Fehler beim Registrieren der Push-Subscription:", error);
    return false;
  }
}

/**
 * Entfernt Push-Subscription vom Server
 */
export async function unregisterPushSubscription(): Promise<boolean> {
  try {
    const subscription = loadPushSubscription();
    if (!subscription) return true;

    const response = await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: subscription.token }),
    });

    removePushSubscription();
    return response.ok;
  } catch (error) {
    console.error("Fehler beim Entfernen der Push-Subscription:", error);
    return false;
  }
}
