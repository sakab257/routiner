"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EmojiPicker } from "@/components/emoji-picker";
import { Card, Emoji, FieldLabel, Screen, ScreenTitle, Segmented, StickyFooter } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHALLENGE_EMOJIS, EMOJI_CHOICES, habitColor } from "@/lib/catalog";
import { addDays, formatLongDay, isDayKey, type DayKey } from "@/lib/date";
import { useAppStore, type ChallengeInput } from "@/lib/store";
import { cn } from "@/lib/utils";

const DURATIONS = ["7", "21", "30"] as const;
const CHOICES = [...CHALLENGE_EMOJIS, ...EMOJI_CHOICES.filter((e) => !CHALLENGE_EMOJIS.includes(e))];

export function ChallengeForm({
  title,
  initial,
  submitLabel,
  today,
  onSubmit,
  footer,
}: {
  title: string;
  initial: ChallengeInput;
  submitLabel: string;
  today: DayKey;
  onSubmit: (input: ChallengeInput) => void;
  footer?: ReactNode;
}) {
  const habits = useAppStore((s) => s.habits);
  const [name, setName] = useState(initial.title);
  const [emoji, setEmoji] = useState(initial.emoji ?? "🏆");
  const [days, setDays] = useState(initial.days);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [habitIds, setHabitIds] = useState(initial.habitIds);
  const [pickerOpen, setPickerOpen] = useState(false);

  const available = habits.filter((h) => !h.archivedAt || habitIds.includes(h.id));
  const preset = DURATIONS.find((d) => Number(d) === days) ?? "custom";
  const valid = name.trim().length > 0 && days >= 1 && days <= 365 && isDayKey(startDate) && habitIds.length > 0;

  const toggle = (id: string) => setHabitIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <Screen className="gap-2 pb-36">
      <ScreenTitle back>{title}</ScreenTitle>

      <FieldLabel id="challenge-name">Titre</FieldLabel>
      <div className="flex gap-2.5">
        <button
          type="button"
          aria-label="Changer l'icône"
          onClick={() => setPickerOpen(true)}
          className="flex size-14 shrink-0 items-center justify-center rounded-field border-2 border-line bg-surface"
        >
          <Emoji className="text-[26px]">{emoji}</Emoji>
        </button>
        <Input
          aria-labelledby="challenge-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Ex. Lire 30 jours"
          className="h-14 rounded-field border-2 border-line bg-surface px-4 text-base font-medium focus-visible:border-brand focus-visible:ring-0 md:text-base"
        />
      </div>

      <FieldLabel className="mt-2.5">Durée</FieldLabel>
      <Card className="flex flex-col gap-3 p-3">
        <Segmented
          label="Durée"
          value={preset}
          onChange={(v) => v !== "custom" && setDays(Number(v))}
          options={[
            { value: "7", label: "7 jours" },
            { value: "21", label: "21 jours" },
            { value: "30", label: "30 jours" },
            { value: "custom", label: "Perso" },
          ]}
        />
        <label className="flex items-center justify-between px-1">
          <span className="text-sm text-ink-60">Nombre de jours</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(365, Math.round(Number(e.target.value) || 1))))}
            className="h-9 w-20 rounded-[10px] bg-track px-3 text-center text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
          />
        </label>
      </Card>

      <FieldLabel className="mt-2.5">Début</FieldLabel>
      <Card className="flex flex-col gap-3 p-3">
        <Segmented
          label="Date de début"
          value={startDate === today ? "today" : startDate === addDays(today, 1) ? "tomorrow" : "custom"}
          onChange={(v) => {
            if (v === "today") setStartDate(today);
            if (v === "tomorrow") setStartDate(addDays(today, 1));
          }}
          options={[
            { value: "today", label: "Aujourd'hui" },
            { value: "tomorrow", label: "Demain" },
            { value: "custom", label: "Autre date" },
          ]}
        />
        <label className="flex items-center justify-between px-1">
          <span className="text-sm text-ink-60">{isDayKey(startDate) ? formatLongDay(startDate) : "Date"}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => e.target.value && setStartDate(e.target.value)}
            className="h-9 rounded-[10px] bg-track px-3 text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
          />
        </label>
      </Card>

      <FieldLabel className="mt-2.5">Habitudes du défi</FieldLabel>
      {available.length ? (
        <Card className="flex flex-col px-3.5">
          {available.map((h, i) => {
            const on = habitIds.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(h.id)}
                className={cn("flex min-h-15 items-center gap-3 text-left", i < available.length - 1 && "border-b border-line")}
              >
                <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: habitColor(h.color).tint }}>
                  <Emoji className="text-xl">{h.emoji}</Emoji>
                </span>
                <span className="flex-1 text-base font-medium">{h.name}</span>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-[9px] transition-colors",
                    on ? "bg-brand text-white" : "border-2 border-ink-40",
                  )}
                >
                  {on && <Check className="size-4.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </Card>
      ) : (
        <Link href="/habitudes/nouvelle" className="flex items-center justify-between rounded-card border border-dashed border-brand-300 p-4 text-sm font-semibold text-accent-ink">
          Crée d&apos;abord une habitude à suivre
          <ChevronRight className="size-5" />
        </Link>
      )}
      <p className="px-1 text-xs text-ink-60">Un jour est réussi quand toutes les habitudes prévues ce jour-là sont faites.</p>

      {footer}

      <StickyFooter>
        <Button
          size="lg"
          className="w-full"
          disabled={!valid}
          onClick={() => onSubmit({ title: name.trim(), emoji, days, startDate, habitIds })}
        >
          {submitLabel}
        </Button>
      </StickyFooter>

      <EmojiPicker open={pickerOpen} onOpenChange={setPickerOpen} value={emoji} onChange={setEmoji} choices={CHOICES} />
    </Screen>
  );
}
