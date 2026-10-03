"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Emoji } from "@/components/kit";

/** Blue gradient header used by the habit and challenge detail screens. */
export function Hero({
  emoji,
  eyebrow,
  title,
  subtitle,
  editHref,
  children,
}: {
  emoji: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  editHref?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col bg-gradient-hero px-5 pt-[calc(env(safe-area-inset-top)+20px)] pb-14 text-white">
      <div className="flex justify-between">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          className="flex size-12 items-center justify-center rounded-field bg-white/18 active:scale-95"
        >
          <ChevronLeft className="size-5.5" />
        </button>
        {editHref && (
          <Link href={editHref} className="flex h-12 items-center rounded-field bg-white/18 px-4 text-sm font-semibold active:scale-95">
            Modifier
          </Link>
        )}
      </div>
      <span className="mt-4.5 flex size-18 items-center justify-center rounded-full bg-white/18">
        <Emoji className="text-4xl">{emoji}</Emoji>
      </span>
      <span className="mt-4 text-chip tracking-[1px]">{eyebrow}</span>
      <h1 className="mt-1 text-[32px] leading-tight font-extrabold tracking-[-0.5px] text-balance">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-white/90">{subtitle}</p>}
      {children}
    </div>
  );
}

/** Rounded sheet that overlaps the hero's bottom edge. */
export function HeroBody({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mt-7 flex flex-col gap-2.5 rounded-t-sheet bg-bg px-5 pt-5.5 pb-[calc(env(safe-area-inset-bottom)+40px)]">
      {children}
    </div>
  );
}
