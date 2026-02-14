"use client";

import { useStore } from "@/lib/store";
import { format, startOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function getStreak(sessions: { date: string; completed: boolean }[]): number {
  const completedDates = Array.from(new Set(sessions.filter((s) => s.completed).map((s) => s.date))).sort().reverse();
  if (completedDates.length === 0) return 0;
  const today = format(new Date(), "yyyy-MM-dd");
  if (completedDates[0] !== today) return 0;
  let streak = 1;
  let current = new Date(today + "T12:00:00");
  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    const prevStr = format(prev, "yyyy-MM-dd");
    if (completedDates[i] === prevStr) {
      streak++;
      current = prev;
    } else break;
  }
  return streak;
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconFlame({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default function FortschrittPage() {
  const { sessions, getSubjectById } = useStore();
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);

  const thisWeekSessions = sessions.filter((s) => {
    const d = new Date(s.date + "T12:00:00");
    return isWithinInterval(d, { start: thisWeekStart, end: now });
  });
  const lastWeekSessions = sessions.filter((s) => {
    const d = new Date(s.date + "T12:00:00");
    return isWithinInterval(d, { start: lastWeekStart, end: thisWeekStart });
  });

  const thisWeekPlanned = thisWeekSessions.reduce((acc, s) => acc + s.duration, 0);
  const thisWeekCompleted = thisWeekSessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.duration, 0);
  const thisWeekDone = thisWeekSessions.filter((s) => s.completed).length;
  const thisWeekTotal = thisWeekSessions.length;
  const weekProgressPct = thisWeekPlanned > 0 ? Math.round((thisWeekCompleted / thisWeekPlanned) * 100) : 0;
  const sessionsProgressPct = thisWeekTotal > 0 ? Math.round((thisWeekDone / thisWeekTotal) * 100) : 0;

  const bySubject: Record<string, { name: string; color: string; min: number }> = {};
  thisWeekSessions.filter((s) => s.completed).forEach((s) => {
    if (!bySubject[s.subjectId]) {
      const sub = getSubjectById(s.subjectId);
      bySubject[s.subjectId] = {
        name: sub?.name ?? "—",
        color: sub?.color ?? "#88d4ab",
        min: 0,
      };
    }
    bySubject[s.subjectId].min += s.duration;
  });

  const streak = getStreak(sessions);
  const weekLabel = format(thisWeekStart, "d. MMM", { locale: de });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          Fortschritt
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          Statistiken und Lernstreak – Woche ab {weekLabel}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex flex-col border-l-4 border-l-study-sage">
          <div className="flex items-center gap-2 text-study-soft">
            <IconClock className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Lernzeit diese Woche</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-study-ink sm:text-3xl">
            {formatDuration(thisWeekCompleted)}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-study-mint/40">
            <div
              className="progress-bar-inner h-full rounded-full bg-study-sage"
              style={{ width: `${Math.min(weekProgressPct, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-study-soft">
            von {formatDuration(thisWeekPlanned)} geplant
          </p>
        </div>

        <div className="card flex flex-col border-l-4 border-l-study-mint">
          <div className="flex items-center gap-2 text-study-soft">
            <IconCheck className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Erledigte Sessions</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-study-ink sm:text-3xl">
            {thisWeekDone} <span className="text-lg font-normal text-study-soft">/ {thisWeekTotal}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-study-mint/40">
            <div
              className="progress-bar-inner h-full rounded-full bg-study-sage"
              style={{ width: `${Math.min(sessionsProgressPct, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-study-soft">diese Woche</p>
        </div>

        <div className="card flex flex-col border-l-4 border-l-study-sage bg-study-mint/10">
          <div className="flex items-center gap-2 text-study-soft">
            <IconFlame className="h-5 w-5 shrink-0 text-study-sage" />
            <span className="text-sm font-medium">Lernstreak</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-study-sage sm:text-3xl">
            {streak} {streak === 1 ? "Tag" : "Tage"}
          </p>
          <p className="mt-1 text-xs text-study-soft">in Folge gelernt</p>
        </div>

        <div className="card flex flex-col border-l-4 border-l-study-border">
          <div className="flex items-center gap-2 text-study-soft">
            <IconCalendar className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Letzte Woche</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-study-ink sm:text-3xl">
            {formatDuration(
              lastWeekSessions.filter((s) => s.completed).reduce((a, s) => a + s.duration, 0)
            )}
          </p>
          <p className="mt-1 text-xs text-study-soft">erledigt</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="border-b border-study-border bg-study-cream/50 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <IconChart className="h-5 w-5 shrink-0 text-study-sage" />
            <h2 className="font-medium text-study-ink">
              Meistgelerntes Fach (diese Woche)
            </h2>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          {Object.keys(bySubject).length === 0 ? (
            <p className="py-4 text-center text-sm text-study-soft">Noch keine erledigten Sessions diese Woche.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(bySubject)
                .sort((a, b) => b[1].min - a[1].min)
                .map(([id, { name, color, min }]) => {
                  const pct = thisWeekCompleted > 0 ? (min / thisWeekCompleted) * 100 : 0;
                  return (
                    <div key={id}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium text-study-ink truncate">{name}</span>
                        </span>
                        <span className="shrink-0 text-study-ink tabular-nums">{formatDuration(min)}</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-study-mint/30">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
