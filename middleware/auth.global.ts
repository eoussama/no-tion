import type { TAuthStatusResponse } from "~/core";
import { SAuthStatusResponse } from "~/core";



export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for login page
  if (to.path === "/login") {
    return;
  }

  // Check authentication status
  const { data } = await useFetch<TAuthStatusResponse>("/api/auth/status", {
    transform: payload => SAuthStatusResponse.parse(payload),
  });

  if (!data.value?.authenticated) {
    return navigateTo("/login");
  }
});
