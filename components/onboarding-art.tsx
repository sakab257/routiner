import { Check } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Emoji } from "@/components/kit";

/** Design pixels (390px-wide artboard) → container-relative units, so the art scales with the screen. */
const u = (px: number) => `${((px / 390) * 100).toFixed(3)}cqw`;

function Box({ x, y, w, h, style, className, children }: {
  x?: number;
  y: number;
  w?: number;
  h?: number;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`absolute ${className ?? ""}`}
      style={{ left: x !== undefined ? u(x) : undefined, top: u(y), width: w ? u(w) : undefined, height: h ? u(h) : undefined, ...style }}
    >
      {children}
    </div>
  );
}

function Bubble({ x, y, size, emoji }: { x: number; y: number; size: number; emoji: string }) {
  return (
    <Box
      x={x}
      y={y}
      w={size}
      h={size}
      className="flex items-center justify-center rounded-full border-white/55 bg-white/18"
      style={{ borderWidth: u(3), fontSize: u(size * 0.45) }}
    >
      <Emoji>{emoji}</Emoji>
    </Box>
  );
}

function Pill({ x, y, w, label, checked }: { x: number; y: number; w: number; label: string; checked: boolean }) {
  return (
    <Box
      x={x}
      y={y}
      w={w}
      h={54}
      className="flex items-center rounded-full bg-white text-[#040415] shadow-lg shadow-black/10"
      style={{ gap: u(10), paddingInline: u(12) }}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: u(30),
          height: u(30),
          background: checked ? "#3843FF" : "transparent",
          border: checked ? "none" : `${u(2)} solid #AFB4FF`,
        }}
      >
        {checked && <Check className="text-white" style={{ width: u(18), height: u(18) }} strokeWidth={3} />}
      </span>
      <span className="font-semibold" style={{ fontSize: u(14) }}>
        {label}
      </span>
    </Box>
  );
}

function Habits() {
  return (
    <>
      <Bubble x={236} y={64} size={76} emoji="💧" />
      <Pill x={52} y={118} w={214} label="Boire 2 L d'eau" checked />
      <Bubble x={28} y={204} size={88} emoji="🏃" />
      <Pill x={132} y={228} w={206} label="Courir 20 min" checked />
      <Bubble x={226} y={312} size={100} emoji="📖" />
      <Pill x={40} y={344} w={196} label="Lire 20 pages" checked={false} />
    </>
  );
}

function ChallengeTile({ y, emoji, tint, title, sub, chip, chipStyle, children }: {
  y: number;
  emoji: string;
  tint: string;
  title: string;
  sub: string;
  chip: string;
  chipStyle: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Box x={24} y={y} w={342} className="flex flex-col bg-white text-[#040415] shadow-lg shadow-black/10" style={{ borderRadius: u(20), padding: u(16), gap: u(12) }}>
      <div className="flex items-center" style={{ gap: u(12) }}>
        <span className="flex items-center justify-center rounded-full" style={{ width: u(40), height: u(40), background: tint, fontSize: u(20) }}>
          <Emoji>{emoji}</Emoji>
        </span>
        <div className="flex flex-1 flex-col">
          <span className="font-semibold" style={{ fontSize: u(16) }}>{title}</span>
          <span className="text-[#686873]" style={{ fontSize: u(12) }}>{sub}</span>
        </div>
        <span className="font-bold" style={{ fontSize: u(10), letterSpacing: u(0.5), padding: `${u(4)} ${u(8)}`, borderRadius: u(8), ...chipStyle }}>
          {chip}
        </span>
      </div>
      {children}
    </Box>
  );
}

function Challenges() {
  return (
    <>
      <Box x={24} y={68} className="font-semibold" style={{ fontSize: u(14) }}>
        Défis
      </Box>
      <ChallengeTile y={98} emoji="📚" tint="#EBECFF" title="Lire 30 jours" sub="Jour 12 sur 30" chip="18 J RESTANTS" chipStyle={{ background: "#FFF1DE", color: "#A35500" }}>
        <div className="overflow-hidden rounded-full bg-[#EAECF0]" style={{ height: u(6) }}>
          <div className="h-full w-[40%] rounded-full bg-[#3843FF]" />
        </div>
      </ChallengeTile>
      <ChallengeTile y={216} emoji="🧘" tint="#E6F8F6" title="7 jours zen" sub="Jour 5 sur 7" chip="EN BONNE VOIE" chipStyle={{ background: "#E3F3FF", color: "#0B6BB8" }}>
        <div className="grid grid-cols-7" style={{ gap: u(6) }}>
          {[1, 1, 1, 1, 1, 2, 0].map((k, i) => (
            <span
              key={i}
              style={{
                height: u(26),
                borderRadius: u(8),
                background: k === 1 ? "#3843FF" : k === 0 ? "#EAECF0" : "transparent",
                border: k === 2 ? `${u(2)} solid #3843FF` : undefined,
              }}
            />
          ))}
        </div>
      </ChallengeTile>
    </>
  );
}

function Stats() {
  const bars = [
    [55, "#EBECFF"],
    [68, "#EBECFF"],
    [45, "#EBECFF"],
    [86, "#AFB4FF"],
    [72, "#EBECFF"],
    [92, "#3843FF"],
    [30, "#EAECF0"],
  ] as const;
  return (
    <>
      <Box x={36} y={76} w={318} className="flex flex-col bg-white text-[#040415] shadow-lg shadow-black/10" style={{ borderRadius: u(24), padding: u(18), gap: u(14) }}>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[#686873]" style={{ fontSize: u(12) }}>Taux de réussite</span>
            <span className="font-bold" style={{ fontSize: u(28) }}>78 %</span>
          </div>
          <span className="bg-[#E3F3FF] font-bold text-[#0B6BB8]" style={{ fontSize: u(10), padding: `${u(4)} ${u(8)}`, borderRadius: u(8) }}>
            +6 % CETTE SEMAINE
          </span>
        </div>
        <div className="flex items-end" style={{ gap: u(10), height: u(96) }}>
          {bars.map(([h, c], i) => (
            <span key={i} className="flex-1" style={{ height: `${h}%`, background: c, borderRadius: u(8) }} />
          ))}
        </div>
      </Box>
      <Box x={186} y={300} className="flex -rotate-4 flex-col bg-white text-[#040415] shadow-lg shadow-black/10" style={{ borderRadius: u(20), padding: `${u(14)} ${u(18)}`, gap: u(2) }}>
        <span className="font-bold text-[#686873]" style={{ fontSize: u(10), letterSpacing: u(1) }}>MEILLEURE SÉRIE</span>
        <span className="font-bold" style={{ fontSize: u(24) }}>22 jours <Emoji>🔥</Emoji></span>
      </Box>
      <Box x={40} y={328} className="flex rotate-3 items-center bg-white text-[#040415] shadow-lg shadow-black/10" style={{ borderRadius: u(20), padding: `${u(12)} ${u(16)}`, gap: u(10) }}>
        <span style={{ fontSize: u(28) }}>
          <Emoji>😄</Emoji>
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-[#686873]" style={{ fontSize: u(10), letterSpacing: u(1) }}>HUMEUR</span>
          <span className="font-semibold" style={{ fontSize: u(16) }}>Très bien</span>
        </div>
      </Box>
    </>
  );
}

/** Illustrations of the three onboarding slides, recreated from the design. */
export function OnboardingArt({ index }: { index: 0 | 1 | 2 }) {
  return (
    <div aria-hidden className="relative mx-auto w-[min(100%,calc((100dvh-380px)*0.886))] max-w-97.5 [container-type:inline-size]">
      <div className="relative w-full" style={{ height: u(440) }}>
        {index === 0 ? <Habits /> : index === 1 ? <Challenges /> : <Stats />}
      </div>
    </div>
  );
}
