# Last Light — Art Prompts for Gemini "Nano Banana"

Ready-to-paste prompts for generating the game's art in **Gemini 2.5 Flash Image
(a.k.a. "Nano Banana")** — the app icon, the sun, the vârcolac, backgrounds, and
the social card. Every prompt is tuned to the game's existing palette and the
Romanian *vârcolaci* eclipse legend so the set stays cohesive.

> The current scene is hand-built SVG (`src/components/SunScene.tsx`). These
> prompts are for **pre-rendered raster art** — a richer hero illustration, the
> PWA icon, social/share cards, and texture overlays — that can sit behind or
> beside the live SVG.

---

## How to use Nano Banana well

- **Open** [Google AI Studio](https://aistudio.google.com) → pick *Gemini 2.5
  Flash Image*, or call it via the Gemini API (`gemini-2.5-flash-image`).
- **It edits as well as generates.** Upload a draft and say *"keep this exact
  composition, push the palette toward ember-orange and deep indigo"* — it
  preserves layout while restyling. This is the fastest path to a coherent set.
- **Lock consistency with a reference image.** Generate the sun first, then feed
  it back in for every other prompt: *"use the sun from the attached image."*
  Nano Banana is unusually good at carrying a subject across edits.
- **It renders text** reasonably — fine for the share card, but always
  proofread the spelling of *vârcolaci*.
- **Transparency is unreliable.** It rarely returns clean alpha. Generate icons
  on a **flat `#07090f` background** (matches the app) and key it out later, or
  just keep the background.
- **Aspect ratio:** state it explicitly ("square 1:1", "9:16 portrait", "1.91:1
  landscape"). Default output is ~1024px; upscale afterward if needed.
- **Every image carries an invisible SynthID watermark** — expected, harmless.

### Master style block — prepend to any prompt for a unified look

```
STYLE: Eastern-European folk-horror woodcut meets modern game UI. Romanian
vârcolaci legend (wolves devouring the sun). Mood: tense, sacred, nocturnal,
hand-made. Limited palette ONLY — deep midnight indigo (#07090f, #0e1426),
ember orange (#ea7a2e), molten gold (#f4be4f, #ffe6a0), blood red (#c0432e),
bone/parchment (#efeada). Subtle film grain and a soft vignette. Textured,
slightly engraved linework; no glossy 3D, no lens flare clutter, no text unless
asked. High contrast between the warm sun and the cold dark.
```

---

## 1. App / PWA icon

Replaces `public/icons/icon-512.png`, `icon-192.png`, `icon-512-maskable.png`.

```
[MASTER STYLE BLOCK]
A square app icon, 1:1. A single glowing ember-gold sun disc, centered, with a
black wolf's-head silhouette (the vârcolac) biting into its upper-right edge —
the eclipse bite. The wolf is pure shadow with two small glowing red eyes. The
sun has a soft molten-gold corona. Flat #07090f background. Bold, simple, iconic,
readable at 48px. No text. Centered with generous padding so it survives a
maskable circular crop.
```

Maskable variant — add: `Keep all art within the central 80% safe zone; fill the
outer margin with the same flat #07090f so a circular mask never clips the sun.`

---

## 2. The sun — hero disc

```
[MASTER STYLE BLOCK]
A close-up of a dying-but-defiant sun against deep midnight indigo, 1:1. The disc
is a living surface of molten ember and gold, churning like cooling lava, with a
brilliant near-white core and darker ember-orange edges. A ragged corona of
gold light-spikes radiates outward. Faint orange sparks lift off the top like
campfire embers. Reverent, sacred, hand-illustrated. No wolf, no text.
```

Critical / low-light state — add: `The sun is guttering and dim, half its glow
gone, the surrounding sky bleeding to dark crimson (#1f0d12), embers sparse and
fading. It looks like it is about to be eaten.`

---

## 3. The vârcolac — the wolf of shadow

```
[MASTER STYLE BLOCK]
A monstrous wolf's head made of living shadow and smoke, in profile, lunging
left with its jaws opening — the vârcolac of Romanian legend that devours the
sun. Body is near-black indigo (#07090f) with a faint cold-blue rim light. Two
burning red eyes (#c0432e glowing to bright red) and a ring of bone-white fangs
catching warm ember light along the open maw. Wisps of shadow trail off its fur.
Menacing, mythic, woodcut-textured. Transparent-feeling flat #07090f background,
1:1. No text.
```

---

## 4. Night-sky background (full-bleed, behind the UI)

```
[MASTER STYLE BLOCK]
A vertical 9:16 phone background. A vast deep-indigo night sky fading from
#161d38 at the top to near-black #07090f at the bottom, scattered with faint
cold-white stars, a thin band of dust/cloud. Empty negative space in the upper
-middle third where a sun will be composited. Heavy film grain, strong vignette
darkening all four edges. Atmospheric, quiet, ominous. No sun, no wolf, no text,
no foreground objects.
```

Long-Night variant (game-over screen) — add: `Make it darker and colder, almost
no stars, a faint blood-red glow low on the horizon, and 6–8 pairs of small
glowing red wolf-eyes watching from the darkness at the bottom edge.`

---

## 5. The Long Night — game-over illustration

```
[MASTER STYLE BLOCK]
A wide cinematic 16:9 scene of the Long Night: the sun is gone, only a thin
blood-red ember of afterglow remains on the horizon. A silhouetted pack of
wolves (vârcolaci) with glowing red eyes stands on a dark ridge, sated. A tiny
village of woodcut houses huddles below in the dark, one faint window-light still
burning. Cold, mournful, folkloric, hand-engraved. No text.
```

---

## 6. Social / share card (Open Graph, 1.91:1)

```
[MASTER STYLE BLOCK]
A landscape 1.91:1 social share image. Left two-thirds: the ember-gold sun being
bitten by a black wolf-head silhouette with red eyes (the eclipse bite), molten
corona, sparks rising. Right third: clean negative space of deep indigo for
overlaid text. Dramatic, mythic, high contrast. Leave the right side uncluttered.
```

Then, in a follow-up edit turn:

```
Add elegant engraved serif text on the right third, bone-white (#efeada):
title "LAST LIGHT" large, and below it smaller "The vârcolaci are eating the
sun. Make noise." Keep the spelling exactly. Don't cover the sun.
```

---

## 7. Texture & UI overlays

**Film-grain / parchment overlay** (multiply over the whole app):

```
A seamless, tileable grain texture: fine charcoal-and-soot noise over a near
-black field, like an old printed woodcut page. Subtle, monochrome, no pattern
or repetition seams, no color. 1:1.
```

**Golden ritual arc / button glow accent:**

```
[MASTER STYLE BLOCK]
A thin glowing arc of molten gold light on a flat #07090f background, like a ring
of fire being charged, slight bloom and ember sparks along it. 1:1. No text.
```

---

## Suggested workflow

1. Generate **the sun (#2)** first. Pick the best one.
2. Feed it back as a reference into **#1, #3, #6** so the same sun recurs.
3. Generate **#4 background** and **#5 long-night** as full scenes.
4. Do text (#6) as a **second edit turn**, not in the first generation.
5. Export icons at 512 and 192; remember `npm run icons` regenerates the
   PWA icon set from a source if you wire one in (`scripts/generate-icons.mjs`).

Drop finished raster assets in `public/` and reference them from the components
or `styles.css` (e.g. a `background-image` on `.app`, or `<img>`/`<image>` layers
behind the live SVG in `SunScene.tsx`).
