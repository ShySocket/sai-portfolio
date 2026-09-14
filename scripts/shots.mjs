#!/usr/bin/env node
// Deterministic full-page screenshots of the built site, for visual-regression checks.
//
//   node scripts/shots.mjs before          -> before-mobile.png, before-desktop.png
//   node scripts/shots.mjs after           -> after-*.png
//   node scripts/shots.mjs diff before after -> diff-*.png + changed-pixel counts (exit 1 above TOLERANCE)
//
// Assumes dist/ is built. Uses the Chrome bundled on this Mac via puppeteer-core (a
// lighthouse dependency). Emulates prefers-reduced-motion and pauses videos so the
// output is stable between runs. Output dir: $A11Y_OUT or the autopilot artifacts dir.

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const PORT = 4321;
const SITE = `http://127.0.0.1:${PORT}/sai-portfolio/`;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = resolve(process.env.A11Y_OUT || join(homedir(), 'Documents/autopilot/artifacts/sai-portfolio-a11y'));
const root = resolve(new globalThis.URL('..', import.meta.url).pathname);
const TOLERANCE = 0.01; // % of pixels allowed to differ (video frame-0 decode jitter is ~0.004%)
const VIEWPORTS = { mobile: { width: 390, height: 844, deviceScaleFactor: 2 }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } };

mkdirSync(OUT, { recursive: true });
const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'diff') {
  const [a, b] = rest;
  if (!a || !b) usage();
  let changed = false;
  for (const vp of Object.keys(VIEWPORTS)) {
    const pa = join(OUT, `${a}-${vp}.png`), pb = join(OUT, `${b}-${vp}.png`);
    const [ia, ib] = await Promise.all([pa, pb].map((p) => sharp(p).raw().ensureAlpha().toBuffer({ resolveWithObject: true })));
    const w = Math.min(ia.info.width, ib.info.width), h = Math.min(ia.info.height, ib.info.height);
    const diff = Buffer.alloc(w * h * 4);
    let n = 0, minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const oa = (y * ia.info.width + x) * 4, ob = (y * ib.info.width + x) * 4, od = (y * w + x) * 4;
      const d = Math.abs(ia.data[oa] - ib.data[ob]) + Math.abs(ia.data[oa + 1] - ib.data[ob + 1]) + Math.abs(ia.data[oa + 2] - ib.data[ob + 2]);
      if (d > 24) { n++; diff[od] = 255; diff[od + 1] = 0; diff[od + 2] = 0; diff[od + 3] = 255; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      else { const g = ib.data[ob] >> 2; diff[od] = g; diff[od + 1] = g; diff[od + 2] = g; diff[od + 3] = 255; }
    }
    const out = join(OUT, `diff-${vp}.png`);
    await sharp(diff, { raw: { width: w, height: h, channels: 4 } }).png().toFile(out);
    const sizeNote = ia.info.height !== ib.info.height || ia.info.width !== ib.info.width ? ` (size ${ia.info.width}x${ia.info.height} -> ${ib.info.width}x${ib.info.height})` : '';
    console.log(`${vp}: ${n} changed px of ${w * h} (${((100 * n) / (w * h)).toFixed(3)}%)${sizeNote}${n ? ` bbox x${minX}-${maxX} y${minY}-${maxY}` : ''} -> ${out}`);
    if ((100 * n) / (w * h) > TOLERANCE || sizeNote) changed = true;
  }
  process.exit(changed ? 1 : 0);
}

if (!cmd || cmd.startsWith('-')) usage();

const server = spawn(join(root, 'node_modules/.bin/astro'), ['preview', '--host', '127.0.0.1', '--port', String(PORT)], { cwd: root, stdio: 'ignore' });
const stop = () => { if (!server.killed) server.kill('SIGTERM'); };
process.on('exit', stop);
const t0 = Date.now();
while (Date.now() - t0 < 20000) { try { if ((await fetch(SITE)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 250)); }

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-prefers-reduced-motion', '--hide-scrollbars'] });
try {
  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport(size);
    await page.goto(SITE, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      // Freeze videos on frame 0 (the IntersectionObserver in motion.ts would otherwise play them).
      const videos = [...document.querySelectorAll('video')];
      for (const v of videos) { v.play = () => Promise.resolve(); v.pause(); }
      for (const el of document.querySelectorAll('[data-reveal]')) el.style.opacity = '1';
      // Load lazy images by walking the page once.
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      await Promise.all(videos.map((v) => new Promise((r) => { v.pause(); v.addEventListener('seeked', r, { once: true }); v.currentTime = 0; setTimeout(r, 1500); })));
      await new Promise((r) => setTimeout(r, 300));
    });
    const file = join(OUT, `${cmd}-${vp}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${file} ${size.width}x${await page.evaluate(() => document.documentElement.scrollHeight)}`);
    await page.close();
  }
} finally {
  await browser.close();
  stop();
}

function usage() { console.error('usage: shots.mjs <name> | diff <a> <b>'); process.exit(2); }
