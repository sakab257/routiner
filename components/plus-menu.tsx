"use client";

import { Ban, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Emoji } from "@/components/kit";
import { useToday } from "@/hooks/use-today";
import { MOODS } from "@/lib/catalog";
import { feedback } from "@/lib/feedback";
import { useAppStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

export function PlusMenu() {
  const open = useUiStore((s) => s.plusOpen);
  const setOpen = useUiStore((s) => s.setPlusOpen);
  const openSheet = useUiStore((s) => s.openSheet);
  const today = useToday();
  const mood = useAppStore((s) => s.moods[today]);
  const setMood = useAppStore((s) => s.setMood);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-30 bg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="menu"
            role="dialog"
            aria-label="Ajouter"
            className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+104px)] z-35 mx-auto flex w-[calc(100%-32px)] max-w-112 flex-col gap-2.5"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <MenuCard
                icon={<Ban className="size-5" />}
                iconClass="bg-fail-soft text-fail-ink"
                title="Mauvaise habitude"
                sub="Pour arrêter"
                onClick={() => openSheet("quit")}
              />
              <MenuCard
                icon={<TrendingUp className="size-5" />}
                iconClass="bg-success-soft text-success-ink"
                title="Bonne habitude"
                sub="Pour construire"
                onClick={() => openSheet("build")}
              />
            </div>
            <div className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold">Humeur du jour</span>
                <span className="text-xs text-ink-60">{mood ? MOODS[mood - 1].label : "Pas encore notée"}</span>
              </div>
              <div className="flex justify-between">
                {MOODS.map((m) => {
                  const active = mood === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      aria-label={m.label}
                      aria-pressed={active}
                      onClick={() => {
                        setMood(today, active ? null : m.value);
                        feedback("tap");
                      }}
                      className={cn(
                        "flex size-14 items-center justify-center rounded-field border-2 transition-transform active:scale-90",
                        active ? "border-brand bg-soft" : "border-transparent bg-bg",
                      )}
                    >
                      <Emoji className="text-[30px]">{m.emoji}</Emoji>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuCard({
  icon,
  iconClass,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-card border border-line bg-surface p-3.5 text-left transition-colors active:bg-soft"
    >
      <span className={cn("flex size-10 items-center justify-center rounded-[10px]", iconClass)}>{icon}</span>
      <span className="text-base font-semibold">{title}</span>
      <span className="text-xs text-ink-60">{sub}</span>
    </button>
  );
}
