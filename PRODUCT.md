# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
New-grad software engineering recruiters and hiring engineers. They open the link from a résumé, application or LinkedIn message, usually on a laptop and sometimes on a phone, and decide in about five seconds whether to keep looking. Their job: tell who Sai is, what Sai built, and whether the engineering is real, then find a way to follow up.

## Product Purpose
A single-page portfolio for Sai Bhandar (Business + CS at Carnegie Mellon). It exists to turn a recruiter's glance into an interview by showing shipped, playable, technically specific projects. Success means a recruiter can name at least one project and one technical claim after a short scroll, and can reach Sai by email or a project link without hunting.

## Positioning
Every project is something you can play or watch: a runner driven by real dashcam footage and vehicle motion, laser tag played with phone cameras and on-device vision, a hackathon-winning disaster-relief tool, procedural VR, and gyro-controlled multiplayer. The claims are concrete engineering (SAM 2 segmentation, ArcFace identity fusion, GPS + IMU dead reckoning, TCP sockets), not adjectives.

## Operating Context
- Reached from a résumé or application link; first impression happens above the fold.
- Deployed as a static GitHub Pages project site at https://shysocket.github.io/sai-portfolio/ (base path `/sai-portfolio/`), built with Astro and deployed by GitHub Actions on push to `main`.
- Several projects have live demos: Sidequest (video-runner.vercel.app) and Lazer Shooter (lazer-shooter-game.vercel.app, a phone-first PWA, so desktop visitors get a QR code).

## Capabilities and Constraints
- **Content scope is projects only.** Sai declined an about/bio, an experience timeline, a résumé/LinkedIn section and a skills section. Do not add them.
- **Headline is fixed:** `Sai Bhandar` / `Business + CS @ CMU`.
- **Project order is fixed:** Sidequest, Lazer Shooter, ReliefIQ, Sunrise, GyroBlaster. VR Rage Room and Posematic are dropped.
- **Project copy is confirmed.** Titles, summaries, notes, stacks, awards and links live in `src/data/projects.ts`. Ask before changing any factual copy.
- **Derived copy approved by Sai on 2026-10-01:** the Cue cue captions, the evidence-key labels ("Show m:ss.s in clip", "Show match scores", "Show cue track"), the provenance line ("12 s loop of the 25 s capture", "Full capture, 3.7 MB"), the closing copy-key labels, and the meta/OG title and description. New derived strings still need his approval.
- **Performance:** no preloader, no 3D hero, nothing that delays content. No scroll-jacking or smooth-scroll libraries. Motion uses transform and opacity only, respects `prefers-reduced-motion`, and every piece of content is visible without JavaScript.
- **Media is self-hosted and compressed,** with poster frames and lazy loading. No new YouTube embeds.
- **Open decisions:** the visual world (palette, type, layout) is being redesigned on 2026-09-30 and is recorded in DESIGN.md once chosen.

## Brand Commitments
- Name: Sai Bhandar. Contact: saib@andrew.cmu.edu; Carnegie Mellon University, Pittsburgh, PA.
- Voice: technical and restrained, not playful. Plain declarative sentences; no slogans ("Things I've built", "Let's build something", "Selected work").
- One accent colour.

## Evidence on Hand
- Video in `public/media/`, re-derived from the sources by `node scripts/media.mjs`:
  - `sidequest-loop.mp4` (0.9 MB, 960x540, 12.0 s): the first 12 s of the Sidequest capture; the only clip that may play on its own (muted, in the first viewport, never under reduced motion or Save-Data).
  - `sidequest.mp4` (3.7 MB, 960x540, 25.0 s): the full gameplay-only capture recorded from the WebGL build, restored and linked under the stage as "Full capture, 3.7 MB"; never autoplayed or preloaded.
  - `sunrise-scene.mp4` (0.8 MB, 600x338, 29.4 s): the Unity editor capture cropped to its Scene view. It replaces the full editor capture `sunrise.mp4` (1.1 MB, 1280x720), which is no longer served; the original is kept in git at tag `light-minimal` and as the source `media-src/sunrise.mp4`.
  - `gyroblaster.mp4` (0.9 MB, 1280x720, 9.4 s), unchanged.
- Sources (not served): `media-src/sidequest.mp4` and `media-src/sunrise.mp4`.
- Pinned stills in `src/assets/stills/`, build inputs stored as q95 WebP that astro:assets ships as AVIF and WebP: `sidequest-4.5.webp` (1024x576), `sunrise-13.7.webp` (600x338, frame 411, the only stretch of the capture with nothing selected, so no transform gizmo; the editor's small mouse cursor is on the facade in all of those frames, and no frame of the capture is free of editor overlay; Sai accepted this Sunrise footage as is on 2026-10-01, so do not re-raise it) and `gyroblaster-4.6.webp` (960x540). They are the posters and the no-JS, print, reduced-motion and Save-Data frames, and replace the `public/media/*-N.webp` stills and the earlier `*-poster` images.
- Thumbnails `thumb-*.webp` for the project index, in `public/media/`.
- ReliefIQ detail crops in `src/assets/crops/` (PNG build inputs; only their WebP encodes ship).
- Images in `src/assets/`: `relief-1..3.jpg` (ReliefIQ screens) and `lazer-home.png` (Lazer Shooter home screen); `public/media/lazer-qr.svg`.
- Award: ReliefIQ won 1st place at the CMU NOVA Hackathon.
- Absent: no testimonials, metrics, employer logos, headshot or résumé PDF. Do not fabricate any of them.
- Lazer Shooter photos are still to come from Sai and will be dropped into `src/assets/lazer/`.

## Product Principles
1. **Proof over claims.** Show the running thing (video, screenshot, live link) next to the sentence that explains it.
2. **Five-second legibility.** Who, what and one concrete project are readable in the first viewport.
3. **Specific over impressive.** Name the technique, the model and the constraint; skip adjectives.
4. **Fast is part of the craft.** A page for engineers must itself load instantly and work without JS.

## Accessibility & Inclusion
WCAG 2.2 AA. The Lighthouse accessibility gate (`npm run a11y`) must stay at 95 or above on mobile and desktop (it is 100 today). Visible focus on every stop, targets at least 24px, captions and alt text for all media, no content hidden behind motion.
