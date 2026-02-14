/**
 * Achievements & Milestones System
 */

export type AchievementId =
  | "first_session"
  | "ten_sessions"
  | "fifty_sessions"
  | "hundred_sessions"
  | "week_streak"
  | "month_streak"
  | "first_pet_level_5"
  | "all_pets_unlocked"
  | "thousand_coins"
  | "five_thousand_coins";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  coinReward: number;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, "unlocked" | "unlockedAt">> = {
  first_session: {
    id: "first_session",
    name: "Erste Schritte",
    description: "Schließe deine erste Lerneinheit ab",
    coinReward: 50,
    emoji: "🎯",
  },
  ten_sessions: {
    id: "ten_sessions",
    name: "Lern-Fortschritt",
    description: "Schließe 10 Lerneinheiten ab",
    coinReward: 100,
    emoji: "📚",
  },
  fifty_sessions: {
    id: "fifty_sessions",
    name: "Lern-Meister",
    description: "Schließe 50 Lerneinheiten ab",
    coinReward: 500,
    emoji: "🏆",
  },
  hundred_sessions: {
    id: "hundred_sessions",
    name: "Lern-Legende",
    description: "Schließe 100 Lerneinheiten ab",
    coinReward: 1000,
    emoji: "👑",
  },
  week_streak: {
    id: "week_streak",
    name: "Woche durchgehalten",
    description: "Halte eine 7-Tage-Serie",
    coinReward: 200,
    emoji: "🔥",
  },
  month_streak: {
    id: "month_streak",
    name: "Monat durchgehalten",
    description: "Halte eine 30-Tage-Serie",
    coinReward: 2000,
    emoji: "💎",
  },
  first_pet_level_5: {
    id: "first_pet_level_5",
    name: "Tier-Freund",
    description: "Erreiche Level 5 mit einem Tier",
    coinReward: 150,
    emoji: "🐾",
  },
  all_pets_unlocked: {
    id: "all_pets_unlocked",
    name: "Tier-Sammler",
    description: "Schalte alle Tiere frei",
    coinReward: 1000,
    emoji: "🌟",
  },
  thousand_coins: {
    id: "thousand_coins",
    name: "Münzen-Sammler",
    description: "Sammle 1000 Lernmünzen",
    coinReward: 200,
    emoji: "💰",
  },
  five_thousand_coins: {
    id: "five_thousand_coins",
    name: "Münzen-Meister",
    description: "Sammle 5000 Lernmünzen",
    coinReward: 1000,
    emoji: "💸",
  },
};

const ACHIEVEMENT_STORAGE_KEY = "studyflow_achievements";

export function loadAchievements(): Achievement[] {
  if (typeof window === "undefined") {
    return Object.values(ACHIEVEMENTS).map((a) => ({ ...a, unlocked: false }));
  }

  try {
    const stored = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.values(ACHIEVEMENTS).map((a) => {
        const storedAchievement = parsed.find((p: Achievement) => p.id === a.id);
        return storedAchievement || { ...a, unlocked: false };
      });
    }
  } catch {
    // Fallback
  }

  return Object.values(ACHIEVEMENTS).map((a) => ({ ...a, unlocked: false }));
}

export function saveAchievements(achievements: Achievement[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(achievements));
  } catch {}
}

export function unlockAchievement(id: AchievementId, achievements: Achievement[]): Achievement[] {
  const updated = achievements.map((a) => {
    if (a.id === id && !a.unlocked) {
      return {
        ...a,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }
    return a;
  });
  saveAchievements(updated);
  return updated;
}

export function checkAchievements(
  stats: {
    totalSessions: number;
    streak: number;
    coins: number;
    maxPetLevel: number;
    unlockedPets: number;
    totalPets: number;
  },
  currentAchievements: Achievement[]
): { achievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  let updated = [...currentAchievements];

  // First session
  if (stats.totalSessions >= 1) {
    const achievement = updated.find((a) => a.id === "first_session");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("first_session", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "first_session")!);
    }
  }

  // Ten sessions
  if (stats.totalSessions >= 10) {
    const achievement = updated.find((a) => a.id === "ten_sessions");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("ten_sessions", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "ten_sessions")!);
    }
  }

  // Fifty sessions
  if (stats.totalSessions >= 50) {
    const achievement = updated.find((a) => a.id === "fifty_sessions");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("fifty_sessions", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "fifty_sessions")!);
    }
  }

  // Hundred sessions
  if (stats.totalSessions >= 100) {
    const achievement = updated.find((a) => a.id === "hundred_sessions");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("hundred_sessions", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "hundred_sessions")!);
    }
  }

  // Week streak
  if (stats.streak >= 7) {
    const achievement = updated.find((a) => a.id === "week_streak");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("week_streak", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "week_streak")!);
    }
  }

  // Month streak
  if (stats.streak >= 30) {
    const achievement = updated.find((a) => a.id === "month_streak");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("month_streak", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "month_streak")!);
    }
  }

  // First pet level 5
  if (stats.maxPetLevel >= 5) {
    const achievement = updated.find((a) => a.id === "first_pet_level_5");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("first_pet_level_5", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "first_pet_level_5")!);
    }
  }

  // All pets unlocked
  if (stats.unlockedPets >= stats.totalPets) {
    const achievement = updated.find((a) => a.id === "all_pets_unlocked");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("all_pets_unlocked", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "all_pets_unlocked")!);
    }
  }

  // Thousand coins
  if (stats.coins >= 1000) {
    const achievement = updated.find((a) => a.id === "thousand_coins");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("thousand_coins", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "thousand_coins")!);
    }
  }

  // Five thousand coins
  if (stats.coins >= 5000) {
    const achievement = updated.find((a) => a.id === "five_thousand_coins");
    if (achievement && !achievement.unlocked) {
      updated = unlockAchievement("five_thousand_coins", updated);
      newlyUnlocked.push(updated.find((a) => a.id === "five_thousand_coins")!);
    }
  }

  return { achievements: updated, newlyUnlocked };
}

export { ACHIEVEMENTS };
