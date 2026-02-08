export default defineNuxtPlugin(() => {
  return {
    provide: {
      apiFetch: $fetch.create({
        baseURL: "/api",
        credentials: "include",
        headers: useRequestHeaders(["cookie"]),

        async onResponseError({ response: { _data: data } }) {
          if (data.error) {
            alert(data.message);
          }
        },
      }),
    },
  };
});

declare module "#app" {
  interface NuxtApp {
    $apiFetch: typeof $fetch;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $apiFetch: typeof $fetch;
  }
}
