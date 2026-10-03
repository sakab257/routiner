import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps the custom chip font size next to a text colour", () => {
    expect(cn("text-chip", "text-ink")).toBe("text-chip text-ink");
  });

  it("resolves conflicts between design radii and arbitrary ones", () => {
    expect(cn("rounded-[28px]", "rounded-card")).toBe("rounded-card");
    expect(cn("rounded-t-xl", "rounded-t-sheet")).toBe("rounded-t-sheet");
  });
});
