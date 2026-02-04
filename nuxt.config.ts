import { defineNuxtConfig } from "nuxt/config";
import pgk from "./package.json" assert { type: "json" };



export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  runtimeConfig: {
    notionApiKey: "",
    password: "",
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

  css: ["~/assets/css/main.css"],
});
