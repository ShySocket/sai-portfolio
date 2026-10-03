# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
New-grad software engineering recruiters and hiring engineers. They open the link from a résumé, application or LinkedIn message, usually on a laptop and sometimes on a phone, and decide in about five seconds whether to keep looking. Their job: tell who Sai is, what Sai built, and whether the engineering is real, then find a way to follow up.

## Product Purpose
A portfolio for Sai Bhandar (Business + CS at Carnegie Mellon): a home page plus one structured case-study page per project (v3, decided 2026-10-01). It exists to turn a recruiter's glance into an interview by showing shipped, playable, technically specific projects, and the site itself must read as evidence of Sai's design and engineering craft. Success means a recruiter can name at least one project and one technical claim within seconds, can open a case study that explains the role, problem, approach and outcome, and can reach Sai by email, LinkedIn, GitHub or résumé without hunting.

## Positioning
Every project is something you can play or watch: a runner driven by real dashcam footage and vehicle motion, laser tag played with phone cameras and on-device vision, a hackathon-winning disaster-relief tool, procedural VR, and gyro-controlled multiplayer. The claims are concrete engineering (SAM 2 segmentation, ArcFace identity fusion, GPS + IMU dead reckoning, TCP sockets), not adjectives.

## Operating Context
- Reached from a résumé or application link; first impression happens above the fold.
- Deployed as a static GitHub Pages project site at https://shysocket.github.io/sai-portfolio/ (base path `/sai-portfolio/`), built with Astro and deployed by GitHub Actions on push to `main`.
- Several projects have live demos: Sidequest (video-runner.vercel.app) and Lazer Shooter (lazer-shooter-game.vercel.app, a phone-first PWA, so desktop visitors get a QR code).

## Capabilities and Constraints
- **Content scope (changed 2026-10-01, Sai's decision):** home page + one case-study page per project at `/work/<slug>`, plus a short About (2-3 sentences: CMU Business + CS, what Sai builds, what he is looking for) and links to his résumé PDF, LinkedIn (https://www.linkedin.com/in/sai-bhandar) and GitHub (https://github.com/ShySocket). Still no experience timeline or skills grid. The public résumé PDF is built from a temp copy of `~/Documents/Resume/swe-latex` with the phone line removed (master never edited) unless Sai says otherwise.
- **Headline is fixed:** `Sai Bhandar` / `Business + CS @ CMU`.
- **Project order is fixed:** Sidequest, Lazer Shooter, ReliefIQ, Sunrise, GyroBlaster. VR Rage Room and Posematic are dropped.
- **Project copy is confirmed.** Titles, summaries, notes, stacks, awards and links live in `src/data/projects.ts`. Ask before changing any factual copy. Case-study sections may only restate facts from projects.ts or the public project repos (ShySocket/sidequest, ShySocket/LazerShooterGame); every new sentence goes on an approval list for Sai before it ships.
- **Derived copy approved by Sai on 2026-10-01:** the Cue cue captions, the evidence-key labels ("Show m:ss.s in clip", "Show match scores", "Show cue track"), the provenance line ("12 s loop of the 25 s capture", "Full capture, 3.7 MB"), the closing copy-key labels, and the meta/OG title and description. New derived strings still need his approval.
- **Performance:** no preloader, no 3D hero, nothing that delays content. No scroll-jacking or smooth-scroll libraries. Motion uses transform and opacity only, respects `prefers-reduced-motion`, and every piece of content is visible without JavaScript.
- **Media is self-hosted and compressed,** with poster frames and lazy loading. No new YouTube embeds.
- **Open decisions (v3, 2026-10-01):** the live Cue design reads as "all over the place" with a blurry hero video (Sai). v3 replaces the layout with one strict grid and type system across home and case studies; Sai picks the direction in Figma before anything is built and OKs the result before it deploys. Every image and video is shown at or below native resolution / 2 at 1440 (no upscaled media).

## Brand Commitments
- Name: Sai Bhandar. Contact: saib@andrew.cmu.edu; Carnegie Mellon University, Pittsburgh, PA.
- Voice: technical and restrained, not playful. Plain declarative sentences; no slogans ("Things I've built", "Let's build something", "Selected work").
- One accent colour.

## Evidence on Hand
- Video in `public/media/v3/`, re-derived by `node scripts/media-v3.mjs`. Every clip is muted (no audio track), AV1 with an H.264 fallback, and drawn at no more than native / 2 at 1440:
  - `sidequest-home.*` (8.4 s, 1280x720; AV1 1.4 MB, H.264 2.4 MB): home row 1, the only clip that plays on its own (a muted loop that starts after load, with a Pause control; never under reduced motion or Save-Data, nor without JS).
  - `sidequest-hero.*` (1920x1080): the Sidequest case hero, a capture of the Unity WebGL build over the real footage. Its length, size and budget decision are in the media table.
  - `sunrise-scene.*` (29.4 s, 1110x624, the Scene view cropped from the editor capture; AV1 and H.264 2.5 MB each): the Sunrise case hero, at Figure width (the documented exception).
  - `gyroblaster-play.*` (5.7 s, 1920x1080, the projected game only; AV1 0.8 MB, H.264 1.4 MB): the GyroBlaster case hero.
  - The case heroes load nothing until Play, play on click and pause off screen; without JS they keep native controls.
- Posters, stills and screens in `src/assets/v3/<project>/`, build inputs that astro:assets ships only as AVIF and WebP: the Sidequest posters `run-*.webp` (frame 0 of each capture cut, 1920x1080); Lazer Shooter `home.png` and `practice.png` (the live PWA at 393x852 CSS, DPR 3); ReliefIQ `relief-1.jpg` and `relief-2.jpg` (2048 px screens) and the home-row crop `map-top5.png`; Sunrise `scene-13.7.webp` (frame 411: nothing selected and only the editor's small cursor on the facade; Sai accepted this Sunrise footage as is on 2026-10-01, so do not re-raise it) and `scene-19.0.webp`; GyroBlaster `play-4.6.webp` and the home-row crop `play-4.6-screen.webp`.
- `public/media/v3/lazer-qr.svg` (the Lazer Shooter QR), `public/Sai_Bhandar_Resume.pdf` (`scripts/resume.mjs`), and `public/og.jpg` with the favicon and touch icon (`scripts/og.mjs`).
- Sources, not served and outside the repo, in `~/Documents/autopilot/artifacts/sai-portfolio-v3/media/`: `sidequest/master/` (the lossless Sidequest capture masters; the capture harness is beside them) and `source/` (`sunrise-1080.mp4` and `gyroblaster-1080.mp4`, stream copies of `~/Documents/sai-portfolio/images/FloorsDemo.mp4` and `Gyrogameplay.mp4`). The ReliefIQ screens come from `~/Documents/sai-portfolio/images/Relief1..3.jpg`.
- Held until Sai answers (inventory questions): the full Sunrise editor cut `public/media/v3/sunrise-editor.*` and its posters `src/assets/v3/sunrise/editor-*.webp` (Q9; the clip deploys but nothing links it); the GyroBlaster players still, kept outside the repo in `media/held/gyroblaster/` (both players' consent, Q10); ReliefIQ `relief-3.jpg` and `analyzer.png` (an iStock photo and raw markdown, Q11).
- Every media file with its native size, slot and density: `~/Documents/autopilot/artifacts/sai-portfolio-v3/media/media-table.md`.
- The Cue site's media (the 960x540 Sidequest loop, thumbnails, stills and crops) is retired; it stays in git at `main` (893e405) and tag `light-minimal`.
- Award: ReliefIQ won 1st place at the CMU NOVA Hackathon.
- Absent: no testimonials, metrics, employer logos or headshot. Do not fabricate any of them. The résumé exists as LaTeX at `~/Documents/Resume/swe-latex` (its header has a phone number; see Capabilities).
- Lazer Shooter photos are still to come from Sai and go to `~/Documents/autopilot/artifacts/sai-portfolio-v3/media/lazer-from-sai/`.

## Product Principles
1. **Proof over claims.** Show the running thing (video, screenshot, live link) next to the sentence that explains it.
2. **Five-second legibility.** Who, what and one concrete project are readable in the first viewport.
3. **Specific over impressive.** Name the technique, the model and the constraint; skip adjectives.
4. **Fast is part of the craft.** A page for engineers must itself load instantly and work without JS.

## Accessibility & Inclusion
WCAG 2.2 AA. The Lighthouse accessibility gate (`npm run a11y`) must stay at 95 or above on mobile and desktop (it is 100 today). Visible focus on every stop, targets at least 24px, captions and alt text for all media, no content hidden behind motion.
