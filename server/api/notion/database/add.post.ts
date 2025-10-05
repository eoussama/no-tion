import { Client } from "@notionhq/client";



export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const notion = new Client({ auth: config.notionApiKey });

  try {
    const body = await readBody(event);
    const { databaseId, title, type, url, posterUrl, genre } = body;

    if (!databaseId || !title || !type || !url || !genre) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields",
      });
    }

    // Create a new page in the database
    const pageData = {
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Type: {
          select: {
            name: type,
          },
        },
        Genre: {
          select: {
            name: genre,
          },
        },
        Info: {
          url,
        },
        Status: {
          status: {
            name: "To Watch",
          },
        },
      },
      ...(posterUrl && {
        cover: {
          type: "external" as const,
          external: {
            url: posterUrl,
          },
        },
      }),
    };

    await notion.pages.create(pageData);

    return { success: true };
  }
  catch (error) {
    console.error("Error adding entry to Notion:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add entry to database",
    });
  }
});
