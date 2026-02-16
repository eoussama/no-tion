import type { TUnsafe } from "@eoussama/core";



/**
 * @description
 * Extracts an ID from a given input, which can be either a string or an array of strings.
 *
 * @param id - The input from which to extract the ID.
 * @returns The extracted ID as a string.
 */
export function getId(id: TUnsafe<Array<string> | string>): string {
  return (Array.isArray(id) ? id[0] : id) ?? "";
}
