#!/usr/bin/env node
// Renders the site's brand images in direction B, Editorial, with the real fonts and the colour tokens read from
// src/styles/global.css (so a token change reaches them on the next run):
//   public/og.jpg (1200x630, <= 150 KB): the home masthead as a share card. The name set to the measure over a 2px
//     rule, then the tagline and the five project titles (projects.ts, in order) beside the Sidequest poster frame,
//     the same frame row 1 opens with on home.
//   public/favicon.png (512x512) and public/apple-touch-icon.png (180x180): an "S" in Schibsted Grotesk 800 in
//     paper on an ink square (square corners, as everywhere on the site).
// Uses the installed Chrome. Not part of `npm run build`; run it after a token, font or title change:
//
//   node scripts/og.mjs

import { readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { projects } from '../src/data/projects.ts';

const root = resolve(new URL('..', import.meta.url).pathname);
const b64 = (p) => readFileSync(join(root, p)).toString('base64');
const display = b64('node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2');
const text = b64('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2');
// The Sidequest poster (build input, 1920x1080 lossless), drawn at 540 CSS px here: 3.6x its pixels.
const poster = await sharp(join(root, 'src/assets/v3/sidequest/run-34.5.webp')).resize(1080).webp({ quality: 92 }).toBuffer();

// Tokens from the first :root block of global.css.
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const rootBlock = css.slice(css.indexOf(':root {'), css.indexOf('\n}', css.indexOf(':root {')));
const tok = (name) => {
  const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(rootBlock);
  if (!m) throw new Error(`og.mjs: token --${name} not found in global.css`);
  return m[1].trim().replace(/\s*\/\*.*$/, '');
};
const c = Object.fromEntries(['paper', 'panel', 'ink', 'ink-2', 'img-edge'].map((n) => [n, tok(n)]));

// The headline Sai fixed (PRODUCT.md) and the project titles, in the fixed order.
const NAME = 'Sai Bhandar';
const TAGLINE = 'Business + CS @ CMU';
const titles = projects.map((p) => p.title);
if (titles.join() !== 'Sidequest,Lazer Shooter,ReliefIQ,Sunrise,GyroBlaster') throw new Error(`og.mjs: unexpected titles ${titles}`);

const fonts = `
@font-face { font-family: D; src: url(data:font/woff2;base64,${display}) format('woff2-variations'); font-weight: 400 900; }
@font-face { font-family: T; src: url(data:font/woff2;base64,${text}) format('woff2-variations'); font-weight: 200 800; }
* { box-sizing: border-box; margin: 0; padding: 0; }`;

// The site grid at 1024 and up: 48px side margins, 12 columns of 70 with 24px gutters across 1104. The top padding
// centres the ink vertically (name cap top 57px from the top edge, poster bottom 57px from the bottom).
const og = `<!doctype html><html><head><style>${fonts}
body { width: 1200px; height: 630px; overflow: hidden; background: ${c.paper}; color: ${c.ink}; padding: 74px 48px 0; -webkit-font-smoothing: antialiased; }
.measure { container-type: inline-size; }
.name { font: 800 calc(100cqi / 5.66)/0.86 D; letter-spacing: -0.04em; margin-left: -0.018em; text-box: trim-both cap alphabetic; }
.rule { height: 0; border-top: 2px solid ${c.ink}; margin-top: 24px; }
.deck { display: grid; grid-template-columns: repeat(12, 70px); column-gap: 24px; margin-top: 32px; }
.left { grid-column: 1 / 7; }
.tag { font: 700 40px/48px D; letter-spacing: -0.015em; text-box: trim-both cap alphabetic; }
ol { list-style: none; margin-top: 28px; font: 400 28px/40px T; color: ${c.ink}; }
.frame { grid-column: 7 / 13; position: relative; aspect-ratio: 16 / 9; background: ${c.panel}; overflow: hidden; }
.frame img { display: block; width: 100%; height: 100%; object-fit: cover; }
.frame::after { content: ''; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px ${c['img-edge']}; }
</style></head><body>
<div class="measure"><div class="name">${NAME}</div></div>
<div class="rule"></div>
<div class="deck">
  <div class="left"><div class="tag">${TAGLINE}</div><ol>${titles.map((t) => `<li>${t}</li>`).join('')}</ol></div>
  <div class="frame"><img src="data:image/webp;base64,${poster.toString('base64')}" alt=""></div>
</div>
</body></html>`;

const iconPage = (size) => `<!doctype html><html><head><style>${fonts}
body { width: ${size}px; height: ${size}px; overflow: hidden; background: ${c.ink}; }
.f { width: ${size}px; height: ${size}px; display: grid; place-items: center; color: ${c.paper};
  font: 800 ${Math.round(size * 0.78)}px/1 D; letter-spacing: -0.04em; text-box: trim-both cap alphabetic; }
</style></head><body><div class="f">S</div></body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
async function render(html, width, height, scale = 1) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png' });
  await page.close();
  return shot;
}
// The card renders at 2x and is downsampled, so the type is antialiased like a 2x screen, not a 1x one.
const ogShot = await sharp(await render(og, 1200, 630, 2)).resize(1200, 630, { kernel: 'lanczos3' }).toBuffer();
const favShot = await render(iconPage(512), 512, 512);
const touchShot = await render(iconPage(180), 180, 180);
await browser.close();

const out = join(root, 'public/og.jpg');
for (const quality of [86, 82, 78, 74]) {
  await sharp(ogShot).flatten({ background: c.paper }).jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(out);
  if (statSync(out).size <= 150_000) break;
}
console.log(`${statSync(out).size} B  public/og.jpg`);
for (const [shot, file] of [[favShot, 'public/favicon.png'], [touchShot, 'public/apple-touch-icon.png']]) {
  await sharp(shot).png({ palette: true, colours: 64, effort: 10, compressionLevel: 9 }).toFile(join(root, file));
  console.log(`${statSync(join(root, file)).size} B  ${file}`);
}
