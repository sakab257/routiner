import { describe, expect, it } from "vitest";
import { createBackup, migrateData, parseBackup, sanitizeData } from "@/lib/data";
import { emptyData, type AppData } from "@/lib/schema";
import { dayLogs, makeChallenge, makeHabit } from "@/test/factories";

function sample(): AppData {
  return {
    ...emptyData(),
    habits: [makeHabit({ id: "h1" })],
    logs: { h1: dayLogs({ "2026-10-01": "done" }) },
    moods: { "2026-10-01": 4 },
    challenges: [makeChallenge({ habitIds: ["h1"] })],
    onboarded: true,
    badgesSeen: ["streak-3"],
  };
}

describe("sanitizeData", () => {
  it("keeps valid data untouched", () => {
    expect(sanitizeData(sample())).toEqual(sample());
  });

  it("salvages valid records and drops broken ones", () => {
    const raw = {
      habits: [makeHabit({ id: "ok" }), { id: "broken", name: "" }],
      logs: {
        ok: { "2026-10-01": { value: 1, status: "done" }, "2026-13-01": { value: 1, status: "done" }, "2026-10-02": { value: -1, status: "done" } },
        ghost: { "2026-10-01": { value: 1, status: "done" } },
      },
      moods: { "2026-10-01": 9, "2026-10-02": 3 },
      challenges: [makeChallenge({ habitIds: ["ok", "ghost"] })],
      settings: { theme: "dark" },
    };
    const data = sanitizeData(raw);
    expect(data.habits.map((h) => h.id)).toEqual(["ok"]);
    expect(data.logs).toEqual({ ok: { "2026-10-01": { value: 1, status: "done" } } });
    expect(data.moods).toEqual({ "2026-10-02": 3 });
    expect(data.challenges[0].habitIds).toEqual(["ok"]);
    expect(data.settings).toEqual({ theme: "dark", sounds: true, vibrations: true });
    expect(data.onboarded).toBe(true);
  });

  it("falls back to empty data for garbage", () => {
    expect(sanitizeData("nope")).toEqual(emptyData());
    expect(sanitizeData(null)).toEqual(emptyData());
  });
});

describe("migrateData", () => {
  it("brings older versions to the current shape", () => {
    expect(migrateData(sample(), 0)).toEqual(sample());
  });
});

describe("backups", () => {
  it("round-trips an export", () => {
    const text = JSON.stringify(createBackup(sample(), new Date("2026-10-03T08:00:00Z")));
    const result = parseBackup(text);
    expect(result).toEqual({ ok: true, data: sample() });
  });

  it("rejects invalid JSON", () => {
    expect(parseBackup("{oops")).toEqual({ ok: false, error: "Ce fichier n'est pas un JSON valide." });
  });

  it("rejects files that are not Routiner backups", () => {
    const result = parseBackup(JSON.stringify({ app: "other", version: 1, exportedAt: "", data: {} }));
    expect(result.ok).toBe(false);
  });

  it("points at the invalid field", () => {
    const backup = createBackup(sample());
    (backup.data.habits[0] as { kind: string }).kind = "maybe";
    const result = parseBackup(JSON.stringify(backup));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("data.habits.0.kind");
  });

  it("drops dangling references on import", () => {
    const backup = createBackup({ ...sample(), logs: { h1: {}, ghost: dayLogs({ "2026-10-01": "done" }) } });
    const result = parseBackup(JSON.stringify(backup));
    expect(result.ok && result.data.logs).toEqual({});
  });
});
