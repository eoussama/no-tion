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

  const [dbErr, database] = await tryCatch(() => getNotionDatabase(notionClient, id));

  if (dbErr) {
    throw createError({ status: 404, message: dbErr.message, statusText: "Not Found" });
  }

  return createResponse(event, database, { message: "Database info" });
});
