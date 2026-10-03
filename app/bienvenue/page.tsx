"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Emoji, StickyFooter } from "@/components/kit";
import { Logo } from "@/components/logo";
import { OnboardingArt } from "@/components/onboarding-art";
import { Button } from "@/components/ui/button";
import { habitColor, STARTER_IDS, templateById, type HabitTemplate } from "@/lib/catalog";
import { feedback } from "@/lib/feedback";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Suis tes habitudes",
    text: "Ajoute de petites habitudes et coche-les chaque jour. Rien que pour toi, sans compte.",
    cta: "Suivant",
  },
  {
    title: "Lance-toi des défis",
    text: "Fixe-toi un objectif sur 7, 21 ou 30 jours et avance tâche par tâche.",
    cta: "Suivant",
  },
  {
    title: "Vois tes progrès",
    text: "Taux de réussite, séries et humeur : tes statistiques, gardées sur ton appareil.",
    cta: "Commencer",
  },
] as const;

type Step = "splash" | 0 | 1 | 2 | "pick";

function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <button
      type="button"
      onClick={onDone}
      aria-label="Commencer"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-hero"
    >
      {[130, 250, 380, 520].map((size, i) => (
        <span
          key={size}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-white"
          style={{ width: size, height: size, opacity: 0.16 - i * 0.03 }}
        />
      ))}
      <motion.span
        className="relative flex items-center gap-3.5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Logo tone="white" className="h-13" />
        <span className="text-[38px] font-semibold tracking-[-0.5px] text-white">Routiner</span>
      </motion.span>
    </button>
  );
}

function Slide({ index, onNext, onSkip }: { index: 0 | 1 | 2; onNext: () => void; onSkip: () => void }) {
  const slide = SLIDES[index];
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-hero text-white">
      {[120, 240, 380].map((size, i) => (
        <span
          key={size}
          aria-hidden
          className="absolute top-[38%] left-1/2 -translate-1/2 rounded-full border border-white"
          style={{ width: size, height: size, opacity: 0.14 - i * 0.03 }}
        />
      ))}
      <motion.div
        className="relative flex min-h-0 flex-1 items-start justify-center pt-[calc(env(safe-area-inset-top)+28px)]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) onNext();
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="w-full"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <OnboardingArt index={index} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="relative flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.8px] text-balance">{slide.title}</h1>
        <p className="mt-3 text-base leading-[1.45] text-pretty text-white/92">{slide.text}</p>
        <div className="mt-6 mb-7 flex gap-2" aria-label={`Étape ${index + 1} sur 3`}>
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={cn("h-2 rounded-full transition-all", i === index ? "w-5.5 bg-white" : "w-2 bg-white/45")}
            />
          ))}
        </div>
        <Button variant="white" size="lg" onClick={onNext}>
          {slide.cta}
        </Button>
        <button type="button" onClick={onSkip} className="mt-1.5 h-11 text-sm font-semibold text-white">
          Passer l&apos;introduction
        </button>
      </div>
    </div>
  );
}

function Pick({ onDone }: { onDone: (ids: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>(["water", "read", "meditate"]);
  const starters = STARTER_IDS.map(templateById).filter((t): t is HabitTemplate => Boolean(t));
  const toggle = (id: string) => {
    feedback("tap");
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const n = picked.length;

  return (
    <main className="min-h-dvh px-5 pt-[calc(env(safe-area-inset-top)+44px)] pb-36">
      <span className="text-xs font-bold tracking-[1px] text-accent-ink">DERNIÈRE ÉTAPE</span>
      <h1 className="mt-1.5 text-2xl leading-tight font-bold tracking-[-0.3px]">Choisis tes premières habitudes</h1>
      <p className="mt-1.5 text-sm text-ink-60">Tu pourras en ajouter, modifier ou supprimer plus tard.</p>
      <div className="mt-5.5 grid grid-cols-2 gap-3">
        {starters.map((t) => {
          const on = picked.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t.id)}
              className={cn(
                "relative flex h-28 flex-col items-start justify-between rounded-card p-3.5 text-left transition-colors",
                on ? "border-2 border-brand bg-soft" : "border border-line bg-surface",
              )}
            >
              <span
                className="flex size-11 items-center justify-center rounded-tile"
                style={{ background: habitColor(t.color).tint }}
              >
                <Emoji className="text-[22px]">{t.emoji}</Emoji>
              </span>
              <span className="flex flex-col">
                <span className="text-base font-semibold">{t.name}</span>
                <span className="text-xs text-ink-60">{t.sub}</span>
              </span>
              {on && (
                <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="size-3.75" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <StickyFooter>
        <Button size="lg" className="w-full" disabled={!n} onClick={() => onDone(picked)}>
          {n ? `Continuer · ${n} sélectionnée${n > 1 ? "s" : ""}` : "Choisis au moins une habitude"}
        </Button>
      </StickyFooter>
    </main>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const onboarded = useAppStore((s) => s.onboarded);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState<Step>("splash");

  useEffect(() => {
    if (onboarded) router.replace("/");
  }, [onboarded, router]);

  if (onboarded) return null;
  if (step === "splash") return <Splash onDone={() => setStep(0)} />;
  if (step === "pick") {
    return (
      <Pick
        onDone={(ids) => {
          completeOnboarding(ids);
          feedback("done");
        }}
      />
    );
  }
  return (
    <Slide
      index={step}
      onNext={() => setStep(step === 2 ? "pick" : ((step + 1) as 1 | 2))}
      onSkip={() => setStep("pick")}
    />
  );
}
