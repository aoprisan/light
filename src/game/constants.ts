// --- Tuning (prototype values; production would use 24h cycles) ---
export const INITIAL_LIGHT_MS = 12 * 60 * 60 * 1000; // Sun I is born with 12h
export const LIGHT_DECAY_PER_EPOCH_MS = 30 * 60 * 1000; // each forge: colder embers
export const MIN_INITIAL_LIGHT_MS = 6 * 60 * 60 * 1000; // ...but never below 6h
export const MAX_LIGHT_MS = 24 * 60 * 60 * 1000; // light can never exceed 24h
export const COOLDOWN_MS = 15 * 60 * 1000; // per-player noise cooldown
export const HOLD_MS = 5000; // full din time
export const GOLD_START = 0.78; // golden window start
export const FIZZLE_AT = 1.1; // held too long → the din collapses
export const CRITICAL_MS = 60 * 60 * 1000; // under 1h: the jaws are closing

// --- Momentum: the village finds its rhythm ---
// Dins landing close together build a shared swell that multiplies each scare.
// Derived from the din log, so it needs no extra shared state.
export const MOMENTUM_WINDOW_MS = 90 * 1000; // beats within 90s count toward the swell
export const MOMENTUM_ROUSED_AT = 2; // recent beats for ×1.25
export const MOMENTUM_ROARING_AT = 4; // recent beats for ×1.5
export const MOMENTUM_ROUSED_MULT = 1.25;
export const MOMENTUM_ROARING_MULT = 1.5;

// Simulated villagers (stand-in for a real shared backend on static hosting)
export const VILLAGER_MIN_GAP_MS = 50 * 1000;
export const VILLAGER_MAX_GAP_MS = 160 * 1000;

export const GRAVEYARD_MAX = 12;
export const LOG_MAX = 16; // enough recent beats to read momentum during a swell
