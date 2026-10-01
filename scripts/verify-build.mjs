#!/usr/bin/env node
// Build-time assertions on dist/, run by `npm run build` after `astro build` (so the GitHub Pages deploy, which
// runs the build script through withastro/action, fails instead of shipping a violation). Node built-ins only.
//
//   node scripts/verify-build.mjs
//
// 1. Verbatim: every rendered string that is derived from projects.ts (claims, clip captions and still alts,
//    index titles, kickers and awards, flow nodes, key labels, tags) is a substring of a projects.ts string.
//    projects.ts is the confirmed copy; presentation.ts may only pick phrases out of it, never write new ones.
// 2. Media: dist/assets ships no PNG and no untransformed image original (only astro:assets encodes).
// 3. Typography: no em or en dashes in rendered text (HTML text and attributes, and the strings in JS and CSS).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const dist = join(root, 'dist');
const failures = [];
const fail = (msg) => failures.push(msg);

// ------------------------------------------------------------------ corpus: the string literals of projects.ts
const source = readFileSync(join(root, 'src/data/projects.ts'), 'utf8');
const unescape = (s) => s.replace(/\\(.)/g, '$1');
const squash = (s) => s.replace(/\s+/g, ' ').trim();
const corpus = [...source.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)].map((m) => squash(unescape(m[1]))).join('\n');

// ------------------------------------------------------------------ a small HTML tree (Astro output is well formed)
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (entities[e] ?? m),
  );

function parse(html) {
  const top = { tag: '#root', attrs: {}, children: [] };
  const stack = [top];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    const parent = stack[stack.length - 1];
    if (m[4] !== undefined) parent.children.push(decode(m[4]));
    else if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const attrs = {};
      for (const a of m[3].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
      const el = { tag, attrs, children: [] };
      parent.children.push(el);
      if (RAW.has(tag)) {
        const end = html.indexOf(`</${tag}`, re.lastIndex);
        el.children.push(html.slice(re.lastIndex, end));
        re.lastIndex = html.indexOf('>', end) + 1;
      } else if (!VOID.has(tag) && !/\/\s*$/.test(m[3])) stack.push(el);
    }
  }
  return top;
}

const classes = (el) => (el.attrs?.class ?? '').split(/\s+/);
const has = (el, c) => typeof el === 'object' && classes(el).includes(c);
const all = (el, test, out = []) => {
  for (const c of el.children ?? []) if (typeof c === 'object') { if (test(c)) out.push(c); all(c, test, out); }
  return out;
};
const text = (el) => squash((el.children ?? []).map((c) => (typeof c === 'string' ? c : RAW.has(c.tag) ? '' : text(c))).join(''));

// ------------------------------------------------------------------ 1. verbatim
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const doc = parse(html);
const byClass = (c) => all(doc, (el) => has(el, c));
const kids = (el, tag) => (el.children ?? []).filter((c) => typeof c === 'object' && c.tag === tag);

// What claims to be verbatim, by the class that renders it, with the least the page must hold (so a renamed class
// fails loudly instead of checking nothing).
const checks = [
  ['entry title', byClass('entry__title').map(text), 5],
  ['claim', byClass('claim').map(text), 4],
  ['award', [...byClass('award'), ...byClass('row__award')].map(text), 2],
  ['tag', byClass('tags').flatMap((ul) => kids(ul, 'li').map(text)), 20],
  ['clip caption', byClass('cap__label').map(text), 3],
  ['clip still alt', byClass('well__still').map((img) => img.attrs.alt ?? ''), 3],
  ['index title', byClass('row__title').map(text), 5],
  ['index kicker', byClass('kicker').flatMap((ul) => kids(ul, 'li').map(text)), 15],
  ['flow node', [...byClass('flow__node'), ...byClass('flow__parts').flatMap((ul) => kids(ul, 'li'))].map(text), 7],
  ['key label', byClass('keys').flatMap((k) => all(k, (el) => el.tag === 'a').map((a) => text(kids(a, 'span')[0] ?? { children: [] }))), 6],
];
let verbatim = 0;
for (const [what, strings, min] of checks) {
  if (strings.length < min) fail(`verbatim: expected at least ${min} ${what} strings in dist/index.html, found ${strings.length}`);
  for (const s of strings) {
    verbatim++;
    if (!s) fail(`verbatim: an empty ${what}`);
    else if (!corpus.includes(s)) fail(`verbatim: ${what} "${s}" is not a substring of src/data/projects.ts copy`);
  }
}

// ------------------------------------------------------------------ 2. media
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const files = walk(dist);
const assets = files.filter((f) => f.startsWith(join(dist, 'assets') + '/'));
const IMAGE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
for (const f of assets) {
  const ext = extname(f).toLowerCase();
  if (ext === '.png') fail(`media: ${relative(root, f)} is a PNG (only astro:assets encodes may ship)`);
  // astro:assets names an encode name.HASH_OPTIONS.ext; an original keeps name.HASH.ext.
  else if (IMAGE.has(ext) && !/_[\w-]+\.\w+$/.test(f.split('/').pop())) fail(`media: ${relative(root, f)} is an untransformed original`);
}

// ------------------------------------------------------------------ 3. dashes
const DASH = /[–—]|&(?:mdash|ndash);|&#(?:8211|8212);|&#x201[34];/i;
const rendered = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
const at = (s, i) => JSON.stringify(s.slice(Math.max(0, i - 30), i + 30));
let m = DASH.exec(rendered);
if (m) fail(`dashes: dist/index.html renders an em or en dash near ${at(rendered, m.index)}`);
for (const f of files.filter((f) => ['.js', '.css'].includes(extname(f)))) {
  const code = readFileSync(f, 'utf8');
  if ((m = DASH.exec(code))) fail(`dashes: ${relative(root, f)} carries an em or en dash near ${at(code, m.index)}`);
}

if (failures.length) {
  console.error(`verify-build: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log(`verify-build: OK (${verbatim} verbatim strings, ${assets.length} assets with no PNG or original, no em or en dashes)`);
