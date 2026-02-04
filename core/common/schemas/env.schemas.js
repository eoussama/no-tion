"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRuntimeConfig = void 0;
var zod_1 = require("zod");
exports.SRuntimeConfig = zod_1.z.object({
    password: zod_1.z.string().min(1, "NUXT_PASSWORD env var is missing"),
    notionApiKey: zod_1.z.string().min(1, "NUXT_NOTION_API_KEY env var is missing"),
});
