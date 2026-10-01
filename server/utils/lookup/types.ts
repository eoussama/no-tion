import type { TLookupResult } from "~~/core";



/**
 * @description
 * A title lookup source. Implementations live next to this file and are picked by `getLookupProviders`.
 */
export type TLookupProvider = {
  name: string;
  search: (query: string, limit: number) => Promise<Array<TLookupResult>>;
};

/**
 * @description
 * Thrown when every upstream provider failed (mapped to a 502).
 */
export class LookupUpstreamError extends Error {}
