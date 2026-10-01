import type { TNullable } from "@eoussama/core";
import type { DataSourceObjectResponse, PageObjectResponse, SearchResponse } from "@notionhq/client";
import type { TAnyDatabaseDefinition, TDatabaseInfo, TDatabaseMeta, TNotionWorkspace, TNotionWrite, TRow, TRowValues } from "~~/core";

import { Client, collectAllDataSourceRows, isFullDatabase, isFullDataSource, isFullPage } from "@notionhq/client";
import { DATABASES, findRegisteredDefinition, fromNotion, isSameNotionId, normalizeNotionId, normalizeSchema, pageIcon, plainText, resolveDefinition, slugForDatabase, SNotionId, toNotion } from "~~/core";



let NOTION_CLIENT: TNullable<Client> = null;

/**
 * @description
 * How long a resolved database (meta + schema) is reused before asking Notion again.
 */
const DATABASE_CACHE_TTL_MS = 60 * 1000;
const DATABASE_CACHE = new Map<string, { value: TResolvedDatabase; expiresAt: number }>();

/**
 * @description
 * A database resolved from its slug: definition, summary and live schema.
 */
export type TResolvedDatabase = TDatabaseInfo & {
  def: TAnyDatabaseDefinition;
};

/**
 * @description
 * Thrown when a database or row cannot be found (mapped to a 404).
 */
export class NotFoundError extends Error {}

/**
 * @description
 * Returns a singleton instance of the Notion client, initialized with `NUXT_NOTION_API_KEY`.
 * The client retries rate-limited requests (429) on its own.
 *
 * @returns The Notion client.
 * @throws {Error} If the Notion API key is not configured.
 */
export function getNotionClient(): Client {
  if (!NOTION_CLIENT) {
    const notionApiKey = useRuntimeConfig().notionApiKey;

    if (!notionApiKey) {
      throw new Error("Notion API key is not configured.");
    }

    NOTION_CLIENT = new Client({ auth: notionApiKey });
  }

  return NOTION_CLIENT;
}

function coverRequest(cover: TNotionWrite["cover"]) {
  if (cover === undefined) {
    return undefined;
  }

  return cover ? { type: "external" as const, external: { url: cover } } : null;
}

function databaseIdOf(dataSource: DataSourceObjectResponse): string {
  return dataSource.parent.type === "database_id" ? dataSource.parent.database_id : dataSource.id;
}

function metaFromDefinition(def: TAnyDatabaseDefinition): TDatabaseMeta {
  return {
    slug: def.slug,
    id: normalizeNotionId(def.id),
    dataSourceId: def.dataSourceId ?? null,
    title: def.title,
    icon: def.icon ? { type: "emoji", value: def.icon } : null,
    url: null,
    registered: true,
    lastEditedTime: null,
  };
}

/**
 * @description
 * Lists the databases: the registered ones plus every data source shared with the integration (one search, paginated).
 * A database with several data sources is listed once, with its first data source.
 *
 * @returns The database summaries, registered first.
 */
export async function listDatabases(): Promise<Array<TDatabaseMeta>> {
  const client = getNotionClient();
  const results: SearchResponse["results"] = [];
  let cursor: string | undefined;

  do {
    const page = await client.search({ filter: { property: "object", value: "data_source" }, page_size: 100, start_cursor: cursor });

    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor ?? undefined : undefined;
  } while (cursor);

  const byId = new Map<string, TDatabaseMeta>();

  for (const result of results) {
    if (result.object !== "data_source" || !isFullDataSource(result) || result.in_trash) {
      continue;
    }

    const id = normalizeNotionId(databaseIdOf(result));

    if (byId.has(id)) {
      continue;
    }

    const def = findRegisteredDefinition(id);

    byId.set(id, {
      id,
      slug: slugForDatabase(id),
      dataSourceId: result.id,
      title: def?.title ?? (plainText(result.title) || "Untitled"),
      icon: def?.icon ? { type: "emoji", value: def.icon } : pageIcon(result),
      url: result.url,
      registered: Boolean(def),
      lastEditedTime: result.last_edited_time,
    });
  }

  for (const def of DATABASES) {
    const id = normalizeNotionId(def.id);

    if (!byId.has(id)) {
      byId.set(id, metaFromDefinition(def));
    }
  }

  return [...byId.values()].sort((a, b) => Number(b.registered) - Number(a.registered) || a.title.localeCompare(b.title));
}

/**
 * @description
 * Resolves a database by slug (registered) or id (any database shared with the integration).
 * The result is cached in memory for a minute to spare Notion's rate limit (about 3 requests per second).
 *
 * @param slug - The slug or database id.
 * @param fresh - Bypass the cache.
 * @returns The definition, summary and live schema.
 * @throws {NotFoundError} If the database does not exist or is not shared with the integration.
 */
export async function resolveDatabase(slug: string, fresh: boolean = false): Promise<TResolvedDatabase> {
  const cached = DATABASE_CACHE.get(slug);

  if (!fresh && cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const registered = findRegisteredDefinition(slug);
  const databaseId = registered?.id ?? (SNotionId.safeParse(slug).success ? slug : null);

  if (!databaseId) {
    throw new NotFoundError(`Database "${slug}" not found`);
  }

  const client = getNotionClient();
  const database = await client.databases.retrieve({ database_id: databaseId });

  if (!isFullDatabase(database)) {
    throw new NotFoundError("Database not found");
  }

  const dataSourceId = registered?.dataSourceId ?? database.data_sources[0]?.id;

  if (!dataSourceId) {
    throw new NotFoundError("Database has no data source");
  }

  const dataSource = await client.dataSources.retrieve({ data_source_id: dataSourceId });

  if (!isFullDataSource(dataSource)) {
    throw new NotFoundError("Data source not found");
  }

  const schema = normalizeSchema(dataSource);
  const meta: TDatabaseMeta = {
    slug: registered?.slug ?? normalizeNotionId(database.id),
    id: normalizeNotionId(database.id),
    dataSourceId: dataSource.id,
    title: registered?.title ?? (plainText(database.title) || "Untitled"),
    icon: registered?.icon ? { type: "emoji", value: registered.icon } : pageIcon(database),
    url: database.url,
    registered: Boolean(registered),
    lastEditedTime: database.last_edited_time,
  };

  const value: TResolvedDatabase = { def: resolveDefinition(meta, schema), meta, schema };

  DATABASE_CACHE.set(slug, { value, expiresAt: Date.now() + DATABASE_CACHE_TTL_MS });

  return value;
}

/**
 * @description
 * Drops a database from the in-memory cache (e.g. after a write that may add select options).
 *
 * @param slug - The slug.
 */
export function invalidateDatabase(slug: string): void {
  DATABASE_CACHE.delete(slug);
}

/**
 * @description
 * Fetches every row of a database (fully paginated, 100 per request) and maps them to rows.
 *
 * @param db - The resolved database.
 * @returns The rows.
 */
export async function queryAllRows(db: TResolvedDatabase): Promise<Array<TRow>> {
  const pages = await collectAllDataSourceRows(getNotionClient(), { data_source_id: db.schema.dataSourceId, page_size: 100 });

  return pages
    .filter((page): page is PageObjectResponse => page.object === "page" && isFullPage(page))
    .map(page => fromNotion(db.def, page, { schema: db.schema }));
}

async function toFullPage(page: Parameters<typeof isFullPage>[0]): Promise<PageObjectResponse> {
  if (isFullPage(page)) {
    return page;
  }

  const full = await getNotionClient().pages.retrieve({ page_id: page.id });

  if (!isFullPage(full)) {
    throw new Error("Unable to read the page");
  }

  return full;
}

/**
 * @description
 * Fetches a single row, making sure it belongs to the database.
 *
 * @param db - The resolved database.
 * @param pageId - The page id.
 * @returns The row.
 * @throws {NotFoundError} If the page does not exist, is trashed or belongs to another database.
 */
export async function getRow(db: TResolvedDatabase, pageId: string): Promise<TRow> {
  const page = await toFullPage(await getNotionClient().pages.retrieve({ page_id: pageId }));
  const parentId = page.parent.type === "data_source_id" ? page.parent.data_source_id : null;

  if (page.in_trash || !isSameNotionId(parentId, db.schema.dataSourceId)) {
    throw new NotFoundError("Row not found");
  }

  return fromNotion(db.def, page, { schema: db.schema });
}

/**
 * @description
 * Creates a row in the database.
 *
 * @param db - The resolved database.
 * @param input - The validated input.
 * @returns The created row.
 */
export async function createRow(db: TResolvedDatabase, input: TRowValues): Promise<TRow> {
  const ctx = { schema: db.schema };
  const write = toNotion(db.def, input, ctx);
  const cover = coverRequest(write.cover);

  const page = await getNotionClient().pages.create({
    parent: { type: "data_source_id", data_source_id: db.schema.dataSourceId },
    properties: write.properties,
    ...(cover ? { cover } : {}),
  });

  return fromNotion(db.def, await toFullPage(page), ctx);
}

/**
 * @description
 * Updates a row. Only the fields present in the input are written.
 *
 * @param db - The resolved database.
 * @param pageId - The page id.
 * @param input - The validated (partial) input.
 * @returns The updated row.
 */
export async function updateRow(db: TResolvedDatabase, pageId: string, input: Partial<TRowValues>): Promise<TRow> {
  await getRow(db, pageId);

  const ctx = { schema: db.schema };
  const write = toNotion(db.def, input, ctx);
  const cover = coverRequest(write.cover);

  const page = await getNotionClient().pages.update({
    page_id: pageId,
    properties: write.properties,
    ...(cover !== undefined ? { cover } : {}),
  });

  return fromNotion(db.def, await toFullPage(page), ctx);
}

/**
 * @description
 * Moves a row to the trash (Notion's archive).
 *
 * @param db - The resolved database.
 * @param pageId - The page id.
 * @returns A promise resolved once the row is archived.
 */
export async function archiveRow(db: TResolvedDatabase, pageId: string): Promise<void> {
  await getRow(db, pageId);
  await getNotionClient().pages.update({ page_id: pageId, in_trash: true });
}

/**
 * @description
 * Reads the workspace the integration is connected to.
 *
 * @returns The workspace info.
 */
export async function getWorkspace(): Promise<TNotionWorkspace> {
  const me = await getNotionClient().users.me({});

  if (me.type !== "bot") {
    return { connected: false };
  }

  return { connected: true, id: me.bot.workspace_id, name: me.bot.workspace_name ?? undefined };
}
