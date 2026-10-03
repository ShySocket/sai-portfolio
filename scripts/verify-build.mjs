#!/usr/bin/env node
// Build-time assertions on dist/, run by `npm run build` after `astro build` (so the GitHub Pages deploy, which
// runs the build script through withastro/action, fails instead of shipping a violation). Node built-ins only.
//
//   node scripts/verify-build.mjs
//
// Every built page (dist/**/index.html and any other .html) is checked.
//
// 1. Verbatim: every rendered string that claims to come from the data files matches them. Any element with
//    data-verbatim="projects" (src/data/projects.ts, the confirmed copy) or data-verbatim="case"
//    (src/data/case-studies.ts, the sourced case-study copy) must have its text (an <img>: its alt) as a substring of
//    that file's string literals. Every page must declare data-page and carry at least 3 such strings, so a new page
//    or markup that forgets the attribute fails instead of checking nothing.
//    Data files only hold copy; templates may only pick phrases out of them, never write new ones.
// 2. Media: dist/assets ships no PNG and no untransformed image original (only astro:assets encodes).
// 3. Typography: no em or en dashes in rendered text (HTML text and attributes, and the strings in JS and CSS).

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const dist = join(root, 'dist');
const failures = [];
const fail = (msg) => failures.push(msg);

// ------------------------------------------------------------------ corpora: the string literals of the data files
const unescape = (s) => s.replace(/\\(.)/g, '$1');
// Whitespace runs (U+00A0 included) fold to one space, and a non-breaking hyphen (U+2011) reads as a hyphen: both
// are ties src/lib/text.ts adds at render time, never a change of wording.
const squash = (s) => s.replace(/\u2011/g, '-').replace(/\s+/g, ' ').trim();
const literals = (file) =>
  existsSync(join(root, file))
    ? [...readFileSync(join(root, file), 'utf8').matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)].map((m) => squash(unescape(m[1] ?? m[2]))).join('\n')
    : '';
const corpora = { projects: literals('src/data/projects.ts'), case: literals('src/data/case-studies.ts') };

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

const all = (el, test, out = []) => {
  for (const c of el.children ?? []) if (typeof c === 'object') { if (test(c)) out.push(c); all(c, test, out); }
  return out;
};
const text = (el) => squash((el.children ?? []).map((c) => (typeof c === 'string' ? c : RAW.has(c.tag) ? '' : text(c))).join(''));

// ------------------------------------------------------------------ 1. verbatim
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const files = walk(dist);
const pages = files.filter((f) => extname(f) === '.html');
let verbatim = 0;
const perPage = [];

for (const page of pages) {
  const d = parse(readFileSync(page, 'utf8'));
  const tagged = all(d, (el) => el.attrs && 'data-verbatim' in el.attrs);
  const kind = all(d, (el) => el.attrs && 'data-page' in el.attrs)[0]?.attrs['data-page'];
  perPage.push(`${relative(dist, page).replace(/(^|\/)index\.html$/, '') || '/'} ${tagged.length}`);
  if (kind === undefined) fail(`verbatim: ${relative(root, page)} declares no data-page, so its copy is unchecked`);
  else if (tagged.length < 3) fail(`verbatim: ${relative(root, page)} declares data-page but tags only ${tagged.length} data-verbatim strings`);
  for (const el of tagged) {
    const which = el.attrs['data-verbatim'] || 'projects';
    const ref = corpora[which];
    const s = el.tag === 'img' ? squash(el.attrs.alt ?? '') : text(el);
    verbatim++;
    if (ref === undefined) fail(`verbatim: ${relative(root, page)} uses unknown data-verbatim="${which}"`);
    else if (!s) fail(`verbatim: ${relative(root, page)} has an empty data-verbatim="${which}" ${el.tag}`);
    else if (!ref.includes(s)) fail(`verbatim: ${relative(root, page)} "${s.slice(0, 90)}" is not a substring of the ${which} data file`);
  }
}

// ------------------------------------------------------------------ 2. media
const assets = files.filter((f) => f.startsWith(join(dist, 'assets') + '/'));
const IMAGE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
for (const f of assets) {
  const ext = extname(f).toLowerCase();
  if (ext === '.png') fail(`media: ${relative(root, f)} is a PNG (only astro:assets encodes may ship)`);
  // astro:assets names an encode name.HASH_OPTIONS.ext and an original name.HASH.ext, where HASH is Vite's 8-char
  // base64url hash (it may hold '_' or '-', as relief-2.D_wTC6FU does) and OPTIONS is alphanumeric. So the part
  // between the last two dots must be the 8-char hash, then '_' and the options; anything else is an original.
  else if (IMAGE.has(ext) && !/^[\w-]{8}_[A-Za-z0-9]+$/.test(f.split('/').pop().split('.').slice(-2, -1)[0] ?? '')) fail(`media: ${relative(root, f)} is an untransformed original`);
}

// ------------------------------------------------------------------ 3. dashes
const DASH = /[–—]|&(?:mdash|ndash);|&#(?:8211|8212);|&#x201[34];/i;
const at = (s, i) => JSON.stringify(s.slice(Math.max(0, i - 30), i + 30));
let m;
for (const page of pages) {
  const rendered = readFileSync(page, 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  if ((m = DASH.exec(rendered))) fail(`dashes: ${relative(root, page)} renders an em or en dash near ${at(rendered, m.index)}`);
}
for (const f of files.filter((f) => ['.js', '.css'].includes(extname(f)))) {
  const code = readFileSync(f, 'utf8');
  if ((m = DASH.exec(code))) fail(`dashes: ${relative(root, f)} carries an em or en dash near ${at(code, m.index)}`);
}

if (failures.length) {
  console.error(`verify-build: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log(`verify-build: OK (${pages.length} page(s), ${verbatim} verbatim strings [${perPage.join(', ')}], ${assets.length} assets with no PNG or original, no em or en dashes)`);
