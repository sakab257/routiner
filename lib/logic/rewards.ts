import { rangeKeys, type DayKey } from "@/lib/date";
import { challengeProgress } from "@/lib/logic/challenges";
import { bestStreak, createdDay, dayOutcome } from "@/lib/logic/habits";
import type { Challenge, Habit, HabitLogs } from "@/lib/schema";

export const POINTS_PER_DONE = 10;
export const POINTS_PER_CHALLENGE = 50;

export const BADGE_TIERS = [
  { days: 3, title: "Bon départ" },
  { days: 7, title: "Une semaine" },
  { days: 14, title: "Deux semaines" },
  { days: 21, title: "Habitude ancrée" },
  { days: 30, title: "Un mois" },
  { days: 60, title: "Deux mois" },
  { days: 100, title: "Centurion" },
  { days: 365, title: "Une année" },
] as const;

export interface Badge {
  id: string;
  days: number;
  title: string;
  /** The habit whose best streak unlocked the badge. */
  habitId: string;
  habitName: string;
}

export const badgeId = (days: number) => `streak-${days}`;

export function countDone(habit: Habit, logs: HabitLogs, today: DayKey): number {
  let done = 0;
  for (const day of rangeKeys(createdDay(habit), today)) {
    if (dayOutcome(habit, logs[habit.id], day, today) === "done") done++;
  }
  return done;
}

export function totalPoints(habits: Habit[], logs: HabitLogs, challenges: Challenge[], today: DayKey): number {
  const done = habits.reduce((sum, h) => sum + countDone(h, logs, today), 0);
  const won = challenges.filter((c) => challengeProgress(c, habits, logs, today).won).length;
  return done * POINTS_PER_DONE + won * POINTS_PER_CHALLENGE;
}

/** Badges unlocked by streak tiers, each credited to the habit with the best streak. */
export function earnedBadges(habits: Habit[], logs: HabitLogs, today: DayKey): Badge[] {
  let champion: { habit: Habit; best: number } | null = null;
  for (const habit of habits) {
    const best = bestStreak(habit, logs[habit.id], today);
    if (!champion || best > champion.best) champion = { habit, best };
  }
  if (!champion) return [];
  const { habit, best } = champion;
  return BADGE_TIERS.filter((tier) => best >= tier.days).map((tier) => ({
    id: badgeId(tier.days),
    days: tier.days,
    title: tier.title,
    habitId: habit.id,
    habitName: habit.name,
  }));
}

/** Badges earned but not yet celebrated, lowest tier first. */
export function newBadges(earned: Badge[], seen: string[]): Badge[] {
  return earned.filter((b) => !seen.includes(b.id));
}
