"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Emoji, Screen } from "@/components/kit";
import { CATEGORIES, habitColor, TEMPLATES, type CategoryId } from "@/lib/catalog";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const habits = useAppStore((s) => s.habits);
  const owned = new Set(habits.filter((h) => !h.archivedAt).map((h) => h.name.toLowerCase()));
  const shown = TEMPLATES.filter((t) => category === "all" || t.category === category);

  const filters: { id: CategoryId | "all"; label: string; tint?: string }[] = [
    { id: "all", label: "Tous" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, tint: habitColor(c.color).tint })),
  ];

  return (
    <Screen withNav className="gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-[-0.3px]">Modèles</h1>
        <p className="text-sm text-ink-60">Pars d&apos;un modèle, tu pourras tout ajuster ensuite.</p>
      </div>

      <div role="radiogroup" aria-label="Catégorie" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {filters.map((f) => {
          const active = category === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCategory(f.id)}
              className={cn(
                "h-9 shrink-0 rounded-xl px-3.5 text-chip tracking-[0.8px] uppercase transition-colors",
                active ? "bg-brand text-white" : "text-ink",
              )}
              style={active ? undefined : { background: f.tint ?? "var(--track)" }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shown.map((t) => {
          const added = owned.has(t.name.toLowerCase());
          return (
            <Link
              key={t.id}
              href={`/habitudes/nouvelle?template=${t.id}`}
              className="relative flex h-36 flex-col items-start justify-between rounded-card p-3.5 transition-opacity active:opacity-85"
              style={{ background: habitColor(t.color).tint }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-surface">
                <Emoji className="text-[22px]">{t.emoji}</Emoji>
              </span>
              <span className="flex flex-col">
                <span className="text-base leading-tight font-semibold">{t.name}</span>
                <span className="mt-0.5 text-xs text-ink-60">{t.sub}</span>
              </span>
              {t.kind === "quit" && !added && (
                <span className="absolute top-3.5 right-3.5 rounded-lg bg-surface px-1.5 py-1 text-chip tracking-[0.5px] text-fail-ink">
                  À ARRÊTER
                </span>
              )}
              {added && (
                <span
                  className="absolute top-3.5 right-3.5 flex size-6 items-center justify-center rounded-full bg-brand text-white"
                  aria-label="Déjà dans tes habitudes"
                >
                  <Check className="size-3.75" strokeWidth={3} />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </Screen>
  );
}
