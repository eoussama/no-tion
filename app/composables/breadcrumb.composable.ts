import type { TCrumb } from "~~/core";

import { usePages } from "~~/core";



export const useBreadcrumb = () => {
  const page = usePage();
  const pages = usePages();

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

  return crumbs;
}
