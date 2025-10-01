import { Client } from "@notionhq/client";



export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const notion = new Client({ auth: config.notionApiKey });

  try {
    const query = getQuery(event);
    const databaseId = query.id as string;

    if (!databaseId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Database ID is required",
      });
    }

    // Retrieve database to get properties
    const database = await notion.databases.retrieve({ database_id: databaseId });

    return {
      properties: database.properties,
    };
  }
  catch (error) {
    console.error("Error fetching database schema:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch database schema",
    });
  }
});
