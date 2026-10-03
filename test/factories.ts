import type { DayKey } from "@/lib/date";
import type { Challenge, Habit, LogEntry, LogStatus } from "@/lib/schema";

/** ISO timestamp at local noon of a day key. */
export function isoAt(day: DayKey, hour = 12): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, hour).toISOString();
}

export function makeHabit(overrides: Partial<Habit> & { created?: DayKey } = {}): Habit {
  const { created = "2026-09-01", ...rest } = overrides;
  return {
    id: "h1",
    name: "Boire de l'eau",
    emoji: "💧",
    color: "teal",
    kind: "build",
    goal: { target: 2000, unit: "ml" },
    schedule: { days: [0, 1, 2, 3, 4, 5, 6] },
    createdAt: isoAt(created),
    ...rest,
  };
}

export function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return { id: "c1", title: "Lire 30 jours", startDate: "2026-09-21", days: 7, habitIds: ["h1"], ...overrides };
}

/** logs for one habit: { "2026-10-01": "done", ... } → Record<DayKey, LogEntry> */
export function dayLogs(map: Record<DayKey, LogStatus | number>): Record<DayKey, LogEntry> {
  return Object.fromEntries(
    Object.entries(map).map(([day, v]) => [
      day,
      typeof v === "number" ? { value: v, status: "pending" as const } : { value: v === "done" ? 2000 : 0, status: v },
    ]),
  );
}
