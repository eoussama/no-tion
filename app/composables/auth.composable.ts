import type { TResponse } from "~~/core";



/**
 * @description
 * A composable for handling authentication-related API calls (login, logout, status).
 *
 * @returns An object containing methods for checking authentication status, logging in, and logging out.
 */
export function useAuthApi() {
  const base = "/auth";
  const auth = useAuthStore();
  const { $apiFetch } = useNuxtApp();

  return {
    status: async () => $apiFetch<TResponse<boolean>>(`${base}/status`, { method: "GET" }),

    logout: async () => $apiFetch<TResponse<boolean>>(`${base}/logout`, { method: "POST", onRequest: () => {
      auth.logout();
    } }),

    login: async (password: string) => $apiFetch<TResponse<boolean>>(`${base}/login`, { method: "POST", body: { password }, onResponse: (ctx) => {
      if (ctx.response._data.data) {
        auth.login();
      }
    } }),
  };
}
