"use client";

import { ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { EmojiPicker } from "@/components/emoji-picker";
import { Card, Emoji, FieldLabel, formatNumber, ScreenTitle, Screen, Segmented, StickyFooter } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HABIT_COLORS, habitColor, UNIT_OPTIONS, unitLabel } from "@/lib/catalog";
import { WEEK_ORDER, WEEKDAY_LETTER, WEEKDAY_LONG } from "@/lib/date";
import { defaultStep } from "@/lib/logic/habits";
import type { HabitKind } from "@/lib/schema";
import type { HabitInput } from "@/lib/store";
import { cn } from "@/lib/utils";

type Frequency = "daily" | "weekdays" | "custom";

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const CUSTOM_UNIT = "__custom";

function frequencyOf(days: number[]): Frequency {
  const set = new Set(days);
  if (set.size === 7) return "daily";
  if (set.size === 5 && WEEKDAYS.every((d) => set.has(d))) return "weekdays";
  return "custom";
}

export function HabitForm({
  title,
  initial,
  submitLabel,
  onSubmit,
}: {
  title: string;
  initial: HabitInput;
  submitLabel: string;
  onSubmit: (input: HabitInput) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [emoji, setEmoji] = useState(initial.emoji);
  const [color, setColor] = useState(initial.color);
  const [kind, setKind] = useState<HabitKind>(initial.kind);
  const [target, setTarget] = useState(initial.goal.target);
  const [unit, setUnit] = useState(initial.goal.unit);
  const [customUnit, setCustomUnit] = useState(UNIT_OPTIONS.some((u) => u.value === initial.goal.unit) ? "" : initial.goal.unit);
  const [days, setDays] = useState<number[]>(initial.schedule.days);
  const [reminderOn, setReminderOn] = useState(initial.reminder?.enabled ?? false);
  const [reminderTime, setReminderTime] = useState(initial.reminder?.time ?? "08:00");
  const [pickerOpen, setPickerOpen] = useState(false);

  const knownUnit = UNIT_OPTIONS.some((u) => u.value === unit);
  const effectiveUnit = knownUnit ? unit : customUnit.trim();
  const step = defaultStep({ target, unit: effectiveUnit || "times" });
  const valid = name.trim().length > 0 && days.length > 0 && (kind === "quit" || (target > 0 && effectiveUnit.length > 0));
  const tint = habitColor(color).tint;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      emoji,
      color,
      kind,
      goal: kind === "quit" ? { target: 1, unit: "times" } : { target, unit: effectiveUnit },
      schedule: { days: [...days].sort((a, b) => a - b) },
      reminder: { enabled: reminderOn, time: reminderTime },
    });
  };

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? (cur.length > 1 ? cur.filter((x) => x !== d) : cur) : [...cur, d]));

  return (
    <Screen className="gap-2 pb-36">
      <ScreenTitle back>{title}</ScreenTitle>

      <FieldLabel id="name-label">Nom</FieldLabel>
      <Input
        aria-labelledby="name-label"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        placeholder={kind === "quit" ? "Ex. Arrêter de fumer" : "Ex. Boire de l'eau"}
        className="h-14 rounded-field border-2 border-line bg-surface px-4 text-base font-medium focus-visible:border-brand focus-visible:ring-0 md:text-base"
      />

      <FieldLabel className="mt-2.5">Icône &amp; couleur</FieldLabel>
      <Card className="flex flex-col gap-3.5 p-3.5">
        <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-3 text-left">
          <span className="flex size-12 items-center justify-center rounded-tile" style={{ background: tint }}>
            <Emoji className="text-2xl">{emoji}</Emoji>
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-base font-semibold">Icône</span>
            <span className="text-xs text-ink-60">Touche pour changer d&apos;icône</span>
          </span>
          <ChevronRight className="size-5.5 text-ink-60" />
        </button>
        <div className="flex justify-between" role="radiogroup" aria-label="Couleur">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={color === c.id}
              aria-label={c.label}
              onClick={() => setColor(c.id)}
              className="flex size-11 items-center justify-center"
            >
              <span
                className="size-7.5 rounded-full transition-shadow"
                style={{
                  background: c.solid,
                  boxShadow: color === c.id ? `0 0 0 3px var(--surface), 0 0 0 5px ${c.solid}` : "none",
                }}
              />
            </button>
          ))}
        </div>
      </Card>

      {kind === "build" && (
        <>
          <FieldLabel className="mt-2.5">Objectif</FieldLabel>
          <Card className="flex items-center gap-2.5 px-3.5 py-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Moins"
              onClick={() => setTarget((t) => Math.max(1, t - step))}
              disabled={target <= 1}
            >
              <Minus />
            </Button>
            <label className="flex flex-1 flex-col items-center">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={target}
                onChange={(e) => setTarget(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                aria-label="Valeur de l'objectif"
                className="w-full bg-transparent text-center text-xl font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-ink-60">
                {formatNumber(target)} {unitLabel(effectiveUnit || "…")} par jour
              </span>
            </label>
            <Button variant="outline" size="icon" aria-label="Plus" onClick={() => setTarget((t) => t + step)}>
              <Plus />
            </Button>
            <Select value={knownUnit ? unit : CUSTOM_UNIT} onValueChange={(v) => setUnit(v === CUSTOM_UNIT ? customUnit || "" : v)}>
              <SelectTrigger
                aria-label="Unité"
                className="h-11! rounded-tile border-none bg-soft px-3 text-sm font-bold text-accent-ink uppercase [&_svg]:text-accent-ink!"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_UNIT}>Autre…</SelectItem>
              </SelectContent>
            </Select>
          </Card>
          {!knownUnit && (
            <Input
              value={customUnit}
              onChange={(e) => {
                setCustomUnit(e.target.value);
                setUnit(e.target.value);
              }}
              maxLength={16}
              placeholder="Unité personnalisée (ex. verres)"
              aria-label="Unité personnalisée"
              className="h-12 rounded-field bg-surface"
            />
          )}
        </>
      )}

      <FieldLabel className="mt-2.5">Fréquence</FieldLabel>
      <Card className="flex flex-col gap-3 p-3">
        <Segmented
          label="Fréquence"
          value={frequencyOf(days)}
          onChange={(f) => {
            if (f === "daily") setDays(ALL_DAYS);
            if (f === "weekdays") setDays(WEEKDAYS);
          }}
          options={[
            { value: "daily", label: "Quotidien" },
            { value: "weekdays", label: "En semaine" },
            { value: "custom", label: "Perso" },
          ]}
        />
        <div className="flex justify-between">
          {WEEK_ORDER.map((d) => {
            const on = days.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                aria-label={WEEKDAY_LONG[d]}
                onClick={() => toggleDay(d)}
                className={cn(
                  "h-11 w-10.5 rounded-tile text-sm font-bold transition-colors",
                  on ? "bg-brand text-white" : "bg-track text-ink-60",
                )}
              >
                {WEEKDAY_LETTER[d]}
              </button>
            );
          })}
        </div>
      </Card>

      <FieldLabel className="mt-2.5">Rappel</FieldLabel>
      <Card className="flex flex-col px-3.5 py-1">
        <label className="flex min-h-14 items-center justify-between border-b border-line">
          <span className="text-base font-medium">Me le rappeler</span>
          <Switch checked={reminderOn} onCheckedChange={setReminderOn} aria-label="Activer le rappel" />
        </label>
        <label className={cn("flex min-h-14 items-center justify-between", !reminderOn && "opacity-40")}>
          <span className="text-base font-medium">Heure</span>
          <input
            type="time"
            value={reminderTime}
            disabled={!reminderOn}
            onChange={(e) => e.target.value && setReminderTime(e.target.value)}
            className="h-9 rounded-[10px] bg-track px-3 text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
          />
        </label>
      </Card>
      <p className="px-1 text-xs text-ink-60">Rappel affiché dans l&apos;app à son ouverture, sans notification.</p>

      <FieldLabel className="mt-2.5">Type</FieldLabel>
      <Segmented
        label="Type d'habitude"
        size="lg"
        value={kind}
        onChange={setKind}
        options={[
          { value: "build", label: "Construire" },
          { value: "quit", label: "Arrêter" },
        ]}
      />
      {kind === "quit" && (
        <p className="px-1 text-xs text-ink-60">
          Chaque jour sans rechute compte comme une réussite. Glisse la carte vers la gauche pour noter une rechute.
        </p>
      )}

      <StickyFooter>
        <Button size="lg" className="w-full" disabled={!valid} onClick={submit}>
          {submitLabel}
        </Button>
      </StickyFooter>

      <EmojiPicker open={pickerOpen} onOpenChange={setPickerOpen} value={emoji} onChange={setEmoji} />
    </Screen>
  );
}
