"use client";

import { useLayoutEffect, useRef } from "react";
import { addDays, endOfWeek, parseDayKey, rangeKeys, startOfWeek, WEEKDAY_SHORT, type DayKey } from "@/lib/date";
import { dayPoint } from "@/lib/logic/stats";
import type { Habit, HabitLogs } from "@/lib/schema";
import { cn } from "@/lib/utils";

const WEEKS = 4;

/** Week-paged day picker; the current week is shown first, earlier weeks scroll in from the left. */
export function DayStrip({
  today,
  selected,
  onSelect,
  habits,
  logs,
}: {
  today: DayKey;
  selected: DayKey;
  onSelect: (day: DayKey) => void;
  habits: Habit[];
  logs: HabitLogs;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const first = addDays(startOfWeek(today), -7 * (WEEKS - 1));
  const days = rangeKeys(first, endOfWeek(today));
  const weeks = Array.from({ length: WEEKS }, (_, i) => days.slice(i * 7, i * 7 + 7));

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [today]);

  return (
    <div ref={scroller} className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto">
      {weeks.map((week) => (
        <div key={week[0]} className="grid w-full shrink-0 snap-start grid-cols-7 gap-1.5 px-5">
          {week.map((day) => {
            const future = day > today;
            const point = future ? null : dayPoint(habits, logs, day, today);
            const dot =
              point && point.total > 0
                ? point.done === point.total
                  ? "bg-success"
                  : day < today
                    ? "bg-fail"
                    : "bg-transparent"
                : "bg-transparent";
            const isSelected = day === selected;
            const date = parseDayKey(day);
            return (
              <button
                key={day}
                type="button"
                disabled={future}
                aria-pressed={isSelected}
                aria-label={date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                onClick={() => onSelect(day)}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-px rounded-tile bg-surface transition-colors",
                  isSelected ? "border-2 border-brand text-accent-ink" : "border border-line",
                  !isSelected && day === today && "text-accent-ink",
                  future && "border-line bg-track text-ink-60",
                )}
              >
                <span className="text-lg leading-tight font-bold">{date.getDate()}</span>
                <span className="text-chip tracking-[0.5px]">{WEEKDAY_SHORT[date.getDay()]}</span>
                <span className={cn("absolute bottom-1.5 size-1 rounded-full", dot)} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
