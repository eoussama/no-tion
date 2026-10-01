import { z } from "zod";
import { SRuntimeConfig } from "~~/core";



/**
 * @description
 * Validates the server runtime configuration (NUXT_* env vars) once, at server startup.
 * Fails fast with a readable message instead of failing on the first request.
 */
export default defineNitroPlugin(() => {
  const result = SRuntimeConfig.safeParse(useRuntimeConfig());

  if (!result.success) {
    throw new Error(`Invalid runtime configuration, check your environment variables:\n${z.prettifyError(result.error)}`);
  }
});
