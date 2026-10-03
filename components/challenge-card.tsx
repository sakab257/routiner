"use client";

import Link from "next/link";
import { Chip, Emoji } from "@/components/kit";
import { diffDays, type DayKey } from "@/lib/date";
import { challengeProgress } from "@/lib/logic/challenges";
import { isDueOn } from "@/lib/logic/habits";
import type { Challenge } from "@/lib/schema";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function challengeEmoji(challenge: Challenge, habitEmoji?: string) {
  return challenge.emoji ?? habitEmoji ?? "🏆";
}

export function ChallengeCard({ challenge, today }: { challenge: Challenge; today: DayKey }) {
  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);
  const p = challengeProgress(challenge, habits, logs, today);
  const linked = habits.filter((h) => challenge.habitIds.includes(h.id));
  const tasksToday = linked.filter((h) => isDueOn(h, today)).length;

  const detail =
    p.phase === "upcoming"
      ? `Commence dans ${diffDays(today, challenge.startDate)} j`
      : p.phase === "finished"
        ? `${p.doneDays} jour${p.doneDays > 1 ? "s" : ""} réussi${p.doneDays > 1 ? "s" : ""} sur ${challenge.days}`
        : `Jour ${p.dayIndex} sur ${challenge.days}${tasksToday ? ` · ${tasksToday} tâche${tasksToday > 1 ? "s" : ""} aujourd'hui` : ""}`;

  const chip =
    p.phase === "upcoming"
      ? { label: "À VENIR", className: "bg-soft text-accent-ink" }
      : p.phase === "finished"
        ? p.won
          ? { label: "RÉUSSI", className: "bg-success-soft text-success-ink" }
          : { label: "TERMINÉ", className: "bg-track text-ink-60" }
        : { label: `${p.remainingDays} J`, className: "bg-warn-soft text-warn-ink" };

  return (
    <Link
      href={`/defi?id=${challenge.id}`}
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 transition-colors active:bg-soft"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-soft">
          <Emoji className="text-xl">{challengeEmoji(challenge, linked[0]?.emoji)}</Emoji>
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-semibold">{challenge.title}</span>
          <span className="truncate text-xs text-ink-60">{detail}</span>
        </div>
        <Chip className={cn(chip.className)}>{chip.label}</Chip>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${Math.round(p.elapsed * 100)}%` }}
        />
      </div>
    </Link>
  );
}
