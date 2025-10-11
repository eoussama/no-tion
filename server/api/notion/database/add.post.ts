import { Client } from "@notionhq/client";

import { databaseAddRequestSchema } from "~/core";
import { getRuntimeConfig } from "~/server/utils/runtime-config";



export default defineEventHandler(async (event) => {
  const { notionApiKey } = getRuntimeConfig(event);
  const notion = new Client({ auth: notionApiKey });

  try {
    const body = await readBody(event);
    const payload = databaseAddRequestSchema.parse(body);

    // Create a new page in the database
    const pageData = {
      parent: { database_id: payload.databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: payload.title,
              },
            },
          ],
        },
        Type: {
          select: {
            name: payload.type,
          },
        },
        Genre: {
          select: {
            name: payload.genre,
          },
        },
        Info: {
          url: payload.url,
        },
        Status: {
          status: {
            name: "To Watch",
          },
        },
      },
      ...(payload.posterUrl && {
        cover: {
          type: "external" as const,
          external: {
            url: payload.posterUrl,
          },
        },
      }),
    };

    await notion.pages.create(pageData);

    return { success: true };
  }
  catch (error) {
    const cause = error instanceof Error ? error : new Error("Failed to add entry to database");

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add entry to database",
      cause,
    });
  }
});
