import { useAuthStore } from "~/stores";



export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  if (!auth.isInitialized) {
    await auth.check();
  }

  const isLoginPage = to.path === "/login";

  if (auth.isLoggedIn) {
    if (isLoginPage) {
      return navigateTo("/");
    }

    return;
  }

  if (!isLoginPage) {
    return navigateTo("/login");
  }
});
