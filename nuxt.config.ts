// https://nuxt.com/docs/api/configuration/nuxt-config
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
      title: "no-tion | Notion Database Manager",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "A personal Notion account manager with forms to automate data insertion into Notion databases" },
        { name: "author", content: "Oussama Essamadi" },
        { name: "keywords", content: "Notion, API, database, automation, forms, manager" },
        { property: "og:title", content: "no-tion" },
        { property: "og:description", content: "A personal Notion account manager with forms to automate data insertion into Notion databases" },
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
