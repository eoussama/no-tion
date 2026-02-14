import type { TUnsafe } from "@eoussama/core";



/**
 * @description
 * Extracts a slug from a given input, which can be either a string or an array of strings.
 *
 * @param slug - The input from which to extract the slug.
 * @returns The extracted slug as a string.
 */
export function getSlug(slug: TUnsafe<Array<string> | string>): string {
  return (Array.isArray(slug) ? slug[0] : slug) ?? "";
}
