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
}

export type Phase = "loading" | "alive" | "devoured";
