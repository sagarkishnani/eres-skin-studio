import type { WooProduct, WooProductWithStats } from "./types";
import { featuredRank } from "./catalog";

export type DetailKey = "beneficios" | "ingredientes" | "modo-uso" | "descripcion";

export interface ProductDetail {
  key: DetailKey;
  title: string;
  body: string;
  isHtml: boolean;
}

export interface ProductPageData {
  eyebrow: string;
  details: ProductDetail[];
  related: WooProductWithStats[];
}

export const RELATED_LIMIT = 4;

const META_DETAILS: { key: DetailKey; metaKey: string; title: string }[] = [
  { key: "beneficios", metaKey: "eres_beneficios", title: "Beneficios" },
  { key: "ingredientes", metaKey: "eres_ingredientes", title: "Ingredientes clave" },
  { key: "modo-uso", metaKey: "eres_modo_uso", title: "Modo de uso" },
];

function metaText(product: WooProductWithStats, metaKey: string): string {
  const value = (product.meta_data ?? []).find((meta) => meta.key === metaKey)?.value;
  return typeof value === "string" ? value.trim() : "";
}

function buildEyebrow(product: WooProduct): string {
  return [product.brands?.[0]?.name, product.categories[0]?.name].filter(Boolean).join(" · ");
}

function buildDetails(product: WooProductWithStats): ProductDetail[] {
  const fromMeta = META_DETAILS.map(({ key, metaKey, title }) => ({
    key,
    title,
    body: metaText(product, metaKey),
    isHtml: false,
  })).filter((detail) => detail.body);

  if (fromMeta.length) return fromMeta;
  if (!product.description.trim()) return [];
  return [{ key: "descripcion", title: "Descripción", body: product.description, isHtml: true }];
}

function buildRelated(product: WooProductWithStats, all: WooProductWithStats[]): WooProductWithStats[] {
  const byId = new Map(all.map((candidate) => [candidate.id, candidate]));
  const rank = featuredRank(all);
  const byFeatured = [...all].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
  const category = product.categories[0]?.slug;

  const linked = [...(product.cross_sell_ids ?? []), ...(product.upsell_ids ?? [])]
    .map((id) => byId.get(id))
    .filter((candidate): candidate is WooProductWithStats => Boolean(candidate));
  const sameCategory = byFeatured.filter((candidate) => candidate.categories.some((c) => c.slug === category));

  const chosen = new Map<number, WooProductWithStats>();
  for (const candidate of [...linked, ...sameCategory, ...byFeatured]) {
    if (chosen.size >= RELATED_LIMIT) break;
    if (candidate.id === product.id || candidate.stock_status === "outofstock") continue;
    chosen.set(candidate.id, candidate);
  }
  return [...chosen.values()];
}

export function buildProductPage(product: WooProductWithStats, all: WooProductWithStats[]): ProductPageData {
  return {
    eyebrow: buildEyebrow(product),
    details: buildDetails(product),
    related: buildRelated(product, all),
  };
}
