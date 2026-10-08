import type { WooCategory, WooProductWithStats, WooTerm } from "./types";
import { discountPercent } from "./format";
import { ALL_SKIN_TYPES_TAG, PRICE_STEP, type CatalogFacets, type CatalogItem, type FacetOption } from "../../utils/catalog/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_NEW_PRODUCT_DAYS = 30;

interface CatalogSources {
  categories: WooCategory[];
  brands: WooTerm[];
  tags: WooTerm[];
  newProductDays: number;
  now?: Date;
}

export function isNewProduct(product: Pick<WooProductWithStats, "date_created">, newProductDays: number, now = new Date()): boolean {
  const created = Date.parse(product.date_created);
  return !Number.isNaN(created) && now.getTime() - created <= newProductDays * DAY_MS;
}

function rankBy(products: WooProductWithStats[], compare: (a: WooProductWithStats, b: WooProductWithStats) => number): Map<number, number> {
  return new Map([...products].sort(compare).map((product, index) => [product.id, index]));
}

function byName(a: FacetOption, b: FacetOption): number {
  return a.name.localeCompare(b.name, "es");
}

function usedOptions(terms: { slug: string; name: string }[], usedSlugs: Set<string>): FacetOption[] {
  return terms.filter((term) => usedSlugs.has(term.slug)).map(({ slug, name }) => ({ slug, name }));
}

function skinOptions(tags: WooTerm[], usedSlugs: Set<string>): FacetOption[] {
  const options = usedOptions(tags, usedSlugs).sort(byName);
  const allTypes = options.filter((option) => option.slug === ALL_SKIN_TYPES_TAG);
  return [...allTypes, ...options.filter((option) => option.slug !== ALL_SKIN_TYPES_TAG)];
}

export function featuredRank(products: WooProductWithStats[]): Map<number, number> {
  return rankBy(products, (a, b) => Number(b.featured) - Number(a.featured));
}

export function buildCatalog(products: WooProductWithStats[], sources: CatalogSources): { items: CatalogItem[]; facets: CatalogFacets } {
  const now = sources.now ?? new Date();
  const featured = featuredRank(products);
  const salesRank = rankBy(products, (a, b) => (b.total_sales || 0) - (a.total_sales || 0));

  const items: CatalogItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price) || 0,
    discount: discountPercent(product) ?? 0,
    brand: product.brands?.[0]?.slug ?? null,
    categories: product.categories.map((category) => category.slug),
    skins: (product.tags || []).map((tag) => tag.slug),
    inStock: product.stock_status !== "outofstock",
    isNew: isNewProduct(product, sources.newProductDays, now),
    rank: {
      destacados: featured.get(product.id) ?? 0,
      "mas-vendidos": salesRank.get(product.id) ?? 0,
    },
  }));

  const highestPrice = Math.max(0, ...items.map((item) => item.price));

  return {
    items,
    facets: {
      categories: usedOptions(sources.categories, new Set(items.flatMap((item) => item.categories))),
      brands: usedOptions(sources.brands, new Set(items.flatMap((item) => (item.brand ? [item.brand] : [])))).sort(byName),
      skins: skinOptions(sources.tags, new Set(items.flatMap((item) => item.skins))),
      priceMax: Math.max(PRICE_STEP, Math.ceil(highestPrice / PRICE_STEP) * PRICE_STEP),
    },
  };
}
