import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkHeadingSubtitles from './src/lib/remark-heading-subtitles.mjs';

export default defineConfig({
  site: 'https://wooix.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath, remarkHeadingSubtitles], rehypePlugins: [[rehypeKatex, { strict: 'error', trust: false }]] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
