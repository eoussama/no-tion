import type { TCrumb } from "~~/core";

import { PAGES } from "~~/core";



export const useBreadcrumb = () => {
  const crumbs = computed(() => {
    const page = usePage();
    
    if (!page) {
      return [];
    }

    const result: Array<TCrumb> = [page.crumb];
    let parentName = page.parent;
  
    while (parentName) {
      const parentPage = PAGES.get(parentName);

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
