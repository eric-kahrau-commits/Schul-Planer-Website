"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "@/lib/achievements";
import { useStore } from "@/lib/store";

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  const { addCoins } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    addCoins(achievement.coinReward);
    const autoClose = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(autoClose);
    };
  }, [achievement, onClose, addCoins]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex flex-col items-center rounded-3xl border-2 border-study-sage/50 bg-gradient-to-b from-study-mint/30 to-study-card px-8 py-8 shadow-2xl transition-all duration-300 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        <div className="text-8xl mb-4 animate-bounce">{achievement.emoji}</div>
        <h2 className="text-2xl font-bold text-study-ink mb-2">
          Achievement freigeschaltet!
        </h2>
        <h3 className="text-xl font-semibold text-study-sage mb-1">
          {achievement.name}
        </h3>
        <p className="text-study-soft text-center mb-4">
          {achievement.description}
        </p>
        <div className="rounded-xl bg-amber-100/50 dark:bg-amber-900/30 px-4 py-2 mb-4">
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
            +{achievement.coinReward} Münzen Belohnung!
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="rounded-xl bg-study-sage px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-study-accent-hover"
        >
          Großartig!
        </button>
      </div>
    </div>
  );
}
