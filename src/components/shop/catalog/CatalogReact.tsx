import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PiSlidersHorizontalLight } from "react-icons/pi";
import { useCatalogState } from "../../../hooks/useCatalogState";
import { activeFilterCount, runCatalog } from "../../../utils/catalog/applyFilters";
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
import FilterDrawer from "./FilterDrawer";

interface Props {
  items: CatalogItem[];
  facets: CatalogFacets;
  implicitCategory?: string;
  visibleFilters: FilterKey[];
  mobileSortKeys: SortKey[];
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

export default function CatalogReact({ items, facets, implicitCategory, visibleFilters, mobileSortKeys, children }: Props) {
  const { state, ready, commit, updateFilters } = useCatalogState(facets, implicitCategory);
  const view = useMemo(() => runCatalog(items, state), [items, state]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Set<FilterKey>>(() => new Set(DEFAULT_OPEN_GROUPS));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const filterCount = activeFilterCount(state);
  const countLabel = productCountLabel(view.results.length);

  useLayoutEffect(() => {
    if (!ready || !gridRef.current) return;
    applyViewToGrid(gridRef.current, view.pageItems.map((item) => item.id));
    delete document.documentElement.dataset.catalogPending;
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
      visibleFilters={visibleFilters}
      openGroups={openGroups}
      onToggleGroup={toggleGroup}
      onToggleValue={toggleValue}
      onPriceChange={(precio) => updateFilters({ precio })}
    />
  );

  return (
    <>
      <div className="grid items-start gap-14 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label="Filtros"
          className="hidden border-t border-line lg:block"
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
          <div className="sticky top-16 z-30 -mx-gutter mb-5 flex items-center gap-3 border-b border-stone-150 bg-surface px-gutter py-3 transition-[top] duration-[600ms] ease-out-expo motion-reduce:transition-none lg:hidden [html[data-header=hidden]_&]:top-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className="flex h-11 items-center gap-2.5 border border-ink px-4 text-caption-sm font-medium uppercase tracking-[.14em] text-content"
            >
              <PiSlidersHorizontalLight size={16} aria-hidden />
              Filtrar
              {filterCount > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center bg-accent px-[5px] text-[10px] tracking-normal text-content-inverse">
                  {filterCount}
                </span>
              )}
            </button>
            <span className="flex-1 text-caption-md text-content-subtle">{countLabel}</span>
          </div>

          <div className="mb-6 hidden min-h-11 items-center justify-between gap-6 lg:flex">
            <span className="text-body-md text-content">{countLabel}</span>
            <SortMenu value={state.orden} onChange={changeSort} />
          </div>

          <ActiveFilterChips chips={chips} onClearAll={clearAll} />

          <p className="sr-only" aria-live="polite">
            {ready ? countLabel : ""}
          </p>

          <div
            ref={gridRef}
            className="grid grid-cols-2 gap-x-3 gap-y-7 transition-opacity duration-300 md:gap-x-6 md:gap-y-12 lg:grid-cols-3 [html[data-catalog-pending]_&]:opacity-0"
          >
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

      <FilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        sort={state.orden}
        onSortChange={changeSort}
        onClear={clearAll}
        applyLabel={`Ver ${countLabel}`}
      >
        {panel}
      </FilterDrawer>
    </>
  );
}
