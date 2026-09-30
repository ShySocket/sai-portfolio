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
- **Performance:** no preloader, no 3D hero, nothing that delays content. No scroll-jacking or smooth-scroll libraries. Motion uses transform and opacity only, respects `prefers-reduced-motion`, and every piece of content is visible without JavaScript.
- **Media is self-hosted and compressed,** with poster frames and lazy loading. No new YouTube embeds.
- **Open decisions:** the visual world (palette, type, layout) is being redesigned on 2026-09-30 and is recorded in DESIGN.md once chosen.

## Brand Commitments
- Name: Sai Bhandar. Contact: saib@andrew.cmu.edu; Carnegie Mellon University, Pittsburgh, PA.
- Voice: technical and restrained, not playful. Plain declarative sentences; no slogans ("Things I've built", "Let's build something", "Selected work").
- One accent colour.

## Evidence on Hand
- Video with WebP posters in `public/media/`: `sidequest.mp4` (3.7 MB, gameplay-only clip recorded from the WebGL build), `sunrise.mp4` (1.1 MB), `gyroblaster.mp4` (0.9 MB).
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
