import { fmtDuration } from "../game/format";

interface Props {
  remaining: number;
  critical: boolean;
}

export default function Countdown({ remaining, critical }: Props) {
  return (
    <div className="countdown">
      <div className={`countdown-time ${critical ? "is-critical" : ""}`}>{fmtDuration(remaining)}</div>
      <div className={`countdown-sub ${critical ? "is-critical" : ""}`}>
        {critical ? "the jaws are closing — wake the whole village" : "of light remain, for everyone"}
      </div>
    </div>
  );
}
