import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY, useAppStore, type HabitInput } from "@/lib/store";
import { emptyData } from "@/lib/schema";

const DAY = "2026-10-03";

const water: HabitInput = {
  name: "Boire de l'eau",
  emoji: "💧",
  color: "teal",
  kind: "build",
  goal: { target: 1000, unit: "ml" },
  schedule: { days: [0, 1, 2, 3, 4, 5, 6] },
};

const store = () => useAppStore.getState();

beforeEach(async () => {
  localStorage.clear();
  useAppStore.setState({ ...emptyData(), hydrated: false });
  await useAppStore.persist.rehydrate();
});

describe("store", () => {
  it("rehydrates and flags itself as hydrated", () => {
    expect(store().hydrated).toBe(true);
  });

  it("increments towards the goal and completes it", () => {
    const id = store().addHabit(water);
    store().increment(id, DAY);
    expect(store().logs[id][DAY]).toEqual({ value: 250, status: "pending" });
    for (let i = 0; i < 5; i++) store().increment(id, DAY);
    expect(store().logs[id][DAY]).toEqual({ value: 1000, status: "done" });
  });

  it("sets an explicit quantity and clears the day at zero", () => {
    const id = store().addHabit(water);
    store().setLogValue(id, DAY, 1200);
    expect(store().logs[id][DAY]).toEqual({ value: 1200, status: "done" });
    store().setLogValue(id, DAY, 750);
    expect(store().logs[id][DAY]).toEqual({ value: 750, status: "pending" });
    store().setLogValue(id, DAY, 0);
    expect(store().logs[id][DAY]).toBeUndefined();
  });

  it("marks quit habits as held with a single tap", () => {
    const id = store().addHabit({ ...water, kind: "quit" });
    store().increment(id, DAY);
    expect(store().logs[id][DAY].status).toBe("done");
  });

  it("sets statuses from swipe actions and resets them", () => {
    const id = store().addHabit(water);
    store().setStatus(id, DAY, "done");
    expect(store().logs[id][DAY]).toEqual({ value: 1000, status: "done" });
    store().setStatus(id, DAY, "skipped");
    expect(store().logs[id][DAY].status).toBe("skipped");
    store().resetDay(id, DAY);
    expect(store().logs[id][DAY]).toBeUndefined();
  });

  it("deletes a habit with its logs and challenge links", () => {
    const id = store().addHabit(water);
    store().increment(id, DAY);
    const cid = store().addChallenge({ title: "Défi", startDate: DAY, days: 7, habitIds: [id] });
    store().deleteHabit(id);
    expect(store().habits).toEqual([]);
    expect(store().logs[id]).toBeUndefined();
    expect(store().challenges.find((c) => c.id === cid)?.habitIds).toEqual([]);
  });

  it("archives and restores a habit", () => {
    const id = store().addHabit(water);
    store().setArchived(id, true);
    expect(store().habits[0].archivedAt).toBeTypeOf("string");
    store().setArchived(id, false);
    expect(store().habits[0]).not.toHaveProperty("archivedAt");
  });

  it("creates starter habits when onboarding completes", () => {
    store().completeOnboarding(["water", "read", "unknown"]);
    expect(store().onboarded).toBe(true);
    expect(store().habits.map((h) => h.name)).toEqual(["Boire de l'eau", "Lire"]);
  });

  it("persists a versioned snapshot under routiner:v1", () => {
    store().setMood(DAY, 4);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    expect(saved.version).toBe(1);
    expect(saved.state.moods).toEqual({ [DAY]: 4 });
    expect(saved.state).not.toHaveProperty("hydrated");
  });

  it("restores sanitized data from storage", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, state: { ...emptyData(), moods: { [DAY]: 5, "bad-key": 3 }, onboarded: true } }),
    );
    await useAppStore.persist.rehydrate();
    expect(store().moods).toEqual({ [DAY]: 5 });
    expect(store().onboarded).toBe(true);
  });
});
