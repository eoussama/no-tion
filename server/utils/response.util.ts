import type { H3Event } from "h3";
import type { TResponse } from "~~/core";



/**
 * @description
 * Creates a standardized API response object for the given data and options.
 *
 * @param event - The H3 event object representing the incoming request.
 * @param data - The data to include in the response.
 * @param options - Optional additional properties to include in the response, such as status code and message.
 * @returns A standardized response object containing the data and any additional properties specified in options.
 */
export function createResponse<T>(event: H3Event<globalThis.EventHandlerRequest>, data: T, options?: Partial<Omit<TResponse<T>, "data" | "error" | "stack">>): TResponse<T> {
  return {
    data,
    stack: null,
    error: false,
    url: options?.url ?? event.path,
    message: options?.message ?? "Success",
    statusCode: options?.statusCode ?? 200,
    statusMessage: options?.statusMessage ?? "OK",
  };
}
