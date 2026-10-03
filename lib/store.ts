import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { templateById } from "@/lib/catalog";
import { migrateData, sanitizeData } from "@/lib/data";
import { defaultStep } from "@/lib/logic/habits";
import {
  DATA_VERSION,
  emptyData,
  STORAGE_KEY,
  type AppData,
  type Challenge,
  type Habit,
  type LogEntry,
  type MoodValue,
  type Settings,
} from "@/lib/schema";
import type { DayKey } from "@/lib/date";

export { STORAGE_KEY };

export type HabitInput = Omit<Habit, "id" | "createdAt" | "archivedAt">;
export type ChallengeInput = Omit<Challenge, "id">;

interface Actions {
  addHabit: (input: HabitInput) => string;
  updateHabit: (id: string, input: Partial<HabitInput>) => void;
  setArchived: (id: string, archived: boolean) => void;
  deleteHabit: (id: string) => void;
  completeOnboarding: (templateIds: string[]) => void;
  /** Adds one step of progress; a build habit becomes "done" once its target is reached. */
  increment: (habitId: string, day: DayKey) => void;
  /** Sets the logged quantity; the day is "done" at or above the target, pending below it. */
  setLogValue: (habitId: string, day: DayKey, value: number) => void;
  setStatus: (habitId: string, day: DayKey, status: "done" | "failed" | "skipped") => void;
  resetDay: (habitId: string, day: DayKey) => void;
  setMood: (day: DayKey, value: MoodValue | null) => void;
  addChallenge: (input: ChallengeInput) => string;
  updateChallenge: (id: string, input: ChallengeInput) => void;
  deleteChallenge: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markBadgesSeen: (ids: string[]) => void;
  dismissReminder: (day: DayKey, habitId: string) => void;
  replaceData: (data: AppData) => void;
  resetAll: () => void;
}

export type AppState = AppData & Actions & { hydrated: boolean };

export function newId(): string {
  // crypto.randomUUID is missing on insecure origins (e.g. http://192.168.x.x during dev).
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function pickData(state: AppData): AppData {
  const { habits, logs, moods, challenges, settings, onboarded, badgesSeen, dismissedReminders } = state;
  return { habits, logs, moods, challenges, settings, onboarded, badgesSeen, dismissedReminders };
}

function withEntry(logs: AppData["logs"], habitId: string, day: DayKey, entry: LogEntry | null): AppData["logs"] {
  const days = { ...logs[habitId] };
  if (entry) days[day] = entry;
  else delete days[day];
  return { ...logs, [habitId]: days };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      hydrated: false,

      addHabit: (input) => {
        const id = newId();
        const habit: Habit = { ...input, id, createdAt: new Date().toISOString() };
        set((s) => ({ habits: [...s.habits, habit] }));
        return id;
      },

      updateHabit: (id, input) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...input } : h)) })),

      setArchived: (id, archived) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            if (!archived) {
              const rest = { ...h };
              delete rest.archivedAt;
              return rest;
            }
            return { ...h, archivedAt: new Date().toISOString() };
          }),
        })),

      deleteHabit: (id) =>
        set((s) => {
          const logs = { ...s.logs };
          delete logs[id];
          return {
            habits: s.habits.filter((h) => h.id !== id),
            logs,
            challenges: s.challenges.map((c) => ({ ...c, habitIds: c.habitIds.filter((h) => h !== id) })),
          };
        }),

      completeOnboarding: (templateIds) => {
        const createdAt = new Date().toISOString();
        const habits = templateIds.flatMap((tid): Habit[] => {
          const t = templateById(tid);
          if (!t) return [];
          return [{
            id: newId(),
            name: t.name,
            emoji: t.emoji,
            color: t.color,
            kind: t.kind,
            goal: { ...t.goal },
            schedule: { days: [...t.days] },
            createdAt,
          }];
        });
        set((s) => ({ habits: [...s.habits, ...habits], onboarded: true }));
      },

      increment: (habitId, day) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const prev = get().logs[habitId]?.[day];
        if (habit.kind === "quit") {
          set((s) => ({ logs: withEntry(s.logs, habitId, day, { value: 1, status: "done" }) }));
          return;
        }
        const value = Math.min(habit.goal.target, (prev?.value ?? 0) + defaultStep(habit.goal));
        const status = value >= habit.goal.target ? "done" : "pending";
        set((s) => ({ logs: withEntry(s.logs, habitId, day, { value, status }) }));
      },

      setLogValue: (habitId, day, value) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const v = Math.max(0, value);
        const entry: LogEntry | null = v > 0 ? { value: v, status: v >= habit.goal.target ? "done" : "pending" } : null;
        set((s) => ({ logs: withEntry(s.logs, habitId, day, entry) }));
      },

      setStatus: (habitId, day, status) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const prev = get().logs[habitId]?.[day];
        const value =
          status === "done" && habit.kind === "build"
            ? Math.max(prev?.value ?? 0, habit.goal.target)
            : (prev?.value ?? 0);
        set((s) => ({ logs: withEntry(s.logs, habitId, day, { value, status }) }));
      },

      resetDay: (habitId, day) => set((s) => ({ logs: withEntry(s.logs, habitId, day, null) })),

      setMood: (day, value) =>
        set((s) => {
          const moods = { ...s.moods };
          if (value) moods[day] = value;
          else delete moods[day];
          return { moods };
        }),

      addChallenge: (input) => {
        const id = newId();
        set((s) => ({ challenges: [...s.challenges, { ...input, id }] }));
        return id;
      },

      updateChallenge: (id, input) =>
        set((s) => ({ challenges: s.challenges.map((c) => (c.id === id ? { ...input, id } : c)) })),

      deleteChallenge: (id) => set((s) => ({ challenges: s.challenges.filter((c) => c.id !== id) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      markBadgesSeen: (ids) =>
        set((s) => ({ badgesSeen: [...new Set([...s.badgesSeen, ...ids])] })),

      dismissReminder: (day, habitId) =>
        set((s) => ({
          // Keep only today's list: older dismissals are irrelevant.
          dismissedReminders: { [day]: [...new Set([...(s.dismissedReminders[day] ?? []), habitId])] },
        })),

      replaceData: (data) => set(() => ({ ...sanitizeData(data) })),

      resetAll: () => set(() => emptyData()),
    }),
    {
      name: STORAGE_KEY,
      version: DATA_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated from a client effect so the first client render matches the server HTML.
      skipHydration: true,
      partialize: (state) => pickData(state),
      migrate: (persisted, version) => migrateData(persisted, version),
      merge: (persisted, current) => ({ ...current, ...sanitizeData(persisted ?? current) }),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
