export type NoiseQuality = "perfect" | "steady" | "fizzled";

export interface NoiseEvent {
  t: number;
  mins: number;
  who: "you" | "villager";
}

/** The shared world: one sun, one deadline for everyone. */
export interface SunState {
  epoch: number;
  born: number;
  deadline: number;
  noises: number;
  log: NoiseEvent[];
}

/** This player's local state. */
export interface PlayerState {
  lastNoise: number;
  epoch: number;
  totalMins: number;
  timesNoised: number;
}

/** A sun that the vârcolaci devoured. */
export interface DevouredSun {
  epoch: number;
  born: number;
  died: number;
  noises: number;
}

export interface NoiseResult {
  mins: number;
  quality: NoiseQuality;
  mult: number; // momentum multiplier applied to this scare (1 = calm village)
}

export type MomentumTier = "calm" | "roused" | "roaring";

/** The village's live rhythm, derived from how close together dins are landing. */
export interface Momentum {
  tier: MomentumTier;
  mult: number;
  recent: number; // beats inside the momentum window
}

export type Phase = "loading" | "alive" | "devoured";
