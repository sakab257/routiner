import { ChevronsRight } from "lucide-react";
import { parseDayKey, WEEK_ORDER, WEEKDAY_LETTER, type DayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

export type CalendarState = "done" | "failed" | "skipped" | "pending" | "rest" | "future" | "off";

const STYLES: Record<CalendarState, string> = {
  done: "bg-brand text-white",
  failed: "bg-fail-soft text-fail-ink",
  skipped: "bg-track text-ink-60",
  pending: "border-2 border-brand bg-surface text-accent-ink",
  rest: "bg-bg text-ink-60",
  future: "bg-track/60 text-ink-40",
  off: "text-ink-20",
};

const LABELS: Partial<Record<CalendarState, string>> = {
  done: "réussi",
  failed: "manqué",
  skipped: "passé",
  pending: "aujourd'hui",
  rest: "repos",
};

/**
 * Grid of days coloured by outcome. With `weekdays`, days are laid out
 * Monday-first under a weekday header; otherwise they flow in order.
 */
export function OutcomeCalendar({
  days,
  stateOf,
  columns = 7,
  weekdays = true,
  label = (day) => parseDayKey(day).getDate(),
}: {
  days: DayKey[];
  stateOf: (day: DayKey) => CalendarState;
  columns?: number;
  weekdays?: boolean;
  /** Text inside each cell; defaults to the day of the month. */
  label?: (day: DayKey, index: number) => string | number;
}) {
  return (
    <div className="grid gap-1.25" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {weekdays &&
        WEEK_ORDER.map((d) => (
          <span key={d} className="pb-0.5 text-center text-chip text-ink-60">
            {WEEKDAY_LETTER[d]}
          </span>
        ))}
      {days.map((day, index) => {
        const state = stateOf(day);
        const date = parseDayKey(day);
        return (
          <span
            key={day}
            title={`${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}${LABELS[state] ? ` · ${LABELS[state]}` : ""}`}
            className={cn("flex aspect-square items-center justify-center rounded-lg text-chip", STYLES[state])}
          >
            {state === "skipped" ? <ChevronsRight className="size-3" strokeWidth={2.6} /> : label(day, index)}
          </span>
        );
      })}
    </div>
  );
}

export function CalendarLegend() {
  const items: [CalendarState, string][] = [
    ["done", "Réussi"],
    ["failed", "Manqué"],
    ["skipped", "Passé"],
    ["rest", "Repos"],
  ];
  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-ink-60">
      {items.map(([state, label]) => (
        <span key={state} className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded", STYLES[state], state === "rest" && "border border-line")} />
          {label}
        </span>
      ))}
    </div>
  );
}
