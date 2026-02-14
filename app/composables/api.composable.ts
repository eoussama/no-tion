import type { TResponse } from "~~/core";

import { tryCatch } from "~~/core";



/**
 * @description
 * A composable for making API requests with error handling using `tryCatch`.
 *
 * @param endpoint - The API endpoint to call (e.g., "auth/login").
 * @param body - Optional request body to send with the API call.
 * @returns A tuple of [error, data] where error is any error that occurred and data is the response data.
 */
export function useApi<T, U extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body?: U) {
  const { $apiFetch } = useNuxtApp();

  return tryCatch(() => useFetch<TResponse<T>>(endpoint, { body, $fetch: $apiFetch }));
}

/**
 * @description
 * A composable for making API requests without error handling.
 * It returns the standard `useFetch` response which includes `data`, `error`, and `pending` properties.
 *
 * @param endpoint - The API endpoint to call (e.g., "auth/login").
 * @param body - Optional request body to send with the API call.
 * @returns The response from `useFetch` which includes `data`, `error`, and `pending`.
 */
export function useApiLazy<T, U extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body?: U) {
  const { $apiFetch } = useNuxtApp();

  return useFetch<TResponse<T>>(endpoint, { body, $fetch: $apiFetch });
}
