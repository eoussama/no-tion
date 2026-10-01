import type { Query } from "@tanstack/vue-query";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClientRestore, persistQueryClientSubscribe } from "@tanstack/query-persist-client-core";
import { defaultShouldDehydrateQuery, QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { del, get, set } from "idb-keyval";
import { version } from "../../package.json";
import { QUERY_ROOTS } from "../queries/keys";



/**
 * @description
 * IndexedDB key holding the persisted query cache.
 */
const PERSIST_KEY = "no-tion:query-cache";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_AGE_MS = 7 * ONE_DAY_MS;

function shouldPersist(query: Query): boolean {
  return query.queryKey[0] !== QUERY_ROOTS.lookup && defaultShouldDehydrateQuery(query);
}

/**
 * @description
 * TanStack Query with an IndexedDB-persisted cache (stale-while-revalidate across reloads).
 * The cache is restored before the app renders, so pages paint instantly from the last known data, then revalidate.
 * Lookup results are never persisted. The cache is busted on every app version.
 */
export default defineNuxtPlugin({
  name: "query",
  parallel: false,
  async setup(nuxtApp) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
          gcTime: MAX_AGE_MS,
          retry: 1,
          refetchOnWindowFocus: true,
        },
      },
    });

    const persister = createAsyncStoragePersister({
      key: PERSIST_KEY,
      throttleTime: 1000,
      storage: {
        getItem: key => get<string>(key),
        setItem: (key, value: string) => set(key, value),
        removeItem: key => del(key),
      },
    });

    nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });

    const options = { queryClient, persister, buster: version, maxAge: MAX_AGE_MS };

    try {
      await persistQueryClientRestore(options);
    }
    catch {
      // A corrupt or unavailable IndexedDB (e.g. private mode) only costs the warm start.
    }

    let unsubscribe = persistQueryClientSubscribe({ ...options, dehydrateOptions: { shouldDehydrateQuery: shouldPersist } });

    /**
     * @description
     * Clears the in-memory cache and its persisted copy (on logout).
     *
     * @returns A promise resolved once the persisted copy is removed.
     */
    async function clearQueryCache(): Promise<void> {
      unsubscribe();
      queryClient.clear();
      await persister.removeClient();
      unsubscribe = persistQueryClientSubscribe({ ...options, dehydrateOptions: { shouldDehydrateQuery: shouldPersist } });
    }

    return {
      provide: {
        queryClient,
        clearQueryCache,
      },
    };
  },
});

declare module "#app" {
  interface NuxtApp {
    $queryClient: QueryClient;
    $clearQueryCache: () => Promise<void>;
  }
}
