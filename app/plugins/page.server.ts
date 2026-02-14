export default defineNuxtPlugin(async () => {
  const { registerPage } = usePages();

  registerPage("index", "Home", { href: "/" });
  registerPage("login", undefined, { href: "/login" });
});
