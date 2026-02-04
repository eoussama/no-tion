import { SRuntimeConfig } from "../../core/common/schemas/env.schemas";



/**
 * @description
 * Validates and returns the runtime configuration values.
 *
 * @param {Parameters<typeof useRuntimeConfig>[0]} event The incoming HTTP event.
 * @returns The validated runtime configuration.
 */
export function getRuntimeConfig(event: Parameters<typeof useRuntimeConfig>[0]) {
  const config = useRuntimeConfig(event);
  const result = SRuntimeConfig.safeParse({
    notionApiKey: config.notionApiKey,
    password: config.password,
  });

  if (!result.success) {
    throw createError({
      statusCode: 500,
      cause: result.error,
      statusMessage: "Invalid runtime configuration",
    });
  }

  return result.data;
}

/**
 * @description
 * Crashes the app if the runtime configuration is invalid.
 */
export function ensureRuntimeConfig() {
  return SRuntimeConfig.parse({
    password: process.env.NUXT_PASSWORD,
    notionApiKey: process.env.NUXT_NOTION_API_KEY,
  });
}
