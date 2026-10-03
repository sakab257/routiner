/**
 * Icon catalogue for habits and challenges. Only emoji up to Unicode 13 are
 * listed, so they render on current Windows, Android and iOS without tofu.
 */
export interface EmojiGroup {
  id: string;
  label: string;
  emojis: readonly string[];
}

const group = (id: string, label: string, list: string) => ({ id, label, emojis: list.split(" ") });

export const EMOJI_GROUPS: readonly EmojiGroup[] = [
  group("health", "Santé", "💧 🥛 💊 🩺 🦷 🪥 😴 🛌 🧴 🩹 ❤️ 🫀 🫁 🧠 👀 🌡️ 🛀 🚿 🧼 ⚖️ 🍵 ☀️ 🌙 💉"),
  group("sport", "Sport", "🏃 🚶 🚴 🏊 🤸 🏋️ 🧗 ⛹️ 🏀 ⚽ 🎾 🏓 🏸 🥊 🥋 🎿 🛹 🏄 🚣 🥾 ⛰️ 🤾 🧎 🦵"),
  group("food", "Alimentation", "🥗 🍎 🍌 🥦 🥕 🍓 🫐 🥑 🍳 🥣 🍲 🥪 🍣 🥜 🥤 ☕ 🍷 🍺 🍬 🍫 🍟 🍕 🍔 🧁 🍰"),
  group("wellbeing", "Bien-être", "🧘 🙏 😊 😌 😁 🥰 🤗 💆 🛁 🕯️ 🌿 🌸 🎧 📵 💤 ✨ 🌈 💭 ✍️ 📓 🌞 🍃 🤍 🫂"),
  group("study", "Études & travail", "📖 📚 ✏️ 📝 🎓 💻 ⌨️ 🖥️ 📊 📈 🗂️ 📅 ⏰ ⏱️ 🔬 🧪 🧮 🗣️ 🌍 💼 📌 📧 🧑‍💻 🔤"),
  group("home", "Maison", "🧹 🧺 🧽 🪴 🛏️ 🍽️ 🗑️ ♻️ 🔧 🔨 🪛 🧰 🚪 🪟 🧾 🐶 🐱 🐟 🌱 🪣 💡 🔑 🧸 👕"),
  group("hobbies", "Loisirs", "🎸 🎹 🥁 🎤 🎨 🖌️ 📷 🎬 🎮 🧩 ♟️ 🎲 🧶 🧵 📻 🎭 🎻 🎺 🪁 🛼 🎞️ 🃏 🪕 🎳"),
  group("social", "Social", "👨‍👩‍👧 👪 🧑‍🤝‍🧑 👫 💬 📞 ✉️ 💌 🤝 👋 🎁 🎉 🎂 💐 🙌 🥂 💞 😘 🤙 👂"),
  group("money", "Finances", "💰 💶 💳 🏦 🐷 📉 🪙 💸 🛍️ 🏧 📒 💹 🏠 🔒"),
  group("outdoors", "Nature & sorties", "🌳 🌲 🌻 🌷 🌵 🍂 🌊 🏞️ 🏕️ 🏖️ 🌄 ⛅ 🌧️ ❄️ 🦋 🐝 🐦 🐴 🚗 🚌 🚆 ✈️ 🧭 🗺️"),
  group("quit", "À arrêter", "🚬 🚭 📱 📺 🎰 🥃 🍸 🍭 🧂 🥓 😤 💅 🛋️ 🙅 🔕 🤬"),
  group("symbols", "Symboles", "⭐ 🌟 🔥 💯 ✅ 🎯 🏆 🥇 🏅 🎖️ 💪 🚀 ⚡ 💎 ⏳ 🔔 📍 🧿 ♾️ 🪄 🍀 🧲 🎈 🔆"),
];

export const ALL_EMOJIS: readonly string[] = EMOJI_GROUPS.flatMap((g) => g.emojis);

/** [emoji, normalized French keywords] — see scripts/generate-emoji-index.mjs. */
export type EmojiIndex = readonly (readonly [string, string])[];

/** Lowercase, accent-free, punctuation-free text, as stored in the emoji index. */
export function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’'`\-_:,.()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CATALOGUE = new Set(ALL_EMOJIS);

/**
 * Emoji matching every word of the query (whole keyword > keyword prefix > substring),
 * catalogue icons first. A query containing an emoji returns that emoji.
 */
export function searchEmojis(index: EmojiIndex, query: string, limit = 63): string[] {
  const typed = firstEmoji(query);
  if (typed) return [typed];
  const words = normalizeQuery(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  const hits: { emoji: string; score: number; order: number }[] = [];
  index.forEach(([emoji, keywords], order) => {
    const tokens = keywords.split(" ");
    let score = CATALOGUE.has(emoji) ? 1 : 0;
    for (const word of words) {
      if (tokens.includes(word)) score += 4;
      else if (tokens.some((t) => t.startsWith(word))) score += 2;
      else if (keywords.includes(word)) score += 1;
      else return;
    }
    hits.push({ emoji, score, order });
  });
  return hits
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((h) => h.emoji);
}

/** First grapheme of a string if it contains a pictographic character (keeps ZWJ sequences like 🧘‍♀️). */
export function firstEmoji(text: string): string | null {
  const segments = new Intl.Segmenter("fr", { granularity: "grapheme" }).segment(text.trim());
  for (const { segment } of segments) {
    if (/\p{Extended_Pictographic}/u.test(segment)) return segment;
  }
  return null;
}
