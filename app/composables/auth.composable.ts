import type { TResponse } from "~~/core";

import { tryCatch } from "~~/core";



/**
 * @description
 * A composable for handling authentication-related API calls (login, logout, status) with error handling using `tryCatch`.
 *
 * @returns An object containing methods for checking authentication status, logging in, and logging out.
 */
export function useAuth() {
  const base = "/auth";
  const { $apiFetch } = useNuxtApp();

  return {
    status: async () => tryCatch(() => $apiFetch<TResponse<boolean>>(`${base}/status`, { method: "GET" })),
    logout: async () => tryCatch(() => $apiFetch<TResponse<boolean>>(`${base}/logout`, { method: "POST" })),
    login: async (password: string) => tryCatch(() => $apiFetch<TResponse<boolean>>(`${base}/login`, { method: "POST", body: { password } })),
  };
}
