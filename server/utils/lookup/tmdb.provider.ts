import type { TNullable } from "@eoussama/core";
import type { TLookupResult } from "~~/core";
import type { TLookupProvider } from "./types";

import { z } from "zod";
import { imdbUrl } from "~~/core";



const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

export const STmdbSearchResult = z.object({
  id: z.number(),
  media_type: z.enum(["movie", "tv"]),
  title: z.string().optional(),
  name: z.string().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  vote_average: z.number().optional(),
});

export const STmdbSearchResponse = z.object({
  results: z.array(z.unknown()).default([]),
});

export const STmdbExternalIds = z.object({
  imdb_id: z.string().nullable().optional(),
});

/**
 * @description
 * The parts of `/movie/{id}` or `/tv/{id}` (with `append_to_response`) the lookup uses.
 * Movies list their release dates per country; the earliest one is the first ever release.
 */
export const STmdbDetails = z.object({
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  external_ids: STmdbExternalIds.optional(),
  release_dates: z.object({
    results: z.array(z.object({
      release_dates: z.array(z.object({ release_date: z.string() })).default([]),
    })).default([]),
  }).optional(),
});

export type TTmdbDetails = z.infer<typeof STmdbDetails>;

export type TTmdbSearchResult = z.infer<typeof STmdbSearchResult>;

function yearOf(date: TNullable<string> | undefined): TNullable<number> {
  const year = Number.parseInt((date ?? "").slice(0, 4), 10);

  return Number.isFinite(year) ? year : null;
}

/**
 * @description
 * Keeps the `YYYY-MM-DD` part of a TMDB date or timestamp, or `null` when it isn't one.
 *
 * @param date - The date (e.g. `2010-07-08`, `2010-07-08T00:00:00.000Z`).
 * @returns The date, or `null`.
 */
function toDay(date: string | undefined): TNullable<string> {
  const day = (date ?? "").slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

/**
 * @description
 * The first ever release of a title: the earliest of a movie's release dates (all countries and release types,
 * premieres included), or a show's first air date. Falls back to the search result's date.
 *
 * @param result - The search result.
 * @param details - The title details, when they could be fetched.
 * @returns The date (`YYYY-MM-DD`), or `null` when unknown.
 */
export function firstReleaseDate(result: TTmdbSearchResult, details?: TNullable<TTmdbDetails>): TNullable<string> {
  const candidates = [
    result.release_date,
    result.first_air_date,
    details?.release_date,
    details?.first_air_date,
    ...(details?.release_dates?.results ?? []).flatMap(country => country.release_dates.map(entry => entry.release_date)),
  ]
    .map(toDay)
    .filter((day): day is string => day !== null)
    .sort();

  return candidates[0] ?? null;
}

/**
 * @description
 * Maps a TMDB multi-search result (plus its IMDb id, when known) to a lookup result.
 * TMDB's `tv` is reported as IMDb's `tvSeries` so definitions can share one type mapping.
 *
 * @param result - The TMDB search result.
 * @param imdbId - The IMDb id from `external_ids`, if any.
 * @returns The lookup result.
 */
export function mapTmdbResult(result: TTmdbSearchResult, imdbId: TNullable<string>, releaseDate: TNullable<string> = firstReleaseDate(result)): TLookupResult {
  return {
    id: imdbId ?? `tmdb:${result.media_type}:${result.id}`,
    source: "tmdb",
    title: result.title ?? result.name ?? "Untitled",
    url: imdbId ? imdbUrl(imdbId) : `https://www.themoviedb.org/${result.media_type}/${result.id}`,
    imdbId,
    year: yearOf(releaseDate ?? result.release_date ?? result.first_air_date),
    releaseDate,
    type: result.media_type === "tv" ? "tvSeries" : "movie",
    image: result.poster_path ? `${TMDB_IMAGE_URL}${result.poster_path}` : null,
    runtimeSeconds: null,
    rating: result.vote_average ? Math.round(result.vote_average * 10) / 10 : null,
  };
}

function tmdbFetch(path: string, apiKey: string, query: Record<string, string | number> = {}): Promise<unknown> {
  // A v4 "read access token" is a JWT sent as a bearer token; a v3 key goes in the query string.
  const isBearer = apiKey.startsWith("eyJ");

  return $fetch<unknown, string>(`${TMDB_API_URL}${path}`, {
    query: isBearer ? query : { ...query, api_key: apiKey },
    headers: isBearer ? { Authorization: `Bearer ${apiKey}` } : undefined,
    timeout: 8000,
    retry: 0,
  });
}

/**
 * @description
 * TMDB: needs `NUXT_TMDB_API_KEY` (v3 key or v4 read access token). One search, then one `external_ids` call per result for the IMDb id.
 */
export const tmdbProvider: TLookupProvider = {
  name: "tmdb",

  async search(query, limit) {
    const apiKey = useRuntimeConfig().tmdbApiKey;

    if (!apiKey) {
      throw new Error("TMDB API key is not configured");
    }

    const response = STmdbSearchResponse.parse(await tmdbFetch("/search/multi", apiKey, { query, include_adult: "false", page: 1 }));
    const results = response.results
      .map(result => STmdbSearchResult.safeParse(result))
      .filter(result => result.success)
      .map(result => result.data)
      .slice(0, limit);

    // One details call per result gives both the IMDb id and, for movies, every release date.
    return Promise.all(results.map(async (result) => {
      const append = result.media_type === "movie" ? "external_ids,release_dates" : "external_ids";
      const raw = await tmdbFetch(`/${result.media_type}/${result.id}`, apiKey, { append_to_response: append }).catch(() => null);
      const details = STmdbDetails.safeParse(raw).data ?? null;
      const imdbId = details?.external_ids?.imdb_id || null;

      return mapTmdbResult(result, imdbId, firstReleaseDate(result, details));
    }));
  },
};
