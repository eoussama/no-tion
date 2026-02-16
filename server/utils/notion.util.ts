import type { TNullable } from "@eoussama/core";
import type { DatabaseObjectResponse } from "@notionhq/client";
import type { TNotionDatabase } from "~~/core/common/types";

import { env } from "node:process";
import { tryCatch } from "@eoussama/core";
import { Client } from "@notionhq/client";



let NOTION_CLIENT: TNullable<Client> = null;

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
 * @returns A promise that resolves to the Notion database information, including id, url, last edited time, and title.
 * @throws {Error} If the database is not found or if there is an error during retrieval.
 */
export async function getNotionDatabase(client: Client, id: string) {
  const [errNotion, db] = await tryCatch(() => client.databases.retrieve({ database_id: id }) as Promise<DatabaseObjectResponse>);

  if (errNotion || db.object !== "database") {
    throw new Error("Database not found");
  }

  const database = {
    id: db.id,
    url: db.url,
    lastEditedTime: db.last_edited_time,
    title: db.title[0]?.plain_text ?? "",
  } as TNotionDatabase;

  return database;
}
