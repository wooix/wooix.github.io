import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wooix.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
