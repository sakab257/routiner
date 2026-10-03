"use client";

import { Check, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { challengeEmoji } from "@/components/challenge-card";
import { Hero, HeroBody } from "@/components/hero";
import { Card, Emoji } from "@/components/kit";
import { NotFound } from "@/components/not-found";
import { CalendarLegend, OutcomeCalendar, type CalendarState } from "@/components/outcome-calendar";
import { useToday } from "@/hooks/use-today";
import { formatLongDay, formatShortDay, type DayKey } from "@/lib/date";
import { feedback } from "@/lib/feedback";
import { challengeDayOutcome, challengeDays, challengeEnd, challengeProgress } from "@/lib/logic/challenges";
import { dayOutcome, isDueOn } from "@/lib/logic/habits";
import type { Habit } from "@/lib/schema";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function Task({ habit, today }: { habit: Habit; today: DayKey }) {
  const logs = useAppStore((s) => s.logs[habit.id]);
  const setStatus = useAppStore((s) => s.setStatus);
  const resetDay = useAppStore((s) => s.resetDay);
  const outcome = dayOutcome(habit, logs, today, today);
  const done = outcome === "done";
  const failed = outcome === "failed";
  const skipped = outcome === "skipped";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      onClick={() => {
        if (done || failed || skipped) resetDay(habit.id, today);
        else {
          setStatus(habit.id, today, "done");
          feedback("done");
        }
      }}
      className="flex min-h-16 items-center gap-3 rounded-card border border-line bg-surface px-3.5 text-left active:bg-soft"
    >
      {done ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-brand text-white">
          <Check className="size-4.5" strokeWidth={3} />
        </span>
      ) : failed ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-fail-soft text-fail-ink">
          <X className="size-4.5" strokeWidth={3} />
        </span>
      ) : (
        <span className="size-7 shrink-0 rounded-[9px] border-2 border-ink-40" />
      )}
      <Emoji className="text-xl">{habit.emoji}</Emoji>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("truncate text-base font-semibold", done && "text-ink-60 line-through")}>{habit.name}</span>
        <span className={cn("text-xs", failed ? "text-fail-ink" : "text-ink-60")}>
          {done ? "Fait" : failed ? "Manqué" : skipped ? "Passé aujourd'hui" : "À faire"}
        </span>
      </span>
    </button>
  );
}

export function ChallengeDetailScreen() {
  const today = useToday();
  const id = useSearchParams().get("id");
  const challenge = useAppStore((s) => s.challenges.find((c) => c.id === id));
  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);

  if (!challenge) return <NotFound what="Ce défi" />;

  const linked = habits.filter((h) => challenge.habitIds.includes(h.id));
  const p = challengeProgress(challenge, habits, logs, today);
  const percent = Math.round(p.elapsed * 100);
  const stateOf = (day: DayKey): CalendarState => {
    const o = challengeDayOutcome(challenge, habits, logs, day, today);
    return o === "rest" ? "rest" : o;
  };
  const todayTasks = linked.filter((h) => isDueOn(h, today));

  return (
    <main className="min-h-dvh">
      <Hero
        emoji={challengeEmoji(challenge, linked[0]?.emoji)}
        eyebrow={`DÉFI PERSONNEL · ${challenge.days} JOURS`}
        title={challenge.title}
        subtitle={linked.length ? `Avec : ${linked.map((h) => h.name).join(", ")}` : "Aucune habitude liée"}
        editHref={`/defis/modifier?id=${challenge.id}`}
      >
        <div className="mt-5 flex justify-between text-sm font-semibold">
          <span>
            {p.phase === "upcoming"
              ? `Commence le ${formatShortDay(challenge.startDate)}`
              : p.phase === "finished"
                ? `Terminé le ${formatShortDay(challengeEnd(challenge))}`
                : `Jour ${p.dayIndex} / ${challenge.days}`}
          </span>
          <span>{percent} %</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </Hero>
      <HeroBody>
        {p.phase === "finished" && (
          <Card className={cn("flex items-center gap-3 p-4", p.won ? "border-transparent bg-success-soft" : "")}>
            <Emoji className="text-3xl">{p.won ? "🎉" : "🏁"}</Emoji>
            <span className="text-sm">
              <strong className="block text-base">{p.won ? "Défi réussi !" : "Défi terminé"}</strong>
              {p.doneDays} jour{p.doneDays > 1 ? "s" : ""} réussi{p.doneDays > 1 ? "s" : ""} sur {challenge.days}.
            </span>
          </Card>
        )}
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Calendrier</h2>
          <span className="text-xs text-ink-60">
            {p.doneDays} réussi{p.doneDays > 1 ? "s" : ""} · {p.failedDays} manqué{p.failedDays > 1 ? "s" : ""}
          </span>
        </div>
        <Card className="flex flex-col gap-3 p-3">
          <OutcomeCalendar
            days={challengeDays(challenge)}
            stateOf={stateOf}
            columns={10}
            weekdays={false}
            label={(_, i) => i + 1}
          />
          <CalendarLegend />
        </Card>

        {p.phase === "active" && (
          <>
            <h2 className="mt-2.5 text-lg font-semibold">Tâches du jour</h2>
            {todayTasks.length ? (
              todayTasks.map((h) => <Task key={h.id} habit={h} today={today} />)
            ) : (
              <p className="text-sm text-ink-60">Rien de prévu aujourd&apos;hui pour ce défi.</p>
            )}
          </>
        )}
        {p.phase === "upcoming" && (
          <p className="text-sm text-ink-60">Le défi démarre {formatLongDay(challenge.startDate).toLowerCase()}. Prépare-toi !</p>
        )}
      </HeroBody>
    </main>
  );
}
