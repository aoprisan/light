# Last Light — Vârcolacii

> When the vârcolaci gnaw at the sun, the village beats pots and rings bells until the beasts let go.
> — after an old Romanian eclipse rite

A planetary-scale cooperative countdown. One shared sun, one timer ticking toward the Long Night.
The vârcolaci — the wolves of the old legend — are devouring it. Every player's small ritual
(hold to raise the din, release inside the golden arc) drives the beast back and adds minutes of
light for **everyone**. If the timer ever reaches zero, the sun is devoured permanently, the world
goes into its graveyard, and a new sun must be forged.

Recruitment is the core mechanic: your voice goes hoarse after each din (15-minute cooldown), so
the only way to keep the sun alive is to *wake another villager*.

## The ritual

- **Hold** the button — the village starts banging pots (real synthesized audio).
- The din rises over 5 seconds. **Release inside the golden arc** for a perfect scare (+20 min).
- Release early and the beast only flinches (+4–14 min). Hold too long and the din collapses (+3 min).
- Under one hour of light, the sky bleeds red and the wolf's jaws close around the sun.

## Stack

- **TypeScript + React + Vite**
- **PWA** via `vite-plugin-pwa` — installable, offline-capable, auto-updating
- **GitHub Pages** deploy via GitHub Actions (`.github/workflows/deploy.yml`)
- Sounds are synthesized with the Web Audio API; the sun/vârcolac scene is hand-built SVG

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run icons    # regenerate the PWA icons (pngjs rasterizer)
```

## Deploy

Pushing to `main` builds and deploys to GitHub Pages automatically. One-time setup:
in the repo go to **Settings → Pages** and set **Source: GitHub Actions**.
The app is served from `/light/` (see `base` in `vite.config.ts`) — rename it there if the
repo name changes.

## Demo limitations

This is a static demo, so there is no real shared backend yet:

- The "shared world" lives in `localStorage` — shared across tabs (live, via storage events)
  and visits on one device, not across the planet.
- Other villagers are **simulated**: while the page is visible, a phantom villager occasionally
  raises the din so the world feels inhabited.

Production would swap `src/game/storage.ts` for a tiny realtime backend (a single shared
document with the deadline plus a kindle log) — the rest of the game is already written
against that interface.

The original artifact prototype is preserved in `legacy/last-light.jsx`.
