// Builds lib/emoji-index.json: every emoji up to Unicode 13 (widely supported),
// with its French CLDR name and keywords from emojibase-data, for icon search.
// Run with `pnpm emoji-index` after upgrading emojibase-data or editing lib/emoji.ts groups.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = require("emojibase-data/fr/data.json");

const MAX_VERSION = 13;
// emojibase groups: 2 = components (skin tones, hair), 9 = flags (not rendered on Windows).
const EXCLUDED_GROUPS = new Set([2, 9]);

// Keep in sync with normalizeQuery() in lib/emoji.ts (a test checks the index against it).
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’'`\-_:,.()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Catalogue group labels become extra keywords ("sport", "maison", …).
const source = fs.readFileSync(path.join(root, "lib/emoji.ts"), "utf8");
const groupLabels = new Map();
for (const [, label, list] of source.matchAll(/group\("[^"]+", "([^"]+)", "([^"]+)"\)/g)) {
  for (const emoji of list.split(" ")) groupLabels.set(emoji, label);
}

// emojibase appends U+FE0F even to emoji that are already shown as emoji ("🏊️"):
// match ignoring it, keep the catalogue's spelling, and drop it where it is redundant.
const bare = (emoji) => emoji.replace(/️/g, "");
const catalogue = new Map([...groupLabels.keys()].map((emoji) => [bare(emoji), emoji]));
const canonical = (emoji) =>
  catalogue.get(bare(emoji)) ?? (/^\p{Emoji_Presentation}️$/u.test(emoji) ? bare(emoji) : emoji);

const index = [];
for (const e of data) {
  if (e.group === undefined || EXCLUDED_GROUPS.has(e.group) || e.version > MAX_VERSION) continue;
  const emoji = canonical(e.emoji);
  if (emoji.length > 16) continue; // habit icons are capped at 16 UTF-16 units (lib/schema.ts)
  const words = [e.label, ...(e.tags ?? []), groupLabels.get(emoji) ?? ""];
  const keywords = [...new Set(normalize(words.join(" ")).split(" "))].join(" ");
  index.push([emoji, keywords]);
}

const missing = [...groupLabels.keys()].filter((emoji) => !index.some(([e]) => e === emoji));
if (missing.length) {
  console.error("Catalogue emoji missing from the index:", missing.join(" "));
  process.exit(1);
}

const out = path.join(root, "lib/emoji-index.json");
fs.writeFileSync(out, JSON.stringify(index));
console.log(`${index.length} emoji written to lib/emoji-index.json (${(fs.statSync(out).size / 1024).toFixed(0)} KiB)`);
