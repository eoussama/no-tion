import type { DatabaseObjectResponse } from "@notionhq/client";
import type { TNotionDatabase } from "~~/core";

import { tryCatch } from "~~/core";
import { definedProtectedRoute, getNotionClient } from "~~/server/utils";



export default definedProtectedRoute(async (event) => {
  const id = event.context.params?.id as string;

  if (!id) {
    throw createError({ status: 400, message: "Database ID is required", statusText: "Bad Request" });
  }

  const [err, notionClient] = await tryCatch(getNotionClient);

  if (err) {
    throw createError({ status: 501, message: "Unable to initialize Notion client", statusText: "Internal Server Error" });
  }

  const [errNotion, db] = await tryCatch(() => notionClient.databases.retrieve({ database_id: id }) as Promise<DatabaseObjectResponse>);

  if (errNotion || db.object !== "database") {
    throw createError({ status: 404, message: "Database not found", statusText: "Not Found" });
  }

  const database = {
    id: db.id,
    url: db.url,
    lastEditedTime: db.last_edited_time,
    title: db.title[0]?.plain_text ?? "",
  } as TNotionDatabase;

  return createResponse(event, database, { message: "Database info" });
});
