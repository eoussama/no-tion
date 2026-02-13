import type { TUnsafe } from "@eoussama/core";
import type { ComputedRef } from "vue";
import type { TPage } from "~~/core";

import { getPage } from "~~/core";



/**
 * @description
 * A composable for retrieving the current page information based on the route name.
 * Captures `useRoute()` once at setup time and returns a computed ref,
 * so it never calls `useRoute()` during reactive re-evaluations.
 *
 * @returns A computed ref containing the current page information.
 */
export function usePage(): ComputedRef<TUnsafe<TPage>> {
  const route = useRoute();

  return computed(() => getPage(route.name ?? route.path));
}
