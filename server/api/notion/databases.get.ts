import type { DatabaseObjectResponse } from "@notionhq/client";
import { DATABASE_IDS, tryCatch, type TNotionDatabase } from "~~/core";
import { definedProtectedRoute, getNotionClient } from "~~/server/utils";



export default definedProtectedRoute(async (event) => {
  const [err, notionClient] = await tryCatch(getNotionClient);

  if (err) {
    throw createError({ status: 501, message: "Unable to initialize Notion client", statusText: "Internal Server Error" });
  }

  const databases = [];

  for (const dbId of Object.values(DATABASE_IDS)) {
    const db = await notionClient.databases.retrieve({ database_id: dbId }) as DatabaseObjectResponse;

    if (db.object === "database") {
      databases.push({
        id: db.id,
        url: db.url,
        lastEditedTime: db.last_edited_time,
        title: db.title[0]?.plain_text ?? "",
      } as TNotionDatabase);
    }
  }

  return createResponse(event, databases, { message: "Notion databases" });
});
