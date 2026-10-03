import {
  appDataSchema,
  backupSchema,
  challengeSchema,
  DATA_VERSION,
  dayKeySchema,
  DEFAULT_SETTINGS,
  emptyData,
  habitSchema,
  logEntrySchema,
  moodValueSchema,
  settingsSchema,
  type AppData,
  type Backup,
  type HabitLogs,
} from "@/lib/schema";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Salvage whatever is valid from untrusted persisted data instead of
 * discarding everything when a single record is malformed.
 */
export function sanitizeData(raw: unknown): AppData {
  const base = emptyData();
  if (!isRecord(raw)) return base;

  const habits = Array.isArray(raw.habits)
    ? raw.habits.flatMap((h) => {
        const r = habitSchema.safeParse(h);
        return r.success ? [r.data] : [];
      })
    : [];
  const habitIds = new Set(habits.map((h) => h.id));

  const logs: HabitLogs = {};
  if (isRecord(raw.logs)) {
    for (const [habitId, days] of Object.entries(raw.logs)) {
      if (!habitIds.has(habitId) || !isRecord(days)) continue;
      for (const [day, entry] of Object.entries(days)) {
        const e = logEntrySchema.safeParse(entry);
        if (!dayKeySchema.safeParse(day).success || !e.success) continue;
        (logs[habitId] ??= {})[day] = e.data;
      }
    }
  }

  const moods: AppData["moods"] = {};
  if (isRecord(raw.moods)) {
    for (const [day, value] of Object.entries(raw.moods)) {
      const v = moodValueSchema.safeParse(value);
      if (dayKeySchema.safeParse(day).success && v.success) moods[day] = v.data;
    }
  }

  const challenges = Array.isArray(raw.challenges)
    ? raw.challenges.flatMap((c) => {
        const r = challengeSchema.safeParse(c);
        return r.success ? [{ ...r.data, habitIds: r.data.habitIds.filter((id) => habitIds.has(id)) }] : [];
      })
    : [];

  const settings = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...(isRecord(raw.settings) ? raw.settings : {}) });

  const dismissedReminders: AppData["dismissedReminders"] = {};
  if (isRecord(raw.dismissedReminders)) {
    for (const [day, ids] of Object.entries(raw.dismissedReminders)) {
      if (dayKeySchema.safeParse(day).success && Array.isArray(ids)) {
        dismissedReminders[day] = ids.filter((id): id is string => typeof id === "string");
      }
    }
  }

  return {
    habits,
    logs,
    moods,
    challenges,
    settings: settings.success ? settings.data : { ...DEFAULT_SETTINGS },
    onboarded: typeof raw.onboarded === "boolean" ? raw.onboarded : habits.length > 0,
    badgesSeen: Array.isArray(raw.badgesSeen) ? raw.badgesSeen.filter((b): b is string => typeof b === "string") : [],
    dismissedReminders,
  };
}

/**
 * MIGRATIONS[v] upgrades data shaped for version v to version v + 1.
 * Add an entry whenever DATA_VERSION is bumped; steps only reshape data,
 * sanitizeData() validates the final result.
 */
export const MIGRATIONS: Record<number, (state: unknown) => unknown> = {};

export function migrateData(raw: unknown, fromVersion: number): AppData {
  let state = raw;
  for (let v = fromVersion; v < DATA_VERSION; v++) {
    state = MIGRATIONS[v]?.(state) ?? state;
  }
  return sanitizeData(state);
}

export function createBackup(data: AppData, now: Date = new Date()): Backup {
  return { app: "routiner", version: DATA_VERSION, exportedAt: now.toISOString(), data };
}

export type ImportResult = { ok: true; data: AppData } | { ok: false; error: string };

/** Validate an exported JSON file before replacing the current data. */
export function parseBackup(text: string): ImportResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "Ce fichier n'est pas un JSON valide." };
  }
  const result = backupSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? ` (${issue.path.join(".")})` : "";
    return { ok: false, error: `Sauvegarde Routiner invalide${where} : ${issue?.message ?? "format inconnu"}.` };
  }
  // Drop dangling references (logs or challenge links to unknown habits).
  return { ok: true, data: appDataSchema.parse(sanitizeData(result.data.data)) };
}
