// Responsive AVIF and WebP sets for one image in one slot (astro:assets, at build time), built once per
// (image, widths, sizes) and shared: a page's head preload must name exactly the set its <picture> picks from, or
// the browser downloads the frame twice. The fallback <img src> is the widest WebP, the last srcset entry.
//
// Widths come from the slot (src/styles/slots.ts): 1x, 1.5x and 2x of its 1440 width, never above the source's own
// width (the no-upscale rule). A Wide image whose source is much wider than 1680 also ships one more width, up to
// 1920, for 2x screens between 960 and 1023 px wide, where Wide runs the full column.
//
// Native sizes come from case-studies.ts (px); an imported image's own fields are never read here, because in a
// static build that also ships the untransformed original (scripts/verify-build.mjs rejects it).
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { Px } from '../data/case-studies';
import { slots, type SlotName } from '../styles/slots';

export type PictureSources = {
  avif: string;
  webp: string;
  /** The widest WebP, for <img src>. */
  src: string;
  sizes: string;
  /** The intrinsic size of the widest encode, for the width and height attributes (aspect ratio, CLS 0). */
  width: number;
  height: number;
};

const built = new Map<ImageMetadata, Map<string, Promise<PictureSources>>>();

/** Encode widths for a source of `px` in `slot`: the slot's widths that fit, plus a wider one for Wide. */
export function widthsFor(slot: SlotName, px: Px): number[] {
  const list = slots[slot].widths.filter((w) => w <= px[0]);
  const top = list.at(-1) ?? px[0];
  if (slot === 'wide' && px[0] > top * 1.1) list.push(Math.min(px[0], 1920));
  if (!list.length) list.push(px[0]);
  return list;
}

/**
 * Widths for phone screens, which are drawn by height inside a 16:9 frame (`.frame--screens`): 1x, 1.5x and 2x
 * of the width one draws at in that frame at 1440 (the frame height less its 24px block padding, times `aspect`,
 * the width / height of the window drawn), never above the source width. That covers every narrower frame too:
 * the widest draw under 1224 is a Wide frame at 1023 (1.67x at 2x), and a 390 phone at 3x needs less than 2x.
 */
export function screenWidths(px: Px, aspect: number, frame: 'figure' | 'wide'): number[] {
  const drawn = aspect * ((slots[frame].css * 9) / 16 - 48);
  const list = [1, 1.5, 2].map((k) => Math.round(drawn * k)).filter((w) => w <= px[0]);
  return list.length ? list : [px[0]];
}

export function pictureSources(image: ImageMetadata, px: Px, widths: number[], sizes: string): Promise<PictureSources> {
  const key = `${widths.join(',')}|${sizes}`;
  let forImage = built.get(image);
  if (!forImage) built.set(image, (forImage = new Map()));
  let sources = forImage.get(key);
  if (!sources) {
    const width = Math.max(...widths);
    if (width > px[0]) throw new Error("picture: a width above the source width would upscale it");
    sources = Promise.all([
      getImage({ src: image, format: 'avif', width, widths, quality: 55 }),
      getImage({ src: image, format: 'webp', width, widths, quality: 80 }),
    ]).then(([avif, webp]) => ({
      avif: avif.srcSet.attribute,
      webp: webp.srcSet.attribute,
      src: webp.src,
      sizes,
      width: Number(webp.options.width),
      height: Number(webp.options.height),
    }));
    forImage.set(key, sources);
  }
  return sources;
}

/** A share image: the frame cropped to about 1.91:1, at most 1200 px wide and never wider than the source.
 *  position is where the crop keeps the frame: 'top' for an app screenshot, whose header names the app. */
export async function shareImage(image: ImageMetadata, px: Px, position?: 'top') {
  const width = Math.min(1200, px[0]);
  const height = Math.round(width / 1.905);
  const img = await getImage({ src: image, format: 'jpg', width, height, fit: 'cover', ...(position && { position }), quality: 80 });
  return { src: img.src, width, height };
}
