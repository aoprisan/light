import { fmtDuration, romanize } from "../game/format";
import type { DevouredSun } from "../game/types";

export default function Graveyard({ suns }: { suns: DevouredSun[] }) {
  if (suns.length === 0) return null;
  return (
    <section className="graveyard">
      <h2 className="eyebrow">Suns That Were Devoured</h2>
      {suns.slice(0, 6).map((g) => (
        <div key={g.epoch} className="grave-row">
          Sun {romanize(g.epoch)} — shone {fmtDuration(g.died - g.born, false)}, the din raised {g.noises}{" "}
          {g.noises === 1 ? "time" : "times"}
        </div>
      ))}
    </section>
  );
}
