"use client";

import { useStore } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";

export default function AchievementsPage() {
  const { achievements } = useStore();

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          Achievements
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          {unlockedAchievements.length} von {achievements.length} Achievements freigeschaltet
        </p>
      </div>

      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-study-ink">
            Freigeschaltet ({unlockedAchievements.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="card border-study-sage/50 bg-gradient-to-br from-study-mint/30 to-study-card"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{achievement.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-study-ink">
                      {achievement.name}
                    </h3>
                    <p className="mt-1 text-sm text-study-soft">
                      {achievement.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        +{achievement.coinReward} Münzen
                      </span>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-study-soft">
                          {new Date(achievement.unlockedAt).toLocaleDateString("de-DE")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-study-ink">
            Noch gesperrt ({lockedAchievements.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="card border-study-border bg-study-cream/30 opacity-60"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl grayscale opacity-50">
                    {achievement.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-study-ink">
                      {achievement.name}
                    </h3>
                    <p className="mt-1 text-sm text-study-soft">
                      {achievement.description}
                    </p>
                    <div className="mt-2">
                      <span className="rounded-full bg-study-border px-2 py-1 text-xs font-medium text-study-soft">
                        +{achievement.coinReward} Münzen
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
