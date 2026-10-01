import type { EventHandler, EventHandlerRequest, H3Event } from "h3";

import { tryCatch } from "@eoussama/core";
import { SESSION_COOKIE } from "./session.const";
import { verifyToken } from "./token.util";



async function authGuard(event: H3Event) {
  const [err, isValid] = await tryCatch(() => verifyToken(getCookie(event, SESSION_COOKIE)));

  if (err || !isValid) {
    throw createError({ status: 401, message: "Unauthorized", statusText: "Unauthorized" });
  }
}

/**
 * @description
 * Defines a protected route that requires authentication.
 * The `authGuard` function verifies the session cookie before allowing access to the route handler.
 *
 * @param handler The route handler function to be protected.
 * @returns A new route handler that includes the authentication guard.
 */
export function defineProtectedRoute<T extends EventHandlerRequest = EventHandlerRequest, D = unknown>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler({ onRequest: [authGuard], handler });
}
