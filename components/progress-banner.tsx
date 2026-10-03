import { ProgressRing } from "@/components/kit";
import { formatShortDay, type DayKey } from "@/lib/date";

function title(done: number, total: number, isToday: boolean, day: DayKey) {
  if (!isToday) return `Bilan du ${formatShortDay(day)}`;
  if (!total) return "Rien de prévu aujourd'hui";
  const ratio = done / total;
  if (ratio >= 1) return "Journée bouclée !";
  if (ratio >= 0.5) return "Bientôt bouclé";
  if (ratio > 0) return "Bien lancé";
  return "Ta journée commence";
}

/** Gradient banner summarising the selected day. */
export function ProgressBanner({ done, total, day, today }: { done: number; total: number; day: DayKey; today: DayKey }) {
  const ratio = total ? done / total : 0;
  return (
    <div className="flex items-center gap-3.5 rounded-card bg-gradient-banner p-4 text-white">
      <ProgressRing value={ratio} size={56} stroke={5} color="#FFFFFF" track="rgba(255,255,255,0.25)">
        <span className="text-[13px] font-bold">{Math.round(ratio * 100)}%</span>
      </ProgressRing>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base font-semibold">{title(done, total, day === today, day)}</span>
        <span className="text-sm text-white/88">
          {total ? `${done} sur ${total} habitude${total > 1 ? "s" : ""} faite${done > 1 ? "s" : ""}` : "Profite de ta journée"}
        </span>
      </div>
    </div>
  );
}
