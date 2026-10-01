import type { TDatabaseSchema } from "../notion";
import type { TAnyDatabaseDefinition, TDatabaseDefinition, TDatabaseMeta, TRowValues } from "./types";

import { CINEMA_TV_DEFINITION } from "./cinema-tv";
import { buildGenericDefinition } from "./generic";
import { isSameNotionId, normalizeNotionId } from "./utils";



/**
 * @description
 * Erases a definition's type parameters so it can live in the registry.
 * Safe because the registry only ever hands a definition rows and inputs produced (and validated) by that same definition.
 *
 * @param def - The typed definition.
 * @returns The same definition, typed for the registry.
 */
export function registerDatabase<TValues extends TRowValues, TInput extends TRowValues>(def: TDatabaseDefinition<TValues, TInput>): TAnyDatabaseDefinition {
  return def as unknown as TAnyDatabaseDefinition;
}

/**
 * @description
 * Databases with a hand-written definition. Any other database shared with the integration gets a generated one.
 */
export const DATABASES: ReadonlyArray<TAnyDatabaseDefinition> = [
  registerDatabase(CINEMA_TV_DEFINITION),
];

/**
 * @description
 * Finds a registered definition by slug or by database id.
 *
 * @param slugOrId - The slug, or the Notion database id (with or without dashes).
 * @returns The definition, if registered.
 */
export function findRegisteredDefinition(slugOrId: string): TAnyDatabaseDefinition | undefined {
  return DATABASES.find(def => def.slug === slugOrId || isSameNotionId(def.id, slugOrId));
}

/**
 * @description
 * The slug a database is served under: the registered slug, or its normalized id.
 *
 * @param databaseId - The Notion database id.
 * @returns The slug.
 */
export function slugForDatabase(databaseId: string): string {
  return findRegisteredDefinition(databaseId)?.slug ?? normalizeNotionId(databaseId);
}

/**
 * @description
 * Resolves the definition of a database: the registered one, or one generated from its live schema.
 *
 * @param meta - The database summary.
 * @param schema - The live schema.
 * @returns The definition.
 */
export function resolveDefinition(meta: TDatabaseMeta, schema: TDatabaseSchema): TAnyDatabaseDefinition {
  return findRegisteredDefinition(meta.id) ?? buildGenericDefinition(meta, schema);
}
