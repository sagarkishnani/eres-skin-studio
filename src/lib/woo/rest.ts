// Solo build time (frontmatter .astro, getStaticPaths, Node). Nunca desde un .tsx: Astro lo metería
// en el bundle y las claves quedarían públicas. Por eso las variables no llevan prefijo PUBLIC_.

import type { WooProduct, WooCategory } from "./types";

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/woo/rest.ts se está ejecutando en el navegador. " +
      "Solo puede usarse en build time; desde una isla usa src/utils/wooClient.ts."
  );
}

const STORE_URL = (process.env.WOO_STORE_URL || "").replace(/\/$/, "");
const CK = process.env.WOO_CONSUMER_KEY || "";
const CS = process.env.WOO_CONSUMER_SECRET || "";

export const wooConfigured = Boolean(STORE_URL && CK && CS);

const memo = new Map<string, unknown>();

async function wooFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  if (!wooConfigured) return [];

  const qs = new URLSearchParams({ status: "publish", ...mapToStrings(params) });
  const url = `${STORE_URL}/wp-json/wc/v3${path}?${qs}`;
  const key = url;
  if (memo.has(key)) return memo.get(key) as T[];

  const res = await fetch(url, {
    headers: {
      // Woo también acepta las claves como query params, pero quedarían en los logs de acceso.
      Authorization: `Basic ${Buffer.from(`${CK}:${CS}`).toString("base64")}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.warn(`[woo] ${path} respondió ${res.status}; se continúa sin esos datos.`);
    return [];
  }

  const data = (await res.json()) as T[];
  memo.set(key, data);
  return data;
}

function mapToStrings(o: Record<string, string | number>): Record<string, string> {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));
}

// Woo limita per_page a 100.
async function wooFetchAll<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const batch = await wooFetch<T>(path, { ...params, per_page: 100, page });
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

export function getAllProducts(): Promise<WooProduct[]> {
  return wooFetchAll<WooProduct>("/products", { orderby: "menu_order", order: "asc" });
}

export function getAllCategories(): Promise<WooCategory[]> {
  return wooFetchAll<WooCategory>("/products/categories", { hide_empty: "true", orderby: "name" });
}

export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  const [p] = await wooFetch<WooProduct>("/products", { slug, per_page: 1 });
  return p ?? null;
}

export async function getProductsByIds(ids: number[]): Promise<WooProduct[]> {
  if (!ids.length) return [];
  return wooFetch<WooProduct>("/products", { include: ids.join(","), per_page: 100 });
}

export async function getFeaturedProducts(limit = 8): Promise<WooProduct[]> {
  return wooFetch<WooProduct>("/products", { featured: "true", per_page: limit });
}
