LAST LIGHT — ART PROMPTS (phone-friendly, copy-paste ready)

One file per prompt from ART.md. Each file is fully self-contained — the
master STYLE block is already pasted in, so you can copy a whole block on
your phone straight into Gemini 2.5 Flash Image ("Nano Banana") with nothing
to fill in. Files that have variants include each variant as its own
complete, ready-to-paste block.

FILES
  01-app-icon.txt            App / PWA icon (+ maskable variant)
  02-sun-hero.txt            The sun hero disc (+ critical/low-light variant)
  03-varcolac-wolf.txt       The vârcolac, wolf of shadow
  04-night-sky-background.txt  9:16 night-sky background (+ long-night variant)
  05-long-night-gameover.txt   The Long Night game-over illustration
  06-social-share-card.txt   Open Graph share card (image turn + text turn)
  07-texture-overlays.txt    Film-grain overlay + golden ritual arc accent

SUGGESTED WORKFLOW
  1. Generate the sun (02) first. Pick the best one.
  2. Feed it back as a reference into 01, 03 and 06 so the same sun recurs.
  3. Generate 04 background and 05 long-night as full scenes.
  4. Do the share-card text (06) as a SECOND edit turn, not in the first pass.
  5. Export icons at 512 and 192; `npm run icons` regenerates the PWA icon
     set from a source if you wire one in (scripts/generate-icons.mjs).

NOTES
  - State the aspect ratio out loud ("square 1:1", "9:16 portrait",
    "1.91:1 landscape"). Default output is ~1024px; upscale afterward.
  - Transparency is unreliable — generate on flat #07090f and key out later.
  - Always proofread the spelling of "vârcolaci".
