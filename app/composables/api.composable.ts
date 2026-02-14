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
