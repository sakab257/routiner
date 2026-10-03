import { describe, expect, it } from "vitest";
import { earnedBadges, newBadges, POINTS_PER_CHALLENGE, POINTS_PER_DONE, totalPoints } from "@/lib/logic/rewards";
import { dayLogs, makeChallenge, makeHabit } from "@/test/factories";

const TODAY = "2026-10-03";

describe("points", () => {
  it("awards points per completed habit-day and per won challenge", () => {
    const habit = makeHabit({ created: "2026-09-28" });
    const logs = { h1: dayLogs({ "2026-09-28": "done", "2026-09-29": "done", "2026-09-30": "done", "2026-10-01": "failed" }) };
    const won = makeChallenge({ startDate: "2026-09-28", days: 3 });
    expect(totalPoints([habit], logs, [], TODAY)).toBe(3 * POINTS_PER_DONE);
    expect(totalPoints([habit], logs, [won], TODAY)).toBe(3 * POINTS_PER_DONE + POINTS_PER_CHALLENGE);
  });
});

describe("badges", () => {
  it("unlocks streak tiers from the best habit", () => {
    const habit = makeHabit({ id: "water", created: "2026-09-25" });
    const days = Object.fromEntries(
      ["2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01"].map((d) => [d, "done" as const]),
    );
    const badges = earnedBadges([habit], { water: dayLogs(days) }, TODAY);
    expect(badges.map((b) => b.id)).toEqual(["streak-3", "streak-7"]);
    expect(badges[1]).toMatchObject({ days: 7, habitId: "water", habitName: "Boire de l'eau" });
    expect(newBadges(badges, ["streak-3"]).map((b) => b.id)).toEqual(["streak-7"]);
  });

  it("gives nothing without habits", () => {
    expect(earnedBadges([], {}, TODAY)).toEqual([]);
  });
});
