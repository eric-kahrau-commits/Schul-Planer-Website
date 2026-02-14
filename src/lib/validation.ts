import { z } from "zod";

/** UUID-ähnliche oder interne IDs (z. B. generateId): nicht leer, max 64 Zeichen */
const idSchema = z.string().min(1).max(64);

/** Für API: echte UUID */
export const uuidSchema = z.string().uuid();

const sessionTypeSchema = z.enum([
  "Wiederholen",
  "Neues Thema",
  "Aufgaben üben",
  "Prüfungsvorbereitung",
]);
const prioritySchema = z.enum(["niedrig", "mittel", "hoch"]);
const difficultySchema = z.enum(["leicht", "mittel", "schwer"]);
const energyLevelSchema = z.enum(["low", "medium", "high"]);

/** Datum YYYY-MM-DD */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss YYYY-MM-DD sein");

/** Zeit HH:mm - normalisiert zu HH:mm Format (z. B. "9:00" -> "09:00") */
const timeSchema = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, "Zeit muss HH:mm sein")
  .transform((val) => {
    // Normalisiere Zeit: "9:00" -> "09:00"
    const [hours, minutes] = val.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  });

/** Dauer in Minuten: 5–300 (5 min bis 5 h) */
const durationSchema = z.number().int().min(5).max(300);

/** Ziel/Goal: max 200 Zeichen */
const goalSchema = z.string().max(200).trim();

/** Fachname: max 100 Zeichen */
const subjectNameSchema = z.string().min(1).max(100).trim();

/** Themenname: max 100 Zeichen */
const topicNameSchema = z.string().min(1).max(100).trim();

/** Hex-Farbe oder Name */
const colorSchema = z.string().min(1).max(50);

// ========== Subject (ohne id) ==========
export const subjectInputSchema = z.object({
  userId: z.string().min(1).max(64).optional(),
  name: subjectNameSchema,
  color: colorSchema,
});

// ========== Topic (ohne id) ==========
export const topicInputSchema = z.object({
  subjectId: idSchema,
  name: topicNameSchema,
  difficulty: difficultySchema,
  examRelevant: z.boolean().optional(),
});

// ========== Study Session (ohne id) ==========
export const studySessionInputSchema = z.object({
  userId: z.string().min(1).max(64).optional(),
  subjectId: idSchema,
  topicId: idSchema.nullable(),
  date: dateSchema,
  startTime: timeSchema,
  duration: durationSchema,
  type: sessionTypeSchema,
  goal: goalSchema,
  priority: prioritySchema,
  completed: z.boolean(),
  energy_level: energyLevelSchema.optional(),
  feedback_difficulty: z.enum(["easy", "medium", "hard"]).optional(),
}).strict();

export type SubjectInput = z.infer<typeof subjectInputSchema>;
export type TopicInput = z.infer<typeof topicInputSchema>;
export type StudySessionInput = z.infer<typeof studySessionInputSchema>;

/**
 * Validiert Eingaben für ein Fach. Wirft bei Fehler (für UI: Fehlermeldung nutzen).
 */
export function validateSubjectInput(
  data: unknown
): z.infer<typeof subjectInputSchema> {
  return subjectInputSchema.parse(data);
}

/**
 * Validiert Eingaben für ein Thema.
 */
export function validateTopicInput(
  data: unknown
): z.infer<typeof topicInputSchema> {
  return topicInputSchema.parse(data);
}

/**
 * Validiert Eingaben für eine Lerneinheit.
 */
export function validateStudySessionInput(
  data: unknown
): z.infer<typeof studySessionInputSchema> {
  return studySessionInputSchema.parse(data);
}

/**
 * Safe-Varianten: geben Ergebnis mit success/error zurück statt zu werfen.
 */
export function safeValidateSubjectInput(data: unknown): {
  success: true;
  data: SubjectInput;
} | {
  success: false;
  error: string;
} {
  const result = subjectInputSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const msg = result.error.issues.map((e) => e.message).join(", ");
  return { success: false, error: msg };
}

export function safeValidateTopicInput(data: unknown): {
  success: true;
  data: TopicInput;
} | {
  success: false;
  error: string;
} {
  const result = topicInputSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const msg = result.error.issues.map((e) => e.message).join(", ");
  return { success: false, error: msg };
}

export function safeValidateStudySessionInput(data: unknown): {
  success: true;
  data: StudySessionInput;
} | {
  success: false;
  error: string;
} {
  const result = studySessionInputSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const msg = result.error.issues.map((e) => e.message).join(", ");
  return { success: false, error: msg };
}
