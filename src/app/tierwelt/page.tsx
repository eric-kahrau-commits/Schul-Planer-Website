"use client";

import { useStore } from "@/lib/store";
import { PET_DISPLAY, FEED_OPTIONS, xpProgressInLevel } from "@/lib/pets";
import type { Pet } from "@/lib/types";
import { useState } from "react";
import { DailyBonusCard } from "@/components/DailyBonusCard";
import { LuckyWheel } from "@/components/LuckyWheel";

const STAGE_LABEL: Record<string, string> = {
  baby: "Baby",
  young: "Jungtier",
  adult: "Erwachsen",
};

function CoinDisplay({ coins }: { coins: number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/50">
      <span className="text-xl" aria-hidden>🪙</span>
      <span className="font-semibold text-amber-800 tabular-nums">{coins}</span>
      <span className="text-sm text-amber-700">Lernmünzen</span>
    </div>
  );
}

function XPBar({ current, needed }: { current: number; needed: number }) {
  const pct = needed > 0 ? Math.min(100, (current / needed) * 100) : 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-study-cream">
      <div
        className="h-full rounded-full bg-study-sage transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PetCard({
  pet,
  coins,
  onFeed,
}: {
  pet: Pet;
  coins: number;
  onFeed: (petId: string, foodType: "normal" | "premium") => { success: boolean; levelUp?: boolean; unlockedType?: string };
}) {
  const info = PET_DISPLAY[pet.type];
  const progress = xpProgressInLevel(pet.xp);
  const [justLeveled, setJustLeveled] = useState(false);

  const handleFeed = (foodType: "normal" | "premium") => {
    const result = onFeed(pet.id, foodType);
    if (result.success && result.levelUp) {
      setJustLeveled(true);
      setTimeout(() => setJustLeveled(false), 2500);
    }
  };

  if (!pet.unlocked) {
    return (
      <div className="card flex flex-col items-center justify-center border-study-border bg-study-cream/50 py-10 text-center">
        <span className="text-4xl opacity-50">{info?.emoji ?? "?"}</span>
        <p className="mt-2 font-medium text-study-ink">{info?.name ?? pet.type}</p>
        <p className="mt-1 text-sm text-study-soft">
          Schalte durch das Aufziehen deiner Tiere frei
        </p>
      </div>
    );
  }

  return (
    <div
      className={`card overflow-hidden transition-all duration-300 ${
        justLeveled ? "ring-2 ring-study-sage ring-offset-2" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <div className="flex shrink-0 items-center justify-center rounded-2xl bg-study-mint/20 p-4 text-6xl sm:text-7xl animate-pet-breathe">
          {info?.emoji ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-study-ink">{pet.name}</h2>
            <span className="rounded-full bg-study-sage/20 px-2.5 py-0.5 text-sm font-medium text-study-ink">
              Level {pet.level}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-study-soft">{STAGE_LABEL[pet.stage] ?? pet.stage}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-study-soft">
              <span>XP</span>
              <span>
                {pet.level >= 10 ? "Max" : `${progress.current} / ${progress.needed}`}
              </span>
            </div>
            <div className="mt-1">
              <XPBar current={progress.current} needed={progress.needed} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFeed("normal")}
              disabled={coins < FEED_OPTIONS.normal.cost}
              className="rounded-xl border border-study-border bg-study-card px-3 py-2 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-mint/20 disabled:opacity-50 disabled:hover:bg-study-card"
            >
              🥬 Füttern (5 Münzen)
            </button>
            <button
              type="button"
              onClick={() => handleFeed("premium")}
              disabled={coins < FEED_OPTIONS.premium.cost}
              className="rounded-xl bg-study-sage px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover disabled:opacity-50"
            >
              ✨ Premium-Futter (15 Münzen)
            </button>
          </div>
        </div>
      </div>
      {justLeveled && (
        <div className="mt-3 rounded-xl bg-study-mint/30 py-2 text-center text-sm font-medium text-study-ink">
          Dein Tier ist gewachsen!
        </div>
      )}
    </div>
  );
}

export default function TierweltPage() {
  const { coins, pets, feedPet } = useStore();
  const [toast, setToast] = useState<{ message: string; unlocked?: string } | null>(null);

  const handleFeed = (petId: string, foodType: "normal" | "premium") => {
    const result = feedPet(petId, foodType);
    if (!result.success) return result;
    if (result.unlockedType) {
      const name = PET_DISPLAY[result.unlockedType]?.name ?? result.unlockedType;
      setToast({ message: "Neues Tier freigeschaltet!", unlocked: name });
      setTimeout(() => setToast(null), 3000);
    }
    return result;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0 sm:space-y-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">Deine Tierwelt</h1>
          <p className="mt-1 text-sm text-study-soft sm:text-base">
            Verdiene Lernmünzen durch abgeschlossene Lerneinheiten und füttere deine Tiere.
          </p>
        </div>
        <CoinDisplay coins={coins} />
      </div>

      {toast && (
        <div className="rounded-xl border border-study-sage/50 bg-study-mint/30 px-4 py-3 text-center text-study-ink shadow-sm">
          <p className="font-medium">{toast.message}</p>
          {toast.unlocked && (
            <p className="mt-1 text-sm text-study-soft">Willkommen, {toast.unlocked}!</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            coins={coins}
            onFeed={handleFeed}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DailyBonusCard />
        <div className="card flex items-center justify-center border-study-sage/30 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="text-center">
            <h3 className="font-semibold text-study-ink mb-2">Glücksmünzen</h3>
            <p className="text-xs text-study-soft mb-3">Täglich einmal drehen</p>
            <LuckyWheel />
          </div>
        </div>
      </div>

      <div className="card border-study-sage/20 bg-study-cream/30">
        <p className="text-sm text-study-soft">
          <strong className="text-study-ink">Tipp:</strong> Münzen werden dynamisch vergeben:
          Schwere Sessions, lange Sessions, Streaks und Wochenenden geben Bonus-Münzen!
          Bei Level 5 und 10 schaltest du ein neues Tier frei.
        </p>
      </div>
    </div>
  );
}
