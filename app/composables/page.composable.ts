import type { TUnsafe } from "@eoussama/core";
import type { TPage } from "~~/core";

import { getPage } from "~~/core";



/**
 * @description
 * A composable for retrieving the current page information based on the route name.
 *
 * @returns The current page information, including title and breadcrumb details.
 */
export function usePage(): TUnsafe<TPage> {
  const route = useRoute();
  const page = getPage(route.name);

  return page;
}
