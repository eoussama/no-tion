import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import type { TResponse } from "~~/core";

import { tryCatch } from "@eoussama/core";



async function authGuard(event: H3Event) {
  const cookie = getRequestHeader(event, "cookie") ?? "";
  const [err, res] = await tryCatch(async () => $fetch<TResponse<boolean>>("auth/status", { baseURL: "/api", headers: { cookie } }));

  if (err || res.error || !res.data) {
    throw createError({ status: 401, message: "Unauthorized", statusText: "Unauthorized" });
  }
}

/**
 * @description
 * Defines a protected route that requires authentication.
 * The `authGuard` function is used to check if the user is authenticated before allowing access to the route handler.
 *
 * @param handler The route handler function to be protected.
 * @returns A new route handler that includes the authentication guard.
 */
export function definedProtectedRoute<T extends EventHandlerRequest = EventHandlerRequest, D = unknown>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler({ onRequest: [authGuard], handler });
}
