// @ts-check
import { defineConfig } from 'astro/config';

// Deployed as a GitHub Pages project site: https://shysocket.github.io/sai-portfolio/
export default defineConfig({
  site: 'https://shysocket.github.io',
  base: '/sai-portfolio',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { assets: 'assets', inlineStylesheets: 'auto' },
});
