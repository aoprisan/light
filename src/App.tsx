import { useState } from "react";
import { useGame } from "./game/useGame";
import { CRITICAL_MS } from "./game/constants";
import { romanize, wardenTitle } from "./game/format";
import { isMuted, setMuted } from "./game/audio";
import SunScene from "./components/SunScene";
import Countdown from "./components/Countdown";
import Ritual from "./components/Ritual";
import MomentumMeter from "./components/Momentum";
import NoiseLog from "./components/NoiseLog";
import LongNight from "./components/LongNight";
import Share from "./components/Share";
import Graveyard from "./components/Graveyard";

export default function App() {
  const g = useGame();
  const [muted, setMutedState] = useState(isMuted);
  const critical = g.remaining > 0 && g.remaining < CRITICAL_MS;

  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  if (g.phase === "loading" || !g.sun) {
    return <div className="app loading-screen">watching the sky…</div>;
  }

  return (
    <div className={`app ${critical ? "is-critical" : ""} ${g.phase === "devoured" ? "is-night" : ""}`}>
      <header className="header">
        <div className="eyebrow">Last Light</div>
        <h1 className="title">Sun {romanize(g.sun.epoch)}</h1>
        <div className="subtitle">
          the din has been raised {g.sun.noises} {g.sun.noises === 1 ? "time" : "times"} since it was forged
        </div>
      </header>

      {g.phase === "alive" ? (
        <main className="main">
          <SunScene
            fracOfDay={g.fracOfDay}
            critical={critical}
            holding={g.holding}
            charge={g.charge}
            momentum={g.momentum.mult}
          />
          <Countdown remaining={g.remaining} critical={critical} />
          <MomentumMeter momentum={g.momentum} />
          <Ritual
            canNoise={g.canNoise}
            holding={g.holding}
            charge={g.charge}
            cooldownLeft={g.cooldownLeft}
            result={g.result}
            onBegin={g.beginHold}
            onEnd={g.endHold}
          />
          <NoiseLog log={g.sun.log} />
        </main>
      ) : (
        <main className="main">
          <LongNight sun={g.sun} onForge={g.forgeNewSun} />
        </main>
      )}

      <Share phase={g.phase} sun={g.sun} remaining={g.remaining} />

      {g.me && g.me.timesNoised > 0 && (
        <div className="me-stats">
          <span className="warden">{wardenTitle(g.me.totalMins)}</span> — you have driven the beast back{" "}
          {g.me.timesNoised} {g.me.timesNoised === 1 ? "time" : "times"}, winning {g.me.totalMins} minutes of light
        </div>
      )}

      <Graveyard suns={g.graveyard} />

      <footer className="footer">
        <button className="mute-btn" onClick={toggleMute} aria-pressed={muted}>
          {muted ? "🔇 the village is silent" : "🔔 the village makes noise"}
        </button>
        <p className="legend">
          When the vârcolaci gnaw at the sun, the village beats pots and rings bells until the beasts let go.
          <br />— after an old Romanian eclipse rite
        </p>
      </footer>
    </div>
  );
}
