"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Native emoji with a colour-emoji font stack (works offline, no image assets). */
export function Emoji({ children, className }: { children: string; className?: string }) {
  return (
    <span
      role="img"
      aria-hidden
      className={cn("inline-block leading-none [font-family:'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]", className)}
    >
      {children}
    </span>
  );
}

export function ProgressRing({
  value,
  size = 44,
  stroke = 3.5,
  color = "var(--brand-500)",
  track = "var(--track)",
  children,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  className?: string;
}) {
  const r = size / 2 - stroke - 0.5;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${clamped * c} ${c}`}
          className="transition-[stroke-dasharray] duration-500 ease-out"
          style={{ opacity: clamped > 0 ? 1 : 0 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  label,
}: {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  size?: "md" | "lg";
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex rounded-tile bg-track p-1", size === "lg" ? "h-12" : "h-11", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-[11px] text-sm transition-colors",
              active ? "bg-surface font-bold text-accent-ink shadow-[0_0_0_1px_var(--line)]" : "font-medium text-ink-60",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionHeader({ title, href, action = "VOIR TOUT" }: { title: string; href?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="flex h-11 items-center px-1 text-xs font-bold tracking-[0.5px] text-accent-ink">
          {action}
        </Link>
      )}
    </div>
  );
}

export function FieldLabel({ children, className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("text-xs font-bold tracking-[1px] text-ink-60 uppercase", className)} {...props}>
      {children}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-chip uppercase tracking-[0.5px]", className)}>
      {children}
    </span>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-card border border-line bg-surface", className)} {...props} />;
}

export function BackButton({ href, className, label = "Retour" }: { href?: string; className?: string; label?: string }) {
  const router = useRouter();
  const classes = cn(
    "flex size-12 shrink-0 items-center justify-center rounded-field border border-line bg-surface text-ink active:scale-95",
    className,
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        <ChevronLeft className="size-5.5" />
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      className={classes}
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
    >
      <ChevronLeft className="size-5.5" />
    </button>
  );
}

/** Page scaffold: safe-area aware padding, optional room for the floating bottom nav. */
export function Screen({
  children,
  className,
  withNav = false,
}: {
  children: ReactNode;
  className?: string;
  withNav?: boolean;
}) {
  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col px-5 pt-[calc(env(safe-area-inset-top)+20px)]",
        withNav ? "pb-[calc(env(safe-area-inset-bottom)+124px)]" : "pb-[calc(env(safe-area-inset-bottom)+32px)]",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function ScreenTitle({ children, back, right }: { children: ReactNode; back?: boolean | string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3.5">
      {back && <BackButton href={typeof back === "string" ? back : undefined} />}
      <h1 className="min-w-0 flex-1 truncate text-2xl font-bold tracking-[-0.3px]">{children}</h1>
      {right}
    </div>
  );
}

/** Bottom action bar fading into the background, as in the design's forms. */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-120 bg-linear-to-b from-transparent to-bg to-35% px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+20px)]">
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}

export function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ | /g, " ");
}
