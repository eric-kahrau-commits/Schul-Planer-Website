import type { StudySession } from "./types";
import type { Subject } from "./types";
import { format, subDays } from "date-fns";

export type InsightType = "subject_hard" | "yesterday_overload" | "good_balance";

export interface LearningInsight {
  type: InsightType;
  message: string;
  subjectId?: string;
  subjectName?: string;
}

/** Letzte N abgeschlossenen Sessions pro Fach mit feedback_difficulty. */
function getRecentFeedbackSessionsBySubject(
  sessions: StudySession[],
  limitPerSubject: number
): Map<string, StudySession[]> {
  const completed = sessions
    .filter((s) => s.completed && s.feedback_difficulty != null)
    .sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      if (d !== 0) return d;
      return b.startTime.localeCompare(a.startTime);
    });

  const bySubject = new Map<string, StudySession[]>();
  for (const s of completed) {
    const list = bySubject.get(s.subjectId) ?? [];
    if (list.length < limitPerSubject) {
      list.push(s);
      bySubject.set(s.subjectId, list);
    }
  }
  return bySubject;
}

/** Fach war in den letzten 7 Sessions mit Feedback zu > 60 % "hard". */
function getSubjectHardInsights(
  sessions: StudySession[],
  subjects: Subject[]
): LearningInsight[] {
  const RECENT_LIMIT = 7;
  const HARD_THRESHOLD = 0.6;
  const bySubject = getRecentFeedbackSessionsBySubject(sessions, RECENT_LIMIT);
  const insights: LearningInsight[] = [];

  Array.from(bySubject.entries()).forEach(([subjectId, list]) => {
    if (list.length < 2) return;
    const hardCount = list.filter((s) => s.feedback_difficulty === "hard").length;
    if (hardCount / list.length > HARD_THRESHOLD) {
      const subject = subjects.find((s) => s.id === subjectId);
      insights.push({
        type: "subject_hard",
        message:
          "Dieses Fach war in letzter Zeit oft anstrengend. Möchtest du kürzere Lerneinheiten dafür einplanen?",
        subjectId,
        subjectName: subject?.name,
      });
    }
  });
  return insights;
}

/** Gestern mehr als 2 "hard"-Sessions oder mehrere "hard" hintereinander. */
function getYesterdayOverloadInsight(
  sessions: StudySession[],
  getSessionsForDate: (date: string) => StudySession[]
): LearningInsight | null {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const daySessions = getSessionsForDate(yesterday).filter(
    (s) => s.completed && s.feedback_difficulty != null
  );
  const hardSessions = daySessions.filter((s) => s.feedback_difficulty === "hard");
  if (hardSessions.length > 2) {
    return {
      type: "yesterday_overload",
      message:
        "Gestern hattest du viele anstrengende Einheiten. Heute etwas entspannter planen?",
    };
  }
  let consecutiveHard = 0;
  for (const s of daySessions) {
    if (s.feedback_difficulty === "hard") {
      consecutiveHard++;
      if (consecutiveHard >= 2) {
        return {
          type: "yesterday_overload",
          message:
            "Gestern hattest du viele anstrengende Einheiten. Heute etwas entspannter planen?",
        };
      }
    } else {
      consecutiveHard = 0;
    }
  }
  return null;
}

/** Gute Balance: easy / medium / hard relativ ausgeglichen (nur wenn genug Daten). */
function getGoodBalanceInsight(sessions: StudySession[]): LearningInsight | null {
  const withFeedback = sessions.filter(
    (s) => s.completed && s.feedback_difficulty != null
  );
  if (withFeedback.length < 5) return null;
  const lastN = withFeedback
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
    .slice(0, 15);
  const easy = lastN.filter((s) => s.feedback_difficulty === "easy").length;
  const medium = lastN.filter((s) => s.feedback_difficulty === "medium").length;
  const hard = lastN.filter((s) => s.feedback_difficulty === "hard").length;
  const total = lastN.length;
  const ratio = total > 0 ? Math.min(easy, medium, hard) / total : 0;
  if (ratio >= 0.2) {
    return {
      type: "good_balance",
      message: "Deine Lernbelastung ist aktuell gut verteilt.",
    };
  }
  return null;
}

export function computeLearningInsights(
  sessions: StudySession[],
  subjects: Subject[],
  getSessionsForDate: (date: string) => StudySession[]
): LearningInsight[] {
  const insights: LearningInsight[] = [];

  const subjectHard = getSubjectHardInsights(sessions, subjects);
  insights.push(...subjectHard);

  const yesterdayOverload = getYesterdayOverloadInsight(
    sessions,
    getSessionsForDate
  );
  if (yesterdayOverload) insights.push(yesterdayOverload);

  const goodBalance = getGoodBalanceInsight(sessions);
  if (goodBalance) insights.push(goodBalance);

  return insights.slice(0, 3);
}
