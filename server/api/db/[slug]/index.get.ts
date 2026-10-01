import type { TDatabaseInfo } from "~~/core";

import { defineDbRoute } from "~~/server/utils";



/**
 * @description
 * A database's summary and live schema.
 */
export default defineDbRoute(({ event, db }) => {
  return createResponse<TDatabaseInfo>(event, { meta: db.meta, schema: db.schema }, { message: "Database" });
});
