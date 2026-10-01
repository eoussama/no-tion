import type { TRowsResponse } from "~~/core";

import { defineDbRoute, queryAllRows } from "~~/server/utils";



/**
 * @description
 * Every row of a database, transformed on the server (the raw Notion payload never reaches the client).
 */
export default defineDbRoute(async ({ event, db }) => {
  const rows = await queryAllRows(db);

  return createResponse<TRowsResponse>(event, { rows, fetchedAt: new Date().toISOString() }, { message: "Rows" });
});
