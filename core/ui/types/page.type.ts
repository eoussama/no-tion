import type { RouteNamedMap } from "vue-router/auto-routes";
import type { TCrumb } from "./crumb.type";



export type TPage = {
  title: string;
  crumb: TCrumb;
  lazy?: boolean;
  parent?: keyof RouteNamedMap;
};
