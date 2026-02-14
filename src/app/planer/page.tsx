"use client";

import { useStore } from "@/lib/store";
import type { SessionType, Priority, FeedbackDifficulty, EnergyLevel } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useState } from "react";
import { SessionFeedbackModal } from "@/components/SessionFeedbackModal";
import { EnergyBalanceHint } from "@/components/EnergyBalanceHint";
import { CoinEarnedModal } from "@/components/CoinEarnedModal";
import { AchievementModal } from "@/components/AchievementModal";
import { analyzeDayEnergy } from "@/lib/energyAnalysis";
import type { CoinRewardBreakdown } from "@/lib/coinRewards";
import type { Achievement } from "@/lib/achievements";

const SESSION_TYPES: SessionType[] = [
  "Wiederholen",
  "Neues Thema",
  "Aufgaben üben",
  "Prüfungsvorbereitung",
];
const PRIORITIES: Priority[] = ["niedrig", "mittel", "hoch"];
const TIME_SLOTS = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
});

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; color: string; bg: string; border: string }[] = [
  { value: "low", label: "Leicht", color: "text-green-700", bg: "bg-green-100", border: "border-green-400" },
  { value: "medium", label: "Mittel", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-400" },
  { value: "high", label: "Schwer", color: "text-red-700", bg: "bg-red-100", border: "border-red-400" },
];

const SUBJECT_COLORS = [
  "#88d4ab", // Grün
  "#a8e6cf", // Mint
  "#b5e8f0", // Himmelblau
  "#93c5fd", // Hellblau
  "#3b82f6", // Blau
  "#d4c5f9", // Lavendel
  "#a78bfa", // Violett
  "#f9c5d1", // Rosa
  "#fca5a5", // Rot
  "#ffdab9", // Pfirsich
  "#fb923c", // Orange
  "#fde047", // Gelb
  "#2dd4bf", // Türkis
  "#f472b6", // Pink
  "#94a3b8", // Grau
];

export default function PlanerPage() {
  const {
    subjects,
    topics,
    getSessionsForDate,
    getSubjectById,
    getTopicById,
    addSession,
    updateSession,
    deleteSession,
    checkAchievements,
  } = useStore();

  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [showCoinEarned, setShowCoinEarned] = useState(false);
  const [coinBreakdown, setCoinBreakdown] = useState<CoinRewardBreakdown | undefined>();
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  const sessions = getSessionsForDate(selectedDate);

  // URL: ?add=1 or ?date=YYYY-MM-DD
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") setShowForm(true);
    const date = params.get("date");
    if (date) setSelectedDate(date);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-0 sm:space-y-8">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">Tagesplaner</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2.5 text-study-ink shadow-sm sm:w-auto"
            />
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover sm:w-auto sm:py-2.5"
            >
              <span className="text-lg">+</span> Lerneinheit hinzufügen
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          Plane deine Lerneinheiten mit Uhrzeit, Dauer und Energie-Level.
        </p>
      </div>

      {sessions.length > 0 && (() => {
        const hint = analyzeDayEnergy(sessions);
        return hint ? <EnergyBalanceHint hint={hint} /> : null;
      })()}

      {showForm && (
        <SessionForm
          date={selectedDate}
          subjects={subjects}
          topics={topics}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          editSession={editingId ? sessions.find((s) => s.id === editingId) ?? null : null}
        />
      )}

      <div className="card overflow-hidden p-0">
        <div className="border-b border-study-border bg-study-cream/50 px-3 py-2 text-xs font-medium text-study-soft sm:px-4 sm:text-sm">
          Timeline – {format(new Date(selectedDate + "T12:00:00"), "EEEE, d. MMMM yyyy", { locale: de })}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-study-soft sm:py-12">
              Keine Lerneinheiten an diesem Tag. Klicke auf „Lerneinheit hinzufügen“.
            </div>
          ) : (
            <ul className="divide-y divide-study-border">
              {sessions.map((s) => {
                const subject = getSubjectById(s.subjectId);
                const topic = s.topicId ? getTopicById(s.topicId) : null;
                return (
                  <li
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-stretch sm:gap-0"
                  >
                    <div
                      className="flex flex-row items-center gap-2 border-b border-study-border bg-study-card px-3 py-2 sm:w-24 sm:shrink-0 sm:flex-col sm:items-stretch sm:border-b-0 sm:border-r sm:py-3 sm:pl-4 sm:pr-2"
                      style={{ borderLeft: "4px solid " + (subject?.color ?? "#88d4ab") }}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-study-ink sm:font-normal sm:text-study-soft">
                        {s.energy_level && (
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                s.energy_level === "low"
                                  ? "#22c55e"
                                  : s.energy_level === "medium"
                                    ? "#f59e0b"
                                    : "#ef4444",
                            }}
                            title={s.energy_level === "low" ? "Leicht" : s.energy_level === "medium" ? "Mittel" : "Schwer"}
                          />
                        )}
                        {s.startTime}
                      </span>
                      <span className="text-xs text-study-soft sm:block">
                        {formatDuration(s.duration)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 py-2 pl-4 pr-3 sm:py-3 sm:pr-4">
                      <p className="font-medium text-study-ink">
                        {subject?.name ?? "—"} {topic ? `· ${topic.name}` : ""}
                      </p>
                      <p className="text-sm text-study-soft line-clamp-2">
                        {s.type} · {s.goal}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-study-soft">
                        <span>Priorität: {s.priority}</span>
                        {s.energy_level && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
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
                    <div className="flex flex-wrap items-center gap-2 border-t border-study-border bg-study-cream/20 px-3 py-2 sm:shrink-0 sm:border-l sm:border-t-0 sm:bg-study-card sm:px-3">
                      <label className="flex items-center gap-1.5 text-sm">
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
                          className="h-4 w-4 rounded text-study-sage"
                        />
                        Erledigt
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(s.id);
                          setShowForm(true);
                        }}
                        className="min-h-[44px] rounded-lg px-2 text-sm text-study-soft hover:bg-study-mint/30 hover:text-study-ink sm:min-h-0"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSession(s.id)}
                        className="min-h-[44px] rounded-lg px-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300 sm:min-h-0"
                      >
                        Löschen
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {feedbackSessionId && (() => {
        const s = sessions.find((x) => x.id === feedbackSessionId);
        const subject = s ? getSubjectById(s.subjectId) : null;
        const topic = s?.topicId ? getTopicById(s.topicId!) : null;
        const label = s ? `${subject?.name ?? "Fach"}${topic ? ` · ${topic.name}` : ""} – ${s.startTime}` : "";
        return (
          <SessionFeedbackModal
            sessionLabel={label}
            onSelect={(feedback: FeedbackDifficulty) => {
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
            }}
            onSkip={() => {
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
    </div>
  );
}

interface SessionFormProps {
  date: string;
  subjects: { id: string; name: string; color: string }[];
  topics: { id: string; subjectId: string; name: string }[];
  onClose: () => void;
  onSave: () => void;
  editSession: { id: string; subjectId: string; topicId: string | null; startTime: string; duration: number; type: SessionType; goal: string; priority: Priority; energy_level?: EnergyLevel } | null;
}

function SessionForm({
  date,
  subjects,
  topics,
  onClose,
  onSave,
  editSession,
}: SessionFormProps) {
  const { addSession, updateSession, addSubject, user } = useStore();

  const [subjectId, setSubjectId] = useState(editSession?.subjectId ?? "");
  const [topicId, setTopicId] = useState(editSession?.topicId ?? "");
  const [startTime, setStartTime] = useState(editSession?.startTime ?? "09:00");
  const [duration, setDuration] = useState(editSession?.duration ?? 45);
  const [type, setType] = useState<SessionType>(editSession?.type ?? "Wiederholen");
  const [goal, setGoal] = useState(editSession?.goal ?? "");
  const [priority, setPriority] = useState<Priority>(editSession?.priority ?? "mittel");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(editSession?.energy_level ?? "medium");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0]);

  const topicsForSubject = topics.filter((t) => t.subjectId === subjectId);

  const handleAddSubjectInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !user) return;
    const newSubject = addSubject({
      userId: user.id,
      name: newSubjectName.trim(),
      color: newSubjectColor,
    });
    setSubjectId(newSubject.id);
    setTopicId("");
    setNewSubjectName("");
    setNewSubjectColor(SUBJECT_COLORS[0]);
    setShowAddSubject(false);
  };

  useEffect(() => {
    if (editSession) {
      setSubjectId(editSession.subjectId);
      setTopicId(editSession.topicId ?? "");
      setStartTime(editSession.startTime);
      setDuration(editSession.duration);
      setType(editSession.type);
      setGoal(editSession.goal);
      setPriority(editSession.priority);
      setEnergyLevel(editSession.energy_level ?? "medium");
    }
  }, [editSession]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !user) return;
    if (!energyLevel && !editSession) return; // bei neuer Session verpflichtend
    if (editSession) {
      updateSession(editSession.id, {
        subjectId,
        topicId: topicId || null,
        startTime,
        duration,
        type,
        goal,
        priority,
        energy_level: energyLevel,
      });
    } else {
      addSession({
        userId: user.id,
        subjectId,
        topicId: topicId || null,
        date,
        startTime,
        duration,
        type,
        goal,
        priority,
        completed: false,
        energy_level: energyLevel,
      });
    }
    onSave();
  };

  return (
    <div className="card border-2 border-study-sage/30">
      <h2 className="mb-4 text-lg font-medium text-study-ink">
        {editSession ? "Lerneinheit bearbeiten" : "Neue Lerneinheit"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-study-ink">
              Fach
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
              required
              className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
            >
              <option value="">— wählen —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddSubject((v) => !v)}
              className="mt-1.5 text-sm text-study-sage hover:underline"
            >
              + Neues Fach anlegen
            </button>
            {showAddSubject && (
              <div className="mt-3 rounded-xl border border-study-border bg-study-cream/50 p-3">
                <p className="mb-2 text-sm font-medium text-study-ink">Neues Fach</p>
                <form onSubmit={handleAddSubjectInline} className="space-y-2">
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="z. B. Mathe, Englisch"
                    className="w-full rounded-lg border border-study-border bg-study-card px-3 py-2 text-sm text-study-ink placeholder:text-study-soft"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewSubjectColor(c)}
                        className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          borderColor: newSubjectColor === c ? "#2d3748" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-study-sage px-3 py-1.5 text-sm font-medium text-white hover:bg-study-accent-hover"
                    >
                      Anlegen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSubject(false);
                        setNewSubjectName("");
                        setNewSubjectColor(SUBJECT_COLORS[0]);
                      }}
                      className="rounded-lg border border-study-border bg-study-card px-3 py-1.5 text-sm text-study-ink hover:bg-study-cream"
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-study-ink">
              Thema (optional)
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
            >
              <option value="">— wählen —</option>
              {topicsForSubject.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-study-ink">
              Start
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-study-ink">
              Dauer
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {formatDuration(d)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-study-ink">
              Lernart
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SessionType)}
              className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-study-ink">
            Ziel der Session
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="z. B. Kapitel 3 durcharbeiten"
            className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink placeholder:text-study-soft"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-study-ink">
            Priorität
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-study-ink">
            Wie anstrengend ist diese Lerneinheit? <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergyLevel(opt.value)}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${opt.bg} ${opt.color} ${
                  energyLevel === opt.value ? opt.border + " ring-2 ring-offset-1 ring-offset-study-card" : "border-transparent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            className="w-full rounded-xl bg-study-sage px-4 py-3 font-medium text-white hover:bg-study-accent-hover sm:w-auto sm:py-2.5"
          >
            {editSession ? "Speichern" : "Hinzufügen"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-study-border bg-study-card px-4 py-3 text-study-ink hover:bg-study-cream sm:w-auto sm:py-2.5"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
