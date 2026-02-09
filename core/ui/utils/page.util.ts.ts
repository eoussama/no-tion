import type { TUnsafe } from "@eoussama/core";
import type { TCrumb, TPage } from "../types";
import { PAGES } from "../consts";



/**
 * @description
 * Registers a page with its title and breadcrumb information.
 * This function should be called within the setup function of a Vue component to ensure that the page information is correctly associated with the current route.
 *
 * @param title - The title of the page, which will be displayed in the UI and used for breadcrumb generation.
 * @param crumb - Optional breadcrumb information, including a label and an href. If not provided, the label defaults to the title and the href is generated from the title.
 */
export function registerPage(title: string, crumb?: Partial<TCrumb>): void {
  const route = useRoute();

  const pageCrumb = {
    label: crumb?.label ?? title,
    href: crumb?.href ?? title.toLocaleLowerCase().replace(/\s/g, "-"),
  } as TPage["crumb"];

  PAGES.set(route.name, { title, crumb: pageCrumb });
}

/**
 * @description
 * Retrieves the page information associated with the current route.
 * This includes the title and breadcrumb information that was registered using the `registerPage` function.
 *
 * @returns The page information associated with the current route, including title and breadcrumb details.
 */
export function getPage(): TUnsafe<TPage> {
  const route = useRoute();

  return PAGES.get(route.name) as TUnsafe<TPage>;
}
