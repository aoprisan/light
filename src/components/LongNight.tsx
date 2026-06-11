import { useMemo } from "react";
import { fmtDuration, romanize } from "../game/format";
import type { SunState } from "../game/types";

interface Props {
  sun: SunState;
  onForge: () => void;
}

export default function LongNight({ sun, onForge }: Props) {
  // the pack, sated, watching from the dark
  const eyes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: 8 + ((i * 37 + 13) % 84),
        y: 10 + ((i * 53 + 29) % 70),
        s: 0.6 + ((i * 7) % 5) / 8,
        delay: (i * 0.7) % 3,
      })),
    [],
  );

  return (
    <div className="long-night">
      <div className="pack" aria-hidden="true">
        {eyes.map((e, i) => (
          <span
            key={i}
            className="pack-eyes"
            style={{ left: `${e.x}%`, top: `${e.y}%`, transform: `scale(${e.s})`, animationDelay: `${e.delay}s` }}
          >
            <i /> <i />
          </span>
        ))}
      </div>
      <h2 className="night-title">Sun {romanize(sun.epoch)} has been devoured.</h2>
      <p className="night-body">
        It shone for {fmtDuration(sun.deadline - sun.born, false)} and the din was raised {sun.noises}{" "}
        {sun.noises === 1 ? "time" : "times"}. The village fell silent, and the vârcolaci ate their fill — as they
        do, when no one comes.
      </p>
      <button className="forge-btn" onClick={onForge}>
        FORGE SUN {romanize(sun.epoch + 1)}
      </button>
      <div className="hint">hammer a new sun into the sky — the pack will return</div>
    </div>
  );
}
