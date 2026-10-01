/**
 * @description
 * First segment of every query key, by family.
 */
export const QUERY_ROOTS = {
  db: "db",
  lookup: "lookup",
  workspace: "workspace",
} as const;

/**
 * @description
 * Query key factory. Keys are hierarchical, so invalidating `database(slug)` also invalidates its rows.
 */
export const queryKeys = {
  databases: () => ["databases"] as const,
  database: (slug: string) => [QUERY_ROOTS.db, slug] as const,
  rows: (slug: string) => [QUERY_ROOTS.db, slug, "rows"] as const,
  row: (slug: string, pageId: string) => [QUERY_ROOTS.db, slug, "row", pageId] as const,
  lookup: (provider: string, query: string) => [QUERY_ROOTS.lookup, provider, query] as const,
  workspace: () => [QUERY_ROOTS.workspace] as const,
};
