import type { Metadata } from "next";
import { Suspense } from "react";
import { NewHabitScreen } from "./screen";

export const metadata: Metadata = { title: "Nouvelle habitude" };

export default function NewHabitPage() {
  return (
    <Suspense>
      <NewHabitScreen />
    </Suspense>
  );
}
