"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { claimDailyBonus, loadDailyBonus } from "@/lib/dailyBonuses";
import { useLanguage } from "@/lib/LanguageProvider";

/**
 * Täglicher Login-Bonus Card
 */
export function DailyBonusCard() {
  const { addCoins } = useStore();
  const { t } = useLanguage();
  const [bonus, setBonus] = useState(loadDailyBonus());
  const [showClaimed, setShowClaimed] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isClaimed = bonus.lastClaimDate === today;

  const handleClaim = () => {
    const claim = claimDailyBonus();
    if (claim.available) {
      addCoins(claim.amount);
      setBonus(loadDailyBonus());
      setShowClaimed(true);
      setTimeout(() => setShowClaimed(false), 3000);
    }
  };

  return (
    <div className="card border-study-sage/30 bg-gradient-to-br from-study-mint/20 to-study-cream/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-study-ink">Täglicher Bonus</h3>
          <p className="mt-1 text-sm text-study-soft">
            {isClaimed
              ? `Heute bereits geholt (Serie: ${bonus.streak} Tage)`
              : `Serie: ${bonus.streak} Tage → +${bonus.nextBonus} Münzen`}
          </p>
          {bonus.streak >= 7 && (
            <p className="mt-1 text-xs font-medium text-study-sage">
              🔥 Maximaler Bonus erreicht!
            </p>
          )}
        </div>
        <button
          onClick={handleClaim}
          disabled={isClaimed || showClaimed}
          className="rounded-xl bg-study-sage px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showClaimed ? "✓ Geholt" : isClaimed ? "Bereits geholt" : "Holen"}
        </button>
      </div>
      {showClaimed && (
        <div className="mt-3 rounded-lg bg-study-sage/20 px-3 py-2 text-center text-sm font-medium text-study-ink">
          +{bonus.nextBonus} Münzen erhalten! 🎉
        </div>
      )}
    </div>
  );
}
