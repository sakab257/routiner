// Day keys are LOCAL calendar dates ("YYYY-MM-DD"). Never derive them from
// toISOString(), which is UTC and shifts the day around midnight.

export type DayKey = string;

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export const WEEKDAY_SHORT = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"] as const;
export const WEEKDAY_LETTER = ["D", "L", "M", "M", "J", "V", "S"] as const;
export const WEEKDAY_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;
export const MONTH_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
] as const;
export const MONTH_SHORT = [
  "janv", "févr", "mars", "avr", "mai", "juin",
  "juil", "août", "sept", "oct", "nov", "déc",
] as const;

/** Monday-first order of weekday indices (0 = Sunday, as in Date#getDay). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function toDayKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(now: Date = new Date()): DayKey {
  return toDayKey(now);
}

export function isDayKey(value: unknown): value is DayKey {
  if (typeof value !== "string" || !DAY_KEY_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Local midnight of the given day. */
export function parseDayKey(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DayKey, n: number): DayKey {
  const [y, m, d] = key.split("-").map(Number);
  return toDayKey(new Date(y, m - 1, d + n));
}

/** Whole days from `a` to `b` (positive when b is after a). DST-proof. */
export function diffDays(a: DayKey, b: DayKey): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / MS_PER_DAY);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(key: DayKey): number {
  return parseDayKey(key).getDay();
}

export function startOfWeek(key: DayKey): DayKey {
  const offset = (weekday(key) + 6) % 7; // Monday = 0
  return addDays(key, -offset);
}

export function endOfWeek(key: DayKey): DayKey {
  return addDays(startOfWeek(key), 6);
}

export function startOfMonth(key: DayKey): DayKey {
  return `${key.slice(0, 7)}-01`;
}

export function endOfMonth(key: DayKey): DayKey {
  const [y, m] = key.split("-").map(Number);
  return toDayKey(new Date(y, m, 0));
}

export function addMonths(key: DayKey, n: number): DayKey {
  const [y, m] = key.split("-").map(Number);
  return toDayKey(new Date(y, m - 1 + n, 1));
}

/** Inclusive list of day keys from `from` to `to`. */
export function rangeKeys(from: DayKey, to: DayKey): DayKey[] {
  const count = diffDays(from, to);
  if (count < 0) return [];
  return Array.from({ length: count + 1 }, (_, i) => addDays(from, i));
}

export function minKey(a: DayKey, b: DayKey): DayKey {
  return a < b ? a : b;
}

export function maxKey(a: DayKey, b: DayKey): DayKey {
  return a > b ? a : b;
}

/** Local day of an ISO timestamp (e.g. a habit's createdAt). */
export function dayKeyOfIso(iso: string): DayKey {
  return toDayKey(new Date(iso));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Samedi 3 octobre" */
export function formatLongDay(key: DayKey): string {
  const d = parseDayKey(key);
  return `${cap(WEEKDAY_LONG[d.getDay()])} ${d.getDate()} ${MONTH_LONG[d.getMonth()]}`;
}

/** "28 sept – 4 oct" */
export function formatRange(from: DayKey, to: DayKey): string {
  const a = parseDayKey(from);
  const b = parseDayKey(to);
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} ${MONTH_SHORT[b.getMonth()]}`;
  }
  return `${a.getDate()} ${MONTH_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTH_SHORT[b.getMonth()]}`;
}

/** "Octobre 2026" */
export function formatMonth(key: DayKey): string {
  const d = parseDayKey(key);
  return `${cap(MONTH_LONG[d.getMonth()])} ${d.getFullYear()}`;
}

/** "3 oct" */
export function formatShortDay(key: DayKey): string {
  const d = parseDayKey(key);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

/** "HH:MM" of a local date. */
export function toTimeKey(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
