import type { TUnsafe } from "@eoussama/core";
import type { RouteRecordNameGeneric } from "vue-router";
import type { TCrumb, TPage, TTitle } from "../types";

import { usePages } from "../consts";

export function registerPageByName(
  name: RouteRecordNameGeneric,
  title: TTitle,
  crumb?: Partial<TCrumb>,
  parent?: TPage["parent"],
): void {
  const pages = usePages();
  const evaluatedTitle = typeof title === "function" ? title() : title;

  const pageCrumb = {
    label: crumb?.label ?? evaluatedTitle,
    href: crumb?.href ?? evaluatedTitle.toLocaleLowerCase().replace(/\s/g, "-"),
  } as TPage["crumb"];

  pages.value[String(name)] = { title: evaluatedTitle, crumb: pageCrumb, parent };
}



/**
 * @description
 * Registers a page with its title and breadcrumb information.
 * This function should be called within the setup function of a Vue component to ensure that the page information is correctly associated with the current route.
 *
 * @param title - The title of the page, which can be a string or a function that returns a string. If a function is provided, it will be called to retrieve the title when needed.
 * @param crumb - Optional breadcrumb information, including a label and an href. If not provided, the label defaults to the title and the href is generated from the title.
 * @param parent - Optional parent page information, which can be used to establish a hierarchy of pages for breadcrumb navigation. This should reference another page that has been registered using this function.
 */
export function registerPage(title: TTitle, crumb?: Partial<TCrumb>, parent?: TPage["parent"]): void {
  const route = useRoute();
  const key = route.name ?? route.path;
  registerPageByName(key, title, crumb, parent);
}

/**
 * @description
 * Retrieves the page information associated with the current route.
 * This includes the title and breadcrumb information that was registered using the `registerPage` function.
 *
 * @param name - The name of the route for which to retrieve the page information. This is typically obtained from the current route's name.
 * @returns The page information associated with the current route, including title and breadcrumb details.
 */
export function getPage(name: RouteRecordNameGeneric): TUnsafe<TPage> {
  const pages = usePages();
  return pages.value[String(name)] as TUnsafe<TPage>;
}
