"use client";

import { useStore } from "@/lib/store";
import type { Difficulty } from "@/lib/types";
import { useEffect, useState } from "react";

const COLORS = [
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

const DIFFICULTIES: Difficulty[] = ["leicht", "mittel", "schwer"];

export default function FaecherPage() {
  const {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  } = useStore();
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(COLORS[0]);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<Difficulty>("mittel");
  const [newTopicExamRelevant, setNewTopicExamRelevant] = useState(false);

  const topicsBySubject = subjects.map((s) => ({
    ...s,
    topics: topics.filter((t) => t.subjectId === s.id),
  }));

  const { user } = useStore();

  // URL: ?add=subject oder ?add=topic öffnet das jeweilige Formular
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const add = params.get("add");
    if (add === "subject") setShowSubjectForm(true);
    if (add === "topic") setShowTopicForm(true);
  }, []);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !user) return;
    addSubject({
      userId: user.id,
      name: newSubjectName.trim(),
      color: newSubjectColor,
    });
    setNewSubjectName("");
    setNewSubjectColor(COLORS[0]);
    setShowSubjectForm(false);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedSubjectId) return;
    addTopic({
      subjectId: selectedSubjectId,
      name: newTopicName.trim(),
      difficulty: newTopicDifficulty,
      examRelevant: newTopicExamRelevant,
    });
    setNewTopicName("");
    setNewTopicDifficulty("mittel");
    setNewTopicExamRelevant(false);
    setShowTopicForm(false);
    setSelectedSubjectId(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0 sm:space-y-8">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
            Fächer & Themen
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowTopicForm(true)}
              className="inline-flex items-center justify-center rounded-xl border border-study-border bg-study-card px-4 py-3 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-cream sm:py-2.5"
            >
              + Thema
            </button>
            <button
              type="button"
              onClick={() => setShowSubjectForm(true)}
              className="inline-flex items-center justify-center rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover sm:py-2.5"
            >
              + Fach
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          Organisiere hier deine Fächer und Themen. Du kannst sie im Tagesplaner schnell auswählen.
        </p>
      </div>

      {showSubjectForm && (
        <div className="card border-2 border-study-sage/30">
          <h2 className="mb-4 text-lg font-medium text-study-ink">
            Neues Fach
          </h2>
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-study-ink">
                Name
              </label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="z. B. Mathe, Bio, Englisch"
                className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink placeholder:text-study-soft"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-study-ink">
                Farbe (für Kalender)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewSubjectColor(c)}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor:
                        newSubjectColor === c ? "#2d3748" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="w-full rounded-xl bg-study-sage px-4 py-3 font-medium text-white hover:bg-study-accent-hover sm:w-auto sm:py-2.5"
              >
                Anlegen
              </button>
              <button
                type="button"
                onClick={() => setShowSubjectForm(false)}
                className="w-full rounded-xl border border-study-border bg-study-card px-4 py-3 text-study-ink shadow-sm transition-colors hover:bg-study-cream sm:w-auto sm:py-2.5"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {showTopicForm && (
        <div className="card border-2 border-study-sage/30">
          <h2 className="mb-4 text-lg font-medium text-study-ink">
            Neues Thema
          </h2>
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-study-ink">
                Fach
              </label>
              <select
                value={selectedSubjectId ?? ""}
                onChange={(e) => setSelectedSubjectId(e.target.value || null)}
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
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-study-ink">
                Thema-Name
              </label>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="z. B. Bruchgleichungen"
                className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink placeholder:text-study-soft"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-study-ink">
                Schwierigkeit
              </label>
              <select
                value={newTopicDifficulty}
                onChange={(e) =>
                  setNewTopicDifficulty(e.target.value as Difficulty)
                }
                className="w-full rounded-xl border border-study-border bg-study-card px-3 py-2 text-study-ink"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newTopicExamRelevant}
                onChange={(e) => setNewTopicExamRelevant(e.target.checked)}
                className="h-4 w-4 rounded text-study-sage"
              />
              <span className="text-sm text-study-ink">Prüfungsrelevant</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="w-full rounded-xl bg-study-sage px-4 py-3 font-medium text-white hover:bg-study-accent-hover sm:w-auto sm:py-2.5"
              >
                Anlegen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTopicForm(false);
                  setSelectedSubjectId(null);
                }}
                className="w-full rounded-xl border border-study-border bg-study-card px-4 py-3 text-study-ink shadow-sm transition-colors hover:bg-study-cream sm:w-auto sm:py-2.5"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {topicsBySubject.length === 0 ? (
          <div className="card border-dashed border-study-border text-center text-study-soft">
            <p className="mb-4">Noch keine Fächer angelegt.</p>
            <button
              type="button"
              onClick={() => setShowSubjectForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-study-mint/50 px-4 py-2 text-study-ink transition-colors hover:bg-study-mint"
            >
              Erstes Fach anlegen
            </button>
          </div>
        ) : (
          topicsBySubject.map((s) => (
            <div key={s.id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <h2 className="text-base font-medium text-study-ink truncate sm:text-lg">
                    {s.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(s.id);
                      setShowTopicForm(true);
                    }}
                    className="min-h-[44px] rounded-lg px-3 py-2 text-sm text-study-sage hover:bg-study-mint/30 sm:min-h-0"
                  >
                    + Thema
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Fach und alle Themen wirklich löschen?"))
                        deleteSubject(s.id);
                    }}
                    className="min-h-[44px] rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-red-400 sm:min-h-0"
                  >
                    Löschen
                  </button>
                </div>
              </div>
              {s.topics.length > 0 ? (
                <ul className="mt-4 space-y-2 border-t border-study-border pt-4">
                  {s.topics.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-col gap-1 rounded-lg bg-study-cream/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                    >
                      <span className="text-study-ink min-w-0 truncate">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-study-soft shrink-0">
                          {t.difficulty}
                          {t.examRelevant ? " · Prüfung" : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteTopic(t.id)}
                          className="min-h-[36px] rounded-lg px-2 text-sm text-study-soft hover:text-red-500 sm:min-h-0"
                        >
                          Entfernen
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-study-soft">
                  Noch keine Themen. Klicke auf „+ Thema“.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
