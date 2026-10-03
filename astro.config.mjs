// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Latin only: every string on the site is English. Both files are variable (weight axis), self-hosted from the
// @fontsource-variable packages through Astro's Fonts API, which also writes metric-matched local fallbacks
// (Arial, Times New Roman) so the swap does not shift the layout. The range is Fontsource's own latin range.
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'.split(',');

// Deployed as a GitHub Pages project site: https://shysocket.github.io/sai-portfolio/
export default defineConfig({
  site: 'https://shysocket.github.io',
  base: '/sai-portfolio',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { assets: 'assets', inlineStylesheets: 'auto' },
  fonts: [
    {
      // Display and interface: the name, titles, headings, links, meta.
      provider: fontProviders.local(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-display',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2'],
            weight: '400 900',
            style: 'normal',
            display: 'swap',
            unicodeRange: LATIN,
          },
        ],
      },
    },
    {
      // Reading text: About, ledes, claims, prose. The 16pt master, which is the optical size of 18 to 22 px text.
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-text',
      fallbacks: ['serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2'],
            weight: '200 800',
            style: 'normal',
            display: 'swap',
            unicodeRange: LATIN,
          },
        ],
      },
    },
  ],
});
