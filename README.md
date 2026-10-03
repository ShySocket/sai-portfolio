# sai-portfolio

Personal portfolio of Sai Bhandar, live at https://shysocket.github.io/sai-portfolio/

A static [Astro](https://astro.build) site with plain CSS tokens and one small vanilla TypeScript file for the videos. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. The design is v3, direction B, **Editorial** (see [DESIGN.md](DESIGN.md)); product facts and constraints are in [PRODUCT.md](PRODUCT.md).

## Routes

- `/`: the masthead (name, tagline, About, contact links), five work rows in the fixed order, the footer.
- `/work/<slug>/`: one case study per project (`sidequest`, `lazer-shooter`, `reliefiq`, `sunrise`, `gyroblaster`): hero, facts rail, Problem, Approach and Outcome, the next project, the footer.

## Structure

| Path | What it holds |
|---|---|
| `src/pages/index.astro`, `src/pages/work/[slug].astro` | the two page templates |
| `src/layouts/Base.astro` | head metadata, fonts, the share image, the home and case page transition |
| `src/components/v3/` | the parts both pages are built from (work row, frame, figure, facts rail, charts, footer) |
| `src/data/projects.ts` | the confirmed project copy: titles, summaries, notes, tags, links, alts. Ask Sai before changing any of it. |
| `src/data/case-studies.ts` | the case-study content: every string sourced, every image and video path, native sizes |
| `src/lib/picture.ts`, `src/lib/text.ts` | responsive AVIF and WebP sets per slot; URL and typography helpers |
| `src/styles/global.css`, `src/styles/slots.ts` | the design tokens and every rule; the grid and the media slots (`sizes`, no upscaling) |
| `src/scripts/video.ts` | the home loop and the case heroes: Play and Pause, pause off screen, nothing under reduced motion or Save-Data |
| `src/assets/v3/<project>/` | stills, posters and screenshots (build inputs: only their AVIF and WebP encodes ship) |
| `public/media/v3/` | the AV1 and H.264 videos and the Lazer Shooter QR, served as is |
| `public/og.jpg`, `public/favicon.png`, `public/apple-touch-icon.png`, `public/Sai_Bhandar_Resume.pdf` | share card, tab icons, résumé |

## Develop

```bash
npm install
npm run dev        # http://localhost:4321/sai-portfolio/
npm run build      # astro build, then scripts/verify-build.mjs
```

`scripts/verify-build.mjs` fails the build when:

- a page declares no `data-page`, or tags fewer than 3 strings with `data-verbatim`;
- a string tagged `data-verbatim="projects"` or `data-verbatim="case"` (an image: its alt) is not a substring of `src/data/projects.ts` or `src/data/case-studies.ts`;
- `dist/assets` ships a PNG or an untransformed image original;
- any page, script or stylesheet carries an em or en dash.

## Check

```bash
node scripts/shots.mjs check            # page checks on every route at 390/768/1440 x reduced motion, motion, no JS
node scripts/shots.mjs after            # full-page and first-viewport screenshots of every route
node scripts/shots.mjs diff before after
npm run a11y -- --no-build              # Lighthouse accessibility on home and the first case study, mobile and desktop, >= 95
npm run a11y -- --no-build --routes -,work/sidequest,work/lazer-shooter,work/reliefiq,work/sunrise,work/gyroblaster
```

They serve `dist/` themselves through `scripts/serve.mjs` (set `PORT` to run several at once), write to `$A11Y_OUT`, and use the installed Google Chrome.

## Media and generated files

- `node scripts/media-v3.mjs` re-derives every video, poster, still, crop and the QR (`--stills` skips the video encodes; `--capture` first re-captures the live Lazer Shooter screens). It fails on an encode over its byte budget or under SSIM 0.965. Its source videos live outside the repo, in `~/Documents/autopilot/artifacts/sai-portfolio-v3/media/` (`source/` for Sunrise and GyroBlaster, `sidequest/master/` for the Sidequest captures); a missing source fails the run with the command that restores it. The ReliefIQ screens are seeded from `~/Documents/sai-portfolio/images/`.
- `node scripts/og.mjs` renders `public/og.jpg`, the favicon and the touch icon from the design tokens and the real fonts.
- `node scripts/resume.mjs` builds `public/Sai_Bhandar_Resume.pdf` from a temp copy of the LaTeX résumé with the phone line removed (the master is never edited).

## Edit content

- Copy lives only in the two data files. A template may pick phrases out of them but never write new ones, and the element that renders a phrase carries `data-verbatim` so the build checks it.
- New case-study sentences go in `src/data/case-studies.ts` as `c('...')` with a source comment above; Sai approves every new sentence before it ships.
- No em or en dashes anywhere; use a colon, a comma or two sentences.
- Images are imported in `case-studies.ts` with their native size written beside them; never read an imported image's fields (that ships its original).
