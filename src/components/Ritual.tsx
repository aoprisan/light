import { GOLD_START } from "../game/constants";
import { fmtDuration } from "../game/format";
import type { NoiseResult } from "../game/types";

interface Props {
  canNoise: boolean;
  holding: boolean;
  charge: number;
  cooldownLeft: number;
  result: NoiseResult | null;
  onBegin: () => void;
  onEnd: () => void;
}

const RESULT_LINES: Record<NoiseResult["quality"], (mins: number) => string> = {
  perfect: (m) => `The vârcolac recoils, ears flat. +${m} minutes of light.`,
  steady: (m) => `The beast flinches from the clatter. +${m} minutes of light.`,
  fizzled: (m) => `The din collapsed — the beast barely stirred. +${m} minutes.`,
};

export default function Ritual({ canNoise, holding, charge, cooldownLeft, result, onBegin, onEnd }: Props) {
  const inGold = charge >= GOLD_START && charge <= 1.0;
  const overGold = charge > 1.0;

  return (
    <div className="ritual">
      {result && (
        <div className={`result result-${result.quality}`}>
          {RESULT_LINES[result.quality](result.mins)}
        </div>
      )}
      {canNoise ? (
        <>
          <button
            className={`din-btn ${holding ? "is-holding" : ""} ${inGold ? "in-gold" : ""}`}
            style={
              holding
                ? { boxShadow: `0 0 ${24 * Math.min(charge, 1)}px ${inGold ? "#f2b33d88" : "#e8742c66"}` }
                : undefined
            }
            onPointerDown={(e) => {
              e.preventDefault();
              onBegin();
            }}
            onPointerUp={onEnd}
            onPointerLeave={() => holding && onEnd()}
            onPointerCancel={() => holding && onEnd()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {holding ? (inGold ? "LET IT RING!" : overGold ? "TOO LONG —" : "LOUDER…") : "BEAT THE POTS"}
          </button>
          <div className="hint">hold to raise the din — release inside the golden arc</div>
        </>
      ) : (
        <div className="cooldown">
          your arms ache and your voice is hoarse. You may raise the din again in{" "}
          <span className="mono">{fmtDuration(Math.max(cooldownLeft, 0), false)}</span>.
          <br />
          Until then — wake another villager.
        </div>
      )}
    </div>
  );
}
