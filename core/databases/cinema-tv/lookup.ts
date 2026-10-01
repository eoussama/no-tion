import type { TNullable } from "@eoussama/core";
import type { TDefinitionContext, TLookupDef, TLookupResult, TRow } from "../types";
import type { TCinemaTvInput, TCinemaTvValues } from "./schema";

import { extractImdbId, imdbUrl, normalizeUrl } from "../utils";
import { CINEMA_TV_FALLBACK_TYPE, CINEMA_TV_PROPERTIES, IMDB_TYPE_TO_CINEMA_TV_TYPE } from "./consts";



/**
 * @description
 * Maps an IMDb title type onto a "Type" option that exists in the live schema.
 *
 * @param type - The IMDb title type (e.g. `tvSeries`).
 * @param options - The live "Type" option names (empty when unknown, then the static mapping is trusted).
 * @returns The option name, or `null` when nothing fits.
 */
export function mapTitleType(type: TNullable<string>, options: ReadonlyArray<string> = []): TNullable<string> {
  const mapped = (type && IMDB_TYPE_TO_CINEMA_TV_TYPE[type]) || CINEMA_TV_FALLBACK_TYPE;

  if (options.length === 0 || options.includes(mapped)) {
    return mapped;
  }

  return options.includes(CINEMA_TV_FALLBACK_TYPE) ? CINEMA_TV_FALLBACK_TYPE : null;
}

/**
 * @description
 * Maps a lookup result to a Cinema & TV form input.
 *
 * @param result - The lookup result.
 * @param ctx - The definition context (live schema).
 * @returns The partial input.
 */
export function cinemaTvLookupToInput(result: TLookupResult, ctx?: TDefinitionContext): Partial<TCinemaTvInput> {
  const options = ctx?.schema.properties[CINEMA_TV_PROPERTIES.type]?.options?.map(option => option.name) ?? [];

  return {
    title: result.title,
    type: mapTitleType(result.type, options) ?? undefined,
    url: result.imdbId ? imdbUrl(result.imdbId) : result.url,
    poster: result.image ?? "",
    release: result.releaseDate ?? undefined,
  };
}

/**
 * @description
 * Finds the row an input duplicates: same IMDb title, or the same URL for non-IMDb links.
 *
 * @param input - The input.
 * @param rows - The existing rows.
 * @returns The duplicated row, if any.
 */
export function findCinemaTvDuplicate(input: Partial<TCinemaTvInput>, rows: ReadonlyArray<TRow<TCinemaTvValues>>): TRow<TCinemaTvValues> | undefined {
  const url = input.url;

  if (!url) {
    return undefined;
  }

  const imdbId = extractImdbId(url);

  if (imdbId) {
    return rows.find(row => extractImdbId(row.values.url) === imdbId);
  }

  const normalized = normalizeUrl(url);

  return rows.find(row => normalizeUrl(row.values.url) === normalized);
}

export const CINEMA_TV_LOOKUP: TLookupDef<TCinemaTvValues, TCinemaTvInput> = {
  provider: "movies",
  label: "IMDb",
  placeholder: "Search a movie or TV show...",
  locked: ["type", "url"],
  toInput: cinemaTvLookupToInput,
  duplicateOf: findCinemaTvDuplicate,
};
