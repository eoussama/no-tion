import type { TRowValues } from "~~/core";

import { validateOptions } from "~~/core";
import { createRow, defineDbRoute, invalidateDatabase, parseOrThrow } from "~~/server/utils";



/**
 * @description
 * Creates a row. The body is validated with the definition's `inputSchema`; its `defaults` fill missing values.
 */
export default defineDbRoute(async ({ event, db }) => {
  const body = await readBody<TRowValues>(event);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError({ status: 400, message: "Invalid request body", statusText: "Bad Request" });
  }

  const withDefaults: Record<string, unknown> = { ...body };

  for (const [key, value] of Object.entries(db.def.defaults ?? {})) {
    if (withDefaults[key] === undefined || withDefaults[key] === null || withDefaults[key] === "") {
      withDefaults[key] = value;
    }
  }

  const input = parseOrThrow(db.def.inputSchema, withDefaults) as TRowValues;
  const optionErrors = Object.values(validateOptions(db.def, input, db.schema));

  if (optionErrors.length > 0) {
    throw createError({ status: 400, message: optionErrors.join("; "), statusText: "Bad Request" });
  }

  const row = await createRow(db, input);

  invalidateDatabase(db.meta.slug);
  setResponseStatus(event, 201);

  return createResponse(event, row, { message: "Row created", statusCode: 201, statusMessage: "Created" });
});
