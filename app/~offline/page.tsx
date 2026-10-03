import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Hors ligne" };

/** Fallback served by the service worker when a page isn't cached yet. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <Logo alt="Routiner" className="h-12" />
      <h1 className="text-2xl font-bold tracking-[-0.3px]">Tu es hors ligne</h1>
      <p className="text-sm text-ink-60">
        Cette page n&apos;a pas encore été enregistrée sur ton appareil. Tes habitudes, elles, sont toujours là.
      </p>
      <Link href="/" className="mt-2 flex h-14 items-center rounded-[28px] bg-brand px-8 text-base font-bold text-white">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
