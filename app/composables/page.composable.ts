import type { RouteRecordNameGeneric } from "vue-router";
import type { TCrumb, TPage, TTitle } from "~~/core";

import { capitalize } from "~~/core";



/**
 * @description
 * This composable provides a mechanism to register pages and retrieve the current page information based on the active route.
 * It maintains a state of registered pages, allowing for dynamic page registration and retrieval of page details such as title and breadcrumb information.
 *
 * @returns An object containing the `pages` state and the `registerPage` function for registering new pages.
 */
export function usePages() {
  const pages = useState<Record<string, TPage>>("pages", () => ({}));

  function registerPage(name: Omit<RouteRecordNameGeneric, "undefined">, title?: TTitle, crumb?: Partial<TCrumb>, parent?: TPage["parent"], lazy?: boolean): void {
    const defaultTitle = title ?? capitalize(name.toString());
    const evaluatedTitle = typeof defaultTitle === "function" ? defaultTitle() : defaultTitle;

    const pageCrumb = {
      label: crumb?.label ?? evaluatedTitle,
      href: crumb?.href ?? evaluatedTitle.toLocaleLowerCase().replace(/\s/g, "-"),
    } as TPage["crumb"];

    pages.value[String(name)] = { title: evaluatedTitle, crumb: pageCrumb, parent, lazy };
  }

  function updatePage(name: Omit<RouteRecordNameGeneric, "undefined">, updates: Partial<TPage>): void {
    const pageKey = String(name);
    const currentPage = pages.value[pageKey];

    if (!currentPage) {
      throw new Error(`Page with name "${name}" is not registered.`);
    }

    pages.value[pageKey] = {
      ...currentPage,
      ...updates,
      title: updates.title ?? currentPage.title,
    };
  }

  return { pages, registerPage, updatePage };
}

/**
 * @description
 * This composable retrieves the current page information based on the active route.
 *
 * @returns The page information associated with the current route, including title and breadcrumb details, as registered using the `registerPage` function.
 */
export function usePage() {
  const route = useRoute();
  const { pages } = usePages();
  const page = computed(() => pages.value[(route.name ?? route.path) as string]);

  return page;
}
