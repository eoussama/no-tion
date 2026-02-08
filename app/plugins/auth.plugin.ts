export default defineNuxtPlugin(async () => {
  if (import.meta.server) return;

  const auth = useAuthStore();

  auth.check().finally(() =>
    watch(() => auth.isLoggedIn, (isLoggedIn) => {
      if (isLoggedIn) {
        navigateTo("/");
      } else {
        navigateTo("/login");
      }
    }, { immediate: true })
  );
});
