import type { TCrumb } from "~~/core";



/**
 * @description
 * A composable to generate breadcrumbs based on the current page and its parent pages.
 *
 * @returns An array of breadcrumb objects, each containing a label and an href.
 */
export function useBreadcrumb() {
  const { pages } = usePages();
  const page = usePage();

  const crumbs = computed(() => {
    if (!page.value) {
      return [];
    }

    const result: Array<TCrumb> = [page.value.crumb];
    let parentName = page.value.parent;

    while (parentName) {
      const parentPage = pages.value[String(parentName)];

      if (!parentPage) {
        break;
      }

      result.unshift(parentPage.crumb);
      parentName = parentPage.parent;
    }

    return result;
  });

  const lazy = computed(() => page.value?.lazy ?? false);

  return { crumbs, lazy };
}
