import type { Momentum } from "../game/types";

const COPY: Record<Momentum["tier"], { label: string; note: string }> = {
  calm: { label: "the village is quiet", note: "" },
  roused: { label: "the village is roused", note: "scares count for more — pile on" },
  roaring: { label: "the village ROARS", note: "the pack is reeling — keep it up" },
};

export default function MomentumMeter({ momentum }: { momentum: Momentum }) {
  const { label, note } = COPY[momentum.tier];
  return (
    <div className={`momentum momentum-${momentum.tier}`} aria-live="polite">
      <div className="momentum-bar" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < momentum.recent ? "lit" : ""} />
        ))}
      </div>
      <div className="momentum-label">
        {label}
        {momentum.mult > 1 && <span className="momentum-mult"> ×{momentum.mult}</span>}
      </div>
      {note && <div className="momentum-note">{note}</div>}
    </div>
  );
}
