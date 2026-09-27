import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tinaDirective from './astro-tina-directive/index.mjs';

const base = process.env.DEPLOY_BASE || '/';

export default defineConfig({
  site: 'https://eresskinstudio.com',
  base,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    mdx(),
    tailwind(),
    react(),
    sitemap({ filter: (page) => !page.includes('/admin') }),
    tinaDirective(),
  ],
});
