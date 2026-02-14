import { defineConfig } from "./server";



export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  experimental: {
    typedPages: true,
    payloadExtraction: true
  },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  modules: ["@pinia/nuxt"],
  css: ["~~/assets/css/main.css"],

  ...defineConfig(),
});
