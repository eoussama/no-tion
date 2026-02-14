import { getSlug } from "~~/core";



export default defineNuxtRouteMiddleware((to) => {
  const { registerPage } = usePages();

  registerPage("index", "Home", { href: "/" });
  registerPage("login", undefined, { href: "/login" });

  if (to.name === "d-slug") {
    const slug = getSlug(to.params.slug);

    registerPage(to.name, `${slug.toUpperCase()} Detail`, { href: "/:slug", label: slug }, "index");
  }
});
