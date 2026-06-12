import { useMemo } from "react";
import { GOLD_START } from "../game/constants";

interface Props {
  fracOfDay: number; // 0 = devoured, 1 = full day of light
  critical: boolean;
  holding: boolean;
  charge: number;
  momentum: number; // 1 = calm village, up to ~1.5 when roaring
}

const W = 340;
const H = 340;
const CX = 170;
const CY = 178;
const RING_R = 158;
const RING_C = 2 * Math.PI * RING_R;

/** Deterministic pseudo-random for the star field. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function SunScene({ fracOfDay, critical, holding, charge, momentum }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: rand(i) * W,
        y: rand(i + 100) * H,
        r: 0.5 + rand(i + 200) * 1.1,
        delay: rand(i + 300) * 4,
      })),
    [],
  );

  const sunR = 52 + 52 * fracOfDay;

  // The vârcolac: a wolf-shaped shadow creeping in from the upper right.
  // It closes the gap as light runs out, and recoils while you raise the din.
  const wolfR = sunR * 1.05;
  const angle = -0.6; // radians, up-right
  // your own hold shoves the wolf back; a roused village shoves it back harder
  const swell = (Math.max(1, momentum) - 1) * 64;
  const pushback = (holding ? Math.min(charge, 1) * 26 : 0) + swell;
  const dist = (sunR + wolfR) * (0.16 + 0.86 * fracOfDay) + pushback;
  const wx = CX + dist * Math.cos(angle);
  const wy = CY + dist * Math.sin(angle);

  // Eyes face the sun
  const toSun = { x: Math.cos(angle + Math.PI), y: Math.sin(angle + Math.PI) };
  const perp = { x: -toSun.y, y: toSun.x };
  const eyeBase = { x: wx + toSun.x * wolfR * 0.42, y: wy + toSun.y * wolfR * 0.42 };
  const eyes = [
    { x: eyeBase.x + perp.x * wolfR * 0.2, y: eyeBase.y + perp.y * wolfR * 0.2 },
    { x: eyeBase.x - perp.x * wolfR * 0.2, y: eyeBase.y - perp.y * wolfR * 0.2 },
  ];
  const menace = 1 - fracOfDay;

  // As the jaws close, the maw bares teeth facing the sun — the eclipse bite.
  const facing = Math.atan2(toSun.y, toSun.x);
  const teeth = menace > 0.45
    ? Array.from({ length: 7 }, (_, i) => {
        const spread = 0.9;
        const a = facing - spread / 2 + (spread * i) / 6;
        const rim = { x: wx + wolfR * Math.cos(a), y: wy + wolfR * Math.sin(a) };
        const out = { x: Math.cos(a), y: Math.sin(a) };
        const tan = { x: -out.y, y: out.x };
        const len = wolfR * 0.18 * Math.min(1, (menace - 0.45) / 0.4);
        const half = wolfR * 0.07;
        return `${rim.x + out.x * len},${rim.y + out.y * len} ` +
          `${rim.x + tan.x * half},${rim.y + tan.y * half} ` +
          `${rim.x - tan.x * half},${rim.y - tan.y * half}`;
      })
    : [];
  const glowBoost = (Math.max(1, momentum) - 1) * 0.6;

  const inGold = charge >= GOLD_START && charge <= 1.0;
  const overGold = charge > 1.0;

  return (
    <svg
      className="sun-scene"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="The sun, with the vârcolac's shadow closing in"
    >
      <defs>
        <radialGradient id="sun-fill" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="#ffcf5e" />
          <stop offset="100%" stopColor="#e8742c" />
        </radialGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f2b33d" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f2b33d" stopOpacity="0" />
        </radialGradient>
        <filter id="eye-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* stars surface as the light fails */}
      <g opacity={0.12 + 0.88 * menace}>
        {stars.map((s, i) => (
          <circle
            key={i}
            className="star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#cdd3ee"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </g>

      {/* sun glow + body (a new sun kindles on mount) */}
      <circle
        className="sun-kindle"
        cx={CX}
        cy={CY}
        r={sunR * 2}
        fill="url(#sun-glow)"
        opacity={Math.min(1, 0.35 + 0.45 * fracOfDay + glowBoost)}
      />
      <g className={critical ? "sun-body guttering" : "sun-body"} style={{ transformOrigin: `${CX}px ${CY}px` }}>
        <g className="sun-rays" style={{ transformOrigin: `${CX}px ${CY}px` }} opacity={0.25 + 0.55 * fracOfDay}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r1 = sunR * 1.16;
            const r2 = sunR * (1.34 + 0.1 * (i % 2));
            return (
              <line
                key={i}
                x1={CX + r1 * Math.cos(a)}
                y1={CY + r1 * Math.sin(a)}
                x2={CX + r2 * Math.cos(a)}
                y2={CY + r2 * Math.sin(a)}
                stroke="#f2b33d"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}
        </g>
        <circle
          cx={CX}
          cy={CY}
          r={sunR * (holding ? 1 + 0.04 * Math.min(charge, 1) : 1)}
          fill="url(#sun-fill)"
        />
      </g>

      {/* the vârcolac */}
      <g className="varcolac">
        {/* ears */}
        <polygon
          points={`${wx - 0.62 * wolfR},${wy - 0.68 * wolfR} ${wx - 0.12 * wolfR},${wy - 0.86 * wolfR} ${wx - 0.46 * wolfR},${wy - 1.32 * wolfR}`}
          fill="#0b0e1a"
        />
        <polygon
          points={`${wx + 0.06 * wolfR},${wy - 0.88 * wolfR} ${wx + 0.58 * wolfR},${wy - 0.64 * wolfR} ${wx + 0.42 * wolfR},${wy - 1.26 * wolfR}`}
          fill="#0b0e1a"
        />
        {/* maw */}
        <circle cx={wx} cy={wy} r={wolfR} fill="#0b0e1a" />
        <circle cx={wx} cy={wy} r={wolfR} fill="none" stroke="#1c2240" strokeWidth={1.5} opacity={0.8} />
        {/* teeth — bared as the jaws close */}
        {teeth.map((pts, i) => (
          <polygon key={i} points={pts} fill="#e7e3d4" opacity={0.55 + 0.4 * menace} />
        ))}
        {/* eyes */}
        {eyes.map((e, i) => (
          <g key={i} opacity={0.25 + 0.75 * menace}>
            <circle cx={e.x} cy={e.y} r={4.5} fill="#ff3b30" filter="url(#eye-glow)" />
            <circle cx={e.x} cy={e.y} r={1.8} fill="#ffd9d6" />
          </g>
        ))}
      </g>

      {/* charge ring: release inside the golden arc */}
      <g opacity={holding ? 1 : 0.15} style={{ transition: "opacity .3s" }}>
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#232a45" strokeWidth={3} />
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke="#f2b33d"
          strokeWidth={3}
          opacity={0.5}
          strokeDasharray={`${RING_C * (1 - GOLD_START)} ${RING_C}`}
          strokeDashoffset={-RING_C * GOLD_START}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke={overGold ? "#b3402e" : inGold ? "#f2b33d" : "#e8742c"}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${RING_C * Math.min(charge, 1.12)} ${RING_C}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ filter: inGold ? "drop-shadow(0 0 6px #f2b33d)" : "none" }}
        />
      </g>
    </svg>
  );
}
