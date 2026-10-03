#!/usr/bin/env node
// Playwright screenshots and page checks for the built site.
//
//   node scripts/shots.mjs before            -> before-{mobile,tablet,desktop}.png (+ -fold.png, first viewport only)
//   node scripts/shots.mjs after             -> after-*.png
//   node scripts/shots.mjs diff before after -> diff-*.png + changed-pixel counts (exit 1 above TOLERANCE)
//   node scripts/shots.mjs check             -> page checks on every route at every viewport; exit 1 on any FAIL
//
// Routes: every index.html under dist/ (home, then /work/<slug>/ ...). Home shots keep the plain <name>-<vp>.png
// names (so diff works across versions); other routes are <name>-<route-slug>-<vp>.png.
//
// Options: --url <site>  use an already-running server instead of serving dist/ (scripts/serve.mjs); home only
//                        unless --routes is given
//          --routes -,work/sidequest  limit routes ('-' is home)
//          --vp mobile,desktop  limit viewports
// Env:     PORT (default 4321) for the dist/ server; $A11Y_OUT for output (default: autopilot artifacts dir).
//
// Uses the installed Google Chrome (channel 'chrome'), so no browser download. Screenshots emulate
// prefers-reduced-motion and freeze videos on frame 0 so output is stable between runs.

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { serve } from './serve.mjs';

const PORT = Number(process.env.PORT) || 4321;
const OUT = resolve(process.env.A11Y_OUT || join(homedir(), 'Documents/autopilot/artifacts/sai-portfolio-a11y'));
const root = resolve(new globalThis.URL('..', import.meta.url).pathname);
const TOLERANCE = 0.01; // % of pixels allowed to differ (video frame-0 decode jitter is ~0.004%)
const CLS_MAX = 0.02;
// Chrome cannot capture more than 16384 device px in one screenshot; past that the bottom of a full-page
// shot repeats the top. Pages taller than this at the viewport's DPR get their full-page shot at DPR 1.
const MAX_CAPTURE_PX = 16384;
const ALL_VIEWPORTS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

mkdirSync(OUT, { recursive: true });
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv.splice(i, 2)[1] : undefined; };
const url = opt('url');
const vpList = opt('vp');
const routeList = opt('routes');
const VIEWPORTS = Object.fromEntries(Object.entries(ALL_VIEWPORTS).filter(([k]) => !vpList || vpList.split(',').includes(k)));
const [cmd, ...rest] = argv;

if (cmd === 'diff') {
  const [a, b] = rest;
  if (!a || !b) usage();
  let changed = false;
  for (const vp of Object.keys(VIEWPORTS)) {
    const pa = join(OUT, `${a}-${vp}.png`), pb = join(OUT, `${b}-${vp}.png`);
    let ia, ib;
    try { [ia, ib] = await Promise.all([pa, pb].map((p) => sharp(p).raw().ensureAlpha().toBuffer({ resolveWithObject: true }))); }
    catch { console.log(`${vp}: skipped (missing ${a} or ${b} shot)`); continue; }
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

const SITE = url || `http://127.0.0.1:${PORT}/sai-portfolio/`;
const server = url ? null : await serve(join(root, 'dist'), PORT);
const stop = () => server?.close();

// '' is home, 'work/sidequest/' a case study; home first, then alphabetical.
const norm = (r) => (r === '-' || r === '' || r === '/' ? '' : `${r.replace(/^\/+|\/+$/g, '')}/`);
const findRoutes = (dir, base = '') =>
  readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) return f === 'assets' || f === 'media' ? [] : findRoutes(full, `${base}${f}/`);
    return f === 'index.html' ? [base] : [];
  });
const ROUTES = routeList ? routeList.split(',').map(norm) : url ? [''] : findRoutes(join(root, 'dist')).sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)));
const slug = (r) => (r ? r.replace(/\/$/, '').replace(/\//g, '-') : 'home');
if (!url && !existsSync(join(root, 'dist', 'index.html'))) { console.error('dist/ is not built; run npm run build'); process.exit(2); }

const browser = await chromium.launch({ channel: 'chrome', args: ['--hide-scrollbars'] });
let failed = false;
try {
  if (cmd === 'check') failed = await check();
  else await shots(cmd);
} finally {
  await browser.close();
  stop();
}
process.exit(failed ? 1 : 0);

async function shots(name) {
  for (const route of ROUTES) for (const [vp, device] of Object.entries(VIEWPORTS)) {
    const href = SITE + route;
    const base = route ? `${name}-${slug(route)}-${vp}` : `${name}-${vp}`;
    const { context, page } = await openFrozen(device, href);
    const file = join(OUT, `${base}.png`);
    await page.screenshot({ path: join(OUT, `${base}-fold.png`) });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    if (height * device.deviceScaleFactor > MAX_CAPTURE_PX) {
      const tall = await openFrozen({ ...device, deviceScaleFactor: 1 }, href);
      await tall.page.screenshot({ path: file, fullPage: true });
      await tall.context.close();
    } else {
      await page.screenshot({ path: file, fullPage: true });
    }
    console.log(`${file} ${device.viewport.width}x${height}${height * device.deviceScaleFactor > MAX_CAPTURE_PX ? ' (full page at DPR 1)' : ''}`);
    await context.close();
  }
}

async function openFrozen(device, href) {
  const context = await browser.newContext({ ...device, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(href, { waitUntil: 'networkidle' });
  await settle(page);
  await page.evaluate(async () => {
    // Freeze videos on frame 0 (the site's IntersectionObserver would otherwise play them).
    const videos = [...document.querySelectorAll('video')];
    for (const v of videos) { v.play = () => Promise.resolve(); v.pause(); }
    await Promise.all(videos.map((v) => new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = 0; setTimeout(r, 1500); })));
    await new Promise((r) => setTimeout(r, 300));
  });
  return { context, page };
}

// Load fonts and lazy media by walking the page once, then return to the top. With motion on, walk at
// reading pace (150ms per 600px) so IntersectionObserver reveals fire; faster steps skip them.
async function settle(page, step = 40) {
  await page.evaluate(async (step) => {
    await document.fonts.ready;
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, step)); }
    window.scrollTo(0, document.body.scrollHeight); // hold at the bottom so the last observers fire
    await new Promise((r) => setTimeout(r, step * 4));
    window.scrollTo(0, 0);
  }, step);
  await page.waitForTimeout(800); // let one-shot reveals finish
}

async function check() {
  const results = [];
  let route = '';
  const report = (level, vp, mode, id, detail) => {
    results.push({ level, route: slug(route), vp, mode, id, detail });
    console.log(`${level.padEnd(4)} ${slug(route)} ${vp}/${mode} ${id}${detail ? ` — ${detail}` : ''}`);
  };

  for (route of ROUTES) for (const [vp, device] of Object.entries(VIEWPORTS)) {
    for (const mode of ['reduce', 'motion', 'nojs']) {
      const context = await browser.newContext({
        ...device,
        reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
        javaScriptEnabled: mode !== 'nojs',
      });
      const page = await context.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(new URL(SITE).origin)) errors.push(`${r.status()} ${r.url()}`); });
      if (mode !== 'nojs') {
        await page.addInitScript(() => {
          window.__cls = 0;
          new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
            .observe({ type: 'layout-shift', buffered: true });
        });
      }
      await page.goto(SITE + route, { waitUntil: 'networkidle' });
      if (mode === 'nojs') await page.waitForTimeout(300);
      else await settle(page, mode === 'motion' ? 150 : 40);

      for (const e of errors) report('FAIL', vp, mode, 'console-or-network-error', e);

      const facts = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth > vw + 1
          ? [...document.querySelectorAll('body *')]
              .filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed'; })
              .slice(0, 5).map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} right=${Math.round(el.getBoundingClientRect().right)}`)
          : [];
        const effOpacity = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
        const hidden = [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main figure, main a, main video, main img')]
          .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
          .filter((el) => effOpacity(el) < 0.99)
          .slice(0, 5).map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('alt') || '').trim().slice(0, 40)}"`);
        const small = [...document.querySelectorAll('a[href], button, [role="button"], input, select, textarea')]
          .filter((el) => el.getClientRects().length)
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width < 24 || r.height < 24; })
          .slice(0, 6).map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
        return {
          overflow,
          hidden,
          small,
          noPoster: [...document.querySelectorAll('video:not([poster])')].length,
          noAlt: [...document.querySelectorAll('img:not([alt])')].length,
          noHref: [...document.querySelectorAll('a:not([href])')].length,
          blankNoRel: [...document.querySelectorAll('a[target="_blank"]:not([rel~="noopener"])')].length,
          running: document.getAnimations ? document.getAnimations().filter((a) => a.playState === 'running').length : 0,
          cls: window.__cls ?? 0,
        };
      });

      if (facts.overflow.length) report('FAIL', vp, mode, 'horizontal-overflow', facts.overflow.join('; '));
      if (facts.hidden.length) report('FAIL', vp, mode, 'content-not-visible', facts.hidden.join('; '));
      if (facts.noPoster) report('FAIL', vp, mode, 'video-without-poster', `${facts.noPoster}`);
      if (facts.noAlt) report('FAIL', vp, mode, 'img-without-alt', `${facts.noAlt}`);
      if (facts.noHref) report('FAIL', vp, mode, 'link-without-href', `${facts.noHref}`);
      if (facts.cls > CLS_MAX) report('FAIL', vp, mode, 'layout-shift', `CLS ${facts.cls.toFixed(3)} > ${CLS_MAX}`);
      if (facts.small.length) report('WARN', vp, mode, 'target-under-24px', facts.small.join('; '));
      if (facts.blankNoRel) report('WARN', vp, mode, 'target-blank-without-noopener', `${facts.blankNoRel}`);
      if (mode === 'reduce' && facts.running) report('WARN', vp, mode, 'animations-running-under-reduced-motion', `${facts.running}`);

      // Keyboard: every focus stop must show a visible indicator.
      if (mode === 'reduce') {
        const unfocusable = [];
        for (let i = 0; i < 40; i++) {
          await page.keyboard.press('Tab');
          const f = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const s = getComputedStyle(el);
            const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
            return { ring, label: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"` };
          });
          if (!f) break;
          if (!f.ring) unfocusable.push(f.label);
        }
        if (unfocusable.length) report('FAIL', vp, mode, 'focus-not-visible', [...new Set(unfocusable)].slice(0, 6).join('; '));
      }
      await context.close();
    }
  }

  const fails = results.filter((r) => r.level === 'FAIL').length;
  const warns = results.filter((r) => r.level === 'WARN').length;
  const file = join(OUT, 'check.json');
  writeFileSync(file, JSON.stringify({ site: SITE, routes: ROUTES.map(slug), fails, warns, results }, null, 2));
  console.log(`\n${fails ? 'FAIL' : 'PASS'}: ${fails} fail, ${warns} warn on ${ROUTES.length} route(s) (${ROUTES.map(slug).join(', ')}) -> ${file}`);
  return fails > 0;
}

function usage() { console.error('usage: shots.mjs <name> | check | diff <a> <b>  [--url <site>] [--routes -,work/<slug>] [--vp mobile,tablet,desktop]'); process.exit(2); }
