"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";

interface StreakPopupProps {
  streak: number;
  onClose: () => void;
}

function getStreakMessage(streak: number, t: typeof import("@/lib/i18n").translations.en): string {
  const messages = t.streak.messages;
  if (streak === 1) return messages[1];
  if (streak === 3) return messages[3];
  if (streak === 7) return messages[7];
  if (streak === 14) return messages[14];
  if (streak === 30) return messages[30];
  if (streak === 50) return messages[50];
  if (streak === 100) return messages[100];
  return messages.default;
}

export function StreakPopup({ streak, onClose }: StreakPopupProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const title = streak === 1 
    ? t.streak.titleSingle.replace("{count}", streak.toString())
    : t.streak.title.replace("{count}", streak.toString());
  const message = getStreakMessage(streak, t as typeof import("@/lib/i18n").translations.en);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-title"
    >
      <div
        className={`flex flex-col items-center rounded-3xl border-2 border-orange-200/90 bg-gradient-to-b from-orange-50 to-white px-8 py-8 shadow-2xl transition-all duration-300 ease-out dark:border-study-border dark:from-study-card dark:to-study-cream ${
          visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200/80 shadow-lg ring-4 ring-orange-200/50 dark:from-orange-900/60 dark:to-orange-800/50 dark:ring-orange-700/50">
          <span className="text-6xl" aria-hidden>
            🔥
          </span>
        </div>
        <h2 id="streak-title" className="mt-5 text-3xl font-bold text-orange-800 dark:text-orange-200">
          {title}
        </h2>
        <p className="mt-2 text-lg text-study-ink dark:text-study-text">
          {message}
        </p>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 320);
          }}
          className="mt-6 rounded-xl bg-study-sage px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-study-accent-hover active:scale-[0.98]"
        >
          {t.streak.button}
        </button>
      </div>
    </div>
  );
}
