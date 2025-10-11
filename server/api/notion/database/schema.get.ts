import { Client } from "@notionhq/client";
import { z } from "zod";

import { getRuntimeConfig } from "~/server/utils/runtime-config";



const databaseSchemaQuerySchema = z.object({
  id: z.string().min(1, "Database ID is required"),
});

export default defineEventHandler(async (event) => {
  const { notionApiKey } = getRuntimeConfig(event);
  const notion = new Client({ auth: notionApiKey });

  try {
    const parsedQuery = databaseSchemaQuerySchema.safeParse(getQuery(event));

    if (!parsedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsedQuery.error.issues.at(0)?.message ?? "Database ID is required",
        cause: parsedQuery.error,
      });
    }

    const { id: databaseId } = parsedQuery.data;

    // Retrieve database to get properties
    const database = await notion.databases.retrieve({ database_id: databaseId });

    if (!("properties" in database)) {
      throw createError({
        statusCode: 500,
        statusMessage: "Unexpected response from Notion API",
      });
    }

    return {
      properties: database.properties,
    };
  }
  catch (error) {
    const cause = error instanceof Error ? error : new Error("Failed to fetch database schema");

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch database schema",
      cause,
    });
  }
});
