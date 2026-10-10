import { useCallback, useEffect, useState } from "react";
import { emptyCatalogState, type CatalogFacets, type CatalogState } from "../utils/catalog/types";
import { parseCatalogUrl, sameCategories, serializeCatalogUrl } from "../utils/catalog/urlState";

const CATALOG_PATH = "/productos";

function initialState(implicitCategory?: string): CatalogState {
  const state = emptyCatalogState();
  return implicitCategory ? { ...state, categoria: [implicitCategory] } : state;
}

export function useCatalogState(facets: CatalogFacets, implicitCategory?: string) {
  const [state, setState] = useState<CatalogState>(() => initialState(implicitCategory));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const readUrl = () => setState(parseCatalogUrl(window.location.search, facets, implicitCategory));
    readUrl();
    setReady(true);
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, [facets, implicitCategory]);

  const commit = useCallback(
    (next: CatalogState) => {
      if (implicitCategory && !sameCategories(next, implicitCategory)) {
        window.location.assign(`${CATALOG_PATH}${serializeCatalogUrl(next)}`);
        return;
      }
      const url = `${window.location.pathname}${serializeCatalogUrl(next, implicitCategory)}`;
      if (url !== `${window.location.pathname}${window.location.search}`) window.history.pushState({ catalog: true }, "", url);
      setState(next);
    },
    [implicitCategory],
  );

  const updateFilters = useCallback((patch: Partial<CatalogState>) => commit({ ...state, ...patch, pagina: 1 }), [commit, state]);

  return { state, ready, commit, updateFilters };
}
