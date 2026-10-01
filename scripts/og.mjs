#!/usr/bin/env node
// Renders the page's brand images from the Cue design, with the real fonts and the colour tokens read from
// src/styles/global.css (so a token change reaches them on the next run):
//   public/og.png (1200x630, <= 150 KB): the name and tagline on the light face, beside an ink field holding the
//     4.5 s Sidequest frame and the stage's own transport, paused at 0:04.5 with the 4.5 cue pressed (rose).
//   public/favicon.png (512x512) and public/apple-touch-icon.png (180x180): an "S" in Funnel Display on an ink field.
// Uses the installed Chrome.
//
//   node scripts/og.mjs

import { readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = resolve(new URL('..', import.meta.url).pathname);
const b64 = (p) => readFileSync(join(root, p)).toString('base64');
const display = b64('node_modules/@fontsource/funnel-display/files/funnel-display-latin-600-normal.woff2');
const sans = b64('node_modules/@fontsource-variable/funnel-sans/files/funnel-sans-latin-wght-normal.woff2');
const still = b64('src/assets/stills/sidequest-4.5.webp'); // the pinned frame (build input; q95)

// Tokens from the first :root block of global.css.
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const rootBlock = css.slice(css.indexOf(':root {'), css.indexOf('\n}', css.indexOf(':root {')));
const tok = (name) => {
  const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(rootBlock);
  if (!m) throw new Error(`og.mjs: token --${name} not found in global.css`);
  return m[1].trim();
};
const c = Object.fromEntries(['ground', 'ink', 'on-field', 'on-field-2', 'raise', 'track', 'rose', 'r'].map((n) => [n, tok(n)]));

// Tabler paths, as Icon.astro draws them (1.5 stroke, round caps and joins).
const icon = (paths, size, colour) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
const play = ['M7 4v16l13 -8l-13 -8'];
const back = ['M20 5v14l-12 -7l12 -7', 'M4 5l0 14'];
const fwd = ['M4 5v14l12 -7l-12 -7', 'M20 5l0 14'];
const cues = [1.7, 4.5, 7.7, 9.4, 11.2]; // presentation.ts
const dur = 12;

const fonts = `
@font-face { font-family: D; src: url(data:font/woff2;base64,${display}) format('woff2'); font-weight: 600; }
@font-face { font-family: S; src: url(data:font/woff2;base64,${sans}) format('woff2-variations'); font-weight: 300 800; }
* { box-sizing: border-box; margin: 0; }`;

const og = `<!doctype html><html><head><style>${fonts}
body { width: 1200px; height: 630px; overflow: hidden; background: ${c.ground}; color: ${c.ink}; font-family: S; font-variant-numeric: tabular-nums; }
.text { position: absolute; left: 64px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; padding-bottom: 8px; }
.name { font: 600 88px/88px D; letter-spacing: -0.02em; }
.tag { margin-top: 16px; font: 500 36px/44px S; }
.field { position: absolute; left: 600px; top: 107px; width: 600px; background: ${c.ink}; border-radius: ${c.r} 0 0 ${c.r}; overflow: hidden; }
.well { width: 600px; height: 336px; background: url(data:image/webp;base64,${still}) center / cover; }
.tr { display: grid; grid-template-columns: 64px 112px 72px 48px 1fr 48px; align-items: center; height: 80px; padding-right: 8px; color: ${c['on-field']}; font: 500 16px/20px S; }
.key { justify-self: center; width: 44px; height: 44px; border-radius: ${c.r}; background: ${c.raise}; display: grid; place-items: center; }
.state { color: ${c['on-field-2']}; }
.lane { position: relative; height: 24px; margin-inline: 12px; }
.rail { position: absolute; left: 0; right: 0; top: 11px; height: 2px; background: ${c.track}; }
.fill { position: absolute; left: 0; top: 9px; height: 6px; width: ${(4.5 / dur) * 100}%; background: ${c['on-field-2']}; border-block: 1px solid ${c.ink}; }
.tick { position: absolute; top: 6px; width: 2px; height: 12px; margin-left: -1px; border-radius: 1px; background: ${c['on-field']}; }
.tick.on { background: ${c.rose}; }
</style></head><body>
<div class="text"><div class="name">Sai Bhandar</div><div class="tag">Business + CS @ CMU</div></div>
<div class="field">
  <div class="well"></div>
  <div class="tr">
    <div class="key">${icon(play, 24, c['on-field'])}</div>
    <div>0:04.5 / 0:12</div>
    <div class="state">Paused</div>
    <div class="key">${icon(back, 20, c['on-field'])}</div>
    <div class="lane"><div class="rail"></div><div class="fill"></div>${cues
      .map((t) => `<div class="tick${t === 4.5 ? ' on' : ''}" style="left:${(t / dur) * 100}%"></div>`)
      .join('')}</div>
    <div class="key">${icon(fwd, 20, c['on-field'])}</div>
  </div>
</div>
</body></html>`;

// The tab icon: one glyph on an ink field, corners at the page's 10px key radius in proportion (10/44).
const iconPage = (size, radius) => `<!doctype html><html><head><style>${fonts}
body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
.f { width: ${size}px; height: ${size}px; border-radius: ${radius}px; background: ${c.ink}; color: ${c['on-field']};
  display: grid; place-items: center; font: 600 ${Math.round(size * 0.72)}px/1 D; padding-bottom: ${Math.round(size * 0.04)}px; }
</style></head><body><div class="f">S</div></body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
async function render(html, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png', omitBackground: true });
  await page.close();
  return shot;
}
const ogShot = await render(og, 1200, 630);
const favShot = await render(iconPage(512, Math.round((512 * 10) / 44)), 512, 512);
const touchShot = await render(iconPage(180, 0), 180, 180); // iOS rounds its own corners; no transparency
await browser.close();

const out = join(root, 'public/og.png');
for (const colours of [256, 192, 128, 96]) {
  await sharp(ogShot).flatten({ background: c.ground }).png({ palette: true, colours, dither: 0.6, effort: 10, compressionLevel: 9 }).toFile(out);
  if (statSync(out).size <= 150_000) break;
}
console.log(`${statSync(out).size} B  public/og.png`);
for (const [shot, file] of [[favShot, 'public/favicon.png'], [touchShot, 'public/apple-touch-icon.png']]) {
  await sharp(shot).png({ palette: true, colours: 64, effort: 10, compressionLevel: 9 }).toFile(join(root, file));
  console.log(`${statSync(join(root, file)).size} B  ${file}`);
}
