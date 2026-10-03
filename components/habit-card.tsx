"use client";

import { Check, ChevronsRight, Eye, Plus, X, type LucideIcon } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Emoji, formatNumber, ProgressRing } from "@/components/kit";
import { unitLabel } from "@/lib/catalog";
import type { DayKey } from "@/lib/date";
import { feedback } from "@/lib/feedback";
import { currentStreak, dayOutcome, defaultStep, progressRatio, type DayOutcome } from "@/lib/logic/habits";
import type { Habit, LogEntry } from "@/lib/schema";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export type SwipeSide = "left" | "right" | null;

const OPEN_OFFSET = 140;
const MAX_OFFSET = 150;
const THRESHOLD = 60;

const RING_COLORS: Partial<Record<DayOutcome, string>> = {
  done: "var(--success-500)",
  failed: "var(--fail-500)",
  skipped: "var(--ink-40)",
};

function subline(habit: Habit, entry: LogEntry | undefined, outcome: DayOutcome, isToday: boolean, streak: number) {
  const skipped = isToday ? "PASSÉ AUJOURD'HUI" : "PASSÉ";
  if (habit.kind === "quit") {
    if (outcome === "failed") return "RECHUTE";
    if (outcome === "skipped") return skipped;
    if (outcome === "done") return isToday ? `TENU · ${streak} J SANS RECHUTE` : "TENU";
    return `${streak} J SANS RECHUTE`;
  }
  const qty = `${formatNumber(entry?.value ?? 0)}/${formatNumber(habit.goal.target)} ${unitLabel(habit.goal.unit).toUpperCase()}`;
  if (outcome === "failed") return `ÉCHOUÉ · ${qty}`;
  if (outcome === "skipped") return skipped;
  if (outcome === "missed") return `MANQUÉ · ${qty}`;
  return qty;
}

function SwipeAction({
  icon: Icon,
  label,
  className,
  visible,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  className: string;
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={onClick}
      className={cn(
        "flex h-18 w-15.5 flex-col items-center justify-center gap-1 rounded-[18px] text-xs font-bold active:scale-95",
        className,
      )}
    >
      <Icon className="size-5.5" strokeWidth={2.4} />
      {label}
    </button>
  );
}

export function HabitCard({
  habit,
  day,
  today,
  open,
  onOpenChange,
}: {
  habit: Habit;
  day: DayKey;
  today: DayKey;
  open: SwipeSide;
  onOpenChange: (side: SwipeSide) => void;
}) {
  const router = useRouter();
  const logs = useAppStore((s) => s.logs[habit.id]);
  const increment = useAppStore((s) => s.increment);
  const setStatus = useAppStore((s) => s.setStatus);
  const resetDay = useAppStore((s) => s.resetDay);

  const entry = logs?.[day];
  const outcome = dayOutcome(habit, logs, day, today);
  const isToday = day === today;
  const streak = habit.kind === "quit" ? currentStreak(habit, logs, today) : 0;
  const quit = habit.kind === "quit";

  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, 24], [0, 1]);
  const rightOpacity = useTransform(x, [-24, 0], [1, 0]);
  const dragged = useRef(false);

  useEffect(() => {
    const target = open === "left" ? OPEN_OFFSET : open === "right" ? -OPEN_OFFSET : 0;
    const controls = animate(x, target, { type: "spring", stiffness: 520, damping: 42 });
    return () => controls.stop();
  }, [open, x]);

  const act = (status: "done" | "failed" | "skipped") => {
    setStatus(habit.id, day, status);
    feedback(status === "done" ? "done" : status === "failed" ? "fail" : "tap");
    onOpenChange(null);
  };

  const onPrimary = () => {
    if (outcome === "done" || outcome === "failed" || outcome === "skipped") {
      resetDay(habit.id, day);
      feedback("tap");
      return;
    }
    increment(habit.id, day);
    const after = useAppStore.getState().logs[habit.id]?.[day];
    feedback(after?.status === "done" ? "done" : "tap");
  };

  const primary =
    outcome === "done"
      ? { icon: Check, label: "Annuler la validation", className: "border-transparent bg-success-soft text-success-ink" }
      : outcome === "failed"
        ? { icon: X, label: "Annuler l'échec", className: "border-transparent bg-fail-soft text-fail-ink" }
        : outcome === "skipped"
          ? { icon: ChevronsRight, label: "Annuler le report", className: "border-transparent bg-track text-ink-60" }
          : quit
            ? { icon: Check, label: "Marquer comme tenu", className: "border-line bg-surface text-ink" }
            : {
                icon: Plus,
                label: `Ajouter ${formatNumber(defaultStep(habit.goal))} ${unitLabel(habit.goal.unit)}`,
                className: "border-line bg-surface text-ink",
              };
  const PrimaryIcon = primary.icon;

  return (
    <div className="relative h-18" data-card-id={habit.id}>
      <motion.div className="absolute inset-y-0 left-0 flex gap-2" style={{ opacity: leftOpacity }}>
        <SwipeAction icon={Eye} label="Voir" className="bg-soft text-accent-ink" visible={open === "left"} onClick={() => router.push(`/habitude?id=${habit.id}`)} />
        <SwipeAction icon={Check} label={quit ? "Tenu" : "Fait"} className="bg-success-strong text-white" visible={open === "left"} onClick={() => act("done")} />
      </motion.div>
      <motion.div className="absolute inset-y-0 right-0 flex gap-2" style={{ opacity: rightOpacity }}>
        <SwipeAction icon={X} label={quit ? "Rechute" : "Échec"} className="bg-fail-strong text-white" visible={open === "right"} onClick={() => act("failed")} />
        <SwipeAction icon={ChevronsRight} label="Passer" className="bg-track text-ink" visible={open === "right"} onClick={() => act("skipped")} />
      </motion.div>

      <motion.div
        role="group"
        aria-label={`${habit.name}. Flèche droite : voir ou valider, flèche gauche : échec ou passer.`}
        tabIndex={0}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -MAX_OFFSET, right: MAX_OFFSET }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={() => {
          const v = x.get();
          const next: SwipeSide = v > THRESHOLD ? "left" : v < -THRESHOLD ? "right" : null;
          if (next === open) animate(x, next === "left" ? OPEN_OFFSET : next === "right" ? -OPEN_OFFSET : 0);
          else onOpenChange(next);
          window.setTimeout(() => (dragged.current = false), 0);
        }}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.stopPropagation();
            e.preventDefault();
          } else if (open) {
            e.stopPropagation();
            onOpenChange(null);
          }
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight") onOpenChange(open === "right" ? null : "left");
          if (e.key === "ArrowLeft") onOpenChange(open === "left" ? null : "right");
          if (e.key === "Escape") onOpenChange(null);
        }}
        style={{ x, touchAction: "pan-y" }}
        className={cn(
          "absolute inset-0 flex cursor-grab items-center gap-3 rounded-card border border-line bg-surface px-3.5 select-none active:cursor-grabbing",
          "focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none",
        )}
      >
        <ProgressRing value={progressRatio(habit, entry, outcome)} color={RING_COLORS[outcome]}>
          <Emoji className="text-xl">{habit.emoji}</Emoji>
        </ProgressRing>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-base font-semibold">{habit.name}</span>
          <span
            className={cn(
              "truncate text-xs font-semibold tracking-[0.3px]",
              outcome === "failed" ? "text-fail-ink" : "text-ink-60",
            )}
          >
            {subline(habit, entry, outcome, isToday, streak)}
          </span>
        </div>
        <button
          type="button"
          aria-label={primary.label}
          onClick={onPrimary}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-tile border transition-transform active:scale-90",
            primary.className,
          )}
        >
          <PrimaryIcon className="size-5.5" strokeWidth={2.4} />
        </button>
      </motion.div>
    </div>
  );
}
