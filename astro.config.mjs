import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://seraphforge.github.io',
  base: '/nagi.tw',
  output: 'static',
  integrations: [sitemap()],
});