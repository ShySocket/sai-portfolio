#!/usr/bin/env node
// Re-derives the site's media (Sidequest, Sunrise, GyroBlaster, ReliefIQ, Lazer Shooter) from the source videos and
// masters kept outside the repo, the ReliefIQ screens and the committed captures. Re-runnable. It writes only to
// src/assets/v3/ and public/media/v3/, and the one held still (see GyroBlaster) to the held folder outside the repo.
//
//   node scripts/media-v3.mjs             posters, stills, crops, QR, every video encode, then the checks
//   node scripts/media-v3.mjs --stills    posters, stills, crops and QR only (no video encodes)
//   node scripts/media-v3.mjs --capture   first re-capture the live Lazer Shooter screens (network; Playwright
//                                         driving the installed Chrome). It only loads two URLs with GET requests:
//                                         no room, no sign-in, no form.
//
// Sources (not served):
//   Sidequest masters (outside the repo; without one, its Sidequest outputs are only checked, not re-derived):
//     /Users/saibhandar/Documents/autopilot/artifacts/sai-portfolio-v3/media/sidequest/master/sidequest-hero.master.lossless.mkv
//                                   (218 MB, SIDEQUEST_MASTER=<path> overrides) the 34.5 s cut, for the home loop:
//                                   lossless (x264 qp 0, yuv420p tv-range BT.709, 400 frames CFR 30000/1001).
//     /Users/saibhandar/Documents/autopilot/artifacts/sai-portfolio-v3/media/sidequest/master/sidequest-hero-0-42.5.master.lossless.mkv
//                                   (828 MB, SIDEQUEST_HERO_MASTER=<path> overrides) the case hero, game time 0 to
//                                   42.5 s with the bystanders blurred: lossless, 1273 frames, same format.
//                                   See the Sidequest section for how both were recorded.
//   Sunrise and GyroBlaster sources (outside the repo since 2026-10-02, so main never carries a source video):
//     /Users/saibhandar/Documents/autopilot/artifacts/sai-portfolio-v3/media/source/   (MEDIA_SOURCE=<dir> overrides)
//     sunrise-1080.mp4             (SUNRISE_SOURCE=<path> overrides) ~/Documents/sai-portfolio/images/FloorsDemo.mp4,
//                                   video stream copied (decoded frames are bit-identical), AAC dropped: 1920x1080
//                                   H.264, 30 fps, 882 frames, 29.4 s. The Unity editor capture Sai accepted on
//                                   2026-10-01 (the Cue site served a 1280x720 downscale of it).
//     gyroblaster-1080.mp4         (GYROBLASTER_SOURCE=<path> overrides) ~/Documents/sai-portfolio/images/
//                                   Gyrogameplay.mp4, video stream copied, AAC narration and mov_text captions
//                                   dropped: 1920x1080 H.264, 30 fps, 282 frames. Its first and last frames show both
//                                   players, so it stays out of the public repo (consent, inventory Q10).
//                                   A missing source fails the run with the ffmpeg command that restores it (the same
//                                   video stream, checked with ffmpeg streamhash); the other projects still run.
//   src/assets/v3/reliefiq/relief-{1,2,3}.jpg   byte copies of ~/Documents/sai-portfolio/images/Relief{1,2,3}.jpg
//                                   (2048 px Retina JPEGs, the largest that exist); seeded from there once if missing.
//   src/assets/v3/lazer/{home,practice}.png     --capture output: the live PWA at 393x852 CSS, DPR 3 (1179x2556).
//
// Outputs:
//   public/media/v3/<clip>.h264.mp4 and <clip>.av1.mp4   one H.264 (fallback) and one AV1 encode per clip, muted
//                                    (the 42.5 s Sidequest case hero is over the 3.5 MB budget, as Sai chose: see below)
//   src/assets/v3/<project>/*.webp   posters and stills at native size, lossless WebP (the decoded frame exactly,
//                                    40% lighter than PNG); astro:assets encodes what ships
//   src/assets/v3/reliefiq/*.png     detail crops and the home-row crop at native resolution, lossless
//   src/assets/v3/lazer/practice-16x9.png   the home-row band of the practice capture, lossless
//   public/media/v3/lazer-qr.svg     the Lazer QR as one filled path with the 4-module quiet zone the spec requires
//   /Users/saibhandar/Documents/autopilot/artifacts/sai-portfolio-v3/media/held/gyroblaster/players-0.47.webp
//                                    the players still, held outside the repo until both players consent (Q10;
//                                    MEDIA_HELD=<dir> overrides the held folder)
//
// Colour: frames are converted with the BT.709 matrix, which is what Chrome applies to these untagged HD streams
// (ffmpeg's default for untagged input is BT.601, which shifts hues against the playing video). Every encode is tagged
// (TAGS, below) limited range, BT.709 matrix and primaries, and the sRGB transfer (IEC 61966-2-1), because the pixel
// values are display-referred like the posters: an editor capture, a WebGL canvas capture and a phone clip shown as
// is. Measured in the installed Chrome (2026-10-02, element screenshots against the poster): with a BT.709 or no
// transfer tag the video draws 4-10 levels brighter than its own poster (Sidequest +9, Sunrise scene +9, GyroBlaster
// +4), and with the sRGB transfer within half a level, so the poster-to-video swap does not flash. Only the tag
// differs: the decoded pixels are identical. ffmpeg 9 ignores -color_trc on the output once frames carry their own
// tags, so the tags are set in the filter graph with setparams.
//
// Checks (fail the run): each encode within its byte budget (brief: case-study videos <= 3.5 MB; the home loop
// <= 1.5 MB AV1 and <= 2.5 MB H.264) and SSIM >= 0.965 against its master (the source with the same crop, trim and
// scale), frames paired by index over the whole clip, both on luma (Y) and as ffmpeg's all-plane mean: the chroma
// planes always score higher, so the all-plane mean alone can pass an encode whose luma is under the floor.

import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';

const root = resolve(new URL('..', import.meta.url).pathname);
const ARTIFACTS = '/Users/saibhandar/Documents/autopilot/artifacts/sai-portfolio-v3/media';
const SOURCE = process.env.MEDIA_SOURCE ?? join(ARTIFACTS, 'source');
const HELD = process.env.MEDIA_HELD ?? join(ARTIFACTS, 'held');
const OUT = join(root, 'public/media/v3');
const ASSETS = join(root, 'src/assets/v3');
const dir = (p) => (mkdirSync(join(ASSETS, p), { recursive: true }), join(ASSETS, p));
const SIDEQUEST = dir('sidequest');
const SUNRISE = dir('sunrise');
const GYRO = dir('gyroblaster');
const RELIEF = dir('reliefiq');
const LAZER = dir('lazer');
mkdirSync(OUT, { recursive: true });
const stillsOnly = process.argv.includes('--stills');
const tmp = mkdtempSync(join(tmpdir(), 'v3-media-'));

const BUDGET = 3_500_000;
const SSIM_FLOOR = 0.965;
const LIMIT = 60 * 60_000; // bounds each ffmpeg call (a 1080p AV1 pass takes ~3 min on an idle M-series Mac)
const env = { ...process.env, SVT_LOG: '1' }; // SVT-AV1 prints its config banner to stderr unless told otherwise
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-nostdin', '-y', ...args], { stdio: 'inherit', env, timeout: LIMIT });
const size = (f) => statSync(f).size;
const rel = (f) => f.replace(root + '/', '');
const log = (f, note = '') => console.log(`${String(size(f)).padStart(9)} B  ${rel(f)}${note ? '  ' + note : ''}`);
const failures = [];

// ------------------------------------------------------------------ helpers
const RGB709 = 'scale=in_color_matrix=bt709:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=rgb24';
// The colour tags of every encode (see Colour in the header): they change only how players convert, not the pixels.
const TAGS = 'setparams=range=tv:color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709';

/** Frame n of a clip (selected by index, so no seek rounding), optionally cropped, as a lossless WebP. */
async function still(clip, n, file, vf = '') {
  const png = join(tmp, `f${n}.png`);
  ff('-i', clip, '-vf', `select=eq(n\\,${n})${vf ? ',' + vf : ''},${RGB709}`, '-fps_mode', 'passthrough', '-frames:v', '1', png);
  await sharp(png).webp({ lossless: true, effort: 6 }).toFile(file);
  // Lossless means lossless: the WebP must decode to the PNG's exact pixels.
  const [a, b] = await Promise.all([sharp(png).raw().toBuffer(), sharp(file).removeAlpha().raw().toBuffer()]);
  if (!a.equals(b)) failures.push(`${rel(file)} does not decode to the extracted frame`);
  const { width, height } = await sharp(file).metadata();
  log(file, `${width}x${height}, frame ${n}`);
}

const X264 = ['-c:v', 'libx264', '-preset', 'veryslow', '-profile:v', 'high', '-pix_fmt', 'yuv420p'];
const AV1 = ['-c:v', 'libsvtav1', '-preset', '4', '-pix_fmt', 'yuv420p'];

/**
 * One muted MP4 in public/media/v3/: src through vf (crop/trim/scale), encoded with args (codec, CRF, GOP, tags).
 * Then the checks: one video track, size <= budget, and mean SSIM >= SSIM_FLOOR against the master, which is src
 * through the same vf. Frames are paired by index (settb + setpts=N on both sides), so a master whose container
 * rounds timestamps to the millisecond (Sidequest's MKV) still lines up frame for frame.
 */
function encode(src, vf, name, args, { label, budget = BUDGET }) {
  const file = join(OUT, name);
  ff('-i', src, '-map', '0:v:0', '-an', '-sn', '-dn', '-map_metadata', '-1', '-vf', `${vf},${TAGS}`, ...args, '-movflags', '+faststart', file);
  const stats = join(tmp, `${name}.ssim`);
  // The reference carries the same TAGS (metadata only): with mismatched tags ffmpeg converts one side before
  // comparing, which cost the untagged Sunrise source about .002 of SSIM against pixels that had not changed.
  const pair = `[0:v]settb=1/1000,setpts=N[enc];[1:v]${vf},${TAGS},settb=1/1000,setpts=N[ref];[enc][ref]ssim=stats_file=${stats}`;
  const run = spawnSync('ffmpeg', ['-v', 'info', '-nostdin', '-i', file, '-i', src, '-lavfi', pair, '-f', 'null', '-'], { encoding: 'utf8', timeout: LIMIT });
  const [, y, all] = (/SSIM Y:([\d.]+) \([^)]*\) U:[\d.]+ \([^)]*\) V:[\d.]+ \([^)]*\) All:([\d.]+)/.exec(run.stderr) ?? []).map(Number);
  const perFrame = readFileSync(stats, 'utf8').trim().split('\n').map((l) => Number(/All:([\d.]+)/.exec(l)[1]));
  const { w, h, frames, trc } = probe(file);
  log(file, `${label}, ${w}x${h}, ${frames} frames, SSIM ${all.toFixed(4)}, luma ${y.toFixed(4)} (worst frame ${Math.min(...perFrame).toFixed(4)})`);
  if (!(all >= SSIM_FLOOR)) failures.push(`${rel(file)}: SSIM ${all} < ${SSIM_FLOOR}`);
  if (!(y >= SSIM_FLOOR)) failures.push(`${rel(file)}: luma SSIM ${y} < ${SSIM_FLOOR}`);
  if (trc !== 'iec61966-2-1') failures.push(`${rel(file)}: transfer tagged ${trc}, not iec61966-2-1 (sRGB)`);
  if (size(file) > budget) failures.push(`${rel(file)}: ${size(file)} B > ${budget} B`);
}

/**
 * One clip as H.264 and AV1 MP4s. vf is the crop/trim applied to the source; the same vf builds the SSIM master.
 * GOP 150 (5 s): these play from the start on click and have no scrubber, so few keyframes buy quality.
 * av1Params go to SVT-AV1 (-svtav1-params) for clips whose fine texture it would otherwise smooth away.
 */
function clip(src, vf, name, { h264, av1, av1Params }) {
  const av1Args = av1Params ? [...AV1, '-svtav1-params', av1Params] : AV1;
  encode(src, vf, `${name}.h264.mp4`, [...X264, '-crf', String(h264), '-g', '150'], { label: `H.264 CRF ${h264}` });
  encode(src, vf, `${name}.av1.mp4`, [...av1Args, '-crf', String(av1), '-g', '150'], { label: `AV1 CRF ${av1}` });
}

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=width,height,nb_read_frames,color_transfer', '-of', 'json', file], { encoding: 'utf8', timeout: LIMIT });
  const { width: w, height: h, nb_read_frames, color_transfer: trc } = JSON.parse(out).streams[0];
  const frames = Number(nb_read_frames);
  const streams = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', file], { encoding: 'utf8', timeout: LIMIT }).trim().split('\n');
  if (streams.length !== 1 || streams[0] !== 'video') failures.push(`${rel(file)} carries streams other than one video track: ${streams.join(', ')}`);
  return { w, h, frames, trc };
}

/**
 * A source outside the repo. When it is missing the run fails at the end with the command that restores it, and the
 * caller skips that project's outputs (the committed ones stay as they are; the other projects still run).
 */
function need(file, envName, restore) {
  if (existsSync(file)) return true;
  failures.push(`source ${file} is missing (set ${envName}=<path> if it lives elsewhere). Restore it with:\n    mkdir -p ${dirname(file)} && ${restore}`);
  return false;
}

async function png(input, box, file) {
  // sharp converts the screenshots' embedded display profile to sRGB and strips it, as astro:assets will at build.
  await sharp(input).extract(box).png({ compressionLevel: 9 }).toFile(file);
  log(file, `${box.width}x${box.height} at x${box.left} y${box.top}, max ${box.width / 2} CSS px at 2x`);
}

// ------------------------------------------------------------------ Lazer Shooter: live captures (--capture only)
if (process.argv.includes('--capture')) {
  const { chromium, devices } = await import('playwright');
  const browser = await chromium.launch({ channel: 'chrome' });
  const kill = setTimeout(() => browser.close().finally(() => process.exit(2)), 120_000);
  try {
    // iPhone 15 Pro's UA and touch, with the full 393x852 screen as the viewport (no browser chrome) at DPR 3.
    const ctx = await browser.newContext({ ...devices['iPhone 15 Pro'], viewport: { width: 393, height: 852 }, screen: { width: 393, height: 852 }, deviceScaleFactor: 3, serviceWorkers: 'block' });
    // Read-only by construction: any request other than GET/HEAD is aborted and fails the run.
    await ctx.route('**/*', (route) => {
      const method = route.request().method();
      if (method === 'GET' || method === 'HEAD') return route.continue();
      failures.push(`capture blocked a ${method} request to ${route.request().url()}`);
      return route.abort();
    });
    const page = await ctx.newPage();
    // The app opens its Firebase Realtime Database socket on load and listens to .info/serverTimeOffset. Listens are
    // fine; a put, merge or onDisconnect action ("a": p, m, o, om, oc, n) would be a write and fails the run.
    page.on('websocket', (ws) =>
      ws.on('framesent', ({ payload }) => {
        const action = /"a"\s*:\s*"(\w+)"/.exec(String(payload))?.[1];
        if (['p', 'm', 'o', 'om', 'oc', 'n'].includes(action)) failures.push(`capture sent a database write (${action}) on ${ws.url()}`);
      }),
    );
    page.on('response', (r) => { if (r.status() >= 400) console.log(`  (live site: ${r.status()} for ${r.url()})`); });
    for (const [name, url] of [['home', 'https://lazer-shooter-game.vercel.app/'], ['practice', 'https://lazer-shooter-game.vercel.app/?practice']]) {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      const file = join(LAZER, `${name}.png`);
      await page.screenshot({ path: file });
      log(file, '393x852 @3x');
    }
  } finally {
    clearTimeout(kill);
    await browser.close();
  }
}

// ------------------------------------------------------------------ Sidequest
// The master is a canvas recording of the Unity WebGL build (ShySocket/sidequest, SidequestV1/Builds/VideoRunner-Web)
// playing one clean Choreographed run, recorded on 2026-10-01. It is 218 MB, so it lives outside the repo (see the
// header); the capture harness (record.mjs, serve.mjs, capture.html, the run log) is kept beside it in capture/.
//   - Footage: IMG_3775.mov (HEVC Main10, HLG BT.2020) tone-mapped to SDR BT.709 1080p by avconvert Preset1920x1080,
//     then H.264 at 2627 frames and 30000/1001, the .mov's own count and rate, so the authored cue times still hold:
//     .../media/sidequest/source/IMG_3775.play1080.sdr.mp4. It replaced StreamingAssets/IMG_3775.play.mp4 (1280x720,
//     never tone-mapped) in a scratch copy of the build, for the capture only.
//   - Capture: a 1920x1080 canvas at DPR 1 recorded through canvas.captureStream(30) and MediaRecorder (H.264 in WebM,
//     40 Mbps) in Playwright-driven Chrome. Space and S fired 0.25 s ahead of each authored cue: 19 of 19 presses, no
//     crash. The build has no switch for its CLEAR/MISS verdict labels (T toggles only the clock), so the capture page
//     skipped the IMGUI HUD's WebGL draws (GUIClip shader programs); the game's own rendering is untouched.
//   - Cut: video time 34.47-47.78 s (source frames 1033-1431, matched by SSIM against the footage), re-timed to CFR and
//     stored lossless. It holds the pole dodge at 37.1 s, the car jump at 40.71 and the chain jumps at 44.7 and 46.42,
//     and stays clear of the two bystanders at about 23 s. One capture hitch duplicates a frame near frames 243-244.
//     The home loop and its poster come from this cut.
// The case hero is a second recording, made on 2026-10-02 because Sai asked for the Play video to run from the start
// of the game to 42.5 s (just after the minivan jump lands) with the bystanders' faces blurred. The harness, logs and
// raw take are in .../media/sidequest/capture-0-42.5/ (its README has every step):
//   - Footage: the same 1080p SDR file with the four bystanders' heads blurred over frames 680-770 (22.7-25.7 s),
//     tracked from Apple Vision body and face rectangles, pixelated to 1/16 and feathered; an 8-agent full-resolution
//     audit of frames 670-780 found no visible face. Elsewhere it matches the source (SSIM >= .993, x264 CRF 10):
//     .../media/sidequest/source/IMG_3775.play1080.sdr.blurred.mp4. Far pedestrians at 10-15, 31-36 and 42-43 s
//     have 5-10 px heads with no features and are left as filmed (the 34.5 s cut shows the same people).
//   - Capture: as above, but canvas.captureStream(60) at 80 Mbps. At 30 Hz the sampling beats against the footage's
//     29.97 Hz, and near the frame-boundary phase every bit of jitter shows one footage frame twice and skips the
//     next: three 30 fps takes had 6 to ~250 such stutters in 0-42.5 s. At 60 fps every footage frame is caught at
//     least twice; each is taken from the first recorded frame that shows it (normalised cross-correlation on the
//     footage-only left 1000 px). 19 of 19 presses, no crash.
//   - Cut: footage frames 2-1274 (the game starts paused on frame 2), video time 0.07-42.51 s, 1273 frames lossless.
//     Where it overlaps the 34.5 s cut it matches it (luma SSIM .990, mean luma within .01 level).
// Encodes (x264 preset slow, SVT-AV1 preset 2, muted, tagged like every encode here: see Colour in the header):
//   Home row 1 loop (Figure 552): 34.5 s cut frames 0-251 (8.4 s, ending just after the minivan jump lands) by Lanczos
//   to 1280x720, one keyframe per loop. 1280/552 = 2.32.
//   Case hero (Wide 840): all 1273 frames of the 0-42.5 s cut at 1920x1080. 1920/840 = 2.29.
//   SVT-AV1 preset 2 (about 45 s for the loop and 9 min for the hero on an M5) instead of preset 5: at a similar or
//   smaller size it keeps more detail. Measured on 2026-10-02 against the 34.5 s master (luma SSIM; detail =
//   Laplacian variance at the slot's 2x width over the master's, mean of 8-10 frames):
//     loop  p5 CRF 41: 1.41 MB, luma .9625, detail .840    p2 CRF 42: 1.38 MB, luma .9696, detail .879
//     hero  p5 CRF 43: 3.31 MB, luma .9633, detail .785    p2 CRF 43: 3.37 MB, luma .9697, detail .826
//   The p5 rungs passed only on the all-plane SSIM mean; their luma was under .965.
//   Budget: Sai chose on 2026-10-02 to keep this quality for the 42.5 s hero over the 3.5 MB case budget (it loads
//   only on Play, preload none). Same settings as the 13.3 s hero: AV1 p2 CRF 43 is 13.2 MB, luma .9673 (worst frame
//   .934, in the fast pan at 12-14 s). Sharper rungs measured: p2 CRF 41, 15.1 MB, luma .9698; p2 CRF 43 with
//   enable-qm and variance boost, 18.5 MB, luma .9737. The H.264 fallback is the cheapest rung on the .965 luma floor:
//   CRF 26, 26.0 MB, luma .9681 (CRF 27 23.0 MB, .9639; CRF 28 20.3 MB, .9590). Only browsers without AV1 fetch it.
// Posters: frame 0 of each cut, no HUD. The loop's (run-34.5) is the green ball mid-jump over the parking lot; the
// hero's (run-0.0) is the run before it starts, the ball waiting on the rail, so pressing Play does not jump. At
// 1920 px they are 2.29 at Wide and 3.48 at Figure. Lossless WebP with no colour profile, so browsers treat them as
// sRGB, which the encodes' sRGB transfer tag matches.
const SQ_DIR = '/Users/saibhandar/Documents/autopilot/artifacts/sai-portfolio-v3/media/sidequest/master';
const SQ_MASTER = process.env.SIDEQUEST_MASTER ?? join(SQ_DIR, 'sidequest-hero.master.lossless.mkv');
const SQ_HERO = process.env.SIDEQUEST_HERO_MASTER ?? join(SQ_DIR, 'sidequest-hero-0-42.5.master.lossless.mkv');
const SQ_X264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p'];
const SQ_AV1 = ['-c:v', 'libsvtav1', '-preset', '2', '-pix_fmt', 'yuv420p'];
const SQ_HOME = 'trim=end_frame=252,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos+accurate_rnd+full_chroma_int';
const sqOut = (poster, ...clips) => [join(SIDEQUEST, poster), ...clips.map((n) => join(OUT, n))];
for (const [master, outs, derive] of [
  [SQ_MASTER, sqOut('run-34.5.webp', 'sidequest-home.h264.mp4', 'sidequest-home.av1.mp4'), () => {
    encode(SQ_MASTER, SQ_HOME, 'sidequest-home.h264.mp4', [...SQ_X264, '-crf', '25', '-g', '252'], { label: 'H.264 CRF 25', budget: 2_500_000 });
    encode(SQ_MASTER, SQ_HOME, 'sidequest-home.av1.mp4', [...SQ_AV1, '-crf', '42', '-g', '252'], { label: 'AV1 p2 CRF 42', budget: 1_500_000 });
  }],
  [SQ_HERO, sqOut('run-0.0.webp', 'sidequest-hero.av1.mp4', 'sidequest-hero.h264.mp4'), () => {
    encode(SQ_HERO, 'null', 'sidequest-hero.av1.mp4', [...SQ_AV1, '-crf', '43', '-g', '150'], { label: 'AV1 p2 CRF 43', budget: 14_000_000 });
    encode(SQ_HERO, 'null', 'sidequest-hero.h264.mp4', [...SQ_X264, '-crf', '26', '-g', '150'], { label: 'H.264 CRF 26', budget: 27_000_000 });
  }],
]) {
  if (existsSync(master)) {
    await still(master, 0, outs[0]);
    if (!stillsOnly) derive();
  } else {
    console.log(`Sidequest master not found at ${master}: its committed outputs are checked, not re-derived`);
    for (const f of outs) if (!existsSync(f)) failures.push(`${rel(f)} is missing, and its master is not available to re-derive it`);
  }
}

// ------------------------------------------------------------------ Sunrise
// The Scene view of the editor capture spans x364-1475, y108-671 (1px dark borders at x362-363, x1476-1477 and
// y672). The 16:9 crop 1110x624 at x366 y48 keeps the Scene/Game tab row and the overlay toolbar and stops inside the
// panel's right border; every offset and size is even, so it lands on 4:2:0 chroma sites. 1110 px fills the Figure
// slot (552 CSS) at 2.01x, which is why the v3 container is 1128 px. The full frame keeps the recording's own black
// band (rows 989-1079); it fills Wide (840 CSS) at 2.29x.
// Posters: frame 411 (0:13.7), the frame Sai accepted, and frame 570 (0:19.0), the multi-floor block, as the
// alternative. How 411 was found: all 882 frames were scored for transform-gizmo pixels in the Scene view and for an
// empty Inspector panel (nothing selected). The Inspector is empty only in frames 409-421, the gizmo is back at 414,
// and in 409-413 the editor's mouse cursor crosses the facade (about x1050-1065, y356-393 of the 1080p frame), where
// no 16:9 crop large enough to show the floors avoids it. No frame of the capture is free of editor overlay, so 411
// (nothing selected, only the small cursor on a plain wall) stays. The cursor is never painted out: the poster must
// be the frame the video shows at 0:13.7.
const sr = process.env.SUNRISE_SOURCE ?? join(SOURCE, 'sunrise-1080.mp4');
const SCENE = 'crop=1110:624:366:48';
if (need(sr, 'SUNRISE_SOURCE', `ffmpeg -nostdin -i ~/Documents/sai-portfolio/images/FloorsDemo.mp4 -map 0:v:0 -c copy -map_metadata -1 ${sr}`)) {
  for (const n of [411, 570]) {
    const t = (n / 30).toFixed(1);
    await still(sr, n, join(SUNRISE, `scene-${t}.webp`), SCENE);
    await still(sr, n, join(SUNRISE, `editor-${t}.webp`));
  }
  if (!stillsOnly) {
    // The moss and facade decals are fine texture that plain SVT-AV1 smooths: at CRF 40 the scene cut averaged SSIM
    // .988 but fell to .945 in the camera move around frame 573, visibly softer than H.264 there. Quantisation
    // matrices plus variance boost keep that texture; with them the AV1 encodes match or beat H.264's worst frame
    // (scene .962, editor .985) at a similar or smaller size.
    const TEXTURE = 'enable-qm=1:qm-min=0:enable-variance-boost=1';
    clip(sr, SCENE, 'sunrise-scene', { h264: 24, av1: 37, av1Params: TEXTURE });
    clip(sr, 'null', 'sunrise-editor', { h264: 26, av1: 42, av1Params: TEXTURE });
  }
}

// ------------------------------------------------------------------ GyroBlaster
// A handheld phone recording of the game projected in a lecture hall. Frames 0-24 show the two players, 25-65 a whip
// pan (a blurred player, an arm at 60), 66-236 the projected game, and from about 240 the camera pans back to the
// players (phone lights from 239, people from about 249, faces from about 258). The gameplay cut is frames 66-236
// (2.2-7.9 s): the brief's 2.0-8.5 s would start and end on the players, whose faces stay out of hero media.
const gb = process.env.GYROBLASTER_SOURCE ?? join(SOURCE, 'gyroblaster-1080.mp4');
if (need(gb, 'GYROBLASTER_SOURCE', `ffmpeg -nostdin -i ~/Documents/sai-portfolio/images/Gyrogameplay.mp4 -map 0:v:0 -c copy -map_metadata -1 ${gb}`)) {
  await still(gb, 138, join(GYRO, 'play-4.6.webp')); // 4.6 s: both ships and a shot, in the steadiest stretch (frames 110-145)
  // Home row 5 still (inventory M-GB1): the same frame cut to 16:9 around the projected screen, centred on the game
  // canvas (about x890-1550). 1120x630 fills Figure (552 CSS) at 2.03x. It stops above the Windows taskbar, so the
  // clock and date are out; the VS Code explorer and the terminal pane at the sides are part of the filmed screen.
  await still(gb, 138, join(GYRO, 'play-4.6-screen.webp'), 'crop=1120:630:660:90');
  // Frame 14 (0:00.47): both players holding the phones that steer the ships, the only proof of the motion control.
  // NEEDS CONSENT from both players (inventory Q10) before any layout uses it, so it is written outside the repo.
  mkdirSync(join(HELD, 'gyroblaster'), { recursive: true });
  await still(gb, 14, join(HELD, 'gyroblaster', 'players-0.47.webp'));
  // Plain AV1 here: variance boost would spend bits on the dark room's sensor noise, not on the projected game.
  if (!stillsOnly) clip(gb, 'trim=start_frame=66:end_frame=237,setpts=PTS-STARTPTS', 'gyroblaster-play', { h264: 26, av1: 34 });
}

// ------------------------------------------------------------------ ReliefIQ
// The 2048 px screens are the sharpest that exist: ~/Documents/sai-portfolio/images/Relief1..3.jpg (the Cue site
// built from the same bytes). They are copied in once as astro:assets inputs; the detail crops are cut from them at
// native resolution.
let reliefOk = true;
for (const n of [1, 2, 3]) {
  const copy = join(RELIEF, `relief-${n}.jpg`);
  const from = join(homedir(), 'Documents/sai-portfolio/images', `Relief${n}.jpg`);
  if (!existsSync(copy)) {
    if (!existsSync(from)) { failures.push(`${rel(copy)} is missing, and so is the screenshot it is seeded from, ${from}`); reliefOk = false; continue; }
    copyFileSync(from, copy);
  }
  const { width, height } = await sharp(copy).metadata();
  log(copy, `${width}x${height}`);
}
// The Top 5 Best Fit Regions heading and the #1 card (Sarlahi: match score, urgency, fitness, damage, population
// density). The card's border runs x1387-1991, y258-518; the crop leaves 16 px around heading and card.
if (reliefOk) await png(join(RELIEF, 'relief-1.jpg'), { left: 1371, top: 134, width: 636, height: 400 }, join(RELIEF, 'top5-card.png'));
// The Image Analyzer: photo, Analyze Image button and the first result lines ("Blocked road by fallen tree", "Dense
// forest surrounding the road"). It starts below the upload row, so the stock photo's file name is not in it.
if (reliefOk) await png(join(RELIEF, 'relief-3.jpg'), { left: 1383, top: 500, width: 614, height: 450 }, join(RELIEF, 'analyzer.png'));
// Home row 3 still (inventory M-RQ1): 16:9 over the match-score map and the Top 5 column. The chat button (top edge
// y1074, overlapping the third card's corner) sets the bottom at y1070, so card 3 runs off the edge like a scrolled
// list; the width that holds the map (from x304) and the card borders (to x1991) then sets the top at y107, which
// keeps an 11 px strip of the page ground above the map panel's border. 1712 px fills Figure at 3.1x.
if (reliefOk) await png(join(RELIEF, 'relief-1.jpg'), { left: 292, top: 107, width: 1712, height: 963 }, join(RELIEF, 'map-top5.png'));

// ------------------------------------------------------------------ Lazer Shooter: QR
// The same symbol the Cue site served as media/lazer-qr.svg (git 893e405; version 3, level M, mask 3, checked module
// by module), redrawn as one filled path with a 4-module quiet zone (ISO/IEC 18004) instead of 1, in the ink colour on
// a transparent ground: it needs a light surface around it. At 160 CSS px a module is 4.3 px.
const qr = QRCode.create('https://lazer-shooter-game.vercel.app', { errorCorrectionLevel: 'M' });
const Q = 4;
const N = qr.modules.size + 2 * Q;
let d = '';
for (let r = 0; r < qr.modules.size; r++) {
  for (let c = 0; c < qr.modules.size; c++) {
    if (!qr.modules.get(r, c)) continue;
    let run = 1;
    while (c + run < qr.modules.size && qr.modules.get(r, c + run)) run++;
    d += `M${c + Q} ${r + Q}h${run}v1h-${run}z`;
    c += run - 1;
  }
}
const qrFile = join(OUT, 'lazer-qr.svg');
writeFileSync(qrFile, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges"><title>QR code: lazer-shooter-game.vercel.app</title><path fill="#15171a" d="${d}"/></svg>\n`);
log(qrFile, `version ${qr.version}, ${qr.modules.size}+2x${Q} modules`);

// ------------------------------------------------------------------ Lazer Shooter: the committed captures
for (const name of ['home', 'practice']) {
  const file = join(LAZER, `${name}.png`);
  if (!existsSync(file)) { failures.push(`${rel(file)} is missing: run with --capture`); continue; }
  const { width, height } = await sharp(file).metadata();
  log(file, `${width}x${height}`);
  if (width !== 1179 || height !== 2556) failures.push(`${rel(file)} is ${width}x${height}, not 1179x2556`);
}
// Home row 2 interim still (inventory M-LZ1, until capture A's HIT frame exists): a full-width 16:9 band of the
// practice screen, wordmark (y606) to the end of the practice paragraph (y1144) with 62 px above and below, stopping
// 17 px above the Sign in button. 1179 px fills Figure at 2.14x.
const practice = join(LAZER, 'practice.png');
if (existsSync(practice)) await png(practice, { left: 0, top: 544, width: 1179, height: 663 }, join(LAZER, 'practice-16x9.png'));

rmSync(tmp, { recursive: true, force: true });
if (failures.length) {
  console.error('\nmedia-v3: FAILED\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('\nmedia-v3: OK');
