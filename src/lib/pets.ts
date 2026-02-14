import type { PetStage } from "./types";

/** Reihenfolge der Tiere – Freischaltung nacheinander (Level 5 → nächstes, Level 10 → übernächstes). */
export const PET_TYPE_ORDER = [
  "schildkroete",
  "fuchs",
  "waschbaer",
  "eule",
  "panda",
  "otter",
  "rotwild",
  "schneeleopard",
] as const;

export type PetTypeId = (typeof PET_TYPE_ORDER)[number];

export const PET_DISPLAY: Record<string, { name: string; emoji: string }> = {
  schildkroete: { name: "Schildkröte", emoji: "🐢" },
  fuchs: { name: "Fuchs", emoji: "🦊" },
  waschbaer: { name: "Waschbär", emoji: "🦝" },
  eule: { name: "Eule", emoji: "🦉" },
  panda: { name: "Panda", emoji: "🐼" },
  otter: { name: "Otter", emoji: "🦦" },
  rotwild: { name: "Rotwild", emoji: "🦌" },
  schneeleopard: { name: "Schneeleopard", emoji: "🐆" },
};

/** XP pro Levelaufstieg (kumulativ: Level 2 = 30, Level 3 = 60, … Level 10 = 270). */
const XP_PER_LEVEL = 30;

export function xpForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL;
}

export function levelFromTotalXP(totalXp: number): number {
  let level = 1;
  while (level < 10 && totalXp >= xpForLevel(level + 1)) level++;
  return level;
}

export function stageFromLevel(level: number): PetStage {
  if (level <= 3) return "baby";
  if (level <= 7) return "young";
  return "adult";
}

export function xpProgressInLevel(totalXp: number): { current: number; needed: number } {
  const level = levelFromTotalXP(totalXp);
  if (level >= 10) return { current: XP_PER_LEVEL, needed: XP_PER_LEVEL };
  const base = xpForLevel(level);
  const needed = xpForLevel(level + 1) - base;
  const current = totalXp - base;
  return { current, needed };
}

/** Füttern: Kosten und XP. */
export const FEED_OPTIONS = {
  normal: { cost: 5, xp: 10 },
  premium: { cost: 15, xp: 40 },
} as const;
