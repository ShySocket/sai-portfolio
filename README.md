# sai-portfolio

Personal portfolio of Sai Bhandar, live at https://shysocket.github.io/sai-portfolio/

Built with [Astro](https://astro.build) as a static site with plain CSS tokens and about 3 KB of vanilla TypeScript. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. The design is **Cue** (see [DESIGN.md](DESIGN.md)); product facts and constraints are in [PRODUCT.md](PRODUCT.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:4321/sai-portfolio/
npm run build      # astro build, then scripts/verify-build.mjs (fails on non-verbatim copy, shipped originals or dashes)
```

## Check

```bash
node scripts/shots.mjs check            # Playwright page checks at 390/768/1440 x reduced motion, motion, no JS
node scripts/shots.mjs after            # full-page and first-viewport screenshots (diff with: shots.mjs diff before after)
npm run a11y -- --no-build              # Lighthouse accessibility, mobile and desktop, must stay >= 95
```

All three serve `dist/` themselves through `scripts/serve.mjs` (set `PORT` to run several at once) and use the installed Google Chrome.

## Edit content

- Projects live in `src/data/projects.ts` (order, copy, tags, links, media). Every claim, caption, label and flow node on the page is quoted from this file, and the build fails if a derived string stops matching it.
- Presentation-only data (stills, cue times, tiers, the Sidequest flow) lives in `src/data/presentation.ts`.
- Media is derived from the sources in `media-src/` and `src/assets/` by `node scripts/media.mjs`. `node scripts/og.mjs` renders `og.png`, the favicon and the touch icon from the design tokens.
- Motion is in `src/scripts/motion.ts` and the motion tokens in `src/styles/global.css`; everything is visible without JS and respects `prefers-reduced-motion`.
