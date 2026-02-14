"use client";

import { useStore } from "@/lib/store";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { de } from "date-fns/locale";

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const MAX_PLANNED_MINUTES_PER_DAY = 6 * 60; // 6 h

export default function WochePage() {
  const { sessions, getSubjectById } = useStore();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const byDay = days.map((d) => {
    const dateStr = format(d, "yyyy-MM-dd");
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const totalMin = daySessions.reduce((acc, s) => acc + s.duration, 0);
    const bySubject = daySessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.subjectId] = (acc[s.subjectId] ?? 0) + s.duration;
      return acc;
    }, {});
    return {
      date: d,
      dateStr,
      totalMin,
      daySessions,
      bySubject,
      isOverloaded: totalMin > MAX_PLANNED_MINUTES_PER_DAY,
      isEmpty: daySessions.length === 0,
    };
  });

  const totalWeekMin = byDay.reduce((acc, d) => acc + d.totalMin, 0);
  const subjectTotals: Record<string, { name: string; color: string; min: number }> = {};
  byDay.forEach((d) => {
    Object.entries(d.bySubject).forEach(([subjectId, min]) => {
      if (!subjectTotals[subjectId]) {
        const sub = getSubjectById(subjectId);
        subjectTotals[subjectId] = {
          name: sub?.name ?? "—",
          color: sub?.color ?? "#88d4ab",
          min: 0,
        };
      }
      subjectTotals[subjectId].min += min;
    });
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          Wochenübersicht
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          Lernzeit pro Tag und pro Fach. Überlastete Tage sind markiert; leere Tage eignen sich für Wiederholung.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium text-study-ink sm:mb-4">
          Lernzeit pro Tag (diese Woche)
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {byDay.map((d) => (
            <div
              key={d.dateStr}
              className={`rounded-xl border p-2.5 text-center shadow-sm transition-shadow sm:p-3 ${
                d.isOverloaded
                  ? "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/50"
                  : d.isEmpty
                    ? "border-dashed border-study-border bg-study-cream/50"
                    : "border-study-border bg-study-card"
              }`}
            >
              <p
                className={`text-xs font-medium sm:text-sm ${
                  isToday(d.date) ? "text-study-sage" : "text-study-ink"
                }`}
              >
                {format(d.date, "EEE", { locale: de })}
              </p>
              <p className="text-[10px] text-study-soft sm:text-xs">
                {format(d.date, "d. MMM", { locale: de })}
              </p>
              <p className="mt-1.5 text-base font-semibold text-study-ink sm:mt-2 sm:text-lg">
                {formatDuration(d.totalMin)}
              </p>
              {d.isOverloaded && (
                <p className="mt-0.5 text-[10px] text-amber-700 sm:mt-1 sm:text-xs">
                  Sehr voll – Pausen?
                </p>
              )}
              {d.isEmpty && !isToday(d.date) && (
                <p className="mt-0.5 text-[10px] text-study-soft sm:mt-1 sm:text-xs">
                  Wiederholung?
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-study-soft sm:mt-4">
          Gesamt diese Woche: <strong>{formatDuration(totalWeekMin)}</strong>
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium text-study-ink sm:mb-4">
          Lernzeit pro Fach (diese Woche)
        </h2>
        {Object.keys(subjectTotals).length === 0 ? (
          <p className="py-2 text-sm text-study-soft">Noch keine Sessions diese Woche.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(subjectTotals)
              .sort((a, b) => b[1].min - a[1].min)
              .map(([id, { name, color, min }]) => (
                <li
                  key={id}
                  className="flex flex-col gap-1 rounded-xl border border-study-border bg-study-cream/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{name}</span>
                  </span>
                  <span className="font-medium text-study-ink shrink-0">
                    {formatDuration(min)}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
