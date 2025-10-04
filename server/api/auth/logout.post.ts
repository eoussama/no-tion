export default defineEventHandler(async (event) => {
  // Clear the auth cookie
  deleteCookie(event, "auth-token");

  return { success: true };
});
