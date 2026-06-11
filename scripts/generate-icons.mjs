// Generates the PWA icons: a sun with a bite taken out of it and the
// vârcolac's red eyes in the shadow. Pure-JS rasterizer via pngjs so the
// icons can be regenerated anywhere with `npm run icons`.
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const OUT = path.resolve(import.meta.dirname, "../public/icons");
fs.mkdirSync(OUT, { recursive: true });

const BG = [11, 14, 26];

function makeIcon(size, { bleed }) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const sunR = size * (bleed ? 0.27 : 0.33);
  const biteCx = cx + sunR * 1.05;
  const biteCy = cy - sunR * 0.6;
  const biteR = sunR * 0.85;
  const eyes = [
    [biteCx - biteR * 0.45, biteCy + biteR * 0.18, size * 0.018],
    [biteCx - biteR * 0.12, biteCy + biteR * 0.45, size * 0.018],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let [r, g, b] = BG;
      const d = Math.hypot(x - cx, y - cy);

      // rays: 12 spokes around the sun
      const ang = Math.atan2(y - cy, x - cx);
      const spoke = Math.abs((((ang / (Math.PI / 6)) % 1) + 1) % 1 - 0.5) < 0.09;
      if (spoke && d > sunR * 1.12 && d < sunR * 1.5) [r, g, b] = [212, 140, 48];

      // sun body with a simple radial gradient
      if (d < sunR) {
        const t = d / sunR;
        r = Math.round(255 - 20 * t);
        g = Math.round(210 - 90 * t);
        b = Math.round(110 - 70 * t);
      }

      // the bite
      if (Math.hypot(x - biteCx, y - biteCy) < biteR) [r, g, b] = BG;

      // the eyes in the dark
      for (const [ex, ey, er] of eyes) {
        const de = Math.hypot(x - ex, y - ey);
        if (de < er) [r, g, b] = [255, 220, 215];
        else if (de < er * 2.6) {
          const k = 1 - (de - er) / (er * 1.6);
          r = Math.min(255, r + 230 * k);
          g = Math.min(255, g + 40 * k);
          b = Math.min(255, b + 35 * k);
        }
      }

      const idx = (size * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

fs.writeFileSync(path.join(OUT, "icon-192.png"), makeIcon(192, { bleed: false }));
fs.writeFileSync(path.join(OUT, "icon-512.png"), makeIcon(512, { bleed: false }));
fs.writeFileSync(path.join(OUT, "icon-512-maskable.png"), makeIcon(512, { bleed: true }));
console.log("icons written to", OUT);
