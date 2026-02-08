export default defineNuxtPlugin(async () => {
  const route = useRoute();
  const auth = useAuthStore();

  watch(() => auth.isLoggedIn, (isLoggedIn) => {
    if (!isLoggedIn && route.path !== "/login") {
      return navigateTo("/login");
    }
    
    if (isLoggedIn && route.path === "/login") {
      return navigateTo("/");
    }
  });
});
