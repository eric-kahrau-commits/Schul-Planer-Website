/**
 * Notification Service für motivierende Benachrichtigungen
 */

const NOTIFICATION_KEY = "studyflow_notifications_enabled";

export function isNotificationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(NOTIFICATION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setNotificationEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATION_KEY, enabled ? "true" : "false");
  } catch {}
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function showNotification(options: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted" || !isNotificationEnabled()) {
    return;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/favicon.ico",
      badge: options.badge || "/favicon.ico",
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error("Failed to show notification:", error);
  }
}

/**
 * Plant eine Benachrichtigung für eine geplante Session
 * Wird automatisch 5 Minuten vor Start ausgelöst
 */
export function scheduleSessionNotification(
  subjectName: string,
  startTime: string,
  date: string,
  messageTemplate?: string
) {
  if (typeof window === "undefined") return;

  const [hours, minutes] = startTime.split(":").map(Number);
  const sessionDate = new Date(date + "T" + startTime + ":00");
  
  // Benachrichtigung 5 Minuten vor Start
  const notificationTime = new Date(sessionDate.getTime() - 5 * 60 * 1000);
  const now = new Date();

  // Nur planen, wenn die Zeit in der Zukunft liegt und heute ist
  if (notificationTime <= now || date !== now.toISOString().split("T")[0]) {
    return;
  }

  const delay = notificationTime.getTime() - now.getTime();

  // Maximal 24 Stunden im Voraus planen (Browser-Limit)
  if (delay > 24 * 60 * 60 * 1000) {
    return;
  }

  setTimeout(() => {
    const body = messageTemplate
      ? messageTemplate.replace("{subject}", subjectName).replace("{time}", startTime)
      : `${subjectName} starts at ${startTime}`;
    
    showNotification({
      title: "📚 Study Session Starting Soon",
      body,
      tag: `session-${date}-${startTime}`,
    });
  }, delay);
}

/**
 * Tägliche Motivationsnachricht basierend auf Tageszeit
 */
export function scheduleDailyMotivation(
  messages: {
    morning: string;
    afternoon: string;
    evening: string;
  }
) {
  if (typeof window === "undefined") return;

  const now = new Date();
  const hour = now.getHours();

  let message = messages.afternoon;
  let delay = 0;

  if (hour < 12) {
    // Morgen: nächste Stunde um 9:00
    const morningTime = new Date();
    morningTime.setHours(9, 0, 0, 0);
    if (morningTime <= now) {
      morningTime.setDate(morningTime.getDate() + 1);
    }
    delay = morningTime.getTime() - now.getTime();
    message = messages.morning;
  } else if (hour < 18) {
    // Nachmittag: nächste Stunde um 14:00
    const afternoonTime = new Date();
    afternoonTime.setHours(14, 0, 0, 0);
    if (afternoonTime <= now) {
      afternoonTime.setDate(afternoonTime.getDate() + 1);
    }
    delay = afternoonTime.getTime() - now.getTime();
    message = messages.afternoon;
  } else {
    // Abend: nächste Stunde um 20:00
    const eveningTime = new Date();
    eveningTime.setHours(20, 0, 0, 0);
    if (eveningTime <= now) {
      eveningTime.setDate(eveningTime.getDate() + 1);
    }
    delay = eveningTime.getTime() - now.getTime();
    message = messages.evening;
  }

  setTimeout(() => {
    showNotification({
      title: "💪 StudyFlow",
      body: message,
      tag: "daily-motivation",
    });
  }, delay);
}
