import { useAppStore } from "@/lib/store";

let audio: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

/** Short synthesized tones, so no audio file has to be cached offline. */
function tone(notes: { freq: number; at: number; length: number }[], volume = 0.08) {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const { freq, at, length } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + at);
    gain.gain.linearRampToValueAtTime(volume, now + at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + at);
    osc.stop(now + at + length + 0.02);
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
}

type Kind = "tap" | "done" | "fail" | "celebrate";

const SOUNDS: Record<Kind, () => void> = {
  tap: () => tone([{ freq: 660, at: 0, length: 0.06 }], 0.04),
  done: () => tone([{ freq: 784, at: 0, length: 0.12 }, { freq: 1175, at: 0.08, length: 0.2 }]),
  fail: () => tone([{ freq: 392, at: 0, length: 0.14 }, { freq: 311, at: 0.1, length: 0.2 }], 0.06),
  celebrate: () =>
    tone([
      { freq: 523, at: 0, length: 0.15 },
      { freq: 659, at: 0.1, length: 0.15 },
      { freq: 784, at: 0.2, length: 0.15 },
      { freq: 1047, at: 0.3, length: 0.35 },
    ]),
};

const VIBRATIONS: Record<Kind, number | number[]> = {
  tap: 8,
  done: [12, 40, 18],
  fail: [30, 50, 30],
  celebrate: [20, 60, 20, 60, 40],
};

/** Plays the sound and/or vibration for an action, honouring the user's settings. */
export function feedback(kind: Kind) {
  const { sounds, vibrations } = useAppStore.getState().settings;
  if (sounds) SOUNDS[kind]();
  if (vibrations) vibrate(VIBRATIONS[kind]);
}
