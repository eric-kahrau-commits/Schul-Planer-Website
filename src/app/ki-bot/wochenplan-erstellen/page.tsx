"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageProvider";
import Link from "next/link";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

type CreateWeeklyPlanAction = {
  type: "create_weekly_plan";
  weeklyPlan: {
    sessions: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
      subjectName: string;
      topicName?: string;
      priority?: string;
      type?: string;
      goal?: string;
    }>;
  };
};

type AiAction = CreateWeeklyPlanAction;

interface AiResponsePayload {
  reply: string;
  actions?: AiAction[];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function WochenplanErstellenPage() {
  const { subjects, topics, addWeeklyPlan } = useStore();
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weeklyPlanPreview, setWeeklyPlanPreview] = useState<CreateWeeklyPlanAction["weeklyPlan"] | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [planName, setPlanName] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const limitedMessages = messages.slice(-20);
      const historyPayload = limitedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ki-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          language,
          mode: "weekly_plan",
          context: {
            subjects: subjects.map((s) => ({ id: s.id, name: s.name, color: s.color })),
            topics: topics.map((t) => ({ id: t.id, name: t.name, subjectId: t.subjectId, difficulty: t.difficulty })),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError((data as any)?.error || "Die KI‑Antwort konnte nicht geladen werden.");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as AiResponsePayload;
      const replyText = typeof data.reply === "string" ? data.reply : "Ich konnte deine Anfrage verarbeiten.";

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: replyText,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (Array.isArray(data.actions) && data.actions.length > 0) {
        const weeklyPlanAction = data.actions.find((a: any) => a.type === "create_weekly_plan");
        if (weeklyPlanAction) {
          setWeeklyPlanPreview(weeklyPlanAction.weeklyPlan);
        }
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten.");
      console.error("[KI-Bot] Fehler:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWeeklyPlan = () => {
    if (!weeklyPlanPreview || !planName.trim()) return;

    const newPlan = addWeeklyPlan({
      name: planName.trim(),
      sessions: weeklyPlanPreview.sessions,
    });

    const successMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: `✅ Wochenplan "${planName.trim()}" wurde gespeichert!\n\nDu findest ihn unter "Wochenpläne".`,
    };
    setMessages((prev) => [...prev, successMessage]);

    setWeeklyPlanPreview(null);
    setShowNameInput(false);
    setPlanName("");
  };

  const handleConfirmWeeklyPlan = () => {
    if (!weeklyPlanPreview) return;
    setShowNameInput(true);
  };

  const handleCancelWeeklyPlan = () => {
    setWeeklyPlanPreview(null);
    setShowNameInput(false);
    setPlanName("");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-0 sm:gap-6">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
              {t.aiBot?.createWeeklyPlanTitle ?? "Wochenplan erstellen"}
            </h1>
            <p className="mt-1 text-sm text-study-soft sm:text-base">
              {t.aiBot?.createWeeklyPlanPageDescription ??
                "Lass die KI einen kompletten Wochenplan für dich erstellen. Perfekt für die Planung einer ganzen Woche."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/ki-bot"
              className="inline-flex items-center gap-2 rounded-xl border border-study-border bg-study-card px-4 py-2 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-cream sm:px-5"
            >
              Zurück
            </Link>
            <Link
              href="/ki-bot/wochenplaene"
              className="inline-flex items-center gap-2 rounded-xl border border-study-border bg-study-card px-4 py-2 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-cream sm:px-5"
            >
              {t.aiBot?.weeklyPlans ?? "Wochenpläne"}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6">
        <section className="flex min-h-[320px] flex-col rounded-2xl border border-study-border bg-study-card p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex-1 space-y-3 overflow-y-auto rounded-xl bg-study-cream/70 p-3 text-sm sm:p-4 sm:text-base">
            {messages.length === 0 && (
              <div className="text-sm text-study-soft">
                {t.aiBot?.createWeeklyPlanHint ??
                  "Beschreibe, welchen Wochenplan du möchtest. Zum Beispiel:\n• „Erstelle einen Wochenplan für diese Woche\"\n• „Plane die nächste Woche mit Mathe, Englisch und Deutsch\"\n• „Wochenplan für die Prüfungsvorbereitung\""}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-2xl px-3 py-2 ${
                  m.role === "user"
                    ? "ml-auto bg-study-mint text-white"
                    : "mr-auto bg-white text-study-ink"
                }`}
              >
                <div className="whitespace-pre-wrap text-[13px] sm:text-sm">{m.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[13px] text-study-soft sm:text-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-study-mint" />
                <span>Die KI denkt nach …</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 border-t border-study-border pt-2 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-study-border bg-white px-3 py-2 text-sm text-study-ink shadow-sm placeholder:text-study-soft focus:border-study-mint focus:outline-none focus:ring-1 focus:ring-study-mint sm:text-base"
                placeholder={t.aiBot?.createWeeklyPlanInputPlaceholder ?? "Welchen Wochenplan möchtest du?"}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-study-mint px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-mint/80 disabled:cursor-not-allowed disabled:bg-study-soft/50 sm:px-5 sm:py-2.5"
            >
              {isLoading ? "Senden …" : "Senden"}
            </button>
          </form>
        </section>

        <aside className="space-y-3 sm:space-y-4">
          <div className="rounded-2xl border border-study-border bg-study-card p-3 text-sm sm:p-4">
            <h2 className="text-sm font-semibold text-study-ink sm:text-base">
              {t.aiBot?.createWeeklyPlanInfoTitle ?? "Wochenplan-Erstellung"}
            </h2>
            <p className="mt-2 text-xs text-study-soft sm:text-sm">
              {t.aiBot?.createWeeklyPlanInfoDescription ??
                "Die KI erstellt einen kompletten Wochenplan mit mehreren Lerneinheiten. Du kannst den Plan vor dem Speichern überprüfen."}
            </p>
          </div>
        </aside>
      </div>

      {/* Wochenplan-Vorschau-Modal */}
      {weeklyPlanPreview && !showNameInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-study-border bg-study-card p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-study-ink mb-4">
              {t.aiBot?.weeklyPlanPreviewTitle ?? "Wochenplan-Vorschau"}
            </h2>
            <p className="text-sm text-study-soft mb-4">
              {t.aiBot?.weeklyPlanPreviewDescription ??
                "Der KI-Bot hat folgenden Wochenplan erstellt. Möchtest du ihn speichern?"}
            </p>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 mb-4">
              {weeklyPlanPreview.sessions.map((session, idx) => {
                const subject = subjects.find((s) => s.name.toLowerCase() === session.subjectName.toLowerCase());
                const topic = session.topicName
                  ? topics.find((t) => t.name.toLowerCase() === session.topicName!.toLowerCase() && t.subjectId === subject?.id)
                  : null;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-study-border bg-study-cream/50 p-3"
                    style={{ borderLeftWidth: 4, borderLeftColor: subject?.color ?? "#88d4ab" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-study-ink">
                          {session.subjectName}
                          {topic && ` · ${topic.name}`}
                        </div>
                        <div className="text-xs text-study-soft mt-1">
                          {new Date(session.date + "T12:00:00").toLocaleDateString("de-DE", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })} · {session.startTime} Uhr · {session.durationMinutes} Min
                        </div>
                        {session.goal && (
                          <div className="text-xs text-study-soft mt-1">{session.goal}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelWeeklyPlan}
                className="flex-1 rounded-xl border border-study-border bg-white px-4 py-2 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-cream"
              >
                {t.common?.cancel ?? "Abbrechen"}
              </button>
              <button
                onClick={handleConfirmWeeklyPlan}
                className="flex-1 rounded-xl bg-study-mint px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-mint/80"
              >
                {t.aiBot?.saveWeeklyPlan ?? "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name-Eingabe-Modal */}
      {showNameInput && weeklyPlanPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-study-border bg-study-card p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-study-ink mb-4">
              {t.aiBot?.weeklyPlanNameTitle ?? "Wochenplan benennen"}
            </h2>
            <p className="text-sm text-study-soft mb-4">
              {t.aiBot?.weeklyPlanNameDescription ?? "Wie soll dieser Wochenplan heißen?"}
            </p>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder={t.aiBot?.weeklyPlanNamePlaceholder ?? "z. B. Woche 1, Januar 2025, etc."}
              className="w-full rounded-xl border border-study-border bg-white px-4 py-2 text-sm text-study-ink shadow-sm placeholder:text-study-soft focus:border-study-mint focus:outline-none focus:ring-1 focus:ring-study-mint mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && planName.trim()) {
                  handleSaveWeeklyPlan();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelWeeklyPlan}
                className="flex-1 rounded-xl border border-study-border bg-white px-4 py-2 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-cream"
              >
                {t.common?.cancel ?? "Abbrechen"}
              </button>
              <button
                onClick={handleSaveWeeklyPlan}
                disabled={!planName.trim()}
                className="flex-1 rounded-xl bg-study-mint px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-mint/80 disabled:cursor-not-allowed disabled:bg-study-soft/50"
              >
                {t.common?.save ?? "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
