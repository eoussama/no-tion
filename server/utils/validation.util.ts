import type { z } from "zod";

import { prettifyError } from "zod";



/**
 * @description
 * Parses a value with a zod schema, throwing a 400 with a readable message on failure.
 *
 * @param schema - The zod schema.
 * @param value - The value to parse.
 * @returns The parsed value.
 */
export function parseOrThrow<T extends z.ZodType>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw createError({ status: 400, message: prettifyError(result.error), statusText: "Bad Request", data: { issues: result.error.issues } });
  }

  return result.data;
}
