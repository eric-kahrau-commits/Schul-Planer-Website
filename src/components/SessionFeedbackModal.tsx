"use client";

import type { FeedbackDifficulty } from "@/lib/types";

const OPTIONS: { value: FeedbackDifficulty; label: string }[] = [
  { value: "easy", label: "Leicht" },
  { value: "medium", label: "Okay" },
  { value: "hard", label: "Schwer" },
];

interface SessionFeedbackModalProps {
  sessionLabel?: string;
  onSelect: (feedback: FeedbackDifficulty) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function SessionFeedbackModal({
  sessionLabel,
  onSelect,
  onSkip,
  onClose,
}: SessionFeedbackModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="card w-full max-w-sm border-2 border-study-sage/50 shadow-xl">
        <h2 id="feedback-title" className="text-lg font-medium text-study-ink">
          Wie lief diese Lerneinheit?
        </h2>
        {sessionLabel && (
          <p className="mt-1 text-sm text-study-soft">{sessionLabel}</p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
          {OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className="flex-1 rounded-xl border-2 border-study-border bg-study-card px-4 py-3 text-sm font-medium text-study-ink transition-colors hover:border-study-sage hover:bg-study-mint/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-study-sage"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full text-center text-sm text-study-soft underline hover:text-study-ink"
        >
          Überspringen
        </button>
      </div>
      <button
        type="button"
        aria-label="Schließen"
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
