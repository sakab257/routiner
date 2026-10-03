"use client";

import { useState } from "react";
import { Emoji } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { EMOJI_CHOICES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** First grapheme of a string if it contains a pictographic character (keeps ZWJ sequences like 🧘‍♀️). */
export function firstEmoji(text: string): string | null {
  const segments = new Intl.Segmenter("fr", { granularity: "grapheme" }).segment(text.trim());
  for (const { segment } of segments) {
    if (/\p{Extended_Pictographic}/u.test(segment)) return segment;
  }
  return null;
}

export function EmojiPicker({
  open,
  onOpenChange,
  value,
  onChange,
  choices = EMOJI_CHOICES,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (emoji: string) => void;
  choices?: readonly string[];
}) {
  const [custom, setCustom] = useState("");
  const typed = firstEmoji(custom);
  const pick = (emoji: string) => {
    onChange(emoji);
    onOpenChange(false);
    setCustom("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-120 rounded-t-sheet! border-none bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <DrawerTitle className="mt-4.5 mb-3 text-xs font-bold tracking-[1px] text-ink-60 uppercase">Choisis une icône</DrawerTitle>
        <DrawerDescription className="sr-only">Sélectionne un emoji ou tapes-en un avec le clavier.</DrawerDescription>
        <div className="grid grid-cols-7 gap-1.5">
          {choices.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-pressed={emoji === value}
              onClick={() => pick(emoji)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-tile border-2 transition-transform active:scale-90",
                emoji === value ? "border-brand bg-soft" : "border-transparent bg-bg",
              )}
            >
              <Emoji className="text-2xl">{emoji}</Emoji>
            </button>
          ))}
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed) pick(typed);
          }}
        >
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Ou tape n'importe quel emoji…"
            aria-label="Emoji personnalisé"
            className="h-12 flex-1 rounded-field"
          />
          <Button type="submit" size="lg" className="h-12 rounded-field px-4" disabled={!typed}>
            {typed ? <Emoji className="text-xl">{typed}</Emoji> : "OK"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
