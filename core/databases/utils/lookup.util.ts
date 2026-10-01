import type { TNullable } from "@eoussama/core";
import type { TLookupResult } from "../types";



/**
 * @description
 * Human readable labels of IMDb title types (ported from tag 0.0.3).
 */
export const TITLE_TYPE_LABELS: Record<string, string> = {
  movie: "Movie",
  tvSeries: "TV Series",
  tvMiniSeries: "TV Mini-Series",
  tvSpecial: "TV Special",
  tvMovie: "TV Movie",
  tvShort: "TV Short",
  tvEpisode: "TV Episode",
  short: "Short",
  video: "Video",
  videoGame: "Video Game",
};

/**
 * @description
 * Formats an IMDb title type for display.
 *
 * @param type - The IMDb title type.
 * @returns The label.
 */
export function formatTitleType(type: TNullable<string>): string {
  if (!type) {
    return "";
  }

  return TITLE_TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * @description
 * Builds the canonical IMDb URL of a title.
 *
 * @param imdbId - The IMDb id (e.g. `tt1375666`).
 * @returns The IMDb URL.
 */
export function imdbUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`;
}

/**
 * @description
 * Extracts an IMDb title id from a URL.
 *
 * @param url - The URL.
 * @returns The IMDb id, if any.
 */
export function extractImdbId(url: TNullable<string> | undefined): TNullable<string> {
  if (!url) {
    return null;
  }

  return /imdb\.com\/(?:[a-z-]+\/)?title\/(tt\d+)/i.exec(url)?.[1] ?? null;
}

/**
 * @description
 * Normalizes a URL for equality checks (no protocol, `www.`, query, hash or trailing slash).
 *
 * @param url - The URL.
 * @returns The normalized URL.
 */
export function normalizeUrl(url: TNullable<string> | undefined): string {
  return (url ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
}

/**
 * @description
 * Formats the secondary line of a lookup result: type · year · runtime · rating.
 *
 * @param result - The lookup result.
 * @returns The formatted line.
 */
export function formatLookupMeta(result: TLookupResult): string {
  const parts: Array<string> = [];

  if (result.type) {
    parts.push(formatTitleType(result.type));
  }

  if (result.runtimeSeconds) {
    parts.push(`${Math.round(result.runtimeSeconds / 60)} min`);
  }

  if (result.rating) {
    parts.push(`★ ${result.rating.toFixed(1)}`);
  }

  return parts.join(" · ");
}
