// --- Tuning (prototype values; production would use 24h cycles) ---
export const INITIAL_LIGHT_MS = 12 * 60 * 60 * 1000; // a new sun is born with 12h
export const MAX_LIGHT_MS = 24 * 60 * 60 * 1000; // light can never exceed 24h
export const COOLDOWN_MS = 15 * 60 * 1000; // per-player noise cooldown
export const HOLD_MS = 5000; // full din time
export const GOLD_START = 0.78; // golden window start
export const FIZZLE_AT = 1.1; // held too long → the din collapses
export const CRITICAL_MS = 60 * 60 * 1000; // under 1h: the jaws are closing

// Simulated villagers (stand-in for a real shared backend on static hosting)
export const VILLAGER_MIN_GAP_MS = 50 * 1000;
export const VILLAGER_MAX_GAP_MS = 160 * 1000;

export const GRAVEYARD_MAX = 12;
export const LOG_MAX = 6;
