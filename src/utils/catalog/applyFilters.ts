import {
  ALL_SKIN_TYPES_TAG,
  CATALOG_PAGE_SIZE,
  type CatalogItem,
  type CatalogState,
  type FilterKey,
  type ListFilterKey,
  type SortKey,
} from "./types";

function matchesSkin(item: CatalogItem, skin: string): boolean {
  return item.skins.includes(skin) || (skin !== ALL_SKIN_TYPES_TAG && item.skins.includes(ALL_SKIN_TYPES_TAG));
}

function matchesValue(item: CatalogItem, key: ListFilterKey, value: string): boolean {
  switch (key) {
    case "categoria":
      return item.categories.includes(value);
    case "marca":
      return item.brand === value;
    case "piel":
      return matchesSkin(item, value);
    case "disponibilidad":
      return (value === "en-stock") === item.inStock;
  }
}

function passesList(item: CatalogItem, state: CatalogState, key: ListFilterKey): boolean {
  const selected: string[] = state[key];
  return selected.length === 0 || selected.some((value) => matchesValue(item, key, value));
}

function passesPrice(item: CatalogItem, state: CatalogState): boolean {
  return !state.precio || (item.price >= state.precio[0] && item.price <= state.precio[1]);
}

const LIST_FILTER_KEYS: ListFilterKey[] = ["disponibilidad", "categoria", "marca", "piel"];

export function filterItems(items: CatalogItem[], state: CatalogState, skip?: FilterKey): CatalogItem[] {
  return items.filter(
    (item) =>
      LIST_FILTER_KEYS.every((key) => key === skip || passesList(item, state, key)) &&
      (skip === "precio" || passesPrice(item, state)),
  );
}

const SORTERS: Record<SortKey, (a: CatalogItem, b: CatalogItem) => number> = {
  destacados: (a, b) => a.rank.destacados - b.rank.destacados,
  "mas-vendidos": (a, b) => a.rank["mas-vendidos"] - b.rank["mas-vendidos"],
  novedades: (a, b) => a.rank.novedades - b.rank.novedades,
  "precio-asc": (a, b) => a.price - b.price || a.rank.destacados - b.rank.destacados,
  "precio-desc": (a, b) => b.price - a.price || a.rank.destacados - b.rank.destacados,
  descuento: (a, b) => b.discount - a.discount || a.rank.destacados - b.rank.destacados,
  "a-z": (a, b) => a.name.localeCompare(b.name, "es"),
};

export function sortItems(items: CatalogItem[], orden: SortKey): CatalogItem[] {
  return [...items].sort(SORTERS[orden]);
}

export function countOptions(items: CatalogItem[], state: CatalogState, key: ListFilterKey, values: string[]): Map<string, number> {
  const base = filterItems(items, state, key);
  return new Map(values.map((value) => [value, base.filter((item) => matchesValue(item, key, value)).length]));
}

export interface CatalogView {
  results: CatalogItem[];
  pageItems: CatalogItem[];
  page: number;
  pageCount: number;
}

export function runCatalog(items: CatalogItem[], state: CatalogState): CatalogView {
  const results = sortItems(filterItems(items, state), state.orden);
  const pageCount = Math.max(1, Math.ceil(results.length / CATALOG_PAGE_SIZE));
  const page = Math.min(state.pagina, pageCount);
  const start = (page - 1) * CATALOG_PAGE_SIZE;
  return { results, pageItems: results.slice(start, start + CATALOG_PAGE_SIZE), page, pageCount };
}

export function activeFilterCount(state: CatalogState): number {
  return LIST_FILTER_KEYS.reduce((total, key) => total + state[key].length, 0) + (state.precio ? 1 : 0);
}
