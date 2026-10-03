#!/usr/bin/env node
// Builds the public résumé, public/Sai_Bhandar_Resume.pdf, from Sai's LaTeX master without editing the master.
//
//   node scripts/resume.mjs              (macOS with TeX Live: pdflatex; swift is optional, for the text check)
//   node scripts/resume.mjs --fix-links  (also gives scheme-less \href targets an https:// prefix, in the copy only)
//
// The master links LinkedIn as \href{www.linkedin.com/in/sai-bhandar}{...}; with no scheme, hyperref writes a
// GoToR action to a local file "www.linkedin.com/in/sai-bhandar.pdf", so that link is dead in every viewer. The
// real fix is https:// in the master; --fix-links patches only this build. Off by default: the public copy
// differs from the master only by the phone entry unless asked.
//
// 1. Copies ~/Documents/Resume/swe-latex (RESUME_SRC overrides) into a fresh temp folder (RESUME_WORK overrides).
// 2. In the copy only, deletes the phone entry of src/heading.tex (the \seticon{faPhone} ... \quad line), keeping
//    its \small so the email, LinkedIn and portfolio entries keep their size. Nothing else changes.
// 3. Runs pdflatex twice (the engine Overleaf uses), with SOURCE_DATE_EPOCH set to the newest source file, so the
//    same sources always give the same bytes.
// 4. Checks: one page; with swift (PDFKit), the page text holds the email and no phone digits.
// 5. Copies the PDF to public/Sai_Bhandar_Resume.pdf (RESUME_OUT overrides, for a trial build).

import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const src = process.env.RESUME_SRC ?? join(homedir(), 'Documents/Resume/swe-latex');
const work = process.env.RESUME_WORK ?? mkdtempSync(join(tmpdir(), 'resume-'));
const out = process.env.RESUME_OUT ?? join(root, 'public/Sai_Bhandar_Resume.pdf');
const die = (msg) => { console.error(`resume: ${msg}`); process.exit(1); };

if (!existsSync(join(src, 'resume.tex'))) die(`no resume.tex in ${src}`);
if (resolve(work) === resolve(src)) die('the work folder must not be the master');

// 1. Copy (never .DS_Store).
cpSync(src, work, { recursive: true, filter: (p) => !p.endsWith('.DS_Store') });

// 2. Drop the phone entry, in the copy only.
const heading = join(work, 'src/heading.tex');
const tex = readFileSync(heading, 'utf8');
const phone = /^([ \t]*)\\seticon\{faPhone\}[^\n]*\\quad[ \t]*$/gm;
const hits = tex.match(phone) ?? [];
if (hits.length !== 1) die(`expected exactly one phone line in src/heading.tex, found ${hits.length}`);
const digits = (hits[0].match(/\d{3}-\d{3}-\d{4}/) ?? [])[0];
let patched = tex.replace(phone, '$1\\small');
if (process.argv.includes('--fix-links')) patched = patched.replace(/\\href\{(?![a-z]+:)([^}]+)\}/g, '\\href{https://$1}');
writeFileSync(heading, patched);

// 3. pdflatex twice, reproducible dates.
const newest = (dir) => Math.max(...readdirSync(dir).map((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? newest(p) : statSync(p).mtimeMs;
}));
const env = { ...process.env, SOURCE_DATE_EPOCH: String(Math.floor(newest(src) / 1000)), FORCE_SOURCE_DATE: '1' };
for (let i = 0; i < 2; i++) {
  try {
    execFileSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', 'resume.tex'], { cwd: work, env, stdio: 'pipe', timeout: 180_000 });
  } catch (e) {
    die(`pdflatex failed (run ${i + 1}); see ${join(work, 'resume.log')}`);
  }
}

// 4. Checks.
const log = readFileSync(join(work, 'resume.log'), 'latin1');
const pages = /Output written on resume\.pdf \((\d+) pages?/.exec(log)?.[1];
if (pages !== '1') die(`expected 1 page, pdflatex wrote ${pages ?? 'no'} page(s)`);
const pdf = join(work, 'resume.pdf');
let textCheck = 'skipped (no swift)';
try {
  execFileSync('swift', ['--version'], { stdio: 'ignore', timeout: 30_000 });
  const script = join(work, 'pdftext.swift');
  writeFileSync(script, [
    'import PDFKit',
    'let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!',
    'print(doc.pageCount)',
    'print(doc.string ?? "")',
  ].join('\n'));
  const [count, ...lines] = execFileSync('swift', [script, pdf], { encoding: 'utf8', timeout: 300_000 }).split('\n');
  const text = lines.join('\n');
  if (count.trim() !== '1') die(`PDFKit counts ${count.trim()} pages`);
  if (!text.includes('saib@andrew.cmu.edu')) die('the email is missing from the PDF text');
  for (const bad of [digits, digits?.replace(/-/g, ''), '609-0691']) if (bad && text.includes(bad)) die(`the PDF text still holds ${bad}`);
  textCheck = 'no phone digits, email present';
} catch (e) {
  if (e?.code !== 'ENOENT') throw e; // only a missing swift skips the check; a failing one stops the build
}

// 5. Publish.
copyFileSync(pdf, out);
console.log(`resume: OK (1 page, ${textCheck}) -> ${out} (${statSync(out).size} bytes; work folder ${work})`);
