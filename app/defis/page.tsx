"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { ChallengeCard } from "@/components/challenge-card";
import { Emoji, FieldLabel, Screen, ScreenTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { challengeEnd } from "@/lib/logic/challenges";
import type { Challenge } from "@/lib/schema";
import { useAppStore } from "@/lib/store";

export default function ChallengesPage() {
  const today = useToday();
  const challenges = useAppStore((s) => s.challenges);
  const byStart = (a: Challenge, b: Challenge) => (a.startDate < b.startDate ? -1 : 1);
  const ongoing = challenges.filter((c) => c.startDate <= today && challengeEnd(c) >= today).sort(byStart);
  const upcoming = challenges.filter((c) => c.startDate > today).sort(byStart);
  const finished = challenges.filter((c) => challengeEnd(c) < today).sort((a, b) => -byStart(a, b));

  const groups: [string, Challenge[]][] = [
    ["En cours", ongoing],
    ["À venir", upcoming],
    ["Terminés", finished],
  ];

  return (
    <Screen className="gap-2.5">
      <ScreenTitle
        back="/"
        right={
          <Button asChild variant="outline" size="icon-lg" aria-label="Nouveau défi">
            <Link href="/defis/nouveau">
              <Plus />
            </Link>
          </Button>
        }
      >
        Mes défis
      </ScreenTitle>
      {challenges.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Emoji className="text-5xl">🏆</Emoji>
          <p className="text-base font-semibold">Aucun défi pour l&apos;instant</p>
          <p className="text-sm text-ink-60">Choisis une ou plusieurs habitudes et tiens-les 7, 21 ou 30 jours d&apos;affilée.</p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/defis/nouveau">
              <Plus /> Lancer un défi
            </Link>
          </Button>
        </div>
      )}
      {groups
        .filter(([, list]) => list.length)
        .map(([label, list]) => (
          <section key={label} className="flex flex-col gap-2.5">
            <FieldLabel className="mt-2">
              {label} · {list.length}
            </FieldLabel>
            {list.map((c) => (
              <ChallengeCard key={c.id} challenge={c} today={today} />
            ))}
          </section>
        ))}
    </Screen>
  );
}
