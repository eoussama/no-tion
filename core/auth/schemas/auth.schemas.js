"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAuthStatusResponse = exports.SLoginRequest = void 0;
var zod_1 = require("zod");
exports.SLoginRequest = zod_1.z.object({
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.SAuthStatusResponse = zod_1.z.object({
    authenticated: zod_1.z.boolean(),
});
