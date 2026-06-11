// Persistence for the demo. On static hosting there is no shared backend,
// so the "shared world" lives in localStorage — shared across tabs and
// sessions on this device. A production build would swap these three
// functions for calls to a tiny realtime backend.

const PREFIX = "lastlight:";

export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage blocked or full — the demo degrades to in-memory state
  }
}

/** Fires when another tab changes the world (the closest thing to multiplayer here). */
export function onExternalChange(handler: () => void): () => void {
  const fn = (e: StorageEvent) => {
    if (e.key && e.key.startsWith(PREFIX)) handler();
  };
  window.addEventListener("storage", fn);
  return () => window.removeEventListener("storage", fn);
}
