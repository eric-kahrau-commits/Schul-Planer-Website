"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { claimLuckyCoin } from "@/lib/dailyBonuses";
import { useLanguage } from "@/lib/LanguageProvider";

/**
 * Glücksrad für tägliche Glücksmünzen
 */
export function LuckyWheel() {
  const { addCoins } = useStore();
  const { t } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ amount: number; available: boolean } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSpin = () => {
    const claim = claimLuckyCoin();
    
    if (!claim.available) {
      setResult({ amount: 0, available: false });
      setShowModal(true);
      return;
    }

    setSpinning(true);
    setResult(null);

    // Simuliere Spinning-Animation
    setTimeout(() => {
      setSpinning(false);
      setResult(claim);
      addCoins(claim.amount);
      setShowModal(true);
    }, 2000);
  };

  if (showModal && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="rounded-2xl bg-study-card p-6 shadow-xl">
          {result.available ? (
            <>
              <div className="text-center text-6xl mb-4">🎰</div>
              <h3 className="text-xl font-bold text-study-ink text-center mb-2">
                Glück gehabt!
              </h3>
              <p className="text-study-soft text-center mb-4">
                Du hast <span className="font-bold text-amber-600">+{result.amount} Münzen</span> gewonnen!
              </p>
            </>
          ) : (
            <>
              <div className="text-center text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-study-ink text-center mb-2">
                Bereits verwendet
              </h3>
              <p className="text-study-soft text-center mb-4">
                Du hast heute bereits deine Glücksmünzen geholt. Komm morgen wieder!
              </p>
            </>
          )}
          <button
            onClick={() => setShowModal(false)}
            className="w-full rounded-xl bg-study-sage px-4 py-2 text-white hover:bg-study-accent-hover"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSpin}
      disabled={spinning}
      className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
    >
      {spinning ? (
        <div className="animate-spin text-3xl">🎰</div>
      ) : (
        <>
          <span className="text-4xl">🎰</span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-purple-600">
            Glücksrad
          </span>
        </>
      )}
    </button>
  );
}
