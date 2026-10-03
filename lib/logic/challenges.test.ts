import { describe, expect, it } from "vitest";
import { challengeDayOutcome, challengeEnd, challengeProgress } from "@/lib/logic/challenges";
import { dayLogs, makeChallenge, makeHabit } from "@/test/factories";

const TODAY = "2026-10-03";

describe("challenges", () => {
  const read = makeHabit({ id: "h1", created: "2026-09-01" });
  const quote = makeHabit({ id: "h2", created: "2026-09-01" });
  const challenge = makeChallenge({ startDate: "2026-09-29", days: 30, habitIds: ["h1", "h2"] });

  it("computes its end day", () => {
    expect(challengeEnd(challenge)).toBe("2026-10-28");
  });

  it("rates each day from the linked habits", () => {
    const logs = {
      h1: dayLogs({ "2026-09-29": "done", "2026-09-30": "done", "2026-10-01": "done", [TODAY]: "done" }),
      h2: dayLogs({ "2026-09-29": "done", "2026-09-30": "failed", "2026-10-01": "skipped", "2026-10-02": "done" }),
    };
    const outcome = (day: string) => challengeDayOutcome(challenge, [read, quote], logs, day, TODAY);
    expect(outcome("2026-09-29")).toBe("done");
    expect(outcome("2026-09-30")).toBe("failed");
    expect(outcome("2026-10-01")).toBe("done"); // skipped doesn't fail the day
    expect(outcome("2026-10-02")).toBe("failed"); // h1 left undone
    expect(outcome(TODAY)).toBe("pending");
    expect(outcome("2026-10-04")).toBe("future");

    const progress = challengeProgress(challenge, [read, quote], logs, TODAY);
    expect(progress).toMatchObject({ phase: "active", dayIndex: 5, remainingDays: 25, doneDays: 2, failedDays: 2, won: false });
    expect(progress.elapsed).toBeCloseTo(5 / 30);
  });

  it("is won when finished without failures", () => {
    const short = makeChallenge({ startDate: "2026-09-28", days: 3, habitIds: ["h1"] });
    const logs = { h1: dayLogs({ "2026-09-28": "done", "2026-09-29": "skipped", "2026-09-30": "done" }) };
    expect(challengeProgress(short, [read], logs, TODAY)).toMatchObject({ phase: "finished", dayIndex: 3, won: true });
  });

  it("is upcoming before its start", () => {
    const later = makeChallenge({ startDate: "2026-10-10", days: 7 });
    expect(challengeProgress(later, [read], {}, TODAY)).toMatchObject({ phase: "upcoming", dayIndex: 0, remainingDays: 7 });
  });
});
