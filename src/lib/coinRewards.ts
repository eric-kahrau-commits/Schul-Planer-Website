/**
 * Münzen-Belohnungs-System
 * Berechnet dynamische Münzen-Belohnungen basierend auf verschiedenen Faktoren
 */

import type { StudySession, EnergyLevel } from "./types";

export interface CoinRewardBreakdown {
  base: number;
  durationBonus: number;
  difficultyBonus: number;
  streakBonus: number;
  weekendBonus: number;
  comboBonus: number;
  total: number;
  reasons: string[];
}

/**
 * Berechnet Münzen-Belohnung für eine abgeschlossene Session
 */
export function calculateCoinReward(
  session: StudySession,
  streak: number,
  sessionsToday: number,
  isWeekend: boolean
): CoinRewardBreakdown {
  const reasons: string[] = [];
  let base = 10;
  let durationBonus = 0;
  let difficultyBonus = 0;
  let streakBonus = 0;
  let weekendBonus = 0;
  let comboBonus = 0;

  // Base Reward
  reasons.push("Basis-Belohnung");

  // Duration Bonus (längere Sessions = mehr Münzen)
  if (session.duration >= 90) {
    durationBonus = 10;
    reasons.push("Lange Session (+10)");
  } else if (session.duration >= 60) {
    durationBonus = 5;
    reasons.push("Mittlere Session (+5)");
  }

  // Difficulty Bonus (schwere Sessions = mehr Münzen)
  if (session.feedback_difficulty === "hard" || session.energy_level === "high") {
    difficultyBonus = 10;
    reasons.push("Schwere Session (+10)");
  } else if (session.feedback_difficulty === "medium" || session.energy_level === "medium") {
    difficultyBonus = 5;
    reasons.push("Mittlere Schwierigkeit (+5)");
  }

  // Streak Bonus (jede 7 Tage = +5 Münzen)
  if (streak >= 7 && streak % 7 === 0) {
    streakBonus = 5;
    reasons.push(`Streak-Bonus Tag ${streak} (+5)`);
  } else if (streak >= 7) {
    streakBonus = Math.floor(streak / 7) * 2; // +2 pro 7-Tage-Streak
    if (streakBonus > 0) {
      reasons.push(`Streak-Bonus (+${streakBonus})`);
    }
  }

  // Weekend Bonus (+50% mehr Münzen)
  if (isWeekend) {
    const baseTotal = base + durationBonus + difficultyBonus + streakBonus;
    weekendBonus = Math.floor(baseTotal * 0.5);
    if (weekendBonus > 0) {
      reasons.push("Wochenend-Bonus (+50%)");
    }
  }

  // Combo Bonus (mehrere Sessions am Tag = Bonus)
  if (sessionsToday >= 5) {
    comboBonus = 20;
    reasons.push("5+ Sessions heute (+20)");
  } else if (sessionsToday >= 3) {
    comboBonus = 10;
    reasons.push("3+ Sessions heute (+10)");
  }

  const total = base + durationBonus + difficultyBonus + streakBonus + weekendBonus + comboBonus;

  return {
    base,
    durationBonus,
    difficultyBonus,
    streakBonus,
    weekendBonus,
    comboBonus,
    total,
    reasons,
  };
}

/**
 * Prüft ob heute Wochenende ist
 */
export function isWeekend(date: string): boolean {
  const d = new Date(date + "T12:00:00");
  const day = d.getDay();
  return day === 0 || day === 6; // Sonntag oder Samstag
}
