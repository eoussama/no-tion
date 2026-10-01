import type { TRowValues } from "~~/core";

import { validateOptions } from "~~/core";
import { defineDbRoute, getPageIdParam, invalidateDatabase, parseOrThrow, updateRow } from "~~/server/utils";



/**
 * @description
 * Updates a row. Only the fields present in the body are written (validated with `inputSchema.partial()`).
 */
export default defineDbRoute(async ({ event, db }) => {
  const pageId = getPageIdParam(event);
  const body = await readBody<TRowValues>(event);
  const input = parseOrThrow(db.def.inputSchema.partial(), body) as Partial<TRowValues>;
  const optionErrors = Object.values(validateOptions(db.def, input, db.schema));

  if (optionErrors.length > 0) {
    throw createError({ status: 400, message: optionErrors.join("; "), statusText: "Bad Request" });
  }

  const row = await updateRow(db, pageId, input);

  invalidateDatabase(db.meta.slug);

  return createResponse(event, row, { message: "Row updated" });
});
