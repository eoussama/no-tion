import { tryCatch, type TResponse } from "~~/core";



export const useAuth = () => {
  const base = "/auth";
  const { $apiFetch } = useNuxtApp();

  return {
    status: async () => tryCatch(() => $apiFetch<TResponse<boolean>>(`${base}/status`, { method: "GET" })),
    logout: async () => tryCatch(() => $apiFetch<TResponse<boolean>>(`${base}/logout`, { method: "POST" })),
    login: async (password: string) => tryCatch(() => $apiFetch<TResponse<boolean>>(`${base}/login`, { method: "POST", body: { password } })),
  }
}
