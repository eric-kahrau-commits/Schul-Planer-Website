"use client";

import { useEffect, useState } from "react";
import type { CoinRewardBreakdown } from "@/lib/coinRewards";

interface CoinEarnedModalProps {
  amount?: number;
  breakdown?: CoinRewardBreakdown;
  onClose: () => void;
}

export function CoinEarnedModal({
  amount = 10,
  breakdown,
  onClose,
}: CoinEarnedModalProps) {
  const [visible, setVisible] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    const showDetails = setTimeout(() => setShowBreakdown(true), 500);
    const autoClose = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 320);
    }, breakdown ? 5000 : 2800);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(showDetails);
      clearTimeout(autoClose);
    };
  }, [onClose, breakdown]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coin-earned-title"
    >
      <div
        className={`flex flex-col items-center rounded-3xl border-2 border-amber-200/90 bg-gradient-to-b from-amber-50 to-white px-8 py-8 shadow-2xl transition-all duration-300 ease-out dark:border-study-border dark:from-study-card dark:to-study-cream ${
          visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Animierte Münzen */}
        <div className="relative">
          <div className="coin-circle flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 shadow-lg ring-4 ring-amber-200/50 dark:from-amber-900/60 dark:to-amber-800/50 dark:ring-amber-700/50 animate-bounce">
            <span className="coin-emoji text-6xl" aria-hidden>
              🪙
            </span>
          </div>
          {/* Fliegende Münzen */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                animation: `flyCoin 1.5s ease-out ${i * 0.1}s forwards`,
              }}
            >
              <span className="text-2xl">🪙</span>
            </div>
          ))}
        </div>

        <p id="coin-earned-title" className="mt-5 text-3xl font-bold text-amber-800 dark:text-amber-200">
          +{amount} Lernmünzen
        </p>
        <p className="mt-1.5 text-study-soft">
          Du hast eine Lerneinheit abgeschlossen!
        </p>

        {/* Breakdown */}
        {breakdown && breakdown.reasons.length > 1 && (
          <div
            className={`mt-4 w-full space-y-1 overflow-hidden transition-all duration-500 ${
              showBreakdown ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-3 dark:border-study-border dark:bg-study-cream/30">
              <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Belohnungs-Details:
              </p>
              <div className="space-y-1">
                {breakdown.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <span className="text-[10px]">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="coin-sparkle-dot h-2 w-2 rounded-full bg-amber-400"
              style={{ animationDelay: `${400 + i * 100}ms` }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 320);
          }}
          className="mt-6 rounded-xl bg-study-sage px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-study-accent-hover active:scale-[0.98]"
        >
          Super!
        </button>
      </div>

      <style jsx>{`
        @keyframes flyCoin {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(
                ${Math.random() * 200 - 100}px,
                ${Math.random() * -150 - 50}px
              )
              scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
