import { DATABASE_IDS, tryCatch } from "~~/core";
import { definedProtectedRoute, getNotionClient } from "~~/server/utils";



export default definedProtectedRoute(async (event) => {
  const [err, notionClient] = await tryCatch(getNotionClient);

  if (err) {
    throw createError({ status: 501, message: "Unable to initialize Notion client", statusText: "Internal Server Error" });
  }

  const databases = [];

  for (const dbId of Object.values(DATABASE_IDS)) {
    const [dbErr, database] = await tryCatch(() => getNotionDatabase(notionClient, dbId));

    if (dbErr) {
      throw createError({ status: 404, message: dbErr.message, statusText: "Not Found" });
    }

    databases.push(database);
  }

  return createResponse(event, databases, { message: "Notion databases" });
});
