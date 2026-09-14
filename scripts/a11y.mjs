#!/usr/bin/env node
// Lighthouse accessibility gate for the production build.
//
//   npm run a11y            build, serve dist/, audit mobile + desktop, exit 1 below the threshold
//   npm run a11y -- --no-build   skip `astro build` (reuse dist/)
//
// Chrome runs with --force-prefers-reduced-motion so the [data-reveal] elements that
// GSAP keeps at opacity:0 until scrolled are visible and therefore actually audited.
// Reports go to $A11Y_OUT (default ~/Documents/autopilot/artifacts/sai-portfolio-a11y).

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const THRESHOLD = 95;
const PORT = 4321;
const SITE = `http://127.0.0.1:${PORT}/sai-portfolio/`;
const OUT = resolve(process.env.A11Y_OUT || join(homedir(), 'Documents/autopilot/artifacts/sai-portfolio-a11y'));
const root = resolve(new globalThis.URL('..', import.meta.url).pathname);
const bin = (name) => join(root, 'node_modules/.bin', name);
const noBuild = process.argv.includes('--no-build');

mkdirSync(OUT, { recursive: true });

if (!noBuild) {
  console.log('> astro build');
  execFileSync(bin('astro'), ['build'], { cwd: root, stdio: 'inherit' });
}

const server = spawn(bin('astro'), ['preview', '--host', '127.0.0.1', '--port', String(PORT)], { cwd: root, stdio: 'ignore' });
const stop = () => { if (!server.killed) server.kill('SIGTERM'); };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });

async function waitFor(url, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`preview server did not start at ${url}`);
}

function audit(mode) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = join(OUT, `lighthouse-${mode}-${stamp}`);
  const args = [
    SITE,
    '--only-categories=accessibility',
    '--output=json', '--output=html',
    `--output-path=${path}`,
    '--chrome-flags=--headless=new --force-prefers-reduced-motion --no-first-run',
    '--quiet',
  ];
  if (mode === 'desktop') args.push('--preset=desktop');
  execFileSync(bin('lighthouse'), args, { cwd: root, stdio: 'inherit' });
  const lhr = JSON.parse(readFileSync(`${path}.report.json`, 'utf8'));
  const score = Math.round(lhr.categories.accessibility.score * 100);
  const failing = Object.values(lhr.audits)
    .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative')
    .map((a) => ({
      id: a.id,
      title: a.title,
      nodes: (a.details?.items || []).map((i) => i.node?.selector || i.node?.snippet || '').filter(Boolean).slice(0, 8),
    }));
  return { mode, score, failing, report: `${path}.report.html` };
}

let ok = true;
try {
  await waitFor(SITE);
  for (const mode of ['mobile', 'desktop']) {
    const r = audit(mode);
    console.log(`\n${mode}: accessibility ${r.score}  (${r.report})`);
    for (const f of r.failing) {
      console.log(`  FAIL ${f.id} — ${f.title}`);
      for (const n of f.nodes) console.log(`       ${n}`);
    }
    if (r.score < THRESHOLD) ok = false;
  }
} finally {
  stop();
}

console.log(ok ? `\nPASS: both presets >= ${THRESHOLD}` : `\nFAIL: a preset scored below ${THRESHOLD}`);
process.exit(ok ? 0 : 1);
