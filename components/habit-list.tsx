"use client";

import { useEffect, useState } from "react";
import { HabitCard, type SwipeSide } from "@/components/habit-card";
import type { DayKey } from "@/lib/date";
import type { Habit } from "@/lib/schema";

/** List of swipeable habit cards; only one card can be open at a time. */
export function HabitList({ habits, day, today }: { habits: Habit[]; day: DayKey; today: DayKey }) {
  const [open, setOpen] = useState<{ id: string; side: Exclude<SwipeSide, null> } | null>(null);
  const openId = open?.id;

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest("[data-card-id]");
      if (card?.getAttribute("data-card-id") !== openId) setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId]);

  return (
    <div className="flex flex-col gap-2.5">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          day={day}
          today={today}
          open={open?.id === habit.id ? open.side : null}
          onOpenChange={(side) => setOpen(side ? { id: habit.id, side } : null)}
        />
      ))}
    </div>
  );
}
