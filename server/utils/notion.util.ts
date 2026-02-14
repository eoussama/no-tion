import type { TNullable } from "@eoussama/core";

import { env } from "node:process";
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
export function getNotionClient(): Client {
  if (!NOTION_CLIENT) {
    const notionApiKey = env.NUXT_NOTION_API_KEY;

    if (!notionApiKey) {
      throw new Error("Notion API key is not configured.");
    }

    NOTION_CLIENT = new Client({ auth: notionApiKey });
  }

  return NOTION_CLIENT;
}
