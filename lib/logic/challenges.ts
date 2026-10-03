import { addDays, diffDays, type DayKey } from "@/lib/date";
import { dayOutcome } from "@/lib/logic/habits";
import type { Challenge, Habit, HabitLogs } from "@/lib/schema";

/** "rest": no linked habit was due that day. */
export type ChallengeDayOutcome = "done" | "failed" | "pending" | "rest" | "future";

export type ChallengePhase = "upcoming" | "active" | "finished";

export interface ChallengeProgress {
  phase: ChallengePhase;
  /** 1-based index of today within the challenge, clamped to [0, days]. */
  dayIndex: number;
  remainingDays: number;
  doneDays: number;
  failedDays: number;
  /** Share of the challenge's duration already elapsed (0…1). */
  elapsed: number;
  /** Finished without a single failed day. */
  won: boolean;
}

export function challengeEnd(challenge: Challenge): DayKey {
  return addDays(challenge.startDate, challenge.days - 1);
}

export function challengeDays(challenge: Challenge): DayKey[] {
  return Array.from({ length: challenge.days }, (_, i) => addDays(challenge.startDate, i));
}

export function challengeDayOutcome(
  challenge: Challenge,
  habits: Habit[],
  logs: HabitLogs,
  day: DayKey,
  today: DayKey,
): ChallengeDayOutcome {
  if (day > today) return "future";
  const linked = habits.filter((h) => challenge.habitIds.includes(h.id));
  let due = 0;
  let pending = false;
  for (const habit of linked) {
    const outcome = dayOutcome(habit, logs[habit.id], day, today);
    if (outcome === "none" || outcome === "future") continue;
    due++;
    if (outcome === "failed" || outcome === "missed") return "failed";
    if (outcome === "pending") pending = true;
  }
  if (!due) return "rest";
  return pending ? "pending" : "done";
}

export function challengeProgress(
  challenge: Challenge,
  habits: Habit[],
  logs: HabitLogs,
  today: DayKey,
): ChallengeProgress {
  const end = challengeEnd(challenge);
  const phase: ChallengePhase = today < challenge.startDate ? "upcoming" : today > end ? "finished" : "active";
  const dayIndex = Math.max(0, Math.min(challenge.days, diffDays(challenge.startDate, today) + 1));
  let doneDays = 0;
  let failedDays = 0;
  for (const day of challengeDays(challenge)) {
    const outcome = challengeDayOutcome(challenge, habits, logs, day, today);
    if (outcome === "done") doneDays++;
    else if (outcome === "failed") failedDays++;
  }
  return {
    phase,
    dayIndex,
    remainingDays: challenge.days - dayIndex,
    doneDays,
    failedDays,
    elapsed: dayIndex / challenge.days,
    won: phase === "finished" && failedDays === 0 && doneDays > 0,
  };
}
