import { Emoji } from "@/components/kit";
import { moodInfo } from "@/lib/catalog";
import { parseDayKey, WEEKDAY_LETTER, type DayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

export function averageMoodLabel(avg: number): string {
  if (avg >= 4.5) return "Excellente";
  if (avg >= 3.5) return "Plutôt bien";
  if (avg >= 2.5) return "Mitigée";
  if (avg >= 1.5) return "Plutôt basse";
  return "Difficile";
}

/** Bars of the daily mood (1–5); days without a mood show a short empty stub. */
export function MoodChart({ days, moods }: { days: DayKey[]; moods: Record<DayKey, number> }) {
  const compact = days.length > 7;
  return (
    <div className={cn("flex h-32 items-end", compact ? "gap-0.75" : "gap-2.5")}>
      {days.map((day, i) => {
        const value = moods[day];
        const d = parseDayKey(day);
        const label = compact ? (i % 5 === 0 ? String(d.getDate()) : "") : WEEKDAY_LETTER[d.getDay()];
        return (
          <div key={day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            {!compact && (
              <span className="flex h-5.5 items-center">{value && <Emoji className="text-xl">{moodInfo(value).emoji}</Emoji>}</span>
            )}
            <span
              title={value ? moodInfo(value).label : "Non renseignée"}
              className={cn("w-full rounded-lg", compact && "rounded-[3px]")}
              style={{
                height: value ? `${(value / 5) * 100}%` : "8%",
                background: value ? (value >= 4 ? "var(--mood-high)" : "var(--mood-low)") : "var(--track)",
              }}
            />
            <span className="h-4 text-xs font-semibold text-ink-60">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
