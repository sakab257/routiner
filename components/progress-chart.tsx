"use client";

import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { DayPoint } from "@/lib/logic/stats";
import { MONTH_SHORT, parseDayKey, WEEKDAY_LETTER, WEEKDAY_SHORT, type DayKey } from "@/lib/date";

interface Row {
  day: DayKey;
  pct: number | null;
  done: number;
  total: number;
}

const BUBBLE_W = 92;
const BUBBLE_H = 44;

function dayTitle(day: DayKey) {
  const d = parseDayKey(day);
  return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()].toUpperCase()}`;
}

function Bubble({ row }: { row: Row }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-ink px-2 py-1.5 text-bg shadow-card">
      <span className="text-chip tracking-[0.5px]">{dayTitle(row.day)}</span>
      <span className="text-sm font-bold whitespace-nowrap">
        {row.pct} % · {row.done}/{row.total}
      </span>
    </div>
  );
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row || row.pct === null) return null;
  return <Bubble row={row} />;
}

/** Daily success-rate curve ("Évolution"), with the selected day pinned. */
export function ProgressChart({ points, highlight }: { points: DayPoint[]; highlight?: DayKey }) {
  const monthly = points.length > 10;
  const data: Row[] = points.map((p) => ({
    day: p.day,
    pct: p.rate === null ? null : Math.round(p.rate * 100),
    done: p.done,
    total: p.total,
  }));
  const index = data.findIndex((r) => r.day === highlight && r.pct !== null);
  const pinned = index >= 0 ? data[index] : undefined;
  // Slide the bubble from left-aligned (first day) to right-aligned (last day) so it never overflows.
  const shift = data.length > 1 ? index / (data.length - 1) : 0.5;

  return (
    <div className="h-44 w-full" role="img" aria-label="Courbe du taux de réussite quotidien">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 56, right: 14, bottom: 0, left: 14 }}>
          <defs>
            <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--chart-line)" stopOpacity={0.22} />
              <stop offset="1" stopColor="var(--chart-line)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            interval={monthly ? 4 : 0}
            tickFormatter={(day: DayKey) => {
              const d = parseDayKey(day);
              return monthly ? String(d.getDate()) : WEEKDAY_LETTER[d.getDay()];
            }}
            tick={{ fontSize: 12, fontWeight: 600, fill: "var(--ink-60)" }}
            tickMargin={8}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            content={ChartTooltip}
            cursor={{ stroke: "var(--line)", strokeWidth: 2, strokeDasharray: "4 4" }}
            offset={14}
            allowEscapeViewBox={{ x: false, y: true }}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="var(--chart-line)"
            strokeWidth={3}
            strokeLinecap="round"
            fill="url(#rate-fill)"
            connectNulls
            dot={false}
            activeDot={{ r: 6, fill: "var(--surface)", stroke: "var(--chart-line)", strokeWidth: 3 }}
            isAnimationActive={false}
          />
          {pinned && (
            <ReferenceDot
              x={pinned.day}
              y={pinned.pct ?? 0}
              r={6}
              fill="var(--surface)"
              stroke="var(--chart-line)"
              strokeWidth={3}
              label={({ viewBox }: { viewBox?: { x?: number; y?: number; width?: number } }) => {
                const cx = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2;
                const cy = viewBox?.y ?? 0;
                return (
                  <foreignObject x={cx - BUBBLE_W * shift} y={cy - BUBBLE_H - 14} width={BUBBLE_W} height={BUBBLE_H} className="overflow-visible">
                    <Bubble row={pinned} />
                  </foreignObject>
                );
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
