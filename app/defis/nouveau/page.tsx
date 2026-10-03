"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChallengeForm } from "@/components/challenge-form";
import { useToday } from "@/hooks/use-today";
import { feedback } from "@/lib/feedback";
import { useAppStore } from "@/lib/store";

export default function NewChallengePage() {
  const router = useRouter();
  const today = useToday();
  const addChallenge = useAppStore((s) => s.addChallenge);
  const firstHabit = useAppStore((s) => s.habits.find((h) => !h.archivedAt));

  return (
    <ChallengeForm
      title="Nouveau défi"
      submitLabel="Lancer le défi"
      today={today}
      initial={{ title: "", emoji: "🏆", days: 21, startDate: today, habitIds: firstHabit ? [firstHabit.id] : [] }}
      onSubmit={(input) => {
        const id = addChallenge(input);
        feedback("done");
        toast.success("Défi lancé, bon courage !");
        router.replace(`/defi?id=${id}`);
      }}
    />
  );
}
