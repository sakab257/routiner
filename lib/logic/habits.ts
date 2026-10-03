import { addDays, dayKeyOfIso, diffDays, weekday, type DayKey } from "@/lib/date";
import type { Habit, LogEntry } from "@/lib/schema";

/**
 * What a habit looks like on a given day, after applying the business rules:
 * - "none": not scheduled / not active that day (neutral)
 * - "future": after today
 * - "pending": today, nothing decided yet
 * - "missed": a past scheduled day of a build habit with no completion
 * - "done" | "failed" | "skipped": explicit or derived outcome
 */
export type DayOutcome = "none" | "future" | "pending" | "missed" | "done" | "failed" | "skipped";

export type DayLogs = Record<DayKey, LogEntry> | undefined;

export function createdDay(habit: Habit): DayKey {
  return dayKeyOfIso(habit.createdAt);
}

export function isActiveOn(habit: Habit, day: DayKey): boolean {
  if (day < createdDay(habit)) return false;
  if (habit.archivedAt && day >= dayKeyOfIso(habit.archivedAt)) return false;
  return true;
}

export function isScheduledOn(habit: Habit, day: DayKey): boolean {
  return habit.schedule.days.includes(weekday(day));
}

export function isDueOn(habit: Habit, day: DayKey): boolean {
  return isActiveOn(habit, day) && isScheduledOn(habit, day);
}

export function dayOutcome(habit: Habit, logs: DayLogs, day: DayKey, today: DayKey): DayOutcome {
  if (day > today) return "future";
  if (!isDueOn(habit, day)) return "none";
  const entry = logs?.[day];
  if (entry && entry.status !== "pending") return entry.status;
  if (habit.kind === "build" && entry && entry.value >= habit.goal.target) return "done";
  if (day === today) return "pending";
  // Quit habits: a past day without relapse counts as a success.
  return habit.kind === "quit" ? "done" : "missed";
}

/** Outcome kinds that break a streak. */
const BREAKS = new Set<DayOutcome>(["failed", "missed"]);

/**
 * Consecutive successful days ending today. "done" extends the streak,
 * "failed"/"missed" break it, "skipped" and unscheduled days are neutral,
 * and today's pending state doesn't break it (the day isn't over).
 */
export function currentStreak(habit: Habit, logs: DayLogs, today: DayKey): number {
  const start = createdDay(habit);
  let streak = 0;
  for (let day = today; day >= start; day = addDays(day, -1)) {
    const outcome = dayOutcome(habit, logs, day, today);
    if (outcome === "done") streak++;
    else if (BREAKS.has(outcome)) break;
  }
  return streak;
}

/** Longest run of successful days within [from, to] (clamped to the habit's life and today). */
export function bestStreak(
  habit: Habit,
  logs: DayLogs,
  today: DayKey,
  from: DayKey = createdDay(habit),
  to: DayKey = today,
): number {
  const start = from > createdDay(habit) ? from : createdDay(habit);
  const end = to < today ? to : today;
  let best = 0;
  let run = 0;
  for (let i = 0, n = diffDays(start, end); i <= n; i++) {
    const outcome = dayOutcome(habit, logs, addDays(start, i), today);
    if (outcome === "done") {
      run++;
      if (run > best) best = run;
    } else if (BREAKS.has(outcome)) {
      run = 0;
    }
  }
  return best;
}

/** Default "+" increment for a goal, based on its unit and target. */
export function defaultStep(goal: Habit["goal"]): number {
  const byUnit: Record<string, number> = { ml: 250, steps: 1000, min: 5 };
  const step = byUnit[goal.unit.toLowerCase()];
  if (step && step < goal.target) return step;
  if (goal.target <= 10) return 1;
  return Math.ceil(goal.target / 4);
}

/** Progress ratio 0…1 shown in the habit's ring for a day. */
export function progressRatio(habit: Habit, entry: LogEntry | undefined, outcome: DayOutcome): number {
  if (outcome === "done") return 1;
  if (habit.kind === "quit") return 0;
  return Math.min(1, (entry?.value ?? 0) / habit.goal.target);
}
