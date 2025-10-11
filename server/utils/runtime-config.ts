import { runtimeConfigSchema } from "~/core";



/**
 * Validates and returns the runtime configuration values.
 *
 * @param event - The incoming HTTP event.
 * @returns The validated runtime configuration.
 */
export function getRuntimeConfig(event: Parameters<typeof useRuntimeConfig>[0]) {
  const config = useRuntimeConfig(event);
  const result = runtimeConfigSchema.safeParse({
    notionApiKey: config.notionApiKey,
    password: config.password,
  });

  if (!result.success) {
    throw createError({
      statusCode: 500,
      statusMessage: "Invalid runtime configuration",
      cause: result.error,
    });
  }

  return result.data;
}
