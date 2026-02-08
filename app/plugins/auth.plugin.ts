export default defineNuxtPlugin((a) => {
  useAuthStore().$onAction(({ store, after, }) => {
    after(() => {
      if (store.isLoggedIn) {
        navigateTo("/");
      } else {
        navigateTo("/login");
      }
    });
  });
});
