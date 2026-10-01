import type { TResponse } from "~~/core";



type TApiOptions = {
  method?: "get" | "post" | "patch" | "delete";
  body?: Record<string, unknown>;
  query?: Record<string, string | number>;
  signal?: AbortSignal;
};

/**
 * @description
 * Returns a typed API caller bound to the current Nuxt app (call it from a setup context; the caller can then be used anywhere).
 * Unwraps the `TResponse` envelope; errors are thrown by `$apiFetch` (which also shows the toasts).
 *
 * @returns The API caller.
 */
export function useApiCaller() {
  const { $apiFetch } = useNuxtApp();

  return async function call<T>(path: string, options?: TApiOptions): Promise<T> {
    const response = await $apiFetch<TResponse<T>>(path, options);

    return response.data as T;
  };
}
