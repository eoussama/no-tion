import type { TRuntimeConfig } from "../../core";

import { env } from "node:process";
import { SRuntimeConfig } from "../../core";

import pgk from "../../package.json" assert { type: "json" };



function getEnvVars(): TRuntimeConfig {
  return SRuntimeConfig.parse({
    secret: env.NUXT_SECRET,
    password: env.NUXT_PASSWORD,
    notionApiKey: env.NUXT_NOTION_API_KEY,
  });
}

/**
 * @description
 * Defines the Nuxt application configuration, including runtime configuration and HTML head settings.
 *
 * @returns An object containing the runtime configuration and app settings for the Nuxt application.
 */
export function defineConfig() {
  const config = getEnvVars();

  return {
    runtimeConfig: {
      secret: config.secret,
      password: config.password,
      notionApiKey: config.notionApiKey,
    },
    app: {
      head: {
        htmlAttrs: {
          lang: "en",
        },
        title: `${pgk.name ?? "no-tion"} | Notion Database Manager`,
        meta: [
          { charset: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { name: "description", content: pgk.description ?? "" },
          { name: "author", content: pgk.author?.name ?? "" },
          { name: "keywords", content: (pgk.keywords ?? []).join(", ") },
          { property: "og:title", content: pgk.name ?? "no-tion" },
          { property: "og:description", content: pgk.description ?? "" },
          { property: "og:image", content: "/logo.png" },
          { property: "og:type", content: "website" },
        ],
        link: [
          { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
          { rel: "shortcut icon", type: "image/x-icon", href: "/favicon.ico" },
        ],
      },
    },
  };
}
