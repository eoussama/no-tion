import { tryCatch } from "~~/core";
import { SESSION_COOKIE, verifyToken } from "~~/server/utils";



/**
 * @description
 * Verify the signed HTTP cookie.
 */
export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE);

  if (!token) {
    return createResponse(event, false, { message: "Auth status" });
  }

  const [err, isValid] = await tryCatch(() => verifyToken(token));

  if (err) {
    throw createError({ status: 500, message: "Failed to verify token", statusText: "Internal Server Error" });
  }

  if (!isValid) {
    deleteCookie(event, SESSION_COOKIE, { path: "/" });
  }

  return createResponse(event, isValid, { message: "Auth status" });
});
