"use client";

import { Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChallengeForm } from "@/components/challenge-form";
import { NotFound } from "@/components/not-found";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { useAppStore } from "@/lib/store";

export function EditChallengeScreen() {
  const router = useRouter();
  const today = useToday();
  const id = useSearchParams().get("id");
  const challenge = useAppStore((s) => s.challenges.find((c) => c.id === id));
  const updateChallenge = useAppStore((s) => s.updateChallenge);
  const deleteChallenge = useAppStore((s) => s.deleteChallenge);

  if (!challenge) return <NotFound what="Ce défi" />;

  return (
    <ChallengeForm
      key={challenge.id}
      title="Modifier le défi"
      submitLabel="Enregistrer"
      today={today}
      initial={challenge}
      onSubmit={(input) => {
        updateChallenge(challenge.id, input);
        toast.success("Défi mis à jour");
        router.replace(`/defi?id=${challenge.id}`);
      }}
      footer={
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg" className="mt-4 rounded-card">
              <Trash2 /> Supprimer le défi
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer « {challenge.title} » ?</AlertDialogTitle>
              <AlertDialogDescription>Les habitudes liées et leur historique sont conservés.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  deleteChallenge(challenge.id);
                  toast.success("Défi supprimé");
                  router.replace("/defis");
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}
