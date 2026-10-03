import type { Metadata } from "next";
import { Suspense } from "react";
import { EditChallengeScreen } from "./screen";

export const metadata: Metadata = { title: "Modifier le défi" };

export default function EditChallengePage() {
  return (
    <Suspense>
      <EditChallengeScreen />
    </Suspense>
  );
}
