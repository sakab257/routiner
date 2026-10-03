"use client";

import { BellRing, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Emoji } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { toTimeKey, type DayKey } from "@/lib/date";
import { feedback } from "@/lib/feedback";
import { dayOutcome } from "@/lib/logic/habits";
import { useAppStore } from "@/lib/store";

function useClock() {
  const [time, setTime] = useState(() => toTimeKey(new Date()));
  useEffect(() => {
    const tick = () => setTime(toTimeKey(new Date()));
    const timer = window.setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return time;
}

/** In-app reminders (no push): habits whose reminder time has passed and that are still pending today. */
export function ReminderBanner({ today }: { today: DayKey }) {
  const time = useClock();
  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);
  const dismissed = useAppStore((s) => s.dismissedReminders[today]);
  const dismiss = useAppStore((s) => s.dismissReminder);
  const setStatus = useAppStore((s) => s.setStatus);

  const due = habits
    .filter(
      (h) =>
        h.reminder?.enabled &&
        h.reminder.time <= time &&
        !dismissed?.includes(h.id) &&
        dayOutcome(h, logs[h.id], today, today) === "pending",
    )
    .sort((a, b) => (a.reminder!.time < b.reminder!.time ? -1 : 1));

  const habit = due[0];
  if (!habit) return null;

  return (
    <div role="status" className="flex items-center gap-3 rounded-card border border-brand-300/60 bg-soft p-3.5">
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-tile bg-surface">
        <Emoji className="text-[22px]">{habit.emoji}</Emoji>
        <BellRing className="absolute -top-1 -right-1 size-4.5 rounded-full bg-brand p-0.5 text-white" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-bold tracking-[0.5px] text-accent-ink">
          RAPPEL · {habit.reminder!.time}
          {due.length > 1 && ` · +${due.length - 1}`}
        </span>
        <span className="truncate text-sm font-semibold">{habit.name}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => dismiss(today, habit.id)} className="text-ink-60">
        Plus tard
      </Button>
      <Button
        size="icon"
        aria-label={`Marquer « ${habit.name} » comme fait`}
        onClick={() => {
          setStatus(habit.id, today, "done");
          feedback("done");
        }}
      >
        <Check strokeWidth={2.6} />
      </Button>
    </div>
  );
}
