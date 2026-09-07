import type { ImageMetadata } from 'astro';
import relief1 from '../assets/relief-1.jpg';
import relief2 from '../assets/relief-2.jpg';
import relief3 from '../assets/relief-3.jpg';
import lazerHome from '../assets/lazer-home.png';

export type Link = { label: string; href: string; kind: 'play' | 'code' | 'watch' };

export type Media =
  | { type: 'video'; src: string; poster: string; label: string }
  | { type: 'images'; images: ImageMetadata[]; alts: string[]; label: string }
  | { type: 'phone'; images: ImageMetadata[]; alts: string[]; qr: string; qrHref: string; label: string };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  award?: string;
  summary: string;
  bullets?: { title: string; body: string }[];
  tags: string[];
  links: Link[];
  media: Media;
};

export const projects: Project[] = [
  {
    slug: 'sidequest',
    title: 'Sidequest',
    kicker: 'Unity 6 · Computer vision · Vehicle motion',
    summary:
      'A runner that lives in the world outside a car window. A phone propped against the glass shows the street going by while a character runs alongside the vehicle on sidewalks, railings and hedge tops, jumping and dodging whatever the street brings. Its progress is driven by the car’s real motion.',
    bullets: [
      {
        title: 'Footage becomes the level',
        body: 'An offline Python pipeline turns dashcam video into a playable level: per-frame speed estimation, SAM 2 segmentation of railings and hedges, hue-and-circularity marker tracking, and a frame-by-frame audit gate before anything ships.',
      },
      {
        title: 'Choreography that stays a game',
        body: 'Every jump is authored to video time and obeys gravity, with air time scaling as the square root of height. A press inside a 0.75 s window scores the cue; a miss crashes the run.',
      },
      {
        title: 'Built for the real road',
        body: 'A GPS + IMU transport motion estimator with dead reckoning feeds live vehicle speed to the runner for the real-time version.',
      },
    ],
    tags: ['Unity 6', 'C#', 'Python', 'OpenCV', 'SAM 2', 'WebGL', 'GPS + IMU'],
    links: [
      { label: 'Play in browser', href: 'https://video-runner.vercel.app', kind: 'play' },
      { label: 'View code', href: 'https://github.com/ShySocket/sidequest', kind: 'code' },
    ],
    media: {
      type: 'video',
      src: 'media/sidequest.mp4',
      poster: 'media/sidequest-poster.webp',
      label: 'Sidequest gameplay: a character runs over real street footage, jumping cars and hedges',
    },
  },
  {
    slug: 'lazer-shooter',
    title: 'Lazer Shooter',
    kicker: 'TypeScript · On-device vision · Realtime multiplayer',
    summary:
      'Real-life laser tag played with phones. Everyone opens the same link, enrolls their face and outfit, then hunts each other with the rear camera. Press FIRE with a player in the crosshair and their phone takes the hit.',
    bullets: [
      {
        title: 'Four signals decide a hit',
        body: 'Face recognition (InsightFace, ArcFace family), identity tracking, whole-outfit colour signatures and body proportions fuse into a per-body belief. Decoys for the shooter’s own profile and a stranger baseline mean the app says UNCLEAR TARGET instead of guessing.',
      },
      {
        title: 'Nothing leaves the phone',
        body: 'Face, pose and clothing models run in the shooter’s browser. Only numeric signatures sync through Firebase Realtime Database; photos are never uploaded.',
      },
      {
        title: 'Zero install',
        body: 'A PWA that works on iPhone Safari and Android Chrome, with optional Google sign-in for a one-time deep scan that follows a player to any phone.',
      },
    ],
    tags: ['TypeScript', 'React', 'Vite', 'PWA', 'InsightFace', 'Firebase'],
    links: [
      { label: 'Play on your phone', href: 'https://lazer-shooter-game.vercel.app', kind: 'play' },
      { label: 'View code', href: 'https://github.com/ShySocket/LazerShooterGame', kind: 'code' },
    ],
    media: {
      type: 'phone',
      images: [lazerHome],
      alts: ['Lazer Shooter home screen: create a room or join one'],
      qr: 'media/lazer-qr.svg',
      qrHref: 'https://lazer-shooter-game.vercel.app',
      label: 'Lazer Shooter screenshots',
    },
  },
  {
    slug: 'reliefiq',
    title: 'ReliefIQ',
    kicker: 'AI · Computer vision · Geospatial scoring',
    award: '1st place, CMU NOVA Hackathon',
    summary:
      'An AI-powered disaster relief coordination platform: data-driven aid allocation for decision-makers and real-time coordination for field volunteers in remote, high-impact regions.',
    bullets: [
      {
        title: 'Resource Allocation Management',
        body: 'Match-score mapping aligns organizational capabilities with regional unmet needs, predictive movement analysis forecasts displacement and demand, and an AI assistant drafts and refines regional allocation plans.',
      },
      {
        title: 'Volunteer Information Platform',
        body: 'Computer vision flags infrastructure damage and blocked routes from field photos, and a daily plan generator gives each volunteer a personalized task list with live Q&A.',
      },
    ],
    tags: ['Machine learning', 'Computer vision', 'Geospatial indices', 'Predictive modeling'],
    links: [],
    media: {
      type: 'images',
      images: [relief1, relief2, relief3],
      alts: ['ReliefIQ allocation dashboard', 'ReliefIQ regional match-score map', 'ReliefIQ volunteer daily plan'],
      label: 'ReliefIQ screenshots',
    },
  },
  {
    slug: 'sunrise',
    title: 'Sunrise',
    kicker: 'VR · Procedural generation · Spatial redirection',
    summary:
      'A single-player, first-person VR exploration of an endlessly expanding city inspired by Hong Kong and Kowloon Walled City. Modular building pieces are procedurally arranged into floors and blocks as you move, and room-blindness redirection quietly repositions you so a small physical space feels limitless.',
    bullets: [
      {
        title: 'Hybrid XY / Z generation',
        body: 'Floors and city blocks are assembled at runtime from modular pieces, with dynamic decal, asset and prefab generation built on Blender geometry-node systems.',
      },
      {
        title: 'Physical VR interaction',
        body: 'Physics-based climbing and ladders keep movement embodied while the world regenerates around the player.',
      },
    ],
    tags: ['Unity', 'C#', 'Blender geometry nodes', 'OpenXR', 'Procedural generation'],
    links: [{ label: 'Watch on YouTube', href: 'https://www.youtube.com/watch?v=KXLkp3JwIjw', kind: 'watch' }],
    media: {
      type: 'video',
      src: 'media/sunrise.mp4',
      poster: 'media/sunrise-poster.webp',
      label: 'Sunrise VR: procedurally generated floors of a dense city',
    },
  },
  {
    slug: 'gyroblaster',
    title: 'GyroBlaster',
    kicker: 'Python · TCP sockets · Motion controls',
    summary:
      'A two-player motion-controlled shooter built in Python with CMU Graphics. Each player steers a ship on a shared laptop screen using their phone’s gyroscope, streamed over a custom TCP client-server protocol from the Pyto IDE.',
    tags: ['Python', 'TCP sockets', 'JSON serialization', 'Pyto', 'CMU Graphics'],
    links: [{ label: 'Watch on YouTube', href: 'https://www.youtube.com/watch?v=bmcWOpWB1DQ', kind: 'watch' }],
    media: {
      type: 'video',
      src: 'media/gyroblaster.mp4',
      poster: 'media/gyroblaster-poster.webp',
      label: 'GyroBlaster gameplay: two ships controlled by phone gyroscopes',
    },
  },
];
