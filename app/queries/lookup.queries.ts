import type { MaybeRefOrGetter, Ref } from "vue";
import type { TLookupResult } from "~~/core";

import { useQuery } from "@tanstack/vue-query";
import { useApiCaller } from "./api";
import { queryKeys } from "./keys";



export const LOOKUP_MIN_LENGTH = 2;
export const LOOKUP_DEBOUNCE_MS = 300;

/**
 * @description
 * Debounced title lookup (300 ms), enabled from 2 characters. Results are cached in memory only (never persisted).
 *
 * @param provider - The lookup source (e.g. `movies`).
 * @param term - The search term, as typed.
 * @returns The query, plus whether the term is still being debounced.
 */
export function useLookupQuery(provider: MaybeRefOrGetter<string | undefined>, term: Ref<string>) {
  const call = useApiCaller();
  const debounced = refDebounced(term, LOOKUP_DEBOUNCE_MS);
  const query = computed(() => debounced.value.trim());

  const result = useQuery({
    queryKey: computed(() => queryKeys.lookup(toValue(provider) ?? "", query.value)),
    queryFn: ({ signal }) => call<Array<TLookupResult>>(`lookup/${toValue(provider)}`, { query: { q: query.value }, signal }),
    enabled: () => Boolean(toValue(provider)) && query.value.length >= LOOKUP_MIN_LENGTH,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  const isDebouncing = computed(() => term.value.trim() !== query.value);

  return { ...result, isDebouncing };
}
