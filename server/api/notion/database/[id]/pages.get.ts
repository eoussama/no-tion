import type { TDatabasePage, TDatabasePagesResponse, TNullable, TUnsafe } from "~/core";
import { z } from "zod";
import { databasePagesResponseSchema } from "~/core";
import { getRuntimeConfig } from "~/server/utils/runtime-config";



export default defineEventHandler(async (event): Promise<TDatabasePagesResponse> => {
  const { notionApiKey } = getRuntimeConfig(event);
  const databaseId = z.string().min(1, "Database ID is required.").parse(getRouterParam(event, "id"));

  try {
    const allPages: Array<TDatabasePage> = [];
    let cursor: TUnsafe<string>;
    let hasMore = true;

    // Fetch all pages with pagination
    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionApiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_cursor: cursor,
          page_size: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.statusText}`);
      }

      const data = await response.json() as {
        results: Array<{
          id: string;
          properties?: {
            Info?: {
              type: string;
              url?: string;
            };
          };
        }>;
        has_more: boolean;
        next_cursor: TNullable<string>;
      };

      // Extract Info URLs from this batch
      const batchPages = (data.results || []).map((page) => {
        const infoProperty = page.properties?.Info;
        let infoUrl = null;

        if (infoProperty?.type === "url" && infoProperty?.url) {
          infoUrl = infoProperty.url;
        }

        return {
          id: page.id,
          infoUrl,
        } satisfies TDatabasePage;
      });

      allPages.push(...batchPages);

      hasMore = data.has_more;
      cursor = data.next_cursor ?? undefined;
    }

    return databasePagesResponseSchema.parse({
      pages: allPages,
    });
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch database pages";

    throw createError({
      statusCode: 500,
      statusMessage: errorMessage,
      cause: err instanceof Error ? err : undefined,
    });
  }
});
