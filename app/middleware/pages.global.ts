import { registerPageByName } from "~~/core";



export default defineNuxtRouteMiddleware((to) => {
  // Static pages
  registerPageByName("index", "Home", { href: "/" });
  registerPageByName("login", "Login", { href: "/login" });

  // Dynamic slug page
  if (to.name === "d-slug") {
    const slug = (Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug) ?? "";
    registerPageByName(to.name, `${slug.toUpperCase()} Detail`, { href: "/:slug", label: slug }, "index");
  }
});
