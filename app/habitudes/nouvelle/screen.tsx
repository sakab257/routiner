"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { HabitForm } from "@/components/habit-form";
import { templateById } from "@/lib/catalog";
import { feedback } from "@/lib/feedback";
import { useAppStore, type HabitInput } from "@/lib/store";

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

function initialInput(templateId: string | null, kind: string | null): HabitInput {
  const t = templateById(templateId);
  if (t) {
    return { name: t.name, emoji: t.emoji, color: t.color, kind: t.kind, goal: { ...t.goal }, schedule: { days: [...t.days] } };
  }
  const quit = kind === "quit";
  return {
    name: "",
    emoji: quit ? "🚭" : "💧",
    color: quit ? "violet" : "teal",
    kind: quit ? "quit" : "build",
    goal: { target: 1, unit: "times" },
    schedule: { days: EVERY_DAY },
  };
}

export function NewHabitScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const addHabit = useAppStore((s) => s.addHabit);
  const initial = initialInput(params.get("template"), params.get("kind"));

  return (
    <HabitForm
      // Re-mount when the query changes so the form picks up the new template.
      key={params.toString()}
      title={initial.kind === "quit" ? "Habitude à arrêter" : "Nouvelle habitude"}
      submitLabel="Enregistrer l'habitude"
      initial={initial}
      onSubmit={(input) => {
        addHabit(input);
        feedback("done");
        toast.success(`« ${input.name} » ajoutée`);
        router.replace("/");
      }}
    />
  );
}
