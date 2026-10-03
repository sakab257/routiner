import { describe, expect, it } from "vitest";
import { CHALLENGE_EMOJIS, TEMPLATES } from "@/lib/catalog";
import { ALL_EMOJIS, EMOJI_GROUPS, firstEmoji, normalizeQuery, searchEmojis, type EmojiIndex } from "@/lib/emoji";
import rawIndex from "@/lib/emoji-index.json";
import { habitSchema } from "@/lib/schema";

describe("emoji catalogue", () => {
  it("lists each emoji once", () => {
    const dupes = ALL_EMOJIS.filter((e, i) => ALL_EMOJIS.indexOf(e) !== i);
    expect(dupes).toEqual([]);
  });

  it("only contains single, valid habit icons", () => {
    for (const emoji of ALL_EMOJIS) {
      expect(firstEmoji(emoji), emoji).toBe(emoji);
      expect(habitSchema.shape.emoji.safeParse(emoji).success, emoji).toBe(true);
    }
  });

  it("offers a few hundred icons in non-empty groups", () => {
    expect(ALL_EMOJIS.length).toBeGreaterThan(250);
    for (const group of EMOJI_GROUPS) expect(group.emojis.length, group.id).toBeGreaterThan(10);
  });

  it("covers the icons used by templates and challenge suggestions", () => {
    const missing = [...TEMPLATES.map((t) => t.emoji), ...CHALLENGE_EMOJIS].filter((e) => !ALL_EMOJIS.includes(e));
    expect(missing).toEqual([]);
  });
});

describe("firstEmoji", () => {
  it("extracts the first emoji, keeping ZWJ sequences whole", () => {
    expect(firstEmoji("  🧘‍♀️ zen")).toBe("🧘‍♀️");
    expect(firstEmoji("abc 🔥")).toBe("🔥");
    expect(firstEmoji("abc")).toBeNull();
  });
});

describe("emoji search", () => {
  const index = rawIndex as unknown as EmojiIndex;

  it("is built with the same normalization as the queries", () => {
    for (const [emoji, keywords] of index) expect(normalizeQuery(keywords), emoji).toBe(keywords);
  });

  it("indexes every catalogue icon, and only valid habit icons", () => {
    const indexed = new Set(index.map(([e]) => e));
    expect(ALL_EMOJIS.filter((e) => !indexed.has(e))).toEqual([]);
    expect(index.filter(([e]) => !habitSchema.shape.emoji.safeParse(e).success)).toEqual([]);
  });

  it("finds icons by French keyword, ignoring accents and case", () => {
    expect(searchEmojis(index, "feu")[0]).toBe("🔥");
    expect(searchEmojis(index, "EAU")).toContain("💧");
    expect(searchEmojis(index, "lecture")).toContain("📖");
    expect(searchEmojis(index, "meditation")).toContain("🧘");
    expect(searchEmojis(index, "coeur")).toContain("❤️");
    expect(searchEmojis(index, "velo")).toContain("🚴");
  });

  it("matches word prefixes and requires every word", () => {
    expect(searchEmojis(index, "natat")).toContain("🏊");
    expect(searchEmojis(index, "ballon foot")).toContain("⚽");
    expect(searchEmojis(index, "ballon xyzw")).toEqual([]);
  });

  it("reaches emoji beyond the catalogue", () => {
    const results = searchEmojis(index, "girafe");
    expect(results).toContain("🦒");
    expect(ALL_EMOJIS).not.toContain("🦒");
  });

  it("returns a typed emoji as is", () => {
    expect(searchEmojis(index, "🦄")).toEqual(["🦄"]);
    expect(searchEmojis(index, "   ")).toEqual([]);
  });
});
