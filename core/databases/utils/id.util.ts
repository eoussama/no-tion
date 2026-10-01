/**
 * @description
 * Normalizes a Notion id (with or without dashes) to its 32 lowercase hex characters.
 *
 * @param id - The Notion id.
 * @returns The normalized id.
 */
export function normalizeNotionId(id: string): string {
  return id.replace(/-/g, "").toLowerCase();
}

/**
 * @description
 * Tells whether two Notion ids refer to the same object.
 *
 * @param a - The first id.
 * @param b - The second id.
 * @returns `true` when they match.
 */
export function isSameNotionId(a: string | null | undefined, b: string | null | undefined): boolean {
  return Boolean(a && b) && normalizeNotionId(a as string) === normalizeNotionId(b as string);
}
