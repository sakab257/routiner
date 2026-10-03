import { describe, expect, it } from "vitest";
import { computeStats, dailySeries, dayPoint } from "@/lib/logic/stats";
import { dayLogs, makeHabit } from "@/test/factories";

const TODAY = "2026-10-03";

describe("computeStats", () => {
  const water = makeHabit({ id: "water", created: "2026-09-28" });
  const read = makeHabit({ id: "read", created: "2026-09-28", goal: { target: 20, unit: "pages" } });
  const logs = {
    water: dayLogs({
      "2026-09-28": "done",
      "2026-09-29": "done",
      "2026-09-30": "failed",
      "2026-10-01": "done",
      "2026-10-02": "done",
      [TODAY]: "done",
    }),
    read: dayLogs({ "2026-09-28": "done", "2026-09-29": "skipped", "2026-10-01": "done" }),
  };

  it("summarises a week", () => {
    const stats = computeStats([water, read], logs, "2026-09-28", "2026-10-04", TODAY);
    // water: 5 done, 1 failed. read: 2 done, 1 skipped, 2 missed (30th, 2nd), today pending.
    expect(stats.completed).toBe(7);
    expect(stats.failed).toBe(3);
    expect(stats.skipped).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.rate).toBeCloseTo(7 / 11);
    expect(stats.points).toBe(70);
    expect(stats.bestStreak).toBe(3);
  });

  it("returns a null rate when nothing was due", () => {
    const stats = computeStats([water], logs, "2026-09-20", "2026-09-27", TODAY);
    expect(stats.rate).toBeNull();
    expect(stats.completed).toBe(0);
  });

  it("ignores future days", () => {
    const stats = computeStats([water], logs, TODAY, "2026-10-10", TODAY);
    expect(stats.completed).toBe(1);
    expect(stats.rate).toBe(1);
  });
});

describe("daily series", () => {
  it("gives the success rate per day", () => {
    const a = makeHabit({ id: "a", created: "2026-10-01" });
    const b = makeHabit({ id: "b", created: "2026-10-01" });
    const logs = { a: dayLogs({ "2026-10-01": "done", "2026-10-02": "done" }), b: dayLogs({ "2026-10-02": "skipped" }) };
    expect(dayPoint([a, b], logs, "2026-10-01", TODAY)).toEqual({ day: "2026-10-01", done: 1, total: 2, rate: 0.5 });
    const series = dailySeries([a, b], logs, "2026-09-30", "2026-10-04", TODAY);
    expect(series.map((p) => p.rate)).toEqual([null, 0.5, 1, 0, null]);
  });
});
