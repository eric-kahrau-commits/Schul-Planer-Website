import type { StudySession } from "./types";
import type { EnergyLevel } from "./types";

export type EnergyHintType = "too_many_high" | "high_back_to_back" | "good_balance";

export interface EnergyBalanceHintResult {
  type: EnergyHintType;
  message: string;
}

const HIGH: EnergyLevel = "high";

/** Analysiert die Sessions eines Tages und gibt einen Hinweis zurück (oder null). */
export function analyzeDayEnergy(sessions: StudySession[]): EnergyBalanceHintResult | null {
  const withLevel = sessions.filter((s) => s.energy_level != null) as (StudySession & { energy_level: EnergyLevel })[];
  const ordered = [...withLevel].sort(
    (a, b) => a.startTime.localeCompare(b.startTime) || a.duration - b.duration
  );

  if (ordered.length === 0) return null;

  const highCount = ordered.filter((s) => s.energy_level === HIGH).length;

  // Fall 1: Mehr als 2 schwere Sessions
  if (highCount > 2) {
    return {
      type: "too_many_high",
      message:
        "Du hast viele anstrengende Lerneinheiten an diesem Tag. Plane eventuell leichtere Aufgaben dazwischen.",
    };
  }

  // Fall 2: Mindestens zwei "high" direkt hintereinander
  let consecutiveHigh = 0;
  for (const s of ordered) {
    if (s.energy_level === HIGH) {
      consecutiveHigh++;
      if (consecutiveHigh >= 2) {
        return {
          type: "high_back_to_back",
          message:
            "Mehrere schwere Themen sind direkt hintereinander geplant. Möchtest du eine leichtere Einheit dazwischen schieben?",
        };
      }
    } else {
      consecutiveHigh = 0;
    }
  }

  // Fall 3: Gute Balance – mindestens zwei verschiedene Level, keine Probleme
  const levels = new Set(ordered.map((s) => s.energy_level));
  if (ordered.length >= 2 && levels.size >= 2) {
    return {
      type: "good_balance",
      message: "Dein Lernplan hat eine gute Balance zwischen schweren und leichten Aufgaben.",
    };
  }

  return null;
}
