import { useAuthStore } from "~/stores";



function getRequestUrl(request: Request | string): string {
  return typeof request === "string" ? request : request.url;
}

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  return {
    provide: {
      apiFetch: $fetch.create({
        baseURL: "/api",
        credentials: "include",

        async onResponseError({ request, response }) {
          const url = getRequestUrl(request);

          // Login errors (wrong password, throttling) are shown inline by the login page,
          // lookup errors inline by the search field (a toast per keystroke would be noise).
          if (url.endsWith("/auth/login") || url.includes("/lookup/")) {
            return;
          }

          const status = getErrorStatus(response._data) ?? response.status;

          if (status === 401) {
            const auth = await nuxtApp.runWithContext(() => useAuthStore());

            if (auth.isLoggedIn) {
              toast.add({ title: "Session expired", description: "Please sign in again.", color: "warning", icon: "i-lucide-lock" });
            }

            auth.reset();

            return;
          }

          toast.add({ title: "Request failed", description: getErrorMessage(response._data, response.statusText), color: "error", icon: "i-lucide-circle-alert" });
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
