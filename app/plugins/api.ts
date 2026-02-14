export default defineNuxtPlugin(() => {
  return {
    provide: {
      apiFetch: $fetch.create({
        baseURL: "/api",
        credentials: "include",
        headers: useRequestHeaders(["cookie"]),

        async onResponseError({ response: { _data: data } }) {
          if (data.error) {
            if (data.statusCode === 401) {
              useAuthStore().logout();
              // TODO: show toast the user about the session expiration
            }

            throw new Error(data.message);
            // TODO: show toast of the error message to the user
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
