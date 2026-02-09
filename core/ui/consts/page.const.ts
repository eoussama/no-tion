import type { RouteRecordNameGeneric } from "vue-router";
import type { TPage } from "../types";

import { reactive } from "vue";



export const PAGES: Map<RouteRecordNameGeneric, TPage> = reactive(new Map());
