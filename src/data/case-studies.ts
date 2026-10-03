// The v3 content model: the home identity block, contact links, interface labels and the five case studies.
//
// Provenance. Every user-visible string is a Copy { text, from }:
//   from projects: confirmed copy from src/data/projects.ts, passed by reference (p, tag, phrase), never retyped.
//   from case:     sourced case-study copy written here as a single-quoted literal (c), with a source comment above.
// The renderer puts data-verbatim={copy.from} on the one element that holds exactly copy.text, and
// scripts/verify-build.mjs fails the build unless that text is a substring of the named file.
//
// Rules for editing this file (verify-build reads its single-quoted and backtick literals as the case corpus):
//   - copy is single-quoted; an apostrophe is the typographic one (U+2019), as in projects.ts;
//   - comments hold no straight apostrophe and no backtick, so they never leak into the corpus;
//   - no em or en dash anywhere;
//   - never read a field of an imported image (width, src and so on): in a static build Astro then ships the
//     original too, which verify-build rejects. Native sizes are written here as px, measured from the files
//     (media-table.md), and images only ever go to getImage or Picture.
// Paths of videos and files under public/ have no leading slash; the renderer prefixes import.meta.env.BASE_URL.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ImageMetadata } from 'astro';
import { projects, type Project } from './projects';

import sqPoster from '../assets/v3/sidequest/run-34.5.webp';
import sqStart from '../assets/v3/sidequest/run-0.0.webp';
import lzHome from '../assets/v3/lazer/home.png';
import lzPractice from '../assets/v3/lazer/practice.png';
import rqMap from '../assets/v3/reliefiq/map-top5.png';
import rqDashboard from '../assets/v3/reliefiq/relief-1.jpg';
import rqSummary from '../assets/v3/reliefiq/relief-2.jpg';
import snScene from '../assets/v3/sunrise/scene-13.7.webp';
import snBlock from '../assets/v3/sunrise/scene-19.0.webp';
import gbPlay from '../assets/v3/gyroblaster/play-4.6.webp';
import gbScreen from '../assets/v3/gyroblaster/play-4.6-screen.webp';

// ------------------------------------------------------------------ types

export type From = 'projects' | 'case';
export type Copy = { readonly text: string; readonly from: From };

/** Grid slots at 1440 (brief section 4): wide 840, figure 552, detail 264 CSS px. */
export type Slot = 'wide' | 'figure' | 'detail';
/** Native pixel size of a file, measured on disk. */
export type Px = readonly [width: number, height: number];

export type Still = { kind: 'still'; image: ImageMetadata; px: Px; alt: Copy };
export type VideoSource = { src: string; type: string };
/** sources in preference order (AV1 first, then H.264); poster is the frame shown before play, with no JS,
 *  under reduced motion and Save-Data; alt describes that frame. loop marks the one muted home loop. */
export type Video = { kind: 'video'; sources: VideoSource[]; poster: ImageMetadata; posterPx: Px; px: Px; seconds: number; alt: Copy; loop?: boolean };
/** Phone screens shown side by side inside one 16:9 frame (no bezels). view is the window each screen is drawn
 *  through (width and height in source px, centred on the screen); without it the whole screen shows. */
export type Screens = { kind: 'screens'; screens: { image: ImageMetadata; px: Px; alt: Copy }[]; view?: Px };
export type Table = { kind: 'table'; head: readonly [Copy, Copy]; rows: (readonly [Copy, Copy])[] };
/** A left-to-right (or top-to-bottom) chain of nodes; edge labels the connector after its node. */
export type Diagram = { kind: 'diagram'; title: Copy; nodes: { text: Copy; edge?: Copy }[] };
/** Two time series on one time axis. points are flat pairs: t0, v0, t1, v1, ... (seconds, px/s). */
export type SpeedChart = {
  kind: 'speed';
  title: Copy;
  seconds: number;
  yMax: number;
  yTicks: number[];
  xTicks: number[];
  yUnit: Copy;
  xUnit: Copy;
  series: { id: 'raw' | 'final'; label: Copy; short: Copy; points: readonly number[] }[];
};
/** The authored level on a time axis: surface bands, an arc per jump or hop (height in frame heights, air in s),
 *  a tick per dodge, spans where the runner is hidden, and the span the hero capture shows. */
export type LevelStrip = {
  kind: 'strip';
  title: Copy;
  seconds: number;
  surfaces: { from: number; to: number; name: Copy }[];
  events: { t: number; type: 'jump' | 'hop' | 'dodge'; height?: number; air?: number; name?: Copy }[];
  hidden: { from: number; to: number; label: Copy }[];
  highlight: { from: number; to: number; label: Copy };
  legend: { jump: Copy; hop: Copy; dodge: Copy };
};
export type Media = Still | Video | Screens | Table | Diagram | SpeedChart | LevelStrip;
/** One captioned figure. caption is one or more lines, each its own tagged span. */
export type Figure = { id: string; slot: Slot; media: Media; caption: Copy[] };

export type Link = { label: Copy; href: string; kind: 'play' | 'code' | 'watch'; primary?: boolean };
export type Subsection = { heading?: Copy; body: Copy[]; figure?: Figure };

export type CaseStudy = {
  slug: string;
  project: Project;
  title: Copy;
  award?: Copy;
  /** The full projects.ts summary. */
  lede: Copy;
  /** Its first sentence: the home row claim, the Next project claim and the meta description. */
  claim: Copy;
  facts: {
    role?: Copy;
    team?: Copy;
    when?: Copy;
    stack: Copy[];
    links: Link[];
    /** Lazer Shooter only: shown on fine pointers, where the phone-first game needs a phone. */
    qr?: { src: string; px: Px; href: string; label: Copy; host: Copy };
  };
  hero: Figure;
  /** Home row: media in the Figure slot (no caption on home), at most 4 meta tags, the Play or Watch link. */
  home: { media: Still | Video | Screens; meta: Copy[]; links: Link[] };
  /** One paragraph per Copy. */
  problem: Copy[];
  /** At most 3 subsections. */
  approach: Subsection[];
  outcome: { body: Copy[]; links: Link[] };
  /** Slug of the next case study; GyroBlaster wraps to Sidequest. */
  next: string;
};

export type Contact = { id: 'resume' | 'github' | 'linkedin' | 'email'; label: Copy; href: string; internal?: boolean };

// ------------------------------------------------------------------ provenance helpers

const DASH = /[\u2013\u2014]/;
// Build-time failures. Their messages are double-quoted so they stay out of the case corpus.
function fail(...parts: unknown[]): never {
  throw new Error("case-studies: " + parts.join(" "));
}
/** Confirmed projects.ts copy, passed by reference. */
const p = (text: string): Copy => ({ text, from: 'projects' });
/** A part of a projects.ts field; throws at build time unless it is a substring of that field. */
function phrase(field: string, part: string): Copy {
  if (!field.includes(part)) fail(JSON.stringify(part), "is not part of", JSON.stringify(field.slice(0, 60)));
  return p(part);
}
/** One of the project tags, exactly. */
function tag(project: Project, name: string): Copy {
  if (!project.tags.includes(name)) fail(project.slug, "has no tag", name);
  return p(name);
}
/** Case-study copy written in this file (each call carries a single-quoted literal and a source comment). */
function c(text: string): Copy {
  if (DASH.test(text)) fail("an em or en dash in", text.slice(0, 60));
  return { text, from: 'case' };
}
/** The first sentence of a summary, which stays a substring of it. */
export function claimOf(project: Project): Copy {
  const end = project.summary.indexOf('. ');
  return p(end === -1 ? project.summary : project.summary.slice(0, end + 1));
}
function project(slug: string): Project {
  const found = projects.find((x) => x.slug === slug);
  if (!found) fail("no project", slug, "in projects.ts");
  return found;
}
function alt(project: Project, i: number): Copy {
  const media = project.media;
  if (!('alts' in media) || !media.alts[i]) fail(project.slug, "has no alt", i);
  return p(media.alts[i]);
}
const links = (project: Project): Link[] =>
  project.links.map((l, i) => ({ label: p(l.label), href: l.href, kind: l.kind, primary: i === 0 && l.kind !== 'code' }));
const liveLinks = (project: Project): Link[] => links(project).filter((l) => l.kind !== 'code');

// Video sources. Codec strings from ffprobe (all 8-bit 4:2:0): AV1 Main level 4.0 is av01.0.08M.08 and level 3.1
// av01.0.05M.08; H.264 High is avc1.64 plus the level in hex. A source marked optional is dropped when its file
// is not in public/ yet; a missing required file stops the build.
const AV1_1080 = 'video/mp4; codecs="av01.0.08M.08"';
const AV1_720 = 'video/mp4; codecs="av01.0.05M.08"';
function sources(...list: { src: string; type: string; optional?: boolean }[]): VideoSource[] {
  return list.flatMap(({ src, type, optional }) => {
    if (existsSync(join(process.cwd(), 'public', src))) return [{ src, type }];
    if (optional) return [];
    fail("public/" + src, "is missing");
  });
}

// ------------------------------------------------------------------ site

const contact: Contact[] = [
  // src: PRODUCT.md (contact links)
  { id: 'resume', label: c('Résumé'), href: 'Sai_Bhandar_Resume.pdf', internal: true },
  { id: 'github', label: c('GitHub'), href: 'https://github.com/ShySocket' },
  { id: 'linkedin', label: c('LinkedIn'), href: 'https://www.linkedin.com/in/sai-bhandar' },
  { id: 'email', label: c('Email'), href: 'mailto:saib@andrew.cmu.edu' },
];

export const site = {
  // src: PRODUCT.md (headline fixed by Sai)
  name: c('Sai Bhandar'),
  // src: PRODUCT.md (headline fixed by Sai)
  tagline: c('Business + CS @ CMU'),
  // src: résumé (B.S. in Computer Science and Business Administration, May 2028) + sai-answers (Summer 2027
  // internships) + projects.ts (Sidequest and Lazer Shooter summaries). Direction B wording, 44 words.
  about: c('I study Business and Computer Science at Carnegie Mellon, graduating May 2028. I build software that reads the physical world: a runner paced by a moving car, laser tag aimed through phone cameras. I’m looking for software engineering or product internships for Summer 2027.'),
  contact,
};

// Interface strings (inventory N2). src: inventory N2, and for the QR line Phone.astro of the Cue site (main, 893e405).
export const labels = {
  problem: c('Problem'),
  approach: c('Approach'),
  outcome: c('Outcome'),
  next: c('Next project'),
  role: c('Role'),
  team: c('Team'),
  when: c('When'),
  stack: c('Stack'),
  links: c('Links'),
  caseStudy: c('Case study'),
  allWork: c('All work'),
  play: c('Play'),
  pause: c('Pause'),
  projects: c('Projects'),
  contact: c('Contact'),
  facts: c('Project facts'),
  scan: c('Scan to play on your phone'),
};

// ------------------------------------------------------------------ 1. Sidequest

const sq = project('sidequest');
const sqLoopAlt =
  // src: the poster frame itself (run-34.5.webp, home loop frame 0)
  c('Sidequest in play: the green ball in mid-jump above a parking lot of parked cars, with brick buildings and school buses behind.');
const sqHeroAlt =
  // src: the poster frame itself (run-0.0.webp, hero frame 0: the run before it starts, the ball on the rail)
  c('Sidequest at the start of a run: the black ball waits on a fence rail beside a parking gate, below a building with satellite dishes on its roof.');
const sqHero: Video = {
  kind: 'video',
  sources: sources(
    { src: 'media/v3/sidequest-hero.av1.mp4', type: AV1_1080 },
    // H.264 fallback for browsers without AV1: x264 CRF 26, High at level 5.0 (scripts/media-v3.mjs)
    { src: 'media/v3/sidequest-hero.h264.mp4', type: 'video/mp4; codecs="avc1.640032"' },
  ),
  poster: sqStart,
  posterPx: [1920, 1080],
  px: [1920, 1080],
  seconds: 42.48,
  alt: sqHeroAlt,
};

const sidequest: CaseStudy = {
  slug: sq.slug,
  project: sq,
  title: p(sq.title),
  lede: p(sq.summary),
  claim: claimOf(sq),
  facts: {
    // src: repo git log (41 of 41 commits by ShySocket) + repo:SidequestCapture/README.md (the iOS capture app)
    role: c('Game design, the Python vision pipeline, the Unity 6 game and the iOS capture app.'),
    // src: repo git log (one author); on the list for Sai
    team: c('Solo'),
    // src: repo git log, public branch: first commit 2026-07-18, last 2026-09-01
    when: c('July to September 2026'),
    stack: sq.tags.map(p),
    links: links(sq),
  },
  hero: {
    id: 'sidequest-hero',
    slot: 'wide',
    media: sqHero,
    caption: [
      // src: capture harness record.mjs (WebGL build, canvas capture, game time 0 to 42.5 s) + the authored level
      // IMG_3775.authored.json (jumps labelled car 7.15, van 9.45, suv 17, people 23.2, a hedge with signs 25.75 to
      // 29.2, pole dodges 32.7 and 37.1, car 40.71 s inside behindSpans 40.6 to 42.5) + frames + the blur Sai asked for
      c('Capture of the Unity WebGL build over the real footage, from the start of the run: the runner vaults a car, a van and an SUV, leaps a group of people, runs along a hedge top, sidesteps two poles and clears a minivan while passing behind a lamp post. The faces of the people it leaps are blurred.'),
    ],
  },
  home: {
    media: {
      kind: 'video',
      sources: sources(
        { src: 'media/v3/sidequest-home.av1.mp4', type: AV1_720 },
        { src: 'media/v3/sidequest-home.h264.mp4', type: 'video/mp4; codecs="avc1.64001f"' },
      ),
      poster: sqPoster,
      posterPx: [1920, 1080],
      px: [1280, 720],
      seconds: 8.41,
      alt: sqLoopAlt,
      loop: true,
    },
    meta: [tag(sq, 'Unity 6'), tag(sq, 'Python'), tag(sq, 'SAM 2'), tag(sq, 'GPS + IMU')],
    links: liveLinks(sq),
  },
  problem: [
    // src: repo:tools/video-analyzer/README.md (intro; Depth, and why speed is relative) + repo:resources/AUDIT_CRITERIA.md (premise)
    c('A level has to come from what the camera actually saw: the surfaces the character can run on, the obstacles it must clear, and a speed curve that ties video progress to how fast the vehicle is really moving. Monocular video carries no depth, and this clip has no GPS track, so its optical-flow speed is relative, not metric. A level can also pass every unit test and still look wrong, because tests check the file and the eye checks the frame.'),
  ],
  approach: [
    {
      heading: p(sq.bullets![0].title),
      body: [
        p(sq.bullets![0].body),
        // src: repo:tools/video-analyzer/README.md (Why distance, not time; Depth, and why speed is relative, item 3)
        c('The level file stores every event against distance travelled, so a level stays correct at any playback rate, including stopped. Acceleration limiting cut the peak speed change from 32× the median per second, impossible for a car, to 0.51×.'),
      ],
      figure: {
        id: 'sidequest-speed',
        slot: 'wide',
        media: {
          kind: 'speed',
          // src: tools/video-analyzer/out/IMG_3775.speed.json and .speed.final.json (local pipeline output, gitignored;
          // values below) + repo:tools/video-analyzer/README.md (the brick wall at 61 s)
          title: c('Optical-flow speed across the 87.6 s clip. The raw curve spikes to 2,151 px/s at 61 s, where the car passes a brick wall; the ground-masked, acceleration-limited curve stays between 20 and 1,032 px/s.'),
          seconds: 87.63,
          yMax: 2200,
          yTicks: [500, 1000, 1500, 2000],
          xTicks: [0, 20, 40, 60, 80],
          yUnit: c('px/s'),
          xUnit: c('s'),
          series: [
            // src: the same speed files (raw and final runs)
            { id: 'raw', label: c('Raw optical flow'), short: c('Raw'), points: speedRaw() },
            { id: 'final', label: c('Ground-masked, acceleration-limited'), short: c('Final'), points: speedFinal() },
          ],
        },
        // src: inventory N7b
        caption: [c('Optical-flow speed for the whole clip, raw and after ground masking and acceleration limiting.')],
      },
    },
    {
      heading: p(sq.bullets![1].title),
      body: [
        p(sq.bullets![1].body),
        // src: repo:tools/video-analyzer/timeline.json (21 events: 15 jump, 4 dodge, 2 hop) + repo:resources/AUDIT_CRITERIA.md
        // (Check 2: taps at the early edge, centre and late edge; every frame against the footage; non-zero exit)
        c('The shipped level authors 21 events across the 87.6 s clip: 15 jumps, 4 dodges and 2 automatic hops. The audit replays each jump pressed at the early edge, centre and late edge of its window, checks every frame against the footage, and fails the level on any violation.'),
      ],
      figure: {
        id: 'sidequest-strip',
        slot: 'wide',
        media: {
          kind: 'strip',
          // src: repo:tools/video-analyzer/timeline.json (events, surfaces, hidden span)
          title: c('The shipped level across the 87.6 s clip: 15 jumps and 2 automatic hops as arcs, 4 dodges as ticks, over seven surface spans of rail, floor, sidewalk, hedge and grass. The runner is hidden from 58.3 to 75.0 s.'),
          seconds: 87.63,
          // src: timeline.json surfaces (each runs to the next one, the last to the end of the clip)
          surfaces: [
            { from: 0, to: 7.55, name: c('rail') },
            { from: 7.55, to: 18.55, name: c('floor') },
            { from: 18.55, to: 26.2, name: c('sidewalk') },
            { from: 26.2, to: 29.2, name: c('hedge') },
            { from: 29.2, to: 47.05, name: c('floor') },
            { from: 47.05, to: 77.5, name: c('sidewalk') },
            { from: 77.5, to: 87.63, name: c('grass') },
          ],
          // src: timeline.json events (time, type, height, airTime); names from their labels (van, car, chain)
          events: [
            { t: 7.15, type: 'jump', height: 0.33, air: 1.4 },
            { t: 9.45, type: 'jump', height: 0.5, air: 2.1, name: c('Van') },
            { t: 12.0, type: 'hop', height: 0.1, air: 0.4 },
            { t: 16.35, type: 'hop', height: 0.1, air: 0.4 },
            { t: 17.0, type: 'jump', height: 0.48, air: 1.62 },
            { t: 23.2, type: 'jump', height: 0.66, air: 1.9 },
            { t: 25.75, type: 'jump', height: 0.4, air: 0.48 },
            { t: 26.24, type: 'jump', height: 0.38, air: 0.46 },
            { t: 27.3, type: 'jump', height: 0.3, air: 0.8 },
            { t: 28.2, type: 'jump', height: 0.3, air: 0.65 },
            { t: 29.2, type: 'jump', height: 0.18, air: 0.6 },
            { t: 31.0, type: 'jump', height: 0.36, air: 1.08 },
            { t: 32.7, type: 'dodge' },
            { t: 33.85, type: 'jump', height: 0.44, air: 1.62 },
            { t: 37.1, type: 'dodge' },
            { t: 40.71, type: 'jump', height: 0.38, air: 1.64, name: c('Car') },
            { t: 44.7, type: 'jump', height: 0.25, air: 1.2, name: c('Chain') },
            { t: 46.42, type: 'jump', height: 0.15, air: 0.95 },
            { t: 57.32, type: 'dodge' },
            { t: 77.0, type: 'jump', height: 0.3, air: 1.2 },
            { t: 82.0, type: 'dodge' },
          ],
          // src: timeline.json hidden + repo:SidequestV1/Assets/Documentation/VIDEO_RUNNER.md (the ball stops rendering)
          hidden: [{ from: 58.3, to: 75.0, label: c('runner hidden') }],
          // src: scripts/media-v3.mjs (the hero is footage frames 2 to 1274, video time 0.07 to 42.51 s)
          highlight: { from: 0.07, to: 42.51, label: c('The capture above') },
          legend: { jump: c('Jump'), hop: c('Automatic hop'), dodge: c('Dodge') },
        },
        // src: inventory N8, restated for the arcs (timeline.json height and airTime)
        caption: [c('The authored run from timeline.json: an arc for every jump and hop, drawn to its height and air time, a tick for every dodge, and the surface the runner rides beneath.')],
      },
    },
    {
      heading: p(sq.bullets![2].title),
      body: [
        p(sq.bullets![2].body),
        // src: repo:SidequestV1/Assets/Documentation/TRANSPORT_MOTION_ESTIMATOR.md (Fusion Behavior)
        c('GPS stays the authority on absolute speed. Accelerometer data, rotated into a stable frame using device attitude, fills the gaps between fixes and carries the estimate through GPS loss.'),
      ],
      figure: {
        id: 'sidequest-replay',
        slot: 'figure',
        media: {
          kind: 'table',
          // src: repo:SidequestV1/Assets/Documentation/BART_MOTION_SIMULATION_REPORT.md (Final result)
          head: [c('Measure'), c('Simulated replay')],
          rows: [
            [c('Mean absolute speed error'), c('1.54 m/s')],
            [c('Maximum confirmed-stop latency'), c('0.50 s')],
            [c('False station stops'), c('0')],
          ],
        },
        // src: inventory N9 + the same report (the blackout between West Oakland and Embarcadero)
        caption: [c('Deterministic simulated replay of a BART ride, Downtown Berkeley to Montgomery St, at 50 Hz with a full GPS blackout between West Oakland and Embarcadero.')],
      },
    },
  ],
  outcome: {
    body: [
      // src: projects.ts (WebGL tag, Play in browser link) + repo:tools/video-analyzer/new-clip.sh (clip to an authored, audited level)
      c('The game is playable in the browser as a Unity WebGL build. One script, new-clip.sh, takes a new clip to an audited, playable level.'),
    ],
    links: links(sq),
  },
  next: 'lazer-shooter',
};

// ------------------------------------------------------------------ 2. Lazer Shooter

const lz = project('lazer-shooter');
const lzScreens: Screens = {
  kind: 'screens',
  screens: [
    { image: lzHome, px: [1179, 2556], alt: alt(lz, 0) },
    // src: the screen itself (live app, ?practice)
    { image: lzPractice, px: [1179, 2556], alt: c('Lazer Shooter Practice screen: everything stays on this phone, targets are added with the back camera, and every shot is logged.') },
  ],
  // The window both screens are drawn through, as in the direction B prototype: rows 528 to 2028 of 2556, which
  // hold every control (the content runs from row 606 to 1946 on both captures; above and below is the empty
  // app background). Each screen draws 1.7 times as wide as the whole screen would.
  view: [1179, 1500],
};

const lazer: CaseStudy = {
  slug: lz.slug,
  project: lz,
  title: p(lz.title),
  lede: p(lz.summary),
  claim: claimOf(lz),
  facts: {
    // src: repo git log (174 of 174 commits on main by ShySocket) + repo:README.md (on-device vision, Firebase, PWA)
    role: c('Designed and built it: the on-device vision, the Firebase multiplayer and the PWA.'),
    // src: repo git log (one author); on the list for Sai
    team: c('Solo'),
    // src: repo git log, main: first commit 2026-09-01, still active
    when: c('Since September 2026'),
    stack: lz.tags.map(p),
    links: links(lz),
    qr: {
      src: 'media/v3/lazer-qr.svg',
      px: [37, 37],
      href: lz.media.type === 'phone' ? lz.media.qrHref : lz.links[0].href,
      // src: Phone.astro of the Cue site (live copy; main, 893e405) + projects.ts qrHref
      label: c('Scan to play on your phone'),
      host: c('lazer-shooter-game.vercel.app'),
    },
  },
  hero: {
    id: 'lazer-shooter-hero',
    slot: 'wide',
    media: lzScreens,
    // src: the two captures (Playwright, live app at 393 by 852 CSS px, DPR 3)
    caption: [c('The live app at phone size: the home screen and Practice mode.')],
  },
  home: {
    media: lzScreens,
    meta: [tag(lz, 'TypeScript'), tag(lz, 'React'), tag(lz, 'InsightFace'), tag(lz, 'Firebase')],
    links: liveLinks(lz),
  },
  problem: [
    // src: projects.ts summary (restated) + repo:README.md (How a hit is decided, item 1; Tips: different people at 0.66 to 0.75)
    c('A shot has to name the right player from one phone’s camera. Face recognition is the strongest signal, but it only works within about 3 m and about 45° of face-on. On real photos, different people’s faces scored 0.66 to 0.75, above the accept threshold, so a face alone cannot name a player.'),
  ],
  approach: [
    {
      heading: p(lz.bullets![0].title),
      body: [
        p(lz.bullets![0].body),
        // src: repo:README.md (How a hit is decided: hit confidence, decoys; Tips: OUTFIT_VETO and the lookalike-stranger simulation)
        c('A shot counts only when a live opponent is above the hit confidence and clearly ahead of everyone else, decoys included. A clothing sample that contradicts a player’s scanned outfit rules that player out on that body, whatever the face says; in the look-alike stranger simulation, wrong hits fell from 34 in 30 seeds to none.'),
      ],
      figure: {
        id: 'lazer-shooter-shot',
        slot: 'wide',
        media: {
          kind: 'diagram',
          // src: repo:README.md (How a hit is decided; the hit goes to the room in one atomic write)
          title: c('How one shot is decided: each camera frame gives the bodies the pose model observed, each body gets a belief from face, identity tracking, outfit, body proportions and two decoys, and on FIRE a clear leader above the hit confidence becomes one atomic write to the room; anything else is UNCLEAR TARGET.'),
          nodes: [
            { text: c('Camera frame') },
            { text: c('Bodies the pose model observed') },
            { text: c('A belief per body: face, identity tracking, outfit, body proportions and two decoys') },
            { text: c('FIRE') },
            { text: c('A clear leader above the hit confidence, or UNCLEAR TARGET') },
            { text: c('One atomic write to the room') },
          ],
        },
        // src: inventory N17
        caption: [c('How one shot is decided.')],
      },
    },
    {
      heading: p(lz.bullets![1].title),
      body: [
        p(lz.bullets![1].body),
        // src: repo:README.md (Shot review after a round)
        c('After a round, each player sees one of their failed shots as the frame they fired on and answers whether it should have counted. The photo never leaves the phone; the upload is the shot’s numeric evidence, with names left out.'),
      ],
    },
    {
      heading: p(lz.bullets![2].title),
      body: [
        p(lz.bullets![2].body),
        // src: repo:README.md (Playing, step 2)
        c('Enrollment takes 8 head angles, and each hint names one correction (“Now 7°, aim for 12°”). After 10 s, a button to skip that angle appears.'),
      ],
    },
  ],
  outcome: {
    body: [
      // src: repo:README.md (4. Deploy for free) + repo:.github/workflows/ci.yml (the merge gate)
      c('Live at lazer-shooter-game.vercel.app, where Vercel deploys every push to main. CI runs the unit tests, the typecheck, the production build and a strict 100-seed simulation sweep that fails on any wrong hit or wrong lock.'),
      // src: repo:.github/workflows/ci.yml (header comment on npm run e2e)
      c('The browser end-to-end suite needs Chrome and the live Firebase database, so it runs on a developer machine before each pull request.'),
    ],
    links: links(lz),
  },
  next: 'reliefiq',
};

// ------------------------------------------------------------------ 3. ReliefIQ

const rq = project('reliefiq');

const reliefiq: CaseStudy = {
  slug: rq.slug,
  project: rq,
  title: p(rq.title),
  award: p(rq.award!),
  lede: p(rq.summary),
  claim: claimOf(rq),
  facts: {
    // src: sai-answers (approved by Sai)
    role: c('Built the scikit-learn Random Forest pipeline that plans resource allocation, and designed the AI and computer-vision systems: aid-demand modelling, AI support and damage analysis.'),
    // src: sai-answers (approved by Sai)
    team: c('With Austin An, Vivaan Sawant, Javier Smiley and Melissa Thomas.'),
    // src: résumé (in 8 hours, CMU NOVA Hackathon)
    when: c('Built in 8 hours at the CMU NOVA Hackathon'),
    // src: résumé (Relief IQ stack)
    stack: [c('Python'), c('Pandas'), c('scikit-learn'), c('Modal'), c('React'), c('TailwindCSS'), c('OpenAI API')],
    links: [],
  },
  hero: {
    id: 'reliefiq-hero',
    slot: 'wide',
    media: { kind: 'still', image: rqDashboard, px: [2048, 1169], alt: alt(rq, 0) },
    caption: [
      // src: the screenshot itself (relief-1.jpg); inventory N24
      c('Dashboard view for CARE Nepal: districts coloured by match score, the best fits filled blue with a gold border, and the Top 5 Best Fit Regions ranked by match score with urgency, fitness, damage and population density.'),
      // src: inventory N30
      c('A screenshot of the app; its scores are what the app displayed, not measured relief outcomes.'),
    ],
  },
  home: {
    // src (alt): the crop itself (map-top5.png)
    media: { kind: 'still', image: rqMap, px: [1712, 963], alt: c('ReliefIQ dashboard: a match-score map of Nepal’s districts beside the Top 5 Best Fit Regions for CARE Nepal.') },
    meta: rq.tags.slice(0, 4).map((t) => tag(rq, t)),
    links: [],
  },
  problem: [
    // src: projects.ts bullets (regional unmet needs; a daily plan for each volunteer), restated; inventory N22
    c('Relief organizations have to be matched to the regions with the greatest unmet need, and volunteers in the field need a plan for each day.'),
  ],
  approach: [
    {
      heading: p(rq.bullets![0].title),
      body: [
        p(rq.bullets![0].body),
        // src: résumé (Random Forest pipeline, data from 2 natural disasters); inventory N27
        c('The allocation plans come from a scikit-learn Random Forest pipeline trained on data from 2 natural disasters.'),
      ],
      figure: {
        id: 'reliefiq-summary',
        slot: 'figure',
        // src (alt): inventory N32 (projects.ts calls it a match-score map; it is the Summary view)
        media: { kind: 'still', image: rqSummary, px: [2048, 1169], alt: c('ReliefIQ summary view: NGO locations over district relief status') },
        // src: the screenshot itself (relief-2.jpg); inventory N25
        caption: [c('Summary view: NGO locations over each district’s relief status, with a 20-step relief timeline from initial response to full coverage.')],
      },
    },
    {
      heading: p(rq.bullets![1].title),
      body: [p(rq.bullets![1].body)],
    },
  ],
  outcome: {
    body: [
      // src: résumé (1st Place, CMU NOVA Hackathon, $2,000; 1st Place, CMU × BNY Case Competition, $4,200); inventory N29
      c('ReliefIQ won 1st place and $2,000 at the CMU NOVA Hackathon, and 1st place and $4,200 at the CMU × BNY Case Competition.'),
    ],
    links: [],
  },
  next: 'sunrise',
};

// ------------------------------------------------------------------ 4. Sunrise

const sn = project('sunrise');
// src: the poster frame itself (scene-13.7.webp)
const snAlt = c('Unity Scene view of a generated building facade: rows of windows and leafy decals, with a ledge stepping out above.');

const sunrise: CaseStudy = {
  slug: sn.slug,
  project: sn,
  title: p(sn.title),
  lede: p(sn.summary),
  claim: claimOf(sn),
  facts: {
    // src: sai-answers (Sai built it end to end; on the list for his approval)
    role: c('Built it end to end.'),
    // src: sai-answers (no team)
    team: c('Solo'),
    // When: no allowed source yet (the older résumé only); asked of Sai
    stack: sn.tags.map(p),
    links: links(sn),
  },
  hero: {
    id: 'sunrise-hero',
    // The documented exception: the 1110 px Scene-view cut may not be drawn wider than Figure (density 2.01).
    slot: 'figure',
    media: {
      kind: 'video',
      sources: sources(
        { src: 'media/v3/sunrise-scene.av1.mp4', type: AV1_720 },
        { src: 'media/v3/sunrise-scene.h264.mp4', type: 'video/mp4; codecs="avc1.640032"' },
      ),
      poster: snScene,
      posterPx: [1110, 624],
      px: [1110, 624],
      seconds: 29.4,
      alt: snAlt,
    },
    caption: [
      p(sn.media.label),
      // src: PRODUCT.md (the Unity editor capture cropped to its Scene view); inventory N36
      c('Unity editor capture, cropped to the Scene view: the generator at work, not the headset view.'),
    ],
  },
  home: {
    media: { kind: 'still', image: snScene, px: [1110, 624], alt: snAlt },
    meta: [tag(sn, 'Unity'), tag(sn, 'C#'), tag(sn, 'Blender geometry nodes'), tag(sn, 'OpenXR')],
    links: liveLinks(sn),
  },
  problem: [
    // src: projects.ts summary (endlessly expanding city; small physical space), restated; inventory N34
    c('An endlessly expanding city has to be explored inside a small physical space.'),
  ],
  approach: [
    {
      heading: p(sn.bullets![0].title),
      body: [p(sn.bullets![0].body)],
      figure: {
        id: 'sunrise-block',
        slot: 'figure',
        // src (alt): the still itself (scene-19.0.webp)
        media: { kind: 'still', image: snBlock, px: [1110, 624], alt: c('Unity Scene view from above of a generated block several floors high, its walls lined with windows, with the move gizmo on one piece.') },
        // src: the still itself + projects.ts (modular pieces); inventory N37b
        caption: [c('Scene view at 0:19: a multi-floor block assembled from modular pieces.')],
      },
    },
    {
      heading: p(sn.bullets![1].title),
      body: [p(sn.bullets![1].body)],
    },
  ],
  // Outcome line: none on record yet; asked of Sai. The links stand alone.
  outcome: { body: [], links: links(sn) },
  next: 'gyroblaster',
};

// ------------------------------------------------------------------ 5. GyroBlaster

const gb = project('gyroblaster');
// src: the frame itself (play-4.6.webp; the players still stays out until both players consent)
const gbAlt = c('GyroBlaster projected on a screen in a dark room: two ships over a purple nebula, one firing a beam, with an asteroid below.');

const gyroblaster: CaseStudy = {
  slug: gb.slug,
  project: gb,
  title: p(gb.title),
  lede: p(gb.summary),
  claim: claimOf(gb),
  facts: {
    // Role: no allowed source yet; asked of Sai
    // src: sai-answers (built with Ashank Manda)
    team: c('With Ashank Manda.'),
    // src: sai-answers (CMU 15-112 term project)
    when: c('CMU 15-112 term project'),
    stack: gb.tags.map(p),
    links: links(gb),
  },
  hero: {
    id: 'gyroblaster-hero',
    slot: 'wide',
    media: {
      kind: 'video',
      sources: sources(
        { src: 'media/v3/gyroblaster-play.av1.mp4', type: AV1_1080 },
        { src: 'media/v3/gyroblaster-play.h264.mp4', type: 'video/mp4; codecs="avc1.640033"' },
      ),
      poster: gbPlay,
      posterPx: [1920, 1080],
      px: [1920, 1080],
      seconds: 5.7,
      alt: gbAlt,
    },
    caption: [
      p(gb.media.label),
      // src: the recording itself (a phone filming the projected game)
      c('Phone recording of the game on a projector screen.'),
    ],
  },
  home: {
    // src (alt): the crop itself (play-4.6-screen.webp)
    media: { kind: 'still', image: gbScreen, px: [1120, 630], alt: c('GyroBlaster on a projector screen: two ships over a purple nebula, one firing a beam, with an asteroid below.') },
    meta: [tag(gb, 'Python'), tag(gb, 'TCP sockets'), tag(gb, 'JSON serialization'), tag(gb, 'Pyto')],
    links: liveLinks(gb),
  },
  problem: [
    // src: projects.ts summary (two players, a shared laptop screen, a phone each), restated; inventory N40
    c('Two players share one laptop screen, and each needs to steer their own ship with only a phone.'),
  ],
  approach: [
    {
      // projects.ts has no notes for GyroBlaster, so one untitled subsection holds the diagram alone.
      body: [],
      figure: {
        id: 'gyroblaster-flow',
        slot: 'figure',
        media: {
          kind: 'diagram',
          // src: projects.ts summary and tags, restated
          title: c('How each phone steers its ship: the phone’s gyroscope is read in the Pyto IDE and streamed with JSON serialization over a custom TCP client-server protocol to the shared laptop screen.'),
          nodes: [
            { text: phrase(gb.summary, 'phone’s gyroscope') },
            { text: phrase(gb.summary, 'Pyto IDE'), edge: tag(gb, 'JSON serialization') },
            { text: phrase(gb.summary, 'custom TCP client-server protocol') },
            { text: phrase(gb.summary, 'shared laptop screen') },
          ],
        },
        // src: projects.ts summary, restated
        caption: [c('How each phone steers its ship.')],
      },
    },
  ],
  // Outcome line: none on record yet; asked of Sai. The link stands alone.
  outcome: { body: [], links: links(gb) },
  next: 'sidequest',
};

// ------------------------------------------------------------------ order and guards

/** The five case studies in the fixed order (PRODUCT.md): Sidequest, Lazer Shooter, ReliefIQ, Sunrise, GyroBlaster. */
export const caseStudies: CaseStudy[] = [sidequest, lazer, reliefiq, sunrise, gyroblaster];
export const bySlug: Record<string, CaseStudy> = Object.fromEntries(caseStudies.map((cs) => [cs.slug, cs]));

{
  const order = ['sidequest', 'lazer-shooter', 'reliefiq', 'sunrise', 'gyroblaster'];
  const slugs = caseStudies.map((cs) => cs.slug);
  if (slugs.join() !== order.join()) fail("order is", slugs.join());
  if (projects.map((x) => x.slug).join() !== order.join()) fail("projects.ts order changed");
  caseStudies.forEach((cs, i) => {
    if (cs.next !== order[(i + 1) % order.length]) fail(cs.slug, "points next to", cs.next);
    if (cs.approach.length > 3) fail(cs.slug, "has more than 3 approach subsections");
    if (cs.home.meta.length > 4) fail(cs.slug, "has more than 4 meta tags");
    if (cs.facts.links.filter((l) => l.primary).length > 1) fail(cs.slug, "has two primary links");
  });
}

// ------------------------------------------------------------------ chart data
// Speed curves of IMG_3775.mov (87.63 s, 2626 samples at 29.98 fps), from the analyzer output files
// tools/video-analyzer/out/IMG_3775.speed.json (raw) and IMG_3775.speed.final.json (ground-masked and
// acceleration-limited). Kept as flat t, v pairs (seconds to 0.01, px/s at the 960 px analysis width, rounded):
// the raw run as the minimum and maximum of every 6 samples (0.2 s), so its spikes survive; the final run as the
// minimum and maximum of every 12 samples.

function speedRaw(): number[] {
  return [
    0.03, 173, 0.2, 180, 0.23, 181, 0.4, 187, 0.43, 190, 0.57, 190, 0.63, 190, 0.8, 188,
    0.83, 187, 1.0, 185, 1.03, 178, 1.2, 175, 1.27, 173, 1.4, 175, 1.43, 175, 1.6, 178,
    1.63, 180, 1.8, 184, 1.83, 187, 2.0, 189, 2.03, 190, 2.2, 196, 2.23, 197, 2.4, 201,
    2.44, 201, 2.6, 199, 2.64, 199, 2.7, 199, 2.84, 199, 2.94, 199, 3.04, 199, 3.07, 198,
    3.27, 198, 3.34, 199, 3.44, 199, 3.57, 200, 3.64, 200, 3.8, 199, 3.84, 199, 4.0, 195,
    4.04, 195, 4.2, 190, 4.24, 189, 4.4, 184, 4.44, 183, 4.6, 177, 4.64, 177, 4.8, 170,
    4.84, 168, 5.0, 159, 5.04, 159, 5.2, 145, 5.24, 144, 5.4, 140, 5.44, 140, 5.6, 138,
    5.64, 138, 5.77, 137, 5.84, 137, 6.0, 140, 6.04, 141, 6.2, 150, 6.24, 155, 6.4, 167,
    6.44, 167, 6.6, 183, 6.64, 186, 6.8, 199, 6.84, 202, 7.01, 219, 7.04, 222, 7.21, 237,
    7.24, 241, 7.41, 256, 7.44, 259, 7.61, 276, 7.64, 278, 7.81, 291, 7.84, 291, 8.01, 308,
    8.04, 309, 8.21, 322, 8.24, 323, 8.41, 337, 8.44, 341, 8.61, 350, 8.64, 350, 8.81, 363,
    8.84, 365, 9.01, 376, 9.04, 377, 9.21, 386, 9.24, 391, 9.41, 404, 9.44, 405, 9.61, 414,
    9.64, 417, 9.81, 427, 9.84, 432, 10.01, 444, 10.04, 446, 10.21, 462, 10.24, 464, 10.41, 479,
    10.44, 483, 10.61, 492, 10.64, 492, 10.81, 498, 10.84, 499, 11.01, 506, 11.04, 507, 11.14, 511,
    11.24, 514, 11.41, 529, 11.44, 531, 11.61, 543, 11.64, 545, 11.81, 555, 11.84, 555, 12.01, 569,
    12.04, 570, 12.21, 585, 12.24, 587, 12.38, 591, 12.44, 591, 12.61, 608, 12.64, 610, 12.81, 619,
    12.84, 619, 13.01, 621, 13.04, 622, 13.14, 622, 13.24, 622, 13.41, 620, 13.44, 619, 13.61, 617,
    13.64, 615, 13.74, 614, 13.84, 614, 13.94, 618, 14.04, 618, 14.18, 612, 14.24, 612, 14.41, 628,
    14.44, 628, 14.61, 639, 14.64, 640, 14.81, 645, 14.84, 645, 15.01, 645, 15.04, 643, 15.11, 641,
    15.28, 641, 15.38, 636, 15.44, 636, 15.58, 633, 15.64, 636, 15.81, 633, 15.84, 627, 15.94, 626,
    16.04, 627, 16.14, 636, 16.28, 636, 16.35, 638, 16.45, 637, 16.61, 636, 16.65, 634, 16.75, 632,
    16.85, 634, 17.01, 652, 17.05, 654, 17.21, 662, 17.25, 662, 17.38, 667, 17.45, 670, 17.61, 673,
    17.71, 673, 17.78, 673, 17.85, 673, 17.98, 674, 18.08, 674, 18.21, 664, 18.25, 664, 18.41, 644,
    18.45, 643, 18.58, 634, 18.65, 622, 18.68, 621, 18.85, 621, 19.01, 648, 19.05, 648, 19.18, 647,
    19.25, 647, 19.41, 638, 19.45, 638, 19.61, 641, 19.65, 643, 19.81, 654, 19.85, 654, 19.95, 656,
    20.05, 656, 20.18, 656, 20.25, 655, 20.41, 647, 20.45, 643, 20.61, 631, 20.65, 630, 20.82, 601,
    20.85, 594, 21.02, 575, 21.05, 566, 21.22, 559, 21.25, 558, 21.32, 554, 21.45, 554, 21.62, 575,
    21.65, 575, 21.82, 571, 21.85, 570, 21.98, 562, 22.05, 561, 22.22, 546, 22.25, 545, 22.42, 524,
    22.45, 519, 22.62, 500, 22.65, 497, 22.82, 484, 22.92, 478, 23.02, 485, 23.05, 485, 23.22, 522,
    23.28, 527, 23.38, 522, 23.45, 522, 23.62, 505, 23.65, 499, 23.82, 490, 23.85, 483, 24.02, 479,
    24.05, 475, 24.18, 471, 24.28, 471, 24.42, 472, 24.45, 473, 24.62, 478, 24.65, 480, 24.78, 487,
    24.85, 488, 25.02, 491, 25.05, 490, 25.22, 497, 25.25, 498, 25.35, 499, 25.45, 501, 25.62, 506,
    25.65, 506, 25.82, 515, 25.85, 516, 26.02, 519, 26.05, 521, 26.22, 526, 26.25, 526, 26.39, 523,
    26.45, 520, 26.62, 510, 26.65, 508, 26.82, 501, 26.85, 500, 27.02, 488, 27.05, 488, 27.22, 479,
    27.25, 479, 27.42, 473, 27.45, 472, 27.62, 466, 27.65, 465, 27.82, 459, 27.85, 459, 28.02, 458,
    28.05, 458, 28.19, 460, 28.25, 462, 28.42, 470, 28.45, 474, 28.62, 491, 28.65, 493, 28.82, 523,
    28.85, 524, 29.02, 546, 29.05, 548, 29.22, 561, 29.25, 564, 29.42, 569, 29.45, 569, 29.62, 594,
    29.65, 598, 29.79, 615, 29.85, 617, 30.02, 642, 30.06, 644, 30.22, 668, 30.26, 671, 30.42, 691,
    30.46, 706, 30.62, 714, 30.66, 716, 30.79, 741, 30.86, 741, 30.89, 737, 31.06, 742, 31.22, 763,
    31.26, 763, 31.42, 772, 31.46, 774, 31.62, 788, 31.66, 788, 31.79, 796, 31.86, 798, 31.89, 800,
    32.06, 800, 32.22, 816, 32.26, 818, 32.39, 825, 32.49, 825, 32.62, 820, 32.66, 820, 32.76, 811,
    32.86, 812, 32.99, 827, 33.06, 827, 33.22, 825, 33.26, 824, 33.36, 822, 33.46, 823, 33.62, 831,
    33.66, 831, 33.79, 829, 33.92, 826, 34.02, 832, 34.06, 848, 34.22, 884, 34.26, 884, 34.42, 858,
    34.46, 857, 34.63, 842, 34.66, 841, 34.76, 821, 34.86, 821, 35.03, 833, 35.06, 843, 35.23, 835,
    35.26, 833, 35.43, 819, 35.46, 819, 35.59, 816, 35.66, 816, 35.83, 804, 35.86, 801, 35.99, 798,
    36.06, 797, 36.23, 795, 36.26, 788, 36.43, 787, 36.46, 785, 36.63, 781, 36.66, 780, 36.83, 767,
    36.86, 766, 37.03, 759, 37.06, 756, 37.23, 739, 37.26, 737, 37.43, 725, 37.46, 723, 37.63, 710,
    37.66, 709, 37.83, 702, 37.86, 699, 38.03, 679, 38.06, 679, 38.23, 663, 38.26, 660, 38.43, 642,
    38.46, 641, 38.63, 619, 38.66, 613, 38.83, 574, 38.86, 572, 39.03, 551, 39.06, 542, 39.23, 519,
    39.26, 509, 39.43, 492, 39.46, 489, 39.63, 467, 39.66, 462, 39.83, 446, 39.86, 441, 40.03, 423,
    40.06, 421, 40.23, 401, 40.26, 400, 40.43, 387, 40.46, 383, 40.63, 374, 40.66, 368, 40.83, 354,
    40.86, 354, 41.03, 348, 41.06, 342, 41.23, 337, 41.26, 337, 41.43, 343, 41.46, 343, 41.63, 348,
    41.66, 350, 41.83, 371, 41.86, 377, 41.9, 377, 42.06, 376, 42.2, 369, 42.26, 369, 42.36, 372,
    42.46, 372, 42.63, 347, 42.66, 342, 42.73, 341, 42.86, 342, 43.03, 349, 43.06, 353, 43.2, 355,
    43.26, 355, 43.33, 356, 43.46, 354, 43.63, 348, 43.66, 346, 43.83, 342, 43.9, 341, 44.03, 342,
    44.07, 342, 44.1, 343, 44.27, 342, 44.37, 338, 44.47, 338, 44.63, 344, 44.67, 346, 44.83, 350,
    44.87, 350, 44.97, 350, 45.07, 350, 45.23, 351, 45.27, 351, 45.43, 355, 45.47, 356, 45.63, 364,
    45.67, 364, 45.83, 372, 45.87, 373, 46.03, 376, 46.07, 376, 46.23, 379, 46.27, 380, 46.43, 383,
    46.5, 383, 46.6, 382, 46.67, 383, 46.83, 380, 46.87, 380, 47.0, 377, 47.07, 377, 47.13, 378,
    47.27, 378, 47.4, 376, 47.47, 375, 47.53, 374, 47.67, 372, 47.83, 365, 47.87, 365, 48.03, 357,
    48.07, 356, 48.23, 360, 48.27, 360, 48.44, 365, 48.47, 372, 48.5, 372, 48.7, 372, 48.84, 373,
    48.87, 375, 49.0, 379, 49.1, 381, 49.24, 379, 49.27, 379, 49.44, 377, 49.5, 377, 49.64, 374,
    49.74, 374, 49.8, 374, 49.87, 374, 50.0, 377, 50.07, 377, 50.14, 376, 50.3, 375, 50.44, 377,
    50.5, 377, 50.57, 375, 50.67, 375, 50.84, 373, 50.87, 373, 51.04, 374, 51.07, 375, 51.24, 376,
    51.27, 377, 51.44, 375, 51.47, 374, 51.64, 371, 51.67, 371, 51.84, 373, 51.87, 373, 52.04, 376,
    52.07, 377, 52.17, 379, 52.27, 379, 52.44, 377, 52.47, 377, 52.64, 382, 52.67, 383, 52.84, 388,
    52.87, 388, 53.04, 384, 53.07, 383, 53.24, 379, 53.27, 375, 53.44, 366, 53.47, 364, 53.64, 351,
    53.67, 349, 53.81, 343, 53.87, 343, 54.04, 345, 54.07, 345, 54.24, 347, 54.27, 349, 54.44, 355,
    54.47, 356, 54.64, 367, 54.67, 368, 54.84, 380, 54.87, 395, 55.04, 425, 55.07, 444, 55.24, 463,
    55.27, 463, 55.44, 476, 55.47, 476, 55.64, 515, 55.67, 525, 55.84, 585, 55.87, 587, 56.04, 626,
    56.07, 626, 56.24, 647, 56.27, 649, 56.44, 674, 56.47, 678, 56.64, 703, 56.67, 706, 56.84, 734,
    56.87, 738, 57.04, 761, 57.07, 762, 57.24, 782, 57.27, 782, 57.44, 801, 57.47, 804, 57.64, 825,
    57.68, 828, 57.84, 852, 57.88, 853, 58.04, 859, 58.08, 860, 58.24, 865, 58.28, 866, 58.34, 873,
    58.48, 872, 58.64, 866, 58.71, 862, 58.84, 866, 58.88, 867, 59.04, 912, 59.08, 920, 59.24, 892,
    59.28, 841, 59.41, 669, 59.48, 669, 59.61, 640, 59.68, 636, 59.84, 696, 59.88, 738, 60.04, 861,
    60.18, 874, 60.24, 868, 60.28, 861, 60.44, 890, 60.48, 892, 60.64, 1174, 60.68, 1211, 60.84, 1178,
    60.88, 1178, 61.04, 1647, 61.08, 2118, 61.11, 2151, 61.28, 2027, 61.44, 1165, 61.48, 1071, 61.54, 948,
    61.68, 948, 61.84, 1108, 61.88, 1141, 62.04, 1205, 62.08, 1219, 62.24, 1294, 62.28, 1296, 62.38, 1330,
    62.48, 1330, 62.65, 1316, 62.68, 1313, 62.85, 1248, 62.88, 1226, 63.05, 1165, 63.08, 1149, 63.25, 1103,
    63.28, 1077, 63.35, 1065, 63.48, 1065, 63.65, 1088, 63.68, 1092, 63.71, 1095, 63.88, 1095, 64.05, 1055,
    64.08, 1054, 64.25, 1008, 64.28, 1001, 64.45, 889, 64.48, 877, 64.65, 798, 64.68, 769, 64.85, 680,
    64.88, 668, 65.05, 644, 65.08, 616, 65.25, 583, 65.28, 566, 65.45, 531, 65.48, 530, 65.61, 505,
    65.68, 505, 65.78, 502, 65.91, 504, 65.98, 505, 66.08, 505, 66.18, 508, 66.35, 508, 66.41, 500,
    66.48, 500, 66.65, 493, 66.68, 491, 66.81, 490, 66.88, 490, 67.05, 467, 67.08, 466, 67.25, 429,
    67.28, 428, 67.45, 378, 67.48, 373, 67.58, 368, 67.68, 372, 67.88, 372, 67.98, 371, 68.08, 374,
    68.25, 546, 68.28, 548, 68.45, 596, 68.48, 604, 68.65, 614, 68.68, 633, 68.85, 652, 68.88, 673,
    69.05, 636, 69.08, 636, 69.22, 653, 69.28, 654, 69.38, 675, 69.48, 675, 69.65, 690, 69.68, 691,
    69.85, 695, 69.88, 698, 70.05, 679, 70.08, 679, 70.22, 660, 70.28, 660, 70.45, 672, 70.48, 680,
    70.65, 756, 70.68, 763, 70.85, 812, 70.88, 816, 71.05, 823, 71.08, 823, 71.15, 831, 71.28, 829,
    71.45, 827, 71.48, 825, 71.65, 739, 71.69, 633, 71.85, 585, 71.89, 574, 72.05, 507, 72.09, 504,
    72.15, 499, 72.29, 499, 72.39, 509, 72.49, 504, 72.55, 507, 72.69, 504, 72.85, 492, 72.89, 491,
    72.99, 488, 73.09, 488, 73.12, 679, 73.29, 612, 73.45, 415, 73.49, 413, 73.65, 383, 73.69, 383,
    73.85, 358, 73.89, 354, 74.05, 346, 74.09, 345, 74.22, 337, 74.29, 340, 74.45, 407, 74.49, 417,
    74.65, 412, 74.69, 412, 74.85, 403, 74.89, 406, 74.99, 373, 75.09, 401, 75.22, 408, 75.29, 408,
    75.45, 412, 75.49, 413, 75.65, 413, 75.69, 414, 75.85, 436, 75.89, 441, 76.05, 468, 76.09, 469,
    76.26, 486, 76.29, 491, 76.46, 505, 76.49, 508, 76.66, 521, 76.69, 524, 76.86, 549, 76.89, 552,
    77.06, 563, 77.09, 563, 77.22, 567, 77.29, 567, 77.46, 565, 77.49, 562, 77.66, 548, 77.69, 546,
    77.86, 521, 77.89, 516, 78.06, 496, 78.09, 488, 78.26, 463, 78.29, 456, 78.46, 431, 78.49, 426,
    78.66, 397, 78.69, 396, 78.86, 373, 78.89, 367, 79.06, 346, 79.09, 338, 79.26, 319, 79.29, 315,
    79.46, 291, 79.49, 289, 79.66, 272, 79.69, 265, 79.86, 253, 79.89, 250, 79.99, 247, 80.09, 246,
    80.26, 244, 80.29, 244, 80.36, 241, 80.49, 241, 80.66, 243, 80.69, 246, 80.86, 261, 80.89, 263,
    81.06, 274, 81.09, 277, 81.26, 283, 81.29, 286, 81.39, 288, 81.49, 286, 81.66, 254, 81.69, 254,
    81.83, 231, 81.89, 219, 81.96, 238, 82.09, 347, 82.26, 338, 82.29, 333, 82.46, 290, 82.49, 277,
    82.66, 259, 82.69, 256, 82.86, 229, 82.89, 224, 83.06, 197, 83.09, 192, 83.26, 177, 83.29, 173,
    83.46, 159, 83.49, 159, 83.66, 150, 83.69, 147, 83.86, 136, 83.89, 132, 84.06, 118, 84.09, 117,
    84.26, 106, 84.29, 104, 84.33, 103, 84.49, 103, 84.56, 100, 84.69, 101, 84.86, 105, 84.89, 105,
    85.06, 110, 85.09, 111, 85.26, 117, 85.29, 119, 85.46, 126, 85.5, 127, 85.66, 135, 85.7, 136,
    85.83, 141, 85.9, 142, 86.06, 163, 86.1, 163, 86.26, 189, 86.3, 190, 86.46, 212, 86.5, 214,
    86.66, 229, 86.7, 230, 86.86, 247, 86.9, 249, 87.06, 275, 87.1, 276, 87.26, 308, 87.3, 315,
    87.43, 328, 87.5, 328, 87.6, 325,
  ];
}

function speedFinal(): number[] {
  return [
    0.03, 173, 0.2, 178, 0.7, 176, 0.8, 172, 0.83, 171, 1.13, 158, 1.27, 158, 1.6, 171,
    1.63, 171, 1.97, 181, 2.03, 182, 2.37, 195, 2.44, 195, 2.7, 191, 2.97, 193, 3.14, 192,
    3.24, 193, 3.6, 195, 3.64, 195, 4.0, 190, 4.04, 190, 4.4, 175, 4.44, 174, 4.8, 165,
    4.84, 162, 5.2, 140, 5.24, 140, 5.6, 133, 5.84, 132, 6.0, 135, 6.04, 136, 6.4, 159,
    6.44, 160, 6.8, 189, 6.84, 193, 7.21, 224, 7.24, 227, 7.61, 259, 7.64, 262, 8.01, 290,
    8.04, 291, 8.41, 316, 8.44, 317, 8.81, 341, 8.84, 342, 9.21, 359, 9.24, 364, 9.61, 377,
    9.64, 377, 10.01, 417, 10.04, 417, 10.37, 462, 10.44, 462, 10.77, 496, 10.84, 496, 11.14, 504,
    11.24, 504, 11.61, 530, 11.64, 531, 12.01, 558, 12.04, 559, 12.38, 583, 12.44, 584, 12.81, 614,
    12.84, 615, 13.18, 620, 13.24, 620, 13.61, 618, 13.88, 611, 13.94, 616, 14.04, 611, 14.18, 598,
    14.44, 609, 14.54, 616, 14.84, 612, 15.11, 591, 15.41, 592, 15.61, 580, 15.64, 580, 15.91, 574,
    16.04, 575, 16.41, 603, 16.58, 608, 16.81, 595, 16.85, 597, 17.21, 625, 17.25, 633, 17.58, 656,
    17.85, 663, 18.01, 646, 18.05, 638, 18.21, 622, 18.45, 631, 18.68, 618, 18.85, 629, 19.15, 649,
    19.25, 649, 19.61, 632, 19.91, 643, 20.01, 630, 20.05, 630, 20.41, 592, 20.45, 584, 20.68, 604,
    20.85, 582, 21.22, 534, 21.25, 535, 21.55, 518, 21.72, 526, 21.92, 514, 22.05, 514, 22.35, 495,
    22.45, 496, 22.82, 471, 22.85, 463, 23.12, 432, 23.25, 435, 23.48, 475, 23.65, 471, 23.78, 480,
    24.05, 472, 24.12, 468, 24.52, 467, 24.72, 476, 25.05, 474, 25.22, 483, 25.25, 486, 25.45, 475,
    25.65, 491, 25.99, 546, 26.05, 550, 26.42, 537, 26.45, 536, 26.82, 520, 26.85, 519, 27.15, 509,
    27.29, 508, 27.59, 498, 27.65, 495, 28.02, 480, 28.05, 480, 28.39, 487, 28.45, 489, 28.82, 536,
    28.85, 542, 29.19, 574, 29.35, 569, 29.52, 586, 29.65, 587, 30.02, 624, 30.06, 624, 30.42, 672,
    30.56, 690, 30.76, 665, 30.86, 662, 31.16, 713, 31.26, 713, 31.62, 672, 31.66, 664, 31.99, 627,
    32.12, 649, 32.42, 634, 32.46, 631, 32.82, 618, 32.86, 618, 33.19, 671, 33.29, 666, 33.56, 692,
    33.66, 700, 33.76, 721, 34.06, 719, 34.42, 807, 34.46, 811, 34.73, 796, 34.86, 799, 35.19, 857,
    35.26, 841, 35.63, 753, 35.66, 748, 35.83, 732, 36.06, 735, 36.43, 717, 36.53, 715, 36.76, 721,
    36.86, 718, 37.16, 700, 37.26, 700, 37.63, 674, 37.66, 671, 38.03, 638, 38.16, 640, 38.43, 587,
    38.46, 581, 38.73, 547, 38.86, 546, 39.23, 458, 39.26, 450, 39.6, 427, 39.66, 421, 40.03, 393,
    40.06, 386, 40.43, 376, 40.46, 376, 40.73, 360, 40.9, 365, 41.23, 320, 41.33, 297, 41.6, 322,
    41.83, 339, 42.03, 296, 42.06, 288, 42.43, 277, 42.46, 277, 42.83, 295, 42.86, 300, 43.23, 331,
    43.3, 335, 43.63, 324, 43.66, 320, 43.8, 310, 44.1, 311, 44.37, 303, 44.47, 303, 44.83, 321,
    44.87, 321, 45.0, 319, 45.27, 321, 45.63, 330, 45.67, 331, 46.03, 342, 46.13, 346, 46.37, 343,
    46.5, 344, 46.83, 351, 46.87, 351, 47.23, 356, 47.27, 356, 47.63, 328, 47.67, 328, 47.77, 321,
    48.07, 322, 48.44, 340, 48.47, 347, 48.84, 369, 49.07, 380, 49.24, 371, 49.4, 367, 49.64, 404,
    49.67, 404, 50.04, 413, 50.24, 416, 50.44, 370, 50.47, 362, 50.8, 342, 50.87, 342, 51.07, 346,
    51.27, 345, 51.54, 338, 51.67, 338, 52.04, 345, 52.07, 346, 52.17, 348, 52.47, 346, 52.77, 357,
    52.87, 357, 53.24, 331, 53.27, 329, 53.64, 302, 53.87, 291, 54.04, 301, 54.07, 309, 54.24, 349,
    54.47, 343, 54.84, 412, 54.87, 414, 55.21, 440, 55.31, 440, 55.64, 471, 55.67, 475, 56.04, 516,
    56.07, 524, 56.44, 612, 56.47, 620, 56.84, 691, 56.87, 692, 57.24, 738, 57.27, 739, 57.64, 772,
    57.68, 772, 58.04, 800, 58.08, 801, 58.28, 809, 58.61, 791, 58.84, 811, 58.88, 819, 59.24, 736,
    59.28, 728, 59.58, 670, 59.68, 671, 60.04, 749, 60.08, 757, 60.44, 845, 60.48, 853, 60.84, 941,
    60.94, 965, 61.24, 900, 61.28, 892, 61.64, 826, 61.74, 824, 62.04, 848, 62.08, 856, 62.45, 944,
    62.48, 952, 62.81, 1032, 62.88, 1016, 63.25, 966, 63.28, 962, 63.65, 889, 63.68, 881, 64.05, 793,
    64.08, 785, 64.45, 697, 64.48, 689, 64.85, 601, 64.88, 596, 65.25, 525, 65.28, 517, 65.65, 440,
    65.68, 439, 66.01, 417, 66.08, 417, 66.38, 470, 66.48, 446, 66.85, 358, 66.88, 350, 67.15, 295,
    67.48, 288, 67.65, 297, 67.68, 297, 67.98, 310, 68.08, 309, 68.45, 377, 68.48, 385, 68.85, 473,
    68.88, 481, 69.25, 569, 69.28, 577, 69.52, 633, 69.82, 656, 69.98, 621, 70.08, 621, 70.35, 673,
    70.48, 649, 70.82, 633, 71.02, 665, 71.25, 609, 71.28, 601, 71.65, 537, 71.69, 534, 72.05, 481,
    72.09, 473, 72.45, 505, 72.52, 504, 72.85, 552, 72.89, 560, 73.19, 632, 73.29, 614, 73.65, 551,
    73.69, 547, 74.05, 479, 74.09, 480, 74.39, 532, 74.49, 508, 74.85, 420, 74.89, 412, 75.02, 380,
    75.29, 386, 75.62, 353, 75.69, 353, 76.05, 404, 76.09, 405, 76.46, 444, 76.49, 445, 76.86, 487,
    76.89, 487, 77.16, 500, 77.39, 501, 77.66, 491, 77.69, 489, 78.06, 439, 78.09, 438, 78.46, 391,
    78.49, 383, 78.86, 338, 78.89, 332, 79.26, 293, 79.29, 285, 79.66, 249, 79.69, 248, 79.99, 228,
    80.09, 227, 80.42, 222, 80.49, 222, 80.86, 234, 80.89, 237, 81.19, 253, 81.29, 251, 81.66, 211,
    81.79, 179, 82.06, 231, 82.23, 271, 82.46, 223, 82.49, 215, 82.86, 141, 82.89, 133, 83.26, 56,
    83.29, 48, 83.53, 20, 83.69, 21, 84.06, 51, 84.09, 51, 84.46, 104, 84.49, 104, 84.79, 86,
    84.89, 81, 85.06, 63, 85.29, 80, 85.5, 127, 85.73, 102, 86.06, 149, 86.3, 151, 86.46, 175,
    86.5, 183, 86.7, 156, 86.9, 173, 87.26, 262, 87.3, 270, 87.56, 309,
  ];
}
