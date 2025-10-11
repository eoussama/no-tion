import { z } from "zod";



export const runtimeConfigSchema = z.object({
  notionApiKey: z.string().min(1, "NUXT_NOTION_API_KEY is required"),
  password: z.string().min(1, "NUXT_PASSWORD is required"),
});

export type TRuntimeConfig = z.infer<typeof runtimeConfigSchema>;
