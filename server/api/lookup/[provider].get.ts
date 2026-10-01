import { z } from "zod";
import { defineProtectedRoute, getLookupProviders, LookupUpstreamError, parseOrThrow, searchLookup } from "~~/server/utils";



const LOOKUP_LIMIT = 10;

const SLookupQuery = z.object({
  q: z.string().trim().min(2, "Enter at least 2 characters").max(200),
});

/**
 * @description
 * Searches a lookup source (e.g. `movies`). 404 for an unknown source, 502 when the upstream provider(s) failed.
 */
export default defineProtectedRoute(async (event) => {
  const name = getRouterParam(event, "provider") ?? "";
  const providers = getLookupProviders(name);

  if (!providers) {
    throw createError({ status: 404, message: `Unknown lookup provider "${name}"`, statusText: "Not Found" });
  }

  const { q } = parseOrThrow(SLookupQuery, getQuery(event));

  try {
    return createResponse(event, await searchLookup(providers, q, LOOKUP_LIMIT), { message: "Lookup results" });
  }
  catch (error) {
    if (error instanceof LookupUpstreamError) {
      throw createError({ status: 502, message: error.message, statusText: "Bad Gateway" });
    }

    throw error;
  }
});
