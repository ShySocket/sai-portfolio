// The pinned frame of a clip as responsive AVIF and WebP sets (astro:assets, at build time). Built once per clip:
// Base.astro preloads the stage's AVIF set, and it must name exactly the set the <picture> picks from, or the
// frame downloads twice. The fallback <img src> is the widest WebP, which is also the last srcset entry.
import { getImage } from 'astro:assets';
import type { Clip } from './presentation';

export type StillSources = { avif: string; webp: string; src: string; sizes: string };

const built = new Map<Clip, Promise<StillSources>>();

export function stillSources(clip: Clip): Promise<StillSources> {
  let sources = built.get(clip);
  if (!sources) {
    const width = Math.max(...clip.widths);
    sources = Promise.all([
      getImage({ src: clip.still, format: 'avif', width, widths: clip.widths, quality: 55 }),
      getImage({ src: clip.still, format: 'webp', width, widths: clip.widths, quality: 80 }),
    ]).then(([avif, webp]) => ({ avif: avif.srcSet.attribute, webp: webp.srcSet.attribute, src: webp.src, sizes: clip.sizes }));
    built.set(clip, sources);
  }
  return sources;
}
