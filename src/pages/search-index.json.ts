import type { APIRoute } from "astro";
import client from "../../tina/__generated__/client";
import { LOCALES, DEFAULT_LOCALE } from "../i18n/config";

export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL || "/";
  const entries: Array<Record<string, string>> = [];

  const prefixFor = (locale: string) => (locale === DEFAULT_LOCALE ? base : `${base}${locale}/`);

  try {
    const posts = await client.queries.postConnection();
    for (const edge of posts.data?.postConnection?.edges || []) {
      const post: any = edge?.node;
      if (!post) continue;
      for (const locale of LOCALES) {
        entries.push({
          type: "blog",
          locale,
          title: (locale !== DEFAULT_LOCALE && post[`title_${locale}`]) || post.title || "",
          description:
            (locale !== DEFAULT_LOCALE && post[`excerpt_${locale}`]) || post.excerpt || "",
          url: `${prefixFor(locale)}blog/${post._sys.filename}`,
        });
      }
    }
  } catch {}

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
};
