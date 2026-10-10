import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tinaDirective from './astro-tina-directive/index.mjs';

const base = process.env.DEPLOY_BASE || '/';
const { WOO_STORE_URL } = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const wooImageHosts = WOO_STORE_URL ? [new URL(WOO_STORE_URL).hostname] : [];

export default defineConfig({
  site: 'https://eresskinstudio.com',
  base,
  image: {
    domains: wooImageHosts,
  },
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
