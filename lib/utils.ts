import { createCn } from "cn/config";

/**
 * Class merger aware of the Routiner theme tokens, so e.g. `text-chip` (a font
 * size) isn't mistaken for a colour and dropped when merged with `text-ink`.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["chip"] }],
      "bg-image": [{ "bg-gradient": ["banner", "hero", "fab"] }],
      rounded: [{ rounded: ["tile", "field", "card", "sheet"] }],
      "rounded-t": [{ "rounded-t": ["tile", "field", "card", "sheet"] }],
      "rounded-b": [{ "rounded-b": ["tile", "field", "card", "sheet"] }],
      shadow: [{ shadow: ["card"] }],
    },
  },
});
