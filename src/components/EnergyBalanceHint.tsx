"use client";

import type { EnergyBalanceHintResult } from "@/lib/energyAnalysis";

const STYLES: Record<EnergyBalanceHintResult["type"], string> = {
  too_many_high:
    "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
  high_back_to_back:
    "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
  good_balance:
    "border-study-sage/50 bg-study-mint/20 text-study-ink",
};

export function EnergyBalanceHint({ hint }: { hint: EnergyBalanceHintResult }) {
  const style = STYLES[hint.type];
  const isPositive = hint.type === "good_balance";

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm sm:px-4 sm:py-3 ${style}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        {isPositive ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-study-sage/30 text-study-sage" aria-hidden>
            ✓
          </span>
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-amber-700 dark:bg-amber-800/60 dark:text-amber-300" aria-hidden>
            !
          </span>
        )}
        <p className="min-w-0 pt-0.5">{hint.message}</p>
      </div>
    </div>
  );
}
