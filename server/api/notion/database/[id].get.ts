import type { ZodError } from "zod";
import type { TDatabaseId } from "~~/core";

import { SDatabaseId, tryCatch } from "~~/core";
import { definedProtectedRoute, getNotionClient } from "~~/server/utils";



export default definedProtectedRoute(async (event) => {
  const id = event.context.params?.id as TDatabaseId;
  const [zodErr] = await tryCatch(async () => SDatabaseId.parse(id));

  if (zodErr) {
    const err = (zodErr as ZodError).issues?.[0];
    const message = err?.message ?? zodErr.message;
    const errCode = err?.code === "custom" ? 403 : 400;
    const statusText = err?.code === "custom" ? "Forbidden" : "Bad Request";

    throw createError({ status: errCode, message, statusText });
  }

  const [notionErr, notionClient] = await tryCatch(getNotionClient);

  if (notionErr) {
    throw createError({ status: 501, message: "Unable to initialize Notion client", statusText: "Internal Server Error" });
  }

  const [dbErr, database] = await tryCatch(() => getNotionDatabase(notionClient, id));

  if (dbErr) {
    throw createError({ status: 404, message: dbErr.message, statusText: "Not Found" });
  }

  return createResponse(event, database, { message: "Database info" });
});
