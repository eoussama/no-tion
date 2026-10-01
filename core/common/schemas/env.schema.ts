import { z } from "zod";



export const SRuntimeConfig = z.object({
  password: z.string().min(1, "NUXT_PASSWORD env var is missing"),
  notionApiKey: z.string().min(1, "NUXT_NOTION_API_KEY env var is missing"),
  secret: z.string().min(32, "NUXT_SECRET env var must be at least 32 characters long"),
  /** TMDB v3 API key or v4 read access token. The movie/TV lookup is disabled (returns 502) without one. */
  tmdbApiKey: z.string().default(""),
});

export type TRuntimeConfig = z.infer<typeof SRuntimeConfig>;
