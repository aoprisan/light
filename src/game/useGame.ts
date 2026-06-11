import { useCallback, useEffect, useRef, useState } from "react";
import {
  COOLDOWN_MS, FIZZLE_AT, GOLD_START, GRAVEYARD_MAX, HOLD_MS,
  INITIAL_LIGHT_MS, LOG_MAX, MAX_LIGHT_MS,
  VILLAGER_MAX_GAP_MS, VILLAGER_MIN_GAP_MS,
} from "./constants";
import { load, onExternalChange, save } from "./storage";
import { chime, clang, thud } from "./audio";
import type {
  DevouredSun, NoiseEvent, NoiseResult, Phase, PlayerState, SunState,
} from "./types";

function newSun(epoch: number): SunState {
  const now = Date.now();
  return { epoch, born: now, deadline: now + INITIAL_LIGHT_MS, noises: 0, log: [] };
}

function addNoise(sun: SunState, mins: number, who: NoiseEvent["who"]): SunState {
  const event: NoiseEvent = { t: Date.now(), mins, who };
  return {
    ...sun,
    deadline: Math.min(sun.deadline + mins * 60_000, Date.now() + MAX_LIGHT_MS),
    noises: sun.noises + 1,
    log: [event, ...sun.log].slice(0, LOG_MAX),
  };
}

export function useGame() {
  const [sun, setSun] = useState<SunState | null>(null);
  const [graveyard, setGraveyard] = useState<DevouredSun[]>([]);
  const [me, setMe] = useState<PlayerState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [phase, setPhase] = useState<Phase>("loading");
  const [holding, setHolding] = useState(false);
  const [charge, setCharge] = useState(0);
  const [result, setResult] = useState<NoiseResult | null>(null);

  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef(0);
  const chargeRef = useRef(0);
  const lastBeat = useRef(0);
  const sunRef = useRef<SunState | null>(null);
  sunRef.current = sun;

  // --- boot: load or create the world ---
  const refresh = useCallback((createIfMissing = true): SunState | null => {
    let s = load<SunState>("sun");
    if (!s && createIfMissing) {
      s = newSun(1);
      save("sun", s);
    }
    if (s) setSun(s);
    setGraveyard(load<DevouredSun[]>("graveyard") ?? []);
    setMe(load<PlayerState>("me"));
    return s;
  }, []);

  useEffect(() => {
    const s = refresh();
    setPhase(s && s.deadline > Date.now() ? "alive" : "devoured");
    return onExternalChange(() => refresh(false));
  }, [refresh]);

  // --- clock tick ---
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  // --- detect devouring / rescue while watching ---
  useEffect(() => {
    if (!sun) return;
    if (phase === "alive" && sun.deadline <= now) setPhase("devoured");
    if (phase === "devoured" && sun.deadline > now) setPhase("alive");
  }, [now, sun, phase]);

  // --- simulated villagers (demo stand-in for a real shared backend) ---
  useEffect(() => {
    if (phase !== "alive") return;
    let id = 0;
    const schedule = () => {
      const gap = VILLAGER_MIN_GAP_MS + Math.random() * (VILLAGER_MAX_GAP_MS - VILLAGER_MIN_GAP_MS);
      id = window.setTimeout(() => {
        const current = sunRef.current;
        if (document.visibilityState === "visible" && current && current.deadline > Date.now()) {
          const mins = 2 + Math.floor(Math.random() * 7);
          const updated = addNoise(current, mins, "villager");
          save("sun", updated);
          setSun(updated);
        }
        schedule();
      }, gap);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, [phase]);

  const remaining = sun ? sun.deadline - now : 0;
  const fracOfDay = Math.max(0, Math.min(1, remaining / MAX_LIGHT_MS));
  const cooldownLeft = me && me.epoch === sun?.epoch ? me.lastNoise + COOLDOWN_MS - now : 0;
  const canNoise = phase === "alive" && cooldownLeft <= 0;

  // --- the ritual: hold to raise the din ---
  const finishHold = useCallback((fizzled: boolean) => {
    if (holdTimer.current === null) return;
    window.clearInterval(holdTimer.current);
    holdTimer.current = null;
    const c = chargeRef.current;
    setHolding(false);
    setCharge(0);
    chargeRef.current = 0;
    if (c < 0.08) return; // accidental tap, no cost

    let mins: number;
    let quality: NoiseResult["quality"];
    if (fizzled || c > FIZZLE_AT) {
      mins = 3;
      quality = "fizzled";
      thud();
    } else if (c >= GOLD_START && c <= 1.0) {
      mins = 20;
      quality = "perfect";
      chime();
    } else {
      mins = Math.max(4, Math.round(4 + 10 * Math.min(c, 1)));
      quality = "steady";
    }

    // re-read the world to merge with concurrent noise (other tabs)
    const fresh = load<SunState>("sun") ?? sunRef.current;
    if (!fresh || fresh.deadline <= Date.now()) {
      setPhase("devoured");
      return;
    }
    const updated = addNoise(fresh, mins, "you");
    save("sun", updated);
    const old = load<PlayerState>("me");
    const meNew: PlayerState = {
      lastNoise: Date.now(),
      epoch: fresh.epoch,
      totalMins: (old?.totalMins ?? 0) + mins,
      timesNoised: (old?.timesNoised ?? 0) + 1,
    };
    save("me", meNew);
    setSun(updated);
    setMe(meNew);
    setResult({ mins, quality });
  }, []);

  const beginHold = useCallback(() => {
    if (!canNoise || holdTimer.current !== null) return;
    setResult(null);
    setHolding(true);
    holdStart.current = Date.now();
    lastBeat.current = -1;
    holdTimer.current = window.setInterval(() => {
      const c = (Date.now() - holdStart.current) / HOLD_MS;
      chargeRef.current = c;
      setCharge(c);
      // pots strike faster as the din rises
      const beatLen = 320 - 200 * Math.min(c, 1);
      const beat = Math.floor((Date.now() - holdStart.current) / beatLen);
      if (beat !== lastBeat.current) {
        lastBeat.current = beat;
        clang(Math.min(c, 1));
      }
      if (c >= FIZZLE_AT) finishHold(true);
    }, 40);
  }, [canNoise, finishHold]);

  const endHold = useCallback(() => finishHold(false), [finishHold]);

  // --- forge a new sun after the Long Night ---
  const forgeNewSun = useCallback(() => {
    const s = load<SunState>("sun") ?? sunRef.current;
    if (s && s.deadline > Date.now()) {
      // someone rescued it first
      setSun(s);
      setPhase("alive");
      return;
    }
    if (s) {
      const grave = load<DevouredSun[]>("graveyard") ?? [];
      if (!grave.some((g) => g.epoch === s.epoch)) {
        grave.unshift({ epoch: s.epoch, born: s.born, died: s.deadline, noises: s.noises });
        const trimmed = grave.slice(0, GRAVEYARD_MAX);
        save("graveyard", trimmed);
        setGraveyard(trimmed);
      }
    }
    const next = newSun((s?.epoch ?? 0) + 1);
    save("sun", next);
    setSun(next);
    setResult(null);
    setPhase("alive");
  }, []);

  return {
    sun, graveyard, me, now, phase, holding, charge, result,
    remaining, fracOfDay, cooldownLeft, canNoise,
    beginHold, endHold, forgeNewSun,
  };
}
