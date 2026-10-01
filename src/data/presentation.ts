// Presentation for each project, keyed by slug. Copy lives in projects.ts, which stays byte-identical to
// main; this file only adds layout family, measured media addresses, thumbnails and evidence keys.
//
// Strings introduced here (evidence-key labels, cue captions and the clip provenance line) are new copy,
// flagged for Sai's review.
import type { ImageMetadata } from 'astro';
import sidequestStill from '../assets/stills/sidequest-4.5.webp';
import sunriseStill from '../assets/stills/sunrise-13.7.webp';
import gyroblasterStill from '../assets/stills/gyroblaster-4.6.webp';

export type Family = 'stage' | 'phone' | 'spread' | 'pair';

/** A measured address in a clip: `t` seconds, 2-4 frames after the overlay or moment appears. */
export type Cue = { t: number; caption: string };

export type Clip = {
  src: string; // served path under public/
  /** The pinned frame at `t` (a build input): shown at first paint, for no JS, print, reduced motion, Save-Data.
   *  It ships as AVIF and WebP at `widths`; never read its fields directly (that ships the original too). */
  still: ImageMetadata;
  width: number; // intrinsic size of the still
  height: number;
  widths: number[];
  /** The well's rendered width at each layout (global.css): the band and pair columns, or full bleed. */
  sizes: string;
  t: number;
  duration: number;
  cues: Cue[];
  /** Only the first-viewport loop may fetch and play on its own; every other clip plays on the key. */
  autoplay?: boolean;
  /** Previous/next cue keys: only where there is more than one cue. */
  cueKeys?: boolean;
  /** The caption's second line: file facts only (measured with ffprobe), and the uncut file on demand
   *  (linked, never autoplayed or preloaded). The first line is always media.label, verbatim. */
  provenance?: { facts: string[]; full?: { src: string; label: string } };
};

/** An evidence key after a note: where on the page its proof is. `target` is an element id. */
export type Proof = { label: string; target: string; icon?: 'clock-play' };

export type Presentation = {
  family: Family;
  kind: 'play' | 'phone' | 'movie' | 'award';
  thumb: { src: string; width: number; height: number };
  clip?: Clip;
  proofs?: Record<string, Proof>; // keyed by the note's lead-in title
};

// Column widths in CSS px, as global.css lays them out: 32px margins and gutters from 768, 12 columns in a
// content box capped at 1600px. `cols(n)` is n columns plus their n - 1 gutters.
const content = 'min(100vw - 64px, 1600px)';
const cols = (n: number) => `calc((${content} - 352px) * ${n} / 12 + ${(n - 1) * 32}px)`;
const narrow = '(min-width: 768px) min(1120px, calc(100vw - 64px)), 100vw'; // a field in the column, or full bleed

// Sidequest cue captions are the clip's own overlay text; "Audit overlay:" says what that text is.
const audit = (label: string) => `Audit overlay: CLEAR ${label}`;

export const presentation: Record<string, Presentation> = {
  sidequest: {
    family: 'stage',
    kind: 'play',
    thumb: { src: 'media/thumb-sidequest.webp', width: 96, height: 56 },
    clip: {
      src: 'media/sidequest-loop.mp4',
      still: sidequestStill,
      // 1024x576, a little over the loop's 960x540: where the stage upscales (wells over 960px), Chrome caps an
      // element's LCP size at its intrinsic area, so the widest still the srcset offers (1024w) must out-measure
      // the video's first frame to stay the LCP. Below 960px the video's 1px inset (global.css) does the same job.
      width: 1024,
      height: 576,
      widths: [480, 768, 1024],
      sizes: `(min-width: 1024px) ${cols(8)}, 100vw`, // columns 5-12 of the band from 1024; full bleed below
      t: 4.5,
      duration: 12,
      autoplay: true,
      cueKeys: true,
      // Frames 51, 135, 231, 282, 336 of the loop: >= 1.7 s apart, so >= 24px apart on a 176px track (320px).
      cues: [
        { t: 1.7, caption: audit('people') },
        { t: 4.5, caption: audit('sign, on bush') },
        { t: 7.7, caption: audit('off the hedge') },
        { t: 9.4, caption: audit('car') },
        { t: 11.2, caption: audit('pole') },
      ],
      // The loop is frames 0-359 (12.0 s) of the 750-frame, 25.0 s capture; the capture is 3,747,147 B.
      provenance: {
        facts: ['12 s loop of the 25 s capture'],
        full: { src: 'media/sidequest.mp4', label: 'Full capture, 3.7 MB' },
      },
    },
    proofs: {
      'Footage becomes the level': { label: 'Show 0:04.5 in clip', target: 'sidequest-4.5', icon: 'clock-play' },
      'Choreography that stays a game': { label: 'Show cue track', target: 'sidequest-cues' },
    },
  },
  'lazer-shooter': {
    family: 'phone',
    kind: 'phone',
    thumb: { src: 'media/thumb-lazer.webp', width: 26, height: 56 },
  },
  reliefiq: {
    family: 'spread',
    kind: 'award',
    thumb: { src: 'media/thumb-reliefiq.webp', width: 96, height: 56 },
    proofs: {
      'Resource Allocation Management': { label: 'Show match scores', target: 'reliefiq-allocation' },
      'Volunteer Information Platform': { label: 'Show image analyzer', target: 'reliefiq-volunteer' },
    },
  },
  sunrise: {
    family: 'pair',
    kind: 'movie',
    thumb: { src: 'media/thumb-sunrise.webp', width: 96, height: 56 },
    clip: {
      src: 'media/sunrise-scene.mp4',
      still: sunriseStill,
      width: 600,
      height: 338,
      widths: [600],
      sizes: `(min-width: 1200px) ${cols(7)}, ${narrow}`,
      // Frame 411: two stacked floors with decals, and the only stretch with nothing selected (no transform
      // gizmo or camera frustum over the scene; see scripts/media.mjs).
      t: 13.7,
      duration: 29.4,
      cues: [{ t: 13.7, caption: '' }], // caption falls back to media.label (verbatim)
    },
    proofs: {
      'Hybrid XY / Z generation': { label: 'Show 0:13.7 in clip', target: 'sunrise-13.7', icon: 'clock-play' },
    },
  },
  gyroblaster: {
    family: 'pair',
    kind: 'movie',
    thumb: { src: 'media/thumb-gyroblaster.webp', width: 96, height: 56 },
    clip: {
      src: 'media/gyroblaster.mp4',
      still: gyroblasterStill,
      width: 960,
      height: 540,
      widths: [480, 768, 960],
      sizes: `(min-width: 1200px) ${cols(5)}, ${narrow}`,
      t: 4.6,
      duration: 9.4,
      cues: [{ t: 4.6, caption: '' }],
    },
  },
};

/** ReliefIQ detail regions, measured on the 2048px screenshots (percent of width/height). */
export const regions = {
  allocation: { l: 66.99, t: 11.98, w: 30.86, h: 33.53 }, // relief-1: Top 5 Best Fit Regions, Sarlahi card
  volunteer: { l: 68.75, t: 43.27, w: 22.46, h: 37.7 }, // relief-3: Image Analyzer photo and result
};

/** `m:ss.s` with tabular figures in CSS; seconds rounded to tenths. */
export function timecode(t: number, tenths = true): string {
  const d = Math.round(t * 10);
  const m = Math.floor(d / 600);
  const s = (d - m * 600) / 10;
  const ss = tenths ? s.toFixed(1) : String(Math.floor(s));
  return `${m}:${s < 10 ? '0' : ''}${ss}`;
}

export const cueId = (slug: string, t: number) => `${slug}-${t.toFixed(1)}`;
