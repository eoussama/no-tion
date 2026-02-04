export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, "auth-token");

  return {
    authenticated: authToken === "authenticated",
  };
});
