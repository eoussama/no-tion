import type { MaybeRefOrGetter } from "vue";
import type { TAnyDatabaseDefinition, TDatabaseInfo, TDatabaseMeta, TNotionWorkspace, TRow, TRowsResponse, TRowValues } from "~~/core";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { findRegisteredDefinition, optimisticRow, resolveDefinition } from "~~/core";
import { useApiCaller } from "./api";
import { queryKeys } from "./keys";



type TRowsSnapshot = { previous?: TRowsResponse; optimisticId?: string };

/**
 * @description
 * The databases shared with the integration (registered first).
 *
 * @returns The query.
 */
export function useDatabasesQuery() {
  const call = useApiCaller();

  return useQuery({
    queryKey: queryKeys.databases(),
    queryFn: () => call<Array<TDatabaseMeta>>("db"),
  });
}

/**
 * @description
 * A database's summary and live schema.
 *
 * @param slug - The database slug.
 * @returns The query.
 */
export function useDatabaseQuery(slug: MaybeRefOrGetter<string | undefined>) {
  const call = useApiCaller();

  return useQuery({
    queryKey: computed(() => queryKeys.database(toValue(slug) ?? "")),
    queryFn: () => call<TDatabaseInfo>(`db/${toValue(slug)}`),
    enabled: () => Boolean(toValue(slug)),
  });
}

/**
 * @description
 * A database's definition (registered, or generated from the live schema) along with its info query.
 *
 * @param slug - The database slug.
 * @returns The info query plus the reactive definition.
 */
export function useDatabaseDefinition(slug: MaybeRefOrGetter<string | undefined>) {
  const query = useDatabaseQuery(slug);

  const definition = computed<TAnyDatabaseDefinition | null>(() => {
    const info = query.data.value;

    if (info) {
      return resolveDefinition(info.meta, info.schema);
    }

    const value = toValue(slug);

    return value ? findRegisteredDefinition(value) ?? null : null;
  });

  return { ...query, definition, schema: computed(() => query.data.value?.schema ?? null), meta: computed(() => query.data.value?.meta ?? null) };
}

/**
 * @description
 * Every row of a database.
 *
 * @param slug - The database slug.
 * @returns The query.
 */
export function useRowsQuery(slug: MaybeRefOrGetter<string | undefined>) {
  const call = useApiCaller();

  return useQuery({
    queryKey: computed(() => queryKeys.rows(toValue(slug) ?? "")),
    queryFn: () => call<TRowsResponse>(`db/${toValue(slug)}/rows`),
    enabled: () => Boolean(toValue(slug)),
  });
}

/**
 * @description
 * A single row, shown instantly from the rows cache while it revalidates.
 *
 * @param slug - The database slug.
 * @param pageId - The page id.
 * @returns The query.
 */
export function useRowQuery(slug: MaybeRefOrGetter<string | undefined>, pageId: MaybeRefOrGetter<string | undefined>) {
  const call = useApiCaller();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: computed(() => queryKeys.row(toValue(slug) ?? "", toValue(pageId) ?? "")),
    queryFn: () => call<TRow>(`db/${toValue(slug)}/rows/${toValue(pageId)}`),
    enabled: () => Boolean(toValue(slug) && toValue(pageId)),
    placeholderData: () => {
      const rows = queryClient.getQueryData<TRowsResponse>(queryKeys.rows(toValue(slug) ?? ""));

      return rows?.rows.find(row => row.id === toValue(pageId));
    },
  });
}

/**
 * @description
 * The Notion workspace the integration is connected to.
 *
 * @returns The query.
 */
export function useWorkspaceQuery() {
  const call = useApiCaller();

  return useQuery({
    queryKey: queryKeys.workspace(),
    queryFn: () => call<TNotionWorkspace>("workspace"),
    staleTime: 60 * 60 * 1000,
  });
}

function patchRows(previous: TRowsResponse | undefined, patch: (rows: Array<TRow>) => Array<TRow>): TRowsResponse | undefined {
  return previous ? { ...previous, rows: patch(previous.rows) } : previous;
}

/**
 * @description
 * Creates a row, optimistically inserted at the top of the cached rows (rolled back on error, revalidated once settled).
 *
 * @param slug - The database slug.
 * @param definition - The database definition (for the optimistic row).
 * @returns The mutation.
 */
export function useCreateRow(slug: MaybeRefOrGetter<string>, definition: MaybeRefOrGetter<TAnyDatabaseDefinition | null>) {
  const call = useApiCaller();
  const queryClient = useQueryClient();
  const rowsKey = () => queryKeys.rows(toValue(slug));

  return useMutation({
    mutationFn: (input: TRowValues) => call<TRow>(`db/${toValue(slug)}/rows`, { method: "post", body: input }),

    onMutate: async (input): Promise<TRowsSnapshot> => {
      await queryClient.cancelQueries({ queryKey: rowsKey() });

      const previous = queryClient.getQueryData<TRowsResponse>(rowsKey());
      const def = toValue(definition);
      const optimistic = def ? optimisticRow(def, input) : undefined;

      if (optimistic) {
        queryClient.setQueryData(rowsKey(), patchRows(previous, rows => [optimistic, ...rows]));
      }

      return { previous, optimisticId: optimistic?.id };
    },

    onError: (_error, _input, snapshot) => {
      if (snapshot?.previous) {
        queryClient.setQueryData(rowsKey(), snapshot.previous);
      }
    },

    onSuccess: (row, _input, snapshot) => {
      queryClient.setQueryData<TRowsResponse>(rowsKey(), current => patchRows(current, rows => [row, ...rows.filter(item => item.id !== snapshot?.optimisticId && item.id !== row.id)]));
      queryClient.setQueryData(queryKeys.row(toValue(slug), row.id), row);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: rowsKey() }),
  });
}

/**
 * @description
 * Updates a row, optimistically patched in the cache (rolled back on error, revalidated once settled).
 *
 * @param slug - The database slug.
 * @param definition - The database definition (for the optimistic row).
 * @returns The mutation.
 */
export function useUpdateRow(slug: MaybeRefOrGetter<string>, definition: MaybeRefOrGetter<TAnyDatabaseDefinition | null>) {
  const call = useApiCaller();
  const queryClient = useQueryClient();
  const rowsKey = () => queryKeys.rows(toValue(slug));

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TRowValues> }) => call<TRow>(`db/${toValue(slug)}/rows/${id}`, { method: "patch", body: input }),

    onMutate: async ({ id, input }) => {
      const rowKey = queryKeys.row(toValue(slug), id);

      await Promise.all([queryClient.cancelQueries({ queryKey: rowsKey() }), queryClient.cancelQueries({ queryKey: rowKey })]);

      const previous = queryClient.getQueryData<TRowsResponse>(rowsKey());
      const previousRow = queryClient.getQueryData<TRow>(rowKey) ?? previous?.rows.find(row => row.id === id);
      const def = toValue(definition);

      if (def && previousRow) {
        const patched = optimisticRow(def, input, previousRow);

        queryClient.setQueryData(rowKey, patched);
        queryClient.setQueryData(rowsKey(), patchRows(previous, rows => rows.map(row => row.id === id ? patched : row)));
      }

      return { previous, previousRow };
    },

    onError: (_error, { id }, snapshot) => {
      if (snapshot?.previous) {
        queryClient.setQueryData(rowsKey(), snapshot.previous);
      }

      if (snapshot?.previousRow) {
        queryClient.setQueryData(queryKeys.row(toValue(slug), id), snapshot.previousRow);
      }
    },

    onSuccess: (row) => {
      queryClient.setQueryData(queryKeys.row(toValue(slug), row.id), row);
      queryClient.setQueryData<TRowsResponse>(rowsKey(), current => patchRows(current, rows => rows.map(item => item.id === row.id ? row : item)));
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: rowsKey() }),
  });
}

/**
 * @description
 * Archives a row, optimistically removed from the cache (rolled back on error, revalidated once settled).
 *
 * @param slug - The database slug.
 * @returns The mutation.
 */
export function useArchiveRow(slug: MaybeRefOrGetter<string>) {
  const call = useApiCaller();
  const queryClient = useQueryClient();
  const rowsKey = () => queryKeys.rows(toValue(slug));

  return useMutation({
    mutationFn: (id: string) => call<{ id: string }>(`db/${toValue(slug)}/rows/${id}`, { method: "delete" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: rowsKey() });

      const previous = queryClient.getQueryData<TRowsResponse>(rowsKey());

      queryClient.setQueryData(rowsKey(), patchRows(previous, rows => rows.filter(row => row.id !== id)));

      return { previous };
    },

    onError: (_error, _id, snapshot) => {
      if (snapshot?.previous) {
        queryClient.setQueryData(rowsKey(), snapshot.previous);
      }
    },

    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.row(toValue(slug), id) });
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: rowsKey() }),
  });
}
