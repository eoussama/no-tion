import type { H3Event } from "h3";

import type { TResponse } from "~~/core";



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

