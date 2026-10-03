import { describe, expect, it } from "vitest";
import { bestStreak, currentStreak, dayOutcome, defaultStep, isDueOn, progressRatio } from "@/lib/logic/habits";
import { dayLogs, isoAt, makeHabit } from "@/test/factories";

const TODAY = "2026-10-03"; // Saturday

describe("dayOutcome", () => {
  const habit = makeHabit({ created: "2026-09-28" });

  it("is neutral before creation, after today and on unscheduled days", () => {
    expect(dayOutcome(habit, undefined, "2026-09-27", TODAY)).toBe("none");
    expect(dayOutcome(habit, undefined, "2026-10-04", TODAY)).toBe("future");
    const weekdaysOnly = makeHabit({ created: "2026-09-28", schedule: { days: [1, 2, 3, 4, 5] } });
    expect(dayOutcome(weekdaysOnly, undefined, TODAY, TODAY)).toBe("none");
  });

  it("marks past build days without completion as missed, today as pending", () => {
    expect(dayOutcome(habit, undefined, "2026-10-02", TODAY)).toBe("missed");
    expect(dayOutcome(habit, undefined, TODAY, TODAY)).toBe("pending");
    expect(dayOutcome(habit, dayLogs({ [TODAY]: 500 }), TODAY, TODAY)).toBe("pending");
  });

  it("treats reaching the target as done", () => {
    expect(dayOutcome(habit, dayLogs({ "2026-10-01": 2000 }), "2026-10-01", TODAY)).toBe("done");
  });

  it("counts relapse-free past days of a quit habit as done", () => {
    const quit = makeHabit({ kind: "quit", created: "2026-09-28" });
    expect(dayOutcome(quit, undefined, "2026-10-01", TODAY)).toBe("done");
    expect(dayOutcome(quit, undefined, TODAY, TODAY)).toBe("pending");
    expect(dayOutcome(quit, dayLogs({ "2026-10-01": "failed" }), "2026-10-01", TODAY)).toBe("failed");
  });

  it("stops being due once archived", () => {
    const archived = makeHabit({ created: "2026-09-28", archivedAt: isoAt("2026-10-02", 9) });
    expect(isDueOn(archived, "2026-10-01")).toBe(true);
    expect(isDueOn(archived, "2026-10-02")).toBe(false);
  });
});

describe("currentStreak", () => {
  it("is extended by done and broken by failed", () => {
    const habit = makeHabit({ created: "2026-09-25" });
    const logs = dayLogs({
      "2026-09-28": "done",
      "2026-09-29": "failed",
      "2026-09-30": "done",
      "2026-10-01": "done",
      "2026-10-02": "done",
    });
    expect(currentStreak(habit, logs, TODAY)).toBe(3);
  });

  it("is not broken by skipped days", () => {
    const habit = makeHabit({ created: "2026-09-29" });
    const logs = dayLogs({ "2026-09-30": "done", "2026-10-01": "skipped", "2026-10-02": "done", [TODAY]: "done" });
    expect(currentStreak(habit, logs, "2026-10-03")).toBe(3);
  });

  it("is not broken by today still pending", () => {
    const habit = makeHabit({ created: "2026-10-01" });
    const logs = dayLogs({ "2026-10-01": "done", "2026-10-02": "done" });
    expect(currentStreak(habit, logs, TODAY)).toBe(2);
  });

  it("is broken by a past day left undone", () => {
    const habit = makeHabit({ created: "2026-09-29" });
    const logs = dayLogs({ "2026-09-29": "done", "2026-10-01": "done", "2026-10-02": "done" });
    expect(currentStreak(habit, logs, TODAY)).toBe(2);
  });

  it("ignores unscheduled days", () => {
    // Mon/Wed/Fri habit: Fri 2, Wed 30, Mon 28 done; Tue/Thu/Sat are neutral.
    const habit = makeHabit({ created: "2026-09-21", schedule: { days: [1, 3, 5] } });
    const logs = dayLogs({ "2026-09-28": "done", "2026-09-30": "done", "2026-10-02": "done" });
    expect(currentStreak(habit, logs, TODAY)).toBe(3);
  });

  it("counts relapse-free days for quit habits", () => {
    const quit = makeHabit({ kind: "quit", created: "2026-09-26" });
    expect(currentStreak(quit, undefined, TODAY)).toBe(7);
    const relapse = dayLogs({ "2026-09-30": "failed" });
    expect(currentStreak(quit, relapse, TODAY)).toBe(2);
  });
});

describe("bestStreak", () => {
  it("finds the longest run, optionally within a range", () => {
    const habit = makeHabit({ created: "2026-09-20" });
    const logs = dayLogs({
      "2026-09-20": "done",
      "2026-09-21": "done",
      "2026-09-22": "skipped",
      "2026-09-23": "done",
      "2026-09-24": "done",
      "2026-09-25": "failed",
      "2026-10-01": "done",
      "2026-10-02": "done",
    });
    expect(bestStreak(habit, logs, TODAY)).toBe(4);
    expect(bestStreak(habit, logs, TODAY, "2026-09-23", TODAY)).toBe(2);
  });
});

describe("helpers", () => {
  it("picks a sensible + step", () => {
    expect(defaultStep({ target: 2000, unit: "ml" })).toBe(250);
    expect(defaultStep({ target: 10000, unit: "steps" })).toBe(1000);
    expect(defaultStep({ target: 15, unit: "min" })).toBe(5);
    expect(defaultStep({ target: 1, unit: "times" })).toBe(1);
    expect(defaultStep({ target: 20, unit: "pages" })).toBe(5);
    expect(defaultStep({ target: 5, unit: "min" })).toBe(1);
  });

  it("computes ring progress", () => {
    const habit = makeHabit();
    expect(progressRatio(habit, { value: 500, status: "pending" }, "pending")).toBe(0.25);
    expect(progressRatio(habit, undefined, "done")).toBe(1);
    expect(progressRatio(makeHabit({ kind: "quit" }), undefined, "pending")).toBe(0);
  });
});
