import type { EventHandlerRequest, H3Event } from "h3";
import type { TResolvedDatabase } from "./notion.util";

import { APIErrorCode, isNotionClientError } from "@notionhq/client";
import { SDatabaseSlug, SNotionId } from "~~/core";
import { NotFoundError, resolveDatabase } from "./notion.util";
import { defineProtectedRoute } from "./route.util";



type TDbRouteContext = {
  event: H3Event<EventHandlerRequest>;
  db: TResolvedDatabase;
};

/**
 * @description
 * Maps any error thrown while talking to Notion to an h3 error with a meaningful status.
 *
 * @param error - The error.
 * @returns The h3 error to throw.
 */
export function toHttpError(error: unknown) {
  if (error && typeof error === "object" && "statusCode" in error && "statusMessage" in error) {
    return error as ReturnType<typeof createError>;
  }

  if (error instanceof NotFoundError) {
    return createError({ status: 404, message: error.message, statusText: "Not Found" });
  }

  if (isNotionClientError(error)) {
    switch (error.code) {
      case APIErrorCode.ObjectNotFound:
        return createError({ status: 404, message: "Not found in Notion (is it shared with the integration?)", statusText: "Not Found" });

      case APIErrorCode.ValidationError:
        return createError({ status: 400, message: error.message, statusText: "Bad Request" });

      case APIErrorCode.InvalidRequest:
        return createError({ status: 400, message: error.message, statusText: "Bad Request" });

      case APIErrorCode.RateLimited:
        return createError({ status: 429, message: "Notion rate limit reached, try again shortly", statusText: "Too Many Requests" });

      default:
        return createError({ status: 502, message: `Notion request failed: ${error.message}`, statusText: "Bad Gateway" });
    }
  }

  return createError({ status: 500, message: error instanceof Error ? error.message : "Unexpected error", statusText: "Internal Server Error" });
}

/**
 * @description
 * Validates a page id route parameter.
 *
 * @param event - The H3 event.
 * @returns The page id.
 */
export function getPageIdParam(event: H3Event): string {
  const result = SNotionId.safeParse(getRouterParam(event, "pageId"));

  if (!result.success) {
    throw createError({ status: 400, message: "Invalid page ID", statusText: "Bad Request" });
  }

  return result.data;
}

/**
 * @description
 * Defines a protected route scoped to a database: validates the `slug` route parameter,
 * resolves the database once (cached) and maps Notion API errors to HTTP errors.
 *
 * @param handler - The route handler, receiving the event and the resolved database.
 * @returns The event handler.
 */
export function defineDbRoute<T>(handler: (ctx: TDbRouteContext) => Promise<T> | T) {
  return defineProtectedRoute(async (event) => {
    const slug = SDatabaseSlug.safeParse(getRouterParam(event, "slug"));

    if (!slug.success) {
      throw createError({ status: 400, message: slug.error.issues[0]?.message ?? "Invalid database slug", statusText: "Bad Request" });
    }

    try {
      const db = await resolveDatabase(slug.data);

      return await handler({ event, db });
    }
    catch (error) {
      throw toHttpError(error);
    }
  });
}
