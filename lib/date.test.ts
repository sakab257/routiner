import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  diffDays,
  endOfMonth,
  endOfWeek,
  formatLongDay,
  formatRange,
  isDayKey,
  rangeKeys,
  startOfMonth,
  startOfWeek,
  toDayKey,
  weekday,
} from "@/lib/date";

describe("day keys are local, never UTC", () => {
  it("keeps the local calendar day late in the evening", () => {
    // 23:30 in Paris is already the next day in UTC during summer time.
    const lateEvening = new Date(2026, 9, 3, 23, 30);
    expect(lateEvening.toISOString().slice(0, 10)).toBe("2026-10-03");
    expect(toDayKey(lateEvening)).toBe("2026-10-03");
    const justAfterMidnight = new Date(2026, 9, 4, 0, 30);
    expect(justAfterMidnight.toISOString().slice(0, 10)).toBe("2026-10-03");
    expect(toDayKey(justAfterMidnight)).toBe("2026-10-04");
  });

  it("validates real calendar dates", () => {
    expect(isDayKey("2026-10-03")).toBe(true);
    expect(isDayKey("2026-02-30")).toBe(false);
    expect(isDayKey("2026-1-3")).toBe(false);
    expect(isDayKey(20261003)).toBe(false);
  });
});

describe("arithmetic across DST changes", () => {
  it("adds days over the spring and autumn clock changes", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts whole days regardless of 23h/25h days", () => {
    expect(diffDays("2026-03-28", "2026-03-30")).toBe(2);
    expect(diffDays("2026-10-24", "2026-10-26")).toBe(2);
    expect(diffDays("2026-10-03", "2026-09-28")).toBe(-5);
  });

  it("builds inclusive ranges", () => {
    expect(rangeKeys("2026-10-24", "2026-10-27")).toEqual(["2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27"]);
    expect(rangeKeys("2026-10-27", "2026-10-24")).toEqual([]);
  });
});

describe("weeks and months", () => {
  it("uses Monday-first weeks", () => {
    expect(weekday("2026-10-03")).toBe(6); // Saturday
    expect(startOfWeek("2026-10-03")).toBe("2026-09-28");
    expect(endOfWeek("2026-10-03")).toBe("2026-10-04");
    expect(startOfWeek("2026-10-04")).toBe("2026-09-28"); // Sunday belongs to the same week
    expect(startOfWeek("2026-09-28")).toBe("2026-09-28");
  });

  it("finds month bounds, leap years included", () => {
    expect(startOfMonth("2026-10-17")).toBe("2026-10-01");
    expect(endOfMonth("2026-10-17")).toBe("2026-10-31");
    expect(endOfMonth("2028-02-10")).toBe("2028-02-29");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-01");
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-01");
  });
});

describe("French formatting", () => {
  it("formats days and ranges", () => {
    expect(formatLongDay("2026-10-03")).toBe("Samedi 3 octobre");
    expect(formatRange("2026-09-28", "2026-10-04")).toBe("28 sept – 4 oct");
    expect(formatRange("2026-10-05", "2026-10-11")).toBe("5 – 11 oct");
  });
});
