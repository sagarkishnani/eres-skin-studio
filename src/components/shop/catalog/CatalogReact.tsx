import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCatalogState } from "../../../hooks/useCatalogState";
import { runCatalog } from "../../../utils/catalog/applyFilters";
import {
  emptyCatalogState,
  type CatalogFacets,
  type CatalogItem,
  type FilterKey,
  type ListFilterKey,
  type SortKey,
} from "../../../utils/catalog/types";
import FilterPanel from "./FilterPanel";
import SortMenu from "./SortMenu";
import ActiveFilterChips from "./ActiveFilterChips";
import Pagination from "./Pagination";
import { buildFilterChips } from "./filterChips";

interface Props {
  items: CatalogItem[];
  facets: CatalogFacets;
  implicitCategory?: string;
  children: ReactNode;
}

const DEFAULT_OPEN_GROUPS: FilterKey[] = ["disponibilidad", "precio", "categoria"];
const GRID_SCROLL_OFFSET = { desktop: 120, mobile: 150 };

export function productCountLabel(count: number): string {
  return count === 1 ? "1 producto" : `${count} productos`;
}

function scrollToTopOf(element: HTMLElement) {
  const offset = window.matchMedia("(min-width: 1024px)").matches ? GRID_SCROLL_OFFSET.desktop : GRID_SCROLL_OFFSET.mobile;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  if (window.lenisInstance) window.lenisInstance.scrollTo(top);
  else window.scrollTo({ top, behavior: "smooth" });
}

function applyViewToGrid(grid: HTMLElement, visibleIds: number[]) {
  const positions = new Map(visibleIds.map((id, index) => [id, index]));
  grid.querySelectorAll<HTMLElement>("[data-catalog-item]").forEach((element) => {
    const position = positions.get(Number(element.dataset.catalogItem));
    element.hidden = position === undefined;
    element.style.order = position === undefined ? "" : String(position);
  });
}

export default function CatalogReact({ items, facets, implicitCategory, children }: Props) {
  const { state, ready, commit, updateFilters } = useCatalogState(facets, implicitCategory);
  const view = useMemo(() => runCatalog(items, state), [items, state]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Set<FilterKey>>(() => new Set(DEFAULT_OPEN_GROUPS));

  useLayoutEffect(() => {
    if (ready && gridRef.current) applyViewToGrid(gridRef.current, view.pageItems.map((item) => item.id));
  }, [ready, view]);

  useEffect(() => {
    if (!ready) return;
    const activeGroups = (["marca", "piel"] as const).filter((key) => state[key].length > 0);
    if (activeGroups.length) setOpenGroups((groups) => new Set([...groups, ...activeGroups]));
  }, [ready]);

  const toggleGroup = (key: FilterKey) =>
    setOpenGroups((groups) => {
      const next = new Set(groups);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleValue = (key: ListFilterKey, slug: string) => {
    const selected: string[] = state[key];
    const next = selected.includes(slug) ? selected.filter((value) => value !== slug) : [...selected, slug];
    updateFilters({ [key]: next });
  };

  const clearAll = () => commit(emptyCatalogState());
  const changeSort = (orden: SortKey) => updateFilters({ orden });
  const changePage = (pagina: number) => {
    commit({ ...state, pagina });
    if (gridRef.current) scrollToTopOf(gridRef.current);
  };

  const chips = buildFilterChips(state, facets, {
    removeValue: toggleValue,
    clearPrice: () => updateFilters({ precio: null }),
  });

  const panel = (
    <FilterPanel
      items={items}
      facets={facets}
      state={state}
      openGroups={openGroups}
      onToggleGroup={toggleGroup}
      onToggleValue={toggleValue}
      onPriceChange={(precio) => updateFilters({ precio })}
    />
  );

  return (
    <div className="grid items-start gap-14 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside
        aria-label="Filtros"
        data-lenis-prevent
        className="sticky top-[120px] hidden max-h-[calc(100vh-144px)] overflow-y-auto overscroll-contain border-t border-line lg:block"
      >
        {panel}
        {chips.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 py-1 text-caption-sm font-medium uppercase tracking-[.16em] text-content underline decoration-1 underline-offset-4"
          >
            Limpiar filtros
          </button>
        )}
      </aside>

      <div className="min-w-0">
        <div className="mb-6 hidden min-h-11 items-center justify-between gap-6 lg:flex">
          <span className="text-body-md text-content">{productCountLabel(view.results.length)}</span>
          <SortMenu value={state.orden} onChange={changeSort} />
        </div>

        <ActiveFilterChips chips={chips} onClearAll={clearAll} />

        <div ref={gridRef} className="grid grid-cols-2 gap-x-3 gap-y-7 md:gap-x-6 md:gap-y-12 lg:grid-cols-3">
          {children}
        </div>

        {view.results.length === 0 && (
          <div className="flex flex-col items-start gap-5 py-20">
            <span className="text-[24px] tracking-[-.02em] text-content">No encontramos productos con esos filtros.</span>
            <button
              type="button"
              onClick={clearAll}
              className="h-[52px] border border-ink px-7 text-caption-md font-medium uppercase tracking-[.14em] text-content transition-colors duration-[400ms] hover:bg-ink hover:text-content-inverse"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <Pagination page={view.page} pageCount={view.pageCount} onChange={changePage} />
      </div>
    </div>
  );
}
