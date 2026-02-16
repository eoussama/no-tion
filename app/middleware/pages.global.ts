import { getId } from "~~/core";



export default defineNuxtRouteMiddleware((to) => {
  if (to.name === "d-id") {
    const { registerPage } = usePages();
    const id = getId(to.params.id);

    registerPage(to.name, `${id.toUpperCase()} Detail`, { href: "/:id", label: id }, "index", true);
  }
});
