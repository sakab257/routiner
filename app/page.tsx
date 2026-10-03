"use client";

import { Plus, SmilePlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ChallengeCard } from "@/components/challenge-card";
import { DayStrip } from "@/components/day-strip";
import { HabitList } from "@/components/habit-list";
import { Emoji, Screen, SectionHeader } from "@/components/kit";
import { ProgressBanner } from "@/components/progress-banner";
import { ReminderBanner } from "@/components/reminder-banner";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { MOODS } from "@/lib/catalog";
import { formatLongDay } from "@/lib/date";
import { challengeEnd } from "@/lib/logic/challenges";
import { isDueOn } from "@/lib/logic/habits";
import { dayPoint } from "@/lib/logic/stats";
import { useAppStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 4) return "Bonsoir";
  return "Bonjour";
}

export default function HomePage() {
  const today = useToday();
  const [picked, setPicked] = useState<string | null>(null);
  // A day picked before midnight shouldn't stick once "today" moves on.
  const day = picked && picked <= today ? picked : today;

  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);
  const challenges = useAppStore((s) => s.challenges);
  const mood = useAppStore((s) => s.moods[today]);
  const setPlusOpen = useUiStore((s) => s.setPlusOpen);
  const openSheet = useUiStore((s) => s.openSheet);

  const due = habits.filter((h) => isDueOn(h, day));
  const point = dayPoint(habits, logs, day, today);
  const activeChallenges = challenges
    .filter((c) => challengeEnd(c) >= today)
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
    .slice(0, 2);
  const hasActiveHabits = habits.some((h) => !h.archivedAt);

  return (
    <Screen withNav className="gap-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="text-2xl font-bold tracking-[-0.3px]">
            {greeting()} <Emoji>👋</Emoji>
          </h1>
          <p className="truncate text-sm text-ink-60">{formatLongDay(today)} · on garde le rythme</p>
        </div>
        <button
          type="button"
          aria-label={mood ? `Humeur du jour : ${MOODS[mood - 1].label}` : "Noter mon humeur"}
          onClick={() => setPlusOpen(true)}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-soft text-accent-ink active:scale-95"
        >
          {mood ? <Emoji className="text-[28px]">{MOODS[mood - 1].emoji}</Emoji> : <SmilePlus className="size-6" />}
        </button>
      </header>

      <ReminderBanner today={today} />

      <DayStrip today={today} selected={day} onSelect={setPicked} habits={habits} logs={logs} />

      <ProgressBanner done={point.done} total={point.total} day={day} today={today} />

      <section className="flex flex-col gap-1">
        <SectionHeader title="Défis" href="/defis" />
        {activeChallenges.length ? (
          <div className="flex flex-col gap-2.5">
            {activeChallenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} today={today} />
            ))}
          </div>
        ) : (
          <Link
            href="/defis/nouveau"
            className="flex items-center gap-3 rounded-card border border-dashed border-brand-300 p-4 text-accent-ink active:bg-soft"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-soft">
              <Plus className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-base font-semibold">Lance-toi un défi</span>
              <span className="text-xs text-ink-60">7, 21 ou 30 jours pour ancrer une habitude</span>
            </span>
          </Link>
        )}
      </section>

      <section className="flex flex-col gap-1">
        <SectionHeader title="Habitudes" href="/habitudes" />
        {due.length ? (
          <HabitList habits={due} day={day} today={today} />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface px-6 py-8 text-center">
            <Emoji className="text-4xl">{hasActiveHabits ? "🌤️" : "🌱"}</Emoji>
            <p className="text-base font-semibold">
              {hasActiveHabits ? "Rien de prévu ce jour-là" : "Aucune habitude pour l'instant"}
            </p>
            <p className="text-sm text-ink-60">
              {hasActiveHabits
                ? "Profite de cette pause, ou ajoute une habitude."
                : "Commence petit : une habitude suffit pour lancer la routine."}
            </p>
            <Button onClick={() => openSheet("build")} className="mt-1">
              <Plus /> Ajouter une habitude
            </Button>
          </div>
        )}
      </section>
    </Screen>
  );
}
