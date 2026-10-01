import type { Component } from "vue";



/**
 * @description
 * Custom create/edit forms, by database slug. A database without an entry uses the generic `DatabaseForm`,
 * driven by its definition (`core/databases`).
 *
 * A custom form receives the same props as `DatabaseForm` (`definition`, `schema`, `initialValues`, `locked`, `rows`,
 * `rowId`, `submitLabel`, `submitIcon`, `pending`, `cancelable`) and emits `submit(values)` and `cancel()`.
 *
 * @example
 * export const DATABASE_FORMS = {
 *   "reading-list": defineAsyncComponent(() => import("./reading-list/ReadingListForm.vue")),
 * };
 */
export const DATABASE_FORMS: Record<string, Component> = {};
