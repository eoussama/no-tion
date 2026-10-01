import { z } from "zod";



const NOTION_ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/**
 * @description
 * A Notion object id (32 hex characters, dashes optional).
 */
export const SNotionId = z.string().regex(NOTION_ID, "Invalid Notion ID");

/**
 * @description
 * A database route parameter: a registered slug (`cinema-tv`) or a Notion database id.
 */
export const SDatabaseSlug = z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/i, "Invalid database slug");

export type TNotionId = z.infer<typeof SNotionId>;
export type TDatabaseSlug = z.infer<typeof SDatabaseSlug>;
