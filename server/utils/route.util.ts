import type { TResponse } from "~~/core";
import type { EventHandler, EventHandlerRequest } from "h3";

import { tryCatch } from "@eoussama/core";



async function authGuard(event: any) {
  const cookie = getRequestHeader(event, "cookie") ?? "";
  const [err, res] = await tryCatch(async () => $fetch<TResponse<boolean>>("auth/status", { baseURL: "/api", headers: { cookie } }));

  if (err || res.error || !res.data) {
    throw createError({ status: 401, message: "Unauthorized", statusText: "Unauthorized" });
  }
}

export function definedProtectedRoute<T extends EventHandlerRequest = EventHandlerRequest, D = any>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler({ onRequest: [authGuard], handler });
}
