/**
 * Tägliche Boni System
 */

const DAILY_BONUS_STORAGE_KEY = "studyflow_daily_bonus";
const LUCKY_COIN_STORAGE_KEY = "studyflow_lucky_coin";

export interface DailyBonus {
  lastClaimDate: string;
  streak: number;
  nextBonus: number;
}

export interface LuckyCoin {
  lastClaimDate: string;
  amount: number;
}

/**
 * Lädt täglichen Login-Bonus Status
 */
export function loadDailyBonus(): DailyBonus {
  if (typeof window === "undefined") {
    return { lastClaimDate: "", streak: 0, nextBonus: 5 };
  }

  try {
    const stored = localStorage.getItem(DAILY_BONUS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}

  return { lastClaimDate: "", streak: 0, nextBonus: 5 };
}

/**
 * Speichert täglichen Login-Bonus Status
 */
export function saveDailyBonus(bonus: DailyBonus) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_BONUS_STORAGE_KEY, JSON.stringify(bonus));
  } catch {}
}

/**
 * Prüft ob täglicher Bonus verfügbar ist und gibt Bonus zurück
 */
export function claimDailyBonus(): { available: boolean; amount: number; streak: number } {
  const today = new Date().toISOString().split("T")[0];
  const bonus = loadDailyBonus();

  // Wenn heute bereits geholt
  if (bonus.lastClaimDate === today) {
    return { available: false, amount: 0, streak: bonus.streak };
  }

  // Prüfe ob gestern geholt (für Streak)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = bonus.streak;
  if (bonus.lastClaimDate === yesterdayStr) {
    // Streak fortsetzen
    newStreak = bonus.streak + 1;
  } else if (bonus.lastClaimDate !== "") {
    // Streak unterbrochen
    newStreak = 1;
  } else {
    // Erster Tag
    newStreak = 1;
  }

  // Berechne Bonus (steigend: Tag 1 = 5, Tag 7 = 50)
  let amount = 5;
  if (newStreak >= 7) {
    amount = 50;
  } else if (newStreak >= 5) {
    amount = 30;
  } else if (newStreak >= 3) {
    amount = 15;
  } else {
    amount = 5 + (newStreak - 1) * 2; // 5, 7, 9, 11, ...
  }

  const updated: DailyBonus = {
    lastClaimDate: today,
    streak: newStreak,
    nextBonus: amount,
  };

  saveDailyBonus(updated);

  return { available: true, amount, streak: newStreak };
}

/**
 * Lädt Glücksmünzen Status
 */
export function loadLuckyCoin(): LuckyCoin {
  if (typeof window === "undefined") {
    return { lastClaimDate: "", amount: 0 };
  }

  try {
    const stored = localStorage.getItem(LUCKY_COIN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}

  return { lastClaimDate: "", amount: 0 };
}

/**
 * Prüft ob Glücksmünzen verfügbar sind und gibt zufällige Münzen zurück
 */
export function claimLuckyCoin(): { available: boolean; amount: number } {
  const today = new Date().toISOString().split("T")[0];
  const lucky = loadLuckyCoin();

  // Wenn heute bereits geholt
  if (lucky.lastClaimDate === today) {
    return { available: false, amount: 0 };
  }

  // Zufällige Münzen zwischen 5 und 25
  const amount = Math.floor(Math.random() * 21) + 5; // 5-25

  const updated: LuckyCoin = {
    lastClaimDate: today,
    amount,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LUCKY_COIN_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  return { available: true, amount };
}
