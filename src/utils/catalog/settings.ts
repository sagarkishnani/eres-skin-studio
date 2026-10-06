import {
  DEFAULT_MOBILE_SORT_KEYS,
  DEFAULT_VISIBLE_FILTERS,
  FILTER_KEYS,
  SORT_OPTIONS,
  type FilterKey,
  type SortKey,
} from "./types";

type CmsList = readonly (string | null)[] | null | undefined;

function knownValuesOr<T extends string>(values: CmsList, known: readonly T[], fallback: T[]): T[] {
  const picked = known.filter((value) => values?.includes(value));
  return picked.length ? picked : fallback;
}

export function resolveVisibleFilters(values: CmsList): FilterKey[] {
  return knownValuesOr(values, FILTER_KEYS, DEFAULT_VISIBLE_FILTERS);
}

export function resolveMobileSortKeys(values: CmsList): SortKey[] {
  return knownValuesOr(values, SORT_OPTIONS.map((option) => option.key), DEFAULT_MOBILE_SORT_KEYS);
}
