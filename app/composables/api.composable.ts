import type { UseFetchOptions } from "nuxt/app";
import type { TResponse } from "~~/core";

import { tryCatch } from "~~/core";



function composeCacheKey(endpoint: string, body?: Record<string, unknown>) {
  return `api:${endpoint}${body ? `:${JSON.stringify(body)}` : ""}`;
}

/**
 * @description
 * A composable for making API requests with error handling using `tryCatch`.
 * Automatically caches responses based on endpoint and body.
 *
 * @param endpoint - The API endpoint to call (e.g., "auth/login").
 * @param body - Optional request body to send with the API call.
 * @param options - Additional useFetch options (key, cache control, etc.)
 * @returns A tuple of [error, data] where error is any error that occurred and data is the response data.
 */
export function useApi<T, U extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body?: U, options?: Omit<UseFetchOptions<TResponse<T>>, "body" | "$fetch">) {
  return tryCatch(() => useApiLazy<T, U>(endpoint, body, options));
}

/**
 * @description
 * A composable for making API requests without error handling.
 * It returns the standard `useFetch` response which includes `data`, `error`, and `pending` properties.
 * Automatically caches responses based on endpoint and body.
 *
 * @param endpoint - The API endpoint to call (e.g., "auth/login").
 * @param body - Optional request body to send with the API call.
 * @param options - Additional useFetch options (key, cache control, etc.)
 * @returns The response from `useFetch` which includes `data`, `error`, and `pending`.
 */
export function useApiLazy<T, U extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body?: U, options?: Omit<UseFetchOptions<TResponse<T>>, "body" | "$fetch">) {
  const { $apiFetch } = useNuxtApp();
  const key = options?.key ?? composeCacheKey(endpoint, body);

  return useFetch<TResponse<T>>(endpoint, {
    key,
    body,
    $fetch: $apiFetch,
    getCachedData: key => useNuxtData(key).data.value,
    ...options,
  });
}
