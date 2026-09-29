import type { CatalogFacets, CatalogState, ListFilterKey } from "../../../utils/catalog/types";
import type { FilterChip } from "./ActiveFilterChips";
import { listGroups } from "./FilterPanel";

interface ChipHandlers {
  removeValue: (key: ListFilterKey, slug: string) => void;
  clearPrice: () => void;
}

export function formatPriceRange([min, max]: [number, number]): string {
  return `S/ ${min} – S/ ${max}`;
}

export function buildFilterChips(state: CatalogState, facets: CatalogFacets, handlers: ChipHandlers): FilterChip[] {
  const chips: FilterChip[] = listGroups(facets).flatMap((group) => {
    const selected: string[] = state[group.key];
    return group.options
      .filter((option) => selected.includes(option.slug))
      .map((option) => ({
        key: `${group.key}:${option.slug}`,
        label: option.name,
        onRemove: () => handlers.removeValue(group.key, option.slug),
      }));
  });

  if (state.precio) chips.push({ key: "precio", label: formatPriceRange(state.precio), onRemove: handlers.clearPrice });
  return chips;
}
