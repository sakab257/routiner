"use client";

import confetti from "canvas-confetti";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { BadgeShield } from "@/components/badge-shield";
import { useToday } from "@/hooks/use-today";
import { feedback } from "@/lib/feedback";
import { earnedBadges, newBadges, type Badge } from "@/lib/logic/rewards";
import { useAppStore } from "@/lib/store";

function copy(badge: Badge): { title: string; text: string } {
  const name = `« ${badge.habitName} »`;
  switch (badge.days) {
    case 3:
      return { title: "Bravo ! Trois jours d'affilée", text: `Le plus dur, c'est de commencer : ${name} est lancé.` };
    case 7:
      return { title: "Bravo ! Ta première série de 7 jours", text: `Une semaine complète de ${name}.` };
    case 14:
      return { title: "Deux semaines sans faiblir", text: `14 jours de suite pour ${name}.` };
    case 21:
      return { title: "21 jours : l'habitude s'ancre", text: `Trois semaines de ${name}, ça devient naturel.` };
    case 30:
      return { title: "Un mois complet !", text: `30 jours d'affilée pour ${name}.` };
    default:
      return { title: `${badge.days} jours d'affilée !`, text: `Une régularité impressionnante sur ${name}.` };
  }
}

function fireConfetti() {
  const colors = ["#3843FF", "#AFB4FF", "#FFFFFF", "#FFE680", "#2E9BF0"];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  confetti({ particleCount: 90, spread: 75, startVelocity: 42, origin: { y: 0.42 }, colors, zIndex: 70 });
  window.setTimeout(
    () => confetti({ particleCount: 60, spread: 110, startVelocity: 30, origin: { y: 0.35 }, colors, zIndex: 70 }),
    250,
  );
}

/** Success screen shown once for every newly unlocked streak badge (highest tier first). */
export function BadgeCelebration() {
  const router = useRouter();
  const pathname = usePathname();
  const today = useToday();
  const habits = useAppStore((s) => s.habits);
  const logs = useAppStore((s) => s.logs);
  const seen = useAppStore((s) => s.badgesSeen);
  const onboarded = useAppStore((s) => s.onboarded);
  const markSeen = useAppStore((s) => s.markBadgesSeen);

  const fresh = useMemo(() => newBadges(earnedBadges(habits, logs, today), seen), [habits, logs, today, seen]);
  const badge = onboarded && pathname !== "/bienvenue" ? fresh.at(-1) : undefined;

  useEffect(() => {
    if (!badge) return;
    fireConfetti();
    feedback("celebrate");
  }, [badge]);

  const close = (next?: string) => {
    markSeen(fresh.map((b) => b.id));
    if (next) router.push(next);
  };

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key={badge.id}
          role="dialog"
          aria-modal
          aria-labelledby="badge-title"
          className="fixed inset-0 z-60 overflow-hidden bg-gold text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            aria-hidden
            className="absolute -inset-x-50 -top-35 h-205 animate-[spin_60s_linear_infinite] motion-reduce:animate-none"
            style={{
              background:
                "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.26) 0deg 9deg, rgba(255,255,255,0) 9deg 30deg)",
              maskImage: "radial-gradient(circle at 50% 50%, #000 0%, rgba(0,0,0,0) 60%)",
            }}
          />
          <div className="relative mx-auto flex h-full max-w-120 flex-col px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+28px)]">
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => close()}
              className="flex size-12 items-center justify-center rounded-field bg-white text-[#040415] active:scale-95"
            >
              <ChevronLeft className="size-5.5" />
            </button>
            <motion.div
              className="mt-[8vh] flex justify-center"
              initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
            >
              <BadgeShield days={badge.days} size="lg" />
            </motion.div>
            <div className="mt-auto flex flex-col items-center text-center text-[#040415]">
              <span className="rounded-lg bg-white px-2.5 py-1.25 text-chip tracking-[1px]">NOUVEAU BADGE · {badge.title.toUpperCase()}</span>
              <h2 id="badge-title" className="mt-3.5 text-[30px] leading-[1.15] font-extrabold tracking-[-0.5px] text-balance">
                {copy(badge).title}
              </h2>
              <p className="mt-2.5 text-base leading-[1.45] text-pretty text-[#3D2F05]">
                {copy(badge).text} Ce badge rejoint ta collection — continue sur ta lancée.
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => close()}
                className="mt-7 h-14 w-full rounded-[28px] bg-white text-base font-bold active:scale-[0.97] active:bg-[#FFF4D6]"
              >
                Continuer
              </button>
              <button type="button" onClick={() => close("/activite")} className="mt-1 h-11 text-sm font-semibold">
                Voir mes statistiques
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
