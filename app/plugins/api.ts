export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders(["cookie"]);

  return {
    provide: {
      apiFetch: $fetch.create({
        baseURL: "/api",
        credentials: "include",
        headers,
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
