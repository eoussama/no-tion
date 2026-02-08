import { tryCatch } from "~~/core";
import { verifyToken } from "~~/server/utils";



/**
 * @description
 * Verify the signed HTTP cookie.
 */
export default defineEventHandler(async (event) => {
  const token = getCookie(event, "session");

  if (!token) {
    return createResponse(event, false, { message: "Auth Status" });
  }

  const [err, isValid] = await tryCatch(async () => verifyToken(token));

  if (err) {
    throw createError({ status: 501, message: "Failed to verify token", statusText: "Internal Server Error" });
  }

  if (!isValid) {
    deleteCookie(event, "session");
  }

  return createResponse(event, isValid, { message: "Auth Status" });
});
