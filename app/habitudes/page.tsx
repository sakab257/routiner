"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Emoji, FieldLabel, Screen, ScreenTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { habitColor, scheduleLabel } from "@/lib/catalog";
import { currentStreak } from "@/lib/logic/habits";
import type { Habit } from "@/lib/schema";
import { useAppStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";

function HabitRow({ habit, streak }: { habit: Habit; streak: number }) {
  return (
    <Link
      href={`/habitude?id=${habit.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 active:bg-soft"
    >
      <span className="flex size-12 items-center justify-center rounded-tile" style={{ background: habitColor(habit.color).tint }}>
        <Emoji className="text-2xl">{habit.emoji}</Emoji>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base font-semibold">{habit.name}</span>
        <span className="truncate text-xs text-ink-60">
          {habit.kind === "quit" ? "À arrêter" : "À construire"} · {scheduleLabel(habit.schedule.days)}
          {streak > 1 && ` · 🔥 ${streak} j`}
        </span>
      </span>
      <ChevronRight className="size-5 text-ink-40" />
    </Link>
  );
}

export default function HabitsPage() {
  const today = useToday();
  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);
  const openSheet = useUiStore((s) => s.openSheet);
  const active = habits.filter((h) => !h.archivedAt);
  const archived = habits.filter((h) => h.archivedAt);

  return (
    <Screen className="gap-2.5">
      <ScreenTitle
        back="/"
        right={
          <Button variant="outline" size="icon-lg" aria-label="Nouvelle habitude" onClick={() => openSheet("build")}>
            <Plus />
          </Button>
        }
      >
        Mes habitudes
      </ScreenTitle>
      <FieldLabel>Actives · {active.length}</FieldLabel>
      {active.length ? (
        active.map((h) => <HabitRow key={h.id} habit={h} streak={currentStreak(h, logs[h.id], today)} />)
      ) : (
        <p className="py-4 text-center text-sm text-ink-60">Aucune habitude active.</p>
      )}
      {archived.length > 0 && (
        <>
          <FieldLabel className="mt-4">Archivées · {archived.length}</FieldLabel>
          <div className="flex flex-col gap-2.5 opacity-60">
            {archived.map((h) => (
              <HabitRow key={h.id} habit={h} streak={0} />
            ))}
          </div>
        </>
      )}
    </Screen>
  );
}
