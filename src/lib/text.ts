// Small render helpers shared by the v3 pages.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** The base path without its trailing slash ('/sai-portfolio'). */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** A path below the base: url('work/sidequest/') is '/sai-portfolio/work/sidequest/'. */
export const url = (path = '') => `${base}/${path.replace(/^\/+/, '')}`;

/** The case study route of a slug. */
export const caseUrl = (slug: string) => url(`work/${slug}/`);

/** An href from the data: absolute URLs and mailto stay, a public/ path gets the base. */
export const href = (h: string) => (/^(?:[a-z]+:|#)/i.test(h) ? h : url(h));

// No-break spaces keep a version, a model name, a sensor pair or a number and its unit on one line, and a
// non-breaking hyphen (U+2011, which Schibsted Grotesk draws at its hyphen width) keeps a short compound such as
// on-device from breaking after its hyphen in the narrow facts rail. They never change what verify-build reads: it
// folds every whitespace run, U+00A0 included, to one space and reads U+2011 as a hyphen.
const NBH = '‑';
const NBSP = ' ';
const TIES: [RegExp, string][] = [
  [/\bon-device\b/g, `on${NBH}device`],
  [/\b(Unity|SAM) (\d)/g, `$1${NBSP}$2`],
  [/\bGPS \+ IMU\b/g, `GPS${NBSP}+${NBSP}IMU`],
  [/(\d) (m\/s|px\/s|s|ms|Hz|MB|m|frames|events)\b/g, `$1${NBSP}$2`],
];
export function tie(text: string): string {
  return TIES.reduce((s, [re, to]) => s.replace(re, to), text);
}

/** Fails the build when a file under public/ that a page links to is missing (a dead Résumé link is the worst case). */
export function requirePublic(path: string): string {
  if (!existsSync(join(process.cwd(), 'public', path))) throw new Error("pages: public/" + path + " is missing");
  return url(path);
}
