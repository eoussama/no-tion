type TErrorPayload = {
  message?: unknown;
  statusCode?: unknown;
  statusMessage?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * @description
 * Extracts the HTTP status code of a failed API call.
 * Handles both the `TResponse` envelope and h3 `createError` payloads (`{ statusCode, statusMessage, message }`),
 * as well as `FetchError` instances thrown by `$fetch`.
 *
 * @param error - The error or response payload to inspect.
 * @returns The status code, if any.
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (!isObject(error)) {
    return undefined;
  }

  const payload = (isObject(error.data) ? error.data : error) as TErrorPayload;
  const status = payload.statusCode ?? error.statusCode ?? error.status;

  return typeof status === "number" ? status : undefined;
}

/**
 * @description
 * Extracts a human readable message from a failed API call.
 * Handles both the `TResponse` envelope and h3 `createError` payloads, as well as `FetchError` instances thrown by `$fetch`.
 *
 * @param error - The error or response payload to inspect.
 * @param fallback - The message to use when none can be extracted.
 * @returns The error message.
 */
export function getErrorMessage(error: unknown, fallback: string = "Something went wrong"): string {
  if (!isObject(error)) {
    return typeof error === "string" && error ? error : fallback;
  }

  const payload = (isObject(error.data) ? error.data : error) as TErrorPayload;
  const message = payload.message ?? payload.statusMessage;

  return typeof message === "string" && message ? message : fallback;
}
