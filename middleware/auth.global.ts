export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for login page
  if (to.path === "/login") {
    return;
  }

  // Check authentication status
  const { data } = await useFetch("/api/auth/status");

  if (!data.value?.authenticated) {
    return navigateTo("/login");
  }
});
