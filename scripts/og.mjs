#!/usr/bin/env node
// Renders public/og.png (1200x630, <= 150 KB): the name and tagline on the light face, beside an ink field
// holding the 4.5 s Sidequest frame and a static transport (paused at 0:04.5, the 4.5 cue lit).
// Uses the real fonts from node_modules and the installed Chrome.
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
const still = b64('public/media/sidequest-4.5.webp');
const cues = [1.7, 4.5, 7.7, 9.4, 11.2];
const dur = 12;
const play = 'M7 4v16l13 -8l-13 -8'; // Tabler player-play

const html = `<!doctype html><html><head><style>
@font-face { font-family: D; src: url(data:font/woff2;base64,${display}) format('woff2'); font-weight: 600; }
@font-face { font-family: S; src: url(data:font/woff2;base64,${sans}) format('woff2-variations'); font-weight: 300 800; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #eceef0; color: #15171a; font-family: S; font-variant-numeric: tabular-nums; }
.name { position: absolute; left: 64px; top: 216px; font: 600 88px/88px D; letter-spacing: -0.02em; }
.tag { position: absolute; left: 64px; top: 320px; font: 500 32px/40px S; }
.field { position: absolute; left: 600px; top: 107px; width: 600px; background: #15171a; border-radius: 10px 0 0 10px; overflow: hidden; }
.well { width: 600px; height: 336px; background: url(data:image/webp;base64,${still}) center / cover; }
.tr { display: grid; grid-template-columns: 64px 96px 96px 1fr; align-items: center; height: 80px; padding-right: 24px; color: #e9ecef; font: 500 16px/20px S; }
.key { justify-self: center; width: 44px; height: 44px; border-radius: 10px; background: #26292e; display: grid; place-items: center; }
.state { color: #a4abb2; }
.lane { position: relative; height: 24px; }
.rail { position: absolute; left: 0; right: 0; top: 11px; height: 2px; background: #6b7279; }
.fill { position: absolute; left: 0; top: 9px; height: 6px; width: ${(4.5 / dur) * 100}%; background: #a4abb2; border-block: 1px solid #15171a; }
.tick { position: absolute; top: 6px; width: 2px; height: 12px; margin-left: -1px; border-radius: 1px; background: #e9ecef; }
.tick.on { background: #c42b5f; width: 4px; margin-left: -2px; }
</style></head><body>
<div class="name">Sai Bhandar</div>
<div class="tag">Business + CS @ CMU</div>
<div class="field">
  <div class="well"></div>
  <div class="tr">
    <div class="key"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9ecef" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${play}"/></svg></div>
    <div>0:04.5 / 0:12</div>
    <div class="state">Paused</div>
    <div class="lane"><div class="rail"></div><div class="fill"></div>${cues
      .map((t) => `<div class="tick${t === 4.5 ? ' on' : ''}" style="left:${(t / dur) * 100}%"></div>`)
      .join('')}</div>
  </div>
</div>
</body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: 'png' });
await browser.close();

const out = join(root, 'public/og.png');
for (const colours of [256, 192, 128, 96]) {
  await sharp(shot).png({ palette: true, colours, dither: 0.6, effort: 10, compressionLevel: 9 }).toFile(out);
  if (statSync(out).size <= 150_000) break;
}
console.log(`${statSync(out).size} B  public/og.png`);
