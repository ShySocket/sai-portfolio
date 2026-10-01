#!/usr/bin/env node
// Re-derives every served media file from the source clips and screenshots. Re-runnable.
//
//   node scripts/media.mjs            every output
//   node scripts/media.mjs --stills   only the pinned stills and thumbnails (no video encodes)
//
// Sources: media-src/sidequest.mp4 (960x540, 30 fps, 750 frames, 25.0 s), media-src/sunrise.mp4 (1280x720,
// 29.4 s editor capture; not served), public/media/gyroblaster.mp4 (served unchanged) and src/assets/*.
// Outputs: public/media/{sidequest-loop.mp4, sidequest.mp4 (the full capture, copied unchanged and linked
// from the stage caption, never preloaded), sunrise-scene.mp4, thumb-*.webp}, the pinned stills in
// src/assets/stills/ and the ReliefIQ detail crops in src/assets/crops/. Stills and crops are build inputs:
// astro:assets ships only their AVIF and WebP encodes (scripts/verify-build.mjs fails on a shipped original).
// Stills are stored as q95 WebP: visually lossless next to the q55 AVIF and q80 WebP that ship, at a tenth of a
// PNG's weight in git.
//
// Frame addresses were measured on the source: every Sidequest cue is 2-4 frames after the onset of its
// "CLEAR ..." overlay (green-pixel mask at 30 fps, read by tesseract), so the label is fully opaque.

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(new URL('..', import.meta.url).pathname);
const SRC = join(root, 'media-src');
const OUT = join(root, 'public/media');
const ASSETS = join(root, 'src/assets');
const CROPS = join(ASSETS, 'crops');
const STILLS = join(ASSETS, 'stills');
const stillsOnly = process.argv.includes('--stills');
const tmp = mkdtempSync(join(tmpdir(), 'cue-media-'));
mkdirSync(CROPS, { recursive: true });
mkdirSync(STILLS, { recursive: true });

const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const size = (f) => statSync(f).size;
const log = (f) => console.log(`${String(size(f)).padStart(9)} B  ${f.replace(root + '/', '')}`);

/** Exact frame n of a clip as PNG (select by index, so no seek rounding). */
function frame(clip, n, file, vf = '') {
  ff('-i', clip, '-vf', `select=eq(n\\,${n})${vf ? ',' + vf : ''}`, '-fps_mode', 'passthrough', '-frames:v', '1', file);
  return file;
}

async function webp(input, file, { width, height, quality = 80, extract, fit = 'cover' } = {}) {
  let img = sharp(input);
  if (extract) img = img.extract(extract);
  if (width || height) img = img.resize({ width, height, fit, position: 'centre' });
  await img.webp({ quality, effort: 6, smartSubsample: true }).toFile(file);
  log(file);
  return file;
}

/** Smallest-quality search so a thumbnail stays within its byte budget. */
async function thumb(input, file, opts, budget = 4096) {
  for (let q = opts.quality ?? 64; q >= 30; q -= 4) {
    await webp(input, file, { ...opts, quality: q });
    if (size(file) <= budget) return;
  }
  throw new Error(`${file} is over ${budget} B at q30`);
}

// ---------------------------------------------------------------- Sidequest
// 12.0 s (frames 0-359) at the source's 960x540, so the audit overlay text stays sharp. Two-pass x264 High,
// 2 s GOP so a seek to any cue decodes at most 60 frames. Cues kept: 1.7, 4.5, 7.7, 9.4, 11.2 (>= 1.7 s apart).
const sq = join(SRC, 'sidequest.mp4');
const loop = join(OUT, 'sidequest-loop.mp4');
const x264 = ['-c:v', 'libx264', '-preset', 'veryslow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0'];
const pass = join(tmp, 'sq');
if (!stillsOnly) {
  ff('-i', sq, '-t', '12', ...x264, '-b:v', '620k', '-pass', '1', '-passlogfile', pass, '-an', '-f', 'mp4', '/dev/null');
  ff('-i', sq, '-t', '12', ...x264, '-b:v', '620k', '-maxrate', '1000k', '-bufsize', '1600k', '-pass', '2', '-passlogfile', pass, '-an', '-movflags', '+faststart', loop);
  log(loop);
  if (size(loop) > 1_000_000) throw new Error('sidequest-loop.mp4 is over 1,000,000 B');
  // The uncut capture, offered on demand under the stage ("Full capture, 3.7 MB" in presentation.ts).
  const full = join(OUT, 'sidequest.mp4');
  copyFileSync(sq, full);
  log(full);
}

const sq135 = frame(sq, 135, join(tmp, 'sq-135.png')); // 4.5 s: "CLEAR sign, on bush", runner over the hedge
// 1024w (upscaled from 960): the still must out-measure the 960x540 loop in LCP accounting where the stage well
// is wider than 960px, or the loop's first frame replaces it as the LCP at 1536 and 1600 (see presentation.ts).
await webp(sq135, join(STILLS, 'sidequest-4.5.webp'), { width: 1024, quality: 95 });
await thumb(sq135, join(OUT, 'thumb-sidequest.webp'), { width: 192, height: 112, quality: 60 });

// ---------------------------------------------------------------- Sunrise
// The editor capture cropped to its Scene view (x292 y72 600x338), where the floors assemble. The crop stops
// 24px short of the view's right edge, so the Scene menu glyph and the orientation gizmo's cone stay out.
const sr = join(SRC, 'sunrise.mp4');
const scene = join(OUT, 'sunrise-scene.mp4');
const SCENE = 'crop=600:338:292:72';
if (!stillsOnly) {
  ff('-i', sr, '-vf', SCENE, ...x264, '-crf', '27', '-an', '-movflags', '+faststart', scene);
  log(scene);
}
// 13.7 s (frame 411): two stacked floors with moss decals, and the only stretch of the capture (frames 409-413)
// where nothing is selected, so no transform gizmo or camera frustum is drawn over the scene. Found by counting
// saturated red, yellow and green gizmo pixels in the crop on every frame; 411 is 2 frames after it clears.
// Re-searched in polish 7c for a frame without the editor's mouse cursor: all 882 frames were scored (gizmo pixels
// in the Scene crop, and an empty Inspector panel for "nothing selected"). The Inspector is empty only in frames
// 409-421; the gizmo returns at 414; and in 409-413 the cursor crosses the facade (it moves within about x700-710,
// y237-262 of the source), where no 16:9 crop of the Scene view large enough to show the floors can avoid it. So
// no frame of the capture is free of editor overlay, and 411 (cursor only, small, on a plain wall) stays the still.
// The cursor is not painted out: the still must be the frame the video shows at 0:13.7.
const sr411 = frame(sr, 411, join(tmp, 'sr-411.png'), SCENE);
await webp(sr411, join(STILLS, 'sunrise-13.7.webp'), { quality: 95 });
await thumb(sr411, join(OUT, 'thumb-sunrise.webp'), { width: 192, height: 112, quality: 64 });

// ---------------------------------------------------------------- GyroBlaster
const gb = join(OUT, 'gyroblaster.mp4'); // served unchanged
const gb138 = frame(gb, 138, join(tmp, 'gb-138.png')); // 4.6 s: both ships on screen and a shot
await webp(gb138, join(STILLS, 'gyroblaster-4.6.webp'), { width: 960, quality: 95 });
await thumb(gb138, join(OUT, 'thumb-gyroblaster.webp'), { extract: { left: 520, top: 60, width: 520, height: 296 }, width: 192, height: 112, quality: 64 });

// ---------------------------------------------------------------- Lazer Shooter and ReliefIQ
await thumb(join(ASSETS, 'lazer-home.png'), join(OUT, 'thumb-lazer.webp'), { width: 52, height: 112, quality: 64 });
await thumb(join(ASSETS, 'relief-1.jpg'), join(OUT, 'thumb-reliefiq.webp'), { extract: { left: 290, top: 380, width: 875, height: 500 }, width: 192, height: 112, quality: 64 });

// Detail crops (x, y, w, h in the 2048px screenshots). The wide pair sits side by side at >= 1200px, where the
// road crop renders at 0.9x so the analyzer text stays >= 14 CSS px; the narrow pair fills a 352px phone column.
const crops = [
  ['relief-1.jpg', 'sarlahi.png', { left: 1372, top: 140, width: 632, height: 392 }],
  ['relief-1.jpg', 'sarlahi-narrow.png', { left: 1380, top: 250, width: 400, height: 180 }],
  ['relief-3.jpg', 'road.png', { left: 1408, top: 505, width: 460, height: 440 }],
  ['relief-3.jpg', 'road-narrow.png', { left: 1408, top: 505, width: 400, height: 440 }],
];
for (const [from, to, box] of crops) {
  const file = join(CROPS, to);
  await sharp(join(ASSETS, from)).extract(box).png({ compressionLevel: 9 }).toFile(file);
  log(file);
}

rmSync(tmp, { recursive: true, force: true });
