"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Emoji, FieldLabel } from "@/components/kit";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { habitColor, POPULAR_BAD_IDS, POPULAR_GOOD_IDS, templateById, type HabitTemplate } from "@/lib/catalog";
import { useUiStore } from "@/lib/ui-store";

/** Bottom sheet opened from the "+" menu: create a custom habit or start from a popular one. */
export function HabitSheet() {
  const kind = useUiStore((s) => s.sheet);
  const openSheet = useUiStore((s) => s.openSheet);
  const quit = kind === "quit";
  const templates = (quit ? POPULAR_BAD_IDS : POPULAR_GOOD_IDS)
    .map(templateById)
    .filter((t): t is HabitTemplate => Boolean(t));
  const close = () => openSheet(null);

  return (
    <Drawer open={kind !== null} onOpenChange={(open) => !open && close()}>
      <DrawerContent className="mx-auto max-w-120 rounded-t-sheet! border-none bg-surface pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <DrawerTitle className="mx-5 mt-4.5 mb-2.5 text-xs font-bold tracking-[1px] text-ink-60 uppercase">
          {quit ? "Nouvelle mauvaise habitude" : "Nouvelle bonne habitude"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Crée une habitude personnalisée ou pars d&apos;un modèle populaire.
        </DrawerDescription>
        <Link
          href={`/habitudes/nouvelle?kind=${quit ? "quit" : "build"}`}
          onClick={close}
          className="mx-5 flex h-18 items-center justify-between rounded-card border border-line bg-surface pr-3 pl-4"
        >
          <span className="text-base font-semibold">
            {quit ? "Créer une habitude à arrêter" : "Créer une habitude perso"}
          </span>
          <span className="flex size-11 items-center justify-center rounded-tile border border-line">
            <Plus className="size-5.5" strokeWidth={2.4} />
          </span>
        </Link>
        <FieldLabel className="mx-5 mt-5 mb-2.5 block">{quit ? "Souvent arrêtées" : "Habitudes populaires"}</FieldLabel>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-5">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/habitudes/nouvelle?template=${t.id}`}
              onClick={close}
              className="flex h-36 w-33 shrink-0 flex-col items-start justify-between rounded-card p-3.5 transition-opacity active:opacity-85"
              style={{ background: habitColor(t.color).tint }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-surface">
                <Emoji className="text-[22px]">{t.emoji}</Emoji>
              </span>
              <span className="flex flex-col">
                <span className="text-base leading-tight font-semibold">{t.name}</span>
                <span className="mt-0.5 text-xs text-ink-60">{t.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
