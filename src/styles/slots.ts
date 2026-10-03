// Media slots: how wide each kind of image is drawn, derived from the grid in global.css. The one source for
// every `sizes` attribute and for the no-upscale rule (PRODUCT.md, brief section 4): source px / drawn CSS px
// must be >= 2.0 at 1440 and >= 1.5 at 320, 390, 768 and 1024.
//
// Grid (global.css): under 640, 4 columns, 16px margins and gutters; 640 to 1023, 8 columns, 32px margins,
// 24px gutters; from 1024, 12 columns, 48px margins, 24px gutters, container capped at 1128 (reached at 1224).
// Viewport widths in `sizes` include a classic scrollbar where one exists, so they err a few px wide (never
// narrow), which only ever picks the larger candidate.

export const GRID = {
  container: 1128,
  column: 72,
  gutter: 24,
  /** Viewport width at which the container reaches its cap. */
  capAt: 1224,
  breakpoints: { tablet: 640, desktop: 1024 },
} as const;

export type SlotName = 'wide' | 'figure' | 'figureCase' | 'detail';

export interface Slot {
  /** Drawn width in CSS px at 1440 (and at any viewport from 1224). */
  css: number;
  /** Smallest source width that keeps density >= 2.0 at 1440. */
  minSource: number;
  /** Encode widths to ship: 1x, 1.5x and 2x of the 1440 width (never above the source's own width). */
  widths: readonly number[];
  /** The `sizes` attribute, exact to the grid at every width. */
  sizes: string;
  /** Drawn width in CSS px at a viewport width (no scrollbar). */
  at: (vw: number) => number;
}

const band = (vw: number, desktop: number, tablet: number, mobile: number, capped: number) =>
  vw >= GRID.capAt ? capped : vw >= GRID.breakpoints.desktop ? desktop : vw >= GRID.breakpoints.tablet ? tablet : mobile;

export const slots: Record<SlotName, Slot> = {
  // Case study hero, cols 4 to 12 (Wide). Full width under 1024.
  wide: {
    css: 840,
    minSource: 1680,
    widths: [840, 1260, 1680],
    sizes: '(min-width: 1224px) 840px, (min-width: 1024px) calc(75vw - 78px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)',
    at: (vw) => band(vw, 0.75 * vw - 78, vw - 64, vw - 32, 840),
  },
  // Home row media, cols 1 to 6 (Figure). Cols 1 to 4 of 8 from 640; full width under 640.
  figure: {
    css: 552,
    minSource: 1104,
    widths: [552, 828, 1104],
    sizes: '(min-width: 1224px) 552px, (min-width: 1024px) calc(50vw - 60px), (min-width: 640px) calc(50vw - 44px), calc(100vw - 32px)',
    at: (vw) => band(vw, 0.5 * vw - 60, 0.5 * vw - 44, vw - 32, 552),
  },
  // Case study figures and the Figure slot hero, cols 4 to 9. Under 1024 they span the column but never pass
  // 552 (global.css caps .figure at 552px), so the 1104 to 1110 px sources hold 2.0 at every width.
  figureCase: {
    css: 552,
    minSource: 1104,
    widths: [552, 828, 1104],
    sizes: '(min-width: 1224px) 552px, (min-width: 1024px) calc(50vw - 60px), (min-width: 584px) 552px, calc(100vw - 32px)',
    at: (vw) => band(vw, 0.5 * vw - 60, 552, Math.min(552, vw - 32), 552),
  },
  // One of three phone screens in a strip (Detail), 3 columns each; three across at every width.
  detail: {
    css: 264,
    minSource: 528,
    widths: [264, 396, 528],
    sizes: '(min-width: 1224px) 264px, (min-width: 1024px) calc(25vw - 42px), (min-width: 640px) calc((100vw - 112px) / 3), calc((100vw - 64px) / 3)',
    at: (vw) => band(vw, 0.25 * vw - 42, (vw - 112) / 3, (vw - 64) / 3, 264),
  },
};

/**
 * The slot for a figure as src/data/case-studies.ts names it ('wide' | 'figure' | 'detail'): a 'figure' on home
 * is the row media (cols 1 to 6), on a case study the capped Figure (cols 4 to 9).
 */
export const slotFor = (slot: 'wide' | 'figure' | 'detail', page: 'home' | 'case'): Slot =>
  slots[slot === 'figure' && page === 'case' ? 'figureCase' : slot];

/** Density of a source in a slot at a viewport width: source px per drawn CSS px. */
export const density = (sourceWidth: number, slot: SlotName, vw = 1440) => sourceWidth / slots[slot].at(vw);

/**
 * Phone screens inside a 16:9 frame (`.frame--screens`): each is drawn at the frame's height less its block
 * padding (24px from 1024, 16px below), so its width is `aspect` (width / height of the window drawn: the whole
 * image, or the Screens.view window) times that.
 * `frame` is the slot the frame itself fills.
 */
export function screensSizes(aspect: number, frame: 'figure' | 'wide' = 'figure'): string {
  const k = (aspect * 9) / 16;
  const r = (n: number) => Math.round(n * 1e4) / 1e4;
  const w = (expr: string, pad: number) => `calc((${expr}) * ${r(k)} - ${r(aspect * 2 * pad)}px)`;
  const capped = r(k * slots[frame].css - aspect * 48);
  return frame === 'figure'
    ? `(min-width: 1224px) ${capped}px, (min-width: 1024px) ${w('50vw - 60px', 24)}, (min-width: 640px) ${w('50vw - 44px', 16)}, ${w('100vw - 32px', 16)}`
    : `(min-width: 1224px) ${capped}px, (min-width: 1024px) ${w('75vw - 78px', 24)}, (min-width: 640px) ${w('100vw - 64px', 16)}, ${w('100vw - 32px', 16)}`;
}
