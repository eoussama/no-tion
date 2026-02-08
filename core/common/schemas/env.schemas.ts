import { z } from "zod";



export const SRuntimeConfig = z.object({
  password: z.string().min(1, "NUXT_PASSWORD env var is missing"),
  notionApiKey: z.string().min(1, "NUXT_NOTION_API_KEY env var is missing"),
  secret: z.string().min(32, "NUXT_SECRET env var must be 64 bytes long"),
});

export type TRuntimeConfig = z.infer<typeof SRuntimeConfig>;
