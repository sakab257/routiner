import { z } from "zod";
import { isDayKey } from "@/lib/date";

export const DATA_VERSION = 1;
/** localStorage key of the persisted store. */
export const STORAGE_KEY = "routiner:v1";

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dayKeySchema = z
  .string()
  .regex(DAY_KEY_RE, "Date attendue au format AAAA-MM-JJ")
  .refine(isDayKey, "Date inexistante");

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure attendue au format HH:MM");

export const habitKindSchema = z.enum(["build", "quit"]);
export const logStatusSchema = z.enum(["pending", "done", "failed", "skipped"]);
export const themeSchema = z.enum(["light", "dark", "system"]);

export const habitSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  emoji: z.string().min(1).max(16),
  color: z.string().min(1).max(24),
  kind: habitKindSchema,
  goal: z.object({
    target: z.number().positive().max(1_000_000),
    /** "times" | "ml" | "steps" | "min" or any custom unit. */
    unit: z.string().trim().min(1).max(16),
  }),
  schedule: z.object({
    /** Weekday indices, 0 = Sunday … 6 = Saturday. */
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  }),
  reminder: z.object({ enabled: z.boolean(), time: timeSchema }).optional(),
  createdAt: z.iso.datetime({ offset: true }),
  archivedAt: z.iso.datetime({ offset: true }).optional(),
});

export const logEntrySchema = z.object({
  value: z.number().min(0),
  status: logStatusSchema,
});

export const moodValueSchema = z.number().int().min(1).max(5);

export const challengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(60),
  emoji: z.string().min(1).max(16).optional(),
  startDate: dayKeySchema,
  days: z.number().int().min(1).max(365),
  habitIds: z.array(z.string().min(1)),
});

export const settingsSchema = z.object({
  theme: themeSchema,
  sounds: z.boolean(),
  vibrations: z.boolean(),
});

export const appDataSchema = z.object({
  habits: z.array(habitSchema),
  logs: z.record(z.string(), z.record(dayKeySchema, logEntrySchema)),
  moods: z.record(dayKeySchema, moodValueSchema),
  challenges: z.array(challengeSchema),
  settings: settingsSchema,
  onboarded: z.boolean(),
  badgesSeen: z.array(z.string()),
  dismissedReminders: z.record(dayKeySchema, z.array(z.string())),
});

export const backupSchema = z.object({
  app: z.literal("routiner"),
  version: z.number().int().min(1).max(DATA_VERSION),
  exportedAt: z.string(),
  data: appDataSchema,
});

export type Habit = z.infer<typeof habitSchema>;
export type HabitKind = z.infer<typeof habitKindSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type LogStatus = z.infer<typeof logStatusSchema>;
export type MoodValue = 1 | 2 | 3 | 4 | 5;
export type Challenge = z.infer<typeof challengeSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type ThemePreference = z.infer<typeof themeSchema>;
/** logs[habitId][dayKey] */
export type HabitLogs = Record<string, Record<string, LogEntry>>;
export type AppData = z.infer<typeof appDataSchema>;
export type Backup = z.infer<typeof backupSchema>;

export const DEFAULT_SETTINGS: Settings = { theme: "system", sounds: true, vibrations: true };

export function emptyData(): AppData {
  return {
    habits: [],
    logs: {},
    moods: {},
    challenges: [],
    settings: { ...DEFAULT_SETTINGS },
    onboarded: false,
    badgesSeen: [],
    dismissedReminders: {},
  };
}
