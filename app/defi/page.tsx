import type { Metadata } from "next";
import { Suspense } from "react";
import { ChallengeDetailScreen } from "./screen";

export const metadata: Metadata = { title: "Défi" };

export default function ChallengeDetailPage() {
  return (
    <Suspense>
      <ChallengeDetailScreen />
    </Suspense>
  );
}
