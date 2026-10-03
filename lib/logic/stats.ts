import { rangeKeys, type DayKey } from "@/lib/date";
import { bestStreak, dayOutcome } from "@/lib/logic/habits";
import { POINTS_PER_DONE } from "@/lib/logic/rewards";
import type { Habit, HabitLogs } from "@/lib/schema";

export interface PeriodStats {
  /** done / (scheduled − skipped), null when nothing was due. */
  rate: number | null;
  completed: number;
  /** Explicit failures plus past scheduled days left undone. */
  failed: number;
  skipped: number;
  pending: number;
  points: number;
  bestStreak: number;
}

export interface DayPoint {
  day: DayKey;
  done: number;
  /** Habits due that day, skipped ones excluded. */
  total: number;
  rate: number | null;
}

export function dayPoint(habits: Habit[], logs: HabitLogs, day: DayKey, today: DayKey): DayPoint {
  let done = 0;
  let total = 0;
  for (const habit of habits) {
    const outcome = dayOutcome(habit, logs[habit.id], day, today);
    if (outcome === "none" || outcome === "future" || outcome === "skipped") continue;
    total++;
    if (outcome === "done") done++;
  }
  return { day, done, total, rate: total ? done / total : null };
}

export function dailySeries(habits: Habit[], logs: HabitLogs, from: DayKey, to: DayKey, today: DayKey): DayPoint[] {
  return rangeKeys(from, to).map((day) => dayPoint(habits, logs, day, today));
}

export function computeStats(habits: Habit[], logs: HabitLogs, from: DayKey, to: DayKey, today: DayKey): PeriodStats {
  const stats: PeriodStats = { rate: null, completed: 0, failed: 0, skipped: 0, pending: 0, points: 0, bestStreak: 0 };
  const end = to < today ? to : today;
  for (const habit of habits) {
    for (const day of rangeKeys(from, end)) {
      switch (dayOutcome(habit, logs[habit.id], day, today)) {
        case "done":
          stats.completed++;
          break;
        case "failed":
        case "missed":
          stats.failed++;
          break;
        case "skipped":
          stats.skipped++;
          break;
        case "pending":
          stats.pending++;
          break;
      }
    }
    stats.bestStreak = Math.max(stats.bestStreak, bestStreak(habit, logs[habit.id], today, from, end));
  }
  const due = stats.completed + stats.failed + stats.pending;
  stats.rate = due ? stats.completed / due : null;
  stats.points = stats.completed * POINTS_PER_DONE;
  return stats;
}
