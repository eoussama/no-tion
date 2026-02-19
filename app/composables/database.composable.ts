import type { TCinemaTvDatabase, TNotionDatabase } from "~~/core";

import { DATABASE_IDS, transformCinemaTv } from "~~/core";



/**
 * @description
 * A composable for handling database-related API calls (fetch, update).
 *
 * @returns An object containing methods for checking databases, fetching data, and updating data.
 */
export function useDatabaseApi() {
  const base = "notion/database";

  return {
    all: () => useApiLazy<Array<TNotionDatabase>>(`${base}/all`),
    getCinemaTv: () => useApiLazy<TCinemaTvDatabase>(`${base}/${DATABASE_IDS.CINEMA_TV}`, undefined, { transform: transformCinemaTv }),
  };
}
