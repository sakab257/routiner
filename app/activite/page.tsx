"use client";

import { ChevronLeft, ChevronRight, ChevronsRight, CircleCheck, CircleX, Flame, Star, Target, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { BadgeShield } from "@/components/badge-shield";
import { Card, Emoji, formatNumber, Screen, Segmented } from "@/components/kit";
import { averageMoodLabel, MoodChart } from "@/components/mood-chart";
import { ProgressChart } from "@/components/progress-chart";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { moodInfo } from "@/lib/catalog";
import {
  addDays,
  addMonths,
  diffDays,
  endOfMonth,
  endOfWeek,
  formatLongDay,
  formatMonth,
  formatRange,
  rangeKeys,
  startOfMonth,
  startOfWeek,
  type DayKey,
} from "@/lib/date";
import { BADGE_TIERS, earnedBadges, totalPoints } from "@/lib/logic/rewards";
import { computeStats, dailySeries } from "@/lib/logic/stats";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Range = "day" | "week" | "month";

function period(range: Range, anchor: DayKey): { from: DayKey; to: DayKey } {
  if (range === "day") return { from: anchor, to: anchor };
  if (range === "week") return { from: startOfWeek(anchor), to: endOfWeek(anchor) };
  return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

function shift(range: Range, anchor: DayKey, dir: 1 | -1): DayKey {
  if (range === "day") return addDays(anchor, dir);
  if (range === "week") return addDays(anchor, 7 * dir);
  return addMonths(anchor, dir);
}

function periodLabels(range: Range, anchor: DayKey, today: DayKey): { title: string; sub: string } {
  if (range === "day") {
    const ago = diffDays(anchor, today);
    return { title: formatLongDay(anchor), sub: ago === 0 ? "Aujourd'hui" : ago === 1 ? "Hier" : `Il y a ${ago} jours` };
  }
  if (range === "week") {
    const { from, to } = period("week", anchor);
    const weeks = Math.round(diffDays(from, startOfWeek(today)) / 7);
    return {
      title: formatRange(from, to),
      sub: weeks === 0 ? "Cette semaine" : weeks === 1 ? "Semaine dernière" : `Il y a ${weeks} semaines`,
    };
  }
  const months = (Number(today.slice(0, 4)) - Number(anchor.slice(0, 4))) * 12 + Number(today.slice(5, 7)) - Number(anchor.slice(5, 7));
  return { title: formatMonth(anchor), sub: months === 0 ? "Ce mois-ci" : months === 1 ? "Le mois dernier" : `Il y a ${months} mois` };
}

function Tile({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: string; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-tile bg-bg p-2.5">
      <span className={cn("flex size-7 items-center justify-center rounded-[9px]", tone)}>
        <Icon className="size-4.5" />
      </span>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs leading-tight text-ink-60">{label}</span>
    </div>
  );
}

export default function ActivityPage() {
  const today = useToday();
  const [range, setRange] = useState<Range>("week");
  const [anchor, setAnchor] = useState<DayKey | null>(null);
  const at = anchor ?? today;

  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);
  const moods = useAppStore((s) => s.moods);
  const challenges = useAppStore((s) => s.challenges);

  const { from, to } = period(range, at);
  const stats = useMemo(() => computeStats(habits, logs, from, to, today), [habits, logs, from, to, today]);
  // A single day is shown within its trailing week so the curve stays readable.
  const chartFrom = range === "day" ? addDays(at, -6) : from;
  const series = useMemo(() => dailySeries(habits, logs, chartFrom, to, today), [habits, logs, chartFrom, to, today]);
  const chartDays = rangeKeys(chartFrom, to);
  const moodValues = chartDays.map((d) => moods[d]).filter((v): v is NonNullable<typeof v> => v !== undefined);
  const moodAvg = moodValues.length ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : null;

  const badges = useMemo(() => earnedBadges(habits, logs, today), [habits, logs, today]);
  const points = useMemo(() => totalPoints(habits, logs, challenges, today), [habits, logs, challenges, today]);
  const labels = periodLabels(range, at, today);
  const nextDisabled = period(range, shift(range, at, 1)).from > today;

  return (
    <Screen withNav className="gap-3.5">
      <h1 className="text-2xl font-bold tracking-[-0.3px]">Activité</h1>
      <Segmented
        label="Période"
        value={range}
        onChange={(r) => {
          setRange(r);
          setAnchor(null);
        }}
        options={[
          { value: "day", label: "Jour" },
          { value: "week", label: "Semaine" },
          { value: "month", label: "Mois" },
        ]}
      />
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" aria-label="Période précédente" onClick={() => setAnchor(shift(range, at, -1))}>
          <ChevronLeft />
        </Button>
        <div className="flex flex-col items-center" aria-live="polite">
          <span className="text-base font-semibold">{labels.title}</span>
          <span className="text-xs text-ink-60">{labels.sub}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Période suivante"
          disabled={nextDisabled}
          onClick={() => {
            const next = shift(range, at, 1);
            setAnchor(next > today ? today : next);
          }}
        >
          <ChevronRight />
        </Button>
      </div>

      <Card className="grid grid-cols-3 gap-2 p-3.5">
        <Tile icon={Target} tone="bg-soft text-accent-ink" value={stats.rate === null ? "—" : `${Math.round(stats.rate * 100)} %`} label="Taux de réussite" />
        <Tile icon={CircleCheck} tone="bg-success-soft text-success-ink" value={String(stats.completed)} label="Complétées" />
        <Tile icon={Star} tone="bg-soft text-accent-ink" value={formatNumber(stats.points)} label="Points" />
        <Tile icon={Flame} tone="bg-soft text-accent-ink" value={`${stats.bestStreak} j`} label="Meilleure série" />
        <Tile icon={ChevronsRight} tone="bg-track text-ink-60" value={String(stats.skipped)} label="Passées" />
        <Tile icon={CircleX} tone="bg-fail-soft text-fail-ink" value={String(stats.failed)} label="Échouées" />
      </Card>

      <Card className="flex flex-col gap-1 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Évolution</h2>
          <span className="text-xs text-ink-60">Réussite par jour</span>
        </div>
        {series.some((p) => p.rate !== null) ? (
          <ProgressChart key={`${range}-${chartFrom}`} points={series} highlight={at > today ? today : at} />
        ) : (
          <p className="py-10 text-center text-sm text-ink-60">Pas encore de données sur cette période.</p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Humeur moyenne</h2>
            <span className="text-xs text-ink-60">
              {moodValues.length} jour{moodValues.length > 1 ? "s" : ""} renseigné{moodValues.length > 1 ? "s" : ""}
            </span>
          </div>
          {moodAvg !== null && (
            <span className="flex items-center gap-1.5 rounded-xl bg-soft px-2.5 py-1.5 text-sm font-semibold text-accent-ink">
              <Emoji>{moodInfo(moodAvg).emoji}</Emoji> {averageMoodLabel(moodAvg)}
            </span>
          )}
        </div>
        <MoodChart days={chartDays} moods={moods} />
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Badges</h2>
          <span className="flex items-center gap-1 text-sm font-semibold text-accent-ink">
            <Star className="size-4" /> {formatNumber(points)} pts au total
          </span>
        </div>
        <div className="grid grid-cols-4 gap-y-3">
          {BADGE_TIERS.map((tier) => {
            const earned = badges.some((b) => b.days === tier.days);
            return (
              <div key={tier.days} className="flex flex-col items-center gap-1.5 text-center">
                <BadgeShield days={tier.days} locked={!earned} />
                <span className={cn("text-xs leading-tight font-semibold", !earned && "text-ink-40")}>{tier.title}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ink-60">Un badge par palier de série : 3, 7, 14, 21, 30, 60, 100 et 365 jours d&apos;affilée.</p>
      </Card>
    </Screen>
  );
}
