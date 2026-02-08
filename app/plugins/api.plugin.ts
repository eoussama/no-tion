export default defineNuxtPlugin(() => {
  return {
    provide: {
      apiFetch: $fetch.create({
        baseURL: "/api",
        credentials: "include",
      }),
    },
  };
});

declare module "#app" {
  interface NuxtApp {
    $apiFetch: typeof $fetch
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $apiFetch: typeof $fetch
  }
}
