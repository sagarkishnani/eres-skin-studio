import { countOptions } from "../../../utils/catalog/applyFilters";
import {
  AVAILABILITY_OPTIONS,
  type CatalogFacets,
  type CatalogItem,
  type CatalogState,
  type FacetOption,
  type FilterKey,
  type ListFilterKey,
} from "../../../utils/catalog/types";
import { FilterGroup, FilterOption } from "./FilterGroup";
import PriceRange from "./PriceRange";

interface Props {
  items: CatalogItem[];
  facets: CatalogFacets;
  state: CatalogState;
  visibleFilters: FilterKey[];
  openGroups: Set<FilterKey>;
  onToggleGroup: (key: FilterKey) => void;
  onToggleValue: (key: ListFilterKey, slug: string) => void;
  onPriceChange: (range: [number, number] | null) => void;
}

interface ListGroup {
  key: ListFilterKey;
  title: string;
  options: FacetOption[];
}

export function listGroups(facets: CatalogFacets): ListGroup[] {
  return [
    { key: "disponibilidad" as const, title: "Disponibilidad", options: AVAILABILITY_OPTIONS },
    { key: "categoria" as const, title: "Categoría", options: facets.categories },
    { key: "marca" as const, title: "Marca", options: facets.brands },
    { key: "piel" as const, title: "Tipo de piel", options: facets.skins },
  ].filter((group) => group.options.length > 0);
}

export default function FilterPanel({
  items,
  facets,
  state,
  visibleFilters,
  openGroups,
  onToggleGroup,
  onToggleValue,
  onPriceChange,
}: Props) {
  const visibleListGroups = listGroups(facets).filter((group) => visibleFilters.includes(group.key));
  const availabilityGroups = visibleListGroups.filter((group) => group.key === "disponibilidad");
  const otherGroups = visibleListGroups.filter((group) => group.key !== "disponibilidad");

  const renderListGroup = (group: ListGroup) => {
    const counts = countOptions(items, state, group.key, group.options.map((option) => option.slug));
    const selected: string[] = state[group.key];
    return (
      <FilterGroup key={group.key} title={group.title} open={openGroups.has(group.key)} onToggle={() => onToggleGroup(group.key)}>
        {group.options.map((option) => (
          <FilterOption
            key={option.slug}
            label={option.name}
            count={counts.get(option.slug) ?? 0}
            checked={selected.includes(option.slug)}
            onChange={() => onToggleValue(group.key, option.slug)}
          />
        ))}
      </FilterGroup>
    );
  };

  return (
    <>
      {availabilityGroups.map(renderListGroup)}
      {visibleFilters.includes("precio") && (
        <FilterGroup title="Precio" open={openGroups.has("precio")} onToggle={() => onToggleGroup("precio")}>
          <PriceRange priceMax={facets.priceMax} value={state.precio} onCommit={onPriceChange} />
        </FilterGroup>
      )}
      {otherGroups.map(renderListGroup)}
    </>
  );
}
