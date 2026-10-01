import type { TLookupResult } from "~~/core";
import type { TLookupProvider } from "./types";

import { tmdbProvider } from "./tmdb.provider";
import { LookupUpstreamError } from "./types";



export * from "./tmdb.provider";
export * from "./types";

/**
 * @description
 * The lookup sources served by `/api/lookup/:provider`.
 * `movies` is TMDB (`NUXT_TMDB_API_KEY`); it reports an IMDb id and link when TMDB knows one.
 */
const LOOKUP_SOURCES: Record<string, () => Array<TLookupProvider>> = {
  movies: () => [tmdbProvider],
};

/**
 * @description
 * Resolves the provider chain of a lookup source.
 *
 * @param name - The source name (e.g. `movies`).
 * @returns The providers to try in order, or `undefined` for an unknown source.
 */
export function getLookupProviders(name: string): Array<TLookupProvider> | undefined {
  return LOOKUP_SOURCES[name]?.();
}

/**
 * @description
 * Describes a provider failure without leaking the upstream URL (it may carry an API key).
 *
 * @param error - The error thrown by the provider.
 * @returns A short, safe description.
 */
function describeFailure(error: unknown): string {
  const status = (error as { statusCode?: unknown; status?: unknown } | null)?.statusCode ?? (error as { status?: unknown } | null)?.status;

  if (typeof status === "number") {
    return `HTTP ${status}`;
  }

  const message = error instanceof Error ? error.message : String(error);

  return message.replace(/\[\w+\]\s*"?https?:\/\/[^\s"]+"?:?\s*/g, "").replace(/https?:\/\/\S+/g, "<url>").trim() || "unreachable";
}

/**
 * @description
 * Searches a lookup source, falling back to the next provider when one fails.
 *
 * @param providers - The providers to try in order.
 * @param query - The search query.
 * @param limit - The maximum number of results.
 * @returns The results of the first provider that answered.
 * @throws {LookupUpstreamError} When every provider failed.
 */
export async function searchLookup(providers: Array<TLookupProvider>, query: string, limit: number): Promise<Array<TLookupResult>> {
  const failures: Array<string> = [];

  for (const provider of providers) {
    try {
      return await provider.search(query, limit);
    }
    catch (error) {
      failures.push(`${provider.name}: ${describeFailure(error)}`);
    }
  }

  throw new LookupUpstreamError(`Lookup failed (${failures.join("; ")})`);
}
