import { defineConfig } from "./server/utils/config.util";



export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  experimental: {
    typedPages: true,
  },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  modules: ["@pinia/nuxt", "@nuxt/ui", "@vueuse/nuxt"],
  css: ["~~/assets/css/main.css"],

  /** Components are referenced by file name (`<NotionTag>`, not `<DatabaseNotionTag>`). */
  components: [{ path: "~/components", pathPrefix: false }],

  /**
   * Icons ship inside the client bundle (no runtime fetch), so the UI stays complete offline; anything missed falls back to the server endpoint.
   * The scan covers the app and the Nuxt UI runtime (its default chevrons, close, check, loading icons).
   */
  icon: {
    clientBundle: {
      scan: {
        globInclude: ["app/**/*.{vue,ts}", "core/**/*.ts", "node_modules/@nuxt/ui/dist/runtime/**/*.{vue,js}", "node_modules/@nuxt/ui/dist/shared/*.mjs"],
        globExclude: [".nuxt/**", ".output/**"],
      },
      sizeLimitKb: 512,
    },
  },

  /**
   * Server-only secrets. Empty defaults, overridden at runtime by
   * NUXT_SECRET, NUXT_PASSWORD, NUXT_NOTION_API_KEY and NUXT_TMDB_API_KEY.
   * Validated at server startup by `server/plugins/env.ts`.
   */
  runtimeConfig: {
    secret: "",
    password: "",
    notionApiKey: "",
    tmdbApiKey: "",
  },

  ...defineConfig(),
});
