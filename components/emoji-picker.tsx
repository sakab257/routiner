"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Emoji } from "@/components/kit";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { EMOJI_GROUPS, searchEmojis, type EmojiGroup, type EmojiIndex } from "@/lib/emoji";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function EmojiGrid({ emojis, value, onPick }: { emojis: readonly string[]; value: string; onPick: (emoji: string) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`Choisir ${emoji}`}
          aria-pressed={emoji === value}
          onClick={() => onPick(emoji)}
          className={cn(
            "flex aspect-square items-center justify-center rounded-tile border-2 transition-transform active:scale-90",
            emoji === value ? "border-brand bg-soft" : "border-transparent bg-bg",
          )}
        >
          <Emoji className="text-2xl">{emoji}</Emoji>
        </button>
      ))}
    </div>
  );
}

/**
 * Icon picker: French keyword search over ~1 500 emoji, the catalogue by category,
 * the icons already in use and an optional `featured` group (e.g. challenge suggestions).
 */
export function EmojiPicker({
  open,
  onOpenChange,
  value,
  onChange,
  featured,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (emoji: string) => void;
  featured?: EmojiGroup;
}) {
  const habits = useAppStore((s) => s.habits);
  const challenges = useAppStore((s) => s.challenges);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<EmojiIndex | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // The search index (~30 KiB gzipped) is only fetched once the picker opens.
  useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    void import("@/lib/emoji-index.json").then((m) => {
      if (!cancelled) setIndex(m.default as unknown as EmojiIndex);
    });
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  const sections = useMemo(() => {
    const used = [...new Set([...habits.map((h) => h.emoji), ...challenges.flatMap((c) => (c.emoji ? [c.emoji] : []))])];
    const mine: EmojiGroup[] = used.length ? [{ id: "mine", label: "Tes icônes", emojis: used.slice(0, 14) }] : [];
    return [...(featured ? [featured] : []), ...mine, ...EMOJI_GROUPS];
  }, [habits, challenges, featured]);

  const searching = query.trim().length > 0;
  const results = useMemo(() => (searching ? searchEmojis(index ?? [], query) : []), [index, query, searching]);
  const current = active ?? sections[0]?.id;

  const pick = (emoji: string) => {
    onChange(emoji);
    onOpenChange(false);
    setQuery("");
  };

  const jumpTo = (id: string) => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (box && el) box.scrollTo({ top: el.offsetTop - box.offsetTop, behavior: "smooth" });
    setActive(id);
  };

  // Highlight the category whose section is at the top of the scroll area.
  const onScroll = () => {
    const box = scroller.current;
    if (!box || searching) return;
    let id = sections[0]?.id ?? null;
    for (const el of box.querySelectorAll<HTMLElement>("[data-section]")) {
      if (el.offsetTop - box.offsetTop <= box.scrollTop + 24) id = el.dataset.section ?? id;
    }
    setActive(id);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("");
        onOpenChange(next);
      }}
    >
      <DrawerContent className="mx-auto h-[88dvh] max-w-120 rounded-t-sheet! border-none bg-surface pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <DrawerTitle className="mx-5 mt-4.5 mb-3 text-xs font-bold tracking-[1px] text-ink-60 uppercase">
          Choisis une icône
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Recherche une icône par mot-clé, parcours les catégories ou colle un emoji.
        </DrawerDescription>

        <form
          role="search"
          className="mx-5 mb-3 flex h-12 shrink-0 items-center gap-2 rounded-field border-2 border-line bg-bg px-3 focus-within:border-brand"
          onSubmit={(e) => {
            e.preventDefault();
            if (results[0]) pick(results[0]);
          }}
        >
          <Search className="size-5 shrink-0 text-ink-60" />
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : eau, sport, livre… ou colle un emoji"
            aria-label="Rechercher une icône"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-40 [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button type="button" aria-label="Effacer la recherche" onClick={() => setQuery("")} className="text-ink-60">
              <X className="size-5" />
            </button>
          )}
        </form>

        {!searching && (
          <div role="tablist" aria-label="Catégories d'icônes" className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-5 pb-3">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={current === s.id}
                onClick={() => jumpTo(s.id)}
                className={cn(
                  "h-8 shrink-0 rounded-xl px-3 text-xs font-bold transition-colors",
                  current === s.id ? "bg-brand text-white" : "bg-track text-ink-60",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div
          ref={scroller}
          onScroll={onScroll}
          data-vaul-no-drag
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5"
        >
          {searching ? (
            results.length ? (
              <section aria-label="Résultats" className="pb-4">
                <h3 className="pb-2 text-xs font-semibold text-ink-60">
                  {results.length} résultat{results.length > 1 ? "s" : ""}
                </h3>
                <EmojiGrid emojis={results} value={value} onPick={pick} />
              </section>
            ) : (
              <p className="py-10 text-center text-sm text-ink-60" aria-live="polite">
                {index ? `Aucune icône pour « ${query.trim()} ». Essaie un autre mot.` : "Chargement des icônes…"}
              </p>
            )
          ) : (
            sections.map((s) => (
              <section key={s.id} data-section={s.id} aria-label={s.label} className="pb-4">
                <h3 className="pb-2 text-xs font-semibold text-ink-60">{s.label}</h3>
                <EmojiGrid emojis={s.emojis} value={value} onPick={pick} />
              </section>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
