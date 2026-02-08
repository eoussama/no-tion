import { tryCatch } from "~~/core";



export const useAuth = () => {
  const { $apiFetch } = useNuxtApp();
  const base = "/auth";

  return {
    login: async (password: string) => tryCatch(() => $apiFetch<boolean>(`${base}/login`, { method: "POST", body: { password } })),
    logout: async () => tryCatch(() => $apiFetch<boolean>(`${base}/logout`, { method: "POST" })),
  }
}
