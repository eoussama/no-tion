import { type TResponse, tryCatch } from "~~/core";



export const useApi = <T, U extends Record<string, unknown>>(endpoint: string, body?: U) => {
  const { $apiFetch } = useNuxtApp();
  return tryCatch(() => useFetch<TResponse<T>>(endpoint, { body, $fetch: $apiFetch, }));
}
