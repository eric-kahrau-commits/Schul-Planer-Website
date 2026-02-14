"use client";

import { useStore } from "@/lib/store";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  isSameMonth,
} from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

type ViewMode = "day" | "week" | "month";

export default function KalenderPage() {
  const router = useRouter();
  const { sessions, getSessionsForDate, getSubjectById, getTopicById } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [current, setCurrent] = useState(() => new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDate, setAddDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  // URL: ?add=1 öffnet das "An welchem Tag?"-Modal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") setShowAddModal(true);
  }, []);

  const handleAddDateSubmit = () => {
    setShowAddModal(false);
    router.push(`/planer?add=1&date=${addDate}`);
  };

  const weekStart = startOfWeek(current, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
  const monthStart = startOfMonth(current);
  const daySessions = getSessionsForDate(format(current, "yyyy-MM-dd"));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Monats-Grid: 6 Zeilen, 7 Spalten (Mo–So)
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridDays = Array.from({ length: 6 * 7 }, (_, i) => addDays(monthGridStart, i));

  const navPrev = () => {
    if (viewMode === "day") setCurrent((d) => subDays(d, 1));
    if (viewMode === "week") setCurrent((d) => subWeeks(d, 1));
    if (viewMode === "month") setCurrent((d) => subMonths(d, 1));
  };
  const navNext = () => {
    if (viewMode === "day") setCurrent((d) => addDays(d, 1));
    if (viewMode === "week") setCurrent((d) => addWeeks(d, 1));
    if (viewMode === "month") setCurrent((d) => addMonths(d, 1));
  };
  const goToToday = () => setCurrent(new Date());

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-0 sm:space-y-8">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">Kalender</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover sm:py-2.5"
            >
              <span className="text-lg">+</span> Lerneinheit hinzufügen
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          Dein Lernplan für Tag, Woche oder Monat. Wähle einen Tag zum Hinzufügen oder Bearbeiten.
        </p>
      </div>

      {/* Ansicht + Navigation */}
      <div className="card flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-study-border bg-study-card p-1">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                viewMode === mode
                  ? "bg-study-sage text-white"
                  : "text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
              }`}
            >
              {mode === "day" ? "Tag" : mode === "week" ? "Woche" : "Monat"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={navPrev}
            className="rounded-xl border border-study-border bg-study-card p-2 text-study-ink shadow-sm hover:bg-study-cream"
            aria-label="Zurück"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-study-ink sm:text-base">
            {viewMode === "day" && format(current, "EEEE, d. MMMM yyyy", { locale: de })}
            {viewMode === "week" &&
              `${format(weekStart, "d. MMM", { locale: de })} – ${format(weekEnd, "d. MMM yyyy", { locale: de })}`}
            {viewMode === "month" && format(current, "MMMM yyyy", { locale: de })}
          </span>
          <button
            type="button"
            onClick={navNext}
            className="rounded-xl border border-study-border bg-study-card p-2 text-study-ink shadow-sm hover:bg-study-cream"
            aria-label="Weiter"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-study-sage/50 bg-study-mint/20 px-3 py-2 text-sm font-medium text-study-sage hover:bg-study-mint/40"
          >
            Heute
          </button>
        </div>
      </div>

      {/* Inhalt je nach Ansicht */}
      {viewMode === "day" && (
        <div className="card overflow-hidden p-0">
          <div className="border-b border-study-border bg-study-cream/50 px-4 py-2 text-sm font-medium text-study-soft">
            {format(current, "EEEE, d. MMMM yyyy", { locale: de })}
          </div>
          <div className="min-h-[200px] p-4">
            {daySessions.length === 0 ? (
              <div className="py-8 text-center text-study-soft">
                <p className="mb-3">Keine Lerneinheiten an diesem Tag.</p>
                <Link
                  href={`/planer?add=1&date=${format(current, "yyyy-MM-dd")}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-study-mint/50 px-4 py-2 text-study-ink hover:bg-study-mint"
                >
                  Lerneinheit hinzufügen
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {daySessions.map((s) => {
                  const subject = getSubjectById(s.subjectId);
                  const topic = s.topicId ? getTopicById(s.topicId) : null;
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/planer?date=${s.date}`}
                        className="flex items-center gap-3 rounded-xl border border-study-border bg-study-card p-3 shadow-sm transition-shadow hover:shadow-md"
                        style={{ borderLeftWidth: 4, borderLeftColor: subject?.color ?? "#88d4ab" }}
                      >
                        <span className="text-sm font-medium text-study-ink">{s.startTime}</span>
                        <span className="text-study-ink">
                          {subject?.name ?? "—"}
                          {topic ? ` · ${topic.name}` : ""}
                        </span>
                        <span className="ml-auto text-sm text-study-soft">{formatDuration(s.duration)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 text-center">
              <Link
                href={`/planer?date=${format(current, "yyyy-MM-dd")}`}
                className="text-sm text-study-sage hover:underline"
              >
                Im Tagesplaner bearbeiten →
              </Link>
            </p>
          </div>
        </div>
      )}

      {viewMode === "week" && (
        <div className="card overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-study-border bg-study-cream/50 text-center text-xs font-medium text-study-soft sm:text-sm">
            {weekDays.map((d) => (
              <div key={d.toISOString()} className="border-r border-study-border py-2 last:border-r-0">
                {format(d, "EEE", { locale: de })} {format(d, "d.")}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map((d) => {
              const dateStr = format(d, "yyyy-MM-dd");
              const daySess = getSessionsForDate(dateStr);
              return (
                <div
                  key={dateStr}
                  className={`border-r border-b border-study-border p-2 last:border-r-0 ${
                    isToday(d) ? "bg-study-mint/10" : "bg-study-card"
                  }`}
                >
                  <Link
                    href={`/planer?date=${dateStr}`}
                    className={`mb-2 block rounded-lg px-2 py-1 text-center text-xs font-medium ${
                      isToday(d) ? "text-study-sage" : "text-study-ink"
                    } hover:bg-study-mint/30`}
                  >
                    {format(d, "d. MMM", { locale: de })}
                  </Link>
                  <div className="space-y-1">
                    {daySess.slice(0, 3).map((s) => {
                      const subject = getSubjectById(s.subjectId);
                      return (
                        <Link
                          key={s.id}
                          href={`/planer?date=${dateStr}`}
                          className="block truncate rounded border-l-2 px-1.5 py-0.5 text-[10px] sm:text-xs"
                          style={{ borderLeftColor: subject?.color ?? "#88d4ab" }}
                        >
                          {s.startTime} {subject?.name ?? "—"}
                        </Link>
                      );
                    })}
                    {daySess.length > 3 && (
                      <span className="block px-1.5 text-[10px] text-study-soft">+{daySess.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "month" && (
        <div className="card overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-study-border bg-study-cream/50 text-center text-xs font-medium text-study-soft">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGridDays.map((d) => {
              const dateStr = format(d, "yyyy-MM-dd");
              const daySess = getSessionsForDate(dateStr);
              const inMonth = isSameMonth(d, current);
              const today = isToday(d);
              return (
                <div
                  key={dateStr}
                  className={`min-h-[80px] border-r border-b border-study-border p-1.5 last:border-r-0 ${
                    inMonth ? "bg-study-card" : "bg-study-cream/30"
                  } ${today ? "ring-1 ring-study-sage ring-inset" : ""}`}
                >
                  <Link
                    href={`/planer?date=${dateStr}`}
                    className={`mb-1 block text-center text-sm font-medium ${
                      today ? "text-study-sage" : inMonth ? "text-study-ink" : "text-study-soft"
                    } hover:underline`}
                  >
                    {format(d, "d")}
                  </Link>
                  {inMonth && (
                    <>
                      {daySess.length > 0 && (
                        <div className="space-y-0.5">
                          {daySess.slice(0, 2).map((s) => {
                            const subject = getSubjectById(s.subjectId);
                            return (
                              <Link
                                key={s.id}
                                href={`/planer?date=${dateStr}`}
                                className="block truncate rounded px-1 py-0.5 text-[10px]"
                                style={{
                                  backgroundColor: (subject?.color ?? "#88d4ab") + "30",
                                  color: "inherit",
                                }}
                              >
                                {s.startTime}
                              </Link>
                            );
                          })}
                          {daySess.length > 2 && (
                            <Link
                              href={`/planer?date=${dateStr}`}
                              className="block px-1 text-[10px] text-study-soft hover:underline"
                            >
                              +{daySess.length - 2}
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: An welchem Tag? */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-date-title"
        >
          <div className="card w-full max-w-sm shadow-xl">
            <h2 id="add-date-title" className="text-lg font-medium text-study-ink">
              An welchem Tag soll die Lerneinheit geplant werden?
            </h2>
            <div className="mt-4">
              <input
                type="date"
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2.5 text-study-ink"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleAddDateSubmit}
                className="flex-1 rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-study-accent-hover"
              >
                Weiter zum Planer
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-study-border bg-study-card px-4 py-3 text-study-ink transition-colors hover:bg-study-cream"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
