import {
  AVAILABILITY_OPTIONS,
  DEFAULT_SORT,
  PRICE_STEP,
  SORT_OPTIONS,
  emptyCatalogState,
  type Availability,
  type CatalogFacets,
  type CatalogState,
  type SortKey,
} from "./types";

function listParam(params: URLSearchParams, key: string, allowed: string[]): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  const values = raw.split(",").map((value) => value.trim());
  return allowed.filter((slug) => values.includes(slug));
}

function roundToStep(value: number): number {
  return Math.round(value / PRICE_STEP) * PRICE_STEP;
}

export function normalizePriceRange(range: [number, number] | null, priceMax: number): [number, number] | null {
  if (!range) return null;
  const min = Math.max(0, roundToStep(Math.min(range[0], range[1])));
  const max = Math.min(priceMax, roundToStep(Math.max(range[0], range[1])));
  if (max - min < PRICE_STEP) return null;
  if (min === 0 && max === priceMax) return null;
  return [min, max];
}

function priceParam(params: URLSearchParams, priceMax: number): [number, number] | null {
  const match = params.get("precio")?.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  return normalizePriceRange([Number(match[1]), Number(match[2])], priceMax);
}

function sortParam(params: URLSearchParams): SortKey {
  const value = params.get("orden");
  return SORT_OPTIONS.find((option) => option.key === value)?.key ?? DEFAULT_SORT;
}

function pageParam(params: URLSearchParams): number {
  const value = Number(params.get("pagina"));
  return Number.isInteger(value) && value > 1 ? value : 1;
}

const slugsOf = (options: { slug: string }[]) => options.map((option) => option.slug);

export function parseCatalogUrl(search: string, facets: CatalogFacets, implicitCategory?: string): CatalogState {
  const params = new URLSearchParams(search);
  const categoria = listParam(params, "categoria", slugsOf(facets.categories));
  if (implicitCategory && !categoria.includes(implicitCategory)) categoria.unshift(implicitCategory);

  return {
    ...emptyCatalogState(),
    categoria,
    marca: listParam(params, "marca", slugsOf(facets.brands)),
    piel: listParam(params, "piel", slugsOf(facets.skins)),
    disponibilidad: listParam(params, "disponibilidad", slugsOf(AVAILABILITY_OPTIONS)) as Availability[],
    precio: priceParam(params, facets.priceMax),
    orden: sortParam(params),
    pagina: pageParam(params),
  };
}

function encodeList(values: string[]): string {
  return values.map(encodeURIComponent).join(",");
}

export function serializeCatalogUrl(state: CatalogState, implicitCategory?: string): string {
  const onlyImplicitCategory =
    implicitCategory !== undefined && state.categoria.length === 1 && state.categoria[0] === implicitCategory;

  const pairs: [string, string][] = [];
  if (state.categoria.length && !onlyImplicitCategory) pairs.push(["categoria", encodeList(state.categoria)]);
  if (state.marca.length) pairs.push(["marca", encodeList(state.marca)]);
  if (state.piel.length) pairs.push(["piel", encodeList(state.piel)]);
  if (state.disponibilidad.length) pairs.push(["disponibilidad", encodeList(state.disponibilidad)]);
  if (state.precio) pairs.push(["precio", `${state.precio[0]}-${state.precio[1]}`]);
  if (state.orden !== DEFAULT_SORT) pairs.push(["orden", state.orden]);
  if (state.pagina > 1) pairs.push(["pagina", String(state.pagina)]);

  return pairs.length ? `?${pairs.map(([key, value]) => `${key}=${value}`).join("&")}` : "";
}

export function sameCategories(state: CatalogState, implicitCategory: string): boolean {
  return state.categoria.length === 1 && state.categoria[0] === implicitCategory;
}
