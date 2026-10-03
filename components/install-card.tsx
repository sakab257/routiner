"use client";

import { Share, Smartphone } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Card, FieldLabel } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { canPromptInstall, isIos, isStandalone, promptInstall, subscribeInstall } from "@/lib/install";

const noop = () => () => {};

/** Offers to install the PWA (Chromium prompt, or instructions on iOS); hidden once installed. */
export function InstallCard() {
  const promptable = useSyncExternalStore(subscribeInstall, canPromptInstall, () => false);
  const standalone = useSyncExternalStore(noop, isStandalone, () => true);
  const ios = useSyncExternalStore(noop, isIos, () => false);

  if (standalone || (!promptable && !ios)) return null;

  return (
    <>
      <FieldLabel className="mt-3">Application</FieldLabel>
      <Card className="flex items-center gap-3 p-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-soft text-accent-ink">
          <Smartphone className="size-5" />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-base font-medium">Installer Routiner</span>
          <span className="text-xs text-ink-60">
            {promptable ? (
              "Accès direct depuis l'écran d'accueil, même hors ligne."
            ) : (
              <>
                Touche <Share className="inline size-3.5 align-[-2px]" /> puis « Sur l&apos;écran d&apos;accueil ».
              </>
            )}
          </span>
        </span>
        {promptable && (
          <Button size="sm" onClick={() => void promptInstall()}>
            Installer
          </Button>
        )}
      </Card>
    </>
  );
}
