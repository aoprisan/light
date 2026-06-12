import { useMemo } from "react";
import { GOLD_START } from "../game/constants";

interface Props {
  fracOfDay: number; // 0 = devoured, 1 = full day of light
  critical: boolean;
  holding: boolean;
  charge: number;
  momentum: number; // 1 = calm village, up to ~1.5 when roaring
}

const W = 360;
const H = 360;
const CX = 180;
const CY = 184;
const RING_R = 166;
const RING_C = 2 * Math.PI * RING_R;

/** Deterministic pseudo-random for the star field and embers. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function SunScene({ fracOfDay, critical, holding, charge, momentum }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: rand(i) * W,
        y: rand(i + 100) * H,
        r: 0.5 + rand(i + 200) * 1.2,
        delay: rand(i + 300) * 4,
      })),
    [],
  );

  // embers drifting up off the sun — life on the disc, no behavioural change
  const embers = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        dx: (rand(i + 11) - 0.5) * 120,
        r: 1 + rand(i + 21) * 1.6,
        dur: 3 + rand(i + 31) * 3,
        delay: rand(i + 41) * 5,
      })),
    [],
  );

  const sunR = 52 + 52 * fracOfDay;

  // The vârcolac: a wolf's head of shadow lunging in from the upper right.
  // It closes the gap as light runs out, and recoils while you raise the din.
  const wolfR = sunR * 1.08;
  const angle = -0.62; // radians, up-right
  // your own hold shoves the wolf back; a roused village shoves it back harder
  const swell = (Math.max(1, momentum) - 1) * 64;
  const pushback = (holding ? Math.min(charge, 1) * 26 : 0) + swell;
  const dist = (sunR + wolfR) * (0.15 + 0.86 * fracOfDay) + pushback;
  const wx = CX + dist * Math.cos(angle);
  const wy = CY + dist * Math.sin(angle);

  // Orientation: the muzzle points back toward the sun.
  const toSun = { x: Math.cos(angle + Math.PI), y: Math.sin(angle + Math.PI) };
  const perp = { x: -toSun.y, y: toSun.x };
  const menace = 1 - fracOfDay;
  const facing = Math.atan2(toSun.y, toSun.x);

  // Build the wolf head as a path in its own local frame, then place/rotate it.
  // Local frame: +x points toward the sun (the snout direction), origin at head centre.
  const r = wolfR;
  const headPath = useMemo(() => {
    const snoutLen = r * 1.5;
    return [
      `M ${snoutLen} 0`, // snout tip (reaches toward the sun)
      `Q ${r * 0.78} ${-r * 0.34}, ${r * 0.34} ${-r * 0.42}`, // top of muzzle
      `Q ${r * 0.18} ${-r * 0.92}, ${r * 0.46} ${-r * 1.18}`, // near ear tip
      `Q ${r * 0.04} ${-r * 0.86}, ${-r * 0.2} ${-r * 0.78}`, // back of near ear
      `Q ${-r * 0.5} ${-r * 0.84}, ${-r * 0.86} ${-r * 0.5}`, // far ear / skull
      `Q ${-r * 1.18} 0, ${-r * 0.86} ${r * 0.5}`, // back of skull / nape
      `Q ${-r * 0.4} ${r * 0.92}, ${r * 0.16} ${r * 0.66}`, // jaw underside
      `Q ${r * 0.6} ${r * 0.52}, ${r * 0.86} ${r * 0.3}`, // lower muzzle
      `Q ${r * 1.1} ${r * 0.16}, ${snoutLen} 0`, // back to snout tip
      "Z",
    ].join(" ");
  }, [r]);

  // teeth ring along the closing maw, bared as the jaws near the sun (the eclipse bite)
  const teeth =
    menace > 0.42
      ? Array.from({ length: 8 }, (_, i) => {
          const spread = 1.05;
          const a = facing - spread / 2 + (spread * i) / 7;
          const rim = { x: wx + wolfR * 0.96 * Math.cos(a), y: wy + wolfR * 0.96 * Math.sin(a) };
          const out = { x: Math.cos(a), y: Math.sin(a) };
          const tan = { x: -out.y, y: out.x };
          const len = wolfR * 0.2 * Math.min(1, (menace - 0.42) / 0.4);
          const half = wolfR * 0.065;
          return (
            `${rim.x + out.x * len},${rim.y + out.y * len} ` +
            `${rim.x + tan.x * half},${rim.y + tan.y * half} ` +
            `${rim.x - tan.x * half},${rim.y - tan.y * half}`
          );
        })
      : [];

  // eyes sit on the muzzle, glaring at the sun
  const eyeBase = { x: wx + toSun.x * wolfR * 0.5, y: wy + toSun.y * wolfR * 0.5 };
  const eyes = [
    { x: eyeBase.x + perp.x * wolfR * 0.22, y: eyeBase.y + perp.y * wolfR * 0.22 },
    { x: eyeBase.x - perp.x * wolfR * 0.22, y: eyeBase.y - perp.y * wolfR * 0.22 },
  ];

  const glowBoost = (Math.max(1, momentum) - 1) * 0.6;
  const headDeg = (facing * 180) / Math.PI;

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
        <radialGradient id="sun-fill" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#fff6d4" />
          <stop offset="38%" stopColor="#ffd66a" />
          <stop offset="74%" stopColor="#f29b34" />
          <stop offset="100%" stopColor="#d2581d" />
        </radialGradient>
        <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffefb" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4be4f" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#ea7a2e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ea7a2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wolf-fill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#0b0e1a" />
          <stop offset="100%" stopColor="#04050c" />
        </radialGradient>
        <filter id="eye-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="sun-tex" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={8 + 10 * fracOfDay} />
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

      {/* outer halo */}
      <circle
        className="sun-kindle"
        cx={CX}
        cy={CY}
        r={sunR * 2.1}
        fill="url(#sun-glow)"
        opacity={Math.min(1, 0.35 + 0.45 * fracOfDay + glowBoost)}
      />

      <g className={critical ? "sun-body guttering" : "sun-body"} style={{ transformOrigin: `${CX}px ${CY}px` }}>
        {/* corona rays */}
        <g className="sun-rays" style={{ transformOrigin: `${CX}px ${CY}px` }} opacity={0.22 + 0.55 * fracOfDay}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = sunR * 1.14;
            const r2 = sunR * (1.32 + 0.12 * (i % 2));
            return (
              <line
                key={i}
                x1={CX + r1 * Math.cos(a)}
                y1={CY + r1 * Math.sin(a)}
                x2={CX + r2 * Math.cos(a)}
                y2={CY + r2 * Math.sin(a)}
                stroke="#f4be4f"
                strokeWidth={i % 2 ? 2 : 3.4}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* the disc — a living, displaced ember surface */}
        <g style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <circle
            cx={CX}
            cy={CY}
            r={sunR * (holding ? 1 + 0.04 * Math.min(charge, 1) : 1)}
            fill="url(#sun-fill)"
            filter="url(#sun-tex)"
          />
          {/* bright molten core */}
          <circle cx={CX} cy={CY - sunR * 0.08} r={sunR * 0.74} fill="url(#sun-core)" />
        </g>

        {/* embers lifting off the disc */}
        <g opacity={0.5 + 0.4 * fracOfDay}>
          {embers.map((e, i) => (
            <circle
              key={i}
              className="ember"
              cx={CX + e.dx}
              cy={CY - sunR * 0.4}
              r={e.r}
              fill="#ffce6e"
              style={{ animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s` }}
            />
          ))}
        </g>
      </g>

      {/* the vârcolac — a wolf's head of shadow, snout reaching for the sun */}
      <g className="varcolac" transform={`translate(${wx} ${wy}) rotate(${headDeg})`}>
        <path d={headPath} fill="url(#wolf-fill)" stroke="#1c2240" strokeWidth={1.5} strokeOpacity={0.7} />
      </g>

      {/* teeth — bared as the jaws close (drawn in world space along the rim) */}
      {teeth.map((pts, i) => (
        <polygon key={i} points={pts} fill="#efeada" opacity={0.5 + 0.45 * menace} />
      ))}

      {/* eyes glaring at the sun */}
      {eyes.map((e, i) => (
        <g key={i} opacity={0.2 + 0.8 * menace}>
          <circle cx={e.x} cy={e.y} r={5} fill="#ff3b30" filter="url(#eye-glow)" />
          <circle cx={e.x} cy={e.y} r={1.9} fill="#ffe1de" />
        </g>
      ))}

      {/* charge ring: release inside the golden arc */}
      <g opacity={holding ? 1 : 0.14} style={{ transition: "opacity .3s" }}>
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#232a45" strokeWidth={3} />
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke="#f4be4f"
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
          stroke={overGold ? "#c0432e" : inGold ? "#f4be4f" : "#ea7a2e"}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${RING_C * Math.min(charge, 1.12)} ${RING_C}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ filter: inGold ? "drop-shadow(0 0 7px #f4be4f)" : "none" }}
        />
      </g>
    </svg>
  );
}
