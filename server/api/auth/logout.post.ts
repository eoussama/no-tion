import { SESSION_COOKIE } from "~~/server/utils";



/**
 * @description
 * Clears the session cookie. Idempotent: logging out without a session also succeeds.
 */
export default defineEventHandler(async (event) => {
  deleteCookie(event, SESSION_COOKIE, { path: "/" });

  return createResponse(event, true, { message: "Logout successful" });
});
