"use client";

import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageProvider";
import { format, isToday } from "date-fns";
import { de, enUS, fr } from "date-fns/locale";
import Link from "next/link";
import { SessionFeedbackModal } from "@/components/SessionFeedbackModal";
import { LearningInsightsCard } from "@/components/LearningInsightsCard";
import { CoinEarnedModal } from "@/components/CoinEarnedModal";
import { StreakPopup } from "@/components/StreakPopup";
import { AchievementModal } from "@/components/AchievementModal";
import type { FeedbackDifficulty } from "@/lib/types";
import type { CoinRewardBreakdown } from "@/lib/coinRewards";
import type { Achievement } from "@/lib/achievements";
import { useEffect, useState } from "react";
import { showNotification, isNotificationEnabled, getNotificationPermission } from "@/lib/notifications";

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export default function DashboardPage() {
  const {
    user,
    updateSession,
    getSessionsForDate,
    getSubjectById,
    getTopicById,
    subjects,
    streak,
    checkAndUpdateStreak,
    hasHydrated,
    checkAchievements,
  } = useStore();
  const { t, language } = useLanguage();
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [showCoinEarned, setShowCoinEarned] = useState(false);
  const [coinBreakdown, setCoinBreakdown] = useState<CoinRewardBreakdown | undefined>();
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(streak);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  // Streak aktualisieren, wenn sich der Store-Streak ändert
  useEffect(() => {
    setCurrentStreak(streak);
  }, [streak]);

  // Automatische Streak-Prüfung beim Laden
  useEffect(() => {
    if (!hasHydrated) return;
    const result = checkAndUpdateStreak();
    if (result.streakIncreased) {
      setCurrentStreak(result.newStreak);
      setShowStreakPopup(true);
    }
  }, [hasHydrated, checkAndUpdateStreak]);

  const today = format(new Date(), "yyyy-MM-dd");
  const sessions = getSessionsForDate(today);
  const plannedMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedMinutes = sessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.duration, 0);
  const progressPercent =
    plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 18) return t.dashboard.greetingDay;
    return t.dashboard.greetingEvening;
  })();

  const displayName = user?.name?.trim() || t.common.name;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          {isToday(new Date())
            ? t.dashboard.todayPlan
            : t.dashboard.planOverview}
        </p>
      </div>

      <LearningInsightsCard />

      {/* Streak-Anzeige */}
      {streak > 0 && (
        <div className="card border-orange-200/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:border-orange-800/50 dark:from-orange-950/30 dark:to-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-800 dark:to-orange-900">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-study-ink dark:text-study-text">
                {t.dashboard.streak}
              </p>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                {streak === 1 
                  ? t.dashboard.streakDay.replace("{count}", streak.toString())
                  : t.dashboard.streakDays.replace("{count}", streak.toString())}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-medium text-study-ink">{t.dashboard.todayStudyTime}</h2>
          <span className="text-base font-semibold text-study-sage sm:text-lg">
            {t.dashboard.planned}: {formatDuration(plannedMinutes)}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-study-mint/40">
          <div
            className="progress-bar-inner h-full rounded-full bg-study-sage"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-study-soft">
          {t.dashboard.completed}: {formatDuration(completedMinutes)} {t.dashboard.of}{" "}
          {formatDuration(plannedMinutes)}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-medium text-study-ink sm:text-lg">
          {t.dashboard.sessionsToday}
        </h2>
        <Link
          href="/neu?tab=planer&add=1"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover sm:w-auto sm:py-2.5"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t.dashboard.addSession}
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card border-dashed text-center text-study-soft">
          <p className="mb-4">{t.dashboard.noSessions}</p>
          <Link
            href="/neu?tab=planer&add=1"
            className="inline-flex items-center gap-2 rounded-xl bg-study-mint/50 px-4 py-2 text-study-ink hover:bg-study-mint"
          >
            {t.dashboard.addSession}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const subject = getSubjectById(s.subjectId);
            const topic = s.topicId ? getTopicById(s.topicId) : null;
            return (
              <li key={s.id}>
                <div
                  className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: subject?.color || "#88d4ab",
                  }}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="flex cursor-pointer items-center gap-2 shrink-0">
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={() => {
                          if (s.completed) {
                            updateSession(s.id, { completed: false });
                          } else {
                            setFeedbackSessionId(s.id);
                          }
                        }}
                        className="h-5 w-5 rounded border-study-soft text-study-sage focus:ring-study-sage"
                      />
                      <span
                        className={`text-sm sm:text-base ${s.completed ? "text-study-soft line-through" : "text-study-ink"}`}
                      >
                        {s.startTime} – {formatDuration(s.duration)}
                      </span>
                    </label>
                    <div className="min-w-0 flex-1 pl-7 sm:pl-0">
                      <p className="font-medium text-study-ink truncate">
                        {subject?.name ?? "Fach"}
                        {topic ? ` · ${topic.name}` : ""}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-study-soft line-clamp-2">
                        <span>{s.type} · {s.goal}</span>
                        {s.energy_level && (
                          <span
                            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor:
                                s.energy_level === "low"
                                  ? "#dcfce7"
                                  : s.energy_level === "medium"
                                    ? "#fef3c7"
                                    : "#fee2e2",
                              color:
                                s.energy_level === "low"
                                  ? "#15803d"
                                  : s.energy_level === "medium"
                                    ? "#b45309"
                                    : "#b91c1c",
                            }}
                          >
                            {s.energy_level === "low" ? "Leicht" : s.energy_level === "medium" ? "Mittel" : "Schwer"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/neu?tab=planer&date=${s.date}`}
                    className="self-start text-sm text-study-sage hover:underline sm:self-center"
                  >
                    Bearbeiten
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {feedbackSessionId && (() => {
        const s = sessions.find((x) => x.id === feedbackSessionId);
        const subject = s ? getSubjectById(s.subjectId) : null;
        const topic = s?.topicId ? getTopicById(s.topicId!) : null;
        const label = s ? `${subject?.name ?? "Fach"}${topic ? ` · ${topic.name}` : ""} – ${s.startTime}` : "";
        return (
          <SessionFeedbackModal
            sessionLabel={label}
            onSelect={(feedback: FeedbackDifficulty) => {
              const session = sessions.find((s) => s.id === feedbackSessionId);
              const { coinsAdded, rewardBreakdown } = updateSession(feedbackSessionId, { completed: true, feedback_difficulty: feedback });
              setFeedbackSessionId(null);
              if (coinsAdded) {
                setShowCoinEarned(true);
                setCoinBreakdown(rewardBreakdown);
              }
              
              // Check achievements
              const achievementResult = checkAchievements();
              if (achievementResult.newlyUnlocked.length > 0) {
                setNewAchievements(achievementResult.newlyUnlocked);
              }
              
              // Benachrichtigung beim Abschließen
              if (session && isNotificationEnabled() && getNotificationPermission() === "granted") {
                const subject = getSubjectById(session.subjectId);
                const subjectName = subject?.name || "Study Session";
                setTimeout(() => {
                  showNotification({
                    title: "✅ Session Completed!",
                    body: t.notifications.sessionCompleted.replace("{subject}", subjectName),
                    tag: `completed-${feedbackSessionId}`,
                  });
                }, 1000);
              }
            }}
            onSkip={() => {
              const session = sessions.find((s) => s.id === feedbackSessionId);
              const { coinsAdded, rewardBreakdown } = updateSession(feedbackSessionId, { completed: true });
              setFeedbackSessionId(null);
              if (coinsAdded) {
                setShowCoinEarned(true);
                setCoinBreakdown(rewardBreakdown);
              }
              
              // Check achievements
              const achievementResult = checkAchievements();
              if (achievementResult.newlyUnlocked.length > 0) {
                setNewAchievements(achievementResult.newlyUnlocked);
              }
              
              // Benachrichtigung beim Abschließen
              if (session && isNotificationEnabled() && getNotificationPermission() === "granted") {
                const subject = getSubjectById(session.subjectId);
                const subjectName = subject?.name || "Study Session";
                setTimeout(() => {
                  showNotification({
                    title: "✅ Session Completed!",
                    body: t.notifications.sessionCompleted.replace("{subject}", subjectName),
                    tag: `completed-${feedbackSessionId}`,
                  });
                }, 1000);
              }
            }}
            onClose={() => setFeedbackSessionId(null)}
          />
        );
      })()}

      {showCoinEarned && (
        <CoinEarnedModal
          amount={coinBreakdown?.total || 10}
          breakdown={coinBreakdown}
          onClose={() => {
            setShowCoinEarned(false);
            setCoinBreakdown(undefined);
            // Show achievements after coins
            if (newAchievements.length > 0) {
              setCurrentAchievementIndex(0);
            }
          }}
        />
      )}

      {showStreakPopup && (
        <StreakPopup streak={currentStreak} onClose={() => setShowStreakPopup(false)} />
      )}

      {newAchievements.length > 0 && currentAchievementIndex < newAchievements.length && (
        <AchievementModal
          achievement={newAchievements[currentAchievementIndex]}
          onClose={() => {
            if (currentAchievementIndex < newAchievements.length - 1) {
              setCurrentAchievementIndex(currentAchievementIndex + 1);
            } else {
              setNewAchievements([]);
              setCurrentAchievementIndex(0);
            }
          }}
        />
      )}

      {subjects.length === 0 && (
        <div className="card border-study-sky/50 bg-study-sky/10">
          <p className="text-sm text-study-ink sm:text-base">
            <strong>Tipp:</strong> Lege zuerst unter{" "}
            <Link href="/neu?tab=faecher" className="text-study-sage underline">
              Fächer & Themen
            </Link>{" "}
            deine Fächer an, dann kannst du sie im Tagesplaner auswählen.
          </p>
        </div>
      )}
    </div>
  );
}
