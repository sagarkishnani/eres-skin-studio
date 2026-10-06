export const CATALOG_PAGE_SIZE = 12;
export const PRICE_STEP = 10;
export const ALL_SKIN_TYPES_TAG = "todo-tipo-de-piel";

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  discount: number;
  brand: string | null;
  categories: string[];
  skins: string[];
  inStock: boolean;
  isNew: boolean;
  rank: { destacados: number; "mas-vendidos": number; novedades: number };
}

export interface FacetOption {
  slug: string;
  name: string;
}

export interface CatalogFacets {
  categories: FacetOption[];
  brands: FacetOption[];
  skins: FacetOption[];
  priceMax: number;
}

export const SORT_OPTIONS = [
  { key: "destacados", label: "Destacados" },
  { key: "mas-vendidos", label: "Más vendidos" },
  { key: "novedades", label: "Novedades" },
  { key: "precio-asc", label: "Precio: menor a mayor" },
  { key: "precio-desc", label: "Precio: mayor a menor" },
  { key: "descuento", label: "Mayor descuento" },
  { key: "a-z", label: "Alfabético, A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export const DEFAULT_SORT: SortKey = "destacados";
export const DEFAULT_MOBILE_SORT_KEYS: SortKey[] = ["destacados", "mas-vendidos", "novedades", "descuento"];

export type Availability = "en-stock" | "agotado";

export const AVAILABILITY_OPTIONS: { slug: Availability; name: string }[] = [
  { slug: "en-stock", name: "En stock" },
  { slug: "agotado", name: "Agotado" },
];

export interface CatalogState {
  categoria: string[];
  marca: string[];
  piel: string[];
  disponibilidad: Availability[];
  precio: [number, number] | null;
  orden: SortKey;
  pagina: number;
}

export type ListFilterKey = "categoria" | "marca" | "piel" | "disponibilidad";
export type FilterKey = ListFilterKey | "precio";

export const FILTER_KEYS: FilterKey[] = ["disponibilidad", "precio", "categoria", "marca", "piel"];
export const DEFAULT_VISIBLE_FILTERS: FilterKey[] = ["categoria", "marca", "piel"];

export const CATALOG_PARAM_KEYS = ["categoria", "marca", "piel", "disponibilidad", "precio", "orden", "pagina"] as const;

export function emptyCatalogState(): CatalogState {
  return { categoria: [], marca: [], piel: [], disponibilidad: [], precio: null, orden: DEFAULT_SORT, pagina: 1 };
}
