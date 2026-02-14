import { getSlug } from "~~/core";



export default defineNuxtRouteMiddleware((to) => {
  if (to.name === "d-slug") {
    const { registerPage } = usePages();
    const slug = getSlug(to.params.slug);

    registerPage(to.name, `${slug.toUpperCase()} Detail`, { href: "/:slug", label: slug }, "index");
  }
});
