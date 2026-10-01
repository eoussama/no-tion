import { defineDbRoute, getPageIdParam, getRow } from "~~/server/utils";



/**
 * @description
 * A single row.
 */
export default defineDbRoute(async ({ event, db }) => {
  return createResponse(event, await getRow(db, getPageIdParam(event)), { message: "Row" });
});
