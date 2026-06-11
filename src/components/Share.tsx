import { useState } from "react";
import { fmtDuration, romanize } from "../game/format";
import type { Phase, SunState } from "../game/types";

interface Props {
  phase: Phase;
  sun: SunState;
  remaining: number;
}

export default function Share({ phase, sun, remaining }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  const share = async () => {
    const text =
      phase === "devoured"
        ? `🐺 Sun ${romanize(sun.epoch)} was devoured. The Long Night fell. A new sun waits to be forged.`
        : `🌞🐺 The vârcolaci are eating Sun ${romanize(sun.epoch)} — ${fmtDuration(remaining, false)} of light left. Come make noise before the Long Night takes it for everyone: ${location.href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Last Light", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setMsg("Copied — go wake the village");
    } catch {
      setMsg(text);
    }
    window.setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="share">
      <button className="share-btn" onClick={() => void share()}>
        wake the village
      </button>
      {msg && <div className="share-msg">{msg}</div>}
    </div>
  );
}
