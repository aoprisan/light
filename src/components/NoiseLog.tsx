import { fmtAgo } from "../game/format";
import type { NoiseEvent } from "../game/types";

export default function NoiseLog({ log }: { log: NoiseEvent[] }) {
  if (log.length === 0) return null;
  return (
    <div className="noise-log">
      {log.slice(0, 3).map((e, i) => (
        <div key={`${e.t}-${i}`} style={{ opacity: 1 - i * 0.28 }}>
          {e.who === "you" ? "you beat the pots" : "a villager raised the din"} {fmtAgo(e.t)} (+{e.mins}m)
        </div>
      ))}
    </div>
  );
}
