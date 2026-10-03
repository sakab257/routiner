"use client";

import { Archive, ArchiveRestore, Bell, Check, ChevronsRight, Minus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Hero, HeroBody } from "@/components/hero";
import { Card, formatNumber } from "@/components/kit";
import { NotFound } from "@/components/not-found";
import { CalendarLegend, OutcomeCalendar, type CalendarState } from "@/components/outcome-calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { scheduleLabel, unitLabel } from "@/lib/catalog";
import { addDays, dayKeyOfIso, endOfWeek, formatShortDay, rangeKeys, startOfWeek, type DayKey } from "@/lib/date";
import { feedback } from "@/lib/feedback";
import { bestStreak, currentStreak, dayOutcome, defaultStep } from "@/lib/logic/habits";
import { computeStats } from "@/lib/logic/stats";
import type { Habit } from "@/lib/schema";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col rounded-tile bg-white/14 px-3 py-2.5">
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-white/85">{label}</span>
    </div>
  );
}

function TodayPanel({ habit, today }: { habit: Habit; today: DayKey }) {
  const logs = useAppStore((s) => s.logs[habit.id]);
  const { increment, setStatus, resetDay, setLogValue } = useAppStore.getState();
  const entry = logs?.[today];
  const outcome = dayOutcome(habit, logs, today, today);
  const quit = habit.kind === "quit";

  if (outcome === "none") {
    return <p className="text-sm text-ink-60">Pas prévue aujourd&apos;hui : profite de la pause.</p>;
  }

  const act = (status: "done" | "failed" | "skipped") => {
    setStatus(habit.id, today, status);
    feedback(status === "done" ? "done" : status === "failed" ? "fail" : "tap");
  };

  return (
    <div className="flex flex-col gap-3">
      {!quit && (
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Retirer"
            disabled={!entry?.value}
            onClick={() => setLogValue(habit.id, today, Math.max(0, (entry?.value ?? 0) - defaultStep(habit.goal)))}
          >
            <Minus />
          </Button>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xl font-bold">
              {formatNumber(entry?.value ?? 0)} / {formatNumber(habit.goal.target)}
            </span>
            <span className="text-xs text-ink-60">{unitLabel(habit.goal.unit)} aujourd&apos;hui</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Ajouter"
            onClick={() => {
              increment(habit.id, today);
              const after = useAppStore.getState().logs[habit.id]?.[today];
              feedback(after?.status === "done" ? "done" : "tap");
            }}
          >
            <Plus />
          </Button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <StatusButton active={outcome === "done"} onClick={() => act("done")} className="bg-success-soft text-success-ink" activeClass="bg-success-strong text-white">
          <Check /> {quit ? "Tenu" : "Fait"}
        </StatusButton>
        <StatusButton active={outcome === "failed"} onClick={() => act("failed")} className="bg-fail-soft text-fail-ink" activeClass="bg-fail-strong text-white">
          <X /> {quit ? "Rechute" : "Échec"}
        </StatusButton>
        <StatusButton active={outcome === "skipped"} onClick={() => act("skipped")} className="bg-track text-ink" activeClass="bg-ink text-bg">
          <ChevronsRight /> Passer
        </StatusButton>
      </div>
      {entry && (
        <Button variant="ghost" size="sm" className="self-center text-ink-60" onClick={() => resetDay(habit.id, today)}>
          <RotateCcw className="size-4" /> Réinitialiser la journée
        </Button>
      )}
    </div>
  );
}

function StatusButton({
  active,
  className,
  activeClass,
  ...props
}: React.ComponentProps<"button"> & { active: boolean; activeClass: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "flex h-12 items-center justify-center gap-1.5 rounded-tile text-sm font-bold transition-colors active:scale-95 [&_svg]:size-4.5",
        active ? activeClass : className,
      )}
      {...props}
    />
  );
}

export function HabitDetailScreen() {
  const router = useRouter();
  const today = useToday();
  const id = useSearchParams().get("id");
  const habit = useAppStore((s) => s.habits.find((h) => h.id === id));
  const logs = useAppStore((s) => s.logs);
  const setArchived = useAppStore((s) => s.setArchived);
  const deleteHabit = useAppStore((s) => s.deleteHabit);

  if (!habit) return <NotFound what="Cette habitude" />;

  const habitLogs = logs[habit.id];
  const quit = habit.kind === "quit";
  const month = computeStats([habit], logs, addDays(today, -29), today, today);
  const calendarDays = rangeKeys(addDays(startOfWeek(today), -28), endOfWeek(today));
  const stateOf = (day: DayKey): CalendarState => {
    const o = dayOutcome(habit, habitLogs, day, today);
    if (o === "missed") return "failed";
    if (o === "none") return day < dayKeyOfIso(habit.createdAt) ? "off" : "rest";
    return o;
  };

  return (
    <main className="min-h-dvh">
      <Hero
        emoji={habit.emoji}
        eyebrow={`${quit ? "À ARRÊTER" : "À CONSTRUIRE"} · ${scheduleLabel(habit.schedule.days).toUpperCase()}`}
        title={habit.name}
        subtitle={
          quit
            ? "Chaque jour sans rechute compte."
            : `Objectif : ${formatNumber(habit.goal.target)} ${unitLabel(habit.goal.unit)} par jour`
        }
        editHref={`/habitudes/modifier?id=${habit.id}`}
      >
        <div className="mt-5 flex gap-2">
          <Stat value={`${currentStreak(habit, habitLogs, today)} j`} label="Série actuelle" />
          <Stat value={`${bestStreak(habit, habitLogs, today)} j`} label="Meilleure série" />
          <Stat value={month.rate === null ? "—" : `${Math.round(month.rate * 100)} %`} label="Réussite 30 j" />
        </div>
      </Hero>
      <HeroBody>
        {habit.archivedAt ? (
          <Card className="flex items-center gap-3 p-4 text-sm text-ink-60">
            <Archive className="size-5 shrink-0" />
            Archivée le {formatShortDay(dayKeyOfIso(habit.archivedAt))}. Son historique reste dans tes statistiques.
          </Card>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Aujourd&apos;hui</h2>
            <Card className="p-4">
              <TodayPanel habit={habit} today={today} />
            </Card>
          </>
        )}

        <div className="mt-2.5 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">5 dernières semaines</h2>
          <span className="text-xs text-ink-60">
            {month.completed} réussi{month.completed > 1 ? "s" : ""} · {month.failed} manqué{month.failed > 1 ? "s" : ""}
          </span>
        </div>
        <Card className="flex flex-col gap-3 p-3">
          <OutcomeCalendar days={calendarDays} stateOf={stateOf} />
          <CalendarLegend />
        </Card>

        {habit.reminder?.enabled && (
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-soft text-accent-ink">
              <Bell className="size-5" />
            </span>
            <span className="flex-1 text-base font-medium">Rappel dans l&apos;app</span>
            <span className="rounded-[10px] bg-track px-3 py-1.5 font-semibold">{habit.reminder.time}</span>
          </Card>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            size="lg"
            className="rounded-card text-sm"
            onClick={() => {
              setArchived(habit.id, !habit.archivedAt);
              toast.success(habit.archivedAt ? "Habitude réactivée" : "Habitude archivée");
            }}
          >
            {habit.archivedAt ? <ArchiveRestore /> : <Archive />}
            {habit.archivedAt ? "Réactiver" : "Archiver"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="rounded-card text-sm">
                <Trash2 /> Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer « {habit.name} » ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tout son historique sera effacé. Pour la mettre en pause en gardant tes statistiques, archive-la plutôt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    deleteHabit(habit.id);
                    toast.success("Habitude supprimée");
                    router.replace("/");
                  }}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </HeroBody>
    </main>
  );
}
