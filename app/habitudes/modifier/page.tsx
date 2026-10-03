import type { Metadata } from "next";
import { Suspense } from "react";
import { EditHabitScreen } from "./screen";

export const metadata: Metadata = { title: "Modifier l'habitude" };

export default function EditHabitPage() {
  return (
    <Suspense>
      <EditHabitScreen />
    </Suspense>
  );
}
