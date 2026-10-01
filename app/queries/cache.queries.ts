import type { TAnyDatabaseDefinition, TDatabaseInfo, TDatabaseMeta, TRow, TRowsResponse } from "~~/core";

import { useIsFetching, useIsMutating, useQueryClient } from "@tanstack/vue-query";
import { findRegisteredDefinition, resolveDefinition } from "~~/core";
import { useAuthStore } from "~/stores";
import { QUERY_ROOTS, queryKeys } from "./keys";



export type TCachedRow = {
  slug: string;
  databaseTitle: string;
  definition: TAnyDatabaseDefinition | null;
  row: TRow;
};

/**
 * @description
 * A counter bumped whenever query data changes, to make cache reads reactive without observing every query.
 *
 * @returns The counter.
 */
function useCacheVersion() {
  const queryClient = useQueryClient();
  const version = shallowRef(0);

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "added" || event.type === "removed" || (event.type === "updated" && (event.action.type === "success" || event.action.type === "setState"))) {
      version.value++;
    }
  });

  onScopeDispose(unsubscribe);

  return version;
}

/**
 * @description
 * Every row currently in the (persisted) cache, across databases, with its database title and definition.
 * Reads the cache only: nothing is fetched.
 *
 * @returns The cached rows, newest first.
 */
export function useCachedRows() {
  const queryClient = useQueryClient();
  const version = useCacheVersion();

  return computed<Array<TCachedRow>>(() => {
    void version.value;

    const databases = queryClient.getQueryData<Array<TDatabaseMeta>>(queryKeys.databases()) ?? [];
    const entries = queryClient.getQueriesData<TRowsResponse>({ queryKey: [QUERY_ROOTS.db] })
      .filter(([key]) => key.length === 3 && key[2] === "rows");

    return entries.flatMap(([key, data]) => {
      const slug = String(key[1]);
      const info = queryClient.getQueryData<TDatabaseInfo>(queryKeys.database(slug));
      const definition = info ? resolveDefinition(info.meta, info.schema) : findRegisteredDefinition(slug) ?? null;
      const databaseTitle = info?.meta.title ?? databases.find(db => db.slug === slug)?.title ?? definition?.title ?? slug;

      return (data?.rows ?? []).map(row => ({ slug, databaseTitle, definition, row }));
    }).sort((a, b) => b.row.createdTime.localeCompare(a.row.createdTime));
  });
}

/**
 * @description
 * Connection and sync state: online, pending writes (optimistic mutations), background refreshes, last successful sync.
 *
 * @returns The sync state.
 */
export function useSyncStatus() {
  const queryClient = useQueryClient();
  const version = useCacheVersion();
  const online = useOnline();
  const auth = useAuthStore();

  const pending = useIsMutating();
  const fetching = useIsFetching({ predicate: query => query.queryKey[0] !== QUERY_ROOTS.lookup });

  const lastSyncedAt = computed(() => {
    void version.value;

    return queryClient.getQueryCache().getAll().filter(query => query.queryKey[0] !== QUERY_ROOTS.lookup).reduce((latest, query) => Math.max(latest, query.state.dataUpdatedAt), 0);
  });

  const isOffline = computed(() => !online.value || auth.isOffline);

  const state = computed<"offline" | "syncing" | "refreshing" | "synced">(() => {
    if (pending.value > 0) {
      return "syncing";
    }

    if (isOffline.value) {
      return "offline";
    }

    return fetching.value > 0 ? "refreshing" : "synced";
  });

  function refresh(): Promise<void> {
    return queryClient.invalidateQueries({ predicate: query => query.queryKey[0] !== QUERY_ROOTS.lookup });
  }

  return { online, isOffline, pending, fetching, lastSyncedAt, state, refresh };
}
