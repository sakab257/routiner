import type { Metadata } from "next";
import { Suspense } from "react";
import { HabitDetailScreen } from "./screen";

export const metadata: Metadata = { title: "Habitude" };

export default function HabitDetailPage() {
  return (
    <Suspense>
      <HabitDetailScreen />
    </Suspense>
  );
}
