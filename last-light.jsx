import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// LAST LIGHT — a shared world, one dying flame.
// Every visitor shares the same deadline (shared storage).
// Hold the ember to kindle; release in the golden window.
// If the timer ever reaches zero, the world dies for everyone.
// ============================================================

// --- Tuning (prototype values; production would use 24h cycles) ---
const INITIAL_LIGHT_MS = 12 * 60 * 60 * 1000; // a new world is born with 12h
const MAX_LIGHT_MS = 24 * 60 * 60 * 1000;     // light can never exceed 24h
const COOLDOWN_MS = 15 * 60 * 1000;           // per-player kindle cooldown
const HOLD_MS = 5000;                          // full charge time
const GOLD_START = 0.78;                       // golden window start
const FIZZLE_AT = 1.1;                         // overcharge → fizzle

const PALETTE = {
  void: "#0A0908",
  ash: "#2A241E",
  ashDeep: "#181410",
  bone: "#E8DFCB",
  boneDim: "#8A7F6A",
  ember: "#E8742C",
  gold: "#F2B33D",
  blood: "#7A2B1E",
};

// --- storage helpers (shared world state) ---
async function readJSON(key, shared) {
  try {
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}
async function writeJSON(key, val, shared) {
  try {
    await window.storage.set(key, JSON.stringify(val), shared);
    return true;
  } catch {
    return false;
  }
}

function newWorld(epoch) {
  const now = Date.now();
  return {
    epoch,
    born: now,
    deadline: now + INITIAL_LIGHT_MS,
    kindled: 0,
    log: [], // last few kindle events {t, mins}
  };
}

function fmtDuration(ms, withSeconds = true) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  parts.push(`${m}m`);
  if (withSeconds && !d) parts.push(`${String(sec).padStart(2, "0")}s`);
  return parts.join(" ");
}

function fmtAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "moments ago";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function romanize(n) {
  const table = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let out = "";
  for (const [v, sym] of table) while (n >= v) { out += sym; n -= v; }
  return out || "I";
}

export default function LastLight() {
  const [world, setWorld] = useState(null);
  const [graveyard, setGraveyard] = useState([]);
  const [me, setMe] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [phase, setPhase] = useState("loading"); // loading | alive | dark
  const [holding, setHolding] = useState(false);
  const [charge, setCharge] = useState(0);
  const [result, setResult] = useState(null); // {mins, quality}
  const [shareMsg, setShareMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const holdRef = useRef(null);
  const holdStart = useRef(0);
  const chargeRef = useRef(0);
  const worldRef = useRef(null);
  worldRef.current = world;

  // --- boot: load or create the world ---
  const refresh = useCallback(async (createIfMissing = true) => {
    let w = await readJSON("world", true);
    if (!w && createIfMissing) {
      w = newWorld(1);
      await writeJSON("world", w, true);
    }
    if (w) setWorld(w);
    const g = await readJSON("graveyard", true);
    if (g) setGraveyard(g);
    const m = await readJSON("me", false);
    if (m) setMe(m);
    return w;
  }, []);

  useEffect(() => {
    refresh().then((w) => setPhase(w && w.deadline > Date.now() ? "alive" : "dark"));
  }, [refresh]);

  // --- clock tick ---
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // --- poll shared state so other players' kindles appear ---
  useEffect(() => {
    const id = setInterval(() => {
      if (!holding && !busy) refresh(false);
    }, 7000);
    return () => clearInterval(id);
  }, [holding, busy, refresh]);

  // --- detect death while watching ---
  useEffect(() => {
    if (world && phase === "alive" && world.deadline <= now) setPhase("dark");
    if (world && phase === "dark" && world.deadline > now) setPhase("alive");
  }, [now, world, phase]);

  const remaining = world ? world.deadline - now : 0;
  const fracOfDay = Math.max(0, Math.min(1, remaining / MAX_LIGHT_MS));
  const critical = remaining > 0 && remaining < 60 * 60 * 1000;
  const cooldownLeft = me && me.epoch === world?.epoch ? me.lastKindle + COOLDOWN_MS - now : 0;
  const canKindle = phase === "alive" && cooldownLeft <= 0 && !busy;

  // --- the kindle ritual ---
  const beginHold = (e) => {
    e.preventDefault();
    if (!canKindle || holding) return;
    setResult(null);
    setHolding(true);
    holdStart.current = Date.now();
    holdRef.current = setInterval(() => {
      const c = (Date.now() - holdStart.current) / HOLD_MS;
      chargeRef.current = c;
      setCharge(c);
      if (c >= FIZZLE_AT) endHold(true);
    }, 40);
  };

  const endHold = async (fizzled = false) => {
    if (!holdRef.current) return;
    clearInterval(holdRef.current);
    holdRef.current = null;
    const c = chargeRef.current;
    setHolding(false);
    setCharge(0);
    chargeRef.current = 0;
    if (c < 0.08) return; // accidental tap, no cost

    let mins, quality;
    if (fizzled || c > FIZZLE_AT) {
      mins = 3; quality = "fizzled";
    } else if (c >= GOLD_START && c <= 1.0) {
      mins = 20; quality = "perfect";
    } else {
      mins = Math.max(4, Math.round(4 + 10 * Math.min(c, 1)));
      quality = "steady";
    }

    setBusy(true);
    // re-read world to merge with concurrent kindles
    let w = (await readJSON("world", true)) || worldRef.current;
    if (!w || w.deadline <= Date.now()) {
      setBusy(false);
      setPhase("dark");
      return;
    }
    const newDeadline = Math.min(w.deadline + mins * 60000, Date.now() + MAX_LIGHT_MS);
    const updated = {
      ...w,
      deadline: newDeadline,
      kindled: (w.kindled || 0) + 1,
      log: [{ t: Date.now(), mins }, ...(w.log || [])].slice(0, 5),
    };
    await writeJSON("world", updated, true);
    const meNew = { lastKindle: Date.now(), epoch: w.epoch };
    await writeJSON("me", meNew, false);
    setWorld(updated);
    setMe(meNew);
    setResult({ mins, quality });
    setBusy(false);
  };

  // --- reignite a dead world ---
  const reignite = async () => {
    setBusy(true);
    let w = (await readJSON("world", true)) || worldRef.current;
    if (w && w.deadline > Date.now()) {
      // someone beat us to it
      setWorld(w); setPhase("alive"); setBusy(false); return;
    }
    if (w) {
      const grave = ((await readJSON("graveyard", true)) || []);
      if (!grave.some((g) => g.epoch === w.epoch)) {
        grave.unshift({ epoch: w.epoch, born: w.born, died: w.deadline, kindled: w.kindled || 0 });
        await writeJSON("graveyard", grave.slice(0, 12), true);
        setGraveyard(grave.slice(0, 12));
      }
    }
    const next = newWorld((w?.epoch || 0) + 1);
    await writeJSON("world", next, true);
    setWorld(next);
    setResult(null);
    setPhase("alive");
    setBusy(false);
  };

  // --- share ---
  const share = async () => {
    const txt =
      phase === "dark"
        ? `🕯 World ${romanize(world?.epoch || 1)} went dark. A new world waits for its first spark.`
        : `🔥 World ${romanize(world.epoch)} has ${fmtDuration(remaining, false)} of light left. If no one kindles, it dies — for everyone.`;
    try {
      await navigator.clipboard.writeText(txt);
      setShareMsg("Copied — go summon the others");
    } catch {
      setShareMsg(txt);
    }
    setTimeout(() => setShareMsg(null), 3500);
  };

  // --- flame visual scale ---
  const flameScale = 0.45 + 0.75 * Math.pow(fracOfDay, 0.6);
  const inGold = charge >= GOLD_START && charge <= 1.0;
  const overGold = charge > 1.0;

  const ringR = 120;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse 120% 70% at 50% 38%, ${critical ? "#1a0e08" : "#171210"} 0%, ${PALETTE.void} 62%)`,
      color: PALETTE.bone,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      overflow: "hidden", position: "relative",
      WebkitUserSelect: "none", userSelect: "none",
    }} onContextMenu={(e) => e.preventDefault()}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        @keyframes flick { 0%{transform:scaleY(1) scaleX(1) rotate(-1deg)} 30%{transform:scaleY(1.06) scaleX(.96) rotate(1.4deg)} 55%{transform:scaleY(.95) scaleX(1.05) rotate(-1.8deg)} 80%{transform:scaleY(1.04) scaleX(.97) rotate(.8deg)} 100%{transform:scaleY(1) scaleX(1) rotate(-1deg)} }
        @keyframes gutter { 0%{transform:scaleY(1) skewX(0)} 18%{transform:scaleY(.7) skewX(7deg)} 33%{transform:scaleY(1.12) skewX(-9deg)} 50%{transform:scaleY(.62) skewX(4deg)} 70%{transform:scaleY(1.05) skewX(-5deg)} 100%{transform:scaleY(1) skewX(0)} }
        @keyframes rise { 0%{transform:translateY(0) scale(1);opacity:.9} 100%{transform:translateY(-140px) scale(.2);opacity:0} }
        @keyframes glowpulse { 0%,100%{opacity:.55} 50%{opacity:.85} }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @media (prefers-reduced-motion: reduce) {
          .flame, .flame-inner, .glow, .spark { animation: none !important; }
        }
        .kindle-btn:active { transform: scale(.985); }
      `}</style>

      {phase === "loading" && (
        <div style={{ marginTop: "42vh", fontSize: 18, fontStyle: "italic", color: PALETTE.boneDim }}>
          finding the flame…
        </div>
      )}

      {phase !== "loading" && world && (
        <>
          {/* ---- header ---- */}
          <div style={{ marginTop: 26, textAlign: "center", animation: "fadein .8s ease both" }}>
            <div style={{ letterSpacing: "0.42em", fontSize: 11, color: PALETTE.boneDim, fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>
              Last Light
            </div>
            <div style={{ fontSize: 30, fontWeight: 500, marginTop: 6, letterSpacing: "0.08em" }}>
              World {romanize(world.epoch)}
            </div>
            <div style={{ fontSize: 13, color: PALETTE.boneDim, fontStyle: "italic", marginTop: 2 }}>
              kindled {world.kindled || 0} {world.kindled === 1 ? "time" : "times"} since its birth
            </div>
          </div>

          {phase === "alive" ? (
            <>
              {/* ---- the flame + charge ring ---- */}
              <div style={{ position: "relative", width: 280, height: 300, marginTop: 18, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                {/* charge ring */}
                <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", top: 6, left: 0, opacity: holding ? 1 : 0.18, transition: "opacity .3s" }}>
                  {/* golden window arc */}
                  <circle cx="140" cy="140" r={ringR} fill="none" stroke={PALETTE.ash} strokeWidth="3" />
                  <circle cx="140" cy="140" r={ringR} fill="none" stroke={PALETTE.gold} strokeWidth="3" opacity="0.5"
                    strokeDasharray={`${ringC * (1 - GOLD_START)} ${ringC}`}
                    strokeDashoffset={-ringC * GOLD_START}
                    transform="rotate(-90 140 140)" />
                  {/* charge progress */}
                  <circle cx="140" cy="140" r={ringR} fill="none"
                    stroke={overGold ? PALETTE.blood : inGold ? PALETTE.gold : PALETTE.ember}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${ringC * Math.min(charge, 1.12)} ${ringC}`}
                    transform="rotate(-90 140 140)"
                    style={{ filter: inGold ? `drop-shadow(0 0 6px ${PALETTE.gold})` : "none" }} />
                </svg>

                {/* glow */}
                <div className="glow" style={{
                  position: "absolute", bottom: 30, width: 220 * flameScale + 60, height: 220 * flameScale + 60,
                  borderRadius: "50%", left: "50%", transform: "translateX(-50%)",
                  background: `radial-gradient(circle, ${PALETTE.ember}44 0%, transparent 65%)`,
                  animation: "glowpulse 3.4s ease-in-out infinite",
                }} />

                {/* flame body */}
                <div style={{ position: "absolute", bottom: 64, left: "50%", transform: `translateX(-50%) scale(${flameScale * (holding ? 1 + 0.25 * Math.min(charge, 1) : 1)})`, transformOrigin: "bottom center", transition: "transform .25s ease" }}>
                  <div className="flame" style={{
                    width: 74, height: 120,
                    background: `linear-gradient(to top, ${PALETTE.ember}, ${PALETTE.gold} 60%, #FCE9B0 92%)`,
                    borderRadius: "50% 50% 50% 50% / 64% 64% 36% 36%",
                    transformOrigin: "bottom center",
                    animation: `${critical ? "gutter 1.1s" : "flick 2.6s"} ease-in-out infinite`,
                    filter: `blur(.4px) drop-shadow(0 0 ${18 * flameScale}px ${PALETTE.ember}aa)`,
                    position: "relative",
                  }}>
                    <div className="flame-inner" style={{
                      position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
                      width: 34, height: 62,
                      background: `linear-gradient(to top, #4A6FB5, #FCE9B0 70%)`,
                      borderRadius: "50% 50% 50% 50% / 64% 64% 36% 36%",
                      opacity: 0.85,
                      animation: "flick 1.9s ease-in-out infinite reverse",
                    }} />
                  </div>
                  {/* sparks while holding */}
                  {holding && [0, 1, 2, 3].map((i) => (
                    <div key={i} className="spark" style={{
                      position: "absolute", bottom: 90, left: 20 + i * 12,
                      width: 4, height: 4, borderRadius: "50%",
                      background: PALETTE.gold,
                      animation: `rise ${1 + i * 0.35}s ease-out ${i * 0.22}s infinite`,
                    }} />
                  ))}
                </div>

                {/* wick / candle stub */}
                <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", width: 4, height: 30, background: "#1c1712", borderRadius: 2 }} />
                <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 96, height: 30, background: `linear-gradient(to bottom, #3A3128, ${PALETTE.ashDeep})`, borderRadius: "8px 8px 14px 14px" }} />
              </div>

              {/* ---- countdown ---- */}
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <div style={{
                  fontFamily: "ui-monospace, 'SF Mono', monospace",
                  fontSize: 34, letterSpacing: "0.06em",
                  color: critical ? "#E8956B" : PALETTE.bone,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {fmtDuration(remaining)}
                </div>
                <div style={{ fontSize: 14, fontStyle: "italic", color: critical ? "#C76B4A" : PALETTE.boneDim, marginTop: 2 }}>
                  {critical ? "the flame is guttering — summon the others" : "of light remain, for everyone"}
                </div>
              </div>

              {/* ---- ritual / result ---- */}
              <div style={{ marginTop: 22, textAlign: "center", minHeight: 116 }}>
                {result && (
                  <div style={{ marginBottom: 10, fontSize: 16, animation: "fadein .5s ease both", color: result.quality === "perfect" ? PALETTE.gold : result.quality === "fizzled" ? PALETTE.boneDim : PALETTE.bone, fontStyle: "italic" }}>
                    {result.quality === "perfect" && `A perfect breath. +${result.mins} minutes of light.`}
                    {result.quality === "steady" && `The flame drinks. +${result.mins} minutes of light.`}
                    {result.quality === "fizzled" && `Held too long — it sputters. +${result.mins} minutes.`}
                  </div>
                )}
                {canKindle ? (
                  <>
                    <button
                      className="kindle-btn"
                      onPointerDown={beginHold}
                      onPointerUp={() => endHold(false)}
                      onPointerLeave={() => holding && endHold(false)}
                      onPointerCancel={() => holding && endHold(false)}
                      style={{
                        touchAction: "none",
                        background: holding ? `linear-gradient(to bottom, #2E2118, #1E160F)` : `linear-gradient(to bottom, #33261A, #221910)`,
                        border: `1px solid ${inGold ? PALETTE.gold : PALETTE.ember}66`,
                        color: PALETTE.bone, borderRadius: 999,
                        padding: "16px 42px", fontSize: 19,
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        letterSpacing: "0.14em", cursor: "pointer",
                        boxShadow: holding ? `0 0 ${24 * Math.min(charge, 1)}px ${inGold ? PALETTE.gold : PALETTE.ember}55` : "0 2px 14px #00000066",
                        transition: "box-shadow .2s, border-color .2s",
                      }}>
                      {holding ? (inGold ? "RELEASE NOW" : overGold ? "TOO LONG —" : "HOLD…") : "HOLD THE EMBER"}
                    </button>
                    <div style={{ fontSize: 12.5, color: PALETTE.boneDim, marginTop: 10, fontStyle: "italic" }}>
                      hold, and release inside the golden arc
                    </div>
                  </>
                ) : phase === "alive" && (
                  <div style={{ fontSize: 15, color: PALETTE.boneDim, fontStyle: "italic", padding: "0 32px" }}>
                    {busy ? "the flame takes your breath…" : <>your breath is spent. You may kindle again in <span style={{ fontFamily: "ui-monospace, monospace", color: PALETTE.bone }}>{fmtDuration(cooldownLeft, false)}</span>.<br />Until then — bring someone else.</>}
                  </div>
                )}
              </div>

              {/* ---- recent kindles ---- */}
              {world.log?.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 13, color: PALETTE.boneDim, textAlign: "center", fontStyle: "italic" }}>
                  {world.log.slice(0, 3).map((e, i) => (
                    <div key={i} style={{ opacity: 1 - i * 0.28 }}>
                      a stranger kindled the flame {fmtAgo(e.t)} (+{e.mins}m)
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ---- THE DARK ---- */
            <div style={{ textAlign: "center", marginTop: 60, padding: "0 28px", animation: "fadein 1.4s ease both", maxWidth: 420 }}>
              <div style={{ fontSize: 64, opacity: 0.5 }}>🕯</div>
              <div style={{ fontSize: 26, marginTop: 16, fontStyle: "italic" }}>
                World {romanize(world.epoch)} has gone dark.
              </div>
              <div style={{ fontSize: 16, color: PALETTE.boneDim, marginTop: 12, lineHeight: 1.6 }}>
                It lived {fmtDuration(world.deadline - world.born, false)} and was kindled {world.kindled || 0} {world.kindled === 1 ? "time" : "times"}. No one came, and the light went out — as it does, when no one comes.
              </div>
              <button onClick={reignite} disabled={busy} style={{
                marginTop: 30, background: "transparent",
                border: `1px solid ${PALETTE.ember}88`, color: PALETTE.bone,
                borderRadius: 999, padding: "15px 38px", fontSize: 18,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                letterSpacing: "0.14em", cursor: "pointer",
              }}>
                {busy ? "STRIKING…" : `STRIKE THE FIRST SPARK OF WORLD ${romanize(world.epoch + 1)}`}
              </button>
            </div>
          )}

          {/* ---- share ---- */}
          <div style={{ marginTop: 26, textAlign: "center" }}>
            <button onClick={share} style={{
              background: "transparent", border: "none", color: PALETTE.boneDim,
              fontSize: 14, fontStyle: "italic", textDecoration: "underline",
              textUnderlineOffset: 4, cursor: "pointer",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}>
              summon others to the flame
            </button>
            {shareMsg && <div style={{ fontSize: 13, color: PALETTE.gold, marginTop: 6 }}>{shareMsg}</div>}
          </div>

          {/* ---- graveyard of worlds ---- */}
          {graveyard.length > 0 && (
            <div style={{ marginTop: 34, marginBottom: 30, textAlign: "center", width: "100%", maxWidth: 380 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.4em", color: PALETTE.boneDim, fontFamily: "ui-monospace, monospace", textTransform: "uppercase", marginBottom: 10 }}>
                Worlds That Were
              </div>
              {graveyard.slice(0, 6).map((g) => (
                <div key={g.epoch} style={{ fontSize: 14, color: PALETTE.boneDim, padding: "5px 0", borderTop: `1px solid ${PALETTE.ash}`, fontStyle: "italic" }}>
                  World {romanize(g.epoch)} — lived {fmtDuration(g.died - g.born, false)}, kindled {g.kindled} times
                </div>
              ))}
            </div>
          )}
          {graveyard.length === 0 && <div style={{ height: 34 }} />}
        </>
      )}
    </div>
  );
}
