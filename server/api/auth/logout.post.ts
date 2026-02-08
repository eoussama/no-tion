export default defineEventHandler(async event => {
  const cookie = getCookie(event, "session");
  if (!cookie) {
    throw createError({ status: 403, message: "User already not logged-in", statusText: "Forbidden" });
  }
  
  deleteCookie(event, "session");

  return createResponse(event, true, { message: "Logout successful" });
});
