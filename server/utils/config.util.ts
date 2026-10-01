import type { NuxtConfig } from "nuxt/schema";

import pgk from "../../package.json" assert { type: "json" };



/**
 * @description
 * Defines the shared Nuxt application configuration (HTML head settings).
 * Runtime secrets are declared in `nuxt.config.ts` and validated at server startup by `server/plugins/env.ts`.
 *
 * @returns An object containing the app settings for the Nuxt application.
 */
export function defineConfig(): Pick<NuxtConfig, "app"> {
  return {
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
