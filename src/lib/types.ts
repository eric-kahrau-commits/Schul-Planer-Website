export type Difficulty = "leicht" | "mittel" | "schwer";
export type SessionType = "Wiederholen" | "Neues Thema" | "Aufgaben üben" | "Prüfungsvorbereitung";
export type Priority = "niedrig" | "mittel" | "hoch";

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  difficulty: Difficulty;
  examRelevant?: boolean;
}

export type FeedbackDifficulty = "easy" | "medium" | "hard";

/** Geplante mentale Belastung der Lerneinheit: low = leicht, medium = mittel, high = schwer. */
export type EnergyLevel = "low" | "medium" | "high";

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  topicId: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  duration: number; // minutes
  type: SessionType;
  goal: string;
  priority: Priority;
  completed: boolean;
  /** Geplante Anstrengung (Leicht/Mittel/Schwer). Verpflichtend bei neuer Session. */
  energy_level?: EnergyLevel;
  /** Wie anstrengend die Lerneinheit empfunden wurde (nach Abschluss). */
  feedback_difficulty?: FeedbackDifficulty;
}

export interface SubjectWithTopics extends Subject {
  topics: Topic[];
}

/** Gamification: Tier (echte Tierarten). */
export type PetStage = "baby" | "young" | "adult";

export interface Pet {
  id: string;
  type: string;
  name: string;
  level: number;
  xp: number;
  stage: PetStage;
  unlocked: boolean;
}

export type FoodType = "normal" | "premium";

/**
 * Wochenplan: Gespeicherter Plan mit mehreren Sessions
 * Sessions enthalten nur Namen (subjectName, topicName), keine IDs
 */
export interface WeeklyPlan {
  id: string;
  userId: string;
  name: string;
  createdAt: string; // ISO date string
  sessions: Array<{
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    durationMinutes: number;
    subjectName: string;
    topicName?: string;
    priority?: string;
    type?: string;
    goal?: string;
  }>;
}
