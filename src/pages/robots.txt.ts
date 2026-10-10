import type { APIRoute } from "astro";
import { isStagingSite } from "../utils/siteEnv";

const productionRobots = (sitemapUrl: string) => `User-agent: *
Disallow: /admin/

Sitemap: ${sitemapUrl}
`;

const stagingRobots = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = ({ site }) => {
  const body = isStagingSite ? stagingRobots : productionRobots(new URL("sitemap-index.xml", site).href);
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
