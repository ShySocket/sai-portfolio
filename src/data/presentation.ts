// Presentation for each project, keyed by slug. Copy lives in projects.ts, which stays byte-identical to
// main; this file only adds layout family, measured media addresses, thumbnails and evidence keys.
//
// Strings introduced here (evidence-key labels, cue captions and the clip provenance line) are new copy,
// flagged for Sai's review.

export type Family = 'stage' | 'phone' | 'spread' | 'pair';

/** A measured address in a clip: `t` seconds, 2-4 frames after the overlay or moment appears. */
export type Cue = { t: number; caption: string };

export type Clip = {
  src: string; // served path under public/
  still: string; // the pinned frame at `t`: shown at first paint, for no JS, print, reduced motion, Save-Data
  width: number; // intrinsic size of the still
  height: number;
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

// Sidequest cue captions are the clip's own overlay text; "Audit overlay:" says what that text is.
const audit = (label: string) => `Audit overlay: CLEAR ${label}`;

export const presentation: Record<string, Presentation> = {
  sidequest: {
    family: 'stage',
    kind: 'play',
    thumb: { src: 'media/thumb-sidequest.webp', width: 96, height: 56 },
    clip: {
      src: 'media/sidequest-loop.mp4',
      still: 'media/sidequest-4.5.webp',
      // 1024x576, a little over the loop's 960x540: where the stage upscales (wells over 960px), Chrome caps an
      // element's LCP size at its intrinsic area, so the still must out-measure the video's first frame to stay
      // the LCP (+3.3 KB). Below 960px the video's 1px inset (global.css) does the same job.
      width: 1024,
      height: 576,
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
      still: 'media/sunrise-19.0.webp',
      width: 600,
      height: 338,
      t: 19,
      duration: 29.4,
      cues: [{ t: 19, caption: '' }], // caption falls back to media.label (verbatim)
    },
    proofs: {
      'Hybrid XY / Z generation': { label: 'Show 0:19.0 in clip', target: 'sunrise-19.0', icon: 'clock-play' },
    },
  },
  gyroblaster: {
    family: 'pair',
    kind: 'movie',
    thumb: { src: 'media/thumb-gyroblaster.webp', width: 96, height: 56 },
    clip: {
      src: 'media/gyroblaster.mp4',
      still: 'media/gyroblaster-4.6.webp',
      width: 960,
      height: 540,
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
