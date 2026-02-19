import type { TNullable, TUnsafe } from "@eoussama/core";
import type { DatabaseObjectResponse } from "@notionhq/client";
import type { TNotionDatabase } from "~~/core/common/types";

import { env } from "node:process";
import { tryCatch } from "@eoussama/core";
import { Client } from "@notionhq/client";



let NOTION_CLIENT: TNullable<Client> = null;

function getNotionDataSourceId<T>(database: TNotionDatabase<T>, databaseResult: DatabaseObjectResponse): string {
  const dataSource = databaseResult.data_sources?.find(ds => ds.name === database.title);

  if (!dataSource) {
    throw new Error("Data source not found for the database");
  }

  return dataSource.id;
}

async function getNotionDatabaseRows<T>(client: Client, database: TNotionDatabase<T>, databaseResult: DatabaseObjectResponse): Promise<Array<T>> {
  const rows: Array<T> = [];

  let hasMore = true;
  let cursor: Exclude<TUnsafe<string>, null>;

  while (hasMore) {
    const dataSourceId = getNotionDataSourceId(database, databaseResult);
    const [errQuery, res] = await tryCatch(() => client.dataSources.query({ data_source_id: dataSourceId, start_cursor: cursor }));

    if (errQuery) {
      throw new Error("Failed to retrieve database content");
    }

    rows.push(...(res.results as Array<T>));

    hasMore = res.has_more;
    cursor = res.next_cursor ?? undefined;
  }

  return rows;
}

/**
 * @description
 * Returns a singleton instance of the Notion client.
 * The client is initialized with the API key from the environment variable `NUXT_NOTION_API_KEY`.
 * If the API key is not configured, an error is thrown.
 *
 * @returns {Client} An instance of the Notion client.
 * @throws {Error} If the Notion API key is not configured in the environment variables.
 */
export function getNotionClient(): Promise<Client> {
  if (!NOTION_CLIENT) {
    const notionApiKey = env.NUXT_NOTION_API_KEY;

    if (!notionApiKey) {
      return Promise.reject(new Error("Notion API key is not configured."));
    }

    NOTION_CLIENT = new Client({ auth: notionApiKey });
  }

  return Promise.resolve(NOTION_CLIENT);
}

/**
 * @description
 * Retrieves a Notion database by its ID using the provided Notion client.
 *
 * @param client The Notion client instance to use for the request.
 * @param id The ID of the Notion database to retrieve.
 * @param fetchRows A boolean flag indicating whether to fetch the database rows (content). Defaults to true.
 * @returns A promise that resolves to the Notion database information, including id, url, last edited time, and title.
 * @throws {Error} If the database is not found or if there is an error during retrieval.
 */
export async function getNotionDatabase<T>(client: Client, id: string, fetchRows: boolean = true) {
  const [errNotion, dbRes] = await tryCatch(() => client.databases.retrieve({ database_id: id }) as Promise<DatabaseObjectResponse>);

  if (errNotion || dbRes.object !== "database") {
    throw new Error("Database not found");
  }

  const database = {
    rows: [],
    id: dbRes.id,
    url: dbRes.url,
    lastEditedTime: dbRes.last_edited_time,
    title: dbRes.title[0]?.plain_text ?? "",
  } as TNotionDatabase<T>;

  if (fetchRows) {
    database.rows = await getNotionDatabaseRows(client, database, dbRes);
  }

  return database;
}
