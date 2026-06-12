// The din: synthesized pot-banging. In the legend, the vârcolaci flee
// from the clamour of the village — so holding the button actually makes noise.

import { load, save } from "./storage";

let ctx: AudioContext | null = null;
let muted = load<boolean>("muted") ?? false;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  save("muted", m);
}

function ensureCtx(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One strike on the pots. Inharmonic partials make it clang, not ring. */
export function clang(intensity: number): void {
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.1 + 0.12 * intensity, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22 + 0.1 * intensity);
  gain.connect(ac.destination);
  const base = 170 + Math.random() * 50;
  for (const ratio of [1, 2.76, 5.4, 8.93]) {
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.value = base * ratio * (1 + 0.35 * intensity);
    o.connect(gain);
    o.start(t);
    o.stop(t + 0.35);
  }
}

/** The vârcolac recoils — a bright rising bell. */
export function chime(): void {
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.09);
    g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.09 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.7);
    o.connect(g).connect(ac.destination);
    o.start(t + i * 0.09);
    o.stop(t + i * 0.09 + 0.8);
  });
}

/** A new sun is forged — a bright rising arpeggio, the opposite of a thud. */
export function dawn(): void {
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime;
  // a warm pad swelling under a climbing major figure
  const pad = ac.createGain();
  pad.gain.setValueAtTime(0.0001, t);
  pad.gain.exponentialRampToValueAtTime(0.05, t + 0.4);
  pad.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
  pad.connect(ac.destination);
  [196, 261.63].forEach((f) => {
    const o = ac.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    o.connect(pad);
    o.start(t);
    o.stop(t + 2.3);
  });
  [392, 523.25, 659.25, 783.99].forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = f;
    const at = t + i * 0.16;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.11, at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.1);
    o.connect(g).connect(ac.destination);
    o.start(at);
    o.stop(at + 1.2);
  });
}

/** The din collapses — a dull thud. */
export function thud(): void {
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.3);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + 0.4);
}
