"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { HabitForm } from "@/components/habit-form";
import { NotFound } from "@/components/not-found";
import { useAppStore } from "@/lib/store";

export function EditHabitScreen() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const habit = useAppStore((s) => s.habits.find((h) => h.id === id));
  const updateHabit = useAppStore((s) => s.updateHabit);

  if (!habit) return <NotFound what="Cette habitude" />;

  const { name, emoji, color, kind, goal, schedule, reminder } = habit;
  return (
    <HabitForm
      key={habit.id}
      title="Modifier l'habitude"
      submitLabel="Enregistrer les modifications"
      initial={{ name, emoji, color, kind, goal, schedule, reminder }}
      onSubmit={(input) => {
        updateHabit(habit.id, input);
        toast.success("Modifications enregistrées");
        router.replace(`/habitude?id=${habit.id}`);
      }}
    />
  );
}
