import { WEEK_ORDER, WEEKDAY_LONG } from "@/lib/date";
import type { Habit, HabitKind } from "@/lib/schema";

export const HABIT_COLORS = [
  { id: "teal", solid: "#1FB5A3", tint: "var(--tint-teal)", label: "Teal" },
  { id: "orange", solid: "#FF7A1A", tint: "var(--tint-orange)", label: "Orange" },
  { id: "violet", solid: "#7B4DFF", tint: "var(--tint-violet)", label: "Violet" },
  { id: "pink", solid: "#F2558D", tint: "var(--tint-pink)", label: "Rose" },
  { id: "yellow", solid: "#FFC21A", tint: "var(--tint-yellow)", label: "Jaune" },
  { id: "navy", solid: "#3D4A99", tint: "var(--tint-navy)", label: "Bleu foncé" },
] as const;

export type HabitColorId = (typeof HABIT_COLORS)[number]["id"];

export function habitColor(id: string) {
  return HABIT_COLORS.find((c) => c.id === id) ?? HABIT_COLORS[0];
}

export const UNIT_OPTIONS = [
  { value: "times", label: "fois" },
  { value: "ml", label: "ml" },
  { value: "steps", label: "pas" },
  { value: "min", label: "min" },
  { value: "h", label: "h" },
  { value: "km", label: "km" },
  { value: "pages", label: "pages" },
] as const;

export function unitLabel(unit: string): string {
  return UNIT_OPTIONS.find((u) => u.value === unit)?.label ?? unit;
}

/** "Tous les jours", "En semaine" or "lun, mer, ven". */
export function scheduleLabel(days: number[]): string {
  if (days.length === 7) return "Tous les jours";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return "En semaine";
  return WEEK_ORDER.filter((d) => days.includes(d))
    .map((d) => WEEKDAY_LONG[d].slice(0, 3))
    .join(", ");
}

export const MOODS = [
  { value: 1, emoji: "😞", label: "Mal" },
  { value: 2, emoji: "😕", label: "Bof" },
  { value: 3, emoji: "😐", label: "Neutre" },
  { value: 4, emoji: "🙂", label: "Bien" },
  { value: 5, emoji: "😄", label: "Très bien" },
] as const;

export function moodInfo(value: number) {
  return MOODS[Math.min(5, Math.max(1, Math.round(value))) - 1];
}

export const CATEGORIES = [
  { id: "health", label: "Santé", color: "teal" },
  { id: "sport", label: "Sport", color: "orange" },
  { id: "reading", label: "Lecture", color: "violet" },
  { id: "wellbeing", label: "Bien-être", color: "pink" },
  { id: "study", label: "Études", color: "navy" },
  { id: "home", label: "Maison", color: "yellow" },
  { id: "quit", label: "À arrêter", color: "violet" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface HabitTemplate {
  id: string;
  name: string;
  emoji: string;
  /** Short description shown under the name ("2 L par jour"). */
  sub: string;
  kind: HabitKind;
  color: HabitColorId;
  category: CategoryId;
  goal: Habit["goal"];
  days: number[];
}

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

export const TEMPLATES: HabitTemplate[] = [
  { id: "water", name: "Boire de l'eau", emoji: "💧", sub: "2 L par jour", kind: "build", color: "teal", category: "health", goal: { target: 2000, unit: "ml" }, days: EVERY_DAY },
  { id: "walk", name: "Marcher", emoji: "🚶", sub: "10 000 pas", kind: "build", color: "orange", category: "sport", goal: { target: 10000, unit: "steps" }, days: EVERY_DAY },
  { id: "run", name: "Courir", emoji: "🏃", sub: "3 fois par semaine", kind: "build", color: "orange", category: "sport", goal: { target: 20, unit: "min" }, days: [1, 3, 5] },
  { id: "swim", name: "Nager", emoji: "🏊", sub: "30 min", kind: "build", color: "violet", category: "sport", goal: { target: 30, unit: "min" }, days: [2, 6] },
  { id: "read", name: "Lire", emoji: "📖", sub: "20 pages", kind: "build", color: "violet", category: "reading", goal: { target: 20, unit: "pages" }, days: EVERY_DAY },
  { id: "meditate", name: "Méditer", emoji: "🧘", sub: "10 min", kind: "build", color: "pink", category: "wellbeing", goal: { target: 10, unit: "min" }, days: EVERY_DAY },
  { id: "study", name: "Étudier", emoji: "🎓", sub: "1 h", kind: "build", color: "navy", category: "study", goal: { target: 60, unit: "min" }, days: [1, 2, 3, 4, 5] },
  { id: "journal", name: "Journal", emoji: "✍️", sub: "1 page", kind: "build", color: "yellow", category: "wellbeing", goal: { target: 1, unit: "pages" }, days: EVERY_DAY },
  { id: "plants", name: "Arroser les plantes", emoji: "🪴", sub: "2 fois par semaine", kind: "build", color: "teal", category: "home", goal: { target: 1, unit: "times" }, days: [3, 6] },
  { id: "sleep", name: "Dormir 8 h", emoji: "😴", sub: "8 h", kind: "build", color: "navy", category: "health", goal: { target: 8, unit: "h" }, days: EVERY_DAY },
  { id: "stretch", name: "S'étirer", emoji: "🤸", sub: "10 min", kind: "build", color: "orange", category: "sport", goal: { target: 10, unit: "min" }, days: EVERY_DAY },
  { id: "fruits", name: "Manger 5 fruits & légumes", emoji: "🥗", sub: "5 portions", kind: "build", color: "teal", category: "health", goal: { target: 5, unit: "times" }, days: EVERY_DAY },
  { id: "language", name: "Pratiquer une langue", emoji: "🗣️", sub: "15 min", kind: "build", color: "navy", category: "study", goal: { target: 15, unit: "min" }, days: EVERY_DAY },
  { id: "tidy", name: "Ranger 10 min", emoji: "🧹", sub: "10 min", kind: "build", color: "yellow", category: "home", goal: { target: 10, unit: "min" }, days: EVERY_DAY },
  { id: "gratitude", name: "3 gratitudes", emoji: "🙏", sub: "3 par jour", kind: "build", color: "pink", category: "wellbeing", goal: { target: 3, unit: "times" }, days: EVERY_DAY },
  { id: "smoking", name: "Arrêter de fumer", emoji: "🚬", sub: "Zéro cigarette", kind: "quit", color: "violet", category: "quit", goal: { target: 1, unit: "times" }, days: EVERY_DAY },
  { id: "social", name: "Moins de réseaux", emoji: "📱", sub: "Pas de scroll inutile", kind: "quit", color: "pink", category: "quit", goal: { target: 1, unit: "times" }, days: EVERY_DAY },
  { id: "sugar", name: "Sans sucre ajouté", emoji: "🍬", sub: "Ni sodas ni bonbons", kind: "quit", color: "orange", category: "quit", goal: { target: 1, unit: "times" }, days: EVERY_DAY },
  { id: "snacking", name: "Ne pas grignoter", emoji: "🍟", sub: "Entre les repas", kind: "quit", color: "yellow", category: "quit", goal: { target: 1, unit: "times" }, days: EVERY_DAY },
  { id: "screens", name: "Pas d'écran au lit", emoji: "🌙", sub: "Après 22 h", kind: "quit", color: "navy", category: "quit", goal: { target: 1, unit: "times" }, days: EVERY_DAY },
  { id: "alcohol", name: "Sans alcool", emoji: "🍷", sub: "En semaine", kind: "quit", color: "violet", category: "quit", goal: { target: 1, unit: "times" }, days: [1, 2, 3, 4, 5] },
];

/** Starter habits offered right after onboarding. */
export const STARTER_IDS = ["water", "run", "read", "meditate", "study", "journal", "plants", "sleep"];
/** Good habits featured in the "+" bottom sheet. */
export const POPULAR_GOOD_IDS = ["walk", "swim", "read", "meditate", "sleep"];
/** Bad habits featured in the "+" bottom sheet. */
export const POPULAR_BAD_IDS = ["smoking", "social", "sugar", "snacking", "screens"];

export function templateById(id: string | null | undefined): HabitTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export const CHALLENGE_EMOJIS = ["🏆", "🔥", "📚", "🧘", "🏃", "💧", "🌱", "🎯", "💪", "🧠"];

export const EMOJI_CHOICES = [
  "💧", "🚶", "🏃", "🏊", "🚴", "🤸", "🏋️", "🧘", "😴", "🥗", "🍎", "💊",
  "📖", "📚", "✍️", "🎓", "🧠", "🗣️", "💻", "🎸", "🎨", "📷", "🪴", "🧹",
  "🙏", "😊", "☀️", "🌙", "📵", "🚭", "🚬", "📱", "🍬", "🍟", "🍷", "☕",
  "💰", "🛒", "🐶", "❤️", "🎯", "⭐",
];
