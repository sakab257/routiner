import Link from "next/link";
import { Emoji, Screen, ScreenTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";

export function NotFound({ what }: { what: string }) {
  return (
    <Screen>
      <ScreenTitle back="/">Introuvable</ScreenTitle>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <Emoji className="text-5xl">🔍</Emoji>
        <p className="text-base font-semibold">{what} n&apos;existe plus.</p>
        <p className="text-sm text-ink-60">Elle a peut-être été supprimée ou remplacée par un import.</p>
        <Button asChild className="mt-2">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </Screen>
  );
}
