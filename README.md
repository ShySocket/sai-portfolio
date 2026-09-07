# sai-portfolio

Personal portfolio of Sai Bhandar, live at https://shysocket.github.io/sai-portfolio/

Built with [Astro](https://astro.build), [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering). Static output, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321/sai-portfolio/
npm run build      # static output in dist/
npm run preview
```

## Edit content

- Projects live in `src/data/projects.ts` (order, copy, tags, links, media).
- Videos and posters live in `public/media/`. Keep clips under ~4 MB: `ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 27 -movflags +faststart out.mp4`.
- Screenshots live in `src/assets/` and are converted to WebP at build time.
- Motion (smooth scroll, reveals, tilt, magnetic buttons) is in `src/scripts/motion.ts`; it respects `prefers-reduced-motion`.
