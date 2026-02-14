"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageProvider";
import {
  isNotificationEnabled,
  getNotificationPermission,
  scheduleSessionNotification,
  scheduleDailyMotivation,
  showNotification,
} from "@/lib/notifications";
import { format } from "date-fns";

/**
 * Verwaltet alle Benachrichtigungen im Hintergrund
 */
export function NotificationManager() {
  const { sessions, streak, lastVisitDate, checkAndUpdateStreak, getSubjectById } = useStore();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isNotificationEnabled() || getNotificationPermission() !== "granted") {
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const todaySessions = sessions.filter(
      (s) => s.date === today && !s.completed
    );

    // Session-Erinnerungen für heute planen
    todaySessions.forEach((session) => {
      const subject = getSubjectById(session.subjectId);
      const subjectName = subject?.name || "Study Session";
      scheduleSessionNotification(
        subjectName,
        session.startTime,
        session.date,
        t.notifications.sessionReminder
      );
    });

    // Tägliche Motivationsnachricht planen
    scheduleDailyMotivation(t.notifications.dailyMotivation);

    // Streak-Warnung (wenn Streak > 0 und heute noch nicht besucht)
    if (streak > 0 && lastVisitDate !== today) {
      const now = new Date();
      const eveningTime = new Date();
      eveningTime.setHours(20, 0, 0, 0);
      
      if (now < eveningTime) {
        const delay = eveningTime.getTime() - now.getTime();
        setTimeout(() => {
          showNotification({
            title: "🔥 StudyFlow",
            body: t.notifications.streakWarning,
            tag: "streak-warning",
          });
        }, delay);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, streak, lastVisitDate, t]);

  // Streak-Erfolg beim Laden prüfen (nur einmal)
  useEffect(() => {
    if (!isNotificationEnabled() || getNotificationPermission() !== "granted") {
      return;
    }

    // Kleine Verzögerung, damit StreakPopup zuerst kommt
    const timer = setTimeout(() => {
      if (streak > 1 && lastVisitDate === format(new Date(), "yyyy-MM-dd")) {
        showNotification({
          title: "🔥 Streak Update!",
          body: t.notifications.streakSuccess.replace(
            "{count}",
            streak.toString()
          ),
          tag: "streak-success",
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Nur einmal beim Mount

  return null;
}
